import type { Metadata } from "next";
import type { ReactNode } from "react";

import { sharedMetadata, site } from "../../site.config";
import styles from "./landing.module.css";

export const metadata: Metadata = {
    ...sharedMetadata,
    title: site.title,
    description: site.description,
};

/**
 * Root layout for the unthemed marketing surface.
 *
 * Deliberately does NOT import `nextra-theme-docs/style.css` — the landing page
 * is plain React + CSS modules so it can look like anything.
 */
export default function SiteLayout({ children }: { children: ReactNode })
{
    return (
        <html lang="en" dir="ltr">
            <body className={styles.body}>
                {children}
            </body>
        </html>
    );
}
