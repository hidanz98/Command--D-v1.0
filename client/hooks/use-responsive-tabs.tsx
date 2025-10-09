import { useState, useEffect } from 'react';

interface TabConfig {
  id: string;
  name: string;
  icon: any;
  mobile?: boolean;
  desktop?: boolean;
  priority?: number; // Para ordenar as abas por prioridade
  badge?: number;
  badgeColor?: string;
}

interface ResponsiveTabsConfig {
  mobile: TabConfig[];
  desktop: TabConfig[];
}

export function useResponsiveTabs() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // md breakpoint
      setIsTablet(width >= 768 && width < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getResponsiveTabs = (allTabs: TabConfig[]): TabConfig[] => {
    // Sempre mostrar todas as abas, independente do dispositivo
    return allTabs
      .filter(tab => tab.mobile !== false && tab.desktop !== false)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  };

  const getTabLayout = () => {
    if (isMobile) {
      return {
        container: "flex flex-col gap-2",
        tab: "w-full justify-start text-sm",
        icon: "w-4 h-4 mr-2",
        showLabels: true,
        showIcons: true
      };
    } else if (isTablet) {
      return {
        container: "flex flex-wrap gap-2",
        tab: "text-sm",
        icon: "w-4 h-4 mr-2",
        showLabels: true,
        showIcons: true
      };
    } else {
      return {
        container: "flex flex-wrap gap-2",
        tab: "text-sm",
        icon: "w-4 h-4 mr-2",
        showLabels: true,
        showIcons: false // Desktop: menos ícones, mais texto
      };
    }
  };

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    getResponsiveTabs,
    getTabLayout
  };
}
