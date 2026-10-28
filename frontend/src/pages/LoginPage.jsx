import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Username or email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      addToast('Welcome back to Vibely!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo user autofill convenience for CodeAlpha internship reviewer
  const autofillDemo = (email, pwd) => {
    setIdentifier(email);
    setPassword(pwd);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-main)',
        padding: '24px 16px'
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 6px 18px rgba(108, 76, 241, 0.35)'
            }}
          >
            <Sparkles size={26} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginTop: 4 }}>
            Log in to continue sharing your vibe
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '32px 28px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 14px',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                marginBottom: 20,
                border: '1px solid #FECACA'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="input"
                placeholder="name@vibely.dev or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-control-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-icon-right"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon right"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ color: 'var(--color-text-muted)', border: 'none', background: 'none' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: 10, padding: '12px 20px', fontSize: 15 }}
            >
              {loading ? (
                <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
              ) : (
                <>
                  <LogIn size={17} />
                  <span>Log In to Vibely</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div
            style={{
              marginTop: 24,
              padding: '12px 14px',
              backgroundColor: 'var(--color-bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 12
            }}
          >
            <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Quick Demo Login:
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => autofillDemo('sarah@vibely.dev', 'Password123!')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
              >
                Sarah (Designer)
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('alex@vibely.dev', 'Password123!')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, padding: '4px 8px', fontSize: 11 }}
              >
                Alex (Dev)
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
