const { db } = require('../database');

/**
 * Get/search users list (for Explore and suggestions)
 */
function getUsers(req, res) {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const search = req.query.q ? req.query.q.trim().toLowerCase() : '';
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const suggested = req.query.suggested === 'true';

    let query;
    let params = [];

    if (suggested && currentUserId) {
      // Find users not currently followed by current user, excluding current user
      query = `
        SELECT 
          u.id, u.name, u.username, u.bio, u.avatar_color, u.created_at,
          (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
          (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
          0 AS is_following
        FROM users u
        WHERE u.id != ?
          AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
        ORDER BY followers_count DESC, u.created_at DESC
        LIMIT ?
      `;
      params = [currentUserId, currentUserId, limit];
    } else if (search) {
      query = `
        SELECT 
          u.id, u.name, u.username, u.bio, u.avatar_color, u.created_at,
          (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
          (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
          CASE 
            WHEN ? IS NOT NULL AND EXISTS (
              SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
            ) THEN 1 
            ELSE 0 
          END AS is_following
        FROM users u
        WHERE LOWER(u.name) LIKE ? OR LOWER(u.username) LIKE ?
        ORDER BY followers_count DESC
        LIMIT ?
      `;
      params = [currentUserId, currentUserId, `%${search}%`, `%${search}%`, limit];
    } else {
      query = `
        SELECT 
          u.id, u.name, u.username, u.bio, u.avatar_color, u.created_at,
          (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
          (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
          CASE 
            WHEN ? IS NOT NULL AND EXISTS (
              SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
            ) THEN 1 
            ELSE 0 
          END AS is_following
        FROM users u
        WHERE ? IS NULL OR u.id != ?
        ORDER BY followers_count DESC, u.created_at DESC
        LIMIT ?
      `;
      params = [currentUserId, currentUserId, currentUserId, currentUserId, limit];
    }

    const users = db.prepare(query).all(...params);

    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      bio: u.bio || '',
      avatar_color: u.avatar_color,
      created_at: u.created_at,
      posts_count: Number(u.posts_count),
      followers_count: Number(u.followers_count),
      is_following: Boolean(u.is_following)
    }));

    return res.json({ users: formatted });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
}

/**
 * Get single user profile by ID or username
 */
function getUserProfile(req, res) {
  try {
    const identifier = req.params.id;
    const currentUserId = req.user ? req.user.id : null;

    let user;
    if (/^\d+$/.test(identifier)) {
      user = db.prepare(`
        SELECT id, name, username, bio, avatar_color, created_at
        FROM users
        WHERE id = ?
      `).get(parseInt(identifier, 10));
    } else {
      user = db.prepare(`
        SELECT id, name, username, bio, avatar_color, created_at
        FROM users
        WHERE LOWER(username) = LOWER(?)
      `).get(identifier);
    }

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Counts
    const postsCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(user.id).count;
    const followersCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(user.id).count;
    const followingCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(user.id).count;

    // Follow status
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const followRow = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(currentUserId, user.id);
      isFollowing = Boolean(followRow);
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio || '',
        avatar_color: user.avatar_color,
        created_at: user.created_at,
        stats: {
          posts_count: Number(postsCount),
          followers_count: Number(followersCount),
          following_count: Number(followingCount)
        },
        is_following: isFollowing,
        is_me: currentUserId === user.id
      }
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
}

/**
 * Update authenticated user's profile
 */
function updateCurrentUser(req, res) {
  try {
    let { name, bio } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }

    name = name.trim();
    bio = bio ? bio.trim() : '';

    if (bio.length > 250) {
      return res.status(400).json({ error: 'Bio cannot exceed 250 characters.' });
    }

    db.prepare(`
      UPDATE users
      SET name = ?, bio = ?
      WHERE id = ?
    `).run(name, bio, req.user.id);

    const updatedUser = db.prepare(`
      SELECT id, name, username, email, bio, avatar_color, created_at
      FROM users
      WHERE id = ?
    `).get(req.user.id);

    return res.json({
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
}

/**
 * Get posts authored by a specific user
 */
function getUserPosts(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    const currentUserId = req.user ? req.user.id : null;

    const query = `
      SELECT 
        p.id,
        p.content,
        p.created_at,
        p.user_id,
        u.name AS user_name,
        u.username AS user_username,
        u.avatar_color AS user_avatar_color,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
        CASE 
          WHEN ? IS NOT NULL AND EXISTS (
            SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?
          ) THEN 1 
          ELSE 0 
        END AS is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `;

    const posts = db.prepare(query).all(currentUserId, currentUserId, userId);

    const formatted = posts.map(post => ({
      id: post.id,
      content: post.content,
      created_at: post.created_at,
      likes_count: Number(post.likes_count),
      comments_count: Number(post.comments_count),
      is_liked: Boolean(post.is_liked),
      author: {
        id: post.user_id,
        name: post.user_name,
        username: post.user_username,
        avatar_color: post.user_avatar_color
      }
    }));

    return res.json({ posts: formatted });
  } catch (err) {
    console.error('Error fetching user posts:', err);
    return res.status(500).json({ error: 'Failed to retrieve posts for user.' });
  }
}

/**
 * Follow a user
 */
function followUser(req, res) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) {
      return res.status(400).json({ error: 'Invalid target user ID.' });
    }

    if (req.user.id === targetId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    // Verify target user exists
    const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if already following
    const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, targetId);
    if (existing) {
      const countRow = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(targetId);
      return res.status(200).json({
        message: 'Already following this user.',
        following: true,
        followers_count: Number(countRow.count)
      });
    }

    // Insert follow
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.user.id, targetId);

    const countRow = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(targetId);

    return res.status(201).json({
      message: 'User followed successfully!',
      following: true,
      followers_count: Number(countRow.count)
    });
  } catch (err) {
    console.error('Error following user:', err);
    return res.status(500).json({ error: 'Failed to follow user.' });
  }
}

/**
 * Unfollow a user
 */
function unfollowUser(req, res) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) {
      return res.status(400).json({ error: 'Invalid target user ID.' });
    }

    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user.id, targetId);

    const countRow = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(targetId);

    return res.json({
      message: 'Unfollowed user successfully.',
      following: false,
      followers_count: Number(countRow.count)
    });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    return res.status(500).json({ error: 'Failed to unfollow user.' });
  }
}

/**
 * Get followers list for a user
 */
function getUserFollowers(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    const currentUserId = req.user ? req.user.id : null;

    const query = `
      SELECT 
        u.id, u.name, u.username, u.bio, u.avatar_color,
        CASE 
          WHEN ? IS NOT NULL AND EXISTS (
            SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
          ) THEN 1 
          ELSE 0 
        END AS is_following
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `;

    const followers = db.prepare(query).all(currentUserId, currentUserId, userId);

    return res.json({
      followers: followers.map(f => ({
        id: f.id,
        name: f.name,
        username: f.username,
        bio: f.bio || '',
        avatar_color: f.avatar_color,
        is_following: Boolean(f.is_following)
      }))
    });
  } catch (err) {
    console.error('Error fetching followers:', err);
    return res.status(500).json({ error: 'Failed to retrieve followers.' });
  }
}

/**
 * Get following list for a user
 */
function getUserFollowing(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    const currentUserId = req.user ? req.user.id : null;

    const query = `
      SELECT 
        u.id, u.name, u.username, u.bio, u.avatar_color,
        CASE 
          WHEN ? IS NOT NULL AND EXISTS (
            SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
          ) THEN 1 
          ELSE 0 
        END AS is_following
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `;

    const following = db.prepare(query).all(currentUserId, currentUserId, userId);

    return res.json({
      following: following.map(f => ({
        id: f.id,
        name: f.name,
        username: f.username,
        bio: f.bio || '',
        avatar_color: f.avatar_color,
        is_following: Boolean(f.is_following)
      }))
    });
  } catch (err) {
    console.error('Error fetching following:', err);
    return res.status(500).json({ error: 'Failed to retrieve following list.' });
  }
}

module.exports = {
  getUsers,
  getUserProfile,
  updateCurrentUser,
  getUserPosts,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing
};
