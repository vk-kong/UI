import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Required fields are missing');
      setLoading(false);
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Verification failed. Invalid credentials.');
      }
    } catch (err) {
      setError('System connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual-side">
        <div className="visual-content">
          <div className="visual-logo">K</div>
          <h1>Enterprise Orchestration</h1>
          <p>Seamlessly deploy and manage your Kong gateway infrastructure across any cloud or local environment.</p>

          <div className="visual-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Zero-downtime deployments</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>Enterprise-grade security</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to access the console</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group-modern">
              <label htmlFor="username">Username</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@enterprise.com"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="auth-footer">
              <p>Need access? <Link to="/register">Contact administrator</Link></p>
            </div>
          </form>
        </div>

        <div className="auth-page-footer">
          <span>&copy; 2024 Kong Deploy Enterprise. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
