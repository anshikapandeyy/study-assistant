import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass fade-in" style={{ padding: '3rem', maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '1.75rem' }}>Something Went Wrong</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            An unexpected error occurred while rendering the interactive tool. This could be due to unexpected formatting from the AI model.
          </p>
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', textAlign: 'left', overflowX: 'auto', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            {this.state.error && this.state.error.toString()}
          </div>
          <button className="btn btn-primary" onClick={this.handleReset}>
            Reset Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
