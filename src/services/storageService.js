import { wordService } from './wordService';
import { authService } from './authService';

const LOCAL_STORAGE_KEY = 'spellingWords';

class StorageService {
  constructor() {
    this.isOnline = authService.isAuthenticated();
  }

  // Set the storage mode
  setOnlineMode(isOnline) {
    this.isOnline = isOnline;
  }

  // Get words from storage
  async getWords() {
    if (this.isOnline) {
      const result = await wordService.getWords();
      if (result.success) {
        return result.data.map(word => word.text);
      } else {
        // Fallback to local storage if online fails
        console.warn('Online storage failed, falling back to local storage');
        return this.getWordsFromLocalStorage();
      }
    } else {
      return this.getWordsFromLocalStorage();
    }
  }

  // Add word to storage
  async addWord(word) {
    // Validate word doesn't contain spaces
    if (word.includes(' ')) {
      return { success: false, error: 'Word cannot contain spaces' };
    }
    
    if (this.isOnline) {
      const result = await wordService.createWord(word);
      if (result.success) {
        return { success: true };
      } else {
        // Fallback to local storage if online fails
        console.warn('Online storage failed, falling back to local storage');
        return this.addWordToLocalStorage(word);
      }
    } else {
      return this.addWordToLocalStorage(word);
    }
  }

  // Remove word from storage
  async removeWord(word) {
    if (this.isOnline) {
      // First get all words to find the ID
      const wordsResult = await wordService.getWords();
      if (wordsResult.success) {
        const wordObj = wordsResult.data.find(w => w.text === word);
        if (wordObj) {
          const result = await wordService.deleteWord(wordObj.id);
          return result;
        }
      }
      return { success: false, error: 'Word not found' };
    } else {
      return this.removeWordFromLocalStorage(word);
    }
  }

  // Record practice session
  async recordPractice(word, isCorrect) {
    if (this.isOnline) {
      // First get all words to find the ID
      const wordsResult = await wordService.getWords();
      if (wordsResult.success) {
        const wordObj = wordsResult.data.find(w => w.text === word);
        if (wordObj) {
          const result = await wordService.recordPractice(wordObj.id, isCorrect);
          return result;
        }
      }
      return { success: false, error: 'Word not found' };
    } else {
      // For local storage, we don't track practice statistics
      return { success: true };
    }
  }

  // Local storage methods
  getWordsFromLocalStorage() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? stored.split(',').map(w => w.trim()).filter(Boolean) : [];
  }

  setWordsToLocalStorage(words) {
    localStorage.setItem(LOCAL_STORAGE_KEY, words.join(','));
  }

  addWordToLocalStorage(word) {
    // Validate word doesn't contain spaces
    if (word.includes(' ')) {
      return { success: false, error: 'Word cannot contain spaces' };
    }
    
    const words = this.getWordsFromLocalStorage();
    if (!words.includes(word)) {
      words.push(word);
      this.setWordsToLocalStorage(words);
      return { success: true };
    }
    return { success: false, error: 'Word already exists' };
  }

  removeWordFromLocalStorage(word) {
    const words = this.getWordsFromLocalStorage();
    const updated = words.filter(w => w !== word);
    this.setWordsToLocalStorage(updated);
    return { success: true };
  }

  // Sync local words to online storage (useful when user logs in)
  async syncLocalToOnline() {
    if (!this.isOnline) return { success: false, error: 'Not in online mode' };

    const localWords = this.getWordsFromLocalStorage();
    const onlineResult = await wordService.getWords();
    
    if (!onlineResult.success) {
      return { success: false, error: 'Failed to fetch online words' };
    }

    const onlineWords = onlineResult.data.map(w => w.text);
    const wordsToAdd = localWords.filter(word => !onlineWords.includes(word));

    // Add missing words to online storage
    for (const word of wordsToAdd) {
      await wordService.createWord(word);
    }

    // Clear local storage after successful sync
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    return { success: true, synced: wordsToAdd.length };
  }
}

export const storageService = new StorageService();
