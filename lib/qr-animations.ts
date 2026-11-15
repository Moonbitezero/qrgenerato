// lib/qr-animations.ts
// 50 animated QR effects rendered as pure SVG (CSS keyframes + SMIL), so they
// work in the live preview AND inside the downloaded animated .svg file.
//
// Scannability rules every effect follows:
//  - finder eyes and quiet zone are never animated
//  - dark modules never fade below ~60% opacity or shrink below ~70% size
//  - texture / flow palettes only use dark tones on light backgrounds
//    (and are auto-lightened on dark backgrounds)

export type FxGroupId = 'popular' | 'reveal' | 'signature' | 'light' | 'motion' | 'texture' | 'energy' | 'advanced';

type DelayMap =
  | 'none'
  | 'diag'
  | 'radial'
  | 'row'
  | 'col'
  | 'spiral'
  | 'random'
  | 'checker'
  | 'reading'
  | 'rain';

type ModuleAnim =
  | 'breathe'
  | 'shrink'
  | 'twinkle'
  | 'flicker'
  | 'heartbeat'
  | 'echo'
  | 'flash'
  | 'cycle'
  | 'rotate'
  | 'wobble'
  | 'glitch'
  | 'chase'
  | 'trail'
  | 'drop'
  | 'pop'
  | 'reveal'
  | 'flip'
  | 'bounce'
  | 'spin'
  | 'jitter'
  | 'hue';

interface ModuleFx {
  anim: ModuleAnim;
  delay: DelayMap;
  dur: number;
  /** Colors for flash/cycle/chase/twinkle. Omit to use the design's accent. */
  colors?: string[];
}

interface FlowFx {
  colors: string[];
  dir: 'diag' | 'x' | 'y' | 'up' | 'rotate' | 'radial' | 'fill';
  dur: number;
}

interface PatternFx {
  kind: 'stripes' | 'carbon' | 'halftone' | 'circuit' | 'wave' | 'zoom' | 'marble' | 'checker' | 'spiral';
  base: string;
  accent: string;
  dur: number;
}

interface OverlayFx {
  kind: 'sweep' | 'scan' | 'laser' | 'spot' | 'glass' | 'shadow' | 'radar' | 'ring' | 'crosshair' | 'glint' | 'barscan' | 'lightning';
  color: string;
  opacity: number;
  dur: number;
}

export interface AnimatedEffect {
  id: string;
  name: string;
  group: FxGroupId;
  module?: ModuleFx;
  flow?: FlowFx;
  pattern?: PatternFx;
  overlays?: OverlayFx[];
}

export const FX_GROUPS: { id: FxGroupId; label: string }[] = [
  { id: 'popular', label: '★ Popular' },
  { id: 'reveal', label: '✦ Reveal & Motion' },
  { id: 'signature', label: '✦ Signature FX' },
  { id: 'light', label: 'Light & Glow' },
  { id: 'motion', label: 'Module Motion' },
  { id: 'texture', label: 'Metal & Texture' },
  { id: 'energy', label: 'Elemental' },
  { id: 'advanced', label: 'Advanced FX' },
];

const RAINBOW = ['#b91c1c', '#c2410c', '#a16207', '#15803d', '#0e7490', '#1d4ed8', '#7e22ce', '#be185d'];

export const ANIMATED_EFFECTS: AnimatedEffect[] = [
  // ── Light & Glow ───────────────────────────────────────────────
  { id: 'light-sweep', name: 'Light Sweep', group: 'light', overlays: [{ kind: 'sweep', color: '#ffffff', opacity: 0.6, dur: 2.8 }] },
  { id: 'module-scanner', name: 'Module Scanner', group: 'light', overlays: [{ kind: 'scan', color: '#22d3ee', opacity: 0.75, dur: 2.6 }] },
  { id: 'flowing-glow', name: 'Flowing Glow', group: 'light', flow: { colors: ['@fg', '@accent', '@fg'], dir: 'diag', dur: 4 } },
  { id: 'center-radiance', name: 'Center Radiance', group: 'light', module: { anim: 'flash', delay: 'radial', dur: 2.4 } },
  { id: 'rainbow-sweep', name: 'Rainbow Sweep', group: 'light', flow: { colors: RAINBOW, dir: 'x', dur: 5 } },
  { id: 'pixel-glow', name: 'Pixel Glow', group: 'light', module: { anim: 'twinkle', delay: 'random', dur: 2.2 } },
  { id: 'laser-pulse', name: 'Laser Pulse', group: 'light', overlays: [{ kind: 'laser', color: '#ef4444', opacity: 0.85, dur: 1.8 }] },
  {
    id: 'silver-shimmer',
    name: 'Silver Shimmer',
    group: 'light',
    flow: { colors: ['#1e293b', '#475569', '#0f172a', '#334155', '#1e293b'], dir: 'diag', dur: 6 },
    overlays: [{ kind: 'sweep', color: '#ffffff', opacity: 0.55, dur: 3.2 }],
  },
  {
    id: 'neon-breathing',
    name: 'Neon Breathing',
    group: 'light',
    flow: { colors: ['#a21caf', '#0e7490', '#a21caf'], dir: 'diag', dur: 6 },
    module: { anim: 'breathe', delay: 'none', dur: 2.6 },
  },
  { id: 'golden-flow', name: 'Golden Flow', group: 'light', flow: { colors: ['#713f12', '#b45309', '#854d0e', '#a16207', '#713f12'], dir: 'diag', dur: 4.5 } },

  // ── Module Motion ──────────────────────────────────────────────
  { id: 'pixel-twinkle', name: 'Pixel Twinkle', group: 'motion', module: { anim: 'twinkle', delay: 'random', dur: 1.6, colors: ['#6366f1'] } },
  { id: 'module-breathing', name: 'Module Breathing', group: 'motion', module: { anim: 'shrink', delay: 'none', dur: 2.4 } },
  { id: 'sequential-glow', name: 'Sequential Glow', group: 'motion', module: { anim: 'flash', delay: 'diag', dur: 2.2 } },
  { id: 'checkerboard-pulse', name: 'Checkerboard Pulse', group: 'motion', module: { anim: 'breathe', delay: 'checker', dur: 1.6 } },
  { id: 'wave-modules', name: 'Wave Modules', group: 'motion', module: { anim: 'shrink', delay: 'diag', dur: 2 } },
  { id: 'spiral-modules', name: 'Spiral Modules', group: 'motion', module: { anim: 'shrink', delay: 'spiral', dur: 2.6 } },
  { id: 'random-flicker', name: 'Random Flicker', group: 'motion', module: { anim: 'flicker', delay: 'random', dur: 1.8 } },
  { id: 'heartbeat-modules', name: 'Heartbeat Modules', group: 'motion', module: { anim: 'heartbeat', delay: 'radial', dur: 1.8 } },
  { id: 'pixel-echo', name: 'Pixel Echo', group: 'motion', module: { anim: 'trail', delay: 'diag', dur: 2.6 } },
  { id: 'module-spotlight', name: 'Module Spotlight', group: 'motion', overlays: [{ kind: 'spot', color: '@accent', opacity: 0.85, dur: 5 }] },

  // ── Metal & Texture ────────────────────────────────────────────
  { id: 'chrome-modules', name: 'Chrome Modules', group: 'texture', flow: { colors: ['#111827', '#4b5563', '#1f2937', '#6b7280', '#111827'], dir: 'y', dur: 3.5 } },
  {
    id: 'gold-foil',
    name: 'Gold Foil Modules',
    group: 'texture',
    flow: { colors: ['#78350f', '#b45309', '#92400e', '#a16207', '#78350f'], dir: 'diag', dur: 5 },
    overlays: [{ kind: 'sweep', color: '#fef3c7', opacity: 0.6, dur: 3 }],
  },
  {
    id: 'holographic',
    name: 'Holographic Modules',
    group: 'texture',
    flow: { colors: ['#7c3aed', '#0e7490', '#be185d', '#4338ca', '#7c3aed'], dir: 'diag', dur: 4 },
    overlays: [{ kind: 'glass', color: '#ffffff', opacity: 0.4, dur: 4 }],
  },
  { id: 'carbon-fibre', name: 'Carbon Fibre', group: 'texture', pattern: { kind: 'carbon', base: '#0b0b0f', accent: '#3f3f46', dur: 6 } },
  { id: 'circuit-modules', name: 'Circuit Modules', group: 'texture', pattern: { kind: 'circuit', base: '#064e3b', accent: '#10b981', dur: 3 } },
  { id: 'liquid-metal', name: 'Liquid Metal', group: 'texture', flow: { colors: ['#0f172a', '#475569', '#1e293b', '#64748b', '#0f172a'], dir: 'rotate', dur: 7 } },
  { id: 'moving-stripes', name: 'Moving Stripes', group: 'texture', pattern: { kind: 'stripes', base: '@fg', accent: '@accent', dur: 1.6 } },
  { id: 'halftone-texture', name: 'Halftone Texture', group: 'texture', pattern: { kind: 'halftone', base: '@fg', accent: '@accent', dur: 3 } },
  { id: 'marble-modules', name: 'Marble Modules', group: 'texture', pattern: { kind: 'marble', base: '#1f2937', accent: '#4b5563', dur: 9 } },
  { id: 'plasma-texture', name: 'Plasma Texture', group: 'texture', flow: { colors: ['#6d28d9', '#be185d', '#1d4ed8', '#9d174d', '#6d28d9'], dir: 'rotate', dur: 5 } },

  // ── Elemental ──────────────────────────────────────────────────
  {
    id: 'fire-modules',
    name: 'Fire Modules',
    group: 'energy',
    flow: { colors: ['#7f1d1d', '#c2410c', '#b91c1c', '#9a3412', '#7f1d1d'], dir: 'up', dur: 2 },
    module: { anim: 'flicker', delay: 'random', dur: 1.2 },
  },
  {
    id: 'ice-modules',
    name: 'Ice Modules',
    group: 'energy',
    flow: { colors: ['#0c4a6e', '#0369a1', '#1e3a8a', '#155e75', '#0c4a6e'], dir: 'diag', dur: 6 },
    overlays: [{ kind: 'sweep', color: '#e0f2fe', opacity: 0.6, dur: 3.4 }],
  },
  {
    id: 'electric-modules',
    name: 'Electric Modules',
    group: 'energy',
    flow: { colors: ['#1e3a8a', '#2563eb', '#1e40af', '#1d4ed8', '#1e3a8a'], dir: 'x', dur: 1.2 },
    module: { anim: 'flicker', delay: 'random', dur: 0.9 },
  },
  { id: 'rainbow-pixels', name: 'Rainbow Pixels', group: 'energy', module: { anim: 'cycle', delay: 'random', dur: 4, colors: RAINBOW } },
  {
    id: 'purple-energy',
    name: 'Purple Energy',
    group: 'energy',
    flow: { colors: ['#3b0764', '#7e22ce', '#581c87', '#9333ea', '#3b0764'], dir: 'radial', dur: 3 },
    module: { anim: 'shrink', delay: 'radial', dur: 2.2 },
  },
  { id: 'matrix-modules', name: 'Matrix Modules', group: 'energy', module: { anim: 'cycle', delay: 'rain', dur: 2, colors: ['#052e16', '#15803d', '#166534', '#052e16'] } },
  { id: 'red-lava', name: 'Red Lava', group: 'energy', flow: { colors: ['#450a0a', '#991b1b', '#c2410c', '#7f1d1d', '#450a0a'], dir: 'rotate', dur: 9 } },
  { id: 'blue-energy-flow', name: 'Blue Energy Flow', group: 'energy', flow: { colors: ['#172554', '#1d4ed8', '#0e7490', '#1e40af', '#172554'], dir: 'x', dur: 2.2 } },
  { id: 'aurora-modules', name: 'Aurora Modules', group: 'energy', flow: { colors: ['#065f46', '#0e7490', '#6d28d9', '#047857', '#065f46'], dir: 'y', dur: 7 } },
  { id: 'dual-colour-pulse', name: 'Dual Colour Pulse', group: 'energy', module: { anim: 'cycle', delay: 'checker', dur: 2, colors: ['@fg', '@accent'] } },

  // ── Advanced FX ────────────────────────────────────────────────
  {
    id: 'liquid-pixel',
    name: 'Liquid Pixel',
    group: 'advanced',
    flow: { colors: ['@fg', '@accent', '@fg'], dir: 'rotate', dur: 6 },
    module: { anim: 'wobble', delay: 'diag', dur: 2.4 },
  },
  { id: 'micro-rotation', name: 'Micro Rotation', group: 'advanced', module: { anim: 'rotate', delay: 'diag', dur: 3 } },
  { id: 'moving-inner-shadow', name: 'Moving Inner Shadow', group: 'advanced', overlays: [{ kind: 'shadow', color: '#000000', opacity: 0.5, dur: 3.6 }] },
  { id: 'pixel-zoom-texture', name: 'Pixel Zoom Texture', group: 'advanced', pattern: { kind: 'zoom', base: '@fg', accent: '@accent', dur: 4 } },
  { id: 'wave-distortion', name: 'Wave Distortion Texture', group: 'advanced', pattern: { kind: 'wave', base: '@fg', accent: '@accent', dur: 2 } },
  { id: 'glitch-modules', name: 'Glitch Modules', group: 'advanced', module: { anim: 'glitch', delay: 'random', dur: 2.4, colors: ['#be185d'] } },
  { id: 'module-light-chase', name: 'Module Light Chase', group: 'advanced', module: { anim: 'chase', delay: 'reading', dur: 3.2 } },
  { id: 'glass-reflection', name: 'Moving Glass Reflection', group: 'advanced', overlays: [{ kind: 'glass', color: '#ffffff', opacity: 0.5, dur: 3.6 }] },
  {
    id: 'cosmic-modules',
    name: 'Cosmic Modules',
    group: 'advanced',
    flow: { colors: ['#1e1b4b', '#581c87', '#0f172a', '#3730a3', '#1e1b4b'], dir: 'rotate', dur: 10 },
    module: { anim: 'twinkle', delay: 'random', dur: 2.6, colors: ['#6366f1'] },
  },
  {
    id: 'living-qr',
    name: 'Living QR',
    group: 'advanced',
    flow: { colors: ['@fg', '@accent', '@fg'], dir: 'diag', dur: 5 },
    module: { anim: 'shrink', delay: 'radial', dur: 3 },
    overlays: [{ kind: 'sweep', color: '#ffffff', opacity: 0.45, dur: 4.2 }],
  },
];

/** 20 newer effects built on dedicated animation types (reveals, sonar, radar, liquid…). */
ANIMATED_EFFECTS.push(
  // Reveal & Motion
  { id: 'build-up', name: 'Build-Up', group: 'reveal', module: { anim: 'drop', delay: 'reading', dur: 4 } },
  { id: 'pop-reveal', name: 'Pop Reveal', group: 'reveal', module: { anim: 'pop', delay: 'radial', dur: 2.4 } },
  { id: 'typewriter', name: 'Typewriter', group: 'reveal', module: { anim: 'reveal', delay: 'reading', dur: 3.6 } },
  { id: 'tile-flip', name: 'Tile Flip', group: 'reveal', module: { anim: 'flip', delay: 'diag', dur: 3 } },
  { id: 'bouncing-wave', name: 'Bouncing Wave', group: 'reveal', module: { anim: 'bounce', delay: 'col', dur: 1.8 } },
  { id: 'spin-cascade', name: 'Spin Cascade', group: 'reveal', module: { anim: 'spin', delay: 'diag', dur: 3.2 } },
  { id: 'rain-drops', name: 'Rain Drops', group: 'reveal', module: { anim: 'drop', delay: 'rain', dur: 2.4 } },
  { id: 'color-ripple', name: 'Color Ripple', group: 'reveal', module: { anim: 'cycle', delay: 'radial', dur: 3, colors: ['@fg', '@accent', '#0e7490', '@fg'] } },
  { id: 'nervous-jitter', name: 'Nervous Jitter', group: 'reveal', module: { anim: 'jitter', delay: 'random', dur: 0.6 } },
  {
    id: 'chameleon-hue',
    name: 'Chameleon Hue',
    group: 'reveal',
    flow: { colors: ['#be185d', '#7c3aed', '#0e7490', '#be185d'], dir: 'diag', dur: 6 },
    module: { anim: 'hue', delay: 'none', dur: 6 },
  },
  // Signature FX
  { id: 'radar-sweep', name: 'Radar Sweep', group: 'signature', overlays: [{ kind: 'radar', color: '#22c55e', opacity: 0.6, dur: 3 }] },
  { id: 'shockwave-ring', name: 'Shockwave Ring', group: 'signature', overlays: [{ kind: 'ring', color: '@accent', opacity: 0.85, dur: 2.2 }] },
  { id: 'crosshair-scan', name: 'Crosshair Scan', group: 'signature', overlays: [{ kind: 'crosshair', color: '#ef4444', opacity: 0.7, dur: 3 }] },
  { id: 'diamond-glint', name: 'Diamond Glint', group: 'signature', overlays: [{ kind: 'glint', color: '#ffffff', opacity: 1, dur: 2.4 }] },
  { id: 'liquid-fill', name: 'Liquid Fill', group: 'signature', flow: { colors: ['@accent', '@fg'], dir: 'fill', dur: 4 } },
  { id: 'spinning-stripes', name: 'Spinning Stripes', group: 'signature', pattern: { kind: 'spiral', base: '@fg', accent: '@accent', dur: 8 } },
  { id: 'barcode-scan', name: 'Barcode Scan', group: 'signature', overlays: [{ kind: 'barscan', color: '#22d3ee', opacity: 0.75, dur: 2.4 }] },
  { id: 'checker-flow', name: 'Checker Flow', group: 'signature', pattern: { kind: 'checker', base: '@fg', accent: '@accent', dur: 2 } },
  { id: 'lightning-flash', name: 'Lightning Flash', group: 'signature', overlays: [{ kind: 'lightning', color: '#ffffff', opacity: 0.8, dur: 3 }] },
  {
    id: 'sonar-pulse',
    name: 'Sonar Pulse',
    group: 'signature',
    module: { anim: 'shrink', delay: 'radial', dur: 2.2 },
    overlays: [{ kind: 'ring', color: '#0ea5e9', opacity: 0.8, dur: 2.2 }],
  }
);

/** The 12 most requested animations, shown under their popular names. */
export const POPULAR_FX: { id: string; label: string }[] = [
  { id: 'rainbow-sweep', label: 'Rainbow Sweep' },
  { id: 'pixel-twinkle', label: 'Pixel Twinkle' },
  { id: 'neon-breathing', label: 'Neon Breathing' },
  { id: 'liquid-metal', label: 'Liquid Metal' },
  { id: 'glitch-modules', label: 'Cyber Glitch' },
  { id: 'electric-modules', label: 'Electric Pulse' },
  { id: 'holographic', label: 'Holographic' },
  { id: 'golden-flow', label: 'Golden Flow' },
  { id: 'matrix-modules', label: 'Matrix Rain' },
  { id: 'plasma-texture', label: 'Plasma Wave' },
  { id: 'chrome-modules', label: 'Chrome Shine' },
  { id: 'pixel-echo', label: 'Pixel Echo' },
];

export const ANIMATED_EFFECT_MAP: Record<string, AnimatedEffect> = Object.fromEntries(
  ANIMATED_EFFECTS.map((e) => [e.id, e])
);

// ── Helpers ─────────────────────────────────────────────────────

function hash2(r: number, c: number): number {
  const s = Math.sin(r * 127.1 + c * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function isDarkColor(hex: string): boolean {
  const rgb = parseHex(hex);
  if (!rgb) return false;
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.2;
}

/** On dark backgrounds the modules must be light, so lift palette colours toward white. */
function lighten(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const out = rgb.map((v) => Math.round(v + (255 - v) * amount));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function moduleDelay(map: DelayMap, r: number, c: number, count: number): number {
  const n = Math.max(1, count - 1);
  const mid = n / 2;
  switch (map) {
    case 'diag':
      return 1 - (r + c) / (2 * n);
    case 'radial':
      return 1 - Math.hypot(r - mid, c - mid) / (mid * Math.SQRT2);
    case 'row':
      return 1 - r / n;
    case 'col':
      return 1 - c / n;
    case 'spiral': {
      const a = (Math.atan2(r - mid, c - mid) + Math.PI) / (2 * Math.PI);
      const d = Math.hypot(r - mid, c - mid) / (mid * Math.SQRT2);
      return (a + d * 0.6) % 1;
    }
    case 'random':
      return hash2(r, c);
    case 'checker':
      return ((r + c) % 2) * 0.5;
    case 'reading':
      return 1 - (r * count + c) / (count * count);
    case 'rain':
      return (1 - r / n + hash2(0, c)) % 1;
    default:
      return 0;
  }
}

export interface FxContext {
  uid: string;
  effect: AnimatedEffect;
  count: number;
  offsetX: number;
  offsetY: number;
  qrSize: number;
  fg: string;
  /** The design's body fill if it is a plain colour, else null (gradient/art fill) */
  solidFill: string | null;
  accent: string;
  bg: string;
  /** 0.5 = half speed, 2 = double speed */
  speed: number;
}

export interface FxLayer {
  /** Extra <defs> children */
  defs: string;
  /** <style> block (scoped by uid) */
  style: string;
  /** Replacement fill for the body group, or null to keep the design's own fill */
  bodyFill: string | null;
  /** Class added to the body group */
  bodyClass: string;
  /** Whether each module must be wrapped with wrapModule() */
  wrapModules: boolean;
  /** Overlay markup drawn above the body (already clipped to modules) */
  overlay: string;
  /** Id of the clipPath the caller must fill with plain body shapes, or null */
  clipId: string | null;
}

export function wrapModule(shape: string, delay: number): string {
  return `<g class="m" style="--d:${delay.toFixed(3)}">${shape}</g>`;
}

function keyframesFor(anim: ModuleAnim, base: string | null, colors: string[]): string {
  const c0 = colors[0];
  // With a gradient/pattern body fill there is no solid base: leave fill out of rest frames so the texture shows through.
  const rest = base ? `fill:${base};` : "";
  switch (anim) {
    case 'breathe':
      return '0%,100%{opacity:1}50%{opacity:.62}';
    case 'shrink':
      return '0%,100%{transform:scale(1)}50%{transform:scale(.72)}';
    case 'twinkle':
      return `0%,78%,100%{${rest}transform:scale(1)}88%{fill:${c0};transform:scale(.8)}`;
    case 'flicker':
      return '0%,100%{opacity:1}8%{opacity:.6}10%{opacity:1}46%{opacity:.75}48%{opacity:1}72%{opacity:.65}74%{opacity:1}';
    case 'heartbeat':
      return '0%,45%,100%{transform:scale(1)}12%{transform:scale(.74)}24%{transform:scale(1)}34%{transform:scale(.8)}';
    case 'echo':
      return '0%,100%{transform:scale(1);opacity:1}30%{transform:scale(.7);opacity:.7}60%{transform:scale(1.04);opacity:1}';
    case 'flash':
      return `0%,100%{${rest}}50%{fill:${c0}}`;
    case 'cycle': {
      const stops = [...colors, colors[0]];
      return stops.map((col, i) => `${((i / (stops.length - 1)) * 100).toFixed(1)}%{fill:${col}}`).join('');
    }
    case 'rotate':
      return '0%,100%{transform:rotate(0deg)}25%{transform:rotate(22deg)}75%{transform:rotate(-22deg)}';
    case 'wobble':
      return '0%,100%{transform:scale(1,1)}33%{transform:scale(.78,1.06)}66%{transform:scale(1.06,.78)}';
    case 'glitch':
      return `0%,86%,94%,100%{${rest}transform:translate(0,0)}88%{transform:translate(1.6px,0);fill:${c0}}91%{transform:translate(-1.6px,.8px);fill:${c0}}`;
    case 'chase':
      return `0%,12%,100%{${rest}transform:scale(1)}5%{fill:${c0};transform:scale(.82)}`;
    case 'trail':
      // A bright head followed by a slowly fading tail.
      return `0%{fill:${c0};transform:scale(.84)}6%{fill:${c0};transform:scale(.84)}40%,100%{${rest}transform:scale(1)}`;
    case 'drop':
      // Each module drops into place once per loop (short window keeps the code scannable).
      return '0%{transform:translateY(-70%);opacity:.3}8%{transform:translateY(8%);opacity:1}12%,100%{transform:translateY(0);opacity:1}';
    case 'pop':
      return '0%{transform:scale(.45)}8%{transform:scale(1.15)}14%,100%{transform:scale(1)}';
    case 'reveal':
      return `0%{opacity:.3;${rest}}5%{opacity:1;fill:${c0}}22%,100%{opacity:1;${rest}}`;
    case 'flip':
      return `0%,60%,100%{${rest}transform:scaleX(1)}70%{transform:scaleX(.08)}71%,88%{fill:${c0}}80%{transform:scaleX(1)}`;
    case 'bounce':
      return '0%,45%,100%{transform:translateY(0)}20%{transform:translateY(-38%)}32%{transform:translateY(4%)}';
    case 'spin':
      return '0%,55%{transform:rotate(0deg) scale(1)}78%{transform:rotate(180deg) scale(.62)}100%{transform:rotate(360deg) scale(1)}';
    case 'jitter':
      return '0%,100%{transform:translate(0,0)}25%{transform:translate(.7px,-.6px)}50%{transform:translate(-.6px,.5px)}75%{transform:translate(.5px,.7px)}';
    case 'hue':
      return '0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}';
  }
}

const EASING: Record<ModuleAnim, string> = {
  breathe: 'ease-in-out',
  shrink: 'ease-in-out',
  twinkle: 'ease-in-out',
  flicker: 'steps(1,end)',
  heartbeat: 'ease-out',
  echo: 'ease-in-out',
  flash: 'ease-in-out',
  cycle: 'linear',
  rotate: 'ease-in-out',
  wobble: 'ease-in-out',
  glitch: 'steps(1,end)',
  chase: 'linear',
  trail: 'ease-out',
  drop: 'ease-out',
  pop: 'ease-out',
  reveal: 'linear',
  flip: 'ease-in-out',
  bounce: 'ease-in-out',
  spin: 'ease-in-out',
  jitter: 'steps(4,end)',
  hue: 'linear',
};

const n2 = (v: number) => Number(v.toFixed(2));

export function buildFxLayer(ctx: FxContext): FxLayer {
  const { uid, effect, offsetX, offsetY, qrSize, speed } = ctx;
  const darkBg = isDarkColor(ctx.bg);
  const adapt = (col: string) => {
    const resolved = col === '@fg' ? ctx.fg : col === '@accent' ? ctx.accent : col;
    // User colours are already chosen against their background; only adapt built-in palettes.
    return darkBg && col !== '@fg' && col !== '@accent' ? lighten(resolved, 0.55) : resolved;
  };
  const t = (dur: number) => n2(dur / Math.max(0.1, speed));

  const defs: string[] = [];
  const overlays: string[] = [];
  let style = '';
  let bodyFill: string | null = null;
  let wrapModules = false;
  const bodyClass = `fx-${uid}`;
  const cx = offsetX + qrSize / 2;
  const cy = offsetY + qrSize / 2;

  // 1. Flowing gradient fill
  if (effect.flow) {
    const { dir } = effect.flow;
    const colors = effect.flow.colors.map(adapt);
    const stops = colors
      .map((col, i) => `<stop offset="${((i / (colors.length - 1)) * 100).toFixed(1)}%" stop-color="${col}"/>`)
      .join('');
    const id = `fxFlow_${uid}`;
    const dur = t(effect.flow.dur);
    if (dir === 'fill') {
      const [low, high] = colors; // low = liquid colour, high = colour above the surface
      const anim = `<animate attributeName="offset" values="1;0;1" keyTimes="0;.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="${dur}s" repeatCount="indefinite"/>`;
      defs.push(
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${offsetY}" x2="0" y2="${offsetY + qrSize}"><stop offset="0" stop-color="${high}"/><stop offset="1" stop-color="${high}">${anim}</stop><stop offset="1" stop-color="${low}">${anim}</stop><stop offset="1" stop-color="${low}"/></linearGradient>`
      );
    } else if (dir === 'radial') {
      defs.push(
        `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${n2(qrSize * 0.4)}" spreadMethod="reflect">${stops}<animate attributeName="r" values="${n2(qrSize * 0.25)};${n2(qrSize * 0.6)};${n2(qrSize * 0.25)}" dur="${dur}s" repeatCount="indefinite"/></radialGradient>`
      );
    } else if (dir === 'rotate') {
      defs.push(
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${offsetX}" y1="${offsetY}" x2="${offsetX + qrSize}" y2="${offsetY + qrSize}" spreadMethod="reflect">${stops}<animateTransform attributeName="gradientTransform" type="rotate" values="0 ${cx} ${cy};360 ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/></linearGradient>`
      );
    } else {
      const [dx, dy] = dir === 'x' ? [qrSize, 0] : dir === 'y' ? [0, qrSize] : dir === 'up' ? [0, -qrSize] : [qrSize, qrSize];
      const x2 = offsetX + (dir === 'y' || dir === 'up' ? 0 : qrSize);
      const y2 = offsetY + (dir === 'x' ? 0 : qrSize);
      defs.push(
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${offsetX}" y1="${offsetY}" x2="${x2}" y2="${y2}" spreadMethod="repeat">${stops}<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="${dx} ${dy}" dur="${dur}s" repeatCount="indefinite"/></linearGradient>`
      );
    }
    bodyFill = `url(#${id})`;
  }

  // 2. Moving texture pattern fill
  if (effect.pattern) {
    const { kind } = effect.pattern;
    const base = adapt(effect.pattern.base);
    const accent = adapt(effect.pattern.accent);
    const id = `fxPat_${uid}`;
    const dur = t(effect.pattern.dur);
    let w = 16;
    let h = 16;
    let body = '';
    let motion = '';
    switch (kind) {
      case 'stripes':
        body = `<rect width="16" height="16" fill="${base}"/><path d="M-4,4 L4,-4 M0,16 L16,0 M12,20 L20,12" stroke="${accent}" stroke-width="4"/>`;
        motion = `type="translate" from="0 0" to="16 0"`;
        break;
      case 'carbon':
        w = 8;
        h = 8;
        body = `<rect width="8" height="8" fill="${base}"/><rect width="4" height="4" fill="${accent}"/><rect x="4" y="4" width="4" height="4" fill="${accent}"/><rect width="4" height="1" fill="${accent}" opacity=".6" transform="translate(4 0)"/>`;
        motion = `type="translate" from="0 0" to="8 8"`;
        break;
      case 'halftone':
      case 'zoom':
        w = 10;
        h = 10;
        body = `<rect width="10" height="10" fill="${base}"/><circle cx="5" cy="5" r="2.6" fill="${accent}"/>`;
        motion = kind === 'zoom' ? `type="scale" values="1;2.2;1"` : `type="translate" from="0 0" to="10 10"`;
        break;
      case 'circuit':
        w = 20;
        h = 20;
        body = `<rect width="20" height="20" fill="${base}"/><path d="M0,10 H6 V4 H14 V0 M10,20 V14 H20 M14,4 H20" stroke="${accent}" stroke-width="1.3" fill="none"/><circle cx="6" cy="10" r="1.6" fill="${accent}"/><circle cx="10" cy="14" r="1.6" fill="${accent}"/>`;
        motion = `type="translate" from="0 0" to="20 0"`;
        break;
      case 'wave':
        w = 24;
        h = 12;
        body = `<rect width="24" height="12" fill="${base}"/><path d="M0,6 Q6,0 12,6 T24,6" stroke="${accent}" stroke-width="3" fill="none"/>`;
        motion = `type="translate" from="0 0" to="24 0"`;
        break;
      case 'checker':
        w = 12;
        h = 12;
        body = `<rect width="12" height="12" fill="${base}"/><rect width="6" height="6" fill="${accent}"/><rect x="6" y="6" width="6" height="6" fill="${accent}"/>`;
        motion = `type="translate" from="0 0" to="12 12"`;
        break;
      case 'spiral':
        w = 14;
        h = 14;
        body = `<rect width="14" height="14" fill="${base}"/><rect width="14" height="5" fill="${accent}"/>`;
        motion = `type="rotate" values="0 ${cx} ${cy};360 ${cx} ${cy}"`;
        break;
      case 'marble':
        w = 60;
        h = 60;
        body = `<rect width="60" height="60" fill="${base}"/><path d="M0,14 C14,4 22,26 36,16 S54,8 60,18 M0,44 C12,36 26,56 40,44 S54,38 60,48 M18,0 C22,14 10,24 16,36 S28,52 22,60" stroke="${accent}" stroke-width="2.2" fill="none"/>`;
        motion = `type="translate" from="0 0" to="60 60"`;
        break;
    }
    defs.push(
      `<pattern id="${id}" patternUnits="userSpaceOnUse" x="${offsetX}" y="${offsetY}" width="${w}" height="${h}">${body}<animateTransform attributeName="patternTransform" ${motion} dur="${dur}s" repeatCount="indefinite"/></pattern>`
    );
    bodyFill = `url(#${id})`;
  }

  // 3. Per-module CSS animation
  if (effect.module) {
    const { anim, delay } = effect.module;
    const dur = t(effect.module.dur);
    const colors = (effect.module.colors ?? ['@accent']).map(adapt);
    const base = bodyFill ? null : ctx.solidFill;
    const groupLevel = delay === 'none' && (anim === 'breathe' || anim === 'flicker' || anim === 'hue');
    const selector = groupLevel ? `.${bodyClass}` : `.${bodyClass} .m`;
    wrapModules = !groupLevel;
    style += `${selector}{transform-box:fill-box;transform-origin:center;animation:fxk-${uid} ${dur}s ${EASING[anim]} infinite;animation-delay:calc(var(--d,0) * -${dur}s - var(--t, 0s))}`;
    style += `@keyframes fxk-${uid}{${keyframesFor(anim, base, colors)}}`;
  }

  // 4. Light overlays clipped to the module shapes
  let clipId: string | null = null;
  if (effect.overlays?.length) {
    clipId = `fxClip_${uid}`;
    effect.overlays.forEach((o, i) => {
      const color = o.color === '@accent' ? ctx.accent : o.color;
      const gid = `fxOv_${uid}_${i}`;
      const dur = t(o.dur);
      const band = (o.kind === 'glass' ? 0.6 : 0.4) * qrSize;
      switch (o.kind) {
        case 'sweep':
        case 'glass':
        case 'shadow': {
          const op = o.opacity;
          const stops =
            o.kind === 'glass'
              ? `<stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".3" stop-color="${color}" stop-opacity="${op}"/><stop offset=".42" stop-color="${color}" stop-opacity="0"/><stop offset=".6" stop-color="${color}" stop-opacity="${n2(op * 0.6)}"/><stop offset=".7" stop-color="${color}" stop-opacity="0"/>`
              : `<stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".5" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/>`;
          defs.push(`<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0">${stops}</linearGradient>`);
          const from = n2(-band - qrSize * 0.4);
          const to = n2(qrSize * 1.4);
          overlays.push(
            `<g transform="rotate(25 ${cx} ${cy})"><rect x="${offsetX}" y="${n2(offsetY - qrSize * 0.5)}" width="${n2(band)}" height="${n2(qrSize * 2)}" fill="url(#${gid})"><animateTransform attributeName="transform" type="translate" values="${from} 0;${to} 0;${to} 0" keyTimes="0;0.65;1" dur="${dur}s" repeatCount="indefinite"/></rect></g>`
          );
          break;
        }
        case 'scan':
        case 'laser': {
          const bh = o.kind === 'laser' ? 6 : 22;
          defs.push(
            `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".5" stop-color="${color}" stop-opacity="${o.opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`
          );
          overlays.push(
            `<rect x="${offsetX}" y="${offsetY - bh}" width="${qrSize}" height="${bh}" fill="url(#${gid})"><animateTransform attributeName="transform" type="translate" values="0 0;0 ${qrSize + bh};0 0" dur="${dur}s" repeatCount="indefinite"/></rect>`
          );
          break;
        }
        case 'radar': {
          const R = qrSize * 0.75;
          const a = (40 * Math.PI) / 180;
          defs.push(
            `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${cx}" y1="${n2(cy - R)}" x2="${n2(cx + R * Math.sin(a))}" y2="${n2(cy - R * Math.cos(a))}"><stop offset="0" stop-color="${color}" stop-opacity="${o.opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`
          );
          overlays.push(
            `<g><path d="M${cx},${cy} L${cx},${n2(cy - R)} A${n2(R)},${n2(R)} 0 0 1 ${n2(cx + R * Math.sin(a))},${n2(cy - R * Math.cos(a))} Z" fill="url(#${gid})"/><path d="M${cx},${cy} L${cx},${n2(cy - R)}" stroke="${color}" stroke-width="${n2(qrSize * 0.012)}" opacity="${o.opacity}"/><animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/></g>`
          );
          break;
        }
        case 'ring': {
          const R = qrSize * 0.72;
          overlays.push(
            `<circle cx="${cx}" cy="${cy}" r="0" fill="none" stroke="${color}" stroke-width="${n2(qrSize * 0.07)}"><animate attributeName="r" values="0;${n2(R)}" dur="${dur}s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="${o.opacity};0" dur="${dur}s" repeatCount="indefinite"/></circle>`
          );
          break;
        }
        case 'crosshair':
        case 'barscan': {
          const bw = qrSize * (o.kind === 'barscan' ? 0.08 : 0.06);
          defs.push(
            `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".5" stop-color="${color}" stop-opacity="${o.opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`
          );
          overlays.push(
            `<rect x="${n2(offsetX - bw)}" y="${offsetY}" width="${n2(bw)}" height="${qrSize}" fill="url(#${gid})"><animateTransform attributeName="transform" type="translate" values="0 0;${n2(qrSize + bw)} 0;0 0" dur="${dur}s" repeatCount="indefinite"/></rect>`
          );
          if (o.kind === 'crosshair') {
            defs.push(
              `<linearGradient id="${gid}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".5" stop-color="${color}" stop-opacity="${o.opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`
            );
            overlays.push(
              `<rect x="${offsetX}" y="${n2(offsetY - bw)}" width="${qrSize}" height="${n2(bw)}" fill="url(#${gid}v)"><animateTransform attributeName="transform" type="translate" values="0 ${n2(qrSize + bw)};0 0;0 ${n2(qrSize + bw)}" dur="${dur}s" repeatCount="indefinite"/></rect>`
            );
          }
          break;
        }
        case 'glint': {
          let g = '';
          const sz = qrSize * 0.07;
          for (let k = 0; k < 9; k++) {
            const gx = n2(offsetX + qrSize * (0.12 + hash2(k, 31) * 0.76));
            const gy = n2(offsetY + qrSize * (0.12 + hash2(k, 47) * 0.76));
            const a0 = n2((k / 9) * 0.84);
            const star = `M0,${n2(-sz)} L${n2(sz * 0.22)},${n2(-sz * 0.22)} L${n2(sz)},0 L${n2(sz * 0.22)},${n2(sz * 0.22)} L0,${n2(sz)} L${n2(-sz * 0.22)},${n2(sz * 0.22)} L${n2(-sz)},0 L${n2(-sz * 0.22)},${n2(-sz * 0.22)} Z`;
            g += `<g transform="translate(${gx} ${gy})"><path d="${star}" fill="${color}" opacity="${o.opacity}"><animateTransform attributeName="transform" type="scale" values="0;0;1;0;0" keyTimes="0;${a0};${n2(a0 + 0.06)};${n2(a0 + 0.14)};1" dur="${dur}s" repeatCount="indefinite"/></path></g>`;
          }
          overlays.push(g);
          break;
        }
        case 'lightning': {
          overlays.push(
            `<rect x="${offsetX}" y="${offsetY}" width="${qrSize}" height="${qrSize}" fill="${color}" opacity="0"><animate attributeName="opacity" values="0;0;${o.opacity};0;${n2(o.opacity * 0.6)};0;0" keyTimes="0;.62;.64;.68;.71;.76;1" dur="${dur}s" repeatCount="indefinite"/></rect>`
          );
          break;
        }
        case 'spot': {
          defs.push(
            `<radialGradient id="${gid}"><stop offset="0" stop-color="${color}" stop-opacity="${o.opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`
          );
          const r = qrSize * 0.3;
          const q = qrSize * 0.25;
          overlays.push(
            `<circle cx="${cx}" cy="${cy}" r="${n2(r)}" fill="url(#${gid})"><animateTransform attributeName="transform" type="translate" values="${-q} ${-q};${q} ${-q};${q} ${q};${-q} ${q};${-q} ${-q}" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1"/></circle>`
          );
          break;
        }
      }
    });
  }

  // Laser also draws a thin unclipped beam across the whole code for the "scanner" look.
  const laser = effect.overlays?.find((o) => o.kind === 'laser');
  const beam = laser
    ? `<rect x="${offsetX - 6}" y="${offsetY - 1}" width="${qrSize + 12}" height="1.6" rx=".8" fill="${laser.color}" opacity=".55"><animateTransform attributeName="transform" type="translate" values="0 0;0 ${qrSize};0 0" dur="${t(laser.dur)}s" repeatCount="indefinite"/></rect>`
    : '';

  if (style) {
    style = `<style>${style}@media (prefers-reduced-motion:reduce){.${bodyClass},.${bodyClass} .m{animation:none!important}}</style>`;
  }

  return {
    defs: defs.join(''),
    style,
    bodyFill,
    bodyClass,
    wrapModules,
    overlay: (clipId ? `<g clip-path="url(#${clipId})" pointer-events="none">${overlays.join('')}</g>` : '') + beam,
    clipId,
  };
}

// ── Picker thumbnails ───────────────────────────────────────────

const THUMB_N = 13;
const THUMB_MATRIX: boolean[][] = Array.from({ length: THUMB_N }, (_, r) =>
  Array.from({ length: THUMB_N }, (_, c) => hash2(r + 3, c + 7) > 0.48)
);

/** Small self-contained animated preview for the effect picker. */
export function renderEffectThumb(effect: AnimatedEffect, fg = '#111827', accent = '#7c3aed'): string {
  const uid = `th_${effect.id.replace(/[^a-z0-9]/gi, '')}`;
  const cell = 7;
  const off = 6;
  const qrSize = THUMB_N * cell;
  const total = qrSize + off * 2;
  const fx = buildFxLayer({ uid, effect, count: THUMB_N, offsetX: off, offsetY: off, qrSize, fg, solidFill: fg, accent, bg: '#ffffff', speed: 1 });

  const isEye = (r: number, c: number) => (r < 4 && c < 4) || (r < 4 && c >= THUMB_N - 4) || (r >= THUMB_N - 4 && c < 4);
  let plain = '';
  let wrapped = '';
  for (let r = 0; r < THUMB_N; r++) {
    for (let c = 0; c < THUMB_N; c++) {
      if (isEye(r, c) || !THUMB_MATRIX[r][c]) continue;
      const shape = `<rect x="${off + c * cell + 0.5}" y="${off + r * cell + 0.5}" width="${cell - 1}" height="${cell - 1}" rx="1.8"/>`;
      plain += shape;
      if (fx.wrapModules) wrapped += wrapModule(shape, moduleDelay(effect.module!.delay, r, c, THUMB_N));
    }
  }
  const eye = (x: number, y: number) =>
    `<rect x="${x + 1.5}" y="${y + 1.5}" width="${cell * 4 - 3}" height="${cell * 4 - 3}" rx="5" fill="none" stroke="${fg}" stroke-width="3"/><rect x="${x + 7}" y="${y + 7}" width="${cell * 4 - 14}" height="${cell * 4 - 14}" rx="2.5" fill="${fg}"/>`;
  const eyes = eye(off, off) + eye(off + (THUMB_N - 4) * cell, off) + eye(off, off + (THUMB_N - 4) * cell);
  const clip = fx.clipId ? `<clipPath id="${fx.clipId}">${plain}</clipPath>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="100%" height="100%">${fx.style}<defs>${fx.defs}${clip}</defs><rect width="${total}" height="${total}" rx="10" fill="#ffffff"/><g class="${fx.bodyClass}" fill="${fx.bodyFill ?? fg}">${fx.wrapModules ? wrapped : plain}</g>${fx.overlay}${eyes}</svg>`;
}

/** Natural loop length of an effect in seconds (longest of its animations), used for GIF / MP4 export. */
export function effectLoopSeconds(effect: AnimatedEffect, speed: number): number {
  const durs = [effect.module?.dur, effect.flow?.dur, effect.pattern?.dur, ...(effect.overlays ?? []).map((o) => o.dur)].filter(
    (d): d is number => typeof d === 'number'
  );
  return durs.length ? Math.max(...durs) / Math.max(0.1, speed) : 0;
}
