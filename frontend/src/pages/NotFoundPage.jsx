import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 24
      }}
    >
      <div
        style={{
          fontSize: 84,
          fontWeight: 900,
          color: 'var(--color-primary)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: 8
        }}
      >
        404
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--color-text-primary)' }}>
        Lost in the Feed?
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: 400, marginBottom: 24 }}>
        The page you are looking for does not exist or has been moved to another coordinate.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} />
          <span>Go to Home Feed</span>
        </Link>
        <Link to="/explore" className="btn btn-outline">
          <Compass size={16} />
          <span>Explore Creators</span>
        </Link>
      </div>
    </div>
  );
}
