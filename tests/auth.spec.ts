import { test, expect } from "@playwright/test";

const CREDS = { username: "demo", password: "jobfinder-demo" };

test.describe("Auth and mode toggle", () => {
  test("anonymous user cannot switch mode", async ({ request }) => {
    const before = await (await request.get("/api/mode")).json();
    expect(before.canToggle).toBe(false);

    const res = await request.post("/api/mode", { data: { mode: "vulnerable" } });
    expect(res.status()).toBe(401);

    // A forged override cookie from an anonymous client must be ignored.
    const forged = await request.get("/api/mode", { headers: { cookie: "mode_override=vulnerable" } });
    expect((await forged.json()).mode).toBe(before.mode);
  });

  test("wrong password is rejected", async ({ request }) => {
    const res = await request.post("/api/login", { data: { ...CREDS, password: "nope" } });
    expect(res.status()).toBe(401);
  });

  test("login page signs in, shows the toggle, and switching modes works", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username").fill(CREDS.username);
    await page.getByLabel("Password").fill(CREDS.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/jobs$/);
    await expect(page.getByText("Signed in as")).toBeVisible();

    const group = page.getByRole("group", { name: "Search mode" });
    await group.getByRole("button", { name: "Vulnerable" }).click();
    await expect(page.getByText("mode: vulnerable")).toBeVisible();

    await page.getByLabel("Keyword").fill("Engineer");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByText("Executed SQL")).toBeVisible();
    await expect(page.locator("table tbody tr").first()).toBeVisible();

    await group.getByRole("button", { name: "Secure" }).click();
    await expect(page.getByText("mode: secure")).toBeVisible();
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByText("Executed SQL")).toHaveCount(0);
  });

  test("sign out clears the session and the override", async ({ page }) => {
    await page.request.post("/api/login", { data: CREDS });
    await page.request.post("/api/mode", { data: { mode: "vulnerable" } });
    await page.goto("/jobs");
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    const after = await (await page.request.get("/api/mode")).json();
    expect(after.canToggle).toBe(false);
  });

  test("exploits page renders", async ({ page }) => {
    await page.goto("/exploits");
    await expect(page.getByRole("heading", { name: "Exploits", level: 1 })).toBeVisible();
    await expect(page.getByText("UNION-based")).toBeVisible();
  });

  test("Run button executes the payload live and reflects the current mode", async ({ page }) => {
    await page.goto("/exploits");
    const unionCard = page.locator("section", { hasText: "UNION-based" });

    // Signed out: default mode, no exploit effect.
    await unionCard.getByRole("button", { name: "Run" }).click();
    await expect(unionCard.getByText(/mode: secure/)).toBeVisible();
    await expect(unionCard.getByText("0 rows returned")).toBeVisible();

    // Signed in and switched to vulnerable: the same button now leaks users via jobs columns.
    await page.request.post("/api/login", { data: CREDS });
    await page.request.post("/api/mode", { data: { mode: "vulnerable" } });
    await page.reload();
    await unionCard.getByRole("button", { name: "Run" }).click();
    await expect(unionCard.getByText(/mode: vulnerable/)).toBeVisible();
    await expect(unionCard.locator("table")).toContainText("@");
  });
});
