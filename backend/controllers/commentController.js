const { db } = require('../database');

/**
 * Get comments for a post
 */
function getPostComments(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID.' });
    }

    const query = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.user_id,
        u.name AS user_name,
        u.username AS user_username,
        u.avatar_color AS user_avatar_color
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `;

    const comments = db.prepare(query).all(postId);

    const formatted = comments.map(c => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      author: {
        id: c.user_id,
        name: c.user_name,
        username: c.user_username,
        avatar_color: c.user_avatar_color
      }
    }));

    return res.json({ comments: formatted });
  } catch (err) {
    console.error('Error fetching comments:', err);
    return res.status(500).json({ error: 'Failed to retrieve comments.' });
  }
}

/**
 * Add a comment to a post
 */
function addComment(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID.' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const trimmed = content.trim();
    if (trimmed.length > 500) {
      return res.status(400).json({ error: 'Comment cannot exceed 500 characters.' });
    }

    // Verify post exists
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO comments (user_id, post_id, content)
      VALUES (?, ?, ?)
    `);

    const result = insertStmt.run(req.user.id, postId, trimmed);
    const commentId = Number(result.lastInsertRowid);

    const newComment = {
      id: commentId,
      content: trimmed,
      created_at: new Date().toISOString(),
      author: {
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        avatar_color: req.user.avatar_color
      }
    };

    // Also get updated comment count for this post
    const countRow = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(postId);

    return res.status(201).json({
      message: 'Comment added successfully!',
      comment: newComment,
      comments_count: Number(countRow.count)
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    return res.status(500).json({ error: 'Failed to add comment.' });
  }
}

/**
 * Delete a comment (only owner can delete)
 */
function deleteComment(req, res) {
  try {
    const commentId = parseInt(req.params.id, 10);
    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID.' });
    }

    const comment = db.prepare('SELECT id, user_id, post_id FROM comments WHERE id = ?').get(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this comment.' });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

    // Return updated comments count for the post
    const countRow = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(comment.post_id);

    return res.json({
      message: 'Comment deleted successfully.',
      post_id: comment.post_id,
      comments_count: Number(countRow.count)
    });
  } catch (err) {
    console.error('Error deleting comment:', err);
    return res.status(500).json({ error: 'Failed to delete comment.' });
  }
}

module.exports = {
  getPostComments,
  addComment,
  deleteComment
};
