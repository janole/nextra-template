# nextra-template

A [Nextra](https://nextra.site) site with three surfaces — **landing**, **blog**, **docs** —
that deploys itself to GitHub Pages. Use it as a GitHub template, keep the surfaces you
want, throw the rest away.

Live: <https://janole.github.io/nextra-template/>

## Start a site

1. **Use this template** on GitHub (or `gh repo create <name> --template janole/nextra-template --public`).
2. Clone it, then:

   ```bash
   pnpm install
   pnpm run init     # names the site, drops the surfaces you don't want, deletes itself
   pnpm run dev
   ```

3. Enable Pages: **Settings → Pages → Source: GitHub Actions**. Push to `main`.

That's the whole setup. Nothing about the deployment URL is configured by hand —
`site-base-path.mjs` derives `basePath` and the absolute site URL from
`GITHUB_REPOSITORY`, so a project site (`/<repo>`), a user site
(`<owner>.github.io`) and a custom domain (`public/CNAME`) all work untouched.

## What you get

| Surface | Route | Built from |
| --- | --- | --- |
| Landing | `/` | `app/(site)/` — plain React + CSS modules, no theme loaded |
| Blog | `/blog` | `content/blog/*.mdx`; the listing is generated from the page map |
| Docs | `/docs` | `content/docs/*.mdx` with `nextra-theme-docs` — sidebar, TOC, search |

Plus: full-text search (Pagefind, indexed after every build), a social card drawn from
`site.config.ts` at build time, dark mode, and a CI workflow that runs the same gate you
run locally.

The two root layouts are deliberate. `app/(site)` never imports the docs theme's
stylesheet, so the landing page starts from nothing and can look like anything; the docs
and blog share `app/(content)`. Next allows one root layout per route group as long as
there is no `app/layout.tsx` — don't add one.

## Removing a surface by hand

`pnpm run init` does this for you. If you change your mind later:

- **Blog** — delete `app/(content)/blog/` and `content/blog/`, drop the `blog` key from
  `content/_meta.js`, and set `surfaces.blog = false` in `site.config.ts`.
- **Docs** — delete `content/docs/`, drop the `docs` key from `content/_meta.js`, and set
  `surfaces.docs = false`. The themed layout stays; the blog still uses it.
- **Landing** — delete `app/(site)/` and rename `app/(content)/[...mdxPath]` to
  `app/(content)/[[...mdxPath]]` so the catch-all answers `/`. Then give `/` something to
  render: move `content/docs/*` up into `content/`, or add a `content/index.mdx`.

Setting a `surfaces` flag to `false` without deleting anything hides the surface from the
landing page while leaving its pages reachable by URL.

## Commands

```bash
pnpm run dev         # next dev
pnpm run build       # static export to out/, then Pagefind indexes it
pnpm run ok          # build + typecheck + lint --fix + test
pnpm run qa          # same, but lint without --fix (what CI runs)
```

`AGENTS.md` documents the traps that cost time to rediscover — the load-bearing `zod`
overrides, the derived `basePath`, why the catch-all is required rather than optional.
Read it before changing the build.

## Licence

MIT.
