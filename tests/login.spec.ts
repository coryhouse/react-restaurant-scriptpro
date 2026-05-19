import { test, expect, type Page } from "@playwright/test";

const fieldError = (page: Page, fieldId: string) =>
  page
    .getByRole("group")
    .filter({ has: page.locator(`#${fieldId}`) })
    .locator('[data-slot="field-error"]');

const errorSummary = (page: Page) =>
  page.locator('[aria-labelledby="error-summary-heading"]');

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login");
  });

  test("logs in with valid credentials, redirects home", async ({ page }) => {
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL("http://localhost:3000/");
    await expect(page.getByText("Welcome, user@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
  });

  test("shows error summary when submitting empty form", async ({ page }) => {
    await page.getByRole("button", { name: "Login" }).click();

    const summary = errorSummary(page);
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Please fix the following errors:");
    await expect(summary).toContainText("Please enter a valid email address");
    await expect(summary).toContainText(
      "Password must be at least 6 characters long",
    );
    await expect(page).toHaveURL("http://localhost:3000/login");
  });

  test("shows email error for an invalid email on blur", async ({ page }) => {
    const emailField = page.getByLabel("Email");
    await emailField.fill("not-an-email");
    await emailField.blur();

    await expect(fieldError(page, "email")).toHaveText(
      "Please enter a valid email address",
    );
  });

  test("shows password error when password is too short", async ({ page }) => {
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(fieldError(page, "password")).toHaveText(
      "Password must be at least 6 characters long",
    );
    await expect(page).toHaveURL("http://localhost:3000/login");
  });

  test("clears error once a previously invalid field becomes valid", async ({
    page,
  }) => {
    const emailField = page.getByLabel("Email");
    await emailField.fill("not-an-email");
    await emailField.blur();
    await expect(fieldError(page, "email")).toHaveText(
      "Please enter a valid email address",
    );

    await emailField.fill("user@example.com");
    await expect(fieldError(page, "email")).toHaveCount(0);
  });

  test("clears the welcome message when logging out", async ({ page }) => {
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Welcome, user@example.com")).toBeVisible();
    await page.getByRole("button", { name: "Log out" }).click();

    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByText("Welcome,")).toHaveCount(0);
  });
});
