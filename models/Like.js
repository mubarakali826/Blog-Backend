  const mongoose = require('mongoose');

  // Define the Like schema
  const likeSchema = new mongoose.Schema({
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
  const Like = mongoose.model('Like', likeSchema);

  module.exports = Like;
