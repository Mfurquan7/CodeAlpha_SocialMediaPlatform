import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Trash2, Send, CornerDownRight, MoreHorizontal } from 'lucide-react';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { timeAgo, formatCount } from '../utils/helpers';
import { postsApi, likesApi, commentsApi } from '../services/api';

export default function PostCard({ post, onPostDeleted }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Delete post modal/confirmation state
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = currentUser && currentUser.id === post.author.id;

  // Handle Like / Unlike
  const handleLikeToggle = async () => {
    if (!currentUser) {
      addToast('Please log in to like posts.', 'info');
      return;
    }
    if (isLikeLoading) return;

    // Optimistic update
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextLiked);
    setLikesCount(nextCount);
    setIsLikeLoading(true);

    try {
      if (nextLiked) {
        const res = await likesApi.like(post.id);
        setLikesCount(res.likes_count);
      } else {
        const res = await likesApi.unlike(post.id);
        setLikesCount(res.likes_count);
      }
    } catch (err) {
      // Revert optimistic update
      setIsLiked(!nextLiked);
      setLikesCount(likesCount);
      addToast('Failed to update like.', 'error');
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Toggle and load comments
  const toggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const data = await commentsApi.getByPost(post.id);
        setComments(data.comments || []);
      } catch (err) {
        addToast('Failed to load comments.', 'error');
      } finally {
        setIsLoadingComments(false);
      }
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('Please log in to comment.', 'info');
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const data = await commentsApi.add(post.id, commentText.trim());
      setComments((prev) => [...prev, data.comment]);
      setCommentsCount(data.comments_count);
      setCommentText('');
      addToast('Comment added!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to add comment.', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    try {
      const res = await commentsApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentsCount(res.comments_count);
      addToast('Comment deleted.', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to delete comment.', 'error');
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    setIsDeletingPost(true);
    try {
      await postsApi.delete(post.id);
      addToast('Post removed successfully.', 'info');
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete post.', 'error');
      setIsDeletingPost(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <article className="card post-card" style={{ marginBottom: 16, transition: 'all 0.2s ease' }}>
      {/* Post Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to={`/profile/${post.author.id}`}>
            <Avatar name={post.author.name} color={post.author.avatar_color} size="md" />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link
                to={`/profile/${post.author.id}`}
                style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 'var(--font-size-base)' }}
              >
                {post.author.name}
              </Link>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                @{post.author.username}
              </span>
            </div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>

        {/* Delete button (owner only) */}
        {isOwner && (
          <div style={{ position: 'relative' }}>
            {showDeleteConfirm ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--color-danger-bg)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #FECACA'
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--color-danger)', fontWeight: 600 }}>Delete?</span>
                <button
                  onClick={handleDeletePost}
                  disabled={isDeletingPost}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '2px 8px', fontSize: 11 }}
                >
                  {isDeletingPost ? '...' : 'Yes'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 8px', fontSize: 11 }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-ghost btn-icon-sm"
                title="Delete your post"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div
        style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-primary)',
          lineHeight: 1.6,
          marginBottom: 16,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {post.content}
      </div>

      {/* Action Bar (Like, Comment) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          paddingTop: 12,
          borderTop: '1px solid var(--color-border-subtle)'
        }}
      >
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          className="btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            color: isLiked ? 'var(--color-like)' : 'var(--color-text-secondary)',
            backgroundColor: isLiked ? 'var(--color-like-bg)' : 'transparent',
            transition: 'all 0.18s ease',
            fontWeight: isLiked ? 600 : 500
          }}
        >
          <Heart
            size={18}
            fill={isLiked ? 'var(--color-like)' : 'none'}
            color={isLiked ? 'var(--color-like)' : 'currentColor'}
          />
          <span style={{ fontSize: 'var(--font-size-sm)' }}>{formatCount(likesCount)}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={toggleComments}
          className="btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            color: showComments ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            backgroundColor: showComments ? 'var(--color-soft-lavender)' : 'transparent',
            transition: 'all 0.18s ease',
            fontWeight: showComments ? 600 : 500
          }}
        >
          <MessageSquare size={18} />
          <span style={{ fontSize: 'var(--font-size-sm)' }}>{formatCount(commentsCount)}</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--color-border)',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Add Comment Input */}
          {currentUser ? (
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <Avatar name={currentUser.name} color={currentUser.avatar_color} size="sm" />
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={500}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-sm)',
                    background: 'var(--color-bg-main)'
                  }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmittingComment || !commentText.trim()}
                  style={{ borderRadius: 'var(--radius-full)', padding: '0 14px' }}
                >
                  {isSubmittingComment ? (
                    <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--color-bg-main)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                marginBottom: 16,
                textAlign: 'center'
              }}
            >
              <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link> to share a comment.
            </div>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <div className="spinner" />
            </div>
          ) : comments.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', padding: '12px 0' }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.map((comment) => {
                const isCommentOwner = currentUser && currentUser.id === comment.author.id;
                return (
                  <div
                    key={comment.id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-bg-main)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <Link to={`/profile/${comment.author.id}`}>
                      <Avatar name={comment.author.name} color={comment.author.avatar_color} size="xs" />
                    </Link>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Link
                            to={`/profile/${comment.author.id}`}
                            style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 'var(--font-size-xs)' }}
                          >
                            {comment.author.name}
                          </Link>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            @{comment.author.username} · {timeAgo(comment.created_at)}
                          </span>
                        </div>
                        {isCommentOwner && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{ color: 'var(--color-text-muted)', padding: 2 }}
                            title="Delete comment"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', marginTop: 4, wordBreak: 'break-word' }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
