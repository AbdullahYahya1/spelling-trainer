import React, { useState, useEffect, useRef } from 'react';
import { phonogramsData } from '../data/phonogramsData';
import { phonogramService } from '../services/phonogramService';

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function PhonogramsPage({ themedStyles, theme }) {
  const [progress, setProgress] = useState({ patternIndex: 0, soundIndex: 0, exampleIndex: 0 });
  const [currentWords, setCurrentWords] = useState([]);
  const [typedWords, setTypedWords] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [showList, setShowList] = useState(false);
  const inputRef = useRef(null);

  const phonograms = phonogramsData.phonograms;
  const currentPhonogram = phonograms[progress.patternIndex];
  const currentSound = currentPhonogram?.sounds[progress.soundIndex];

  // Load progress and initialize words
  useEffect(() => {
    const savedProgress = phonogramService.getProgress();
    setProgress(savedProgress);
  }, []);

  // Generate words for current sound
  useEffect(() => {
    if (currentSound) {
      setCurrentWords(shuffleArray([...currentSound.examples]));
      setTypedWords([]);
      setCurrentInput('');
      setHasStartedTyping(false);
    }
  }, [progress.patternIndex, progress.soundIndex, currentSound]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [typedWords, currentWords]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    
    if (val.length > 0 && !hasStartedTyping) {
      setHasStartedTyping(true);
    }
    
    if (val.endsWith(' ')) {
      const word = val.trim();
      
      setTypedWords([...typedWords, word]);
      setCurrentInput('');
      setHasStartedTyping(false);
      
      // Check if this was the last word
      if (typedWords.length + 1 === currentWords.length) {
        // Move to next sound or pattern after a short delay
        setTimeout(() => {
          moveToNext();
        }, 500);
      }
    } else {
      setCurrentInput(val);
    }
  };

  const moveToNext = () => {
    const nextSoundIndex = progress.soundIndex + 1;
    
    if (nextSoundIndex < currentPhonogram.sounds.length) {
      // Move to next sound in current pattern
      const newProgress = {
        patternIndex: progress.patternIndex,
        soundIndex: nextSoundIndex,
        exampleIndex: 0
      };
      setProgress(newProgress);
      phonogramService.saveProgress(newProgress.patternIndex, newProgress.soundIndex, newProgress.exampleIndex);
    } else {
      // Move to next pattern
      const nextPatternIndex = progress.patternIndex + 1;
      
      if (nextPatternIndex < phonograms.length) {
        const newProgress = {
          patternIndex: nextPatternIndex,
          soundIndex: 0,
          exampleIndex: 0
        };
        setProgress(newProgress);
        phonogramService.saveProgress(newProgress.patternIndex, newProgress.soundIndex, newProgress.exampleIndex);
      } else {
        // Completed all patterns
        const newProgress = {
          patternIndex: 0,
          soundIndex: 0,
          exampleIndex: 0
        };
        setProgress(newProgress);
        phonogramService.saveProgress(newProgress.patternIndex, newProgress.soundIndex, newProgress.exampleIndex);
      }
    }
  };

  const moveToPrevious = () => {
    const prevSoundIndex = progress.soundIndex - 1;
    
    if (prevSoundIndex >= 0) {
      // Move to previous sound in current pattern
      const newProgress = {
        patternIndex: progress.patternIndex,
        soundIndex: prevSoundIndex,
        exampleIndex: 0
      };
      setProgress(newProgress);
      phonogramService.saveProgress(newProgress.patternIndex, newProgress.soundIndex, newProgress.exampleIndex);
    } else {
      // Move to previous pattern
      const prevPatternIndex = progress.patternIndex - 1;
      
      if (prevPatternIndex >= 0) {
        const prevPhonogram = phonograms[prevPatternIndex];
        const newProgress = {
          patternIndex: prevPatternIndex,
          soundIndex: prevPhonogram.sounds.length - 1,
          exampleIndex: 0
        };
        setProgress(newProgress);
        phonogramService.saveProgress(newProgress.patternIndex, newProgress.soundIndex, newProgress.exampleIndex);
      }
    }
  };

  const resetProgress = () => {
    const newProgress = { patternIndex: 0, soundIndex: 0, exampleIndex: 0 };
    setProgress(newProgress);
    phonogramService.resetProgress();
    setTypedWords([]);
    setCurrentInput('');
    setHasStartedTyping(false);
  };

  const resetCurrentTest = () => {
    setTypedWords([]);
    setCurrentInput('');
    setHasStartedTyping(false);
    setCurrentWords(shuffleArray([...currentSound.examples]));
    inputRef.current?.focus();
  };

  const getWordStatus = (word, i) => {
    const typed = typedWords[i];
    if (!typed) return 'pending';
    if (typed === word) return 'correct';
    return 'incorrect';
  };

  if (!currentPhonogram || !currentSound) {
    return (
      <div style={themedStyles.page}>
        <h2>No phonogram patterns available.</h2>
      </div>
    );
  }

  return (
    <div style={themedStyles.page} onClick={() => inputRef.current?.focus()}>
      <h2 style={phonogramStyles.mainTitle}>
        📚 Phonogram Practice
      </h2>
      
      {/* Progress Indicator */}
      <div style={phonogramStyles.progressContainer}>
        <div style={phonogramStyles.progressText(theme)}>
          Pattern {progress.patternIndex + 1} of {phonograms.length} • 
          Sound {progress.soundIndex + 1} of {currentPhonogram.sounds.length}
        </div>
        <div style={phonogramStyles.progressBar}>
          <div 
            style={{
              ...phonogramStyles.progressFill(theme),
              width: `${((progress.patternIndex * 100) + ((progress.soundIndex + 1) / currentPhonogram.sounds.length * 100)) / phonograms.length}%`
            }}
          />
        </div>
      </div>

      {/* Pattern Card */}
      <div style={phonogramStyles.patternCard(theme)}>
        <div style={phonogramStyles.patternHeader}>
          <span style={phonogramStyles.patternBadge(theme)}>{currentPhonogram.pattern}</span>
          <span style={phonogramStyles.soundBadge(theme)}>{currentSound.sound}</span>
        </div>
        <p style={phonogramStyles.explanation}>{currentSound.explanation}</p>
        {currentPhonogram.notes && (
          <p style={phonogramStyles.notes}>
            💡 <em>{currentPhonogram.notes}</em>
          </p>
        )}
      </div>

      {/* Controls */}
      <div style={themedStyles.controlsContainer}>
        <button 
          onClick={moveToPrevious}
          disabled={progress.patternIndex === 0 && progress.soundIndex === 0}
          style={{
            ...phonogramStyles.navButton(theme),
            opacity: progress.patternIndex === 0 && progress.soundIndex === 0 ? 0.5 : 1,
            cursor: progress.patternIndex === 0 && progress.soundIndex === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Previous
        </button>
        
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

        <button 
          onClick={moveToNext}
          style={phonogramStyles.navButton(theme)}
        >
          Next →
        </button>
      </div>

      {/* Typing Area */}
      <h3 style={phonogramStyles.instructionText}>
        Type these words: {currentInput && <span style={{ color: 'gray' }}>&quot;{currentInput}&quot;</span>}
      </h3>

      <div style={themedStyles.wordContainer}>
        {currentWords.map((word, i) => {
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

      <div style={phonogramStyles.buttonContainer}>
        <button onClick={resetCurrentTest} style={{...themedStyles.redoBtn, marginRight: '1rem'}}>
          Redo Current Test
        </button>
        <button 
          onClick={resetProgress} 
          style={{
            ...themedStyles.redoBtn,
            background: theme === 'dark' ? '#c0392b' : '#e74c3c'
          }}
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );
}

const phonogramStyles = {
  mainTitle: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '2rem',
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: '2rem',
  },
  progressText: (theme) => ({
    textAlign: 'center',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    color: theme === 'dark' ? '#b0b0b0' : '#666',
    fontWeight: '600',
  }),
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  progressFill: (theme) => ({
    height: '100%',
    background: theme === 'dark' 
      ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.5s ease',
    borderRadius: '10px',
  }),
  patternCard: (theme) => ({
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    boxShadow: theme === 'dark' 
      ? '0 4px 20px rgba(0,0,0,0.3)' 
      : '0 4px 20px rgba(102, 126, 234, 0.15)',
  }),
  patternHeader: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  patternBadge: (theme) => ({
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  }),
  soundBadge: (theme) => ({
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '1.2rem',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }),
  explanation: {
    color: '#ffffff',
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    lineHeight: '1.6',
  },
  notes: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.95rem',
    marginTop: '1rem',
    padding: '0.8rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  navButton: (theme) => ({
    fontSize: '1rem',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    border: 'none',
    background: theme === 'dark' ? '#3498db' : '#2980b9',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '600',
    boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
  }),
  instructionText: {
    textAlign: 'center',
    fontSize: '1.2rem',
    marginBottom: '1rem',
    marginTop: '2rem',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1rem',
  },
};

