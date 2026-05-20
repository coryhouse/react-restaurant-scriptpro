import { test, expect } from "@playwright/test";

const FOODS_API = "http://localhost:3001/foods";

test.describe("Menu", () => {
  test("renders the Menu heading", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    await expect(page.getByRole("heading", { name: "Menu", level: 1 })).toBeVisible();
  });

  test("renders a food card with name, description, price, tags, and image", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");

    const burgerHeading = page.getByRole("heading", {
      name: "Burger",
      level: 2,
    });
    await expect(burgerHeading).toBeVisible();

    const burgerCard = page
      .locator("div")
      .filter({ has: burgerHeading })
      .first();

    await expect(burgerCard).toContainText(
      "This ain't your average burger. Topped with our tangy cheddar cheese sauce, fresh lettuce, and tomato.",
    );
    await expect(burgerCard).toContainText("$8.99");
    await expect(burgerCard).toContainText("Tags: Lunch, Dinner");

    const burgerImage = burgerCard.getByRole("img", { name: "Burger" });
    await expect(burgerImage).toHaveAttribute("src", "/images/burger.jpg");
  });

  test("renders every food returned by the API as its own card", async ({
    page,
  }) => {
    const apiResponse = await page.request.get(FOODS_API);
    expect(apiResponse.ok()).toBeTruthy();
    const foods: { name: string }[] = await apiResponse.json();

    await page.goto("http://localhost:3000/");

    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(
      foods.length,
    );
    for (const food of foods) {
      await expect(
        page.getByRole("heading", { name: food.name, level: 2 }),
      ).toBeVisible();
    }
  });

  test("formats price with two decimals even for whole-dollar values", async ({
    page,
  }) => {
    await page.route(FOODS_API, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "test-1",
            name: "Round Number Roll",
            image: "burger.jpg",
            price: 10,
            description: "Priced at exactly ten dollars.",
            tags: ["Lunch"],
          },
        ]),
      }),
    );

    await page.goto("http://localhost:3000/");

    const card = page
      .locator("div")
      .filter({
        has: page.getByRole("heading", { name: "Round Number Roll", level: 2 }),
      })
      .first();
    await expect(card).toContainText("$10.00");
  });

  test("shows the loading indicator while the API is in flight", async ({
    page,
  }) => {
    let releaseRequest: (() => void) | undefined;
    const blocker = new Promise<void>((resolve) => {
      releaseRequest = resolve;
    });

    await page.route(FOODS_API, async (route) => {
      await blocker;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Loading...")).toBeVisible();

    releaseRequest!();
    await expect(page.getByText("Loading...")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Menu", level: 1 })).toBeVisible();
  });

  test("renders only the Menu heading when the API returns no foods", async ({
    page,
  }) => {
    await page.route(FOODS_API, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );

    await page.goto("http://localhost:3000/");

    await expect(page.getByRole("heading", { name: "Menu", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(0);
  });
});
