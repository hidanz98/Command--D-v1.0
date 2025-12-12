import React, { createContext, useContext, useState, useEffect } from "react";
import { RentalCompany } from "./MasterAdminContext";

export interface TenantProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  images: string[];
  specifications: Record<string, string>;
  availability: "available" | "rented" | "maintenance" | "reserved";
  quantity: number;
  tenantId: string;
  tags: string[];
  isActive: boolean;
}

export interface TenantOrder {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    dailyRate: number;
    totalDays: number;
    totalPrice: number;
  }[];
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  status: "pending" | "approved" | "active" | "returned" | "cancelled";
  notes?: string;
  createdAt: Date;
}

export interface TenantCustomer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  cpfCnpj: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
  };
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  registeredAt: Date;
}

interface TenantSettings {
  allowPublicCatalog: boolean;
  requireApproval: boolean;
  allowOnlinePayments: boolean;
  showPricing: boolean;
  autoApproveReturningCustomers: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  customCss?: string;
  welcomeMessage?: string;
  termsOfService?: string;
  privacyPolicy?: string;
}

interface TenantContextType {
  // Tenant Info
  currentTenant: RentalCompany | null;
  tenantSettings: TenantSettings;

  // Products
  products: TenantProduct[];
  addProduct: (product: Omit<TenantProduct, "id" | "tenantId">) => void;
  updateProduct: (id: string, updates: Partial<TenantProduct>) => void;
  deleteProduct: (id: string) => void;
  getProductsByCategory: (category: string) => TenantProduct[];

  // Orders
  orders: TenantOrder[];
  addOrder: (order: Omit<TenantOrder, "id" | "tenantId" | "createdAt">) => string | undefined;
  updateOrder: (id: string, updates: Partial<TenantOrder>) => void;
  getOrdersByStatus: (status: TenantOrder["status"]) => TenantOrder[];
  generateOrderNumber: () => string;

  // Customers
  customers: TenantCustomer[];
  addCustomer: (
    customer: Omit<TenantCustomer, "id" | "tenantId" | "registeredAt">,
  ) => void;
  updateCustomer: (id: string, updates: Partial<TenantCustomer>) => void;
  getCustomerById: (id: string) => TenantCustomer | undefined;

  // Settings
  updateSettings: (settings: Partial<TenantSettings>) => void;

  // Tenant Management
  switchTenant: (tenant: RentalCompany) => void;
  getTenantStats: () => {
    totalProducts: number;
    activeOrders: number;
    totalCustomers: number;
    monthlyRevenue: number;
  };
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Sample tenant data
const sampleTenantData = {
  "bils-cinema": {
    products: [
      {
        id: "1",
        name: "Sony FX6",
        description: "Câmera profissional 4K com autofoco avançado",
        category: "cameras",
        subcategory: "profissionais",
        price: 12000,
        dailyRate: 350,
        weeklyRate: 2100,
        monthlyRate: 7000,
        images: ["/placeholder.svg"],
        specifications: {
          Resolução: "4K UHD",
          Sensor: "Full Frame CMOS",
          ISO: "100-102400",
          Gravação: "4K/120p",
        },
        availability: "available" as const,
        quantity: 3,
        tenantId: "bils-cinema",
        tags: ["4k", "profissional", "sony"],
        isActive: true,
      },
    ],
    orders: [
      {
        id: "1",
        tenantId: "bils-cinema",
        customerId: "1",
        customerName: "João Producer",
        customerEmail: "joao@produtora.com",
        items: [
          {
            productId: "1",
            productName: "Sony FX6",
            quantity: 1,
            dailyRate: 350,
            totalDays: 5,
            totalPrice: 1750,
          },
        ],
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        totalAmount: 1750,
        status: "active" as const,
        createdAt: new Date(),
      },
    ],
    customers: [
      {
        id: "1",
        tenantId: "bils-cinema",
        name: "João Producer",
        email: "joao@produtora.com",
        phone: "(31) 99999-9999",
        company: "Produtora ABC",
        cpfCnpj: "123.456.789-10",
        address: {
          street: "Rua das Filmagens",
          number: "123",
          district: "Centro",
          city: "Belo Horizonte",
          state: "MG",
          zipCode: "30000-000",
        },
        isActive: true,
        totalOrders: 15,
        totalSpent: 25000,
        registeredAt: new Date("2023-01-15"),
      },
    ],
  },
};

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<RentalCompany | null>(
    {
      id: "default",
      name: "Bil's Cinema e Vídeo",
      slug: "bils-cinema",
      domain: "bils-cinema.localhost",
      logo: "/logo.png",
      primaryColor: "#fbbf24",
      secondaryColor: "#1f2937",
      isActive: true,
      plan: "premium",
      createdAt: new Date(),
      lastActive: new Date(),
      totalRevenue: 0,
      totalOrders: 0,
      owner: {
        name: "Admin",
        email: "admin@bilscinema.com",
        phone: ""
      },
      settings: {
        allowOnlinePayments: true,
        requireApproval: true,
        showPricing: true
      }
    }
  );
  const [products, setProducts] = useState<TenantProduct[]>([]);
  
  // Carregar pedidos do localStorage ao inicializar
  const [orders, setOrders] = useState<TenantOrder[]>(() => {
    try {
      const savedOrders = localStorage.getItem('tenant_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        // Converter strings de data de volta para objetos Date
        return parsed.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          startDate: new Date(order.startDate),
          endDate: new Date(order.endDate),
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos do localStorage:", error);
    }
    return [];
  });
  
  const [customers, setCustomers] = useState<TenantCustomer[]>([]);
  const [tenantSettings, setTenantSettings] = useState<TenantSettings>({
    allowPublicCatalog: true,
    requireApproval: true,
    allowOnlinePayments: true,
    showPricing: true,
    autoApproveReturningCustomers: false,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
  });

  // Salvar pedidos no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('tenant_orders', JSON.stringify(orders));
      console.log("💾 Pedidos salvos no localStorage:", orders.length);
    } catch (error) {
      console.error("Erro ao salvar pedidos no localStorage:", error);
    }
  }, [orders]);

  // Load tenant data when tenant switches (APENAS produtos e clientes, NÃO pedidos)
  useEffect(() => {
    if (currentTenant?.slug) {
      const tenantData =
        sampleTenantData[currentTenant.slug as keyof typeof sampleTenantData];
      if (tenantData) {
        setProducts(tenantData.products);
        setCustomers(tenantData.customers);
        // NÃO sobrescrever pedidos - eles vêm do localStorage
      } else {
        // Reset data for new tenants
        setProducts([]);
        setCustomers([]);
        // NÃO resetar pedidos
      }
    }
  }, [currentTenant]);

  // Product Management
  const addProduct = (productData: Omit<TenantProduct, "id" | "tenantId">) => {
    if (!currentTenant) return;

    const newProduct: TenantProduct = {
      ...productData,
      id: Date.now().toString(),
      tenantId: currentTenant.slug,
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<TenantProduct>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, ...updates } : product,
      ),
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(
      (product) => product.category === category && product.isActive,
    );
  };

  // Order Management
  const generateOrderNumber = (): string => {
    if (!currentTenant) return '';
    
    const saved = localStorage.getItem(`orderNumbering_${currentTenant.slug}`);
    let settings = {
      prefix: '',
      currentNumber: 5066, // Valor padrão baseado no seu número atual
      totalDigits: 6,
      yearPrefix: false,
      monthPrefix: false
    };
    
    if (saved) {
      settings = { ...settings, ...JSON.parse(saved) };
    }
    
    // Incrementa o número
    const nextNumber = settings.currentNumber + 1;
    
    // Atualiza o número atual no localStorage
    const updatedSettings = { ...settings, currentNumber: nextNumber };
    localStorage.setItem(`orderNumbering_${currentTenant.slug}`, JSON.stringify(updatedSettings));
    
    // Gera o número formatado
    let result = '';
    
    if (settings.yearPrefix) {
      result += new Date().getFullYear().toString().slice(-2);
    }
    
    if (settings.monthPrefix) {
      result += String(new Date().getMonth() + 1).padStart(2, '0');
    }
    
    if (settings.prefix) {
      result += settings.prefix;
    }
    
    const numberStr = String(nextNumber).padStart(settings.totalDigits, '0');
    result += numberStr;
    
    return result;
  };

  const addOrder = (
    orderData: Omit<TenantOrder, "id" | "tenantId" | "createdAt">,
  ) => {
    console.log("🆕 === ADDORDER CHAMADO ===");
    console.log("📦 Dados recebidos:", orderData);
    console.log("🏢 currentTenant:", currentTenant);
    console.log("📋 Pedidos atuais:", orders.length);
    
    if (!currentTenant) {
      console.error("❌ ERRO: currentTenant é null/undefined");
      return;
    }

    const orderNumber = generateOrderNumber();
    console.log("🔢 Número do pedido gerado:", orderNumber);

    const newOrder: TenantOrder = {
      ...orderData,
      id: orderNumber,
      tenantId: currentTenant.slug,
      createdAt: new Date(),
    };
    
    console.log("✅ Novo pedido criado:", newOrder);
    console.log("📧 Email do cliente:", newOrder.customerEmail);
    
    setOrders((prev) => {
      const updated = [...prev, newOrder];
      console.log("💾 Pedidos após adicionar:", updated.length);
      console.log("📋 Lista completa de pedidos:", updated);
      return updated;
    });
    
    console.log("🎉 addOrder concluído! Retornando:", orderNumber);
    return orderNumber;
  };

  const updateOrder = (id: string, updates: Partial<TenantOrder>) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...updates } : order)),
    );
  };

  const getOrdersByStatus = (status: TenantOrder["status"]) => {
    return orders.filter((order) => order.status === status);
  };

  // Customer Management
  const addCustomer = (
    customerData: Omit<TenantCustomer, "id" | "tenantId" | "registeredAt">,
  ) => {
    if (!currentTenant) return;

    const newCustomer: TenantCustomer = {
      ...customerData,
      id: Date.now().toString(),
      tenantId: currentTenant.slug,
      registeredAt: new Date(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<TenantCustomer>) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === id ? { ...customer, ...updates } : customer,
      ),
    );
  };

  const getCustomerById = (id: string) => {
    return customers.find((customer) => customer.id === id);
  };

  // Settings Management
  const updateSettings = (settings: Partial<TenantSettings>) => {
    setTenantSettings((prev) => ({ ...prev, ...settings }));
  };

  // Tenant Management
  const switchTenant = (tenant: RentalCompany) => {
    setCurrentTenant(tenant);
  };

  const getTenantStats = () => {
    return {
      totalProducts: products.filter((p) => p.isActive).length,
      activeOrders: orders.filter(
        (o) => o.status === "active" || o.status === "approved",
      ).length,
      totalCustomers: customers.filter((c) => c.isActive).length,
      monthlyRevenue: orders
        .filter((o) => {
          const orderDate = new Date(o.createdAt);
          const now = new Date();
          return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
  };

  const value: TenantContextType = {
    currentTenant,
    tenantSettings,
    products,
    orders,
    customers,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    addOrder,
    updateOrder,
    getOrdersByStatus,
    generateOrderNumber,
    addCustomer,
    updateCustomer,
    getCustomerById,
    updateSettings,
    switchTenant,
    getTenantStats,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
