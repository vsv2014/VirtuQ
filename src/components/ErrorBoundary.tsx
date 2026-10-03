import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Without this, any render-time exception unmounted the whole tree and left a
 * blank white page with no way to recover.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="mb-4 text-3xl font-bold">Something went wrong</h1>
          <p className="mx-auto mb-8 max-w-md text-gray-600">
            The page hit an unexpected error. You can try again, or head back to the
            home page.
          </p>
          <pre className="mx-auto mb-8 max-w-xl overflow-x-auto rounded-lg bg-gray-100 p-4 text-left text-xs text-gray-700">
            {error.message}
          </pre>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleReset}
            >
              Try again
            </button>
            <a href="/" className="btn btn-secondary">
              Go home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
