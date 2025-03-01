const { test, describe, after, beforeEach } = require("node:test");
const assert = require("assert");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Blog = require("../models/blog");

const app = require("../app");

//Supertest which wraps itself around the app
const supertest = require("supertest");
const User = require("../models/user");
const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("password", 10);
  const user = new User({ username: "root", password: passwordHash });
  await user.save();

  const noteObjects = helper.initialBlogs.map(
    (blog) => new Blog({ ...blog, user: user._id })
  );
  const promiseArray = noteObjects.map((note) => note.save());
  await Promise.all(promiseArray);
});

describe("API tests", () => {
  test("make sure returned blogs are in JSON format", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("make sure all blogs are returned", async () => {
    const response = await helper.blogsInDb();
    assert.strictEqual(response.length, helper.initialBlogs.length);
  });

  test("check returned blog id is formatted correctly to id, and not _id", async () => {
    const response = await helper.blogsInDb();
    assert(Object.prototype.hasOwnProperty.call(response[0], "id"));
  });

  test("check POST request works", async () => {
    const user = await User.findOne({ username: "root" });

    const token = await helper.getToken(user);

    const newBlog = {
      title: "newTitle",
      author: "newAuthor",
      url: "newUrl",
      likes: 99,
      user: user.id,
    };

    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAfterPost = await api.get("/api/blogs");

    const expectedBlog = { ...newBlog, id: response.body.id };

    assert.strictEqual(
      blogsAfterPost.body.length,
      helper.initialBlogs.length + 1
    );
    assert.deepStrictEqual(response.body, expectedBlog);
  });

  test("check POST request gets denied without token", async () => {
    const newBlog = {
      title: "newTitles",
      author: "newAuthor",
      url: "newUrl",
      likes: 99,
    };

    await api.post("/api/blogs").send(newBlog).expect(401);
  });

  test("if blog dont have likes it will default the value to 0", async () => {
    const user = await User.findOne({ username: "root" });

    const token = await helper.getToken(user);

    const newBlog = {
      title: "noLikes",
      author: "NoLikes",
      url: "URL",
      user: user._id,
    };

    const response = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog);

    assert(response.body.likes === 0);
  });

  test("return status 400 if title or url is missing from post", async () => {
    const user = await User.findOne({ username: "root" });

    const token = await helper.getToken(user);

    const blogs = [
      {
        title: "",
        author: "AuthorWithNoTitle",
        url: "https://example.com",
        likes: 10,
      },
      {
        title: "Title",
        author: "AuthorWithNoUrl",
        url: "",
        likes: 11,
      },
    ];

    for (const blog of blogs) {
      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(blog)
        .expect(400);
    }
  });
  test("delete by id and return status 204", async () => {
    const user = await User.findOne({ username: "root" });

    const initialBlogs = await helper.blogsInDb();
    const blogIdtoBeDeleted = initialBlogs[0].id;

    const token = await helper.getToken(user);

    await api
      .delete(`/api/blogs/${blogIdtoBeDeleted}`)
      .set("Authorization", `Bearer ${token}`);

    const blogsAfterDelete = await helper.blogsInDb();
    assert.strictEqual(blogsAfterDelete.length, initialBlogs.length - 1);
  });

  test("check that updating a blog works", async () => {
    const user = await User.findOne({ username: "root" });
    const initialBlog = await helper.blogsInDb();

    const updatedBlog = {
      title: "updatedTitle",
      author: "updatedAuthor",
      url: "URL",
      id: initialBlog[0].id,
      likes: 500,
      user: user.id,
    };

    const response = await api
      .put(`/api/blogs/${initialBlog[0].id}`)
      .send(updatedBlog)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    assert.deepEqual(response.body, updatedBlog);
  });
});

after(async () => {
  await mongoose.connection.close();
});
