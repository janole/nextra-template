import nextra from "nextra";

import { resolveBasePath, resolveSiteUrl } from "./site-base-path.mjs";

const withNextra = nextra({
    defaultShowCopyCode: true,
});

export default withNextra({
    reactStrictMode: true,
    // GitHub Pages is a static host: no server, no image optimizer, and directory
    // URLs only resolve when each route is emitted as its own index.html.
    output: "export",
    trailingSlash: true,
    images: { unoptimized: true },
    basePath: resolveBasePath(),
    env: {
        NEXT_PUBLIC_SITE_URL: resolveSiteUrl(),
    },
});
