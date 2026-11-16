// lib/qr-frames-deco.ts
// 50 decorative QR frames (luxury, fantasy, gaming, nature, paper & print). Each frame is built
// from a recipe: mat colour + background pattern + edge style + corner ornaments + a top emblem
// + a label banner. Everything is vector SVG sized to the QR, so frames stay sharp at any size.
//
// Scannability: the QR always sits on a plain panel (the user's background colour) with a
// quiet zone; ornaments live only in the outer bands around it.

export type DecoGroup = 'luxury' | 'fantasy' | 'gaming' | 'nature' | 'paper';

export const DECO_GROUPS: { id: DecoGroup; label: string }[] = [
  { id: 'luxury', label: 'Luxury' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'gaming', label: 'Gaming & Tech' },
  { id: 'nature', label: 'Nature' },
  { id: 'paper', label: 'Paper & Print' },
];

type Fill = string | [string, string] | [string, string, string];

type Pattern =
  | 'none' | 'filigree' | 'stripes' | 'pearls' | 'deco-fan' | 'argyle' | 'marble' | 'stars' | 'leaves' | 'petals'
  | 'thorns' | 'sparkles' | 'fireflies' | 'embers' | 'flowers' | 'waves' | 'runes' | 'grid' | 'checker' | 'scanlines'
  | 'circuit' | 'hazard' | 'maple' | 'speckle' | 'dots' | 'seigaiha' | 'clouds' | 'halftone' | 'memphis' | 'lines';

type Border =
  | 'double' | 'ornate' | 'pearls' | 'deco' | 'simple' | 'gothic' | 'thorn' | 'vine' | 'neon' | 'pixel' | 'hud' | 'chrome'
  | 'glitch' | 'bevel' | 'mecha' | 'scallop' | 'stamp' | 'torn' | 'film' | 'sketch' | 'comic' | 'kintsugi' | 'cartridge';

type Corner =
  | 'none' | 'flourish' | 'diamond' | 'pearl' | 'fan' | 'flower' | 'fleur' | 'star' | 'leaf' | 'sakura' | 'thorn' | 'crystal'
  | 'cloud' | 'flame' | 'butterfly' | 'shell' | 'gem' | 'bracket' | 'heart' | 'triangle' | 'sparkle' | 'pad' | 'bolt'
  | 'wildflower' | 'maple' | 'wave' | 'pressed' | 'mushroom' | 'sprig' | 'sunflower' | 'fern' | 'crosshair' | 'doodle'
  | 'burst' | 'memphis';

type Top =
  | 'none' | 'crown' | 'gem' | 'pearl' | 'deco-sun' | 'crest' | 'rose' | 'arch' | 'moon' | 'diamond-line' | 'laurel'
  | 'sakura' | 'eye' | 'crystal' | 'forest-moon' | 'zodiac' | 'torii' | 'phoenix' | 'butterfly' | 'trident' | 'sword'
  | 'invader' | 'pixel-sword' | 'hud' | 'vapor-sun' | 'cartridge' | 'sparkle' | 'chip' | 'vhs' | 'titlebar' | 'mecha'
  | 'flowers' | 'maple' | 'wave' | 'tape' | 'cottage' | 'sprig' | 'sunflower' | 'cloud-sun' | 'fern' | 'postmark'
  | 'film' | 'dimension' | 'doodle' | 'burst' | 'masthead' | 'seal' | 'kintsugi';

type Banner =
  | 'ribbon' | 'plaque' | 'pill' | 'deco' | 'scroll' | 'ema' | 'pixel' | 'hud' | 'tape' | 'speech' | 'title-block' | 'text'
  | 'newspaper' | 'bevel' | 'cart' | 'label' | 'stamp' | 'shadow-pill' | 'tag';

type Font = 'serif' | 'sans' | 'mono' | 'display' | 'hand' | 'gothic' | 'script';

interface Recipe {
  mat: Fill;
  /** Ornament / line colour */
  ink: string;
  /** Secondary ornament colour */
  ink2: string;
  /** Banner text colour */
  text: string;
  pattern: Pattern;
  border: Border;
  corner: Corner;
  top: Top;
  banner: Banner;
  font: Font;
  /** Panel outline colour (defaults to ink) */
  panelLine?: string;
}

export interface DecoFrame {
  id: string;
  label: string;
  group: DecoGroup;
  defaultText: string;
  /** Default banner colour (copied into the Frame Color picker) */
  accent: string;
  r: Recipe;
}

const f = (
  id: string,
  label: string,
  group: DecoGroup,
  defaultText: string,
  accent: string,
  r: Recipe
): DecoFrame => ({ id: `deco-${id}`, label, group, defaultText, accent, r });

export const DECO_FRAMES: DecoFrame[] = [
  // ── Luxury ──
  f('royal-gold', 'Royal Gold Filigree', 'luxury', 'EXCLUSIVE ACCESS', '#c9a03a', { mat: ['#4a0f1a', '#2a0710'], ink: '#d4a537', ink2: '#f3d98b', text: '#2a0710', pattern: 'filigree', border: 'ornate', corner: 'flourish', top: 'crown', banner: 'ribbon', font: 'serif' }),
  f('black-gold', 'Black & Gold Elite', 'luxury', 'VIP MEMBERS ONLY', '#c9a54e', { mat: ['#16161a', '#050506'], ink: '#c9a54e', ink2: '#f0d78c', text: '#0b0b0c', pattern: 'stripes', border: 'double', corner: 'diamond', top: 'gem', banner: 'plaque', font: 'serif' }),
  f('pearl', 'Pearl Elegance', 'luxury', 'SCAN TO VIEW', '#b9a690', { mat: ['#fbf8f3', '#efe7dc'], ink: '#b9a690', ink2: '#ffffff', text: '#ffffff', pattern: 'pearls', border: 'pearls', corner: 'pearl', top: 'pearl', banner: 'pill', font: 'serif' }),
  f('art-deco', 'Art Deco', 'luxury', 'GRAND OPENING', '#d4af37', { mat: ['#14161c', '#0a0b0f'], ink: '#d4af37', ink2: '#f5e2a0', text: '#0a0b0f', pattern: 'deco-fan', border: 'deco', corner: 'fan', top: 'deco-sun', banner: 'deco', font: 'display' }),
  f('emerald', 'Emerald Royal', 'luxury', 'ROYAL INVITATION', '#d9b45a', { mat: ['#0e4a37', '#06261c'], ink: '#d9b45a', ink2: '#f6e3a8', text: '#06261c', pattern: 'argyle', border: 'ornate', corner: 'flourish', top: 'crest', banner: 'ribbon', font: 'serif' }),
  f('rose-gold', 'Rose Gold Luxe', 'luxury', 'SCAN WITH LOVE', '#b76e79', { mat: ['#fbe9e4', '#f2d3cc'], ink: '#b76e79', ink2: '#e8b4a8', text: '#ffffff', pattern: 'marble', border: 'double', corner: 'flower', top: 'rose', banner: 'pill', font: 'script' }),
  f('gothic-silver', 'Gothic Silver', 'luxury', 'ENTER THE HALL', '#aeb4bf', { mat: ['#1b1b22', '#0b0b0f'], ink: '#c0c4cc', ink2: '#7b8190', text: '#0b0b0f', pattern: 'none', border: 'gothic', corner: 'fleur', top: 'arch', banner: 'plaque', font: 'gothic' }),
  f('celestial', 'Celestial Crown', 'luxury', 'WRITTEN IN THE STARS', '#e0b860', { mat: ['#16245a', '#0a1233'], ink: '#e0b860', ink2: '#fff3c4', text: '#0a1233', pattern: 'stars', border: 'double', corner: 'star', top: 'moon', banner: 'ribbon', font: 'serif' }),
  f('champagne', 'Champagne Minimal', 'luxury', 'SCAN ME', '#b08d57', { mat: '#f4ead8', ink: '#b08d57', ink2: '#d8c3a0', text: '#b08d57', pattern: 'none', border: 'simple', corner: 'none', top: 'diamond-line', banner: 'text', font: 'serif' }),
  f('botanical-royal', 'Botanical Royal', 'luxury', 'ROYAL GARDEN', '#3f5d3a', { mat: ['#f6f0e3', '#ebe1cc'], ink: '#3f5d3a', ink2: '#b08d57', text: '#f6f0e3', pattern: 'leaves', border: 'double', corner: 'leaf', top: 'laurel', banner: 'ribbon', font: 'serif' }),

  // ── Fantasy ──
  f('sakura', 'Sakura Blossom', 'fantasy', 'SPRING IN BLOOM', '#e26d8f', { mat: ['#fff0f5', '#fbd9e6'], ink: '#e26d8f', ink2: '#6b3e2e', text: '#ffffff', pattern: 'petals', border: 'simple', corner: 'sakura', top: 'sakura', banner: 'pill', font: 'serif' }),
  f('dark-fantasy', 'Dark Fantasy', 'fantasy', 'ENTER IF YOU DARE', '#8b1e3f', { mat: ['#1c0d1d', '#08040a'], ink: '#8b1e3f', ink2: '#c9a7b4', text: '#f3e3ea', pattern: 'thorns', border: 'thorn', corner: 'thorn', top: 'eye', banner: 'plaque', font: 'gothic' }),
  f('crystal', 'Crystal Magic', 'fantasy', 'UNLOCK THE MAGIC', '#8b5cf6', { mat: ['#2a1a5e', '#120a30'], ink: '#a78bfa', ink2: '#67e8f9', text: '#ffffff', pattern: 'sparkles', border: 'neon', corner: 'crystal', top: 'crystal', banner: 'deco', font: 'serif' }),
  f('enchanted', 'Enchanted Forest', 'fantasy', 'FOLLOW THE LIGHT', '#4d7c3a', { mat: ['#173826', '#0a1c12'], ink: '#9bd17b', ink2: '#fde68a', text: '#f0fdf4', pattern: 'fireflies', border: 'vine', corner: 'leaf', top: 'forest-moon', banner: 'scroll', font: 'serif' }),
  f('zodiac', 'Zodiac Circle', 'fantasy', 'READ YOUR STARS', '#d4b16a', { mat: ['#13263d', '#08121f'], ink: '#d4b16a', ink2: '#f4e2b2', text: '#08121f', pattern: 'stars', border: 'double', corner: 'star', top: 'zodiac', banner: 'ribbon', font: 'serif' }),
  f('shrine', 'Shrine Gate', 'fantasy', 'SCAN FOR BLESSINGS', '#c0392b', { mat: ['#fbf3e8', '#f1e3cf'], ink: '#c0392b', ink2: '#2b2b2b', text: '#ffffff', pattern: 'none', border: 'simple', corner: 'cloud', top: 'torii', banner: 'ema', font: 'serif' }),
  f('phoenix', 'Phoenix Flame', 'fantasy', 'RISE AGAIN', '#ea580c', { mat: ['#3a0d06', '#140302'], ink: '#f97316', ink2: '#fbbf24', text: '#ffffff', pattern: 'embers', border: 'double', corner: 'flame', top: 'phoenix', banner: 'ribbon', font: 'serif' }),
  f('butterfly', 'Butterfly Garden', 'fantasy', 'SCAN & FLUTTER', '#8b5cf6', { mat: ['#fdf8ec', '#f1ead6'], ink: '#8b5cf6', ink2: '#f472b6', text: '#ffffff', pattern: 'flowers', border: 'scallop', corner: 'butterfly', top: 'butterfly', banner: 'pill', font: 'serif' }),
  f('ocean-kingdom', 'Ocean Kingdom', 'fantasy', 'DIVE IN', '#2dd4bf', { mat: ['#0b3a52', '#041a26'], ink: '#e8c872', ink2: '#5eead4', text: '#041a26', pattern: 'waves', border: 'double', corner: 'shell', top: 'trident', banner: 'ribbon', font: 'serif' }),
  f('artifact', 'Legendary Artifact', 'fantasy', 'CLAIM YOUR REWARD', '#c9a54e', { mat: ['#2a2622', '#12100e'], ink: '#c9a54e', ink2: '#5eead4', text: '#12100e', pattern: 'runes', border: 'ornate', corner: 'gem', top: 'sword', banner: 'plaque', font: 'serif' }),

  // ── Gaming & Tech ──
  f('neon-arcade', 'Neon Arcade', 'gaming', 'INSERT COIN', '#ff2d95', { mat: ['#140a2a', '#05020c'], ink: '#ff2d95', ink2: '#22d3ee', text: '#ffffff', pattern: 'grid', border: 'neon', corner: 'bracket', top: 'invader', banner: 'pixel', font: 'mono' }),
  f('pixel-quest', 'Pixel Quest', 'gaming', 'PRESS START', '#ffcc00', { mat: '#1d2b53', ink: '#ffcc00', ink2: '#ff004d', text: '#1d2b53', pattern: 'checker', border: 'pixel', corner: 'heart', top: 'pixel-sword', banner: 'pixel', font: 'mono' }),
  f('cyber-hud', 'Cyber HUD', 'gaming', 'ACCESS GRANTED', '#00e5ff', { mat: ['#06202c', '#020a10'], ink: '#00e5ff', ink2: '#ff3d71', text: '#020a10', pattern: 'scanlines', border: 'hud', corner: 'bracket', top: 'hud', banner: 'hud', font: 'mono' }),
  f('vaporwave', 'Vaporwave Geometry', 'gaming', 'A E S T H E T I C', '#ff71ce', { mat: ['#3b1066', '#ff71ce', '#01cdfe'], ink: '#fffb96', ink2: '#05ffa1', text: '#2b0b4f', pattern: 'grid', border: 'simple', corner: 'triangle', top: 'vapor-sun', banner: 'shadow-pill', font: 'display' }),
  f('cartridge', 'Game Cartridge', 'gaming', 'PLAYER 1 READY', '#e11d48', { mat: ['#7a7a84', '#55555d'], ink: '#3f3f46', ink2: '#a1a1aa', text: '#ffffff', pattern: 'none', border: 'cartridge', corner: 'none', top: 'cartridge', banner: 'cart', font: 'display' }),
  f('holo-chrome', 'Holographic Chrome', 'gaming', 'SCAN THE FUTURE', '#a78bfa', { mat: ['#ffd1f7', '#c7f9ff', '#fff6b8'], ink: '#7c6cf0', ink2: '#ffffff', text: '#ffffff', pattern: 'none', border: 'chrome', corner: 'sparkle', top: 'sparkle', banner: 'pill', font: 'display' }),
  f('circuit', 'Circuit Board', 'gaming', 'SYSTEM ONLINE', '#d4a24c', { mat: ['#0f4a2b', '#062615'], ink: '#d4a24c', ink2: '#6ee7b7', text: '#062615', pattern: 'circuit', border: 'simple', corner: 'pad', top: 'chip', banner: 'plaque', font: 'mono' }),
  f('vhs', 'VHS Glitch', 'gaming', 'PLAY ▶ REWIND', '#f5f5f5', { mat: ['#18181b', '#09090b'], ink: '#ff3b5c', ink2: '#2de2e6', text: '#111111', pattern: 'scanlines', border: 'glitch', corner: 'none', top: 'vhs', banner: 'tape', font: 'mono' }),
  f('terminal-98', 'Terminal 98', 'gaming', 'CLICK TO OPEN', '#c0c0c0', { mat: '#c0c0c0', ink: '#000080', ink2: '#1084d0', text: '#000000', pattern: 'none', border: 'bevel', corner: 'none', top: 'titlebar', banner: 'bevel', font: 'sans' }),
  f('mecha', 'Mecha Frame', 'gaming', 'SYSTEMS ARMED', '#f59e0b', { mat: ['#353a43', '#1c1f24'], ink: '#f59e0b', ink2: '#9ca3af', text: '#1c1f24', pattern: 'hazard', border: 'mecha', corner: 'bolt', top: 'mecha', banner: 'hud', font: 'mono' }),

  // ── Nature ──
  f('wildflower', 'Wildflower', 'nature', 'PICK ME', '#d97706', { mat: ['#fdf9ee', '#f5eedb'], ink: '#4d7c3a', ink2: '#d97706', text: '#ffffff', pattern: 'none', border: 'simple', corner: 'wildflower', top: 'flowers', banner: 'ribbon', font: 'serif' }),
  f('autumn', 'Autumn Leaves', 'nature', 'FALL IN', '#c2410c', { mat: ['#fdf3e3', '#f6e3c6'], ink: '#c2410c', ink2: '#ca8a04', text: '#ffffff', pattern: 'maple', border: 'simple', corner: 'maple', top: 'maple', banner: 'tag', font: 'serif' }),
  f('ocean-waves', 'Ocean Waves', 'nature', 'CATCH THE WAVE', '#0e7490', { mat: ['#eaf7fb', '#cdebf3'], ink: '#0e7490', ink2: '#67c5d9', text: '#ffffff', pattern: 'lines', border: 'scallop', corner: 'wave', top: 'wave', banner: 'pill', font: 'serif' }),
  f('pressed', 'Pressed Flowers', 'nature', 'from the garden', '#8a6d55', { mat: '#f7f1e3', ink: '#8a6d55', ink2: '#c084a0', text: '#5b4636', pattern: 'speckle', border: 'simple', corner: 'pressed', top: 'tape', banner: 'label', font: 'hand' }),
  f('mushroom', 'Mushroom Cottage', 'nature', 'COME ON IN', '#b91c1c', { mat: ['#f6eedb', '#ebdfc4'], ink: '#b91c1c', ink2: '#6b4f2e', text: '#ffffff', pattern: 'dots', border: 'scallop', corner: 'mushroom', top: 'cottage', banner: 'plaque', font: 'serif' }),
  f('eucalyptus', 'Eucalyptus', 'nature', 'SCAN TO VIEW', '#5f7f6f', { mat: '#f2f6f3', ink: '#5f7f6f', ink2: '#a8c3b5', text: '#5f7f6f', pattern: 'none', border: 'simple', corner: 'sprig', top: 'sprig', banner: 'text', font: 'serif' }),
  f('sunflower', 'Sunflower', 'nature', 'HELLO SUNSHINE', '#e0a800', { mat: ['#fffaeb', '#fff0c2'], ink: '#e0a800', ink2: '#6b4423', text: '#4a2f18', pattern: 'dots', border: 'scallop', corner: 'sunflower', top: 'sunflower', banner: 'ribbon', font: 'serif' }),
  f('seigaiha', 'Seigaiha Waves', 'nature', 'SCAN HERE', '#c0392b', { mat: '#1e3a5f', ink: '#ffffff', ink2: '#c0392b', text: '#ffffff', pattern: 'seigaiha', border: 'double', corner: 'none', top: 'wave', banner: 'ema', font: 'serif' }),
  f('cloudscape', 'Cloudscape', 'nature', 'HEAD IN THE CLOUDS', '#3b82f6', { mat: ['#bfe3ff', '#eef8ff'], ink: '#ffffff', ink2: '#fbbf24', text: '#ffffff', pattern: 'clouds', border: 'simple', corner: 'cloud', top: 'cloud-sun', banner: 'pill', font: 'sans' }),
  f('fern-archive', 'Fern Archive', 'nature', 'SPECIMEN No. 042', '#3d5a3a', { mat: ['#eef0e4', '#e2e5d3'], ink: '#3d5a3a', ink2: '#8a8f6a', text: '#3d5a3a', pattern: 'speckle', border: 'double', corner: 'fern', top: 'fern', banner: 'title-block', font: 'mono' }),

  // ── Paper & Print ──
  f('postage', 'Postage Stamp', 'paper', 'SCAN TO SEND', '#b91c1c', { mat: '#fffdf7', ink: '#b91c1c', ink2: '#1f2937', text: '#b91c1c', pattern: 'none', border: 'stamp', corner: 'none', top: 'postmark', banner: 'stamp', font: 'serif' }),
  f('torn-paper', 'Torn Paper', 'paper', 'SCAN ME', '#f2c94c', { mat: '#f6f1e6', ink: '#8a7d68', ink2: '#f2c94c', text: '#3b3326', pattern: 'speckle', border: 'torn', corner: 'none', top: 'tape', banner: 'tape', font: 'hand' }),
  f('film-negative', 'Film Negative', 'paper', 'FRAME 24 · SCAN', '#f59e0b', { mat: '#1a1a1a', ink: '#f59e0b', ink2: '#3a3a3a', text: '#f59e0b', pattern: 'none', border: 'film', corner: 'none', top: 'film', banner: 'text', font: 'mono' }),
  f('blueprint', 'Blueprint', 'paper', 'PROJECT QR-01', '#e3f0ff', { mat: '#1f4e8c', ink: '#e3f0ff', ink2: '#8fb8ec', text: '#e3f0ff', pattern: 'grid', border: 'double', corner: 'crosshair', top: 'dimension', banner: 'title-block', font: 'mono' }),
  f('doodle', 'Doodle Sketch', 'paper', 'scan me!', '#222222', { mat: '#fffdf7', ink: '#222222', ink2: '#f43f5e', text: '#222222', pattern: 'none', border: 'sketch', corner: 'doodle', top: 'doodle', banner: 'label', font: 'hand' }),
  f('comic', 'Comic Explosion', 'paper', 'SCAN NOW!', '#ef4444', { mat: '#ffe14d', ink: '#111111', ink2: '#ef4444', text: '#111111', pattern: 'halftone', border: 'comic', corner: 'burst', top: 'burst', banner: 'speech', font: 'display' }),
  f('newspaper', 'Newspaper Archive', 'paper', 'EXTRA! SCAN FOR THE STORY', '#1b1b1b', { mat: '#f2ead8', ink: '#1b1b1b', ink2: '#6b6250', text: '#f2ead8', pattern: 'none', border: 'double', corner: 'none', top: 'masthead', banner: 'newspaper', font: 'serif' }),
  f('memphis', 'Memphis Cutouts', 'paper', 'SCAN ME', '#ff6b9a', { mat: '#fff6e5', ink: '#111111', ink2: '#ffcf33', text: '#ffffff', pattern: 'memphis', border: 'simple', corner: 'memphis', top: 'none', banner: 'shadow-pill', font: 'display' }),
  f('kintsugi', 'Kintsugi', 'paper', 'BEAUTY IN THE CRACKS', '#d4a537', { mat: ['#2b2e33', '#16181b'], ink: '#d4a537', ink2: '#f3d98b', text: '#16181b', pattern: 'none', border: 'kintsugi', corner: 'none', top: 'kintsugi', banner: 'plaque', font: 'serif' }),
  f('wax-seal', 'Wax Seal Letter', 'paper', 'Yours sincerely', '#8b1e1e', { mat: ['#f3e8cf', '#e6d6b2'], ink: '#8b1e1e', ink2: '#6b5434', text: '#6b5434', pattern: 'speckle', border: 'double', corner: 'none', top: 'seal', banner: 'text', font: 'script' }),
];

export const DECO_FRAME_MAP: Record<string, DecoFrame> = Object.fromEntries(DECO_FRAMES.map((d) => [d.id, d]));

export const isDecoFrame = (id: string) => id.startsWith('deco-');

// ── helpers ─────────────────────────────────────────────────────

const n = (v: number) => Number(v.toFixed(2));

function rnd(i: number, salt: number): number {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

const FONTS: Record<Font, string> = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "Tahoma, 'Segoe UI', system-ui, sans-serif",
  mono: "'Courier New', ui-monospace, Menlo, Consolas, monospace",
  display: "Impact, 'Arial Black', 'Helvetica Neue', sans-serif",
  hand: "'Segoe Print', 'Comic Sans MS', 'Chalkboard SE', cursive",
  gothic: "'Old English Text MT', 'UnifrakturMaguntia', Georgia, serif",
  script: "'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive",
};

function text(x: number, y: number, s: string, size: number, fill: string, font: Font, o: { max?: number; weight?: number; spacing?: number; anchor?: string; italic?: boolean } = {}): string {
  const est = s.length * size * (font === 'mono' ? 0.62 : font === 'display' ? 0.55 : 0.6) + (o.spacing ?? 0) * s.length;
  const fit = o.max && est > o.max ? ` textLength="${n(o.max)}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${n(x)}" y="${n(y)}" text-anchor="${o.anchor ?? 'middle'}" font-family="${FONTS[font]}" font-size="${n(size)}" font-weight="${o.weight ?? 700}"${o.italic ? ' font-style="italic"' : ''}${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${fit} fill="${fill}">${s}</text>`;
}

function pixelRect(x: number, y: number, w: number, h: number, s: number): string {
  return `M${n(x + s)},${n(y)} H${n(x + w - s)} V${n(y + s)} H${n(x + w)} V${n(y + h - s)} H${n(x + w - s)} V${n(y + h)} H${n(x + s)} V${n(y + h - s)} H${n(x)} V${n(y + s)} H${n(x + s)} Z`;
}

function chamfer(x: number, y: number, w: number, h: number, c: number): string {
  return `M${n(x + c)},${n(y)} H${n(x + w - c)} L${n(x + w)},${n(y + c)} V${n(y + h - c)} L${n(x + w - c)},${n(y + h)} H${n(x + c)} L${n(x)},${n(y + h - c)} V${n(y + c)} Z`;
}

function star(cx: number, cy: number, r: number, fill: string, points = 5, inner = 0.45): string {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const a = (i * Math.PI) / points - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * rr)},${n(cy + Math.sin(a) * rr)}`;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
}

function sparkle(cx: number, cy: number, r: number, fill: string): string {
  const k = r * 0.22;
  return `<path d="M${n(cx)},${n(cy - r)} Q${n(cx + k)},${n(cy - k)} ${n(cx + r)},${n(cy)} Q${n(cx + k)},${n(cy + k)} ${n(cx)},${n(cy + r)} Q${n(cx - k)},${n(cy + k)} ${n(cx - r)},${n(cy)} Q${n(cx - k)},${n(cy - k)} ${n(cx)},${n(cy - r)} Z" fill="${fill}"/>`;
}

function flower(cx: number, cy: number, r: number, petals: number, fill: string, centre: string, rot = 0): string {
  let s = '';
  for (let i = 0; i < petals; i++) {
    const a = rot + (i * 360) / petals;
    s += `<ellipse cx="${n(cx)}" cy="${n(cy - r * 0.55)}" rx="${n(r * 0.32)}" ry="${n(r * 0.55)}" fill="${fill}" transform="rotate(${n(a)} ${n(cx)} ${n(cy)})"/>`;
  }
  return `${s}<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 0.28)}" fill="${centre}"/>`;
}

function leaf(cx: number, cy: number, len: number, rot: number, fill: string): string {
  return `<path d="M0,0 C${n(len * 0.35)},${n(-len * 0.32)} ${n(len * 0.75)},${n(-len * 0.25)} ${n(len)},0 C${n(len * 0.75)},${n(len * 0.25)} ${n(len * 0.35)},${n(len * 0.32)} 0,0 Z" fill="${fill}" transform="translate(${n(cx)},${n(cy)}) rotate(${n(rot)})"/>`;
}

function maple(cx: number, cy: number, r: number, fill: string, rot = 0): string {
  const pts: string[] = [];
  const spikes = [1, 0.5, 0.85, 0.45, 1, 0.45, 0.85, 0.5, 1, 0.42, 0.3, 0.42];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${n(cx + Math.cos(a) * r * spikes[i])},${n(cy + Math.sin(a) * r * spikes[i])}`);
  }
  return `<g transform="rotate(${rot} ${n(cx)} ${n(cy)})"><polygon points="${pts.join(' ')}" fill="${fill}"/><line x1="${n(cx)}" y1="${n(cy)}" x2="${n(cx)}" y2="${n(cy + r * 1.1)}" stroke="${fill}" stroke-width="${n(r * 0.12)}"/></g>`;
}

function butterfly(cx: number, cy: number, r: number, c1: string, c2: string): string {
  return `<g transform="translate(${n(cx)},${n(cy)})"><path d="M0,0 C${n(-r * 0.4)},${n(-r * 1.1)} ${n(-r * 1.3)},${n(-r * 0.9)} ${n(-r * 0.9)},${n(-r * 0.1)} C${n(-r * 1.2)},${n(r * 0.6)} ${n(-r * 0.4)},${n(r * 0.9)} 0,${n(r * 0.15)} Z" fill="${c1}"/><path d="M0,0 C${n(r * 0.4)},${n(-r * 1.1)} ${n(r * 1.3)},${n(-r * 0.9)} ${n(r * 0.9)},${n(-r * 0.1)} C${n(r * 1.2)},${n(r * 0.6)} ${n(r * 0.4)},${n(r * 0.9)} 0,${n(r * 0.15)} Z" fill="${c2}"/><rect x="${n(-r * 0.07)}" y="${n(-r * 0.5)}" width="${n(r * 0.14)}" height="${n(r * 0.9)}" rx="${n(r * 0.07)}" fill="#3b2a20"/></g>`;
}

function cloud(cx: number, cy: number, r: number, fill: string): string {
  return `<g fill="${fill}"><circle cx="${n(cx - r * 0.6)}" cy="${n(cy + r * 0.15)}" r="${n(r * 0.5)}"/><circle cx="${n(cx)}" cy="${n(cy - r * 0.15)}" r="${n(r * 0.65)}"/><circle cx="${n(cx + r * 0.65)}" cy="${n(cy + r * 0.12)}" r="${n(r * 0.48)}"/><rect x="${n(cx - r * 0.95)}" y="${n(cy + r * 0.1)}" width="${n(r * 1.9)}" height="${n(r * 0.55)}" rx="${n(r * 0.27)}"/></g>`;
}

function mushroom(cx: number, cy: number, r: number, cap: string, stem: string): string {
  return `<path d="M${n(cx - r * 0.3)},${n(cy)} Q${n(cx - r * 0.35)},${n(cy + r * 0.9)} ${n(cx)},${n(cy + r * 0.95)} Q${n(cx + r * 0.35)},${n(cy + r * 0.9)} ${n(cx + r * 0.3)},${n(cy)} Z" fill="${stem}"/><path d="M${n(cx - r)},${n(cy + r * 0.05)} Q${n(cx - r)},${n(cy - r * 0.95)} ${n(cx)},${n(cy - r * 0.95)} Q${n(cx + r)},${n(cy - r * 0.95)} ${n(cx + r)},${n(cy + r * 0.05)} Z" fill="${cap}"/><circle cx="${n(cx - r * 0.4)}" cy="${n(cy - r * 0.35)}" r="${n(r * 0.16)}" fill="#fff"/><circle cx="${n(cx + r * 0.3)}" cy="${n(cy - r * 0.55)}" r="${n(r * 0.12)}" fill="#fff"/><circle cx="${n(cx + r * 0.5)}" cy="${n(cy - r * 0.1)}" r="${n(r * 0.1)}" fill="#fff"/>`;
}

function sunflower(cx: number, cy: number, r: number, petal: string, centre: string): string {
  let s = '';
  for (let i = 0; i < 14; i++) s += `<ellipse cx="${n(cx)}" cy="${n(cy - r * 0.62)}" rx="${n(r * 0.17)}" ry="${n(r * 0.4)}" fill="${petal}" transform="rotate(${n((i * 360) / 14)} ${n(cx)} ${n(cy)})"/>`;
  return `${s}<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 0.36)}" fill="${centre}"/>`;
}

function shell(cx: number, cy: number, r: number, fill: string, line: string): string {
  let ribs = '';
  for (let i = -2; i <= 2; i++) ribs += `<line x1="${n(cx)}" y1="${n(cy + r * 0.7)}" x2="${n(cx + i * r * 0.38)}" y2="${n(cy - r * 0.55 + Math.abs(i) * r * 0.12)}" stroke="${line}" stroke-width="${n(r * 0.07)}"/>`;
  return `<path d="M${n(cx)},${n(cy + r * 0.75)} L${n(cx - r * 0.95)},${n(cy - r * 0.15)} Q${n(cx - r * 0.7)},${n(cy - r * 0.9)} ${n(cx)},${n(cy - r * 0.8)} Q${n(cx + r * 0.7)},${n(cy - r * 0.9)} ${n(cx + r * 0.95)},${n(cy - r * 0.15)} Z" fill="${fill}"/>${ribs}`;
}

function flame(cx: number, cy: number, r: number, outer: string, inner: string): string {
  return `<path d="M${n(cx)},${n(cy - r)} C${n(cx + r * 0.25)},${n(cy - r * 0.45)} ${n(cx + r * 0.75)},${n(cy - r * 0.25)} ${n(cx + r * 0.6)},${n(cy + r * 0.35)} C${n(cx + r * 0.5)},${n(cy + r * 0.8)} ${n(cx - r * 0.5)},${n(cy + r * 0.8)} ${n(cx - r * 0.6)},${n(cy + r * 0.35)} C${n(cx - r * 0.7)},${n(cy - r * 0.1)} ${n(cx - r * 0.2)},${n(cy - r * 0.3)} ${n(cx)},${n(cy - r)} Z" fill="${outer}"/><path d="M${n(cx)},${n(cy - r * 0.35)} C${n(cx + r * 0.3)},${n(cy)} ${n(cx + r * 0.35)},${n(cy + r * 0.3)} ${n(cx)},${n(cy + r * 0.55)} C${n(cx - r * 0.35)},${n(cy + r * 0.3)} ${n(cx - r * 0.25)},${n(cy)} ${n(cx)},${n(cy - r * 0.35)} Z" fill="${inner}"/>`;
}

function crystalShape(cx: number, cy: number, r: number, c1: string, c2: string): string {
  return `<path d="M${n(cx)},${n(cy - r)} L${n(cx + r * 0.45)},${n(cy - r * 0.35)} L${n(cx + r * 0.3)},${n(cy + r * 0.85)} L${n(cx - r * 0.3)},${n(cy + r * 0.85)} L${n(cx - r * 0.45)},${n(cy - r * 0.35)} Z" fill="${c1}"/><path d="M${n(cx)},${n(cy - r)} L${n(cx + r * 0.45)},${n(cy - r * 0.35)} L${n(cx)},${n(cy - r * 0.15)} Z" fill="${c2}" opacity=".85"/><path d="M${n(cx)},${n(cy - r * 0.15)} L${n(cx)},${n(cy + r * 0.85)}" stroke="${c2}" stroke-width="${n(r * 0.06)}" opacity=".7"/>`;
}

function flourish(x: number, y: number, s: number, sx: number, sy: number, c: string): string {
  // A scroll curl pointing into the corner (sx/sy = ±1 mirror).
  return `<g transform="translate(${n(x)},${n(y)}) scale(${sx},${sy})" fill="none" stroke="${c}" stroke-width="${n(s * 0.07)}" stroke-linecap="round"><path d="M${n(s * 1.1)},0 C${n(s * 0.55)},0 ${n(s * 0.2)},${n(s * 0.15)} ${n(s * 0.2)},${n(s * 0.45)} C${n(s * 0.2)},${n(s * 0.7)} ${n(s * 0.48)},${n(s * 0.72)} ${n(s * 0.5)},${n(s * 0.5)} C${n(s * 0.52)},${n(s * 0.32)} ${n(s * 0.34)},${n(s * 0.3)} ${n(s * 0.33)},${n(s * 0.42)}"/><path d="M0,${n(s * 1.1)} C0,${n(s * 0.55)} ${n(s * 0.15)},${n(s * 0.2)} ${n(s * 0.45)},${n(s * 0.2)}"/><circle cx="${n(s * 0.08)}" cy="${n(s * 0.08)}" r="${n(s * 0.07)}" fill="${c}" stroke="none"/></g>`;
}

// ── renderer ────────────────────────────────────────────────────

export interface DecoRenderOptions {
  uid: string;
  W: number;
  H: number;
  /** QR modules box */
  qx: number;
  qy: number;
  qs: number;
  /** Banner colour (user's Frame Color) */
  accent: string;
  /** Already XML-escaped label */
  label: string;
  /** Fill behind the QR (user's background) */
  cardFill: string;
  transparent: boolean;
}

/** Extra side padding the studio adds around the QR for decorative frames. */
export const DECO_SIDE_PAD = 26;
export const DECO_TOP_SPACE = 58;

export function renderDecoFrame(id: string, o: DecoRenderOptions): { back: string; front: string } {
  const d = DECO_FRAME_MAP[id];
  if (!d) return { back: '', front: '' };
  const r = d.r;
  const { W, H, uid } = o;
  const u = `df${uid.replace(/[^a-z0-9]/gi, '')}`;
  const A = o.accent;
  const ink = r.ink;
  const ink2 = r.ink2;
  const cx = W / 2;
  const P = { x: o.qx - 20, y: o.qy - 20, w: o.qs + 40, h: o.qs + 40 };
  const by = H - 50; // banner centre
  const bh = 42;
  const bx0 = 50;
  const bx1 = W - 50;
  const defs: string[] = [];

  // Mat fill
  let matFill: string;
  if (Array.isArray(r.mat)) {
    const stops = r.mat.map((c, i) => `<stop offset="${n(i / (r.mat.length - 1))}" stop-color="${c}"/>`).join('');
    defs.push(`<linearGradient id="${u}mat" x1="0" y1="0" x2="${r.mat.length === 3 ? 1 : 0.35}" y2="1">${stops}</linearGradient>`);
    matFill = `url(#${u}mat)`;
  } else matFill = r.mat;

  // Mat shape (edge style)
  const R = 22;
  let matPath = `M${R},2 H${W - R} Q${W - 2},2 ${W - 2},${R} V${H - R} Q${W - 2},${H - 2} ${W - R},${H - 2} H${R} Q2,${H - 2} 2,${H - R} V${R} Q2,2 ${R},2 Z`;
  if (r.border === 'scallop') {
    const step = 18;
    const nx = Math.max(6, Math.round((W - 12) / step));
    const ny = Math.max(6, Math.round((H - 12) / step));
    const sx = (W - 12) / nx;
    const sy = (H - 12) / ny;
    let p = `M6,6`;
    for (let i = 0; i < nx; i++) p += ` A${n(sx / 2)},${n(sx / 2.4)} 0 0 1 ${n(6 + sx * (i + 1))},6`;
    for (let i = 0; i < ny; i++) p += ` A${n(sy / 2.4)},${n(sy / 2)} 0 0 1 ${W - 6},${n(6 + sy * (i + 1))}`;
    for (let i = 0; i < nx; i++) p += ` A${n(sx / 2)},${n(sx / 2.4)} 0 0 1 ${n(W - 6 - sx * (i + 1))},${H - 6}`;
    for (let i = 0; i < ny; i++) p += ` A${n(sy / 2.4)},${n(sy / 2)} 0 0 1 6,${n(H - 6 - sy * (i + 1))}`;
    matPath = `${p} Z`;
  } else if (r.border === 'torn') {
    const pts: string[] = [];
    const jag = (len: number, i: number) => (rnd(i, len) - 0.5) * 7;
    for (let x = 4; x <= W - 4; x += 9) pts.push(`${n(x)},${n(6 + jag(1, x))}`);
    for (let y = 6; y <= H - 6; y += 9) pts.push(`${n(W - 6 + jag(2, y))},${n(y)}`);
    for (let x = W - 4; x >= 4; x -= 9) pts.push(`${n(x)},${n(H - 6 + jag(3, x))}`);
    for (let y = H - 6; y >= 6; y -= 9) pts.push(`${n(6 + jag(4, y))},${n(y)}`);
    matPath = `M${pts.join(' L')} Z`;
  } else if (r.border === 'cartridge') {
    matPath = `M14,4 H${W - 52} L${W - 40},16 H${W - 14} Q${W - 4},16 ${W - 4},26 V${H - 14} Q${W - 4},${H - 4} ${W - 14},${H - 4} H14 Q4,${H - 4} 4,${H - 14} V14 Q4,4 14,4 Z`;
  } else if (r.border === 'mecha') {
    matPath = chamfer(3, 3, W - 6, H - 6, 26);
  } else if (r.border === 'film' || r.border === 'bevel' || r.border === 'stamp') {
    matPath = `M3,3 H${W - 3} V${H - 3} H3 Z`;
  } else if (r.border === 'pixel') {
    matPath = pixelRect(3, 3, W - 6, H - 6, 12);
  }

  // ── Background pattern (kept out of the QR panel and the banner) ──
  const keep = (x: number, y: number, pad = 8) =>
    !(x > P.x - pad && x < P.x + P.w + pad && y > P.y - pad && y < P.y + P.h + pad) &&
    !(x > bx0 - 6 && x < bx1 + 6 && y > by - bh / 2 - 6 && y < by + bh / 2 + 6) &&
    x > 10 && x < W - 10 && y > 10 && y < H - 10;
  const scatter = (count: number, salt: number, draw: (x: number, y: number, i: number) => string) => {
    let s = '';
    for (let i = 0; i < count; i++) {
      const x = rnd(i, salt) * W;
      const y = rnd(i, salt + 1) * H;
      if (keep(x, y)) s += draw(x, y, i);
    }
    return s;
  };
  const area = (W * H) / 10000;
  let pattern = '';
  switch (r.pattern) {
    case 'filigree':
      pattern = scatter(Math.round(area * 4), 3, (x, y, i) => `<path d="M${n(x)},${n(y)} c4,-6 10,-6 10,0 c0,5 -6,5 -6,1 M${n(x)},${n(y)} c-4,6 -10,6 -10,0 c0,-5 6,-5 6,-1" fill="none" stroke="${ink}" stroke-width="1" opacity="${n(0.25 + rnd(i, 4) * 0.2)}"/>`);
      break;
    case 'stripes':
      defs.push(`<pattern id="${u}pt" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.2" height="10" fill="${ink}" opacity=".12"/></pattern>`);
      pattern = `<path d="${matPath}" fill="url(#${u}pt)"/>`;
      break;
    case 'pearls':
      pattern = scatter(Math.round(area * 5), 5, (x, y, i) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(1.5 + rnd(i, 6) * 2)}" fill="#ffffff" stroke="${ink}" stroke-width=".5" opacity=".7"/>`);
      break;
    case 'deco-fan': {
      let rays = '';
      for (let i = -10; i <= 10; i++) {
        const a = (i * 8 - 90) * (Math.PI / 180);
        rays += `<line x1="${n(cx)}" y1="${n(H + 20)}" x2="${n(cx + Math.cos(a) * H * 1.6)}" y2="${n(H + 20 + Math.sin(a) * H * 1.6)}" stroke="${ink}" stroke-width="1" opacity=".16"/>`;
      }
      pattern = rays;
      break;
    }
    case 'argyle':
      defs.push(`<pattern id="${u}pt" width="28" height="40" patternUnits="userSpaceOnUse"><path d="M14,0 L28,20 L14,40 L0,20 Z" fill="${ink}" opacity=".08"/><path d="M0,0 L28,40 M28,0 L0,40" stroke="${ink}" stroke-width=".6" opacity=".22"/></pattern>`);
      pattern = `<path d="${matPath}" fill="url(#${u}pt)"/>`;
      break;
    case 'marble':
      pattern = Array.from({ length: 7 }, (_, i) => {
        const y0 = rnd(i, 9) * H;
        return `<path d="M-10,${n(y0)} C${n(W * 0.3)},${n(y0 - 40 + rnd(i, 10) * 80)} ${n(W * 0.6)},${n(y0 - 40 + rnd(i, 11) * 80)} ${W + 10},${n(y0 + (rnd(i, 12) - 0.5) * 60)}" fill="none" stroke="${ink2}" stroke-width="${n(0.6 + rnd(i, 13) * 1.2)}" opacity=".5"/>`;
      }).join('');
      break;
    case 'stars':
    case 'sparkles':
      pattern = scatter(Math.round(area * 7), 15, (x, y, i) =>
        rnd(i, 16) > 0.75 ? sparkle(x, y, 2.5 + rnd(i, 17) * 3, ink2) : `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.6 + rnd(i, 18) * 1)}" fill="${ink2}" opacity="${n(0.5 + rnd(i, 19) * 0.5)}"/>`
      );
      break;
    case 'leaves':
      pattern = scatter(Math.round(area * 3), 21, (x, y, i) => leaf(x, y, 9 + rnd(i, 22) * 6, rnd(i, 23) * 360, ink));
      pattern = `<g opacity=".22">${pattern}</g>`;
      break;
    case 'petals':
      pattern = scatter(Math.round(area * 4), 25, (x, y, i) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="2.4" ry="4.2" fill="${ink}" opacity="${n(0.25 + rnd(i, 26) * 0.35)}" transform="rotate(${n(rnd(i, 27) * 360)} ${n(x)} ${n(y)})"/>`);
      break;
    case 'thorns':
      pattern = scatter(Math.round(area * 3), 29, (x, y, i) => `<path d="M${n(x)},${n(y)} l3,-9 l3,9 Z" fill="${ink}" opacity=".35" transform="rotate(${n(rnd(i, 30) * 360)} ${n(x)} ${n(y)})"/>`);
      break;
    case 'fireflies':
      defs.push(`<radialGradient id="${u}ff"><stop offset="0" stop-color="${ink2}" stop-opacity=".95"/><stop offset="1" stop-color="${ink2}" stop-opacity="0"/></radialGradient>`);
      pattern = scatter(Math.round(area * 4), 31, (x, y, i) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(3 + rnd(i, 32) * 3)}" fill="url(#${u}ff)"/>`);
      break;
    case 'embers':
      pattern = scatter(Math.round(area * 6), 33, (x, y, i) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.8 + rnd(i, 34) * 1.6)}" fill="${rnd(i, 35) > 0.5 ? ink : ink2}" opacity="${n(0.4 + rnd(i, 36) * 0.5)}"/>`);
      break;
    case 'flowers':
      pattern = scatter(Math.round(area * 2.5), 37, (x, y, i) => flower(x, y, 5 + rnd(i, 38) * 3, 5, rnd(i, 39) > 0.5 ? ink2 : ink, '#fde68a'));
      pattern = `<g opacity=".3">${pattern}</g>`;
      break;
    case 'waves':
    case 'lines':
      pattern = Array.from({ length: Math.ceil(H / 16) }, (_, i) => {
        const y = 10 + i * 16;
        let p = `M0,${y}`;
        for (let x = 0; x < W; x += 24) p += ` q6,-5 12,0 t12,0`;
        return `<path d="${p}" fill="none" stroke="${r.pattern === 'waves' ? ink2 : ink}" stroke-width="1" opacity=".22"/>`;
      }).join('');
      break;
    case 'runes': {
      const glyphs = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛁ', 'ᛃ', 'ᛇ'];
      pattern = scatter(Math.round(area * 3), 41, (x, y, i) => `<text x="${n(x)}" y="${n(y)}" font-size="${n(9 + rnd(i, 42) * 5)}" fill="${ink2}" opacity=".35" text-anchor="middle" font-family="serif">${glyphs[i % glyphs.length]}</text>`);
      break;
    }
    case 'grid':
      defs.push(`<pattern id="${u}pt" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16,0 H0 V16" fill="none" stroke="${ink2}" stroke-width=".6" opacity=".45"/></pattern>`);
      pattern = `<path d="${matPath}" fill="url(#${u}pt)"/>`;
      break;
    case 'checker':
      defs.push(`<pattern id="${u}pt" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#ffffff" opacity=".05"/><rect x="8" y="8" width="8" height="8" fill="#ffffff" opacity=".05"/></pattern>`);
      pattern = `<path d="${matPath}" fill="url(#${u}pt)"/>`;
      break;
    case 'scanlines':
      defs.push(`<pattern id="${u}pt" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.2" fill="${ink}" opacity=".12"/></pattern>`);
      pattern = `<path d="${matPath}" fill="url(#${u}pt)"/>`;
      break;
    case 'circuit':
      pattern = scatter(Math.round(area * 3), 45, (x, y, i) => {
        const len = 14 + rnd(i, 46) * 22;
        const dir = rnd(i, 47) > 0.5;
        return `<path d="M${n(x)},${n(y)} ${dir ? `h${n(len)} l8,8 h${n(len / 2)}` : `v${n(len)} l8,8 v${n(len / 2)}`}" fill="none" stroke="${ink}" stroke-width="1.4" opacity=".45"/><circle cx="${n(x)}" cy="${n(y)}" r="2.2" fill="none" stroke="${ink}" stroke-width="1.2" opacity=".55"/>`;
      });
      break;
    case 'hazard':
      defs.push(`<pattern id="${u}pt" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="${ink}"/></pattern>`);
      pattern = `<rect x="10" y="${H - 24}" width="34" height="14" fill="url(#${u}pt)" opacity=".85"/><rect x="${W - 44}" y="${H - 24}" width="34" height="14" fill="url(#${u}pt)" opacity=".85"/><rect x="10" y="10" width="34" height="10" fill="url(#${u}pt)" opacity=".85"/><rect x="${W - 44}" y="10" width="34" height="10" fill="url(#${u}pt)" opacity=".85"/>`;
      break;
    case 'maple':
      pattern = scatter(Math.round(area * 2.5), 49, (x, y, i) => maple(x, y, 5 + rnd(i, 50) * 4, rnd(i, 51) > 0.5 ? ink : ink2, rnd(i, 52) * 360));
      pattern = `<g opacity=".35">${pattern}</g>`;
      break;
    case 'speckle':
      pattern = scatter(Math.round(area * 14), 53, (x, y, i) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.4 + rnd(i, 54) * 0.8)}" fill="${ink}" opacity="${n(0.12 + rnd(i, 55) * 0.2)}"/>`);
      break;
    case 'dots':
      defs.push(`<pattern id="${u}pt" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.4" fill="${ink}" opacity=".22"/></pattern>`);
      pattern = `<path d="${matPath}" fill="url(#${u}pt)"/>`;
      break;
    case 'seigaiha':
      defs.push(`<pattern id="${u}pt" width="28" height="14" patternUnits="userSpaceOnUse"><g fill="none" stroke="${ink}" stroke-width="1" opacity=".3"><circle cx="14" cy="14" r="12"/><circle cx="14" cy="14" r="8"/><circle cx="14" cy="14" r="4"/><circle cx="0" cy="7" r="12"/><circle cx="28" cy="7" r="12"/></g></pattern>`);
      pattern = `<path d="${matPath}" fill="url(#${u}pt)"/>`;
      break;
    case 'clouds':
      pattern = scatter(Math.round(area * 1.4), 57, (x, y, i) => cloud(x, y, 9 + rnd(i, 58) * 8, '#ffffff'));
      pattern = `<g opacity=".85">${pattern}</g>`;
      break;
    case 'halftone':
      defs.push(`<pattern id="${u}pt" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="2" fill="${ink2}" opacity=".35"/></pattern>`);
      pattern = `<path d="${matPath}" fill="url(#${u}pt)"/>`;
      break;
    case 'memphis': {
      const cols = ['#ff6b9a', '#ffcf33', '#33c3ff', '#7ed957', '#111111'];
      pattern = scatter(Math.round(area * 3.5), 61, (x, y, i) => {
        const c = cols[i % cols.length];
        switch (i % 4) {
          case 0:
            return `<path d="M${n(x - 9)},${n(y)} q3,-5 6,0 t6,0 t6,0" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`;
          case 1:
            return `<path d="M${n(x)},${n(y - 6)} L${n(x + 6)},${n(y + 5)} L${n(x - 6)},${n(y + 5)} Z" fill="${c}"/>`;
          case 2:
            return `<circle cx="${n(x)}" cy="${n(y)}" r="4" fill="none" stroke="${c}" stroke-width="2"/>`;
          default:
            return `<rect x="${n(x - 4)}" y="${n(y - 4)}" width="8" height="8" fill="${c}" transform="rotate(20 ${n(x)} ${n(y)})"/>`;
        }
      });
      break;
    }
  }

  // ── Border / edge lines ──
  const inset = (k: number, rx: number, stroke: string, sw: number, extra = '') =>
    `<rect x="${k}" y="${k}" width="${W - k * 2}" height="${H - k * 2}" rx="${rx}" fill="none" stroke="${stroke}" stroke-width="${sw}"${extra}/>`;
  let border = '';
  switch (r.border) {
    case 'double':
      border = inset(9, 16, ink, 2) + inset(14, 12, ink, 0.8);
      break;
    case 'ornate': {
      border = inset(8, 17, ink, 2.2) + inset(14, 12, ink, 0.8);
      let beads = '';
      for (let x = 34; x < W - 30; x += 12) beads += `<circle cx="${x}" cy="11" r="1.3" fill="${ink2}"/><circle cx="${x}" cy="${H - 11}" r="1.3" fill="${ink2}"/>`;
      for (let y = 34; y < H - 30; y += 12) beads += `<circle cx="11" cy="${y}" r="1.3" fill="${ink2}"/><circle cx="${W - 11}" cy="${y}" r="1.3" fill="${ink2}"/>`;
      border += beads;
      break;
    }
    case 'pearls': {
      let beads = '';
      for (let x = 22; x <= W - 22; x += 10) beads += `<circle cx="${x}" cy="10" r="3.4"/><circle cx="${x}" cy="${H - 10}" r="3.4"/>`;
      for (let y = 22; y <= H - 22; y += 10) beads += `<circle cx="10" cy="${y}" r="3.4"/><circle cx="${W - 10}" cy="${y}" r="3.4"/>`;
      defs.push(`<radialGradient id="${u}pearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f1ebe3"/><stop offset="1" stop-color="#cbbfae"/></radialGradient>`);
      border = `<g fill="url(#${u}pearl)">${beads}</g>`;
      break;
    }
    case 'deco':
      border =
        inset(8, 0, ink, 2) +
        inset(13, 0, ink, 0.8) +
        `<path d="M8,40 H22 V22 H40 V8 M${W - 8},40 H${W - 22} V22 H${W - 40} V8 M8,${H - 40} H22 V${H - 22} H40 V${H - 8} M${W - 8},${H - 40} H${W - 22} V${H - 22} H${W - 40} V${H - 8}" fill="none" stroke="${ink}" stroke-width="1.6"/>`;
      break;
    case 'simple':
      border = inset(10, 14, ink, 1.6);
      break;
    case 'gothic':
      border = inset(9, 4, ink, 2) + inset(14, 2, ink2, 0.8) + `<path d="M${cx - 40},9 L${cx},-6 L${cx + 40},9" fill="none" stroke="${ink}" stroke-width="2"/>`;
      break;
    case 'thorn': {
      let s = inset(11, 12, ink, 1.6);
      for (let x = 24; x < W - 20; x += 16) s += `<path d="M${x},11 l3,-6 l3,6 M${x},${H - 11} l3,6 l3,-6" fill="${ink}" stroke="${ink}" stroke-width=".6"/>`;
      for (let y = 24; y < H - 20; y += 16) s += `<path d="M11,${y} l-6,3 l6,3 M${W - 11},${y} l6,3 l-6,3" fill="${ink}" stroke="${ink}" stroke-width=".6"/>`;
      border = s;
      break;
    }
    case 'vine': {
      let p = '';
      let leaves = '';
      for (let x = 14; x < W - 14; x += 20) {
        p += `M${x},12 q5,-5 10,0 t10,0 `;
        leaves += leaf(x + 5, 10, 7, -30, ink) + leaf(x + 15, 14, 7, 30, ink);
      }
      let pv = '';
      let pl = '';
      for (let y = 14; y < H - 14; y += 20) {
        pv += `M12,${y} q-5,5 0,10 t0,10 M${W - 12},${y} q5,5 0,10 t0,10 `;
        pl += leaf(10, y + 5, 7, 60, ink) + leaf(W - 10, y + 15, 7, 120, ink);
      }
      border = `<path d="${p}${pv}" fill="none" stroke="${ink}" stroke-width="1.3"/><path d="${p.replace(/M(\d+),12/g, (_, x) => `M${x},${H - 12}`)}" fill="none" stroke="${ink}" stroke-width="1.3"/><g opacity=".9">${leaves}${pl}</g>`;
      break;
    }
    case 'neon':
      defs.push(`<filter id="${u}glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>`);
      border = `<g filter="url(#${u}glow)">${inset(10, 16, ink, 3)}</g>${inset(10, 16, ink, 1.6)}${inset(16, 12, ink2, 0.8, ' opacity=".7"')}`;
      break;
    case 'pixel':
      border = `<path d="${pixelRect(9, 9, W - 18, H - 18, 8)}" fill="none" stroke="${ink}" stroke-width="4"/><path d="${pixelRect(16, 16, W - 32, H - 32, 6)}" fill="none" stroke="${ink2}" stroke-width="2"/>`;
      break;
    case 'hud': {
      let ticks = '';
      for (let x = 60; x < W - 60; x += 14) ticks += `<line x1="${x}" y1="12" x2="${x}" y2="${x % 28 ? 16 : 20}" stroke="${ink}" stroke-width="1" opacity=".6"/>`;
      border = inset(8, 4, ink, 1, ' opacity=".5"') + ticks;
      break;
    }
    case 'chrome':
      defs.push(`<linearGradient id="${u}chr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#9aa3b5"/><stop offset=".5" stop-color="#f5f7fb"/><stop offset=".75" stop-color="#7b8496"/><stop offset="1" stop-color="#e9edf5"/></linearGradient>`);
      border = inset(6, 18, `url(#${u}chr)`, 8) + inset(12, 13, '#ffffff', 1, ' opacity=".8"');
      break;
    case 'glitch':
      border = `<rect x="11" y="9" width="${W - 22}" height="${H - 18}" rx="6" fill="none" stroke="${ink}" stroke-width="2" opacity=".85"/><rect x="7" y="11" width="${W - 22}" height="${H - 18}" rx="6" fill="none" stroke="${ink2}" stroke-width="2" opacity=".85"/><rect x="${W * 0.62}" y="26" width="46" height="4" fill="${ink2}"/><rect x="18" y="${H * 0.42}" width="30" height="3" fill="${ink}"/>`;
      break;
    case 'bevel':
      border = `<path d="M3,${H - 3} V3 H${W - 3}" fill="none" stroke="#ffffff" stroke-width="3"/><path d="M${W - 3},3 V${H - 3} H3" fill="none" stroke="#404040" stroke-width="3"/><path d="M6,${H - 6} V6 H${W - 6}" fill="none" stroke="#dfdfdf" stroke-width="2"/><path d="M${W - 6},6 V${H - 6} H6" fill="none" stroke="#808080" stroke-width="2"/>`;
      break;
    case 'mecha': {
      border = `<path d="${chamfer(9, 9, W - 18, H - 18, 20)}" fill="none" stroke="${ink2}" stroke-width="1.5"/><path d="${chamfer(3, 3, W - 6, H - 6, 26)}" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
      break;
    }
    case 'scallop':
      border = `<path d="${matPath}" fill="none" stroke="${ink}" stroke-width="1.8"/>` + inset(16, 10, ink, 0.8, ' stroke-dasharray="2 4"');
      break;
    case 'stamp': {
      let holes = '';
      for (let x = 10; x <= W - 10; x += 12) holes += `<circle cx="${x}" cy="3" r="4.2"/><circle cx="${x}" cy="${H - 3}" r="4.2"/>`;
      for (let y = 10; y <= H - 10; y += 12) holes += `<circle cx="3" cy="${y}" r="4.2"/><circle cx="${W - 3}" cy="${y}" r="4.2"/>`;
      border = `<g fill="#e5e7eb">${holes}</g>${inset(14, 0, ink, 1.6)}`;
      break;
    }
    case 'torn':
      border = `<path d="${matPath}" fill="none" stroke="${ink}" stroke-width=".8" opacity=".5"/>`;
      break;
    case 'film': {
      let holes = '';
      for (let y = 14; y < H - 10; y += 18) holes += `<rect x="6" y="${y}" width="9" height="11" rx="2" fill="#f5f5f4"/><rect x="${W - 15}" y="${y}" width="9" height="11" rx="2" fill="#f5f5f4"/>`;
      border = holes + `<line x1="20" y1="6" x2="20" y2="${H - 6}" stroke="${ink2}" stroke-width="1"/><line x1="${W - 20}" y1="6" x2="${W - 20}" y2="${H - 6}" stroke="${ink2}" stroke-width="1"/>`;
      break;
    }
    case 'sketch': {
      const wob = (k: number, salt: number) => {
        const j = (i: number) => n((rnd(i, salt) - 0.5) * 3);
        return `<path d="M${k + Number(j(1))},${k + Number(j(2))} L${W - k + Number(j(3))},${k + Number(j(4))} L${W - k + Number(j(5))},${H - k + Number(j(6))} L${k + Number(j(7))},${H - k + Number(j(8))} Z" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"/>`;
      };
      border = wob(10, 71) + wob(13, 72);
      break;
    }
    case 'comic':
      border = `<rect x="8" y="10" width="${W - 14}" height="${H - 16}" rx="6" fill="none" stroke="${ink}" stroke-width="4"/><rect x="4" y="5" width="${W - 14}" height="${H - 16}" rx="6" fill="none" stroke="${ink}" stroke-width="4"/>`;
      break;
    case 'kintsugi': {
      const crack = (x0: number, y0: number, salt: number, steps: number, dx: number, dy: number) => {
        let p = `M${n(x0)},${n(y0)}`;
        let x = x0;
        let y = y0;
        for (let i = 0; i < steps; i++) {
          x += dx + (rnd(i, salt) - 0.5) * 14;
          y += dy + (rnd(i, salt + 1) - 0.5) * 14;
          p += ` L${n(x)},${n(y)}`;
        }
        return p;
      };
      defs.push(`<linearGradient id="${u}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink2}"/><stop offset=".5" stop-color="${ink}"/><stop offset="1" stop-color="#8a6416"/></linearGradient>`);
      const paths = [crack(0, H * 0.2, 81, 4, 10, 6), crack(W, H * 0.35, 83, 4, -10, 5), crack(W * 0.3, H, 85, 4, 2, -12), crack(W * 0.8, 0, 87, 3, -3, 12), crack(0, H * 0.75, 89, 3, 11, -2)];
      border = `<g fill="none" stroke="url(#${u}gold)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${paths.map((p) => `<path d="${p}"/>`).join('')}</g>` + inset(10, 14, ink, 1, ' opacity=".7"');
      break;
    }
    case 'cartridge': {
      let ridges = '';
      for (let x = 30; x < W - 60; x += 10) ridges += `<rect x="${x}" y="10" width="5" height="16" rx="1.5" fill="${ink}" opacity=".45"/>`;
      border = `<path d="${matPath}" fill="none" stroke="${ink}" stroke-width="2"/>${ridges}`;
      break;
    }
  }

  // ── Corner ornaments ──
  const cs = 26; // corner ornament size
  const C: [number, number, number, number][] = [
    [22, 22, 1, 1],
    [W - 22, 22, -1, 1],
    [22, H - 22, 1, -1],
    [W - 22, H - 22, -1, -1],
  ];
  const corner = (kind: Corner) =>
    C.map(([x, y, sx, sy], i) => {
      switch (kind) {
        case 'flourish':
          return flourish(x - sx * 8, y - sy * 8, cs, sx, sy, ink);
        case 'diamond':
          return `<path d="M${x},${y - 9} L${x + 9},${y} L${x},${y + 9} L${x - 9},${y} Z" fill="none" stroke="${ink}" stroke-width="1.6"/><path d="M${x},${y - 4} L${x + 4},${y} L${x},${y + 4} L${x - 4},${y} Z" fill="${ink2}"/>`;
        case 'pearl':
          return `<circle cx="${x}" cy="${y}" r="6" fill="url(#${u}pearl)" stroke="${ink}" stroke-width=".6"/>`;
        case 'fan': {
          let s = '';
          for (let k = 0; k < 5; k++) {
            const a0 = (k * 18) * (Math.PI / 180);
            const a1 = ((k + 1) * 18) * (Math.PI / 180);
            const rr = 20;
            s += `<path d="M0,0 L${n(Math.cos(a0) * rr)},${n(Math.sin(a0) * rr)} A${rr},${rr} 0 0 1 ${n(Math.cos(a1) * rr)},${n(Math.sin(a1) * rr)} Z" fill="${k % 2 ? ink : 'none'}" stroke="${ink}" stroke-width="1" opacity="${k % 2 ? 0.8 : 1}"/>`;
          }
          return `<g transform="translate(${x - sx * 10},${y - sy * 10}) scale(${sx},${sy})">${s}</g>`;
        }
        case 'flower':
          return flower(x, y, 11, 5, ink, ink2, i * 15);
        case 'fleur':
          return `<g transform="translate(${x},${y})" fill="${ink}"><path d="M0,-10 C4,-6 4,-2 0,2 C-4,-2 -4,-6 0,-10 Z"/><path d="M0,2 C-3,-3 -10,-3 -9,3 C-8,7 -3,6 -1,4 Z"/><path d="M0,2 C3,-3 10,-3 9,3 C8,7 3,6 1,4 Z"/><rect x="-5" y="4" width="10" height="2"/><path d="M0,6 L-2,10 H2 Z"/></g>`;
        case 'star':
          return star(x, y, 8, ink) + `<circle cx="${x + sx * 12}" cy="${y + sy * 4}" r="1.4" fill="${ink2}"/>`;
        case 'leaf':
          return leaf(x - sx * 8, y - sy * 8, 18, sx > 0 ? (sy > 0 ? 45 : -45) : sy > 0 ? 135 : -135, ink) + leaf(x - sx * 8, y - sy * 8, 12, sx > 0 ? (sy > 0 ? 10 : -80) : sy > 0 ? 170 : -100, ink2);
        case 'sakura':
          return flower(x, y, 12, 5, ink, '#fde68a', i * 20) + `<path d="M${x - sx * 14},${y - sy * 14} Q${x - sx * 4},${y - sy * 10} ${x},${y}" fill="none" stroke="${ink2}" stroke-width="1.6"/>`;
        case 'thorn':
          return `<path d="M${x - sx * 12},${y - sy * 12} Q${x},${y - sy * 2} ${x + sx * 6},${y + sy * 10}" fill="none" stroke="${ink}" stroke-width="2"/><path d="M${x - sx * 4},${y - sy * 6} l${sx * -6},${sy * 2} l${sx * 4},${sy * 3} Z M${x + sx * 2},${y + sy * 2} l${sx * 6},${sy * -3} l${sx * -2},${sy * 5} Z" fill="${ink}"/>`;
        case 'crystal':
          return crystalShape(x, y, 12, ink, ink2);
        case 'cloud':
          return cloud(x, y, 10, ink2 === '#2b2b2b' ? ink : ink2 === '#fbbf24' ? '#ffffff' : ink);
        case 'flame':
          return flame(x, y, 12, ink, ink2);
        case 'butterfly':
          return butterfly(x, y, 10, i % 2 ? ink : ink2, i % 2 ? ink2 : ink);
        case 'shell':
          return shell(x, y, 11, ink, ink2);
        case 'gem':
          return `<path d="M${x - 8},${y - 3} L${x - 4},${y - 8} H${x + 4} L${x + 8},${y - 3} L${x},${y + 9} Z" fill="${ink2}" stroke="${ink}" stroke-width="1.2"/><path d="M${x - 8},${y - 3} H${x + 8}" stroke="${ink}" stroke-width=".8"/>`;
        case 'bracket':
          return `<path d="M${x - sx * 10},${y + sy * 8} V${y - sy * 10} H${x + sx * 8}" fill="none" stroke="${ink}" stroke-width="3" transform="translate(${-sx * 2},${-sy * 2})"/>`;
        case 'heart': {
          const p = 1.8;
          const rows = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
          let d2 = '';
          rows.forEach((row, rr) => [...row].forEach((c, cc) => c === 'X' && (d2 += `M${n(x - 6.3 + cc * p)},${n(y - 5.4 + rr * p)}h${p}v${p}h-${p}Z`)));
          return `<path d="${d2}" fill="${ink2}"/>`;
        }
        case 'triangle':
          return `<path d="M${x},${y - 9} L${x + 9},${y + 7} L${x - 9},${y + 7} Z" fill="none" stroke="${i % 2 ? ink : ink2}" stroke-width="2"/>`;
        case 'sparkle':
          return sparkle(x, y, 10, ink) + sparkle(x + sx * 11, y + sy * 9, 4, ink2);
        case 'pad':
          return `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${ink}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2.6" fill="${ink}"/><path d="M${x + sx * 7},${y} h${sx * 12}" stroke="${ink}" stroke-width="1.4"/>`;
        case 'bolt':
          return `<circle cx="${x}" cy="${y}" r="5.5" fill="${ink2}" stroke="#111" stroke-width="1"/><path d="M${x - 3},${y} H${x + 3} M${x},${y - 3} V${y + 3}" stroke="#111" stroke-width="1.4"/>`;
        case 'wildflower':
          return `<path d="M${x},${y + 10} Q${x - sx * 3},${y} ${x},${y - 8}" fill="none" stroke="${ink}" stroke-width="1.4"/>${flower(x, y - 9, 7, 6, ink2, '#fde68a')}${leaf(x, y + 4, 8, sx > 0 ? -30 : -150, ink)}`;
        case 'maple':
          return maple(x, y, 10, i % 2 ? ink : ink2, i * 25);
        case 'wave':
          return `<path d="M${x - 12},${y + 6} C${x - 10},${y - 10} ${x + 10},${y - 12} ${x + 10},${y} C${x + 10},${y + 6} ${x + 2},${y + 6} ${x + 2},${y} C${x + 2},${y - 4} ${x + 6},${y - 4} ${x + 6},${y - 1}" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
        case 'pressed':
          return `<g transform="rotate(${(i % 2 ? 1 : -1) * 18} ${x} ${y})">${flower(x, y, 11, 5, ink2, ink)}<rect x="${x - 10}" y="${y - 3}" width="20" height="6" fill="#f5e6b8" opacity=".75"/></g>`;
        case 'mushroom':
          return mushroom(x, y, 10, ink, '#f5ecd9');
        case 'sprig':
          return `<path d="M${x - sx * 14},${y - sy * 14} Q${x},${y - sy * 6} ${x + sx * 10},${y + sy * 12}" fill="none" stroke="${ink}" stroke-width="1.2"/>${[0, 1, 2, 3].map((k) => `<circle cx="${n(x - sx * 10 + sx * k * 6)}" cy="${n(y - sy * 10 + sy * k * 5.5 + (k % 2 ? 4 : -4))}" r="3.4" fill="${k % 2 ? ink2 : ink}"/>`).join('')}`;
        case 'sunflower':
          return sunflower(x, y, 12, ink, ink2);
        case 'fern': {
          let s = `<path d="M${x - sx * 12},${y + sy * 12} L${x + sx * 10},${y - sy * 10}" stroke="${ink}" stroke-width="1.2"/>`;
          for (let k = 1; k < 6; k++) {
            const px = x - sx * 12 + sx * k * 4;
            const py = y + sy * 12 - sy * k * 4;
            s += leaf(px, py, 7 - k * 0.6, sx > 0 ? (sy > 0 ? -90 : 0) : sy > 0 ? 180 : 90, ink) + leaf(px, py, 7 - k * 0.6, sx > 0 ? (sy > 0 ? 0 : 90) : sy > 0 ? -90 : 180, ink);
          }
          return s;
        }
        case 'crosshair':
          return `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${ink}" stroke-width="1"/><path d="M${x - 11},${y} H${x + 11} M${x},${y - 11} V${y + 11}" stroke="${ink}" stroke-width="1"/>`;
        case 'doodle':
          return [
            star(x, y, 8, 'none').replace('fill="none"', `fill="none" stroke="${ink2}" stroke-width="1.6" stroke-linejoin="round"`),
            `<path d="M${x},${y} m-1,0 a1,1 0 1,1 2,0 a3,3 0 1,1 -6,0 a5,5 0 1,1 10,0 a7,7 0 1,1 -14,0" fill="none" stroke="${ink}" stroke-width="1.4"/>`,
            `<path d="M${x},${y + 7} C${x - 12},${y - 2} ${x - 5},${y - 10} ${x},${y - 3} C${x + 5},${y - 10} ${x + 12},${y - 2} ${x},${y + 7} Z" fill="none" stroke="${ink2}" stroke-width="1.6"/>`,
            `<path d="M${x - 8},${y} H${x + 8} M${x + 3},${y - 5} L${x + 8},${y} L${x + 3},${y + 5}" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>`,
          ][i];
        case 'burst':
          return star(x, y, 13, ink, 10, 0.6) + star(x, y, 10, ink2, 10, 0.6);
        case 'memphis':
          return [
            `<circle cx="${x}" cy="${y}" r="8" fill="#ffcf33" stroke="#111" stroke-width="2"/>`,
            `<path d="M${x - 9},${y + 7} L${x},${y - 9} L${x + 9},${y + 7} Z" fill="#33c3ff" stroke="#111" stroke-width="2"/>`,
            `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" fill="#7ed957" stroke="#111" stroke-width="2" transform="rotate(15 ${x} ${y})"/>`,
            `<path d="M${x - 10},${y} q3,-6 6,0 t6,0 t6,0" fill="none" stroke="#ff6b9a" stroke-width="3" stroke-linecap="round"/>`,
          ][i];
        default:
          return '';
      }
    }).join('');

  // ── Top emblem ──
  const ty = Math.max(30, P.y / 2 + 2);
  let top = '';
  switch (r.top) {
    case 'crown':
      top = `<g transform="translate(${cx},${ty})"><path d="M-22,10 L-24,-10 L-12,0 L0,-16 L12,0 L24,-10 L22,10 Z" fill="${ink}" stroke="${ink2}" stroke-width="1"/><rect x="-23" y="10" width="46" height="5" rx="1.5" fill="${ink2}"/><circle cx="0" cy="-16" r="2.6" fill="${ink2}"/><circle cx="-24" cy="-10" r="2.2" fill="${ink2}"/><circle cx="24" cy="-10" r="2.2" fill="${ink2}"/><circle cx="0" cy="3" r="3" fill="#b3122c"/><circle cx="-12" cy="5" r="2" fill="#1d6fb8"/><circle cx="12" cy="5" r="2" fill="#1d6fb8"/></g>`;
      break;
    case 'gem':
      top = `<g transform="translate(${cx},${ty})"><path d="M-14,-6 L-7,-14 H7 L14,-6 L0,14 Z" fill="${ink}"/><path d="M-14,-6 H14 M-7,-14 L-4,-6 L0,14 M7,-14 L4,-6 L0,14" fill="none" stroke="${ink2}" stroke-width="1"/><path d="M-60,0 H-24 M24,0 H60" stroke="${ink}" stroke-width="1.2"/><circle cx="-62" cy="0" r="2" fill="${ink}"/><circle cx="62" cy="0" r="2" fill="${ink}"/></g>`;
      break;
    case 'pearl': {
      let s = '';
      for (let i = -6; i <= 6; i++) s += `<circle cx="${n(cx + i * 9)}" cy="${n(ty - 10 + (i * i) * 0.45)}" r="3.6" fill="url(#${u}pearl)" stroke="${ink}" stroke-width=".4"/>`;
      if (!defs.some((x) => x.includes(`${u}pearl`))) defs.push(`<radialGradient id="${u}pearl" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f1ebe3"/><stop offset="1" stop-color="#cbbfae"/></radialGradient>`);
      top = s + `<circle cx="${cx}" cy="${ty + 14}" r="5.5" fill="url(#${u}pearl)" stroke="${ink}" stroke-width=".5"/>`;
      break;
    }
    case 'deco-sun': {
      let rays = '';
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + (i * Math.PI) / 12;
        rays += `<line x1="${n(cx + Math.cos(a) * 14)}" y1="${n(ty + 12 + Math.sin(a) * 14)}" x2="${n(cx + Math.cos(a) * (i % 2 ? 26 : 34))}" y2="${n(ty + 12 + Math.sin(a) * (i % 2 ? 26 : 34))}" stroke="${ink}" stroke-width="${i % 2 ? 1.2 : 2}"/>`;
      }
      top = `${rays}<path d="M${cx - 12},${ty + 12} A12,12 0 0 1 ${cx + 12},${ty + 12} Z" fill="${ink}"/><path d="M${cx - 70},${ty + 12} H${cx + 70}" stroke="${ink}" stroke-width="1.4"/><path d="M${cx - 70},${ty + 16} H${cx + 70}" stroke="${ink}" stroke-width=".7"/>`;
      break;
    }
    case 'crest':
      top = `<g transform="translate(${cx},${ty})"><path d="M-14,-16 H14 V-2 C14,8 6,14 0,17 C-6,14 -14,8 -14,-2 Z" fill="${ink}" stroke="${ink2}" stroke-width="1.2"/><path d="M0,-11 L3,-3 H11 L5,2 L7,10 L0,5 L-7,10 L-5,2 L-11,-3 H-3 Z" fill="${r.mat instanceof Array ? r.mat[1] : '#000'}" opacity=".85"/>${leaf(-18, 4, 18, 200, ink)}${leaf(18, 4, 18, -20, ink)}${leaf(-20, -6, 14, 215, ink2)}${leaf(20, -6, 14, -35, ink2)}</g>`;
      break;
    case 'rose':
      top = `<g transform="translate(${cx},${ty})"><circle r="11" fill="${ink}"/><path d="M-6,-2 C-6,-8 6,-8 6,-2 C6,3 -3,4 -3,-1 C-3,-4 2,-4 2,-1" fill="none" stroke="${ink2}" stroke-width="1.4"/>${leaf(-12, 6, 16, 160, '#7c9a6a')}${leaf(12, 6, 16, 20, '#7c9a6a')}<path d="M-70,6 H-30 M30,6 H70" stroke="${ink}" stroke-width="1"/></g>`;
      break;
    case 'arch':
      top = `<g fill="none" stroke="${ink}" stroke-width="1.6"><path d="M${cx - 34},${ty + 22} V${ty} Q${cx - 34},${ty - 16} ${cx},${ty - 24} Q${cx + 34},${ty - 16} ${cx + 34},${ty} V${ty + 22}"/><path d="M${cx - 22},${ty + 22} V${ty + 4} Q${cx - 22},${ty - 8} ${cx},${ty - 14} Q${cx + 22},${ty - 8} ${cx + 22},${ty + 4} V${ty + 22}"/><circle cx="${cx}" cy="${ty - 2}" r="6"/><path d="M${cx},${ty + 22} V${ty + 4}"/></g>${star(cx, ty - 2, 4, ink2)}`;
      break;
    case 'moon':
      top = `<g transform="translate(${cx},${ty})"><circle r="14" fill="${ink}"/><circle cx="6" cy="-4" r="12" fill="${r.mat instanceof Array ? r.mat[0] : '#000'}"/>${star(-30, -6, 4, ink2)}${star(28, 4, 3, ink2)}${star(40, -10, 2.4, ink2)}${star(-42, 6, 2.6, ink2)}<path d="M-80,14 H-24 M24,14 H80" stroke="${ink}" stroke-width="1"/></g>`;
      break;
    case 'diamond-line':
      top = `<path d="M${cx - 70},${ty} H${cx - 12} M${cx + 12},${ty} H${cx + 70}" stroke="${ink}" stroke-width="1"/><path d="M${cx},${ty - 7} L${cx + 7},${ty} L${cx},${ty + 7} L${cx - 7},${ty} Z" fill="none" stroke="${ink}" stroke-width="1.2"/><circle cx="${cx}" cy="${ty}" r="1.8" fill="${ink}"/>`;
      break;
    case 'laurel': {
      let lv = '';
      for (let k = 0; k < 6; k++) {
        const a = (200 + k * 18) * (Math.PI / 180);
        const x = cx + Math.cos(a) * 30;
        const y = ty + 10 + Math.sin(a) * 22;
        lv += leaf(x, y, 12, (a * 180) / Math.PI - 70, ink) + leaf(2 * cx - x, y, 12, 180 - ((a * 180) / Math.PI - 70), ink);
      }
      top = `${lv}${text(cx, ty + 8, '✦', 14, ink2, 'serif')}`;
      break;
    }
    case 'sakura':
      top = `<path d="M${cx - 80},${ty - 10} Q${cx - 30},${ty + 10} ${cx + 10},${ty - 2} T${cx + 80},${ty - 6}" fill="none" stroke="${ink2}" stroke-width="3" stroke-linecap="round"/>${flower(cx - 44, ty + 2, 10, 5, ink, '#fde68a', 10)}${flower(cx - 8, ty + 2, 12, 5, ink, '#fde68a', 30)}${flower(cx + 32, ty - 6, 9, 5, ink, '#fde68a')}${flower(cx + 62, ty - 2, 7, 5, ink, '#fde68a', 20)}`;
      break;
    case 'eye':
      top = `<g transform="translate(${cx},${ty})"><path d="M-26,0 Q0,-20 26,0 Q0,20 -26,0 Z" fill="none" stroke="${ink2}" stroke-width="1.6"/><circle r="8" fill="${ink}"/><circle r="3" fill="#000"/><circle cx="2" cy="-2" r="1.2" fill="#fff"/>${[-1, 1].map((s) => `<path d="M${s * 30},0 l${s * 10},-6 l0,12 Z" fill="${ink}"/>`).join('')}<path d="M0,-14 V-22 M-14,-10 L-19,-17 M14,-10 L19,-17" stroke="${ink2}" stroke-width="1.4"/></g>`;
      break;
    case 'crystal':
      top = `${crystalShape(cx, ty, 18, ink, ink2)}${crystalShape(cx - 18, ty + 6, 11, ink2, '#ffffff')}${crystalShape(cx + 18, ty + 6, 11, ink2, '#ffffff')}${sparkle(cx - 34, ty - 8, 4, '#ffffff')}${sparkle(cx + 36, ty - 10, 5, '#ffffff')}`;
      break;
    case 'forest-moon':
      top = `<circle cx="${cx}" cy="${ty - 2}" r="13" fill="${ink2}" opacity=".9"/>${[-1, 1].map((s) => `<path d="M${cx + s * 28},${ty + 18} L${cx + s * 36},${ty - 6} L${cx + s * 44},${ty + 18} Z M${cx + s * 46},${ty + 18} L${cx + s * 53},${ty} L${cx + s * 60},${ty + 18} Z" fill="${ink}"/>`).join('')}`;
      break;
    case 'zodiac': {
      const signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
      const R2 = 24;
      let s = `<circle cx="${cx}" cy="${ty}" r="${R2}" fill="none" stroke="${ink}" stroke-width="1.4"/><circle cx="${cx}" cy="${ty}" r="${R2 - 9}" fill="none" stroke="${ink}" stroke-width=".8"/>`;
      signs.forEach((g, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        s += `<text x="${n(cx + Math.cos(a) * (R2 - 4.5))}" y="${n(ty + Math.sin(a) * (R2 - 4.5) + 2.5)}" font-size="6.5" text-anchor="middle" fill="${ink2}" font-family="'Segoe UI Symbol', serif">${g}</text>`;
      });
      top = s + star(cx, ty, 7, ink, 8, 0.4);
      break;
    }
    case 'torii':
      top = `<g transform="translate(${cx},${ty})" fill="${ink}"><path d="M-40,-14 Q0,-22 40,-14 L42,-9 Q0,-16 -42,-9 Z" fill="${ink2}"/><rect x="-34" y="-9" width="68" height="5"/><rect x="-30" y="0" width="60" height="4"/><rect x="-25" y="-6" width="6" height="30"/><rect x="19" y="-6" width="6" height="30"/><rect x="-3" y="-4" width="6" height="8"/></g>`;
      break;
    case 'phoenix':
      top = `<g transform="translate(${cx},${ty})">${flame(0, -4, 14, ink, ink2)}<path d="M-6,4 C-24,-2 -40,-14 -50,-4 C-38,-6 -30,2 -22,6 C-34,6 -42,12 -44,18 C-30,10 -16,12 -6,10 Z" fill="${ink}"/><path d="M6,4 C24,-2 40,-14 50,-4 C38,-6 30,2 22,6 C34,6 42,12 44,18 C30,10 16,12 6,10 Z" fill="${ink}"/><path d="M-4,10 L0,26 L4,10 Z" fill="${ink2}"/></g>`;
      break;
    case 'butterfly':
      top = butterfly(cx, ty, 18, ink, ink2) + `<path d="M${cx - 2},${ty - 9} q-6,-10 -10,-8 M${cx + 2},${ty - 9} q6,-10 10,-8" fill="none" stroke="#3b2a20" stroke-width="1"/>`;
      break;
    case 'trident':
      top = `<g transform="translate(${cx},${ty})" fill="${ink}"><rect x="-1.6" y="-8" width="3.2" height="30"/><path d="M-16,-14 Q-14,2 0,2 Q14,2 16,-14 L12,-10 Q10,-3 0,-3 Q-10,-3 -12,-10 Z"/><path d="M0,-24 L4,-12 H-4 Z M-16,-22 L-12,-12 H-19 Z M16,-22 L19,-12 H12 Z"/></g>${shell(cx - 40, ty + 6, 9, ink2, ink)}${shell(cx + 40, ty + 6, 9, ink2, ink)}`;
      break;
    case 'sword':
      top = `<g transform="translate(${cx},${ty}) rotate(90)"><path d="M-22,-2.6 H14 L20,0 L14,2.6 H-22 Z" fill="${ink2}" stroke="${ink}" stroke-width=".8"/><rect x="-26" y="-9" width="4" height="18" rx="1.5" fill="${ink}"/><rect x="-36" y="-2" width="10" height="4" rx="1.5" fill="${ink}"/><circle cx="-38" cy="0" r="3" fill="${ink}"/></g><circle cx="${cx}" cy="${ty}" r="24" fill="none" stroke="${ink2}" stroke-width="1" stroke-dasharray="2 3"/>`;
      break;
    case 'invader': {
      const rows = ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'];
      const p = 3;
      let d2 = '';
      rows.forEach((row, rr) => [...row].forEach((c, cc) => c === 'X' && (d2 += `M${n(cx - 16.5 + cc * p)},${n(ty - 12 + rr * p)}h${p}v${p}h-${p}Z`)));
      top = `<path d="${d2}" fill="${ink2}"/>${text(cx - 54, ty + 4, '1UP', 9, ink, 'mono')}${text(cx + 54, ty + 4, 'HI 9999', 9, ink, 'mono')}`;
      break;
    }
    case 'pixel-sword': {
      const rows = ['.......XX', '......XWX', '.....XWX.', '.X..XWX..', '..XXWX...', '..XXX....', '.XX.X....', 'XX.......'];
      const p = 3;
      let d2 = '';
      let d3 = '';
      rows.forEach((row, rr) =>
        [...row].forEach((c, cc) => {
          const seg = `M${n(cx - 13.5 + cc * p)},${n(ty - 12 + rr * p)}h${p}v${p}h-${p}Z`;
          if (c === 'X') d2 += seg;
          else if (c === 'W') d3 += seg;
        })
      );
      top = `<path d="${d2}" fill="${ink}"/><path d="${d3}" fill="#ffffff"/>${text(cx, ty + 22, 'LV.99', 8, ink2, 'mono')}`;
      break;
    }
    case 'hud':
      top = `<path d="M${cx - 60},${ty + 6} H${cx - 22} L${cx - 14},${ty - 4} H${cx + 14} L${cx + 22},${ty + 6} H${cx + 60}" fill="none" stroke="${ink}" stroke-width="1.6"/>${text(cx, ty + 1, 'SYS·OK', 8.5, ink, 'mono', { spacing: 1 })}<circle cx="${cx - 68}" cy="${ty + 6}" r="2.5" fill="${ink2}"/><circle cx="${cx + 68}" cy="${ty + 6}" r="2.5" fill="${ink}"/>`;
      break;
    case 'vapor-sun': {
      defs.push(`<linearGradient id="${u}vs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffb96"/><stop offset="1" stop-color="#ff71ce"/></linearGradient><clipPath id="${u}vsc"><circle cx="${cx}" cy="${ty + 4}" r="22"/></clipPath>`);
      let bars = '';
      for (let k = 0; k < 4; k++) bars += `<rect x="${cx - 24}" y="${ty + 6 + k * 5}" width="48" height="${1.2 + k * 0.7}" fill="#3b1066"/>`;
      top = `<g clip-path="url(#${u}vsc)"><rect x="${cx - 24}" y="${ty - 18}" width="48" height="44" fill="url(#${u}vs)"/>${bars}</g>`;
      break;
    }
    case 'cartridge':
      top = text(cx, ty + 6, 'GAME CARD', 13, '#e4e4e7', 'display', { spacing: 2 });
      break;
    case 'sparkle':
      top = `${sparkle(cx, ty, 14, ink)}${sparkle(cx - 26, ty + 6, 6, ink)}${sparkle(cx + 28, ty - 6, 7, '#ffffff')}`;
      break;
    case 'chip': {
      let pins = '';
      for (let k = -2; k <= 2; k++) pins += `<rect x="${cx + k * 8 - 1.5}" y="${ty - 18}" width="3" height="6" fill="${ink}"/><rect x="${cx + k * 8 - 1.5}" y="${ty + 12}" width="3" height="6" fill="${ink}"/>`;
      top = `${pins}<rect x="${cx - 22}" y="${ty - 12}" width="44" height="24" rx="3" fill="#111" stroke="${ink}" stroke-width="1.2"/>${text(cx, ty + 3, 'QR-01', 8, ink, 'mono')}<path d="M${cx - 80},${ty} H${cx - 30} M${cx + 30},${ty} H${cx + 80}" stroke="${ink}" stroke-width="1.4"/>`;
      break;
    }
    case 'vhs':
      top = `${text(30, ty + 4, '▶ PLAY', 13, '#f5f5f5', 'mono', { anchor: 'start' })}${text(W - 30, ty + 4, '00:24:07', 11, '#f5f5f5', 'mono', { anchor: 'end' })}<rect x="${cx - 6}" y="${ty - 4}" width="4" height="10" fill="${ink}"/><rect x="${cx + 2}" y="${ty - 4}" width="4" height="10" fill="${ink2}"/>`;
      break;
    case 'titlebar':
      defs.push(`<linearGradient id="${u}tb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="${ink2}"/></linearGradient>`);
      top = `<rect x="10" y="10" width="${W - 20}" height="24" fill="url(#${u}tb)"/>${text(18, 27, 'scan_me.exe', 12, '#ffffff', 'sans', { anchor: 'start' })}${['_', '□', '×'].map((g, k) => `<rect x="${W - 72 + k * 20}" y="13" width="17" height="17" fill="#c0c0c0" stroke="#404040" stroke-width="1"/>${text(W - 63.5 + k * 20, 26, g, 11, '#000', 'sans')}`).join('')}`;
      break;
    case 'mecha':
      top = `${[0, 1, 2, 3, 4].map((k) => `<rect x="${cx - 34 + k * 14}" y="${ty - 6}" width="9" height="16" rx="2" fill="#111" stroke="${ink2}" stroke-width="1"/>`).join('')}<path d="M${cx - 80},${ty + 16} H${cx + 80}" stroke="${ink}" stroke-width="3"/>${text(cx - 60, ty + 4, 'MK-II', 9, ink, 'mono')}${text(cx + 62, ty + 4, '07', 9, ink, 'mono')}`;
      break;
    case 'flowers':
      top = `<path d="M${cx - 30},${ty + 18} Q${cx - 26},${ty} ${cx - 22},${ty - 8} M${cx},${ty + 18} V${ty - 12} M${cx + 26},${ty + 18} Q${cx + 24},${ty} ${cx + 20},${ty - 6}" fill="none" stroke="${ink}" stroke-width="1.6"/>${flower(cx - 22, ty - 10, 9, 6, ink2, '#fde68a')}${flower(cx, ty - 14, 11, 5, '#e879a6', '#fde68a')}${flower(cx + 20, ty - 8, 8, 6, '#a78bfa', '#fde68a')}${leaf(cx - 4, ty + 6, 12, 200, ink)}${leaf(cx + 4, ty + 4, 12, -20, ink)}`;
      break;
    case 'maple':
      top = `<path d="M${cx - 70},${ty - 8} Q${cx},${ty + 6} ${cx + 70},${ty - 10}" fill="none" stroke="#6b4423" stroke-width="2.4" stroke-linecap="round"/>${maple(cx - 38, ty + 6, 11, ink, 15)}${maple(cx, ty + 8, 13, ink2, -10)}${maple(cx + 40, ty + 2, 10, ink, 30)}`;
      break;
    case 'wave':
      top = `<g transform="translate(${cx},${ty})" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round"><path d="M-60,14 C-40,14 -34,-14 -6,-14 C14,-14 18,4 6,6 C-2,7 -4,-2 2,-3"/><path d="M-6,14 C10,14 18,0 36,0 C48,0 54,8 60,14"/><path d="M-70,20 H70" stroke-width="1"/>${r.ink2 === '#c0392b' ? `<circle cx="40" cy="-10" r="9" fill="${ink2}" stroke="none"/>` : ''}</g>`;
      break;
    case 'tape':
      top = `<rect x="${cx - 36}" y="${ty - 12}" width="72" height="22" fill="${ink2}" opacity=".7" transform="rotate(-4 ${cx} ${ty})"/><path d="M${cx - 36},${ty - 12} l-3,3 l3,3 l-3,3 l3,3 l-3,3 l3,3 M${cx + 36},${ty - 12} l3,3 l-3,3 l3,3 l-3,3 l3,3 l-3,3" fill="none" stroke="${ink2}" stroke-width="1" opacity=".7" transform="rotate(-4 ${cx} ${ty})"/>`;
      break;
    case 'cottage':
      top = `<g transform="translate(${cx},${ty})"><rect x="-16" y="-2" width="32" height="22" fill="#f5ecd9" stroke="${ink2}" stroke-width="1.2"/><path d="M-22,0 L0,-20 L22,0 Z" fill="${ink}"/><rect x="-5" y="8" width="10" height="12" rx="5" fill="${ink2}"/><rect x="-13" y="3" width="6" height="6" fill="#fde68a" stroke="${ink2}" stroke-width=".8"/><rect x="8" y="-20" width="5" height="10" fill="${ink2}"/></g>${mushroom(cx - 40, ty + 10, 8, ink, '#f5ecd9')}${mushroom(cx + 40, ty + 12, 6, ink, '#f5ecd9')}`;
      break;
    case 'sprig':
      top = `<path d="M${cx - 66},${ty} H${cx + 66}" stroke="${ink}" stroke-width="1.2"/>${Array.from({ length: 10 }, (_, k) => `<ellipse cx="${n(cx - 54 + k * 12)}" cy="${n(ty + (k % 2 ? 6 : -6))}" rx="5" ry="4" fill="${k % 3 ? ink2 : ink}"/>`).join('')}`;
      break;
    case 'sunflower':
      top = `${sunflower(cx, ty, 20, ink, ink2)}${leaf(cx - 18, ty + 14, 16, 160, '#5a7d2a')}${leaf(cx + 18, ty + 14, 16, 20, '#5a7d2a')}`;
      break;
    case 'cloud-sun': {
      let rays = '';
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        rays += `<line x1="${n(cx + 14 + Math.cos(a) * 16)}" y1="${n(ty - 4 + Math.sin(a) * 16)}" x2="${n(cx + 14 + Math.cos(a) * 22)}" y2="${n(ty - 4 + Math.sin(a) * 22)}" stroke="${ink2}" stroke-width="2" stroke-linecap="round"/>`;
      }
      top = `${rays}<circle cx="${cx + 14}" cy="${ty - 4}" r="12" fill="${ink2}"/>${cloud(cx - 6, ty + 6, 18, '#ffffff')}`;
      break;
    }
    case 'fern': {
      let s = `<path d="M${cx - 60},${ty + 6} Q${cx},${ty - 8} ${cx + 60},${ty + 6}" fill="none" stroke="${ink}" stroke-width="1.4"/>`;
      for (let k = -5; k <= 5; k++) {
        const x = cx + k * 10;
        const y = ty - 1 + (k * k) * 0.28;
        s += leaf(x, y, 9 - Math.abs(k) * 0.5, -70 + k * 3, ink) + leaf(x, y, 9 - Math.abs(k) * 0.5, 70 + k * 3 + 180, ink);
      }
      top = s;
      break;
    }
    case 'postmark':
      top = `<circle cx="${W - 54}" cy="${ty}" r="20" fill="none" stroke="${ink2}" stroke-width="1.4" opacity=".75"/>${text(W - 54, ty - 3, 'QR POST', 6.5, ink2, 'mono')}${text(W - 54, ty + 7, '2026', 7, ink2, 'mono')}${[0, 1, 2, 3].map((k) => `<path d="M${W - 150},${ty - 9 + k * 6} q8,-4 16,0 t16,0 t16,0 t16,0" fill="none" stroke="${ink2}" stroke-width="1.2" opacity=".75"/>`).join('')}${text(34, ty + 6, 'AIR MAIL', 11, ink, 'serif', { anchor: 'start', spacing: 1.5 })}`;
      break;
    case 'film':
      top = `${text(30, ty + 4, '35MM', 10, ink, 'mono', { anchor: 'start' })}${text(cx, ty + 4, '▶ 24A', 10, ink, 'mono')}${text(W - 30, ty + 4, 'ISO 400', 10, ink, 'mono', { anchor: 'end' })}`;
      break;
    case 'dimension':
      top = `<path d="M${P.x},${ty} H${P.x + P.w} M${P.x},${ty - 6} V${ty + 6} M${P.x + P.w},${ty - 6} V${ty + 6}" stroke="${ink}" stroke-width="1"/><path d="M${P.x + 2},${ty} l6,-3 v6 Z M${P.x + P.w - 2},${ty} l-6,-3 v6 Z" fill="${ink}"/><rect x="${cx - 26}" y="${ty - 7}" width="52" height="14" fill="${r.mat as string}"/>${text(cx, ty + 3.5, `${Math.round(o.qs / 10)} MOD`, 9, ink, 'mono')}`;
      break;
    case 'doodle':
      top = `${text(cx - 10, ty + 2, 'scan me!', 17, ink, 'hand', { weight: 700 })}<path d="M${cx + 46},${ty - 6} C${cx + 64},${ty} ${cx + 64},${ty + 18} ${cx + 44},${ty + 24}" fill="none" stroke="${ink2}" stroke-width="2" stroke-linecap="round"/><path d="M${cx + 50},${ty + 18} L${cx + 43},${ty + 24} L${cx + 52},${ty + 27}" fill="none" stroke="${ink2}" stroke-width="2" stroke-linecap="round"/>`;
      break;
    case 'burst':
      top = `${star(cx, ty, 30, ink, 14, 0.62)}${star(cx, ty, 26, ink2, 14, 0.62)}${text(cx, ty + 6, 'POW!', 16, '#ffe14d', 'display', { spacing: 1 })}`;
      break;
    case 'masthead':
      top = `${text(cx, ty + 4, 'The Daily Scan', 22, ink, 'gothic', { max: W - 70 })}<path d="M24,${ty + 12} H${W - 24} M24,${ty + 15} H${W - 24}" stroke="${ink}" stroke-width="1"/>${text(30, ty + 25, 'VOL. XXVI', 7, r.ink2, 'serif', { anchor: 'start' })}${text(W - 30, ty + 25, 'PRICE 1¢', 7, r.ink2, 'serif', { anchor: 'end' })}`;
      break;
    case 'seal': {
      let edge = '';
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        edge += `<circle cx="${n(cx + Math.cos(a) * 17)}" cy="${n(ty + Math.sin(a) * 17)}" r="5" fill="${ink}"/>`;
      }
      top = `${edge}<circle cx="${cx}" cy="${ty}" r="17" fill="${ink}"/><circle cx="${cx}" cy="${ty}" r="12" fill="none" stroke="#5c1010" stroke-width="1.4"/>${text(cx, ty + 5, 'Q', 15, '#5c1010', 'script')}<path d="M${cx - 20},${ty + 14} l-6,14 l8,-4 Z M${cx + 20},${ty + 14} l6,14 l-8,-4 Z" fill="${ink}"/>`;
      break;
    }
    case 'kintsugi':
      top = `${text(cx, ty + 4, '金継ぎ', 15, ink, 'serif', { spacing: 3 })}<path d="M${cx - 70},${ty} H${cx - 32} M${cx + 32},${ty} H${cx + 70}" stroke="${ink}" stroke-width="1"/>`;
      break;
  }

  // ── Banner ──
  const lw = bx1 - bx0;
  const tf = r.font;
  const lbl = (y: number, color: string, size = 13.5, extra: Parameters<typeof text>[6] = {}) =>
    text(cx, y, o.label, size, color, tf, { max: lw - 28, spacing: tf === 'script' || tf === 'hand' ? 0 : 1.4, weight: tf === 'script' ? 400 : 800, ...extra });
  const T = r.text;
  const t0 = by - bh / 2;
  let banner = '';
  switch (r.banner) {
    case 'ribbon':
      banner = `<path d="M${bx0 - 14},${t0 + 8} H${bx0 + 4} V${t0 + bh + 6} H${bx0 - 14} L${bx0 - 6},${t0 + bh / 2 + 7} Z" fill="${A}" opacity=".75"/><path d="M${bx1 + 14},${t0 + 8} H${bx1 - 4} V${t0 + bh + 6} H${bx1 + 14} L${bx1 + 6},${t0 + bh / 2 + 7} Z" fill="${A}" opacity=".75"/><path d="M${bx0 + 4},${t0 + bh} L${bx0 + 4},${t0 + bh + 6} L${bx0 + 12},${t0 + bh} Z M${bx1 - 4},${t0 + bh} L${bx1 - 4},${t0 + bh + 6} L${bx1 - 12},${t0 + bh} Z" fill="#000" opacity=".35"/><rect x="${bx0 + 4}" y="${t0}" width="${lw - 8}" height="${bh}" fill="${A}"/><rect x="${bx0 + 8}" y="${t0 + 4}" width="${lw - 16}" height="${bh - 8}" fill="none" stroke="${T}" stroke-width=".7" opacity=".5"/>${lbl(by + 5, T)}`;
      break;
    case 'plaque':
      banner = `<rect x="${bx0}" y="${t0}" width="${lw}" height="${bh}" rx="10" fill="${A}"/><rect x="${bx0 + 4}" y="${t0 + 4}" width="${lw - 8}" height="${bh - 8}" rx="7" fill="none" stroke="${T}" stroke-width=".9" opacity=".6"/>${lbl(by + 5, T)}`;
      break;
    case 'pill':
      banner = `<rect x="${bx0}" y="${t0 + 2}" width="${lw}" height="${bh - 4}" rx="${(bh - 4) / 2}" fill="${A}"/>${lbl(by + 5, T)}`;
      break;
    case 'shadow-pill':
      banner = `<rect x="${bx0 + 5}" y="${t0 + 7}" width="${lw}" height="${bh - 4}" rx="${(bh - 4) / 2}" fill="#111"/><rect x="${bx0}" y="${t0 + 2}" width="${lw}" height="${bh - 4}" rx="${(bh - 4) / 2}" fill="${A}" stroke="#111" stroke-width="2"/>${lbl(by + 5, T)}`;
      break;
    case 'deco':
      banner = `<path d="${chamfer(bx0, t0, lw, bh, 12)}" fill="${A}"/><path d="${chamfer(bx0 + 4, t0 + 4, lw - 8, bh - 8, 9)}" fill="none" stroke="${T}" stroke-width=".9" opacity=".7"/><path d="M${bx0 - 18},${by} H${bx0 - 4} M${bx1 + 4},${by} H${bx1 + 18}" stroke="${A}" stroke-width="2"/>${lbl(by + 5, T)}`;
      break;
    case 'scroll':
      banner = `<rect x="${bx0}" y="${t0 + 2}" width="${lw}" height="${bh - 4}" fill="${A}"/><ellipse cx="${bx0}" cy="${by}" rx="7" ry="${bh / 2 - 2}" fill="${A}" stroke="#000" stroke-opacity=".3"/><ellipse cx="${bx1}" cy="${by}" rx="7" ry="${bh / 2 - 2}" fill="${A}" stroke="#000" stroke-opacity=".3"/>${lbl(by + 5, T)}`;
      break;
    case 'ema':
      banner = `<path d="M${bx0},${t0 + 10} L${bx0 + 16},${t0} H${bx1 - 16} L${bx1},${t0 + 10} V${t0 + bh} H${bx0} Z" fill="${A}"/><circle cx="${cx}" cy="${t0 + 6}" r="2" fill="${T}"/>${lbl(by + 8, T, 13)}`;
      break;
    case 'pixel':
      banner = `<path d="${pixelRect(bx0, t0, lw, bh, 6)}" fill="#000" stroke="${A}" stroke-width="3"/><path d="${pixelRect(bx0 + 6, t0 + 6, lw - 12, bh - 12, 3)}" fill="none" stroke="${A}" stroke-width="1" opacity=".6"/>${lbl(by + 5, A, 13)}`;
      break;
    case 'hud':
      banner = `<path d="M${bx0 + 14},${t0} H${bx1} L${bx1 - 14},${t0 + bh} H${bx0} Z" fill="${A}"/><path d="M${bx0 - 10},${t0} L${bx0 + 4},${t0} L${bx0 - 10},${t0 + bh} Z M${bx1 + 10},${t0 + bh} L${bx1 - 4},${t0 + bh} L${bx1 + 10},${t0} Z" fill="${A}" opacity=".5"/>${lbl(by + 5, T, 13)}`;
      break;
    case 'tape':
      banner = `<path d="M${bx0},${t0 + 4} l4,4 l-4,4 l4,4 l-4,4 l4,4 l-4,4 l4,4 l-4,4 H${bx1} l-4,-4 l4,-4 l-4,-4 l4,-4 l-4,-4 l4,-4 l-4,-4 l4,-4 Z" fill="${A}" opacity=".88" transform="rotate(-1.5 ${cx} ${by})"/>${lbl(by + 6, T)}`;
      break;
    case 'speech':
      banner = `<path d="M${bx0 + 12},${t0} H${bx1 - 12} Q${bx1},${t0} ${bx1},${t0 + 12} V${t0 + bh - 12} Q${bx1},${t0 + bh} ${bx1 - 12},${t0 + bh} H${bx0 + 12} Q${bx0},${t0 + bh} ${bx0},${t0 + bh - 12} V${t0 + 12} Q${bx0},${t0} ${bx0 + 12},${t0} Z M${cx - 14},${t0 + 1} L${cx + 6},${t0 - 16} L${cx + 4},${t0 + 1} Z" fill="#ffffff" stroke="#111" stroke-width="3" stroke-linejoin="round"/><rect x="${cx - 13}" y="${t0 - 1}" width="16" height="5" fill="#ffffff"/>${lbl(by + 6, A, 16)}`;
      break;
    case 'title-block':
      banner = `<rect x="${bx0 - 10}" y="${t0}" width="${lw + 20}" height="${bh}" fill="none" stroke="${A}" stroke-width="1.4"/><path d="M${bx1 - 54},${t0} V${t0 + bh} M${bx1 - 54},${t0 + bh / 2} H${bx1 + 10}" stroke="${A}" stroke-width="1"/>${text(bx1 - 22, t0 + 14, 'SCALE 1:1', 6.5, A, 'mono')}${text(bx1 - 22, t0 + 35, 'SHEET 01', 6.5, A, 'mono')}${text((bx0 - 10 + bx1 - 54) / 2, by + 5, o.label, 12, T, tf, { max: lw - 80, spacing: 1.2 })}`;
      break;
    case 'text':
      banner = `<path d="M${bx0 - 6},${by} H${bx0 + 18} M${bx1 - 18},${by} H${bx1 + 6}" stroke="${A}" stroke-width="1"/><path d="M${bx0 + 22},${by} l4,-4 l4,4 l-4,4 Z M${bx1 - 22},${by} l-4,-4 l-4,4 l4,4 Z" fill="${A}"/>${text(cx, by + 6, o.label, tf === 'script' ? 22 : 15, A, tf, { max: lw - 80, spacing: tf === 'script' ? 0 : 2.5, weight: tf === 'script' ? 400 : 700 })}`;
      break;
    case 'newspaper':
      banner = `<path d="M${bx0 - 22},${t0 - 4} H${bx1 + 22}" stroke="${ink}" stroke-width="1"/><rect x="${bx0 - 22}" y="${t0}" width="${lw + 44}" height="${bh}" fill="${A}"/>${text(cx, by + 6, o.label, 15, T, tf, { max: lw + 20, spacing: 0.5, weight: 800 })}<path d="M${bx0 - 22},${t0 + bh + 4} H${bx1 + 22}" stroke="${ink}" stroke-width="1"/>`;
      break;
    case 'bevel':
      banner = `<rect x="${bx0}" y="${t0 + 2}" width="${lw}" height="${bh - 4}" fill="${A}"/><path d="M${bx0},${t0 + bh - 2} V${t0 + 2} H${bx1}" fill="none" stroke="#ffffff" stroke-width="2"/><path d="M${bx1},${t0 + 2} V${t0 + bh - 2} H${bx0}" fill="none" stroke="#404040" stroke-width="2"/><rect x="${bx0 + 6}" y="${t0 + 8}" width="${lw - 12}" height="${bh - 16}" fill="none" stroke="#000" stroke-width="1" stroke-dasharray="1 2"/>${lbl(by + 5, T, 13, { weight: 400, spacing: 0 })}`;
      break;
    case 'cart':
      banner = `<rect x="${bx0}" y="${t0}" width="${lw}" height="${bh}" rx="6" fill="#fafafa"/><rect x="${bx0}" y="${t0}" width="${lw}" height="10" rx="5" fill="${A}"/><rect x="${bx0}" y="${t0 + 5}" width="${lw}" height="5" fill="${A}"/>${lbl(by + 9, A, 13)}`;
      break;
    case 'label':
      banner = `<g transform="rotate(-2 ${cx} ${by})"><rect x="${bx0}" y="${t0}" width="${lw}" height="${bh}" fill="#fffdf6" stroke="${r.ink}" stroke-width=".8" opacity=".95"/><rect x="${bx0 - 8}" y="${t0 - 6}" width="28" height="12" fill="#f5e6b8" opacity=".8" transform="rotate(-25 ${bx0 + 6} ${t0})"/><rect x="${bx1 - 20}" y="${t0 - 6}" width="28" height="12" fill="#f5e6b8" opacity=".8" transform="rotate(25 ${bx1 - 6} ${t0})"/>${text(cx, by + 6, o.label, 17, A, tf, { max: lw - 24, weight: 700 })}</g>`;
      break;
    case 'stamp':
      banner = `${text(cx, by + 2, o.label, 15, A, tf, { max: lw, spacing: 2, weight: 800 })}${text(cx, by + 18, 'POSTAGE · 25', 8, r.ink2, 'mono', { spacing: 2 })}`;
      break;
    case 'tag':
      banner = `<path d="M${bx0 + 18},${t0} H${bx1} V${t0 + bh} H${bx0 + 18} L${bx0},${by} Z" fill="${A}"/><circle cx="${bx0 + 16}" cy="${by}" r="4" fill="${r.mat instanceof Array ? r.mat[0] : r.mat}"/>${text(cx + 8, by + 5, o.label, 13.5, T, tf, { max: lw - 50, spacing: 1.4, weight: 800 })}`;
      break;
  }

  // ── Assemble ──
  const panelLine = r.panelLine ?? ink;
  const panel = `<rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="12" fill="${o.cardFill}"/><rect x="${P.x - 3}" y="${P.y - 3}" width="${P.w + 6}" height="${P.h + 6}" rx="14" fill="none" stroke="${panelLine}" stroke-width="1.4" opacity=".85"/>`;
  const back = o.transparent
    ? ''
    : `<defs>${defs.join('')}</defs><path d="${matPath}" fill="${matFill}"/>${pattern}${panel}`;
  const front = `${o.transparent ? `<defs>${defs.join('')}</defs>` : ''}${border}${corner(r.corner)}${top}${banner}`;
  return { back, front };
}

/** Small static preview tile for the picker (a fake QR block inside the frame). */
export function renderDecoFrameThumb(id: string): string {
  const qs = 150;
  const qx = 32 + DECO_SIDE_PAD;
  const qy = 32 + DECO_TOP_SPACE;
  const W = qs + qx * 2;
  const H = qy + qs + 32 + 82;
  const d = DECO_FRAME_MAP[id];
  if (!d) return '';
  const { back, front } = renderDecoFrame(id, { uid: `th${id}`, W, H, qx, qy, qs, accent: d.accent, label: d.defaultText.replace(/&/g, '&amp;').replace(/</g, '&lt;'), cardFill: '#ffffff', transparent: false });
  const cell = qs / 15;
  let mods = '';
  for (let rr = 0; rr < 15; rr++)
    for (let cc = 0; cc < 15; cc++) {
      const eye = (rr < 5 && cc < 5) || (rr < 5 && cc > 9) || (rr > 9 && cc < 5);
      if (!eye && rnd(rr * 15 + cc, 99) > 0.5) mods += `<rect x="${n(qx + cc * cell + 1)}" y="${n(qy + rr * cell + 1)}" width="${n(cell - 2)}" height="${n(cell - 2)}" rx="2"/>`;
    }
  const eyeAt = (x: number, y: number) => `<rect x="${n(x + 4)}" y="${n(y + 4)}" width="${n(cell * 5 - 8)}" height="${n(cell * 5 - 8)}" rx="6" fill="none" stroke="#111" stroke-width="8"/><rect x="${n(x + cell * 1.6)}" y="${n(y + cell * 1.6)}" width="${n(cell * 1.8)}" height="${n(cell * 1.8)}" rx="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%">${back}<g fill="#111">${mods}${eyeAt(qx, qy)}${eyeAt(qx + cell * 10, qy)}${eyeAt(qx, qy + cell * 10)}</g>${front}</svg>`;
}
