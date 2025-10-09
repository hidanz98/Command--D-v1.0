import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Camera,
  Film,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  useDeviceDetection,
  getResponsiveTextSize,
  getResponsiveSpacing,
} from "@/hooks/use-device-detection";
import { useCompanySettings } from "@/context/CompanyContext";
import { useTenant } from "@/context/TenantContext";

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const device = useDeviceDetection();
  const textSizes = getResponsiveTextSize(device.deviceType);
  const spacing = getResponsiveSpacing(device.deviceType);
  const { companySettings } = useCompanySettings();
  const { currentTenant } = useTenant();

  // Get company name from current tenant or fallback to company settings
  const companyName =
    currentTenant?.name || companySettings.name || "Locadora de Equipamentos";

  useEffect(() => {
    // Only track mouse movement on desktop for performance
    if (!device.isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [device.isMobile]);

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${spacing}`}
    >
      {/* Device-aware background */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: device.isMobile
            ? `
              linear-gradient(135deg,
                rgba(10, 10, 10, 0.95) 0%,
                rgba(26, 26, 26, 0.9) 50%,
                rgba(10, 10, 10, 0.95) 100%)
            `
            : `
              radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
                rgba(255, 215, 0, 0.15) 0%,
                rgba(255, 215, 0, 0.05) 25%,
                transparent 50%),
              linear-gradient(135deg,
                rgba(10, 10, 10, 0.95) 0%,
                rgba(26, 26, 26, 0.9) 25%,
                rgba(10, 10, 10, 0.95) 50%,
                rgba(26, 26, 26, 0.9) 75%,
                rgba(10, 10, 10, 0.95) 100%),
              conic-gradient(from 0deg at 50% 50%,
                rgba(255, 215, 0, 0.1) 0deg,
                transparent 60deg,
                rgba(255, 215, 0, 0.05) 180deg,
                transparent 240deg,
                rgba(255, 215, 0, 0.1) 360deg)
            `,
        }}
      />

      {/* Device indicator and status (Hidden on mobile) */}
      {!device.isMobile && (
        <div className="absolute top-4 right-4 z-50 bg-cinema-gray/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-cinema-yellow flex items-center gap-2">
          {device.isTablet && <Tablet className="w-4 h-4" />}
          {device.isDesktop && <Monitor className="w-4 h-4" />}
          <span>{device.deviceType}</span>
          <span className="text-gray-400">|</span>
          <span>
            {device.screenWidth}x{device.screenHeight}
          </span>
        </div>
      )}

      {/* Responsive floating geometric shapes */}
      {!device.isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 border border-cinema-yellow/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-cinema-yellow/10 rotate-45 animate-spin-slow"></div>
          <div className="absolute bottom-32 left-20 w-16 h-16 bg-cinema-yellow/5 rounded-lg animate-bounce"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 border border-cinema-yellow/15 rounded-full animate-pulse delay-500"></div>
        </div>
      )}

      {/* Animated film strip overlays */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-12 bg-gradient-to-b from-cinema-yellow/30 via-transparent to-cinema-yellow/30 absolute left-8 animate-pulse"></div>
        <div className="h-full w-8 bg-gradient-to-b from-cinema-yellow/20 via-transparent to-cinema-yellow/20 absolute left-24 animate-pulse delay-700"></div>
        <div className="h-full w-12 bg-gradient-to-b from-cinema-yellow/30 via-transparent to-cinema-yellow/30 absolute right-8 animate-pulse delay-1000"></div>
        <div className="h-full w-8 bg-gradient-to-b from-cinema-yellow/20 via-transparent to-cinema-yellow/20 absolute right-24 animate-pulse delay-300"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cinema-yellow/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-8 animate-fade-in">
          {/* Dynamic main headline */}
          <div className="space-y-4">
            <h1
              className={`${textSizes.hero} font-bold leading-tight tracking-tight`}
            >
              <span
                className="block gradient-text opacity-0 animate-slide-up"
                style={{
                  animationDelay: "0.2s",
                  animationFillMode: "forwards",
                }}
              >
                {companyName}
              </span>
            </h1>
          </div>

          {/* Enhanced subtitle */}
          <div
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
          >
            <p
              className={`${textSizes.subtitle} text-gray-300 mb-8 ${device.isMobile ? "max-w-sm" : device.isTablet ? "max-w-2xl" : "max-w-4xl"} mx-auto leading-relaxed`}
            >
              {device.isMobile
                ? `Equipamentos profissionais para cinema e vídeo. Câmeras, lentes, monitores e muito mais.`
                : `Locação de equipamentos profissionais para fotografia, cinema e vídeo. São câmeras cinematográficas, fotográficas, lentes, monitores, estabilizadores de câmera, comando de foco, vídeo link, tripés e muitos outros acessórios.`}
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div
            className={`flex ${device.isMobile ? "flex-col space-y-4" : "flex-row space-x-4"} justify-center items-center opacity-0 animate-slide-up`}
            style={{ animationDelay: "1s", animationFillMode: "forwards" }}
          >
            <Link to="/equipamentos">
              <Button
                size={device.isMobile ? "default" : "lg"}
                className={`bg-cinema-yellow hover:bg-cinema-yellow-dark text-cinema-dark font-bold ${device.isMobile ? "px-6 py-3 text-base w-full" : "px-8 py-4 text-lg"} hover-glow group transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cinema-yellow/25`}
              >
                <Zap
                  className={`mr-2 ${device.isMobile ? "w-4 h-4" : "w-5 h-5"}`}
                />
                {device.isMobile ? "Ver Produtos" : "Ver Todos os Produtos"}
                <ArrowRight
                  className={`ml-2 ${device.isMobile ? "w-4 h-4" : "w-5 h-5"} group-hover:translate-x-2 transition-transform duration-300`}
                />
              </Button>
            </Link>

            {!device.isMobile && (
              <Link to="/carrinho">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-cinema-yellow text-cinema-yellow hover:bg-cinema-yellow hover:text-cinema-dark font-bold px-8 py-4 text-lg group transform hover:scale-105 transition-all duration-300"
                >
                  <Camera className="mr-2 w-5 h-5" />
                  Orçamento Rápido
                </Button>
              </Link>
            )}
          </div>

          {/* Enhanced animated stats */}
          <div
            className={`${device.isMobile ? "mt-12" : "mt-20"} opacity-0 animate-slide-up`}
            style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
          >
            <div
              className={`grid ${device.isMobile ? "grid-cols-1 gap-4" : device.isTablet ? "grid-cols-3 gap-6" : "grid-cols-3 gap-8 lg:gap-12"}`}
            >
              <div className="text-center group cursor-pointer">
                <div
                  className={`bg-cinema-gray/20 backdrop-blur-sm rounded-2xl stats-card ${device.isMobile ? "p-4" : "p-6"} border border-cinema-yellow/10 hover:border-cinema-yellow/30 transition-all duration-300 ${device.touchSupport ? "" : "transform hover:scale-105"}`}
                >
                  <div
                    className={`${device.isMobile ? "text-3xl" : "text-4xl md:text-5xl lg:text-6xl"} font-bold text-cinema-yellow mb-2 group-hover:scale-110 transition-transform duration-300`}
                  >
                    500+
                  </div>
                  <div
                    className={`text-gray-400 ${device.isMobile ? "text-xs" : "text-sm md:text-base"} font-medium`}
                  >
                    Equipamentos Disponíveis
                  </div>
                </div>
              </div>
              <div className="text-center group cursor-pointer">
                <div
                  className={`bg-cinema-gray/20 backdrop-blur-sm rounded-2xl stats-card ${device.isMobile ? "p-4" : "p-6"} border border-cinema-yellow/10 hover:border-cinema-yellow/30 transition-all duration-300 ${device.touchSupport ? "" : "transform hover:scale-105"}`}
                >
                  <div
                    className={`${device.isMobile ? "text-3xl" : "text-4xl md:text-5xl lg:text-6xl"} font-bold text-cinema-yellow mb-2 group-hover:scale-110 transition-transform duration-300`}
                  >
                    1000+
                  </div>
                  <div
                    className={`text-gray-400 ${device.isMobile ? "text-xs" : "text-sm md:text-base"} font-medium`}
                  >
                    Projetos Realizados
                  </div>
                </div>
              </div>
              <div className="text-center group cursor-pointer">
                <div
                  className={`bg-cinema-gray/20 backdrop-blur-sm rounded-2xl stats-card ${device.isMobile ? "p-4" : "p-6"} border border-cinema-yellow/10 hover:border-cinema-yellow/30 transition-all duration-300 ${device.touchSupport ? "" : "transform hover:scale-105"}`}
                >
                  <div
                    className={`${device.isMobile ? "text-3xl" : "text-4xl md:text-5xl lg:text-6xl"} font-bold text-cinema-yellow mb-2 group-hover:scale-110 transition-transform duration-300`}
                  >
                    5000+
                  </div>
                  <div
                    className={`text-gray-400 ${device.isMobile ? "text-xs" : "text-sm md:text-base"} font-medium`}
                  >
                    Jobs Realizados
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
