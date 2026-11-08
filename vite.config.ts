import { defineConfig } from "vite";
import { serviceWorker } from "./scripts/service-worker.mjs";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [serviceWorker()],
});
