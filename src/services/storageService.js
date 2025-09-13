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
  async getWords(searchTerm = '') {
    if (this.isOnline) {
      const result = await wordService.getWords(searchTerm);
      if (result.success) {
        return result.data;
      } else {
        // Fallback to local storage if online fails
        console.warn('Online storage failed, falling back to local storage');
        return this.searchLocalWords(searchTerm);
      }
    } else {
      return this.searchLocalWords(searchTerm);
    }
  }

  // Add word to storage
  async addWord(word, description = '') {
    // Validate word doesn't contain spaces
    if (word.includes(' ')) {
      return { success: false, error: 'Word cannot contain spaces' };
    }
    
    if (this.isOnline) {
      const result = await wordService.createWord(word, description);
      if (result.success) {
        return { success: true };
      } else {
        // Fallback to local storage if online fails
        console.warn('Online storage failed, falling back to local storage');
        return this.addWordToLocalStorage(word, description);
      }
    } else {
      return this.addWordToLocalStorage(word, description);
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
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback for old format (just words as comma-separated)
      return stored.split(',').map(w => w.trim()).filter(Boolean).map(word => ({
        text: word,
        description: '',
        id: Date.now() + Math.random() // Generate temporary ID
      }));
    }
  }

  setWordsToLocalStorage(words) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(words));
  }

  // Search local words
  searchLocalWords(searchTerm) {
    const words = this.getWordsFromLocalStorage();
    if (!searchTerm) return words;
    
    const search = searchTerm.toLowerCase();
    return words.filter(word => 
      word.text.toLowerCase().includes(search) || 
      (word.description && word.description.toLowerCase().includes(search))
    );
  }

  addWordToLocalStorage(word, description = '') {
    // Validate word doesn't contain spaces
    if (word.includes(' ')) {
      return { success: false, error: 'Word cannot contain spaces' };
    }
    
    const words = this.getWordsFromLocalStorage();
    const existingWord = words.find(w => w.text === word);
    
    if (!existingWord) {
      const newWord = {
        text: word,
        description: description,
        id: Date.now() + Math.random() // Generate temporary ID
      };
      words.push(newWord);
      this.setWordsToLocalStorage(words);
      return { success: true };
    }
    return { success: false, error: 'Word already exists' };
  }

  removeWordFromLocalStorage(word) {
    const words = this.getWordsFromLocalStorage();
    const updated = words.filter(w => w.text !== word);
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
    const wordsToAdd = localWords.filter(word => !onlineWords.includes(word.text));

    // Add missing words to online storage
    for (const word of wordsToAdd) {
      await wordService.createWord(word.text, word.description || '');
    }

    // Clear local storage after successful sync
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    return { success: true, synced: wordsToAdd.length };
  }
}

export const storageService = new StorageService();
