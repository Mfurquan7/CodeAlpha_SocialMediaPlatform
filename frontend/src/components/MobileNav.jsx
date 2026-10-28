import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileNav({ onOpenCreateModal }) {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/"
        end
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
          fontSize: 10,
          fontWeight: isActive ? 700 : 500
        })}
      >
        <Home size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
          fontSize: 10,
          fontWeight: isActive ? 700 : 500
        })}
      >
        <Compass size={22} />
        <span>Explore</span>
      </NavLink>

      {isAuthenticated && (
        <button
          onClick={onOpenCreateModal}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(108, 76, 241, 0.4)',
            marginTop: -16
          }}
          title="Create Post"
        >
          <Plus size={24} />
        </button>
      )}

      {isAuthenticated ? (
        <NavLink
          to={`/profile/${currentUser.id}`}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontSize: 10,
            fontWeight: isActive ? 700 : 500
          })}
        >
          <User size={22} />
          <span>Profile</span>
        </NavLink>
      ) : (
        <NavLink
          to="/login"
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontSize: 10,
            fontWeight: isActive ? 700 : 500
          })}
        >
          <LogIn size={22} />
          <span>Login</span>
        </NavLink>
      )}
    </nav>
  );
}
