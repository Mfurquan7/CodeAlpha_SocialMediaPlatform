import React from 'react';
import { getInitials } from '../utils/helpers';

export default function Avatar({ name, color = 'var(--color-primary)', size = 'md', className = '' }) {
  const initials = getInitials(name);
  const sizeClass = `avatar-${size}`;

  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      style={{
        backgroundColor: color || '#6C4CF1',
        boxShadow: '0 2px 8px rgba(25, 22, 43, 0.08)'
      }}
      title={name}
    >
      {initials}
    </div>
  );
}
