import React, { useEffect, useState } from "react";
import { useMasterAdmin } from "../context/MasterAdminContext";
import { useTenant } from "../context/TenantContext";
import { useCompanySettings } from "../context/CompanyContext";
import { useLogo } from "../context/LogoContext";
import { Index } from "../pages/Index";
import Equipamentos from "../pages/Equipamentos";
import { ProductDetail } from "../pages/ProductDetail";
import { Carrinho } from "../pages/Carrinho";
import Login from "../pages/Login";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Building2, ExternalLink } from "lucide-react";
import { useLocation } from "react-router-dom";

interface TenantRouterProps {
  children: React.ReactNode;
}

export function TenantRouter({ children }: TenantRouterProps) {
  const { companies } = useMasterAdmin();
  const { currentTenant, switchTenant } = useTenant();
  const { updateCompanySettings } = useCompanySettings();
  const { updateLogo } = useLogo();
  const [isLoading, setIsLoading] = useState(true);
  const [tenantNotFound, setTenantNotFound] = useState(false);

  const location = useLocation();

  // Force apply theme immediately on mount
  useEffect(() => {
    detectAndSetTenant();
  }, [companies, location.pathname]);

  // Keep document-level data-tenant only on public routes
  useEffect(() => {
    const first = location.pathname.split("/").filter(Boolean)[0];
    const isPublic = !isSystemPath(first || "");

    if (isPublic && currentTenant?.slug) {
      document.documentElement.setAttribute("data-tenant", currentTenant.slug);
      document.body.setAttribute("data-tenant", currentTenant.slug);
      document.documentElement.offsetHeight;
    } else {
      document.documentElement.removeAttribute("data-tenant");
      document.body.removeAttribute("data-tenant");
      document.body.style.background = "";
    }
  }, [currentTenant, location.pathname]);

  const detectAndSetTenant = () => {
    setIsLoading(true);

    // Get current domain/subdomain
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Check for subdomain routing (e.g., bils.locadoras.com)
    const subdomainMatch = hostname.match(/^([^.]+)\.locadoras\.com$/);

    // Check for path-based routing (e.g., locadoras.com/bils)
    const pathMatch = pathname.match(/^\/([^\/]+)/);

    let tenantSlug: string | null = null;

    // Priority: subdomain > path > default
    if (subdomainMatch) {
      tenantSlug = subdomainMatch[1];
    } else if (pathMatch && !isSystemPath(pathMatch[1])) {
      tenantSlug = pathMatch[1];
    }

    if (tenantSlug) {
      // Find tenant by slug
      const tenant = companies.find(
        (company) => company.slug === tenantSlug && company.isActive,
      );

      if (tenant) {
        // Set tenant context
        switchTenant(tenant);

        // Apply tenant branding (update company name in shared settings)
        updateCompanySettings({
          name: tenant.name,
        });

        // Update logo (use tenant.logo if provided, otherwise generate initials SVG)
        const generateInitialsLogo = (
          name: string,
          bgColor = tenant.primaryColor,
          fgColor = tenant.secondaryColor || "#ffffff",
        ) => {
          const initials = name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          const svg = `
            <svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
              <rect width='100%' height='100%' fill='${bgColor}' />
              <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='160' fill='${fgColor}'>${initials}</text>
            </svg>`;
          return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        };

        if (tenant.logo) {
          updateLogo(tenant.logo);
        } else {
          const generated = generateInitialsLogo(tenant.name);
          updateLogo(generated);
        }

        // Update page title
        document.title = `${tenant.name} - Locação de Equipamentos`;

        // Update theme colors (apply to document only on public routes)
        const first = pathname.split("/").filter(Boolean)[0];
        const isPublic = !isSystemPath(first || "");
        updateThemeColors(tenant.primaryColor, tenant.secondaryColor, isPublic);

        setTenantNotFound(false);
      } else {
        setTenantNotFound(true);
      }
    } else {
      // No tenant specified - default to Cabeça de Efeito
      const defaultTenant = companies.find(
        (company) => company.slug === "cabeca-efeito" && company.isActive,
      );

      if (defaultTenant) {
        switchTenant(defaultTenant);

        updateCompanySettings({
          name: defaultTenant.name,
        });

        const generateInitialsLogo = (
          name: string,
          bgColor = defaultTenant.primaryColor,
          fgColor = defaultTenant.secondaryColor || "#ffffff",
        ) => {
          const initials = name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          const svg = `
            <svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
              <rect width='100%' height='100%' fill='${bgColor}' />
              <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='160' fill='${fgColor}'>${initials}</text>
            </svg>`;
          return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
        };

        if (defaultTenant.logo) {
          updateLogo(defaultTenant.logo);
        } else {
          const generated = generateInitialsLogo(defaultTenant.name);
          updateLogo(generated);
        }

        document.title = `${defaultTenant.name} - Locação de Equipamentos`;
        const first = pathname.split("/").filter(Boolean)[0];
        const isPublic = !isSystemPath(first || "");
        updateThemeColors(
          defaultTenant.primaryColor,
          defaultTenant.secondaryColor,
          isPublic,
        );

        setTenantNotFound(false);
      } else {
        setTenantNotFound(false);
      }
    }

    setIsLoading(false);
  };

  const isSystemPath = (path: string): boolean => {
    const systemPaths = [
      "master-admin",
      "demo",
      "templates",
      "login",
      "sobre",
      "termos",
      "privacidade",
      "suporte",
      "area-cliente",
      "painel-locadora",
      "cadastro-nativo",
    ];
    return systemPaths.includes(path);
  };

  const updateThemeColors = (
    primary: string,
    secondary: string,
    applyToDocument: boolean = true,
  ) => {
    const root = document.documentElement;

    // Convert hex to RGB for CSS variables
    const hexToRgb = (hex: string | undefined | null) => {
      if (!hex || typeof hex !== "string") return [245, 213, 51];
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [245, 213, 51]; // fallback to cinema-gold
    };

    const primaryRgb = hexToRgb(primary);
    const secondaryRgb = hexToRgb(secondary);

    // Update CSS custom properties
    root.style.setProperty(
      "--cinema-gold",
      `${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}`,
    );
    root.style.setProperty(
      "--cinema-dark",
      `${secondaryRgb[0]}, ${secondaryRgb[1]}, ${secondaryRgb[2]}`,
    );

    // Load persisted custom css if available
    const persistedCss = localStorage.getItem("tenant_custom_css");
    const persistedSlug = localStorage.getItem("tenant_current_slug");
    const persistedBg = localStorage.getItem("tenant_background");
    if (persistedCss || persistedSlug) {
      let el = document.getElementById(
        "applied-template-css",
      ) as HTMLStyleElement | null;
      if (!el) {
        el = document.createElement("style");
        el.id = "applied-template-css";
        document.head.appendChild(el);
      }
      if (persistedCss) el.innerHTML = persistedCss;
      if (applyToDocument && persistedSlug) {
        document.documentElement.setAttribute("data-tenant", persistedSlug);
        document.body.setAttribute("data-tenant", persistedSlug);
      }
      if (applyToDocument && persistedBg) {
        document.body.style.background = persistedBg;
      }
    } else {
      if (!applyToDocument) {
        document.documentElement.removeAttribute("data-tenant");
        document.body.removeAttribute("data-tenant");
        document.body.style.background = "";
      }
    }
  };

  const getTenantUrl = (tenant: any) => {
    if (tenant.settings?.customDomain) {
      return tenant.settings.customDomain;
    }
    return `https://${tenant.slug}.locadoras.com`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cinema-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-gold mx-auto mb-4"></div>
          <p className="text-white">Carregando locadora...</p>
        </div>
      </div>
    );
  }

  if (tenantNotFound) {
    return (
      <div className="min-h-screen bg-cinema-black flex items-center justify-center p-6">
        <Card className="bg-cinema-gray border-cinema-gray-light max-w-2xl">
          <CardHeader className="text-center">
            <Building2 className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
            <CardTitle className="text-2xl text-white">
              Locadora não encontrada
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-400">
              A locadora que você está tentando acessar não foi encontrada ou
              está inativa.
            </p>

            {companies.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Locadoras Disponíveis:
                </h3>
                <div className="grid gap-3">
                  {companies
                    .filter((c) => c.isActive)
                    .map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-3 bg-cinema-gray-light rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: company.primaryColor }}
                          >
                            {company.name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">
                            {company.name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const url = getTenantUrl(company);
                            window.open(url, "_blank", "noopener,noreferrer");
                          }}
                          className="bg-cinema-gold text-black hover:bg-yellow-500"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Acessar
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  // Navigate to demo without infinite loop
                  window.location.replace("/demo");
                }}
                className="border-cinema-gray-light text-white hover:bg-cinema-gray-light"
              >
                Ver Demo
              </Button>
              <Button
                onClick={() => {
                  // Navigate to home without infinite loop
                  window.location.replace("/");
                }}
                className="bg-cinema-gold text-black hover:bg-yellow-500"
              >
                Página Inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we have a current tenant, show tenant-specific content
  if (currentTenant) {
    const first = location.pathname.split("/").filter(Boolean)[0];
    const isPublic = !isSystemPath(first || "");
    return (
      <div
        className={isPublic ? "tenant-site" : "system-site"}
        {...(isPublic ? ({ "data-tenant": currentTenant.slug } as any) : {})}
      >
        {children}
      </div>
    );
  }

  // Default: show master site
  return <div className="master-site">{children}</div>;
}
