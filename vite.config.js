import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During local dev, proxy /api to the Vercel-style functions running via
// `vercel dev` (recommended) — or run against Netlify with `netlify dev`,
// which already serves /api/* itself via the redirect in netlify.toml.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
