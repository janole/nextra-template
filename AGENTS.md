# AGENTS.md

A Nextra site with three surfaces — landing, blog, docs — that deploys to GitHub
Pages as a static export.

## Quality Gate

Before finishing any code, config, content, or behavior-affecting change, run:

```bash
pnpm run ok  # => build + typecheck + lint:fix + test
```

For documentation-only changes, do not run the full gate by default.

## Known traps

These cost real time to rediscover. Do not "clean them up".

- **The `zod` overrides in `package.json` are load-bearing.** `nextra@4.6.1`
  declares `zod: ^4.1.12`, and on a newer zod every page fails to render with
  `Invalid input: expected nonoptional, received undefined → at children` — an
  error that names no source file. The theme's `<Layout>` destructures `children`
  out of its props and then parses the remainder against a `z.strictObject` that
  still requires `children`. Removing the overrides breaks the whole site.
- **`basePath` is derived, never hardcoded** (`site-base-path.mjs`). GitHub Pages
  serves a project site under `/<repo>` but a user site and a custom domain at the
  root. A wrong `basePath` fails *silently*: the HTML loads and every asset 404s,
  and under `output: "export"` nothing corrects it at runtime. Set `SITE_BASE_PATH`
  to override; do not edit `next.config.mjs`.
- **The catch-all route is `[...mdxPath]`, not `[[...mdxPath]]`.** Nextra's own
  starter uses the optional form, which also matches `/` and would collide with
  the landing page's root layout.
- **There is no `app/layout.tsx`.** `app/(site)` and `app/(content)` are separate
  root layouts, which is what keeps the docs theme's stylesheet off the landing
  page. Adding a shared root layout defeats that.
- **`fetch-depth: 0` in the workflows** feeds Nextra's "Last updated" line. At the
  default depth of 1 every page claims the deploy commit's date.
- **An empty `site.repository` used to fail the whole build** with nothing but
  `An error occurred in the Server Components render` and a digest — the theme
  validates `projectLink` and `docsRepositoryBase` as URLs. `app/(content)/layout.tsx`
  now passes `undefined` instead of an empty string; keep that guard.
- **The social card is a route handler at `app/og.png/route.tsx`,** not the
  `app/opengraph-image` file convention. The convention emits no `og:image` at all
  for pages inside a route group when there is no root `app/layout.tsx`, and the
  file it does emit has no extension, so hosts serve it as
  `application/octet-stream` and scrapers drop it. The URL in `site.config.ts` is
  absolute for the same reason `basePath` is derived — a relative one resolves
  against `metadataBase` and loses `/<repo>`.

## Layout

- `app/(site)/` — landing page. Plain React + CSS modules, no theme. Design freely.
- `app/(content)/` — docs and blog, rendered by `nextra-theme-docs`.
- `content/docs/**`, `content/blog/**` — MDX; `_meta.js` sets order and labels.
- `site.config.ts` — name, description, repository, footer. Edit this, not the layouts.
- `site-base-path.mjs` — deployment URL derivation. Covered by tests; change with care.

## Style

- TypeScript strict mode is authoritative.
- Follow the existing ESLint rules: Allman braces, sorted single-line imports,
  4-space indent, double quotes, semicolons.
- Add a one-liner JSDoc (`/** ... */`) to every exported function, type, and class —
  skip only when the name alone is unambiguous.
- Keep comments focused on non-obvious intent. Do not narrate changes; git holds that.
- Do not leave dead code. If a helper isn't called, remove it.
- Do not rewrite existing code for style. Only touch what the task requires.
- Do **not** remove TODO comments unless they are implemented or fixed.

## Documentation

- Keep committed docs self-contained. A reader has only this repository.
- When a surface is added or removed, update `README.md`.
