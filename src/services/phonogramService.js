// Service to manage phonogram progress in localStorage

const STORAGE_KEY = 'phonogram_progress';

export const phonogramService = {
  // Get current progress
  getProgress: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { patternIndex: 0, soundIndex: 0, exampleIndex: 0 };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading phonogram progress:', error);
      return { patternIndex: 0, soundIndex: 0, exampleIndex: 0 };
    }
  },

  // Save progress
  saveProgress: (patternIndex, soundIndex, exampleIndex) => {
    try {
      const progress = { patternIndex, soundIndex, exampleIndex };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      return { success: true };
    } catch (error) {
      console.error('Error saving phonogram progress:', error);
      return { success: false, error: error.message };
    }
  },

  // Reset progress
  resetProgress: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error resetting phonogram progress:', error);
      return { success: false, error: error.message };
    }
  }
};

