import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AutoPunchWrapper from "./components/AutoPunchWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import { useActivityTracker } from "./hooks/use-activity-tracker";
import { EditorProvider } from "./components/InlineEditor";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { CategoryProvider } from "./context/CategoryContext";
import { LogoProvider } from "./context/LogoContext";
import { CompanyProvider } from "./context/CompanyContext";
import { ClientAreaProvider } from "./context/ClientAreaContext";
import { NotificationProvider } from "./context/NotificationContext";
import { MasterAdminProvider } from "./context/MasterAdminContext";
import { TenantProvider } from "./context/TenantContext";
import { TimesheetProvider } from "./context/TimesheetContext";
import { Index } from "./pages/Index";
import { CabecaEfeito } from "./pages/CabecaEfeito";
import { NotFound } from "./pages/NotFound";
import Equipamentos from "./pages/Equipamentos";
import AreaCliente from "./pages/AreaCliente";
import PainelAdmin from "./pages/PainelAdmin";
import { MasterAdminPanel } from "./pages/MasterAdminPanel";
import { ProductDetail } from "./pages/ProductDetail";
import { Carrinho } from "./pages/Carrinho";
import Login from "./pages/Login";
import LoginMobile from "./pages/LoginMobile";
import Cadastro from "./pages/Cadastro";
import ClientRegistrationWithDocuments from "./components/ClientRegistrationWithDocuments";
import Pedidos from "./pages/Pedidos";
import Aprovacoes from "./pages/Aprovacoes";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Maintenances from "./pages/Maintenances";
import Configuracoes from "./pages/Configuracoes";
import Backups from "./pages/Backups";
import Diagnostics from "./pages/Diagnostics";
import Mobile from "./pages/Mobile";
import Importacao from "./pages/Importacao";
import DashboardPremium from "./pages/DashboardPremium";
import Auditoria from "./pages/Auditoria";
import Seguranca from "./pages/Seguranca";
import Usuarios from "./pages/Usuarios";
import Relatorios from "./pages/Relatorios";
import Calendario from "./pages/Calendario";
import Chat from "./pages/Chat";
import Notificacoes from "./pages/Notificacoes";
import Analytics from "./pages/Analytics";
import Avaliacoes from "./pages/Avaliacoes";
import Estoque from "./pages/Estoque";
import FluxoCaixa from "./pages/FluxoCaixa";
import Personalizacao from "./pages/Personalizacao";
import IAAvancada from "./pages/IAAvancada";
import RemoteControl from "./pages/RemoteControl";
import { PermissionsProvider } from "./context/PermissionsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AIProvider } from "./context/AIContext";
import AIAssistant from "./components/AIAssistant";
import MobileAccess from "./pages/MobileAccess";

// Create QueryClient instance with proper configuration
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       refetchOnWindowFocus: false,
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     },
//   },
// });

// Componente para integrar o activity tracker
function ActivityTracker() {
  useActivityTracker();
  return null;
}

// Wrapper component to ensure React is fully loaded
function AppWrapper() {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Ensure React is fully loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    // Handler global para erros de DOM
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('removeChild') || 
          event.error?.message?.includes('Node')) {
        console.warn('Erro de DOM capturado globalmente:', event.error);
        event.preventDefault(); // Prevenir que o erro quebre a aplicação
        // Tentar limpar elementos órfãos
        try {
          const orphanElements = document.querySelectorAll('[data-orphan]');
          orphanElements.forEach(el => {
            try {
              if (el.parentNode && el.parentNode.contains(el)) {
                el.parentNode.removeChild(el);
              }
            } catch (e) {
              // Ignorar erros de limpeza
            }
          });
        } catch (cleanupError) {
          console.error('Erro ao limpar DOM:', cleanupError);
        }
      }
    };

    // Handler para rejeições de promises não tratadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('removeChild') || 
          event.reason?.message?.includes('Node')) {
        console.warn('Promise rejeitada com erro de DOM:', event.reason);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isReady) {
    return <div>Carregando...</div>;
  }

  return (
    <ThemeProvider>
    <AIProvider>
    <PermissionsProvider>
    <AuthProvider>
      <LogoProvider>
        <CompanyProvider>
          <MasterAdminProvider>
            <TenantProvider>
              <TimesheetProvider>
                <NotificationProvider>
                  <ClientAreaProvider>
                    <CartProvider>
                      <CategoryProvider>
                        <EditorProvider>
                          <TooltipProvider>
                            <AutoPunchWrapper>
                            <BrowserRouter
                              future={{
                                v7_startTransition: true,
                                v7_relativeSplatPath: true,
                              }}
                            >
                              <ActivityTracker />
                              <Routes>
                                <Route path="/" element={<CabecaEfeito />} />
                                <Route path="/index" element={<Index />} />
                                <Route path="/cabeca-efeito" element={<CabecaEfeito />} />
                                <Route path="/equipamentos" element={<Equipamentos />} />
                                <Route path="/produto/:id" element={<ProductDetail />} />
                                <Route path="/carrinho" element={<Carrinho />} />
                                <Route path="/cadastro" element={<ClientRegistrationWithDocuments />} />
                                <Route path="/area-cliente" element={<AreaCliente />} />
                                <Route path="/painel-admin" element={<PainelAdmin />} />
                                <Route path="/pedidos" element={<Pedidos />} />
                                <Route path="/aprovacoes" element={<Aprovacoes />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/clientes" element={<Clientes />} />
                                <Route path="/manutencoes" element={<Maintenances />} />
                                <Route path="/configuracoes" element={<Configuracoes />} />
                                <Route path="/backups" element={<Backups />} />
                                <Route path="/diagnostico" element={<Diagnostics />} />
                                <Route path="/diagnostics" element={<Diagnostics />} />
                                <Route path="/mobile" element={<Mobile />} />
                                <Route path="/importacao" element={<Importacao />} />
                                <Route path="/importar" element={<Importacao />} />
                                <Route path="/dashboard-premium" element={<DashboardPremium />} />
                                <Route path="/painel" element={<DashboardPremium />} />
                                <Route path="/auditoria" element={<Auditoria />} />
                                <Route path="/logs" element={<Auditoria />} />
                                <Route path="/seguranca" element={<Seguranca />} />
                                <Route path="/security" element={<Seguranca />} />
                                <Route path="/usuarios" element={<Usuarios />} />
                                <Route path="/users" element={<Usuarios />} />
                                <Route path="/permissoes" element={<Usuarios />} />
                                <Route path="/relatorios" element={<Relatorios />} />
                                <Route path="/reports" element={<Relatorios />} />
                                <Route path="/contratos" element={<Relatorios />} />
                                <Route path="/calendario" element={<Calendario />} />
                                <Route path="/agenda" element={<Calendario />} />
                                <Route path="/reservas" element={<Calendario />} />
                                <Route path="/chat" element={<Chat />} />
                                <Route path="/mensagens" element={<Chat />} />
                                <Route path="/notificacoes" element={<Notificacoes />} />
                                <Route path="/alertas" element={<Notificacoes />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/bi" element={<Analytics />} />
                                <Route path="/inteligencia" element={<Analytics />} />
                                <Route path="/avaliacoes" element={<Avaliacoes />} />
                                <Route path="/reviews" element={<Avaliacoes />} />
                                <Route path="/feedback" element={<Avaliacoes />} />
                                <Route path="/estoque" element={<Estoque />} />
                                <Route path="/inventario" element={<Estoque />} />
                                <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
                                <Route path="/financeiro" element={<FluxoCaixa />} />
                                <Route path="/caixa" element={<FluxoCaixa />} />
                                <Route path="/personalizacao" element={<Personalizacao />} />
                                <Route path="/personalizar" element={<Personalizacao />} />
                                <Route path="/tema" element={<Personalizacao />} />
                                <Route path="/ia" element={<IAAvancada />} />
                                <Route path="/ia-avancada" element={<IAAvancada />} />
                                <Route path="/assistente" element={<IAAvancada />} />
                                <Route path="/ai" element={<IAAvancada />} />
                                <Route path="/remote" element={<RemoteControl />} />
                                <Route path="/controle-remoto" element={<RemoteControl />} />
                                <Route path="/iphone" element={<RemoteControl />} />
                                <Route path="/mobile" element={<MobileAccess />} />
                                <Route path="/acesso-mobile" element={<MobileAccess />} />
                                <Route path="/master-admin" element={<MasterAdminPanel />} />
                                <Route path="/login" element={<Cadastro />} />
                                <Route path="/cadastro" element={<Cadastro />} />
                                <Route path="/entrar" element={<Cadastro />} />
                                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                              <AIAssistant />
                            </BrowserRouter>
                            </AutoPunchWrapper>
                          </TooltipProvider>
                        </EditorProvider>
                      </CategoryProvider>
                    </CartProvider>
                  </ClientAreaProvider>
                </NotificationProvider>
              </TimesheetProvider>
            </TenantProvider>
          </MasterAdminProvider>
        </CompanyProvider>
      </LogoProvider>
    </AuthProvider>
    </PermissionsProvider>
    </AIProvider>
    </ThemeProvider>
  );
}

const App = () => {
  // Ensure React is fully loaded before rendering
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <ErrorBoundary>
      <AppWrapper />
    </ErrorBoundary>
  );
};

export default App;
