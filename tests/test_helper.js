const Blog = require("../models/blog");
const jwt = require("jsonwebtoken");

const initialBlogs = [
  {
    title: "Title 1",
    author: "Author 1",
    url: "Url 1",
    likes: 1,
  },
  {
    title: "Title 2",
    author: "Author 2",
    url: "Url 2",
    likes: 1,
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const getToken = async (user) => {
  const userForToken = {
    username: user.username,
    id: user._id,
  };

  // Generate a token
  return jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: "1h",
  });
};

module.exports = { initialBlogs, blogsInDb, getToken };
