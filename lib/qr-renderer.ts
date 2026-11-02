// lib/qr-renderer.ts
import QRCode from 'qrcode';

export type DotStyle =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'diamond'
  | 'star'
  | 'heart'
  | 'cross'
  | 'vertical-bars'
  | 'horizontal-bars';

export type FinderShape =
  | 'square'
  | 'circle'
  | 'rounded'
  | 'leaf-tl'
  | 'leaf-tr'
  | 'leaf-bl'
  | 'leaf-br'
  | 'cut'
  | 'dotted';

export type FinderCenterShape =
  | 'square'
  | 'circle'
  | 'rounded'
  | 'diamond'
  | 'star'
  | 'cross'
  | 'leaf'
  | 'sun';

export type GradientType = 'none' | 'linear' | 'radial';

export type FrameStyle =
  | 'none'
  | 'simple'
  | 'banner-bottom'
  | 'banner-top'
  | 'speech-top'
  | 'clipboard'
  | 'receipt'
  | 'gift'
  | 'phone'
  | 'bag'
  | 'coffee'
  | 'beer'
  | 'scooter'
  | 'chef'
  | 'cloche'
  | 'envelope';

export interface QROptions {
  text: string;
  size?: number;
  margin?: number;
  fgColor: string;
  bgColor: string;
  transparentBg?: boolean;
  gradientType?: GradientType;
  gradientColor2?: string;
  dotStyle: DotStyle;
  finderShape: FinderShape;
  finderCenterShape?: FinderCenterShape;
  eyeBorderColor?: string;
  eyeCenterColor?: string;
  logoUrl?: string;
  logoSize?: number;
  removeLogoBg?: boolean;
  frameStyle?: FrameStyle;
  frameText?: string;
  frameColor?: string;
  frameTextColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  artworkUrl?: string;
  artworkOpacity?: number;
}

interface MatrixResult {
  modules: boolean[][];
  count: number;
}

function getQRMatrix(text: string, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'H'): MatrixResult {
  const qr = QRCode.create(text || 'https://qrgenerato.com', {
    errorCorrectionLevel,
  });
  const count = qr.modules.size;
  const data = qr.modules.data;
  const modules: boolean[][] = [];

  for (let r = 0; r < count; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < count; c++) {
      row.push(Boolean(data[r * count + c]));
    }
    modules.push(row);
  }
  return { modules, count };
}

function isFinderPattern(r: number, c: number, count: number): boolean {
  if (r < 7 && c < 7) return true;
  if (r < 7 && c >= count - 7) return true;
  if (r >= count - 7 && c < 7) return true;
  return false;
}

function isLogoCenterZone(
  r: number,
  c: number,
  count: number,
  hasLogo: boolean,
  removeBg: boolean,
  logoScale = 0.22
): boolean {
  if (!hasLogo || !removeBg) return false;
  const holeModules = Math.ceil(count * logoScale);
  const start = Math.floor((count - holeModules) / 2);
  const end = start + holeModules;
  return r >= start && r < end && c >= start && c < end;
}

// --- SVG PATH GENERATORS FOR BODY MODULES ---
function getModuleSvgPath(r: number, c: number, x: number, y: number, s: number, style: DotStyle): string {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const rad = s / 2;

  switch (style) {
    case 'dots':
      return `<circle cx="${cx}" cy="${cy}" r="${rad * 0.9}" />`;

    case 'rounded':
      return `<rect x="${x + s * 0.05}" y="${y + s * 0.05}" width="${s * 0.9}" height="${s * 0.9}" rx="${s * 0.28}" />`;

    case 'extra-rounded':
      return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.45}" />`;

    case 'classy': {
      const r1 = s * 0.45;
      return `<path d="M ${x + r1} ${y} H ${x + s} V ${y + s - r1} Q ${x + s} ${y + s} ${x + s - r1} ${y + s} H ${x} V ${y + r1} Q ${x} ${y} ${x + r1} ${y} Z" />`;
    }

    case 'diamond':
      return `<polygon points="${cx},${y} ${x + s},${cy} ${cx},${y + s} ${x},${cy}" />`;

    case 'star': {
      const outer = s * 0.52;
      const inner = s * 0.22;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const rDist = i % 2 === 0 ? outer : inner;
        pts.push(`${(cx + Math.cos(angle) * rDist).toFixed(2)},${(cy + Math.sin(angle) * rDist).toFixed(2)}`);
      }
      return `<polygon points="${pts.join(' ')}" />`;
    }

    case 'heart': {
      const w = s * 0.95;
      const hx = x + (s - w) / 2;
      const hy = y + (s - w) / 2;
      return `<path d="M ${hx + w / 2} ${hy + w * 0.88} C ${hx + w * 0.1} ${hy + w * 0.6}, ${hx} ${hy + w * 0.25}, ${hx + w * 0.25} ${hy + w * 0.1} C ${hx + w * 0.4} ${hy}, ${hx + w / 2} ${hy + w * 0.15}, ${hx + w / 2} ${hy + w * 0.25} C ${hx + w / 2} ${hy + w * 0.15}, ${hx + w * 0.6} ${hy}, ${hx + w * 0.75} ${hy + w * 0.1} C ${hx + w} ${hy + w * 0.25}, ${hx + w * 0.9} ${hy + w * 0.6}, ${hx + w / 2} ${hy + w * 0.88} Z" />`;
    }

    case 'cross': {
      const t = s * 0.36;
      const off = (s - t) / 2;
      return `<path d="M ${x + off} ${y} H ${x + off + t} V ${y + off} H ${x + s} V ${y + off + t} H ${x + off + t} V ${y + s} H ${x + off} V ${y + off + t} H ${x} V ${y + off} H ${x + off} Z" />`;
    }

    case 'vertical-bars':
      return `<rect x="${x + s * 0.14}" y="${y}" width="${s * 0.72}" height="${s}" rx="${s * 0.36}" />`;

    case 'horizontal-bars':
      return `<rect x="${x}" y="${y + s * 0.14}" width="${s}" height="${s * 0.72}" rx="${s * 0.36}" />`;

    case 'square':
    default:
      return `<rect x="${x}" y="${y}" width="${s + 0.3}" height="${s + 0.3}" />`;
  }
}

// --- SVG GENERATORS FOR OUTER EYE BORDER (7x7) & INNER CENTER (3x3) ---
function getFinderEyeSvg(
  fx: number,
  fy: number,
  cellSize: number,
  borderShape: FinderShape,
  centerShape: FinderCenterShape,
  borderColor: string,
  centerColor: string
): string {
  const outerSize = cellSize * 7;
  const strokeW = cellSize;
  const halfStroke = strokeW / 2;
  const bx = fx + halfStroke;
  const by = fy + halfStroke;
  const bw = outerSize - strokeW;

  let borderSvg = '';

  switch (borderShape) {
    case 'circle':
      borderSvg = `<circle cx="${fx + outerSize / 2}" cy="${fy + outerSize / 2}" r="${bw / 2}" fill="none" stroke="${borderColor}" stroke-width="${strokeW}" />`;
      break;

    case 'rounded':
      borderSvg = `<rect x="${bx}" y="${by}" width="${bw}" height="${bw}" rx="${cellSize * 1.8}" fill="none" stroke="${borderColor}" stroke-width="${strokeW}" />`;
      break;

    case 'leaf-tl':
    case 'leaf-tr':
    case 'leaf-bl':
    case 'leaf-br': {
      const rBig = cellSize * 2.2;
      const rSmall = cellSize * 0.4;
      const tl = borderShape === 'leaf-tl' ? rSmall : rBig;
      const tr = borderShape === 'leaf-tr' ? rSmall : rBig;
      const br = borderShape === 'leaf-br' ? rSmall : rBig;
      const bl = borderShape === 'leaf-bl' ? rSmall : rBig;
      borderSvg = `<path d="M ${bx + tl} ${by} H ${bx + bw - tr} Q ${bx + bw} ${by} ${bx + bw} ${by + tr} V ${by + bw - br} Q ${bx + bw} ${by + bw} ${bx + bw - br} ${by + bw} H ${bx + bl} Q ${bx} ${by + bw} ${bx} ${by + bw - bl} V ${by + tl} Q ${bx} ${by} ${bx + tl} ${by} Z" fill="none" stroke="${borderColor}" stroke-width="${strokeW}" />`;
      break;
    }

    case 'cut': {
      const c = cellSize * 1.3;
      borderSvg = `<polygon points="${bx + c},${by} ${bx + bw - c},${by} ${bx + bw},${by + c} ${bx + bw},${by + bw - c} ${bx + bw - c},${by + bw} ${bx + c},${by + bw} ${bx},${by + bw - c} ${bx},${by + c}" fill="none" stroke="${borderColor}" stroke-width="${strokeW}" stroke-linejoin="bevel" />`;
      break;
    }

    case 'dotted':
      borderSvg = `<rect x="${bx}" y="${by}" width="${bw}" height="${bw}" rx="${cellSize * 0.8}" fill="none" stroke="${borderColor}" stroke-width="${strokeW * 0.85}" stroke-dasharray="${cellSize * 0.75} ${cellSize * 0.45}" stroke-linecap="round" />`;
      break;

    case 'square':
    default:
      borderSvg = `<rect x="${bx}" y="${by}" width="${bw}" height="${bw}" fill="none" stroke="${borderColor}" stroke-width="${strokeW}" />`;
      break;
  }

  // Inner 3x3 Center
  const ix = fx + cellSize * 2;
  const iy = fy + cellSize * 2;
  const is = cellSize * 3;
  const icx = ix + is / 2;
  const icy = iy + is / 2;

  let centerSvg = '';
  switch (centerShape) {
    case 'circle':
      centerSvg = `<circle cx="${icx}" cy="${icy}" r="${is / 2}" fill="${centerColor}" />`;
      break;

    case 'rounded':
      centerSvg = `<rect x="${ix}" y="${iy}" width="${is}" height="${is}" rx="${cellSize * 0.85}" fill="${centerColor}" />`;
      break;

    case 'diamond':
      centerSvg = `<polygon points="${icx},${iy} ${ix + is},${icy} ${icx},${iy + is} ${ix},${icy}" fill="${centerColor}" />`;
      break;

    case 'star': {
      const outer = is * 0.54;
      const inner = is * 0.24;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const dist = i % 2 === 0 ? outer : inner;
        pts.push(`${(icx + Math.cos(angle) * dist).toFixed(2)},${(icy + Math.sin(angle) * dist).toFixed(2)}`);
      }
      centerSvg = `<polygon points="${pts.join(' ')}" fill="${centerColor}" />`;
      break;
    }

    case 'cross': {
      const t = is * 0.38;
      const off = (is - t) / 2;
      centerSvg = `<path d="M ${ix + off} ${iy} H ${ix + off + t} V ${iy + off} H ${ix + is} V ${iy + off + t} H ${ix + off + t} V ${iy + is} H ${ix + off} V ${iy + off + t} H ${ix} V ${iy + off} H ${ix + off} Z" fill="${centerColor}" />`;
      break;
    }

    case 'leaf': {
      const r = is * 0.48;
      centerSvg = `<path d="M ${ix + r} ${iy} H ${ix + is} V ${iy + is - r} Q ${ix + is} ${iy + is} ${ix + is - r} ${iy + is} H ${ix} V ${iy + r} Q ${ix} ${iy} ${ix + r} ${iy} Z" fill="${centerColor}" />`;
      break;
    }

    case 'sun': {
      const outer = is * 0.52;
      const inner = is * 0.38;
      const pts: string[] = [];
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI / 12) * i;
        const dist = i % 2 === 0 ? outer : inner;
        pts.push(`${(icx + Math.cos(angle) * dist).toFixed(2)},${(icy + Math.sin(angle) * dist).toFixed(2)}`);
      }
      centerSvg = `<polygon points="${pts.join(' ')}" fill="${centerColor}" />`;
      break;
    }

    case 'square':
    default:
      centerSvg = `<rect x="${ix}" y="${iy}" width="${is}" height="${is}" fill="${centerColor}" />`;
      break;
  }

  return `${borderSvg}${centerSvg}`;
}

// --- ILLUSTRATED FRAME WRAPPERS ---
function wrapWithFrameSvg(
  innerQrContent: string,
  qrSize: number,
  options: QROptions
): { svg: string; width: number; height: number } {
  const style = options.frameStyle || 'none';
  if (style === 'none') {
    return { svg: innerQrContent, width: qrSize, height: qrSize };
  }

  const frameColor = options.frameColor || options.fgColor || '#000000';
  const textColor = options.frameTextColor || '#FFFFFF';
  const bgColor = options.transparentBg ? '#FFFFFF' : options.bgColor || '#FFFFFF';
  const label = (options.frameText || 'SCAN ME!').replace(/[<>&"]/g, '');

  const pad = Math.round(qrSize * 0.08);
  const bannerH = Math.round(qrSize * 0.16);
  const topArtH = Math.round(qrSize * 0.18);
  const w = qrSize + pad * 2;
  const h = qrSize + pad * 2 + bannerH + (['clipboard', 'gift', 'bag', 'coffee', 'beer', 'chef', 'cloche', 'phone'].includes(style) ? topArtH : 0);
  const qrY = ['clipboard', 'gift', 'bag', 'coffee', 'beer', 'chef', 'cloche', 'phone'].includes(style) ? pad + topArtH : style === 'banner-top' || style === 'speech-top' ? pad + bannerH : pad;

  let decoration = '';

  switch (style) {
    case 'simple':
      decoration = `
        <rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="24" fill="${bgColor}" stroke="${frameColor}" stroke-width="10"/>
        <text x="${w / 2}" y="${h - bannerH / 2 - 4}" text-anchor="middle" dominant-baseline="middle" fill="${frameColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.42)}">${label}</text>
      `;
      break;

    case 'banner-bottom':
      decoration = `
        <rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="24" fill="${bgColor}" stroke="${frameColor}" stroke-width="10"/>
        <rect x="6" y="${h - bannerH - 6}" width="${w - 12}" height="${bannerH}" rx="18" fill="${frameColor}"/>
        <text x="${w / 2}" y="${h - bannerH / 2 - 4}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.42)}">${label}</text>
      `;
      break;

    case 'banner-top':
    case 'speech-top':
      decoration = `
        <rect x="6" y="${bannerH}" width="${w - 12}" height="${h - bannerH - 6}" rx="22" fill="${bgColor}" stroke="${frameColor}" stroke-width="10"/>
        <rect x="16" y="6" width="${w - 32}" height="${bannerH * 0.82}" rx="14" fill="${frameColor}"/>
        <polygon points="${w / 2 - 14},${bannerH * 0.82 + 4} ${w / 2 + 14},${bannerH * 0.82 + 4} ${w / 2},${bannerH + 8}" fill="${frameColor}"/>
        <text x="${w / 2}" y="${(bannerH * 0.82) / 2 + 8}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.38)}">${label}</text>
      `;
      break;

    case 'clipboard':
      decoration = `
        <rect x="8" y="${topArtH * 0.5}" width="${w - 16}" height="${h - topArtH * 0.5 - 8}" rx="22" fill="${bgColor}" stroke="${frameColor}" stroke-width="12"/>
        <rect x="${w * 0.3}" y="12" width="${w * 0.4}" height="${topArtH * 0.7}" rx="12" fill="${frameColor}"/>
        <circle cx="${w / 2}" cy="24" r="8" fill="${bgColor}"/>
        <rect x="8" y="${h - bannerH - 8}" width="${w - 16}" height="${bannerH}" rx="14" fill="${frameColor}"/>
        <text x="${w / 2}" y="${h - bannerH / 2 - 6}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.4)}">${label}</text>
      `;
      break;

    case 'gift':
      decoration = `
        <rect x="10" y="${topArtH}" width="${w - 20}" height="${h - topArtH - 10}" rx="18" fill="${bgColor}" stroke="${frameColor}" stroke-width="10"/>
        <path d="M ${w * 0.25} ${topArtH} C ${w * 0.2} 8, ${w * 0.45} 8, ${w / 2} ${topArtH} C ${w * 0.55} 8, ${w * 0.8} 8, ${w * 0.75} ${topArtH} Z" fill="none" stroke="${frameColor}" stroke-width="12" stroke-linecap="round"/>
        <rect x="10" y="${h - bannerH - 10}" width="${w - 20}" height="${bannerH}" fill="${frameColor}"/>
        <text x="${w / 2}" y="${h - bannerH / 2 - 8}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.4)}">${label}</text>
      `;
      break;

    case 'bag':
      decoration = `
        <path d="M ${w * 0.34} ${topArtH} V 20 Q ${w * 0.34} 8 ${w * 0.42} 8 H ${w * 0.58} Q ${w * 0.66} 8 ${w * 0.66} 20 V ${topArtH}" fill="none" stroke="${frameColor}" stroke-width="12" stroke-linecap="round"/>
        <rect x="10" y="${topArtH}" width="${w - 20}" height="${h - topArtH - 10}" rx="20" fill="${bgColor}" stroke="${frameColor}" stroke-width="10"/>
        <rect x="10" y="${h - bannerH - 10}" width="${w - 20}" height="${bannerH}" rx="14" fill="${frameColor}"/>
        <text x="${w / 2}" y="${h - bannerH / 2 - 8}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.4)}">${label}</text>
      `;
      break;

    case 'phone':
      decoration = `
        <rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="38" fill="${frameColor}"/>
        <rect x="${w * 0.38}" y="${topArtH * 0.45}" width="${w * 0.24}" height="8" rx="4" fill="${bgColor}" opacity="0.6"/>
        <rect x="24" y="${topArtH}" width="${w - 48}" height="${qrSize + pad}" rx="14" fill="${bgColor}"/>
        <text x="${w / 2}" y="${h - bannerH * 0.65}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.36)}">${label}</text>
        <circle cx="${w / 2}" cy="${h - 28}" r="12" fill="none" stroke="${bgColor}" stroke-width="4" opacity="0.8"/>
      `;
      break;

    case 'coffee':
    case 'beer':
      decoration = `
        <path d="M ${w - 18} ${qrY + qrSize * 0.2} H ${w - 4} Q ${w + 18} ${qrY + qrSize * 0.2} ${w + 18} ${qrY + qrSize * 0.45} Q ${w + 18} ${qrY + qrSize * 0.7} ${w - 4} ${qrY + qrSize * 0.7} H ${w - 18}" fill="none" stroke="${frameColor}" stroke-width="12"/>
        <path d="M ${w * 0.35} ${topArtH * 0.75} Q ${w * 0.32} ${topArtH * 0.4} ${w * 0.38} ${topArtH * 0.15} M ${w * 0.5} ${topArtH * 0.75} Q ${w * 0.47} ${topArtH * 0.4} ${w * 0.53} ${topArtH * 0.15} M ${w * 0.65} ${topArtH * 0.75} Q ${w * 0.62} ${topArtH * 0.4} ${w * 0.68} ${topArtH * 0.15}" fill="none" stroke="${frameColor}" stroke-width="7" stroke-linecap="round"/>
        <rect x="12" y="${topArtH}" width="${w - 24}" height="${h - topArtH - 12}" rx="26" fill="${bgColor}" stroke="${frameColor}" stroke-width="10"/>
        <rect x="12" y="${h - bannerH - 12}" width="${w - 24}" height="${bannerH}" rx="18" fill="${frameColor}"/>
        <text x="${w / 2}" y="${h - bannerH / 2 - 10}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.4)}">${label}</text>
      `;
      break;

    case 'chef':
    case 'cloche':
      decoration = `
        <path d="M ${w * 0.28} ${topArtH} C ${w * 0.18} ${topArtH * 0.4}, ${w * 0.32} 8, ${w * 0.5} 14 C ${w * 0.68} 8, ${w * 0.82} ${topArtH * 0.4}, ${w * 0.72} ${topArtH} Z" fill="${bgColor}" stroke="${frameColor}" stroke-width="10"/>
        <rect x="10" y="${topArtH}" width="${w - 20}" height="${h - topArtH - 10}" rx="20" fill="${bgColor}" stroke="${frameColor}" stroke-width="10"/>
        <rect x="10" y="${h - bannerH - 10}" width="${w - 20}" height="${bannerH}" rx="14" fill="${frameColor}"/>
        <text x="${w / 2}" y="${h - bannerH / 2 - 8}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.4)}">${label}</text>
      `;
      break;

    case 'receipt':
    case 'scooter':
    case 'envelope':
    default: {
      const zigZag: string[] = [];
      const steps = 14;
      const stepW = (w - 20) / steps;
      for (let i = 0; i <= steps; i++) {
        const zx = 10 + i * stepW;
        const zy = i % 2 === 0 ? h - 8 : h - 20;
        zigZag.push(`${zx.toFixed(1)},${zy.toFixed(1)}`);
      }
      decoration = `
        <polygon points="10,10 ${w - 10},10 ${w - 10},${h - 20} ${zigZag.reverse().join(' ')} 10,${h - 20}" fill="${bgColor}" stroke="${frameColor}" stroke-width="8" stroke-linejoin="round"/>
        <rect x="22" y="${h - bannerH - 22}" width="${w - 44}" height="${bannerH * 0.82}" rx="10" fill="${frameColor}"/>
        <text x="${w / 2}" y="${h - bannerH * 0.6 - 18}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="${Math.round(bannerH * 0.38)}">${label}</text>
      `;
      break;
    }
  }

  const wrappedSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      ${decoration}
      <g transform="translate(${pad}, ${qrY})">
        ${innerQrContent}
      </g>
    </svg>
  `.trim();

  return { svg: wrappedSvg, width: w, height: h };
}

// --- CORE SVG GENERATOR ---
// Replace generateQRSvg inside lib/qr-renderer.ts with this:
export async function generateQRSvg(options: QROptions): Promise<string> {
  const size = options.size || 400;
  const margin = options.margin ?? 2;
  const { modules, count } = getQRMatrix(options.text, options.errorCorrectionLevel || 'H');

  const totalModules = count + margin * 2;
  const cellSize = size / totalModules;
  const offset = margin * cellSize;
  const qrInnerSize = count * cellSize;

  const hasLogo = Boolean(options.logoUrl);
  const hasArtwork = Boolean(options.artworkUrl);
  const removeLogoBg = options.removeLogoBg ?? true;

  let defs = '';
  let fillRef = options.fgColor || '#000000';

  if (options.gradientType === 'linear' && options.gradientColor2) {
    defs += `<linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${options.fgColor}" />
      <stop offset="100%" stop-color="${options.gradientColor2}" />
    </linearGradient>`;
    fillRef = 'url(#qrGrad)';
  } else if (options.gradientType === 'radial' && options.gradientColor2) {
    defs += `<radialGradient id="qrGrad" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${options.fgColor}" />
      <stop offset="100%" stop-color="${options.gradientColor2}" />
    </radialGradient>`;
    fillRef = 'url(#qrGrad)';
  }

  // Clip path + shadow for crisp artwork and logo rendering
  defs += `
    <clipPath id="artClip">
      <rect x="${offset}" y="${offset}" width="${qrInnerSize}" height="${qrInnerSize}" rx="14" />
    </clipPath>
    <clipPath id="logoClip">
      <rect x="${(size - size * (options.logoSize || 0.22)) / 2}" y="${(size - size * (options.logoSize || 0.22)) / 2}" width="${size * (options.logoSize || 0.22)}" height="${size * (options.logoSize || 0.22)}" rx="${size * (options.logoSize || 0.22) * 0.22}" />
    </clipPath>
  `;

  const bgRect = options.transparentBg
    ? ''
    : `<rect width="${size}" height="${size}" rx="16" fill="${options.bgColor || '#FFFFFF'}" />`;

  // Richer, vibrant artwork layer + white module halo so QR stays 100% scannable
  const artOpacity = options.artworkOpacity ?? 0.85;
  const artworkLayer = options.artworkUrl
    ? `<g clip-path="url(#artClip)">
        <image href="${options.artworkUrl}" x="${offset}" y="${offset}" width="${qrInnerSize}" height="${qrInnerSize}" opacity="${artOpacity}" preserveAspectRatio="xMidYMid slice" />
      </g>`
    : '';

  const paths: string[] = [];
  const bgHalos: string[] = [];

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isFinderPattern(r, c, count)) continue;

      // Clear center zone if Logo OR Artwork is active so the center art/logo pops cleanly!
      if (isLogoCenterZone(r, c, count, hasLogo || hasArtwork, removeLogoBg, hasLogo ? (options.logoSize || 0.22) : 0.24)) {
        continue;
      }

      const x = offset + c * cellSize;
      const y = offset + r * cellSize;

      if (!modules[r][c]) {
        // When custom artwork is active, draw subtle light dots on empty cells for high scan contrast
        if (hasArtwork) {
          bgHalos.push(
            `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${cellSize * 0.28}" fill="#FFFFFF" opacity="0.72" />`
          );
        }
        continue;
      }

      if (hasArtwork) {
        bgHalos.push(
          `<rect x="${x - 0.8}" y="${y - 0.8}" width="${cellSize + 1.6}" height="${cellSize + 1.6}" rx="${cellSize * 0.3}" fill="#FFFFFF" opacity="0.85" />`
        );
      }

      paths.push(getModuleSvgPath(r, c, x, y, cellSize, options.dotStyle || 'square'));
    }
  }

  // White backing behind the 3 Finder Eyes when artwork is active
  const eyeBacking = hasArtwork
    ? [
        `<rect x="${offset - 3}" y="${offset - 3}" width="${cellSize * 7 + 6}" height="${cellSize * 7 + 6}" rx="10" fill="#FFFFFF" opacity="0.92" />`,
        `<rect x="${offset + (count - 7) * cellSize - 3}" y="${offset - 3}" width="${cellSize * 7 + 6}" height="${cellSize * 7 + 6}" rx="10" fill="#FFFFFF" opacity="0.92" />`,
        `<rect x="${offset - 3}" y="${offset + (count - 7) * cellSize - 3}" width="${cellSize * 7 + 6}" height="${cellSize * 7 + 6}" rx="10" fill="#FFFFFF" opacity="0.92" />`,
      ].join('')
    : '';

  const borderColor = options.eyeBorderColor || fillRef;
  const centerColor = options.eyeCenterColor || options.eyeBorderColor || fillRef;
  const centerShape =
    options.finderCenterShape ||
    (options.finderShape === 'circle' ? 'circle' : options.finderShape === 'rounded' ? 'rounded' : 'square');

  const eyes = [
    getFinderEyeSvg(offset, offset, cellSize, options.finderShape || 'square', centerShape, borderColor, centerColor),
    getFinderEyeSvg(offset + (count - 7) * cellSize, offset, cellSize, options.finderShape || 'square', centerShape, borderColor, centerColor),
    getFinderEyeSvg(offset, offset + (count - 7) * cellSize, cellSize, options.finderShape || 'square', centerShape, borderColor, centerColor),
  ].join('');

  // Upgraded Center Logo with crisp rounded badge & border ring
  let logoLayer = '';
  if (options.logoUrl) {
    const lSize = size * (options.logoSize || 0.22);
    const lx = (size - lSize) / 2;
    const ly = (size - lSize) / 2;
    const pad = 7;
    const rx = lSize * 0.22;

    const badge = removeLogoBg
      ? `<rect x="${lx - pad}" y="${ly - pad}" width="${lSize + pad * 2}" height="${lSize + pad * 2}" rx="${rx + 4}" fill="${options.bgColor || '#FFFFFF'}" stroke="${options.fgColor || '#000000'}" stroke-width="2.5" />`
      : '';

    logoLayer = `
      ${badge}
      <image href="${options.logoUrl}" x="${lx}" y="${ly}" width="${lSize}" height="${lSize}" clip-path="url(#logoClip)" preserveAspectRatio="xMidYMid meet" />
    `;
  }

  const innerContent = `
    <defs>${defs}</defs>
    ${bgRect}
    ${artworkLayer}
    ${bgHalos.join('')}
    ${eyeBacking}
    <g fill="${fillRef}">${paths.join('')}</g>
    ${eyes}
    ${logoLayer}
  `.trim();

  if (!options.frameStyle || options.frameStyle === 'none') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${innerContent}</svg>`;
  }

  return wrapWithFrameSvg(innerContent, size, options).svg;
}

// --- CANVAS RENDERER (Renders the exact SVG to HTML5 Canvas smoothly) ---
export async function drawQRToCanvas(canvas: HTMLCanvasElement, options: QROptions): Promise<void> {
  const svgString = await generateQRSvg(options);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width || options.size || 400;
      canvas.height = img.height || options.size || 400;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };

    img.src = url;
  });
}