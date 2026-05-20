import { test, expect, type Page } from "@playwright/test";

const drawer = (page: Page) => page.getByRole("dialog");
const toast = (page: Page, text: string | RegExp) =>
  page.locator("[data-sonner-toast]").filter({ hasText: text });

test.describe("Admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin");
  });

  test("renders the menu admin heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Menu admin", level: 1 }),
    ).toBeVisible();
  });

  test("validates, adds, edits, and deletes a menu item", async ({ page }) => {
    const uniqueName = `Test ${Date.now()}`;
    const editedName = `${uniqueName} Edited`;

    // Validation: submitting an empty form keeps the drawer open
    await page.getByRole("button", { name: "Add menu item" }).click();
    await expect(drawer(page)).toBeVisible();

    await page.getByLabel("Price").fill("0");
    await page.getByRole("button", { name: "Add item" }).click();
    await page.waitForTimeout(300);
    await expect(drawer(page)).toBeVisible();

    // Add: fill the form properly and verify the card appears
    await page.getByLabel("Name", { exact: true }).fill(uniqueName);
    await page.getByLabel("Description").fill("Crunchy and delicious.");
    await page.getByLabel("Price").fill("12.99");
    await page.getByLabel("Image filename").fill("street-tacos.jpg");
    await page.getByLabel("Lunch").check();
    await page.getByRole("button", { name: "Add item" }).click();

    await expect(toast(page, new RegExp(`Added "${uniqueName}"`))).toBeVisible();
    await expect(drawer(page)).toBeHidden();
    await expect(
      page.getByRole("heading", { name: uniqueName, level: 2 }),
    ).toBeVisible();

    // Edit: drawer is prefilled, change the name, save
    await page.getByRole("button", { name: `Edit ${uniqueName}` }).click();
    await expect(drawer(page)).toBeVisible();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue(uniqueName);
    await expect(page.getByLabel("Price")).toHaveValue("12.99");
    await expect(page.getByLabel("Lunch")).toBeChecked();

    await page.getByLabel("Name", { exact: true }).fill(editedName);
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(
      toast(page, new RegExp(`Updated "${editedName}"`)),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: editedName, level: 2 }),
    ).toBeVisible();

    // Delete: also serves as cleanup so db.json is left as we found it
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: `Delete ${editedName}` }).click();

    await expect(
      toast(page, new RegExp(`Deleted "${editedName}"`)),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: editedName, level: 2 }),
    ).toHaveCount(0);
  });
});
