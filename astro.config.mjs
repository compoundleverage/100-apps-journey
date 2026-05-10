import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://100-apps-journey.vercel.app",
  vite: {
    plugins: [tailwindcss()],
  },
});
