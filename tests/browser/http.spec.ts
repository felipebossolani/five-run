import { test, expect } from "@playwright/test";

test("Play works on an insecure HTTP origin without randomUUID and restores the draft", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("http://five-run.test/**", async (route) => {
    const url = new URL(route.request().url());
    url.host = "127.0.0.1:5174";
    const response = await route.fetch({ url: url.href });
    await route.fulfill({ response });
  });
  await page.goto("http://five-run.test/");
  expect(await page.evaluate(() => isSecureContext)).toBe(false);
  expect(await page.evaluate(() => typeof crypto.randomUUID)).toBe("undefined");
  await page.locator("[data-action=new]").click();
  if (await page.locator("button[data-action=close-modal]").count())
    await page.locator("button[data-action=close-modal]").first().click();
  await expect(page.locator(".player-card")).toHaveCount(6);
  const offers = await page
    .locator(".player-card")
    .evaluateAll((cards) =>
      cards.map((card) => (card as HTMLElement).dataset.id),
    );
  await page.reload();
  await page.locator("[data-action=continue]").click();
  expect(
    await page
      .locator(".player-card")
      .evaluateAll((cards) =>
        cards.map((card) => (card as HTMLElement).dataset.id),
      ),
  ).toEqual(offers);
  expect(errors).toEqual([]);
});
