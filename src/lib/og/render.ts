import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { ogFonts } from "./fonts";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export async function renderOg(tree: any): Promise<Uint8Array> {
  const svg = await satori(tree, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: await ogFonts(),
  });
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
  }).render().asPng();
  return png;
}
