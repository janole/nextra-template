import Link from "next/link";

import { site } from "../../site.config";
import styles from "./landing.module.css";

const SURFACES = [
    {
        name: "Landing",
        route: "/",
        text: "Plain React and CSS modules, with no theme in the way. This page — replace it.",
    },
    {
        name: "Blog",
        route: "/blog",
        text: "Posts as MDX. The listing is generated from the page map, so there is no index to maintain.",
    },
    {
        name: "Docs",
        route: "/docs",
        text: "Sidebar, table of contents and full-text search, from the stock Nextra docs theme.",
    },
] as const;

/** Landing page — the unthemed surface. Built to be thrown away and rewritten. */
export default function LandingPage()
{
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <p className={styles.eyebrow}>Nextra · Next.js · GitHub Pages</p>
                <h1 className={styles.title}>{site.name}</h1>
                <p className={styles.lead}>{site.description}</p>
                <nav className={styles.actions}>
                    <Link className={`${styles.action} ${styles.actionPrimary}`} href="/docs">Read the docs</Link>
                    <Link className={styles.action} href="/blog">Blog</Link>
                    <a className={styles.action} href={site.repository}>GitHub</a>
                </nav>
            </section>

            <section className={styles.section}>
                <ul className={styles.surfaces}>
                    {SURFACES.map((surface) => (
                        <li key={surface.name} className={styles.surface}>
                            <h2 className={styles.surfaceName}>
                                {surface.name} <span className={styles.surfaceRoute}>{surface.route}</span>
                            </h2>
                            <p className={styles.surfaceText}>{surface.text}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <footer className={styles.footer}>{site.footer}</footer>
        </main>
    );
}
