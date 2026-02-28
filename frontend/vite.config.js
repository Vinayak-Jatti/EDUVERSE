import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use @/ as root src alias — e.g. import Button from "@/components/ui/Button"
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to backend during development — no CORS issues
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
