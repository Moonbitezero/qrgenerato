// lib/qr-cards-tcg.ts
// "Holo TCG" collectible cards: full-art trading-card layouts (holo foil, vertical kanji banner,
// rarity seal, stat boxes, card code) with ORIGINAL characters drawn as vector art. No existing
// characters, names or franchise designs are reproduced.

import type { CardDesign, CardFields } from './qr-cards';

function artImage(href: string, x: number, y: number, w: number, h: number, fit: 'fill' | 'cutout'): string {
  const par = fit === 'fill' ? 'xMidYMid slice' : 'xMidYMax meet';
  return `<image href="${href}" xlink:href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${par}"/>`;
}

type Id = (n: string) => string;

const W = 300;
const H = 420;
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const JP = "'Yu Mincho', 'Hiragino Mincho ProN', 'Noto Serif JP', 'MS Mincho', serif";
const SCRIPT = "'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive";

// ── Helpers ─────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);
}

function txt(
  x: number,
  y: number,
  value: string,
  o: { size: number; fill: string; weight?: number; family?: string; anchor?: 'start' | 'middle' | 'end'; spacing?: number; max?: number; italic?: boolean; stroke?: string; sw?: number; extra?: string }
): string {
  const est = value.length * o.size * 0.58;
  const fit = o.max && est > o.max ? ` textLength="${o.max}" lengthAdjust="spacingAndGlyphs"` : '';
  const stroke = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 2}" paint-order="stroke" stroke-linejoin="round"` : '';
  return `<text x="${x}" y="${y}" font-family="${o.family ?? SANS}" font-size="${o.size}" font-weight="${o.weight ?? 700}" fill="${o.fill}" text-anchor="${o.anchor ?? 'start'}"${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${o.italic ? ' font-style="italic"' : ''}${stroke}${fit}${o.extra ?? ''}>${esc(value)}</text>`;
}

function grad(id: string, stops: string[], x1 = 0, y1 = 0, x2 = 1, y2 = 1, opacity?: number[]): string {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map((c, i) => `<stop offset="${((i / Math.max(1, stops.length - 1)) * 100).toFixed(1)}%" stop-color="${c}"${opacity ? ` stop-opacity="${opacity[i] ?? 1}"` : ''}/>`)
    .join('')}</linearGradient>`;
}

function radial(id: string, stops: string[], cx = 0.5, cy = 0.5, r = 0.6, opacity?: number[]): string {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map((c, i) => `<stop offset="${((i / Math.max(1, stops.length - 1)) * 100).toFixed(1)}%" stop-color="${c}"${opacity ? ` stop-opacity="${opacity[i] ?? 1}"` : ''}/>`)
    .join('')}</radialGradient>`;
}

/** Deterministic pseudo-random sequence so cards render identically every time. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function sparkle(x: number, y: number, r: number, fill: string, op = 1): string {
  const k = r * 0.22;
  return `<path d="M${x},${y - r} L${x + k},${y - k} L${x + r},${y} L${x + k},${y + k} L${x},${y + r} L${x - k},${y + k} L${x - r},${y} L${x - k},${y - k} Z" fill="${fill}" opacity="${op}"/>`;
}

function blossom(x: number, y: number, r: number, fill: string, center = '#fde68a', rot = 0): string {
  const petals = [0, 72, 144, 216, 288]
    .map((d) => `<ellipse cx="0" cy="${-r * 0.55}" rx="${r * 0.42}" ry="${r * 0.6}" fill="${fill}" transform="rotate(${d + rot})"/>`)
    .join('');
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${petals}<circle r="${(r * 0.22).toFixed(1)}" fill="${center}"/></g>`;
}

// ── Original full-body character (art box 200 × 300) ────────────

export interface TcgChara {
  hair: string;
  hairShade: string;
  hairShine?: string;
  style: 'long' | 'wavy' | 'twin' | 'spiky' | 'short' | 'pony';
  eyes: string;
  eyes2?: string;
  eyeShape?: 'soft' | 'sharp';
  skin?: string;
  outfit: 'kimono' | 'dress' | 'sailor' | 'coat' | 'hoodie' | 'armor';
  c1: string;
  c2: string;
  c3: string;
  pattern?: 'sakura' | 'waves' | 'none';
  item?: 'umbrella' | 'sword' | 'staff' | 'fan' | 'none';
  itemColor?: string;
  acc?: 'flowerpin' | 'crown' | 'horns' | 'halo' | 'cat' | 'visor' | 'ribbon' | 'tiara' | 'earring' | 'none';
  accColor?: string;
  mood?: 'smile' | 'calm' | 'smirk' | 'serious';
}

export function tcgCharacter(o: TcgChara, id: Id): string {
  const skin = o.skin ?? '#fde4d3';
  const skinShade = '#f2c4ad';
  const line = '#2a1a16';
  const shine = o.hairShine ?? '#ffffff';
  const ac = o.accColor ?? '#facc15';
  const ic = o.itemColor ?? '#e11d48';
  const item = o.item ?? 'none';
  const acc = o.acc ?? 'none';
  const sharp = o.eyeShape === 'sharp';
  const hg = id('hair');
  const ig = id('iris');
  const blade = id('blade');

  const defs = `<defs>${grad(hg, [o.hair, o.hairShade], 0, 0, 0, 1)}${grad(ig, [line, o.eyes, o.eyes2 ?? o.eyes], 0, 0, 0, 1)}${grad(blade, ['#f8fafc', '#94a3b8', '#e2e8f0'], 0, 0, 1, 0)}</defs>`;

  // Items drawn behind the body
  let itemBack = '';
  let itemFront = '';
  if (item === 'umbrella') {
    const ribs = Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const x = 34 + t * 236;
      const y = 92 - Math.sin(t * Math.PI) * 26;
      return `<path d="M152,22 L${x.toFixed(1)},${y.toFixed(1)}" stroke="#7f1d1d" stroke-width="1" opacity=".55"/>`;
    }).join('');
    itemBack = `<path d="M30,96 Q152,-56 274,96 Q152,62 30,96 Z" fill="${ic}"/>
      <path d="M30,96 Q152,-56 274,96" fill="none" stroke="#7f1d1d" stroke-width="2"/>
      <path d="M58,84 Q152,-20 246,84" fill="none" stroke="#ffffff" stroke-width="5" opacity=".35"/>
      ${ribs}
      <path d="M152,22 L132,262" stroke="#5b3a29" stroke-width="3.2"/>`;
    itemFront = `<ellipse cx="133" cy="248" rx="9" ry="7" fill="${skin}" stroke="${skinShade}" stroke-width="1"/>`;
  } else if (item === 'sword') {
    itemBack = `<path d="M196,4 L204,12 L58,262 L50,256 Z" fill="url(#${blade})" stroke="#475569" stroke-width="1"/>
      <path d="M198,8 L60,258" stroke="#ffffff" stroke-width="1" opacity=".8"/>`;
    itemFront = `<rect x="40" y="250" width="34" height="8" rx="3" fill="${ic}" transform="rotate(-58 57 254)"/>
      <path d="M50,258 L34,286" stroke="#1f2937" stroke-width="8" stroke-linecap="round"/>
      <path d="M50,258 L34,286" stroke="${ic}" stroke-width="8" stroke-dasharray="3 3" opacity=".7"/>
      <ellipse cx="46" cy="266" rx="9" ry="7" fill="${skin}" stroke="${skinShade}" stroke-width="1"/>`;
  } else if (item === 'staff') {
    itemBack = `<path d="M176,30 L176,300" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>`;
    itemFront = `<circle cx="176" cy="28" r="22" fill="${ic}" opacity=".25"/><circle cx="176" cy="28" r="13" fill="${ic}" stroke="#fde68a" stroke-width="2.5"/><circle cx="171" cy="23" r="4" fill="#ffffff" opacity=".8"/>
      <path d="M160,40 Q176,52 192,40" stroke="#fde68a" stroke-width="2.5" fill="none"/>
      <ellipse cx="176" cy="226" rx="9" ry="7" fill="${skin}" stroke="${skinShade}" stroke-width="1"/>`;
  } else if (item === 'fan') {
    const ribs = Array.from({ length: 8 }, (_, i) => {
      const a = Math.PI + (i / 7) * Math.PI;
      return `<path d="M62,268 L${(62 + Math.cos(a) * 44).toFixed(1)},${(268 + Math.sin(a) * 44).toFixed(1)}" stroke="#7f1d1d" stroke-width="1" opacity=".5"/>`;
    }).join('');
    itemFront = `<path d="M18,268 A44,44 0 0 1 106,268 Z" fill="${ic}" stroke="#7f1d1d" stroke-width="1.5"/>${ribs}${blossom(62, 244, 9, '#ffffff', '#fbbf24')}
      <ellipse cx="62" cy="272" rx="9" ry="7" fill="${skin}" stroke="${skinShade}" stroke-width="1"/>`;
  }

  // Back hair
  const backHair: Record<TcgChara['style'], string> = {
    long: `<path d="M50,92 C38,16 162,16 150,92 C158,150 166,210 172,288 C140,300 60,300 28,288 C34,210 42,150 50,92 Z" fill="url(#${hg})"/>`,
    wavy: `<path d="M50,92 C38,16 162,16 150,92 C162,140 150,170 168,206 C180,236 160,258 174,290 C130,302 70,302 26,290 C40,258 20,236 32,206 C50,170 38,140 50,92 Z" fill="url(#${hg})"/>`,
    twin: `<path d="M52,96 C42,18 158,18 148,96 L150,130 L50,130 Z" fill="url(#${hg})"/>
      <path d="M60,64 C14,76 6,170 18,262 C24,282 44,276 42,252 C36,190 44,128 70,92 Z" fill="url(#${hg})"/>
      <path d="M140,64 C186,76 194,170 182,262 C176,282 156,276 158,252 C164,190 156,128 130,92 Z" fill="url(#${hg})"/>`,
    spiky: `<path d="M40,108 L18,78 L46,78 L30,44 L66,58 L64,20 L94,46 L108,8 L122,44 L150,18 L146,56 L182,46 L164,80 L188,84 L160,112 Z" fill="url(#${hg})"/>`,
    short: `<path d="M50,104 C40,18 160,18 150,104 L152,142 L48,142 Z" fill="url(#${hg})"/>`,
    pony: `<path d="M52,100 C42,18 158,18 148,100 L150,136 L50,136 Z" fill="url(#${hg})"/>
      <path d="M138,44 C196,52 204,168 182,252 C176,268 162,262 164,246 C176,176 168,104 126,66 Z" fill="url(#${hg})"/>`,
  };

  // Outfit (torso from y≈170 down to 300)
  const torso = `M22,300 C24,214 56,180 100,178 C144,180 176,214 178,300 Z`;
  let outfit = '';
  if (o.outfit === 'kimono') {
    let pat = '';
    if (o.pattern === 'sakura') {
      const r = rng(7);
      for (let i = 0; i < 9; i++) pat += blossom(36 + r() * 128, 196 + r() * 100, 5 + r() * 3, o.c2, o.c3, r() * 60);
    } else if (o.pattern === 'waves') {
      for (let row = 0; row < 3; row++)
        for (let c = 0; c < 6; c++)
          pat += `<path d="M${26 + c * 28 + (row % 2) * 14},${282 - row * 12} a14,14 0 0 1 28,0" fill="none" stroke="${o.c2}" stroke-width="2" opacity=".7"/>`;
    }
    outfit = `<path d="${torso}" fill="${o.c1}"/>
      <path d="M26,226 C4,256 2,292 12,300 L58,300 L52,232 Z" fill="${o.c1}"/><path d="M174,226 C196,256 198,292 188,300 L142,300 L148,232 Z" fill="${o.c1}"/>
      ${pat}
      <path d="M76,178 L114,256 L100,262 L66,186 Z" fill="${o.c2}"/>
      <path d="M124,178 L86,256 L100,262 L134,186 Z" fill="#ffffff"/>
      <path d="M124,178 L86,256" stroke="${o.c3}" stroke-width="2"/>
      <rect x="40" y="240" width="120" height="28" fill="${o.c3}"/>
      <rect x="40" y="250" width="120" height="5" fill="#ffffff" opacity=".55"/>
      <path d="M100,254 m-4,0 a4,3 0 1 0 8,0 a4,3 0 1 0 -8,0" fill="${o.c2}"/>
      <path d="M150,244 C176,232 184,262 160,262 C184,270 172,296 150,266 Z" fill="${o.c3}" stroke="#00000022"/>`;
  } else if (o.outfit === 'dress') {
    outfit = `<path d="${torso}" fill="${skin}"/>
      <path d="M78,196 Q100,204 122,196" stroke="${skinShade}" stroke-width="1.6" fill="none"/>
      <path d="M48,222 C72,212 128,212 152,222 L180,300 L20,300 Z" fill="${o.c1}"/>
      <path d="M48,222 C72,212 128,212 152,222" fill="none" stroke="${o.c2}" stroke-width="3"/>
      <path d="M66,186 L58,222 M134,186 L142,222" stroke="${o.c1}" stroke-width="4"/>
      <path d="M100,226 L84,216 L84,238 Z M100,226 L116,216 L116,238 Z" fill="${o.c3}"/><circle cx="100" cy="227" r="4" fill="${o.c3}"/>
      <path d="M100,230 L94,262 M100,230 L106,262" stroke="${o.c3}" stroke-width="2.4"/>
      <path d="M40,280 C70,270 130,270 160,280" stroke="${o.c2}" stroke-width="2" fill="none" opacity=".6"/>`;
  } else if (o.outfit === 'sailor') {
    outfit = `<path d="${torso}" fill="${o.c1}"/>
      <path d="M56,182 L100,242 L144,182 L166,206 L100,266 L34,206 Z" fill="${o.c2}"/>
      <path d="M44,204 L100,256 L156,204" stroke="#ffffff" stroke-width="2.4" fill="none"/>
      <path d="M100,244 L80,236 L84,262 Z M100,244 L120,236 L116,262 Z" fill="${o.c3}"/><circle cx="100" cy="246" r="5" fill="${o.c3}"/>`;
  } else if (o.outfit === 'coat') {
    outfit = `<path d="${torso}" fill="${o.c1}"/>
      <path d="M60,164 L68,204 L100,220 L132,204 L140,164 L122,176 L100,204 L78,176 Z" fill="${o.c2}"/>
      <path d="M100,206 L100,300" stroke="${o.c3}" stroke-width="3"/>
      <circle cx="90" cy="236" r="3" fill="${o.c3}"/><circle cx="90" cy="262" r="3" fill="${o.c3}"/><circle cx="110" cy="236" r="3" fill="${o.c3}"/><circle cx="110" cy="262" r="3" fill="${o.c3}"/>
      <path d="M30,232 C40,206 60,190 78,184" stroke="${o.c3}" stroke-width="2.4" fill="none"/><path d="M170,232 C160,206 140,190 122,184" stroke="${o.c3}" stroke-width="2.4" fill="none"/>`;
  } else if (o.outfit === 'hoodie') {
    outfit = `<path d="${torso}" fill="${o.c1}"/>
      <path d="M50,190 C60,168 140,168 150,190 C140,206 60,206 50,190 Z" fill="${o.c2}"/>
      <path d="M88,200 L84,244 M112,200 L116,244" stroke="${o.c3}" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="84" cy="246" r="3" fill="${o.c3}"/><circle cx="116" cy="246" r="3" fill="${o.c3}"/>
      <path d="M62,270 H138 L130,300 H70 Z" fill="${o.c2}" opacity=".5"/>`;
  } else {
    outfit = `<path d="${torso}" fill="${o.c1}"/>
      <path d="M58,204 Q100,188 142,204 L136,266 Q100,280 64,266 Z" fill="${o.c2}" stroke="${o.c3}" stroke-width="2.4"/>
      <path d="M100,200 L100,272" stroke="${o.c3}" stroke-width="1.6" opacity=".8"/>
      <ellipse cx="36" cy="214" rx="24" ry="16" fill="${o.c2}" stroke="${o.c3}" stroke-width="2.4"/><ellipse cx="164" cy="214" rx="24" ry="16" fill="${o.c2}" stroke="${o.c3}" stroke-width="2.4"/>
      <path d="M92,222 L100,212 L108,222 L100,240 Z" fill="${o.c3}"/>`;
  }

  // Eyes
  const eye = (cx: number, flip: number) => {
    const ry = sharp ? 9.5 : 13;
    const top = sharp ? 101 : 98;
    return `
      <ellipse cx="${cx}" cy="110" rx="11.5" ry="${ry}" fill="#ffffff"/>
      <ellipse cx="${cx}" cy="${sharp ? 111 : 112}" rx="8.6" ry="${sharp ? 8.8 : 11.5}" fill="url(#${ig})"/>
      <ellipse cx="${cx}" cy="${sharp ? 111 : 113}" rx="4" ry="${sharp ? 5 : 6.4}" fill="${line}" opacity=".85"/>
      <ellipse cx="${cx - 3.5 * flip}" cy="${sharp ? 106 : 105}" rx="3.2" ry="3.8" fill="#ffffff"/>
      <circle cx="${cx + 3.6 * flip}" cy="${sharp ? 115 : 118}" r="1.7" fill="#ffffff" opacity=".85"/>
      <path d="M${cx + 12 * flip},${top + 3} Q${cx},${top - 6} ${cx - 13 * flip},${top + (sharp ? 1 : 4)} L${cx - 17 * flip},${top - 2}" stroke="${line}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${cx - 8},${110 + ry - 1} Q${cx},${110 + ry + 1.5} ${cx + 8},${110 + ry - 1}" stroke="${line}" stroke-width="1.2" fill="none" opacity=".5"/>
      <path d="M${cx - 9},${sharp ? 87 : 84} Q${cx},${sharp ? 83 : 80} ${cx + 9},${sharp ? 87 : 84}" stroke="${o.hairShade}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  };

  const mouth =
    o.mood === 'serious'
      ? `<path d="M94,136 H106" stroke="${line}" stroke-width="2.2" stroke-linecap="round"/>`
      : o.mood === 'smirk'
      ? `<path d="M92,135 Q102,139 109,132" stroke="${line}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
      : o.mood === 'calm'
      ? `<path d="M94,135 Q100,138 106,135" stroke="${line}" stroke-width="2" fill="none" stroke-linecap="round"/>`
      : `<path d="M92,133 Q100,142 108,133 Z" fill="#c2544b"/><path d="M95,134 H105" stroke="#ffffff" stroke-width="1.2" opacity=".7"/>`;

  const bangs: Record<TcgChara['style'], string> = {
    long: `<path d="M52,100 C44,22 156,22 148,100 L142,80 L130,102 L120,72 L106,100 L94,68 L82,100 L70,78 L60,102 Z" fill="url(#${hg})"/>`,
    wavy: `<path d="M52,100 C44,22 156,22 148,100 C142,90 138,82 128,96 C122,80 112,74 104,94 C96,74 86,78 80,96 C72,82 62,86 52,100 Z" fill="url(#${hg})"/>`,
    twin: `<path d="M54,98 C46,24 154,24 146,98 L136,82 L124,96 L112,76 L100,94 L88,76 L76,96 L64,82 Z" fill="url(#${hg})"/>`,
    spiky: `<path d="M50,104 C42,24 158,24 150,104 L140,76 L132,104 L120,66 L108,102 L96,62 L86,102 L74,72 L64,104 Z" fill="url(#${hg})"/>`,
    short: `<path d="M52,102 C44,24 156,24 148,102 L144,80 L128,94 L112,68 L98,90 L82,70 L66,92 L58,84 Z" fill="url(#${hg})"/>`,
    pony: `<path d="M52,100 C44,22 156,22 148,100 L140,84 L126,98 L114,72 L102,96 L88,70 L74,96 L60,86 Z" fill="url(#${hg})"/>`,
  };

  const longLocks = ['long', 'wavy', 'twin', 'pony'].includes(o.style)
    ? `<path d="M56,82 C46,124 48,170 40,214 C54,204 62,170 64,128 Z" fill="url(#${hg})"/><path d="M144,82 C154,124 152,170 160,214 C146,204 138,170 136,128 Z" fill="url(#${hg})"/>`
    : '';

  const hairShine = `<path d="M66,60 Q100,44 134,60" stroke="${shine}" stroke-width="4" fill="none" stroke-dasharray="12 7" opacity=".55" stroke-linecap="round"/>`;

  const accessory: Record<NonNullable<TcgChara['acc']>, string> = {
    none: '',
    flowerpin: `${blossom(140, 62, 12, ac, '#fde68a', 10)}${blossom(126, 52, 8, '#ffffff', '#fbbf24', 30)}`,
    crown: `<path d="M68,48 L74,20 L88,38 L100,12 L112,38 L126,20 L132,48 Z" fill="${ac}" stroke="${line}" stroke-width="1.6"/><circle cx="100" cy="32" r="4" fill="#e11d48"/>`,
    tiara: `<path d="M64,62 Q100,40 136,62" stroke="${ac}" stroke-width="3.5" fill="none"/><path d="M100,40 L106,52 L100,60 L94,52 Z" fill="#7dd3fc" stroke="${ac}" stroke-width="1.5"/>${sparkle(84, 50, 4, ac)}${sparkle(116, 50, 4, ac)}`,
    horns: `<path d="M70,58 C60,36 52,24 40,12 C62,16 76,32 82,52 Z" fill="${ac}" stroke="${line}" stroke-width="1.6"/><path d="M130,58 C140,36 148,24 160,12 C138,16 124,32 118,52 Z" fill="${ac}" stroke="${line}" stroke-width="1.6"/>`,
    halo: `<ellipse cx="100" cy="22" rx="38" ry="9" fill="none" stroke="${ac}" stroke-width="5"/>`,
    cat: `<path d="M58,70 L52,26 L88,50 Z" fill="${o.hair}" stroke="${line}" stroke-width="1.6"/><path d="M142,70 L148,26 L112,50 Z" fill="${o.hair}" stroke="${line}" stroke-width="1.6"/><path d="M61,62 L58,38 L76,50 Z M139,62 L142,38 L124,50 Z" fill="#fda4af"/>`,
    visor: `<path d="M52,100 Q100,90 148,100 L146,118 Q100,110 54,118 Z" fill="${ac}" opacity=".55" stroke="${ac}" stroke-width="2"/><path d="M58,104 H142" stroke="#ffffff" stroke-width="1.4" opacity=".8"/>`,
    ribbon: `<path d="M138,50 L118,38 L120,62 Z M138,50 L158,38 L156,62 Z" fill="${ac}" stroke="${line}" stroke-width="1.4"/><circle cx="138" cy="50" r="5" fill="${ac}" stroke="${line}" stroke-width="1.4"/>`,
    earring: `<circle cx="56" cy="134" r="3" fill="${ac}"/><path d="M56,137 L56,150" stroke="${ac}" stroke-width="2"/><circle cx="56" cy="152" r="3.5" fill="${ac}"/>`,
  };
  const accBack = acc === 'halo' || acc === 'horns' ? accessory[acc] : '';
  const accFront = acc === 'halo' || acc === 'horns' ? '' : accessory[acc];

  return `${defs}
    ${itemBack}
    ${accBack}
    ${backHair[o.style]}
    ${outfit}
    <rect x="90" y="138" width="20" height="46" fill="${skin}"/>
    <path d="M90,162 Q100,172 110,162 V184 H90 Z" fill="${skinShade}" opacity=".6"/>
    <path d="M56,94 C56,142 80,154 100,154 C120,154 144,142 144,94 C144,60 125,48 100,48 C75,48 56,60 56,94 Z" fill="${skin}"/>
    <path d="M54,100 C50,92 46,108 54,118 Z M146,100 C150,92 154,108 146,118 Z" fill="${skin}"/>
    <ellipse cx="72" cy="128" rx="8" ry="4" fill="#fb7185" opacity=".3"/>
    <ellipse cx="128" cy="128" rx="8" ry="4" fill="#fb7185" opacity=".3"/>
    ${eye(79, 1)}${eye(121, -1)}
    <path d="M100,121 L98.5,126 H101.5" stroke="${line}" stroke-width="1.2" fill="none" opacity=".45"/>
    ${mouth}
    ${bangs[o.style]}
    ${longLocks}
    ${hairShine}
    ${accFront}
    ${itemFront}`;
}

// ── Backgrounds (full card 300 × 420) ───────────────────────────

type Scene = (id: Id) => string;

const rainbowSwirl: Scene = (id) => {
  const g = id('rs');
  const hues = ['#f472b6', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#818cf8', '#c084fc'];
  let flames = '';
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const c = hues[i % hues.length];
    const x1 = 150 + Math.cos(a) * 40;
    const y1 = 170 + Math.sin(a) * 40;
    const x2 = 150 + Math.cos(a + 0.35) * 260;
    const y2 = 170 + Math.sin(a + 0.35) * 260;
    const xc = 150 + Math.cos(a - 0.25) * 170;
    const yc = 170 + Math.sin(a - 0.25) * 170;
    flames += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${xc.toFixed(1)},${yc.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round" opacity=".55"/>`;
  }
  let waves = '';
  for (let row = 0; row < 4; row++)
    for (let c = -1; c < 11; c++) {
      const x = c * 32 + (row % 2) * 16;
      const y = 340 + row * 22;
      waves += `<path d="M${x},${y} a16,16 0 0 1 32,0" fill="#e0f2fe" stroke="#93c5fd" stroke-width="2.5"/>`;
    }
  return `<defs>${grad(g, ['#f0f9ff', '#fdf4ff', '#ecfeff'], 0, 0, 1, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>${flames}${waves}`;
};

const sakuraShrine: Scene = (id) => {
  const g = id('ss');
  const r = rng(21);
  let petals = '';
  for (let i = 0; i < 34; i++) {
    const x = r() * W;
    const y = r() * H;
    petals += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4.5" ry="2.6" fill="${i % 3 ? '#f9a8d4' : '#ffffff'}" opacity=".85" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  let branch = '';
  for (let i = 0; i < 16; i++) branch += blossom(150 + r() * 150, 8 + r() * 80, 7 + r() * 5, i % 2 ? '#fbcfe8' : '#f9a8d4', '#fb7185', r() * 70);
  return `<defs>${grad(g, ['#fff1f2', '#fce7f3', '#fbcfe8'], 0, 0, 0, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>
    <g opacity=".85"><rect x="178" y="70" width="14" height="300" fill="#dc2626"/><rect x="264" y="70" width="14" height="300" fill="#dc2626"/>
    <path d="M150,58 Q228,40 306,58 L306,74 Q228,60 150,74 Z" fill="#b91c1c"/><rect x="164" y="92" width="130" height="10" fill="#dc2626"/>
    <rect x="221" y="74" width="12" height="20" fill="#7f1d1d"/></g>
    <path d="M150,30 C190,50 230,30 300,46" stroke="#57534e" stroke-width="5" fill="none"/><path d="M200,40 C214,64 240,70 262,66" stroke="#57534e" stroke-width="3" fill="none"/>
    ${branch}
    <path d="M0,330 C60,316 120,346 180,330 C230,318 270,336 300,328 L300,420 L0,420 Z" fill="#fbcfe8" opacity=".6"/>
    ${petals}`;
};

const goldGraffiti: Scene = (id) => {
  const g = id('gg');
  const r = rng(5);
  const cols = ['#38bdf8', '#f97316', '#e11d48', '#a3e635', '#facc15', '#6366f1'];
  let strokes = '';
  for (let i = 0; i < 18; i++) {
    const x = r() * W;
    const y = r() * H;
    strokes += `<path d="M${x.toFixed(0)},${y.toFixed(0)} q${(r() * 80 - 40).toFixed(0)},${(r() * 60 - 30).toFixed(0)} ${(r() * 140 - 70).toFixed(0)},${(r() * 40 - 20).toFixed(0)}" stroke="${cols[i % cols.length]}" stroke-width="${(10 + r() * 22).toFixed(0)}" fill="none" stroke-linecap="round" opacity=".45"/>`;
  }
  return `<defs>${grad(g, ['#dbeafe', '#fef3c7', '#cffafe'], 0, 0, 1, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>${strokes}
    <rect width="${W}" height="${H}" fill="#ffffff" opacity=".18"/>`;
};

const gothicClock: Scene = (id) => {
  const g = id('gc');
  let digits = '';
  const r = rng(13);
  for (let row = 0; row < 18; row++)
    for (let c = 0; c < 10; c++)
      digits += `<text x="${8 + c * 30}" y="${18 + row * 24}" font-family="${SANS}" font-size="15" font-weight="800" fill="#7f1d1d" opacity="${(0.15 + r() * 0.25).toFixed(2)}">${Math.floor(r() * 10)}</text>`;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `<path d="M${(150 + Math.cos(a) * 100).toFixed(1)},${(150 + Math.sin(a) * 100).toFixed(1)} L${(150 + Math.cos(a) * 116).toFixed(1)},${(150 + Math.sin(a) * 116).toFixed(1)}" stroke="#450a0a" stroke-width="4"/>`;
  }).join('');
  return `<defs>${grad(g, ['#fb923c', '#ea580c', '#9a3412'], 0, 0, 1, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>${digits}
    <circle cx="150" cy="150" r="120" fill="none" stroke="#450a0a" stroke-width="3" opacity=".6"/>${ticks}
    <path d="M150,150 L150,62 M150,150 L214,186" stroke="#450a0a" stroke-width="5" stroke-linecap="round" opacity=".6"/>`;
};

const moonNight: Scene = (id) => {
  const g = id('mn');
  const r = rng(31);
  let stars = '';
  for (let i = 0; i < 40; i++) stars += `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * 260).toFixed(1)}" r="${(0.6 + r() * 1.4).toFixed(1)}" fill="#ffffff" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
  let bamboo = '';
  for (let i = 0; i < 7; i++) {
    const x = (i < 3 ? 6 + i * 22 : 214 + (i - 3) * 24) + r() * 6;
    bamboo += `<rect x="${x.toFixed(0)}" y="120" width="9" height="300" fill="#052e2b" opacity=".85"/>`;
    for (let k = 0; k < 6; k++) bamboo += `<rect x="${(x - 1).toFixed(0)}" y="${150 + k * 46}" width="11" height="3" fill="#0f766e" opacity=".8"/>`;
  }
  return `<defs>${grad(g, ['#020617', '#1e1b4b', '#312e81'], 0, 0, 0, 1)}${radial(id('mg'), ['#fef9c3', '#fde68a', '#fde68a'], 0.5, 0.5, 0.5, [1, 0.6, 0])}</defs>
    <rect width="${W}" height="${H}" fill="url(#${g})"/>${stars}
    <circle cx="150" cy="120" r="110" fill="url(#${id('mg')})" opacity=".55"/><circle cx="150" cy="120" r="70" fill="#fef9c3"/>
    <ellipse cx="80" cy="170" rx="90" ry="12" fill="#1e1b4b" opacity=".7"/><ellipse cx="230" cy="140" rx="80" ry="10" fill="#1e1b4b" opacity=".7"/>
    ${bamboo}`;
};

const frostCrystal: Scene = (id) => {
  const g = id('fc');
  const r = rng(41);
  let shards = '';
  for (let i = 0; i < 14; i++) {
    const x = r() * W;
    const y = 120 + r() * 300;
    const h = 40 + r() * 110;
    const w = 10 + r() * 18;
    shards += `<path d="M${x.toFixed(0)},${y.toFixed(0)} L${(x + w / 2).toFixed(0)},${(y - h).toFixed(0)} L${(x + w).toFixed(0)},${y.toFixed(0)} Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="1.5" opacity=".7"/>`;
  }
  let snow = '';
  for (let i = 0; i < 30; i++) snow += sparkle(r() * W, r() * H, 2 + r() * 4, '#ffffff', 0.6 + r() * 0.4);
  return `<defs>${grad(g, ['#0c4a6e', '#0ea5e9', '#e0f2fe'], 0, 0, 0, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>
    <circle cx="150" cy="140" r="120" fill="#ffffff" opacity=".12"/>${shards}${snow}`;
};

const thunderStorm: Scene = (id) => {
  const g = id('ts');
  const bolt = (x: number, y: number, s: number) =>
    `<path d="M${x},${y} l${-18 * s},${60 * s} l${16 * s},0 l${-22 * s},${70 * s} l${46 * s},${-86 * s} l${-18 * s},0 l${16 * s},${-44 * s} Z" fill="#fde047" stroke="#ffffff" stroke-width="1.5"/>`;
  return `<defs>${grad(g, ['#1e1b4b', '#4c1d95', '#7c3aed'], 0, 0, 0, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>
    <circle cx="150" cy="160" r="130" fill="#a78bfa" opacity=".25"/>
    ${bolt(56, 20, 1.2)}${bolt(262, 60, 0.9)}${bolt(40, 220, 0.7)}${bolt(274, 250, 0.8)}
    <ellipse cx="80" cy="40" rx="100" ry="30" fill="#312e81" opacity=".8"/><ellipse cx="240" cy="30" rx="100" ry="28" fill="#312e81" opacity=".8"/>`;
};

const crimsonFlame: Scene = (id) => {
  const g = id('cf');
  let fl = '';
  for (let i = 0; i < 12; i++) {
    const x = i * 28 - 14;
    const h = 150 + ((i * 53) % 130);
    fl += `<path d="M${x},${H} C${x - 12},${H - h * 0.5} ${x + 24},${H - h * 0.7} ${x + 16},${H - h} C${x + 46},${H - h * 0.6} ${x + 42},${H - h * 0.3} ${x + 34},${H} Z" fill="${i % 2 ? '#dc2626' : '#f97316'}" opacity=".8"/>`;
  }
  const r = rng(51);
  let embers = '';
  for (let i = 0; i < 26; i++) embers += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(1 + r() * 2).toFixed(1)}" fill="#fbbf24" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
  return `<defs>${grad(g, ['#0c0a09', '#450a0a', '#7f1d1d'], 0, 0, 0, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>${fl}${embers}`;
};

const galaxy: Scene = (id) => {
  const g = id('gx');
  const r = rng(61);
  let stars = '';
  for (let i = 0; i < 60; i++) stars += `<circle cx="${(r() * W).toFixed(1)}" cy="${(r() * H).toFixed(1)}" r="${(0.5 + r() * 1.5).toFixed(1)}" fill="#ffffff" opacity="${(0.3 + r() * 0.7).toFixed(2)}"/>`;
  for (let i = 0; i < 8; i++) stars += sparkle(r() * W, r() * H, 4 + r() * 5, '#f5d0fe', 0.9);
  return `<defs>${grad(g, ['#0f0524', '#3b0764', '#1e1b4b'], 0, 0, 1, 1)}${radial(id('nb'), ['#e879f9', '#7c3aed', '#3b0764'], 0.5, 0.5, 0.5, [0.7, 0.35, 0])}</defs>
    <rect width="${W}" height="${H}" fill="url(#${g})"/>
    <ellipse cx="150" cy="150" rx="170" ry="110" fill="url(#${id('nb')})" transform="rotate(-25 150 150)"/>
    <circle cx="150" cy="150" r="96" fill="none" stroke="#f0abfc" stroke-width="1.5" stroke-dasharray="3 6" opacity=".7"/>
    <circle cx="150" cy="150" r="124" fill="none" stroke="#c4b5fd" stroke-width="1" opacity=".5"/>${stars}`;
};

const oceanBubbles: Scene = (id) => {
  const g = id('ob');
  const r = rng(71);
  let bubbles = '';
  for (let i = 0; i < 24; i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = 3 + r() * 12;
    bubbles += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(1)}" fill="#ffffff" fill-opacity=".15" stroke="#ffffff" stroke-opacity=".6" stroke-width="1.2"/><circle cx="${(x - rad * 0.35).toFixed(1)}" cy="${(y - rad * 0.35).toFixed(1)}" r="${(rad * 0.22).toFixed(1)}" fill="#ffffff" opacity=".8"/>`;
  }
  let rays = '';
  for (let i = 0; i < 6; i++) rays += `<path d="M${40 + i * 48},0 L${70 + i * 48},0 L${20 + i * 40},${H} L${0 + i * 40},${H} Z" fill="#ffffff" opacity=".07"/>`;
  return `<defs>${grad(g, ['#67e8f9', '#0891b2', '#164e63'], 0, 0, 0, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>${rays}${bubbles}`;
};

const jadeDragon: Scene = (id) => {
  const g = id('jd');
  let clouds = '';
  const cloud = (x: number, y: number, s: number) =>
    `<path d="M${x},${y} a${12 * s},${12 * s} 0 0 1 ${24 * s},0 a${10 * s},${10 * s} 0 0 1 ${20 * s},0 a${8 * s},${8 * s} 0 0 1 ${16 * s},0" fill="none" stroke="#bbf7d0" stroke-width="3" opacity=".7"/>`;
  clouds = cloud(14, 60, 1.2) + cloud(200, 40, 1) + cloud(30, 230, 0.9) + cloud(220, 210, 1.1) + cloud(110, 20, 0.8);
  return `<defs>${grad(g, ['#022c22', '#065f46', '#10b981'], 0, 0, 0, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>
    <path d="M-20,260 C40,150 110,260 160,150 C200,60 260,90 320,30" stroke="#047857" stroke-width="40" fill="none" stroke-linecap="round"/>
    <path d="M-20,260 C40,150 110,260 160,150 C200,60 260,90 320,30" stroke="#6ee7b7" stroke-width="6" fill="none" stroke-dasharray="6 12" opacity=".8"/>
    <path d="M276,40 L300,24 L294,50 Z" fill="#fbbf24"/>${clouds}`;
};

const neonCity: Scene = (id) => {
  const g = id('nc');
  const r = rng(81);
  let city = '';
  let x = 0;
  while (x < W) {
    const w = 22 + r() * 30;
    const h = 90 + r() * 170;
    city += `<rect x="${x.toFixed(0)}" y="${(H - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="#0b1026" stroke="#312e81" stroke-width="1"/>`;
    for (let wy = H - h + 10; wy < H - 10; wy += 14)
      for (let wx = x + 5; wx < x + w - 6; wx += 9)
        if (r() > 0.55) city += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="4" height="6" fill="${r() > 0.5 ? '#22d3ee' : '#e879f9'}" opacity=".8"/>`;
    x += w + 2;
  }
  return `<defs>${grad(g, ['#020617', '#1e1b4b', '#701a75'], 0, 0, 0, 1)}</defs><rect width="${W}" height="${H}" fill="url(#${g})"/>
    <circle cx="150" cy="130" r="100" fill="none" stroke="#e879f9" stroke-width="3" opacity=".6"/><circle cx="150" cy="130" r="112" fill="none" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="8 6" opacity=".7"/>${city}`;
};

// ── Foil & frame overlays ───────────────────────────────────────

function foilLayer(kind: 'rainbow' | 'gold' | 'silver', id: Id, seed: number, layer: 'back' | 'front'): string {
  const r = rng(seed);
  if (kind === 'rainbow') {
    const g = id('foil');
    let streaks = '';
    for (let i = 0; i < 5; i++) {
      const x = -120 + i * 110;
      streaks += `<path d="M${x},0 L${x + 40},0 L${x + 240},${H} L${x + 200},${H} Z" fill="#ffffff" opacity=".16"/>`;
    }
    let sp = '';
    for (let i = 0; i < 18; i++) sp += sparkle(r() * W, r() * H, 2 + r() * 5, '#ffffff', 0.7 + r() * 0.3);
    if (layer === 'back')
      return `<defs>${grad(g, ['#ff5ec4', '#ffd36e', '#7dffb2', '#6ee7ff', '#a78bfa', '#ff5ec4'], 0, 0, 1, 1)}</defs>
      <rect width="${W}" height="${H}" fill="url(#${g})" opacity=".3"><animate attributeName="opacity" values=".2;.4;.2" dur="3.2s" repeatCount="indefinite"/></rect>${streaks}`;
    return sp;
  }
  if (kind === 'gold') {
    let flakes = '';
    for (let i = 0; i < 26; i++) {
      const x = r() * W;
      const y = r() * 300;
      flakes += `<path d="M${x.toFixed(0)},${y.toFixed(0)} l${(4 + r() * 6).toFixed(1)},${(-3 - r() * 4).toFixed(1)} l${(3 + r() * 5).toFixed(1)},${(5 + r() * 5).toFixed(1)} l${(-6 - r() * 5).toFixed(1)},${(2 + r() * 3).toFixed(1)} Z" fill="#facc15" stroke="#a16207" stroke-width=".6" opacity=".9"/>`;
    }
    const lines = `<path d="M34,250 L80,190 L110,300 L40,330 Z M190,30 L250,70 L230,130" fill="none" stroke="#eab308" stroke-width="1.6" opacity=".9"/>
      <path d="M40,24 C70,40 90,20 120,34 M250,20 C230,40 270,60 250,90" stroke="#eab308" stroke-width="2.4" fill="none"/>`;
    let sp = '';
    for (let i = 0; i < 10; i++) sp += sparkle(r() * W, r() * H, 3 + r() * 4, '#fef9c3', 0.9);
    return layer === 'back' ? `${lines}${flakes}` : sp;
  }
  let sp = '';
  for (let i = 0; i < 22; i++) sp += sparkle(r() * W, r() * H, 1.5 + r() * 4, '#ffffff', 0.6 + r() * 0.4);
  return layer === 'back' ? `<rect width="${W}" height="${H}" fill="#ffffff" opacity=".06"/>` : sp;
}

function frame(id: Id, colors: string[]): string {
  const g = id('frame');
  const corner = (x: number, y: number, sx: number, sy: number) =>
    `<path d="M${x},${y + sy * 26} L${x},${y} L${x + sx * 26},${y}" stroke="url(#${g})" stroke-width="3" fill="none"/><path d="M${x + sx * 8},${y + sy * 8} l${sx * 6},${sy * -6} l${sx * 6},${sy * 6} l${sx * -6},${sy * 6} Z" fill="url(#${g})"/>`;
  return `<defs>${grad(g, colors, 0, 0, 1, 1)}</defs>
    <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="14" fill="none" stroke="url(#${g})" stroke-width="6"/>
    <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="9" fill="none" stroke="url(#${g})" stroke-width="1.2" opacity=".9"/>
    ${corner(14, 14, 1, 1)}${corner(W - 14, 14, -1, 1)}${corner(14, H - 14, 1, -1)}${corner(W - 14, H - 14, -1, -1)}`;
}

function rarityseal(rarity: string, c1: string, c2: string, id: Id, cx = 262, cy = 40): string {
  const g = id('seal');
  return `<defs>${radial(g, [c1, c2], 0.35, 0.3, 0.8)}</defs>
    <circle cx="${cx}" cy="${cy}" r="24" fill="#111827" opacity=".35"/>
    <circle cx="${cx}" cy="${cy}" r="22" fill="url(#${g})" stroke="#fef3c7" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="17" fill="none" stroke="#ffffff" stroke-width="1" opacity=".7" stroke-dasharray="2 2"/>
    ${txt(cx, cy + 5, rarity, { size: rarity.length > 2 ? 13 : 15, fill: '#ffffff', weight: 900, anchor: 'middle', family: SERIF, italic: true, stroke: '#00000055', sw: 2 })}`;
}

function kanjiBanner(kanji: string, fill: string, ink: string, edge: string, x = 18, y = 20): string {
  const chars = [...kanji];
  const h = chars.length * 26 + 14;
  return `<path d="M${x},${y} H${x + 32} V${y + h} L${x + 16},${y + h - 8} L${x},${y + h} Z" fill="${fill}" stroke="${edge}" stroke-width="1.6"/>
    <path d="M${x + 4},${y + 4} H${x + 28} V${y + h - 10}" stroke="${edge}" stroke-width=".8" fill="none" opacity=".7"/>
    ${chars.map((ch, i) => txt(x + 16, y + 28 + i * 26, ch, { size: 21, fill: ink, weight: 800, anchor: 'middle', family: JP })).join('')}`;
}

function placeChara(chara: string, x = 46, y = 44, w = 208, h = 312): string {
  const s = Math.min(w / 200, h / 300);
  const ox = x + (w - 200 * s) / 2;
  const oy = y + (h - 300 * s);
  return `<g transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)}) scale(${s.toFixed(3)})">${chara}</g>`;
}

// ── Card layouts ────────────────────────────────────────────────

interface TcgOpts {
  scene: Scene;
  chara: TcgChara;
  foil: 'rainbow' | 'gold' | 'silver';
  frameColors: string[];
  kanji: string;
  banner: [fill: string, ink: string, edge: string];
  rarity: string;
  seal: [string, string];
  layout: 'stats' | 'elegant' | 'rules';
  panel: string;
  panelText: string;
  accent: string;
  stats?: [number, number];
  seed: number;
}

const QR = { x: 200, y: 316, size: 86, plate: '#ffffff', radius: 8 };

function tcgCard(o: TcgOpts) {
  return (f: CardFields, id: Id) => {
    const front = foilLayer(o.foil, id, o.seed, 'front');
    const art = !f.art
      ? `${o.scene(id)}${foilLayer(o.foil, id, o.seed, 'back')}${placeChara(tcgCharacter(o.chara, id))}${front}`
      : f.artFit === 'cutout'
      ? `${o.scene(id)}${foilLayer(o.foil, id, o.seed, 'back')}${artImage(f.art, 30, 40, 240, 300, 'cutout')}${front}`
      : `${artImage(f.art, 0, 0, W, H, 'fill')}${front}`;
    const qrFrame = `<rect x="${QR.x - 9}" y="${QR.y - 9}" width="${QR.size + 18}" height="${QR.size + 18}" rx="12" fill="${o.panel}" stroke="${o.accent}" stroke-width="2"/>`;
    let ui = '';

    if (o.layout === 'stats') {
      const [atk, def] = o.stats ?? [68000, 65000];
      ui = `${kanjiBanner(o.kanji, o.banner[0], o.banner[1], o.banner[2])}
        ${rarityseal(o.rarity, o.seal[0], o.seal[1], id)}
        <path d="M14,304 H186 L180,330 H14 Z" fill="${o.panel}" stroke="${o.accent}" stroke-width="1.6"/>
        ${txt(22, 323, f.name, { size: 15, fill: o.panelText, weight: 900, max: 150 })}
        <g>
          <rect x="14" y="336" width="84" height="24" rx="4" fill="${o.panel}" stroke="${o.accent}" stroke-width="1.4"/>
          <rect x="17" y="339" width="18" height="18" rx="3" fill="${o.accent}"/>
          ${txt(26, 353, '攻', { size: 12, fill: '#ffffff', weight: 900, anchor: 'middle', family: JP })}
          ${txt(92, 353, atk.toLocaleString('en-US').replace(/,/g, ''), { size: 14, fill: o.panelText, weight: 900, anchor: 'end', family: SERIF, italic: true })}
          <rect x="102" y="336" width="84" height="24" rx="4" fill="${o.panel}" stroke="${o.accent}" stroke-width="1.4"/>
          <rect x="105" y="339" width="18" height="18" rx="3" fill="${o.accent}"/>
          ${txt(114, 353, '防', { size: 12, fill: '#ffffff', weight: 900, anchor: 'middle', family: JP })}
          ${txt(180, 353, def.toLocaleString('en-US').replace(/,/g, ''), { size: 14, fill: o.panelText, weight: 900, anchor: 'end', family: SERIF, italic: true })}
        </g>
        <rect x="14" y="366" width="172" height="24" rx="4" fill="${o.panel}" stroke="${o.accent}" stroke-width="1.4"/>
        ${txt(100, 382, f.title, { size: 11, fill: o.panelText, weight: 800, anchor: 'middle', max: 160 })}
        ${txt(186, 408, f.extra, { size: 8, fill: o.panelText, weight: 700, anchor: 'end', max: 120, stroke: o.panel, sw: 2 })}`;
    } else if (o.layout === 'elegant') {
      ui = `${rarityseal(o.rarity, o.seal[0], o.seal[1], id)}
        ${kanjiBanner(o.kanji, o.banner[0], o.banner[1], o.banner[2])}
        ${txt(186, 300, o.rarity, { size: 34, fill: o.accent, weight: 900, anchor: 'end', family: SERIF, italic: true, stroke: '#ffffffaa', sw: 3, spacing: 1 })}
        <path d="M14,312 H186 V364 H14 Z" fill="${o.panel}" opacity=".92"/>
        <path d="M14,312 H186 M14,364 H186" stroke="${o.accent}" stroke-width="2.4"/>
        <path d="M20,318 H180 M20,358 H180" stroke="${o.accent}" stroke-width=".8" opacity=".8"/>
        ${txt(100, 344, f.name, { size: 18, fill: o.panelText, weight: 800, anchor: 'middle', family: SERIF, max: 158, spacing: 1 })}
        ${txt(100, 384, f.title, { size: 11, fill: o.panelText, weight: 700, anchor: 'middle', max: 168, stroke: o.panel, sw: 3 })}
        ${txt(100, 404, f.extra, { size: 8, fill: o.panelText, weight: 700, anchor: 'middle', max: 160, stroke: o.panel, sw: 2, spacing: 1 })}`;
    } else {
      // Rules layout: cost circles, rule-text box, power, autograph
      const costs = `<circle cx="34" cy="36" r="17" fill="#1e3a8a" stroke="#e0e7ff" stroke-width="2"/>${txt(34, 43, '3', { size: 20, fill: '#ffffff', weight: 900, anchor: 'middle', family: SERIF })}
        <circle cx="34" cy="74" r="13" fill="#1e40af" stroke="#e0e7ff" stroke-width="2"/>${txt(34, 80, '2', { size: 15, fill: '#ffffff', weight: 900, anchor: 'middle', family: SERIF })}`;
      const sign = `<g transform="rotate(-12 150 262)" opacity=".85">${txt(150, 266, f.name || 'Signature', { size: 34, fill: '#111827', weight: 400, anchor: 'middle', family: SCRIPT, max: 210 })}
        <path d="M70,278 C120,266 170,288 232,270" stroke="#111827" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
      ui = `${costs}
        <rect x="246" y="20" width="34" height="34" rx="6" fill="#334155" stroke="#e2e8f0" stroke-width="2"/>
        <path d="M263,26 L268,37 L263,48 L258,37 Z M252,37 L263,32 L274,37 L263,42 Z" fill="#e2e8f0"/>
        ${sign}
        <rect x="12" y="296" width="178" height="74" rx="4" fill="#fffbeb" opacity=".88" stroke="${o.accent}" stroke-width="1.4"/>
        ${txt(18, 312, '【Scan】 When this card is scanned,', { size: 8.4, fill: '#1f2937', weight: 700 })}
        ${txt(18, 324, 'open the link stored in its QR code.', { size: 8.4, fill: '#1f2937', weight: 600 })}
        ${txt(18, 338, '【Bond】 Each scan adds +1000 power', { size: 8.4, fill: '#1f2937', weight: 700 })}
        ${txt(18, 350, 'to every ally on your field.', { size: 8.4, fill: '#1f2937', weight: 600 })}
        ${txt(18, 363, f.title, { size: 8.4, fill: o.accent, weight: 800, max: 166 })}
        <rect x="12" y="376" width="52" height="30" rx="4" fill="#1e3a8a" stroke="#e0e7ff" stroke-width="1.6"/>
        ${txt(38, 397, String(o.stats?.[0] ?? 9500), { size: 16, fill: '#ffffff', weight: 900, anchor: 'middle', family: SERIF })}
        <path d="M68,376 H190 V406 H68 Z" fill="${o.panel}" stroke="${o.accent}" stroke-width="1.4"/>
        ${txt(129, 389, o.kanji, { size: 9, fill: o.accent, weight: 800, anchor: 'middle', family: JP })}
        ${txt(129, 402, f.name, { size: 11, fill: o.panelText, weight: 900, anchor: 'middle', max: 116 })}
        ${txt(186, 415, f.extra, { size: 7, fill: '#ffffff', weight: 700, anchor: 'end', max: 110, stroke: '#00000088', sw: 2 })}`;
    }

    const back = `${art}${frame(id, o.frameColors)}${ui}${qrFrame}`;
    return { back };
  };
}

// ── Catalogue: 12 original holo trading cards ───────────────────

const base = { kind: 'holo' as const, w: W, h: H, radius: 16, qr: QR };

export const TCG_DESIGNS: CardDesign[] = [
  {
    ...base,
    id: 'tcg-rainbow-rare',
    name: 'Rainbow Rare',
    desc: 'Holo swirl foil, kanji banner and ATK / DEF stats',
    defaults: { name: 'Ryo Kazane', title: 'Skill · Storm Blade', extra: 'QR-SLR-016' },
    draw: tcgCard({
      scene: rainbowSwirl,
      chara: { hair: '#38bdf8', hairShade: '#1e3a8a', style: 'spiky', eyes: '#7c3aed', eyes2: '#c4b5fd', eyeShape: 'sharp', outfit: 'hoodie', c1: '#6d28d9', c2: '#4c1d95', c3: '#e2e8f0', item: 'sword', itemColor: '#1e3a8a', mood: 'serious' },
      foil: 'rainbow',
      frameColors: ['#e0f2fe', '#f0abfc', '#fde68a', '#a5f3fc', '#e0f2fe'],
      kanji: '風刃忍',
      banner: ['#ffffffdd', '#1e1b4b', '#818cf8'],
      rarity: 'SLR',
      seal: ['#c084fc', '#1e3a8a'],
      layout: 'stats',
      panel: '#ffffffe6',
      panelText: '#1e1b4b',
      accent: '#6366f1',
      stats: [68000, 65000],
      seed: 3,
    }),
  },
  {
    ...base,
    id: 'tcg-sakura-edition',
    name: 'Sakura Edition',
    desc: 'Pink blossoms, torii gate, kimono and umbrella',
    defaults: { name: 'Hana Shiraki', title: 'Spring Festival Edition', extra: 'QR-SE-005' },
    draw: tcgCard({
      scene: sakuraShrine,
      chara: { hair: '#3b0764', hairShade: '#1e1b4b', hairShine: '#e9d5ff', style: 'long', eyes: '#be185d', eyes2: '#f9a8d4', outfit: 'kimono', c1: '#f472b6', c2: '#ffffff', c3: '#be123c', pattern: 'sakura', item: 'umbrella', itemColor: '#e11d48', acc: 'flowerpin', accColor: '#f43f5e', mood: 'smile' },
      foil: 'silver',
      frameColors: ['#fbcfe8', '#ffffff', '#f9a8d4', '#fde68a', '#fbcfe8'],
      kanji: '桜姫',
      banner: ['#fff1f2ee', '#9f1239', '#f43f5e'],
      rarity: 'SE',
      seal: ['#fda4af', '#be123c'],
      layout: 'elegant',
      panel: '#fff1f2',
      panelText: '#881337',
      accent: '#e11d48',
      seed: 5,
    }),
  },
  {
    ...base,
    id: 'tcg-ssr-gold',
    name: 'SSR Gold Foil',
    desc: 'Gold flakes, foil linework and SSR nameplate',
    defaults: { name: 'Aiko Mizuno', title: 'Summer Light · SSR', extra: 'QR-SSR-024' },
    draw: tcgCard({
      scene: goldGraffiti,
      chara: { hair: '#fbbf24', hairShade: '#b45309', hairShine: '#fef9c3', style: 'wavy', eyes: '#1d4ed8', eyes2: '#93c5fd', outfit: 'dress', c1: '#ffffff', c2: '#facc15', c3: '#eab308', acc: 'earring', accColor: '#eab308', mood: 'calm' },
      foil: 'gold',
      frameColors: ['#fef3c7', '#ca8a04', '#fde68a', '#a16207', '#fef3c7'],
      kanji: '陽光',
      banner: ['#fffbebee', '#78350f', '#ca8a04'],
      rarity: 'SSR',
      seal: ['#fde68a', '#a16207'],
      layout: 'elegant',
      panel: '#fffbeb',
      panelText: '#78350f',
      accent: '#ca8a04',
      seed: 7,
    }),
  },
  {
    ...base,
    id: 'tcg-gothic-nightmare',
    name: 'Gothic Nightmare',
    desc: 'Rule text box, cost gems, power and autograph',
    defaults: { name: 'Noir Kurose', title: '【Nightmare】 Once per turn, rewind time.', extra: 'QR-RR-077' },
    draw: tcgCard({
      scene: gothicClock,
      chara: { hair: '#e5e7eb', hairShade: '#64748b', style: 'twin', eyes: '#dc2626', eyes2: '#fca5a5', eyeShape: 'sharp', outfit: 'dress', c1: '#111827', c2: '#dc2626', c3: '#dc2626', acc: 'ribbon', accColor: '#b91c1c', mood: 'smirk' },
      foil: 'silver',
      frameColors: ['#cbd5e1', '#1e293b', '#94a3b8', '#0f172a', '#cbd5e1'],
      kanji: '紅き夜の魔女',
      banner: ['#111827', '#ffffff', '#dc2626'],
      rarity: 'RR',
      seal: ['#f87171', '#7f1d1d'],
      layout: 'rules',
      panel: '#eff6ff',
      panelText: '#0f172a',
      accent: '#1e3a8a',
      stats: [9500, 0],
      seed: 9,
    }),
  },
  {
    ...base,
    id: 'tcg-moonlit-ronin',
    name: 'Moonlit Ronin',
    desc: 'Full moon, bamboo grove, swordsman in a long coat',
    defaults: { name: 'Jin Tsukasa', title: 'Skill · Crescent Draw', extra: 'QR-UR-033' },
    draw: tcgCard({
      scene: moonNight,
      chara: { hair: '#1f2937', hairShade: '#020617', hairShine: '#a5b4fc', style: 'pony', eyes: '#f59e0b', eyes2: '#fde68a', eyeShape: 'sharp', outfit: 'coat', c1: '#1e293b', c2: '#334155', c3: '#facc15', item: 'sword', itemColor: '#7f1d1d', mood: 'serious' },
      foil: 'silver',
      frameColors: ['#e0e7ff', '#6366f1', '#fde68a', '#312e81', '#e0e7ff'],
      kanji: '月影剣',
      banner: ['#1e1b4bee', '#fde68a', '#fde68a'],
      rarity: 'UR',
      seal: ['#fde68a', '#3730a3'],
      layout: 'stats',
      panel: '#1e1b4be6',
      panelText: '#fef3c7',
      accent: '#facc15',
      stats: [72000, 58000],
      seed: 11,
    }),
  },
  {
    ...base,
    id: 'tcg-frost-princess',
    name: 'Frost Princess',
    desc: 'Ice crystals, snow sparkle and a silver tiara',
    defaults: { name: 'Yuki Hoshino', title: 'Skill · Diamond Dust', extra: 'QR-SR-041' },
    draw: tcgCard({
      scene: frostCrystal,
      chara: { hair: '#f1f5f9', hairShade: '#7dd3fc', hairShine: '#ffffff', style: 'long', eyes: '#0284c7', eyes2: '#bae6fd', outfit: 'dress', c1: '#e0f2fe', c2: '#38bdf8', c3: '#0ea5e9', acc: 'tiara', accColor: '#e2e8f0', mood: 'calm' },
      foil: 'silver',
      frameColors: ['#f0f9ff', '#7dd3fc', '#ffffff', '#0284c7', '#f0f9ff'],
      kanji: '氷華',
      banner: ['#f0f9ffee', '#075985', '#38bdf8'],
      rarity: 'SR',
      seal: ['#bae6fd', '#0369a1'],
      layout: 'elegant',
      panel: '#f0f9ff',
      panelText: '#0c4a6e',
      accent: '#0284c7',
      seed: 13,
    }),
  },
  {
    ...base,
    id: 'tcg-thunder-ace',
    name: 'Thunder Ace',
    desc: 'Lightning storm, electric foil and battle stats',
    defaults: { name: 'Kai Raiden', title: 'Skill · Volt Rush', extra: 'QR-SR-052' },
    draw: tcgCard({
      scene: thunderStorm,
      chara: { hair: '#fde047', hairShade: '#ca8a04', style: 'spiky', eyes: '#a855f7', eyes2: '#e9d5ff', eyeShape: 'sharp', outfit: 'armor', c1: '#312e81', c2: '#facc15', c3: '#1e1b4b', mood: 'smirk' },
      foil: 'rainbow',
      frameColors: ['#fef08a', '#7c3aed', '#fde047', '#4c1d95', '#fef08a'],
      kanji: '雷神',
      banner: ['#1e1b4bee', '#fde047', '#fde047'],
      rarity: 'SR',
      seal: ['#fde047', '#6d28d9'],
      layout: 'stats',
      panel: '#1e1b4be6',
      panelText: '#fef9c3',
      accent: '#eab308',
      stats: [61000, 47000],
      seed: 15,
    }),
  },
  {
    ...base,
    id: 'tcg-crimson-hunter',
    name: 'Crimson Hunter',
    desc: 'Inferno background, ember sparks, demon horns',
    defaults: { name: 'Rei Akabane', title: 'Skill · Blazing Oath', extra: 'QR-UR-066' },
    draw: tcgCard({
      scene: crimsonFlame,
      chara: { hair: '#7f1d1d', hairShade: '#1c0505', hairShine: '#fca5a5', style: 'short', eyes: '#f97316', eyes2: '#fed7aa', eyeShape: 'sharp', outfit: 'coat', c1: '#0c0a09', c2: '#7f1d1d', c3: '#f59e0b', item: 'sword', itemColor: '#b91c1c', acc: 'horns', accColor: '#e7e5e4', mood: 'serious' },
      foil: 'gold',
      frameColors: ['#fecaca', '#991b1b', '#fbbf24', '#450a0a', '#fecaca'],
      kanji: '紅蓮',
      banner: ['#0c0a09ee', '#fbbf24', '#dc2626'],
      rarity: 'UR',
      seal: ['#fca5a5', '#7f1d1d'],
      layout: 'stats',
      panel: '#0c0a09e6',
      panelText: '#fde68a',
      accent: '#dc2626',
      stats: [80000, 52000],
      seed: 17,
    }),
  },
  {
    ...base,
    id: 'tcg-celestial-mage',
    name: 'Celestial Mage',
    desc: 'Galaxy nebula, star sparkles and a crystal staff',
    defaults: { name: 'Luna Seika', title: 'Skill · Starfall Hymn', extra: 'QR-SSR-088' },
    draw: tcgCard({
      scene: galaxy,
      chara: { hair: '#c084fc', hairShade: '#4c1d95', hairShine: '#f5d0fe', style: 'wavy', eyes: '#db2777', eyes2: '#fbcfe8', outfit: 'sailor', c1: '#f5f3ff', c2: '#4c1d95', c3: '#f472b6', item: 'staff', itemColor: '#e879f9', acc: 'halo', accColor: '#fde68a', mood: 'smile' },
      foil: 'rainbow',
      frameColors: ['#f5d0fe', '#7c3aed', '#fde68a', '#3b0764', '#f5d0fe'],
      kanji: '星詠',
      banner: ['#2e1065ee', '#f5d0fe', '#e879f9'],
      rarity: 'SSR',
      seal: ['#f0abfc', '#581c87'],
      layout: 'elegant',
      panel: '#2e1065',
      panelText: '#fae8ff',
      accent: '#e879f9',
      seed: 19,
    }),
  },
  {
    ...base,
    id: 'tcg-ocean-idol',
    name: 'Ocean Idol',
    desc: 'Underwater light rays, bubbles and twin tails',
    defaults: { name: 'Mio Aoba', title: 'Skill · Tidal Encore', extra: 'QR-SR-019' },
    draw: tcgCard({
      scene: oceanBubbles,
      chara: { hair: '#22d3ee', hairShade: '#0e7490', hairShine: '#ecfeff', style: 'twin', eyes: '#0891b2', eyes2: '#a5f3fc', outfit: 'sailor', c1: '#ffffff', c2: '#0e7490', c3: '#f43f5e', acc: 'ribbon', accColor: '#f43f5e', mood: 'smile' },
      foil: 'rainbow',
      frameColors: ['#cffafe', '#06b6d4', '#ffffff', '#0e7490', '#cffafe'],
      kanji: '海歌',
      banner: ['#ecfeffee', '#155e75', '#06b6d4'],
      rarity: 'SR',
      seal: ['#a5f3fc', '#0e7490'],
      layout: 'stats',
      panel: '#ecfeffe6',
      panelText: '#164e63',
      accent: '#0891b2',
      stats: [42000, 56000],
      seed: 21,
    }),
  },
  {
    ...base,
    id: 'tcg-jade-dragon',
    name: 'Jade Dragon',
    desc: 'Dragon coil, cloud swirls and a wave-pattern kimono',
    defaults: { name: 'Sora Midori', title: 'Skill · Emerald Tempest', extra: 'QR-UR-099' },
    draw: tcgCard({
      scene: jadeDragon,
      chara: { hair: '#14532d', hairShade: '#052e16', hairShine: '#86efac', style: 'short', eyes: '#16a34a', eyes2: '#bbf7d0', eyeShape: 'sharp', outfit: 'kimono', c1: '#064e3b', c2: '#6ee7b7', c3: '#fbbf24', pattern: 'waves', item: 'fan', itemColor: '#fbbf24', mood: 'smirk' },
      foil: 'gold',
      frameColors: ['#d1fae5', '#047857', '#fde68a', '#022c22', '#d1fae5'],
      kanji: '翠竜',
      banner: ['#022c22ee', '#fde68a', '#34d399'],
      rarity: 'UR',
      seal: ['#6ee7b7', '#065f46'],
      layout: 'stats',
      panel: '#022c22e6',
      panelText: '#ecfdf5',
      accent: '#10b981',
      stats: [75000, 70000],
      seed: 23,
    }),
  },
  {
    ...base,
    id: 'tcg-neon-cyber',
    name: 'Neon Cyber',
    desc: 'Neon skyline, holo visor and cyber armour',
    defaults: { name: 'Nova Kiryu', title: 'Skill · Overclock', extra: 'QR-SEC-101' },
    draw: tcgCard({
      scene: neonCity,
      chara: { hair: '#f472b6', hairShade: '#701a75', hairShine: '#a5f3fc', style: 'short', eyes: '#06b6d4', eyes2: '#a5f3fc', outfit: 'armor', c1: '#0f172a', c2: '#1e293b', c3: '#22d3ee', acc: 'visor', accColor: '#22d3ee', mood: 'smirk' },
      foil: 'rainbow',
      frameColors: ['#a5f3fc', '#e879f9', '#22d3ee', '#701a75', '#a5f3fc'],
      kanji: '電脳',
      banner: ['#0f172aee', '#22d3ee', '#e879f9'],
      rarity: 'SEC',
      seal: ['#e879f9', '#0e7490'],
      layout: 'stats',
      panel: '#0f172ae6',
      panelText: '#cffafe',
      accent: '#e879f9',
      stats: [66000, 61000],
      seed: 25,
    }),
  },
];
