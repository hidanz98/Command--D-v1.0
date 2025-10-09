import { ReactNode, forwardRef } from "react";
import { Button } from "./button";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { cn } from "@/lib/utils";

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "default" | "lg" | "xl";
  icon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  elevated?: boolean; // Adds elevation/shadow
  rounded?: boolean; // Extra rounded corners
  gradient?: boolean; // Gradient background
  pulse?: boolean; // Pulse animation
  children: ReactNode;
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({
    className,
    variant = "default",
    size = "default",
    icon,
    rightIcon,
    loading,
    fullWidth,
    elevated,
    rounded,
    gradient,
    pulse,
    children,
    disabled,
    ...props
  }, ref) => {
    const device = useDeviceDetection();

    // Size mappings for mobile optimization
    const sizeClasses = {
      sm: device.isMobile ? "h-10 px-4 text-sm" : "h-8 px-3 text-xs",
      default: device.isMobile ? "h-12 px-6 text-base" : "h-10 px-4 text-sm",
      lg: device.isMobile ? "h-14 px-8 text-lg" : "h-12 px-6 text-base",
      xl: device.isMobile ? "h-16 px-10 text-xl" : "h-14 px-8 text-lg",
    };

    // Enhanced styles for mobile
    const mobileEnhancements = device.isMobile ? {
      touchAction: "manipulation",
      WebkitTapHighlightColor: "transparent",
    } : {};

    return (
      <Button
        ref={ref}
        variant={variant}
        disabled={disabled || loading}
        style={mobileEnhancements}
        className={cn(
          // Base classes
          "relative font-medium transition-all duration-200 select-none",
          
          // Size classes
          sizeClasses[size],
          
          // Mobile-specific enhancements
          device.isMobile && [
            "touch-manipulation",
            "active:scale-95",
            "focus:scale-105"
          ],
          
          // Full width
          fullWidth && "w-full",
          
          // Elevation
          elevated && [
            "shadow-lg hover:shadow-xl",
            device.isMobile ? "shadow-md hover:shadow-lg" : ""
          ],
          
          // Rounded corners
          rounded && "rounded-xl",
          
          // Gradient effect
          gradient && variant === "default" && [
            "bg-gradient-to-r from-cinema-yellow to-yellow-400",
            "hover:from-cinema-yellow-dark hover:to-yellow-500"
          ],
          
          // Pulse animation
          pulse && "animate-pulse",
          
          // Disabled state
          (disabled || loading) && [
            "opacity-50 cursor-not-allowed",
            device.isMobile && "active:scale-100"
          ],
          
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-center gap-2 w-full">
          {loading ? (
            <>
              <div className={cn(
                "border-2 border-current border-t-transparent rounded-full animate-spin",
                device.isMobile ? "w-5 h-5" : "w-4 h-4"
              )} />
              <span>Carregando...</span>
            </>
          ) : (
            <>
              {icon && (
                <span className="flex-shrink-0">
                  {icon}
                </span>
              )}
              <span className="flex-1 text-center">
                {children}
              </span>
              {rightIcon && (
                <span className="flex-shrink-0">
                  {rightIcon}
                </span>
              )}
            </>
          )}
        </div>
      </Button>
    );
  }
);

TouchButton.displayName = "TouchButton";

// Specialized button variants
export const PrimaryTouchButton = forwardRef<HTMLButtonElement, Omit<TouchButtonProps, 'variant'>>(
  (props, ref) => (
    <TouchButton
      ref={ref}
      variant="default"
      elevated
      rounded
      gradient
      {...props}
    />
  )
);

PrimaryTouchButton.displayName = "PrimaryTouchButton";

export const SecondaryTouchButton = forwardRef<HTMLButtonElement, Omit<TouchButtonProps, 'variant'>>(
  (props, ref) => (
    <TouchButton
      ref={ref}
      variant="outline"
      elevated
      rounded
      {...props}
    />
  )
);

SecondaryTouchButton.displayName = "SecondaryTouchButton";

export const DangerTouchButton = forwardRef<HTMLButtonElement, Omit<TouchButtonProps, 'variant'>>(
  (props, ref) => (
    <TouchButton
      ref={ref}
      variant="destructive"
      elevated
      rounded
      {...props}
    />
  )
);

DangerTouchButton.displayName = "DangerTouchButton";

// Touch-optimized link button
interface TouchLinkButtonProps extends Omit<TouchButtonProps, 'onClick'> {
  href: string;
  external?: boolean;
  replace?: boolean;
}

export function TouchLinkButton({
  href,
  external,
  replace,
  children,
  ...props
}: TouchLinkButtonProps) {
  const device = useDeviceDetection();

  const handleClick = () => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      if (replace) {
        window.location.replace(href);
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <TouchButton
      onClick={handleClick}
      {...props}
    >
      {children}
    </TouchButton>
  );
}

// Action button group for mobile
interface TouchButtonGroupProps {
  children: ReactNode;
  direction?: "horizontal" | "vertical";
  spacing?: "sm" | "default" | "lg";
  className?: string;
}

export function TouchButtonGroup({
  children,
  direction = "horizontal",
  spacing = "default",
  className
}: TouchButtonGroupProps) {
  const device = useDeviceDetection();

  const spacingClasses = {
    sm: device.isMobile ? "gap-2" : "gap-1",
    default: device.isMobile ? "gap-3" : "gap-2",
    lg: device.isMobile ? "gap-4" : "gap-3",
  };

  return (
    <div className={cn(
      "flex",
      direction === "vertical" || device.isMobile ? "flex-col" : "flex-row",
      spacingClasses[spacing],
      device.isMobile && "w-full",
      className
    )}>
      {children}
    </div>
  );
}

// Floating Action Button (FAB)
interface FloatingActionButtonProps extends Omit<TouchButtonProps, 'size'> {
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  offset?: "default" | "safe"; // Safe area offset for notched devices
}

export function FloatingActionButton({
  position = "bottom-right",
  offset = "default",
  className,
  children,
  ...props
}: FloatingActionButtonProps) {
  const device = useDeviceDetection();

  const positionClasses = {
    "bottom-right": offset === "safe" ? "bottom-safe-4 right-safe-4" : "bottom-4 right-4",
    "bottom-left": offset === "safe" ? "bottom-safe-4 left-safe-4" : "bottom-4 left-4",
    "bottom-center": offset === "safe" ? "bottom-safe-4 left-1/2 transform -translate-x-1/2" : "bottom-4 left-1/2 transform -translate-x-1/2",
  };

  return (
    <TouchButton
      className={cn(
        "fixed z-50 shadow-2xl",
        device.isMobile ? "w-14 h-14" : "w-12 h-12",
        "rounded-full",
        "bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark",
        positionClasses[position],
        className
      )}
      {...props}
    >
      {children}
    </TouchButton>
  );
}

// Quick action bar for mobile
interface QuickActionBarProps {
  children: ReactNode;
  position?: "top" | "bottom";
  className?: string;
}

export function QuickActionBar({
  children,
  position = "bottom",
  className
}: QuickActionBarProps) {
  const device = useDeviceDetection();

  if (!device.isMobile) return null;

  return (
    <div className={cn(
      "fixed left-0 right-0 z-40 bg-cinema-dark-lighter/95 backdrop-blur-sm border-t border-cinema-gray-light p-4",
      position === "bottom" ? "bottom-0 safe-area-bottom" : "top-0 safe-area-top",
      className
    )}>
      <div className="flex gap-3 max-w-sm mx-auto">
        {children}
      </div>
    </div>
  );
}
