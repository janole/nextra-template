import fs from "node:fs";
import path from "node:path";

const CNAME_PATH = path.join(process.cwd(), "public", "CNAME");

/** Custom domain from `public/CNAME`, or undefined when the file is absent. */
function readCname()
{
    try
    {
        const domain = fs.readFileSync(CNAME_PATH, "utf8").trim();

        return domain || undefined;
    }
    catch
    {
        return undefined;
    }
}

/** `[owner, repo]` from GITHUB_REPOSITORY, or undefined outside Actions. */
function readRepository()
{
    const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? "").split("/");

    return owner && repo ? { owner, repo } : undefined;
}

/**
 * GitHub Pages serves a *project* site under `/<repo>` but a user/org site and a
 * custom domain at the root. Getting this wrong fails silently — the HTML loads
 * and every asset 404s — and under `output: "export"` nothing corrects it at
 * runtime, so it is derived rather than configured.
 */
export function resolveBasePath()
{
    if (process.env.SITE_BASE_PATH !== undefined)
    {
        return process.env.SITE_BASE_PATH;
    }

    if (readCname())
    {
        return "";
    }

    const repository = readRepository();

    if (!repository)
    {
        return "";
    }

    const isUserSite = repository.repo.toLowerCase() === `${repository.owner.toLowerCase()}.github.io`;

    return isUserSite ? "" : `/${repository.repo}`;
}

/** Absolute site origin + path, used as `metadataBase` so OG tags are not localhost. */
export function resolveSiteUrl()
{
    if (process.env.SITE_URL)
    {
        return process.env.SITE_URL;
    }

    const domain = readCname();

    if (domain)
    {
        return `https://${domain}`;
    }

    const repository = readRepository();

    if (!repository)
    {
        return `http://localhost:${process.env.PORT ?? 3000}`;
    }

    return `https://${repository.owner.toLowerCase()}.github.io${resolveBasePath()}`;
}
