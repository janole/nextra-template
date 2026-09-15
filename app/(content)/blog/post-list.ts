import { getPageMap } from "nextra/page-map";

type PageMapEntry = Awaited<ReturnType<typeof getPageMap>>[number];

const BLOG_ROUTE = "/blog";

/** A blog post as the listing needs it, flattened out of the page map. */
export type Post = {
    route: string;
    title: string;
    description?: string;
    date?: string;
};

type PostFrontMatter = {
    title?: string;
    description?: string;
    date?: string | Date;
};

/** ISO day string, or undefined — frontmatter dates arrive as strings or parsed Dates. */
function toIsoDay(value: string | Date | undefined)
{
    if (!value)
    {
        return undefined;
    }

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function toPost(item: PageMapEntry): Post | undefined
{
    // The page map mixes MdxFile, Folder and the _meta.js entry; only files carry frontmatter.
    if (!("route" in item) || !("frontMatter" in item) || !item.frontMatter)
    {
        return undefined;
    }

    // Nextra also lists this listing page itself, carrying the `metadata` export
    // from page.tsx as its frontmatter — without this it renders as a post.
    if (item.route === BLOG_ROUTE)
    {
        return undefined;
    }

    const frontMatter = item.frontMatter as PostFrontMatter;
    const title = frontMatter.title ?? item.name;

    return {
        route: item.route,
        title,
        description: frontMatter.description,
        date: toIsoDay(frontMatter.date),
    };
}

/** Posts under `content/blog`, newest first; undated posts sort last. */
export async function listPosts(): Promise<Post[]>
{
    const pageMap = await getPageMap("/blog");

    return pageMap
        .map(toPost)
        .filter((post): post is Post => post !== undefined)
        .sort((a, b) =>
        {
            if (a.date === b.date)
            {
                return a.title.localeCompare(b.title);
            }

            if (!a.date)
            {
                return 1;
            }

            if (!b.date)
            {
                return -1;
            }

            return b.date.localeCompare(a.date);
        });
}

/** Build-time dateline; the locale is pinned so the output cannot depend on the build machine. */
export function formatPostDate(date: string)
{
    return new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}
