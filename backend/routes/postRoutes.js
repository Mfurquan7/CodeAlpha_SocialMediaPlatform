const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const likeController = require('../controllers/likeController');
const commentController = require('../controllers/commentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// Posts Feed and CRUD
router.get('/', optionalAuth, postController.getAllPosts);
router.post('/', requireAuth, postController.createPost);
router.get('/:id', optionalAuth, postController.getPostById);
router.delete('/:id', requireAuth, postController.deletePost);

// Likes
router.post('/:id/like', requireAuth, likeController.likePost);
router.delete('/:id/like', requireAuth, likeController.unlikePost);

// Comments for a specific post
router.get('/:id/comments', commentController.getPostComments);
router.post('/:id/comments', requireAuth, commentController.addComment);

module.exports = router;
