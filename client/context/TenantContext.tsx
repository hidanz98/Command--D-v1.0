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
      {
        id: "PROD-CANON-2470",
        name: "CANON L SERIES 24/70mm II USM F*2,8",
        description: "Lente zoom profissional Canon série L, abertura f/2.8 constante",
        category: "lentes",
        subcategory: "zoom",
        price: 8500,
        dailyRate: 290,
        weeklyRate: 1740,
        monthlyRate: 5800,
        images: ["/placeholder.svg"],
        specifications: {
          Abertura: "f/2.8",
          "Distância Focal": "24-70mm",
          Montagem: "Canon EF",
          Estabilização: "Não",
        },
        availability: "available" as const,
        quantity: 2,
        tenantId: "bils-cinema",
        tags: ["canon", "lente", "zoom", "profissional"],
        isActive: true,
      },
      {
        id: "PROD-BMPCC-6K",
        name: "BLACKMAGIC POCKET 6K PRO BODY",
        description: "Câmera cinema Blackmagic Pocket 6K Pro com sensor Super 35",
        category: "cameras",
        subcategory: "cinema",
        price: 15000,
        dailyRate: 217.30,
        weeklyRate: 1303.80,
        monthlyRate: 4346,
        images: ["/placeholder.svg"],
        specifications: {
          Resolução: "6K",
          Sensor: "Super 35",
          Gravação: "BRAW / ProRes",
          NDFilter: "Interno",
        },
        availability: "available" as const,
        quantity: 2,
        tenantId: "bils-cinema",
        tags: ["blackmagic", "6k", "cinema", "bmpcc"],
        isActive: true,
      },
      {
        id: "PROD-SACHTLER-FSB8",
        name: "CABEÇA SACHTLER FSB8 ALUMINIUM 75mm",
        description: "Cabeça fluida profissional Sachtler FSB8 com bowl de 75mm",
        category: "suportes",
        subcategory: "cabecas",
        price: 6500,
        dailyRate: 174.55,
        weeklyRate: 1047.30,
        monthlyRate: 3491,
        images: ["/placeholder.svg"],
        specifications: {
          Capacidade: "8kg",
          Bowl: "75mm",
          Material: "Alumínio",
          Contrabalanço: "16 passos",
        },
        availability: "available" as const,
        quantity: 3,
        tenantId: "bils-cinema",
        tags: ["sachtler", "tripé", "cabeça fluida"],
        isActive: true,
      },
      {
        id: "PROD-TRIPE-SACHTLER",
        name: "TRIPÉ SACHTLER FSB8 ALUMINIUM 75mm 1 ESTÁGIO",
        description: "Tripé profissional Sachtler em alumínio com bowl 75mm",
        category: "suportes",
        subcategory: "tripes",
        price: 4500,
        dailyRate: 145.45,
        weeklyRate: 872.70,
        monthlyRate: 2909,
        images: ["/placeholder.svg"],
        specifications: {
          Material: "Alumínio",
          Bowl: "75mm",
          Estágios: "1",
          "Altura Máx": "165cm",
        },
        availability: "available" as const,
        quantity: 3,
        tenantId: "bils-cinema",
        tags: ["sachtler", "tripé", "alumínio"],
        isActive: true,
      },
      {
        id: "PROD-SSD-T5",
        name: "SSD SAMSUNG T5 1TB",
        description: "SSD externo Samsung T5 de 1TB para gravação direta",
        category: "acessorios",
        subcategory: "armazenamento",
        price: 800,
        dailyRate: 96.58,
        weeklyRate: 579.48,
        monthlyRate: 1931.60,
        images: ["/placeholder.svg"],
        specifications: {
          Capacidade: "1TB",
          Interface: "USB-C",
          Velocidade: "540MB/s",
          Compatível: "BMPCC, Atomos",
        },
        availability: "available" as const,
        quantity: 4,
        tenantId: "bils-cinema",
        tags: ["samsung", "ssd", "armazenamento"],
        isActive: true,
      },
      {
        id: "PROD-POWERBANK",
        name: "POWER BANK BASEUS 65W 30000mAh",
        description: "Power bank de alta capacidade com saída de 65W USB-C PD",
        category: "acessorios",
        subcategory: "energia",
        price: 450,
        dailyRate: 83.72,
        weeklyRate: 502.32,
        monthlyRate: 1674.40,
        images: ["/placeholder.svg"],
        specifications: {
          Capacidade: "30000mAh",
          Saída: "65W USB-C PD",
          Entradas: "USB-C, USB-A",
          Display: "LED",
        },
        availability: "available" as const,
        quantity: 4,
        tenantId: "bils-cinema",
        tags: ["powerbank", "energia", "baseus"],
        isActive: true,
      },
      {
        id: "PROD-TILTA-CAGE",
        name: "TILTA CAGE para BMPCC 6K PRO",
        description: "Gaiola Tilta completa para Blackmagic Pocket 6K Pro",
        category: "acessorios",
        subcategory: "gaiolas",
        price: 1200,
        dailyRate: 60.36,
        weeklyRate: 362.16,
        monthlyRate: 1207.20,
        images: ["/placeholder.svg"],
        specifications: {
          Compatível: "BMPCC 6K Pro",
          Material: "Alumínio",
          "Pontos de Fixação": "NATO, 1/4, 3/8",
          Inclui: "Top handle",
        },
        availability: "available" as const,
        quantity: 2,
        tenantId: "bils-cinema",
        tags: ["tilta", "cage", "gaiola", "bmpcc"],
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
      {
        id: "NF-4016",
        tenantId: "bils-cinema",
        customerId: "CLI-KILOMBA",
        customerName: "Kilomba Producoes Ltda",
        customerEmail: "contato@kilomba.com.br",
        items: [
          {
            productId: "PROD-CANON-2470",
            productName: "CANON L SERIES 24/70mm II USM F*2,8",
            quantity: 1,
            dailyRate: 290,
            totalDays: 3,
            totalPrice: 290,
          },
          {
            productId: "PROD-BMPCC-6K",
            productName: "BLACKMAGIC POCKET 6K PRO BODY",
            quantity: 1,
            dailyRate: 217.30,
            totalDays: 3,
            totalPrice: 217.30,
          },
          {
            productId: "PROD-SACHTLER-FSB8",
            productName: "CABEÇA SACHTLER FSB8 ALUMINIUM 75mm",
            quantity: 1,
            dailyRate: 174.55,
            totalDays: 3,
            totalPrice: 174.55,
          },
          {
            productId: "PROD-TRIPE-SACHTLER",
            productName: "TRIPÉ SACHTLER FSB8 ALUMINIUM 75mm",
            quantity: 1,
            dailyRate: 145.45,
            totalDays: 3,
            totalPrice: 145.45,
          },
          {
            productId: "PROD-SSD-T5",
            productName: "SSD SAMSUNG T5 1TB",
            quantity: 2,
            dailyRate: 96.58,
            totalDays: 3,
            totalPrice: 193.16,
          },
          {
            productId: "PROD-POWERBANK",
            productName: "POWER BANK BASEUS 65W 30000mAh",
            quantity: 2,
            dailyRate: 83.72,
            totalDays: 3,
            totalPrice: 167.44,
          },
          {
            productId: "PROD-TILTA-CAGE",
            productName: "TILTA CAGE + Acessórios diversos",
            quantity: 1,
            dailyRate: 172.10,
            totalDays: 3,
            totalPrice: 172.10,
          },
        ],
        startDate: new Date("2025-12-05"),
        endDate: new Date("2025-12-07"),
        totalAmount: 1360,
        status: "active" as const,
        notes: 'Projeto: O que quero dizer quando falo de amor\nProdução: RIOFILME - Contrato nº 1053/2023\nLocação de equipamentos de câmera no período de 05/12/2025 a 07/12/2025.',
        createdAt: new Date("2025-12-05"),
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
      {
        id: "CLI-KILOMBA",
        tenantId: "bils-cinema",
        name: "Kilomba Producoes Ltda",
        email: "contato@kilomba.com.br",
        phone: "(21) 97603-0440",
        company: "Kilomba Producoes Ltda",
        cpfCnpj: "33.163.124/0001-47",
        address: {
          street: "Rua Maestro Henrique Vogeler",
          number: "154",
          district: "Braz De Pina",
          city: "Rio de Janeiro",
          state: "RJ",
          zipCode: "21235-680",
        },
        isActive: true,
        totalOrders: 3,
        totalSpent: 4080,
        registeredAt: new Date("2024-06-01"),
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
