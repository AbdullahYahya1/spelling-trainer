import React, { useEffect, useState, useRef } from 'react';

const LOCAL_STORAGE_KEY = 'spellingWords';

const getWordsFromLocalStorage = () => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? stored.split(',').map(w => w.trim()).filter(Boolean) : [];
};

const setWordsToLocalStorage = (words) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, words.join(','));
};

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
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.style.background = theme === 'dark' ? '#181a1b' : '#f7f7fa';
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const themedStyles = getThemedStyles(theme);

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
          <button
            onClick={toggleTheme}
            style={themedStyles.themeToggleBtn}
            aria-label="Toggle dark/light mode"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </nav>
      </header>
      {page === 'typing' ? <TypingPage themedStyles={themedStyles} /> : <WordManagerPage themedStyles={themedStyles} />}
    </div>
  );
}

function TypingPage({ themedStyles }) {
  const [wordList, setWordList] = useState([]);
  const [typedWords, setTypedWords] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const inputRef = useRef(null);

  const loadWords = () => {
    const words = getWordsFromLocalStorage();
    setWordList(shuffleArray(words));
  };

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [typedWords, wordList]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.endsWith(' ')) {
      const word = val.trim();
      setTypedWords([...typedWords, word]);
      setCurrentInput('');
    } else {
      setCurrentInput(val);
    }
  };

  const resetTest = () => {
    setTypedWords([]);
    setCurrentInput('');
    loadWords();
    inputRef.current?.focus();
  };

  const getWordStatus = (word, i) => {
    const typed = typedWords[i];
    if (!typed) return 'pending';
    if (typed === word) return 'correct';
    return 'incorrect';
  };

  if (!wordList.length) {
    return (
      <div style={themedStyles.page}>
        <h2>No words in local storage.</h2>
        <p>Add some on the "Manage Words" page.</p>
      </div>
    );
  }

  return (
    <div style={themedStyles.page} onClick={() => inputRef.current?.focus()}>
      <h2>
        Typing Practice {currentInput && <span style={{ color: 'gray' }}>&quot;{currentInput}&quot;</span>}
      </h2>
      <div style={themedStyles.wordContainer}>
        {wordList.map((word, i) => {
          if (i === typedWords.length) {
            return (
              <span
                key={i}
                style={{
                  marginRight: '0.8rem',
                  borderBottom: '2px solid #3498db',
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

  useEffect(() => {
    setWords(getWordsFromLocalStorage());
  }, []);

  const addWord = () => {
    const word = newWord.trim();
    if (word && !words.includes(word)) {
      const updated = [...words, word];
      setWords(updated);
      setWordsToLocalStorage(updated);
      setNewWord('');
    }
  };

  const removeWord = (wordToRemove) => {
    const updated = words.filter((w) => w !== wordToRemove);
    setWords(updated);
    setWordsToLocalStorage(updated);
  };

  return (
    <div style={themedStyles.page}>
      <h2 style={themedStyles.manageTitle}>Manage Words</h2>
      <div style={themedStyles.manageInputRow}>
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Enter a new word"
          style={themedStyles.manageInput}
          aria-label="Enter a new word"
        />
        <button onClick={addWord} style={themedStyles.addBtn}>
          Add
        </button>
      </div>
      {words.length === 0 ? (
        <p>No words added yet.</p>
      ) : (
        <ul style={themedStyles.manageList}>
          {words.map((word, i) => (
            <li key={i} style={themedStyles.manageListItem}>
              <span style={themedStyles.manageWord}>{word}</span>
              <button onClick={() => removeWord(word)} style={themedStyles.removeBtn} aria-label={`Remove ${word}`}>
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
      backgroundColor: isDark ? '#23272a' : '#ffffff',
      boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      borderBottom: isDark ? '1px solid #333' : '1px solid #eee',
    },
    title: {
      margin: 0,
      fontSize: '1.7rem',
      fontWeight: 700,
      color: isDark ? '#f7f7fa' : '#333',
      fontFamily: 'sans-serif',
      letterSpacing: '0.02em',
      textShadow: isDark ? '0 1px 2px #000' : 'none',
    },
    nav: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem',
      alignItems: 'center',
    },
    navLink: {
      fontSize: '1rem',
      color: isDark ? '#b3d1f7' : '#3498db',
      textDecoration: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      fontWeight: 500,
      transition: 'background 0.2s, color 0.2s',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      outline: 'none',
      position: 'relative',
      display: 'inline-block',
    },
    navLinkActive: {
      background: isDark ? '#3498db' : '#eaf6ff',
      color: isDark ? '#fff' : '#3498db',
      fontWeight: 700,
      textDecoration: 'underline',
    },
    themeToggleBtn: {
      marginLeft: '1rem',
      fontSize: '1.1rem',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      border: isDark ? '1px solid #444' : '1px solid #ccc',
      background: isDark ? '#23272a' : '#fff',
      color: isDark ? '#f7f7fa' : '#333',
      cursor: 'pointer',
      transition: 'all 0.2s',
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
  };
}
