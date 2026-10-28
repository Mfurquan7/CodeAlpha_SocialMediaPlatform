import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Sparkles, Award } from 'lucide-react';
import UserCard from './UserCard';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SidebarRight() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      setLoadingSuggestions(true);
      try {
        const data = await usersApi.getAll({
          suggested: true,
          limit: 3
        });
        setSuggestions(data.users || []);
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }

    fetchSuggestions();
  }, [currentUser]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const trendingTopics = [
    { tag: '#UIUXDesign', posts: '1.4k vibes' },
    { tag: '#FullStackDev', posts: '980 vibes' },
    { tag: '#CodeAlpha', posts: '850 vibes' },
    { tag: '#CleanArchitecture', posts: '620 vibes' },
    { tag: '#ReactVite', posts: '540 vibes' }
  ];

  return (
    <aside className="sidebar-right">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 20 }}>
        <div className="form-control-wrapper">
          <Search size={16} className="input-icon left" />
          <input
            type="text"
            className="input input-icon-left"
            placeholder="Search people on Vibely..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              borderRadius: 'var(--radius-full)',
              background: '#FFFFFF',
              fontSize: 'var(--font-size-sm)',
              paddingTop: 10,
              paddingBottom: 10
            }}
          />
        </div>
      </form>

      {/* Suggested Users */}
      <div className="card" style={{ marginBottom: 20, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color="var(--color-primary)" />
            <span>Who to Follow</span>
          </h4>
          <button
            onClick={() => navigate('/explore')}
            style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}
          >
            See all
          </button>
        </div>

        {loadingSuggestions ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <div className="spinner spinner-sm" />
          </div>
        ) : suggestions.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '8px 0' }}>
            No new suggestions right now.
          </p>
        ) : (
          <div>
            {suggestions.map((u) => (
              <UserCard key={u.id} user={u} compact />
            ))}
          </div>
        )}
      </div>

      {/* Trending Vibes */}
      <div className="card" style={{ marginBottom: 20, padding: 18 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <TrendingUp size={16} color="var(--color-primary)" />
          <span>Trending Vibes</span>
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {trendingTopics.map((topic, i) => (
            <div
              key={i}
              onClick={() => navigate(`/explore?q=${encodeURIComponent(topic.tag.replace('#', ''))}`)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '6px 0',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
                  {topic.tag}
                </p>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{topic.posts}</p>
              </div>
              <span className="badge" style={{ fontSize: 10, padding: '2px 7px' }}>
                Hot
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CodeAlpha Internship Footer Info */}
      <div
        style={{
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-soft-lavender)',
          border: '1px solid #DDD8F5',
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--color-primary)', fontWeight: 700 }}>
          <Award size={15} />
          <span>CodeAlpha Internship</span>
        </div>
        Task 2: Social Media Platform &middot; Vibely v1.0 &middot; Built with React, Node.js &amp; SQLite.
      </div>
    </aside>
  );
}
