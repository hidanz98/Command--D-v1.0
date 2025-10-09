import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = "Algo deu errado",
  message = "Ocorreu um erro nesta seção. Tente recarregar.",
}) => {
  const handleReload = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-cinema-gray/50 rounded-lg border border-cinema-gray-light">
      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>

      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-4 max-w-md">{message}</p>

      {process.env.NODE_ENV === "development" && error && (
        <details className="bg-cinema-dark-lighter p-3 rounded border border-red-500/20 mb-4 text-left">
          <summary className="text-red-400 cursor-pointer text-sm font-medium mb-2">
            Detalhes do erro
          </summary>
          <pre className="text-xs text-gray-300 overflow-auto max-h-32">
            {error.toString()}
          </pre>
        </details>
      )}

      <Button
        onClick={handleReload}
        className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Tentar Novamente
      </Button>
    </div>
  );
};

export default ErrorFallback;
