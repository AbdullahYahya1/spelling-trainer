import { wordService } from './wordService';
import { authService } from './authService';

const LOCAL_STORAGE_KEY = 'spellingWords';

class StorageService {
  constructor() {
    this.isOnline = authService.isAuthenticated();
  }

  setOnlineMode(isOnline) {
    this.isOnline = isOnline;
  }

  async getWords(searchTerm = '') {
    if (this.isOnline) {
      const result = await wordService.getWords(searchTerm);
      if (result.success) {
        return result.data;
      } else {

        console.warn('Online storage failed, falling back to local storage');
        return this.searchLocalWords(searchTerm);
      }
    } else {
      return this.searchLocalWords(searchTerm);
    }
  }

  async addWord(word, description = '') {

    if (word.includes(' ')) {
      return { success: false, error: 'Word cannot contain spaces' };
    }
    
    if (this.isOnline) {
      const result = await wordService.createWord(word, description);
      if (result.success) {
        return { success: true };
      } else {

        console.warn('Online storage failed, falling back to local storage');
        return this.addWordToLocalStorage(word, description);
      }
    } else {
      return this.addWordToLocalStorage(word, description);
    }
  }

  async removeWord(word) {
    if (this.isOnline) {

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

  async recordPractice(word, isCorrect) {
    if (this.isOnline) {

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

      return { success: true };
    }
  }

  getWordsFromLocalStorage() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {

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

  async syncLocalToOnline() {
    if (!this.isOnline) return { success: false, error: 'Not in online mode' };

    const localWords = this.getWordsFromLocalStorage();
    const onlineResult = await wordService.getWords();
    
    if (!onlineResult.success) {
      return { success: false, error: 'Failed to fetch online words' };
    }

    const onlineWords = onlineResult.data.map(w => w.text);
    const wordsToAdd = localWords.filter(word => !onlineWords.includes(word.text));

    for (const word of wordsToAdd) {
      await wordService.createWord(word.text, word.description || '');
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY);

    return { success: true, synced: wordsToAdd.length };
  }
}

export const storageService = new StorageService();
