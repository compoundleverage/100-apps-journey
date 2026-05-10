import { readFile } from "node:fs/promises";
import path from "node:path";

const NM = path.join(process.cwd(), "node_modules", "@fontsource");

const FILES = {
  frauncesRegular: "fraunces/files/fraunces-latin-400-normal.woff",
  frauncesItalic: "fraunces/files/fraunces-latin-400-italic.woff",
  spectralItalic: "spectral/files/spectral-latin-400-italic.woff",
  jetbrainsMono: "jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff",
  notoSerifSC: "noto-serif-sc/files/noto-serif-sc-chinese-simplified-400-normal.woff",
} as const;

let cached: Awaited<ReturnType<typeof loadAll>> | null = null;

async function loadAll() {
  const [fraunces, frauncesIt, spectralIt, mono, sc] = await Promise.all(
    Object.values(FILES).map((rel) => readFile(path.join(NM, rel))),
  );
  return [
    { name: "Fraunces", data: fraunces, weight: 400 as const, style: "normal" as const },
    { name: "Fraunces", data: frauncesIt, weight: 400 as const, style: "italic" as const },
    { name: "Spectral", data: spectralIt, weight: 400 as const, style: "italic" as const },
    { name: "JetBrains Mono", data: mono, weight: 400 as const, style: "normal" as const },
    { name: "Noto Serif SC", data: sc, weight: 400 as const, style: "normal" as const },
  ];
}

export async function ogFonts() {
  if (!cached) cached = await loadAll();
  return cached;
}
