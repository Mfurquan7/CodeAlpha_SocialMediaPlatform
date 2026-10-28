import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserCheck } from 'lucide-react';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersApi } from '../services/api';

export default function UserCard({ user, onFollowChange, compact = false }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [isFollowing, setIsFollowing] = useState(user.is_following || false);
  const [loading, setLoading] = useState(false);

  const isMe = currentUser && currentUser.id === user.id;

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      addToast('Please log in to follow users.', 'info');
      return;
    }
    if (loading || isMe) return;

    setLoading(true);
    const nextState = !isFollowing;
    setIsFollowing(nextState);

    try {
      if (nextState) {
        await usersApi.follow(user.id);
        addToast(`Following @${user.username}`, 'success');
      } else {
        await usersApi.unfollow(user.id);
        addToast(`Unfollowed @${user.username}`, 'info');
      }
      if (onFollowChange) {
        onFollowChange(user.id, nextState);
      }
    } catch (err) {
      setIsFollowing(!nextState); // revert
      addToast(err.message || 'Follow action failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: compact ? '12px 14px' : '16px 18px',
        marginBottom: compact ? 8 : 12,
        borderRadius: varRadius(compact)
      }}
    >
      <Link
        to={`/profile/${user.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flex: 1,
          overflow: 'hidden'
        }}
      >
        <Avatar name={user.name} color={user.avatar_color} size={compact ? 'sm' : 'md'} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                fontSize: compact ? 'var(--font-size-sm)' : 'var(--font-size-base)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user.name}
            </span>
          </div>
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            @{user.username}
          </p>

          {!compact && user.bio && (
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                marginTop: 4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {user.bio}
            </p>
          )}
        </div>
      </Link>

      {/* Follow Button */}
      {isMe ? (
        <span className="badge badge-secondary" style={{ fontSize: 11 }}>You</span>
      ) : (
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          className={`btn btn-sm ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
          style={{ minWidth: 84, padding: '5px 12px' }}
        >
          {loading ? (
            <div className="spinner spinner-sm" style={{ borderTopColor: isFollowing ? 'var(--color-primary)' : '#fff' }} />
          ) : isFollowing ? (
            <>
              <UserCheck size={13} />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus size={13} />
              <span>Follow</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

function varRadius(compact) {
  return compact ? 'var(--radius-md)' : 'var(--radius-lg)';
}
