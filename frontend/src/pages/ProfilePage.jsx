import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Edit3, UserPlus, UserCheck, MessageSquare, ArrowLeft } from 'lucide-react';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import EditProfileModal from '../components/EditProfileModal';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCount } from '../utils/helpers';

export default function ProfilePage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if viewing own profile
  const isMe = currentUser && profileUser && currentUser.id === profileUser.id;

  const loadProfileData = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch user profile
      const userRes = await usersApi.getProfile(id);
      const user = userRes.user;
      setProfileUser(user);
      setIsFollowing(user.is_following);
      setFollowersCount(user.stats?.followers_count || 0);

      // 2. Fetch user's posts
      const postsRes = await usersApi.getUserPosts(user.id);
      setPosts(postsRes.posts || []);
    } catch (err) {
      setError(err.message || 'Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      addToast('Please log in to follow creators.', 'info');
      return;
    }
    if (followLoading || isMe) return;

    setFollowLoading(true);
    const nextFollowing = !isFollowing;
    const nextCount = nextFollowing ? followersCount + 1 : Math.max(0, followersCount - 1);

    setIsFollowing(nextFollowing);
    setFollowersCount(nextCount);

    try {
      if (nextFollowing) {
        await usersApi.follow(profileUser.id);
        addToast(`You are now following ${profileUser.name}`, 'success');
      } else {
        await usersApi.unfollow(profileUser.id);
        addToast(`Unfollowed ${profileUser.name}`, 'info');
      }
    } catch (err) {
      setIsFollowing(!nextFollowing);
      setFollowersCount(followersCount);
      addToast(err.message || 'Follow action failed.', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setProfileUser((prev) =>
      prev
        ? {
            ...prev,
            stats: {
              ...prev.stats,
              posts_count: Math.max(0, (prev.stats?.posts_count || 1) - 1)
            }
          }
        : prev
    );
  };

  const handleProfileUpdated = (updatedUser) => {
    setProfileUser((prev) => ({
      ...prev,
      name: updatedUser.name,
      bio: updatedUser.bio
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div className="spinner spinner-lg" style={{ marginBottom: 16 }} />
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Loading profile...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h3 style={{ marginBottom: 8, color: 'var(--color-danger)' }}>Profile Not Found</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 18 }}>
          {error || "The requested user account doesn't exist."}
        </p>
        <Link to="/" className="btn btn-primary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Home Feed</span>
        </Link>
      </div>
    );
  }

  const joinDate = new Date(profileUser.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div>
      {/* Profile Header Card */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        {/* Banner with Midnight Violet gradient */}
        <div
          style={{
            height: 120,
            background: 'linear-gradient(135deg, #6C4CF1 0%, #5635D8 50%, #4324B8 100%)',
            position: 'relative'
          }}
        />

        {/* Profile Info Container */}
        <div style={{ padding: '0 24px 24px 24px', position: 'relative' }}>
          {/* Avatar floating above banner edge */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: -44,
              marginBottom: 16
            }}
          >
            <div
              style={{
                borderRadius: '50%',
                border: '4px solid #FFFFFF',
                boxShadow: '0 4px 14px rgba(25, 22, 43, 0.12)'
              }}
            >
              <Avatar
                name={profileUser.name}
                color={profileUser.avatar_color}
                size="xl"
              />
            </div>

            {/* Action Button: Edit or Follow */}
            <div>
              {isMe ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-outline btn-sm"
                  style={{ gap: 6 }}
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`btn btn-sm ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                  style={{ minWidth: 100 }}
                >
                  {followLoading ? (
                    <div className="spinner spinner-sm" style={{ borderTopColor: isFollowing ? 'var(--color-primary)' : '#fff' }} />
                  ) : isFollowing ? (
                    <>
                      <UserCheck size={14} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* User Names */}
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {profileUser.name}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 12 }}>
            @{profileUser.username}
          </p>

          {/* Bio */}
          {profileUser.bio ? (
            <p style={{ fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: 16 }}>
              {profileUser.bio}
            </p>
          ) : isMe ? (
            <p
              onClick={() => setIsEditModalOpen(true)}
              style={{
                fontSize: 13,
                color: 'var(--color-primary)',
                cursor: 'pointer',
                marginBottom: 16,
                fontStyle: 'italic'
              }}
            >
              + Add a bio to tell others about yourself...
            </p>
          ) : null}

          {/* Meta Info: Join Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 18 }}>
            <Calendar size={14} />
            <span>Joined {joinDate}</span>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--color-border)'
            }}
          >
            <div>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text-primary)', marginRight: 5 }}>
                {formatCount(profileUser.stats?.posts_count || posts.length)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Posts</span>
            </div>

            <div>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text-primary)', marginRight: 5 }}>
                {formatCount(followersCount)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Followers</span>
            </div>

            <div>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-text-primary)', marginRight: 5 }}>
                {formatCount(profileUser.stats?.following_count || 0)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts Feed Header */}
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {isMe ? 'Your Vibes' : `${profileUser.name}'s Vibes`}
        </h3>
      </div>

      {/* User's Posts Feed */}
      {posts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <MessageSquare size={32} />
          </div>
          <h4 className="empty-state-title">No vibes shared yet</h4>
          <p className="empty-state-text">
            {isMe
              ? 'You have not published any posts yet. Start sharing your vibe!'
              : `@${profileUser.username} hasn't posted anything yet.`}
          </p>
        </div>
      ) : (
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
}
