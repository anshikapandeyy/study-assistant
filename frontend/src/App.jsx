import React, { useState, useEffect, useRef } from 'react';
import { TextInput } from './components/TextInput';
import { FlashcardViewer } from './components/FlashcardViewer';
import { QuizViewer } from './components/QuizViewer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { generateStudyMaterials } from './utils/aiClient';
import { Brain, BookOpen, CheckSquare, History, Trash2, PlusCircle, Calendar } from 'lucide-react';

export default function App() {
  const [activeTool, setActiveTool] = useState('input'); // 'input' | 'flashcards' | 'quiz'
  const [studyData, setStudyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedSessions, setSavedSessions] = useState([]);
  
  // Cache to store user inputs in case of errors
  const [lastInput, setLastInput] = useState({ type: 'notes', content: '' });

  // Store ref to AbortController to prevent race conditions
  const abortControllerRef = useRef(null);

  // Load saved sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('study_sessions');
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load sessions from localStorage', e);
    }
  }, []);

  const saveSession = (newSet) => {
    const session = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      ...newSet
    };

    const updated = [session, ...savedSessions].slice(0, 10); // Keep last 10 sets
    setSavedSessions(updated);
    localStorage.setItem('study_sessions', JSON.stringify(updated));
  };

  const deleteSession = (id, e) => {
    e.stopPropagation(); // Avoid loading the session
    const updated = savedSessions.filter(s => s.id !== id);
    setSavedSessions(updated);
    localStorage.setItem('study_sessions', JSON.stringify(updated));
  };

  const handleGenerate = async (type, content) => {
    // 1. Abort any previous pending requests to prevent race conditions (stale overwrites newer)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. Initialize new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Cache input
    setLastInput({ type, content });
    setIsLoading(true);
    setError(null);

    try {
      const params = type === 'notes' ? { notes: content } : { topic: content };
      const data = await generateStudyMaterials({
        ...params,
        signal: controller.signal
      });

      setStudyData(data);
      saveSession(data);
      setActiveTool('flashcards'); // default view is flashcards
    } catch (err) {
      // Avoid state updates if request was aborted (since a newer request is running)
      if (err.name === 'AbortError') {
        console.log('Skipping error state update: Request was aborted.');
        return;
      }
      setError(err.message || 'An error occurred during generation.');
    } finally {
      // Only reset loading if this is the active controller
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    if (!lastInput.content) return;
    handleGenerate(lastInput.type, lastInput.content);
  };

  const handleReset = () => {
    // Abort pending calls if going back
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setActiveTool('input');
    setStudyData(null);
    setError(null);
    setIsLoading(false);
  };

  const loadSession = (session) => {
    setStudyData({
      title: session.title,
      flashcards: session.flashcards,
      quiz: session.quiz
    });
    setActiveTool('flashcards');
  };

  return (
    <div className="container">
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Brain style={{ color: 'var(--primary)' }} size={32} />
          Study Assistant
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 400 }}>
          Turn notes and topics into interactive flashcards and quizzes instantly.
        </p>
      </header>

      {/* Main UI */}
      <main>
        {activeTool === 'input' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <TextInput
              onGenerate={handleGenerate}
              isLoading={isLoading}
              error={error}
              onRetry={handleRetry}
            />

            {/* Saved Sessions History */}
            {savedSessions.length > 0 && (
              <div className="glass fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={18} style={{ color: 'var(--accent)' }} />
                  Recent Study Sets
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  {savedSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className="glass-interactive"
                      style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                        <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                          <Calendar size={12} /> {session.timestamp} • {session.flashcards.length} cards • {session.quiz.length} questions
                        </span>
                      </div>
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => deleteSession(session.id, e)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'rgba(239, 68, 68, 0.05)', color: '#f87171' }}
                        title="Delete study set"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="fade-in">
            {/* Study Mode Navigation Bar */}
            <div className="glass" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', marginBottom: '2rem', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <PlusCircle size={16} /> New Set
                </button>
                <div style={{ borderLeft: '1px solid var(--border-color)', height: '24px' }}></div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {studyData?.title}
                </h2>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.2)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                <button
                  onClick={() => setActiveTool('flashcards')}
                  className={`btn ${activeTool === 'flashcards' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem', border: 'none', background: activeTool === 'flashcards' ? undefined : 'transparent' }}
                >
                  <BookOpen size={14} /> Flashcards ({studyData?.flashcards.length})
                </button>
                <button
                  onClick={() => setActiveTool('quiz')}
                  className={`btn ${activeTool === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem', border: 'none', background: activeTool === 'quiz' ? undefined : 'transparent' }}
                >
                  <CheckSquare size={14} /> Quiz ({studyData?.quiz.length})
                </button>
              </div>
            </div>

            {/* ErrorBoundary wrapping interactive workspace to protect from crashing */}
            <ErrorBoundary onReset={handleReset}>
              {activeTool === 'flashcards' && (
                <FlashcardViewer 
                  flashcards={studyData.flashcards} 
                  onBackToInput={handleReset} 
                />
              )}
              {activeTool === 'quiz' && (
                <QuizViewer 
                  quizQuestions={studyData.quiz} 
                  onBackToInput={handleReset} 
                />
              )}
            </ErrorBoundary>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer style={{ marginTop: '5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
        <p>© 2026 Study Assistant • Powered by Google Gemini</p>
      </footer>
    </div>
  );
}
