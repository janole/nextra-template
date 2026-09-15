import { generateStaticParamsFor, importPage } from "nextra/pages";

import { useMDXComponents as getMDXComponents } from "../../../mdx-components.js";

// A REQUIRED catch-all, not the optional `[[...mdxPath]]` Nextra's own starter uses:
// the optional form also matches "/", which would collide with the landing page in
// the sibling `(site)` root layout.
export const generateStaticParams = generateStaticParamsFor("mdxPath");

/** Per-page metadata taken from the MDX frontmatter. */
export async function generateMetadata(props: { params: Promise<{ mdxPath: string[] }> })
{
    const params = await props.params;
    const { metadata } = await importPage(params.mdxPath);

    return metadata;
}

const Wrapper = getMDXComponents().wrapper;

/** Renders every MDX file under `content/` (docs and blog posts alike). */
export default async function Page(props: { params: Promise<{ mdxPath: string[] }> })
{
    const params = await props.params;
    const { default: MDXContent, ...rest } = await importPage(params.mdxPath);

    return (
        <Wrapper {...rest}>
            <MDXContent {...props} params={params} />
        </Wrapper>
    );
}
