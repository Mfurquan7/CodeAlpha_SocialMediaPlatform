import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, User, PlusCircle, LogOut, LogIn, Sparkles } from 'lucide-react';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';

export default function SidebarLeft({ onOpenCreateModal }) {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar-left">
      <div>
        {/* Brand Header */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            padding: '8px 12px',
            marginBottom: 28,
            userSelect: 'none'
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(108, 76, 241, 0.35)'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>
              Vibely
            </h2>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 16px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-base)',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'var(--color-soft-lavender)' : 'transparent',
              transition: 'all var(--transition-fast)'
            })}
          >
            <Home size={20} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/explore"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 16px',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-base)',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'var(--color-soft-lavender)' : 'transparent',
              transition: 'all var(--transition-fast)'
            })}
          >
            <Compass size={20} />
            <span>Explore</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to={`/profile/${currentUser.id}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--font-size-base)',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'var(--color-soft-lavender)' : 'transparent',
                transition: 'all var(--transition-fast)'
              })}
            >
              <User size={20} />
              <span>My Profile</span>
            </NavLink>
          )}

          {/* Prominent Create Post Button */}
          {isAuthenticated && (
            <button
              onClick={onOpenCreateModal}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: 18,
                padding: '13px 20px',
                fontSize: 'var(--font-size-base)',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <PlusCircle size={19} />
              <span>Create Post</span>
            </button>
          )}
        </nav>
      </div>

      {/* User Footer / Auth Area */}
      <div style={{ paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
        {isAuthenticated ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-bg-main)'
            }}
          >
            <div
              onClick={() => navigate(`/profile/${currentUser.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', overflow: 'hidden' }}
            >
              <Avatar name={currentUser.name} color={currentUser.avatar_color} size="sm" />
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.name}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  @{currentUser.username}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-ghost btn-icon-sm"
              title="Log out"
              style={{ color: 'var(--color-danger)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <NavLink to="/login" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              <LogIn size={15} />
              <span>Log In</span>
            </NavLink>
            <NavLink to="/register" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
              <span>Sign Up</span>
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
