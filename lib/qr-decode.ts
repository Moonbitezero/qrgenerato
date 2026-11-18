// lib/qr-decode.ts — read a QR code from a camera frame or an image, in every browser.
// Uses the built-in BarcodeDetector where it exists (Android Chrome, macOS Chrome/Edge) and falls back
// to jsQR elsewhere (iPhone/iPad Safari, Firefox, Chrome on Windows/Linux), which have no detector.

type Source = HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap;

interface Detector {
  detect(source: Source): Promise<{ rawValue: string }[]>;
}

let detector: Detector | null | undefined;
let canvas: HTMLCanvasElement | null = null;

function getDetector(): Detector | null {
  if (detector !== undefined) return detector;
  const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
  try {
    detector = BD ? new BD({ formats: ['qr_code'] }) : null;
  } catch {
    detector = null;
  }
  return detector;
}

function sizeOf(src: Source) {
  if (src instanceof HTMLVideoElement) return { w: src.videoWidth, h: src.videoHeight };
  if (src instanceof HTMLImageElement) return { w: src.naturalWidth, h: src.naturalHeight };
  return { w: src.width, h: src.height };
}

/** Returns the QR text, or null if no code was found. `maxSide` limits the jsQR work per frame. */
export async function decodeQr(src: Source, maxSide = 1000): Promise<string | null> {
  const d = getDetector();
  if (d) {
    try {
      const codes = await d.detect(src);
      if (codes[0]?.rawValue) return codes[0].rawValue;
      if (!(src instanceof HTMLImageElement)) return null; // camera: try again next frame
    } catch {
      // fall through to jsQR
    }
  }
  const { w, h } = sizeOf(src);
  if (!w || !h) return null;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  canvas ??= document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(src, 0, 0, cw, ch);
  const { default: jsQR } = await import('jsqr');
  const data = ctx.getImageData(0, 0, cw, ch);
  const hit = jsQR(data.data, cw, ch, { inversionAttempts: src instanceof HTMLVideoElement ? 'dontInvert' : 'attemptBoth' });
  return hit?.data || null;
}

/** Loads an image file and decodes the QR code in it. */
export async function decodeQrFromFile(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return await decodeQr(img, 1600);
  } finally {
    URL.revokeObjectURL(url);
  }
}
