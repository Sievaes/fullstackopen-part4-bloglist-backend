//DUMMY TEST FOR... DUMMIES
const dummy = () => {
  return 1;
};

//COUNT TOTAL LIKES OF ALL AUTHORS
const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes;
  };

  return blogs.likes === 0 ? 0 : blogs.reduce(reducer, 0);
};

//FIND WHICH AUTHOR HAS MOST LIKES
const favoriteBlog = (blogs) => {
  const reducer = (curFavorite, curBlog) => {
    return curFavorite.likes > curBlog.likes ? curFavorite : curBlog;
  };
  return blogs.reduce(reducer, blogs[0]);
};

//FIND WHICH AUTHOR HAS MOST BLOGS
const mostBlogs = (blogs) => {
  const reducer = (acc, curAuthor) => {
    return acc.blogs > curAuthor.blogs ? acc : curAuthor;
  };

  const mostBlogs = blogs.reduce(reducer, blogs[0]);

  return {
    author: mostBlogs.author,
    blogs: mostBlogs.blogs,
  };
};

//FIND WHICH AUTHOR HAS MOST LIKES AND HOW MANY LIKES ARE THERE
const mostLikes = (blogs) => {
  const reducer = (acc, curAuthor) => {
    return acc.likes > curAuthor.likes ? acc : curAuthor;
  };

  const mostLikes = blogs.reduce(reducer, blogs[0]);

  return {
    author: mostLikes.author,
    likes: mostLikes.likes,
  };
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
