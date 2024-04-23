const express = require('express');
const router = express.Router();
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
} = require('../controllers/blogController');
const { verifyToken } = require('../utils/token');
const message = require('../helpers/message');

// Middleware to verify token for specific routes
router.use('/like/:id', verifyToken);
router.use('/dislike', verifyToken);
router.use('/like', verifyToken);
router.use('/dislike', verifyToken);
router.use('/countlikes', verifyToken);
router.use('/:id', verifyToken);

// Routes
router.post('/', verifyToken, createBlog);
router.post('/like/:id', likeBlog);
router.post('/dislike/:id', dislikeBlog);
router.delete('/like/:id', removeLike);
router.delete('/dislike/:id', removeDislike);
router.get('/like', getLikedBlogs);
router.get('/countlikes/:id', getLikeCounts);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);
router.get('/:id', getBlogById);
router.get('/', getAllBlogs);

// Invalid endpoint handler
router.use((req, res) => {
  message.sendErrorResponse(res, 400, 'Invalid Endpoint');
});

module.exports = router;
