import React, { useState } from 'react';
import { authService } from '../services/authService';

const Register = ({ onRegister, onSwitchToLogin, themedStyles, initialMessage }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialMessage || '');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
    }

    const result = await authService.sendOtp(email);
    
    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Register via OTP verification (backend handles user creation if new)
    const result = await authService.verifyOtpAndLogin(email, otp, username);
    
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
      
      {step === 'details' ? (
        <form onSubmit={handleSendOtp} style={themedStyles.authForm}>
          {error && (
            <div style={themedStyles.errorMessage}>
              {error}
            </div>
          )}
          
          <div style={themedStyles.formGroup}>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a Username"
              style={themedStyles.authInput}
              required
            />
          </div>

          <div style={themedStyles.formGroup}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              style={themedStyles.authInput}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={themedStyles.authButton}
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Continue with Email'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} style={themedStyles.authForm}>
          {error && (
            <div style={themedStyles.errorMessage}>
              {error}
            </div>
          )}
          
          <p style={{ textAlign: 'center', marginBottom: '1rem', color: themedStyles.input.color }}>
            Enter the OTP sent to <strong>{email}</strong>
          </p>

          <div style={themedStyles.formGroup}>
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              style={themedStyles.authInput}
              required
              maxLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            style={themedStyles.authButton}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify & Register'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              type="button"
              onClick={() => { setStep('details'); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Back
            </button>
          </div>
        </form>
      )}
      
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
