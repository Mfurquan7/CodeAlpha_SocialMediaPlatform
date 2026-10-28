import React, { useState } from 'react';
import { Send, AlertCircle, Sparkles } from 'lucide-react';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { postsApi } from '../services/api';

export default function PostComposer({ onPostCreated, placeholder = "What's on your mind? Share your vibe...", autoFocus = false }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const MAX_CHARS = 1000;
  const charsRemaining = MAX_CHARS - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please write something before publishing.');
      return;
    }

    if (content.length > MAX_CHARS) {
      setError(`Post exceeds the limit of ${MAX_CHARS} characters.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await postsApi.create(content.trim());
      setContent('');
      addToast('Your vibe has been published!', 'success');
      if (onPostCreated) {
        onPostCreated(data.post);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card post-composer-card" style={{ marginBottom: 20 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Avatar
            name={currentUser?.name || 'User'}
            color={currentUser?.avatar_color}
            size="md"
          />

          <div style={{ flex: 1 }}>
            <textarea
              className="textarea composer-textarea"
              placeholder={placeholder}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              maxLength={MAX_CHARS + 50}
              autoFocus={autoFocus}
              style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-main)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: 'var(--font-size-base)',
                width: '100%',
                resize: 'none',
                minHeight: 85
              }}
            />

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--color-danger)',
                  fontSize: 'var(--font-size-xs)',
                  marginTop: 6
                }}
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 12,
                paddingTop: 8,
                borderTop: '1px solid var(--color-border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: charsRemaining < 50 ? 'var(--color-danger)' : 'var(--color-text-muted)',
                    fontWeight: charsRemaining < 50 ? 600 : 400
                  }}
                >
                  {content.length}/{MAX_CHARS}
                </span>
                {content.length > 0 && charsRemaining >= 0 && (
                  <span className="badge" style={{ fontSize: 11, padding: '2px 8px' }}>
                    <Sparkles size={11} style={{ marginRight: 4 }} /> Ready
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting || !content.trim() || charsRemaining < 0}
                style={{ minWidth: 90 }}
              >
                {isSubmitting ? (
                  <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                ) : (
                  <>
                    <Send size={14} />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
