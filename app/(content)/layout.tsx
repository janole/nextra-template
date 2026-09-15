import "nextra-theme-docs/style.css";

import type { Metadata } from "next";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import type { ReactNode } from "react";

import { sharedMetadata, site } from "../../site.config";

export const metadata: Metadata = {
    ...sharedMetadata,
    title: {
        default: site.name,
        template: `%s — ${site.name}`,
    },
    description: site.description,
};

/**
 * Root layout for the themed surfaces (docs, blog).
 *
 * The landing page has its OWN root layout in `app/(site)` — Next allows one per
 * route group as long as no `app/layout.tsx` exists — which is what keeps the
 * marketing page free of the docs theme's stylesheet.
 */
export default async function ContentLayout({ children }: { children: ReactNode })
{
    const pageMap = await getPageMap();

    // The theme validates these as URLs: an empty `site.repository` fails the build
    // with a digest-only "error in the Server Components render".
    const repository = site.repository || undefined;

    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
            <Head />
            <body>
                <Layout
                    navbar={<Navbar logo={<b>{site.name}</b>} projectLink={repository} />}
                    pageMap={pageMap}
                    docsRepositoryBase={repository && `${repository}/tree/main`}
                    footer={<Footer>{site.footer}</Footer>}
                >
                    {children}
                </Layout>
            </body>
        </html>
    );
}
