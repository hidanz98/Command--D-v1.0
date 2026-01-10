import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Se for erro de DOM (removeChild), tentar limpar
    if (error.message.includes('removeChild') || error.message.includes('Node')) {
      console.warn('Erro de DOM detectado, tentando limpar...');
      try {
        // Limpar qualquer elemento órfão
        const orphanElements = document.querySelectorAll('[data-orphan]');
        orphanElements.forEach(el => {
          try {
            if (el.parentNode && el.parentNode.contains(el)) {
              el.parentNode.removeChild(el);
            }
          } catch (e) {
            // Ignorar erros de limpeza
          }
        });
      } catch (cleanupError) {
        console.error('Erro ao limpar DOM:', cleanupError);
      }
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-cinema-dark flex items-center justify-center p-4">
          <Card className="bg-cinema-gray border-cinema-gray-light max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-white">Ops! Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400 text-center">
                Ocorreu um erro inesperado. Você pode tentar novamente ou
                recarregar a página.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="bg-cinema-dark-lighter p-3 rounded border border-red-500/20">
                  <summary className="text-red-400 cursor-pointer text-sm font-medium mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="text-xs text-gray-300 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={this.handleRetry}
                  className="flex-1 border-cinema-gray-light text-white hover:bg-cinema-gray-light"
                >
                  Tentar Novamente
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
