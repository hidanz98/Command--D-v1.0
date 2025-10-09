import { ReactNode, createContext, useContext, useState } from "react";
import { MobileModal, ConfirmModal, FormModal } from "@/components/ui/mobile-modal";

interface ModalOptions {
  title?: string;
  fullScreen?: boolean;
  className?: string;
  showCloseButton?: boolean;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface FormOptions {
  title: string;
  submitText?: string;
  showSubmitButton?: boolean;
}

interface ModalContextType {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  openForm: (content: ReactNode, options: FormOptions) => Promise<boolean>;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalState {
  isOpen: boolean;
  content: ReactNode;
  options: ModalOptions;
  type: "modal" | "confirm" | "form";
  confirmOptions?: ConfirmOptions;
  formOptions?: FormOptions;
  resolve?: (value: boolean) => void;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    content: null,
    options: {},
    type: "modal",
  });

  const openModal = (content: ReactNode, options: ModalOptions = {}) => {
    setModalState({
      isOpen: true,
      content,
      options,
      type: "modal",
    });
  };

  const openConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        content: null,
        options: {},
        type: "confirm",
        confirmOptions: options,
        resolve,
      });
    });
  };

  const openForm = (content: ReactNode, options: FormOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        content,
        options: {},
        type: "form",
        formOptions: options,
        resolve,
      });
    });
  };

  const closeModal = () => {
    if (modalState.resolve) {
      modalState.resolve(false);
    }
    setModalState({
      isOpen: false,
      content: null,
      options: {},
      type: "modal",
    });
  };

  const handleConfirm = () => {
    if (modalState.resolve) {
      modalState.resolve(true);
    }
    closeModal();
  };

  const handleFormSubmit = () => {
    if (modalState.resolve) {
      modalState.resolve(true);
    }
    closeModal();
  };

  return (
    <ModalContext.Provider value={{ openModal, openConfirm, openForm, closeModal }}>
      {children}

      {/* Render appropriate modal type */}
      {modalState.type === "modal" && (
        <MobileModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          {...modalState.options}
        >
          {modalState.content}
        </MobileModal>
      )}

      {modalState.type === "confirm" && modalState.confirmOptions && (
        <ConfirmModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          {...modalState.confirmOptions}
        />
      )}

      {modalState.type === "form" && modalState.formOptions && (
        <FormModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          {...modalState.formOptions}
        >
          {modalState.content}
        </FormModal>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

// Hooks específicos para diferentes tipos de modal
export function useConfirmModal() {
  const { openConfirm } = useModal();

  const confirmDelete = (itemName: string = "este item") =>
    openConfirm({
      title: "Confirmar Exclusão",
      message: `Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive",
    });

  const confirmAction = (title: string, message: string) =>
    openConfirm({
      title,
      message,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
    });

  return { confirmDelete, confirmAction };
}

export function useFormModal() {
  const { openForm } = useModal();

  const openEditForm = (content: ReactNode, title: string = "Editar") =>
    openForm(content, {
      title,
      submitText: "Salvar",
    });

  const openCreateForm = (content: ReactNode, title: string = "Criar") =>
    openForm(content, {
      title,
      submitText: "Criar",
    });

  return { openEditForm, openCreateForm };
}

// Hook para modals de visualização/detalhes
export function useDetailModal() {
  const { openModal } = useModal();

  const openDetail = (content: ReactNode, title?: string) =>
    openModal(content, {
      title,
      fullScreen: true, // Force full screen for details
      showCloseButton: true,
    });

  return { openDetail };
}
