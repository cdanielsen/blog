// @ts-check
import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"

import darcula from "./src/lib/shiki-darcula.mjs"

export default defineConfig({
  site: "https://www.hotmess.codes",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: darcula,
    },
  },
})
