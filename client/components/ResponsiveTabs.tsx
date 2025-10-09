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

// Componente para abas em sidebar (mobile)
export const ResponsiveSidebarTabs: React.FC<ResponsiveTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) => {
  const { getResponsiveTabs } = useResponsiveTabs();
  
  const responsiveTabs = getResponsiveTabs(tabs);

  return (
    <div className={`space-y-2 ${className}`}>
      {responsiveTabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          className={`
            w-full justify-start
            ${activeTab === tab.id
              ? "bg-cinema-yellow text-cinema-dark"
              : "text-white hover:text-cinema-yellow"
            }
          `}
          onClick={() => onTabChange(tab.id)}
          data-edit-id={`sidebar.button.${tab.id}`}
        >
          <tab.icon className="w-4 h-4 mr-2" data-edit-id={`sidebar.icon.${tab.id}`} />
          <span data-edit-id={`sidebar.text.${tab.id}`}>{tab.name}</span>
          {tab.badge && tab.badge > 0 && (
            <span className={`ml-auto ${tab.badgeColor || 'bg-red-500'} text-white text-xs rounded-full h-4 w-4 flex items-center justify-center`}>
              {tab.badge}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};
