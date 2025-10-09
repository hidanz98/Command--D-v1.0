import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, Calendar, Clock, Home, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { EditorOverlay, EditPanel } from "@/components/InlineEditor";
import { useSimpleNotification } from "@/components/ui/simple-notification";

export function Carrinho() {
  const { state, dispatch } = useCart();
  const { isAdmin, isFuncionario, user } = useAuth();
  const { addOrder, currentTenant, orders } = useTenant();
  const navigate = useNavigate();
  const { addNotification, NotificationContainer } = useSimpleNotification();
  
  // Debug do contexto
  useEffect(() => {
    console.log("🔍 Carrinho - Context Status:");
    console.log("  - currentTenant:", currentTenant);
    console.log("  - addOrder disponível:", typeof addOrder);
    console.log("  - Pedidos existentes:", orders?.length || 0);
  }, [currentTenant, addOrder, orders]);

  // Debug logs para entender o problema
  useEffect(() => {
    console.log("Carrinho component mounted/updated");
    console.log("Cart state:", state);
    console.log("Items count:", state.items.length);
    console.log("Current location:", window.location.pathname);
  }, [state]);

  // Cleanup effect para evitar problemas de DOM
  useEffect(() => {
    return () => {
      // Limpar qualquer timeout pendente
      const timeouts = document.querySelectorAll('[data-timeout]');
      timeouts.forEach(timeout => {
        if (timeout.parentNode) {
          timeout.parentNode.removeChild(timeout);
        }
      });
    };
  }, []);
  const [pickupDate, setPickupDate] = useState("2025-09-01");
  const [returnDate, setReturnDate] = useState("2025-09-02");
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnTime, setReturnTime] = useState("18:00");
  const [projectName, setProjectName] = useState("");
  const [director, setDirector] = useState("");
  const [production, setProduction] = useState("");

  const calculateDays = () => {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const updateItemQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id });
      
      // Check if this was the last item
      if (state.items.length === 1) {
        // This was the last item, redirect after a short delay
        setTimeout(() => {
          navigate("/equipamentos", { replace: true });
        }, 1500);
      }
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } });
    }
  };

  const updateItemDays = (id: string, newDays: number) => {
    if (newDays <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id });
      
      // Check if this was the last item
      if (state.items.length === 1) {
        // This was the last item, redirect after a short delay
        setTimeout(() => {
          navigate("/equipamentos", { replace: true });
        }, 1500);
      }
    } else {
      dispatch({ type: "UPDATE_DAYS", payload: { id, days: newDays } });
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    
    // Check if this was the last item
    if (state.items.length === 1) {
      // This was the last item, redirect after a short delay
      setTimeout(() => {
        navigate("/equipamentos", { replace: true });
      }, 1500);
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('pt-BR', options);
  };

  const handleRequestQuote = () => {
    console.log("🚀 === INICIANDO CRIAÇÃO DE ORÇAMENTO ===");
    console.log("📅 Data/Hora:", new Date().toISOString());
    console.log("🔍 Verificações iniciais:");
    console.log("  1️⃣ Items no carrinho:", state.items.length);
    console.log("  2️⃣ currentTenant:", currentTenant);
    console.log("  3️⃣ addOrder disponível:", typeof addOrder);
    console.log("  4️⃣ addNotification disponível:", typeof addNotification);
    console.log("  5️⃣ user:", user);
    
    if (state.items.length === 0) {
      console.log("⚠️ Carrinho vazio - mostrando notificação de erro");
      addNotification("Adicione itens ao carrinho primeiro", "error");
      return;
    }

    if (!currentTenant) {
      console.error("❌ ERRO: currentTenant é null/undefined!");
      addNotification("Erro: Tenant não identificado. Recarregue a página.", "error");
      return;
    }

    console.log("4️⃣ Tentando criar pedido...");
    console.log("5️⃣ Itens do carrinho:", state.items);
    console.log("6️⃣ Total:", state.total);
    console.log("7️⃣ Projeto:", projectName);
    console.log("8️⃣ Direção:", director);
    console.log("9️⃣ Produção:", production);

    try {
      console.log("🔄 Preparando dados do pedido...");
      console.log("👤 Usuário logado:", user);
      console.log("📧 Email do usuário:", user?.email);
      
      // Criar pedido usando o contexto do tenant
      const orderNumber = addOrder({
        customerId: user?.email || "guest",
        customerName: user?.name || projectName || "Cliente Visitante",
        customerEmail: user?.email || "contato@exemplo.com",
        items: state.items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          dailyRate: item.pricePerDay,
          totalDays: item.days,
          totalPrice: item.pricePerDay * item.quantity * item.days
        })),
        startDate: new Date(pickupDate),
        endDate: new Date(returnDate),
        totalAmount: state.total,
        status: "pending",
        notes: `Projeto: ${projectName}\nDireção: ${director}\nProdução: ${production}\nRetirada: ${pickupDate} às ${pickupTime}\nDevolução: ${returnDate} às ${returnTime}`
      });

      console.log("✅ Pedido enviado para addOrder");
      console.log("🔢 Resultado do addOrder:", orderNumber);
      console.log("📊 Tipo do resultado:", typeof orderNumber);
      console.log("📋 Valor exato:", JSON.stringify(orderNumber));

      if (orderNumber) {
        console.log("✨ SUCESSO! Orçamento criado:", orderNumber);
        console.log("🔔 Chamando addNotification com sucesso...");
        
        // Usar notificação simples
        addNotification(`✅ Orçamento ${orderNumber} criado com sucesso! Redirecionando para área do cliente...`, "success", 2000);
        
        console.log("📢 Notificação deveria ter aparecido!");
        console.log("🧹 Limpando carrinho...");
        
        // Limpar carrinho imediatamente
        dispatch({ type: "CLEAR_CART" });
        
        console.log("⏱️ Aguardando 2 segundos antes de redirecionar...");
        
        // Redirecionar para área do cliente onde o pedido estará visível
        setTimeout(() => {
          console.log("🔄 Redirecionando para /area-cliente");
          window.location.href = "/area-cliente";
        }, 2000);
      } else {
        console.error("❌ ERRO: addOrder retornou undefined");
        console.log("🔔 Chamando addNotification com erro...");
        addNotification("Erro ao criar pedido. Tente novamente.", "error");
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      addNotification("Erro ao criar pedido. Tente novamente.", "error");
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white" data-edit-id="cart.empty-background">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-300 border-gray-600 hover:border-cinema-yellow hover:text-cinema-yellow"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <h1 className="text-2xl font-bold">Carrinho Vazio</h1>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Link to="/">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-gray-300 border-gray-600 hover:border-cinema-yellow hover:text-cinema-yellow"
                  >
                    <Home className="w-4 h-4" />
                    Início
                  </Button>
                </Link>
                <Link to="/equipamentos">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-gray-300 border-gray-600 hover:border-cinema-yellow hover:text-cinema-yellow"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Ver Equipamentos
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-12 h-12 text-gray-400" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4" data-edit-id="cart.empty-title">Carrinho Vazio</h2>
              <p className="text-gray-400 mb-8 text-lg" data-edit-id="cart.empty-description">
                Seu carrinho está vazio. Que tal explorar nossos equipamentos profissionais?
              </p>
              
              <div className="space-y-4">
                <Link to="/equipamentos">
                  <Button className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white px-8 py-3 text-lg">
                    🎬 Ver Equipamentos
                  </Button>
                </Link>
                <div className="text-sm text-gray-500">
                  Ou <Link to="/" className="text-blue-400 hover:text-blue-300 underline">volte ao início</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Inline Editor - Only for Admin and Authorized Employees */}
        {(isAdmin || isFuncionario) && (
          <>
            <EditorOverlay />
            <EditPanel />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" data-edit-id="cart.background">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-300 border-gray-600 hover:border-cinema-yellow hover:text-cinema-yellow"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold" data-edit-id="cart.title">
                {state.items.length} item{state.items.length > 1 ? 's' : ''} selecionado{state.items.length > 1 ? 's' : ''}
              </h1>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Link to="/">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-gray-300 border-gray-600 hover:border-cinema-yellow hover:text-cinema-yellow"
                >
                  <Home className="w-4 h-4" />
                  Início
                </Button>
              </Link>
              <Link to="/equipamentos">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-gray-300 border-gray-600 hover:border-cinema-yellow hover:text-cinema-yellow"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Adicionar Mais Produtos
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">

            <div className="space-y-4">
              {state.items.map((item) => (
                <Card key={item.id} className="bg-gray-800 border-gray-600">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded bg-gray-700"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <p className="text-gray-400">{item.category}</p>
                            <p className="text-green-400 text-sm mt-1">
                              ✓ Disponível para as datas selecionadas
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Qtd:</span>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="text-lg font-semibold">
                            R$ {(item.pricePerDay * item.quantity * item.days).toFixed(2)}
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-400">
                          R$ {item.pricePerDay}/dia x {item.quantity} x {item.days} diária{item.days > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-600 sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6" data-edit-id="cart.summary-title">Resumo do Pedido</h2>

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({calculateDays()} diária{calculateDays() > 1 ? 's' : ''})</span>
                    <span>R$ {state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de serviço</span>
                    <span>R$ 0.00</span>
                  </div>
                  <div className="flex justify-between text-orange-400">
                    <span>Diária extra (+9h)</span>
                    <span>Incluída no total</span>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>R$ {state.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Date and Time Selection */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup-date" className="text-white">Data de Retirada</Label>
                      <Input
                        id="pickup-date"
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-sm text-gray-400 mt-1">{formatDate(pickupDate)}</p>
                    </div>
                    <div>
                      <Label htmlFor="return-date" className="text-white">Data de Devolução</Label>
                      <Input
                        id="return-date"
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-sm text-gray-400 mt-1">{formatDate(returnDate)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup-time" className="text-white">Horário de Retirada</Label>
                      <Input
                        id="pickup-time"
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="return-time" className="text-white">Horário de Devolução</Label>
                      <Input
                        id="return-time"
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Data */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold" data-edit-id="cart.project-title">Dados do Projeto</h3>
                  <div>
                    <Label htmlFor="project-name" className="text-white" data-edit-id="cart.project-name-label">Nome do Projeto</Label>
                    <Input
                      id="project-name"
                      placeholder="Ex: Comercial ACME"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      data-edit-id="cart.project-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="director" className="text-white" data-edit-id="cart.director-label">Direção</Label>
                    <Input
                      id="director"
                      placeholder="Nome do diretor"
                      value={director}
                      onChange={(e) => setDirector(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      data-edit-id="cart.director-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="production" className="text-white" data-edit-id="cart.production-label">Produção</Label>
                    <Input
                      id="production"
                      placeholder="Produtora / responsável"
                      value={production}
                      onChange={(e) => setProduction(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      data-edit-id="cart.production-input"
                    />
                  </div>
                </div>

                {/* Rental Policy */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3" data-edit-id="cart.policy-title">Política de Locação</h3>
                  <ul className="text-sm text-gray-300 space-y-1" data-edit-id="cart.policy-list">
                    <li>• Diárias de 24 horas: Ex Retirada 09:00 - Devolução 09:00</li>
                    <li>• Tolerância de 6 horas: Sem cobrança extra</li>
                    <li>• Acima de 6 horas: Cobrança de diária adicional</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleRequestQuote}
                    className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white font-semibold py-3"
                    data-edit-id="cart.request-quote-button"
                  >
                    Solicitar Orçamento
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 text-gray-300 border-gray-600 hover:border-cinema-yellow hover:text-cinema-yellow"
                      >
                        <Home className="w-4 h-4" />
                        Início
                      </Button>
                    </Link>
                    <Link to="/equipamentos" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 text-gray-300 border-gray-600 hover:border-cinema-yellow hover:text-cinema-yellow"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Mais Produtos
                      </Button>
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center mt-3" data-edit-id="cart.footer-text">
                  Entraremos em contato para confirmar disponibilidade e valores finais
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Inline Editor - Only for Admin and Authorized Employees */}
      {(isAdmin || isFuncionario) && (
        <>
          <EditorOverlay />
          <EditPanel />
        </>
      )}
      
      {/* Simple Notification Container */}
      <NotificationContainer />
    </div>
  );
}
