import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import Button from './Button';

/**
 * ErrorBoundary component for catching and handling React errors
 * Provides a fallback UI when components crash
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-container">
          <Card title="Something went wrong">
            <div className="error-boundary-content">
              <p className="error-boundary-message">
                {this.props.message || 'An unexpected error occurred. Please try refreshing the page.'}
              </p>
              
              {this.props.showDetails && this.state.error && (
                <details className="error-boundary-details">
                  <summary>Error Details</summary>
                  <pre className="error-boundary-stack">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="error-boundary-actions">
                <Button 
                  variant="primary" 
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  message: PropTypes.string,
  showDetails: PropTypes.bool,
  onError: PropTypes.func,
  onReset: PropTypes.func
};

ErrorBoundary.defaultProps = {
  showDetails: process.env.NODE_ENV === 'development'
};

export default ErrorBoundary; 