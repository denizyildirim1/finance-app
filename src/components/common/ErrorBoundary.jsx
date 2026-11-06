import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unexpected display error' };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-banner" role="alert">
          <div className="error-title">Unable to render dashboard module</div>
          <p className="error-desc">A display error occurred. Please refresh or retry.</p>
          <button className="retry-btn" onClick={this.handleReset}>
            Retry Component
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
