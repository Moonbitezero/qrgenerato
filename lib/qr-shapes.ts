// lib/qr-shapes.ts
// QR Style Studio shapes: body modules, finder-eye rings and finder-eye centres, as pure SVG string builders.
// Shapes are written once in a 0–1 unit box and mapped onto each module, so every style scales with the
// dot-size / eye-size controls. Shared by the studio renderer, the picker previews and the scan tests.
//
// Scannability rules followed here: a ring always stays a closed dark band about one module thick, the
// light gap inside it is kept clear, and eye ornaments only grow outward (toward the quiet zone).

// ── Catalogues ──────────────────────────────────────────────────

export interface ShapeOption {
  id: string;
  label: string;
}

/** Body (data module) styles. The first 20 are the studio set; the rest keep older templates working. */
export const BODY_STYLES: ShapeOption[] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded Square' },
  { id: 'dots', label: 'Circle' },
  { id: 'small-circle', label: 'Small Circle' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'flower', label: 'Flower' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'droplet', label: 'Droplet' },
  { id: 'pixel', label: 'Pixel' },
  { id: 'x-cross', label: 'Cross' },
  { id: 'cross', label: 'Plus' },
  { id: 'tiny-dash', label: 'Tiny Dash' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'petal', label: 'Petal' },
  { id: 'sparkle', label: 'Sparkle' },
  { id: 'ring', label: 'Ring' },
  { id: 'capsule', label: 'Capsule' },
  { id: 'liquid', label: 'Liquid' },
  { id: 'classy', label: 'Classy' },
  { id: 'extra-round', label: 'Extra Round' },
  { id: 'v-bars', label: 'V-Bars' },
  { id: 'h-bars', label: 'H-Bars' },
];

export const EYE_RING_STYLES: ShapeOption[] = [
  { id: 'square', label: 'Classic Square' },
  { id: 'rounded', label: 'Rounded Square' },
  { id: 'circle', label: 'Circle' },
  { id: 'double-circle', label: 'Double Circle' },
  { id: 'diamond-frame', label: 'Diamond Frame' },
  { id: 'star-frame', label: 'Star Frame' },
  { id: 'shoujo', label: 'Shoujo Eye' },
  { id: 'cat-eye', label: 'Cat Eye' },
  { id: 'gothic', label: 'Gothic Eye' },
  { id: 'magical', label: 'Magical Eye' },
  { id: 'sakura', label: 'Sakura Eye' },
  { id: 'cyber', label: 'Cyber Eye' },
  { id: 'floral', label: 'Floral Eye' },
  { id: 'crown', label: 'Crown Eye' },
  { id: 'ornamental', label: 'Ornamental Eye' },
  { id: 'hexagon-frame', label: 'Hexagon Frame' },
  { id: 'shield-frame', label: 'Shield Frame' },
  { id: 'heart-frame', label: 'Heart Frame' },
  { id: 'butterfly-frame', label: 'Butterfly Frame' },
  { id: 'crystal-frame', label: 'Crystal Frame' },
  { id: 'leaf-tl', label: 'Leaf Top-Left' },
  { id: 'leaf-tr', label: 'Leaf Top-Right' },
  { id: 'leaf-bl', label: 'Leaf Bottom-Left' },
  { id: 'leaf-br', label: 'Leaf Bottom-Right' },
  { id: 'cut', label: 'Cut Corner' },
  { id: 'dotted', label: 'Dotted' },
];

export const EYE_CENTER_STYLES: ShapeOption[] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded Square' },
  { id: 'circle', label: 'Circle' },
  { id: 'small-circle', label: 'Small Circle' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'flower', label: 'Flower' },
  { id: 'moon', label: 'Crescent Moon' },
  { id: 'cat-pupil', label: 'Cat Pupil' },
  { id: 'galaxy', label: 'Galaxy' },
  { id: 'crystal', label: 'Crystal' },
  { id: 'cross', label: 'Cross' },
  { id: 'sparkle', label: 'Sparkle' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'butterfly', label: 'Butterfly' },
  { id: 'sakura', label: 'Sakura' },
  { id: 'four-star', label: 'Four-point Star' },
  { id: 'hollow-circle', label: 'Hollow Circle' },
  { id: 'mini-flower', label: 'Mini Flower' },
  { id: 'grid', label: '3×3 Grid' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'sunburst', label: 'Sunburst' },
];

// ── Fine-tune options ───────────────────────────────────────────

export const DOT_SIZES = { tiny: 0.55, small: 0.74, medium: 1, large: 1.12 } as const;
export const DOT_SPACINGS = { compact: 1.08, normal: 1, wide: 0.82 } as const;
export const EYE_THICKNESS = { thin: 0.72, medium: 1, thick: 1.22 } as const;
export const EYE_SIZES = { small: 0.88, medium: 1, large: 1.1 } as const;
export type DotSize = keyof typeof DOT_SIZES;
export type DotSpacing = keyof typeof DOT_SPACINGS;
export type EyeThickness = keyof typeof EYE_THICKNESS;
export type EyeSize = keyof typeof EYE_SIZES;

// ── Unit-path mapping ───────────────────────────────────────────

const n = (v: number) => Math.round(v * 100) / 100;
const ARITY: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, Q: 4, A: 7, Z: 0 };
const parsed = new Map<string, (string | number)[]>();

/** Maps an absolute-command unit path (0–1 box) onto the box at (x, y) of size w×h. */
function mapPath(d: string, x: number, y: number, w: number, h = w): string {
  let toks = parsed.get(d);
  if (!toks) {
    toks = (d.match(/[MLHVCQAZ]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map((t) => (/[A-Z]/.test(t) ? t : Number(t)));
    parsed.set(d, toks);
  }
  let out = '';
  let i = 0;
  while (i < toks.length) {
    const cmd = toks[i++] as string;
    out += cmd;
    const k = ARITY[cmd];
    const a = toks.slice(i, i + k) as number[];
    i += k;
    if (cmd === 'H') out += n(x + a[0] * w);
    else if (cmd === 'V') out += n(y + a[0] * h);
    else if (cmd === 'A') out += [n(a[0] * w), n(a[1] * h), a[2], a[3], a[4], n(x + a[5] * w), n(y + a[6] * h)].join(' ');
    else if (k) {
      const pts: string[] = [];
      for (let j = 0; j < k; j += 2) pts.push(`${n(x + a[j] * w)},${n(y + a[j + 1] * h)}`);
      out += pts.join(' ');
    }
    out += ' ';
  }
  return out.trim();
}

/** Points on a closed polar curve r(θ) in a unit box centred at .5,.5 (θ = 0 points up). */
function polarPath(r: (t: number) => number, steps = 72): string {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rr = r(t);
    d += `${i ? 'L' : 'M'}${n(0.5 + Math.sin(t) * rr)} ${n(0.5 - Math.cos(t) * rr)} `;
  }
  return d + 'Z';
}

function starPoints(points: number, outer: number, inner: number, rot = 0): string {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const t = rot + (i * Math.PI) / points;
    d += `${i ? 'L' : 'M'}${n(0.5 + Math.sin(t) * r)} ${n(0.5 - Math.cos(t) * r)} `;
  }
  return d + 'Z';
}

function petals(count: number, dist: number, rx: number, ry: number, notch: boolean): string {
  // Each petal is an ellipse-like path pointing outward, built in polar space.
  let d = '';
  for (let p = 0; p < count; p++) {
    const t0 = (p * Math.PI * 2) / count;
    const pts: [number, number][] = [];
    for (let s = 0; s <= 24; s++) {
      const a = (s / 24) * Math.PI * 2;
      let px = Math.sin(a) * rx;
      let py = -Math.cos(a) * ry - dist;
      if (notch && Math.abs(Math.sin(a)) < 0.2 && Math.cos(a) > 0) py += ry * 0.35; // sakura notch at the tip
      const cx = px * Math.cos(t0) - py * Math.sin(t0);
      const cy = px * Math.sin(t0) + py * Math.cos(t0);
      px = cx;
      py = cy;
      pts.push([0.5 + px, 0.5 + py]);
    }
    d += pts.map(([a, b], i) => `${i ? 'L' : 'M'}${n(a)} ${n(b)}`).join(' ') + ' Z ';
  }
  return d;
}

// Unit paths (computed once).
const U = {
  heart: 'M.5 .92 C.12 .66 0 .42 .1 .22 C.2 .03 .42 .05 .5 .24 C.58 .05 .8 .03 .9 .22 C1 .42 .88 .66 .5 .92 Z',
  star5: starPoints(5, 0.52, 0.22),
  hexPointy: 'M.5 0 L.95 .25 L.95 .75 L.5 1 L.05 .75 L.05 .25 Z',
  hexFlat: 'M.25 .05 L.75 .05 L1 .5 L.75 .95 L.25 .95 L0 .5 Z',
  triangle: 'M.5 .04 L.98 .92 L.02 .92 Z',
  droplet: 'M.5 0 C.76 .34 .92 .5 .92 .66 C.92 .88 .73 1 .5 1 C.27 1 .08 .88 .08 .66 C.08 .5 .24 .34 .5 0 Z',
  xcross: 'M.2 0 L.5 .3 L.8 0 L1 .2 L.7 .5 L1 .8 L.8 1 L.5 .7 L.2 1 L0 .8 L.3 .5 L0 .2 Z',
  plus: 'M.3 .08 H.7 V.3 H.92 V.7 H.7 V.92 H.3 V.7 H.08 V.3 H.3 Z',
  leaf: 'M.06 .94 C.06 .4 .4 .06 .94 .06 C.94 .6 .6 .94 .06 .94 Z',
  petal: 'M0 1 V.5 A.5 .5 0 0 1 .5 0 A.5 .5 0 0 1 1 .5 A.5 .5 0 0 1 .5 1 Z',
  sparkle: 'M.5 0 Q.56 .44 1 .5 Q.56 .56 .5 1 Q.44 .56 0 .5 Q.44 .44 .5 0 Z',
  fourStar: 'M.5 0 L.62 .38 L1 .5 L.62 .62 L.5 1 L.38 .62 L0 .5 L.38 .38 Z',
  // ring with a centre dot: scanners sample the middle of each module, so it must stay dark
  ring: 'M.5 .02 A.48 .48 0 1 1 .5 .98 A.48 .48 0 1 1 .5 .02 Z M.5 .2 A.3 .3 0 1 0 .5 .8 A.3 .3 0 1 0 .5 .2 Z M.5 .32 A.18 .18 0 1 1 .5 .68 A.18 .18 0 1 1 .5 .32 Z',
  // a disc with a thin light outline inside: reads as hollow, but the middle stays dark for scanners
  hollow: 'M.5 0 A.5 .5 0 1 1 .5 1 A.5 .5 0 1 1 .5 0 Z M.5 .14 A.36 .36 0 1 0 .5 .86 A.36 .36 0 1 0 .5 .14 Z M.5 .18 A.32 .32 0 1 1 .5 .82 A.32 .32 0 1 1 .5 .18 Z',
  // crescent bitten from the top-right corner, away from the lines scanners read through the centre
  moon: 'M.5 0 A.5 .5 0 1 0 1 .5 L.97 .32 A.3 .3 0 0 1 .68 .03 Z',
  catPupil: 'M.5 0 Q.9 .5 .5 1 Q.1 .5 .5 0 Z',
  crystal: 'M.28 .04 L.72 .04 L.97 .34 L.5 .98 L.03 .34 Z',
  galaxy:
    'M.5 .3 A.2 .2 0 1 1 .5 .7 A.2 .2 0 1 1 .5 .3 Z M.5 .04 C.9 .04 1 .42 .82 .62 C.86 .36 .72 .2 .5 .22 Z M.5 .96 C.1 .96 0 .58 .18 .38 C.14 .64 .28 .8 .5 .78 Z',
  sakura: petals(5, 0.25, 0.14, 0.2, true) + ' M.5 .38 A.12 .12 0 1 1 .5 .62 A.12 .12 0 1 1 .5 .38 Z',
  flower: petals(5, 0.26, 0.15, 0.2, false) + ' M.5 .36 A.14 .14 0 1 1 .5 .64 A.14 .14 0 1 1 .5 .36 Z',
  miniFlower: petals(4, 0.22, 0.13, 0.17, false) + ' M.5 .4 A.1 .1 0 1 1 .5 .6 A.1 .1 0 1 1 .5 .4 Z',
  butterfly:
    'M.47 .48 C.3 .1 .02 .1 .06 .34 C.08 .46 .24 .5 .47 .5 Z M.53 .48 C.7 .1 .98 .1 .94 .34 C.92 .46 .76 .5 .53 .5 Z M.47 .52 C.3 .54 .12 .62 .2 .8 C.28 .94 .42 .78 .47 .56 Z M.53 .52 C.7 .54 .88 .62 .8 .8 C.72 .94 .58 .78 .53 .56 Z M.46 .3 H.54 V.82 H.46 Z',
  classy: 'M0 .4 Q0 0 .4 0 H1 V.6 Q1 1 .6 1 H0 Z',
  // Ring outlines (mid-line of the band) in a unit box
  diamond: 'M.5 0 L1 .5 L.5 1 L0 .5 Z',
  // Circle with 8 short rays placed between the axes and diagonals (scanners read along those lines)
  starRays: polarPath((t) => 0.5 + 0.13 * Math.pow(Math.max(0, Math.cos(4 * (t - Math.PI / 8))), 24), 192),
  catLens: 'M0 .5 Q.5 -.5 1 .5 Q.5 1.5 0 .5 Z',
  gothic: 'M0 1 V.34 C0 .12 .3 .04 .5 0 C.7 .04 1 .12 1 .34 V1 Z',
  shield: 'M0 0 H1 V.5 Q1 .86 .5 1 Q0 .86 0 .5 Z',
  heartRing: 'M.5 1 C.3 .86 0 .66 0 .42 C0 .14 .16 0 .3 0 C.41 0 .47 .02 .5 .05 C.53 .02 .59 0 .7 0 C.84 0 1 .14 1 .42 C1 .66 .7 .86 .5 1 Z',
  chamfer: 'M.2 0 H.8 L1 .2 V.8 L.8 1 H.2 L0 .8 V.2 Z',
  scallop: polarPath((t) => 0.47 + 0.03 * Math.cos(12 * t), 96),
  butterflyRing: polarPath((t) => 0.5 + 0.1 * Math.pow(Math.abs(Math.sin(2 * t)), 3), 120),
  crystalRing: 'M.5 0 L.92 .22 L1 .5 L.92 .78 L.5 1 L.08 .78 L0 .5 L.08 .22 Z',
  crown: 'M0 1 L.06 .25 L.3 .62 L.5 0 L.7 .62 L.94 .25 L1 1 Z',
  tinySparkle: 'M.5 0 Q.55 .45 1 .5 Q.55 .55 .5 1 Q.45 .55 0 .5 Q.45 .45 .5 0 Z',
};

// ── Body modules ────────────────────────────────────────────────

export interface BodyOpts {
  /** dot size × spacing multiplier (1 = fills the cell) */
  scale: number;
  /** corner radius 0–1 for rounded shapes */
  radius: number;
  /** is the neighbouring module dark? (for connected styles) */
  right?: boolean;
  bottom?: boolean;
}

/** One dark data module as SVG markup (fill comes from the parent group). */
export function bodyModule(style: string, x: number, y: number, s: number, o: BodyOpts): string {
  const w = s * o.scale;
  const x0 = x + (s - w) / 2;
  const y0 = y + (s - w) / 2;
  const p = (d: string) => `<path d="${mapPath(d, x0, y0, w)}"/>`;
  const rect = (rx: number) => `<rect x="${n(x0)}" y="${n(y0)}" width="${n(w)}" height="${n(w)}"${rx ? ` rx="${n(rx)}"` : ''}/>`;
  switch (style) {
    case 'rounded':
      return rect(Math.max(0.5, (w / 2) * o.radius));
    case 'extra-round':
      return rect(w * 0.45);
    case 'dots':
      return `<circle cx="${n(x0 + w / 2)}" cy="${n(y0 + w / 2)}" r="${n(w * 0.46)}"/>`;
    case 'small-circle':
      return `<circle cx="${n(x0 + w / 2)}" cy="${n(y0 + w / 2)}" r="${n(w * 0.32)}"/>`;
    case 'diamond':
      return p(U.diamond);
    case 'star':
      return p(U.star5);
    case 'heart':
      return p(U.heart);
    case 'flower':
      return p(U.flower);
    case 'hexagon':
      return p(U.hexPointy);
    case 'triangle':
      return p(U.triangle);
    case 'droplet':
      return p(U.droplet);
    case 'pixel': {
      // 3×3 sub-pixels with hairline gaps; the middle one keeps the module centre dark
      const q = w * 0.31;
      const g = w * 0.035;
      return [0, 1, 2].flatMap((a) => [0, 1, 2].map((b) => `<rect x="${n(x0 + a * (q + g))}" y="${n(y0 + b * (q + g))}" width="${n(q)}" height="${n(q)}"/>`)).join('');
    }
    case 'x-cross':
      return p(U.xcross);
    case 'cross':
      return p(U.plus);
    case 'tiny-dash':
      return `<rect x="${n(x0 + w * 0.12)}" y="${n(y0 + w * 0.36)}" width="${n(w * 0.76)}" height="${n(w * 0.28)}" rx="${n(w * 0.14)}"/>`;
    case 'leaf':
      return p(U.leaf);
    case 'petal':
      return p(U.petal);
    case 'sparkle':
      return p(U.sparkle);
    case 'ring':
      return `<path fill-rule="evenodd" d="${mapPath(U.ring, x0, y0, w)}"/>`;
    case 'capsule':
      return `<rect x="${n(x0 + w * 0.2)}" y="${n(y0)}" width="${n(w * 0.6)}" height="${n(w)}" rx="${n(w * 0.3)}"/>`;
    case 'classy':
      return p(U.classy);
    case 'liquid': {
      let out = `<rect x="${n(x0 + 0.5)}" y="${n(y0 + 0.5)}" width="${n(w - 1)}" height="${n(w - 1)}" rx="${n(w * 0.38)}"/>`;
      if (o.right) out += `<rect x="${n(x0 + w * 0.45)}" y="${n(y0 + 0.5)}" width="${n(s - w * 0.45 + w * 0.15)}" height="${n(w - 1)}"/>`;
      if (o.bottom) out += `<rect x="${n(x0 + 0.5)}" y="${n(y0 + w * 0.45)}" width="${n(w - 1)}" height="${n(s - w * 0.45 + w * 0.15)}"/>`;
      return out;
    }
    case 'v-bars':
      return `<rect x="${n(x0 + w * 0.13)}" y="${n(y)}" width="${n(w * 0.74)}" height="${n(s)}" rx="${n(w * 0.32)}"/>`;
    case 'h-bars':
      return `<rect x="${n(x)}" y="${n(y0 + w * 0.13)}" width="${n(s)}" height="${n(w * 0.74)}" rx="${n(w * 0.32)}"/>`;
    default:
      // Square: a hair of overlap at full size so neighbouring modules never show seams.
      return o.scale >= 1 ? `<rect x="${n(x0)}" y="${n(y0)}" width="${n(w + 0.25)}" height="${n(w + 0.25)}"/>` : rect(0);
  }
}

// ── Finder eyes ─────────────────────────────────────────────────

export interface EyeOpts {
  cell: number;
  ringFill: string;
  centerFill: string;
  /** 0 = top-left, 1 = top-right, 2 = bottom-left: ornaments point toward the outer corner */
  index: number;
  thickness: number;
  size: number;
  radius: number;
  /** previews only: draw just the centre */
  noRing?: boolean;
}

/** A finder eye whose 7×7 box starts at (x, y). */
export function finderEye(ring: string, center: string, x: number, y: number, o: EyeOpts): string {
  // The ring always spans the full 7×7 modules: scanners measure the module grid from it, so only the
  // centre is resized by the eye-size control.
  const O = 7 * o.cell;
  const ox = x;
  const oy = y;
  const t = o.cell * o.thickness; // ring band thickness
  const mx = ox + t / 2;
  const my = oy + t / 2;
  const mw = O - t; // mid-line box
  const cx = ox + O / 2;
  const cy = oy + O / 2;
  const stroke = (d: string, extra = '') =>
    `<path d="${mapPath(d, mx, my, mw)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}" stroke-linejoin="round"${extra}/>`;
  // Outward direction toward this eye's outer corner (for ornaments in the quiet zone).
  const dx = o.index === 1 ? 1 : -1;
  const dy = o.index === 2 ? 1 : -1;
  const ornament = (d: string, size: number, ax: number, ay: number, fill = o.ringFill) =>
    `<path d="${mapPath(d, ax - size / 2, ay - size / 2, size)}" fill="${fill}"/>`;

  let ringSvg = '';
  switch (ring) {
    case 'rounded':
      ringSvg = `<rect x="${n(mx)}" y="${n(my)}" width="${n(mw)}" height="${n(mw)}" rx="${n(Math.max(2, (mw / 2) * o.radius))}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}"/>`;
      break;
    case 'circle':
      ringSvg = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(mw / 2)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}"/>`;
      break;
    case 'double-circle':
      ringSvg =
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(mw / 2 - t * 0.12)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t * 0.62)}"/>` +
        `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(mw / 2 + t * 0.36)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t * 0.24)}"/>`;
      break;
    case 'diamond-frame':
      ringSvg = stroke(U.diamond);
      break;
    case 'star-frame':
      ringSvg = stroke(U.starRays);
      break;
    case 'shoujo': {
      // Round eye + three eyelashes sweeping toward the outer corner + a sparkle.
      ringSvg = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(mw / 2)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}"/>`;
      const R = O / 2;
      for (const a of [-0.55, -0.25, 0.05]) {
        const base = Math.atan2(dy, dx) + a * (o.index === 1 ? -1 : 1);
        const sx = cx + Math.cos(base) * (R - t * 0.2);
        const sy = cy + Math.sin(base) * (R - t * 0.2);
        const ex = cx + Math.cos(base) * (R + o.cell * 1.15);
        const ey = cy + Math.sin(base) * (R + o.cell * 1.15);
        ringSvg += `<path d="M${n(sx)} ${n(sy)} Q${n((sx + ex) / 2 + dx * o.cell * 0.3)} ${n((sy + ey) / 2)} ${n(ex)} ${n(ey)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t * 0.42)}" stroke-linecap="round"/>`;
      }
      break;
    }
    case 'cat-eye': {
      ringSvg = stroke(U.catLens);
      // winged liner flick at the outer corner
      const fx = dx > 0 ? ox + O : ox;
      ringSvg += `<path d="M${n(fx)} ${n(cy)} L${n(fx + dx * o.cell * 1.1)} ${n(cy + dy * o.cell * 0.9)} L${n(fx - dx * o.cell * 0.2)} ${n(cy - dy * t * 0.2)} Z" fill="${o.ringFill}"/>`;
      break;
    }
    case 'gothic': {
      ringSvg = stroke(U.gothic);
      break;
    }
    case 'magical': {
      ringSvg = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(mw / 2)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}"/>`;
      const d = O / 2 + o.cell * 0.15;
      for (const [sx, sy, sz] of [
        [dx, dy, 1.3],
        [-dx, dy, 0.8],
        [dx, -dy, 0.8],
      ] as const) {
        ringSvg += ornament(U.tinySparkle, o.cell * sz, cx + sx * d * 0.92, cy + sy * d * 0.92);
      }
      break;
    }
    case 'sakura': {
      ringSvg = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(mw / 2)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}"/>`;
      const d = O / 2 + o.cell * 0.05;
      ringSvg += ornament(U.sakura, o.cell * 2, cx + dx * d * 0.86, cy + dy * d * 0.86);
      break;
    }
    case 'cyber': {
      ringSvg = stroke(U.chamfer);
      const g = o.cell * 0.55;
      // HUD ticks outside two chamfered corners
      const vx = dx > 0 ? ox + O + g * 2 : ox - g * 2;
      const hy = dy > 0 ? oy + O + g * 2 : oy - g * 2;
      // HUD ticks beside the corners, clear of the centre lines and diagonals
      ringSvg += `<path d="M${n(vx)} ${n(oy + O * 0.06)} V${n(oy + O * 0.3)} M${n(vx)} ${n(oy + O * 0.7)} V${n(oy + O * 0.94)}" stroke="${o.ringFill}" stroke-width="${n(t * 0.35)}" stroke-linecap="square"/>`;
      ringSvg += `<path d="M${n(ox + O * 0.06)} ${n(hy)} H${n(ox + O * 0.3)} M${n(ox + O * 0.7)} ${n(hy)} H${n(ox + O * 0.94)}" stroke="${o.ringFill}" stroke-width="${n(t * 0.35)}" stroke-linecap="square"/>`;
      break;
    }
    case 'floral':
      ringSvg = stroke(U.scallop);
      break;
    case 'crown': {
      ringSvg = `<rect x="${n(mx)}" y="${n(my)}" width="${n(mw)}" height="${n(mw)}" rx="${n(mw * 0.22)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}"/>`;
      const cw = o.cell * 2.6;
      const ch = o.cell * 1.3;
      const cyTop = dy < 0 ? oy - ch - o.cell * 1.1 : oy + O + o.cell * 1.1;
      ringSvg += `<path d="${mapPath(U.crown, cx - cw / 2, cyTop, cw, ch)}" fill="${o.ringFill}"/>`;
      break;
    }
    case 'ornamental': {
      ringSvg = `<rect x="${n(mx)}" y="${n(my)}" width="${n(mw)}" height="${n(mw)}" rx="${n(mw * 0.3)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}"/>`;
      const k = o.cell * 0.9;
      for (const [ax, ay] of [
        [ox + k * 0.35, oy + k * 0.35],
        [ox + O - k * 0.35, oy + k * 0.35],
        [ox + k * 0.35, oy + O - k * 0.35],
        [ox + O - k * 0.35, oy + O - k * 0.35],
      ]) {
        ringSvg += ornament(U.diamond, k, ax, ay);
      }
      break;
    }
    case 'hexagon-frame':
      ringSvg = stroke(U.hexFlat);
      break;
    case 'shield-frame':
      ringSvg = stroke(U.shield);
      break;
    case 'heart-frame':
      ringSvg = stroke(U.heartRing);
      break;
    case 'butterfly-frame':
      ringSvg = stroke(U.butterflyRing);
      break;
    case 'crystal-frame':
      ringSvg = stroke(U.crystalRing) + ornament(U.tinySparkle, o.cell * 1.2, cx + dx * O * 0.5, cy + dy * O * 0.5);
      break;
    case 'leaf-tl':
    case 'leaf-tr':
    case 'leaf-bl':
    case 'leaf-br': {
      const r = mw * 0.32;
      const c = { tl: ring === 'leaf-tl', tr: ring === 'leaf-tr', bl: ring === 'leaf-bl', br: ring === 'leaf-br' };
      // the named corner and its opposite are rounded
      const rTL = c.tl || c.br ? r : 0;
      const rTR = c.tr || c.bl ? r : 0;
      const rBR = c.tl || c.br ? r : 0;
      const rBL = c.tr || c.bl ? r : 0;
      const L = mx;
      const T = my;
      const R = mx + mw;
      const B = my + mw;
      ringSvg = `<path d="M${n(L + rTL)} ${n(T)} H${n(R - rTR)} Q${n(R)} ${n(T)} ${n(R)} ${n(T + rTR)} V${n(B - rBR)} Q${n(R)} ${n(B)} ${n(R - rBR)} ${n(B)} H${n(L + rBL)} Q${n(L)} ${n(B)} ${n(L)} ${n(B - rBL)} V${n(T + rTL)} Q${n(L)} ${n(T)} ${n(L + rTL)} ${n(T)} Z" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}"/>`;
      break;
    }
    case 'cut':
      ringSvg = stroke('M.18 0 H.82 L1 .18 V.82 L.82 1 H.18 L0 .82 V.18 Z');
      break;
    case 'dotted':
      ringSvg = `<rect x="${n(mx)}" y="${n(my)}" width="${n(mw)}" height="${n(mw)}" rx="${n(mw * 0.16)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}" stroke-dasharray="${n(o.cell * 1.4)} ${n(o.cell * 0.22)}"/>`;
      break;
    default:
      ringSvg = `<rect x="${n(mx)}" y="${n(my)}" width="${n(mw)}" height="${n(mw)}" fill="none" stroke="${o.ringFill}" stroke-width="${n(t)}"/>`;
  }

  // Centre: 3×3 modules, scaled with the eye.
  const I = 3 * o.cell * o.size;
  const ix = cx - I / 2;
  const iy = cy - I / 2;
  const f = o.centerFill;
  // Decorative centres sit on a solid core about 2 modules wide and are drawn slightly larger, so the
  // centre still reads as the dark 3-module block scanners look for.
  const core = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(I * 0.39)}" fill="${f}"/>`;
  const J = I * 1.12;
  const cp = (d: string, rule = '') => `${core}<path${rule} d="${mapPath(d, cx - J / 2, cy - J / 2, J)}" fill="${f}"/>`;
  let centerSvg = '';
  switch (center) {
    case 'rounded':
      centerSvg = `<rect x="${n(ix)}" y="${n(iy)}" width="${n(I)}" height="${n(I)}" rx="${n(Math.max(1, (I / 2) * o.radius))}" fill="${f}"/>`;
      break;
    case 'circle':
      centerSvg = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(I / 2)}" fill="${f}"/>`;
      break;
    case 'small-circle':
      centerSvg = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(I * 0.38)}" fill="${f}"/>`;
      break;
    case 'star':
      centerSvg = cp(U.star5);
      break;
    case 'heart':
      centerSvg = cp(U.heart);
      break;
    case 'diamond':
      centerSvg = cp(U.diamond);
      break;
    case 'flower':
      centerSvg = cp(U.flower);
      break;
    case 'moon':
      centerSvg = cp(U.moon);
      break;
    case 'cat-pupil':
      centerSvg = cp(U.catPupil);
      break;
    case 'galaxy':
      centerSvg = cp(U.galaxy);
      break;
    case 'crystal':
      centerSvg = cp(U.crystal);
      break;
    case 'cross':
      centerSvg = cp(U.plus);
      break;
    case 'sparkle':
      centerSvg = cp(U.sparkle);
      break;
    case 'hexagon':
      centerSvg = cp(U.hexPointy);
      break;
    case 'butterfly':
      centerSvg = cp(U.butterfly);
      break;
    case 'sakura':
      centerSvg = cp(U.sakura);
      break;
    case 'four-star':
      centerSvg = cp(U.fourStar);
      break;
    case 'hollow-circle':
      centerSvg = `<path fill-rule="evenodd" d="${mapPath(U.hollow, ix, iy, I)}" fill="${f}"/>`;
      break;
    case 'mini-flower':
      centerSvg = cp(U.miniFlower);
      break;
    case 'grid': {
      const c3 = I / 3;
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
          centerSvg += `<rect x="${n(ix + c * c3 + c3 * 0.06)}" y="${n(iy + r * c3 + c3 * 0.06)}" width="${n(c3 * 0.88)}" height="${n(c3 * 0.88)}" rx="${n(c3 * 0.18)}" fill="${f}"/>`;
      break;
    }
    case 'leaf':
      centerSvg = cp('M.4 0 H1 V.6 Q1 1 .6 1 H0 V.4 Q0 0 .4 0 Z');
      break;
    case 'sunburst':
      centerSvg = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(I * 0.42)}" fill="${f}"/><circle cx="${n(cx)}" cy="${n(cy)}" r="${n(I * 0.48)}" fill="none" stroke="${f}" stroke-width="${n(I * 0.1)}" stroke-dasharray="${n(I * 0.13)} ${n(I * 0.1)}"/>`;
      break;
    default:
      centerSvg = `<rect x="${n(ix)}" y="${n(iy)}" width="${n(I)}" height="${n(I)}" fill="${f}"/>`;
  }
  return (o.noRing ? '' : ringSvg) + centerSvg;
}

// ── Alignment patterns ──────────────────────────────────────────

/** Styles dense enough to draw the small alignment squares module by module. */
const SOLID_BODY = new Set(['square', 'rounded', 'extra-round', 'liquid', 'classy']);

/** Centres of the alignment patterns for a QR of `size` modules (same table as the QR spec). */
export function alignmentCenters(size: number): [number, number][] {
  const version = (size - 17) / 4;
  if (version < 2) return [];
  const count = Math.floor(version / 7) + 2;
  const step = size === 145 ? 26 : Math.ceil((size - 13) / (2 * count - 2)) * 2;
  const pos = [size - 7];
  for (let i = 1; i < count - 1; i++) pos[i] = pos[i - 1] - step;
  pos.push(6);
  pos.reverse();
  const out: [number, number][] = [];
  for (const r of pos)
    for (const c of pos) {
      if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue; // finder corners
      out.push([r, c]);
    }
  return out;
}

/**
 * Sparse body styles (hearts, stars, rings…) would make the alignment squares patchy, which some
 * scanners rely on; for those styles each 5×5 alignment pattern is drawn as one solid mini-eye instead.
 * Returns null when the style should draw alignment modules normally.
 */
export function alignmentPatternSvg(style: string, r: number, c: number, x0: number, y0: number, cell: number): string | null {
  if (SOLID_BODY.has(style)) return null;
  const x = x0 + (c - 2) * cell;
  const y = y0 + (r - 2) * cell;
  const rr = (X: number, Y: number, W: number, R: number) =>
    `M${n(X + R)} ${n(Y)} H${n(X + W - R)} A${n(R)} ${n(R)} 0 0 1 ${n(X + W)} ${n(Y + R)} V${n(Y + W - R)} A${n(R)} ${n(R)} 0 0 1 ${n(X + W - R)} ${n(Y + W)} H${n(X + R)} A${n(R)} ${n(R)} 0 0 1 ${n(X)} ${n(Y + W - R)} V${n(Y + R)} A${n(R)} ${n(R)} 0 0 1 ${n(X + R)} ${n(Y)} Z`;
  // ring (5×5 minus 3×3, filled even-odd so it inherits the body fill/gradient) + 1×1 centre
  return `<path fill-rule="evenodd" d="${rr(x, y, 5 * cell, cell * 1.3)} ${rr(x + cell, y + cell, 3 * cell, cell * 0.6)}"/><rect x="${n(x + 2 * cell)}" y="${n(y + 2 * cell)}" width="${n(cell)}" height="${n(cell)}" rx="${n(cell * 0.3)}"/>`;
}

// ── Presets ─────────────────────────────────────────────────────

export interface StylePreset {
  id: string;
  label: string;
  body: string;
  ring: string;
  center: string;
  /** dot colour, second gradient colour, eye ring colour, eye centre colour */
  colors: [string, string, string, string];
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'shoujo-dream', label: 'Shoujo Dream', body: 'dots', ring: 'shoujo', center: 'star', colors: ['#7e22ce', '#db2777', '#be185d', '#7e22ce'] },
  { id: 'catgirl', label: 'Catgirl', body: 'rounded', ring: 'cat-eye', center: 'cat-pupil', colors: ['#3b0764', '#6d28d9', '#a21caf', '#3b0764'] },
  { id: 'magical-princess', label: 'Magical Princess', body: 'flower', ring: 'magical', center: 'heart', colors: ['#9d174d', '#7c3aed', '#c026d3', '#be123c'] },
  { id: 'dark-anime', label: 'Dark Anime', body: 'diamond', ring: 'gothic', center: 'crystal', colors: ['#111827', '#4c1d95', '#7f1d1d', '#111827'] },
  { id: 'sakura-love', label: 'Sakura Love', body: 'petal', ring: 'sakura', center: 'flower', colors: ['#9d174d', '#be185d', '#db2777', '#9d174d'] },
  { id: 'galaxy', label: 'Galaxy', body: 'sparkle', ring: 'magical', center: 'galaxy', colors: ['#1e1b4b', '#4338ca', '#6d28d9', '#1e1b4b'] },
  { id: 'cyber-waifu', label: 'Cyber Waifu', body: 'hexagon', ring: 'cyber', center: 'diamond', colors: ['#0e7490', '#7e22ce', '#0369a1', '#be185d'] },
  { id: 'gothic-romance', label: 'Gothic Romance', body: 'small-circle', ring: 'gothic', center: 'moon', colors: ['#1c1917', '#7f1d1d', '#450a0a', '#1c1917'] },
  { id: 'kawaii', label: 'Kawaii', body: 'heart', ring: 'rounded', center: 'heart', colors: ['#be185d', '#e11d48', '#db2777', '#be123c'] },
  { id: 'crystal-queen', label: 'Crystal Queen', body: 'diamond', ring: 'crystal-frame', center: 'crystal', colors: ['#1e3a8a', '#6d28d9', '#4338ca', '#1e3a8a'] },
];

// ── Picker previews ─────────────────────────────────────────────

const PREVIEW_CACHE = new Map<string, string>();
const PREVIEW_BODY_PATTERN = [
  [1, 1, 0, 1],
  [0, 1, 1, 1],
  [1, 1, 0, 0],
  [1, 0, 1, 1],
];

/** Small SVG previews for the picker tiles (cached; `currentColor` so they follow the theme). */
export function shapePreview(kind: 'body' | 'ring' | 'center', id: string): string {
  const key = `${kind}:${id}`;
  const hit = PREVIEW_CACHE.get(key);
  if (hit) return hit;
  let svg = '';
  if (kind === 'body') {
    let m = '';
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++)
        if (PREVIEW_BODY_PATTERN[r][c])
          m += bodyModule(id, 2 + c * 10, 2 + r * 10, 10, { scale: 0.92, radius: 0.5, right: Boolean(PREVIEW_BODY_PATTERN[r][c + 1]), bottom: Boolean(PREVIEW_BODY_PATTERN[r + 1]?.[c]) });
    svg = `<svg viewBox="0 0 44 44" width="100%" height="100%" aria-hidden="true"><g fill="currentColor">${m}</g></svg>`;
  } else {
    const eye = finderEye(kind === 'ring' ? id : 'square', kind === 'center' ? id : 'square', 11, 11, {
      cell: 6,
      ringFill: 'currentColor',
      centerFill: 'currentColor',
      index: 0,
      thickness: 1,
      size: 1,
      radius: 0.5,
      noRing: kind === 'center',
    });
    // Centres are shown on their own and zoomed in (the 3×3 centre sits at 23–41 in this box).
    const box = kind === 'center' ? '20 20 24 24' : '0 0 64 64';
    svg = `<svg viewBox="${box}" width="100%" height="100%" aria-hidden="true">${eye}</svg>`;
  }
  PREVIEW_CACHE.set(key, svg);
  return svg;
}
