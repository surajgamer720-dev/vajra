import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import environment from "vite-plugin-environment";
import { VitePWA } from "vite-plugin-pwa";

const ii_url =
  process.env.DFX_NETWORK === "local"
    ? `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8081/`
    : `https://identity.internetcomputer.org/`;

process.env.II_URL = process.env.II_URL || ii_url;
process.env.STORAGE_GATEWAY_URL =
  process.env.STORAGE_GATEWAY_URL || "https://blob.caffeine.ai";

export default defineConfig({
  logLevel: "error",
  build: {
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    target: "es2020",
    // Increase chunk size warning threshold for PWA
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Deterministic filenames for better caching
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["@tanstack/react-router"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-motion": ["motion/react"],
          "vendor-ui": ["lucide-react"],
        },
      },
    },
  },
  css: {
    postcss: "./postcss.config.js",
  },
  optimizeDeps: {
    // Pre-bundle heavy deps to avoid waterfall on first load
    include: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "motion/react",
      "zustand",
      "lucide-react",
    ],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment(["II_URL"]),
    environment(["STORAGE_GATEWAY_URL"]),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "logo.png",
        "icons/icon-192.svg",
        "icons/icon-512.svg",
      ],
      manifest: {
        name: "Vajra - Activity Tracker",
        short_name: "Vajra",
        description: "Track your activities, build streaks, achieve goals",
        theme_color: "#1a1040",
        background_color: "#1a1040",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "/icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Quick Tap",
            short_name: "Tap",
            description: "Mark an activity done",
            url: "/quick-tap",
            icons: [
              {
                src: "/icons/icon-192.svg",
                sizes: "192x192",
                type: "image/svg+xml",
              },
            ],
          },
          {
            name: "My Streaks",
            short_name: "Streaks",
            description: "Open your streak dashboard",
            url: "/",
            icons: [
              {
                src: "/icons/icon-192.svg",
                sizes: "192x192",
                type: "image/svg+xml",
              },
            ],
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@dfinity/agent"],
  },
});
