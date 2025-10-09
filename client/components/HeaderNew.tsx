import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, ShoppingCart, User, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoryContext";
import { useLogo } from "@/context/LogoContext";
import { useCompanySettings } from "@/context/CompanyContext";
import { useLocation } from "react-router-dom";
import { useInlineEditor } from "@/components/InlineEditor";

export default function HeaderNew() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { state } = useCart();
  const { isAuthenticated, isAdmin, isInitialized, logout } = useAuth();
  const { state: editorState, toggleEditor } = useInlineEditor();
  const { getActiveCategories, getActiveSubcategories } = useCategories();
  const { currentLogo } = useLogo();
  const { companySettings } = useCompanySettings();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-cinema-dark-lighter border-b border-cinema-gray sticky top-0 z-40" data-edit-id="header.bar">
      <div className="container mx-auto px-4" data-edit-id="header.container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0" data-edit-id="header.logo-container">
            <img
              src={currentLogo}
              alt={companySettings.name}
              className="h-10 w-auto hover:opacity-80 transition-opacity duration-300"
              data-edit-id="header.logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10 ml-6">
            <Link
              to="/"
              className="text-white hover:text-cinema-yellow transition-colors"
              data-edit-id="header.nav.home"
            >
              <span data-edit-id="header.nav.home-text">Início</span>
            </Link>
            <Link
              to="/equipamentos"
              className="text-white hover:text-cinema-yellow transition-colors"
              data-edit-id="header.nav.equipment"
            >
              <span data-edit-id="header.nav.equipment-text">Equipamentos</span>
            </Link>
            <Link
              to="/suporte"
              className="text-white hover:text-cinema-yellow transition-colors"
              data-edit-id="header.nav.support"
            >
              <span data-edit-id="header.nav.support-text">Suporte</span>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-6" data-edit-id="header.search-container">
            <form className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" data-edit-id="header.search-icon" />
              <Input
                type="search"
                placeholder="Buscar equipamentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-cinema-gray border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow"
                data-edit-id="header.search-input"
              />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-1 ml-2"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Desktop Actions - Conditional based on auth */}
            <div className="hidden lg:flex items-center space-x-4">
              {!isAuthenticated ? (
                // Not logged in - show login button
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-cinema-yellow"
                  >
                    <User className="w-4 h-4 mr-2" />
                    LOGIN
                  </Button>
                </Link>
              ) : (
                // Logged in - show appropriate buttons
                <>
                  {isAdmin && (
                    <>
                      <Link to="/painel-admin">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:text-cinema-yellow"
                          data-edit-id="header.admin-button"
                        >
                          <User className="w-4 h-4 mr-2" data-edit-id="header.admin-icon" />
                          <span data-edit-id="header.admin-text">Painel Admin</span>
                        </Button>
                      </Link>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-white hover:text-cinema-yellow ${
                          editorState.isActive ? 'bg-green-600 hover:bg-green-700' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Header button clicked, current state:', editorState.isActive);
                          console.log('toggleEditor function:', toggleEditor);
                          try {
                            toggleEditor();
                            console.log('toggleEditor called successfully');
                          } catch (error) {
                            console.error('Error calling toggleEditor:', error);
                          }
                        }}
                        data-edit-id="header.editor-button"
                      >
                        <Edit className="w-4 h-4 mr-2" data-edit-id="header.editor-icon" />
                        <span data-edit-id="header.editor-text">{editorState.isActive ? 'Sair Editor' : 'Editor Inline'}</span>
                      </Button>
                    </>
                  )}
                  
                  <Link to="/area-cliente">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-cinema-yellow"
                      data-edit-id="header.client-area-button"
                    >
                      <User className="w-4 h-4 mr-2" data-edit-id="header.client-area-icon" />
                      <span data-edit-id="header.client-area-text">Área Cliente</span>
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-cinema-yellow"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    data-edit-id="header.logout-button"
                  >
                    <span data-edit-id="header.logout-text">Sair</span>
                  </Button>
                </>
              )}

              <Link to="/carrinho">
                <Button
                  size="sm"
                  className="text-white hover:text-cinema-yellow font-semibold relative"
                  variant="ghost"
                  data-edit-id="header.cart-button"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" data-edit-id="header.cart-icon" />
                  <span data-edit-id="header.cart-text">Carrinho</span>
                  {state.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" data-edit-id="header.cart-badge">
                      {state.itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
