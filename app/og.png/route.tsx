import { ImageResponse } from "next/og";

import { site } from "../../site.config";

export const dynamic = "force-static";

const SIZE = { width: 1200, height: 630 };

/**
 * The social card, emitted by `output: "export"` as a literal `out/og.png`.
 *
 * A route handler named `og.png` rather than the `app/opengraph-image` file
 * convention: that convention never reaches pages in a route group with no root
 * `app/layout.tsx`, and it emits an extensionless file that most static hosts
 * serve as `application/octet-stream`, which scrapers drop.
 */
export function GET()
{
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 96px",
                    background: "#0a0a0c",
                    color: "#f4f3f0",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: "-0.03em" }}>
                    {site.name}
                </div>
                <div style={{ marginTop: 28, fontSize: 34, lineHeight: 1.35, color: "#a8a6a0", maxWidth: 880 }}>
                    {site.description}
                </div>
            </div>
        ),
        SIZE,
    );
}
