import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://100apps.local",
  vite: {
    plugins: [tailwindcss()],
  },
});
