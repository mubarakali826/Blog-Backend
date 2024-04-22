const Blog = require("../models/Blog");
const Like = require("../models/Like");
const Dislike = require("../models/Dislike");
const slugify = require("slugify");
const { ObjectId } = require("mongodb");
const message = require("../helpers/message");
const { findUserByEmail } = require("../models/User");

exports.createBlog = async (req, res) => {
  try {
    console.log(req.body);
    const { title, content } = req.body;
   
    if (!title || !content) {
      return message.sendErrorResponse(res, 400, "Please fill the required fields");
    }

    const slug = slugify(title, "-");
    const existingSlug = await Blog.findBlogBySlug(slug);

    if (existingSlug) {
      return message.sendErrorResponse(res, 400, "This slug is already in use");
    }

    await Blog.createBlog({ title, content, slug });
    return message.sendSuccessResponse(res, "Blog post created successfully", { blogData: { title, content, slug } });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }
    console.log(req.user.email);
    const user = await findUserByEmail(req.user.email);
    const userId = user._id;

    const result = await Like.likeBlog(userId, blogId);

    if (result === "already") {
      return message.sendErrorResponse(res, 400, "Blog already liked");
    } else if (result === "nonExistent") {
      return message.sendErrorResponse(res, 400, "Blog does not exist");
    }

    return message.sendCustomResponse(res, 201, { message: "Blog liked successfully" });
  } catch (error) {
    console.error("Error liking blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.removeLike = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const user = await findUserByEmail(req.user.email);
    const userId = user._id;

    const result = await Like.likeBlog(userId, blogId);

    if (result === "already") {
      await Like.removeLike(userId, blogId);
      return message.sendSuccessResponse(res, "Blog like removed successfully");
    } else {
      await Like.removeLike(userId, blogId);
      return message.sendErrorResponse(res, 400, "Blog not already liked");
    }
  } catch (error) {
    console.error("Error removing like from blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.dislikeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const user = await findUserByEmail(req.user.email);
    const userId = user._id;

    const result = await Dislike.dislikeBlog(userId, blogId);

    if (result === "already") {
      return message.sendErrorResponse(res, 400, "Blog already disliked");
    } else if (result === "nonExistent") {
      return message.sendErrorResponse(res, 400, "Blog does not exist");
    }

    return message.sendCustomResponse(res, 201, { message: "Blog disliked successfully" });
  } catch (error) {
    console.error("Error disliking blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};


exports.removeDislike = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const user = await findUserByEmail(req.user.email);
    const userId = user._id;

    const result = await Dislike.dislikeBlog(userId, blogId);

    if (result === "already") {
      await Dislike.removeDislike(userId, blogId);
      return message.sendSuccessResponse(res, "Blog dislike removed successfully");
    } else {
      await Dislike.removeDislike(userId, blogId);
      return message.sendErrorResponse(res, 400, "Blog not already disliked");
    }
  } catch (error) {
    console.error("Error removing dislike from blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.getLikeCounts = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const result = await Like.getLikeCounts(blogId);
    return message.sendCustomResponse(res, 200, { LikesCount: result });
  } catch (error) {
    console.error("Error getting number of likes from blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.getLikedBlogs = async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);
    const userId = user._id;

    const likedBlogs = await Like.getLikedBlogs(userId);
    return message.sendCustomResponse(res, 200, { likedBlogs: likedBlogs });
  } catch (error) {
    console.error("Error fetching liked blogs:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { title, content } = req.body;

    if (!ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    if (!title || !content) {
      return message.sendErrorResponse(res, 400, "Please fill the required fields");
    }

    const slug = slugify(title, "-");
    const blog = await Blog.findBlogById(blogId);

    if (!blog) {
      return message.sendErrorResponse(res, 404, "Blog post not found");
    }

    await Blog.updateBlog(blogId, { title, content, slug });
    return message.sendSuccessResponse(res, "Blog post updated successfully", { updatedBlogData: { title, content, slug } });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const deletedBlog = await Blog.deleteBlog(blogId);

    if (deletedBlog.deletedCount === 0) {
      return message.sendErrorResponse(res, 404, "Blog post not found");
    }

    return message.sendSuccessResponse(res, "Blog deleted successfully");
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.getAllBlogs();
    return message.sendCustomResponse(res, 200, { allBlogs: blogs });
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const blog = await Blog.findBlogById(blogId);

    if (!blog) {
      return message.sendErrorResponse(res, 404, "Blog post not found");
    }

    return message.sendSuccessResponse(res, "", { blog: blog });
  } catch (error) {
    console.error("Error fetching blog post by ID:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};
