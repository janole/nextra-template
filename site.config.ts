import type { Metadata } from "next";

/**
 * Everything a new site should edit in one place.
 *
 * Deployment URLs are NOT here — `site-base-path.mjs` derives them from the
 * repository so a fresh clone deploys correctly without touching anything.
 */
export const site = {
    /** Wordmark in the navbar and the `%s — <name>` metadata template. */
    name: "Nextra Template",
    /** Default `<title>` for the landing page. */
    title: "Nextra Template — landing, blog and docs",
    description: "A Nextra site that deploys to GitHub Pages out of the box.",
    /** Repository behind the "edit this page" and project links. */
    repository: "https://github.com/janole/nextra-template",
    /** Footer line; keep it short. */
    footer: `© ${new Date().getFullYear()} Jan Ole Suhr`,
} as const;

/** Absolute site URL, derived at build time (see `site-base-path.mjs`). */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Metadata shared by both root layouts.
 *
 * The card is drawn at build time by `app/og.png/route.tsx` and referenced by an
 * absolute URL: a relative one would resolve against `metadataBase` and drop the
 * GitHub Pages basePath, and scrapers reject relative image URLs outright.
 */
export const sharedMetadata: Metadata = {
    metadataBase: new URL(siteUrl),
    openGraph: {
        siteName: site.name,
        type: "website",
        images: [{ url: `${siteUrl}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
        card: "summary_large_image",
        images: [`${siteUrl}/og.png`],
    },
};
