#!/usr/bin/env node
/**
 * One-shot setup for a repository spawned from this template: rewrite the site
 * identity, drop the surfaces you don't want, then delete itself.
 *
 * Run: pnpm run init
 * Non-interactive: pnpm run init --yes --name="My Site" --no-blog
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Read a file under the repository root. */
function read(relative)
{
    return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

/** Write a file under the repository root. */
function write(relative, contents)
{
    fs.writeFileSync(path.join(ROOT, relative), contents);
}

/** Delete a file or directory under the repository root; missing is fine. */
function remove(relative)
{
    fs.rmSync(path.join(ROOT, relative), { recursive: true, force: true });
}

/** `--flag` / `--key=value` parsed into a flat record; bare `--no-x` is `x: false`. */
function parseArgv(argv)
{
    const args = {};

    for (const entry of argv)
    {
        const match = /^--([\w-]+)(?:=(.*))?$/.exec(entry);

        if (!match)
        {
            continue;
        }

        const [, key, value] = match;

        if (key.startsWith("no-"))
        {
            args[key.slice(3)] = false;
        }
        else
        {
            args[key] = value ?? true;
        }
    }

    return args;
}

/** `{ owner, repo }` from the `origin` remote, or undefined when there is none. */
function readOrigin()
{
    try
    {
        const url = execFileSync("git", ["remote", "get-url", "origin"], {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        }).trim();
        const match = /github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/.exec(url);

        return match ? { owner: match[1], repo: match[2] } : undefined;
    }
    catch
    {
        return undefined;
    }
}

/** "my-new-site" → "My New Site". */
function titleCase(slug)
{
    return slug.split(/[-_]/).filter(Boolean).map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

/** Escape a value for embedding in a double-quoted TypeScript string literal. */
function quote(value)
{
    return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

/** Replace `key: "..."` on one line of an object literal. */
function setStringField(source, key, value)
{
    const pattern = new RegExp(`(\\n\\s*${key}: )"[^"]*"`);

    if (!pattern.test(source))
    {
        throw new Error(`could not find \`${key}\` — was site.config.ts edited by hand?`);
    }

    return source.replace(pattern, `$1"${quote(value)}"`);
}

/** Ask a question, falling back to `fallback` when answers are pre-supplied. */
async function ask(rl, question, fallback)
{
    if (!rl)
    {
        return fallback;
    }

    const answer = (await rl.question(`${question} [${fallback}] `)).trim();

    return answer || fallback;
}

/** Ask a yes/no question. */
async function confirm(rl, question, fallback)
{
    if (!rl)
    {
        return fallback;
    }

    const answer = (await rl.question(`${question} [${fallback ? "Y/n" : "y/N"}] `)).trim().toLowerCase();

    return answer ? answer.startsWith("y") : fallback;
}

/** Rewrite `content/_meta.js` to exactly the surviving top-level entries. */
function writeContentMeta(entries)
{
    const body = entries.map(([key, label]) => `    ${key}: "${label}",`).join("\n");

    write("content/_meta.js", `export default {\n${body}\n};\n`);
}

/**
 * Move the docs up to `content/` so they serve from `/` instead of `/docs`.
 *
 * Only reachable with the landing page gone: a docs-only site wants its index at
 * the root, and with the landing page present `/` is already taken.
 */
function promoteDocsToRoot()
{
    for (const entry of fs.readdirSync(path.join(ROOT, "content/docs")))
    {
        fs.renameSync(path.join(ROOT, "content/docs", entry), path.join(ROOT, "content", entry));
    }

    remove("content/docs");
}

const args = parseArgv(process.argv.slice(2));
const rl = args.yes ? undefined : readline.createInterface({ input: process.stdin, output: process.stdout });
const origin = readOrigin();
const slug = origin?.repo ?? path.basename(ROOT);

const name = args.name ?? await ask(rl, "Site name", titleCase(slug));
const description = args.description ?? await ask(rl, "One-line description", `${name}, built with Nextra.`);
const repository = args.repository ?? await ask(rl, "Repository URL", origin ? `https://github.com/${origin.owner}/${origin.repo}` : "");
const author = args.author ?? await ask(rl, "Copyright holder", origin?.owner ?? name);

const keepLanding = args.landing ?? await confirm(rl, "Keep the landing page?", true);
const keepDocs = args.docs ?? await confirm(rl, "Keep the docs?", true);
const keepBlog = args.blog ?? await confirm(rl, "Keep the blog?", true);

rl?.close();

if (!keepLanding && !keepDocs && !keepBlog)
{
    console.error("Refusing to remove every surface — keep at least one.");
    process.exit(1);
}

let config = read("site.config.ts");

config = setStringField(config, "name", name);
config = setStringField(config, "title", name);
config = setStringField(config, "description", description);
config = setStringField(config, "repository", repository);
config = config.replace(/(\n\s*footer: `)[^`]*`/, `$1© \${new Date().getFullYear()} ${author}\``);
config = config.replace(/(\n\s*docs: )(?:true|false)/, `$1${keepDocs}`);
config = config.replace(/(\n\s*blog: )(?:true|false)/, `$1${keepBlog}`);

write("site.config.ts", config);

const pkg = JSON.parse(read("package.json"));

pkg.name = slug;
delete pkg.scripts.init;

if (!keepBlog)
{
    remove("app/(content)/blog");
    remove("content/blog");
}

if (!keepDocs)
{
    remove("content/docs");
}

// Nothing MDX survives, so the themed group goes with it: an empty `content/` leaves
// the catch-all with no static params, which `output: "export"` rejects outright.
if (!keepDocs && !keepBlog)
{
    remove("app/(content)");
    remove("content");
    remove("mdx-components.js");
}
else if (!keepLanding)
{
    remove("app/(site)");

    // The catch-all must become optional to answer `/`, which the landing page owned.
    fs.renameSync(path.join(ROOT, "app/(content)/[...mdxPath]"), path.join(ROOT, "app/(content)/[[...mdxPath]]"));

    const catchAll = "app/(content)/[[...mdxPath]]/page.tsx";

    write(catchAll, read(catchAll).replace(
        /\/\/ A REQUIRED catch-all[\s\S]*?root layout\.\n/,
        "// The optional catch-all, which also answers \"/\": there is no landing page in a\n"
        + "// sibling root layout to collide with.\n",
    ));

    if (keepDocs)
    {
        promoteDocsToRoot();
    }
    else
    {
        write("content/index.mdx", `# ${name}\n\n${description}\n`);
    }
}

if (!keepDocs && !keepBlog)
{
    // No `content/` left to describe.
}
else if (keepLanding)
{
    // Rebuilt rather than patched: with the landing page in place only these keys exist.
    writeContentMeta([
        ...(keepDocs ? [["docs", "Documentation"]] : []),
        ...(keepBlog ? [["blog", "Blog"]] : []),
    ]);
}
else if (keepDocs)
{
    // `content/_meta.js` is now the docs' own meta, carried up by the promotion; the
    // blog is the one sibling it does not already know about.
    if (keepBlog)
    {
        write("content/_meta.js", read("content/_meta.js").replace(/\n};\s*$/, "\n    blog: \"Blog\",\n};\n"));
    }
}
else
{
    writeContentMeta([["index", "Home"], ["blog", "Blog"]]);
}

write("LICENSE", read("LICENSE").replace(/(Copyright \(c\) )\d{4} .+/, `$1${new Date().getFullYear()} ${author}`));

write("README.md", [
    `# ${name}`,
    "",
    description,
    "",
    "```bash",
    "pnpm install",
    "pnpm run dev     # http://localhost:3000",
    "pnpm run ok      # build + typecheck + lint + test",
    "```",
    "",
    "Pushing to `main` deploys to GitHub Pages. Site-wide strings live in `site.config.ts`;",
    "`AGENTS.md` lists the traps worth knowing before changing the build.",
    "",
].join("\n"));

write("package.json", `${JSON.stringify(pkg, undefined, 4)}\n`);

remove("scripts");

console.log(`\nInitialised ${name}.`);
console.log("Review the diff, then: pnpm install && pnpm run ok");
