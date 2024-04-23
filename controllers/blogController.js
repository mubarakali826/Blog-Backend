const Blog = require("../models/Blog");
const Like = require("../models/Like");
const Dislike = require("../models/Dislike");
const slugify = require("slugify");
const message = require("../helpers/message");
const User = require("../models/User");
const mongoose = require('mongoose');

exports.createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
   
    if (!title || !content) {
      return message.sendErrorResponse(res, 400, "Please fill the required fields");
    }

    const slug = slugify(title, "-");
    const existingSlug = await Blog.findOne({ slug });

    if (existingSlug) {
      return message.sendErrorResponse(res, 400, "This slug is already in use");
    }

    const newBlog = new Blog({ title, content, slug });
    await newBlog.save();

    return message.sendSuccessResponse(res, "Blog post created successfully", { blogData: newBlog });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const user = await User.findOne({ email: req.user.email });
    const userId = user._id;

    const existingLike = await Like.findOne({ userID: userId, blogID: blogId });

    if (existingLike) {
      return message.sendErrorResponse(res, 400, "Blog already liked");
    }

    const newLike = new Like({ userID: userId, blogID: blogId });
    await newLike.save();

    return message.sendCustomResponse(res, 201, { message: "Blog liked successfully" });
  } catch (error) {
    console.error("Error liking blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.removeLike = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const user = await User.findOne({ email: req.user.email });
    const userId = user._id;

    const existingLike = await Like.findOne({ userID: userId, blogID: blogId });

    if (!existingLike) {
      return message.sendErrorResponse(res, 400, "Blog not already liked");
    }

    await Like.deleteOne({ userID: userId, blogID: blogId });
    
    return message.sendSuccessResponse(res, "Blog like removed successfully");
  } catch (error) {
    console.error("Error removing like from blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.dislikeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const user = await User.findOne({ email: req.user.email });
    const userId = user._id;

    const existingDislike = await Dislike.findOne({ userID: userId, blogID: blogId });

    if (existingDislike) {
      return message.sendErrorResponse(res, 400, "Blog already disliked");
    }

    const newDislike = new Dislike({ userID: userId, blogID: blogId });
    await newDislike.save();

    return message.sendCustomResponse(res, 201, { message: "Blog disliked successfully" });
  } catch (error) {
    console.error("Error disliking blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.removeDislike = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const user = await User.findOne({ email: req.user.email });
    const userId = user._id;

    const existingDislike = await Dislike.findOne({ userID: userId, blogID: blogId });

    if (!existingDislike) {
      return message.sendErrorResponse(res, 400, "Blog not already disliked");
    }

    await Dislike.deleteOne({ userID: userId, blogID: blogId });
    
    return message.sendSuccessResponse(res, "Blog dislike removed successfully");
  } catch (error) {
    console.error("Error removing dislike from blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.getLikeCounts = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const likeCount = await Like.countDocuments({ blogID: blogId });
    
    return message.sendCustomResponse(res, 200, { likeCount });
  } catch (error) {
    console.error("Error getting number of likes from blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.getLikedBlogs = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const userId = user._id;

    const likedBlogs = await Like.find({ userID: userId }).select("blogId").populate('blogID');
    return message.sendCustomResponse(res, 200, { likedBlogs });
  } catch (error) {
    console.error("Error fetching liked blogs:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    if (!title || !content) {
      return message.sendErrorResponse(res, 400, "Please fill the required fields");
    }

    const slug = slugify(title, "-");
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, { title, content, slug }, { new: true });

    if (!updatedBlog) {
      return message.sendErrorResponse(res, 404, "Blog post not found");
    }

    return message.sendSuccessResponse(res, "Blog post updated successfully", { updatedBlogData: updatedBlog });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
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
    const blogs = await Blog.find();
    return message.sendCustomResponse(res, 200, { allBlogs: blogs });
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return message.sendErrorResponse(res, 400, "Invalid blogID");
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return message.sendErrorResponse(res, 404, "Blog post not found");
    }

    return message.sendSuccessResponse(res, "", { blog });
  } catch (error) {
    console.error("Error fetching blog post by ID:", error);
    return message.sendErrorResponse(res, 500, "Internal Server Error");
  }
};
