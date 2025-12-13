import React from 'react';
import { Button } from '@/components/ui/button';
import { useResponsiveTabs } from '@/hooks/use-responsive-tabs';

interface ResponsiveTab {
  id: string;
  name: string;
  icon: any;
  mobile?: boolean;
  desktop?: boolean;
  priority?: number;
  badge?: number;
  badgeColor?: string;
}

interface ResponsiveTabsProps {
  tabs: ResponsiveTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) => {
  const { getResponsiveTabs, getTabLayout } = useResponsiveTabs();
  
  const responsiveTabs = getResponsiveTabs(tabs);
  const layout = getTabLayout();

  return (
    <div className={`${layout.container} ${className}`}>
      {responsiveTabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "outline"}
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className={`
            ${layout.tab}
            ${activeTab === tab.id
              ? "bg-cinema-yellow text-cinema-dark"
              : "text-gray-300 border-cinema-gray-light hover:border-cinema-yellow hover:text-cinema-yellow"
            }
          `}
          data-edit-id={`sidebar.menu.${tab.id}`}
        >
          {layout.showIcons && <tab.icon className={layout.icon} data-edit-id={`sidebar.menu.${tab.id}.icon`} />}
          {layout.showLabels && <span data-edit-id={`sidebar.menu.${tab.id}.text`}>{tab.name}</span>}
          {tab.badge && tab.badge > 0 && (
            <span className={`ml-2 ${tab.badgeColor || 'bg-red-500'} text-white text-xs rounded-full h-4 w-4 flex items-center justify-center`} data-edit-id={`sidebar.menu.${tab.id}.badge`}>
              {tab.badge}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};

// Componente para abas em sidebar - Design moderno
export const ResponsiveSidebarTabs: React.FC<ResponsiveTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) => {
  const { getResponsiveTabs } = useResponsiveTabs();
  
  const responsiveTabs = getResponsiveTabs(tabs);

  return (
    <div className={`space-y-1 ${className}`}>
      {responsiveTabs.map((tab) => (
        <button
          key={tab.id}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
            ${activeTab === tab.id
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold shadow-lg shadow-amber-500/20"
              : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }
          `}
          onClick={() => onTabChange(tab.id)}
          data-edit-id={`sidebar.button.${tab.id}`}
        >
          <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-black' : 'text-zinc-400'}`} data-edit-id={`sidebar.icon.${tab.id}`} />
          <span data-edit-id={`sidebar.text.${tab.id}`}>{tab.name}</span>
          {tab.badge && tab.badge > 0 && (
            <span className={`ml-auto ${tab.badgeColor || 'bg-red-500'} text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
