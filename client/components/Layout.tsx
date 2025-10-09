import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderNew from "./HeaderNew";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import TimesheetNotifications from "./TimesheetNotifications";
import PayrollNotifications from "./PayrollNotifications";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowUp, Wifi, WifiOff } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const device = useDeviceDetection();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Páginas onde o Footer NÃO deve aparecer
  const hideFooterPages = ['/painel-admin', '/master-admin'];
  const shouldShowFooter = !hideFooterPages.includes(location.pathname);

  useEffect(() => {
    // Ensure dark mode is applied
    document.documentElement.classList.add("dark");

    // Add device-specific classes to body for CSS targeting
    document.body.className = `
      ${device.isMobile ? 'device-mobile' : ''}
      ${device.isTablet ? 'device-tablet' : ''}
      ${device.isDesktop ? 'device-desktop' : ''}
      ${device.touchSupport ? 'touch-device' : 'no-touch'}
      ${device.orientation === 'portrait' ? 'portrait' : 'landscape'}
    `.trim();

    // Scroll to top functionality
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [device]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-cinema-dark">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </div>
        </div>
      )}


      <HeaderNew />

      <main className={`${!isOnline ? 'pt-12' : ''}`}>
        {children}
      </main>

      {shouldShowFooter && <Footer />}

      {/* Conditional WhatsApp Float - only show on mobile/tablet */}
      {(device.isMobile || device.isTablet) && <WhatsAppFloat />}

      {/* Timesheet Notifications */}
      <TimesheetNotifications position={device.isMobile ? "top-left" : "top-right"} />

      {/* Payroll Notifications - Only for admins */}
      {isAdmin && (
        <PayrollNotifications
          isAdmin={isAdmin}
          position={device.isMobile ? "bottom-left" : "bottom-right"}
        />
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className={`fixed ${device.isMobile ? 'bottom-20 right-4' : 'bottom-8 right-8'} z-40 bg-cinema-yellow text-cinema-dark hover:bg-cinema-yellow-dark p-3 rounded-full shadow-lg transition-all duration-300`}
          size="sm"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
