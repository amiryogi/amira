import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-warm-800">Something went wrong</h2>
            <p className="mt-2 text-warm-500">Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-white hover:bg-brand-800"
            >
              Refresh Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
