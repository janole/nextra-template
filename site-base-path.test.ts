import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resolveBasePath, resolveSiteUrl } from "./site-base-path.mjs";

const ENV_KEYS = ["GITHUB_REPOSITORY", "SITE_BASE_PATH", "SITE_URL", "PORT"] as const;

describe("GitHub Pages path derivation", () =>
{
    let saved: Record<string, string | undefined> = {};

    beforeEach(() =>
    {
        saved = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

        for (const key of ENV_KEYS)
        {
            delete process.env[key];
        }
    });

    afterEach(() =>
    {
        for (const key of ENV_KEYS)
        {
            if (saved[key] === undefined)
            {
                delete process.env[key];
            }
            else
            {
                process.env[key] = saved[key];
            }
        }
    });

    it("serves a project site under /<repo>", () =>
    {
        process.env.GITHUB_REPOSITORY = "janole/nextra-template";

        expect(resolveBasePath()).toBe("/nextra-template");
        expect(resolveSiteUrl()).toBe("https://janole.github.io/nextra-template");
    });

    it("serves a user site at the root", () =>
    {
        process.env.GITHUB_REPOSITORY = "janole/janole.github.io";

        expect(resolveBasePath()).toBe("");
        expect(resolveSiteUrl()).toBe("https://janole.github.io");
    });

    it("matches the user-site name case-insensitively", () =>
    {
        process.env.GITHUB_REPOSITORY = "JanOle/JANOLE.github.io";

        expect(resolveBasePath()).toBe("");
    });

    it("falls back to the root when not running in Actions", () =>
    {
        expect(resolveBasePath()).toBe("");
    });

    it("lets SITE_BASE_PATH override the derivation, including back to the root", () =>
    {
        process.env.GITHUB_REPOSITORY = "janole/nextra-template";
        process.env.SITE_BASE_PATH = "";

        expect(resolveBasePath()).toBe("");
    });
});
