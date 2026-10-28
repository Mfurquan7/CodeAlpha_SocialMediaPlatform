import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, Sparkles, UserX } from 'lucide-react';
import UserCard from '../components/UserCard';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [activeTab, setActiveTab] = useState(queryParam ? 'search' : 'all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Keep search input synced with URL query param
  useEffect(() => {
    if (queryParam) {
      setSearchTerm(queryParam);
      setActiveTab('search');
    }
  }, [queryParam]);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError('');
      try {
        let params = {};
        if (activeTab === 'suggested') {
          params.suggested = true;
        } else if (activeTab === 'search' && searchTerm.trim()) {
          params.q = searchTerm.trim();
        }

        const data = await usersApi.getAll(params);
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve users.');
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [activeTab, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
      setActiveTab('search');
    } else {
      setSearchParams({});
      setActiveTab('all');
    }
  };

  return (
    <div>
      {/* Search Bar Input */}
      <div className="card" style={{ marginBottom: 20, padding: 18 }}>
        <form onSubmit={handleSearchSubmit}>
          <div className="form-control-wrapper">
            <Search size={18} className="input-icon left" />
            <input
              type="text"
              className="input input-icon-left"
              placeholder="Search creators by name or @username..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!e.target.value) {
                  setSearchParams({});
                  setActiveTab('all');
                }
              }}
              style={{
                borderRadius: 'var(--radius-full)',
                paddingTop: 12,
                paddingBottom: 12,
                fontSize: 'var(--font-size-base)'
              }}
            />
          </div>
        </form>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            onClick={() => {
              setActiveTab('all');
              setSearchTerm('');
              setSearchParams({});
            }}
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Users size={14} />
            <span>All Creators</span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                setActiveTab('suggested');
                setSearchTerm('');
                setSearchParams({});
              }}
              className={`btn btn-sm ${activeTab === 'suggested' ? 'btn-primary' : 'btn-outline'}`}
            >
              <Sparkles size={14} />
              <span>Suggested for You</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {activeTab === 'suggested'
            ? 'Creators You Might Like'
            : searchTerm.trim()
            ? `Results for "${searchTerm}"`
            : 'Explore Vibely Members'}
        </h3>
      </div>

      {/* Content State */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner spinner-lg" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Searching the community...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--color-danger)' }}>
          <p style={{ fontWeight: 600 }}>{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <UserX size={32} />
          </div>
          <h4 className="empty-state-title">No creators found</h4>
          <p className="empty-state-text">
            {searchTerm.trim()
              ? `No user matching "${searchTerm}". Try another search keyword.`
              : 'No creators available at this moment.'}
          </p>
        </div>
      ) : (
        <div>
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
