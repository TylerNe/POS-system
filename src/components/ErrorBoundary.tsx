import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              🚨 Something went wrong!
            </h1>
            
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Error Details:</h2>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                {this.state.error?.message}
              </pre>
            </div>

            {this.state.errorInfo && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Component Stack:</h2>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Stack Trace:</h2>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
                {this.state.error?.stack}
              </pre>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔄 Reload Page
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                🧹 Clear Storage & Reload
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                🔄 Try Again
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                💡 <strong>Debug tips:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                <li>Check browser console (F12) for additional errors</li>
                <li>Verify backend is running on port 5000</li>
                <li>Check network tab for failed API requests</li>
                <li>Try logging out and back in</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
