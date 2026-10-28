import React, { useState } from 'react';
import { Bell, Sparkles, X } from 'lucide-react';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function TopHeader({ title = 'Home' }) {
  const { currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Notifications Indicator */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-ghost btn-icon-sm"
            style={{
              position: 'relative',
              color: showNotifications ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: showNotifications ? 'var(--color-soft-lavender)' : 'transparent'
            }}
            title="Notifications"
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                backgroundColor: 'var(--color-primary)',
                borderRadius: '50%',
                boxShadow: '0 0 0 2px #FFFFFF'
              }}
            />
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 42,
                right: 0,
                width: 290,
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-dropdown)',
                border: '1px solid var(--color-border)',
                padding: '16px',
                zIndex: 100,
                animation: 'slideUp 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>Notifications</span>
                <button onClick={() => setShowNotifications(false)} style={{ color: 'var(--color-text-muted)' }}>
                  <X size={15} />
                </button>
              </div>
              <div style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                <Sparkles size={24} color="var(--color-primary)" style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>All caught up!</p>
                <p style={{ fontSize: 11 }}>No new notifications at the moment.</p>
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar on Mobile/Tablet */}
        {currentUser && (
          <Link to={`/profile/${currentUser.id}`}>
            <Avatar name={currentUser.name} color={currentUser.avatar_color} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
}
