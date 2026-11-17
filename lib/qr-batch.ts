// lib/qr-batch.ts — bulk QR export: one PNG + one SVG per line, zipped, with an index.csv.
// Runs entirely in the browser; jszip is loaded only when someone actually downloads.
import QRCode from 'qrcode';

export const BATCH_LIMIT = 200;

/** Splits the textarea into non-empty lines, capped at BATCH_LIMIT. */
export function parseBatchLines(input: string): string[] {
  return input
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, BATCH_LIMIT);
}

function slug(text: string) {
  return (
    text
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
      .toLowerCase() || 'qr'
  );
}

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

export async function buildBatchZip(
  lines: string[],
  opts: { dark: string; light?: string; size?: number },
  onProgress?: (done: number, total: number) => void
): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const png = zip.folder('png')!;
  const svg = zip.folder('svg')!;
  const color = { dark: opts.dark, light: opts.light ?? '#ffffff' };
  const width = opts.size ?? 1024;
  const pad = String(lines.length).length;
  const rows = ['number,content,png,svg'];

  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    const name = `${String(i + 1).padStart(Math.max(3, pad), '0')}-${slug(text)}`;
    const qrOpts = { errorCorrectionLevel: 'M' as const, margin: 2, color };
    const dataUrl = await QRCode.toDataURL(text, { ...qrOpts, width });
    png.file(`${name}.png`, dataUrl.split(',')[1], { base64: true });
    svg.file(`${name}.svg`, await QRCode.toString(text, { ...qrOpts, type: 'svg' }));
    rows.push([String(i + 1), csvCell(text), `png/${name}.png`, `svg/${name}.svg`].join(','));
    onProgress?.(i + 1, lines.length);
    // Let the UI repaint between codes so big batches don't freeze the page.
    if (i % 10 === 9) await new Promise((r) => setTimeout(r, 0));
  }

  zip.file('index.csv', rows.join('\n'));
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
