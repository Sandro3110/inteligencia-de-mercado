// import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc"; // Removido - incompatível com Vite 7
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const plugins = [
  react(),
  tailwindcss(),
  /* jsxLocPlugin(), */ vitePluginManusRuntime(),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks (bibliotecas grandes)
          "react-vendor": ["react", "react-dom", "react/jsx-runtime"],
          "trpc-vendor": [
            "@trpc/client",
            "@trpc/react-query",
            "@tanstack/react-query",
          ],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
          ],
          // Charts e visualização
          charts: ["recharts", "chart.js"],
          // Excel e PDF
          export: ["xlsx", "jspdf", "jspdf-autotable"],
          // Utilitários
          utils: ["date-fns", "clsx", "tailwind-merge", "zod"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar limite para 1 MB
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
