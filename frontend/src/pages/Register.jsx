import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required for verification');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Security requirement: Password min. 8 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation mismatch');
      setLoading(false);
      return;
    }

    try {
      const result = await register(username, email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Identity registration rejected by system');
      }
    } catch (err) {
      setError('System connection failure. Contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual-side">
        <div className="visual-content">
          <div className="visual-logo">K</div>
          <h1>System Enrollment</h1>
          <p>Create your enterprise credentials to begin orchestrating Kong gateway infrastructure components.</p>

          <div className="visual-features">
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>RBAC-enabled access control</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔑</span>
              <span>Secure identity management</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Account Request</h2>
            <p>Submit your details for enterprise access</p>
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
                  placeholder="j.doe"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label htmlFor="email">Work Email</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@enterprise.com"
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
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔄</span>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Processing Request...' : 'Request Account'}
            </button>

            <div className="auth-footer">
              <p>Existing user? <Link to="/">Sign in instead</Link></p>
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

export default Register;

