const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// List and search users
router.get('/', optionalAuth, userController.getUsers);

// Update current user profile
router.put('/me', requireAuth, userController.updateCurrentUser);

// Single user profile
router.get('/:id', optionalAuth, userController.getUserProfile);

// User posts
router.get('/:id/posts', optionalAuth, userController.getUserPosts);

// User followers & following
router.get('/:id/followers', optionalAuth, userController.getUserFollowers);
router.get('/:id/following', optionalAuth, userController.getUserFollowing);

// Follow / Unfollow
router.post('/:id/follow', requireAuth, userController.followUser);
router.delete('/:id/follow', requireAuth, userController.unfollowUser);

module.exports = router;
