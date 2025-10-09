import React, { createContext, useContext, useState, useEffect } from "react";

export interface RentalCompany {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  domain?: string;
  cnpj?: string;
  isActive: boolean;
  plan: "demo" | "basic" | "premium";
  createdAt: Date;
  lastActive: Date;
  totalRevenue: number;
  totalOrders: number;
  owner: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  settings: {
    allowOnlinePayments: boolean;
    requireApproval: boolean;
    showPricing: boolean;
    customDomain?: string;
  };
}

interface MasterAdminContextType {
  companies: RentalCompany[];
  selectedCompany: RentalCompany | null;
  isLoading: boolean;
  // Company Management
  addCompany: (
    company: Omit<RentalCompany, "id" | "createdAt" | "lastActive">,
  ) => void;
  updateCompany: (id: string, updates: Partial<RentalCompany>) => void;
  deleteCompany: (id: string) => void;
  selectCompany: (company: RentalCompany) => void;
  // Statistics
  getTotalStats: () => {
    totalCompanies: number;
    activeCompanies: number;
    totalRevenue: number;
    totalOrders: number;
  };
  getCompanyStats: (companyId: string) => {
    revenue: number;
    orders: number;
    equipment: number;
    lastActivity: Date;
  };
}

const MasterAdminContext = createContext<MasterAdminContextType | undefined>(
  undefined,
);

// Sample data for demonstration
const sampleCompanies: RentalCompany[] = [
  {
    id: "1",
    name: "Bil's Cinema e Vídeo",
    slug: "bils-cinema",
    logo: "/placeholder.svg",
    primaryColor: "#F5D533",
    secondaryColor: "#1a1a1a",
    domain: "bils.equipamentos.com",
    isActive: true,
    plan: "premium",
    createdAt: new Date("2023-01-15"),
    lastActive: new Date(),
    totalRevenue: 150000,
    totalOrders: 245,
    owner: {
      name: "Bil Silva",
      email: "bil@bilscinema.com",
      phone: "(31) 99999-9999",
    },
    settings: {
      allowOnlinePayments: true,
      requireApproval: false,
      showPricing: true,
      customDomain: "www.bilscinema.com",
    },
  },
  {
    id: "2",
    name: "Cabeça de Efeito",
    slug: "cabeca-efeito",
    logo: "/placeholder.svg",
    primaryColor: "#B91C1C",
    secondaryColor: "#1F2937",
    cnpj: "15602935000115",
    isActive: true,
    plan: "basic",
    createdAt: new Date("2023-06-20"),
    lastActive: new Date(Date.now() - 86400000), // 1 day ago
    totalRevenue: 85000,
    totalOrders: 156,
    owner: {
      name: "Carlos Efeito",
      email: "cabecadeefeitocine@gmail.com",
      phone: "(31) 99137-9713",
      address:
        "R. Aristóteles Caldeira, 425 - Prado, Belo Horizonte - MG, 30411-225",
    },
    settings: {
      allowOnlinePayments: true,
      requireApproval: true,
      showPricing: false,
    },
  },
  {
    id: "3",
    name: "T.inti Produções",
    slug: "tinti-producoes",
    primaryColor: "#00ff88",
    secondaryColor: "#1e1e1e",
    isActive: false,
    plan: "demo",
    createdAt: new Date("2023-11-10"),
    lastActive: new Date(Date.now() - 604800000), // 1 week ago
    totalRevenue: 12000,
    totalOrders: 28,
    owner: {
      name: "Tiago Inti",
      email: "tiago@tinti.com.br",
      phone: "(21) 97777-7777",
    },
    settings: {
      allowOnlinePayments: false,
      requireApproval: true,
      showPricing: true,
    },
  },
];

export function MasterAdminProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [companies, setCompanies] = useState<RentalCompany[]>(sampleCompanies);
  const [selectedCompany, setSelectedCompany] = useState<RentalCompany | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const addCompany = (
    companyData: Omit<RentalCompany, "id" | "createdAt" | "lastActive">,
  ) => {
    const newCompany: RentalCompany = {
      ...companyData,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastActive: new Date(),
    };
    setCompanies((prev) => [...prev, newCompany]);
  };

  const updateCompany = (id: string, updates: Partial<RentalCompany>) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === id ? { ...company, ...updates } : company,
      ),
    );
  };

  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((company) => company.id !== id));
    if (selectedCompany?.id === id) {
      setSelectedCompany(null);
    }
  };

  const selectCompany = (company: RentalCompany) => {
    setSelectedCompany(company);
  };

  const getTotalStats = () => {
    return {
      totalCompanies: companies.length,
      activeCompanies: companies.filter((c) => c.isActive).length,
      totalRevenue: companies.reduce((sum, c) => sum + c.totalRevenue, 0),
      totalOrders: companies.reduce((sum, c) => sum + c.totalOrders, 0),
    };
  };

  const getCompanyStats = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (!company) {
      return { revenue: 0, orders: 0, equipment: 0, lastActivity: new Date() };
    }

    return {
      revenue: company.totalRevenue,
      orders: company.totalOrders,
      equipment: Math.floor(Math.random() * 100) + 50, // Mock data
      lastActivity: company.lastActive,
    };
  };

  const value: MasterAdminContextType = {
    companies,
    selectedCompany,
    isLoading,
    addCompany,
    updateCompany,
    deleteCompany,
    selectCompany,
    getTotalStats,
    getCompanyStats,
  };

  return (
    <MasterAdminContext.Provider value={value}>
      {children}
    </MasterAdminContext.Provider>
  );
}

export function useMasterAdmin() {
  const context = useContext(MasterAdminContext);
  if (context === undefined) {
    throw new Error("useMasterAdmin must be used within a MasterAdminProvider");
  }
  return context;
}
