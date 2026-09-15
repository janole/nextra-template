import Link from "next/link";

import { site } from "../../site.config";
import styles from "./landing.module.css";

/** Landing page — replace wholesale; it exists to prove the unthemed surface builds. */
export default function LandingPage()
{
    return (
        <main className={styles.page}>
            <h1 className={styles.title}>{site.name}</h1>
            <p className={styles.lead}>{site.description}</p>
            <nav className={styles.links}>
                <Link className={styles.link} href="/docs">Documentation</Link>
                <Link className={styles.link} href="/blog">Blog</Link>
                <a className={styles.link} href={site.repository}>GitHub</a>
            </nav>
        </main>
    );
}
