
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Configurando o SWC para evitar uso de eval
      jsxImportSource: "@emotion/react",
      plugins: [
        ["@swc/plugin-emotion", {}]
      ]
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Adicionar configuração específica para evitar eval
  esbuild: {
    // Desativar minificação que pode introduzir eval
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: true,
  }
}));
