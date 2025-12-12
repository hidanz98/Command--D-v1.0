import React from "react";
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

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <div>Carregando...</div>;
  }

  return (
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
                                <Route path="/master-admin" element={<MasterAdminPanel />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/login-mobile" element={<LoginMobile />} />
                                <Route path="/cadastro" element={<Cadastro />} />
                                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                <Route path="*" element={<NotFound />} />
                              </Routes>
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
