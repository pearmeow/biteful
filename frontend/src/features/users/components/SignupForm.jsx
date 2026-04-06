import { useState } from 'react';
import { userService } from '../services/userService';
import { useNavigate, Link } from 'react-router-dom';

const SignupForm = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: null });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      await userService.signup(formData.username, formData.email, formData.password);
      alert("Account created! Please login.");
      navigate('/login');
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2> 
      <form onSubmit={handleSignup}>
        <div className="input-group"> {/* each input field */}
          <label>USERNAME</label>
          <div className="input-wrapper">
            <span className="input-icon">☺︎</span> {/* username input */}
            <input 
              type="text" 
              placeholder="Choose a username" 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
              required 
            />
          </div>
        </div>
        
        <div className="input-group"> {/* email input */}
          <label>EMAIL ADDRESS</label> 
          <div className="input-wrapper">
            <span className="input-icon">✉</span>
            <input 
              type="email" 
              placeholder="your@email.com" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
        </div>

        <div className="input-group">  {/* password input */}
          <label>PASSWORD</label>
          <div className="input-wrapper">
            <span className="input-icon">🔒︎</span>
            <input 
              type="password" 
              placeholder="••••••••" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
        </div>

        {status.error && <p className="error-text">{status.error}</p>}
        <button type="submit" disabled={status.loading}>
          {status.loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <div className="auth-switch">  {/* link to login */}
        <span>Already have an account? </span>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default SignupForm;