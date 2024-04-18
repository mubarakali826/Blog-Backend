const Blog = require("../models/Blog");
const Like = require("../models/Like");
const Dislike = require("../models/Dislike");
const URL = require("url");
const slugify = require("slugify");
const { ObjectId } = require("mongodb");
const message = require("../helpers/message");
const { findUserByEmail } = require("../models/User");

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
        message.sendErrorResponse(res, 400, "Invalid entry");
        return;
      }
      const { title, content } = parsedBody;
      if (!title || !content) {
        message.sendErrorResponse(res, 400, "please fill the required fields");
        return;
      }

      const slug = slugify(title, "-");
      const existingSlug = await Blog.findBlogBySlug(slug);
      if (existingSlug) {
        message.sendErrorResponse(res, 400, "This slug is already in use");
        return;
      }

      // Create a new blog post
      await Blog.createBlog({ title, content, slug });
      message.sendSuccessResponse(res, "Blog post created successfully", {
        blogData: { title: title, content: content, slug: slug },
      });
    });
  } catch (error) {
    console.error("Error creating blog post:", e);
    message.sendErrorResponse(res, 500, "internal server error");
    return;
  }
};
exports.likeBlog = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);
    const parts = pathname.split("/");
    // console.log("Decoded token:", req.user);
    const user = await findUserByEmail(req.user.email);
    const userId = user._id;
    const blogId = parts[parts.length - 1];

    if (!ObjectId.isValid(blogId)) {
      message.sendErrorResponse(res, 400, "Invalid blogID");
      return;
    }

    const result = await Like.likeBlog(userId, blogId);
    if (result === "already") {
      message.sendErrorResponse(res, 400, "Blog already liked");
      return;
    }
    else if (result === "nonExistent") {
      message.sendErrorResponse(res, 400, "Blog doesnot exist");
      return;
    }

    message.sendCustomResponse(res, 201, {
      message: "Blog liked successfully",
    });
  } catch (error) {
    console.error("Error liking blog post:", error);
    message.sendErrorResponse(res, 500, "internal server error");
    return;
  }
};
exports.removeLike = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const user = await findUserByEmail(req.user.email);
    const userId = user._id;
    const blogId = parts[parts.length - 1];
    if ( !ObjectId.isValid(blogId)) {
      message.sendErrorResponse(res, 400, "Invalid blogID");
      return;
    }
    const result = await Like.likeBlog(userId, blogId);

    if (result === "err") {
      await Like.removeLike(userId, blogId);
      message.sendSuccessResponse(res, "Blog like removed successfully");
      return;
    } else {
      await Like.removeLike(userId, blogId);
      message.sendErrorResponse(res, 400, "Blog not already liked");
      return;
    }
  } catch (e) {
    console.error("Error removing like from blog post:", e);
    message.sendErrorResponse(res, 500, "internal server error");
    return;
  }
};
exports.dislikeBlog = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const user = await findUserByEmail(req.user.email);
    const userId = user._id;
    const blogId = parts[parts.length - 1];

    if ( !ObjectId.isValid(blogId)) {
      message.sendErrorResponse(res, 400, "Invalid blogID");
      return;
    }

    const result = await Dislike.dislikeBlog(userId, blogId);
    if (result === "already") {
      message.sendErrorResponse(res, 400, "Blog already disliked");
      return;
    }
    else if (result === "nonExistent") {
      message.sendErrorResponse(res, 400, "Blog doesnot exist");
      return;
    }
    message.sendCustomResponse(res, 201, {
      message: "Blog disliked successfully",
    });
  } catch (error) {
    console.error("Error disliking blog post:", error);
    message.sendErrorResponse(res, 500, "internal server error");
    return;
  }
};
exports.removeDislike = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const user = await findUserByEmail(req.user.email);
    const userId = user._id;
    const blogId = parts[parts.length - 1];
    if ( !ObjectId.isValid(blogId)) {
      message.sendErrorResponse(res, 400, "Invalid blogID");
      return;
    }
    const result = await Dislike.dislikeBlog(userId, blogId);
    if (result === "err") {
      await Dislike.removeDislike(userId, blogId);
      message.sendSuccessResponse(res, "Blog dislike removed successfully");
      return;
    } else {
      await Dislike.removeDislike(userId, blogId);
      message.sendErrorResponse(res, 400, "Blog not already disliked");
      return;
    }
  } catch (e) {
    console.error("Error removeing dislike from blog post:", e);
    message.sendErrorResponse(res, 500, "internal server error");
    return;
  }
};
exports.getLikeCounts = async (req, res) => {
  try {
    const { pathname } = URL.parse(req.url, true);

    const parts = pathname.split("/");
    const blogId = parts[parts.length - 1];

    if (!ObjectId.isValid(blogId)) {
      message.sendErrorResponse(res, 400, "Invalid blogID");
      return;
    }
    const result = await Like.getLikeCounts(blogId);
    message.sendCustomResponse(res, 200, { LikesCount: result });
  } catch (e) {
    console.error("Error getting  number of likes from blog post:", error);
    message.sendErrorResponse(res, 500, "internal server error");
    return;
  }
};
exports.getLikedBlogs = async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    const userId = user._id;

    const likedBlogs = await Like.getLikedBlogs(userId);

    message.sendCustomResponse(res, 200, { likedBlogs: likedBlogs });
  } catch (error) {
    message.sendErrorResponse(res, 500, "internal server error");
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
      message.sendErrorResponse(res, 400, "Invalid blogID");
      return;
    }
    req.on("end", async () => {
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (error) {
        message.sendErrorResponse(res, 400, "Invalid entry");
        return;
      }
      const { title, content } = parsedBody;
      if (!title || !content) {
        message.sendErrorResponse(res, 400, "Please fill the required fields");
        return;
      }
      const slug = slugify(title, "-");

      const blog = await Blog.findBlogById(id);
      if (!blog) {
        message.sendErrorResponse(res, 400, "Blog post not found");
        return;
      }
      await Blog.updateBlog(id, { title, content, slug });
      message.sendSuccessResponse(res, "Blog post updated successfully", {
        updatedBlogData: { title: title, content: content, slug: slug },
      });
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    message.sendErrorResponse(res, 500, "internal server error");
    return;
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
    if (!ObjectId.isValid(id)) {
      message.sendErrorResponse(res, 400, "Invalid blogID");
      return;
    }
    req.on("end", async () => {
      const deletedBlog = await Blog.deleteBlog(id);
      if (deletedBlog.deletedCount == 0) {
        message.sendErrorResponse(res, 404, "Blog post not found");
        return;
      }
      message.sendSuccessResponse(res, "Blog deleted successfully");
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    message.sendErrorResponse(res, 500, "internal server error");
    return;
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.getAllBlogs();

    message.sendCustomResponse(res, 200, { allBlogs: blogs });
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    message.sendErrorResponse(res, 500, "internal server error");
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
      message.sendErrorResponse(res, 400, "Invalid blogID");
      return;
    }
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const blog = await Blog.findBlogById(id);
      if (!blog) {
        message.sendErrorResponse(res, 404, "Blog post not found");
        return;
      }
      message.sendSuccessResponse(res, "", { blog: blog });
      return;
    });
  } catch (error) {
    console.error("Error fetching blog post by ID:", error);
    message.sendErrorResponse(res, 500, "internal server error");
    return;
  }
};
