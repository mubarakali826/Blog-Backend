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

router.post('/',verifyToken, createBlog);
router.post('/like/:id',verifyToken, likeBlog);
router.post('/dislike/:id',verifyToken, dislikeBlog);
router.delete('/like/:id',verifyToken, removeLike);
router.delete('/dislike/:id',verifyToken, removeDislike);
router.get('/like',verifyToken, getLikedBlogs);
router.get('/countlikes/:id',verifyToken, getLikeCounts);
router.put('/:id',verifyToken, updateBlog);
router.delete('/:id',verifyToken, deleteBlog);
router.get('/:id', getBlogById);
router.get('/', getAllBlogs);

// Invalid endpoint handler
router.use((req, res) => {
  message.sendErrorResponse(res, 400, 'Invalid Endpoint');
});

module.exports = router;
