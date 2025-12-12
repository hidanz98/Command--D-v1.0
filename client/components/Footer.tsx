import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Clock,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLogo } from "@/context/LogoContext";
import { useCompanySettings } from "@/context/CompanyContext";
import { useTenant } from "@/context/TenantContext";

export default function Footer() {
  const { currentLogo } = useLogo();
  const { companySettings } = useCompanySettings();
  const { currentTenant } = useTenant();

  const companyName =
    currentTenant?.name || companySettings.name || "Locadora de Equipamentos";
  const ownerData = currentTenant?.owner;
  const companyAddress = ownerData?.address || "Endereço não disponível";
  const companyPhone = ownerData?.phone || "Telefone não disponível";
  const companyEmail = ownerData?.email || "contato@locadora.com";

  return (
    <footer className="bg-cinema-dark-lighter border-t border-cinema-gray">
      {/* MOBILE VERSION - Hidden on md+ */}
      <div className="md:hidden px-4 py-8">
        {/* Logo centralizado */}
        <div className="flex justify-center mb-6">
          <img src={currentLogo} alt={companyName} className="h-12 w-auto" />
        </div>

        {/* Grid 2x2 para ações rápidas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={`tel:${companyPhone.replace(/\D/g, "")}`}
            className="flex items-center justify-center gap-2 bg-cinema-gray/30 hover:bg-cinema-gray/50 text-cinema-yellow py-3 px-4 rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">Ligar</span>
          </a>
          
          <a
            href={`https://wa.me/55${companyPhone.replace(/\D/g, "")}`}
            className="flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 py-3 px-4 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">WhatsApp</span>
          </a>
          
          <a
            href={`mailto:${companyEmail}`}
            className="flex items-center justify-center gap-2 bg-cinema-gray/30 hover:bg-cinema-gray/50 text-cinema-yellow py-3 px-4 rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Email</span>
          </a>
          
          <a
            href={`https://maps.google.com/maps?q=${encodeURIComponent(companyAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-cinema-gray/30 hover:bg-cinema-gray/50 text-cinema-yellow py-3 px-4 rounded-lg transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Mapa</span>
          </a>
        </div>

        {/* Redes sociais */}
        <div className="flex justify-center gap-6 mb-6">
          {currentTenant?.slug === "cabeca-efeito" ? (
            <a
              href="https://www.instagram.com/cabecadeefeito/"
              className="text-cinema-yellow hover:text-white transition-colors p-2 bg-cinema-gray/30 rounded-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="w-6 h-6" />
            </a>
          ) : (
            <>
              <a
                href="https://www.instagram.com/bilscinemavideo/"
                className="text-cinema-yellow hover:text-white transition-colors p-2 bg-cinema-gray/30 rounded-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.facebook.com/bilscinemaevideo/?locale=pt_BR"
                className="text-cinema-yellow hover:text-white transition-colors p-2 bg-cinema-gray/30 rounded-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com/@bilscinemaevideo"
                className="text-cinema-yellow hover:text-white transition-colors p-2 bg-cinema-gray/30 rounded-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </>
          )}
        </div>

        {/* Links rápidos em linha */}
        <div className="flex flex-wrap justify-center gap-4 text-sm mb-6">
          <Link to="/" className="text-gray-400 hover:text-cinema-yellow transition-colors">
            Início
          </Link>
          <Link to="/equipamentos" className="text-gray-400 hover:text-cinema-yellow transition-colors">
            Equipamentos
          </Link>
          <Link to="/sobre" className="text-gray-400 hover:text-cinema-yellow transition-colors">
            Sobre
          </Link>
          <Link to="/suporte" className="text-gray-400 hover:text-cinema-yellow transition-colors">
            Suporte
          </Link>
        </div>

        {/* Horários em card compacto */}
        <div className="bg-cinema-gray/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-cinema-yellow" />
            <span className="text-cinema-yellow font-semibold text-sm">Horários</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-center">
            <div className="bg-cinema-dark/50 rounded p-2">
              <p className="text-gray-400">Seg-Sex</p>
              <p className="text-white font-medium">07:00-21:00</p>
            </div>
            <div className="bg-cinema-dark/50 rounded p-2">
              <p className="text-gray-400">Sábado</p>
              <p className="text-white font-medium">08:00-14:00</p>
            </div>
            <div className="bg-cinema-dark/50 rounded p-2">
              <p className="text-gray-400">Domingo</p>
              <p className="text-white font-medium">Fechado</p>
            </div>
            <div className="bg-cinema-dark/50 rounded p-2">
              <p className="text-gray-400">Feriados</p>
              <p className="text-white font-medium">08:00-17:00</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center border-t border-cinema-gray/30 pt-4">
          <p className="text-gray-500 text-xs">© 2024 {companyName}</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/privacidade" className="text-gray-500 hover:text-cinema-yellow text-xs transition-colors">
              Privacidade
            </Link>
            <Link to="/termos" className="text-gray-500 hover:text-cinema-yellow text-xs transition-colors">
              Termos
            </Link>
          </div>
        </div>
      </div>

      {/* DESKTOP VERSION - Hidden on mobile, shown on md+ */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Contact Info & Address */}
            <div>
              <div className="flex items-center mb-6">
                <img src={currentLogo} alt={companyName} className="h-10 w-auto" />
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-cinema-yellow mt-0.5 flex-shrink-0" />
                  <p className="text-cinema-yellow">{companyAddress}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-cinema-yellow flex-shrink-0" />
                  <div>
                    <p className="text-cinema-yellow">{companyPhone}</p>
                    <p className="text-cinema-yellow text-sm">Telefone</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-cinema-yellow flex-shrink-0" />
                  <div>
                    <a
                      href={`https://wa.me/55${companyPhone.replace(/\D/g, "")}`}
                      className="text-cinema-yellow hover:text-white transition-colors"
                    >
                      {companyPhone}
                    </a>
                    <p className="text-cinema-yellow text-sm">WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email & Social Media */}
            <div>
              <h3 className="text-cinema-yellow font-semibold mb-4 text-sm">Contato Digital</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-cinema-yellow flex-shrink-0" />
                  <a
                    href={`mailto:${companyEmail}`}
                    className="text-cinema-yellow hover:text-white transition-colors text-xs"
                  >
                    {companyEmail}
                  </a>
                </div>
                <div>
                  <p className="text-cinema-yellow font-medium mb-2 text-xs">Siga-nos</p>
                  <div className="flex space-x-4">
                    {currentTenant?.slug === "cabeca-efeito" ? (
                      <a
                        href="https://www.instagram.com/cabecadeefeito/"
                        className="text-cinema-yellow hover:text-white transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    ) : (
                      <>
                        <a
                          href="https://www.instagram.com/bilscinemavideo/"
                          className="text-cinema-yellow hover:text-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="w-6 h-6" />
                        </a>
                        <a
                          href="https://www.facebook.com/bilscinemaevideo/?locale=pt_BR"
                          className="text-cinema-yellow hover:text-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Facebook className="w-6 h-6" />
                        </a>
                        <a
                          href="https://youtube.com/@bilscinemaevideo"
                          className="text-cinema-yellow hover:text-white transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Youtube className="w-6 h-6" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-cinema-yellow font-semibold mb-3 text-sm">Links Rápidos</h3>
                <ul className="space-y-1">
                  <li>
                    <Link to="/" className="text-cinema-yellow hover:text-white transition-colors text-xs">
                      Início
                    </Link>
                  </li>
                  <li>
                    <Link to="/equipamentos" className="text-cinema-yellow hover:text-white transition-colors text-xs">
                      Todos os Equipamentos
                    </Link>
                  </li>
                  <li>
                    <Link to="/sobre" className="text-cinema-yellow hover:text-white transition-colors text-xs">
                      Sobre Nós
                    </Link>
                  </li>
                  <li>
                    <Link to="/suporte" className="text-cinema-yellow hover:text-white transition-colors text-xs">
                      Suporte
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="text-cinema-yellow font-semibold mb-4 text-sm">Horários de Funcionamento</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-cinema-yellow mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-cinema-yellow font-medium mb-1 text-xs">Retirada e Devolução</p>
                    <div className="text-cinema-yellow text-xs space-y-1">
                      <p>Segunda à Sexta:<br />07:00 às 21:00</p>
                      <p>Sábado:<br />08:00 às 14:00</p>
                      <p>Domingo:<br />Fechado</p>
                      <p>Feriados:<br />08:00 às 17:00</p>
                    </div>
                  </div>
                </div>
                <div className="bg-cinema-gray/50 p-2 rounded-lg border border-cinema-gray-light text-center">
                  <p className="text-cinema-yellow font-medium text-xs mb-1">⚠️ Importante</p>
                  <p className="text-cinema-yellow text-xs">Agendamento prévio obrigatório.</p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div>
              <h3 className="text-cinema-yellow font-semibold mb-6">Nossa Localização</h3>
              <div className="relative">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(companyAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg border border-cinema-gray-light"
                  title={`Localização ${companyName}`}
                ></iframe>
              </div>
              <div className="mt-4">
                <a
                  href={`https://maps.google.com/maps?q=${encodeURIComponent(companyAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cinema-yellow hover:text-cinema-yellow-dark transition-colors text-sm flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Ver no Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-cinema-gray mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2024 {companyName}. Todos os direitos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacidade" className="text-gray-400 hover:text-cinema-yellow text-sm transition-colors">
                  Política de Privacidade
                </Link>
                <Link to="/termos" className="text-gray-400 hover:text-cinema-yellow text-sm transition-colors">
                  Termos de Uso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
