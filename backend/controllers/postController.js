const { db } = require('../database');

/**
 * Get feed posts with like count, comment count, and whether current user liked it
 */
function getAllPosts(req, res) {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

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
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const posts = db.prepare(query).all(currentUserId, currentUserId, limit, offset);

    // Format output
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
    console.error('Error fetching posts:', err);
    return res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
}

/**
 * Get single post by ID
 */
function getPostById(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID.' });
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
      WHERE p.id = ?
    `;

    const post = db.prepare(query).get(currentUserId, currentUserId, postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    return res.json({
      post: {
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
      }
    });
  } catch (err) {
    console.error('Error fetching post:', err);
    return res.status(500).json({ error: 'Failed to retrieve post.' });
  }
}

/**
 * Create a new post
 */
function createPost(req, res) {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content cannot be empty.' });
    }

    const trimmed = content.trim();
    if (trimmed.length > 1000) {
      return res.status(400).json({ error: 'Post content cannot exceed 1000 characters.' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO posts (user_id, content)
      VALUES (?, ?)
    `);

    const result = insertStmt.run(req.user.id, trimmed);
    const newId = Number(result.lastInsertRowid);

    const newPost = {
      id: newId,
      content: trimmed,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      author: {
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        avatar_color: req.user.avatar_color
      }
    };

    return res.status(201).json({
      message: 'Post created successfully!',
      post: newPost
    });
  } catch (err) {
    console.error('Error creating post:', err);
    return res.status(500).json({ error: 'Failed to create post.' });
  }
}

/**
 * Delete a post (only allowed for post owner)
 */
function deletePost(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID.' });
    }

    const post = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Ownership check
    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this post.' });
    }

    // Delete post
    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);

    return res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting post:', err);
    return res.status(500).json({ error: 'Failed to delete post.' });
  }
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  deletePost
};
