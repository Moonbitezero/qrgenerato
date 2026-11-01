// components/qr-studio.tsx
'use client';
import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import {
  Link as LinkIcon, Type, Mail, Wifi, Phone, MessageSquare, Share2, Contact,
  Download, Copy, Palette, Image as ImageIcon, Sparkles,
  Check, Trash2, Eye, Frame, IndianRupee, Calendar, MapPin,
  Smartphone, Printer, FileSpreadsheet, Camera, QrCode, Share, CheckCircle2,
  AlertTriangle, ClipboardCopy, Upload, Play, Square, Wand2, Maximize2, X
} from 'lucide-react';
import jsQR from 'jsqr';
import JSZip from 'jszip';
import {
  drawQRToCanvas,
  generateQRSvg,
  QROptions,
  DotStyle,
  FinderShape,
  GradientType,
  FrameStyle,
} from '@/lib/qr-renderer';
import { generatePayload, QRType, QRPayloadData } from '@/lib/qr-payload';
import clsx from 'clsx';

const PRESET_ARTWORKS = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    fg: '#4f46e5',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#312e81"/><stop offset="50%" stop-color="#701a75"/><stop offset="100%" stop-color="#9f1239"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="200" r="130" fill="#09090b" stroke="#0284c7" stroke-width="18"/><path d="M70 200 L330 200 M200 70 L200 330" stroke="#e11d48" stroke-width="16"/><circle cx="200" cy="200" r="55" fill="#6d28d9"/></svg>`,
  },
  {
    id: 'sunset',
    name: 'Crimson Torii',
    fg: '#9f1239',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4c0519"/><stop offset="60%" stop-color="#9f1239"/><stop offset="100%" stop-color="#9a3412"/></linearGradient></defs><rect width="400" height="400" fill="url(#s)"/><circle cx="200" cy="180" r="95" fill="#450a0a"/><path d="M0 280 Q200 220 400 280 L400 400 L0 400 Z" fill="#09090b"/><rect x="110" y="130" width="180" height="22" fill="#09090b"/><rect x="140" y="150" width="20" height="150" fill="#09090b"/><rect x="240" y="150" width="20" height="150" fill="#09090b"/></svg>`,
  },
  {
    id: 'anime',
    name: 'Anime Pop Star',
    fg: '#1e1b4b',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#2e1065"/><polygon points="200,20 245,140 375,140 270,215 310,345 200,265 90,345 130,215 25,140 155,140" fill="#9d174d" stroke="#09090b" stroke-width="14"/><circle cx="200" cy="200" r="65" fill="#09090b"/><circle cx="180" cy="185" r="18" fill="#0284c7"/><circle cx="225" cy="185" r="18" fill="#0284c7"/></svg>`,
  },
  {
    id: 'matrix',
    name: 'Emerald Cyber',
    fg: '#064e3b',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#022c22"/><g stroke="#047857" stroke-width="18"><line x1="60" y1="0" x2="60" y2="400"/><line x1="140" y1="0" x2="140" y2="400"/><line x1="220" y1="0" x2="220" y2="400"/><line x1="300" y1="0" x2="300" y2="400"/></g><polygon points="200,60 340,200 200,340 60,200" fill="#064e3b" stroke="#059669" stroke-width="16"/><circle cx="200" cy="200" r="50" fill="#022c22"/></svg>`,
  },
  {
    id: 'mandala',
    name: 'Royal Mandala',
    fg: '#431407',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#451a03"/><circle cx="200" cy="200" r="160" fill="#7c2d12" stroke="#b45309" stroke-width="14"/><rect x="95" y="95" width="210" height="210" transform="rotate(45 200 200)" fill="#431407" stroke="#9a3412" stroke-width="12"/><circle cx="200" cy="200" r="70" fill="#270902"/></svg>`,
  },
  {
    id: 'ocean',
    name: 'Abyssal Wave',
    fg: '#0c4a6e',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="o" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="50%" stop-color="#075985"/><stop offset="100%" stop-color="#115e59"/></linearGradient></defs><rect width="400" height="400" fill="url(#o)"/><path d="M0 130 Q100 60 200 130 T400 130 L400 400 L0 400 Z" fill="#1e3a8a"/><path d="M0 240 Q100 170 200 240 T400 240 L400 400 L0 400 Z" fill="#090d16"/><circle cx="200" cy="140" r="55" fill="#0369a1"/></svg>`,
  },
].map((art) => ({
  ...art,
  url: `data:image/svg+xml;utf8,${encodeURIComponent(art.svg)}`,
}));

export default function QRStudio() {
  const [studioMode, setStudioMode] = useState<'create' | 'scanner' | 'batch'>('create');

  const [type, setType] = useState<QRType>('phone');
  const [data, setData] = useState<QRPayloadData>({
    url: 'https://example.com',
    phone: '',
    socialNetwork: 'tiktok',
    socialHandle: 'yourname',
    encryption: 'WPA',
    upiId: 'your@upi',
    upiName: 'Studio',
    upiAmount: '',
    upiNote: 'Creator Support',
    appPlatform: 'android',
    appId: 'com.instagram.android',
    latitude: '28.6139',
    longitude: '77.2090',
  });

  // Defer input data so typing on mobile stays 60fps smooth
  const deferredData = useDeferredValue(data);

  const [designTab, setDesignTab] = useState<'colors' | 'eyes' | 'frames' | 'artwork'>('eyes');

  // Colors & Gradients
  const [fgColor, setFgColor] = useState('#7c3aed');
  const [fgColor2, setFgColor2] = useState('#ec4899');
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [dotStyle, setDotStyle] = useState<DotStyle>('dots');
  const [margin, setMargin] = useState(2);

  // Custom Finder Eyes
  const [finderShape, setFinderShape] = useState<FinderShape>('square');
  const [customEyeColors, setCustomEyeColors] = useState(true);
  const [finderOuterColor, setFinderOuterColor] = useState('#1e1b4b');
  const [finderInnerColor, setFinderInnerColor] = useState('#e11d48');

  // Decorative Frames
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('badge');
  const [frameText, setFrameText] = useState('SCAN TO CALL');
  const [frameColor, setFrameColor] = useState('#7c3aed');

  // Artwork & Image-Filled Mode
  const [imageMode, setImageMode] = useState<'none' | 'fill' | 'center'>('none');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [brightness, setBrightness] = useState(95);
  const [contrast, setContrast] = useState(125);
  const [scale, setScale] = useState(1);
  const [logoSize, setLogoSize] = useState(22);

  // Live Scannability & Mobile Preview Snapshot
  const [scanStatus, setScanStatus] = useState<'verified' | 'warning' | 'testing'>('verified');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Clipboard & Share Feedback
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [sharedPreset, setSharedPreset] = useState(false);

  // Print Sheet & Batch CSV State
  const [stickerGrid, setStickerGrid] = useState<'2x2' | '3x4' | '4x5'>('3x4');
  const [batchInput, setBatchInput] = useState(
    'reward-01,https://example.com/claim/1\nreward-02,https://example.com/claim/2\nreward-03,https://example.com/claim/3'
  );
  const [isExportingBatch, setIsExportingBatch] = useState(false);

  // QR Scanner Tab State
  const [scannerResult, setScannerResult] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanLoopRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const payload = useMemo(() => generatePayload(type, deferredData), [type, data]);

  // Load Shareable Studio Preset from URL query params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const presetStr = params.get('preset');
    if (presetStr) {
      try {
        const parsed = JSON.parse(atob(presetStr));
        if (parsed.fgColor) setFgColor(parsed.fgColor);
        if (parsed.fgColor2) setFgColor2(parsed.fgColor2);
        if (parsed.gradientType) setGradientType(parsed.gradientType);
        if (parsed.bgColor) setBgColor(parsed.bgColor);
        if (parsed.dotStyle) setDotStyle(parsed.dotStyle);
        if (parsed.finderShape) setFinderShape(parsed.finderShape);
        if (parsed.frameStyle) setFrameStyle(parsed.frameStyle);
        if (parsed.frameText) setFrameText(parsed.frameText);
        if (parsed.frameColor) setFrameColor(parsed.frameColor);
      } catch {
        // ignore invalid preset
      }
    }
  }, []);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => setImageElement(img);
    } else {
      setImageElement(null);
    }
  }, [imageSrc]);

  const qrOptions: QROptions = useMemo(
    () => ({
      payload,
      errorCorrectionLevel: 'H',
      fgColor,
      fgColor2,
      gradientType,
      bgColor,
      margin,
      dotStyle,
      finderShape,
      finderOuterColor: customEyeColors ? finderOuterColor : undefined,
      finderInnerColor: customEyeColors ? finderInnerColor : undefined,
      frameStyle,
      frameText,
      frameColor,
      imageMode,
      imageElement,
      imageSrc,
      brightness,
      contrast,
      scale,
      logoSize,
    }),
    [
      payload, fgColor, fgColor2, gradientType, bgColor, margin, dotStyle,
      finderShape, customEyeColors, finderOuterColor, finderInnerColor,
      frameStyle, frameText, frameColor, imageMode, imageElement, imageSrc,
      brightness, contrast, scale, logoSize,
    ]
  );

  // Redraw Canvas, Update Mobile Thumbnail & Verify Pure QR ImageData
  useEffect(() => {
    if (!canvasRef.current) return;
    drawQRToCanvas(canvasRef.current, qrOptions).then((pureQrImageData) => {
      if (canvasRef.current) {
        setPreviewDataUrl(canvasRef.current.toDataURL('image/png'));
      }
      if (!pureQrImageData) return;
      const code = jsQR(pureQrImageData.data, pureQrImageData.width, pureQrImageData.height, {
        inversionAttempts: 'attemptBoth',
      });
      if (code && code.data) {
        setScanStatus('verified');
      } else {
        setScanStatus('warning');
      }
    });
  }, [qrOptions]);

  useEffect(() => {
    if (studioMode !== 'scanner') {
      stopWebcamScanner();
    }
    return () => stopWebcamScanner();
  }, [studioMode]);

  const autoFixContrast = () => {
    setBgColor('#ffffff');
    setFgColor('#6d28d9');
    setFgColor2('#db2777');
    setFinderOuterColor('#1e1b4b');
    setFinderInnerColor('#e11d48');
    if (imageMode === 'fill') {
      setContrast(145);
      setBrightness(85);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      if (imageMode === 'none') setImageMode('fill');
    };
    reader.readAsDataURL(file);
  };

  const selectPresetArtwork = (art: typeof PRESET_ARTWORKS[0]) => {
    setImageSrc(art.url);
    setImageMode('fill');
    setFgColor(art.fg);
    setFinderOuterColor(art.fg);
    setGradientType('solid');
  };

  const copyImageToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, 'image/png')
      );
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      alert('Browser blocked clipboard image write. Please use Download PNG.');
    }
  };

  const shareStudioPreset = () => {
    const config = {
      fgColor,
      fgColor2,
      gradientType,
      bgColor,
      dotStyle,
      finderShape,
      frameStyle,
      frameText,
      frameColor,
    };
    const encoded = btoa(JSON.stringify(config));
    const url = `${window.location.origin}${window.location.pathname}?preset=${encoded}`;
    navigator.clipboard.writeText(url);
    window.history.replaceState({}, '', `?preset=${encoded}`);
    setSharedPreset(true);
    setTimeout(() => setSharedPreset(false), 2500);
  };

  const handleExportPrintSheet = () => {
    if (!canvasRef.current) return;
    const sheet = document.createElement('canvas');
    sheet.width = 1240;
    sheet.height = 1754;
    const sCtx = sheet.getContext('2d')!;

    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(0, 0, sheet.width, sheet.height);

    const gridMap = {
      '2x2': { cols: 2, rows: 2 },
      '3x4': { cols: 3, rows: 4 },
      '4x5': { cols: 4, rows: 5 },
    };
    const { cols, rows } = gridMap[stickerGrid];

    const padX = 70;
    const padY = 90;
    const cellW = (sheet.width - padX * 2) / cols;
    const cellH = (sheet.height - padY * 2) / rows;
    const qrDrawSize = Math.min(cellW, cellH) * 0.84;

    sCtx.fillStyle = '#18181b';
    sCtx.font = 'bold 24px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText(`QR GENERATO — Printable Sticker Sheet (${stickerGrid})`, sheet.width / 2, 50);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = padX + c * cellW + (cellW - qrDrawSize) / 2;
        const cy = padY + r * cellH + (cellH - qrDrawSize) / 2;

        sCtx.save();
        sCtx.strokeStyle = '#d4d4d8';
        sCtx.lineWidth = 2;
        sCtx.setLineDash([8, 6]);
        sCtx.strokeRect(cx - 10, cy - 10, qrDrawSize + 20, qrDrawSize + 20);
        sCtx.restore();

        sCtx.drawImage(canvasRef.current, cx, cy, qrDrawSize, qrDrawSize);
      }
    }

    const a = document.createElement('a');
    a.href = sheet.toDataURL('image/png');
    a.download = `qr-sticker-sheet-${stickerGrid}-${Date.now()}.png`;
    a.click();
  };

  const handleBatchExportZip = async () => {
    const lines = batchInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    setIsExportingBatch(true);
    try {
      const zip = new JSZip();
      const tempCanvas = document.createElement('canvas');

      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(',');
        const hasLabel = parts.length > 1;
        const filename = hasLabel
          ? parts[0].trim().replace(/[^a-zA-Z0-9-_]/g, '_')
          : `qr-${i + 1}`;
        const rowPayload = hasLabel ? parts.slice(1).join(',').trim() : parts[0].trim();

        await drawQRToCanvas(tempCanvas, {
          ...qrOptions,
          payload: rowPayload,
        });

        const dataUrl = tempCanvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(`${filename}.png`, base64Data, { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-batch-${lines.length}-codes.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExportingBatch(false);
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBatchInput(String(reader.result || ''));
    reader.readAsText(file);
  };

  const handleScanUploadedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScannerError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const temp = document.createElement('canvas');
        temp.width = img.width;
        temp.height = img.height;
        const ctx = temp.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, temp.width, temp.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          setScannerResult(code.data);
        } else {
          setScannerResult(null);
          setScannerError('Could not detect a valid QR code in that image.');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startWebcamScanner = async () => {
    setScannerError(null);
    setScannerResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickWebcamScan);
      }
    } catch {
      setScannerError('Camera permission denied or no webcam available.');
    }
  };

  const stopWebcamScanner = () => {
    if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const tickWebcamScan = () => {
    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const temp = document.createElement('canvas');
      temp.width = video.videoWidth;
      temp.height = video.videoHeight;
      const ctx = temp.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, temp.width, temp.height);
        const imgData = ctx.getImageData(0, 0, temp.width, temp.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code && code.data) {
          setScannerResult(code.data);
          stopWebcamScanner();
          return;
        }
      }
    }
    scanLoopRef.current = requestAnimationFrame(tickWebcamScan);
  };

  const handleDownload = (format: 'png' | 'svg') => {
    if (format === 'png' && canvasRef.current) {
      const a = document.createElement('a');
      a.href = canvasRef.current.toDataURL('image/png');
      a.download = `qr-studio-${type}-${Date.now()}.png`;
      a.click();
    } else if (format === 'svg') {
      const svg = generateQRSvg(qrOptions);
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-studio-${type}-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const topTabs = [
    { id: 'upi', label: 'UPI Pay', icon: <IndianRupee size={16} />, badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', activeRing: 'border-emerald-500/60 from-emerald-500/20 to-teal-600/10' },
    { id: 'url', label: 'Website', icon: <LinkIcon size={16} />, badgeBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30', activeRing: 'border-sky-500/60 from-sky-500/20 to-blue-600/10' },
    { id: 'social', label: 'Social', icon: <Share2 size={16} />, badgeBg: 'bg-pink-500/15 text-pink-400 border-pink-500/30', activeRing: 'border-pink-500/60 from-pink-500/20 to-rose-600/10' },
    { id: 'wifi', label: 'Wi-Fi', icon: <Wifi size={16} />, badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', activeRing: 'border-cyan-500/60 from-cyan-500/20 to-blue-600/10' },
    { id: 'event', label: 'Event', icon: <Calendar size={16} />, badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', activeRing: 'border-amber-500/60 from-amber-500/20 to-orange-600/10' },
    { id: 'geo', label: 'Location', icon: <MapPin size={16} />, badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30', activeRing: 'border-rose-500/60 from-rose-500/20 to-red-600/10' },
    { id: 'appstore', label: 'App Store', icon: <Smartphone size={16} />, badgeBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', activeRing: 'border-indigo-500/60 from-indigo-500/20 to-violet-600/10' },
    { id: 'vcard', label: 'Contact', icon: <Contact size={16} />, badgeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30', activeRing: 'border-teal-500/60 from-teal-500/20 to-emerald-600/10' },
    { id: 'text', label: 'Text', icon: <Type size={16} />, badgeBg: 'bg-violet-500/15 text-violet-400 border-violet-500/30', activeRing: 'border-violet-500/60 from-violet-500/20 to-purple-600/10' },
    { id: 'email', label: 'Email', icon: <Mail size={16} />, badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30', activeRing: 'border-orange-500/60 from-orange-500/20 to-amber-600/10' },
    { id: 'phone', label: 'Phone', icon: <Phone size={16} />, badgeBg: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30', activeRing: 'border-fuchsia-500/60 from-fuchsia-500/25 to-purple-600/10' },
    { id: 'sms', label: 'SMS', icon: <MessageSquare size={16} />, badgeBg: 'bg-lime-500/15 text-lime-400 border-lime-500/30', activeRing: 'border-lime-500/60 from-lime-500/20 to-green-600/10' },
  ] as const;

  const quickThemes = [
    { name: 'Royal Cyber', fg1: '#7c3aed', fg2: '#ec4899', outer: '#1e1b4b', inner: '#e11d48', frame: '#7c3aed', dot: 'dots' as DotStyle, eye: 'leaf' as FinderShape },
    { name: 'Emerald Matrix', fg1: '#059669', fg2: '#10b981', outer: '#064e3b', inner: '#10b981', frame: '#059669', dot: 'rounded' as DotStyle, eye: 'square' as FinderShape },
    { name: 'Oceanic Pro', fg1: '#2563eb', fg2: '#06b6d4', outer: '#1e3a8a', inner: '#0284c7', frame: '#2563eb', dot: 'dots' as DotStyle, eye: 'circle' as FinderShape },
    { name: 'Sunset Blaze', fg1: '#e11d48', fg2: '#f97316', outer: '#881337', inner: '#f97316', frame: '#e11d48', dot: 'rounded' as DotStyle, eye: 'leaf' as FinderShape },
    { name: 'Gold Luxe', fg1: '#b45309', fg2: '#d97706', outer: '#451a03', inner: '#d97706', frame: '#78350f', dot: 'square' as DotStyle, eye: 'square' as FinderShape },
  ];

  // Uses text-base (16px) on mobile to prevent iOS/Android input zoom, and 14px on desktop
  const inputClass =
    'w-full bg-[#0d0d14] border border-white/[0.1] hover:border-violet-500/40 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-3 sm:py-3.5 text-base sm:text-[14px] font-medium text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500 transition-all placeholder:text-zinc-500 shadow-inner';

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-8 py-4 sm:py-6">
      
      {/* TOP NAVIGATION DOCK (Swipeable on Mobile, Flex on Desktop) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 mb-5 sm:mb-7 bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] p-2 sm:p-2.5 rounded-2xl shadow-2xl">
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 snap-x">
          {[
            { id: 'create', label: 'Designer Studio', fullLabel: 'QR Designer Studio', icon: <QrCode size={15} />, activeGrad: 'from-violet-600 via-fuchsia-600 to-indigo-600 shadow-fuchsia-600/25' },
            { id: 'batch', label: 'Print & CSV', fullLabel: 'Print Sheet & Batch CSV', icon: <Printer size={15} />, activeGrad: 'from-emerald-600 to-teal-600 shadow-emerald-600/25' },
            { id: 'scanner', label: 'QR Scanner', fullLabel: 'Optical QR Scanner', icon: <Camera size={15} />, activeGrad: 'from-amber-500 to-orange-600 shadow-amber-600/25' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setStudioMode(m.id as any)}
              className={clsx(
                'snap-start shrink-0 flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-[13px] font-bold tracking-tight transition-all cursor-pointer flex-1 sm:flex-initial',
                studioMode === m.id
                  ? `bg-gradient-to-r ${m.activeGrad} text-white shadow-lg ring-1 ring-white/25`
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              )}
            >
              {m.icon}
              <span className="sm:hidden">{m.label}</span>
              <span className="hidden sm:inline">{m.fullLabel}</span>
            </button>
          ))}
        </div>

        <button
          onClick={shareStudioPreset}
          className="flex items-center justify-center gap-2 px-3.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 hover:from-violet-500/25 hover:to-fuchsia-500/25 border border-fuchsia-500/30 text-xs sm:text-[13px] font-bold text-fuchsia-200 transition-all cursor-pointer"
        >
          {sharedPreset ? <Check size={14} className="text-emerald-400" /> : <Share size={14} className="text-fuchsia-400" />}
          <span>{sharedPreset ? 'Preset Link Copied!' : 'Share Theme Preset Link'}</span>
        </button>
      </div>

      {/* MODE 3: OPTICAL QR SCANNER */}
      {studioMode === 'scanner' && (
        <div className="bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Optical QR Code Inspector</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Upload an image or use your phone camera to extract the raw payload
              </p>
            </div>
            <label className="px-4 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-xs font-bold text-white cursor-pointer flex items-center justify-center gap-2 shadow-lg shrink-0">
              <Upload size={15} /> Upload QR Image
              <input type="file" accept="image/*" className="hidden" onChange={handleScanUploadedFile} />
            </label>
          </div>

          <div className="bg-[#0b0b12] border border-white/[0.08] rounded-2xl p-5 sm:p-8 flex flex-col items-center justify-center min-h-[240px] sm:min-h-[280px]">
            <video
              ref={videoRef}
              className={clsx('w-full max-w-md rounded-xl border border-white/10 mb-4', !cameraActive && 'hidden')}
            />
            {!cameraActive ? (
              <button
                onClick={startWebcamScanner}
                className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer"
              >
                <Play size={16} className="text-amber-400" /> Start Camera Scanner
              </button>
            ) : (
              <button
                onClick={stopWebcamScanner}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold"
              >
                <Square size={14} /> Stop Camera
              </button>
            )}
          </div>

          {scannerError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-300">
              {scannerError}
            </div>
          )}

          {scannerResult && (
            <div className="p-4 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Decoded QR Payload
              </div>
              <div className="font-mono text-xs sm:text-sm text-white break-all bg-black/50 p-3.5 sm:p-4 rounded-xl border border-white/10">
                {scannerResult}
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => navigator.clipboard.writeText(scannerResult)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
                >
                  Copy Text
                </button>
                <button
                  onClick={() => {
                    setType('text');
                    setData({ ...data, text: scannerResult });
                    setStudioMode('create');
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white"
                >
                  Load into Studio
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 1 & 2: DESIGNER STUDIO & BATCH/PRINT */}
      {studioMode !== 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          {/* LEFT COLUMN (7 cols on Desktop, Full Width on Mobile) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-7 min-w-0">
            {studioMode === 'batch' ? (
              <>
                <div className="bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">A4 Printable Sticker Sheet</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Generate a high-resolution sheet with dashed cut-lines
                      </p>
                    </div>
                    <Printer className="text-emerald-400 shrink-0" size={22} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                    {[
                      { id: '2x2', title: '2 × 2 Large', sub: '4 Jumbo Stickers / Page' },
                      { id: '3x4', title: '3 × 4 Medium', sub: '12 Standard Stickers' },
                      { id: '4x5', title: '4 × 5 Compact', sub: '20 Product Labels' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setStickerGrid(g.id as any)}
                        className={clsx(
                          'p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer',
                          stickerGrid === g.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg'
                            : 'bg-[#0b0b12] border-white/[0.07] text-zinc-400 hover:text-white'
                        )}
                      >
                        <div className="text-sm font-bold text-white">{g.title}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{g.sub}</div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExportPrintSheet}
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer size={17} /> Download Printable A4 Sticker Sheet
                  </button>
                </div>

                <div className="bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">Batch CSV Generator (.ZIP)</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Enter <code className="text-emerald-300">filename,payload</code> per line or upload a CSV
                      </p>
                    </div>
                    <label className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white cursor-pointer flex items-center justify-center gap-2 shrink-0">
                      <FileSpreadsheet size={15} className="text-emerald-400" /> Upload .CSV
                      <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCsvFileUpload} />
                    </label>
                  </div>

                  <textarea
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    rows={5}
                    className={clsx(inputClass, 'font-mono text-xs leading-relaxed')}
                  />

                  <button
                    onClick={handleBatchExportZip}
                    disabled={isExportingBatch}
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={17} />
                    {isExportingBatch ? 'Building ZIP Archive...' : 'Generate & Download Batch .ZIP'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* CARD 1: Colorful 12-Type Payload Selector */}
                <div className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl">
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-5 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-xs font-extrabold flex items-center justify-center shadow-lg shadow-violet-500/25">
                        01
                      </span>
                      <div>
                        <h2 className="text-[15px] sm:text-[16px] font-extrabold tracking-tight text-white">
                          Content & Payload Type
                        </h2>
                        <p className="text-[11px] sm:text-xs text-zinc-400">Swipe or tap a category to configure your QR action</p>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto px-3 py-1 rounded-xl bg-violet-500/10 border border-violet-500/30 text-[11px] text-violet-200 font-mono truncate max-w-full sm:max-w-[220px]">
                      {payload}
                    </span>
                  </div>

                  {/* Mobile: Horizontal Swipeable Ribbon | Tablet/Desktop: 6-Col Grid */}
                  <div className="flex sm:grid sm:grid-cols-6 overflow-x-auto no-scrollbar snap-x gap-2 sm:gap-2.5 pb-5 sm:pb-6 border-b border-white/[0.08] -mx-1 px-1">
                    {topTabs.map((tab) => {
                      const isActive = type === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setType(tab.id as QRType)}
                          className={clsx(
                            'snap-start shrink-0 w-[78px] sm:w-auto group flex flex-col items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 rounded-2xl transition-all border cursor-pointer',
                            isActive
                              ? `bg-gradient-to-b ${tab.activeRing} text-white shadow-lg sm:scale-[1.02]`
                              : 'bg-[#0b0b12]/90 border-white/[0.06] text-zinc-300 hover:border-white/20 hover:bg-white/[0.04]'
                          )}
                        >
                          <div
                            className={clsx(
                              'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110',
                              tab.badgeBg
                            )}
                          >
                            {tab.icon}
                          </div>
                          <span className="text-[11px] sm:text-[12px] font-bold tracking-tight whitespace-nowrap">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Type-Specific Forms */}
                  <div className="pt-5 sm:pt-6">
                    {type === 'upi' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        <div>
                          <label className="block text-xs font-bold text-emerald-300 mb-1.5">UPI ID (VPA)</label>
                          <input
                            type="text"
                            placeholder="username@okaxis"
                            className={inputClass}
                            value={data.upiId || ''}
                            onChange={(e) => setData({ ...data, upiId: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-emerald-300 mb-1.5">Payee Name</label>
                          <input
                            type="text"
                            placeholder="Studio"
                            className={inputClass}
                            value={data.upiName || ''}
                            onChange={(e) => setData({ ...data, upiName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Amount in ₹ (Optional)</label>
                          <input
                            type="number"
                            placeholder="499"
                            className={inputClass}
                            value={data.upiAmount || ''}
                            onChange={(e) => setData({ ...data, upiAmount: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Payment Note</label>
                          <input
                            type="text"
                            placeholder="Creator Support"
                            className={inputClass}
                            value={data.upiNote || ''}
                            onChange={(e) => setData({ ...data, upiNote: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {type === 'phone' && (
                      <div>
                        <label className="block text-xs font-bold text-fuchsia-300 mb-2">Phone Number to Call</label>
                        <input
                          type="tel"
                          placeholder="+91 0000000000"
                          className={inputClass}
                          value={data.phone || ''}
                          onChange={(e) => setData({ ...data, phone: e.target.value })}
                        />
                      </div>
                    )}

                    {type === 'url' && (
                      <div>
                        <label className="block text-xs font-bold text-sky-300 mb-2">Destination Website URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com"
                          className={inputClass}
                          value={data.url || ''}
                          onChange={(e) => setData({ ...data, url: e.target.value })}
                        />
                      </div>
                    )}

                    {type === 'social' && (
                      <div className="space-y-4">
                        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-2 pb-1">
                          {[
                            { id: 'tiktok', color: '#a855f7' },
                            { id: 'instagram', color: '#ec4899' },
                            { id: 'youtube', color: '#ef4444' },
                            { id: 'facebook', color: '#3b82f6' },
                            { id: 'linkedin', color: '#0ea5e9' },
                            { id: 'whatsapp', color: '#10b981' },
                          ].map((net) => (
                            <button
                              key={net.id}
                              onClick={() => setData({ ...data, socialNetwork: net.id })}
                              className={clsx(
                                'shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold capitalize border flex items-center gap-2 transition-all cursor-pointer',
                                data.socialNetwork === net.id
                                  ? 'bg-white text-black border-white shadow-md'
                                  : 'bg-[#0b0b12] text-zinc-300 border-white/10 hover:border-white/25'
                              )}
                            >
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: net.color }} />
                              {net.id}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-pink-300 mb-2">
                            {data.socialNetwork?.toUpperCase()} Username / Handle
                          </label>
                          <input
                            type="text"
                            placeholder="@yourname"
                            className={inputClass}
                            value={data.socialHandle || ''}
                            onChange={(e) => setData({ ...data, socialHandle: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    {type === 'event' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        <input
                          type="text"
                          placeholder="Event Title"
                          className={clsx(inputClass, 'sm:col-span-2')}
                          value={data.eventTitle || ''}
                          onChange={(e) => setData({ ...data, eventTitle: e.target.value })}
                        />
                        <div>
                          <label className="block text-xs font-bold text-amber-300 mb-1.5">Starts At</label>
                          <input type="datetime-local" className={inputClass} value={data.eventStart || ''} onChange={(e) => setData({ ...data, eventStart: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-amber-300 mb-1.5">Ends At</label>
                          <input type="datetime-local" className={inputClass} value={data.eventEnd || ''} onChange={(e) => setData({ ...data, eventEnd: e.target.value })} />
                        </div>
                        <input
                          type="text"
                          placeholder="Venue or Meeting Link"
                          className={clsx(inputClass, 'sm:col-span-2')}
                          value={data.eventLocation || ''}
                          onChange={(e) => setData({ ...data, eventLocation: e.target.value })}
                        />
                      </div>
                    )}

                    {type === 'geo' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        <div>
                          <label className="block text-xs font-bold text-rose-300 mb-1.5">Latitude</label>
                          <input type="text" placeholder="28.6139" className={inputClass} value={data.latitude || ''} onChange={(e) => setData({ ...data, latitude: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-rose-300 mb-1.5">Longitude</label>
                          <input type="text" placeholder="77.2090" className={inputClass} value={data.longitude || ''} onChange={(e) => setData({ ...data, longitude: e.target.value })} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Or Google Maps Place Search</label>
                          <input type="text" placeholder="Cyber Hub, Gurugram" className={inputClass} value={data.geoQuery || ''} onChange={(e) => setData({ ...data, geoQuery: e.target.value })} />
                        </div>
                      </div>
                    )}

                    {type === 'appstore' && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'android', label: 'Google Play' },
                            { id: 'ios', label: 'Apple App Store' },
                            { id: 'custom', label: 'Direct APK / URL' },
                          ].map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setData({ ...data, appPlatform: p.id as any })}
                              className={clsx(
                                'flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold border transition-all',
                                data.appPlatform === p.id
                                  ? 'bg-indigo-600 text-white border-indigo-400'
                                  : 'bg-[#0b0b12] text-zinc-400 border-white/10'
                              )}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                        {data.appPlatform !== 'custom' ? (
                          <input
                            type="text"
                            placeholder={data.appPlatform === 'ios' ? 'App Store ID (e.g. 389801252)' : 'Package ID (e.g. com.instagram.android)'}
                            className={inputClass}
                            value={data.appId || ''}
                            onChange={(e) => setData({ ...data, appId: e.target.value })}
                          />
                        ) : (
                          <input
                            type="url"
                            placeholder="https://your-app.com/download"
                            className={inputClass}
                            value={data.appCustomUrl || ''}
                            onChange={(e) => setData({ ...data, appCustomUrl: e.target.value })}
                          />
                        )}
                      </div>
                    )}

                    {type === 'text' && (
                      <textarea placeholder="Enter text to encode..." className={clsx(inputClass, 'resize-none h-24')} value={data.text || ''} onChange={(e) => setData({ ...data, text: e.target.value })} />
                    )}

                    {type === 'email' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <input type="email" placeholder="Recipient Email" className={inputClass} value={data.email || ''} onChange={(e) => setData({ ...data, email: e.target.value })} />
                        <input type="text" placeholder="Subject" className={inputClass} value={data.subject || ''} onChange={(e) => setData({ ...data, subject: e.target.value })} />
                        <textarea placeholder="Message..." className={clsx(inputClass, 'sm:col-span-2 resize-none h-20')} value={data.body || ''} onChange={(e) => setData({ ...data, body: e.target.value })} />
                      </div>
                    )}

                    {type === 'sms' && (
                      <div className="grid grid-cols-1 gap-3.5">
                        <input type="tel" placeholder="Recipient Phone" className={inputClass} value={data.phone || ''} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                        <textarea placeholder="SMS Message..." className={clsx(inputClass, 'resize-none h-20')} value={data.sms || ''} onChange={(e) => setData({ ...data, sms: e.target.value })} />
                      </div>
                    )}

                    {type === 'wifi' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <input type="text" placeholder="Network Name (SSID)" className={inputClass} value={data.ssid || ''} onChange={(e) => setData({ ...data, ssid: e.target.value })} />
                        <input type="password" placeholder="Password" className={inputClass} value={data.password || ''} onChange={(e) => setData({ ...data, password: e.target.value })} />
                        <select className={inputClass} value={data.encryption || 'WPA'} onChange={(e) => setData({ ...data, encryption: e.target.value as any })}>
                          <option value="WPA">WPA / WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">Open Network</option>
                        </select>
                      </div>
                    )}

                    {type === 'vcard' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <input type="text" placeholder="First Name" className={inputClass} value={data.firstName || ''} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
                        <input type="text" placeholder="Last Name" className={inputClass} value={data.lastName || ''} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
                        <input type="tel" placeholder="Phone Number" className={inputClass} value={data.phone || ''} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                        <input type="email" placeholder="Email Address" className={inputClass} value={data.email || ''} onChange={(e) => setData({ ...data, email: e.target.value })} />
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD 2: Visual Design & Artwork Studio */}
                <div className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl space-y-5 sm:space-y-6">
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white text-xs font-extrabold flex items-center justify-center shadow-lg shadow-pink-500/25">
                        02
                      </span>
                      <div>
                        <h2 className="text-[15px] sm:text-[16px] font-extrabold tracking-tight text-white">
                          Matrix Styling & Artwork Engine
                        </h2>
                        <p className="text-[11px] sm:text-xs text-zinc-400">Customize finder eyes, gradients, frames, and pixel masks</p>
                      </div>
                    </div>
                  </div>

                  {/* Responsive 2x2 on Mobile, 4-Col on Tablet/Desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 bg-[#0b0b12] p-1.5 rounded-2xl border border-white/[0.08]">
                    {[
                      { id: 'colors', label: 'Gradients', icon: <Palette size={15} />, active: 'from-pink-600 to-rose-600' },
                      { id: 'eyes', label: 'Custom Eyes', icon: <Eye size={15} />, active: 'from-violet-600 to-indigo-600' },
                      { id: 'frames', label: 'CTA Frames', icon: <Frame size={15} />, active: 'from-amber-500 to-orange-600' },
                      { id: 'artwork', label: 'Art Gallery', icon: <Sparkles size={15} />, active: 'from-emerald-600 to-teal-600' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setDesignTab(t.id as any)}
                        className={clsx(
                          'flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2.5 sm:px-3 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer',
                          designTab === t.id
                            ? `bg-gradient-to-r ${t.active} text-white shadow-lg`
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                        )}
                      >
                        {t.icon}
                        <span className="truncate">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* TAB: CUSTOM EYES */}
                  {designTab === 'eyes' && (
                    <div className="space-y-5 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                        {[
                          { id: 'square', label: 'Square Eye', sub: 'Precision geometric block' },
                          { id: 'circle', label: 'Circle Eye', sub: 'Smooth concentric ring' },
                          { id: 'leaf', label: 'Leaf Eye', sub: 'Organic curved corner' },
                        ].map((shape) => {
                          const active = finderShape === shape.id;
                          return (
                            <button
                              key={shape.id}
                              onClick={() => setFinderShape(shape.id as FinderShape)}
                              className={clsx(
                                'p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5',
                                active
                                  ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border-violet-400 text-white shadow-lg shadow-violet-500/15'
                                  : 'bg-[#0b0b12] border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20'
                              )}
                            >
                              <div className="w-11 h-11 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center shadow-md">
                                <div
                                  className="w-full h-full border-[3px] flex items-center justify-center"
                                  style={{
                                    borderColor: customEyeColors ? finderOuterColor : fgColor,
                                    borderRadius: shape.id === 'circle' ? '999px' : shape.id === 'leaf' ? '10px 3px 10px 3px' : '4px',
                                  }}
                                >
                                  <div
                                    className="w-3.5 h-3.5"
                                    style={{
                                      backgroundColor: customEyeColors ? finderInnerColor : fgColor2,
                                      borderRadius: shape.id === 'circle' ? '999px' : shape.id === 'leaf' ? '5px 1px 5px 1px' : '2px',
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="text-[14px] font-bold text-white">{shape.label}</div>
                                <div className="text-[11px] text-zinc-400 mt-0.5">{shape.sub}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-white/[0.08] space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-white">Custom Finder Eye Colors</div>
                            <div className="text-xs text-zinc-400">Style the 7×7 outer ring and 3×3 center eyeball independently</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCustomEyeColors(!customEyeColors)}
                            className={clsx(
                              'w-12 h-6 shrink-0 rounded-full transition-colors p-1 cursor-pointer',
                              customEyeColors ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-zinc-700'
                            )}
                          >
                            <div
                              className={clsx(
                                'w-4 h-4 rounded-full bg-white transition-transform',
                                customEyeColors ? 'translate-x-6' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>

                        {customEyeColors && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <label className="bg-[#0b0b12] border border-white/[0.1] hover:border-violet-400/50 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all">
                              <div>
                                <span className="block text-xs font-semibold text-violet-300">Outer 7×7 Ring</span>
                                <span className="text-sm font-mono font-bold text-white uppercase">{finderOuterColor}</span>
                              </div>
                              <div
                                className="w-10 h-10 rounded-xl border-2 border-white/30 shadow-lg"
                                style={{ backgroundColor: finderOuterColor }}
                              />
                              <input type="color" value={finderOuterColor} onChange={(e) => setFinderOuterColor(e.target.value)} className="sr-only" />
                            </label>

                            <label className="bg-[#0b0b12] border border-white/[0.1] hover:border-pink-400/50 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all">
                              <div>
                                <span className="block text-xs font-semibold text-pink-300">Inner 3×3 Eyeball</span>
                                <span className="text-sm font-mono font-bold text-white uppercase">{finderInnerColor}</span>
                              </div>
                              <div
                                className="w-10 h-10 rounded-xl border-2 border-white/30 shadow-lg"
                                style={{ backgroundColor: finderInnerColor }}
                              />
                              <input type="color" value={finderInnerColor} onChange={(e) => setFinderInnerColor(e.target.value)} className="sr-only" />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB: GRADIENTS & DOTS */}
                  {designTab === 'colors' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-pink-300 mb-2">Color Fill Mode</label>
                          <div className="bg-[#0b0b12] border border-white/[0.08] rounded-xl p-1 flex">
                            {(['solid', 'linear', 'radial'] as const).map((g) => (
                              <button
                                key={g}
                                onClick={() => setGradientType(g)}
                                className={clsx(
                                  'flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer',
                                  gradientType === g ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white' : 'text-zinc-400 hover:text-white'
                                )}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-violet-300 mb-2">Data Dot Shape</label>
                          <div className="bg-[#0b0b12] border border-white/[0.08] rounded-xl p-1 flex">
                            {(['dots', 'rounded', 'square'] as const).map((s) => (
                              <button
                                key={s}
                                onClick={() => setDotStyle(s)}
                                className={clsx(
                                  'flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer',
                                  dotStyle === s ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="bg-[#0b0b12] border border-white/[0.1] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer">
                          <div>
                            <span className="block text-xs font-semibold text-violet-300">Primary Stop</span>
                            <span className="text-sm font-mono font-bold text-white uppercase">{fgColor}</span>
                          </div>
                          <div className="w-9 h-9 rounded-xl border-2 border-white/25" style={{ backgroundColor: fgColor }} />
                          <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="sr-only" />
                        </label>

                        {gradientType !== 'solid' && (
                          <label className="bg-[#0b0b12] border border-white/[0.1] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer">
                            <div>
                              <span className="block text-xs font-semibold text-pink-300">Secondary Stop</span>
                              <span className="text-sm font-mono font-bold text-white uppercase">{fgColor2}</span>
                            </div>
                            <div className="w-9 h-9 rounded-xl border-2 border-white/25" style={{ backgroundColor: fgColor2 }} />
                            <input type="color" value={fgColor2} onChange={(e) => setFgColor2(e.target.value)} className="sr-only" />
                          </label>
                        )}

                        <label className="bg-[#0b0b12] border border-white/[0.1] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer">
                          <div>
                            <span className="block text-xs font-semibold text-cyan-300">Background</span>
                            <span className="text-sm font-mono font-bold text-white uppercase">{bgColor}</span>
                          </div>
                          <div className="w-9 h-9 rounded-xl border-2 border-white/25" style={{ backgroundColor: bgColor }} />
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="sr-only" />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB: CTA FRAMES */}
                  {designTab === 'frames' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                        {[
                          { id: 'none', label: 'No Frame' },
                          { id: 'badge', label: 'Pill Badge' },
                          { id: 'banner', label: 'Full Banner' },
                          { id: 'outline', label: 'Card Outline' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFrameStyle(f.id as FrameStyle)}
                            className={clsx(
                              'py-3 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer',
                              frameStyle === f.id
                                ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                                : 'bg-[#0b0b12] border-white/[0.08] text-zinc-400 hover:text-white'
                            )}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      {frameStyle !== 'none' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-amber-300 mb-1.5">Call-to-Action Text</label>
                            <input
                              type="text"
                              maxLength={22}
                              value={frameText}
                              onChange={(e) => setFrameText(e.target.value)}
                              className={inputClass}
                              placeholder="SCAN TO PAY"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-amber-300 mb-1.5">Frame Color</label>
                            <label className="bg-[#0b0b12] border border-white/[0.1] rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer">
                              <span className="text-sm font-mono font-bold text-white uppercase">{frameColor}</span>
                              <div className="w-7 h-7 rounded-lg border border-white/25" style={{ backgroundColor: frameColor }} />
                              <input type="color" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="sr-only" />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: ART GALLERY */}
                  {designTab === 'artwork' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                        {PRESET_ARTWORKS.map((art) => (
                          <button
                            key={art.id}
                            onClick={() => selectPresetArtwork(art)}
                            className={clsx(
                              'flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer',
                              imageSrc === art.url
                                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg'
                                : 'bg-[#0b0b12] border-white/[0.08] hover:border-white/25 text-zinc-300'
                            )}
                          >
                            <img src={art.url} alt={art.name} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shrink-0" />
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold text-white truncate">{art.name}</div>
                              <div className="text-[10px] sm:text-[11px] text-emerald-300">Pixel Mask</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
                        <label className="px-4 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-xs font-bold text-white cursor-pointer flex items-center justify-center gap-2 shadow-lg">
                          <ImageIcon size={15} /> Upload Custom Photo / Logo
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>

                        {imageSrc && (
                          <div className="flex items-center justify-between sm:justify-end gap-2">
                            <div className="flex bg-[#0b0b12] p-1 rounded-xl border border-white/10 flex-1 sm:flex-initial">
                              <button
                                onClick={() => setImageMode('fill')}
                                className={clsx('flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold', imageMode === 'fill' ? 'bg-emerald-600 text-white' : 'text-zinc-400')}
                              >
                                Image-Filled
                              </button>
                              <button
                                onClick={() => setImageMode('center')}
                                className={clsx('flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold', imageMode === 'center' ? 'bg-emerald-600 text-white' : 'text-zinc-400')}
                              >
                                Center Logo
                              </button>
                            </div>
                            <button
                              onClick={() => { setImageSrc(null); setImageMode('none'); }}
                              className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY PREVIEW STAGE (5 cols) */}
          <div id="qr-preview-stage" className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl space-y-5 sm:space-y-6">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500" />

              {/* Header + Live Optical Scannability Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-extrabold text-white tracking-tight">Live Scannable Matrix</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Auto-verified with optical decoder</p>
                </div>
                {scanStatus === 'verified' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> Scannable Verified
                  </span>
                ) : (
                  <button
                    onClick={autoFixContrast}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <AlertTriangle size={14} className="shrink-0" /> Auto-Fix Contrast
                  </button>
                )}
              </div>

              {/* QR Canvas Stage with Dynamic Ambient Backlight */}
              <div className="relative bg-[#090910] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/[0.08] flex items-center justify-center shadow-inner overflow-hidden">
                <div
                  className="pointer-events-none absolute inset-0 opacity-25 blur-3xl transition-all duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${fgColor}, ${fgColor2}, transparent 75%)`,
                  }}
                />
                <canvas ref={canvasRef} className="relative z-10 w-full max-w-[270px] sm:max-w-[310px] h-auto rounded-2xl shadow-2xl block" />
              </div>

              {/* Instant One-Click Theme Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-300 mb-2.5">
                  <span className="font-bold flex items-center gap-1.5">
                    <Wand2 size={14} className="text-fuchsia-400" /> Instant Color Themes
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">100% Scannable</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {quickThemes.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        setFgColor(t.fg1);
                        setFgColor2(t.fg2);
                        setGradientType('linear');
                        setBgColor('#ffffff');
                        setFinderOuterColor(t.outer);
                        setFinderInnerColor(t.inner);
                        setFrameColor(t.frame);
                        setDotStyle(t.dot);
                        setFinderShape(t.eye);
                      }}
                      className="group p-1.5 sm:p-2 rounded-xl bg-[#0b0b12] border border-white/[0.08] hover:border-fuchsia-500/60 flex flex-col items-center gap-1.5 transition-all cursor-pointer"
                      title={t.name}
                    >
                      <div
                        className="w-full h-4 sm:h-5 rounded-md shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${t.fg1}, ${t.fg2})` }}
                      />
                      <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white truncate w-full text-center">
                        {t.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colorful Export Buttons */}
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    onClick={() => handleDownload('png')}
                    className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:opacity-95 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-fuchsia-600/25 flex items-center justify-center gap-2 text-[13px] cursor-pointer"
                  >
                    <Download size={16} /> Download PNG
                  </button>

                  <button
                    onClick={copyImageToClipboard}
                    className="bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 border border-cyan-500/30 text-cyan-200 font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-[13px] cursor-pointer"
                  >
                    {copiedImage ? <Check size={16} className="text-emerald-400" /> : <ClipboardCopy size={16} className="text-cyan-400" />}
                    <span>{copiedImage ? 'Image Copied!' : 'Copy QR Image'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    onClick={() => handleDownload('svg')}
                    className="py-3 bg-[#0b0b12] hover:bg-violet-500/10 border border-white/[0.08] hover:border-violet-500/40 text-zinc-200 hover:text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    Export Vector SVG
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(payload);
                      setCopiedPayload(true);
                      setTimeout(() => setCopiedPayload(false), 2000);
                    }}
                    className="py-3 bg-[#0b0b12] hover:bg-fuchsia-500/10 border border-white/[0.08] hover:border-fuchsia-500/40 text-zinc-200 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedPayload ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-fuchsia-400" />}
                    <span>{copiedPayload ? 'Copied!' : 'Copy Payload'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* STICKY MOBILE LIVE-PREVIEW BAR (Visible on Mobile/Tablet < 1024px) */}
      {studioMode !== 'scanner' && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0d0d16]/95 backdrop-blur-2xl border-t border-white/[0.12] px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
          <button
            onClick={() => setMobilePreviewOpen(true)}
            className="flex items-center gap-3 min-w-0 text-left"
          >
            {previewDataUrl && (
              <img
                src={previewDataUrl}
                alt="Mini QR Preview"
                className="w-11 h-11 rounded-xl bg-white p-0.5 border border-white/20 shrink-0 object-contain"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white">Live QR</span>
                {scanStatus === 'verified' ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <div className="text-[11px] text-fuchsia-300 flex items-center gap-1 font-semibold">
                <Maximize2 size={11} /> Tap to enlarge
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobilePreviewOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.08] border border-white/10 text-xs font-bold text-white"
            >
              Preview
            </button>
            <button
              onClick={() => handleDownload('png')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
            >
              <Download size={14} /> Save PNG
            </button>
          </div>
        </div>
      )}

      {/* MOBILE FULL-SCREEN QR PREVIEW DRAWER */}
      {mobilePreviewOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col justify-end p-3 animate-in fade-in duration-200">
          <div className="bg-[#12121c] border border-white/15 rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Live QR Preview</h3>
                <p className="text-xs text-zinc-400">
                  {scanStatus === 'verified' ? 'Verified Scannable' : 'Low Contrast — Tap Auto-Fix'}
                </p>
              </div>
              <button
                onClick={() => setMobilePreviewOpen(false)}
                className="p-2 rounded-xl bg-white/10 text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#090910] p-4 rounded-2xl border border-white/10 flex items-center justify-center">
              {previewDataUrl && (
                <img
                  src={previewDataUrl}
                  alt="Full QR Preview"
                  className="w-full max-w-[260px] h-auto rounded-xl shadow-2xl"
                />
              )}
            </div>

            {scanStatus !== 'verified' && (
              <button
                onClick={autoFixContrast}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2"
              >
                <AlertTriangle size={14} /> Auto-Fix Contrast Now
              </button>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleDownload('png')}
                className="py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download size={15} /> Download PNG
              </button>
              <button
                onClick={() => handleDownload('svg')}
                className="py-3 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                Export SVG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}