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
        res.status = 400;
        res.end(JSON.stringify({ message: "Invalid Entry" }));
        return;
      }
      const { title, content } = parsedBody;
      if (!title || !content) {
        res.status = 400;
        res.end(JSON.stringify({ message: "Please fill the required fields" }));
        return;
      }

      const slug = slugify(title, "-");
      const existingSlug = await Blog.findBlogBySlug(slug);
      if (existingSlug) {
        res.end(JSON.stringify("This slug is already in use"));
        return (res.status = 400);
      }

      // Create a new blog post
      await Blog.createBlog({ title, content, slug });
      res.end(JSON.stringify("Blog post created successfully'"));
      res.status = 201;
    });
  } catch (error) {
    console.error("Error creating blog post:", e);
    res.end(JSON.stringify("Internal server error'"));
    res.status = 500;
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

    res.writeHead(200, { "Content-Type": "application/json" });
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
    if (
      !/^[0-9a-fA-F]{24}$/.test(userId) ||
      !/^[0-9a-fA-F]{24}$/.test(blogId)
    ) {
      res.end(JSON.stringify("invalid userID or blogID"));
      return (res.status = 400);
    }
    await Like.removeLike(userId, blogId);
    res.end(JSON.stringify("like removed successfully"));
    res.status = 200;
  } catch (e) {
    console.error("Error removing like from blog post:", e);
    res.end(JSON.stringify("Internal server error"));
    res.status = 500;
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

    const result =await Dislike.dislikeBlog(userId, blogId);
    if (result === "err") {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Blog already disliked" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
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
    if (
      !/^[0-9a-fA-F]{24}$/.test(userId) ||
      !/^[0-9a-fA-F]{24}$/.test(blogId)
    ) {
      res.end(JSON.stringify("invalid userID or blogID"));
      return (res.status = 400);
    }
    await Dislike.removeDislike(userId, blogId);
    await Dislike.removeDislike(userId, blogId);
    res.end(JSON.stringify("dislike removed successfully"));
    res.status = 200;
  } catch (e) {
    console.error("Error removeing dislike from blog post:", e);
    res.end(JSON.stringify("Internal server error"));
    res.status = 500;
  }
};

exports.getLikedBlogs = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const userId = parts[parts.length - 1];
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      res.end(JSON.stringify("invalid userID "));
      return (res.status = 400);
    }

    const likedBlogs = await Like.getLikedBlogs(userId);

    res.end(JSON.stringify(likedBlogs));
    res.status = 200;
  } catch (error) {
    console.error("Error fetching liked blog posts:", error);
    res.end(JSON.stringify("Internal server error"));
    res.status = 500;
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
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.end(JSON.stringify("invalid ID"));
      return (res.status = 400);
    }
    req.on("end", async () => {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (error) {
        res.status = 400;
        res.end(JSON.stringify({ message: "Invalid Entry" }));
        return;
      }
      const { title, content } = parsedBody;
      if (!title || !content) {
        res.status = 400;
        res.end(JSON.stringify({ message: "Please fill the required fields" }));
        return;
      }
      const slug = slugify(title, "-");

      const blog = await Blog.findBlogById(id);
      if (!blog) {
        res.end(JSON.stringify("Blog post not found"));
        return (res.status = 404);
      }
      await Blog.updateBlog(id, { title, content, slug });
      res.end(JSON.stringify("Blog post updated successfully"));
      res.status = 200;
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.end(JSON.stringify("Internal server error"));
    res.status = 500;
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
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.end(JSON.stringify("invalid ID"));
      return (res.status = 400);
    }
    req.on("end", async () => {
      const deletedBlog = await Blog.deleteBlog(id);
      if (deletedBlog.deletedCount == 0) {
        res.end(JSON.stringify("Blog post not found"));
        return (res.status = 404);
      }

      res.end(JSON.stringify("Blog post deleted successfully"));
      res.status = 200;
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.end(JSON.stringify("Internal server error"));
    res.status = 500;
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.getAllBlogs();

    res.end(JSON.stringify(blogs));
    res.status = 200;
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    res.end(JSON.stringify("Internal server error"));
    res.status = 500;
  }
};

exports.getBlogById = async (req, res) => {
  try {
    let body = "";
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const id = parts[parts.length - 1];
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.end(JSON.stringify("invalid ID"));
      return (res.status = 400);
    }
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert Buffer to string
    });

    req.on("end", async () => {
      // Find the blog post by ID
      const blog = await Blog.findBlogById(id);
      if (!blog) {
        res.end(JSON.stringify("Blog post not found"));
        return (res.status = 404);
      }

      res.end(JSON.stringify(blog));
      res.status = 200;
    });
  } catch (error) {
    console.error("Error fetching blog post by ID:", error);
    res.end(JSON.stringify("Internal server error"));
    res.status = 500;
  }
};
