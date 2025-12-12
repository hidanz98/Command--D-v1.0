import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: "portrait" | "landscape";
  touchSupport: boolean;
  pixelRatio: number;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Initialize with default values
    const width = typeof window !== "undefined" ? window.innerWidth : 1920;
    const height = typeof window !== "undefined" ? window.innerHeight : 1080;
    const touchSupport =
      typeof window !== "undefined" && "ontouchstart" in window;
    const pixelRatio =
      typeof window !== "undefined" ? window.devicePixelRatio : 1;

    let deviceType: DeviceType = "desktop";
    if (width < 768) {
      deviceType = "mobile";
    } else if (width >= 768 && width < 1024) {
      deviceType = "tablet";
    }

    return {
      deviceType,
      isMobile: deviceType === "mobile",
      isTablet: deviceType === "tablet",
      isDesktop: deviceType === "desktop",
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? "landscape" : "portrait",
      touchSupport,
      pixelRatio,
    };
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const touchSupport = "ontouchstart" in window;
      const pixelRatio = window.devicePixelRatio;

      let deviceType: DeviceType = "desktop";
      if (width < 768) {
        deviceType = "mobile";
      } else if (width >= 768 && width < 1024) {
        deviceType = "tablet";
      }

      setDeviceInfo({
        deviceType,
        isMobile: deviceType === "mobile",
        isTablet: deviceType === "tablet",
        isDesktop: deviceType === "desktop",
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? "landscape" : "portrait",
        touchSupport,
        pixelRatio,
      });
    };

    // Update on mount
    updateDeviceInfo();

    // Update on resize
    window.addEventListener("resize", updateDeviceInfo);
    window.addEventListener("orientationchange", updateDeviceInfo);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

export function getResponsiveTextSize(deviceType: DeviceType) {
  return {
    hero:
      deviceType === "mobile"
        ? "text-4xl"
        : deviceType === "tablet"
          ? "text-5xl"
          : "text-6xl md:text-7xl lg:text-8xl",
    subtitle:
      deviceType === "mobile"
        ? "text-base"
        : deviceType === "tablet"
          ? "text-lg"
          : "text-xl md:text-2xl",
    heading:
      deviceType === "mobile"
        ? "text-2xl"
        : deviceType === "tablet"
          ? "text-3xl"
          : "text-4xl md:text-5xl",
    body:
      deviceType === "mobile"
        ? "text-sm"
        : deviceType === "tablet"
          ? "text-base"
          : "text-lg",
  };
}

export function getResponsiveSpacing(deviceType: DeviceType) {
  return deviceType === "mobile"
    ? "px-4"
    : deviceType === "tablet"
      ? "px-6"
      : "px-8";
}
