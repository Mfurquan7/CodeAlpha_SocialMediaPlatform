import React from 'react';
import { X } from 'lucide-react';
import PostComposer from './PostComposer';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  if (!isOpen) return null;

  const handleCreated = (newPost) => {
    if (onPostCreated) {
      onPostCreated(newPost);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3>Create New Post</h3>
          <button onClick={onClose} className="btn-ghost btn-icon-sm">
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <PostComposer
            onPostCreated={handleCreated}
            placeholder="What's vibrating in your mind right now?"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
