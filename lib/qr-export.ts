// lib/qr-export.ts
// Animated GIF / MP4 export for animated QR codes and cards.
//
// The studio's animations are CSS keyframes + SMIL inside an SVG. To capture an exact
// frame we rewrite the SVG for time t: CSS animations are paused and offset through the
// `--t` custom property, SMIL animations get `begin="-t"`. Each frame is rasterised on a
// canvas, then encoded (gifenc for GIF, WebCodecs + mp4-muxer for MP4).

export interface ExportProgress {
  (fraction: number, label: string): void;
}

const round = (v: number) => Number(v.toFixed(3));

/** Returns a static version of an animated SVG frozen at `t` seconds. */
export function svgAtTime(svg: string, t: number): string {
  const ts = round(t);
  const open = svg.indexOf('>');
  if (open < 0) return svg;
  // Pause every CSS animation; delays already include `- var(--t, 0s)`.
  const head = svg.slice(0, open).replace(/^<svg\b/, `<svg style="--t:${ts}s"`) + '>';
  const freeze = '<style>*{animation-play-state:paused!important}</style>';
  const body = svg
    .slice(open + 1)
    // SMIL: start every animation `t` seconds in the past.
    .replace(/<(animate|animateTransform|animateMotion)\b(?![^>]*\bbegin=)/g, `<$1 begin="-${ts}s"`);
  return head + freeze + body;
}

/** Even pixel size (required by H.264) for an SVG's viewBox, longest side = `longest`. */
export function exportSize(svg: string, longest: number): { w: number; h: number } {
  const m = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/.exec(svg);
  const vw = m ? parseFloat(m[1]) : 1;
  const vh = m ? parseFloat(m[2]) : 1;
  const even = (v: number) => Math.max(2, Math.round(v / 2) * 2);
  return vw >= vh ? { w: even(longest), h: even((longest * vh) / vw) } : { w: even((longest * vw) / vh), h: even(longest) };
}

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

async function drawFrame(ctx: CanvasRenderingContext2D, svg: string, t: number, w: number, h: number, background: string) {
  const img = await loadSvg(svgAtTime(svg, t));
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
}

const nextTick = () => new Promise<void>((r) => setTimeout(r, 0));

export interface ClipOptions {
  /** Loop length in seconds */
  seconds: number;
  fps: number;
  longest: number;
  /** Fill behind transparent areas (GIF/MP4 have no alpha) */
  background?: string;
  onProgress?: ExportProgress;
}

export async function exportGif(svg: string, o: ClipOptions): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
  const { w, h } = exportSize(svg, o.longest);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is not available');
  const bg = o.background ?? '#ffffff';
  const frames = Math.max(2, Math.round(o.seconds * o.fps));

  // 1. Render every frame once.
  const pixels: Uint8ClampedArray[] = [];
  for (let i = 0; i < frames; i++) {
    await drawFrame(ctx, svg, (i / frames) * o.seconds, w, h, bg);
    pixels.push(ctx.getImageData(0, 0, w, h).data);
    o.onProgress?.((i + 1) / frames * 0.7, `Rendering frame ${i + 1}/${frames}`);
  }

  // 2. One shared palette (sampled from several frames) keeps colours stable and avoids flicker.
  const samples = [0, Math.floor(frames / 3), Math.floor((frames * 2) / 3)].map((i) => pixels[i]);
  const merged = new Uint8ClampedArray(samples.reduce((n, s) => n + s.length, 0));
  let off = 0;
  for (const s of samples) {
    merged.set(s, off);
    off += s.length;
  }
  const palette = quantize(merged, 256);

  // 3. Encode.
  const gif = GIFEncoder();
  const delay = Math.round(1000 / o.fps);
  for (let i = 0; i < frames; i++) {
    gif.writeFrame(applyPalette(pixels[i], palette), w, h, { palette: i === 0 ? palette : undefined, delay, repeat: 0 });
    o.onProgress?.(0.7 + ((i + 1) / frames) * 0.3, `Encoding GIF ${i + 1}/${frames}`);
    if (i % 5 === 0) await nextTick();
  }
  gif.finish();
  return new Blob([gif.bytes() as BlobPart], { type: 'image/gif' });
}

export function canExportMp4(): boolean {
  return typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window;
}

export async function exportMp4(svg: string, o: ClipOptions & { minSeconds?: number }): Promise<Blob> {
  if (!canExportMp4()) throw new Error('MP4 export needs Chrome, Edge or Safari 16.4+.');
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
  const { w, h } = exportSize(svg, o.longest);

  // Prefer H.264 (plays everywhere); fall back to VP9-in-MP4 on browsers without an H.264 encoder.
  const candidates: { codec: string; mux: 'avc' | 'vp9' }[] = [
    { codec: 'avc1.640028', mux: 'avc' },
    { codec: 'avc1.4d0028', mux: 'avc' },
    { codec: 'avc1.42001f', mux: 'avc' },
    { codec: 'vp09.00.40.08', mux: 'vp9' },
  ];
  let codec = '';
  let mux: 'avc' | 'vp9' = 'avc';
  for (const c of candidates) {
    const support = await VideoEncoder.isConfigSupported({ codec: c.codec, width: w, height: h, bitrate: 5_000_000, framerate: o.fps }).catch(
      () => ({ supported: false })
    );
    if (support.supported) {
      codec = c.codec;
      mux = c.mux;
      break;
    }
  }
  if (!codec) throw new Error('This browser cannot encode MP4 video. Try Chrome, Edge or Safari.');

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  const bg = o.background ?? '#ffffff';
  const frames = Math.max(2, Math.round(o.seconds * o.fps));
  const frameUs = Math.round(1_000_000 / o.fps);

  // Encode one loop, keep the raw chunks, then repeat them to reach `minSeconds`.
  const chunks: { data: Uint8Array; type: 'key' | 'delta'; ts: number; meta?: EncodedVideoChunkMetadata }[] = [];
  let encodeError: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      chunks.push({ data, type: chunk.type, ts: chunk.timestamp, meta: meta ?? undefined });
    },
    error: (e) => {
      encodeError = e;
    },
  });
  encoder.configure({ codec, width: w, height: h, bitrate: 5_000_000, framerate: o.fps, ...(mux === 'avc' ? { avc: { format: 'avc' as const } } : {}) });

  for (let i = 0; i < frames; i++) {
    await drawFrame(ctx, svg, (i / frames) * o.seconds, w, h, bg);
    const vf = new VideoFrame(canvas, { timestamp: i * frameUs, duration: frameUs });
    encoder.encode(vf, { keyFrame: i === 0 });
    vf.close();
    o.onProgress?.(((i + 1) / frames) * 0.9, `Rendering frame ${i + 1}/${frames}`);
    if (encodeError) throw encodeError;
  }
  await encoder.flush();
  encoder.close();
  if (encodeError) throw encodeError;

  const loops = Math.max(1, Math.ceil((o.minSeconds ?? 0) / o.seconds));
  const loopUs = frames * frameUs;
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: mux, width: w, height: h, frameRate: o.fps },
    fastStart: 'in-memory',
  });
  const decoderMeta = chunks.find((c) => c.meta?.decoderConfig)?.meta;
  for (let l = 0; l < loops; l++) {
    chunks.forEach((c, i) => {
      muxer.addVideoChunkRaw(c.data, c.type, l * loopUs + c.ts, frameUs, l === 0 && i === 0 ? decoderMeta : undefined);
    });
  }
  muxer.finalize();
  o.onProgress?.(1, 'Done');
  return new Blob([muxer.target.buffer], { type: 'video/mp4' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
