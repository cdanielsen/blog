// @ts-check
import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"

import theme from "./src/lib/shiki-theme.mjs"

export default defineConfig({
  site: "https://www.hotmess.codes",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme,
    },
  },
})
