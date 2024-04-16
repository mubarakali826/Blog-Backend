const Blog = require("../models/Blog");
const Like = require("../models/Like");
const Dislike = require("../models/Dislike");
const URL = require("url");
const slugify = require("slugify");
const { ObjectId } = require("mongodb");

exports.createBlog = async (req, res) => {
  try {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert Buffer to string
    });

    req.on("end", async () => {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (error) {
        res.writeHead(401, { "Content-Type": "text/json" });
        res.end(JSON.stringify({ message: "Invalid entry" }));
        return;
      }
      const { title, content } = parsedBody;
      if (!title || !content) {
        res.writeHead(400, { "Content-Type": "text/json" });
        res.end(JSON.stringify({ message: "Please fill the required fields" }));
        return;
      }

      const slug = slugify(title, "-");
      const existingSlug = await Blog.findBlogBySlug(slug);
      if (existingSlug) {
        res.writeHead(400, { "Content-Type": "text/json" });
        res.end(JSON.stringify({ message: "This slug is already in use" }));
        return;
      }

      // Create a new blog post
      await Blog.createBlog({ title, content, slug });
      res.writeHead(200, { "Content-Type": "text/json" });
      res.end(JSON.stringify({ message: "Blog post created successfully" }));
      return;
    });
  } catch (error) {
    console.error("Error creating blog post:", e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal server error" }));
    return;
  }
};
exports.likeBlog = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);
    const parts = pathname.split("/");
    const userId = parts[parts.length - 2];
    const blogId = parts[parts.length - 1];

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(blogId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userID or blogID" }));
      return;
    }

    const result = await Like.likeBlog(userId, blogId);
    if (result === "err") {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Blog already liked" }));
      return;
    }

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Blog Liked successfully" }));
  } catch (error) {
    console.error("Error liking blog post:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
exports.removeLike = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const userId = parts[parts.length - 2];
    const blogId = parts[parts.length - 1];
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(blogId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userID or blogID" }));
      return;
    }
    await Like.removeLike(userId, blogId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Blog like removed successfully" }));
  } catch (e) {
    console.error("Error removing like from blog post:", e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
exports.dislikeBlog = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const userId = parts[parts.length - 2];
    const blogId = parts[parts.length - 1];

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(blogId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userID or blogID" }));
      return;
    }

    const result = await Dislike.dislikeBlog(userId, blogId);
    if (result === "err") {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Blog already disliked" }));
      return;
    }
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Blog disliked successfully" }));
  } catch (error) {
    console.error("Error disliking blog post:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
exports.removeDislike = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const userId = parts[parts.length - 2];
    const blogId = parts[parts.length - 1];
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(blogId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userID or blogID" }));
      return;
    }
    await Dislike.removeDislike(userId, blogId);
    await Dislike.removeDislike(userId, blogId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Blog dislike removed successfully" }));
  } catch (e) {
    console.error("Error removeing dislike from blog post:", e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
exports.getLikeCounts = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const blogId = parts[parts.length - 1];

    if (!ObjectId.isValid(blogId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid blogID" }));
      return;
    }
    console.log(blogId);
    const result = await Like.getLikeCounts(blogId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Likes are " + result }));
  } catch (e) {
    console.error("Error getting  number of likes from blog post:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
exports.getLikedBlogs = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const userId = parts[parts.length - 1];
    if (!ObjectId.isValid(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userID" }));
      return;
    }

    const likedBlogs = await Like.getLikedBlogs(userId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(likedBlogs));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Error fetching blog posts" }));
    return;
  }
};
exports.updateBlog = async (req, res) => {
  try {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    const { pathname } = URL.parse(req.url, true);

    console.log(pathname);

    const parts = pathname.split("/");
    const id = parts[parts.length - 1];
    if (!ObjectId.isValid(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid blogID" }));
      return;
    }
    req.on("end", async () => {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid entry" }));
        return;
      }
      const { title, content } = parsedBody;
      if (!title || !content) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Please fill the required fields" }));
        return;
      }
      const slug = slugify(title, "-");

      const blog = await Blog.findBlogById(id);
      if (!blog) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Blog post not found" }));
        return;
      }
      await Blog.updateBlog(id, { title, content, slug });
      res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Blog post updated" }));
        return;
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify("Internal server error"));
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert Buffer to string
    });
    const { pathname } = URL.parse(req.url, true);
    // If you want to extract the blog ID from the pathname
    const parts = pathname.split("/");
    const id = parts[parts.length - 1];
    if (!ObjectId.isValid(blogId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify("invalid ID"));
      return;
    }
    req.on("end", async () => {
      const deletedBlog = await Blog.deleteBlog(id);
      if (deletedBlog.deletedCount == 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify("Blog post not found"));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });

      res.end(JSON.stringify("Blog post deleted successfully"));
      return;
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify("Internal server error"));
    return;
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.getAllBlogs();

    res.end(JSON.stringify(blogs));
    res.status = 200;
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify("Internal server error"));
    return;
  }
};

exports.getBlogById = async (req, res) => {
  try {
    let body = "";
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const id = parts[parts.length - 1];
    if (!ObjectId.isValid(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify("invalid ID"));
      return;
    }
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const blog = await Blog.findBlogById(id);
      if (!blog) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify("Blog post not found"));
        return ;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(blog));
      return;
    });
  } catch (error) {
    console.error("Error fetching blog post by ID:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify("Internal server error"));
    return;
  }
};
