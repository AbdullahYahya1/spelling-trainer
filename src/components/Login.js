import React, { useState } from 'react';
import { authService } from '../services/authService';

const Login = ({ onLogin, onSwitchToRegister, themedStyles }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.login(formData.username, formData.password);
    
    if (result.success) {
      onLogin();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={themedStyles.page}>
      <h2 style={themedStyles.manageTitle}>Login</h2>
      <form onSubmit={handleSubmit} style={themedStyles.authForm}>
        {error && (
          <div style={themedStyles.errorMessage}>
            {error}
          </div>
        )}
        
        <div style={themedStyles.formGroup}>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            style={themedStyles.authInput}
            required
          />
        </div>
        
        <div style={themedStyles.formGroup}>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            style={themedStyles.authInput}
            required
          />
        </div>
        
        <button 
          type="submit" 
          style={themedStyles.authButton}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={themedStyles.authSwitch}>
        <p>Don't have an account? 
          <button 
            onClick={onSwitchToRegister}
            style={themedStyles.authSwitchButton}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
