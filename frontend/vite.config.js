import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    historyApiFallback: true, // Ensures Vite dev server handles client-side routing
  },
});
