import { useState } from 'react';
import Logo from './Logo';
import { supabase } from '../supabaseClient';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabase) {
      setError('Database client not initialized.');
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        // Clear password on failure
        setPassword('');
        // Show auth error after a short delay for animation
        setTimeout(() => setError(authError.message || 'Invalid credentials.'), 50);
      } else {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo-container">
          <Logo />
        </div>
        <h2 className="login-title">Travelbooks PH</h2>
        <p className="login-subtitle">Booking & Project Management System</p>
        
        {error && (
          <div className="login-error-msg" style={{ color: 'var(--status-cancelled)', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter admin email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="login-hint">
          <p style={{ fontWeight: '500', color: 'var(--brand-primary)', marginBottom: '4px' }}>Administrative Access Only</p>
          <p>Hint: Create your admin account in the <strong>Supabase Authentication Dashboard</strong> to log in.</p>
        </div>
      </div>
    </div>
  );
}
