const URL = require("url");
const {
  createBlog,
  likeBlog,
  dislikeBlog,
  removeLike,
  removeDislike,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  getLikedBlogs,
  getLikeCounts
} = require("../controllers/blogController");
const { verifyToken } = require("../utils/token");

function handleBlogRoutes(req, res) {
  const { method, url, headers } = req;
  const { pathname } = URL.parse(url);
  console.log("Request pathname:", pathname);

  if (method === "POST" && pathname === "/api/blogs") {
    verifyToken(req, res, () => createBlog(req, res));
  } else if (method === "POST" && pathname.startsWith("/api/blogs/like")) {
    verifyToken(req, res, () => likeBlog(req, res));
  } else if (method === "POST" && pathname.startsWith("/api/blogs/dislike")) {
    verifyToken(req, res, () => dislikeBlog(req, res));
  } else if (method === "DELETE" && pathname.startsWith("/api/blogs/like")) {
    verifyToken(req, res, () => removeLike(req, res));
  } else if (method === "DELETE" && pathname.startsWith("/api/blogs/dislike")) {
    verifyToken(req, res, () => removeDislike(req, res));
  } 
  else if (method === "GET" && pathname.startsWith("/api/blogs/like")) {
    verifyToken(req, res, () => getLikedBlogs(req, res));
  }
  else if (method === "GET" && pathname.startsWith("/api/blogs/countlikes")) {
    verifyToken(req, res, () => getLikeCounts(req, res));
  }else if (method === "PUT" && pathname.startsWith("/api/blogs/")) {
    verifyToken(req, res, () => updateBlog(req, res));
  } else if (method === "DELETE" && pathname.startsWith("/api/blogs/")) {
    verifyToken(req, res, () => deleteBlog(req, res));
  } else if (method === "GET" && pathname === "/api/blogs") {
    getAllBlogs(req, res);
  } else if (method === "GET" && pathname.startsWith("/api/blogs/")) {
    getBlogById(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "text/pl ain" });
    res.end("404 Not Found");
  }
}

module.exports = handleBlogRoutes;
