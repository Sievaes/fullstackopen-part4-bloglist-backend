const { test, describe, after, beforeEach } = require("node:test");
const assert = require("assert");
const helper = require("./test_helper");

const mongoose = require("mongoose");
const Blog = require("../models/blog");

const app = require("../app");

//Supertest which wraps itself around the app
const supertest = require("supertest");
const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  const noteObjects = helper.initialBlogs.map((blog) => new Blog(blog));
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
    const newBlog = {
      title: "newTitle",
      author: "newAuthor",
      url: "newUrl",
      likes: 99,
    };

    const response = await api
      .post("/api/blogs")
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

  test("if blog dont have likes it will default the value to 0", async () => {
    const newBlog = {
      title: "noLikes",
      author: "NoLikes",
      url: "URL",
    };

    const response = await api.post("/api/blogs").send(newBlog);

    assert(response.body.likes === 0);
  });

  test("return status 400 if title or url is missing from post", async () => {
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
      await api.post("/api/blogs").send(blog).expect(400);
    }
  });
  test("delete by id and return status 204", async () => {
    const initialBlogs = await helper.blogsInDb();
    const blogIdtoBeDeleted = initialBlogs[0].id;

    await api.delete(`/api/blogs/${blogIdtoBeDeleted}`);

    const blogsAfterDelete = await helper.blogsInDb();
    assert.strictEqual(blogsAfterDelete.length, initialBlogs.length - 1);
  });
});

after(async () => {
  await mongoose.connection.close();
});
