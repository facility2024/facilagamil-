import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    client: { entry: "client.tsx" },
  },
  nitro: {
    preset: "node-server",
    output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/client" },
    handlers: [
      { route: "/health", handler: "./server/health.ts" },
      { route: "/api/email-marketing", handler: "./server/api-email-marketing.ts" },
      { route: "/api/track", handler: "./server/api-track.ts" },
      { route: "/api/track-stats", handler: "./server/api-track-stats.ts" },
      { route: "/api/settings", handler: "./server/api-settings.ts" },
    ],
  },
  vite: {
    build: {
      manifest: true,
    },
  },
});
