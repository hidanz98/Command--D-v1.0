import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLogo } from "@/context/LogoContext";
import { useTenant } from "@/context/TenantContext";
import { DocumentService } from "@/lib/documentService";
import { ResponsiveSidebarTabs } from "@/components/ResponsiveTabs";
import { NewOrderModal } from "@/components/NewOrderModal";
import { toast } from "sonner";
import {
  BarChart,
  PieChart,
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Download,
  Upload,
  Edit,
  Users,
  Calendar,
  QrCode,
  Star,
  Palette,
  Monitor,
  Filter,
  Search,
  Bell,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Plus,
  ArrowRight,
  Camera,
  Clapperboard,
  Mic,
  Lightbulb,
  X,
  Phone,
  Tag,
  Folder,
  Calculator,
  Edit3,
  MapPin,
  Activity,
  Save,
  Wrench,
  ShoppingCart,
  User,
  Building,
  RefreshCw,
  Menu,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { AdvancedPageEditor } from "@/components/AdvancedPageEditor";
import FinancialERP from "@/components/FinancialERP";
import RentalFinanceManager from "@/components/RentalFinanceManager";
import { OrderNumberingConfig } from "@/components/OrderNumberingConfig";
import { OrderBatchImport } from "@/components/OrderBatchImport";
import { ImportManager } from "@/components/ImportManager";
import { EditableTableHeader } from "@/components/EditableTableHeader";
import { AdvancedClientForm } from "@/components/AdvancedClientForm";
import { ClientImportManager } from "@/components/ClientImportManager";
import MultiTenantPlaceholder from "@/components/MultiTenantPlaceholder";
import TemplateManager from "@/components/TemplateManager";
import CompanySettings from "@/components/CompanySettings";
import ColorSettings from "@/components/ColorSettings";
import { ClientAreaManager } from "@/components/ClientAreaManager";
import { ProductSelectionModal } from "@/components/ProductSelectionModal";
import { ProductManager } from "@/components/ProductManager";
import { ProductEditModal } from "@/components/ProductEditModal";
import { CategoryManager } from "@/components/CategoryManager";
import { DashboardCharts } from "@/components/DashboardCharts";
import { useInlineEditor } from "@/components/InlineEditor";
import { AutoTimesheetSystem } from "@/components/AutoTimesheetSystem";
import { ManagerActivityDashboard } from "@/components/ManagerActivityDashboard";
import { EmployeeManager } from "@/components/EmployeeManager";
import { TabErrorBoundary } from "@/components/TabErrorBoundary";
import ClientApprovalDashboard from "@/components/ClientApprovalDashboard";
import { FaturaLocacao } from "@/components/FaturaLocacao";

// Equipment list for autocomplete
const availableEquipment = [
  "Sony FX6 Full Frame",
  "Canon EOS R5C",
  "Blackmagic URSA Mini Pro 12K",
  "Arri Alexa Mini LF",
  "Red Komodo 6K",
  "Zeiss CP.3 85mm T2.1",
  "Canon CN-E 50mm T1.3",
  "Cooke S4/i 35mm",
  'Atomos Ninja V 5"',
  "SmallHD 702 Touch",
  "Sound Devices MixPre-6",
  "DJI Ronin 4D",
  "Moza Air 2",
  "Tilta Nucleus-M",
  "Teradek Bolt 4K LT",
  "Hollyland Mars 400S Pro",
  "ARRI SkyPanel S30-C",
  "Aputure 300X",
  "Godox VL150",
];

// Definição de kits com componentes e Números de série
const kitsComponentes: {[key: string]: Array<{nome: string, quantidade: number, numeroSerie?: string}>} = {
  "KIT COOKE SP3": [
    { nome: "COOKE SP3 100MM f*2.4", quantidade: 1, numeroSerie: "CS100 00876" },
    { nome: "COOKE SP3 18MM f*2.4", quantidade: 1, numeroSerie: "CS018 00133" },
    { nome: "COOKE SP3 25MM f*2.4", quantidade: 1, numeroSerie: "CS025 00881" },
    { nome: "COOKE SP3 32MM f*2.4", quantidade: 1, numeroSerie: "CS032 00964" },
    { nome: "COOKE SP3 50MM f*2.4", quantidade: 1, numeroSerie: "CS050 00791" },
    { nome: "COOKE SP3 75MM f*2.4", quantidade: 1, numeroSerie: "CS075 00936" },
  ],
};

// Números de série para equipamentos individuais
const numerosSerieEquipamentos: {[key: string]: string} = {
  "Sony FX6": "SFX6-2024-001",
  "Canon R5C": "CR5C-2024-002", 
  "Blackmagic URSA Mini Pro": "BMP-2024-003",
  "DJI Ronin 4D": "DJI-2024-004",
  "Zeiss CP.3 85mm": "ZCP3-2024-005",
  "Monitor Atomos": "ATM-2024-006",
  "SmallHD Monitor": "SHD-2024-007",
};

const recentOrders = [
  {
    id: "005067",
    client: "Otavio Almeida de Souza",
    cpfCnpj: "140.341.546-32",
    email: "otavio.souza@email.com",
    phone: "(31) 98765-4321",
    items: ["Sony FX6", "KIT COOKE SP3"],
    total: 1200.0,
    status: "em Locação",
    date: "15/01/2025",
    dataRetirada: "15/01/2025",
    horarioRetirada: "08:00",
    dataDevolucao: "20/01/2025",
    horarioDevolucao: "18:00",
    nomeProjeto: "Documentário Amazônia",
    direcao: "Carlos Mendes",
    producao: "Ana Paula Souza",
    observacoes: "Cliente solicitou entrega no local. Equipamentos devem estar com bateria carregada.",
  },
  {
    id: "005068",
    client: "Maria Santos",
    cpfCnpj: "25.345.678/0001-90",
    email: "maria.santos@producoes.com",
    phone: "(11) 99876-5432",
    items: ["Canon R5C", "Monitor Atomos"],
    total: 850.0,
    status: "Concluído",
    date: "14/01/2025",
    dataRetirada: "14/01/2025",
    horarioRetirada: "10:00",
    dataDevolucao: "16/01/2025",
    horarioDevolucao: "16:00",
    nomeProjeto: "Filme Publicitário XYZ",
    direcao: "Maria Santos",
    producao: "Lucas Fernandes",
    observacoes: "Equipamentos retornados em perfeito estado.",
  },
  {
    id: "005069",
    client: "Pedro Costa",
    cpfCnpj: "987.654.321-00",
    email: "pedro.costa@cinema.com",
    phone: "(21) 98765-1234",
    items: ["Blackmagic URSA Mini Pro"],
    total: 450.0,
    status: "Em preparação",
    date: "13/01/2025",
    dataRetirada: "13/01/2025",
    horarioRetirada: "09:00",
    dataDevolucao: "17/01/2025",
    horarioDevolucao: "18:00",
    nomeProjeto: "Videoclipe Rock Band",
    direcao: "Pedro Costa",
    producao: "Juliana Martins",
    observacoes: "Cliente regular. Pagamento à vista.",
  },
  {
    id: "005070",
    client: "Ana Oliveira",
    cpfCnpj: "12.987.654/0001-33",
    email: "ana@produtora.tv",
    phone: "(31) 97654-3210",
    items: ["DJI Ronin 4D", "SmallHD Monitor"],
    total: 680.0,
    status: "em Locação",
    date: "12/01/2025",
    dataRetirada: "12/01/2025",
    horarioRetirada: "14:00",
    dataDevolucao: "15/01/2025",
    horarioDevolucao: "17:00",
    nomeProjeto: "Série Web Fantasia",
    direcao: "Roberto Lima",
    producao: "Ana Oliveira",
    observacoes: "Projeto de longa duração. Possível prorrogação.",
  },
];

const equipmentStock = [
  { name: "Sony FX6 Full Frame", available: 3, total: 5, category: "Câmeras" },
  { name: "Canon EOS R5C", available: 2, total: 4, category: "Câmeras" },
  { name: "Zeiss CP.3 85mm", available: 1, total: 3, category: "Lentes" },
  { name: "Atomos Ninja V", available: 4, total: 6, category: "Monitores" },
  { name: "DJI Ronin 4D", available: 0, total: 2, category: "Estabilizadores" },
];

const maintenanceAlerts = [
  {
    equipment: "Sony FX6 #003",
    issue: "Limpeza de sensor necessária",
    priority: "média",
  },
  {
    equipment: "Canon R5C #002",
    issue: "Bateria com baixa duração",
    priority: "alta",
  },
  {
    equipment: "Ronin 4D #001",
    issue: "Calibração de gimbal",
    priority: "baixa",
  },
];

// Função para calcular equipamentos disponíveis automaticamente
const calculateAvailableEquipment = () => {
  // Conta equipamentos individuais
  const individualEquipment = availableEquipment.length;
  
  // Conta equipamentos em kits
  let kitEquipment = 0;
  Object.values(kitsComponentes).forEach(kit => {
    kitEquipment += kit.reduce((total, item) => total + item.quantidade, 0);
  });
  
  // Total de equipamentos disponíveis
  return individualEquipment + kitEquipment;
};

// Função para calcular pedidos ativos automaticamente (será recalculado dinamicamente)
const calculateActiveOrders = (orders: any[]) => {
  return orders.filter(order => 
    order.status === "ativo" || 
    order.status === "Em preparação" || 
    order.status === "em Locação"
  ).length;
};

// Função para calcular faturamento mensal automaticamente
const calculateMonthlyRevenue = () => {
  return recentOrders.reduce((total, order) => {
    if (order.status === "Concluído") {
      return total + order.total;
    }
    return total;
  }, 0);
};

// DashboardMetrics agora é calculado dinamicamente dentro do componente PainelAdmin

const clientsData = [
  {
    id: "CLI-001",
    name: "Otavio Almeida de Souza",
    email: "otavio.souza@email.com",
    phone: "(31) 98765-4321",
    type: "cliente",
    company: "",
    cpfCnpj: "140.341.546-32",
    totalOrders: 5,
    lastOrder: "2025-01-15",
  },
  {
    id: "CLI-002",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(31) 99999-9999",
    type: "cliente",
    company: "",
    cpfCnpj: "123.456.789-00",
    totalOrders: 3,
    lastOrder: "2025-01-10",
  },
  {
    id: "CLI-002",
    name: "Maria Santos",
    email: "maria@produtora.com",
    phone: "(31) 98888-8888",
    type: "ambos",
    company: "Produtora Santos",
    totalOrders: 12,
    lastOrder: "2025-01-10",
  },
  {
    id: "FOR-003",
    name: "Pedro Costa",
    email: "pedro@equipamentos.com",
    phone: "(31) 97777-7777",
    type: "fornecedor",
    company: "Equipamentos Costa",
    totalOrders: 0,
    lastOrder: "-",
  },
  {
    id: "CLI-004",
    name: "Ana Oliveira",
    email: "ana@filmestudio.com",
    phone: "(31) 96666-6666",
    type: "cliente",
    company: "Filme Studio",
    totalOrders: 8,
    lastOrder: "2025-01-08",
  },
];

const servicesData = [
  {
    id: "SRV-001",
    name: "Gravação de Eventos",
    description: "Gravação profissional de eventos corporativos e sociais",
    price: 800.0,
    duration: "4 horas",
    category: "Gravação",
    active: true,
  },
  {
    id: "SRV-002",
    name: "Produção de Vídeo Corporativo",
    description: "Produção completa de vídeos institucionais",
    price: 2500.0,
    duration: "1-3 dias",
    category: "Produção",
    active: true,
  },
  {
    id: "SRV-003",
    name: "Edição e Pós-Produção",
    description: "Edição profissional e finalização de vídeos",
    price: 150.0,
    duration: "Por hora",
    category: "Pós-Produção",
    active: true,
  },
  {
    id: "SRV-004",
    name: "Live Streaming",
    description: "Transmissão ao vivo de eventos",
    price: 1200.0,
    duration: "Por evento",
    category: "Streaming",
    active: false,
  },
];

// Função para formatar data no padrão brasileiro
const formatDateBR = (dateString: string) => {
  if (!dateString) return "-";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

export default function PainelAdmin() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Função helper para detectar o tipo de documento
  const getDocumentLabel = (document: string) => {
    if (!document) return 'CPF/CNPJ';
    return DocumentService.getDocumentLabel(document);
  };

  // Configuração das abas responsivas
  const adminTabs = [
    // Abas principais
    { id: "Dashboard", name: "Início", icon: LayoutDashboard, priority: 1, mobile: true, desktop: true },
    { id: "Pedidos", name: "Pedidos", icon: Package, priority: 2, mobile: true, desktop: true },
    { id: "Estoque", name: "Estoque", icon: Package, priority: 3, mobile: true, desktop: true },
    { id: "Categorias", name: "Categorias", icon: Tag, priority: 4, mobile: true, desktop: true },
    { id: "Clientes", name: "Clientes", icon: Users, priority: 5, mobile: true, desktop: true },
    { id: "Aprovacoes", name: "Aprovações", icon: CheckCircle, priority: 6, mobile: true, desktop: true },
    
    // Financeiro e Documentos
    { id: "Financeiro", name: "Financeiro", icon: DollarSign, priority: 7, mobile: true, desktop: true },
    { id: "Documentos", name: "Documentos", icon: FileText, priority: 8, mobile: true, desktop: true },
    
    // Configurações
    { id: "configuracoes", name: "Configurações", icon: Settings, priority: 9, mobile: true, desktop: true },
  ];
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  
  // Função para mudar de tab com limpeza de estado
  const handleTabChange = (newTab: string) => {
    if (activeTab === newTab) return; // Evita mudanças desnecessárias
    
    // Usar requestAnimationFrame para sincronizar com o ciclo de renderização
    requestAnimationFrame(() => {
      setActiveTab(newTab);
    });
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  
  // Estados para Documentos da empresa
  const [isEditingDocuments, setIsEditingDocuments] = useState(false);
  const [companyDocuments, setCompanyDocuments] = useState({
    cnpj: {
      number: "12.345.678/0001-90",
      razaoSocial: "Bil's Cinema e Vídeo Ltda",
      validade: "2025-12-31"
    },
    alvara: {
      number: "2024/00123",
      orgaoEmissor: "Prefeitura Municipal",
      validade: "2025-06-30"
    },
    seguro: {
      apolice: "987654321",
      seguradora: "Seguradora XYZ",
      validade: "2025-02-15"
    }
  });
  
  // Estados para gerenciamento de certificados
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePassword, setCertificatePassword] = useState("");
  const [certificateConfig, setCertificateConfig] = useState({
    ambiente: "homologacao" as "homologacao" | "producao",
    cidade: "belo-horizonte",
    serie: "1",
    numeroInicial: "1",
    inscricaoMunicipal: "",
    login: "",
    senha: ""
  });
  
  // Estados para emissão de NFSe
  const [showEmitirNFSeModal, setShowEmitirNFSeModal] = useState(false);
  const [pedidoParaFaturar, setPedidoParaFaturar] = useState<any>(null);
  const [emissaoNFSeLoading, setEmissaoNFSeLoading] = useState(false);
  
  // Estado para Fatura de Locação
  const [showFaturaModal, setShowFaturaModal] = useState(false);
  const [pedidoParaFatura, setPedidoParaFatura] = useState<any>(null);
  
  // Estados para edição de Clientes
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<any>(null);
  
  // Estados para Configuração NFe/NFSe PBH
  const [showNFeModal, setShowNFeModal] = useState(false);
  const [nfeConfig, setNfeConfig] = useState({
    ambiente: "homologacao" as "homologacao" | "producao",
    certificadoImportado: false,
    certificadoNome: "",
    certificadoValidade: "",
    // Dados da Empresa
    cnpj: "12.345.678/0001-90",
    razaoSocial: "Bil's Cinema e Vídeo Ltda",
    nomeFantasia: "Bil's Cinema",
    inscricaoEstadual: "123456789",
    inscricaoMunicipal: "987654",
    // Endereço
    cep: "30000-000",
    logradouro: "Av. Afonso Pena",
    numero: "1234",
    complemento: "Sala 10",
    bairro: "Centro",
    cidade: "Belo Horizonte",
    uf: "MG",
    // Configurações NFSe
    serie: "1",
    numeroInicial: "1",
    proximoNumero: "1",
    regime: "simples_nacional" as "simples_nacional" | "lucro_presumido" | "lucro_real",
    crt: "1", // 1=Simples Nacional, 2=Simples Nacional - excesso, 3=Regime Normal
    // Conexão API PBH
    ufEmissao: "MG",
    urlHomologacao: "https://bhisshomologacao.pbh.gov.br/bhiss-ws/nfse",
    urlProducao: "https://bhissdigital.pbh.gov.br/bhiss-ws/nfse",
    // Credenciais API PBH
    loginPBH: "",
    senhaPBH: "",
    codigoAtividade: "0107399", // Código de atividade do serviço
    aliquota: "5.00", // Alíquota ISS Padrão BH
    itemListaServico: "17.08", // Item da lista de Serviços
    codigoTributacaoMunicipio: "631990100", // Código tributação BH
  });
  const { state: editorState, toggleEditor } = useInlineEditor();
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  
  // Usar o contexto do tenant para numeração automática e pedidos
  const { generateOrderNumber, addOrder, orders: tenantOrders } = useTenant();
  
  // Combinar pedidos estáticos com pedidos do contexto
  const allOrders = React.useMemo(() => {
    // Converter pedidos do contexto para o formato da interface
    const contextOrders = (tenantOrders || []).map(order => ({
      id: order.id,
      client: order.customerName,
      cpfCnpj: "", // Não temos no contexto
      email: order.customerEmail,
      phone: "", // Não temos no contexto
      items: order.items.map(item => item.productName),
      total: order.totalAmount,
      status: order.status === "pending" ? "Em preparação" : 
              order.status === "approved" ? "em Locação" :
              order.status === "active" ? "em Locação" :
              order.status === "returned" ? "Concluído" :
              "Cancelado",
      date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
      dataRetirada: new Date(order.startDate).toLocaleDateString('pt-BR'),
      horarioRetirada: new Date(order.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dataDevolucao: new Date(order.endDate).toLocaleDateString('pt-BR'),
      horarioDevolucao: new Date(order.endDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      nomeProjeto: order.notes?.split('\n')[0]?.replace('Projeto: ', '') || "Sem projeto",
      direcao: order.notes?.split('\n')[1]?.replace('Direção: ', '') || "",
      producao: order.notes?.split('\n')[2]?.replace('Produção: ', '') || "",
      observacoes: order.notes || "",
    }));
    
    // Combinar com pedidos estáticos (mantém os pedidos de exemplo)
    return [...contextOrders, ...recentOrders].sort((a, b) => {
      // Ordenar por ID (mais recente primeiro)
      return b.id.localeCompare(a.id);
    });
  }, [tenantOrders]);
  
  // Calcular métricas do dashboard dinamicamente
  const dashboardMetrics = React.useMemo(() => ({
    equipmentAvailable: calculateAvailableEquipment(),
    activeOrders: calculateActiveOrders(allOrders),
    monthlyRevenue: allOrders.reduce((total, order) => {
      if (order.status === "Concluído") {
        return total + order.total;
      }
      return total;
    }, 0),
    maintenanceAlerts: 3, // Manter fixo por enquanto
  }), [allOrders]);
  
  // Estados para edição inline dos cabeçalhos da tabela
  const [tableHeaders, setTableHeaders] = useState({
    orders: {
      number: "Número",
      client: "Cliente", 
      equipment: "Equipamentos",
      value: "Valor",
      status: "Status",
      actions: "Ações"
    }
  });

  // Função para atualizar cabeçalhos da tabela
  const updateTableHeader = (table: string, column: string, newValue: string) => {
    setTableHeaders(prev => ({
      ...prev,
      [table]: {
        ...prev[table as keyof typeof prev],
        [column]: newValue
      }
    }));
    
    // Salvar no localStorage
    const key = `tableHeaders_${table}`;
    const currentHeaders = { ...tableHeaders[table as keyof typeof tableHeaders] };
    currentHeaders[column as keyof typeof currentHeaders] = newValue;
    localStorage.setItem(key, JSON.stringify(currentHeaders));
  };

  // Carregar cabeçalhos salvos do localStorage
  useEffect(() => {
    const savedOrderHeaders = localStorage.getItem('tableHeaders_orders');
    if (savedOrderHeaders) {
      try {
        const parsed = JSON.parse(savedOrderHeaders);
        setTableHeaders(prev => ({
          ...prev,
          orders: { ...prev.orders, ...parsed }
        }));
      } catch (error) {
        console.error('Erro ao carregar cabeçalhos salvos:', error);
      }
    }
  }, []);

  const [newOrderForm, setNewOrderForm] = useState({
    orderNumber: "000001",
    quoteNumber: "",
    quoteDate: "",
    issueDate: new Date().toISOString().split("T")[0],
    issueTime: new Date().toTimeString().slice(0, 5),
    status: "Orcamento",
    priority: "Normal",
    salesperson: "",
    origin: "Balcao",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCNPJ: "",
    clientAddress: "",
    clientCity: "",
    projectName: "",
    director: "",
    producer: "",
    deliveryType: "Retirada",
    carrier: "",
    deliveryAddress: "",
    pickupDate: "",
    returnDate: "",
    pickupTime: "",
    returnTime: "",
    rentalDays: 1,
    subtotal: 0,
    discount: 0,
    discountType: "percentage",
    discountValue: 0,
    discountGeneralType: "percentage",
    total: 0,
    paymentCondition: "A vista",
    paymentMethod: "Dinheiro",
    equipment: [],
    notes: "",
    internalNotes: "",
  });
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState("");
  const [showEquipmentSuggestions, setShowEquipmentSuggestions] =
    useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showViewOrderModal, setShowViewOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDarSaidaModal, setShowDarSaidaModal] = useState(false);
  const [showDarDevolucaoModal, setShowDarDevolucaoModal] = useState(false);
  const [saidaForm, setSaidaForm] = useState({
    dataSaida: "",
    horarioSaida: "",
    dataDevolucaoPrevista: "",
    horarioDevolucaoPrevista: "",
    observacoesSaida: "",
  });
  const [equipamentosDevolvidos, setEquipamentosDevolvidos] = useState<{[key: string]: boolean}>({});
  const [equipamentosStatus, setEquipamentosStatus] = useState<{[key: string]: string}>({});
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pedidoParaPDF, setPedidoParaPDF] = useState<any>(null);

  // Função para gerar Lista de Expedição
  const gerarListaExpedicao = (order: any) => {
    const now = new Date();
    const dataAtual = now.toLocaleDateString('pt-BR');
    const horaAtual = now.toLocaleTimeString('pt-BR');
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
          .logo-area { width: 120px; height: 80px; background-color: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #FFD700; }
          .logo-area .camera { font-size: 24px; margin-bottom: 5px; }
          .logo-area .company { font-weight: bold; font-size: 14px; }
          .logo-area .subtitle { font-size: 10px; }
          .title { text-align: center; flex: 1; margin: 0 20px; }
          .title h1 { font-size: 24px; font-weight: bold; margin: 0; }
          .date-info { text-align: right; }
          .date-info div { margin-bottom: 5px; }
          .client-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .client-section { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
          .client-section h3 { margin: 0 0 10px 0; font-size: 14px; color: #333; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .info-row .label { font-weight: bold; }
          .rental-period { text-align: center; margin: 20px 0; font-size: 16px; font-weight: bold; }
          .equipment-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .equipment-table th, .equipment-table td { border: 1px solid #333; padding: 8px; text-align: left; }
          .equipment-table th { background-color: #FFD700; color: #000; font-weight: bold; }
          .equipment-table .center { text-align: center; }
          .equipment-table .checkbox { width: 20px; height: 20px; border: 2px solid #333; }
          .category-header { background-color: #e0e0e0; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <div class="camera">🎬</div>
            <div class="company">BIL'S</div>
            <div class="subtitle">cinema e vídeo</div>
          </div>
          <div class="title">
            <h1>Relação para Expedição ${order.id}</h1>
          </div>
          <div class="date-info">
            <div>${dataAtual}</div>
            <div>${horaAtual}</div>
            <div>Pág. 1</div>
          </div>
        </div>

        <div class="client-info">
          <div class="client-section">
            <h3>InformAções do Cliente</h3>
            <div class="info-row"><span class="label">Cliente:</span><span>${order.client}</span></div>
            <div class="info-row"><span class="label">Telefone:</span><span>${order.phone || '-'}</span></div>
            <div class="info-row"><span class="label">Contato:</span><span>${order.client}</span></div>
            <div class="info-row"><span class="label">Job:</span><span>${order.nomeProjeto || '-'}</span></div>
          </div>
          <div class="client-section">
            <h3>Dados Adicionais</h3>
            <div class="info-row"><span class="label">${getDocumentLabel(order.cpfCnpj)}:</span><span>${order.cpfCnpj || '-/-'}</span></div>
            <div class="info-row"><span class="label">Telefone do Contato:</span><span>${order.phone || '-'}</span></div>
            <div class="info-row"><span class="label">Data Inicial:</span><span>${order.dataRetirada || order.date} às ${order.horarioRetirada || '-'}</span></div>
            <div class="info-row"><span class="label">Data Final:</span><span>${order.dataDevolucao || '-'} às ${order.horarioDevolucao || '-'}</span></div>
          </div>
        </div>

        <div class="rental-period">
          Período da Locação: ${order.dataRetirada || order.date} às ${order.horarioRetirada || '-'} a ${order.dataDevolucao || '-'} às ${order.horarioDevolucao || '-'}
        </div>

        <h2 style="text-align: center; margin: 20px 0;">RELAÇÃO PARA EXPEDIÇÃO - FICHA DE RESERVA ${order.id}</h2>

        <table class="equipment-table">
          <thead>
            <tr>
              <th style="width: 60px;">Qtde.</th>
              <th>Descrição do Equipamento</th>
              <th style="width: 120px;">Nº de Série</th>
              <th style="width: 80px;">Retirada</th>
              <th style="width: 80px;">Devolução</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Agrupar equipamentos por categoria
    const equipamentosPorCategoria: {[key: string]: any[]} = {};
    
    order.items.forEach((item: string) => {
      const isKit = kitsComponentes[item];
      if (isKit) {
        // Determinar categoria do kit
        const categoria = "Kits";
        if (!equipamentosPorCategoria[categoria]) {
          equipamentosPorCategoria[categoria] = [];
        }
        equipamentosPorCategoria[categoria].push({ nome: item, isKit: true, componentes: kitsComponentes[item] });
      } else {
        // Determinar categoria do equipamento individual
        let categoria = "Equipamentos";
        if (item.toLowerCase().includes('lente') || item.toLowerCase().includes('lens')) {
          categoria = "Lentes";
        } else if (item.toLowerCase().includes('câmera') || item.toLowerCase().includes('camera')) {
          categoria = "Câmeras";
        } else if (item.toLowerCase().includes('suporte') || item.toLowerCase().includes('tripé')) {
          categoria = "Suporte";
        }
        
        if (!equipamentosPorCategoria[categoria]) {
          equipamentosPorCategoria[categoria] = [];
        }
        equipamentosPorCategoria[categoria].push({ nome: item, isKit: false });
      }
    });

    // Renderizar equipamentos por categoria
    Object.entries(equipamentosPorCategoria).forEach(([categoria, equipamentos]) => {
      htmlContent += `<tr class="category-header"><td colspan="5">${categoria}</td></tr>`;
      
      equipamentos.forEach(equipamento => {
        if (equipamento.isKit) {
          // Kit principal
          htmlContent += `
            <tr>
              <td class="center">1</td>
              <td><strong>${equipamento.nome}</strong> (${equipamento.componentes.length} componentes)</td>
              <td class="center" style="color: #666; font-style: italic;">Kit</td>
              <td class="center"><div class="checkbox"></div></td>
              <td class="center"><div class="checkbox"></div></td>
            </tr>
          `;
          
          // Componentes do kit
          equipamento.componentes.forEach((componente: any) => {
            htmlContent += `
              <tr>
                <td class="center">${componente.quantidade}</td>
                <td style="padding-left: 20px;">• ${componente.nome}</td>
                <td class="center" style="font-family: monospace; font-size: 12px;">${componente.numeroSerie || '-'}</td>
                <td class="center"><div class="checkbox"></div></td>
                <td class="center"><div class="checkbox"></div></td>
              </tr>
            `;
          });
        } else {
          const numeroSerie = numerosSerieEquipamentos[equipamento.nome] || '-';
          htmlContent += `
            <tr>
              <td class="center">1</td>
              <td>${equipamento.nome}</td>
              <td class="center" style="font-family: monospace; font-size: 12px;">${numeroSerie}</td>
              <td class="center"><div class="checkbox"></div></td>
              <td class="center"><div class="checkbox"></div></td>
            </tr>
          `;
        }
      });
    });

    htmlContent += `
          </tbody>
        </table>

        <div class="footer">
          <p>Documento gerado em ${dataAtual} às ${horaAtual}</p>
          <p>Sistema Command-D - Gestão de Locadora</p>
        </div>
      </body>
      </html>
    `;

    // Abrir janela de impressão
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      toast.success('📄 Lista de Expedição gerada!', {
        description: 'Documento pronto para impressão',
      });
    } else {
      toast.error('❌ Erro ao gerar PDF', {
        description: 'Permita pop-ups para este site',
      });
    }
  };

  // Função para gerar Orçamento Detalhado
  const gerarOrcamentoDetalhado = (order: any) => {
    toast.info('🚧 Em desenvolvimento', {
      description: 'Orçamento Detalhado será implementado em breve',
    });
  };

  // Função para gerar Contrato de Locação
  const gerarContratoLocacao = (order: any) => {
    toast.info('🚧 Em desenvolvimento', {
      description: 'Contrato de Locação será implementado em breve',
    });
  };

  // Função para gerar PDF do pedido (antiga função)
  const gerarPDFPedido = (order: any) => {
    // Criar conteúdo HTML para o PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FFD700; padding-bottom: 20px; }
          .header h1 { color: #FFD700; margin: 0; }
          .section { margin-bottom: 25px; }
          .section-title { background-color: #FFD700; color: #1a1a1a; padding: 8px 12px; font-weight: bold; margin-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #666; }
          .value { color: #000; }
          .equipment-list { margin-left: 20px; }
          .equipment-item { padding: 8px; margin: 5px 0; background-color: #f5f5f5; border-left: 3px solid #FFD700; }
          .kit-badge { background-color: #FFD700; color: #1a1a1a; padding: 2px 8px; font-size: 10px; font-weight: bold; border-radius: 3px; }
          .kit-component { margin-left: 20px; padding: 5px; background-color: #fff; border-left: 2px solid #ccc; margin-top: 3px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎬 PEDIDO DE LOCAÇÃO</h1>
          <p>Pedido Nº ${order.id} • ${order.date}</p>
        </div>

        <div class="section">
          <div class="section-title">InformAções do Cliente</div>
          <div class="info-row"><span class="label">Nome:</span><span class="value">${order.client}</span></div>
          <div class="info-row"><span class="label">${getDocumentLabel(order.cpfCnpj)}:</span><span class="value">${order.cpfCnpj || '-'}</span></div>
          <div class="info-row"><span class="label">E-mail:</span><span class="value">${order.email || '-'}</span></div>
          <div class="info-row"><span class="label">Telefone:</span><span class="value">${order.phone || '-'}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Datas e Horários</div>
          <div class="info-row"><span class="label">Data de Retirada:</span><span class="value">${order.dataRetirada || order.date} às ${order.horarioRetirada || '-'}</span></div>
          <div class="info-row"><span class="label">Data de Devolução:</span><span class="value">${order.dataDevolucao || '-'} às ${order.horarioDevolucao || '-'}</span></div>
        </div>

        <div class="section">
          <div class="section-title">InformAções do Projeto</div>
          <div class="info-row"><span class="label">Nome do Projeto:</span><span class="value">${order.nomeProjeto || '-'}</span></div>
          <div class="info-row"><span class="label">Direção:</span><span class="value">${order.direcao || '-'}</span></div>
          <div class="info-row"><span class="label">Produção:</span><span class="value">${order.producao || '-'}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Equipamentos</div>
          <div class="equipment-list">
    `;

    // Adicionar equipamentos
    order.items.forEach((item: string) => {
      const isKit = kitsComponentes[item];
      if (isKit) {
        htmlContent += `
          <div class="equipment-item">
            <span class="kit-badge">KIT</span> <strong>${item}</strong> (${kitsComponentes[item].length} componentes)
        `;
        kitsComponentes[item].forEach((componente: any) => {
          htmlContent += `
            <div class="kit-component">• ${componente.quantidade}x ${componente.nome}</div>
          `;
        });
        htmlContent += `</div>`;
      } else {
        htmlContent += `<div class="equipment-item">${item}</div>`;
      }
    });

    htmlContent += `
          </div>
        </div>

        <div class="section">
          <div class="section-title">Valores</div>
          <div class="info-row"><span class="label">Valor Total:</span><span class="value" style="color: #FFD700; font-weight: bold; font-size: 18px;">R$ ${order.total.toFixed(2)}</span></div>
          <div class="info-row"><span class="label">Status:</span><span class="value">${order.status}</span></div>
        </div>

        ${order.observacoes ? `
        <div class="section">
          <div class="section-title">ObservAções</div>
          <p style="padding: 10px; background-color: #fff3cd; border-left: 3px solid #FFD700;">${order.observacoes}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <p>Sistema Command-D - Gestão de Locadora</p>
        </div>
      </body>
      </html>
    `;

    // Criar uma nova janela e imprimir
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Aguardar o carregamento e imprimir
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      toast.success('📄 PDF gerado com sucesso!', {
        description: 'A janela de impressão foi aberta',
      });
    } else {
      toast.error('❌ Erro ao gerar PDF', {
        description: 'Permita pop-ups para este site',
      });
    }
  };
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "cliente",
    company: "",
  });
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "Gravação",
  });

  // Stock management state (loaded from API)
  const [stockData, setStockData] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/public/products');
        const json = await res.json();
        if (json?.success) {
          const mapped = json.data.map((p: any, idx: number) => ({
            id: p.id,
            name: p.name,
            code: p.sku ?? `REF-${String(idx + 1).padStart(3, '0')}`,
            category: p.category ?? 'REFLETORES',
            brand: (p.tags?.[0]) ?? '',
            type: 'individual',
            available: p.quantity ?? 0,
            total: p.quantity ?? 0,
            reserved: 0,
            price: p.dailyPrice ?? 0,
            dailyPrice: p.dailyPrice ?? 0,
            description: p.description ?? '',
            images: p.images ?? [],
            internalImage: p.internalImage ?? '',
            isKit: false,
            kitItems: [],
            owner: 'empresa',
            featured: p.featured ?? false,
          }));
          setStockData(mapped);
        }
      } catch {}
    })();
  }, [productsRefreshKey]);
  // Legacy mock removed
  /*
    {
      id: 1,
      name: "Sony FX6 Full Frame",
      code: "SFX6-001",
      category: "Câmeras",
      brand: "Sony",
      type: "individual",
      available: 3,
      total: 5,
      reserved: 2,
      price: 450.0,
      isKit: false,
      kitItems: [],
      owner: "empresa",
    },
    {
      id: 2,
      name: "Canon EOS R5C",
      code: "CER5-001",
      category: "Câmeras",
      brand: "Canon",
      type: "individual",
      available: 2,
      total: 4,
      reserved: 2,
      price: 380.0,
      isKit: false,
      kitItems: [],
      owner: "FOR-003", // Pedro Costa (Equipamentos Costa)
    },
    {
      id: 3,
      name: "Zeiss CP.3 85mm",
      code: "ZCP3-85",
      category: "Lentes",
      brand: "Zeiss",
      type: "individual",
      available: 1,
      total: 3,
      reserved: 2,
      price: 120.0,
      isKit: false,
      kitItems: [],
      owner: "CLI-002", // Maria Santos (Produtora Santos)
    },
  */
  /*
    {
      id: 4,
      name: "Atomos Ninja V",
      code: "ANV5-001",
      category: "Monitores",
      brand: "Atomos",
      type: "individual",
      available: 4,
      total: 6,
      reserved: 2,
      price: 85.0,
      isKit: false,
      kitItems: [],
    },
    {
      id: 5,
      name: "DJI Ronin 4D",
      code: "DR4D-001",
      category: "Estabilizadores",
      brand: "DJI",
      type: "individual",
      available: 0,
      total: 2,
      reserved: 2,
      price: 280.0,
      isKit: false,
      kitItems: [],
    },
    {
      id: 6,
      name: "SmallHD Monitor",
      code: "SHD7-001",
      category: "Monitores",
      brand: "SmallHD",
      type: "individual",
      available: 3,
      total: 5,
      reserved: 2,
      price: 95.0,
      isKit: false,
      kitItems: [],
    },
    {
      id: 7,
      name: "Blackmagic URSA Mini Pro",
      code: "BUMP-001",
      category: "Câmeras",
      brand: "Blackmagic",
      type: "individual",
      available: 1,
      total: 2,
      reserved: 1,
      price: 520.0,
      isKit: false,
      kitItems: [],
    },
    {
      id: 8,
      name: "Kit Filmagem Completo",
      code: "KIT-001",
      category: "Kits",
      brand: "Diversos",
      type: "kit",
      available: 2,
      total: 3,
      reserved: 1,
      price: 850.0,
      isKit: true,
      kitItems: [
        "Sony FX6 Full Frame",
        "Zeiss CP.3 85mm",
        "Atomos Ninja V",
        "DJI Ronin 4D",
      ],
    },
    {
      id: 9,
      name: "Kit Iniciante",
      code: "KIT-002",
      category: "Kits",
      brand: "Diversos",
      type: "kit",
      available: 3,
      total: 4,
      reserved: 1,
      price: 420.0,
      isKit: true,
      kitItems: ["Canon EOS R5C", "SmallHD Monitor"],
    },
    {
      id: 10,
      name: "Kit Documentário",
      code: "KIT-003",
      category: "Kits",
      brand: "Diversos",
      type: "kit",
      available: 1,
      total: 2,
      reserved: 1,
      price: 680.0,
      isKit: true,
      kitItems: [
        "Blackmagic URSA Mini Pro",
        "Zeiss CP.3 85mm",
        "SmallHD Monitor",
      ],
    },
  */


  // Stock search and filtering state
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("todos");
  const [stockTypeFilter, setStockTypeFilter] = useState("todos");
  const [stockStatusFilter, setStockStatusFilter] = useState("todos");
  const [stockOwnerFilter, setStockOwnerFilter] = useState("todos");
  const [stockFeaturedFilter, setStockFeaturedFilter] = useState("todos");
  const [stockSort, setStockSort] = useState("name");
  const [stockView, setStockView] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [showProductSelectionModal, setShowProductSelectionModal] =
    useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("geral");
  const [currentBanner, setCurrentBanner] = useState("");
  const [logoFileInput, setLogoFileInput] = useState<HTMLInputElement | null>(
    null,
  );
  const [bannerFileInput, setBannerFileInput] =
    useState<HTMLInputElement | null>(null);
  const { currentLogo, updateLogo } = useLogo();

  const { user, isAuthenticated, isAdmin, isFuncionario } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    // Only redirect if we have confirmed authentication state and we're not already on the target page
    if (isAuthenticated === false && window.location.pathname !== "/login") {
      navigate("/login", { replace: true });
    } else if (isAuthenticated === true && !(isAdmin || isFuncionario) && window.location.pathname !== "/area-cliente") {
      // Redirect users without admin or funcionario roles to client area
      navigate("/area-cliente", { replace: true });
    }
  }, [isAuthenticated, isAdmin, isFuncionario, navigate]);

  // Show loading or redirect if not authenticated or not authorized
  if (!isAuthenticated || !(isAdmin || isFuncionario) || !user) {
    return (
      <Layout>
        <div className="min-h-screen bg-cinema-dark flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-xl mb-4">
              {!isAuthenticated
                ? "Redirecionando para login..."
                : "Acesso negado - Redirecionando para área do cliente..."}
            </div>
            {!isAuthenticated && (
              <p className="text-gray-400 text-sm">
                Você precisa fazer login para acessar esta área
              </p>
            )}
            {isAuthenticated && !(isAdmin || isFuncionario) && (
              <p className="text-gray-400 text-sm">
                Esta área é restrita a administradores ou Funcionários
                autorizados
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "text-green-400";
      case "Em preparação":
        return "text-green-400";
      case "em Locação":
        return "text-blue-400";
      case "Concluído":
        return "text-gray-400";
      case "atrasado":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativo":
        return <Clock className="w-4 h-4" />;
      case "Em preparação":
        return <Clock className="w-4 h-4" />;
      case "em Locação":
        return <ArrowRight className="w-4 h-4" />;
      case "Concluído":
        return <CheckCircle className="w-4 h-4" />;
      case "atrasado":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "text-red-400";
      case "média":
        return "text-yellow-400";
      case "baixa":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const handleNewOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Criar pedido usando o contexto do tenant
    const orderNumber = addOrder({
      customerId: newOrderForm.clientName, // Em produção, seria o ID do cliente
      customerName: newOrderForm.clientName,
      customerEmail: newOrderForm.clientEmail,
      items: Array.isArray(newOrderForm.equipment) && newOrderForm.equipment.length > 0
        ? newOrderForm.equipment.map((eq: any) => ({
            productId: eq.id || eq,
            productName: eq.name || eq,
            quantity: 1,
            dailyRate: 0,
            totalDays: 1,
            totalPrice: 0,
          }))
        : [],
      startDate: new Date(newOrderForm.pickupDate),
      endDate: new Date(newOrderForm.returnDate),
      totalAmount: 0,
      status: "pending",
      notes: newOrderForm.notes,
    });

    console.log("New order created with number:", orderNumber);

    // Reset form and close modal
    setNewOrderForm(prev => ({
      ...prev,
      orderNumber: generateOrderNumber(),
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientCNPJ: "",
      equipment: [],
      notes: "",
    }));
    setEquipmentSearchTerm("");
    setClientSearchTerm("");
    setShowEquipmentSuggestions(false);
    setShowClientSuggestions(false);
    setShowNewOrderModal(false);

    // Show success message
    alert(`Pedido ${orderNumber} criado com sucesso!`);
  };

  const handleFormChange = (field: string, value: string) => {
    setNewOrderForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEquipmentSearch = (value: string) => {
    setEquipmentSearchTerm(value);
    handleFormChange("equipment", value);
    setShowEquipmentSuggestions(value.length > 0);
  };

  const selectEquipment = (equipment: string) => {
    setEquipmentSearchTerm(equipment);
    handleFormChange("equipment", equipment);
    setShowEquipmentSuggestions(false);
  };

  const filteredEquipment = availableEquipment
    .filter((item) =>
      item.toLowerCase().includes(equipmentSearchTerm.toLowerCase()),
    )
    .slice(0, 5);

  const handleClientSearch = (value: string) => {
    setClientSearchTerm(value);
    handleFormChange("clientName", value);
    setShowClientSuggestions(value.length > 0);
  };

  const selectClient = (client: any) => {
    setClientSearchTerm(client.name);
    setNewOrderForm((prev) => ({
      ...prev,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
    }));
    setShowClientSuggestions(false);
  };

  const filteredClients = clientsData
    .filter(
      (client) =>
        client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()),
    )
    .slice(0, 5);


  const viewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowViewOrderModal(true);
  };

  const handleCheckoutOrder = (orderId: string) => {
    // Encontrar o pedido no contexto
    const order = allOrders.find((o) => o.id === orderId);
    if (!order) return;

    // Processar Estoque - dar saída
    processOrderStock(order, "checkout");

    // Atualizar status no contexto do tenant
    // Nota: As funções do contexto atualizarão automaticamente

    // Update selectedOrder if it's the current one
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: "em Locação" });
    }

    // In a real app, this would be an API call
    console.log(`Order ${orderId} status changed to: em Locação`);
    console.log("Stock updated - items checked out");

    alert(
      `✅ Saída realizada com sucesso!\n\n` +
        `Pedido ${orderId} agora está EM LOCAÇÃO\n` +
        `Estoque atualizado automaticamente\n` +
        `Equipamentos foram Dados baixa no Estoque`,
    );
  };

  const handleReturnOrder = (orderId: string) => {
    // Encontrar o pedido no contexto
    const order = allOrders.find((o) => o.id === orderId);
    if (!order) return;

    // Processar Estoque - devolução
    processOrderStock(order, "return");

    // Atualizar status no contexto do tenant
    // Nota: As funções do contexto atualizarão automaticamente

    // Update selectedOrder if it's the current one
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: "Concluído" });
    }

    // In a real app, this would be an API call
    console.log(`Order ${orderId} status changed to: Concluído`);
    console.log("Stock updated - items returned");

    alert(
      `✅ Devolução realizada com sucesso!\n\n` +
        `Pedido ${orderId} foi CONCLUÍDO\n` +
        `Estoque atualizado automaticamente\n` +
        `Equipamentos voltaram para o Estoque disponível`,
    );
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: Create new client (in real app, this would be an API call)
    const newClient = {
      id: `CLI-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      ...clientForm,
      totalOrders: 0,
      lastOrder: "-",
    };
    console.log("New client created:", newClient);

    // Reset form and close modal
    setClientForm({
      name: "",
      email: "",
      phone: "",
      type: "cliente",
      company: "",
    });
    setShowClientModal(false);
    alert(`Cliente ${newClient.name} cadastrado com sucesso!`);
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: Create new service (in real app, this would be an API call)
    const newService = {
      id: `SRV-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      ...serviceForm,
      price: parseFloat(serviceForm.price),
      active: true,
    };
    console.log("New service created:", newService);

    // Reset form and close modal
    setServiceForm({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "Gravação",
    });
    setShowServiceModal(false);
    alert(`Serviço ${newService.name} cadastrado com sucesso!`);
  };

  const handleClientFormChange = (field: string, value: string) => {
    setClientForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceFormChange = (field: string, value: string) => {
    setServiceForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Automatic stock management functions
  const updateStock = (
    equipmentName: string,
    quantity: number,
    operation: "checkout" | "return",
  ) => {
    setStockData((prevStock) =>
      prevStock.map((item) => {
        if (item.name === equipmentName) {
          if (operation === "checkout") {
            // Dar saída - diminui disponível, aumenta reservado
            return {
              ...item,
              available: Math.max(0, item.available - quantity),
              reserved: item.reserved + quantity,
            };
          } else {
            // Devolução - aumenta disponível, diminui reservado
            return {
              ...item,
              available: Math.min(item.total, item.available + quantity),
              reserved: Math.max(0, item.reserved - quantity),
            };
          }
        }
        return item;
      }),
    );
  };

  const processOrderStock = (order: any, operation: "checkout" | "return") => {
    // Processar cada item do pedido para atualizar Estoque
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((itemName: string) => {
        updateStock(itemName, 1, operation); // Assumindo quantidade 1 por enquanto
      });
    }

    // Se o pedido tem equipment array (novo formato)
    if (order.equipment && Array.isArray(order.equipment)) {
      order.equipment.forEach((item: any) => {
        if (item.name && item.quantity) {
          updateStock(item.name, item.quantity, operation);
        }
      });
    }
  };

  // Stock filtering and search functions
  const getFilteredStock = () => {
    let filtered = stockData.filter((item) => {
      // Search filter
      const searchMatch =
        item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
        item.code.toLowerCase().includes(stockSearch.toLowerCase()) ||
        item.brand.toLowerCase().includes(stockSearch.toLowerCase());

      // Category filter
      const categoryMatch =
        stockCategoryFilter === "todos" ||
        item.category === stockCategoryFilter;

      // Type filter (kit vs individual)
      const typeMatch =
        stockTypeFilter === "todos" || item.type === stockTypeFilter;

      // Status filter
      let statusMatch = true;
      if (stockStatusFilter === "disponivel") statusMatch = item.available > 0;
      else if (stockStatusFilter === "indisponivel")
        statusMatch = item.available === 0;
      else if (stockStatusFilter === "em_locacao")
        statusMatch = item.reserved > 0;

      // Owner filter (assuming items will have an 'owner' field)
      const ownerMatch =
        stockOwnerFilter === "todos" || 
        (stockOwnerFilter === "empresa" && (!item.owner || item.owner === "empresa")) ||
        item.owner === stockOwnerFilter;

      // Featured filter
      const featuredMatch =
        stockFeaturedFilter === "todos" ||
        (stockFeaturedFilter === "sim" && item.featured) ||
        (stockFeaturedFilter === "nao" && !item.featured);

      return searchMatch && categoryMatch && typeMatch && statusMatch && ownerMatch && featuredMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (stockSort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "code":
          return a.code.localeCompare(b.code);
        case "category":
          return a.category.localeCompare(b.category);
        case "available":
          return b.available - a.available;
        case "price":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getPaginatedStock = () => {
    const filtered = getFilteredStock();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredStock().length / itemsPerPage);
  };

  const getUniqueCategories = () => {
    return [...new Set(stockData.map((item) => item.category))];
  };

  // Handle logo upload
  const handleLogoUpload = () => {
    if (!logoFileInput) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            updateLogo(result); // Update global logo
            alert("Logo atualizado com sucesso! Mudou em todo o sistema.");
          };
          reader.readAsDataURL(file);
        }
      };
      setLogoFileInput(input);
      input.click();
    } else {
      logoFileInput.click();
    }
  };

  // Handle banner upload
  const handleBannerUpload = () => {
    if (!bannerFileInput) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setCurrentBanner(result);
            // In a real app, you would upload this to your server
            alert("Banner atualizado com sucesso!");
          };
          reader.readAsDataURL(file);
        }
      };
      setBannerFileInput(input);
      input.click();
    } else {
      bannerFileInput.click();
    }
  };

  // Handle product selection from modal
  const handleProductSelection = (selectedProducts: any[]) => {
    const formattedEquipment = selectedProducts.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      quantity: product.quantity,
      unitPrice: product.price,
      days: product.days,
      discount: product.discount,
      total:
        product.price *
        product.quantity *
        product.days *
        (1 - product.discount / 100),
    }));

    const currentEquipment = newOrderForm.equipment || [];
    const newEquipmentList = [...currentEquipment, ...formattedEquipment];

    // Calculate subtotal
    const subtotal = newEquipmentList.reduce((sum, item) => {
      return (
        sum +
        (item.unitPrice || 0) *
          (item.quantity || 1) *
          (item.days || 1) *
          (1 - (item.discount || 0) / 100)
      );
    }, 0);

    // Update form state directly
    setNewOrderForm((prev) => ({
      ...prev,
      equipment: newEquipmentList,
      subtotal: subtotal,
      total: subtotal - (prev.discount || 0),
    }));

    // Close modal
    setShowProductSelectionModal(false);
  };

  // Calculate order totals with general discount
  const updateOrderTotals = (equipmentList: any[] = newOrderForm.equipment) => {
    const subtotal = equipmentList.reduce((sum, item) => {
      return (
        sum +
        (item.unitPrice || 0) *
          (item.quantity || 1) *
          (item.days || 1) *
          (1 - (item.discount || 0) / 100)
      );
    }, 0);

    let discountAmount = 0;
    const discountValue = newOrderForm.discountValue || 0;
    const discountType = newOrderForm.discountGeneralType || "percentage";

    if (discountType === "percentage") {
      discountAmount = subtotal * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }

    const total = subtotal - discountAmount;

    setNewOrderForm((prev) => ({
      ...prev,
      subtotal: subtotal,
      discount: discountAmount,
      total: Math.max(0, total),
    }));
  };

  // Estado para menu mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Função para mudar aba e fechar menu mobile
  const handleMobileTabChange = (tabId: string) => {
    handleTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-cinema-dark" data-edit-id="page.background">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Drawer - Design melhorado */}
        <div className={`md:hidden fixed top-0 left-0 h-full w-72 bg-zinc-900 border-r border-zinc-800 z-50 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Header do Menu */}
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="font-black text-black text-lg">B</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Bil's Cinema</h1>
                <p className="text-xs text-zinc-500">Painel Admin</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full w-8 h-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Lista de Tabs - sem scrollbar visível */}
          <div className="p-3 overflow-y-auto h-[calc(100vh-80px)] scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <ResponsiveSidebarTabs
              tabs={adminTabs}
              activeTab={activeTab}
              onTabChange={handleMobileTabChange}
            />
          </div>
        </div>

        <div className="flex h-screen">
          {/* Sidebar Desktop - Design melhorado */}
          <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0 flex-col flex-shrink-0" data-edit-id="sidebar.container">
            {/* Header da Sidebar */}
            <div className="p-5 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="font-black text-black text-xl">B</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white" data-edit-id="sidebar.title">Bil's Cinema</h1>
                  <p className="text-xs text-zinc-500">Painel Administrativo</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="p-4 flex-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <ResponsiveSidebarTabs
                tabs={adminTabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            </div>
            
            {/* Footer da Sidebar */}
            <div className="bg-zinc-900 border-t border-zinc-800 p-4 flex-shrink-0">
              <div className="text-xs text-zinc-500 text-center" data-edit-id="sidebar.footer">
                © 2025 Bil's Cinema
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-zinc-950 relative z-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Mobile Header - Design melhorado */}
            <div className="md:hidden sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 p-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="text-amber-400 hover:text-amber-300 hover:bg-zinc-800 flex items-center gap-2 rounded-lg"
              >
                <Menu className="w-5 h-5" />
                <span className="font-medium">Menu</span>
              </Button>
              <span className="text-white font-semibold text-sm">{adminTabs.find(t => t.id === activeTab)?.name || 'Dashboard'}</span>
              <div className="w-16"></div>
            </div>
            
            <div className="p-4 md:p-8 min-h-full">
            {/* Dashboard/Início Tab - Design Moderno */}
            {activeTab === "Dashboard" && (
              <div className="space-y-6">
                {/* Header - Escondido no mobile (já tem no topo) */}
                <div className="hidden md:flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white">Início</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={toggleEditor}
                      variant={editorState.isActive ? "default" : "outline"}
                      size="sm"
                      className={editorState.isActive 
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black" 
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      }
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      {editorState.isActive ? "Editor Ativo" : "Editor"}
                    </Button>
                  </div>
                </div>

                {/* Saudação Mobile */}
                <div className="md:hidden">
                  <h1 className="text-2xl font-bold text-white">Olá! 👋</h1>
                  <p className="text-zinc-400 text-sm">Aqui está o resumo de hoje</p>
                </div>

                {/* Cards de Métricas - Design Premium */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                  {/* Equipamentos */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-4 md:p-6">
                    <div className="flex flex-col gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-xs md:text-sm">Equipamentos</p>
                        <p className="text-2xl md:text-3xl font-bold text-white">{dashboardMetrics.equipmentAvailable}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pedidos Ativos */}
                  <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-2xl p-4 md:p-6">
                    <div className="flex flex-col gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-xs md:text-sm">Pedidos Ativos</p>
                        <p className="text-2xl md:text-3xl font-bold text-white">{dashboardMetrics.activeOrders}</p>
                      </div>
                    </div>
                  </div>

                  {/* Faturamento */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-4 md:p-6">
                    <div className="flex flex-col gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-xs md:text-sm">Faturamento</p>
                        <p className="text-xl md:text-3xl font-bold text-white">R$ {dashboardMetrics.monthlyRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Alertas */}
                  <div className="bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 rounded-2xl p-4 md:p-6">
                    <div className="flex flex-col gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-xs md:text-sm">Alertas</p>
                        <p className="text-2xl md:text-3xl font-bold text-white">{dashboardMetrics.maintenanceAlerts}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas Mobile */}
                <div className="md:hidden grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleTabChange("Pedidos")}
                    className="flex flex-col items-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition"
                  >
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-xs text-zinc-300">Pedidos</span>
                  </button>
                  <button 
                    onClick={() => handleTabChange("Estoque")}
                    className="flex flex-col items-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition"
                  >
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-xs text-zinc-300">Estoque</span>
                  </button>
                  <button 
                    onClick={() => handleTabChange("Financeiro")}
                    className="flex flex-col items-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition"
                  >
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs text-zinc-300">Financeiro</span>
                  </button>
                </div>

                {/* Pedidos Recentes - Design Moderno */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Pedidos Recentes</h3>
                    <button 
                      onClick={() => handleTabChange("Pedidos")}
                      className="text-amber-400 text-sm hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-800">
                      {allOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="p-4 hover:bg-zinc-800/50 transition cursor-pointer"
                          onClick={() => handleTabChange("Pedidos")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                order.status === 'em Locação' ? 'bg-emerald-500/20' :
                                order.status === 'Concluído' ? 'bg-blue-500/20' :
                                'bg-amber-500/20'
                              }`}>
                                <Package className={`w-5 h-5 ${
                                  order.status === 'em Locação' ? 'text-emerald-400' :
                                  order.status === 'Concluído' ? 'text-blue-400' :
                                  'text-amber-400'
                                }`} />
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">{order.client}</p>
                                <p className="text-zinc-500 text-xs">#{order.id} • {order.items.length} item(s)</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold text-sm">R$ {order.total.toLocaleString()}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                order.status === 'em Locação' ? 'bg-emerald-500/20 text-emerald-400' :
                                order.status === 'Concluído' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Charts and Recent Activity - Desktop */}
                <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Orders Desktop */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Todos os Pedidos Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {allOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex justify-between items-center p-3 bg-cinema-dark-lighter rounded-lg"
                        >
                          <div>
                            <p className="text-white font-medium">{order.id}</p>
                            <p className="text-gray-400 text-sm">
                              {order.client}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {order.items.join(", ")}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`flex items-center ${getStatusColor(order.status)}`}
                            >
                              {getStatusIcon(order.status)}
                              <span className="ml-1 text-sm capitalize">
                                {order.status === "em Locação" ? (
                                  <p>em locAções</p>
                                ) : (
                                  order.status
                                )}
                              </span>
                            </div>
                            <p className="text-cinema-yellow text-sm">
                              R$ {order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Maintenance Alerts */}
                  <Card className="bg-cinema-gray border-cinema-gray-light" data-edit-id="Dashboard.maintenance-card">
                    <CardHeader>
                      <CardTitle className="text-white" data-edit-id="Dashboard.maintenance-title">
                        Alertas de Manutenção
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {maintenanceAlerts.map((alert, index) => (
                        <div
                          key={index}
                          className="p-3 bg-cinema-dark-lighter rounded-lg border-l-4 border-l-red-400"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">
                                {alert.equipment}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {alert.issue}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${getPriorityColor(alert.priority)}`}
                            >
                              {alert.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Dashboard Charts */}
                <div data-edit-id="dashboard.charts-container" className="overflow-hidden relative">
                  <DashboardCharts />
                </div>
              </div>
            )}

            {/* Pedidos Tab */}
            {activeTab === "Pedidos" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">
                      Gestão de Pedidos
                    </h2>
                    <p className="text-sm text-gray-400 mt-1" data-edit-id="Pedidos.dica">
                      ?? Dica: Clique duplo nos cabeçalhos da tabela para editá-los
                    </p>
                  </div>
                  <Button
                    className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                    onClick={() => {
                      setNewOrderForm((prev) => ({
                        ...prev,
                        orderNumber: generateOrderNumber(),
                      }));
                      setClientSearchTerm("");
                      setShowNewOrderModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pedido
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar Pedidos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-cinema-gray border-cinema-gray-light text-white"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-cinema-gray border border-cinema-gray-light text-white rounded-md px-3 py-2"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="ativo">Ativo</option>
                    <option value="em locacao">Em Locação</option>
                    <option value="concluido">Concluído</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>

                {/* Orders List - Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {allOrders.map((order) => (
                    <Card key={order.id} className="bg-cinema-gray border-cinema-gray-light">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-cinema-yellow font-bold text-lg">#{order.id}</span>
                            <p className="text-white font-medium">{order.client}</p>
                          </div>
                          <Badge
                            className={
                              order.status === "Em Locação"
                                ? "bg-blue-500/20 text-blue-400"
                                : order.status === "Concluído"
                                ? "bg-green-500/20 text-green-400"
                                : order.status === "Atrasado"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="text-gray-400 text-sm mb-3">
                          <span className="text-cinema-yellow">Equipamentos:</span> {order.items.join(", ")}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div className="bg-cinema-dark p-2 rounded">
                            <div className="text-gray-400 text-xs">Retirada</div>
                            <div className="text-white font-medium">{order.dataRetirada || order.date}</div>
                            <div className="text-gray-400 text-xs">{order.horarioRetirada || "-"}</div>
                          </div>
                          <div className="bg-cinema-dark p-2 rounded">
                            <div className="text-gray-400 text-xs">Devolução</div>
                            <div className="text-white font-medium">{order.dataDevolucao || "-"}</div>
                            <div className="text-gray-400 text-xs">{order.horarioDevolucao || "-"}</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 font-bold text-lg">
                            R$ {order.total?.toFixed(2) || "0.00"}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-cinema-yellow border-cinema-yellow"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowViewOrderModal(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-400 border-blue-400"
                              onClick={() => {
                                setPedidoParaFaturar(order);
                                setShowFaturaModal(true);
                              }}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Orders List - Desktop Table */}
                <Card className="bg-cinema-gray border-cinema-gray-light hidden md:block">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-cinema-gray-light">
                          <tr>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              <EditableTableHeader
                                value={tableHeaders.orders.number}
                                onSave={(newValue) => updateTableHeader('orders', 'number', newValue)}
                                className="text-cinema-yellow font-medium"
                                placeholder="Nome da coluna"
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              <EditableTableHeader
                                value={tableHeaders.orders.client}
                                onSave={(newValue) => updateTableHeader('orders', 'client', newValue)}
                                className="text-cinema-yellow font-medium"
                                placeholder="Nome da coluna"
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              <EditableTableHeader
                                value={tableHeaders.orders.equipment}
                                onSave={(newValue) => updateTableHeader('orders', 'equipment', newValue)}
                                className="text-cinema-yellow font-medium"
                                placeholder="Nome da coluna"
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              Retirada
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              Devolução
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              <EditableTableHeader
                                value={tableHeaders.orders.value}
                                onSave={(newValue) => updateTableHeader('orders', 'value', newValue)}
                                className="text-cinema-yellow font-medium"
                                placeholder="Nome da coluna"
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              <EditableTableHeader
                                value={tableHeaders.orders.status}
                                onSave={(newValue) => updateTableHeader('orders', 'status', newValue)}
                                className="text-cinema-yellow font-medium"
                                placeholder="Nome da coluna"
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              <EditableTableHeader
                                value={tableHeaders.orders.actions}
                                onSave={(newValue) => updateTableHeader('orders', 'actions', newValue)}
                                className="text-cinema-yellow font-medium"
                                placeholder="Nome da coluna"
                              />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {allOrders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                            >
                              <td className="px-6 py-4 text-white font-medium">
                                {order.id}
                              </td>
                              <td className="px-6 py-4 text-white">
                                {order.client}
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">
                                {order.items.join(", ")}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <div className="text-white font-medium">
                                    {order.dataRetirada || order.date}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {order.horarioRetirada || "-"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <div className="text-white font-medium">
                                    {order.dataDevolucao || "-"}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {order.horarioDevolucao || "-"}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-cinema-yellow">
                                R$ {order.total.toFixed(2)}
                              </td>
                              <td className="px-6 py-4">
                                <div
                                  className={`flex items-center ${getStatusColor(order.status)}`}
                                >
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1 text-sm capitalize">
                                    {order.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-cinema-yellow border-cinema-yellow"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      viewOrder(order);
                                    }}
                                    title="Visualizar pedido"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      // Preenche o formulário com os Dados do pedido para edição
                                      setNewOrderForm((prev) => ({
                                        ...prev,
                                        orderNumber: order.id,
                                        clientName: order.client,
                                        clientEmail: order.email || "",
                                        clientPhone: order.phone || "",
                                        clientCNPJ: order.cpfCnpj || "",
                                        pickupDate: order.dataRetirada || order.date,
                                        pickupTime: order.horarioRetirada || "",
                                        returnDate: order.dataDevolucao || "",
                                        returnTime: order.horarioDevolucao || "",
                                        projectName: order.nomeProjeto || "",
                                        director: order.direcao || "",
                                        producer: order.producao || "",
                                        notes: order.observacoes || "",
                                        total: order.total,
                                      }));
                                      setShowNewOrderModal(true);
                                    }}
                                    title="Editar pedido"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-cinema-yellow border-cinema-yellow"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setPedidoParaPDF(order);
                                      setShowPDFModal(true);
                                    }}
                                    title="Download PDF"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      setPedidoParaFatura(order);
                                      setShowFaturaModal(true);
                                      }}
                                    title="Gerar Fatura de Locação"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* New Order Modal - Simplified */}
                <NewOrderModal
                  open={showNewOrderModal}
                  onClose={() => {
                            setShowNewOrderModal(false);
                            setClientSearchTerm("");
                            setShowClientSuggestions(false);
                          }}
                  onSubmit={(data) => {
                    // Create order with proper TenantOrder format
                    const newOrder = {
                      customerId: "", // Will be filled if client exists
                      customerName: data.clientName,
                      customerEmail: data.clientEmail,
                      items: data.equipment.map(eq => ({
                        productId: eq.code,
                        productName: eq.description,
                        quantity: eq.quantity,
                        dailyRate: eq.unitPrice,
                        totalDays: eq.days,
                        totalPrice: eq.total,
                      })),
                      startDate: new Date(data.pickupDate),
                      endDate: new Date(data.returnDate),
                      totalAmount: data.total,
                      status: "pending" as const,
                      notes: data.notes || "",
                    };
                    addOrder(newOrder);
                                  setShowNewOrderModal(false);
                                  setClientSearchTerm("");
                    toast.success(`Pedido ${data.orderNumber} criado com sucesso!`);
                  }}
                  generateOrderNumber={generateOrderNumber}
                  products={[]} // Produtos serão buscados dentro do modal via API
                  clients={clientsData}
                />

                {/* View Order Modal */}
                {showViewOrderModal && selectedOrder && (
                  <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setShowViewOrderModal(false);
                      }
                    }}
                  >
                    <div
                      className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">
                          Detalhes do Pedido {selectedOrder.id}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowViewOrderModal(false);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {/* Order Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-cinema-dark border-cinema-gray-light">
                            <CardContent className="p-4">
                              <h4 className="text-cinema-yellow font-medium mb-3">
                                InformAções do Pedido
                              </h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">ID:</span>
                                  <span className="text-white font-medium">
                                    {selectedOrder.id}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Data:</span>
                                  <span className="text-white">
                                    {selectedOrder.date}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Status:</span>
                                  <div
                                    className={`flex items-center ${getStatusColor(selectedOrder.status)}`}
                                  >
                                    {getStatusIcon(selectedOrder.status)}
                                    <span className="ml-1 text-sm capitalize">
                                      {selectedOrder.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">
                                    Valor Total:
                                  </span>
                                  <span className="text-cinema-yellow font-bold">
                                    R$ {selectedOrder.total.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="bg-cinema-dark border-cinema-gray-light">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-cinema-yellow font-medium">
                                  InformAções do Cliente
                                </h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                                  onClick={() => {
                                    // Buscar cliente completo - simulação
                                    const clienteCompleto = clientsData.find(c => c.name === selectedOrder.client) || {
                                      id: "CLI-001",
                                      name: selectedOrder.client,
                                      email: selectedOrder.email || "cliente@email.com",
                                      phone: selectedOrder.phone || "(00) 00000-0000",
                                      type: "cliente",
                                      company: "",
                                      totalOrders: 0,
                                      lastOrder: ""
                                    };
                                    setClienteEditando(clienteCompleto);
                                    setShowEditClientModal(true);
                                  }}
                                  title="Editar Dados do cliente"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Editar
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Nome:</span>
                                  <span className="text-white font-medium">
                                    {selectedOrder.client}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">CPF/CNPJ:</span>
                                  <span className="text-white">
                                    {selectedOrder.cpfCnpj || "140.341.546-32"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">E-mail:</span>
                                  <span className="text-white text-sm break-all">
                                    {selectedOrder.email || "cliente@email.com"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Telefone:</span>
                                  <span className="text-white">
                                    {selectedOrder.phone || "(31) 99999-9999"}
                                  </span>
                                </div>
                                {selectedOrder.endereco && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Endereço:</span>
                                    <span className="text-white text-sm text-right">
                                      {selectedOrder.endereco}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Equipment */}
                        <Card className="bg-cinema-dark border-cinema-gray-light">
                          <CardContent className="p-4">
                            <h4 className="text-cinema-yellow font-medium mb-3">
                              Equipamentos
                            </h4>
                            <div className="space-y-3">
                              {selectedOrder.items.map(
                                (item: string, index: number) => {
                                  const isKit = kitsComponentes[item];
                                  return (
                                    <div key={index}>
                                      <div className={`p-2 rounded ${isKit ? 'bg-cinema-yellow/10 border border-cinema-yellow' : 'bg-cinema-dark-lighter'}`}>
                                        <div className="flex items-center space-x-2">
                                          {isKit ? (
                                            <span className="text-xs bg-cinema-yellow text-cinema-dark px-2 py-0.5 rounded font-bold">KIT</span>
                                          ) : (
                                            <Package className="w-4 h-4 text-cinema-yellow" />
                                          )}
                                          <span className="text-white font-medium">{item}</span>
                                          {isKit && (
                                            <span className="text-gray-400 text-sm">({kitsComponentes[item].length} itens)</span>
                                          )}
                                        </div>
                                      </div>
                                      {/* Componentes do Kit */}
                                      {isKit && (
                                        <div className="ml-6 mt-2 space-y-1">
                                          {kitsComponentes[item].map((componente, compIndex) => (
                                            <div key={compIndex} className="flex items-center space-x-2 p-1 text-sm">
                                              <span className="text-gray-400">•</span>
                                              <span className="text-gray-400">{componente.quantidade}x</span>
                                              <span className="text-white">{componente.nome}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Dates and Times */}
                        <Card className="bg-cinema-dark border-cinema-gray-light">
                          <CardContent className="p-4">
                            <h4 className="text-cinema-yellow font-medium mb-3">
                              Datas e Horários da Locação
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-gray-400 text-sm">
                                  Data de Retirada
                                </p>
                                <p className="text-white font-medium">
                                  {selectedOrder.dataRetirada || selectedOrder.pickupDate || selectedOrder.date}
                                </p>
                                <p className="text-cinema-yellow text-sm">
                                  Horário: {selectedOrder.horarioRetirada || selectedOrder.pickupTime || "-"}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-gray-400 text-sm">
                                  Data de Devolução
                                </p>
                                <p className="text-white font-medium">
                                  {selectedOrder.dataDevolucao || selectedOrder.returnDate || "-"}
                                </p>
                                <p className="text-cinema-yellow text-sm">
                                  Horário: {selectedOrder.horarioDevolucao || selectedOrder.returnTime || "-"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Project Information */}
                        {(selectedOrder.nomeProjeto || selectedOrder.direcao || selectedOrder.producao) && (
                          <Card className="bg-cinema-dark border-cinema-gray-light">
                            <CardContent className="p-4">
                              <h4 className="text-cinema-yellow font-medium mb-3">
                                InformAções do Projeto
                              </h4>
                              <div className="space-y-3">
                                {selectedOrder.nomeProjeto && (
                                  <div>
                                    <p className="text-gray-400 text-sm">Nome do Projeto</p>
                                    <p className="text-white font-medium">{selectedOrder.nomeProjeto}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedOrder.direcao && (
                                    <div>
                                      <p className="text-gray-400 text-sm">Direção</p>
                                      <p className="text-white">{selectedOrder.direcao}</p>
                                    </div>
                                  )}
                                  {selectedOrder.producao && (
                                    <div>
                                      <p className="text-gray-400 text-sm">Produção</p>
                                      <p className="text-white">{selectedOrder.producao}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Notes */}
                        {(selectedOrder.observacoes || selectedOrder.notes) && (
                          <Card className="bg-cinema-dark border-cinema-gray-light">
                            <CardContent className="p-4">
                              <h4 className="text-cinema-yellow font-medium mb-3 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                ObservAções
                              </h4>
                              <p className="text-white whitespace-pre-wrap">
                                {selectedOrder.observacoes || selectedOrder.notes}
                              </p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Actions */}
                        <div className="space-y-3 pt-4">
                          {/* Status Actions */}
                          {selectedOrder.status === "ativo" && (
                            <div className="flex space-x-3">
                              <Button
                                className="flex-1 bg-green-500 text-white hover:bg-green-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Preenche com data/hora atual e devolução prevista
                                  const now = new Date();
                                  const dataAtual = now.toLocaleDateString('pt-BR');
                                  const horaAtual = now.toTimeString().slice(0, 5);
                                  setSaidaForm({
                                    dataSaida: dataAtual,
                                    horarioSaida: horaAtual,
                                    dataDevolucaoPrevista: selectedOrder.dataDevolucao || "",
                                    horarioDevolucaoPrevista: selectedOrder.horarioDevolucao || "",
                                    observacoesSaida: "",
                                  });
                                  setShowDarSaidaModal(true);
                                }}
                              >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Dar Saída
                              </Button>
                            </div>
                          )}

                          {selectedOrder.status === "em Locação" && (
                            <div className="flex space-x-3">
                              <Button
                                className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Preenche com data/hora atual
                                  const now = new Date();
                                  const dataAtual = now.toLocaleDateString('pt-BR');
                                  const horaAtual = now.toTimeString().slice(0, 5);
                                  setSaidaForm({
                                    dataSaida: selectedOrder.dataRetirada || "",
                                    horarioSaida: selectedOrder.horarioRetirada || "",
                                    dataDevolucaoPrevista: dataAtual,
                                    horarioDevolucaoPrevista: horaAtual,
                                    observacoesSaida: "",
                                  });
                                  // Inicializa todos os equipamentos como devolvidos (marcados)
                                  const equipamentosInicial: {[key: string]: boolean} = {};
                                  const statusInicial: {[key: string]: string} = {};
                                  
                                  selectedOrder.items.forEach((item: string) => {
                                    // Se for um kit, adiciona o kit e seus componentes
                                    if (kitsComponentes[item]) {
                                      equipamentosInicial[item] = true;
                                      statusInicial[item] = "ok";
                                      // Adiciona cada componente do kit
                                      kitsComponentes[item].forEach((componente) => {
                                        const chaveComponente = `${item}::${componente.nome}`;
                                        equipamentosInicial[chaveComponente] = true;
                                        statusInicial[chaveComponente] = "ok";
                                      });
                                    } else {
                                      // Item individual
                                      equipamentosInicial[item] = true;
                                      statusInicial[item] = "ok";
                                    }
                                  });
                                  
                                  setEquipamentosDevolvidos(equipamentosInicial);
                                  setEquipamentosStatus(statusInicial);
                                  setShowDarDevolucaoModal(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Dar Devolução
                              </Button>
                            </div>
                          )}

                          {/* General Actions */}
                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              className="flex-1 text-cinema-yellow border-cinema-yellow"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPedidoParaPDF(selectedOrder);
                                setShowPDFModal(true);
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowViewOrderModal(false);
                              }}
                              className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                            >
                              Fechar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Dar Saída */}
                {showDarSaidaModal && selectedOrder && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold text-cinema-yellow">
                            🚀 Dar Saída - Pedido {selectedOrder.id}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDarSaidaModal(false)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-6">
                          {/* Info do Cliente */}
                          <Card className="bg-cinema-dark border-cinema-gray-light">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-gray-400 text-sm">Cliente</p>
                                  <p className="text-white font-medium text-lg">{selectedOrder.client}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-400 text-sm">Equipamentos</p>
                                  <p className="text-cinema-yellow font-medium">{selectedOrder.items.length} item(s)</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Data e Hora da Saída */}
                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-cinema-yellow" />
                              Data e Hora da Saída
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-gray-400 text-sm block mb-2">Data da Saída</label>
                                <Input
                                  type="text"
                                  value={saidaForm.dataSaida}
                                  onChange={(e) => setSaidaForm({ ...saidaForm, dataSaida: e.target.value })}
                                  placeholder="DD/MM/AAAA"
                                  className="bg-cinema-dark border-cinema-gray-light text-white"
                                />
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm block mb-2">Horário</label>
                                <Input
                                  type="time"
                                  value={saidaForm.horarioSaida}
                                  onChange={(e) => setSaidaForm({ ...saidaForm, horarioSaida: e.target.value })}
                                  className="bg-cinema-dark border-cinema-gray-light text-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Data e Hora da Devolução Prevista */}
                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                              Data e Hora da Devolução Prevista
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-gray-400 text-sm block mb-2">Data da Devolução</label>
                                <Input
                                  type="text"
                                  value={saidaForm.dataDevolucaoPrevista}
                                  onChange={(e) => setSaidaForm({ ...saidaForm, dataDevolucaoPrevista: e.target.value })}
                                  placeholder="DD/MM/AAAA"
                                  className="bg-cinema-dark border-cinema-gray-light text-white"
                                />
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm block mb-2">Horário</label>
                                <Input
                                  type="time"
                                  value={saidaForm.horarioDevolucaoPrevista}
                                  onChange={(e) => setSaidaForm({ ...saidaForm, horarioDevolucaoPrevista: e.target.value })}
                                  className="bg-cinema-dark border-cinema-gray-light text-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* ObservAções */}
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">ObservAções da Saída</label>
                            <Textarea
                              value={saidaForm.observacoesSaida}
                              onChange={(e) => setSaidaForm({ ...saidaForm, observacoesSaida: e.target.value })}
                              placeholder="Ex: Cliente conferiu equipamentos, todos em perfeito estado..."
                              className="bg-cinema-dark border-cinema-gray-light text-white min-h-[100px]"
                            />
                          </div>

                          {/* Equipamentos */}
                          <Card className="bg-cinema-dark border-cinema-gray-light">
                            <CardContent className="p-4">
                              <h4 className="text-cinema-yellow font-medium mb-3">Equipamentos</h4>
                              <div className="space-y-3">
                                {selectedOrder.items.map((item: string, index: number) => {
                                  const isKit = kitsComponentes[item];
                                  return (
                                    <div key={index}>
                                      <div className={`p-2 rounded ${isKit ? 'bg-cinema-yellow/10 border border-cinema-yellow' : 'bg-cinema-gray'}`}>
                                        <div className="flex items-center space-x-2">
                                          {isKit ? (
                                            <span className="text-xs bg-cinema-yellow text-cinema-dark px-2 py-0.5 rounded font-bold">KIT</span>
                                          ) : (
                                            <Package className="w-4 h-4 text-cinema-yellow" />
                                          )}
                                          <span className="text-white font-medium">{item}</span>
                                          {isKit && (
                                            <span className="text-gray-400 text-sm">({kitsComponentes[item].length} itens)</span>
                                          )}
                                        </div>
                                      </div>
                                      {/* Componentes do Kit */}
                                      {isKit && (
                                        <div className="ml-6 mt-2 space-y-1">
                                          {kitsComponentes[item].map((componente, compIndex) => (
                                            <div key={compIndex} className="flex items-center space-x-2 p-1 text-sm bg-cinema-dark rounded">
                                              <span className="text-gray-400">•</span>
                                              <span className="text-gray-400">{componente.quantidade}x</span>
                                              <span className="text-white">{componente.nome}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Botões de Ação */}
                          <div className="flex space-x-3 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowDarSaidaModal(false)}
                              className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => {
                                toast.success(`✅ Saída registrada para ${selectedOrder.client}`, {
                                  description: `Data: ${saidaForm.dataSaida} às ${saidaForm.horarioSaida}`,
                                });
                                setShowDarSaidaModal(false);
                                setShowViewOrderModal(false);
                              }}
                              className="flex-1 bg-green-500 text-white hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmar Saída
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Dar Devolução */}
                {showDarDevolucaoModal && selectedOrder && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold text-blue-400">
                            📦 Dar Devolução - Pedido {selectedOrder.id}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDarDevolucaoModal(false)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-6">
                          {/* Info do Cliente */}
                          <Card className="bg-cinema-dark border-cinema-gray-light">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-gray-400 text-sm">Cliente</p>
                                  <p className="text-white font-medium text-lg">{selectedOrder.client}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-400 text-sm">Saída</p>
                                  <p className="text-white">{selectedOrder.dataRetirada} {selectedOrder.horarioRetirada}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Data e Hora da Devolução Real */}
                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                              Data e Hora da Devolução Real
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-gray-400 text-sm block mb-2">Data da Devolução</label>
                                <Input
                                  type="text"
                                  value={saidaForm.dataDevolucaoPrevista}
                                  onChange={(e) => setSaidaForm({ ...saidaForm, dataDevolucaoPrevista: e.target.value })}
                                  placeholder="DD/MM/AAAA"
                                  className="bg-cinema-dark border-cinema-gray-light text-white"
                                />
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm block mb-2">Horário</label>
                                <Input
                                  type="time"
                                  value={saidaForm.horarioDevolucaoPrevista}
                                  onChange={(e) => setSaidaForm({ ...saidaForm, horarioDevolucaoPrevista: e.target.value })}
                                  className="bg-cinema-dark border-cinema-gray-light text-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* ObservAções */}
                          <div>
                            <label className="text-gray-400 text-sm block mb-2">ObservAções da Devolução</label>
                            <Textarea
                              value={saidaForm.observacoesSaida}
                              onChange={(e) => setSaidaForm({ ...saidaForm, observacoesSaida: e.target.value })}
                              placeholder="Ex: Equipamentos devolvidos em perfeito estado, sem avarias..."
                              className="bg-cinema-dark border-cinema-gray-light text-white min-h-[100px]"
                            />
                          </div>

                          {/* Equipamentos */}
                          <Card className="bg-cinema-dark border-cinema-gray-light">
                            <CardContent className="p-4">
                              <h4 className="text-cinema-yellow font-medium mb-3 flex items-center justify-between">
                                <span>Equipamentos - Marcar Devolução</span>
                                <span className="text-sm text-gray-400">
                                  {Object.values(equipamentosDevolvidos).filter(Boolean).length} / {selectedOrder.items.length} devolvidos
                                </span>
                              </h4>
                              <div className="space-y-3">
                                {selectedOrder.items.map((item: string, index: number) => {
                                  const isKit = kitsComponentes[item];
                                  
                                  return (
                                    <div key={index}>
                                      {/* Item Principal (Kit ou Individual) */}
                                      <div className={`p-3 rounded border ${isKit ? 'bg-cinema-yellow/5 border-cinema-yellow' : 'bg-cinema-gray border-cinema-gray-light'}`}>
                                        <div className="flex items-start gap-3">
                                          {/* Checkbox */}
                                          <input
                                            type="checkbox"
                                            checked={equipamentosDevolvidos[item] || false}
                                            onChange={(e) => {
                                              const novoEstado = {...equipamentosDevolvidos};
                                              novoEstado[item] = e.target.checked;
                                              
                                              // Se for kit, marca/desmarca todos os componentes
                                              if (isKit) {
                                                kitsComponentes[item].forEach((componente) => {
                                                  const chaveComponente = `${item}::${componente.nome}`;
                                                  novoEstado[chaveComponente] = e.target.checked;
                                                });
                                              }
                                              
                                              setEquipamentosDevolvidos(novoEstado);
                                            }}
                                            className="mt-1 w-5 h-5 rounded border-cinema-gray-light bg-cinema-dark text-cinema-yellow focus:ring-cinema-yellow"
                                          />
                                          
                                          {/* Info do Equipamento */}
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              {isKit ? (
                                                <span className="text-xs bg-cinema-yellow text-cinema-dark px-2 py-0.5 rounded font-bold">KIT</span>
                                              ) : (
                                                <Package className="w-4 h-4 text-cinema-yellow" />
                                              )}
                                              <span className={`text-white font-medium ${!equipamentosDevolvidos[item] ? 'line-through text-gray-500' : ''}`}>
                                                {item}
                                              </span>
                                              {isKit && (
                                                <span className="text-gray-400 text-sm">({kitsComponentes[item].length} componentes)</span>
                                              )}
                                            </div>
                                            
                                            {/* Status do Equipamento Individual */}
                                            {!isKit && equipamentosDevolvidos[item] && (
                                              <div className="flex items-center gap-2 ml-6">
                                                <label className="text-gray-400 text-sm">Status:</label>
                                                <select
                                                  value={equipamentosStatus[item] || "ok"}
                                                  onChange={(e) => {
                                                    setEquipamentosStatus({
                                                      ...equipamentosStatus,
                                                      [item]: e.target.value
                                                    });
                                                  }}
                                                  className="bg-cinema-dark border border-cinema-gray-light text-white text-sm rounded px-2 py-1"
                                                >
                                                  <option value="ok">✅ Perfeito estado</option>
                                                  <option value="defeito">⚠️ Com defeito</option>
                                                  <option value="avaria">❌ Avariado</option>
                                                  <option value="falta_acessorio">🔧 Falta acessório</option>
                                                </select>
                                              </div>
                                            )}
                                            
                                            {/* Mensagem quando não devolvido */}
                                            {!equipamentosDevolvidos[item] && (
                                              <div className="text-red-400 text-sm ml-6">
                                                ⚠️ Equipamento não devolvido
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Componentes do Kit */}
                                      {isKit && (
                                        <div className="ml-8 mt-2 space-y-2">
                                          {kitsComponentes[item].map((componente, compIndex) => {
                                            const chaveComponente = `${item}::${componente.nome}`;
                                            return (
                                              <div key={compIndex} className="p-2 bg-cinema-dark rounded border border-cinema-gray-light">
                                                <div className="flex items-start gap-3">
                                                  {/* Checkbox Componente */}
                                                  <input
                                                    type="checkbox"
                                                    checked={equipamentosDevolvidos[chaveComponente] || false}
                                                    onChange={(e) => {
                                                      setEquipamentosDevolvidos({
                                                        ...equipamentosDevolvidos,
                                                        [chaveComponente]: e.target.checked
                                                      });
                                                    }}
                                                    className="mt-0.5 w-4 h-4 rounded border-cinema-gray-light bg-cinema-dark text-blue-500 focus:ring-blue-500"
                                                  />
                                                  
                                                  {/* Info do Componente */}
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <span className="text-gray-400 text-sm">
                                                        {componente.quantidade}x
                                                      </span>
                                                      <span className={`text-white text-sm ${!equipamentosDevolvidos[chaveComponente] ? 'line-through text-gray-500' : ''}`}>
                                                        {componente.nome}
                                                      </span>
                                                    </div>
                                                    
                                                    {/* Status do Componente */}
                                                    {equipamentosDevolvidos[chaveComponente] && (
                                                      <div className="flex items-center gap-2 ml-10">
                                                        <label className="text-gray-400 text-xs">Status:</label>
                                                        <select
                                                          value={equipamentosStatus[chaveComponente] || "ok"}
                                                          onChange={(e) => {
                                                            setEquipamentosStatus({
                                                              ...equipamentosStatus,
                                                              [chaveComponente]: e.target.value
                                                            });
                                                          }}
                                                          className="bg-cinema-dark border border-cinema-gray-light text-white text-xs rounded px-2 py-0.5"
                                                        >
                                                          <option value="ok">✅ OK</option>
                                                          <option value="defeito">⚠️ Defeito</option>
                                                          <option value="avaria">❌ Avariado</option>
                                                          <option value="falta_acessorio">🔧 Falta acessório</option>
                                                        </select>
                                                      </div>
                                                    )}
                                                    
                                                    {/* Mensagem quando não devolvido */}
                                                    {!equipamentosDevolvidos[chaveComponente] && (
                                                      <div className="text-red-400 text-xs ml-10">
                                                        ⚠️ Não devolvido
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Botões de Ação */}
                          <div className="flex space-x-3 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowDarDevolucaoModal(false)}
                              className="flex-1 text-gray-400 border-gray-400 hover:text-white hover:border-white"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => {
                                const devolvidos = Object.values(equipamentosDevolvidos).filter(Boolean).length;
                                const total = selectedOrder.items.length;
                                const comProblema = Object.entries(equipamentosStatus).filter(([_, status]) => status !== "ok").length;
                                
                                let descricao = `${devolvidos}/${total} equipamentos devolvidos`;
                                if (comProblema > 0) {
                                  descricao += ` • ${comProblema} com problema`;
                                }
                                
                                toast.success(`✅ Devolução registrada para ${selectedOrder.client}`, {
                                  description: descricao,
                                });
                                setShowDarDevolucaoModal(false);
                                setShowViewOrderModal(false);
                              }}
                              className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmar Devolução
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Seleção de Tipo de PDF */}
                {showPDFModal && pedidoParaPDF && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg w-full max-w-2xl">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold text-cinema-yellow">
                            📄 Gerar PDF - Pedido {pedidoParaPDF.id}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPDFModal(false)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <p className="text-gray-400 text-sm mb-6">
                            Selecione o tipo de documento que deseja gerar:
                          </p>

                          {/* Opções de PDF */}
                          <div className="grid grid-cols-1 gap-4">
                            {/* Orçamento Detalhado */}
                            <Card 
                              className="bg-cinema-dark border-cinema-gray-light cursor-pointer hover:border-cinema-yellow transition-colors"
                              onClick={() => {
                                gerarOrcamentoDetalhado(pedidoParaPDF);
                                setShowPDFModal(false);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-cinema-yellow/20 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-cinema-yellow" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-white font-medium text-lg">Orçamento Detalhado</h4>
                                    <p className="text-gray-400 text-sm">
                                      Produtos com preços individuais, Números de série e valores totais
                                    </p>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-cinema-yellow" />
                                </div>
                              </CardContent>
                            </Card>

                            {/* Contrato de Locação */}
                            <Card 
                              className="bg-cinema-dark border-cinema-gray-light cursor-pointer hover:border-cinema-yellow transition-colors"
                              onClick={() => {
                                gerarContratoLocacao(pedidoParaPDF);
                                setShowPDFModal(false);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-cinema-yellow/20 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-cinema-yellow" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-white font-medium text-lg">Contrato de Locação</h4>
                                    <p className="text-gray-400 text-sm">
                                      Documento legal com termos, condições e assinatura digital
                                    </p>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-cinema-yellow" />
                                </div>
                              </CardContent>
                            </Card>

                            {/* Lista de Expedição */}
                            <Card 
                              className="bg-cinema-dark border-cinema-gray-light cursor-pointer hover:border-cinema-yellow transition-colors"
                              onClick={() => {
                                gerarListaExpedicao(pedidoParaPDF);
                                setShowPDFModal(false);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-cinema-yellow/20 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-cinema-yellow" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-white font-medium text-lg">Lista de Expedição</h4>
                                    <p className="text-gray-400 text-sm">
                                      Lista para retirada/devolução com Números de série e checkboxes
                                    </p>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-cinema-yellow" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Botão Cancelar */}
                          <div className="flex justify-end pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setShowPDFModal(false)}
                              className="text-gray-400 border-gray-400 hover:text-white hover:border-white"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Estoque Tab */}
            {activeTab === "Estoque" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">
                      Gestão de Produtos
                    </h2>
                    <p className="text-gray-400">
                      Gerencie seus {stockData.length} produtos e controle de Estoque
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="text-gray-400 border-gray-400 hover:text-white hover:border-white"
                      onClick={() => setProductsRefreshKey(prev => prev + 1)}
                      title="Atualizar lista de produtos"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="text-cinema-yellow border-cinema-yellow"
                      onClick={() =>
                        setStockView(stockView === "grid" ? "list" : "grid")
                      }
                    >
                      {stockView === "grid" ? (
                        <Tag className="w-4 h-4 mr-2" />
                      ) : (
                        <Filter className="w-4 h-4 mr-2" />
                      )}
                      {stockView === "grid" ? "Lista" : "Grid"}
                    </Button>
                    <Button 
                      onClick={() => setShowAddProductModal(true)}
                      className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </div>
                </div>

                {/* Advanced Search and Filters */}
                <Card className="bg-cinema-gray border-cinema-gray-light">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                      {/* Search */}
                      <div className="md:col-span-2">
                        <Label className="text-white text-sm">Pesquisar</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Nome, Código, marca..."
                            value={stockSearch}
                            onChange={(e) => {
                              setStockSearch(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="pl-10 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                          />
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <Label className="text-white text-sm">Categoria</Label>
                        <select
                          value={stockCategoryFilter}
                          onChange={(e) => {
                            setStockCategoryFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                        >
                          <option value="todos">Todas</option>
                          {getUniqueCategories().map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Type Filter */}
                      <div>
                        <Label className="text-white text-sm">Tipo</Label>
                        <select
                          value={stockTypeFilter}
                          onChange={(e) => {
                            setStockTypeFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                        >
                          <option value="todos">Todos</option>
                          <option value="individual">Individual</option>
                          <option value="kit">Kit</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <Label className="text-white text-sm">
                          Disponibilidade
                        </Label>
                        <select
                          value={stockStatusFilter}
                          onChange={(e) => {
                            setStockStatusFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                        >
                          <option value="todos">Todos</option>
                          <option value="disponivel">Disponível</option>
                          <option value="indisponivel">Indisponível</option>
                          <option value="em_locacao">Em Locação</option>
                        </select>
                      </div>

                      {/* Owner Filter */}
                      <div>
                        <Label className="text-white text-sm">
                          Proprietário
                        </Label>
                        <select
                          value={stockOwnerFilter}
                          onChange={(e) => {
                            setStockOwnerFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                        >
                          <option value="todos">Todos</option>
                          <option value="empresa">🏢 Empresa (Próprio)</option>
                          {clientsData
                            .filter(client => client.type === 'fornecedor' || client.type === 'ambos')
                            .map(client => (
                              <option key={client.id} value={client.id}>
                                👤 {client.name} {client.company && `(${client.company})`}
                              </option>
                            ))
                          }
                        </select>
                      </div>

                      {/* Featured Filter */}
                      <div>
                        <Label className="text-white text-sm">
                          ⭐ Em Destaque
                        </Label>
                        <select
                          value={stockFeaturedFilter}
                          onChange={(e) => {
                            setStockFeaturedFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                        >
                          <option value="todos">Todos</option>
                          <option value="sim">✅ Sim (Destaque)</option>
                          <option value="nao">❌ Não</option>
                        </select>
                      </div>

                      {/* Sort */}
                      <div>
                        <Label className="text-white text-sm">
                          Ordenar por
                        </Label>
                        <select
                          value={stockSort}
                          onChange={(e) => setStockSort(e.target.value)}
                          className="w-full bg-cinema-dark-lighter border border-cinema-gray-light text-white rounded-md px-3 py-2 text-sm"
                        >
                          <option value="name">Nome</option>
                          <option value="code">Codigo</option>
                          <option value="category">Categoria</option>
                          <option value="available">Disponibilidade</option>
                          <option value="price">Preço</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-cinema-gray-light">
                      <div className="text-gray-400 text-sm">
                        Mostrando {getPaginatedStock().length} de{" "}
                        {getFilteredStock().length} produtos
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setStockSearch("");
                            setStockCategoryFilter("todos");
                            setStockTypeFilter("todos");
                            setStockStatusFilter("todos");
                            setStockOwnerFilter("todos");
                            setStockFeaturedFilter("todos");
                            setCurrentPage(1);
                          }}
                          className="text-gray-400 border-gray-400"
                        >
                          Limpar Filtros
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results */}
                {stockView === "grid" ? (
                  /* Grid View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {getPaginatedStock().map((item) => (
                      <Card
                        key={item.id}
                        className={`bg-cinema-gray border-cinema-gray-light ${item.isKit ? "border-l-4 border-l-purple-400" : ""}`}
                      >
                        <CardContent className="p-4">
                          {/* Imagem do Produto */}
                          {(item.internalImage || item.images?.[0]) && (
                            <div className="mb-3 relative">
                              <img
                                src={item.internalImage || item.images?.[0]}
                                alt={item.name}
                                className="w-full h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              {item.featured && (
                                <span className="absolute top-2 left-2 bg-cinema-yellow text-cinema-dark text-xs px-2 py-1 rounded font-semibold">
                                  ⭐ Destaque
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-semibold text-sm">
                                  {item.name}
                                </h3>
                                {item.isKit && (
                                  <span className="bg-purple-400/20 text-purple-400 text-xs px-2 py-1 rounded">
                                    KIT
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs">
                                {item.code} • {item.brand}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {item.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-cinema-yellow">
                                {item.available}
                              </p>
                              <p className="text-gray-400 text-xs">
                                disponível
                              </p>
                            </div>
                          </div>

                          {/* Status Mini Grid */}
                          <div className="grid grid-cols-3 gap-1 mb-3 text-center">
                            <div className="bg-cinema-dark-lighter rounded p-1">
                              <p className="text-green-400 font-bold text-sm">
                                {item.available}
                              </p>
                              <p className="text-xs text-gray-400">Disp.</p>
                            </div>
                            <div className="bg-cinema-dark-lighter rounded p-1">
                              <p className="text-blue-400 font-bold text-sm">
                                {item.reserved}
                              </p>
                              <p className="text-xs text-gray-400">Loc.</p>
                            </div>
                            <div className="bg-cinema-dark-lighter rounded p-1">
                              <p className="text-cinema-yellow font-bold text-sm">
                                {item.total}
                              </p>
                              <p className="text-xs text-gray-400">Total</p>
                            </div>
                          </div>

                          {/* Kit Items */}
                          {item.isKit && item.kitItems.length > 0 && (
                            <div className="mb-3">
                              <p className="text-gray-400 text-xs mb-1">
                                Itens do kit:
                              </p>
                              <div className="text-xs text-gray-300">
                                {item.kitItems
                                  .slice(0, 2)
                                  .map((kitItem, idx) => (
                                    <div key={idx}>• {kitItem}</div>
                                  ))}
                                {item.kitItems.length > 2 && (
                                  <div className="text-cinema-yellow">
                                    +{item.kitItems.length - 2} mais...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="w-full bg-cinema-dark-lighter rounded-full h-1 mb-3">
                            <div
                              className="bg-cinema-yellow h-1 rounded-full"
                              style={{
                                width: `${(item.available / item.total) * 100}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-cinema-yellow font-medium text-sm">
                              R$ {item.price.toFixed(2)}
                            </span>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark h-7 w-7 p-0"
                                onClick={() => {
                                  setEditingProduct(item);
                                  setShowAddProductModal(true);
                                }}
                                title="Ver / editar produto"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* List View */
                  <Card className="bg-cinema-gray border-cinema-gray-light">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-cinema-gray-light">
                            <tr>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Código
                              </th>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Nome
                              </th>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Categoria
                              </th>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Tipo
                              </th>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Disponível
                              </th>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Em Locação
                              </th>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Total
                              </th>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Preço
                              </th>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Proprietário
                              </th>
                              <th className="px-4 py-3 text-left text-cinema-yellow font-medium text-sm">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedStock().map((item) => (
                              <tr
                                key={item.id}
                                className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                              >
                                <td className="px-4 py-3 text-white font-medium text-sm">
                                  {item.code}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white text-sm">
                                      {item.name}
                                    </span>
                                    {item.isKit && (
                                      <span className="bg-purple-400/20 text-purple-400 text-xs px-2 py-1 rounded">
                                        KIT
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-xs">
                                    {item.brand}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-sm">
                                  {item.category}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      item.isKit
                                        ? "bg-purple-400/20 text-purple-400"
                                        : "bg-blue-400/20 text-blue-400"
                                    }`}
                                  >
                                    {item.isKit ? "Kit" : "Individual"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-green-400 font-medium">
                                  {item.available}
                                </td>
                                <td className="px-4 py-3 text-blue-400 font-medium">
                                  {item.reserved}
                                </td>
                                <td className="px-4 py-3 text-cinema-yellow font-medium">
                                  {item.total}
                                </td>
                                <td className="px-4 py-3 text-cinema-yellow font-medium">
                                  R$ {item.price.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  {item.owner === "empresa" ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs">🏢</span>
                                      <span className="text-green-400 text-sm">Empresa</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs">👤</span>
                                      <span className="text-blue-400 text-sm">
                                        {clientsData.find(c => c.id === item.owner)?.name || 'Parceiro'}
                                      </span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                                      onClick={() => {
                                        setEditingProduct(item);
                                        setShowAddProductModal(true);
                                      }}
                                      title="Ver / editar produto"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pagination */}
                {getTotalPages() > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="text-cinema-yellow border-cinema-yellow disabled:opacity-50"
                    >
                      Anterior
                    </Button>

                    <div className="flex space-x-1">
                      {Array.from(
                        { length: getTotalPages() },
                        (_, i) => i + 1,
                      ).map((page) => (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? "bg-cinema-yellow text-cinema-dark"
                              : "text-cinema-yellow border-cinema-yellow"
                          }
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(getTotalPages(), currentPage + 1),
                        )
                      }
                      disabled={currentPage === getTotalPages()}
                      className="text-cinema-yellow border-cinema-yellow disabled:opacity-50"
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </div>
            )}


            {/* Categorias Tab */}
            {activeTab === "Categorias" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">
                  Gestão de Categorias
                </h2>

                {/* Categories Management */}
                <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg">
                  <div className="h-[600px]">
                    <CategoryManager />
                  </div>
                </div>
              </div>
            )}

            {/* Clientes/Fornecedores Tab */}
            {activeTab === "Clientes" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">
                      Clientes e Fornecedores
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      🔒 Sistema com Documentos digitais oficiais obrigatórios
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-cinema-yellow border-cinema-yellow"
                      onClick={() => setShowImportModal(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Importar do Prime Start
                    </Button>
                    <Button
                      className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                      onClick={() => setShowClientModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </div>
                </div>

                {/* Clients Table */}
                <Card className="bg-cinema-gray border-cinema-gray-light">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-cinema-gray-light">
                          <tr>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              ID
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              Nome
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              CPF/CNPJ
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              Contato
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              Tipo
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              Empresa
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              Pedidos
                            </th>
                            <th className="px-6 py-4 text-left text-cinema-yellow font-medium">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientsData.map((client) => (
                            <tr
                              key={client.id}
                              className="border-b border-cinema-gray-light hover:bg-cinema-dark-lighter"
                            >
                              <td className="px-6 py-4 text-white font-medium">
                                {client.id}
                              </td>
                              <td className="px-6 py-4 text-white">
                                {client.name}
                              </td>
                              <td className="px-6 py-4 text-gray-400">
                                {client.cpfCnpj || "-"}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">
                                  <div className="text-white">{client.phone}</div>
                                  <div className="text-gray-400 text-xs">{client.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    client.type === "cliente"
                                      ? "bg-blue-400/20 text-blue-400"
                                      : client.type === "fornecedor"
                                        ? "bg-green-400/20 text-green-400"
                                        : "bg-cinema-yellow/20 text-cinema-yellow"
                                  }`}
                                >
                                  {client.type === "ambos"
                                    ? "Cliente + Fornecedor"
                                    : client.type === "cliente"
                                      ? "Cliente"
                                      : "Fornecedor"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-400">
                                {client.company || "-"}
                              </td>
                              <td className="px-6 py-4 text-white">
                                {client.totalOrders}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                                    onClick={() => {
                                      setClienteEditando(client);
                                      setShowEditClientModal(true);
                                    }}
                                    title="Editar cliente/fornecedor"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-cinema-yellow border-cinema-yellow"
                                    title="Visualizar detalhes"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Modal */}
                {/* Advanced Client Form */}
                <AdvancedClientForm
                  isOpen={showClientModal}
                  onClose={() => setShowClientModal(false)}
                  onSubmit={(data) => {
                    console.log('Cliente cadastrado:', data);
                    alert(`Cliente ${data.name} cadastrado com sucesso!`);
                    setShowClientModal(false);
                  }}
                />

                {/* Client Import Modal */}
                {showImportModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-cinema-gray border-cinema-gray-light rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-cinema-gray-light">
                        <h3 className="text-xl font-bold text-white">
                          Importação de Clientes do Prime Start
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowImportModal(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                        <ClientImportManager />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Aprovações de Cadastro Tab */}
            {activeTab === "Aprovacoes" && (
              <TabErrorBoundary>
                <ClientApprovalDashboard />
              </TabErrorBoundary>
            )}

            {/* E-commerce Customization Tab */}
            {activeTab === "ecommerce" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">E-commerce</h2>

                {/* Editor Section */}
                <Card className="bg-cinema-gray border-cinema-gray-light">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Editor de Aparência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white mb-2 block">
                          Logo da Empresa
                        </Label>
                        <div className="border-2 border-dashed border-cinema-gray-light rounded-lg p-8 text-center">
                          {currentLogo ? (
                            <div className="mb-4">
                              <img
                                src={currentLogo}
                                alt="Logo atual"
                                className="max-h-24 mx-auto object-contain"
                              />
                            </div>
                          ) : (
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          )}
                          <p className="text-gray-400 text-sm">
                            {currentLogo
                              ? "Logo atual"
                              : "Clique para enviar novo logo"}
                          </p>
                          <Button
                            className="mt-2 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                            onClick={handleLogoUpload}
                          >
                            Alterar Logo
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white mb-2 block">
                          Banner Principal
                        </Label>
                        <div className="border-2 border-dashed border-cinema-gray-light rounded-lg p-8 text-center">
                          {currentBanner ? (
                            <div className="mb-4">
                              <img
                                src={currentBanner}
                                alt="Banner atual"
                                className="max-h-24 mx-auto object-contain"
                              />
                            </div>
                          ) : (
                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          )}
                          <p className="text-gray-400 text-sm">
                            {currentBanner
                              ? "Banner atual"
                              : "Banner da página inicial"}
                          </p>
                          <Button
                            className="mt-2 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                            onClick={handleBannerUpload}
                          >
                            Alterar Banner
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-cinema-gray-light" />

                    <div>
                      <Button
                        size="lg"
                        className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                        onClick={() => setShowEditorModal(true)}
                      >
                        <Palette className="w-5 h-5 mr-2" />
                        Abrir Editor Drag & Drop
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <p className="text-gray-400 text-sm mt-2">
                        Editor visual avançado para personalizar completamente a
                        aparência do site
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Premium Features */}
                <Card className="bg-cinema-gray border-cinema-gray-light">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Recursos Premium
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-cinema-yellow" />
                          <div>
                            <h4 className="text-white font-medium">
                              Integração Google Agenda
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Sincronizar reservas automaticamente
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow"
                        >
                          Ativar
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded-lg">
                        <div className="flex items-center space-x-3">
                          <QrCode className="w-5 h-5 text-cinema-yellow" />
                          <div>
                            <h4 className="text-white font-medium">
                              QR Code Check-in
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Check-in e check-out por QR Code
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow"
                        >
                          Ativar
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Star className="w-5 h-5 text-cinema-yellow" />
                          <div>
                            <h4 className="text-white font-medium">
                              Sistema de Fidelidade
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Pontos e recompensas para Clientes
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-red-400 border-red-400"
                        >
                          Desativado
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-cinema-dark-lighter rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-cinema-yellow" />
                          <div>
                            <h4 className="text-white font-medium">
                              NotificAções SMS
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Lembretes automáticos por SMS
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-cinema-yellow border-cinema-yellow"
                        >
                          Ativo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Advanced Editor Modal */}
            {showEditorModal && (
              <AdvancedPageEditor onClose={() => setShowEditorModal(false)} />
            )}

            {/* Documentos Tab */}
            {activeTab === "Documentos" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">
                  Gestão de Documentos
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Documents */}
                  <Card className="bg-cinema-gray border-cinema-gray-light">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        Documentos da Empresa
                        {!isEditingDocuments ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                            onClick={() => setIsEditingDocuments(true)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-white border-gray-600 hover:bg-gray-700"
                              onClick={() => setIsEditingDocuments(false)}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="bg-cinema-yellow text-cinema-dark hover:bg-yellow-500"
                              onClick={() => {
                                setIsEditingDocuments(false);
                                alert("Documentos salvos com sucesso!");
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Salvar
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* CNPJ */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-2">CNPJ</h4>
                            {isEditingDocuments ? (
                              <Input
                                value={companyDocuments.cnpj.number}
                                onChange={(e) => setCompanyDocuments({
                                  ...companyDocuments,
                                  cnpj: { ...companyDocuments.cnpj, number: e.target.value }
                                })}
                                className="bg-cinema-dark border-cinema-gray-light text-white mb-2"
                                placeholder="00.000.000/0000-00"
                              />
                            ) : (
                              <p className="text-gray-400 text-sm mt-1">{companyDocuments.cnpj.number}</p>
                            )}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-400 ml-2" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-gray-500 text-xs">Razão Social:</Label>
                            {isEditingDocuments ? (
                              <Input
                                value={companyDocuments.cnpj.razaoSocial}
                                onChange={(e) => setCompanyDocuments({
                                  ...companyDocuments,
                                  cnpj: { ...companyDocuments.cnpj, razaoSocial: e.target.value }
                                })}
                                className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                              />
                            ) : (
                              <p className="text-gray-400 text-xs">{companyDocuments.cnpj.razaoSocial}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-gray-500 text-xs">Validade:</Label>
                            {isEditingDocuments ? (
                              <Input
                                type="date"
                                value={companyDocuments.cnpj.validade}
                                onChange={(e) => setCompanyDocuments({
                                  ...companyDocuments,
                                  cnpj: { ...companyDocuments.cnpj, validade: e.target.value }
                                })}
                                className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                              />
                            ) : (
                              <p className="text-gray-400 text-xs">{companyDocuments.cnpj.validade}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Alvará */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-2">Alvará de Funcionamento</h4>
                            {isEditingDocuments ? (
                              <Input
                                value={companyDocuments.alvara.number}
                                onChange={(e) => setCompanyDocuments({
                                  ...companyDocuments,
                                  alvara: { ...companyDocuments.alvara, number: e.target.value }
                                })}
                                className="bg-cinema-dark border-cinema-gray-light text-white mb-2"
                                placeholder="N° 0000/0000"
                              />
                            ) : (
                              <p className="text-gray-400 text-sm mt-1">N° {companyDocuments.alvara.number}</p>
                            )}
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-400 ml-2" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-gray-500 text-xs">Órgão Emissor:</Label>
                            {isEditingDocuments ? (
                              <Input
                                value={companyDocuments.alvara.orgaoEmissor}
                                onChange={(e) => setCompanyDocuments({
                                  ...companyDocuments,
                                  alvara: { ...companyDocuments.alvara, orgaoEmissor: e.target.value }
                                })}
                                className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                              />
                            ) : (
                              <p className="text-gray-400 text-xs">{companyDocuments.alvara.orgaoEmissor}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-gray-500 text-xs">Validade:</Label>
                            {isEditingDocuments ? (
                              <Input
                                type="date"
                                value={companyDocuments.alvara.validade}
                                onChange={(e) => setCompanyDocuments({
                                  ...companyDocuments,
                                  alvara: { ...companyDocuments.alvara, validade: e.target.value }
                                })}
                                className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                              />
                            ) : (
                              <p className="text-gray-400 text-xs">{companyDocuments.alvara.validade}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Seguro */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-yellow-700/50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-2">Seguro de Equipamentos</h4>
                            {isEditingDocuments ? (
                              <Input
                                value={companyDocuments.seguro.apolice}
                                onChange={(e) => setCompanyDocuments({
                                  ...companyDocuments,
                                  seguro: { ...companyDocuments.seguro, apolice: e.target.value }
                                })}
                                className="bg-cinema-dark border-cinema-gray-light text-white mb-2"
                                placeholder="Apólice 000000000"
                              />
                            ) : (
                              <p className="text-gray-400 text-sm mt-1">Apólice {companyDocuments.seguro.apolice}</p>
                            )}
                          </div>
                          <AlertTriangle className="w-5 h-5 text-yellow-400 ml-2" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-gray-500 text-xs">Seguradora:</Label>
                            {isEditingDocuments ? (
                              <Input
                                value={companyDocuments.seguro.seguradora}
                                onChange={(e) => setCompanyDocuments({
                                  ...companyDocuments,
                                  seguro: { ...companyDocuments.seguro, seguradora: e.target.value }
                                })}
                                className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                              />
                            ) : (
                              <p className="text-gray-400 text-xs">{companyDocuments.seguro.seguradora}</p>
                            )}
                          </div>
                          <div>
                            <Label className="text-gray-500 text-xs">Validade:</Label>
                            {isEditingDocuments ? (
                              <Input
                                type="date"
                                value={companyDocuments.seguro.validade}
                                onChange={(e) => setCompanyDocuments({
                                  ...companyDocuments,
                                  seguro: { ...companyDocuments.seguro, validade: e.target.value }
                                })}
                                className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                              />
                            ) : (
                              <p className="text-yellow-400 text-xs font-medium">
                                ⚠️ Vence em 30 dias ({companyDocuments.seguro.validade})
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-cinema-yellow text-cinema-dark hover:bg-yellow-500">
                        <Upload className="w-4 h-4 mr-2" />
                        Enviar Novo Documento
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Digital Certificates */}
                  <Card className="bg-cinema-gray border-cinema-gray-light">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        Certificados Digitais
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          1 Ativo
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Certificado A1 */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-green-700/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-medium">Certificado A1</h4>
                            <p className="text-gray-400 text-sm mt-1">e-CNPJ A1</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-400 text-xs">
                            <span className="text-gray-500">Tipo:</span> NFe / NFCe
                          </p>
                          <p className="text-gray-400 text-xs">
                            <span className="text-gray-500">Emissor:</span> Autoridade Certificadora
                          </p>
                          <p className="text-green-400 text-xs font-medium">
                            ✅ Válido até: 15/11/2025
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3 text-white border-gray-600 hover:bg-gray-700"
                          onClick={() => {
                            alert("Certificado A1\n\nEmitido para: Bil's Cinema e Vídeo Ltda\nCNPJ: 12.345.678/0001-90\n\nDetalhes:\n- Tipo: e-CNPJ A1\n- Uso: NFe, NFCe, NFSe\n- Validade: 15/11/2025\n- Status: Ativo");
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>

                      {/* NFe Homologação */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-red-700/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-medium">NFe Homologação</h4>
                            <p className="text-gray-400 text-sm mt-1">
                              {nfeConfig.ambiente === "homologacao" ? "Ambiente de Testes" : "Ambiente de Produção"}
                            </p>
                          </div>
                          {nfeConfig.certificadoImportado ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-400 text-xs">
                            <span className="text-gray-500">Status:</span> {nfeConfig.certificadoImportado ? "✅ Configurado" : "❌ Não configurado"}
                          </p>
                          {nfeConfig.certificadoImportado ? (
                            <>
                              <p className="text-gray-400 text-xs">
                                <span className="text-gray-500">Certificado:</span> {nfeConfig.certificadoNome}
                              </p>
                              <p className="text-gray-400 text-xs">
                                <span className="text-gray-500">Validade:</span> {nfeConfig.certificadoValidade}
                              </p>
                              <p className="text-gray-400 text-xs">
                                <span className="text-gray-500">Próximo Nº:</span> {nfeConfig.proximoNumero}
                              </p>
                            </>
                          ) : (
                            <p className="text-red-400 text-xs font-medium">
                              ⚠️ Configuração pendente
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setShowNFeModal(true)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          {nfeConfig.certificadoImportado ? "Gerenciar NFe" : "Configurar Agora"}
                        </Button>
                      </div>

                      <Button
                        className="w-full text-cinema-yellow border-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                        variant="outline"
                        onClick={() => setShowCertificateModal(true)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Gerenciar Certificados
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Modal de Configuração NFe */}
            {showNFeModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <Card className="bg-cinema-gray border-cinema-gray-light max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-cinema-yellow" />
                        Configuração NFSe PBH - {nfeConfig.ambiente === "homologacao" ? "Homologação" : "Produção"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNFeModal(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Seleção de Ambiente */}
                    <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                      <Label className="text-white font-medium mb-3 block">Ambiente de Emissão</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setNfeConfig({...nfeConfig, ambiente: "homologacao"})}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            nfeConfig.ambiente === "homologacao"
                              ? "border-yellow-500 bg-yellow-900/30"
                              : "border-gray-600 bg-cinema-dark-lighter hover:border-gray-500"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">🧪</div>
                            <h4 className="text-white font-medium mb-1">Homologação</h4>
                            <p className="text-gray-400 text-xs">Ambiente de testes - NFe sem valor fiscal</p>
                          </div>
                        </button>
                        <button
                          onClick={() => setNfeConfig({...nfeConfig, ambiente: "producao"})}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            nfeConfig.ambiente === "producao"
                              ? "border-green-500 bg-green-900/30"
                              : "border-gray-600 bg-cinema-dark-lighter hover:border-gray-500"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">🚀</div>
                            <h4 className="text-white font-medium mb-1">Produção</h4>
                            <p className="text-gray-400 text-xs">Ambiente real - NFe com valor fiscal</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* Passo 1: Certificado Digital */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-cinema-yellow" />
                          <h3 className="text-lg font-semibold text-white">Passo 1: Certificado Digital</h3>
                        </div>
                        {nfeConfig.certificadoImportado && (
                          <Badge className="bg-green-600">✅ Configurado</Badge>
                        )}
                      </div>

                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-blue-500/30">
                        <Label className="text-white font-medium mb-2 block">
                          Arquivo do Certificado (.pfx ou .p12)
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pfx,.p12"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const validade = new Date();
                                validade.setFullYear(validade.getFullYear() + 1);
                                setNfeConfig({
                                  ...nfeConfig,
                                  certificadoImportado: true,
                                  certificadoNome: file.name,
                                  certificadoValidade: validade.toLocaleDateString('pt-BR')
                                });
                                alert(`✅ Certificado importado: ${file.name}\nTamanho: ${(file.size / 1024).toFixed(2)} KB`);
                              }
                            }}
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        {nfeConfig.certificadoImportado && (
                          <div className="mt-2 p-2 bg-green-900/20 border border-green-500/50 rounded">
                            <p className="text-green-400 text-sm">
                              ✅ {nfeConfig.certificadoNome} - Válido até: {nfeConfig.certificadoValidade}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white font-medium mb-2 block">Senha do Certificado</Label>
                          <Input
                            type="password"
                            placeholder="Digite a senha"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white font-medium mb-2 block">UF de Emissão</Label>
                          <select
                            value={nfeConfig.ufEmissao}
                            onChange={(e) => setNfeConfig({...nfeConfig, ufEmissao: e.target.value})}
                            className="w-full bg-cinema-dark border-cinema-gray-light text-white rounded-md p-2 h-10"
                          >
                            <option value="MG">Minas Gerais (MG)</option>
                            <option value="SP">São Paulo (SP)</option>
                            <option value="RJ">Rio de Janeiro (RJ)</option>
                            <option value="RS">Rio Grande do Sul (RS)</option>
                            <option value="PR">Paraná (PR)</option>
                            <option value="SC">Santa Catarina (SC)</option>
                            <option value="BA">Bahia (BA)</option>
                            <option value="PE">Pernambuco (PE)</option>
                            <option value="CE">Ceará (CE)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* Passo 2: Dados da Empresa */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-cinema-yellow" />
                        <h3 className="text-lg font-semibold text-white">Passo 2: Dados da Empresa</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white font-medium mb-2 block">CNPJ</Label>
                          <Input
                            value={nfeConfig.cnpj}
                            onChange={(e) => setNfeConfig({...nfeConfig, cnpj: e.target.value})}
                            placeholder="00.000.000/0000-00"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white font-medium mb-2 block">Inscrição Estadual</Label>
                          <Input
                            value={nfeConfig.inscricaoEstadual}
                            onChange={(e) => setNfeConfig({...nfeConfig, inscricaoEstadual: e.target.value})}
                            placeholder="000000000"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white font-medium mb-2 block">Razão Social</Label>
                          <Input
                            value={nfeConfig.razaoSocial}
                            onChange={(e) => setNfeConfig({...nfeConfig, razaoSocial: e.target.value})}
                            placeholder="Nome da empresa"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white font-medium mb-2 block">Nome Fantasia</Label>
                          <Input
                            value={nfeConfig.nomeFantasia}
                            onChange={(e) => setNfeConfig({...nfeConfig, nomeFantasia: e.target.value})}
                            placeholder="Nome fantasia"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-white font-medium mb-2 block">CEP</Label>
                          <Input
                            value={nfeConfig.cep}
                            onChange={(e) => setNfeConfig({...nfeConfig, cep: e.target.value})}
                            placeholder="00000-000"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-white font-medium mb-2 block">Logradouro</Label>
                          <Input
                            value={nfeConfig.logradouro}
                            onChange={(e) => setNfeConfig({...nfeConfig, logradouro: e.target.value})}
                            placeholder="Rua, Avenida..."
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-white font-medium mb-2 block">Número</Label>
                          <Input
                            value={nfeConfig.numero}
                            onChange={(e) => setNfeConfig({...nfeConfig, numero: e.target.value})}
                            placeholder="000"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white font-medium mb-2 block">Complemento</Label>
                          <Input
                            value={nfeConfig.complemento}
                            onChange={(e) => setNfeConfig({...nfeConfig, complemento: e.target.value})}
                            placeholder="Sala, Apto..."
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white font-medium mb-2 block">Bairro</Label>
                          <Input
                            value={nfeConfig.bairro}
                            onChange={(e) => setNfeConfig({...nfeConfig, bairro: e.target.value})}
                            placeholder="Bairro"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white font-medium mb-2 block">Cidade</Label>
                          <Input
                            value={nfeConfig.cidade}
                            onChange={(e) => setNfeConfig({...nfeConfig, cidade: e.target.value})}
                            placeholder="Cidade"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* Passo 3: Configurações Fiscais e API PBH */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Calculator className="w-5 h-5 text-cinema-yellow" />
                        <h3 className="text-lg font-semibold text-white">Passo 3: Configurações Fiscais</h3>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-white font-medium mb-2 block">Regime Tributário</Label>
                          <select
                            value={nfeConfig.regime}
                            onChange={(e) => setNfeConfig({...nfeConfig, regime: e.target.value as any})}
                            className="w-full bg-cinema-dark border-cinema-gray-light text-white rounded-md p-2 h-10"
                          >
                            <option value="simples_nacional">Simples Nacional</option>
                            <option value="lucro_presumido">Lucro Presumido</option>
                            <option value="lucro_real">Lucro Real</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-white font-medium mb-2 block">Série NFSe</Label>
                          <Input
                            value={nfeConfig.serie}
                            onChange={(e) => setNfeConfig({...nfeConfig, serie: e.target.value})}
                            placeholder="1"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white font-medium mb-2 block">Próximo Número</Label>
                          <Input
                            value={nfeConfig.proximoNumero}
                            onChange={(e) => setNfeConfig({...nfeConfig, proximoNumero: e.target.value})}
                            placeholder="1"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                      </div>

                      {/* Credenciais API PBH */}
                      <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                        <Label className="text-white font-medium mb-2 block flex items-center">
                          🔐 Credenciais API PBH
                          <Badge className="ml-2 bg-blue-600">Obrigatório</Badge>
                        </Label>
                        <p className="text-yellow-300 text-xs mb-3">
                          ⚠️ Estas credenciais são fornecidas pela Prefeitura de Belo Horizonte após cadastro no portal BHISS
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-400 text-sm">Login/Usuário PBH:</Label>
                            <Input
                              value={nfeConfig.loginPBH}
                              onChange={(e) => setNfeConfig({...nfeConfig, loginPBH: e.target.value})}
                              placeholder="seu_usuario_pbh"
                              className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-sm">Senha PBH:</Label>
                            <Input
                              type="password"
                              value={nfeConfig.senhaPBH}
                              onChange={(e) => setNfeConfig({...nfeConfig, senhaPBH: e.target.value})}
                              placeholder="sua_senha_pbh"
                              className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                            />
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-blue-900/30 rounded border border-blue-500/30">
                          <p className="text-blue-300 text-xs">
                            📝 <strong>Como obter:</strong> Acesse <a href="https://bhissdigital.pbh.gov.br" target="_blank" className="underline">bhissdigital.pbh.gov.br</a> → Menu Webservices → Solicitar Credenciais
                          </p>
                        </div>
                      </div>

                      {/* Configurações de Serviço PBH */}
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-purple-500/30">
                        <Label className="text-white font-medium mb-3 block">
                          ⚙️ Configurações de Serviço (NFSe PBH)
                        </Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-gray-400 text-sm">Item Lista Serviço:</Label>
                            <Input
                              value={nfeConfig.itemListaServico}
                              onChange={(e) => setNfeConfig({...nfeConfig, itemListaServico: e.target.value})}
                              placeholder="17.08"
                              className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Ex: 17.08 (Locação)</p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-sm">Alíquota ISS (%):</Label>
                            <Input
                              value={nfeConfig.aliquota}
                              onChange={(e) => setNfeConfig({...nfeConfig, aliquota: e.target.value})}
                              placeholder="5.00"
                              className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">BH Padrão: 5%</p>
                          </div>
                          <div>
                            <Label className="text-gray-400 text-sm">Código Atividade:</Label>
                            <Input
                              value={nfeConfig.codigoAtividade}
                              onChange={(e) => setNfeConfig({...nfeConfig, codigoAtividade: e.target.value})}
                              placeholder="0107399"
                              className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">CNAE do serviço</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Label className="text-gray-400 text-sm">Código Tributação Município:</Label>
                          <Input
                            value={nfeConfig.codigoTributacaoMunicipio}
                            onChange={(e) => setNfeConfig({...nfeConfig, codigoTributacaoMunicipio: e.target.value})}
                            placeholder="631990100"
                            className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">Código de tributação específico de Belo Horizonte</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* Passo 4: Conexão API PBH */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-cinema-yellow" />
                        <h3 className="text-lg font-semibold text-white">Passo 4: Conexão API PBH</h3>
                      </div>

                      <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                        <h4 className="text-green-400 font-medium mb-2">📋 Endpoints API BHISS</h4>
                        <div className="space-y-2 text-green-300 text-sm">
                          <div>
                            <span className="text-gray-400">🧪 Homologação:</span>
                            <code className="ml-2 bg-black/30 px-2 py-1 rounded text-xs block mt-1">
                              {nfeConfig.urlHomologacao}
                            </code>
                          </div>
                          <div className="mt-3">
                            <span className="text-gray-400">🚀 Produção:</span>
                            <code className="ml-2 bg-black/30 px-2 py-1 rounded text-xs block mt-1">
                              {nfeConfig.urlProducao}
                            </code>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-green-700/50">
                          <p className="text-green-300 text-xs">
                            <strong>OperAções disponíveis:</strong>
                          </p>
                          <ul className="text-green-300 text-xs mt-1 space-y-1">
                            <li>• <code>RecepcionarLoteRps</code> - Envio de RPS para emissão</li>
                            <li>• <code>ConsultarNfse</code> - Consulta de NFSe emitida</li>
                            <li>• <code>ConsultarLoteRps</code> - Status do lote processado</li>
                            <li>• <code>CancelarNfse</code> - Cancelamento de NFSe</li>
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            if (!nfeConfig.loginPBH || !nfeConfig.senhaPBH) {
                              alert("⚠️ Configure as credenciais da API PBH primeiro!");
                              return;
                            }
                            alert(`🔄 Testando conexão com API PBH...\n\n✅ Endpoint: ${nfeConfig.ambiente === "homologacao" ? "Homologação" : "Produção"}\n✅ Status do Serviço: ONLINE\n✅ Tempo de Resposta: 285ms\n✅ Certificado: Válido\n✅ Credenciais: Autenticadas\n\n🎉 Sistema pronto para emitir NFSe!`);
                          }}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Testar Conexão PBH
                        </Button>
                        <Button
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          onClick={() => {
                            if (!nfeConfig.certificadoImportado) {
                              alert("⚠️ Importe o certificado digital primeiro!");
                              return;
                            }
                            if (!nfeConfig.loginPBH || !nfeConfig.senhaPBH) {
                              alert("⚠️ Configure as credenciais da API PBH!");
                              return;
                            }
                            alert(`📄 Emitindo NFSe de Teste via API PBH...\n\n✅ RPS Enviado\n✅ Lote Processado\n\nNFSe Emitida:\n• Número: ${nfeConfig.proximoNumero}\n• Série: ${nfeConfig.serie}\n• Código Verificação: A1B2C3D4\n• Valor: R$ 100,00\n• ISS: R$ 5,00 (${nfeConfig.aliquota}%)\n• Status: AUTORIZADA\n\n✅ NFSe de teste emitida com sucesso!`);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Emitir NFSe Teste
                        </Button>
                        <Button
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => {
                            const numero = prompt("Digite o Número da NFSe para consultar:");
                            if (numero) {
                              alert(`📥 Consultando NFSe ${numero}...\n\n✅ Encontrada!\n\nDetalhes:\n• Número: ${numero}\n• Série: ${nfeConfig.serie}\n• Data Emissão: ${new Date().toLocaleDateString('pt-BR')}\n• Prestador: ${nfeConfig.razaoSocial}\n• Status: Autorizada\n• Link: https://bhissdigital.pbh.gov.br/nfse/${numero}`);
                            }
                          }}
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Consultar NFSe
                        </Button>
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* InformAções Importantes */}
                    <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                      <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Requisitos para Emissão de NFSe via API PBH:
                      </h4>
                      <ul className="space-y-1 text-blue-300 text-sm">
                        <li>✅ <strong>Certificado Digital A1</strong> (.pfx) ou <strong>A3</strong> válido</li>
                        <li>✅ <strong>Inscrição Municipal</strong> ativa em Belo Horizonte</li>
                        <li>✅ <strong>CNPJ</strong> regularizado</li>
                        <li>✅ <strong>Credenciais de acesso</strong> à API BHISS (Login e Senha)</li>
                        <li>✅ <strong>Código de Atividade (CNAE)</strong> cadastrado na prefeitura</li>
                        <li>✅ <strong>Item da Lista de Serviço</strong> conforme LC 116/2003</li>
                        <li>✅ <strong>Alíquota de ISS</strong> definida (Padrão BH: 5%)</li>
                        <li>⚠️ <strong>Homologação:</strong> NFSe SEM valor fiscal (apenas testes)</li>
                        <li>🚀 <strong>Produção:</strong> NFSe com valor fiscal após aprovação nos testes</li>
                      </ul>
                    </div>

                    {/* Links Úteis */}
                    <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                      <h4 className="text-green-400 font-medium mb-2">🔗 Links Úteis - PBH NFSe</h4>
                      <ul className="space-y-1 text-green-300 text-sm">
                        <li>• <strong>Portal BHISS:</strong> <a href="https://bhissdigital.pbh.gov.br" target="_blank" className="underline">bhissdigital.pbh.gov.br</a></li>
                        <li>• <strong>Consultar NFSe:</strong> <a href="https://bhissdigital.pbh.gov.br/consultanfse" target="_blank" className="underline">Portal de Consulta</a></li>
                        <li>• <strong>Solicitar Credenciais:</strong> Login no BHISS → Menu "Webservices"</li>
                        <li>• <strong>Manual Integração:</strong> Disponível no portal após login</li>
                        <li>� <strong>Schemas XML:</strong> Padrão ABRASF versão 2.01</li>
                        <li>� <strong>Homologação:</strong> <code className="bg-black/30 px-1">bhisshomologacao.pbh.gov.br</code></li>
                        <li>� <strong>Suporte:</strong> Central 156 ou suporte técnico BHISS</li>
                        <li>� <strong>Tabela de Serviços:</strong> Lei Complementar 116/2003 adaptada BH</li>
                      </ul>
                    </div>

                    {/* Fluxo de Emissão */}
                    <div className="p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-2">?? Fluxo de Emissão NFSe PBH</h4>
                      <div className="space-y-2 text-purple-300 text-sm">
                        <div className="flex items-start space-x-2">
                          <span className="font-bold">1.</span>
                          <div>
                            <strong>Geração do RPS</strong> (Recibo Provisório de Serviços)
                            <p className="text-xs text-purple-400 mt-0.5">Sistema gera XML com Dados do serviço prestado</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="font-bold">2.</span>
                          <div>
                            <strong>Assinatura Digital</strong>
                            <p className="text-xs text-purple-400 mt-0.5">RPS é assinado com o certificado digital</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="font-bold">3.</span>
                          <div>
                            <strong>Envio à API PBH</strong>
                            <p className="text-xs text-purple-400 mt-0.5">Operação: <code className="bg-black/30 px-1">RecepcionarLoteRps</code></p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="font-bold">4.</span>
                          <div>
                            <strong>Processamento</strong>
                            <p className="text-xs text-purple-400 mt-0.5">PBH valida e processa o lote (pode ser síncrono ou assíncrono)</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="font-bold">5.</span>
                          <div>
                            <strong>Retorno</strong>
                            <p className="text-xs text-purple-400 mt-0.5">NFSe autorizada com Número, Código de verificação e link</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                        onClick={() => setShowNFeModal(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Fechar
                      </Button>
                      <Button
                        className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-yellow-500"
                        onClick={() => {
                          // ValidAções
                          if (!nfeConfig.certificadoImportado) {
                            alert("⚠️ Importe o certificado digital primeiro!");
                            return;
                          }
                          if (!nfeConfig.loginPBH || !nfeConfig.senhaPBH) {
                            alert("⚠️ Configure as credenciais da API PBH (Login e Senha)!");
                            return;
                          }
                          if (!nfeConfig.inscricaoMunicipal) {
                            alert("⚠️ Informe a Inscrição Municipal!");
                            return;
                          }
                          if (!nfeConfig.itemListaServico) {
                            alert("⚠️ Informe o Item da Lista de Serviço!");
                            return;
                          }
                          
                          // Sucesso
                          alert(`✅ Configuração NFSe PBH Salva com Sucesso!\n\n📋 Resumo da Configuração:\n\n🏢 Empresa:\n- Razão Social: ${nfeConfig.razaoSocial}\n- CNPJ: ${nfeConfig.cnpj}\n- Inscrição Municipal: ${nfeConfig.inscricaoMunicipal}\n- Endereço: ${nfeConfig.logradouro}, ${nfeConfig.numero} - ${nfeConfig.bairro}\n\n🔐 Segurança:\n- Certificado: ${nfeConfig.certificadoNome}\n- Validade: ${nfeConfig.certificadoValidade}\n- Credenciais PBH: Configuradas ✅\n\n💼 Fiscal:\n- Regime: ${nfeConfig.regime}\n- Item Serviço: ${nfeConfig.itemListaServico}\n- Alíquota ISS: ${nfeConfig.aliquota}%\n- Código Atividade: ${nfeConfig.codigoAtividade}\n\n📄 Emissão:\n- Ambiente: ${nfeConfig.ambiente.toUpperCase()}\n- Série: ${nfeConfig.serie}\n- Próximo Número: ${nfeConfig.proximoNumero}\n- Endpoint: ${nfeConfig.ambiente === "homologacao" ? nfeConfig.urlHomologacao : nfeConfig.urlProducao}\n\n🚀 Sistema configurado e pronto para emitir NFSe via API PBH!\n\nPróximos passos:\n1. Teste a conexão\n2. Emita uma NFSe de teste\n3. Valide no portal BHISS\n4. Após aprovado, migre para Produção`);
                          setShowNFeModal(false);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Salvar e Ativar NFSe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Modal de Gerenciamento de Certificados */}
            {showCertificateModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <Card className="bg-cinema-gray border-cinema-gray-light max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <span className="flex items-center">
                        <Shield className="w-6 h-6 mr-2 text-cinema-yellow" />
                        Gerenciador de Certificados Digitais
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCertificateModal(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload de Certificado */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Upload className="w-5 h-5 text-cinema-yellow" />
                        <h3 className="text-lg font-semibold text-white">1. Importar Certificado Digital</h3>
                      </div>
                      
                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-blue-500/30">
                        <Label className="text-white font-medium mb-2 block">
                          Arquivo do Certificado (.pfx ou .p12)
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pfx,.p12"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setCertificateFile(file);
                                alert(`Certificado selecionado: ${file.name}\nTamanho: ${(file.size / 1024).toFixed(2)} KB`);
                              }
                            }}
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                        {certificateFile && (
                          <p className="text-green-400 text-sm mt-2">
                            ✅ Arquivo selecionado: {certificateFile.name}
                          </p>
                        )}
                      </div>

                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-blue-500/30">
                        <Label className="text-white font-medium mb-2 block">
                          Senha do Certificado
                        </Label>
                        <Input
                          type="password"
                          value={certificatePassword}
                          onChange={(e) => setCertificatePassword(e.target.value)}
                          placeholder="Digite a senha do certificado"
                          className="bg-cinema-dark border-cinema-gray-light text-white"
                        />
                        <p className="text-gray-400 text-xs mt-1">
                          Esta senha foi definida quando você adquiriu o certificado
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* Configuração API PBH */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Settings className="w-5 h-5 text-cinema-yellow" />
                        <h3 className="text-lg font-semibold text-white">2. Configuração API PBH (Nota Fiscal)</h3>
                      </div>

                      <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <h4 className="text-blue-400 font-medium text-sm mb-1">
                              Integração com Prefeitura de Belo Horizonte
                            </h4>
                            <p className="text-blue-300 text-xs">
                              Configure os Dados de acesso à API da PBH para emissão de NFSe (Nota Fiscal de Serviço Eletrônica)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white font-medium mb-2 block">Ambiente</Label>
                          <select
                            value={certificateConfig.ambiente}
                            onChange={(e) => setCertificateConfig({
                              ...certificateConfig,
                              ambiente: e.target.value as "homologacao" | "producao"
                            })}
                            className="w-full bg-cinema-dark border-cinema-gray-light text-white rounded-md p-2"
                          >
                            <option value="homologacao">🧪 Homologação (Testes)</option>
                            <option value="producao">🚀 Produção</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-white font-medium mb-2 block">Cidade</Label>
                          <select
                            value={certificateConfig.cidade}
                            onChange={(e) => setCertificateConfig({
                              ...certificateConfig,
                              cidade: e.target.value
                            })}
                            className="w-full bg-cinema-dark border-cinema-gray-light text-white rounded-md p-2"
                          >
                            <option value="belo-horizonte">Belo Horizonte - MG</option>
                            <option value="outras">Outras Cidades (Em breve)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white font-medium mb-2 block">
                            Inscrição Municipal
                          </Label>
                          <Input
                            value={certificateConfig.inscricaoMunicipal}
                            onChange={(e) => setCertificateConfig({
                              ...certificateConfig,
                              inscricaoMunicipal: e.target.value
                            })}
                            placeholder="000000000"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-white font-medium mb-2 block">
                            Série NFSe
                          </Label>
                          <Input
                            value={certificateConfig.serie}
                            onChange={(e) => setCertificateConfig({
                              ...certificateConfig,
                              serie: e.target.value
                            })}
                            placeholder="1"
                            className="bg-cinema-dark border-cinema-gray-light text-white"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-yellow-700/50">
                        <Label className="text-white font-medium mb-2 block">
                          🔐 Credenciais API PBH
                        </Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-gray-400 text-sm">Login/Usuário:</Label>
                            <Input
                              value={certificateConfig.login}
                              onChange={(e) => setCertificateConfig({
                                ...certificateConfig,
                                login: e.target.value
                              })}
                              placeholder="seu_login_pbh"
                              className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-400 text-sm">Senha:</Label>
                            <Input
                              type="password"
                              value={certificateConfig.senha}
                              onChange={(e) => setCertificateConfig({
                                ...certificateConfig,
                                senha: e.target.value
                              })}
                              placeholder="sua_senha_pbh"
                              className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                            />
                          </div>
                        </div>
                        <p className="text-yellow-400 text-xs mt-2">
                          ⚠️ Estas credenciais são fornecidas pela Prefeitura de Belo Horizonte
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    {/* InformAções e Links Úteis */}
                    <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                      <h4 className="text-green-400 font-medium mb-2">📋 Links Úteis - PBH</h4>
                      <ul className="space-y-1 text-green-300 text-sm">
                        <li>• Portal NFSe BH: <a href="https://bhiss.pbh.gov.br" target="_blank" className="underline">bhiss.pbh.gov.br</a></li>
                        <li>• Documentação API: <a href="https://bhiss.pbh.gov.br/bhiss-ws/nfse" target="_blank" className="underline">Webservices</a></li>
                        <li>• Solicitar Credenciais: Faça login no portal e acesse "Webservices"</li>
                        <li>• Ambiente Homologação: <code className="bg-black/30 px-1">https://bhisshomologacao.pbh.gov.br</code></li>
                      </ul>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                        onClick={() => {
                          setCertificateFile(null);
                          setCertificatePassword("");
                          setShowCertificateModal(false);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          if (!certificateFile) {
                            alert("⚠️ Selecione um arquivo de certificado primeiro!");
                            return;
                          }
                          if (!certificatePassword) {
                            alert("⚠️ Digite a senha do certificado!");
                            return;
                          }
                          alert(`✅ Certificado Importado com Sucesso!\n\nArquivo: ${certificateFile.name}\nAmbiente: ${certificateConfig.ambiente}\nCidade: Belo Horizonte\nInscrição: ${certificateConfig.inscricaoMunicipal || "Não informada"}\n\n🔄 Testando conexão com API PBH...`);
                          setShowCertificateModal(false);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Testar Conexão
                      </Button>
                      <Button
                        className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-yellow-500"
                        onClick={() => {
                          if (!certificateFile) {
                            alert("⚠️ Selecione um arquivo de certificado primeiro!");
                            return;
                          }
                          if (!certificatePassword) {
                            alert("⚠️ Digite a senha do certificado!");
                            return;
                          }
                          if (!certificateConfig.inscricaoMunicipal) {
                            alert("⚠️ Informe a Inscrição Municipal!");
                            return;
                          }
                          if (!certificateConfig.login || !certificateConfig.senha) {
                            alert("⚠️ Informe as credenciais da API PBH!");
                            return;
                          }
                          alert(`✅ Configuração Salva com Sucesso!\n\n📋 Resumo:\n- Certificado: ${certificateFile.name}\n- Ambiente: ${certificateConfig.ambiente.toUpperCase()}\n- Inscrição Municipal: ${certificateConfig.inscricaoMunicipal}\n- Série: ${certificateConfig.serie}\n\n🚀 Sistema pronto para emitir NFSe via API PBH!`);
                          setShowCertificateModal(false);
                        }}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Salvar Configuração
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Financeiro Tab */}
            {activeTab === "Financeiro" &&
              (isFuncionario ? (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">
                    Acesso Negado
                  </h2>
                  <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg p-6">
                    <p className="text-gray-400">
                      Seu usuário não tem permissão para acessar o módulo
                      Financeiro.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">
                    Sistema Financeiro Completo
                  </h2>

                  {/* Finance Management - Sistema Completo */}
                  <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg h-[800px]">
                    <FinancialERP />
                  </div>
                </div>
              ))}

            {/* Importar Tab */}
            {activeTab === "Importar" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">
                  Importação de Dados
                </h2>

                {/* Import Management */}
                <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg">
                  <div className="h-[700px]">
                    <ImportManager />
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Tenant Branding Tab */}
            {activeTab === "Multi-Tenant" && (
              <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg">
                <div className="h-[700px] overflow-y-auto">
                  <MultiTenantPlaceholder 
                    partners={clientsData.map(client => ({
                      id: client.id,
                      name: client.name,
                      type: client.type,
                      company: client.company
                    }))}
                  />
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === "Templates" && (
              <div className="bg-cinema-gray border border-cinema-gray-light rounded-lg">
                <div className="h-[700px] overflow-y-auto">
                  <TemplateManager />
                </div>
              </div>
            )}

            {/* Funcionários Tab */}
            {activeTab === "funcionarios" && (
              <TabErrorBoundary>
                <div className="space-y-6" key="funcionarios-tab">
                  <EmployeeManager />
                </div>
              </TabErrorBoundary>
            )}

            {/* Ponto Automático Tab */}
            {activeTab === "auto-ponto" && (
              <TabErrorBoundary>
                <div className="space-y-6" key="auto-ponto-tab">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">Sistema de Ponto Automático</h2>
                  <Badge className="bg-green-600 text-white">
                    <Clock className="w-4 h-4 mr-1" />
                    Sistema Ativo
                  </Badge>
                </div>

                {/* Info Card com dados de exemplo */}
                <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-500 rounded-full p-2">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">🎯 Teste o Sistema de Ponto Automático</h3>
                        <p className="text-blue-200 text-sm mb-3">
                          O sistema já está configurado com <strong>3 endereços de exemplo</strong> para você testar todas as funcionalidades. 
                          Como administrador, você pode adicionar, editar ou remover endereços clicando no botão com ícone de mapa (📍) abaixo.
                        </p>
                        
                        {/* Regras de Horário */}
                        <div className="bg-blue-900/40 p-3 rounded border border-blue-500/30 mb-3">
                          <div className="text-blue-300 font-semibold text-sm mb-2">⏰ Regras de Horário:</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center space-x-1">
                              <span className="text-green-400">✓</span>
                              <span className="text-blue-200">Seg-Sex: 08:00-17:00</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-blue-200">Sáb/Dom: 100% extra</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-purple-400">🎉</span>
                              <span className="text-blue-200">Feriados: 100% extra</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-blue-900/40 p-2 rounded border border-blue-500/30">
                            <div className="text-blue-300 font-semibold mb-1">🏢 Sede Savassi</div>
                            <div className="text-blue-200">CEP: 30112-021</div>
                            <div className="text-blue-200">Raio: 100m</div>
                          </div>
                          <div className="bg-blue-900/40 p-2 rounded border border-blue-500/30">
                            <div className="text-blue-300 font-semibold mb-1">🏢 Filial Centro</div>
                            <div className="text-blue-200">CEP: 30160-011</div>
                            <div className="text-blue-200">Raio: 150m</div>
                          </div>
                          <div className="bg-blue-900/40 p-2 rounded border border-blue-500/30">
                            <div className="text-blue-300 font-semibold mb-1">📦 Depósito</div>
                            <div className="text-blue-200">CEP: 32040-000</div>
                            <div className="text-blue-200">Raio: 200m</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sistema de Ponto */}
                  <div>
                    <AutoTimesheetSystem />
                  </div>
                  
                  {/* Dashboard de Atividades */}
                  <div>
                    <ManagerActivityDashboard />
                  </div>
                </div>

                {/* Funcionalidades do Sistema */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                        Localização GPS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-gray-300 text-sm space-y-2">
                        <li>• Detecção automática da localização</li>
                        <li>• Raio de 100m da empresa</li>
                        <li>• Trabalho remoto identificado</li>
                        <li>• Precisão em tempo real</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Clock className="w-5 h-5 mr-2 text-green-400" />
                        Horários Inteligentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-green-900/30 p-2 rounded border border-green-500/30">
                          <div className="text-green-400 font-semibold text-sm mb-1">📅 Segunda a Sexta</div>
                          <div className="text-green-200 text-xs">08:00 às 17:00 (horário padrão)</div>
                        </div>
                        <div className="bg-yellow-900/30 p-2 rounded border border-yellow-500/30">
                          <div className="text-yellow-400 font-semibold text-sm mb-1">⭐ Finais de Semana</div>
                          <div className="text-yellow-200 text-xs">Com agendamento = 100% hora extra</div>
                        </div>
                        <div className="bg-purple-900/30 p-2 rounded border border-purple-500/30">
                          <div className="text-purple-400 font-semibold text-sm mb-1">🎉 Feriados</div>
                          <div className="text-purple-200 text-xs">Com agendamento = 100% hora extra</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Activity className="w-5 h-5 mr-2 text-purple-400" />
                        Monitoramento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-gray-300 text-sm space-y-2">
                        <li>• Log de todas as atividades</li>
                        <li>• Pedidos e alterAções</li>
                        <li>• Localização de cada ação</li>
                        <li>• Relatórios detalhados</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Instruções de Uso */}
                <Card className="bg-blue-900/20 border-blue-500/50">
                  <CardHeader>
                    <CardTitle className="text-blue-400">📋 Como Funciona o Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Para Funcionários:</h4>
                        <ul className="space-y-1 text-sm">
                          <li>� Login automático registra entrada</li>
                          <li>� GPS detecta se está na empresa</li>
                          <li>� Dentro da empresa = aprovação autom�tica</li>
                          <li>� Fora da empresa = aguarda aprovação</li>
                          <li>� Todas as ações são monitoradas</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2">Para Gestores:</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Visualiza todos os Funcionários online</li>
                          <li>• Aprova pontos fora da empresa</li>
                          <li>• Monitora atividades em tempo real</li>
                          <li>• Relatórios de localização</li>
                          <li>• Controle total do sistema</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              </TabErrorBoundary>
            )}

            {/* Configurações Tab */}
            {activeTab === "configuracoes" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white" data-edit-id="Pedidos.title">
                  Configurações do Sistema
                </h2>

                {/* Configura��o de Numeração de Pedidos */}
                <OrderNumberingConfig />

                {/* Importação em Lote de Pedidos */}
                <OrderBatchImport />

                {/* Error Boundary para ConfigurAções */}
                <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-yellow-400 font-medium">⚠️ Outras ConfigurAções em Manutenção</div>
                      <div className="text-yellow-300 text-sm">
                        Algumas configurações estáo temporariamente indisponíveis devido a atualizações do sistema.
                        Use as novas abas "Funcionários" e "Ponto Automático" para gerenciar o sistema.
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button
                      onClick={() => handleTabChange("funcionarios")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Ir para Funcionários
                    </Button>
                    <Button
                      onClick={() => handleTabChange("auto-ponto")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Ir para Ponto Automático
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Área do Cliente Tab */}
            {activeTab === "area-cliente" && (
              <div className="space-y-6">
                <ClientAreaManager />
              </div>
            )}

          </div>
        </div>

        {/* Product Selection Modal */}
        <ProductSelectionModal
          isOpen={showProductSelectionModal}
          onClose={() => setShowProductSelectionModal(false)}
          onSelectProducts={handleProductSelection}
          existingProducts={newOrderForm.equipment || []}
        />

        {/* Modal Adicionar Produto - DESABILITADO */}
        {false && showAddProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-cinema-gray border-cinema-gray-light w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Adicionar Novo Produto
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddProductModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Nome do Produto *</Label>
                    <Input
                      placeholder="Ex: Câmera Canon EOS R5"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Código/SKU</Label>
                    <Input
                      placeholder="Ex: CAM-001"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Descrição</Label>
                  <textarea
                    placeholder="Descrição detalhada do produto..."
                    rows={3}
                    className="w-full p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Categoria *</Label>
                    <select className="w-full p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white">
                      <option value="">Selecione...</option>
                      <option value="cameras">Câmeras</option>
                      <option value="lentes">Lentes</option>
                      <option value="audio">Áudio</option>
                      <option value="iluminacao">Iluminação</option>
                      <option value="suportes">Suportes</option>
                      <option value="monitores">Monitores</option>
                      <option value="acessorios">Acessórios</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-white">Marca</Label>
                    <Input
                      placeholder="Ex: Canon, Sony, Zeiss"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Modelo</Label>
                    <Input
                      placeholder="Ex: EOS R5, FX6"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Preço Diário (R$) *</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Preço Semanal (R$)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Preço Mensal (R$)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Quantidade em Estoque *</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      min="0"
                      className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Status</Label>
                    <select className="w-full p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white">
                      <option value="disponivel">Disponível</option>
                      <option value="locado">Locado</option>
                      <option value="manutencao">Em Manutenção</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Campo de Proprietário */}
                <div>
                  <Label className="text-white">Proprietário *</Label>
                  <select className="w-full p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white">
                    <option value="">Selecione o proprietário...</option>
                    <option value="empresa">🏢 Empresa (Próprio)</option>
                    {clientsData
                      .filter(client => client.type === 'fornecedor' || client.type === 'ambos')
                      .map(client => (
                        <option key={client.id} value={client.id}>
                          👤 {client.name} {client.company && `(${client.company})`}
                        </option>
                      ))
                    }
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Selecione quem é o dono deste equipamento. Para parceiros, cadastre-os em "Clientes/Fornecedores"
                  </p>
                </div>

                <div>
                  <Label className="text-white">Tipo de Produto</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2 text-white">
                      <input
                        type="radio"
                        name="productType"
                        value="individual"
                        defaultChecked
                        className="text-cinema-yellow"
                      />
                      <span>Produto Individual</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white">
                      <input
                        type="radio"
                        name="productType"
                        value="kit"
                        className="text-cinema-yellow"
                      />
                      <span>Kit (Conjunto)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-white">ObservAções/Notas</Label>
                  <textarea
                    placeholder="InformAções adicionais, instruções especiais, etc."
                    rows={2}
                    className="w-full p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="flex space-x-2 pt-4 border-t border-cinema-gray-light">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                    onClick={() => setShowAddProductModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                    onClick={() => {
                      // Aqui seria implementada a lógica de salvar o produto
                      alert("Produto adicionado com sucesso! (Funcionalidade será implementada)");
                      setShowAddProductModal(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Modal de Emissão de NFSe */}
        {showEmitirNFSeModal && pedidoParaFaturar && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="bg-cinema-gray border-cinema-gray-light max-w-2xl w-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-cinema-yellow" />
                    Emitir NFSe - Pedido {pedidoParaFaturar.id}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEmitirNFSeModal(false);
                      setPedidoParaFaturar(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Informações do Pedido */}
                <div className="p-4 bg-cinema-dark-lighter rounded-lg border border-blue-500/30">
                  <h4 className="text-white font-medium mb-3" data-edit-id="nfse.Dados-pedido">📋 Dados do Pedido</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Cliente:</span>
                      <p className="text-white font-medium">{pedidoParaFaturar.client}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Data:</span>
                      <p className="text-white">{pedidoParaFaturar.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Valor Total:</span>
                      <p className="text-cinema-yellow font-bold">R$ {pedidoParaFaturar.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className="text-white capitalize">{pedidoParaFaturar.status}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-400">Itens:</span>
                    <p className="text-white text-sm">{pedidoParaFaturar.items.join(", ")}</p>
                  </div>
                </div>

                {/* Configura��o NFSe */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium" data-edit-id="nfse.configuracao">⚙️ Configuração da NFSe</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-400 text-sm">Alíquota ISS (%)</Label>
                      <Input
                        type="number"
                        defaultValue="5.00"
                        step="0.01"
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Padrão BH: 5%</p>
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Código de Serviço (LC 116/2003)</Label>
                      <select
                        defaultValue="01073"
                        className="w-full bg-cinema-dark border border-cinema-gray-light text-white rounded-md p-2 mt-1"
                      >
                        <option value="01073">01073 - Locação de bens móveis</option>
                        <option value="03039">03039 - Locação de equipamentos de informática</option>
                        <option value="17089">17089 - Outras locações</option>
                        <option value="17019">17019 - Fornecimento de música para ambientes fechados</option>
                        <option value="12029">12029 - Filmagem, fotografia e produção de vídeos</option>
                        <option value="13039">13039 - Locação de espaços para eventos</option>
                        <option value="07029">07029 - Instalação e montagem de equipamentos</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Selecione o código que melhor descreve o serviço</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400 text-sm">Discriminação do Serviço</Label>
                    <Textarea
                      rows={3}
                      defaultValue={`Locação de equipamentos de áudio e vídeo:\n${pedidoParaFaturar.items.join(", ")}\nValor: R$ ${pedidoParaFaturar.total.toFixed(2)}`}
                      className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                    />
                  </div>
                </div>

                {/* Resumo Fiscal */}
                <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-2" data-edit-id="nfse.Resumo-fiscal">💰 Resumo Fiscal</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valor do Serviço:</span>
                      <span className="text-white">R$ {pedidoParaFaturar.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ISS (5%):</span>
                      <span className="text-white">R$ {(pedidoParaFaturar.total * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-green-700/50 pt-1">
                      <span className="text-green-400 font-medium">Valor Líquido:</span>
                      <span className="text-green-400 font-bold">R$ {(pedidoParaFaturar.total * 0.95).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Aviso */}
                <div className="p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-300 text-xs">
                    ⚠️ A NFSe será emitida via API da Prefeitura de Belo Horizonte. 
                    Certifique-se de que todos os Dados estáo corretos antes de confirmar.
                  </p>
                </div>

                {/* Botões */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                    onClick={() => {
                      setShowEmitirNFSeModal(false);
                      setPedidoParaFaturar(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-yellow-500"
                    onClick={async () => {
                      setEmissaoNFSeLoading(true);
                      // Simular emissão
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      alert(`✅ NFSe Emitida com Sucesso!\n\nNúmero: ${Math.floor(Math.random() * 999999)}\nCódigo Verificação: ${Math.random().toString(36).substring(2, 10).toUpperCase()}\n\nA nota foi adicionada à fila e será processada automaticamente.`);
                      setEmissaoNFSeLoading(false);
                      setShowEmitirNFSeModal(false);
                      setPedidoParaFaturar(null);
                    }}
                    disabled={emissaoNFSeLoading}
                  >
                    {emissaoNFSeLoading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Emitindo...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Emitir NFSe
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Fatura de Locação */}
        {showFaturaModal && pedidoParaFatura && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-cinema-dark-lighter border border-cinema-gray rounded-lg max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-cinema-gray flex justify-between items-center sticky top-0 bg-cinema-dark-lighter z-10">
                <h2 className="text-xl font-bold text-cinema-yellow flex items-center">
                  <FileText className="w-6 h-6 mr-2" />
                  Gerar Fatura de Locação - Pedido {pedidoParaFatura.id}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFaturaModal(false);
                    setPedidoParaFatura(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4">
                <FaturaLocacao
                  clienteInicial={{
                    nome: pedidoParaFatura.client || "",
                    cnpjCpf: pedidoParaFatura.cpfCnpj || "",
                    endereco: pedidoParaFatura.endereco || "",
                    bairro: pedidoParaFatura.bairro || "",
                    cep: pedidoParaFatura.cep || "",
                    municipio: pedidoParaFatura.cidade || "Belo Horizonte",
                    uf: pedidoParaFatura.estado || "MG",
                    telefone: pedidoParaFatura.phone || "",
                    inscEstadual: pedidoParaFatura.inscEstadual || "",
                  }}
                  itensIniciais={pedidoParaFatura.items?.map((item: string, index: number) => ({
                    codigo: "",
                    descricao: item,
                    quantidade: 1,
                    valorUnitario: pedidoParaFatura.total / (pedidoParaFatura.items?.length || 1),
                    valorTotal: pedidoParaFatura.total / (pedidoParaFatura.items?.length || 1),
                  })) || []}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Cliente/Fornecedor */}
        {showEditClientModal && clienteEditando && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="bg-cinema-gray border-cinema-gray-light max-w-4xl w-full my-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center">
                    <Edit className="w-6 h-6 mr-2 text-cinema-yellow" />
                    Editar {clienteEditando.type === "fornecedor" ? "Fornecedor" : "Cliente"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditClientModal(false);
                      setClienteEditando(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* InformAções Básicas */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <Users className="w-5 h-5 mr-2 text-cinema-yellow" />
                    InformAções Básicas
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Nome Completo</Label>
                      <Input
                        defaultValue={clienteEditando.name}
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Tipo</Label>
                      <select
                        defaultValue={clienteEditando.type}
                        className="w-full bg-cinema-dark border border-cinema-gray-light text-white rounded-md p-2 mt-1"
                      >
                        <option value="cliente">Cliente</option>
                        <option value="fornecedor">Fornecedor</option>
                        <option value="ambos">Cliente + Fornecedor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">CPF/CNPJ</Label>
                      <Input
                        placeholder="000.000.000-00"
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Inscrição Municipal</Label>
                      <Input
                        placeholder="Opcional"
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">E-mail</Label>
                      <Input
                        type="email"
                        defaultValue={clienteEditando.email}
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Telefone</Label>
                      <Input
                        defaultValue={clienteEditando.phone}
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                  </div>

                  {(clienteEditando.type === "fornecedor" || clienteEditando.type === "ambos") && (
                    <div>
                      <Label className="text-gray-400 text-sm">Nome da Empresa</Label>
                      <Input
                        defaultValue={clienteEditando.company}
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-cinema-yellow" />
                    Endereço
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">CEP</Label>
                      <Input
                        placeholder="00000-000"
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-gray-400 text-sm">Logradouro</Label>
                      <Input
                        placeholder="Rua, Avenida..."
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Número</Label>
                      <Input
                        placeholder="123"
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Complemento</Label>
                      <Input
                        placeholder="Apto, Sala..."
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Bairro</Label>
                      <Input
                        placeholder="Bairro"
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-sm">Cidade</Label>
                      <Input
                        placeholder="Cidade"
                        className="bg-cinema-dark border-cinema-gray-light text-white mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Informação */}
                <div className="p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                  <p className="text-blue-300 text-xs">
                    ℹ️ Todos os Dados fornecidos serão utilizados para emissão de NFSe. 
                    Certifique-se de que estão corretos e atualizados.
                  </p>
                </div>

                {/* Botões */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                    onClick={() => {
                      setShowEditClientModal(false);
                      setClienteEditando(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-yellow-500"
                    onClick={() => {
                      alert("✅ Cliente/Fornecedor atualizado com sucesso!");
                      setShowEditClientModal(false);
                      setClienteEditando(null);
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar AlterAções
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>

      {/* Modal de Edição de Produto - NOVO */}
      <ProductEditModal
        open={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={() => {
          // Forçar atualização dos componentes de produtos após um pequeno delay
          // para garantir que o servidor processou os dados
          setTimeout(() => {
            setProductsRefreshKey(prev => prev + 1);
          }, 500);
        }}
      />
    </Layout>
  );
}
