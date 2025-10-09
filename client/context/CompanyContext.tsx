import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface CompanySettings {
  name: string;
  slogan: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
}

interface CompanyContextType {
  companySettings: CompanySettings;
  updateCompanySettings: (newSettings: Partial<CompanySettings>) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

const defaultSettings: CompanySettings = {
  name: "Bil's Cinema e Vídeo",
  slogan: "Locação de Equipamentos Profissionais",
  description: "Especialistas em equipamentos cinematográficos e audiovisuais desde 2010",
  phone: "(31) 99990-8485",
  email: "contato@bilscinema.com.br",
  address: "Belo Horizonte, MG",
  whatsapp: "5531999908485",
};

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    // Check if there are saved settings in localStorage first
    const savedSettings = localStorage.getItem("companySettings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
    const updatedSettings = { ...companySettings, ...newSettings };
    setCompanySettings(updatedSettings);
    localStorage.setItem("companySettings", JSON.stringify(updatedSettings));
  };

  const value = {
    companySettings,
    updateCompanySettings,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};

export const useCompanySettings = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompanySettings must be used within a CompanyProvider");
  }
  return context;
};
