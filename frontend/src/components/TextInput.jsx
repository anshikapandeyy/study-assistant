import React, { useState } from 'react';
import { BookOpen, FileText, Sparkles, AlertTriangle, RotateCcw } from 'lucide-react';

const PRESETS = [
  {
    label: "JavaScript Async/Await",
    type: "topic",
    content: "Explain asynchronous programming in JavaScript using Promises, async, and await, including try/catch error handling."
  },
  {
    label: "Photosynthesis Process",
    type: "notes",
    content: "Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy. It has two main stages: Light-dependent reactions (occurs in thylakoid membranes, converts light to ATP/NADPH, releases oxygen) and Light-independent reactions/Calvin Cycle (occurs in stroma, uses CO2, ATP, and NADPH to produce glucose/G3P)."
  },
  {
    label: "Special Relativity Intro",
    type: "topic",
    content: "Explain Albert Einstein's theory of Special Relativity, focusing on the speed of light constancy, time dilation, and length contraction."
  }
];

export function TextInput({ onGenerate, isLoading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'topic'
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    onGenerate(activeTab, content);
  };

  const selectPreset = (preset) => {
    setActiveTab(preset.type);
    setContent(preset.content);
  };

  const handleClear = () => {
    setContent('');
  };

  return (
    <div className="glass fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles style={{ color: 'var(--primary)' }} size={24} />
        What are you studying today?
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`btn ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          <FileText size={16} /> Paste Notes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('topic')}
          className={`btn ${activeTab === 'topic' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          <BookOpen size={16} /> Describe a Topic
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <label 
            htmlFor="study-content" 
            style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}
          >
            {activeTab === 'notes' 
              ? 'Paste your lecture notes, article excerpts, or text study guides here:' 
              : 'Describe the topic you want to learn (e.g. "French Revolution timeline", "How DNA replication works"): '}
          </label>
          <textarea
            id="study-content"
            className="textarea"
            placeholder={activeTab === 'notes' 
              ? "Paste notes (minimum 10 characters)..." 
              : "Describe the topic you'd like to study..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={3000}
            disabled={isLoading}
            required
            style={{ height: '160px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dark)', marginTop: '0.25rem' }}>
            <span>{content.length}/3000 characters</span>
            {content.length > 0 && !isLoading && (
              <button 
                type="button" 
                onClick={handleClear}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Presets / Suggestions */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
            Or try a quick demo concept:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectPreset(preset)}
                className="btn btn-secondary"
                disabled={isLoading}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State inside Form for smooth flow */}
        {error && (
          <div className="glass fade-in" style={{ padding: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <AlertTriangle style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} size={20} />
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Generation Failed</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>{error}</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onRetry}
                style={{ marginTop: '0.75rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
              >
                <RotateCcw size={12} /> Retry Generation
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', opacity: isLoading || content.trim().length < 10 ? 0.7 : 1 }}
          disabled={isLoading || content.trim().length < 10}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
              Analyzing & Generating Study Set...
            </>
          ) : (
            <>
              <Sparkles size={18} /> Generate Flashcards & Quiz
            </>
          )}
        </button>
      </form>
    </div>
  );
}
