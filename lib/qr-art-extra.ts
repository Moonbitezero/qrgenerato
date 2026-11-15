// lib/qr-art-extra.ts
// 12 additional QR Art presets. Each preset has a full-bleed background (`bg`)
// and a foreground illustration (`art`) that is also used alone as the cutout.
// Art is painted INTO the dark QR modules, so tones stay mid-to-dark for scanning.

export interface ExtraArtPreset {
  id: string;
  name: string;
  fg: string;
  g2: string;
  eyeAccent: string;
  bg: string;
  art: string;
}

const C = 120; // canvas centre (240 × 240)
const r2 = (v: number) => Number(v.toFixed(2));

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r2(C + r * Math.cos(a)), r2(C + r * Math.sin(a))];
}

function ring(count: number, fn: (deg: number, i: number) => string): string {
  let out = '';
  for (let i = 0; i < count; i++) out += fn((360 / count) * i, i);
  return out;
}

// ── 1. Golden Mandala ───────────────────────────────────────────
const mandala = (() => {
  const petal = (r: number, len: number, w: number, deg: number, fill: string) =>
    `<path d="M${C},${C - r} C${C + w},${C - r - len * 0.4} ${C + w * 0.6},${C - r - len} ${C},${C - r - len} C${C - w * 0.6},${C - r - len} ${C - w},${C - r - len * 0.4} ${C},${C - r} Z" fill="${fill}" transform="rotate(${deg} ${C} ${C})"/>`;
  return (
    ring(16, (d) => petal(78, 30, 14, d, '#a16207')) +
    ring(16, (d) => petal(82, 18, 7, d, '#422006')) +
    `<circle cx="${C}" cy="${C}" r="80" fill="none" stroke="#ca8a04" stroke-width="3"/>` +
    ring(12, (d) => petal(44, 34, 16, d + 15, '#b45309')) +
    ring(12, (d) => petal(48, 20, 7, d + 15, '#78350f')) +
    `<circle cx="${C}" cy="${C}" r="46" fill="#713f12" stroke="#ca8a04" stroke-width="3"/>` +
    ring(8, (d) => petal(12, 28, 11, d, '#ca8a04')) +
    `<circle cx="${C}" cy="${C}" r="13" fill="#422006" stroke="#eab308" stroke-width="3"/>` +
    ring(24, (d) => {
      const [x, y] = polar(102, d);
      return `<circle cx="${x}" cy="${y}" r="3.2" fill="#ca8a04"/>`;
    })
  );
})();

// ── 2. Sakura Blossom ───────────────────────────────────────────
const blossom = (x: number, y: number, s: number, fill: string, centre = '#fde68a') =>
  `<g transform="translate(${x} ${y}) scale(${s})">${ring(5, (d) => `<ellipse cx="0" cy="-9" rx="6.5" ry="9.5" fill="${fill}" transform="rotate(${d})"/>`)}<circle r="3.6" fill="${centre}"/></g>`;

const sakura =
  `<path d="M-10,230 C40,200 60,170 92,150 C120,132 150,128 178,96 C196,74 214,60 250,52" stroke="#3b1708" stroke-width="13" fill="none" stroke-linecap="round"/>` +
  `<path d="M92,150 C88,118 70,98 46,84 M150,126 C168,140 196,150 226,148 M178,96 C170,70 172,44 186,20" stroke="#3b1708" stroke-width="7" fill="none" stroke-linecap="round"/>` +
  [
    [46, 84, 1.5], [70, 108, 1.2], [104, 138, 1.6], [138, 124, 1.3], [178, 98, 1.7], [186, 22, 1.2],
    [214, 64, 1.4], [226, 148, 1.5], [196, 146, 1.1], [30, 190, 1.3], [60, 168, 1], [176, 52, 1.1],
  ]
    .map(([x, y, s], i) => blossom(x, y, s, i % 3 === 0 ? '#9d174d' : i % 3 === 1 ? '#be185d' : '#db2777'))
    .join('') +
  ring(10, (d, i) => {
    const [x, y] = polar(60 + (i % 4) * 20, d + 17);
    return `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.4" fill="#db2777" transform="rotate(${d} ${x} ${y})"/>`;
  });

// ── 3. Wolf Spirit ──────────────────────────────────────────────
const wolf =
  `<path d="M120,214 L74,176 L52,120 L40,40 L86,84 L120,72 L154,84 L200,40 L188,120 L166,176 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M54,58 L82,88 L60,104 Z M186,58 L158,88 L180,104 Z" fill="#1e3a8a"/>` +
  `<path d="M120,72 L102,118 L120,190 L138,118 Z" fill="#1e293b"/>` +
  `<path d="M74,128 L104,118 L98,136 Z M166,128 L136,118 L142,136 Z" fill="#38bdf8"/>` +
  `<circle cx="96" cy="128" r="3" fill="#e0f2fe"/><circle cx="144" cy="128" r="3" fill="#e0f2fe"/>` +
  `<path d="M108,178 L120,196 L132,178 Z" fill="#020617"/>` +
  `<path d="M60,124 L30,150 M64,146 L36,180 M180,124 L210,150 M176,146 L204,180" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>` +
  `<path d="M120,30 L126,52 L120,60 L114,52 Z" fill="#7dd3fc"/>`;

// ── 4. Dragon Art ───────────────────────────────────────────────
const dragon = (() => {
  const body = 'M30,200 C10,150 60,120 100,140 C140,160 180,140 170,100 C160,60 110,70 112,100 C114,124 150,118 150,96';
  return (
    `<path d="${body}" stroke="#78350f" stroke-width="30" fill="none" stroke-linecap="round"/>` +
    `<path d="${body}" stroke="#b45309" stroke-width="20" fill="none" stroke-linecap="round"/>` +
    `<path d="${body}" stroke="#fbbf24" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="2 9" opacity=".9"/>` +
    `<path d="M136,72 L190,40 L180,64 L214,58 L186,86 L160,96 Z" fill="#7f1d1d" stroke="#b45309" stroke-width="3"/>` +
    `<path d="M150,96 C150,70 176,58 196,66 L226,60 L208,78 L220,92 L196,92 C186,104 160,108 150,96 Z" fill="#92400e" stroke="#fbbf24" stroke-width="2.5"/>` +
    `<circle cx="190" cy="76" r="4" fill="#fde047"/>` +
    `<path d="M178,62 L170,34 M190,62 L196,32" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M220,92 C232,104 226,120 214,124" stroke="#ef4444" stroke-width="3" fill="none"/>` +
    `<path d="M60,150 L48,178 M90,144 L84,174" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>`
  );
})();

// ── 5. Butterfly Wings ──────────────────────────────────────────
const butterfly =
  `<g transform="translate(120 122)">` +
  `<path d="M0,-6 C-30,-80 -110,-90 -104,-30 C-100,4 -46,10 0,0 Z" fill="#6d28d9" stroke="#1e1b4b" stroke-width="4"/>` +
  `<path d="M0,-6 C30,-80 110,-90 104,-30 C100,4 46,10 0,0 Z" fill="#6d28d9" stroke="#1e1b4b" stroke-width="4"/>` +
  `<path d="M0,2 C-24,10 -86,26 -74,72 C-64,104 -20,70 0,10 Z" fill="#be185d" stroke="#1e1b4b" stroke-width="4"/>` +
  `<path d="M0,2 C24,10 86,26 74,72 C64,104 20,70 0,10 Z" fill="#be185d" stroke="#1e1b4b" stroke-width="4"/>` +
  `<circle cx="-62" cy="-40" r="14" fill="#0e7490"/><circle cx="62" cy="-40" r="14" fill="#0e7490"/>` +
  `<circle cx="-62" cy="-40" r="6" fill="#1e1b4b"/><circle cx="62" cy="-40" r="6" fill="#1e1b4b"/>` +
  `<circle cx="-46" cy="52" r="9" fill="#a16207"/><circle cx="46" cy="52" r="9" fill="#a16207"/>` +
  ring(6, (d, i) => `<circle cx="${r2(-88 + i * 4)}" cy="${r2(-58 + i * 9)}" r="3" fill="#c4b5fd"/>`) +
  `<ellipse cx="0" cy="8" rx="6" ry="44" fill="#1e1b4b"/>` +
  `<path d="M-2,-34 C-10,-60 -22,-70 -30,-74 M2,-34 C10,-60 22,-70 30,-74" stroke="#1e1b4b" stroke-width="3" fill="none" stroke-linecap="round"/>` +
  `</g>`;

// ── 6. Galaxy Vision ────────────────────────────────────────────
const galaxy = (() => {
  let arms = '';
  for (let a = 0; a < 2; a++) {
    for (let i = 0; i < 26; i++) {
      const t = i / 25;
      const ang = a * Math.PI + t * Math.PI * 2.2;
      const rad = 8 + t * 92;
      const x = C + Math.cos(ang) * rad;
      const y = C + Math.sin(ang) * rad * 0.62;
      arms += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(9 - t * 6)}" fill="${i % 3 ? '#6d28d9' : '#be185d'}" opacity="${r2(0.9 - t * 0.4)}"/>`;
    }
  }
  const stars = ring(22, (d, i) => {
    const [x, y] = polar(20 + ((i * 37) % 95), d * 1.7);
    return `<circle cx="${x}" cy="${y}" r="${i % 4 === 0 ? 2.4 : 1.4}" fill="#e0e7ff"/>`;
  });
  return `<ellipse cx="${C}" cy="${C}" rx="104" ry="64" fill="#312e81" opacity=".7" transform="rotate(-18 ${C} ${C})"/><g transform="rotate(-18 ${C} ${C})">${arms}</g><circle cx="${C}" cy="${C}" r="14" fill="#a5b4fc"/><circle cx="${C}" cy="${C}" r="7" fill="#eef2ff"/>${stars}`;
})();

// ── 7. Neon Cyber ───────────────────────────────────────────────
const neonCyber = (() => {
  let grid = '';
  for (let i = 0; i <= 10; i++) {
    const x = i * 24;
    grid += `<line x1="${C}" y1="140" x2="${r2((x - C) * 2.4 + C)}" y2="240" stroke="#0891b2" stroke-width="1.6"/>`;
  }
  for (let j = 0; j < 6; j++) {
    const y = 140 + Math.pow(j / 5, 1.8) * 100;
    grid += `<line x1="0" y1="${r2(y)}" x2="240" y2="${r2(y)}" stroke="#0891b2" stroke-width="1.6"/>`;
  }
  let sunStripes = '';
  for (let k = 0; k < 5; k++) sunStripes += `<rect x="62" y="${104 + k * 8}" width="116" height="${2 + k}" fill="#020617"/>`;
  return (
    `<circle cx="${C}" cy="110" r="58" fill="#be185d"/><circle cx="${C}" cy="110" r="58" fill="#7c3aed" opacity=".35"/>` +
    sunStripes +
    `<rect x="0" y="138" width="240" height="102" fill="#0b1120"/>` +
    grid +
    `<path d="M20,138 L60,96 L84,118 L110,84 L136,118 L170,90 L220,138 Z" fill="#1e1b4b" stroke="#22d3ee" stroke-width="2"/>` +
    `<rect x="96" y="28" width="48" height="48" rx="6" fill="#0f172a" stroke="#22d3ee" stroke-width="3"/>` +
    `<rect x="108" y="40" width="24" height="24" rx="3" fill="#a21caf"/>` +
    ring(4, (d) => `<path d="M${C},28 V14" stroke="#22d3ee" stroke-width="3" transform="rotate(${d} ${C} 52)"/>`)
  );
})();

// ── 8. Floral Garden ────────────────────────────────────────────
const flower = (x: number, y: number, s: number, petals: string, centre: string, n = 8) =>
  `<g transform="translate(${x} ${y}) scale(${s})">${ring(n, (d) => `<ellipse cx="0" cy="-11" rx="6" ry="11" fill="${petals}" transform="rotate(${d})"/>`)}<circle r="6" fill="${centre}"/></g>`;
const leaf = (x: number, y: number, deg: number, s = 1) =>
  `<path d="M0,0 C10,-14 30,-14 40,0 C30,14 10,14 0,0 Z" fill="#15803d" transform="translate(${x} ${y}) rotate(${deg}) scale(${s})"/><path d="M0,0 H40" stroke="#14532d" stroke-width="1.5" transform="translate(${x} ${y}) rotate(${deg}) scale(${s})"/>`;
const floral =
  [
    [30, 60, -30], [180, 40, 200], [200, 170, 140], [40, 190, 20], [110, 110, 70], [140, 210, -60], [10, 120, 10], [210, 100, 170],
  ]
    .map(([x, y, d]) => leaf(x, y, d, 1.2))
    .join('') +
  flower(70, 70, 1.5, '#be123c', '#fbbf24') +
  flower(170, 80, 1.3, '#7c3aed', '#fde68a', 6) +
  flower(120, 140, 1.8, '#c2410c', '#78350f', 10) +
  flower(60, 170, 1.2, '#be185d', '#fde68a', 6) +
  flower(190, 180, 1.4, '#1d4ed8', '#fbbf24') +
  flower(120, 40, 1, '#9d174d', '#fde68a', 5) +
  flower(30, 115, 0.9, '#7c3aed', '#fde68a', 5) +
  flower(215, 130, 0.9, '#be123c', '#fde68a', 5);

// ── 9. Geometric Mosaic ─────────────────────────────────────────
const mosaic = (() => {
  const palette = ['#7c3aed', '#be185d', '#0e7490', '#c2410c', '#15803d', '#1d4ed8', '#a16207', '#9d174d'];
  let out = '';
  const s = 30;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = c * s;
      const y = r * s;
      const a = palette[(r * 3 + c * 5) % palette.length];
      const b = palette[(r * 7 + c * 2 + 3) % palette.length];
      const flip = (r + c) % 2 === 0;
      out += flip
        ? `<polygon points="${x},${y} ${x + s},${y} ${x},${y + s}" fill="${a}"/><polygon points="${x + s},${y} ${x + s},${y + s} ${x},${y + s}" fill="${b}"/>`
        : `<polygon points="${x},${y} ${x + s},${y} ${x + s},${y + s}" fill="${a}"/><polygon points="${x},${y} ${x + s},${y + s} ${x},${y + s}" fill="${b}"/>`;
    }
  }
  return out + `<g fill="none" stroke="#0f172a" stroke-width="2" opacity=".55">${Array.from({ length: 9 }, (_, i) => `<line x1="${i * s}" y1="0" x2="${i * s}" y2="240"/><line x1="0" y1="${i * s}" x2="240" y2="${i * s}"/>`).join('')}</g>`;
})();

// ── 10. Japanese Wave ───────────────────────────────────────────
const japaneseWave = (() => {
  let rows = '';
  const colors = ['#1e3a8a', '#1e40af', '#1d4ed8', '#1e3a8a'];
  for (let row = 0; row < 7; row++) {
    const y = 60 + row * 30;
    const off = row % 2 ? 20 : 0;
    for (let i = -1; i < 7; i++) {
      const x = i * 40 + off;
      rows += `<circle cx="${x}" cy="${y}" r="26" fill="${colors[row % 4]}" stroke="#bae6fd" stroke-width="2.5"/>`;
      rows += `<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#bae6fd" stroke-width="2"/>`;
      rows += `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#bae6fd" stroke-width="2"/>`;
    }
  }
  return (
    rows +
    `<path d="M0,70 C30,10 110,0 150,40 C120,30 96,44 104,70 C112,90 140,86 146,70 C170,96 130,130 90,110 C60,96 40,80 0,90 Z" fill="#172554" stroke="#e0f2fe" stroke-width="3"/>` +
    ring(7, (d, i) => `<circle cx="${r2(100 + Math.cos(i) * 40)}" cy="${r2(26 + Math.sin(i * 2) * 10)}" r="5" fill="#e0f2fe"/>`)
  );
})();

// ── 11. Skull Matrix ────────────────────────────────────────────
const skullMatrix = (() => {
  const px = [
    '....XXXXXXXX....',
    '..XXXXXXXXXXXX..',
    '.XXXXXXXXXXXXXX.',
    'XXXXXXXXXXXXXXXX',
    'XXX....XX....XXX',
    'XXX....XX....XXX',
    'XXX....XX....XXX',
    'XXXXXXX..XXXXXXX',
    '.XXXXXX..XXXXXX.',
    '..XXXXXXXXXXXX..',
    '...X.X.XX.X.X...',
    '...XXXXXXXXXX...',
    '....X.X..X.X....',
  ];
  const s = 10;
  const ox = C - (px[0].length * s) / 2;
  const oy = 52;
  let cells = '';
  px.forEach((row, r) =>
    row.split('').forEach((ch, c) => {
      if (ch === 'X') cells += `<rect x="${ox + c * s + 0.6}" y="${oy + r * s + 0.6}" width="${s - 1.2}" height="${s - 1.2}" fill="${(r + c) % 3 ? '#16a34a' : '#22c55e'}"/>`;
    })
  );
  let rain = '';
  for (let col = 0; col < 12; col++) {
    const len = 4 + ((col * 7) % 6);
    for (let k = 0; k < len; k++) {
      rain += `<rect x="${col * 20 + 6}" y="${((col * 37) % 60) + k * 14}" width="7" height="9" fill="#22c55e" opacity="${r2(0.15 + (k / len) * 0.5)}"/>`;
    }
  }
  return rain + cells + `<circle cx="${ox + 5.5 * s}" cy="${oy + 5.5 * s}" r="5" fill="#22c55e"/><circle cx="${ox + 10.5 * s}" cy="${oy + 5.5 * s}" r="5" fill="#22c55e"/>`;
})();

// ── 12. Phoenix Rising ──────────────────────────────────────────
const phoenix =
  `<path d="M120,96 C90,60 40,40 10,60 C40,64 52,80 50,96 C30,92 16,104 14,120 C40,108 70,116 96,128 Z" fill="#b91c1c"/>` +
  `<path d="M120,96 C150,60 200,40 230,60 C200,64 188,80 190,96 C210,92 224,104 226,120 C200,108 170,116 144,128 Z" fill="#b91c1c"/>` +
  `<path d="M116,100 C92,76 56,66 34,74 C56,80 66,92 66,104 C82,104 98,112 108,122 Z" fill="#ea580c"/>` +
  `<path d="M124,100 C148,76 184,66 206,74 C184,80 174,92 174,104 C158,104 142,112 132,122 Z" fill="#ea580c"/>` +
  `<path d="M120,74 C134,84 138,110 132,140 C128,160 112,160 108,140 C102,110 106,84 120,74 Z" fill="#9a3412"/>` +
  `<circle cx="120" cy="70" r="14" fill="#c2410c"/><path d="M130,68 L146,72 L130,76 Z" fill="#a16207"/><circle cx="124" cy="66" r="3" fill="#fde047"/>` +
  `<path d="M116,58 C110,40 118,28 126,22 C124,34 130,42 128,56 Z" fill="#ea580c"/>` +
  `<path d="M112,150 C96,180 80,200 70,232 C92,214 104,200 114,186 C112,206 116,222 120,236 C124,222 128,206 126,186 C136,200 148,214 170,232 C160,200 144,180 128,150 Z" fill="#c2410c"/>` +
  `<path d="M116,160 C108,186 104,206 106,226 M124,160 C132,186 136,206 134,226" stroke="#a16207" stroke-width="3" fill="none"/>` +
  ring(9, (d, i) => {
    const [x, y] = polar(104, d + 200 * (i % 2 ? 1 : 0.6));
    return `<circle cx="${x}" cy="${y}" r="2.6" fill="#f59e0b" opacity=".85"/>`;
  });

export const EXTRA_ART_PRESETS: ExtraArtPreset[] = [
  { id: 'golden-mandala', name: 'Golden Mandala', fg: '#713f12', g2: '#a16207', eyeAccent: '#ca8a04', bg: `<rect width="240" height="240" fill="#451a03"/><circle cx="120" cy="120" r="112" fill="#78350f"/>`, art: mandala },
  { id: 'sakura-blossom', name: 'Sakura Blossom', fg: '#831843', g2: '#be185d', eyeAccent: '#db2777', bg: `<rect width="240" height="240" fill="#500724"/><circle cx="170" cy="70" r="80" fill="#831843"/>`, art: sakura },
  { id: 'wolf-spirit', name: 'Wolf Spirit', fg: '#0f172a', g2: '#1e3a8a', eyeAccent: '#38bdf8', bg: `<rect width="240" height="240" fill="#0c1a3a"/><circle cx="120" cy="110" r="96" fill="#1e3a8a"/>`, art: wolf },
  { id: 'dragon-art', name: 'Dragon Art', fg: '#7f1d1d', g2: '#b45309', eyeAccent: '#f59e0b', bg: `<rect width="240" height="240" fill="#450a0a"/><circle cx="130" cy="110" r="100" fill="#7f1d1d"/>`, art: dragon },
  { id: 'butterfly-wings', name: 'Butterfly Wings', fg: '#3b0764', g2: '#be185d', eyeAccent: '#a855f7', bg: `<rect width="240" height="240" fill="#1e1b4b"/><circle cx="120" cy="120" r="100" fill="#312e81"/>`, art: butterfly },
  { id: 'galaxy-vision', name: 'Galaxy Vision', fg: '#1e1b4b', g2: '#6d28d9', eyeAccent: '#a78bfa', bg: `<rect width="240" height="240" fill="#0f0a2e"/><circle cx="120" cy="120" r="110" fill="#1e1b4b"/>`, art: galaxy },
  { id: 'neon-cyber', name: 'Neon Cyber', fg: '#0f172a', g2: '#a21caf', eyeAccent: '#22d3ee', bg: `<rect width="240" height="240" fill="#020617"/><rect y="0" width="240" height="140" fill="#1e1b4b"/>`, art: neonCyber },
  { id: 'floral-garden', name: 'Floral Garden', fg: '#14532d', g2: '#be123c', eyeAccent: '#16a34a', bg: `<rect width="240" height="240" fill="#052e16"/><circle cx="120" cy="120" r="108" fill="#14532d"/>`, art: floral },
  { id: 'geometric-mosaic', name: 'Geometric Mosaic', fg: '#312e81', g2: '#be185d', eyeAccent: '#0e7490', bg: `<rect width="240" height="240" fill="#0f172a"/>`, art: mosaic },
  { id: 'japanese-wave', name: 'Japanese Wave', fg: '#172554', g2: '#1d4ed8', eyeAccent: '#38bdf8', bg: `<rect width="240" height="240" fill="#0c4a6e"/><circle cx="190" cy="50" r="30" fill="#b91c1c"/>`, art: japaneseWave },
  { id: 'skull-matrix', name: 'Skull Matrix', fg: '#052e16', g2: '#15803d', eyeAccent: '#22c55e', bg: `<rect width="240" height="240" fill="#020617"/><circle cx="120" cy="120" r="104" fill="#052e16"/>`, art: skullMatrix },
  { id: 'phoenix-rising', name: 'Phoenix Rising', fg: '#7c2d12', g2: '#c2410c', eyeAccent: '#f59e0b', bg: `<rect width="240" height="240" fill="#431407"/><circle cx="120" cy="110" r="100" fill="#7c2d12"/>`, art: phoenix },
];
