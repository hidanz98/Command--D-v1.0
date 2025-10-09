import { useState, useEffect } from "react";

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  deviceType: "mobile" | "tablet" | "desktop";
  orientation: "portrait" | "landscape";
  pixelRatio: number;
  touchSupport: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        deviceType: "desktop",
        orientation: "landscape",
        pixelRatio: 1,
        touchSupport: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: width,
      screenHeight: height,
      deviceType: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
      orientation: width > height ? "landscape" : "portrait",
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    };
  });

  useEffect(() => {
    function updateDeviceInfo() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        deviceType: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
        orientation: width > height ? "landscape" : "portrait",
        pixelRatio: window.devicePixelRatio || 1,
        touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      });
    }

    // Update on resize
    window.addEventListener("resize", updateDeviceInfo);
    
    // Update on orientation change
    window.addEventListener("orientationchange", () => {
      // Delay to ensure dimensions are updated
      setTimeout(updateDeviceInfo, 100);
    });

    // Initial check
    updateDeviceInfo();

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Utility functions for responsive design
export const getResponsiveColumns = (deviceType: DeviceInfo["deviceType"]) => {
  switch (deviceType) {
    case "mobile":
      return "grid-cols-1";
    case "tablet":
      return "grid-cols-2";
    case "desktop":
      return "grid-cols-3 xl:grid-cols-4";
    default:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  }
};

export const getResponsiveSpacing = (deviceType: DeviceInfo["deviceType"]) => {
  switch (deviceType) {
    case "mobile":
      return "p-4 gap-4";
    case "tablet":
      return "p-6 gap-6";
    case "desktop":
      return "p-8 gap-8";
    default:
      return "p-4 md:p-6 lg:p-8 gap-4 md:gap-6 lg:gap-8";
  }
};

export const getResponsiveTextSize = (deviceType: DeviceInfo["deviceType"]) => {
  switch (deviceType) {
    case "mobile":
      return {
        hero: "text-3xl sm:text-4xl",
        title: "text-xl sm:text-2xl",
        subtitle: "text-base",
        body: "text-sm",
      };
    case "tablet":
      return {
        hero: "text-4xl md:text-5xl",
        title: "text-2xl md:text-3xl",
        subtitle: "text-lg",
        body: "text-base",
      };
    case "desktop":
      return {
        hero: "text-5xl lg:text-6xl xl:text-7xl",
        title: "text-3xl lg:text-4xl",
        subtitle: "text-xl",
        body: "text-lg",
      };
    default:
      return {
        hero: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
        title: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
        subtitle: "text-base md:text-lg xl:text-xl",
        body: "text-sm md:text-base lg:text-lg",
      };
  }
};
