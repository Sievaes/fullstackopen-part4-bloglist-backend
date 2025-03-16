const { test, expect, beforeEach, describe } = require("@playwright/test")
const { userLogin, createBlog, userLogout } = require("./helper")

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset")
    await request.post("/api/users", {
      data: {
        name: "Superuser",
        username: "Testaaja",
        password: "salainen",
      },
    })

    await page.goto("/")
  })

  test("Login form is shown", async ({ page }) => {
    const locator = await page.getByRole("heading", { name: "Login" })

    await expect(locator).toBeVisible()
  })

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await userLogin("Testaaja", "salainen", page)
      const locator = await page.getByText("User Superuser logged in")
      await expect(locator).toBeVisible()
    })

    test("fails with wrong credentials", async ({ page }) => {
      await userLogin("Testaaja", "wrongpass", page)
      const locator = await page.getByText("Wrong username or password")
      await expect(locator).toBeVisible()
    })
  })

  describe("Blogs", () => {
    beforeEach(async ({ page }) => {
      await userLogin("Testaaja", "salainen", page)
    })

    test("add new blog", async ({ page }) => {
      await createBlog(page)
      await page.getByRole("button", { name: "Show" }).click()

      //to find header h3
      const newTitleLocator = await page.getByRole("heading", {
        name: "test title",
        level: 3,
      })

      //to find <p>
      const newAuthorLocator = await page.locator("p", {
        hasText: "test author",
      })
      const newUrlLocator = await page.getByText("test url")
      await expect(newTitleLocator).toBeVisible()
      await expect(newAuthorLocator).toBeVisible()
      await expect(newUrlLocator).toBeVisible()
    })

    test("you can like a blog", async ({ page }) => {
      await createBlog(page)
      await page.getByRole("button", { name: "Show" }).click()

      await page.getByRole("button", { name: "Like" }).click()
      const locator = await page.getByText("Likes: 1")
      await expect(locator).toBeVisible()
    })

    test("you can remove a blog", async ({ page }) => {
      await createBlog(page)
      await page.getByRole("button", { name: "Show" }).click()
      await page.getByRole("button", { name: "Remove" }).click()

      //to find header h3
      const newTitleLocator = await page.getByRole("heading", {
        name: "test title",
        level: 3,
      })
      await expect(newTitleLocator).not.toBeVisible()
    })

    test("only user who posted can remove", async ({ page, request }) => {
      //create new user
      await request.post("/api/users", {
        data: {
          name: "Superuser2",
          username: "Testaaja2",
          password: "salainen",
        },
      })

      await createBlog(page)
      await userLogout(page)
      await userLogin("Testaaja2", "salainen", page)

      await page.getByRole("button", { name: "Show" }).click()
      const locator = await page.getByRole("button", { name: "Remove" })
      await expect(locator).not.toBeVisible()
    })

    test("blogs are arranged by amount of likes", async ({ page }) => {
      await createBlog(page)
      await createBlog(page)
      await page.getByRole("button", { name: "Show" }).nth(1).click()
      await page.getByRole("button", { name: "Like" }).click()
      await page.getByRole("button", { name: "Show" }).click()
      const locator = await page.getByText("Likes: 1").nth(0)
      await expect(locator).toBeVisible()
    })
  })
})
