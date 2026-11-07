# blog

[hotmess.codes](https://www.hotmess.codes), built with [Astro](https://astro.build).

## Development

Requires Node 24 (`nvm use`).

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site -> dist/
npm run preview  # serve dist/
npm run check    # type-check
npm run format   # prettier
```

## Layout

- `content/blog/<slug>/index.md`: posts, served at `/<slug>/`
- `content/assets/`: images used by the site (headshot, icon source)
- `src/pages/`: index, post template (`[slug].astro`), about, 404, `rss.xml`
- `src/consts.ts`: site metadata, sidebar links, and the Admirees list
- `src/styles/typography.css`: static snapshot of the old Typography.js theme
- `public/`: copied as-is (resume, favicon, manifest, `sw.js`)

`public/sw.js` unregisters the service worker left behind by the old Gatsby
site. Keep it deployed for a while after the migration.
