import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    client: { entry: "./src/client.tsx" },
  },
  nitro: {
    preset: "node-server",
    output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/client" },
  },
  vite: {
    build: {
      manifest: true,
    },
  },
});
