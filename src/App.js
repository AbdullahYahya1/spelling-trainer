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
  const [authPage, setAuthPage] = useState(''); // 'login' or 'register' or '' for none
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.style.background = theme === 'dark' ? '#181a1b' : '#f7f7fa';
  }, [theme]);

  // Load streak when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadStreak();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      const hasToken = authService.isAuthenticated();
      
      if (hasToken) {
        const result = await authService.validateToken();
        
        if (result.success) {
          setIsAuthenticated(true);
          setUser(authService.getCurrentUser());
          storageService.setOnlineMode(true);
        } else {
          // Token is invalid or expired
          authService.logout();
          storageService.setOnlineMode(false);
          setAuthPage('login'); // Show login page if token is invalid
          
          // Show a brief message if token was expired
          if (result.expired) {
            // Session expired, user will be redirected to login
          }
        }
      } else {
        storageService.setOnlineMode(false);
        setAuthPage('login'); // Show login page if no token
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Periodic token expiration check
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = () => {
      if (authService.isAuthenticated()) {
        // Token is still valid
        return;
      } else {
        // Token has expired, logout user
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        storageService.setOnlineMode(false);
        setAuthPage('login');
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleLogin = async () => {
    setIsAuthenticated(true);
    setUser(authService.getCurrentUser());
    storageService.setOnlineMode(true);
    
    // Sync local words to online storage
    const syncResult = await storageService.syncLocalToOnline();
    if (syncResult.success && syncResult.synced > 0) {
      // Words synced to online storage
    }
    
    // Redirect to main app
    setAuthPage('');
  };

  const handleRegister = async () => {
    setIsAuthenticated(true);
    setUser(authService.getCurrentUser());
    storageService.setOnlineMode(true);
    
    // Sync local words to online storage
    const syncResult = await storageService.syncLocalToOnline();
    if (syncResult.success && syncResult.synced > 0) {
      // Words synced to online storage
    }
    
    // Redirect to main app
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

  // Show authentication pages only if user is trying to authenticate and not already authenticated
  if ((authPage === 'login' || authPage === 'register') && !isAuthenticated) {
    return (
      <div style={themedStyles.appWrapper}>
        <header style={themedStyles.header}>
          <h1 style={themedStyles.title}>📝 Spelling Practice</h1>
          <div style={themedStyles.nav}>
            <button
              onClick={() => setAuthPage('')}
              style={themedStyles.themeToggleBtn}
              aria-label="Back to app"
            >
              ← Back to App
            </button>
            <button
              onClick={toggleTheme}
              style={themedStyles.themeToggleBtn}
              aria-label="Toggle dark/light mode"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
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
        <h1 style={themedStyles.title}>📝 Spelling Practice</h1>
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
                <span style={themedStyles.userName}>👤 {user?.username}</span>
                <button
                  onClick={handleLogout}
                  style={themedStyles.logoutBtn}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
              
              {/* Streak Display in Header */}
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
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
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
      // Extract just the text for typing practice
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

  const handleInputChange = async (e) => {
    const val = e.target.value;
    
    // Track if user has started typing
    if (val.length > 0 && !hasStartedTyping) {
      setHasStartedTyping(true);
    }
    
    if (val.endsWith(' ')) {
      const word = val.trim();
      const currentWordIndex = typedWords.length;
      const isCorrect = word === wordList[currentWordIndex];
      
      setTypedWords([...typedWords, word]);
      setCurrentInput('');
      setHasStartedTyping(false); // Reset for next word
      
      // Record practice result
      if (wordList[currentWordIndex]) {
        await storageService.recordPractice(wordList[currentWordIndex], isCorrect);
        
        // Update streak when practice is completed
        if (typedWords.length + 1 === wordList.length) {
          await updateStreak();
        }
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
          onClick={() => setShowList(!showList)} 
          style={{
            ...themedStyles.showListBtn,
            background: showList ? (theme === 'dark' ? '#27ae60' : '#4CAF50') : (theme === 'dark' ? '#444' : '#ccc'),
            color: showList ? '#fff' : (theme === 'dark' ? '#f7f7fa' : '#222')
          }}
        >
          {showList ? '👁️ Hide List' : '👁️ Show List'}
        </button>
      </div>
      
      <div style={themedStyles.wordContainer}>
        {wordList.map((word, i) => {
          if (i === typedWords.length) {
            // Hide current word if showList is enabled and student has started typing
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
      <button onClick={resetTest} style={themedStyles.redoBtn}>
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

  const loadWords = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const wordsList = await storageService.getWords(searchTerm);
      setWords(wordsList);
    } catch (error) {
      console.error('Failed to load words:', error);
      setError('Failed to load words');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadWords();
  }, [searchTerm, loadWords]);

  const addWord = async () => {
    const word = newWord.trim();
    if (!word) return;
    
    // Check for spaces
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
    } else {
      setError(result.error || 'Failed to add word');
    }
  };

  const removeWord = async (wordToRemove) => {
    setError('');
    const result = await storageService.removeWord(wordToRemove);
    
    if (result.success) {
      setWords(words.filter((w) => w.text !== wordToRemove));
    } else {
      setError(result.error || 'Failed to remove word');
    }
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
      <h2 style={themedStyles.manageTitle}>Manage Words</h2>
      
      {/* Storage mode indicator */}
      <div style={themedStyles.storageIndicator}>
        {storageService.isOnline ? (
          <span style={themedStyles.onlineIndicator}>
            🌐 Online Storage (Synced)
          </span>
        ) : (
          <span style={themedStyles.localIndicator}>
            💾 Local Storage Only
          </span>
        )}
      </div>
      
      {/* Search bar */}
      <div style={themedStyles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search words or descriptions..."
          style={themedStyles.searchInput}
        />
      </div>
      
      {error && (
        <div style={themedStyles.errorMessage}>
          {error}
        </div>
      )}
      
      <div style={themedStyles.addWordContainer}>
        <div style={themedStyles.manageInputRow}>
          <input
            type="text"
            value={newWord}
            onChange={(e) => {
              // Remove spaces from input
              const value = e.target.value.replace(/\s/g, '');
              setNewWord(value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addWord();
              } else if (e.key === ' ') {
                // Prevent space key from being typed
                e.preventDefault();
              }
            }}
            placeholder="Enter a new word (no spaces allowed)"
            style={themedStyles.manageInput}
            aria-label="Enter a new word"
          />
          <button onClick={addWord} style={themedStyles.addBtn}>
            Add
          </button>
        </div>
        
        <div style={themedStyles.descriptionRow}>
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addWord()}
            placeholder="Optional: Add description/meaning (e.g., 'a type of fruit')"
            style={themedStyles.descriptionInput}
            aria-label="Enter word description"
          />
        </div>
      </div>
      
      {words.length === 0 ? (
        <p>No words added yet.</p>
      ) : (
        <ul style={themedStyles.manageList}>
          {words.map((word, i) => (
            <li key={i} style={themedStyles.manageListItem}>
              <div style={themedStyles.wordContent}>
                <span style={themedStyles.manageWord}>{word.text}</span>
                {word.description && (
                  <span style={themedStyles.wordDescription}>{word.description}</span>
                )}
              </div>
              <button onClick={() => removeWord(word.text)} style={themedStyles.removeBtn} aria-label={`Remove ${word.text}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getThemedStyles(theme) {
  const isDark = theme === 'dark';
  return {
    appWrapper: {
      minHeight: '100vh',
      background: isDark ? '#181a1b' : '#f7f7fa',
      color: isDark ? '#f7f7fa' : '#222',
      transition: 'background 0.3s, color 0.3s',
    },
    header: {
      background: isDark 
        ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' 
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: isDark 
        ? '0 4px 20px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)' 
        : '0 4px 20px rgba(102, 126, 234, 0.15), 0 2px 8px rgba(0,0,0,0.1)',
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      borderBottom: isDark ? '1px solid #34495e' : '1px solid #e0e6ed',
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
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      letterSpacing: '0.03em',
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
      fontSize: '1rem',
      padding: '0.6rem 1rem',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      fontWeight: 600,
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      },
    },
    page: {
      fontFamily: 'sans-serif',
      padding: '2rem',
      maxWidth: '800px',
      margin: 'auto',
      background: isDark ? '#23272a' : '#fff',
      borderRadius: '12px',
      boxShadow: isDark ? '0 2px 16px #111' : '0 2px 16px #e0e0e0',
      marginTop: '2rem',
      color: isDark ? '#f7f7fa' : '#222',
      transition: 'background 0.3s, color 0.3s',
    },
    input: {
      fontSize: '1.2rem',
      padding: '0.5rem',
      border: isDark ? '2px solid #444' : '2px solid #ccc',
      borderRadius: '4px',
      width: 'calc(100% - 1rem)',
      maxWidth: '400px',
      marginRight: '0.5rem',
      background: isDark ? '#181a1b' : '#fff',
      color: isDark ? '#f7f7fa' : '#222',
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
      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.2)',
      },
    },
    // Streak styles
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
      background: 'transparent',
      fontSize: '1.2rem',
      color: isDark ? '#ff7675' : '#c00',
      transition: 'color 0.2s',
      borderRadius: '50%',
      width: '2rem',
      height: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
    },
    addBtn: {
      fontSize: '1rem',
      padding: '0.5rem 1rem',
      marginLeft: '0.5rem',
      background: isDark ? '#27ae60' : '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background 0.2s',
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
      background: isDark ? '#2980b9' : '#3498db',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
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
      fontSize: '1.3rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      letterSpacing: '0.01em',
      color: isDark ? '#f7f7fa' : '#222',
      textAlign: 'center',
    },
    manageInputRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    manageInput: {
      fontSize: '1.1rem',
      padding: '0.5rem',
      border: isDark ? '2px solid #444' : '2px solid #ccc',
      borderRadius: '6px',
      width: '220px',
      background: isDark ? '#181a1b' : '#fff',
      color: isDark ? '#f7f7fa' : '#222',
      outline: isDark ? '1px solid #3498db' : 'none',
      transition: 'background 0.3s, color 0.3s',
    },
    manageList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      maxWidth: '400px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    manageListItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: isDark ? '#23272a' : '#f3f6fa',
      borderRadius: '8px',
      padding: '0.7rem 1rem',
      marginBottom: '0.7rem',
      boxShadow: isDark ? '0 1px 4px #111' : '0 1px 4px #e0e0e0',
      border: isDark ? '1px solid #333' : '1px solid #dbeafe',
      transition: 'background 0.2s, color 0.2s, border 0.2s',
    },
    manageWord: {
      fontWeight: 500,
      fontSize: '1.1rem',
      color: isDark ? '#f7f7fa' : '#222',
    },
    // Storage indicator styles
    storageIndicator: {
      textAlign: 'center',
      marginBottom: '1rem',
    },
    onlineIndicator: {
      display: 'inline-block',
      padding: '0.4rem 0.8rem',
      background: isDark ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.1)',
      color: isDark ? '#2ecc71' : '#27ae60',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 600,
      border: isDark ? '1px solid #2ecc71' : '1px solid #27ae60',
    },
    localIndicator: {
      display: 'inline-block',
      padding: '0.4rem 0.8rem',
      background: isDark ? 'rgba(52, 152, 219, 0.2)' : 'rgba(52, 152, 219, 0.1)',
      color: isDark ? '#3498db' : '#2980b9',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: 600,
      border: isDark ? '1px solid #3498db' : '1px solid #2980b9',
    },
    // Search styles
    searchContainer: {
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    searchInput: {
      width: '100%',
      maxWidth: '400px',
      fontSize: '1rem',
      padding: '0.7rem 1rem',
      border: isDark ? '2px solid #444' : '2px solid #ccc',
      borderRadius: '25px',
      background: isDark ? '#181a1b' : '#fff',
      color: isDark ? '#f7f7fa' : '#222',
      outline: 'none',
      transition: 'all 0.3s ease',
      '&:focus': {
        borderColor: isDark ? '#3498db' : '#2980b9',
        boxShadow: isDark ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : '0 0 0 3px rgba(52, 152, 219, 0.1)',
      },
    },
    // Add word container styles
    addWordContainer: {
      marginBottom: '1.5rem',
    },
    descriptionRow: {
      marginTop: '0.5rem',
      display: 'flex',
      justifyContent: 'center',
    },
    descriptionInput: {
      width: '100%',
      maxWidth: '400px',
      fontSize: '0.9rem',
      padding: '0.5rem 0.8rem',
      border: isDark ? '1px solid #444' : '1px solid #ccc',
      borderRadius: '6px',
      background: isDark ? '#181a1b' : '#fff',
      color: isDark ? '#f7f7fa' : '#222',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontStyle: 'italic',
    },
    // Word content styles
    wordContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
      flex: 1,
    },
    wordDescription: {
      fontSize: '0.85rem',
      color: isDark ? '#b0b0b0' : '#666',
      fontStyle: 'italic',
      marginTop: '0.2rem',
    },
    // Authentication styles
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
      border: isDark ? '2px solid #444' : '2px solid #ccc',
      borderRadius: '6px',
      background: isDark ? '#181a1b' : '#fff',
      color: isDark ? '#f7f7fa' : '#222',
      outline: isDark ? '1px solid #3498db' : 'none',
      transition: 'background 0.3s, color 0.3s',
      boxSizing: 'border-box',
    },
    authButton: {
      width: '100%',
      fontSize: '1.1rem',
      padding: '0.7rem',
      background: isDark ? '#27ae60' : '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      fontWeight: 600,
    },
    authSwitch: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: isDark ? '#f7f7fa' : '#222',
    },
    authSwitchButton: {
      background: 'none',
      border: 'none',
      color: isDark ? '#3498db' : '#2980b9',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontSize: '1rem',
      marginLeft: '0.5rem',
    },
    errorMessage: {
      background: isDark ? '#c0392b' : '#ffebee',
      color: isDark ? '#fff' : '#c62828',
      padding: '0.7rem',
      borderRadius: '6px',
      marginBottom: '1rem',
      border: isDark ? '1px solid #e74c3c' : '1px solid #f44336',
    },
    // User info styles
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '0.5rem 1rem',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    // Authentication buttons in header
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
      padding: '0.4rem 0.8rem',
      background: 'rgba(231, 76, 60, 0.8)',
      color: '#ffffff',
      border: '1px solid rgba(231, 76, 60, 0.6)',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: 600,
      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        background: 'rgba(231, 76, 60, 1)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
      },
    },
    // Header streak styles
    headerStreak: {
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(255, 107, 107, 0.15)',
      padding: '0.4rem 0.8rem',
      borderRadius: '8px',
      border: '1px solid rgba(255, 107, 107, 0.3)',
      backdropFilter: 'blur(10px)',
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
