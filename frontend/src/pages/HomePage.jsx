import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquareDashed, RefreshCw } from 'lucide-react';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import { postsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPosts = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    setError('');

    try {
      const data = await postsApi.getAll();
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || 'Failed to load posts feed.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <div>
      {/* Top Composer or Guest Banner */}
      {isAuthenticated ? (
        <PostComposer onPostCreated={handlePostCreated} />
      ) : (
        <div
          className="card"
          style={{
            marginBottom: 20,
            background: 'linear-gradient(135deg, #FFFFFF 0%, var(--color-soft-lavender) 100%)',
            border: '1.5px solid #DDD8F5',
            padding: '24px 20px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(108, 76, 241, 0.3)'
            }}
          >
            <Sparkles size={22} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            Join the Conversation on Vibely
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', maxWidth: 420, margin: '0 auto 16px' }}>
            Share your thoughts, connect with creators, and follow modern design and tech discussions.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-sm">
              Create an Account
            </Link>
            <Link to="/login" className="btn btn-outline btn-sm">
              Log In
            </Link>
          </div>
        </div>
      )}

      {/* Feed Controls Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Latest Vibes
        </span>
        <button
          onClick={() => fetchPosts(true)}
          className="btn-ghost btn-sm"
          style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)' }}
          title="Refresh feed"
        >
          <RefreshCw size={13} className={isRefreshing ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner spinner-lg" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Tuning into the vibe...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--color-danger)' }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>{error}</p>
          <button onClick={() => fetchPosts()} className="btn btn-primary btn-sm">
            Try Again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <MessageSquareDashed size={32} />
          </div>
          <h4 className="empty-state-title">No vibes published yet</h4>
          <p className="empty-state-text">
            Be the first person to share a post and start the conversation!
          </p>
        </div>
      ) : (
        /* Post Feed */
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
