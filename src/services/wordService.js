import api from './api';

export const wordService = {
  async getWords(searchTerm = '') {
    try {
      const url = searchTerm ? `/words?search=${encodeURIComponent(searchTerm)}` : '/words';
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch words' 
      };
    }
  },

  async createWord(text, description = '') {
    try {
      const response = await api.post('/words', { text, description });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create word' 
      };
    }
  },

  async updateWord(id, text, description = '') {
    try {
      await api.put(`/words/${id}`, { text, description });
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
