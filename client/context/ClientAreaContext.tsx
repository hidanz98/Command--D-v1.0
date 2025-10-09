import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface ClientAlert {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  priority: "low" | "medium" | "high" | "urgent";
  startDate: string;
  endDate: string;
  targetAudience: "all" | "vip" | "regular" | "new";
  isActive: boolean;
  showOnLogin: boolean;
  showOnDashboard: boolean;
  dismissible: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ClientAreaConfig {
  welcomeMessage: string;
  dashboardLayout: "default" | "compact" | "detailed";
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
  };
  features: {
    showRecentOrders: boolean;
    showRentedEquipment: boolean;
    showDocuments: boolean;
    showSupport: boolean;
  };
  customSections: Array<{
    id: string;
    title: string;
    content: string;
    isVisible: boolean;
    order: number;
  }>;
}

interface ClientAreaContextType {
  alerts: ClientAlert[];
  config: ClientAreaConfig;
  addAlert: (alert: Omit<ClientAlert, "id" | "createdAt">) => void;
  updateAlert: (id: string, updates: Partial<ClientAlert>) => void;
  deleteAlert: (id: string) => void;
  getActiveAlerts: (audience?: string) => ClientAlert[];
  updateConfig: (updates: Partial<ClientAreaConfig>) => void;
  getDashboardAlerts: () => ClientAlert[];
  getLoginAlerts: () => ClientAlert[];
}

const ClientAreaContext = createContext<ClientAreaContextType | undefined>(
  undefined,
);

interface ClientAreaProviderProps {
  children: ReactNode;
}

export const ClientAreaProvider: React.FC<ClientAreaProviderProps> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<ClientAlert[]>(() => {
    const saved = localStorage.getItem("clientAreaAlerts");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "welcome-2025",
            title: "Bem-vindos a 2025!",
            message:
              "Novos equipamentos disponíveis e promoções especiais aguardam você. Confira nosso catálogo atualizado!",
            type: "success",
            priority: "medium",
            startDate: "2025-01-01",
            endDate: "2025-01-31",
            targetAudience: "all",
            isActive: true,
            showOnLogin: true,
            showOnDashboard: true,
            dismissible: true,
            createdAt: new Date().toISOString(),
            createdBy: "admin",
          },
          {
            id: "maintenance-notice",
            title: "Manutenção Programada",
            message:
              "Sistema passará por manutenção no dia 15/01 das 2h às 4h. Alguns recursos podem ficar indisponíveis.",
            type: "warning",
            priority: "high",
            startDate: "2025-01-10",
            endDate: "2025-01-16",
            targetAudience: "all",
            isActive: true,
            showOnLogin: false,
            showOnDashboard: true,
            dismissible: false,
            createdAt: new Date().toISOString(),
            createdBy: "admin",
          },
        ];
  });

  const [config, setConfig] = useState<ClientAreaConfig>(() => {
    const saved = localStorage.getItem("clientAreaConfig");
    return saved
      ? JSON.parse(saved)
      : {
          welcomeMessage: "Bem-vindo à sua Área Cliente",
          dashboardLayout: "default",
          theme: {
            primaryColor: "#FFD700",
            secondaryColor: "#1a1a1a",
            backgroundColor: "#121212",
          },
          features: {
            showRecentOrders: true,
            showRentedEquipment: true,
            showDocuments: true,
            showSupport: true,
          },
          customSections: [],
        };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("clientAreaAlerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem("clientAreaConfig", JSON.stringify(config));
  }, [config]);

  const addAlert = (alertData: Omit<ClientAlert, "id" | "createdAt">) => {
    const newAlert: ClientAlert = {
      ...alertData,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const updateAlert = (id: string, updates: Partial<ClientAlert>) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, ...updates } : alert)),
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getActiveAlerts = (audience?: string) => {
    const now = new Date();
    return alerts.filter((alert) => {
      if (!alert.isActive) return false;

      const startDate = new Date(alert.startDate);
      const endDate = new Date(alert.endDate);
      if (now < startDate || now > endDate) return false;

      if (
        audience &&
        alert.targetAudience !== "all" &&
        alert.targetAudience !== audience
      ) {
        return false;
      }

      return true;
    });
  };

  const getDashboardAlerts = () => {
    return getActiveAlerts().filter((alert) => alert.showOnDashboard);
  };

  const getLoginAlerts = () => {
    return getActiveAlerts().filter((alert) => alert.showOnLogin);
  };

  const updateConfig = (updates: Partial<ClientAreaConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    alerts,
    config,
    addAlert,
    updateAlert,
    deleteAlert,
    getActiveAlerts,
    updateConfig,
    getDashboardAlerts,
    getLoginAlerts,
  };

  return (
    <ClientAreaContext.Provider value={value}>
      {children}
    </ClientAreaContext.Provider>
  );
};

export const useClientArea = (): ClientAreaContextType => {
  const context = useContext(ClientAreaContext);
  if (context === undefined) {
    throw new Error("useClientArea must be used within a ClientAreaProvider");
  }
  return context;
};
