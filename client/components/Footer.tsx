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

  // Get company data from current tenant or fallback
  const companyName =
    currentTenant?.name || companySettings.name || "Locadora de Equipamentos";
  const ownerData = currentTenant?.owner;
  const companyAddress = ownerData?.address || "Endereço não disponível";
  const companyPhone = ownerData?.phone || "Telefone não disponível";
  const companyEmail = ownerData?.email || "contato@locadora.com";

  return (
    <footer className="bg-cinema-dark-lighter border-t border-cinema-gray">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Info & Address */}
          <div>
            <div className="flex items-center mb-6">
              <img
                src={currentLogo}
                alt={companyName}
                className="h-10 w-auto"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-cinema-yellow mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-cinema-yellow">{companyAddress}</p>
                </div>
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
            <h3 className="text-cinema-yellow font-semibold mb-4 text-sm">
              Contato Digital
            </h3>
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
                <p className="text-cinema-yellow font-medium mb-2 text-xs">
                  Siga-nos
                </p>
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

            {/* Quick Links */}
            <div className="mt-6">
              <h3 className="text-cinema-yellow font-semibold mb-3 text-sm">
                Links Rápidos
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/"
                    className="text-cinema-yellow hover:text-white transition-colors text-xs"
                  >
                    Início
                  </Link>
                </li>
                <li>
                  <Link
                    to="/equipamentos"
                    className="text-cinema-yellow hover:text-white transition-colors text-xs"
                  >
                    Todos os Equipamentos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sobre"
                    className="text-cinema-yellow hover:text-white transition-colors text-xs"
                  >
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link
                    to="/suporte"
                    className="text-cinema-yellow hover:text-white transition-colors text-xs"
                  >
                    Suporte
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-cinema-yellow font-semibold mb-4 text-sm">
              Horários de Funcionamento
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-cinema-yellow mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-cinema-yellow font-medium mb-1 text-xs">
                    Retirada e Devolução
                  </p>
                  <div className="text-cinema-yellow text-xs space-y-1">
                    <p>
                      <span className="text-cinema-yellow">
                        Segunda à Sexta:
                      </span>
                      <br />
                      07:00 às 21:00
                    </p>
                    <p>
                      <span className="text-cinema-yellow">Sábado:</span>
                      <br />
                      08:00 às 14:00
                    </p>
                    <p>
                      <span className="text-cinema-yellow">Domingo:</span>
                      <br />
                      Fechado
                    </p>
                    <p>
                      <span className="text-cinema-yellow">Feriados:</span>
                      <br />
                      08:00 às 17:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-cinema-gray/50 p-2 rounded-lg border border-cinema-gray-light text-center">
                <p className="text-cinema-yellow font-medium text-xs mb-1">
                  ⚠️ Importante
                </p>
                <p className="text-cinema-yellow text-xs">
                  Agendamento prévio obrigatório.
                </p>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div>
            <h3 className="text-cinema-yellow font-semibold mb-6">
              Nossa Localização
            </h3>
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
                title={`Localização ${companyName} - ${companyAddress}`}
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
            <p className="text-gray-400 text-sm">
              © 2024 {companyName}. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/privacidade"
                className="text-gray-400 hover:text-cinema-yellow text-sm transition-colors"
              >
                Política de Privacidade
              </Link>
              <Link
                to="/termos"
                className="text-gray-400 hover:text-cinema-yellow text-sm transition-colors"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
