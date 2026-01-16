import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Permite acesso via rede local (WiFi)
    port: 8080,
    hmr: {
      host: "localhost",
      protocol: "ws",
      clientPort: 8080,
      overlay: false, // Disable Vite's error overlay to prevent dev overlay frame errors
    },
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    // Configure SPA fallback for development
    historyApiFallback: true,
  },
  build: {
    outDir: "dist/spa",
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress certain warnings
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
        warn(warning);
      },
    },
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    charset: "utf8",
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
