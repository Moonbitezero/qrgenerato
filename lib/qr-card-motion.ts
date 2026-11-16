// lib/qr-card-motion.ts
// 20 "card motion" overlays: ambient animations drawn over a whole card (dust, petals, light
// sweeps, film grain…). Pure SVG + CSS keyframes so they play in the live preview, inside the
// animated SVG download and in GIF / MP4 export (every animation-delay includes
// `- var(--t, 0s)`, which lib/qr-export.ts uses to freeze exact frames).
//
// Scannability: the overlay is masked out of the QR area, so the code itself never changes.
// Seamless loops: every animation's duration divides LOOP evenly.

export type CardMotionGroup = 'universal' | 'nature' | 'premium' | 'playful';

export interface CardMotion {
  id: string;
  name: string;
  group: CardMotionGroup;
  desc: string;
}

export const CARD_MOTION_GROUPS: { id: CardMotionGroup; label: string }[] = [
  { id: 'universal', label: 'Elegant' },
  { id: 'nature', label: 'Nature' },
  { id: 'premium', label: 'Premium' },
  { id: 'playful', label: 'Playful' },
];

export const CARD_MOTIONS: CardMotion[] = [
  { id: 'dust', name: 'Floating Dust', group: 'universal', desc: 'Tiny particles float like dust in sunlight' },
  { id: 'sweep', name: 'Light Sweep', group: 'universal', desc: 'A soft reflection travels diagonally across' },
  { id: 'bokeh', name: 'Floating Bokeh', group: 'universal', desc: 'Soft blurred circles drift slowly' },
  { id: 'holo', name: 'Holographic Shimmer', group: 'universal', desc: 'A subtle rainbow foil sheen moves over the art' },
  { id: 'sunlight', name: 'Gentle Sunlight', group: 'universal', desc: 'Soft light rays slowly change intensity' },
  { id: 'petals', name: 'Falling Petals', group: 'nature', desc: 'Petals drift down with a gentle sway' },
  { id: 'fireflies', name: 'Fireflies', group: 'nature', desc: 'Tiny lights glow and fade' },
  { id: 'rain', name: 'Rainfall', group: 'nature', desc: 'Fine rain streaks fall over the card' },
  { id: 'snow', name: 'Gentle Snow', group: 'nature', desc: 'Snowflakes fall at different speeds' },
  { id: 'seeds', name: 'Floating Seeds', group: 'nature', desc: 'Dandelion seeds float diagonally' },
  { id: 'border', name: 'Border Glow', group: 'premium', desc: 'A soft glow travels around the border' },
  { id: 'gradient', name: 'Gradient Drift', group: 'premium', desc: 'Colour tint slowly shifts between shades' },
  { id: 'grain', name: 'Film Grain', group: 'premium', desc: 'Subtle film-grain noise flickers' },
  { id: 'breathe', name: 'Breathing Glow', group: 'premium', desc: 'The edges gently brighten and relax' },
  { id: 'gloss', name: 'Gloss Reflection', group: 'premium', desc: 'A glossy highlight sweeps slowly' },
  { id: 'stars', name: 'Twinkling Stars', group: 'playful', desc: 'Star highlights appear and fade' },
  { id: 'confetti', name: 'Confetti Drift', group: 'playful', desc: 'Paper confetti floats around' },
  { id: 'ripple', name: 'Water Ripple', group: 'playful', desc: 'Soft circular ripples expand and fade' },
  { id: 'scanlines', name: 'Retro Scanlines', group: 'playful', desc: 'CRT lines with a rolling brightness bar' },
  { id: 'ambient', name: 'Ambient Particles', group: 'playful', desc: 'Geometric particles drift around the edges' },
];

export const CARD_MOTION_MAP: Record<string, CardMotion> = Object.fromEntries(CARD_MOTIONS.map((m) => [m.id, m]));

/** Loop length (seconds at 1× speed). All motions loop seamlessly at this length. */
export const CARD_MOTION_LOOP = 6;

const n = (v: number) => Number(v.toFixed(2));

/** Deterministic 0–1 noise so the same card always renders the same particles. */
function rnd(i: number, salt: number): number {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot?: number;
  o: number;
  /** Duration divisor (1 = full loop, 2 = twice per loop…) */
  k: number;
  shape: string;
  /** Optional inner wrapper class (sway / pulse) with its own divisor and phase */
  inner?: { cls: string; k: number };
}

interface Ctx {
  u: string;
  w: number;
  h: number;
  /** Loop length in seconds after speed is applied */
  D: number;
  /** Size scale relative to a 300px-wide card */
  s: number;
  /** Particle count multiplier */
  q: number;
}

function anim(c: Ctx, k: number, phase: number): string {
  const d = c.D / k;
  return `animation-duration:${n(d)}s;animation-delay:calc(${n(-phase * d)}s - var(--t, 0s))`;
}

function particles(c: Ctx, list: Particle[], cls: string): string {
  return list
    .map((p, i) => {
      const inner = p.inner
        ? `<g class="${c.u}${p.inner.cls}" style="${anim(c, p.inner.k, rnd(i, 91))}">${p.shape}</g>`
        : p.shape;
      return `<g transform="translate(${n(p.x)},${n(p.y)})"><g class="${c.u}${cls}" style="--dx:${n(p.dx)}px;--dy:${n(p.dy)}px;--r:${n(p.rot ?? 0)}deg;--o:${n(p.o)};${anim(c, p.k, rnd(i, 57))}">${inner}</g></g>`;
    })
    .join('');
}

const count = (c: Ctx, base: number) => Math.max(4, Math.round(base * c.q));

const BASE_CSS = (u: string) => `
@keyframes ${u}drift{0%{transform:translate(0,0) rotate(0deg);opacity:0}12%{opacity:var(--o)}88%{opacity:var(--o)}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
@keyframes ${u}fall{0%{transform:translate(0,0) rotate(0deg);opacity:var(--o)}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:var(--o)}}
@keyframes ${u}sway{0%,100%{transform:translateX(-6px)}50%{transform:translateX(6px)}}
@keyframes ${u}twinkle{0%,100%{transform:scale(.15);opacity:0}50%{transform:scale(1);opacity:var(--o,1)}}
@keyframes ${u}pulse{0%,100%{opacity:.15}50%{opacity:1}}
@keyframes ${u}ripple{0%{transform:scale(.12);opacity:0}12%{opacity:var(--o)}100%{transform:scale(1);opacity:0}}
.${u}drift{animation-name:${u}drift;animation-timing-function:linear;animation-iteration-count:infinite;transform-box:fill-box;transform-origin:center}
.${u}fall{animation-name:${u}fall;animation-timing-function:linear;animation-iteration-count:infinite;transform-box:fill-box;transform-origin:center}
.${u}sway{animation-name:${u}sway;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.${u}twinkle{animation-name:${u}twinkle;animation-timing-function:ease-in-out;animation-iteration-count:infinite;transform-box:fill-box;transform-origin:center}
.${u}pulse{animation-name:${u}pulse;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
.${u}ripple{animation-name:${u}ripple;animation-timing-function:ease-out;animation-iteration-count:infinite;transform-box:fill-box;transform-origin:center}
`;

interface Built {
  defs?: string;
  css?: string;
  body: string;
}

function build(id: string, c: Ctx): Built | null {
  const { u, w, h, s } = c;
  switch (id) {
    case 'dust': {
      const list: Particle[] = Array.from({ length: count(c, 34) }, (_, i) => ({
        x: rnd(i, 1) * w,
        y: rnd(i, 2) * h,
        dx: (18 + rnd(i, 3) * 40) * s,
        dy: -(8 + rnd(i, 4) * 34) * s,
        o: 0.45 + rnd(i, 5) * 0.5,
        k: rnd(i, 6) > 0.5 ? 1 : 2,
        shape: `<circle r="${n((0.6 + rnd(i, 7) * 1.3) * s)}" fill="#fff6d8"/>`,
      }));
      return { body: particles(c, list, 'drift') };
    }
    case 'sweep': {
      const bw = w * 0.32;
      const sl = h * 0.35;
      const travel = w + sl + bw;
      return {
        defs: `<linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
        css: `@keyframes ${u}sw{0%{transform:translateX(0)}55%,100%{transform:translateX(${n(travel)}px)}}.${u}sw{animation:${u}sw ${n(c.D / 2)}s ease-in-out infinite;animation-delay:calc(0s - var(--t, 0s))}`,
        body: `<g class="${u}sw"><path d="M${n(-bw)},0 H0 L${n(-sl)},${h} H${n(-sl - bw)} Z" fill="url(#${u}g)"/></g>`,
      };
    }
    case 'bokeh': {
      const list: Particle[] = Array.from({ length: count(c, 15) }, (_, i) => ({
        x: rnd(i, 11) * w,
        y: rnd(i, 12) * h,
        dx: (rnd(i, 13) - 0.5) * 50 * s,
        dy: -(15 + rnd(i, 14) * 40) * s,
        o: 0.45 + rnd(i, 15) * 0.45,
        k: 1,
        shape: `<circle r="${n((8 + rnd(i, 16) * 18) * s)}" fill="url(#${u}${i % 3 === 0 ? 'c' : 'w'})"/>`,
      }));
      return {
        defs: `<radialGradient id="${u}w"><stop offset="0" stop-color="#fff3d1" stop-opacity=".6"/><stop offset=".7" stop-color="#fff3d1" stop-opacity=".25"/><stop offset="1" stop-color="#fff3d1" stop-opacity="0"/></radialGradient><radialGradient id="${u}c"><stop offset="0" stop-color="#e0e7ff" stop-opacity=".55"/><stop offset=".7" stop-color="#e0e7ff" stop-opacity=".2"/><stop offset="1" stop-color="#e0e7ff" stop-opacity="0"/></radialGradient>`,
        body: particles(c, list, 'drift'),
      };
    }
    case 'holo':
      return {
        defs: `<linearGradient id="${u}g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="${n(h * 0.5)}" spreadMethod="repeat"><stop offset="0" stop-color="#ff6ad5"/><stop offset=".2" stop-color="#ffd86a"/><stop offset=".4" stop-color="#6affc8"/><stop offset=".6" stop-color="#6ac8ff"/><stop offset=".8" stop-color="#b56aff"/><stop offset="1" stop-color="#ff6ad5"/></linearGradient>`,
        css: `@keyframes ${u}ho{0%{transform:translateX(0)}100%{transform:translateX(${w}px)}}.${u}ho{animation:${u}ho ${n(c.D)}s linear infinite;animation-delay:calc(0s - var(--t, 0s))}`,
        body: `<g class="${u}ho" opacity=".2" style="mix-blend-mode:screen"><rect x="${-w}" y="0" width="${w * 2}" height="${h}" fill="url(#${u}g)"/></g>`,
      };
    case 'sunlight': {
      const rays = Array.from({ length: 6 }, (_, i) => {
        const a = (8 + i * 13) * (Math.PI / 180);
        const a2 = a + 0.07;
        const L = Math.hypot(w, h) * 1.1;
        return `<path d="M0,0 L${n(Math.cos(a) * L)},${n(Math.sin(a) * L)} L${n(Math.cos(a2) * L)},${n(Math.sin(a2) * L)} Z" fill="#fff4cf" opacity="${n(0.1 + rnd(i, 21) * 0.1)}"/>`;
      }).join('');
      return {
        defs: `<radialGradient id="${u}g" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${n(Math.max(w, h) * 0.9)}"><stop offset="0" stop-color="#fff1c1" stop-opacity=".6"/><stop offset="1" stop-color="#fff1c1" stop-opacity="0"/></radialGradient>`,
        css: `@keyframes ${u}sun{0%,100%{opacity:.35}50%{opacity:1}}@keyframes ${u}ray{0%,100%{transform:rotate(-2deg);opacity:.5}50%{transform:rotate(2.5deg);opacity:1}}.${u}sun{animation:${u}sun ${n(c.D / 2)}s ease-in-out infinite;animation-delay:calc(0s - var(--t, 0s))}.${u}ray{transform-origin:0 0;animation:${u}ray ${n(c.D)}s ease-in-out infinite;animation-delay:calc(0s - var(--t, 0s))}`,
        body: `<rect class="${u}sun" width="${w}" height="${h}" fill="url(#${u}g)"/><g class="${u}ray">${rays}</g>`,
      };
    }
    case 'petals': {
      const cols = ['#fbcfe8', '#f9a8d4', '#fda4af', '#fecdd3'];
      const list: Particle[] = Array.from({ length: count(c, 18) }, (_, i) => {
        const z = (0.7 + rnd(i, 31) * 0.7) * s;
        return {
          x: rnd(i, 32) * w * 1.1 - w * 0.05,
          y: -16 * s,
          dx: (rnd(i, 33) * 70 - 25) * s,
          dy: h + 32 * s,
          rot: 200 + rnd(i, 34) * 400,
          o: 0.75 + rnd(i, 35) * 0.25,
          k: 1,
          shape: `<path d="M0,${n(-5 * z)} C${n(4 * z)},${n(-4 * z)} ${n(4 * z)},${n(3 * z)} 0,${n(5 * z)} C${n(-4 * z)},${n(3 * z)} ${n(-4 * z)},${n(-4 * z)} 0,${n(-5 * z)} Z" fill="${cols[i % cols.length]}"/>`,
          inner: { cls: 'sway', k: 3 },
        };
      });
      return { body: particles(c, list, 'fall') };
    }
    case 'fireflies': {
      const list: Particle[] = Array.from({ length: count(c, 16) }, (_, i) => ({
        x: rnd(i, 41) * w,
        y: h * 0.25 + rnd(i, 42) * h * 0.7,
        dx: (rnd(i, 43) - 0.5) * 50 * s,
        dy: (rnd(i, 44) - 0.6) * 50 * s,
        o: 1,
        k: 1,
        shape: `<circle r="${n(6 * s)}" fill="url(#${u}g)"/><circle r="${n(1.3 * s)}" fill="#fffbe6"/>`,
        inner: { cls: 'pulse', k: rnd(i, 45) > 0.5 ? 2 : 3 },
      }));
      return {
        defs: `<radialGradient id="${u}g"><stop offset="0" stop-color="#fde68a" stop-opacity=".95"/><stop offset=".45" stop-color="#facc15" stop-opacity=".35"/><stop offset="1" stop-color="#facc15" stop-opacity="0"/></radialGradient>`,
        body: particles(c, list, 'drift'),
      };
    }
    case 'rain': {
      const list: Particle[] = Array.from({ length: count(c, 46) }, (_, i) => {
        const len = (9 + rnd(i, 51) * 9) * s;
        return {
          x: rnd(i, 52) * (w + 30 * s),
          y: -len,
          dx: -16 * s,
          dy: h + len * 2,
          o: 0.25 + rnd(i, 53) * 0.35,
          k: rnd(i, 54) > 0.5 ? 4 : 6,
          shape: `<line x1="0" y1="0" x2="${n(-len * 0.12)}" y2="${n(len)}" stroke="#e0f2fe" stroke-width="${n(0.9 * s)}" stroke-linecap="round"/>`,
        };
      });
      return { body: particles(c, list, 'fall') };
    }
    case 'snow': {
      const list: Particle[] = Array.from({ length: count(c, 42) }, (_, i) => {
        const r = 0.8 + rnd(i, 61) * 2.4;
        return {
          x: rnd(i, 62) * w,
          y: -6 * s,
          dx: (rnd(i, 63) - 0.5) * 36 * s,
          dy: h + 12 * s,
          o: 0.6 + rnd(i, 64) * 0.35,
          k: r > 2.2 ? 3 : r > 1.4 ? 2 : 1,
          shape: `<circle r="${n(r * s)}" fill="#ffffff"/>`,
          inner: { cls: 'sway', k: 2 },
        };
      });
      return { body: particles(c, list, 'fall') };
    }
    case 'seeds': {
      const seed = (z: number) =>
        `<circle r="${n(1.1 * z)}" fill="#fffdf5"/>` +
        Array.from({ length: 7 }, (_, j) => {
          const a = (-90 + (j - 3) * 22) * (Math.PI / 180);
          return `<line x1="0" y1="0" x2="${n(Math.cos(a) * 5.5 * z)}" y2="${n(Math.sin(a) * 5.5 * z)}" stroke="#fffdf5" stroke-width="${n(0.5 * z)}" stroke-linecap="round"/>`;
        }).join('') +
        `<line x1="0" y1="0" x2="0" y2="${n(4 * z)}" stroke="#fffdf5" stroke-width="${n(0.5 * z)}"/>`;
      const list: Particle[] = Array.from({ length: count(c, 14) }, (_, i) => ({
        x: rnd(i, 71) * w * 0.8 - w * 0.1,
        y: h * 0.45 + rnd(i, 72) * h * 0.6,
        dx: (110 + rnd(i, 73) * 90) * s,
        dy: -(150 + rnd(i, 74) * 110) * s,
        rot: 60 + rnd(i, 75) * 160,
        o: 0.65 + rnd(i, 76) * 0.3,
        k: 1,
        shape: seed((0.9 + rnd(i, 77) * 0.6) * s),
      }));
      return { body: particles(c, list, 'drift') };
    }
    case 'border': {
      const r = Math.min(w, h) * 0.035;
      const rect = (sw: number, op: number, col: string) =>
        `<rect class="${u}bd" x="6" y="6" width="${w - 12}" height="${h - 12}" rx="${n(r + 4)}" pathLength="100" fill="none" stroke="${col}" stroke-width="${n(sw * s)}" stroke-opacity="${op}" stroke-dasharray="12 38" stroke-linecap="round"/>`;
      return {
        css: `@keyframes ${u}bd{to{stroke-dashoffset:-100}}.${u}bd{animation:${u}bd ${n(c.D / 2)}s linear infinite;animation-delay:calc(0s - var(--t, 0s))}`,
        body: rect(10, 0.18, '#fff7d6') + rect(5, 0.35, '#fff7d6') + rect(2, 0.95, '#ffffff'),
      };
    }
    case 'gradient':
      return {
        defs: `<linearGradient id="${u}g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${n(w * 0.4)}" y2="${h}" spreadMethod="repeat"><stop offset="0" stop-color="#f472b6"/><stop offset=".33" stop-color="#a78bfa"/><stop offset=".66" stop-color="#22d3ee"/><stop offset="1" stop-color="#f472b6"/></linearGradient>`,
        css: `@keyframes ${u}gd{0%{transform:translate(0,0)}100%{transform:translate(${n(w * 0.4)}px,${h}px)}}.${u}gd{animation:${u}gd ${n(c.D)}s linear infinite;animation-delay:calc(0s - var(--t, 0s))}`,
        body: `<g opacity=".2" style="mix-blend-mode:soft-light"><g class="${u}gd"><rect x="${n(-w * 0.4)}" y="${-h}" width="${n(w * 1.4)}" height="${h * 2}" fill="url(#${u}g)"/></g></g>`,
      };
    case 'grain': {
      const frames = [1, 2, 3];
      return {
        defs: frames
          .map(
            (sd) =>
              `<filter id="${u}f${sd}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${n(0.85 / s)}" numOctaves="1" seed="${sd * 7}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`
          )
          .join(''),
        css: `@keyframes ${u}gr{0%,33.3%{opacity:.16}33.4%,100%{opacity:0}}.${u}gr{animation:${u}gr ${n(c.D / 12)}s steps(1,end) infinite}`,
        body: frames
          .map(
            (sd, i) =>
              `<rect class="${u}gr" width="${w}" height="${h}" filter="url(#${u}f${sd})" style="mix-blend-mode:overlay;animation-delay:calc(${n((-i * c.D) / 36)}s - var(--t, 0s))"/>`
          )
          .join(''),
      };
    }
    case 'breathe':
      return {
        defs: `<filter id="${u}f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${n(6 * s)}"/></filter>`,
        css: `@keyframes ${u}br{0%,100%{opacity:.08}50%{opacity:.6}}.${u}br{animation:${u}br ${n(c.D / 2)}s ease-in-out infinite;animation-delay:calc(0s - var(--t, 0s))}`,
        body: `<rect class="${u}br" x="7" y="7" width="${w - 14}" height="${h - 14}" rx="${n(12 * s)}" fill="none" stroke="#fffaf0" stroke-width="${n(14 * s)}" filter="url(#${u}f)"/>`,
      };
    case 'gloss':
      return {
        defs: `<linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".7" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
        css: `@keyframes ${u}gl{0%,100%{transform:translateX(${n(-w * 0.55)}px);opacity:.4}50%{transform:translateX(${n(w * 0.55)}px);opacity:1}}.${u}gl{animation:${u}gl ${n(c.D)}s ease-in-out infinite;animation-delay:calc(0s - var(--t, 0s))}`,
        body: `<g class="${u}gl"><ellipse cx="${w / 2}" cy="${n(h * 0.02)}" rx="${n(w * 0.75)}" ry="${n(h * 0.3)}" fill="url(#${u}g)" transform="rotate(-12 ${w / 2} ${n(h * 0.02)})"/></g>`,
      };
    case 'stars': {
      const star = (z: number) =>
        `<path d="M0,${n(-z)} L${n(z * 0.22)},${n(-z * 0.22)} L${n(z)},0 L${n(z * 0.22)},${n(z * 0.22)} L0,${n(z)} L${n(-z * 0.22)},${n(z * 0.22)} L${n(-z)},0 L${n(-z * 0.22)},${n(-z * 0.22)} Z" fill="#fffbe6"/>`;
      const list: Particle[] = Array.from({ length: count(c, 20) }, (_, i) => ({
        x: rnd(i, 81) * w,
        y: rnd(i, 82) * h,
        dx: 0,
        dy: 0,
        o: 0.75 + rnd(i, 83) * 0.25,
        k: rnd(i, 84) > 0.5 ? 2 : 3,
        shape: star((2.5 + rnd(i, 85) * 4) * s),
      }));
      return { body: particles(c, list, 'twinkle') };
    }
    case 'confetti': {
      const cols = ['#f472b6', '#facc15', '#34d399', '#60a5fa', '#a78bfa', '#fb923c'];
      const list: Particle[] = Array.from({ length: count(c, 26) }, (_, i) => {
        const cw = (3 + rnd(i, 91) * 2.5) * s;
        const ch = (6 + rnd(i, 92) * 4) * s;
        return {
          x: rnd(i, 93) * w,
          y: -12 * s,
          dx: (rnd(i, 94) - 0.5) * 70 * s,
          dy: h + 24 * s,
          rot: 360 + rnd(i, 95) * 540,
          o: 0.85,
          k: rnd(i, 96) > 0.6 ? 2 : 1,
          shape: `<rect x="${n(-cw / 2)}" y="${n(-ch / 2)}" width="${n(cw)}" height="${n(ch)}" rx="${n(0.8 * s)}" fill="${cols[i % cols.length]}"/>`,
          inner: { cls: 'sway', k: 3 },
        };
      });
      return { body: particles(c, list, 'fall') };
    }
    case 'ripple': {
      const centres = [
        [0.28, 0.3],
        [0.7, 0.52],
        [0.35, 0.72],
      ];
      const ring = `<circle r="${n(70 * s)}" fill="none" stroke="#ffffff" stroke-width="${n(1.4 * s)}"/>`;
      // Three rings per centre, staggered within each centre and offset between centres.
      const body = centres
        .flatMap(([cx, cy], ci) =>
          [0, 1, 2].map((j) => {
            const phase = (j / 3 + ci * 0.17) % 1;
            return `<g transform="translate(${n(cx * w)},${n(cy * h)})"><g class="${u}ripple" style="--o:.55;${anim(c, 2, phase)}">${ring}</g></g>`;
          })
        )
        .join('');
      return { body };
    }
    case 'scanlines':
      return {
        defs: `<pattern id="${u}p" width="4" height="${n(3 * s)}" patternUnits="userSpaceOnUse"><rect width="4" height="${n(1 * s)}" fill="#000" opacity=".16"/></pattern><linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
        css: `@keyframes ${u}roll{0%{transform:translateY(${n(-60 * s)}px)}100%{transform:translateY(${n(h + 60 * s)}px)}}@keyframes ${u}flk{0%,46%,50%,100%{opacity:1}47%{opacity:.55}48.5%{opacity:.9}}.${u}roll{animation:${u}roll ${n(c.D / 2)}s linear infinite;animation-delay:calc(0s - var(--t, 0s))}.${u}flk{animation:${u}flk ${n(c.D)}s steps(1,end) infinite;animation-delay:calc(0s - var(--t, 0s))}`,
        body: `<g class="${u}flk"><rect width="${w}" height="${h}" fill="url(#${u}p)"/><g class="${u}roll"><rect y="0" width="${w}" height="${n(60 * s)}" fill="url(#${u}g)"/></g></g>`,
      };
    case 'ambient': {
      const shapes = (i: number, z: number) => {
        switch (i % 4) {
          case 0:
            return `<circle r="${n(2 * z)}" fill="#ffffff"/>`;
          case 1:
            return `<path d="M0,${n(-3 * z)} L${n(3 * z)},0 L0,${n(3 * z)} L${n(-3 * z)},0 Z" fill="#ffffff"/>`;
          case 2:
            return `<path d="M0,${n(-3 * z)} L${n(2.8 * z)},${n(2 * z)} L${n(-2.8 * z)},${n(2 * z)} Z" fill="none" stroke="#ffffff" stroke-width="${n(0.9 * z)}"/>`;
          default:
            return `<circle r="${n(2.6 * z)}" fill="none" stroke="#ffffff" stroke-width="${n(0.9 * z)}"/>`;
        }
      };
      const m = 22 * s;
      const list: Particle[] = Array.from({ length: count(c, 24) }, (_, i) => {
        const edge = i % 4;
        const along = rnd(i, 101);
        const inset = m * (0.6 + rnd(i, 102) * 1.2);
        const drift = (30 + rnd(i, 103) * 40) * s * (rnd(i, 104) > 0.5 ? 1 : -1);
        const pos =
          edge === 0
            ? { x: along * w, y: inset, dx: drift, dy: 0 }
            : edge === 1
              ? { x: w - inset, y: along * h, dx: 0, dy: drift }
              : edge === 2
                ? { x: along * w, y: h - inset, dx: drift, dy: 0 }
                : { x: inset, y: along * h, dx: 0, dy: drift };
        return { ...pos, rot: 90 + rnd(i, 105) * 270, o: 0.35 + rnd(i, 106) * 0.4, k: 1, shape: shapes(i, (0.8 + rnd(i, 107) * 0.6) * s) };
      });
      return { body: particles(c, list, 'drift') };
    }
    default:
      return null;
  }
}

export interface CardMotionOptions {
  uid: string;
  w: number;
  h: number;
  /** QR box to keep clear (overlay is masked out here) */
  hole?: { x: number; y: number; size: number };
  speed?: number;
  /** Particle density multiplier (thumbnails use fewer) */
  density?: number;
  /** Size scale override (default: card width / 300). Thumbnails use larger particles to stay visible. */
  scale?: number;
}

/** Overlay markup (a self-contained <g>) for a card of size w×h, or '' for unknown ids. */
export function buildCardMotion(id: string, o: CardMotionOptions): string {
  const u = `cm${o.uid.replace(/[^a-z0-9]/gi, '')}`;
  const c: Ctx = {
    u,
    w: o.w,
    h: o.h,
    D: CARD_MOTION_LOOP / Math.max(0.1, o.speed ?? 1),
    s: o.scale ?? o.w / 300,
    q: o.density ?? 1,
  };
  const b = build(id, c);
  if (!b) return '';
  const pad = 10 * c.s;
  const hole = o.hole
    ? `<rect x="${n(o.hole.x - pad)}" y="${n(o.hole.y - pad)}" width="${n(o.hole.size + pad * 2)}" height="${n(o.hole.size + pad * 2)}" rx="${n(4 * c.s)}" fill="#000"/>`
    : '';
  return `<g class="${u}" pointer-events="none"><style>${BASE_CSS(u)}${b.css ?? ''}</style><defs><mask id="${u}mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${o.w}" height="${o.h}"><rect width="${o.w}" height="${o.h}" fill="#fff"/>${hole}</mask>${b.defs ?? ''}</defs><g mask="url(#${u}mask)">${b.body}</g></g>`;
}

/** Small animated preview tile for the picker: a dusk scene card with the motion playing. */
export function renderCardMotionThumb(id: string): string {
  const w = 120;
  const h = 160;
  const qr = { x: 78, y: 118, size: 30 };
  const overlay = buildCardMotion(id, { uid: `th${id}`, w, h, hole: qr, density: 0.6, scale: 0.75 });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
    <defs><linearGradient id="cmth${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#312e81"/><stop offset=".55" stop-color="#9d4e8f"/><stop offset="1" stop-color="#f59e6b"/></linearGradient>
    <clipPath id="cmth${id}cl"><rect width="${w}" height="${h}" rx="10"/></clipPath></defs>
    <g clip-path="url(#cmth${id}cl)">
      <rect width="${w}" height="${h}" fill="url(#cmth${id}bg)"/>
      <circle cx="84" cy="44" r="14" fill="#fde7c4" opacity=".9"/>
      <path d="M0,112 Q30,92 60,106 T120,98 V160 H0 Z" fill="#3b1d4a"/>
      <path d="M0,130 Q40,116 80,128 T120,124 V160 H0 Z" fill="#24112f"/>
      <rect x="${qr.x}" y="${qr.y}" width="${qr.size}" height="${qr.size}" rx="3" fill="#fff"/>
      <path d="M${qr.x + 4},${qr.y + 4}h7v7h-7z M${qr.x + 19},${qr.y + 4}h7v7h-7z M${qr.x + 4},${qr.y + 19}h7v7h-7z M${qr.x + 15},${qr.y + 15}h3v3h-3z M${qr.x + 20},${qr.y + 21}h4v4h-4z" fill="#111"/>
      ${overlay}
    </g>
  </svg>`;
}
