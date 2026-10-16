import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["fonts/Andika-Regular.ttf", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Heart words",
        short_name: "Heart words",
        description: "Grade 1 heart words, sight words, and a daily math sheet.",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f3ecdf",
        theme_color: "#f3ecdf",
        start_url: "/",
        id: "/",
        scope: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,ttf,png,webmanifest}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  test: {
    environment: "node",
  },
});
