import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import { readFile } from "node:fs/promises";
const core = "demo-springville";
test("mobile buyer completes analysis, offer PDF, and simulated reviewer revision request", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Buy a home. Skip the complexity." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Try a demo purchase", exact: true })
    .click();
  await expect(page.locator(".hb-home-card")).toHaveCount(4);
  await page
    .getByRole("link", { name: "372 Aspen Hollow Lane", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "372 Aspen Hollow Lane", exact: true }),
  ).toBeVisible();
  await page.locator(".hb-mobile-ai-button").click();
  const dialog = page.getByRole("dialog", { name: "Property advisor" });
  await dialog.getByLabel("Comfortable monthly housing budget").fill("2800");
  await dialog.getByRole("button", { name: "Save answer" }).click();
  await dialog.getByLabel("Is this your first home?").selectOption("Yes");
  await dialog.getByRole("button", { name: "Save answer" }).click();
  await dialog
    .getByLabel("How important is having a yard?")
    .selectOption("Important");
  await dialog.getByRole("button", { name: "Save answer" }).click();
  await dialog
    .getByLabel("Are you preapproved for a mortgage?")
    .selectOption("In progress");
  await dialog.getByRole("button", { name: "Save answer" }).click();
  await dialog
    .getByRole("button", {
      name: "What should I be concerned about?",
      exact: true,
    })
    .click();
  await expect(
    dialog.locator(".hb-chat-bubble.assistant").last(),
  ).toContainText("moisture");
  await expect(
    dialog.locator(".hb-chat-bubble.assistant").last(),
  ).toContainText("scripted demo");
  await dialog
    .getByRole("button", { name: "Close advisor", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Property workspace" })
    .getByRole("link", { name: "Affordability", exact: true })
    .click();
  await page.getByLabel("Down payment (%)", { exact: true }).fill("10");
  await page
    .getByLabel("Illustrative interest rate (%)", { exact: true })
    .fill("6");
  await expect(page.locator(".hb-payment-total")).toContainText("$");
  await page
    .getByRole("navigation", { name: "Property workspace" })
    .getByRole("link", { name: "Prepare an offer", exact: true })
    .click();
  await page.getByRole("button", { name: "Start draft preparation" }).click();
  const answers = [
    ["What purchase price would you like to propose?", "475000"],
    ["How do you plan to finance the purchase?", "Conventional"],
    ["What down payment percentage are you considering?", "10"],
    ["How much earnest money would you like to propose?", "5000"],
    ["When would you like to close?", "2027-01-15"],
    [
      "What inspection protections do you want to discuss?",
      "Discuss a professional inspection and the moisture disclosure.",
    ],
    [
      "What financing contingency would you like to discuss?",
      "Review lender approval contingency.",
    ],
    [
      "What should your agent know about appraisal concerns?",
      "Do not assume I can cover an appraisal gap.",
    ],
    ["Any seller contribution you would like to request?", "5000"],
    ["Any items you would like included?", "Kitchen refrigerator."],
  ];
  for (const [question, value] of answers) {
    const control = page.getByLabel(question, { exact: true });
    if (question.startsWith("How do")) await control.selectOption(value);
    else await control.fill(value);
    await page.getByRole("button", { name: "Confirm draft answer" }).click();
  }
  await page.getByRole("button", { name: "Skip for now", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your answers. Ready to organize." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Create draft package" }).click();
  await expect(page.locator(".hb-document-warning")).toContainText(
    "NOT A VALID PURCHASE AGREEMENT",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF package" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  const bytes = await readFile((await download.path())!);
  expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(1);
  await page
    .getByRole("navigation", { name: "Property workspace" })
    .getByRole("link", { name: "Agent review", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Request agent review", exact: true }),
  ).toBeDisabled();
  await page.getByRole("checkbox", { name: /I approve sharing/ }).check();
  await page
    .getByRole("button", { name: "Request agent review", exact: true })
    .click();
  await expect(page.locator(".hb-status")).toContainText("Review requested");
  await page
    .getByRole("link", { name: "Simulate agent review", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enter demo reviewer simulation" })
    .click();
  await page
    .getByLabel("Reviewer comment / requested changes")
    .fill(
      "Please clarify the inspection preference and ask for moisture repair documentation.",
    );
  await page
    .getByRole("button", { name: "Request changes", exact: true })
    .click();
  await expect(page.locator(".hb-status")).toContainText("Changes requested");
  await page.getByRole("link", { name: "Back to buyer" }).click();
  await expect(page.locator(".hb-purchase-current")).toContainText(
    "Changes requested",
  );
  await expect(page.locator(".hb-review-comment")).toContainText(
    "moisture repair documentation",
  );
  await page.reload();
  await expect(page.locator(".hb-purchase-current")).toContainText(
    "Changes requested",
  );
  await page
    .getByRole("link", { name: "Update draft terms", exact: true })
    .click();
  await page.getByRole("button", { name: "Edit amount", exact: true }).click();
  await page
    .getByLabel("What purchase price would you like to propose?", {
      exact: true,
    })
    .fill("470000");
  await page.getByRole("button", { name: "Confirm draft answer" }).click();
  await expect(
    page.getByRole("heading", { name: "Your answers. Ready to organize." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Create draft package" }).click();
  await page
    .getByRole("navigation", { name: "Property workspace" })
    .getByRole("link", { name: "Agent review", exact: true })
    .click();
  await page.getByRole("checkbox", { name: /I approve sharing/ }).check();
  await page
    .getByRole("button", { name: "Request agent review", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Simulate agent review", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enter demo reviewer simulation" })
    .click();
  await expect(
    page.locator(".hb-review-summary").getByText("$470,000", { exact: true }),
  ).toBeVisible();
  await page.locator(".hb-review-queue>aside>button").nth(1).click();
  await expect(
    page.locator(".hb-review-summary").getByText("$475,000", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("URL import preserves source, allows unknown values, and saves property analysis", async ({
  page,
}) => {
  await page.goto("/import");
  await page
    .getByLabel("Original listing URL")
    .fill("https://www.zillow.com/homedetails/example-home/");
  await page.getByRole("button", { name: "Continue with this link" }).click();
  await expect(page.getByText(/we have not fetched this page/)).toBeVisible();
  await page
    .getByLabel("Property address", { exact: true })
    .fill("700 Example Garden Lane");
  await page.getByLabel("City", { exact: true }).fill("Orem");
  await page
    .getByLabel("Paste the listing description (optional)")
    .fill("User-supplied listing text. Roof age unknown.");
  await page
    .getByRole("button", { name: "Preview property", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Does this look right?" }),
  ).toBeVisible();
  await expect(page.locator(".hb-source")).toContainText("User-supplied");
  await page.getByRole("button", { name: "Confirm & open analysis" }).click();
  await expect(
    page.getByRole("heading", { name: "700 Example Garden Lane" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open original listing" }),
  ).toHaveAttribute("href", "https://www.zillow.com/homedetails/example-home/");
  await expect(page.locator(".hb-property-title")).toContainText(
    "Not provided",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "700 Example Garden Lane" }),
  ).toBeVisible();
  await page.goto("/my-homes");
  await page.getByRole("tab", { name: "Imported", exact: true }).click();
  await expect(page.locator(".hb-home-card")).toHaveCount(1);
});

test("desktop discovery, comparison, guest privacy, legacy redirects, and integration states", async ({
  page,
  request,
}) => {
  await page.goto("/homes");
  await page.getByLabel("City, address, or ZIP").fill("84604");
  await expect(page.locator(".hb-home-card")).toHaveCount(1);
  await page.getByLabel("City, address, or ZIP").fill("");
  await page
    .getByRole("button", { name: "Compare 128 Juniper Court, Unit 204" })
    .click();
  await page
    .getByRole("button", { name: "Compare 246 Meadowlark Row" })
    .click();
  await page.goto("/compare");
  await expect(page.locator(".hb-comparison>.hb-panel")).toHaveCount(2);
  await expect(page.getByText(/arbitrary scores/).first()).toBeVisible();
  await page.goto("/account");
  await expect(page.getByText(/Authentication is not connected/)).toBeVisible();
  await page.goto("/integrations");
  await expect(
    page.getByRole("heading", { name: "Data & integrations" }),
  ).toBeVisible();
  await page.goto("/dashboard/purchase");
  await expect(page).toHaveURL(/\/purchase$/);
  await expect(
    page.getByRole("heading", { name: "Your purchase starts with a home." }),
  ).toBeVisible();
  const response = await request.get("/api/workspace");
  expect([401, 503]).toContain(response.status());
});

test("invalid and unsupported imports fail safely without arbitrary page fetching", async ({
  page,
  request,
}) => {
  const headers = { "X-Homebridge-Request": "1" };
  for (const url of [
    "http://127.0.0.1:3000",
    "https://localhost/private",
    "https://user:pass@zillow.com/home",
    "not a url",
  ]) {
    const r = await request.post("/api/import", { headers, data: { url } });
    expect(r.status()).toBe(400);
  }
  await page.goto("/import");
  await page
    .getByLabel("Original listing URL")
    .fill("https://example.com/home");
  await page.getByRole("button", { name: "Continue with this link" }).click();
  await expect(
    page.getByText(/Automatic import is not supported/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preview property" }).click();
  await expect(
    page.getByRole("heading", { name: "Does this look right?" }),
  ).toHaveCount(0);
});

test("map network failure provides an accessible area-link fallback", async ({
  page,
}) => {
  await page.route("**/tile.openstreetmap.org/**", (r) => r.abort());
  await page.goto("/homes");
  await page.getByRole("button", { name: "Map view", exact: true }).click();
  await expect(page.locator(".hb-map-fallback")).toBeVisible({
    timeout: 15000,
  });
  await expect(page.locator(".hb-map-fallback a")).toHaveCount(4);
  await expect(page.locator(".hb-home-card")).toHaveCount(4);
});

test("authorized resolver contract fixture preserves provenance until buyer corrections", async ({
  page,
}) => {
  const { demoHomes } = await import("../../lib/homebridge/demo");
  const home = {
    ...demoHomes[0],
    id: "resolver-fixture",
    source: "licensed",
    provider: "Test fixture only",
    sourceUrl: "https://redfin.com/example",
    provenance: Object.fromEntries(
      Object.keys(demoHomes[0].provenance).map((k) => [k, "provider-reported"]),
    ),
  };
  await page.route("**/api/import", (r) =>
    r.fulfill({
      json: {
        status: "resolved",
        url: "https://redfin.com/example",
        source: "Redfin",
        supported: true,
        property: home,
      },
    }),
  );
  await page.goto("/import");
  await page
    .getByLabel("Original listing URL")
    .fill("https://redfin.com/example");
  await page.getByRole("button", { name: "Continue with this link" }).click();
  await page
    .getByRole("button", { name: "Preview property", exact: true })
    .click();
  await expect(page.locator(".hb-source")).toContainText(
    "Licensed provider data",
  );
  await page.getByRole("button", { name: "Correct details" }).click();
  await page.getByLabel("Asking price ($)").fill("325000");
  await page
    .getByRole("button", { name: "Preview property", exact: true })
    .click();
  await expect(page.locator(".hb-source")).toContainText("User-supplied");
});

test("cross-property preference memory is opt-in and the guest workspace resets", async ({
  page,
}) => {
  await page.goto("/homes/demo-provo?tab=profile");
  await page.getByLabel("Comfortable monthly housing budget ($)").fill("2400");
  await page.goto("/homes/demo-orem");
  await expect(
    page.getByRole("heading", {
      name: "Monthly budget comparison",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.goto("/homes/demo-provo?tab=profile");
  await page
    .getByRole("checkbox", { name: /Use these preferences across homes/ })
    .check();
  await page.goto("/homes/demo-orem");
  await expect(
    page.getByRole("heading", {
      name: "Monthly budget comparison",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save home", exact: true }).click();
  await page.goto("/account");
  await page
    .getByRole("checkbox", { name: "I want to reset this browser workspace." })
    .check();
  await page
    .getByRole("button", { name: "Reset demo workspace", exact: true })
    .click();
  await page.goto("/my-homes");
  await expect(
    page.getByRole("heading", { name: "Your shortlist starts with one home." }),
  ).toBeVisible();
});
