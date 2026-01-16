import "./global.css";
import "./suppressDevWarnings";
import { createRoot } from "react-dom/client";
import App from "./App";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.endsWith(".local");

// Em localhost/dev, desativar e limpar Service Worker e cache
if (isLocalhost && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => {
      return Promise.all(registrations.map((registration) => registration.unregister()));
    })
    .catch(() => undefined);

  if ("caches" in window) {
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => undefined);
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root only once
const root = createRoot(rootElement);
root.render(<App />);

// Registrar Service Worker somente em produção (nunca em localhost/dev)
if (import.meta.env.PROD && !isLocalhost && "serviceWorker" in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Verificar atualizações periodicamente
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // A cada hora
      })
      .catch((error) => {
        console.log('❌ Erro ao registrar Service Worker:', error);
      });
  });
}