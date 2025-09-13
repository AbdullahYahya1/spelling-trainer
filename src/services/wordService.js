import api from './api';

export const wordService = {
  async getWords() {
    try {
      const response = await api.get('/words');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch words' 
      };
    }
  },

  async createWord(text) {
    try {
      const response = await api.post('/words', { text });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create word' 
      };
    }
  },

  async updateWord(id, text) {
    try {
      await api.put(`/words/${id}`, { text });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update word' 
      };
    }
  },

  async deleteWord(id) {
    try {
      await api.delete(`/words/${id}`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete word' 
      };
    }
  },

  async recordPractice(id, isCorrect) {
    try {
      const response = await api.post(`/words/${id}/practice`, isCorrect);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to record practice' 
      };
    }
  }
};
