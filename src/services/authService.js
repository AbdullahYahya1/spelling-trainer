import api from './api';

export const authService = {

  isTokenExpired(token) {
    try {
      if (!token) return true;

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; 
    }
  },

  cleanupExpiredToken() {
    const token = localStorage.getItem('authToken');
    if (token && this.isTokenExpired(token)) {
      console.log('Token expired, cleaning up...');
      this.logout();
      return true;
    }
    return false;
  },

  // OTP Flow - Now handled entirely by our backend
  async sendOtp(email, isRegister = false) {
    try {
      const response = await api.post('/auth/send-otp', { email, isRegister });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send OTP',
        errorCode: error.response?.data?.code 
      };
    }
  },

  async verifyOtpAndLogin(email, otp, username = '') {
    try {
      // Call OUR backend to verify OTP. 
      // The backend will call Authentica to verify, and if valid, return JWT.
      const response = await api.post('/auth/verify-otp', { email, otp, username });
      
      const { token, username: userUsername, email: userEmail } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify({ username: userUsername, email: userEmail }));
      
      return { success: true, data: response.data };

    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid OTP or Login failed',
        errorCode: error.response?.data?.code
      };
    }
  },

  async validateToken() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return { success: false };

      if (this.isTokenExpired(token)) {
        console.log('Token is expired, cleaning up...');
        this.logout();
        return { success: false, expired: true };
      }
      
      const response = await api.post('/auth/validate', token, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Server says token is invalid, cleaning up...');
        this.logout();
        return { success: false, expired: true };
      }
      return { success: false };
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      console.log('Token is expired, cleaning up...');
      this.logout();
      return false;
    }
    
    return true;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
