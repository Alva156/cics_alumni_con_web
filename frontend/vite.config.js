import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Ensure this points to the correct build directory
  },
  server: {
    historyApiFallback: true, // For local development routing
  },
});
