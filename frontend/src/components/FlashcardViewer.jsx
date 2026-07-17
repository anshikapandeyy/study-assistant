import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, AlertCircle, Shuffle } from 'lucide-react';

export function FlashcardViewer({ flashcards, onBackToInput }) {
  const [deck, setDeck] = useState(flashcards.map((card, idx) => ({ ...card, originalIndex: idx })));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [needsPracticeIds, setNeedsPracticeIds] = useState(new Set());
  const [completed, setCompleted] = useState(false);

  // Set keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (completed) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowUp':
        case 'KeyM': // Mark Mastered
          e.preventDefault();
          markMastered();
          break;
        case 'ArrowDown':
        case 'KeyP': // Needs Practice
          e.preventDefault();
          markNeedsPractice();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, deck, completed]);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const markMastered = () => {
    const currentCard = deck[currentIndex];
    const newMastered = new Set(masteredIds);
    newMastered.add(currentCard.originalIndex);
    
    const newNeeds = new Set(needsPracticeIds);
    newNeeds.delete(currentCard.originalIndex);
    
    setMasteredIds(newMastered);
    setNeedsPracticeIds(newNeeds);
    handleNext();
  };

  const markNeedsPractice = () => {
    const currentCard = deck[currentIndex];
    const newNeeds = new Set(needsPracticeIds);
    newNeeds.add(currentCard.originalIndex);
    
    const newMastered = new Set(masteredIds);
    newMastered.delete(currentCard.originalIndex);
    
    setNeedsPracticeIds(newNeeds);
    setMasteredIds(newMastered);
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  };

  const handleFullReset = () => {
    setDeck(flashcards.map((card, idx) => ({ ...card, originalIndex: idx })));
    setMasteredIds(new Set());
    setNeedsPracticeIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  };

  const handleStudyNeedsPracticeOnly = () => {
    const practiceDeck = flashcards
      .map((card, idx) => ({ ...card, originalIndex: idx }))
      .filter(card => needsPracticeIds.has(card.originalIndex));
    
    setDeck(practiceDeck);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(false);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (deck.length === 0) {
    return (
      <div className="glass fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <CheckCircle2 size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Flashcards in this deck!</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You've marked all cards as mastered!</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={handleFullReset}>Reset All Cards</button>
          <button className="btn btn-primary" onClick={onBackToInput}>Create New Study Set</button>
        </div>
      </div>
    );
  }

  const currentCard = deck[currentIndex];
  const progressPercent = Math.round(((currentIndex) / deck.length) * 100);
  const masteredPercent = Math.round((masteredIds.size / flashcards.length) * 100);

  if (completed) {
    return (
      <div className="glass fade-in" style={{ padding: '2.5rem', maxWidth: '600px', margin: '2rem auto' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 600, textAlign: 'center', marginBottom: '1.5rem' }}>Deck Complete! 🎉</h3>
        
        {/* Progress Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{masteredIds.size}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mastered ({masteredPercent}%)</span>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 700, color: '#f87171' }}>{needsPracticeIds.size}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Needs Practice</span>
          </div>
        </div>

        {needsPracticeIds.size > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={16} /> Concepts to Review:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {flashcards.filter((_, idx) => needsPracticeIds.has(idx)).map((card, idx) => (
                <div key={idx} style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <strong>Q:</strong> {card.front}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {needsPracticeIds.size > 0 && (
            <button className="btn btn-primary" onClick={handleStudyNeedsPracticeOnly}>
              <RotateCcw size={16} /> Review Wrong Answers ({needsPracticeIds.size})
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleFullReset}>
            <RotateCcw size={16} /> Reset & Restart All
          </button>
          <button className="btn btn-secondary" onClick={onBackToInput}>
            Choose Another Topic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '650px', margin: '0 auto' }}>
      
      {/* HUD Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <span>Card {currentIndex + 1} of {deck.length}</span>
        <span>{masteredPercent}% Mastered total</span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div 
          style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--accent))', transition: 'width 0.3s ease' }} 
        />
      </div>

      {/* 3D Flippable Card */}
      <div className={`card-perspective ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(prev => !prev)}>
        <div className="card-inner">
          
          {/* Card Front */}
          <div className="card-face card-front">
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 600 }}>Front / Term</span>
            <p style={{ fontSize: '1.35rem', fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word' }}>
              {currentCard.front}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginTop: 'auto' }}>Click to flip or press Space</span>
          </div>

          {/* Card Back */}
          <div className="card-face card-back">
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 600 }}>Back / Definition</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 400, lineHeight: 1.6, wordBreak: 'break-word', overflowY: 'auto', maxHeight: '200px', width: '100%', paddingRight: '0.25rem' }}>
              {currentCard.back}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginTop: 'auto' }}>Click to flip or press Space</span>
          </div>
          
        </div>
      </div>

      {/* Keyboard Helper Tips (Desktop) */}
      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dark)', margin: '-1rem 0 1.5rem 0', display: 'flex', justifyContent: 'center', gap: '1rem' }} className="hidden-mobile">
        <span>Space: Flip</span>
        <span>← / →: Prev/Next</span>
        <span>↑ / ↓: Mastered/Review</span>
      </div>

      {/* Interactive HUD Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={markNeedsPractice} 
          className="btn btn-secondary" 
          style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', color: '#f87171', height: '52px' }}
        >
          Needs Practice
        </button>
        <button 
          onClick={markMastered} 
          className="btn btn-secondary" 
          style={{ border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)', color: '#34d399', height: '52px' }}
        >
          Mastered
        </button>
      </div>

      {/* Pagination Navigation */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={handlePrev} disabled={currentIndex === 0} style={{ padding: '0.5rem 1rem' }}>
          <ArrowLeft size={16} /> Prev
        </button>
        <button className="btn btn-secondary" onClick={handleShuffle} style={{ padding: '0.5rem 1rem' }} title="Shuffle current set">
          <Shuffle size={16} /> Shuffle
        </button>
        <button className="btn btn-secondary" onClick={handleNext} style={{ padding: '0.5rem 1rem' }}>
          Next <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
