const userLogin = async (username, password, page) => {
  await page.getByTestId("username").fill(username)
  await page.getByTestId("password").fill(password)
  await page.getByRole("button", { name: "Login" }).click()
}

const userLogout = async (page) => {
  await page.getByRole("button", { name: "Logout" }).click()
}

const createBlog = async (page) => {
  await page.getByRole("button", { name: "Add Blog" }).click()
  await page.getByTestId("title").fill("test title")
  await page.getByTestId("author").fill("test author")
  await page.getByTestId("url").fill("test url")
  await page.getByRole("button", { name: "Add Blog" }).click()
  await page.getByText("a new blog test title by test author added").waitFor()
}

export { userLogin, createBlog, userLogout }
