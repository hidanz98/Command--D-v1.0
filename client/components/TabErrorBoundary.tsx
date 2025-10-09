import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TabErrorBoundary extends Component<Props, State> {
  private cleanupTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado pelo TabErrorBoundary:', error, errorInfo);
    
    // If it's a DOM manipulation error, try to clean up
    if (error.message.includes('removeChild') || error.message.includes('Node')) {
      this.cleanupDOM();
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when children change
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  componentWillUnmount() {
    this.cleanupDOM();
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
    }
  }

  private cleanupDOM = () => {
    try {
      // Clean up any inline editor states
      const editorElements = document.querySelectorAll('[data-edit-id]');
      editorElements.forEach(element => {
        element.classList.remove('nasa-editor-hovered', 'nasa-editor-selected');
      });

      // Clean up any orphaned styles
      const orphanedStyles = document.querySelectorAll('style[id^="nasa-editor-override-"]');
      orphanedStyles.forEach(style => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
    } catch (error) {
      console.warn('Error cleaning up TabErrorBoundary:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg">
          <div className="text-center">
            <h3 className="text-red-400 font-semibold mb-2">Erro na Seção</h3>
            <p className="text-red-300 text-sm mb-4">
              Ocorreu um erro ao carregar esta seção. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
