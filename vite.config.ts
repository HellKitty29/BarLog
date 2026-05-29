import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";

const projectRoot = process.cwd();

export default defineConfig({
  root: projectRoot,
  cacheDir: path.resolve(projectRoot, "node_modules", ".vite"),
  envPrefix: ["VITE_", "EXPO_PUBLIC_"],
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(projectRoot, "src"),
      "react-native": "react-native-web"
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
