import React, { useEffect, useState, useRef, useCallback } from 'react';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import Login from './components/Login';
import Register from './components/Register';
import PhonogramsPage from './components/PhonogramsPage';

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function App() {
  const [page, setPage] = useState('typing');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.style.background = theme === 'dark' ? '#181a1b' : '#f5f7fa';
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    if (isAuthenticated) {
      updateStreak();
      loadStreak();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = authService.isAuthenticated();
      
      if (hasToken) {
        const result = await authService.validateToken();
        
        if (result.success) {
          setIsAuthenticated(true);
          setUser(authService.getCurrentUser());
          storageService.setOnlineMode(true);
        } else {
          authService.logout();
          storageService.setOnlineMode(false);
          setAuthPage('login');
          
          if (result.expired) {
          }
        }
      } else {
        storageService.setOnlineMode(false);
        setAuthPage('login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = () => {
      if (authService.isAuthenticated()) {
        return;
      } else {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        storageService.setOnlineMode(false);
        setAuthPage('login');
      }
    };

    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleLogin = async () => {
    setIsAuthenticated(true);
    setUser(authService.getCurrentUser());
    storageService.setOnlineMode(true);
    
    const syncResult = await storageService.syncLocalToOnline();
    if (syncResult.success && syncResult.synced > 0) {
    }
    
    setAuthPage('');
  };

  const handleRegister = async () => {
    setIsAuthenticated(true);
    setUser(authService.getCurrentUser());
    storageService.setOnlineMode(true);
    
    const syncResult = await storageService.syncLocalToOnline();
    if (syncResult.success && syncResult.synced > 0) {
    }
    
    setAuthPage('');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setStreak(null);
    storageService.setOnlineMode(false);
  };

  const loadStreak = async () => {
    try {
      const response = await fetch('https://apiforspelling.somee.com/api/streak', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const streakData = await response.json();
        setStreak(streakData);
      } else {
        console.error('Streak API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load streak:', error);
    }
  };

  const updateStreak = async () => {
    try {
      const response = await fetch('https://apiforspelling.somee.com/api/streak', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const streakData = await response.json();
        setStreak(streakData);
      }
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  };

  const themedStyles = getThemedStyles(theme);

  if (isLoading) {
    return (
      <div style={themedStyles.appWrapper}>
        <div style={{ ...themedStyles.page, textAlign: 'center' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if ((authPage === 'login' || authPage === 'register') && !isAuthenticated) {
    return (
      <div style={themedStyles.appWrapper}>
        <header style={themedStyles.header}>
          <h1 style={themedStyles.title}>Spelling Trainer</h1>
          <div style={themedStyles.nav}>
            <button
              onClick={() => setAuthPage('')}
              style={themedStyles.themeToggleBtn}
              aria-label="Back to app"
            >
              Back
            </button>
            <button
              onClick={toggleTheme}
              style={themedStyles.themeToggleBtn}
              aria-label="Toggle dark/light mode"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>
        {authPage === 'login' ? (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthPage('register')}
            themedStyles={themedStyles}
          />
        ) : (
          <Register 
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthPage('login')}
            themedStyles={themedStyles}
          />
        )}
      </div>
    );
  }

  return (
    <div style={themedStyles.appWrapper}>
      <header style={themedStyles.header}>
        <h1 style={themedStyles.title}>Spelling Trainer</h1>
        <nav style={themedStyles.nav}>
          <a
            href="#typing"
            onClick={e => { e.preventDefault(); setPage('typing'); }}
            style={{
              ...themedStyles.navLink,
              ...(page === 'typing' ? themedStyles.navLinkActive : {})
            }}
            aria-current={page === 'typing' ? 'page' : undefined}
          >
            Typing
          </a>
          <a
            href="#manage"
            onClick={e => { e.preventDefault(); setPage('manage'); }}
            style={{
              ...themedStyles.navLink,
              ...(page === 'manage' ? themedStyles.navLinkActive : {})
            }}
            aria-current={page === 'manage' ? 'page' : undefined}
          >
            Manage Words
          </a>
          <a
            href="#phonograms"
            onClick={e => { e.preventDefault(); setPage('phonograms'); }}
            style={{
              ...themedStyles.navLink,
              ...(page === 'phonograms' ? themedStyles.navLinkActive : {})
            }}
            aria-current={page === 'phonograms' ? 'page' : undefined}
          >
            Phonograms
          </a>
          
          {isAuthenticated ? (
            <>
              <div style={themedStyles.userInfo}>
                <span style={themedStyles.userName}>{user?.username}</span>
              </div>
              
              <div style={themedStyles.headerStreak}>
                {streak ? (
                  <div style={themedStyles.headerStreakContent}>
                    <span style={themedStyles.headerStreakCurrent}>
                      🔥 {streak.currentStreak}
                    </span>
                    <span style={themedStyles.headerStreakBest}>
                      Best: {streak.longestStreak}
                    </span>
                  </div>
                ) : (
                  <div style={themedStyles.headerStreakLoading}>
                    🔥 Loading...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={themedStyles.authButtons}>
              <button
                onClick={() => setAuthPage('login')}
                style={themedStyles.authHeaderBtn}
                aria-label="Login"
              >
                Login
              </button>
              <button
                onClick={() => setAuthPage('register')}
                style={themedStyles.authHeaderBtn}
                aria-label="Register"
              >
                Register
              </button>
            </div>
          )}
          
          <button
            onClick={toggleTheme}
            style={themedStyles.themeToggleBtn}
            aria-label="Toggle dark/light mode"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              style={themedStyles.logoutBtn}
              aria-label="Logout"
            >
              Logout
            </button>
          )}
        </nav>
      </header>
      {page === 'typing' ? (
        <TypingPage themedStyles={themedStyles} theme={theme} streak={streak} updateStreak={updateStreak} />
      ) : page === 'manage' ? (
        <WordManagerPage themedStyles={themedStyles} />
      ) : (
        <PhonogramsPage themedStyles={themedStyles} theme={theme} />
      )}
    </div>
  );
}

function TypingPage({ themedStyles, theme, streak, updateStreak }) {
  const [wordList, setWordList] = useState([]);
  const [typedWords, setTypedWords] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [showList, setShowList] = useState(false);
  const inputRef = useRef(null);

  const loadWords = async () => {
    setIsLoading(true);
    try {
      const words = await storageService.getWords();
      const wordTexts = words.map(word => typeof word === 'string' ? word : word.text);
      setWordList(shuffleArray(wordTexts));
    } catch (error) {
      console.error('Failed to load words:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [typedWords, wordList]);

  const speakWord = useCallback((word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const currentWord = wordList[typedWords.length];
        if (currentWord) {
          speakWord(currentWord);
        }
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setShowList(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wordList, typedWords, speakWord]);

  const handleInputChange = async (e) => {
    const val = e.target.value;
    
    if (val.length > 0 && !hasStartedTyping) {
      setHasStartedTyping(true);
    }
    
    if (val.endsWith(' ')) {
      const word = val.trim();
      const currentWordIndex = typedWords.length;
      const isCorrect = word === wordList[currentWordIndex];
      
      setTypedWords([...typedWords, word]);
      setCurrentInput('');
      setHasStartedTyping(false);
      
      if (wordList[currentWordIndex]) {
        await storageService.recordPractice(wordList[currentWordIndex], isCorrect);
      }
    } else {
      setCurrentInput(val);
    }
  };

  const resetTest = () => {
    setTypedWords([]);
    setCurrentInput('');
    setHasStartedTyping(false);
    loadWords();
    inputRef.current?.focus();
  };

  const getCurrentWord = () => {
    return wordList[typedWords.length];
  };

  const getWordStatus = (word, i) => {
    const typed = typedWords[i];
    if (!typed) return 'pending';
    if (typed === word) return 'correct';
    return 'incorrect';
  };

  if (isLoading) {
    return (
      <div style={themedStyles.page}>
        <h2>Loading words...</h2>
      </div>
    );
  }

  if (!wordList.length) {
    return (
      <div style={themedStyles.page}>
        <h2>No words available.</h2>
        <p>Add some on the "Manage Words" page.</p>
      </div>
    );
  }

  return (
    <div style={themedStyles.page} onClick={() => inputRef.current?.focus()}>
      <h2>
        Typing Practice {currentInput && <span style={{ color: 'gray' }}>&quot;{currentInput}&quot;</span>}
      </h2>
      
      
      <div style={themedStyles.controlsContainer}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            const currentWord = getCurrentWord();
            if (currentWord) speakWord(currentWord);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          style={{
            ...themedStyles.showListBtn,
            background: theme === 'dark' ? '#9b59b6' : '#8e44ad',
            color: '#fff'
          }}
          disabled={!getCurrentWord()}
          title="Press Ctrl+C to hear the word"
        >
          🔊 Hear Word (Ctrl+C)
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowList(!showList);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          style={{
            ...themedStyles.showListBtn,
            background: showList ? (theme === 'dark' ? '#27ae60' : '#4CAF50') : (theme === 'dark' ? '#444' : '#ccc'),
            color: showList ? '#fff' : (theme === 'dark' ? '#f7f7fa' : '#222')
          }}
          title="Press Ctrl+L to toggle"
        >
          {showList ? '👁️ Hide List (Ctrl+L)' : '👁️ Show List (Ctrl+L)'}
        </button>
      </div>
      
      <div style={themedStyles.wordContainer}>
        {wordList.map((word, i) => {
          if (i === typedWords.length) {
            const shouldHideCurrentWord = showList && hasStartedTyping && currentInput.length > 0;
            
            return (
              <span
                key={i}
                style={{
                  marginRight: '0.8rem',
                  borderBottom: '2px solid #3498db',
                  transition: 'all 0.3s ease',
                  visibility: shouldHideCurrentWord ? 'hidden' : 'visible',
                }}
              >
                {word.split('').map((char, idx) => {
                  const typedChar = currentInput[idx];
                  const color =
                    typedChar == null
                      ? 'gray'
                      : typedChar === char
                      ? 'green'
                      : 'red';
                  return (
                    <span key={idx} style={{ color }}>
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          } else {
            const status = getWordStatus(word, i);
            let color = 'gray';
            if (status === 'correct') color = 'green';
            else if (status === 'incorrect') color = 'red';

            return (
              <span
                key={i}
                style={{
                  marginRight: '0.8rem',
                  color,
                }}
              >
                {word}
              </span>
            );
          }
        })}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={handleInputChange}
        style={themedStyles.hiddenInput}
        autoFocus
        aria-label="Type the word here"
        tabIndex={0}
      />
      <button 
        onClick={(e) => {
          e.stopPropagation();
          resetTest();
        }} 
        style={themedStyles.redoBtn}
      >
        Redo Test
      </button>
    </div>
  );
}

function WordManagerPage({ themedStyles }) {
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wordToDelete, setWordToDelete] = useState(null);

  const loadWords = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const wordsList = await storageService.getWords('');
      setWords(wordsList);
    } catch (error) {
      console.error('Failed to load words:', error);
      setError('Failed to load words');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const filteredWords = words.filter(word => {
    const search = searchTerm.toLowerCase();
    return word.text.toLowerCase().includes(search) || 
           (word.description && word.description.toLowerCase().includes(search));
  });

  const addWord = async () => {
    const word = newWord.trim();
    if (!word) return;
    
    if (word.includes(' ')) {
      setError('Word cannot contain spaces');
      return;
    }
    
    if (words.includes(word)) {
      setError('Word already exists');
      return;
    }

    setError('');
    const result = await storageService.addWord(word, newDescription.trim());
    
    if (result.success) {
      setWords([...words, { text: word, description: newDescription.trim() }]);
      setNewWord('');
      setNewDescription('');
      setShowAddModal(false);
    } else {
      setError(result.error || 'Failed to add word');
    }
  };

  const handleDeleteClick = (word) => {
    setWordToDelete(word);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!wordToDelete) return;
    
    setError('');
    const result = await storageService.removeWord(wordToDelete);
    
    if (result.success) {
      setWords(words.filter((w) => w.text !== wordToDelete));
      setShowDeleteModal(false);
      setWordToDelete(null);
    } else {
      setError(result.error || 'Failed to remove word');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setWordToDelete(null);
  };

  if (isLoading) {
    return (
      <div style={themedStyles.page}>
        <h2 style={themedStyles.manageTitle}>Manage Words</h2>
        <p>Loading words...</p>
      </div>
    );
  }

  return (
    <div style={themedStyles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={themedStyles.manageTitle}>Manage Your Words</h2>
          <p style={themedStyles.manageSubtitle}>
            Search and organize your spelling practice words
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          style={themedStyles.addWordButton}
        >
          + Add Word
        </button>
      </div>
      
      <div style={themedStyles.storageIndicator}>
        {storageService.isOnline ? (
          <span style={themedStyles.onlineIndicator}>
            Online Storage
          </span>
        ) : (
          <span style={themedStyles.localIndicator}>
            Local Storage
          </span>
        )}
      </div>
      
      <div style={themedStyles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search words..."
          style={themedStyles.searchInput}
        />
      </div>
      
      {filteredWords.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: themedStyles.wordDescription.color }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            No words found
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            {searchTerm ? 'Try a different search term' : 'Add your first word to get started'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: themedStyles.wordDescription.color }}>
            {filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''} {searchTerm ? 'found' : 'total'}
          </div>
          <ul style={themedStyles.manageList}>
            {filteredWords.map((word, i) => (
              <li key={i} style={themedStyles.manageListItem}>
                <div style={themedStyles.wordContent}>
                  <div style={themedStyles.manageWord}>{word.text}</div>
                  {word.description && (
                    <div style={themedStyles.wordDescription}>{word.description}</div>
                  )}
                </div>
                <button onClick={() => handleDeleteClick(word.text)} style={themedStyles.removeBtn} aria-label={`Remove ${word.text}`}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      
      {showAddModal && (
        <div style={themedStyles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={themedStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={themedStyles.modalHeader}>
              <h3 style={themedStyles.modalTitle}>Add New Word</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                style={themedStyles.modalCloseBtn}
                aria-label="Close modal"
              >
                ✕
              </button>
      </div>
      
      {error && (
        <div style={themedStyles.errorMessage}>
          {error}
        </div>
      )}
      
            <div style={themedStyles.modalBody}>
              <div style={themedStyles.modalFormGroup}>
                <label style={themedStyles.modalLabel}>Word</label>
          <input
            type="text"
            value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Enter word"
                  style={themedStyles.modalInput}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                      addWord();
                    }
                    if (e.key === 'Escape') {
                      setShowAddModal(false);
              }
            }}
          />
        </div>
        
              <div style={themedStyles.modalFormGroup}>
                <label style={themedStyles.modalLabel}>Description (Optional)</label>
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add a description or hint"
                  style={themedStyles.modalInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addWord();
                    }
                    if (e.key === 'Escape') {
                      setShowAddModal(false);
                    }
                  }}
                />
      </div>
      
              <div style={themedStyles.modalActions}>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setNewWord('');
                    setNewDescription('');
                    setError('');
                  }} 
                  style={themedStyles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button 
                  onClick={addWord} 
                  style={themedStyles.modalAddBtn}
                  disabled={!newWord.trim()}
                >
                  Add Word
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteModal && (
        <div style={themedStyles.modalOverlay} onClick={cancelDelete}>
          <div style={themedStyles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={themedStyles.modalHeader}>
              <h3 style={themedStyles.modalTitle}>Delete Word?</h3>
              <button 
                onClick={cancelDelete} 
                style={themedStyles.modalCloseBtn}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            
            <div style={themedStyles.modalBody}>
              <p style={themedStyles.confirmMessage}>
                Are you sure you want to delete <strong>"{wordToDelete}"</strong>?
              </p>
              <p style={themedStyles.confirmSubMessage}>
                This action cannot be undone.
              </p>
              
              <div style={themedStyles.modalActions}>
                <button 
                  onClick={cancelDelete} 
                  style={themedStyles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  style={themedStyles.modalDeleteBtn}
                >
                  Delete Word
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getThemedStyles(theme) {
  const isDark = theme === 'dark';
  return {
    appWrapper: {
      minHeight: '100vh',
      background: isDark ? '#181a1b' : '#f5f7fa',
      color: isDark ? '#f7f7fa' : '#1a202c',
      transition: 'background 0.3s, color 0.3s',
    },
    header: {
      background: isDark 
        ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' 
        : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      boxShadow: isDark 
        ? '0 4px 20px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)' 
        : '0 2px 8px rgba(79, 70, 229, 0.25)',
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      borderBottom: isDark ? '1px solid #34495e' : 'none',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
    },
    title: {
      margin: 0,
      fontSize: '2rem',
      fontWeight: 800,
      color: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      letterSpacing: '-0.02em',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      background: 'linear-gradient(45deg, #fff, #f0f8ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    nav: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    navLink: {
      fontSize: '1.1rem',
      color: '#ffffff',
      textDecoration: 'none',
      padding: '0.7rem 1.2rem',
      borderRadius: '8px',
      fontWeight: 600,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.1)',
      outline: 'none',
      position: 'relative',
      display: 'inline-block',
      backdropFilter: 'blur(10px)',
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.2)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    },
    navLinkActive: {
      background: 'rgba(255, 255, 255, 0.25)',
      color: '#ffffff',
      fontWeight: 700,
      textDecoration: 'none',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
    },
    themeToggleBtn: {
      fontSize: '1.3rem',
      padding: '0.5rem',
      background: 'none',
      border: 'none',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
      '&:hover': {
        transform: 'scale(1.15)',
      },
    },
    page: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '2rem',
      maxWidth: '800px',
      margin: 'auto',
      background: isDark ? '#23272a' : '#ffffff',
      borderRadius: '12px',
      boxShadow: isDark ? '0 2px 16px #111' : '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      marginTop: '2rem',
      color: isDark ? '#f7f7fa' : '#1a202c',
      transition: 'background 0.3s, color 0.3s',
    },
    input: {
      fontSize: '1.2rem',
      padding: '0.5rem',
      border: isDark ? '2px solid #444' : '2px solid #e2e8f0',
      borderRadius: '8px',
      width: 'calc(100% - 1rem)',
      maxWidth: '400px',
      marginRight: '0.5rem',
      background: isDark ? '#181a1b' : '#ffffff',
      color: isDark ? '#f7f7fa' : '#1a202c',
      outline: isDark ? '1px solid #3498db' : 'none',
      transition: 'background 0.3s, color 0.3s',
    },
    wordContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      fontSize: '1.5rem',
      marginBottom: '1rem',
      lineHeight: '2.5rem',
      marginTop: '100px',
    },
    controlsContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1rem',
      gap: '1rem',
    },
    showListBtn: {
      fontSize: '1rem',
      padding: '0.6rem 1.2rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.12)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.16)',
      },
    },

    streakContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1rem',
    },
    streakCard: {
      background: isDark ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' : 'linear-gradient(135deg, #ff7675, #e17055)',
      color: '#fff',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: isDark ? '0 4px 15px rgba(255, 107, 107, 0.3)' : '0 4px 15px rgba(255, 118, 117, 0.3)',
      textAlign: 'center',
      minWidth: '200px',
    },
    streakCurrent: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    streakLongest: {
      fontSize: '0.9rem',
      opacity: 0.9,
      marginBottom: '0.5rem',
    },
    streakWarning: {
      fontSize: '0.8rem',
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '0.3rem 0.6rem',
      borderRadius: '6px',
      marginTop: '0.5rem',
    },
    wordItem: {
      listStyle: 'none',
      fontSize: '1.2rem',
      padding: '0.5rem',
      margin: '0.3rem 0',
      borderBottom: isDark ? '1px solid #333' : '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '400px',
    },
    removeBtn: {
      marginLeft: '1rem',
      cursor: 'pointer',
      border: 'none',
      background: isDark ? 'rgba(255, 118, 117, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      fontSize: '1.1rem',
      color: isDark ? '#ff7675' : '#ef4444',
      transition: 'all 0.2s ease',
      borderRadius: '8px',
      padding: '0.5rem 0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
      fontWeight: 600,
      '&:hover': {
        background: isDark ? 'rgba(255, 118, 117, 0.2)' : 'rgba(239, 68, 68, 0.15)',
        transform: 'scale(1.05)',
      },
    },
    addBtn: {
      fontSize: '1.05rem',
      padding: '0.85rem 2rem',
      background: isDark ? '#27ae60' : '#10b981',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      boxShadow: isDark ? '0 2px 8px rgba(39, 174, 96, 0.3)' : '0 2px 8px rgba(16, 185, 129, 0.25)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: isDark ? '0 4px 12px rgba(39, 174, 96, 0.4)' : '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
    },
    clearBtn: {
      fontSize: '1rem',
      padding: '0.5rem 1rem',
      marginLeft: '0.5rem',
      background: isDark ? '#c0392b' : '#c0392b',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    redoBtn: {
      marginTop: '1rem',
      fontSize: '1rem',
      padding: '0.5rem 1rem',
      background: isDark ? '#2980b9' : '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    hiddenInput: {
      position: 'absolute',
      left: '-9999px',
      opacity: 0,
    },
    manageTitle: {
      fontSize: '1.8rem',
      fontWeight: 700,
      marginBottom: '0.5rem',
      letterSpacing: '-0.02em',
      color: isDark ? '#f7f7fa' : '#1a202c',
      textAlign: 'center',
    },
    manageSubtitle: {
      fontSize: '0.95rem',
      fontWeight: 400,
      marginBottom: '2rem',
      color: isDark ? '#b0b0b0' : '#64748b',
      textAlign: 'center',
    },
    manageInputRow: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '2rem',
      gap: '0.75rem',
      maxWidth: '500px',
      margin: '0 auto 2rem auto',
    },
    manageInput: {
      fontSize: '1.05rem',
      padding: '0.85rem 1rem',
      border: isDark ? '2px solid #444' : '2px solid #e2e8f0',
      borderRadius: '10px',
      width: '100%',
      background: isDark ? '#181a1b' : '#ffffff',
      color: isDark ? '#f7f7fa' : '#1a202c',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      '&:focus': {
        borderColor: isDark ? '#3498db' : '#4f46e5',
        boxShadow: isDark ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : '0 0 0 3px rgba(79, 70, 229, 0.1)',
      },
    },
    manageList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    manageListItem: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      background: isDark ? '#23272a' : '#f9fafb',
      borderRadius: '12px',
      padding: '1.1rem 1.3rem',
      marginBottom: '0.8rem',
      boxShadow: isDark ? '0 1px 4px #111' : '0 1px 3px rgba(0,0,0,0.05)',
      border: isDark ? '1px solid #333' : '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: isDark ? '0 2px 8px #111' : '0 2px 8px rgba(0,0,0,0.1)',
        transform: 'translateY(-1px)',
      },
    },
    manageWord: {
      fontWeight: 600,
      fontSize: '1.15rem',
      color: isDark ? '#f7f7fa' : '#1a202c',
      marginBottom: '0.3rem',
    },

    storageIndicator: {
      textAlign: 'center',
      marginBottom: '1rem',
    },
    onlineIndicator: {
      display: 'inline-block',
      padding: '0.4rem 0.8rem',
      background: isDark ? 'rgba(46, 204, 113, 0.2)' : 'rgba(16, 185, 129, 0.1)',
      color: isDark ? '#2ecc71' : '#059669',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 600,
      border: isDark ? '1px solid #2ecc71' : '1px solid #10b981',
    },
    localIndicator: {
      display: 'inline-block',
      padding: '0.4rem 0.8rem',
      background: isDark ? 'rgba(52, 152, 219, 0.2)' : 'rgba(59, 130, 246, 0.1)',
      color: isDark ? '#3498db' : '#2563eb',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 600,
      border: isDark ? '1px solid #3498db' : '1px solid #3b82f6',
    },

    searchContainer: {
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    searchInput: {
      width: '100%',
      maxWidth: '600px',
      fontSize: '1rem',
      padding: '0.85rem 1.2rem',
      border: isDark ? '2px solid #444' : '2px solid #e2e8f0',
      borderRadius: '12px',
      background: isDark ? '#181a1b' : '#f9fafb',
      color: isDark ? '#f7f7fa' : '#1a202c',
      outline: 'none',
      transition: 'all 0.2s ease',
      '&:focus': {
        borderColor: isDark ? '#3498db' : '#4f46e5',
        boxShadow: isDark ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : '0 0 0 3px rgba(79, 70, 229, 0.1)',
        background: isDark ? '#181a1b' : '#ffffff',
      },
    },

    addWordContainer: {
      marginBottom: '1.5rem',
    },
    descriptionRow: {
      display: 'flex',
      justifyContent: 'center',
    },
    descriptionInput: {
      width: '100%',
      fontSize: '0.95rem',
      padding: '0.85rem 1rem',
      border: isDark ? '2px solid #444' : '2px solid #e2e8f0',
      borderRadius: '10px',
      background: isDark ? '#181a1b' : '#ffffff',
      color: isDark ? '#f7f7fa' : '#64748b',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      '&:focus': {
        borderColor: isDark ? '#3498db' : '#4f46e5',
        boxShadow: isDark ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : '0 0 0 3px rgba(79, 70, 229, 0.1)',
      },
    },

    wordContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
      flex: 1,
    },
    wordDescription: {
      fontSize: '0.9rem',
      color: isDark ? '#b0b0b0' : '#64748b',
      lineHeight: '1.5',
      marginTop: '0.2rem',
    },
    wordLabel: {
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: isDark ? '#666' : '#9ca3af',
      marginBottom: '0.2rem',
    },

    addWordButton: {
      fontSize: '1rem',
      padding: '0.75rem 1.5rem',
      background: isDark ? '#27ae60' : '#10b981',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      boxShadow: isDark ? '0 2px 8px rgba(39, 174, 96, 0.3)' : '0 2px 8px rgba(16, 185, 129, 0.25)',
      whiteSpace: 'nowrap',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: isDark ? '0 4px 12px rgba(39, 174, 96, 0.4)' : '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
    },

    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease',
    },

    modalContent: {
      background: isDark ? '#23272a' : '#ffffff',
      borderRadius: '16px',
      boxShadow: isDark ? '0 20px 60px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(0, 0, 0, 0.15)',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      animation: 'slideUp 0.3s ease',
    },

    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      borderBottom: isDark ? '1px solid #333' : '1px solid #e2e8f0',
    },

    modalTitle: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 700,
      color: isDark ? '#f7f7fa' : '#1a202c',
      letterSpacing: '-0.02em',
    },

    modalCloseBtn: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      color: isDark ? '#b0b0b0' : '#64748b',
      cursor: 'pointer',
      padding: '0.25rem',
      width: '2rem',
      height: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        color: isDark ? '#f7f7fa' : '#1a202c',
      },
    },

    modalBody: {
      padding: '1.5rem',
    },

    modalFormGroup: {
      marginBottom: '1.25rem',
    },

    modalLabel: {
      display: 'block',
      fontSize: '0.9rem',
      fontWeight: 600,
      color: isDark ? '#f7f7fa' : '#1a202c',
      marginBottom: '0.5rem',
    },

    modalInput: {
      width: '100%',
      fontSize: '1rem',
      padding: '0.85rem 1rem',
      border: isDark ? '2px solid #444' : '2px solid #e2e8f0',
      borderRadius: '10px',
      background: isDark ? '#181a1b' : '#f9fafb',
      color: isDark ? '#f7f7fa' : '#1a202c',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      '&:focus': {
        borderColor: isDark ? '#3498db' : '#4f46e5',
        boxShadow: isDark ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : '0 0 0 3px rgba(79, 70, 229, 0.1)',
        background: isDark ? '#181a1b' : '#ffffff',
      },
    },

    modalActions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
      marginTop: '1.5rem',
    },

    modalCancelBtn: {
      fontSize: '1rem',
      padding: '0.75rem 1.5rem',
      background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
      color: isDark ? '#f7f7fa' : '#1a202c',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      '&:hover': {
        background: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
      },
    },

    modalAddBtn: {
      fontSize: '1rem',
      padding: '0.75rem 1.5rem',
      background: isDark ? '#27ae60' : '#10b981',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      boxShadow: isDark ? '0 2px 8px rgba(39, 174, 96, 0.3)' : '0 2px 8px rgba(16, 185, 129, 0.25)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: isDark ? '0 4px 12px rgba(39, 174, 96, 0.4)' : '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
      },
    },

    confirmModalContent: {
      background: isDark ? '#23272a' : '#ffffff',
      borderRadius: '16px',
      boxShadow: isDark ? '0 20px 60px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(0, 0, 0, 0.15)',
      width: '90%',
      maxWidth: '450px',
      animation: 'slideUp 0.3s ease',
    },

    confirmMessage: {
      fontSize: '1rem',
      color: isDark ? '#f7f7fa' : '#1a202c',
      marginBottom: '0.75rem',
      lineHeight: '1.5',
    },

    confirmSubMessage: {
      fontSize: '0.9rem',
      color: isDark ? '#b0b0b0' : '#64748b',
      marginBottom: '1.5rem',
      lineHeight: '1.5',
    },

    modalDeleteBtn: {
      fontSize: '1rem',
      padding: '0.75rem 1.5rem',
      background: isDark ? '#e74c3c' : '#ef4444',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      boxShadow: isDark ? '0 2px 8px rgba(231, 76, 60, 0.3)' : '0 2px 8px rgba(239, 68, 68, 0.25)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: isDark ? '0 4px 12px rgba(231, 76, 60, 0.4)' : '0 4px 12px rgba(239, 68, 68, 0.3)',
        background: isDark ? '#c0392b' : '#dc2626',
      },
    },

    authForm: {
      maxWidth: '400px',
      margin: '0 auto',
    },
    formGroup: {
      marginBottom: '1rem',
    },
    authInput: {
      width: '100%',
      fontSize: '1.1rem',
      padding: '0.7rem',
      border: isDark ? '2px solid #444' : '2px solid #e2e8f0',
      borderRadius: '8px',
      background: isDark ? '#181a1b' : '#ffffff',
      color: isDark ? '#f7f7fa' : '#1a202c',
      outline: isDark ? '1px solid #3498db' : 'none',
      transition: 'background 0.3s, color 0.3s',
      boxSizing: 'border-box',
    },
    authButton: {
      width: '100%',
      fontSize: '1.1rem',
      padding: '0.7rem',
      background: isDark ? '#27ae60' : '#4f46e5',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      fontWeight: 600,
    },
    authSwitch: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: isDark ? '#f7f7fa' : '#1a202c',
    },
    authSwitchButton: {
      background: 'none',
      border: 'none',
      color: isDark ? '#3498db' : '#4f46e5',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontSize: '1rem',
      marginLeft: '0.5rem',
    },
    errorMessage: {
      background: isDark ? '#c0392b' : '#fee2e2',
      color: isDark ? '#fff' : '#991b1b',
      padding: '0.7rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      border: isDark ? '1px solid #e74c3c' : '1px solid #fca5a5',
    },

    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem',
      padding: '0.5rem 0',
      whiteSpace: 'nowrap',
    },

    authButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    authHeaderBtn: {
      fontSize: '0.9rem',
      padding: '0.4rem 0.8rem',
      background: 'rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: 600,
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      },
    },
    userName: {
      fontSize: '1rem',
      color: '#ffffff',
      fontWeight: 600,
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
    },
    logoutBtn: {
      fontSize: '0.9rem',
      padding: '0.5rem 1rem',
      background: isDark ? 'rgba(231, 76, 60, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      color: isDark ? '#ff7675' : '#ef4444',
      border: isDark ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: 600,
      backdropFilter: 'blur(10px)',
      whiteSpace: 'nowrap',
      marginLeft: 'auto',
      '&:hover': {
        background: isDark ? 'rgba(231, 76, 60, 0.25)' : 'rgba(239, 68, 68, 0.15)',
        transform: 'translateY(-1px)',
        boxShadow: isDark ? '0 2px 8px rgba(231, 76, 60, 0.3)' : '0 2px 8px rgba(239, 68, 68, 0.2)',
      },
    },

    headerStreak: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.4rem 0.8rem',
    },
    headerStreakContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.2rem',
    },
    headerStreakCurrent: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#ffffff',
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    },
    headerStreakBest: {
      fontSize: '0.7rem',
      color: '#ffffff',
      opacity: 0.8,
      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    },
    headerStreakLoading: {
      fontSize: '1.1rem',
      color: '#ffffff',
      opacity: 0.8,
    },
  };
}
