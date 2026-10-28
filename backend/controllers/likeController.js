const { db } = require('../database');

/**
 * Like a post
 */
function likePost(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID.' });
    }

    // Verify post exists
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Check if already liked
    const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?').get(req.user.id, postId);
    if (existing) {
      // Get current count
      const countRow = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId);
      return res.status(200).json({
        message: 'Post is already liked.',
        liked: true,
        likes_count: Number(countRow.count)
      });
    }

    // Insert like
    db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(req.user.id, postId);

    // Get updated count
    const countRow = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId);

    return res.status(201).json({
      message: 'Post liked successfully!',
      liked: true,
      likes_count: Number(countRow.count)
    });
  } catch (err) {
    console.error('Error liking post:', err);
    return res.status(500).json({ error: 'Failed to like post.' });
  }
}

/**
 * Unlike a post
 */
function unlikePost(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID.' });
    }

    // Verify post exists
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Delete like
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(req.user.id, postId);

    // Get updated count
    const countRow = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId);

    return res.json({
      message: 'Post unliked successfully.',
      liked: false,
      likes_count: Number(countRow.count)
    });
  } catch (err) {
    console.error('Error unliking post:', err);
    return res.status(500).json({ error: 'Failed to unlike post.' });
  }
}

module.exports = {
  likePost,
  unlikePost
};
