import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://100-apps-journey.vercel.app",
  // SSR mode: pages render per request so query-string i18n (?lang=en) works.
  // OG endpoints opt back into static via `export const prerender = true`.
  output: "server",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
