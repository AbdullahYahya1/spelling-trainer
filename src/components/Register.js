import React, { useState } from 'react';
import { authService } from '../services/authService';

const Register = ({ onRegister, onSwitchToLogin, themedStyles }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await authService.register(
      formData.username, 
      formData.email, 
      formData.password
    );
    
    if (result.success) {
      onRegister();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={themedStyles.page}>
      <h2 style={themedStyles.manageTitle}>Register</h2>
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
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
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
            placeholder="Password (min 6 characters)"
            style={themedStyles.authInput}
            required
          />
        </div>
        
        <div style={themedStyles.formGroup}>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            style={themedStyles.authInput}
            required
          />
        </div>
        
        <button 
          type="submit" 
          style={themedStyles.authButton}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      
      <div style={themedStyles.authSwitch}>
        <p>Already have an account? 
          <button 
            onClick={onSwitchToLogin}
            style={themedStyles.authSwitchButton}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
