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
  | 'chef'
  | 'cloche'
  | 'scooter'
  | 'envelope';

export interface QROptions {
  text: string;
  size: number;
  margin?: number;
  fgColor: string;
  bgColor: string;
  transparentBg?: boolean;
  gradientType?: GradientType;
  gradientColor2?: string;
  dotStyle: DotStyle;
  finderShape: FinderShape;
  finderCenterShape: FinderCenterShape;
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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isFinderZone(r: number, c: number, count: number): boolean {
  if (r < 7 && c < 7) return true;
  if (r < 7 && c >= count - 7) return true;
  if (r >= count - 7 && c < 7) return true;
  return false;
}

function renderDotPath(r: number, c: number, cell: number, offset: number, style: DotStyle): string {
  const x = offset + c * cell;
  const y = offset + r * cell;
  const cx = x + cell / 2;
  const cy = y + cell / 2;
  const s = cell;

  switch (style) {
    case 'dots': {
      const rad = (s * 0.44).toFixed(2);
      return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${rad}" />`;
    }
    case 'rounded':
      return `<rect x="${(x + s * 0.06).toFixed(2)}" y="${(y + s * 0.06).toFixed(2)}" width="${(s * 0.88).toFixed(2)}" height="${(s * 0.88).toFixed(2)}" rx="${(s * 0.25).toFixed(2)}" />`;
    case 'extra-rounded':
      return `<rect x="${(x + s * 0.04).toFixed(2)}" y="${(y + s * 0.04).toFixed(2)}" width="${(s * 0.92).toFixed(2)}" height="${(s * 0.92).toFixed(2)}" rx="${(s * 0.42).toFixed(2)}" />`;
    case 'classy': {
      const r1 = (s * 0.38).toFixed(2);
      return `<path d="M ${x + Number(r1)} ${y} H ${x + s} V ${y + s - Number(r1)} Q ${x + s} ${y + s} ${x + s - Number(r1)} ${y + s} H ${x} V ${y + Number(r1)} Q ${x} ${y} ${x + Number(r1)} ${y} Z" />`;
    }
    case 'diamond': {
      const p = s * 0.48;
      return `<polygon points="${cx},${cy - p} ${cx + p},${cy} ${cx},${cy + p} ${cx - p},${cy}" />`;
    }
    case 'star': {
      const outer = s * 0.5;
      const inner = s * 0.22;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        pts.push(`${(cx + Math.cos(angle) * rad).toFixed(2)},${(cy + Math.sin(angle) * rad).toFixed(2)}`);
      }
      return `<polygon points="${pts.join(' ')}" />`;
    }
    case 'heart': {
      const w = s * 0.46;
      return `<path d="M ${cx} ${cy + w * 0.85} C ${cx - w * 1.2} ${cy + w * 0.1}, ${cx - w * 1.1} ${cy - w * 0.85}, ${cx} ${cy - w * 0.25} C ${cx + w * 1.1} ${cy - w * 0.85}, ${cx + w * 1.2} ${cy + w * 0.1}, ${cx} ${cy + w * 0.85} Z" />`;
    }
    case 'cross': {
      const t = s * 0.34;
      const l = s * 0.9;
      return `<path d="M ${cx - t / 2} ${cy - l / 2} H ${cx + t / 2} V ${cy - t / 2} H ${cx + l / 2} V ${cy + t / 2} H ${cx + t / 2} V ${cy + l / 2} H ${cx - t / 2} V ${cy + t / 2} H ${cx - l / 2} V ${cy - t / 2} H ${cx - t / 2} Z" />`;
    }
    case 'vertical-bars':
      return `<rect x="${(x + s * 0.14).toFixed(2)}" y="${y.toFixed(2)}" width="${(s * 0.72).toFixed(2)}" height="${(s * 1.02).toFixed(2)}" rx="${(s * 0.25).toFixed(2)}" />`;
    case 'horizontal-bars':
      return `<rect x="${x.toFixed(2)}" y="${(y + s * 0.14).toFixed(2)}" width="${(s * 1.02).toFixed(2)}" height="${(s * 0.72).toFixed(2)}" rx="${(s * 0.25).toFixed(2)}" />`;
    case 'square':
    default:
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(s + 0.35).toFixed(2)}" height="${(s + 0.35).toFixed(2)}" />`;
  }
}

function renderFinderEye(
  row: number,
  col: number,
  cell: number,
  offset: number,
  borderShape: FinderShape,
  centerShape: FinderCenterShape,
  borderFill: string,
  centerFill: string
): string {
  const x = offset + col * cell;
  const y = offset + row * cell;
  const outer = 7 * cell;
  const strokeW = cell;
  const box = 6 * cell;
  const bx = x + cell / 2;
  const by = y + cell / 2;

  let borderSvg = '';
  switch (borderShape) {
    case 'circle':
      borderSvg = `<circle cx="${x + outer / 2}" cy="${y + outer / 2}" r="${box / 2}" fill="none" stroke="${borderFill}" stroke-width="${strokeW}" />`;
      break;
    case 'rounded':
      borderSvg = `<rect x="${bx}" y="${by}" width="${box}" height="${box}" rx="${cell * 1.6}" fill="none" stroke="${borderFill}" stroke-width="${strokeW}" />`;
      break;
    case 'leaf-tl':
      borderSvg = `<path d="M ${bx} ${by} H ${bx + box - cell * 1.8} Q ${bx + box} ${by} ${bx + box} ${by + cell * 1.8} V ${by + box} H ${bx + cell * 1.8} Q ${bx} ${by + box} ${bx} ${by + box - cell * 1.8} Z" fill="none" stroke="${borderFill}" stroke-width="${strokeW}" />`;
      break;
    case 'leaf-tr':
      borderSvg = `<path d="M ${bx + cell * 1.8} ${by} H ${bx + box} V ${by + box - cell * 1.8} Q ${bx + box} ${by + box} ${bx + box - cell * 1.8} ${by + box} H ${bx} V ${by + cell * 1.8} Q ${bx} ${by} ${bx + cell * 1.8} ${by} Z" fill="none" stroke="${borderFill}" stroke-width="${strokeW}" />`;
      break;
    case 'leaf-bl':
      borderSvg = `<path d="M ${bx + cell * 1.8} ${by} H ${bx + box - cell * 1.8} Q ${bx + box} ${by} ${bx + box} ${by + cell * 1.8} V ${by + box - cell * 1.8} Q ${bx + box} ${by + box} ${bx + box - cell * 1.8} ${by + box} H ${bx} V ${by + cell * 1.8} Q ${bx} ${by} ${bx + cell * 1.8} ${by} Z" fill="none" stroke="${borderFill}" stroke-width="${strokeW}" />`;
      break;
    case 'leaf-br':
      borderSvg = `<path d="M ${bx + cell * 1.8} ${by} H ${bx + box - cell * 1.8} Q ${bx + box} ${by} ${bx + box} ${by + cell * 1.8} V ${by + box} H ${bx + cell * 1.8} Q ${bx} ${by + box} ${bx} ${by + box - cell * 1.8} V ${by + cell * 1.8} Q ${bx} ${by} ${bx + cell * 1.8} ${by} Z" fill="none" stroke="${borderFill}" stroke-width="${strokeW}" />`;
      break;
    case 'cut': {
      const c = cell * 1.3;
      borderSvg = `<polygon points="${bx + c},${by} ${bx + box - c},${by} ${bx + box},${by + c} ${bx + box},${by + box - c} ${bx + box - c},${by + box} ${bx + c},${by + box} ${bx},${by + box - c} ${bx},${by + c}" fill="none" stroke="${borderFill}" stroke-width="${strokeW}" />`;
      break;
    }
    case 'dotted':
      borderSvg = `<rect x="${bx}" y="${by}" width="${box}" height="${box}" rx="${cell * 1.1}" fill="none" stroke="${borderFill}" stroke-width="${strokeW}" stroke-dasharray="${cell * 0.95} ${cell * 0.45}" />`;
      break;
    case 'square':
    default:
      borderSvg = `<rect x="${bx}" y="${by}" width="${box}" height="${box}" fill="none" stroke="${borderFill}" stroke-width="${strokeW}" />`;
      break;
  }

  const cx = x + 3.5 * cell;
  const cy = y + 3.5 * cell;
  const cs = 3 * cell;
  const cLeft = x + 2 * cell;
  const cTop = y + 2 * cell;

  let centerSvg = '';
  switch (centerShape) {
    case 'circle':
      centerSvg = `<circle cx="${cx}" cy="${cy}" r="${cs / 2}" fill="${centerFill}" />`;
      break;
    case 'rounded':
      centerSvg = `<rect x="${cLeft}" y="${cTop}" width="${cs}" height="${cs}" rx="${cell * 0.75}" fill="${centerFill}" />`;
      break;
    case 'diamond': {
      const r = cs * 0.56;
      centerSvg = `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${centerFill}" />`;
      break;
    }
    case 'star': {
      const outerR = cs * 0.58;
      const innerR = cs * 0.25;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? outerR : innerR;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`);
      }
      centerSvg = `<polygon points="${pts.join(' ')}" fill="${centerFill}" />`;
      break;
    }
    case 'cross': {
      const t = cell * 1.1;
      centerSvg = `<path d="M ${cx - t / 2} ${cTop} H ${cx + t / 2} V ${cy - t / 2} H ${cLeft + cs} V ${cy + t / 2} H ${cx + t / 2} V ${cTop + cs} H ${cx - t / 2} V ${cy + t / 2} H ${cLeft} V ${cy - t / 2} H ${cx - t / 2} Z" fill="${centerFill}" />`;
      break;
    }
    case 'leaf':
      centerSvg = `<path d="M ${cLeft} ${cTop} H ${cLeft + cs - cell} Q ${cLeft + cs} ${cTop} ${cLeft + cs} ${cTop + cell} V ${cTop + cs} H ${cLeft + cell} Q ${cLeft} ${cTop + cs} ${cLeft} ${cTop + cs - cell} Z" fill="${centerFill}" />`;
      break;
    case 'sun': {
      const outerR = cs * 0.55;
      const innerR = cs * 0.36;
      const pts: string[] = [];
      for (let i = 0; i < 16; i++) {
        const rad = i % 2 === 0 ? outerR : innerR;
        const a = (Math.PI / 8) * i;
        pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)},${(cy + Math.sin(a) * rad).toFixed(2)}`);
      }
      centerSvg = `<polygon points="${pts.join(' ')}" fill="${centerFill}" />`;
      break;
    }
    case 'square':
    default:
      centerSvg = `<rect x="${cLeft}" y="${cTop}" width="${cs}" height="${cs}" fill="${centerFill}" />`;
      break;
  }

  return `${borderSvg}${centerSvg}`;
}

export async function generateQRSvg(options: QROptions): Promise<string> {
  const {
    text,
    margin = 2,
    fgColor = '#000000',
    bgColor = '#FFFFFF',
    transparentBg = false,
    gradientType = 'none',
    gradientColor2 = '#4f46e5',
    dotStyle = 'square',
    finderShape = 'square',
    finderCenterShape = 'square',
    eyeBorderColor,
    eyeCenterColor,
    logoUrl,
    logoSize = 0.2,
    removeLogoBg = true,
    frameStyle = 'none',
    frameText = 'Scan me!',
    frameColor = '#000000',
    frameTextColor = '#FFFFFF',
    errorCorrectionLevel = 'H',
    artworkUrl,
    artworkOpacity = 0.28,
  } = options;

  const qr = QRCode.create(text || 'https://qrgenerato.com', {
    errorCorrectionLevel,
  });

  const count = qr.modules.size;
  const qrBoxSize = 320;
  const cell = qrBoxSize / (count + margin * 2);
  const offset = margin * cell;

  const defs: string[] = [];
  let mainFill = fgColor;

  if (gradientType === 'linear') {
    defs.push(
      `<linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${fgColor}" />
        <stop offset="100%" stop-color="${gradientColor2}" />
      </linearGradient>`
    );
    mainFill = 'url(#qrGrad)';
  } else if (gradientType === 'radial') {
    defs.push(
      `<radialGradient id="qrGrad" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="${fgColor}" />
        <stop offset="100%" stop-color="${gradientColor2}" />
      </radialGradient>`
    );
    mainFill = 'url(#qrGrad)';
  }

  // Calculate Logo Cutout Zone
  const logoPixelSize = logoUrl ? qrBoxSize * logoSize : 0;
  const logoMin = (qrBoxSize - logoPixelSize) / 2 - (removeLogoBg ? cell * 0.9 : 0);
  const logoMax = (qrBoxSize + logoPixelSize) / 2 + (removeLogoBg ? cell * 0.9 : 0);

  const dots: string[] = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (!qr.modules.get(r, c)) continue;
      if (isFinderZone(r, c, count)) continue;

      const cx = offset + (c + 0.5) * cell;
      const cy = offset + (r + 0.5) * cell;

      if (logoUrl && removeLogoBg && cx >= logoMin && cx <= logoMax && cy >= logoMin && cy <= logoMax) {
        continue;
      }

      dots.push(renderDotPath(r, c, cell, offset, dotStyle));
    }
  }

  const bFill = eyeBorderColor || mainFill;
  const cFill = eyeCenterColor || mainFill;

  const eyes = [
    renderFinderEye(0, 0, cell, offset, finderShape, finderCenterShape, bFill, cFill),
    renderFinderEye(0, count - 7, cell, offset, finderShape, finderCenterShape, bFill, cFill),
    renderFinderEye(count - 7, 0, cell, offset, finderShape, finderCenterShape, bFill, cFill),
  ].join('');

  let logoSvg = '';
  if (logoUrl) {
    const lx = (qrBoxSize - logoPixelSize) / 2;
    const ly = (qrBoxSize - logoPixelSize) / 2;
    const pad = cell * 0.85;
    if (removeLogoBg) {
      logoSvg += `<rect x="${lx - pad}" y="${ly - pad}" width="${logoPixelSize + pad * 2}" height="${logoPixelSize + pad * 2}" rx="${logoPixelSize * 0.24}" fill="${transparentBg ? '#FFFFFF' : bgColor}" stroke="${fgColor}" stroke-opacity="0.12" stroke-width="2" />`;
    }
    logoSvg += `<image href="${logoUrl}" x="${lx}" y="${ly}" width="${logoPixelSize}" height="${logoPixelSize}" preserveAspectRatio="xMidYMid meet" />`;
  }

  const artLayer = artworkUrl
    ? `<image href="${artworkUrl}" x="${offset}" y="${offset}" width="${qrBoxSize - offset * 2}" height="${qrBoxSize - offset * 2}" opacity="${artworkOpacity}" preserveAspectRatio="xMidYMid slice" />`
    : '';

  const qrBgRect = !transparentBg
    ? `<rect x="0" y="0" width="${qrBoxSize}" height="${qrBoxSize}" rx="18" fill="${bgColor}" />`
    : '';

  const coreQrGroup = `
    ${qrBgRect}
    ${artLayer}
    <g fill="${mainFill}">${dots.join('')}</g>
    ${eyes}
    ${logoSvg}
  `;

  const safeLabel = escapeXml(frameText || 'Scan me!');

  // --- DISTINCT FRAME ILLUSTRATIONS ---
  if (frameStyle === 'none') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qrBoxSize} ${qrBoxSize}" width="${options.size}" height="${options.size}">
      <defs>${defs.join('')}</defs>
      ${coreQrGroup}
    </svg>`;
  }

  // All 15 distinct frames rendered inside a 420x500 viewBox
  const W = 420;
  const H = 500;
  const qx = 50;
  let qy = 65;

  let frameBack = '';
  let frameFront = '';

  switch (frameStyle) {
    case 'simple':
      qy = 50;
      frameBack = `
        <rect x="30" y="30" width="360" height="440" rx="28" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" />
        <rect x="30" y="395" width="360" height="75" rx="20" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="442" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="24">${safeLabel}</text>`;
      break;

    case 'banner-bottom':
      qy = 42;
      frameBack = `
        <rect x="34" y="26" width="352" height="352" rx="26" fill="${bgColor}" stroke="${frameColor}" stroke-width="8" />
        <path d="M 20 404 L 400 404 L 385 434 L 400 464 L 20 464 L 35 434 Z" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="442" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="23">${safeLabel}</text>`;
      break;

    case 'banner-top':
      qy = 112;
      frameBack = `
        <path d="M 25 28 H 395 A 16 16 0 0 1 411 44 V 78 A 16 16 0 0 1 395 94 H 230 L 210 112 L 190 94 H 25 A 16 16 0 0 1 9 78 V 44 A 16 16 0 0 1 25 28 Z" fill="${frameColor}" />
        <rect x="34" y="96" width="352" height="352" rx="26" fill="${bgColor}" stroke="${frameColor}" stroke-width="8" />
      `;
      frameFront = `<text x="210" y="69" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="23">${safeLabel}</text>`;
      break;

    case 'speech-top':
      qy = 116;
      frameBack = `
        <rect x="40" y="24" width="340" height="66" rx="33" fill="${frameColor}" />
        <polygon points="190,88 230,88 210,112" fill="${frameColor}" />
        <rect x="34" y="100" width="352" height="352" rx="30" fill="${bgColor}" stroke="${frameColor}" stroke-width="8" />
      `;
      frameFront = `<text x="210" y="65" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="22">${safeLabel}</text>`;
      break;

    case 'clipboard':
      qy = 76;
      frameBack = `
        <rect x="28" y="48" width="364" height="428" rx="26" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" />
        <rect x="135" y="18" width="150" height="46" rx="14" fill="${frameColor}" />
        <circle cx="210" cy="34" r="8" fill="${bgColor}" />
        <rect x="52" y="408" width="316" height="48" rx="12" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="439" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;

    case 'receipt':
      qy = 52;
      frameBack = `
        <path d="M 32 22 L 54 36 L 76 22 L 98 36 L 120 22 L 142 36 L 164 22 L 186 36 L 208 22 L 230 36 L 252 22 L 274 36 L 296 22 L 318 36 L 340 22 L 362 36 L 388 22 V 474 L 362 460 L 340 474 L 318 460 L 296 474 L 274 460 L 252 474 L 230 460 L 208 474 L 186 460 L 164 474 L 142 460 L 120 474 L 98 460 L 76 474 L 54 460 L 32 474 Z" fill="${bgColor}" stroke="${frameColor}" stroke-width="7" stroke-linejoin="round" />
        <line x1="56" y1="388" x2="364" y2="388" stroke="${frameColor}" stroke-width="3" stroke-dasharray="8 6" />
        <rect x="56" y="402" width="308" height="44" rx="8" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="431" text-anchor="middle" fill="${frameTextColor}" font-family="monospace, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;

    case 'gift':
      qy = 82;
      frameBack = `
        <path d="M 210 64 C 165 14, 105 24, 135 64 C 160 64, 190 64, 210 64 Z" fill="none" stroke="${frameColor}" stroke-width="10" />
        <path d="M 210 64 C 255 14, 315 24, 285 64 C 260 64, 230 64, 210 64 Z" fill="none" stroke="${frameColor}" stroke-width="10" />
        <rect x="24" y="56" width="372" height="32" rx="10" fill="${frameColor}" />
        <rect x="34" y="82" width="352" height="390" rx="22" fill="${bgColor}" stroke="${frameColor}" stroke-width="9" />
        <rect x="48" y="410" width="324" height="46" rx="12" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="440" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;

    case 'phone':
      qy = 68;
      frameBack = `
        <rect x="28" y="16" width="364" height="468" rx="44" fill="${bgColor}" stroke="${frameColor}" stroke-width="12" />
        <rect x="160" y="34" width="100" height="12" rx="6" fill="${frameColor}" />
        <rect x="52" y="400" width="316" height="50" rx="16" fill="${frameColor}" />
        <line x1="155" y1="468" x2="265" y2="468" stroke="${frameColor}" stroke-width="6" stroke-linecap="round" />
      `;
      frameFront = `<text x="210" y="432" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;

    case 'bag':
      qy = 78;
      frameBack = `
        <path d="M 145 66 V 42 A 65 42 0 0 1 275 42 V 66" fill="none" stroke="${frameColor}" stroke-width="12" stroke-linecap="round" />
        <path d="M 40 66 H 380 L 396 472 A 16 16 0 0 1 380 488 H 40 A 16 16 0 0 1 24 472 Z" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" stroke-linejoin="round" />
        <circle cx="145" cy="84" r="7" fill="${frameColor}" />
        <circle cx="275" cy="84" r="7" fill="${frameColor}" />
        <rect x="54" y="412" width="312" height="50" rx="14" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="444" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="22">${safeLabel}</text>`;
      break;

    case 'coffee':
      // Coffee Cup with Steam Waves, Cup Handle, and Saucer Base
      qy = 64;
      frameBack = `
        <path d="M 155 44 Q 145 26 160 14 M 210 44 Q 200 26 215 14 M 265 44 Q 255 26 270 14" fill="none" stroke="${frameColor}" stroke-width="6" stroke-linecap="round" />
        <path d="M 366 120 H 388 A 24 24 0 0 1 412 144 V 230 A 24 24 0 0 1 388 254 H 366" fill="none" stroke="${frameColor}" stroke-width="12" />
        <path d="M 34 54 H 374 V 380 A 56 56 0 0 1 318 436 H 90 A 56 56 0 0 1 34 380 Z" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" />
        <rect x="16" y="444" width="376" height="42" rx="21" fill="${frameColor}" />
      `;
      frameFront = `<text x="204" y="472" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;

    case 'beer':
      // Frothy Beer Stein Mug with Fluffy Foam Cloud Top & Sturdy Handle
      qy = 78;
      frameBack = `
        <path d="M 368 140 H 394 A 20 20 0 0 1 414 160 V 290 A 20 20 0 0 1 394 310 H 368" fill="none" stroke="${frameColor}" stroke-width="14" stroke-linejoin="round" />
        <rect x="34" y="64" width="340" height="414" rx="22" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" />
        <path d="M 30 72 C 20 42, 65 20, 95 42 C 115 14, 175 14, 195 40 C 220 12, 280 14, 300 42 C 330 20, 382 38, 376 72 Z" fill="${bgColor}" stroke="${frameColor}" stroke-width="9" stroke-linejoin="round" />
        <rect x="52" y="408" width="304" height="48" rx="12" fill="${frameColor}" />
      `;
      frameFront = `<text x="204" y="439" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;

    case 'chef':
      // Tall Puffy French Chef Toque Hat Crown + Menu Board
      qy = 86;
      frameBack = `
        <path d="M 95 78 C 55 68, 65 22, 115 30 C 135 6, 185 4, 210 24 C 235 4, 285 6, 305 30 C 355 22, 365 68, 325 78 Z" fill="${bgColor}" stroke="${frameColor}" stroke-width="9" stroke-linejoin="round" />
        <rect x="85" y="68" width="250" height="18" rx="6" fill="${frameColor}" />
        <rect x="34" y="82" width="352" height="394" rx="24" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" />
        <rect x="54" y="410" width="312" height="46" rx="12" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="440" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;

    case 'cloche':
      // Silver Service Waiter Dome Cloche with Ring Knob Top & Serving Platter Base
      qy = 80;
      frameBack = `
        <circle cx="210" cy="22" r="13" fill="none" stroke="${frameColor}" stroke-width="8" />
        <path d="M 70 72 A 140 52 0 0 1 350 72 Z" fill="${frameColor}" />
        <rect x="34" y="72" width="352" height="346" rx="20" fill="${bgColor}" stroke="${frameColor}" stroke-width="9" />
        <path d="M 12 426 H 408 L 386 474 H 34 Z" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="458" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;

    case 'scooter':
      // Express Delivery Box with Speed Lines, Handlebars & Two Scooter Wheels
      qy = 44;
      frameBack = `
        <rect x="34" y="28" width="352" height="354" rx="26" fill="${bgColor}" stroke="${frameColor}" stroke-width="9" />
        <rect x="34" y="388" width="352" height="52" rx="16" fill="${frameColor}" />
        <circle cx="105" cy="462" r="24" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" />
        <circle cx="105" cy="462" r="8" fill="${frameColor}" />
        <circle cx="315" cy="462" r="24" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" />
        <circle cx="315" cy="462" r="8" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="421" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;

    case 'envelope':
      // Open Mail Envelope with V-Flap Header, Corner Mail Lines & Stamp Seal
      qy = 84;
      frameBack = `
        <polygon points="34,78 210,16 386,78" fill="${frameColor}" stroke="${frameColor}" stroke-width="8" stroke-linejoin="round" />
        <rect x="34" y="76" width="352" height="400" rx="20" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" />
        <path d="M 38 470 L 145 405 M 382 470 L 275 405" stroke="${frameColor}" stroke-width="5" stroke-opacity="0.35" />
        <rect x="56" y="410" width="308" height="48" rx="12" fill="${frameColor}" />
      `;
      frameFront = `<text x="210" y="441" text-anchor="middle" fill="${frameTextColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="21">${safeLabel}</text>`;
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${options.size}" height="${Math.round((options.size * H) / W)}">
    <defs>${defs.join('')}</defs>
    ${frameBack}
    <g transform="translate(${qx}, ${qy})">
      ${coreQrGroup}
    </g>
    ${frameFront}
  </svg>`;
}

export async function drawQRToCanvas(canvas: HTMLCanvasElement, options: QROptions): Promise<void> {
  const svgString = await generateQRSvg(options);
  const isFramed = options.frameStyle && options.frameStyle !== 'none';
  const width = options.size;
  const height = isFramed ? Math.round((options.size * 500) / 420) : options.size;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}