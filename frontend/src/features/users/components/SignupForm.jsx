import { useState } from 'react';
import { userService } from '../services/userService';
import { useNavigate } from 'react-router-dom';

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
        <input 
          type="text" 
          placeholder="Username" 
          onChange={(e) => setFormData({...formData, username: e.target.value})} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
        />
        {status.error && <p className="error-text">{status.error}</p>}
        <button type="submit" disabled={status.loading}>
          {status.loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;