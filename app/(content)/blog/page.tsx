import type { Metadata } from "next";
import Link from "next/link";

import { site } from "../../../site.config";
import styles from "./blog.module.css";
import { formatPostDate, listPosts } from "./post-list";

export const metadata: Metadata = {
    title: "Blog",
    description: `Posts from ${site.name}.`,
};

/**
 * Post listing for `/blog`.
 *
 * A static route segment, so it wins over the `[...mdxPath]` catch-all — which is
 * why `content/blog/` has no `index.mdx`.
 */
export default async function BlogIndexPage()
{
    const posts = await listPosts();

    return (
        <div className={styles.page}>
            <h1 className={styles.heading}>Blog</h1>
            {posts.length === 0 && <p className={styles.empty}>No posts yet.</p>}
            <ul className={styles.list}>
                {posts.map((post) => (
                    <li key={post.route} className={styles.item}>
                        <Link href={post.route} className={styles.title}>{post.title}</Link>
                        {post.date && <time className={styles.date} dateTime={post.date}>{formatPostDate(post.date)}</time>}
                        {post.description && <p className={styles.description}>{post.description}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
