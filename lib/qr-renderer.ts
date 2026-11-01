// lib/qr-renderer.ts
import qrcode from 'qrcode';

export type DotStyle = 'square' | 'dots' | 'rounded';
export type FinderShape = 'square' | 'circle' | 'leaf';
export type GradientType = 'solid' | 'linear' | 'radial';
export type FrameStyle = 'none' | 'outline' | 'banner' | 'badge';

export interface QROptions {
  payload: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  fgColor: string;
  fgColor2: string;
  gradientType: GradientType;
  bgColor: string;
  margin: number;
  dotStyle: DotStyle;
  finderShape: FinderShape;
  finderOuterColor?: string;
  finderInnerColor?: string;
  frameStyle: FrameStyle;
  frameText: string;
  frameColor: string;
  imageMode: 'none' | 'fill' | 'center';
  imageElement?: HTMLImageElement | null;
  imageSrc?: string | null;
  brightness?: number;
  contrast?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  logoSize?: number;
}

function isFinderPattern(col: number, row: number, size: number) {
  return (col < 7 && row < 7) || (col >= size - 7 && row < 7) || (col < 7 && row >= size - 7);
}

export function getQRMatrix(payload: string, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H') {
  const qr = qrcode.create(payload || 'https://example.com', { errorCorrectionLevel });
  return { size: qr.modules.size, data: qr.modules.data };
}

function createGradientBrush(
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  options: QROptions
): string | CanvasGradient {
  if (options.gradientType === 'linear') {
    const grad = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    grad.addColorStop(0, options.fgColor);
    grad.addColorStop(1, options.fgColor2);
    return grad;
  } else if (options.gradientType === 'radial') {
    const center = canvasSize / 2;
    const grad = ctx.createRadialGradient(center, center, canvasSize * 0.05, center, center, canvasSize * 0.7);
    grad.addColorStop(0, options.fgColor);
    grad.addColorStop(1, options.fgColor2);
    return grad;
  }
  return options.fgColor;
}

function drawDataModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number,
  dotStyle: DotStyle
) {
  const radius = moduleSize / 2;
  if (dotStyle === 'square') {
    ctx.fillRect(x, y, moduleSize, moduleSize);
  } else if (dotStyle === 'dots') {
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius * 0.88, 0, 2 * Math.PI);
    ctx.fill();
  } else if (dotStyle === 'rounded') {
    ctx.beginPath();
    ctx.roundRect(x + 0.5, y + 0.5, moduleSize - 1, moduleSize - 1, moduleSize * 0.35);
    ctx.fill();
  }
}

function drawCustomFinderEye(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  moduleSize: number,
  shape: FinderShape,
  outerBrush: string | CanvasGradient,
  innerBrush: string | CanvasGradient
) {
  const outerSize = 7 * moduleSize;
  const innerOffset = 2 * moduleSize;
  const innerSize = 3 * moduleSize;

  ctx.save();
  ctx.strokeStyle = outerBrush;
  ctx.lineWidth = moduleSize;

  const strokeOffset = moduleSize / 2;
  const ringSize = 6 * moduleSize;
  const rx = startX + strokeOffset;
  const ry = startY + strokeOffset;

  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(startX + outerSize / 2, startY + outerSize / 2, ringSize / 2, 0, Math.PI * 2);
  } else if (shape === 'leaf') {
    ctx.roundRect(rx, ry, ringSize, ringSize, [moduleSize * 2.2, moduleSize * 0.5, moduleSize * 2.2, moduleSize * 0.5]);
  } else {
    ctx.roundRect(rx, ry, ringSize, ringSize, moduleSize * 0.2);
  }
  ctx.stroke();

  ctx.fillStyle = innerBrush;
  const ix = startX + innerOffset;
  const iy = startY + innerOffset;

  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(ix + innerSize / 2, iy + innerSize / 2, innerSize / 2, 0, Math.PI * 2);
  } else if (shape === 'leaf') {
    ctx.roundRect(ix, iy, innerSize, innerSize, [moduleSize * 1.2, moduleSize * 0.3, moduleSize * 1.2, moduleSize * 0.3]);
  } else {
    ctx.roundRect(ix, iy, innerSize, innerSize, moduleSize * 0.2);
  }
  ctx.fill();
  ctx.restore();
}

export async function drawQRToCanvas(
  canvas: HTMLCanvasElement,
  options: QROptions
): Promise<ImageData | null> {
  const { size, data } = getQRMatrix(options.payload, options.errorCorrectionLevel);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const moduleSize = 16;
  const marginPx = options.margin * moduleSize;
  const baseSize = size * moduleSize + marginPx * 2;

  const hasFrame = options.frameStyle !== 'none';
  const framePad = hasFrame ? 32 : 0;
  const bottomExtra = options.frameStyle === 'banner' ? 76 : options.frameStyle === 'badge' ? 68 : 0;

  const totalWidth = baseSize + framePad * 2;
  const totalHeight = baseSize + framePad * 2 + bottomExtra;

  canvas.width = totalWidth;
  canvas.height = totalHeight;

  // 1. Background & Decorative Frame
  if (options.frameStyle === 'banner') {
    ctx.fillStyle = options.frameColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, totalWidth, totalHeight, 32);
    ctx.fill();

    ctx.fillStyle = options.bgColor;
    ctx.beginPath();
    ctx.roundRect(14, 14, totalWidth - 28, baseSize + framePad * 2 - 20, 22);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      (options.frameText || 'SCAN ME').toUpperCase(),
      totalWidth / 2,
      baseSize + framePad * 2 + bottomExtra / 2 - 4
    );
  } else if (options.frameStyle === 'outline' || options.frameStyle === 'badge') {
    ctx.fillStyle = options.bgColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, totalWidth, totalHeight, 32);
    ctx.fill();

    ctx.strokeStyle = options.frameColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(12, 12, totalWidth - 24, totalHeight - 24, 24);
    ctx.stroke();

    if (options.frameStyle === 'badge') {
      const badgeW = Math.min(totalWidth - 80, 320);
      const badgeH = 46;
      const bx = (totalWidth - badgeW) / 2;
      const by = totalHeight - badgeH - 26;

      ctx.fillStyle = options.frameColor;
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeW, badgeH, 23);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((options.frameText || 'SCAN ME').toUpperCase(), totalWidth / 2, by + badgeH / 2);
    }
  } else {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, totalWidth, totalHeight);
  }

  // 2. Render Pure Inner QR Canvas (with its own solid background so jsQR scans accurately)
  const qrCanvas = document.createElement('canvas');
  qrCanvas.width = baseSize;
  qrCanvas.height = baseSize;
  const qrCtx = qrCanvas.getContext('2d')!;

  qrCtx.fillStyle = options.bgColor;
  qrCtx.fillRect(0, 0, baseSize, baseSize);

  const mainBrush = createGradientBrush(qrCtx, baseSize, options);
  const outerEyeBrush = options.finderOuterColor || mainBrush;
  const innerEyeBrush = options.finderInnerColor || mainBrush;

  if (options.imageMode === 'fill' && options.imageElement) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = baseSize;
    maskCanvas.height = baseSize;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.fillStyle = '#000000';

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (data[row * size + col] && !isFinderPattern(col, row, size)) {
          const x = col * moduleSize + marginPx;
          const y = row * moduleSize + marginPx;
          drawDataModule(maskCtx, x, y, moduleSize, options.dotStyle);
        }
      }
    }

    const imgCanvas = document.createElement('canvas');
    imgCanvas.width = baseSize;
    imgCanvas.height = baseSize;
    const imgCtx = imgCanvas.getContext('2d')!;

    const brightness = options.brightness ?? 95;
    const contrast = options.contrast ?? 125;
    const scale = options.scale ?? 1;
    const panX = ((options.offsetX ?? 0) / 100) * baseSize * 0.5;
    const panY = ((options.offsetY ?? 0) / 100) * baseSize * 0.5;

    imgCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    const imgAspect = options.imageElement.width / options.imageElement.height;
    let drawW = baseSize * scale;
    let drawH = baseSize * scale;
    if (imgAspect > 1) {
      drawW = drawH * imgAspect;
    } else {
      drawH = drawW / imgAspect;
    }
    const drawX = (baseSize - drawW) / 2 + panX;
    const drawY = (baseSize - drawH) / 2 + panY;

    imgCtx.drawImage(options.imageElement, drawX, drawY, drawW, drawH);
    imgCtx.filter = 'none';

    imgCtx.globalCompositeOperation = 'destination-in';
    imgCtx.drawImage(maskCanvas, 0, 0);

    qrCtx.drawImage(imgCanvas, 0, 0);
  } else {
    qrCtx.fillStyle = mainBrush;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (data[row * size + col] && !isFinderPattern(col, row, size)) {
          const x = col * moduleSize + marginPx;
          const y = row * moduleSize + marginPx;
          drawDataModule(qrCtx, x, y, moduleSize, options.dotStyle);
        }
      }
    }
  }

  // 3. Draw the 3 Custom Finder Eyes
  const finderCoords = [
    { col: 0, row: 0 },
    { col: size - 7, row: 0 },
    { col: 0, row: size - 7 },
  ];
  for (const pos of finderCoords) {
    drawCustomFinderEye(
      qrCtx,
      pos.col * moduleSize + marginPx,
      pos.row * moduleSize + marginPx,
      moduleSize,
      options.finderShape,
      outerEyeBrush,
      innerEyeBrush
    );
  }

  // 4. Center Logo Overlay
  if (options.imageMode === 'center' && options.imageElement) {
    const logoRatio = (options.logoSize ?? 22) / 100;
    const centerSize = baseSize * logoRatio;
    const centerPos = (baseSize - centerSize) / 2;

    qrCtx.fillStyle = options.bgColor;
    qrCtx.beginPath();
    qrCtx.roundRect(centerPos - 8, centerPos - 8, centerSize + 16, centerSize + 16, 16);
    qrCtx.fill();

    qrCtx.save();
    qrCtx.beginPath();
    qrCtx.roundRect(centerPos, centerPos, centerSize, centerSize, 12);
    qrCtx.clip();
    qrCtx.drawImage(options.imageElement, centerPos, centerPos, centerSize, centerSize);
    qrCtx.restore();
  }

  ctx.drawImage(qrCanvas, framePad, framePad);
  return qrCtx.getImageData(0, 0, baseSize, baseSize);
}

export function generateQRSvg(options: QROptions): string {
  const { size, data } = getQRMatrix(options.payload, options.errorCorrectionLevel);
  const moduleSize = 16;
  const marginPx = options.margin * moduleSize;
  const baseSize = size * moduleSize + marginPx * 2;
  const radius = moduleSize / 2;

  const hasFrame = options.frameStyle !== 'none';
  const framePad = hasFrame ? 32 : 0;
  const bottomExtra = options.frameStyle === 'banner' ? 76 : options.frameStyle === 'badge' ? 68 : 0;

  const totalWidth = baseSize + framePad * 2;
  const totalHeight = baseSize + framePad * 2 + bottomExtra;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="100%">`;
  svg += `<defs>`;

  if (options.gradientType === 'linear') {
    svg += `<linearGradient id="qr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${options.fgColor}" />
      <stop offset="100%" stop-color="${options.fgColor2}" />
    </linearGradient>`;
  } else if (options.gradientType === 'radial') {
    svg += `<radialGradient id="qr-grad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${options.fgColor}" />
      <stop offset="100%" stop-color="${options.fgColor2}" />
    </radialGradient>`;
  }

  const mainFill = options.gradientType === 'solid' ? options.fgColor : 'url(#qr-grad)';
  const outerEyeFill = options.finderOuterColor || mainFill;
  const innerEyeFill = options.finderInnerColor || mainFill;

  if (options.imageMode === 'fill' && options.imageSrc) {
    let maskElements = '';
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (data[row * size + col] && !isFinderPattern(col, row, size)) {
          const x = col * moduleSize + marginPx;
          const y = row * moduleSize + marginPx;
          if (options.dotStyle === 'dots') {
            maskElements += `<circle cx="${x + radius}" cy="${y + radius}" r="${radius * 0.88}" fill="white" />`;
          } else {
            maskElements += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${options.dotStyle === 'rounded' ? 5 : 0}" fill="white" />`;
          }
        }
      }
    }
    svg += `<mask id="qr-mask"><rect width="${baseSize}" height="${baseSize}" fill="black"/>${maskElements}</mask>`;
  }
  svg += `</defs>`;

  if (options.frameStyle === 'banner') {
    svg += `<rect width="${totalWidth}" height="${totalHeight}" rx="32" fill="${options.frameColor}" />`;
    svg += `<rect x="14" y="14" width="${totalWidth - 28}" height="${baseSize + framePad * 2 - 20}" rx="22" fill="${options.bgColor}" />`;
    svg += `<text x="${totalWidth / 2}" y="${baseSize + framePad * 2 + bottomExtra / 2}" fill="#ffffff" font-family="sans-serif" font-size="26" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${(options.frameText || 'SCAN ME').toUpperCase()}</text>`;
  } else if (options.frameStyle === 'outline' || options.frameStyle === 'badge') {
    svg += `<rect width="${totalWidth}" height="${totalHeight}" rx="32" fill="${options.bgColor}" />`;
    svg += `<rect x="12" y="12" width="${totalWidth - 24}" height="${totalHeight - 24}" rx="24" fill="none" stroke="${options.frameColor}" stroke-width="10" />`;
    if (options.frameStyle === 'badge') {
      const badgeW = Math.min(totalWidth - 80, 320);
      const badgeH = 46;
      const bx = (totalWidth - badgeW) / 2;
      const by = totalHeight - badgeH - 26;
      svg += `<rect x="${bx}" y="${by}" width="${badgeW}" height="${badgeH}" rx="23" fill="${options.frameColor}" />`;
      svg += `<text x="${totalWidth / 2}" y="${by + badgeH / 2 + 2}" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${(options.frameText || 'SCAN ME').toUpperCase()}</text>`;
    }
  } else {
    svg += `<rect width="${totalWidth}" height="${totalHeight}" fill="${options.bgColor}" />`;
  }

  svg += `<g transform="translate(${framePad}, ${framePad})">`;

  if (options.imageMode === 'fill' && options.imageSrc) {
    svg += `<image href="${options.imageSrc}" width="${baseSize}" height="${baseSize}" preserveAspectRatio="xMidYMid slice" mask="url(#qr-mask)" />`;
  } else {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (data[row * size + col] && !isFinderPattern(col, row, size)) {
          const x = col * moduleSize + marginPx;
          const y = row * moduleSize + marginPx;
          if (options.dotStyle === 'dots') {
            svg += `<circle cx="${x + radius}" cy="${y + radius}" r="${radius * 0.88}" fill="${mainFill}" />`;
          } else {
            svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${options.dotStyle === 'rounded' ? 5 : 0}" fill="${mainFill}" />`;
          }
        }
      }
    }
  }

  const finderCoords = [
    { col: 0, row: 0 },
    { col: size - 7, row: 0 },
    { col: 0, row: size - 7 },
  ];
  for (const pos of finderCoords) {
    const startX = pos.col * moduleSize + marginPx;
    const startY = pos.row * moduleSize + marginPx;
    const ringSize = 6 * moduleSize;
    const rx = startX + moduleSize / 2;
    const ry = startY + moduleSize / 2;
    const ix = startX + 2 * moduleSize;
    const iy = startY + 2 * moduleSize;
    const innerSize = 3 * moduleSize;

    if (options.finderShape === 'circle') {
      svg += `<circle cx="${startX + 3.5 * moduleSize}" cy="${startY + 3.5 * moduleSize}" r="${ringSize / 2}" fill="none" stroke="${outerEyeFill}" stroke-width="${moduleSize}" />`;
      svg += `<circle cx="${ix + innerSize / 2}" cy="${iy + innerSize / 2}" r="${innerSize / 2}" fill="${innerEyeFill}" />`;
    } else {
      const outerCorner = options.finderShape === 'leaf' ? moduleSize * 1.8 : moduleSize * 0.2;
      const innerCorner = options.finderShape === 'leaf' ? moduleSize * 0.9 : moduleSize * 0.2;
      svg += `<rect x="${rx}" y="${ry}" width="${ringSize}" height="${ringSize}" rx="${outerCorner}" fill="none" stroke="${outerEyeFill}" stroke-width="${moduleSize}" />`;
      svg += `<rect x="${ix}" y="${iy}" width="${innerSize}" height="${innerSize}" rx="${innerCorner}" fill="${innerEyeFill}" />`;
    }
  }

  if (options.imageMode === 'center' && options.imageSrc) {
    const logoRatio = (options.logoSize ?? 22) / 100;
    const centerSize = baseSize * logoRatio;
    const centerPos = (baseSize - centerSize) / 2;
    svg += `<rect x="${centerPos - 8}" y="${centerPos - 8}" width="${centerSize + 16}" height="${centerSize + 16}" rx="16" fill="${options.bgColor}" />`;
    svg += `<image href="${options.imageSrc}" x="${centerPos}" y="${centerPos}" width="${centerSize}" height="${centerSize}" preserveAspectRatio="xMidYMid slice" />`;
  }

  svg += `</g></svg>`;
  return svg;
}
