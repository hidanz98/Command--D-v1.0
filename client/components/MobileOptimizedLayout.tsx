import React, { ReactNode } from 'react';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  className?: string;
  enableSafeArea?: boolean;
  optimizeForTouch?: boolean;
  preventZoom?: boolean;
}

export default function MobileOptimizedLayout({ 
  children, 
  className,
  enableSafeArea = true,
  optimizeForTouch = true,
  preventZoom = true
}: MobileOptimizedLayoutProps) {
  const device = useDeviceDetection();

  // Mobile viewport meta configuration
  React.useEffect(() => {
    if (device.isMobile && preventZoom) {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }
    }
  }, [device.isMobile, preventZoom]);

  // Disable pull-to-refresh on mobile
  React.useEffect(() => {
    if (device.isMobile) {
      const preventPullToRefresh = (e: TouchEvent) => {
        const { target } = e;
        if (target instanceof Element && 
            target.closest('.scrollable') === null && 
            window.scrollY === 0) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchstart', preventPullToRefresh, { passive: false });
      document.addEventListener('touchmove', preventPullToRefresh, { passive: false });

      return () => {
        document.removeEventListener('touchstart', preventPullToRefresh);
        document.removeEventListener('touchmove', preventPullToRefresh);
      };
    }
  }, [device.isMobile]);

  const baseClasses = cn(
    'min-h-screen w-full',
    {
      // Safe area for notched devices
      'safe-area-top safe-area-bottom safe-area-left safe-area-right': enableSafeArea && device.isMobile,
      
      // Touch optimization
      'touch-target': optimizeForTouch && device.isMobile,
      
      // Mobile-specific classes
      'device-mobile': device.isMobile,
      'touch-device': device.isMobile || device.isTablet,
      'no-touch': !device.isMobile && !device.isTablet,
    },
    className
  );

  const containerClasses = cn(
    'w-full mx-auto',
    {
      // Mobile container optimizations
      'px-4': device.isMobile,
      'px-6': device.isTablet && !device.isMobile,
      'container': !device.isMobile && !device.isTablet,
    }
  );

  if (device.isMobile) {
    return (
      <div className={baseClasses}>
        <div className={containerClasses}>
          {children}
        </div>
        
        {/* Mobile-specific status bar background */}
        <div className="fixed top-0 left-0 right-0 h-safe-area-top bg-cinema-dark z-50 pointer-events-none" />
        
        {/* Mobile keyboard spacer */}
        <div className="h-16 md:h-0" />
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <div className={containerClasses}>
        {children}
      </div>
    </div>
  );
}

// Mobile-optimized card component
export function MobileCard({ 
  children, 
  className, 
  onClick, 
  ...props 
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const device = useDeviceDetection();
  
  const cardClasses = cn(
    'touch-card',
    'bg-cinema-gray/80 backdrop-blur-sm border border-cinema-gray-light rounded-lg',
    {
      'p-4': device.isMobile,
      'p-6': !device.isMobile,
      'cursor-pointer active:scale-98 transition-transform': onClick && device.isMobile,
      'hover:bg-cinema-gray/90': onClick && !device.isMobile,
    },
    className
  );

  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Mobile-optimized button wrapper
export function MobileButton({ 
  children, 
  className, 
  size = 'default',
  ...props 
}: {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const device = useDeviceDetection();
  
  const buttonClasses = cn(
    {
      'mobile-button-sm': size === 'sm',
      'mobile-button': size === 'default',
      'mobile-button-lg': size === 'lg',
    },
    className
  );

  return (
    <button 
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
}

// Mobile-optimized form input wrapper
export function MobileInput({ 
  className, 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const device = useDeviceDetection();
  
  const inputClasses = cn(
    'w-full rounded-lg border bg-background px-3 py-2 text-base transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
    {
      'h-12 px-4 text-base': device.isMobile,
      'h-10 px-3 text-sm': !device.isMobile,
    },
    className
  );

  return (
    <input 
      className={inputClasses}
      {...props}
    />
  );
}

// Mobile-optimized spacing utilities
export const MobileSpacing = {
  container: (device: ReturnType<typeof useDeviceDetection>) => 
    device.isMobile ? 'px-4 py-4' : 'px-6 py-6',
  
  section: (device: ReturnType<typeof useDeviceDetection>) => 
    device.isMobile ? 'mb-6' : 'mb-8',
  
  element: (device: ReturnType<typeof useDeviceDetection>) => 
    device.isMobile ? 'mb-4' : 'mb-6',
  
  text: (device: ReturnType<typeof useDeviceDetection>) => 
    device.isMobile ? 'text-sm leading-relaxed' : 'text-base leading-relaxed',
  
  heading: (device: ReturnType<typeof useDeviceDetection>) => 
    device.isMobile ? 'text-xl font-bold' : 'text-2xl font-bold',
  
  button: (device: ReturnType<typeof useDeviceDetection>) => 
    device.isMobile ? 'h-12 px-6 text-base' : 'h-10 px-4 text-sm',
};
