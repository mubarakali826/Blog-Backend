const mongoose = require('mongoose');

// Define the Dislike schema
const dislikeSchema = new mongoose.Schema({
  blogID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog', 
    required: true
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  }
});

// Create a model from the schema
const Dislike = mongoose.model('Dislike', dislikeSchema);

module.exports = Dislike;
