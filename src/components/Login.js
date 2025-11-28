import React, { useState } from 'react';
import { authService } from '../services/authService';

const Login = ({ onLogin, onSwitchToRegister, themedStyles }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

    // Login via OTP verification
    const result = await authService.verifyOtpAndLogin(email, otp);
    
    if (result.success) {
      onLogin();
    } else {
      if (result.errorCode === 'USER_NOT_FOUND') {
        onSwitchToRegister(result.error);
      } else {
        setError(result.error);
      }
    }
    
    setLoading(false);
  };

  return (
    <div style={themedStyles.page}>
      <h2 style={themedStyles.manageTitle}>Login with Email</h2>
      
      {step === 'email' ? (
        <form onSubmit={handleSendOtp} style={themedStyles.authForm}>
          {error && (
            <div style={themedStyles.errorMessage}>
              {error}
            </div>
          )}
          
          <div style={themedStyles.formGroup}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              style={themedStyles.authInput}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={themedStyles.authButton}
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
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
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              type="button"
              onClick={() => { setStep('email'); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Change Email
            </button>
          </div>
        </form>
      )}
      
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
