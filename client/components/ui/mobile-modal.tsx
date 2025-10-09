import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./button";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { cn } from "@/lib/utils";

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  fullScreen?: boolean; // Force full screen even on desktop
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  fullScreen = false,
}: MobileModalProps) {
  const device = useDeviceDetection();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFullScreen = device.isMobile || fullScreen;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        isFullScreen ? "bg-cinema-dark" : "bg-black/50 items-center justify-center p-4"
      )}
      onClick={isFullScreen ? undefined : onClose}
    >
      <div
        className={cn(
          "relative bg-cinema-dark-lighter border",
          isFullScreen
            ? "w-full h-full flex flex-col border-0"
            : "max-w-lg w-full max-h-[90vh] rounded-lg border-cinema-gray-light shadow-2xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              "flex items-center justify-between border-b border-cinema-gray-light",
              isFullScreen ? "p-6 pb-4" : "p-4"
            )}
          >
            {title && (
              <h2
                className={cn(
                  "font-semibold text-white",
                  isFullScreen ? "text-xl" : "text-lg"
                )}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={cn(
                  "text-gray-400 hover:text-white",
                  isFullScreen ? "p-3" : "p-2"
                )}
              >
                <X className={isFullScreen ? "w-6 h-6" : "w-5 h-5"} />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "overflow-y-auto",
            isFullScreen ? "flex-1 p-6" : "p-4",
            !title && !showCloseButton && (isFullScreen ? "pt-6" : "pt-4")
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Hook para controlar modals
export function useMobileModal() {
  const device = useDeviceDetection();

  const openModal = (
    content: ReactNode,
    options?: {
      title?: string;
      fullScreen?: boolean;
      className?: string;
    }
  ) => {
    // Esta é uma versão simplificada - em uma implementação real,
    // você usaria um estado global ou context para gerenciar modals
    console.log("Modal would open with:", { content, options, device });
  };

  return { openModal, device };
}

// Componente para modals de confirmação
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
}: ConfirmModalProps) {
  const device = useDeviceDetection();

  return (
    <MobileModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={cn("space-y-6", device.isMobile ? "text-center" : "")}>
        <p className="text-gray-300 leading-relaxed">{message}</p>

        <div
          className={cn(
            "flex gap-3",
            device.isMobile ? "flex-col" : "flex-row justify-end"
          )}
        >
          <Button
            variant="outline"
            onClick={onClose}
            className={cn(
              "border-cinema-gray-light text-gray-300 hover:text-white",
              device.isMobile ? "w-full py-3" : ""
            )}
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark",
              device.isMobile ? "w-full py-3" : ""
            )}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </MobileModal>
  );
}

// Componente para modals de formulário
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  showSubmitButton?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Salvar",
  showSubmitButton = true,
}: FormModalProps) {
  const device = useDeviceDetection();

  return (
    <MobileModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        {children}

        {showSubmitButton && (
          <div
            className={cn(
              "flex gap-3 pt-4 border-t border-cinema-gray-light",
              device.isMobile ? "flex-col" : "flex-row justify-end"
            )}
          >
            <Button
              variant="outline"
              onClick={onClose}
              className={cn(
                "border-cinema-gray-light text-gray-300 hover:text-white",
                device.isMobile ? "w-full py-3" : ""
              )}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              className={cn(
                "bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark",
                device.isMobile ? "w-full py-3" : ""
              )}
            >
              {submitText}
            </Button>
          </div>
        )}
      </div>
    </MobileModal>
  );
}
