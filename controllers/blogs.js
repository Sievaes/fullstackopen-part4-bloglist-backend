const blogsRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");
// const User = require("../models/user");

//Get all blogitems
blogsRouter.get("/", async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate("user", {
      username: 1,
      name: 1,
    });
    response.json(blogs);
  } catch (error) {
    next(error);
  }
});

//Post a new blogitem
blogsRouter.post("/", async (request, response, next) => {
  try {
    const body = request.body;

    if (!request.token) {
      return response.status(401).json({ error: "token missing" });
    }

    const decodedToken = jwt.verify(request.token, process.env.SECRET);

    if (!decodedToken) {
      return response.status(401).json({ error: "token invalid" });
    }

    //gets the user from userExtract middleware, which extracts the user from the request
    const user = request.user;

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id,
    });

    if (!blog.title || !blog.url) {
      return response.status(400).json({ error: "Title and URL are required" });
    }

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

//Delete blogitem
blogsRouter.delete("/:id", async (request, response, next) => {
  try {
    const id = request.params.id;
    const blog = await Blog.findById(id);

    if (!blog) {
      return response.status(401).json({ error: "blog not found" });
    }

    const decodedToken = jwt.decode(request.token, process.env.SECRET);

    if (!decodedToken) {
      return response.status(401).json({ error: "token invalid" });
    }

    if (blog.user.toString() === decodedToken.id.toString()) {
      await Blog.findByIdAndDelete(id);
      response.status(200).json({ deletedId: id });
    } else {
      return response
        .status(403)
        .json({ error: "You are not authorized to delete this blog post" });
    }
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:id", async (request, response, next) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true }
    );
    response.status(200).json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
