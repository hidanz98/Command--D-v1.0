import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface LogoContextType {
  currentLogo: string;
  updateLogo: (newLogoUrl: string) => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

interface LogoProviderProps {
  children: ReactNode;
}

export const LogoProvider: React.FC<LogoProviderProps> = ({ children }) => {
  const [currentLogo, setCurrentLogo] = useState<string>(() => {
    // Check if there's a saved logo in localStorage first
    const savedLogo = localStorage.getItem("companyLogo");
    return (
      savedLogo ||
      "https://cdn.builder.io/api/v1/image/assets%2Fe522824d636c48bb93414fffb4098576%2F294e1180e8d445eabdf19758e28f3c1e?format=webp&width=800"
    );
  });

  const updateLogo = (newLogoUrl: string) => {
    setCurrentLogo(newLogoUrl);
    localStorage.setItem("companyLogo", newLogoUrl);
  };

  const value = {
    currentLogo,
    updateLogo,
  };

  return <LogoContext.Provider value={value}>{children}</LogoContext.Provider>;
};

export const useLogo = (): LogoContextType => {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error("useLogo must be used within a LogoProvider");
  }
  return context;
};
