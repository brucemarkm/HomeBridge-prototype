import { test, expect } from "@playwright/test";
async function role(page: import("@playwright/test").Page, r: string) {
  await page.getByRole("button", { name: "Explore demo", exact: true }).click();
  await page
    .getByRole("button", { name: new RegExp(`Enter ${r} demo`) })
    .click();
}
test("buyer discovery, comparison, import, purchase, and persistence", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your home. A smarter way." }),
  ).toBeVisible();
  await role(page, "buyer");
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await page.goto("/homes");
  await page.getByLabel("City", { exact: true }).selectOption("Provo");
  await page.getByLabel("Maximum price").selectOption("550000");
  await expect(page.locator(".property")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Compare 128 Juniper Lane", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save 387 Juniper Lane", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Unsave 387 Juniper Lane", exact: true }),
  ).toBeVisible();
  await page.goto("/dashboard/compare");
  await expect(
    page.getByRole("heading", { name: "128 Juniper Lane" }),
  ).toBeVisible();
  await page.goto("/homes");
  await page.getByRole("button", { name: "Bring a home", exact: true }).click();
  await page.getByLabel("Property address").fill("100 Demo Garden Lane");
  await page
    .getByRole("button", { name: "Save manually entered home" })
    .click();
  await expect(
    page.getByRole("heading", { name: "100 Demo Garden Lane" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start a demo purchase" }).click();
  await expect(
    page.getByRole("heading", { name: "One step closer to your keys." }),
  ).toBeVisible();
  await page.getByLabel("Share preapproval", { exact: true }).check();
  await page.reload();
  await expect(
    page.getByLabel("Share preapproval", { exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Confirm simulated milestone")).toHaveCount(0);
  await page.goto("/dashboard/assistant");
  await page.getByLabel("Ask Homebridge AI").fill("What is earnest money?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.locator(".bubble").last()).toContainText(
    "No money moves in this demo",
  );
  await page.goto("/dashboard/messages");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Can we review the inspection?");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator(".bubble").last()).toContainText(
    "Can we review the inspection?",
  );
  await role(page, "agent");
  await page.goto("/agent/transactions");
  await page
    .getByLabel("Choose a purchase")
    .selectOption({ label: "100 Demo Garden Lane · Alex Morgan" });
  await page.getByLabel("Confirm simulated milestone").selectOption("3");
  await expect(page.locator(".purchase-summary .badge")).toHaveText(
    "Offer Preparation",
  );
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "This is a different workspace." }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Enter admin demo/ }).click();
  await expect(
    page.getByRole("heading", { name: "A clearer view of your business." }),
  ).toBeVisible();
  await page.goto("/admin/settings");
  await page.getByLabel("Proposed representation fee ($)").fill("3200");
  await page.goto("/");
  await expect(page.locator(".floating-card")).toContainText("$3,200");
  await role(page, "buyer");
  await page.goto("/dashboard/settings");
  await page.getByRole("button", { name: "Reset demonstration data" }).click();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await expect(page.locator(".floating-card")).toContainText("$2,995");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("homebridge-demo-v1")!).imported
            .length,
      ),
    )
    .toBe(0);
});
test("onboarding, documents, pricing, and mobile layout", async ({ page }) => {
  await page.goto("/get-started");
  await page.getByLabel("Home budget ($)").fill("600000");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Open my demo" }).click();
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await page.goto("/dashboard/documents");
  await page.getByLabel("Upload demo document").setInputFiles({
    name: "demo-note.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Fictional inspection notes"),
  });
  await expect(page.getByText("demo-note.txt")).toBeVisible();
  await page
    .getByRole("button", { name: "Acknowledge", exact: true })
    .first()
    .click();
  await expect(page.getByText("Acknowledged", { exact: true })).toBeVisible();
  await page.goto("/pricing");
  await expect(page.locator(".big-number")).toContainText("$9,505");
  await page.getByLabel("Comparison commission (%)").fill("3");
  await expect(page.locator(".big-number")).toContainText("$12,005");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of [
    "/",
    "/homes",
    "/dashboard",
    "/dashboard/purchase",
    "/dashboard/assistant",
  ]) {
    await page.goto(url);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
});

test("homepage natural-language search survives route navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Describe your dream home")
    .fill("3 bedrooms in Provo under $550,000");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.getByLabel("City", { exact: true })).toHaveValue("Provo");
  await expect(page.getByLabel("Maximum price")).toHaveValue("550000");
  await expect(page.locator(".property")).toHaveCount(4);
  await page.reload();
  await expect(page.locator(".property")).toHaveCount(4);
});

test("secondary navigation and schematic map remain functional", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const url of [
    "/how-it-works",
    "/about",
    "/resources",
    "/contact",
    "/sellers",
    "/login",
  ]) {
    await page.goto(url);
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.goto("/homes");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(page.locator(".demo-map")).toBeVisible();
  await expect(page.locator(".map-pin")).toHaveCount(28);
  await page
    .getByRole("link", { name: "View 128 Juniper Lane", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "128 Juniper Lane", exact: true }),
  ).toBeVisible();
  await role(page, "agent");
  for (const url of ["/agent/clients", "/agent/tasks", "/agent/messages"]) {
    await page.goto(url);
    await expect(page.locator("h1")).toBeVisible();
  }
  await role(page, "admin");
  for (const url of [
    "/admin/leads",
    "/admin/team",
    "/admin/analytics",
    "/admin/settings",
  ]) {
    await page.goto(url);
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
