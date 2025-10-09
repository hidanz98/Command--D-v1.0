import React from "react";
import { useAutoPunch } from "@/hooks/use-auto-punch";

interface Props {
  children: React.ReactNode;
}

export const AutoPunchWrapper: React.FC<Props> = ({ children }) => {
  try {
    // This hook automatically handles punch in/out based on login/logout
    useAutoPunch();
    
    return <>{children}</>;
  } catch (error) {
    console.error('Erro no AutoPunchWrapper:', error);
    // Em caso de erro, retorna os children sem o hook
    return <>{children}</>;
  }
};

export default AutoPunchWrapper;
