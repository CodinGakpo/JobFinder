import { test, expect, APIRequestContext } from "@playwright/test";

const UNION_PAYLOAD =
  "nonexistentxyz' UNION SELECT email, password_hash, 'x', 0 FROM users -- ";
const BOOL_TRUE_PAYLOAD = "zzznomatch' OR '1'='1' -- ";
const BOOL_FALSE_PAYLOAD = "zzznomatch' AND '1'='2' -- ";
const TIME_PAYLOAD =
  "zzz' OR (SELECT CASE WHEN (1=1) THEN pg_sleep(5) ELSE pg_sleep(0) END) IS NOT NULL -- ";

async function search(request: APIRequestContext, keyword: string) {
  const res = await request.get(
    `/api/search?keyword=${encodeURIComponent(keyword)}&company=`
  );
  return res.json();
}

async function detectMode(request: APIRequestContext): Promise<"vulnerable" | "secure"> {
  const body = await search(request, "Engineer");
  return body.mode;
}

test.describe("SQL injection behavior (mode-aware)", () => {
  test("UNION-based injection dumps users only in vulnerable mode", async ({ request }) => {
    const mode = await detectMode(request);
    const body = await search(request, UNION_PAYLOAD);

    if (mode === "vulnerable") {
      const titles = body.results.map((r: any) => r.title);
      expect(titles).toContain("admin@jobportal.test");
      const companies = body.results.map((r: any) => r.company);
      expect(companies.some((c: string) => c.startsWith("$2b$10$"))).toBe(true);
    } else {
      expect(body.results).toEqual([]);
    }
  });

  test("boolean-blind injection only distinguishes true/false in vulnerable mode", async ({
    request,
  }) => {
    const mode = await detectMode(request);
    const trueBody = await search(request, BOOL_TRUE_PAYLOAD);
    const falseBody = await search(request, BOOL_FALSE_PAYLOAD);

    if (mode === "vulnerable") {
      expect(trueBody.results.length).toBeGreaterThan(0);
      expect(falseBody.results.length).toBe(0);
      expect(trueBody.results.length).not.toBe(falseBody.results.length);
    } else {
      expect(trueBody.results.length).toBe(0);
      expect(falseBody.results.length).toBe(0);
    }
  });

  test("time-based injection only delays the response in vulnerable mode", async ({
    request,
  }) => {
    const mode = await detectMode(request);
    const start = Date.now();
    await search(request, TIME_PAYLOAD);
    const elapsedMs = Date.now() - start;

    if (mode === "vulnerable") {
      expect(elapsedMs).toBeGreaterThan(4000);
    } else {
      expect(elapsedMs).toBeLessThan(2000);
    }
  });
});
