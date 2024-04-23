const mongoose = require('mongoose');

// Define the schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    required: true
  }
});

// Create a model from the schema
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
