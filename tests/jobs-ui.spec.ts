import { test, expect } from "@playwright/test";

test.describe("Jobs search UI", () => {
  test("root path redirects to /jobs", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/jobs$/);
  });

  test("renders the search form", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.getByRole("heading", { name: "Job Search" })).toBeVisible();
    await expect(page.getByLabel("Keyword")).toBeVisible();
    await expect(page.getByLabel("Company")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  });

  test("searching a normal keyword returns matching jobs", async ({ page }) => {
    await page.goto("/jobs");
    await page.getByLabel("Keyword").fill("Engineer");
    await page.getByRole("button", { name: "Search" }).click();

    const table = page.locator("table");
    await expect(table).toBeVisible();
    const rows = table.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // every rendered title should contain "Engineer" (case-insensitive)
    const titles = await table.locator("tbody tr td:first-child").allTextContents();
    for (const title of titles) {
      expect(title.toLowerCase()).toContain("engineer");
    }
  });

  test("company filter narrows results", async ({ page }) => {
    await page.goto("/jobs");
    await page.getByLabel("Keyword").fill("");
    await page.getByLabel("Company").fill("Initech");
    await page.getByRole("button", { name: "Search" }).click();

    const table = page.locator("table");
    await expect(table).toBeVisible();
    const companies = await table.locator("tbody tr td:nth-child(2)").allTextContents();
    expect(companies.length).toBeGreaterThan(0);
    for (const company of companies) {
      expect(company).toBe("Initech");
    }
  });

  test("mode badge reflects the server's APP_MODE", async ({ page, request }) => {
    await page.goto("/jobs");
    await page.getByLabel("Keyword").fill("Engineer");
    await page.getByRole("button", { name: "Search" }).click();

    const apiRes = await request.get("/api/search?keyword=Engineer&company=");
    const apiBody = await apiRes.json();

    const badge = page.getByText(/mode: (vulnerable|secure)/);
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText(`mode: ${apiBody.mode}`);
  });
});
