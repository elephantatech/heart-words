export interface GlyphImage {
  data: Uint8Array;
  width: number;
  height: number;
}

export async function dottedGlyph(glyph: string): Promise<GlyphImage> {
  await document.fonts.load("240px Andika");
  const canvas = document.createElement("canvas");
  const measure = canvas.getContext("2d");
  if (!measure) throw new Error("Canvas is not available");
  measure.font = "240px Andika";
  const metrics = measure.measureText(glyph);
  const pad = 18;
  const left = Math.ceil(metrics.actualBoundingBoxLeft);
  const right = Math.ceil(metrics.actualBoundingBoxRight);
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent);
  const descent = Math.ceil(metrics.actualBoundingBoxDescent);
  const width = Math.max(1, left + right + pad * 2);
  const height = Math.max(1, ascent + descent + pad * 2);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.font = "240px Andika";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#000";
  ctx.fillText(glyph, pad + left, pad + ascent);
  const ink = ctx.getImageData(0, 0, width, height);
  const out = ctx.createImageData(width, height);
  const step = 8;
  const radius = 2;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (ink.data[(y * width + x) * 4 + 3] <= 140) continue;
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          if (dx * dx + dy * dy > radius * radius) continue;
          const px = x + dx;
          const py = y + dy;
          if (px < 0 || py < 0 || px >= width || py >= height) continue;
          const index = (py * width + px) * 4;
          out.data[index] = 92;
          out.data[index + 1] = 115;
          out.data[index + 2] = 134;
          out.data[index + 3] = 255;
        }
      }
    }
  }
  ctx.clearRect(0, 0, width, height);
  ctx.putImageData(out, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("Could not draw the dotted letter"))), "image/png");
  });
  return { data: new Uint8Array(await blob.arrayBuffer()), width, height };
}
