/**
 * OG image templates as satori object trees.
 *
 * Color tokens approximated from src/styles/global.css (oklch → hex).
 * Editorial vocabulary: cream paper, ink slate, deep crimson seal.
 */

const PAPER = "#f6f1e6";
const PAPER_SOFT = "#efe9d9";
const INK = "#1d1c26";
const INK_SOFT = "#6c6a7a";
const RULE = "#d6d0c1";
const SEAL = "#8e2310";

const STATUS_COLOR: Record<string, string> = {
  idea: "#7d7589",
  building: "#a78544",
  shipped: "#3f8456",
  killed: "#8e2310",
};

const SITE_URL = "100-apps-journey.vercel.app";
const MASTHEAD = "100 APPS JOURNEY  ·  VOL. I  ·  MMXXVI";

// --- helpers -----------------------------------------------------------

type Node = { type: string; props: { style?: any; children?: any } };

function div(style: any, children?: any): Node {
  return { type: "div", props: { style: { display: "flex", ...style }, children } };
}

function txt(style: any, children: string | (string | Node)[]): Node {
  return { type: "div", props: { style: { display: "flex", ...style }, children } };
}

function masthead(): Node {
  return div(
    {
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${RULE}`,
      paddingBottom: "16px",
    },
    [
      txt(
        {
          fontFamily: "JetBrains Mono",
          fontSize: "16px",
          letterSpacing: "0.25em",
          color: INK_SOFT,
          textTransform: "uppercase",
        },
        MASTHEAD,
      ),
      txt(
        {
          fontFamily: "JetBrains Mono",
          fontSize: "16px",
          letterSpacing: "0.18em",
          color: SEAL,
          textTransform: "uppercase",
        },
        "AI Investor Panel",
      ),
    ],
  );
}

function urlFooter(): Node {
  return div(
    {
      width: "100%",
      justifyContent: "space-between",
      alignItems: "flex-end",
      borderTop: `1px solid ${RULE}`,
      paddingTop: "18px",
    },
    [
      txt(
        {
          fontFamily: "JetBrains Mono",
          fontSize: "20px",
          letterSpacing: "0.12em",
          color: INK,
          textTransform: "uppercase",
        },
        SITE_URL,
      ),
      txt(
        {
          fontFamily: "Spectral",
          fontStyle: "italic",
          fontSize: "16px",
          color: INK_SOFT,
        },
        "AI-simulated panel of real-world investors & builders.",
      ),
    ],
  );
}

function frame(children: Node[]): Node {
  return div(
    {
      width: "1200px",
      height: "630px",
      backgroundColor: PAPER,
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "56px 64px",
      fontFamily: "Fraunces",
    },
    children,
  );
}

// --- variants ----------------------------------------------------------

export function homeOg(): Node {
  return frame([
    masthead(),
    div(
      {
        flexDirection: "column",
        gap: "8px",
      },
      [
        txt(
          {
            fontFamily: "Fraunces",
            fontSize: "104px",
            color: INK,
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
          },
          "100 attempts.",
        ),
        txt(
          {
            fontFamily: "Fraunces",
            fontSize: "104px",
            color: INK,
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
          },
          "100 days.",
        ),
        txt(
          {
            fontFamily: "Fraunces",
            fontSize: "104px",
            color: SEAL,
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
          },
          "1 portfolio.",
        ),
        txt(
          {
            fontFamily: "Spectral",
            fontStyle: "italic",
            fontSize: "30px",
            color: INK_SOFT,
            marginTop: "20px",
          },
          "A public ledger of small app experiments — judged daily by an AI panel.",
        ),
      ],
    ),
    urlFooter(),
  ]);
}

function statusBadge(status: string): Node {
  const color = STATUS_COLOR[status] ?? INK_SOFT;
  return div(
    {
      alignItems: "center",
      gap: "12px",
      padding: "10px 22px",
      border: `1px solid ${color}`,
      borderRadius: "999px",
      backgroundColor: PAPER_SOFT,
    },
    [
      div(
        {
          width: "10px",
          height: "10px",
          borderRadius: "999px",
          backgroundColor: color,
        },
      ),
      txt(
        {
          fontFamily: "JetBrains Mono",
          fontSize: "16px",
          letterSpacing: "0.22em",
          color,
          textTransform: "uppercase",
        },
        status,
      ),
    ],
  );
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

export function ideaOg(opts: {
  id: number;
  title: string;
  thesis: string;
  status: string;
}): Node {
  const idNum = String(opts.id).padStart(3, "0");
  return frame([
    masthead(),
    div(
      {
        gap: "48px",
        alignItems: "flex-start",
        flex: 1,
        marginTop: "20px",
      },
      [
        // Left rail: ID
        div(
          {
            flexDirection: "column",
            alignItems: "flex-start",
            minWidth: "200px",
            paddingTop: "8px",
            gap: "6px",
          },
          [
            txt(
              {
                fontFamily: "JetBrains Mono",
                fontSize: "16px",
                letterSpacing: "0.32em",
                color: INK_SOFT,
                textTransform: "uppercase",
              },
              "Entry",
            ),
            txt(
              {
                fontFamily: "Fraunces",
                fontStyle: "italic",
                fontSize: "150px",
                color: SEAL,
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
              },
              idNum,
            ),
          ],
        ),
        // Right: title + thesis + status
        div(
          {
            flexDirection: "column",
            flex: 1,
            gap: "20px",
          },
          [
            txt(
              {
                fontFamily: "Fraunces",
                fontSize: "64px",
                fontWeight: 400,
                color: INK,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              },
              opts.title,
            ),
            div({ alignItems: "center" }, [statusBadge(opts.status)]),
            txt(
              {
                fontFamily: "Spectral",
                fontStyle: "italic",
                fontSize: "26px",
                color: INK_SOFT,
                lineHeight: 1.4,
              },
              truncate(opts.thesis, 180),
            ),
          ],
        ),
      ],
    ),
    urlFooter(),
  ]);
}

export function mentorOg(opts: {
  name: string;
  short_bio: string;
  epitaph: string;
  accent: string;
  version: "v1-bootstrap" | "v2-distilled";
  initials: string;
}): Node {
  const isDistilled = opts.version === "v2-distilled";
  const versionLabel = isDistilled ? "DISTILLED" : "BOOTSTRAP";
  return frame([
    masthead(),
    div(
      {
        gap: "44px",
        alignItems: "center",
        flex: 1,
        marginTop: "16px",
      },
      [
        // Initials disc with accent
        div(
          {
            width: "200px",
            height: "200px",
            borderRadius: "100px",
            backgroundColor: opts.accent,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: `4px solid ${opts.accent}`,
          },
          [
            txt(
              {
                fontFamily: "Fraunces",
                fontSize: "72px",
                color: PAPER,
                letterSpacing: "-0.02em",
              },
              opts.initials,
            ),
          ],
        ),
        // Name + version + epitaph
        div(
          {
            flexDirection: "column",
            flex: 1,
            gap: "16px",
          },
          [
            div(
              { alignItems: "center", gap: "20px" },
              [
                txt(
                  {
                    fontFamily: "Fraunces",
                    fontSize: "68px",
                    color: INK,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  },
                  opts.name,
                ),
                div(
                  {
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    border: `1px solid ${opts.accent}`,
                    borderRadius: "999px",
                    backgroundColor: PAPER_SOFT,
                  },
                  [
                    div(
                      {
                        width: "8px",
                        height: "8px",
                        borderRadius: "999px",
                        backgroundColor: isDistilled ? opts.accent : "transparent",
                        border: isDistilled ? "none" : `2px dotted ${opts.accent}`,
                      },
                    ),
                    txt(
                      {
                        fontFamily: "JetBrains Mono",
                        fontSize: "14px",
                        color: opts.accent,
                        letterSpacing: "0.22em",
                      },
                      versionLabel,
                    ),
                  ],
                ),
              ],
            ),
            txt(
              {
                fontFamily: "JetBrains Mono",
                fontSize: "15px",
                color: INK_SOFT,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              },
              truncate(opts.short_bio, 90),
            ),
            txt(
              {
                fontFamily: "Spectral",
                fontStyle: "italic",
                fontSize: "30px",
                color: INK,
                lineHeight: 1.35,
                marginTop: "8px",
              },
              `“${truncate(opts.epitaph, 140)}”`,
            ),
          ],
        ),
      ],
    ),
    urlFooter(),
  ]);
}
