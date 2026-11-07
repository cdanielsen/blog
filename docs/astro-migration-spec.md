# hotmess.codes — Astro Migration Spec

Requirements for porting the site from Gatsby 2 to Astro with feature parity. "Parity" means a visitor (or feed reader, or search engine) should not notice anything broke; visual output should match closely, not pixel-perfectly.

Reference: the current Gatsby implementation as of `e096f93`.

---

## 1. Site metadata

Single source of truth (e.g. `src/consts.ts`), replacing `gatsby-config.js#siteMetadata`:

| Key | Value |
|---|---|
| title | `hotmess.codes` |
| masthead | `{} - [] === -0` |
| author | `Christian Danielsen` |
| description | `Evangalism from the JavaScript pulpit` (sic; keep unless told otherwise) |
| siteUrl | `https://www.hotmess.codes` |
| twitter | `CKDanielsen` |
| lang | `en` |

---

## 2. Content

### 2.1 Posts

- Source: `content/blog/<slug>/index.md` (7 posts). Must be loaded via an Astro content collection (glob loader) **without changing post files**, except for the splash-image fix in §2.3.
- Colocated non-markdown files (e.g. `testing-stream-code/stream-test.spec.js`) must not be treated as posts.
- Frontmatter schema (validate with zod):

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | |
| `author` | string | yes | Rendered in byline (currently always "Christian") |
| `date` | ISO datetime string | yes | Coerce to `Date` |
| `description` | string | no | Falls back to excerpt |
| `splashUrl` | URL string | no | |
| `splashAuthor` | string | no | |
| `splashAuthorUrl` | URL string | no | |

### 2.2 Slugs and URLs

- Post URL = `/<directory-name>/` (trailing slash), e.g. `/stream-pipelines/`. **Existing URLs must not change.**
- Internal links in posts (`/on-streams-and-promises`, `/testing-stream-code`, `/about`) must keep resolving. Configure trailing slashes so both `/x` and `/x/` work on the host.
- Sort order: everywhere, by `date` descending.

### 2.3 Splash images (known breakage)

- Every post's `splashUrl` points at `source.unsplash.com`, which was shut down in 2024. These images are **broken in production today**.
- Requirement: replace each with a working image URL (`images.unsplash.com/photo-…` permalinks) or download into the post folder and use Astro `<Image>`. Keep credit fields as is.
- `to-hunt-a-killer-bug` has a mismatched `splashAuthorUrl` (points at Marc Wieland). Flag it; fix only if confirmed.

### 2.4 Excerpts

- Index cards and the meta description use `description`, falling back to an auto excerpt.
- Excerpt = plain text of the rendered body, truncated to about 140 chars on the index / 160 for meta, with an ellipsis. Gatsby's exact truncation does not need to match.

---

## 3. Markdown rendering

Parity with the `gatsby-transformer-remark` plugin chain:

| Gatsby plugin | Requirement | Astro approach |
|---|---|---|
| `gatsby-remark-prismjs` | Fenced code blocks highlighted. Languages in use: `js`, `ts`, `tsx`, `sh`, `toml`, `css`, plus unlabeled fences. Dark theme (currently Prism **Darcula**). Inline code is **not** highlighted. | Built-in Shiki with a dark theme close to Darcula (e.g. `dracula` or `one-dark-pro`), or Prism if a closer match matters |
| `gatsby-remark-smartypants` | Curly quotes, en/em dashes, ellipses | Built-in (`smartypants: true` is the default) |
| `gatsby-remark-images` | Responsive images, max width 590px | No posts currently embed images. Use Astro's built-in markdown image handling |
| `gatsby-remark-responsive-iframe` | Responsive iframes | No posts use iframes. Drop, but CSS-constrain `iframe { max-width: 100% }` |
| `gatsby-remark-copy-linked-files` | Copy linked local files | No posts use it. Drop |

Also:
- Raw inline HTML in markdown must pass through (e.g. `<a name="guide"></a>` anchor in the fullstack post, target of `#guide`).
- Emoji shortcodes: `:scream:` appears in `to-hunt-a-killer-bug` and currently renders **literally**. Parity means leaving it; optionally add `remark-emoji` (decide).
- Code blocks need bottom margin (`28px`, from `.gatsby-highlight`) and horizontal scroll on overflow.

---

## 4. Pages and routes

### 4.1 `/`: index (blog list)

- `<title>`: `All posts | hotmess.codes`
- **Two-column layout** (index only), container max-width ≈ `rhythm(35)` (~1050px at the current base):
  - Left: **Nav sidebar** (§5.1), min-width 125px, `margin-right: 3rem`.
  - Right: separated by a `0.5px solid` left border with 50px left padding, containing:
    - **Index header**: `<h1>` masthead (`{} - [] === -0`) linking to `/`, centered, larger scale. `<h4>` site description beneath, centered.
    - Post list, each item: `<h3>` title link to the post URL. `<small>` date formatted `MMMM DD, YYYY` (e.g. `July 09, 2020`, zero-padded day). `<p>` description or excerpt.
- Mobile: the current layout is a non-wrapping flex row (cramped on phones). Parity minimum = same behavior. **Recommended**: stack the sidebar above or below the content under ~640px (commit 68e521e intended "improve mobile layout").

### 4.2 `/<slug>/`: blog post

Single-column layout, max-width ≈ `rhythm(32)` (~960px).

1. **Non-index header**: `<h1>` site title `hotmess.codes` in Montserrat, centered, linking to `/`.
2. Splash image (if `splashUrl`), full content width, no bottom margin.
3. Photo credit (if `splashAuthor`): centered, `0.5rem` font, "Photo by [author](url)", opening in a new tab with `rel="noopener noreferrer"`.
4. `<h2>` post title.
5. Byline row (flex, centered vertically, slightly smaller scale): `"{date} by {author}"` followed by an inline headshot sized `rhythm(1.5)` square.
6. Rendered post body.
7. `<hr>`.
8. Prev/next nav (`ul`, flex, `space-between`, no bullets):
   - Left: `← {older post title}` with `rel="prev"` (absent on the oldest post).
   - Right: `{newer post title} →` with `rel="next"` (absent on the newest post).
9. Footer: centered, `x-small`: `©{current year} Christian Danielsen. All Rights Reserved.` (year at build time is acceptable).

Meta: title `{post title} | hotmess.codes`; description = frontmatter `description` or excerpt.

### 4.3 `/about/`

Single-column layout with the non-index header. Content copied **verbatim** (including "Pacfic" typo unless told otherwise):
- Headshot centered, width `rhythm(10)`, auto height.
- "Hello!" section, resume link "credentials" (`/resume.pdf`, new tab), mailto "get in touch!" with subject `Ahoy, Christian!`.
- "(In)Frequently Asked Questions" with the two Q&As (HotMess trail name; wat-talk masthead).
- Current page has **no `<title>`/SEO component**. Add `About | hotmess.codes` (minor improvement, low risk).

### 4.4 `/404`

- Title `404: Not Found | hotmess.codes`.
- Non-index layout. `<h1>Not Found</h1>`, text: "Well s***, this page does not exist. [@](http://twitter.com/ckdanielsen) me if you think it should."
- Must be emitted as `404.html` so the host serves it.

### 4.5 Static files (copy into `public/`)

- `/resume.pdf` (linked from sidebar and about)
- `/favicon.ico`
- `/robots.txt` (allow all)

### 4.6 Legacy routes

- `/resume` (removed page, likely still indexed) → redirect to `/resume.pdf`. Implement via host redirect config or Astro `redirects`.

---

## 5. Components

### 5.1 Nav sidebar (index page only)

Vertical column:
1. Headshot (`content/assets/headshot.png`), centered, `rhythm(4)` square, alt "Christian Danielsen".
2. `<h4>` "This Guy" → `/about`, centered.
3. `<h4>` "Resume" → `/resume.pdf`, `target="_blank"`, centered.
4. **Icon box** (§5.2).
5. `<h4>` "Admirees" + one link per line, centered:

| Name (verbatim, typos included) | URL |
|---|---|
| Jake Archibald | https://www.jakearchibald.com |
| Flavio Copes | https://flaviocopes.com/ |
| Tania Rascia | https://www.taniarascia.com/ |
| Jim Fisher | https://jameshfisher.com/ |
| Dave Cedia | https://daveceddia.com/ |
| Julia Evans | https://jvns.ca/ |
| Sarah Drasner | https://sarah.dev/ |
| Juliette Pretot | https://juliette.sh/ |
| Vivki Boykis | https://vicki.substack.com/ |
| Sindre Sorhus | https://sindresorhus.com/ |

(Typos "Dave Cedia" → Ceddia, "Vivki" → Vicki: fix only if confirmed.)

**Shuffle requirement**: order is randomized **on each page load in the browser**. Server-rendered HTML lists them in the order above; a small inline client script shuffles the DOM nodes **as a unit (name + link together)** after load. This must never desync names from hrefs (see post `to-hunt-a-killer-bug`). No framework island needed. Unbiased shuffle (Fisher–Yates).

### 5.2 Icon box

Row of icon links, flex wrap, `space-around`, 20px bottom padding, `0.5px solid` bottom border, icons `1.75rem`, `color: inherit`, 5px padding. **Also shuffled client-side on load**, same rules as §5.1.

| Icon | Link |
|---|---|
| Twitter (FA) | http://twitter.com/ckdanielsen |
| GitHub (FA) | http://github.com/cdanielsen |
| LinkedIn (FA `LinkedinIn`) | http://linkedin.com/in/christiandanielsen |
| Paper plane (Ionicons `IoIosPaperPlane`) | mailto:ckdanielsen@gmail.com |
| RSS square (FA) | https://www.hotmess.codes/rss.xml |
| DEV (FA) | https://dev.to/cdanielsen |

- Render as inline SVG at build time (e.g. `astro-icon` with `@iconify-json/fa6-brands`/`fa6-solid`/`ion`, or hand-copied SVGs). No React runtime.
- Add an `aria-label` per link (currently missing; accessibility improvement).
- Decide: Twitter bird vs X logo, and whether to keep Twitter at all.

### 5.3 Headers

- Index header and non-index header as in §4.1 / §4.2.
- Current code supports `includeHeader={false}`, but nothing uses it. Drop.

### 5.4 SEO head (all pages)

`<html lang="en">`, `<title>` via template `%s | hotmess.codes`, plus:

- `meta[name=description]`
- `og:title`, `og:description`, `og:type=website`
- `twitter:card=summary`, `twitter:creator` (currently set to author name; better: `@CKDanielsen`), `twitter:title`, `twitter:description`
- Link to the RSS feed: `<link rel="alternate" type="application/rss+xml">` (currently injected by gatsby-plugin-feed)
- Manifest link and favicon/icons (§7)
- Recommended additions: `<link rel="canonical">`, `og:url`, `og:image` (splash) on posts.

### 5.5 Unused: do not port

- `src/components/bio.js` is never imported.
- `.resume__*` CSS classes are leftovers from the removed resume page.

---

## 6. Typography and styling

- Current look = `typography-theme-wordpress-2016` (Typography.js):
  - Body: **Merriweather** serif, base ~16px with line-height 1.75; headings: **Montserrat** sans (h1 uses Merriweather in theme except where overridden, so match the generated CSS from the current build).
  - Vertical rhythm unit `rhythm(1)` ≈ `1.75rem`. `scale()` modular scale for h1/byline.
  - Links: theme default color (`#007acc`), **no underline, no box-shadow** (global override).
  - Blockquote, `hr`, list styles from the theme.
- Requirement: replace Typography.js with a **static CSS file** reproducing the theme. Easiest route: copy the computed `<style id="typography.js">` from the current `public/index.html` build output as the starting point, then trim.
- Fonts: self-host via `@fontsource/merriweather` and `@fontsource/montserrat` (replacing deprecated `typeface-*`). Weights used: Merriweather 400/400i/700/900, Montserrat 400/700/900 (verify against built CSS).
- Global overrides to carry over: `ul { margin-block-start: 10px; padding-inline-start: 20px }`, `a { text-decoration: none; box-shadow: none }`, code block margin.
- Replace inline `style={{}}` with scoped Astro `<style>` blocks. No CSS framework needed.
- Dark mode: not present today (out of scope unless requested).

---

## 7. Feeds, PWA, analytics

### 7.1 RSS: `/rss.xml` (must keep URL; feed readers subscribe to it)

Via `@astrojs/rss`:
- Channel title `hotmess.codes RSS`, description = site description, link = siteUrl.
- Items sorted by date desc: `title`, `description` (frontmatter description or excerpt; current feed uses excerpt), `link` = `siteUrl + /slug/`, `guid` = same URL (**must be byte-identical to current guids**, e.g. `https://www.hotmess.codes/to-hunt-a-killer-bug/`, so readers don't re-surface old posts), `pubDate`.
- Optional: include full HTML content (`content:encoded`); current feed does not.

### 7.2 Web manifest / icons

- Current config is duplicated. The effective result is `manifest.webmanifest` with name `hotmess.codes`, short_name `hotmess`, icon generated from `src/images/tyler.jpg` (various sizes), plus leftover starter values (`theme_color #663399`, `background_color #ffffff`, `display minimal-ui`).
- Requirement: static `public/manifest.webmanifest` + a few pre-generated icon PNGs (192, 512, apple-touch 180) from `tyler.jpg`. Drop the Gatsby-starter values or set sane ones.

### 7.3 Service worker: **critical**

- `gatsby-plugin-offline` registered a Workbox service worker at `/sw.js`. Returning visitors' browsers will keep serving the **cached Gatsby site** unless it is removed.
- Requirement: ship a **self-unregistering `/sw.js`** at the same path (`self.addEventListener('install', () => self.skipWaiting())`; on `activate`: clear all caches, `self.registration.unregister()`, reload open clients). Keep it deployed for at least a few months.
- Do **not** add a new offline/PWA service worker (out of scope).

### 7.4 Analytics

- `gatsby-plugin-google-analytics` is configured with **no tracking ID**, so it's effectively off. Parity = no analytics. (Decide whether to add a privacy-friendly option.)

### 7.5 Sitemap (new, recommended)

- `@astrojs/sitemap` → `/sitemap-index.xml`. Reference it from `robots.txt`. Not present today; low cost.

---

## 8. Tooling and repo

- Node: current LTS; pin with `.nvmrc` / `engines`.
- Package manager: npm (keep), regenerate the lockfile.
- TypeScript (Astro strict preset).
- Prettier 3 + `prettier-plugin-astro`, preserving `.prettierrc` style (no semis, double quotes, es5 trailing commas).
- ESLint: optional (`eslint-plugin-astro`, flat config). Gatsby-era `.eslintrc.js` removed.
- Scripts: `dev`, `build`, `preview`, `format`, `check` (`astro check`).
- Jest config exists only to run `content/blog/testing-stream-code/stream-test.spec.js` (post companion code). Either keep a minimal Jest (or Vitest) setup that runs it, or drop the runner and leave the file as content. Decide.
- Remove: `gatsby-*.js`, `src/utils/typography.js`, React and all Gatsby/Typography deps, `.cache/`, old `public/` build output (gitignored, but delete locally).
- `.gitignore`: add `dist/`, `.astro/`.
- README: update with dev/build instructions.

---

## 9. Hosting and deployment

- Hosting provider is **not recorded in the repo** (no netlify.toml/vercel.json/CI). Must be confirmed.
- Output: fully static (`output: 'static'`), `dist/`.
- Requirements on the host: serve `404.html` for unknown routes; `/resume` → `/resume.pdf` redirect; `www.hotmess.codes` canonical (apex → www as today).
- Update the host's build command (`npm run build`) and publish dir (`public` → `dist`).

---

## 10. Acceptance criteria

1. `npm run build` succeeds with zero warnings from `astro check`.
2. Every URL in the current build exists in the new one: `/`, `/about/`, the 7 `/<slug>/` pages, `/404.html`, `/rss.xml`, `/resume.pdf`, `/favicon.ico`, `/robots.txt`, `/manifest.webmanifest`, `/sw.js` (kill-switch).
3. RSS item guids/links identical to the current feed.
4. Index lists 7 posts newest-first with correct titles, `MMMM DD, YYYY` dates, and descriptions.
5. Each post shows splash (working image), credit, title, byline + headshot, highlighted code, prev/next links in correct order, and footer.
6. Admirees and icons are shuffled on reload; every name always links to its own URL. Works with JS disabled (unshuffled).
7. Visual side-by-side vs the Gatsby site at desktop and mobile widths: same fonts, colors, spacing within reason.
8. A browser that previously visited the Gatsby site gets the new site after one reload (SW unregistered).
9. Zero client-side framework JS shipped. Only the tiny shuffle script (and SW-unregister if needed).
10. Lighthouse: performance/accessibility/SEO ≥ current scores.

---

## 11. Open decisions

1. Hosting provider (Netlify? Vercel? GitHub Pages?) and who/what triggers deploys.
2. Splash images: hotlink fixed Unsplash URLs, or download locally?
3. Fix copy typos (Pacfic, Evangalism, Dave Cedia, Vivki, wrong splash credit URL) or keep verbatim?
4. Keep Twitter link/icon, switch to X, or drop? Same for the 404 "@ me" link.
5. Mobile layout: keep the current cramped two-column, or stack?
6. Shiki theme acceptable vs exact Prism Darcula?
7. Keep the Jest runner for the post companion spec?
8. Add `remark-emoji` so `:scream:` renders?
9. Add sitemap/canonical/og:image (recommended), analytics (none today)?
