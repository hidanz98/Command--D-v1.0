import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DollarSign,
  Percent,
  Calculator,
  TrendingUp,
  Building,
  Package,
  Receipt,
  CreditCard,
  ArrowRight,
  Settings,
  Plus,
  Edit,
  Eye,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface Partner {
  id: string;
  name: string;
  type: string;
  company?: string;
}

interface CommissionRule {
  id: string;
  partnerCompanyId: string;
  partnerCompanyName: string;
  productCategory: string;
  ourCommission: number; // Porcentagem que fica conosco
  partnerCommission: number; // Porcentagem que vai para o parceiro
  minimumAmount: number;
  isActive: boolean;
  createdAt: string;
}

interface Transaction {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  partnerCompanyId: string;
  partnerCompanyName: string;
  totalAmount: number;
  ourCommission: number;
  ourAmount: number;
  partnerCommission: number;
  partnerAmount: number;
  rentalDays: number;
  status: "pending" | "processed" | "paid";
  createdAt: string;
  paidAt?: string;
}

interface CommissionManagerProps {
  partners?: Partner[];
}

const CommissionManager: React.FC<CommissionManagerProps> = ({ partners = [] }) => {
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([
    {
      id: "1",
      partnerCompanyId: "bils-cinema",
      partnerCompanyName: "Bil's Cinema e Vídeo",
      productCategory: "Câmeras",
      ourCommission: 25, // 25% fica conosco
      partnerCommission: 75, // 75% vai para o parceiro
      minimumAmount: 100,
      isActive: true,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      partnerCompanyId: "bils-cinema",
      partnerCompanyName: "Bil's Cinema e Vídeo",
      productCategory: "Lentes",
      ourCommission: 30, // 30% fica conosco
      partnerCommission: 70, // 70% vai para o parceiro
      minimumAmount: 50,
      isActive: true,
      createdAt: "2024-01-15",
    },
    {
      id: "3",
      partnerCompanyId: "provideo",
      partnerCompanyName: "ProVideo Equipamentos",
      productCategory: "Drones",
      ourCommission: 20, // 20% fica conosco
      partnerCommission: 80, // 80% vai para o parceiro
      minimumAmount: 200,
      isActive: true,
      createdAt: "2024-01-20",
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      orderId: "ORD-001",
      productId: "prod-1",
      productName: "Câmera RED Komodo 6K",
      partnerCompanyId: "bils-cinema",
      partnerCompanyName: "Bil's Cinema e Vídeo",
      totalAmount: 1350, // 3 dias x R$ 450
      ourCommission: 25,
      ourAmount: 337.50,
      partnerCommission: 75,
      partnerAmount: 1012.50,
      rentalDays: 3,
      status: "processed",
      createdAt: "2024-01-25",
      paidAt: "2024-01-26",
    },
    {
      id: "2",
      orderId: "ORD-002",
      productId: "prod-2",
      productName: "Lente Zeiss CP.3 85mm",
      partnerCompanyId: "bils-cinema",
      partnerCompanyName: "Bil's Cinema e Vídeo",
      totalAmount: 900, // 5 dias x R$ 180
      ourCommission: 30,
      ourAmount: 270,
      partnerCommission: 70,
      partnerAmount: 630,
      rentalDays: 5,
      status: "pending",
      createdAt: "2024-01-28",
    },
    {
      id: "3",
      orderId: "ORD-003",
      productId: "prod-3",
      productName: "Drone DJI Inspire 2",
      partnerCompanyId: "provideo",
      partnerCompanyName: "ProVideo Equipamentos",
      totalAmount: 960, // 3 dias x R$ 320
      ourCommission: 20,
      ourAmount: 192,
      partnerCommission: 80,
      partnerAmount: 768,
      rentalDays: 3,
      status: "pending",
      createdAt: "2024-01-29",
    },
  ]);

  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPartner, setFilterPartner] = useState<string>("all");
  
  const [newRule, setNewRule] = useState({
    partnerCompanyId: "",
    productCategory: "",
    ourCommission: 25,
    partnerCommission: 75,
    minimumAmount: 100,
  });

  const calculateCommission = (amount: number, rule: CommissionRule) => {
    if (amount < rule.minimumAmount) {
      return {
        ourAmount: 0,
        partnerAmount: amount,
        ourCommission: 0,
        partnerCommission: 100,
      };
    }

    const ourAmount = (amount * rule.ourCommission) / 100;
    const partnerAmount = (amount * rule.partnerCommission) / 100;

    return {
      ourAmount,
      partnerAmount,
      ourCommission: rule.ourCommission,
      partnerCommission: rule.partnerCommission,
    };
  };

  const handleCreateRule = () => {
    if (!newRule.partnerCompanyId || !newRule.productCategory) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (newRule.ourCommission + newRule.partnerCommission !== 100) {
      toast.error("A soma das comissões deve ser 100%");
      return;
    }

    const rule: CommissionRule = {
      id: Date.now().toString(),
      partnerCompanyId: newRule.partnerCompanyId,
      partnerCompanyName: "Nome da Empresa", // Seria obtido do banco de dados
      productCategory: newRule.productCategory,
      ourCommission: newRule.ourCommission,
      partnerCommission: newRule.partnerCommission,
      minimumAmount: newRule.minimumAmount,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCommissionRules([...commissionRules, rule]);
    setShowNewRuleModal(false);
    setNewRule({
      partnerCompanyId: "",
      productCategory: "",
      ourCommission: 25,
      partnerCommission: 75,
      minimumAmount: 100,
    });
    toast.success("Regra de comissão criada com sucesso!");
  };

  const toggleRuleStatus = (ruleId: string) => {
    setCommissionRules(rules => 
      rules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
  };

  const processTransaction = (transactionId: string) => {
    setTransactions(transactions => 
      transactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: "processed", paidAt: new Date().toISOString().split('T')[0] }
          : transaction
      )
    );
    toast.success("Transação processada com sucesso!");
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    const matchesPartner = filterPartner === "all" || transaction.partnerCompanyId === filterPartner;
    return matchesStatus && matchesPartner;
  });

  const totalOurEarnings = transactions
    .filter(t => t.status === "processed")
    .reduce((sum, t) => sum + t.ourAmount, 0);

  const totalPartnerPayouts = transactions
    .filter(t => t.status === "processed")
    .reduce((sum, t) => sum + t.partnerAmount, 0);

  const pendingPayouts = transactions
    .filter(t => t.status === "pending")
    .reduce((sum, t) => sum + t.partnerAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-cinema-yellow" />
            Sistema de Comissões e Repasses
          </h2>
          <p className="text-gray-400">
            Gerencie comissões de produtos terceiros e repasses financeiros
          </p>
        </div>
        <Button 
          onClick={() => setShowNewRuleModal(true)}
          className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Estatísticas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Nossa Receita</p>
                <p className="text-2xl font-bold text-green-400">
                  R$ {totalOurEarnings.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Repasses Pagos</p>
                <p className="text-2xl font-bold text-blue-400">
                  R$ {totalPartnerPayouts.toFixed(2)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Repasses Pendentes</p>
                <p className="text-2xl font-bold text-yellow-400">
                  R$ {pendingPayouts.toFixed(2)}
                </p>
              </div>
              <Receipt className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cinema-gray border-cinema-gray-light">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Regras Ativas</p>
                <p className="text-2xl font-bold text-white">
                  {commissionRules.filter(r => r.isActive).length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculadora de Comissão */}
      <Card className="bg-cinema-gray border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Calculadora de Comissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-white">Valor Total (R$)</Label>
              <Input
                type="number"
                placeholder="200.00"
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                id="calc-amount"
              />
            </div>
            <div>
              <Label className="text-white">Nossa Comissão (%)</Label>
              <Input
                type="number"
                placeholder="25"
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                id="calc-our-commission"
              />
            </div>
            <div>
              <Label className="text-white">Comissão Parceiro (%)</Label>
              <Input
                type="number"
                placeholder="75"
                className="bg-cinema-dark-lighter border-cinema-gray-light text-white"
                id="calc-partner-commission"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full bg-cinema-yellow text-cinema-dark"
                onClick={() => {
                  const amount = parseFloat((document.getElementById('calc-amount') as HTMLInputElement)?.value || "0");
                  const ourCommission = parseFloat((document.getElementById('calc-our-commission') as HTMLInputElement)?.value || "0");
                  const partnerCommission = parseFloat((document.getElementById('calc-partner-commission') as HTMLInputElement)?.value || "0");
                  
                  if (ourCommission + partnerCommission !== 100) {
                    toast.error("A soma das comissões deve ser 100%");
                    return;
                  }

                  const ourAmount = (amount * ourCommission) / 100;
                  const partnerAmount = (amount * partnerCommission) / 100;

                  toast.success(
                    `Cálculo: Nós: R$ ${ourAmount.toFixed(2)} | Parceiro: R$ ${partnerAmount.toFixed(2)}`,
                    { duration: 5000 }
                  );
                }}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calcular
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regras de Comissão */}
      <Card className="bg-cinema-gray border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <Percent className="w-5 h-5 mr-2" />
              Regras de Comissão
            </span>
            <Badge className="bg-blue-600 text-white">
              {commissionRules.length} regras
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commissionRules.map((rule) => (
              <div key={rule.id} className="p-4 bg-cinema-dark-lighter rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Building className="w-5 h-5 text-cinema-yellow" />
                      <h4 className="text-white font-semibold">{rule.partnerCompanyName}</h4>
                      <Badge className="bg-purple-600 text-white">{rule.productCategory}</Badge>
                      <Badge className={rule.isActive ? "bg-green-600" : "bg-red-600"}>
                        {rule.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-2 bg-cinema-gray rounded">
                        <p className="text-gray-400 text-xs">Nossa Comissão</p>
                        <p className="text-green-400 font-bold">{rule.ourCommission}%</p>
                      </div>
                      <div className="text-center p-2 bg-cinema-gray rounded">
                        <p className="text-gray-400 text-xs">Comissão Parceiro</p>
                        <p className="text-blue-400 font-bold">{rule.partnerCommission}%</p>
                      </div>
                      <div className="text-center p-2 bg-cinema-gray rounded">
                        <p className="text-gray-400 text-xs">Valor Mínimo</p>
                        <p className="text-white font-bold">R$ {rule.minimumAmount}</p>
                      </div>
                      <div className="text-center p-2 bg-cinema-gray rounded">
                        <p className="text-gray-400 text-xs">Criada em</p>
                        <p className="text-white font-bold">{rule.createdAt}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRule(rule)}
                      className="border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleRuleStatus(rule.id)}
                      className={rule.isActive 
                        ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      }
                    >
                      {rule.isActive ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transações e Repasses */}
      <Card className="bg-cinema-gray border-cinema-gray-light">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Transações e Repasses
            </span>
            <div className="flex space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white text-sm"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="processed">Processado</option>
                <option value="paid">Pago</option>
              </select>
              <select
                value={filterPartner}
                onChange={(e) => setFilterPartner(e.target.value)}
                className="px-3 py-1 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white text-sm"
              >
                <option value="all">Todos os Parceiros</option>
                <option value="bils-cinema">Bil's Cinema</option>
                <option value="provideo">ProVideo</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 bg-cinema-dark-lighter rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Package className="w-5 h-5 text-cinema-yellow" />
                      <h4 className="text-white font-semibold">{transaction.productName}</h4>
                      <Badge className="bg-gray-600 text-white">#{transaction.orderId}</Badge>
                      <Badge className={
                        transaction.status === "pending" ? "bg-yellow-600" :
                        transaction.status === "processed" ? "bg-blue-600" : "bg-green-600"
                      }>
                        {transaction.status === "pending" ? "Pendente" :
                         transaction.status === "processed" ? "Processado" : "Pago"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="text-center p-2 bg-cinema-gray rounded">
                        <p className="text-gray-400 text-xs">Valor Total</p>
                        <p className="text-white font-bold">R$ {transaction.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-cinema-gray rounded">
                        <p className="text-gray-400 text-xs">Nossa Parte ({transaction.ourCommission}%)</p>
                        <p className="text-green-400 font-bold">R$ {transaction.ourAmount.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-cinema-gray rounded">
                        <p className="text-gray-400 text-xs">Repasse ({transaction.partnerCommission}%)</p>
                        <p className="text-blue-400 font-bold">R$ {transaction.partnerAmount.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-2 bg-cinema-gray rounded">
                        <p className="text-gray-400 text-xs">Parceiro</p>
                        <p className="text-white font-bold text-xs">{transaction.partnerCompanyName}</p>
                      </div>
                      <div className="text-center p-2 bg-cinema-gray rounded">
                        <p className="text-gray-400 text-xs">Data</p>
                        <p className="text-white font-bold text-xs">{transaction.createdAt}</p>
                      </div>
                    </div>
                  </div>

                  {transaction.status === "pending" && (
                    <div className="ml-4">
                      <Button
                        size="sm"
                        onClick={() => processTransaction(transaction.id)}
                        className="bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                      >
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Processar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Nova Regra */}
      {showNewRuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-cinema-gray border-cinema-gray-light w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Regra de Comissão
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewRuleModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Parceiro/Fornecedor</Label>
                  <select
                    value={newRule.partnerCompanyId}
                    onChange={(e) => {
                      const selectedPartner = partners.find(p => p.id === e.target.value);
                      setNewRule({
                        ...newRule, 
                        partnerCompanyId: e.target.value
                      });
                    }}
                    className="w-full mt-2 p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white"
                  >
                    <option value="">Selecione um parceiro...</option>
                    {partners
                      .filter(partner => partner.type === 'fornecedor' || partner.type === 'ambos')
                      .map(partner => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name} {partner.company && `(${partner.company})`}
                        </option>
                      ))
                    }
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Apenas fornecedores e parceiros aparecem aqui. Cadastre novos em "Clientes/Fornecedores"
                  </p>
                </div>

                <div>
                  <Label className="text-white">Categoria do Produto</Label>
                  <select
                    value={newRule.productCategory}
                    onChange={(e) => setNewRule({...newRule, productCategory: e.target.value})}
                    className="w-full mt-2 p-2 bg-cinema-dark-lighter border border-cinema-gray-light rounded text-white"
                  >
                    <option value="">Selecione uma categoria...</option>
                    <option value="Câmeras">Câmeras</option>
                    <option value="Lentes">Lentes</option>
                    <option value="Drones">Drones</option>
                    <option value="Iluminação">Iluminação</option>
                    <option value="Áudio">Áudio</option>
                    <option value="Suportes">Suportes</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white">Nossa Comissão (%)</Label>
                  <Input
                    type="number"
                    value={newRule.ourCommission}
                    onChange={(e) => {
                      const ourCommission = parseInt(e.target.value) || 0;
                      setNewRule({
                        ...newRule, 
                        ourCommission,
                        partnerCommission: 100 - ourCommission
                      });
                    }}
                    className="mt-2 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <Label className="text-white">Comissão do Parceiro (%)</Label>
                  <Input
                    type="number"
                    value={newRule.partnerCommission}
                    onChange={(e) => {
                      const partnerCommission = parseInt(e.target.value) || 0;
                      setNewRule({
                        ...newRule, 
                        partnerCommission,
                        ourCommission: 100 - partnerCommission
                      });
                    }}
                    className="mt-2 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-white">Valor Mínimo para Comissão (R$)</Label>
                  <Input
                    type="number"
                    value={newRule.minimumAmount}
                    onChange={(e) => setNewRule({...newRule, minimumAmount: parseFloat(e.target.value) || 0})}
                    className="mt-2 bg-cinema-dark-lighter border-cinema-gray-light text-white"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Valores abaixo deste montante não terão comissão aplicada
                  </p>
                </div>
              </div>

              {/* Preview do Cálculo */}
              <div className="p-4 bg-cinema-dark-lighter rounded-lg">
                <h4 className="text-cinema-yellow font-semibold mb-2">Preview do Cálculo</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-400 text-sm">Exemplo: R$ 200,00</p>
                    <p className="text-white font-bold">Valor Total</p>
                  </div>
                  <div>
                    <p className="text-green-400 text-sm">R$ {((200 * newRule.ourCommission) / 100).toFixed(2)}</p>
                    <p className="text-green-400 font-bold">Nossa Parte</p>
                  </div>
                  <div>
                    <p className="text-blue-400 text-sm">R$ {((200 * newRule.partnerCommission) / 100).toFixed(2)}</p>
                    <p className="text-blue-400 font-bold">Repasse</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-cinema-gray-light">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setShowNewRuleModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark"
                  onClick={handleCreateRule}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Regra
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CommissionManager;
