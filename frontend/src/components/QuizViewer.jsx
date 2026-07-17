import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, RotateCcw, AlertTriangle, ArrowLeft } from 'lucide-react';

export function QuizViewer({ quizQuestions, onBackToInput }) {
  const [questions, setQuestions] = useState(quizQuestions.map((q, idx) => ({ ...q, originalIndex: idx })));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null); // Index of option selected by user
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState({}); // originalIndex -> { userIndex, isCorrect }
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIdx];

  const handleSelectOption = (optIdx) => {
    if (isAnswered) return;
    setSelectedOpt(optIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOpt === null || isAnswered) return;
    
    const isCorrect = selectedOpt === currentQuestion.correctAnswerIndex;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.originalIndex]: {
        userIndex: selectedOpt,
        isCorrect
      }
    }));
    setIsAnswered(true);
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsAnswered(false);
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleFullReset = () => {
    setQuestions(quizQuestions.map((q, idx) => ({ ...q, originalIndex: idx })));
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setAnswers({});
    setCompleted(false);
  };

  const handleRetryIncorrectOnly = () => {
    const incorrectQuestions = quizQuestions
      .map((q, idx) => ({ ...q, originalIndex: idx }))
      .filter(q => {
        const ans = answers[q.originalIndex];
        return !ans || !ans.isCorrect;
      });

    setQuestions(incorrectQuestions);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    // Keep past answers but we can overwrite them
    setCompleted(false);
  };

  // Calculations
  const score = Object.values(answers).filter(a => a.isCorrect).length;
  const progressPercent = Math.round(((currentIdx) / questions.length) * 100);

  if (questions.length === 0) {
    return (
      <div className="glass fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <CheckCircle2 size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Questions to answer!</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You answered all questions correctly!</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={handleFullReset}>Reset & Restart Quiz</button>
          <button className="btn btn-primary" onClick={onBackToInput}>Create New Study Set</button>
        </div>
      </div>
    );
  }

  if (completed) {
    const incorrectCount = quizQuestions.length - score;

    return (
      <div className="glass fade-in" style={{ padding: '2.5rem', maxWidth: '650px', margin: '2rem auto' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 600, textAlign: 'center', marginBottom: '1.5rem' }}>Quiz Results 📊</h3>

        {/* Score Ring / Block */}
        <div style={{ padding: '2rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Your Score</span>
          <span style={{ fontSize: '3rem', fontWeight: 800, color: score / quizQuestions.length >= 0.7 ? 'var(--success)' : 'var(--warning)', display: 'block', lineHeight: 1 }}>
            {score} <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {quizQuestions.length}</span>
          </span>
          <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            {score === quizQuestions.length ? 'Perfect Score! Magnificent work!' : score / quizQuestions.length >= 0.6 ? 'Great effort, almost there!' : 'Keep studying and try again!'}
          </span>
        </div>

        {/* Summary Review List */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Question Breakdown:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {quizQuestions.map((q, idx) => {
              const ans = answers[idx];
              const isCorrect = ans?.isCorrect;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '1rem', 
                    background: isCorrect ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)', 
                    border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                >
                  {isCorrect ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                  ) : (
                    <XCircle size={18} style={{ color: 'var(--danger)', marginTop: '2px', flexShrink: 0 }} />
                  )}
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{q.question}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>
                      Correct answer: <strong>{q.options[q.correctAnswerIndex]}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {incorrectCount > 0 && (
            <button className="btn btn-primary" onClick={handleRetryIncorrectOnly}>
              <RotateCcw size={16} /> Re-test Wrong Answers ({incorrectCount})
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleFullReset}>
            <RotateCcw size={16} /> Restart Full Quiz
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
        <span>Question {currentIdx + 1} of {questions.length}</span>
        <span>Current Score: {Object.values(answers).filter(a => a.isCorrect).length} correct</span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div 
          style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--accent))', transition: 'width 0.3s ease' }} 
        />
      </div>

      {/* Question Card */}
      <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentQuestion.options.map((option, optIdx) => {
            let btnClass = "";
            let statusIcon = null;

            if (isAnswered) {
              const isCorrectOpt = optIdx === currentQuestion.correctAnswerIndex;
              const isSelectedOpt = optIdx === selectedOpt;
              
              if (isCorrectOpt) {
                btnClass = "correct";
                statusIcon = <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />;
              } else if (isSelectedOpt && !isCorrectOpt) {
                btnClass = "incorrect";
                statusIcon = <XCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />;
              } else {
                btnClass = "disabled";
              }
            } else if (selectedOpt === optIdx) {
              btnClass = "selected";
            }

            return (
              <button
                key={optIdx}
                type="button"
                className={`option-btn ${btnClass}`}
                onClick={() => handleSelectOption(optIdx)}
                disabled={isAnswered}
              >
                <span style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: selectedOpt === optIdx ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span style={{ flex: 1 }}>{option}</span>
                {statusIcon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation Box (Visible post answer submission) */}
      {isAnswered && (
        <div className="glass fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>Explanation:</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Action Submit / Next */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        {!isAnswered ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmitAnswer}
            disabled={selectedOpt === null}
            style={{ width: '100%', sm: { width: 'auto' } }}
          >
            Submit Answer
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            style={{ width: '100%', sm: { width: 'auto' } }}
          >
            {currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
