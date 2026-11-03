// components/qr-studio.tsx
'use client';

import React, { useState, useEffect, useRef, useDeferredValue } from 'react';
import {
  Link as LinkIcon, Type, Mail, Wifi, Phone, MessageSquare, Share2, Contact,
  Download, Copy, Palette, Image as ImageIcon, Sparkles,
  Check, Trash2, Eye, Frame, IndianRupee, Calendar, MapPin,
  Smartphone, FileSpreadsheet, Camera, QrCode, CheckCircle2,
  AlertTriangle, Upload, Play, Square, ArrowLeftRight,
  Briefcase, Star, Utensils, Ticket, ThumbsUp, CreditCard, Bitcoin,
  FileText, Video, Music, Lock, Video as VideoIcon, Send,
  Sun, Moon
} from 'lucide-react';
import {
  drawQRToCanvas,
  generateQRSvg,
  QROptions,
  DotStyle,
  FinderShape,
  FinderCenterShape,
  GradientType,
  FrameStyle,
} from '@/lib/qr-renderer';
import { generatePayload, QRType, QRCategory, QRPayloadData } from '@/lib/qr-payload';
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

const QR_TYPE_GROUPS: {
  id: QRCategory;
  label: string;
  items: { id: QRType; label: string; icon: React.ComponentType<{ className?: string }> }[];
}[] = [
  {
    id: 'links',
    label: 'Links & Basic',
    items: [
      { id: 'url', label: 'URL / Web', icon: LinkIcon },
      { id: 'text', label: 'Plain Text', icon: Type },
      { id: 'pincode', label: 'PIN Code', icon: Lock },
    ],
  },
  {
    id: 'contact',
    label: 'Contact & Social',
    items: [
      { id: 'vcard', label: 'vCard', icon: Contact },
      { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
      { id: 'telegram', label: 'Telegram', icon: Send },
      { id: 'messenger', label: 'Messenger', icon: MessageSquare },
      { id: 'facetime', label: 'FaceTime', icon: VideoIcon },
      { id: 'zoom', label: 'Zoom', icon: Video },
      { id: 'phone', label: 'Call', icon: Phone },
      { id: 'sms', label: 'SMS', icon: MessageSquare },
      { id: 'email', label: 'Email', icon: Mail },
      { id: 'social', label: 'Social Media', icon: Share2 },
    ],
  },
  {
    id: 'business',
    label: 'Business & Media',
    items: [
      { id: 'business', label: 'Business Profile', icon: Briefcase },
      { id: 'googleReview', label: 'Google Review', icon: Star },
      { id: 'menu', label: 'Restaurant Menu', icon: Utensils },
      { id: 'app', label: 'App Download', icon: Smartphone },
      { id: 'event', label: 'Event', icon: Calendar },
      { id: 'coupon', label: 'Coupon', icon: Ticket },
      { id: 'feedback', label: 'Feedback', icon: ThumbsUp },
    ],
  },
  {
    id: 'payments',
    label: 'Payments & Donations',
    items: [
      { id: 'upi', label: 'UPI (India)', icon: IndianRupee },
      { id: 'paypal', label: 'PayPal', icon: CreditCard },
      { id: 'crypto', label: 'Crypto', icon: Bitcoin },
      { id: 'pix', label: 'Brazilian PIX', icon: QrCode },
    ],
  },
  {
    id: 'files',
    label: 'Files & Access',
    items: [
      { id: 'wifi', label: 'WiFi', icon: Wifi },
      { id: 'location', label: 'Location', icon: MapPin },
      { id: 'pdf', label: 'PDF Document', icon: FileText },
      { id: 'images', label: 'Image Gallery', icon: ImageIcon },
      { id: 'video', label: 'Video Link', icon: Video },
      { id: 'mp3', label: 'MP3 Audio', icon: Music },
    ],
  },
];

const BODY_SHAPES: { id: DotStyle; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'dots', label: 'Dots' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'extra-rounded', label: 'Extra Round' },
  { id: 'classy', label: 'Classy' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'cross', label: 'Cross / Plus' },
  { id: 'vertical-bars', label: 'V-Bars' },
  { id: 'horizontal-bars', label: 'H-Bars' },
];

const EYE_BORDER_SHAPES: { id: FinderShape; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'circle', label: 'Circle' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'leaf-tl', label: 'Leaf TL' },
  { id: 'leaf-tr', label: 'Leaf TR' },
  { id: 'leaf-bl', label: 'Leaf BL' },
  { id: 'leaf-br', label: 'Leaf BR' },
  { id: 'cut', label: 'Cut Corner' },
  { id: 'dotted', label: 'Dotted' },
];

const EYE_CENTER_SHAPES: { id: FinderCenterShape; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'circle', label: 'Circle' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'star', label: 'Star' },
  { id: 'cross', label: 'Cross' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'sun', label: 'Sunburst' },
];

const FRAME_STYLES: { id: FrameStyle; label: string }[] = [
  { id: 'none', label: 'No Frame' },
  { id: 'simple', label: 'Simple Box' },
  { id: 'banner-bottom', label: 'Bottom Banner' },
  { id: 'banner-top', label: 'Top Banner' },
  { id: 'speech-top', label: 'Speech Bubble' },
  { id: 'clipboard', label: 'Clipboard' },
  { id: 'receipt', label: 'Receipt' },
  { id: 'gift', label: 'Gift Box' },
  { id: 'phone', label: 'Smartphone' },
  { id: 'bag', label: 'Shopping Bag' },
  { id: 'coffee', label: 'Coffee Cup' },
  { id: 'beer', label: 'Beer Mug' },
  { id: 'chef', label: 'Chef Menu' },
  { id: 'cloche', label: 'Waiter Tray' },
  { id: 'scooter', label: 'Delivery' },
  { id: 'envelope', label: 'Envelope' },
];

const QUICK_PRESETS = [
  {
    name: 'Classic Clean',
    fg: '#000000',
    bg: '#FFFFFF',
    dot: 'square' as DotStyle,
    border: 'square' as FinderShape,
    center: 'square' as FinderCenterShape,
    frame: 'none' as FrameStyle,
  },
  {
    name: 'UPI Bharat',
    fg: '#0f172a',
    bg: '#FFFFFF',
    dot: 'rounded' as DotStyle,
    border: 'rounded' as FinderShape,
    center: 'circle' as FinderCenterShape,
    frame: 'banner-bottom' as FrameStyle,
  },
  {
    name: 'Cafe Menu',
    fg: '#431407',
    bg: '#fffbeb',
    dot: 'dots' as DotStyle,
    border: 'leaf-tl' as FinderShape,
    center: 'leaf' as FinderCenterShape,
    frame: 'coffee' as FrameStyle,
  },
  {
    name: 'Cyber Indigo',
    fg: '#4f46e5',
    bg: '#FFFFFF',
    dot: 'diamond' as DotStyle,
    border: 'cut' as FinderShape,
    center: 'star' as FinderCenterShape,
    frame: 'phone' as FrameStyle,
  },
];

export default function QRStudio() {
  const [isDark, setIsDark] = useState(true);
  const [studioMode, setStudioMode] = useState<'create' | 'scanner' | 'batch'>('create');
  const [activeCategory, setActiveCategory] = useState<QRCategory>('links');
  const [type, setType] = useState<QRType>('url');
  useEffect(() => {
  const saved = localStorage.getItem('qr-theme');
  const prefersDark = saved
    ? saved === 'dark'
    : document.documentElement.classList.contains('dark') || true; // Default to Dark Mode
  setIsDark(prefersDark);
  document.documentElement.classList.toggle('dark', prefersDark);

  const handler = (e: Event) => {
    const nextDark = Boolean((e as CustomEvent).detail);
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
  };
  window.addEventListener('qr-theme-change', handler);
  return () => window.removeEventListener('qr-theme-change', handler);
}, []);
  const [data, setData] = useState<QRPayloadData>({
    url: 'https://qrgenerato.com',
    text: 'Welcome to QR Generato',
    pinCode: '123456',
    phone: '',
    message: 'Hello!',
    username: 'yourusername',
    email: 'support@qrgenerato.com',
    subject: 'Support Inquiry',
    body: 'Hello team,',
    ssid: 'MyHomeWiFi',
    password: '',
    encryption: 'WPA',
    firstName: '',
    lastName: '',
    organization: 'QR Generato',
    title: '',
    website: 'https://qrgenerato.com',
    upiId: 'merchant@upi',
    upiName: 'QR Generato',
    upiAmount: '',
    upiNote: 'Payment',
    paypalUser: 'yourusername',
    paypalAmount: '10',
    paypalCurrency: 'USD',
    cryptoType: 'bitcoin',
    cryptoAddress: '',
    cryptoAmount: '',
    pixKey: '',
    latitude: '28.6139',
    longitude: '77.2090',
    locationQuery: '',
    eventTitle: 'Product Launch',
    eventLocation: 'New Delhi, India',
    eventStart: '2026-12-01T10:00',
    eventEnd: '2026-12-01T12:00',
    appPlatform: 'android',
    appId: 'com.instagram.android',
    socialNetwork: 'instagram',
    socialHandle: 'qrgenerato',
    googlePlaceId: '',
    menuUrl: 'https://qrgenerato.com/menu.pdf',
    couponCode: 'SAVE20',
    couponDiscount: '20% OFF',
    fileUrl: 'https://qrgenerato.com/sample.pdf',
  });

  // Design States
  const [designTab, setDesignTab] = useState<'shapes' | 'colors' | 'frames' | 'logo' | 'artwork'>('shapes');
  const [dotStyle, setDotStyle] = useState<DotStyle>('square');
  const [finderShape, setFinderShape] = useState<FinderShape>('square');
  const [finderCenterShape, setFinderCenterShape] = useState<FinderCenterShape>('square');

  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [transparentBg, setTransparentBg] = useState(false);
  const [gradientType, setGradientType] = useState<GradientType>('none');
  const [gradientColor2, setGradientColor2] = useState('#4f46e5');

  const [customEyeColors, setCustomEyeColors] = useState(false);
  const [eyeBorderColor, setEyeBorderColor] = useState('#000000');
  const [eyeCenterColor, setEyeCenterColor] = useState('#4f46e5');

  const [frameStyle, setFrameStyle] = useState<FrameStyle>('none');
  const [frameText, setFrameText] = useState('Scan me!');
  const [frameColor, setFrameColor] = useState('#000000');
  const [frameTextColor, setFrameTextColor] = useState('#FFFFFF');

  const [logoUrl, setLogoUrl] = useState('');
  const [logoSize, setLogoSize] = useState(0.2);
  const [removeLogoBg, setRemoveLogoBg] = useState(true);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');

  const [artworkUrl, setArtworkUrl] = useState('');
  const [artworkOpacity, setArtworkOpacity] = useState(0.28);

  // Live Preview & Export States
  const [svgPreview, setSvgPreview] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Scanner States
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  // Batch States
  const [batchInput, setBatchInput] = useState('https://qrgenerato.com\nhttps://example.com\nupi://pay?pa=shop@upi');
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);

 const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('qr-theme', nextDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextDark);
    window.dispatchEvent(new CustomEvent('qr-theme-change', { detail: nextDark }));

    if (nextDark && frameColor === '#000000') {
      setFrameColor('#4f46e5');
    } else if (!nextDark && frameColor === '#4f46e5') {
      setFrameColor('#000000');
    }
  };

  // Defer input updates so mobile typing stays 60fps
  const deferredData = useDeferredValue(data);
  const deferredFgColor = useDeferredValue(fgColor);
  const deferredBgColor = useDeferredValue(bgColor);

  const payload = generatePayload(type, deferredData);

  const qrOptions: QROptions = {
    text: payload,
    size: 400,
    margin: 2,
    fgColor: deferredFgColor,
    bgColor: deferredBgColor,
    transparentBg,
    gradientType,
    gradientColor2,
    dotStyle,
    finderShape,
    finderCenterShape,
    eyeBorderColor: customEyeColors ? eyeBorderColor : undefined,
    eyeCenterColor: customEyeColors ? eyeCenterColor : undefined,
    logoUrl: logoUrl || undefined,
    logoSize,
    removeLogoBg,
    frameStyle,
    frameText,
    frameColor,
    frameTextColor,
    errorCorrectionLevel,
    artworkUrl: artworkUrl || undefined,
    artworkOpacity,
  };

  // Generate lightweight SVG string for instant zero-lag preview
  useEffect(() => {
    let active = true;
    generateQRSvg(qrOptions).then((svg) => {
      if (active) setSvgPreview(svg);
    });
    return () => {
      active = false;
    };
  }, [
    payload,
    deferredFgColor,
    deferredBgColor,
    transparentBg,
    gradientType,
    gradientColor2,
    dotStyle,
    finderShape,
    finderCenterShape,
    customEyeColors,
    eyeBorderColor,
    eyeCenterColor,
    logoUrl,
    logoSize,
    removeLogoBg,
    frameStyle,
    frameText,
    frameColor,
    frameTextColor,
    errorCorrectionLevel,
    artworkUrl,
    artworkOpacity,
  ]);

  const updateField = (key: keyof QRPayloadData, value: string | boolean) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleInvertColors = () => {
    const prevFg = fgColor;
    const prevBg = bgColor;
    setFgColor(prevBg);
    setBgColor(prevFg);
    if (customEyeColors) {
      setEyeBorderColor(eyeCenterColor);
      setEyeCenterColor(eyeBorderColor);
    }
  };

  // Export High-Res PNG on demand
  const handleDownloadPng = async () => {
    const canvas = document.createElement('canvas');
    await drawQRToCanvas(canvas, { ...qrOptions, size: 1200 });
    const link = document.createElement('a');
    link.download = `qrgenerato-${type}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Export Vector SVG
  const handleDownloadSvg = async () => {
    const svg = await generateQRSvg({ ...qrOptions, size: 1000 });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrgenerato-${type}-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy QR Image to Clipboard
  const handleCopyImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      await drawQRToCanvas(canvas, { ...qrOptions, size: 800 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  // Custom Background / Artwork Image Upload
  const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setArtworkUrl(String(reader.result));
      setArtworkOpacity(0.85);
    };
    reader.readAsDataURL(file);
  };

  // --- UPGRADED MULTI-SCALE + NATIVE AI QR SCANNER ---
  const handleScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError('');
    setScanResult('');

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        if ('BarcodeDetector' in window) {
          try {
            // @ts-expect-error BarcodeDetector is supported in modern Chromium/Android browsers
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(img);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              setScanResult(barcodes[0].rawValue);
              URL.revokeObjectURL(objectUrl);
              return;
            }
          } catch {
            // Fall through to multi-scale jsQR
          }
        }

        const { default: jsQR } = await import('jsqr');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Canvas unavailable');

        const testConfigs = [
          { maxDim: 800, pad: 40, contrast: false },
          { maxDim: 500, pad: 50, contrast: false },
          { maxDim: 1200, pad: 20, contrast: false },
          { maxDim: 600, pad: 50, contrast: true },
        ];

        for (const { maxDim, pad, contrast } of testConfigs) {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const drawW = Math.max(1, Math.round(img.width * scale));
          const drawH = Math.max(1, Math.round(img.height * scale));

          canvas.width = drawW + pad * 2;
          canvas.height = drawH + pad * 2;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.filter = contrast ? 'grayscale(100%) contrast(250%)' : 'none';
          ctx.drawImage(img, pad, pad, drawW, drawH);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            setScanResult(code.data);
            URL.revokeObjectURL(objectUrl);
            return;
          }
        }

        setScanError('Could not detect a valid QR code in that image.');
      } catch {
        setScanError('Could not detect a valid QR code in that image.');
      } finally {
        URL.revokeObjectURL(objectUrl);
        e.target.value = '';
      }
    };

    img.onerror = () => {
      setScanError('Failed to load image file.');
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const stopCamera = () => {
    if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setScanError('');
    setScanResult('');
    try {
      const { default: jsQR } = await import('jsqr');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsCameraActive(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const tick = () => {
        if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA || !ctx) {
          scanLoopRef.current = requestAnimationFrame(tick);
          return;
        }
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        if (code && code.data) {
          setScanResult(code.data);
          stopCamera();
          return;
        }
        scanLoopRef.current = requestAnimationFrame(tick);
      };
      scanLoopRef.current = requestAnimationFrame(tick);
    } catch {
      setScanError('Camera permission denied or no camera found.');
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // --- LAZY-LOADED BATCH ZIP GENERATOR ---
  const handleBatchDownload = async () => {
    const lines = batchInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (!lines.length) return;

    setIsBatchGenerating(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      for (let i = 0; i < lines.length; i++) {
        const svg = await generateQRSvg({ ...qrOptions, text: lines[i], size: 800 });
        zip.file(`qr-${i + 1}.svg`, svg);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrgenerato-batch-${lines.length}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  // Dynamic Theme Helper Classes
  const cardClass = isDark
    ? 'bg-[#111115] border border-zinc-800/80 text-zinc-100'
    : 'bg-white border border-slate-200/90 text-slate-900 shadow-sm';

  const inputClass = isDark
    ? 'w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none'
    : 'w-full rounded-lg bg-slate-50 border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none';

  const labelClass = isDark
    ? 'block text-xs font-medium text-zinc-400 mb-1.5'
    : 'block text-xs font-medium text-slate-600 mb-1.5';

  const chipIdleClass = isDark
    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900';

  const chipActiveIndigoClass = isDark
    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold'
    : 'bg-indigo-50 border-indigo-600 text-indigo-700 font-semibold';

  const primaryBtnClass = isDark
    ? 'bg-white text-black hover:bg-zinc-200'
    : 'bg-slate-900 text-white hover:bg-slate-800';

  const dividerClass = isDark ? 'border-zinc-800/80' : 'border-slate-200';

  return (
    <div className={clsx('min-h-screen transition-colors duration-150', isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50/70 text-slate-900')}>
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        {/* Top Studio Mode Switcher + Quick Presets + Theme Toggle */}
        <div className={clsx('flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b', dividerClass)}>
          <div className={clsx('flex items-center gap-1.5 p-1 rounded-xl border', isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200')}>
            <button
              onClick={() => {
                stopCamera();
                setStudioMode('create');
              }}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                studioMode === 'create'
                  ? isDark ? 'bg-white text-black' : 'bg-slate-900 text-white shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <QrCode className="w-4 h-4" /> Create QR
            </button>
            <button
              onClick={() => setStudioMode('scanner')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                studioMode === 'scanner'
                  ? isDark ? 'bg-white text-black' : 'bg-slate-900 text-white shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Camera className="w-4 h-4" /> QR Scanner
            </button>
            <button
              onClick={() => {
                stopCamera();
                setStudioMode('batch');
              }}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                studioMode === 'batch'
                  ? isDark ? 'bg-white text-black' : 'bg-slate-900 text-white shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <FileSpreadsheet className="w-4 h-4" /> Batch Studio
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {/* 1-Click Quick Style Presets */}
            {studioMode === 'create' && (
              <div className="flex items-center gap-2 mr-2">
                <span className={clsx('text-xs font-medium whitespace-nowrap', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                  Quick Style:
                </span>
                {QUICK_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setFgColor(p.fg);
                      setBgColor(p.bg);
                      setDotStyle(p.dot);
                      setFinderShape(p.border);
                      setFinderCenterShape(p.center);
                      setFrameStyle(p.frame);
                    }}
                    className={clsx(
                      'px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors',
                      chipIdleClass
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {/* Light / Dark Theme Button */}
            <button
              onClick={toggleTheme}
              className={clsx(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors',
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
              )}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        {/* MODE 1: CREATE QR STUDIO */}
        {studioMode === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 7 COLUMNS: DATA & CUSTOMIZATION */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Category & QR Type Selector */}
              <div className={clsx('rounded-2xl p-5', cardClass)}>
                <div className={clsx('flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b', dividerClass)}>
                  {QR_TYPE_GROUPS.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setActiveCategory(group.id);
                        setType(group.items[0].id);
                      }}
                      className={clsx(
                        'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors',
                        activeCategory === group.id ? chipActiveIndigoClass : chipIdleClass
                      )}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {QR_TYPE_GROUPS.find((g) => g.id === activeCategory)?.items.map((item) => {
                    const Icon = item.icon;
                    const active = type === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setType(item.id)}
                        className={clsx(
                          'flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-center transition-colors',
                          active
                            ? isDark
                              ? 'bg-white text-black border-white font-semibold'
                              : 'bg-slate-900 text-white border-slate-900 font-semibold shadow-sm'
                            : chipIdleClass
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Dynamic Payload Form */}
              <div className={clsx('rounded-2xl p-5 space-y-4', cardClass)}>
                <h2 className={clsx('text-sm font-semibold uppercase tracking-wider', isDark ? 'text-zinc-200' : 'text-slate-800')}>
                  Enter {type.toUpperCase()} Details
                </h2>

                {type === 'url' && (
                  <div>
                    <label className={labelClass}>Website URL</label>
                    <input
                      type="url"
                      value={data.url || ''}
                      onChange={(e) => updateField('url', e.target.value)}
                      placeholder="https://example.com"
                      className={inputClass}
                    />
                  </div>
                )}

                {type === 'text' && (
                  <div>
                    <label className={labelClass}>Plain Text</label>
                    <textarea
                      rows={3}
                      value={data.text || ''}
                      onChange={(e) => updateField('text', e.target.value)}
                      placeholder="Write any text or note..."
                      className={inputClass}
                    />
                  </div>
                )}

                {type === 'pincode' && (
                  <div>
                    <label className={labelClass}>Access PIN / Code</label>
                    <input
                      type="text"
                      value={data.pinCode || ''}
                      onChange={(e) => updateField('pinCode', e.target.value)}
                      placeholder="123456"
                      className={inputClass}
                    />
                  </div>
                )}

                {(type === 'phone' || type === 'facetime') && (
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      type="tel"
                      value={data.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className={inputClass}
                    />
                  </div>
                )}

                {(type === 'sms' || type === 'whatsapp') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Phone Number (with country code)</label>
                      <input
                        type="tel"
                        value={data.phone || ''}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+919876543210"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Pre-filled Message</label>
                      <input
                        type="text"
                        value={data.message || ''}
                        onChange={(e) => updateField('message', e.target.value)}
                        placeholder="Hi, I scanned your QR code!"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {(type === 'telegram' || type === 'messenger') && (
                  <div>
                    <label className={labelClass}>Username</label>
                    <input
                      type="text"
                      value={data.username || ''}
                      onChange={(e) => updateField('username', e.target.value)}
                      placeholder="yourusername"
                      className={inputClass}
                    />
                  </div>
                )}

                {type === 'zoom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Zoom Meeting ID or Full Link</label>
                      <input
                        type="text"
                        value={data.zoomId || ''}
                        onChange={(e) => updateField('zoomId', e.target.value)}
                        placeholder="123 456 7890"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Passcode (Optional)</label>
                      <input
                        type="text"
                        value={data.zoomPass || ''}
                        onChange={(e) => updateField('zoomPass', e.target.value)}
                        placeholder="123456"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {type === 'email' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Recipient Email</label>
                        <input
                          type="email"
                          value={data.email || ''}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="support@qrgenerato.com"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Subject</label>
                        <input
                          type="text"
                          value={data.subject || ''}
                          onChange={(e) => updateField('subject', e.target.value)}
                          placeholder="Hello"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Message Body</label>
                      <textarea
                        rows={2}
                        value={data.body || ''}
                        onChange={(e) => updateField('body', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {type === 'social' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Platform</label>
                      <select
                        value={data.socialNetwork || 'instagram'}
                        onChange={(e) => updateField('socialNetwork', e.target.value)}
                        className={inputClass}
                      >
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="x">X (Twitter)</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="facebook">Facebook</option>
                        <option value="tiktok">TikTok</option>
                        <option value="spotify">Spotify</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Username / Handle</label>
                      <input
                        type="text"
                        value={data.socialHandle || ''}
                        onChange={(e) => updateField('socialHandle', e.target.value)}
                        placeholder="@username"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {(type === 'vcard' || type === 'business') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        type="text"
                        value={data.firstName || ''}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        type="text"
                        value={data.lastName || ''}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Company / Business Name</label>
                      <input
                        type="text"
                        value={data.organization || ''}
                        onChange={(e) => updateField('organization', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Job Title / Category</label>
                      <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        type="tel"
                        value={data.phone || ''}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Website</label>
                      <input
                        type="url"
                        value={data.website || ''}
                        onChange={(e) => updateField('website', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {type === 'upi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>UPI ID (VPA)</label>
                      <input
                        type="text"
                        value={data.upiId || ''}
                        onChange={(e) => updateField('upiId', e.target.value)}
                        placeholder="merchant@okaxis"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Payee Name</label>
                      <input
                        type="text"
                        value={data.upiName || ''}
                        onChange={(e) => updateField('upiName', e.target.value)}
                        placeholder="Store Name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Amount in INR (Optional)</label>
                      <input
                        type="number"
                        value={data.upiAmount || ''}
                        onChange={(e) => updateField('upiAmount', e.target.value)}
                        placeholder="500"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Note / Remarks</label>
                      <input
                        type="text"
                        value={data.upiNote || ''}
                        onChange={(e) => updateField('upiNote', e.target.value)}
                        placeholder="Order Payment"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {type === 'paypal' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>PayPal.Me Username</label>
                      <input
                        type="text"
                        value={data.paypalUser || ''}
                        onChange={(e) => updateField('paypalUser', e.target.value)}
                        placeholder="username"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Amount</label>
                      <input
                        type="number"
                        value={data.paypalAmount || ''}
                        onChange={(e) => updateField('paypalAmount', e.target.value)}
                        placeholder="10"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Currency</label>
                      <input
                        type="text"
                        value={data.paypalCurrency || 'USD'}
                        onChange={(e) => updateField('paypalCurrency', e.target.value)}
                        placeholder="USD"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {type === 'crypto' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Coin</label>
                      <select
                        value={data.cryptoType || 'bitcoin'}
                        onChange={(e) => updateField('cryptoType', e.target.value)}
                        className={inputClass}
                      >
                        <option value="bitcoin">Bitcoin (BTC)</option>
                        <option value="ethereum">Ethereum (ETH)</option>
                        <option value="solana">Solana (SOL)</option>
                        <option value="usdt">Tether (USDT)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Wallet Address</label>
                      <input
                        type="text"
                        value={data.cryptoAddress || ''}
                        onChange={(e) => updateField('cryptoAddress', e.target.value)}
                        placeholder="bc1q..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Amount (Optional)</label>
                      <input
                        type="text"
                        value={data.cryptoAmount || ''}
                        onChange={(e) => updateField('cryptoAmount', e.target.value)}
                        placeholder="0.01"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {type === 'pix' && (
                  <div>
                    <label className={labelClass}>PIX Key or Copy-Paste Code</label>
                    <input
                      type="text"
                      value={data.pixKey || ''}
                      onChange={(e) => updateField('pixKey', e.target.value)}
                      placeholder="CPF, Email, Phone, or PIX Payload"
                      className={inputClass}
                    />
                  </div>
                )}

                {type === 'wifi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Network Name (SSID)</label>
                      <input
                        type="text"
                        value={data.ssid || ''}
                        onChange={(e) => updateField('ssid', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Password</label>
                      <input
                        type="text"
                        value={data.password || ''}
                        onChange={(e) => updateField('password', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Security</label>
                      <select
                        value={data.encryption || 'WPA'}
                        onChange={(e) => updateField('encryption', e.target.value)}
                        className={inputClass}
                      >
                        <option value="WPA">WPA / WPA2 / WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">No Password</option>
                      </select>
                    </div>
                  </div>
                )}

                {type === 'location' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-3">
                      <label className={labelClass}>Place Search Query (or use Lat/Long below)</label>
                      <input
                        type="text"
                        value={data.locationQuery || ''}
                        onChange={(e) => updateField('locationQuery', e.target.value)}
                        placeholder="Connaught Place, New Delhi"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Latitude</label>
                      <input
                        type="text"
                        value={data.latitude || ''}
                        onChange={(e) => updateField('latitude', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Longitude</label>
                      <input
                        type="text"
                        value={data.longitude || ''}
                        onChange={(e) => updateField('longitude', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {type === 'event' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Event Title</label>
                      <input
                        type="text"
                        value={data.eventTitle || ''}
                        onChange={(e) => updateField('eventTitle', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Location</label>
                      <input
                        type="text"
                        value={data.eventLocation || ''}
                        onChange={(e) => updateField('eventLocation', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Start Time</label>
                      <input
                        type="datetime-local"
                        value={data.eventStart || ''}
                        onChange={(e) => updateField('eventStart', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Time</label>
                      <input
                        type="datetime-local"
                        value={data.eventEnd || ''}
                        onChange={(e) => updateField('eventEnd', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {type === 'app' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Platform</label>
                      <select
                        value={data.appPlatform || 'android'}
                        onChange={(e) => updateField('appPlatform', e.target.value)}
                        className={inputClass}
                      >
                        <option value="android">Google Play (Android)</option>
                        <option value="ios">Apple App Store (iOS)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Package ID or Store Link</label>
                      <input
                        type="text"
                        value={data.appId || ''}
                        onChange={(e) => updateField('appId', e.target.value)}
                        placeholder="com.instagram.android"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {type === 'coupon' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Coupon Code</label>
                      <input
                        type="text"
                        value={data.couponCode || ''}
                        onChange={(e) => updateField('couponCode', e.target.value)}
                        placeholder="SAVE20"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Discount Offer</label>
                      <input
                        type="text"
                        value={data.couponDiscount || ''}
                        onChange={(e) => updateField('couponDiscount', e.target.value)}
                        placeholder="20% OFF"
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {['googleReview', 'menu', 'pdf', 'images', 'video', 'mp3', 'feedback'].includes(type) && (
                  <div>
                    <label className={labelClass}>Direct Link (Google Drive, PDF, Menu, or Review URL)</label>
                    <input
                      type="url"
                      value={data.fileUrl || ''}
                      onChange={(e) => updateField('fileUrl', e.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              {/* Step 3: Studio Customization Tabs */}
              <div className={clsx('rounded-2xl p-5 space-y-5', cardClass)}>
                <div className={clsx('flex items-center gap-2 overflow-x-auto pb-3 border-b', dividerClass)}>
                  {[
                    { id: 'shapes', label: 'Shape & Eyes', icon: Eye },
                    { id: 'frames', label: 'Frames', icon: Frame },
                    { id: 'colors', label: 'Colors', icon: Palette },
                    { id: 'logo', label: 'Logo', icon: ImageIcon },
                    { id: 'artwork', label: 'Art Presets', icon: Sparkles },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setDesignTab(t.id as typeof designTab)}
                        className={clsx(
                          'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors',
                          designTab === t.id
                            ? isDark
                              ? 'bg-white text-black border-white'
                              : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : chipIdleClass
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

       {/* TAB: SHAPES & INDEPENDENT EYES (Polished Sub-Cards) */}
              {designTab === 'shapes' && (
                <div className="space-y-4">
                  <div className={clsx('p-3.5 rounded-xl border', isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/80')}>
                    <label className={labelClass}>1. Body Dot Style</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {BODY_SHAPES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setDotStyle(s.id)}
                          className={clsx(
                            'py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all',
                            dotStyle === s.id
                              ? isDark
                                ? 'bg-white text-black border-white shadow-sm'
                                : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : isDark
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={clsx('p-3.5 rounded-xl border', isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/80')}>
                    <label className={labelClass}>2. Eye Frame (Outer Corner Ring)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {EYE_BORDER_SHAPES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setFinderShape(s.id)}
                          className={clsx(
                            'py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all',
                            finderShape === s.id
                              ? isDark
                                ? 'bg-white text-black border-white shadow-sm'
                                : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : isDark
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={clsx('p-3.5 rounded-xl border', isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-slate-50/80 border-slate-200/80')}>
                    <label className={labelClass}>3. Eye Center (Inner Corner Dot)</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {EYE_CENTER_SHAPES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setFinderCenterShape(s.id)}
                          className={clsx(
                            'py-2 px-2 rounded-lg border text-xs font-semibold transition-all',
                            finderCenterShape === s.id
                              ? isDark
                                ? 'bg-white text-black border-white shadow-sm'
                                : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : isDark
                              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Independent Eye Color Toggle */}
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customEyeColors}
                        onChange={(e) => setCustomEyeColors(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      Custom Corner Eye Colors
                    </label>

                    {customEyeColors && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-75">Border:</span>
                          <input
                            type="color"
                            value={eyeBorderColor}
                            onChange={(e) => setEyeBorderColor(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-75">Center:</span>
                          <input
                            type="color"
                            value={eyeCenterColor}
                            onChange={(e) => setEyeCenterColor(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
                {/* TAB: ILLUSTRATED FRAMES */}
                {designTab === 'frames' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {FRAME_STYLES.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFrameStyle(f.id)}
                          className={clsx(
                            'py-2.5 px-3 rounded-lg border text-xs font-medium transition-colors',
                            frameStyle === f.id ? chipActiveIndigoClass : chipIdleClass
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {frameStyle !== 'none' && (
                      <div className={clsx('grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t', dividerClass)}>
                        <div>
                          <label className={labelClass}>Frame Text</label>
                          <input
                            type="text"
                            value={frameText}
                            onChange={(e) => setFrameText(e.target.value)}
                            placeholder="Scan me!"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Frame Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={frameColor}
                              onChange={(e) => setFrameColor(e.target.value)}
                              className="w-9 h-9 rounded bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={frameColor}
                              onChange={(e) => setFrameColor(e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Text Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={frameTextColor}
                              onChange={(e) => setFrameTextColor(e.target.value)}
                              className="w-9 h-9 rounded bg-transparent cursor-pointer"
                            />
                            <input
                              type="text"
                              value={frameTextColor}
                              onChange={(e) => setFrameTextColor(e.target.value)}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: COLORS & INVERT */}
                {designTab === 'colors' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={clsx('text-xs font-medium', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                        QR Foreground & Background
                      </span>
                      <button
                        onClick={handleInvertColors}
                        className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium', chipIdleClass)}
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" /> Invert
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Foreground Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={bgColor}
                            disabled={transparentBg}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={bgColor}
                            disabled={transparentBg}
                            onChange={(e) => setBgColor(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <label className={clsx('flex items-center gap-2 text-xs cursor-pointer', isDark ? 'text-zinc-300' : 'text-slate-700')}>
                        <input
                          type="checkbox"
                          checked={transparentBg}
                          onChange={(e) => setTransparentBg(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        Transparent Background
                      </label>

                      <div className="flex items-center gap-2">
                        <span className={clsx('text-xs', isDark ? 'text-zinc-400' : 'text-slate-600')}>Gradient:</span>
                        {(['none', 'linear', 'radial'] as GradientType[]).map((g) => (
                          <button
                            key={g}
                            onClick={() => setGradientType(g)}
                            className={clsx(
                              'px-2.5 py-1 rounded text-xs capitalize border',
                              gradientType === g ? chipActiveIndigoClass : chipIdleClass
                            )}
                          >
                            {g}
                          </button>
                        ))}
                        {gradientType !== 'none' && (
                          <input
                            type="color"
                            value={gradientColor2}
                            onChange={(e) => setGradientColor2(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer bg-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: LOGO & ERROR CORRECTION */}
                {designTab === 'logo' && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors', primaryBtnClass)}>
                        <Upload className="w-4 h-4" /> Upload Custom Logo
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>

                      <label className={clsx('flex items-center gap-2 text-xs cursor-pointer px-3 py-2 rounded-xl border', chipIdleClass)}>
                        <input
                          type="checkbox"
                          checked={removeLogoBg}
                          onChange={(e) => setRemoveLogoBg(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        Logo Badge Border & Clear Dots
                      </label>

                      {logoUrl && (
                        <button
                          onClick={() => setLogoUrl('')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Logo
                        </button>
                      )}
                    </div>

                    {/* Built-in Instant Brand Badges */}
                    <div>
                      <label className={labelClass}>Or Pick an Instant Center Badge</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {[
                          {
                            name: 'UPI Pay',
                            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0f172a"/><text x="50" y="62" text-anchor="middle" fill="#10b981" font-family="sans-serif" font-weight="900" font-size="34">₹ UPI</text></svg>`,
                          },
                          {
                            name: 'WhatsApp',
                            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#25D366"/><path d="M50 22c-15.5 0-28 12.5-28 28 0 5.3 1.5 10.3 4.1 14.5L22 78l14-4c4 2.3 8.8 3.6 14 3.6 15.5 0 28-12.5 28-28S65.5 22 50 22zm16.3 39.6c-.7 2-4 3.8-5.6 4-.9.1-2.1.2-6.6-1.6-8.1-3.2-13.3-11.5-13.7-12-.4-.5-3.3-4.4-3.3-8.4s2.1-6 2.8-6.8c.7-.8 1.6-1 2.1-1h1.5c.5 0 1.2-.2 1.8 1.4.7 1.6 2.3 5.6 2.5 6 .2.4.3.9.1 1.4-.3.5-.4.9-.8 1.3-.4.5-.9 1-1.2 1.4-.4.4-.8.9-.3 1.7.5.8 2.1 3.5 4.5 5.6 3.1 2.8 5.7 3.6 6.5 4 .8.4 1.3.3 1.8-.2.5-.5 2.1-2.4 2.6-3.2.5-.8 1.1-.7 1.8-.4.7.3 4.7 2.2 5.5 2.6.8.4 1.3.6 1.5.9.2.4.2 2-.5 3.9z" fill="#fff"/></svg>`,
                          },
                          {
                            name: 'Instagram',
                            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#f09433"/><stop offset="50%" stop-color="#dc2743"/><stop offset="100%" stop-color="#bc1888"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#ig)"/><rect x="23" y="23" width="54" height="54" rx="14" fill="none" stroke="#fff" stroke-width="6"/><circle cx="50" cy="50" r="12" fill="none" stroke="#fff" stroke-width="6"/><circle cx="65" cy="35" r="3.5" fill="#fff"/></svg>`,
                          },
                          {
                            name: 'YouTube',
                            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#FF0000"/><polygon points="42,34 42,66 68,50" fill="#FFFFFF"/></svg>`,
                          },
                          {
                            name: 'WiFi',
                            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0284c7"/><path d="M22 42 C38 26, 62 26, 78 42 M32 54 C42 44, 58 44, 68 54" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="68" r="6" fill="#fff"/></svg>`,
                          },
                          {
                            name: 'Scan Star',
                            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#4f46e5"/><polygon points="50,18 59,39 82,39 63,53 70,76 50,62 30,76 37,53 18,39 41,39" fill="#ffffff"/></svg>`,
                          },
                        ].map((badge) => {
                          const uri = `data:image/svg+xml;utf8,${encodeURIComponent(badge.svg)}`;
                          return (
                            <button
                              key={badge.name}
                              onClick={() => setLogoUrl(uri)}
                              className={clsx(
                                'flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-colors',
                                logoUrl === uri ? chipActiveIndigoClass : chipIdleClass
                              )}
                            >
                              <img src={uri} alt={badge.name} className="w-8 h-8 rounded-lg" />
                              <span className="text-[11px]">{badge.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={clsx('grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t', dividerClass)}>
                      <div>
                        <label className={labelClass}>Logo Size ({Math.round(logoSize * 100)}%)</label>
                        <input
                          type="range"
                          min="0.14"
                          max="0.28"
                          step="0.02"
                          value={logoSize}
                          onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Error Correction Level</label>
                        <div className="flex gap-2">
                          {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => setErrorCorrectionLevel(lvl)}
                              className={clsx(
                                'flex-1 py-1.5 rounded border text-xs font-semibold',
                                errorCorrectionLevel === lvl
                                  ? isDark
                                    ? 'bg-white text-black border-white'
                                    : 'bg-slate-900 text-white border-slate-900'
                                  : chipIdleClass
                              )}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

{/* TAB: ARTWORK PRESETS & CUSTOM IMAGE UPLOAD */}
              {designTab === 'artwork' && (
                <div className="space-y-4">
                  {/* Custom Image Upload Bar */}
                  <div className={clsx("flex flex-wrap items-center justify-between gap-3 pb-3 border-b", isDark ? "border-zinc-800" : "border-slate-200")}>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors",
                        isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-slate-900 text-white hover:bg-slate-800"
                      )}>
                        <Upload className="w-4 h-4" /> Upload Custom Art
                        <input type="file" accept="image/*" onChange={handleArtworkUpload} className="hidden" />
                      </label>
                      
                      {/* NEW: Upload Logo straight from the Artwork Tab */}
                      <label className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors",
                        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                      )}>
                        <ImageIcon className="w-3.5 h-3.5" /> Upload as Logo
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>

                      {/* NEW: Convert Active Art to Logo */}
                      {artworkUrl && (
                        <button
                          onClick={() => {
                            setLogoUrl(artworkUrl);
                            setArtworkUrl(''); // Clear the background so it becomes a logo only
                            setDesignTab('logo'); // Auto-switch to logo tab to adjust badge size
                          }}
                          className={clsx(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors",
                            isDark ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30" : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                          )}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" /> Convert Art to Logo
                        </button>
                      )}

                      {artworkUrl && (
                        <button
                          onClick={() => setArtworkUrl('')}
                          className={clsx(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors",
                            isDark ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                          )}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear Art
                        </button>
                      )}
                    </div>

                    {artworkUrl && (
                      <div className="flex items-center gap-2">
                        <span className={clsx("text-xs font-medium", isDark ? "text-zinc-400" : "text-slate-500")}>Art Intensity:</span>
                        <input
                          type="range"
                          min="0.35"
                          max="0.95"
                          step="0.05"
                          value={artworkOpacity}
                          onChange={(e) => setArtworkOpacity(parseFloat(e.target.value))}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>

                  {/* Visual Thumbnail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      onClick={() => setArtworkUrl('')}
                      className={clsx(
                        'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-colors',
                        !artworkUrl
                          ? isDark ? 'bg-white text-black border-white font-semibold' : 'bg-slate-900 text-white border-slate-900 font-semibold'
                          : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      )}
                    >
                      <div className={clsx("w-12 h-12 rounded-lg border border-dashed flex items-center justify-center text-[10px]", isDark ? "border-zinc-600" : "border-slate-300")}>
                        Clean
                      </div>
                      <span>None (Clean)</span>
                    </button>
{PRESET_ARTWORKS.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => {
                          setArtworkUrl(art.url);
                          setArtworkOpacity(0.85);
                          setFgColor(art.fg);
                        }}
                        className={clsx(
                          'flex flex-col items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-colors',
                          artworkUrl === art.url
                            ? isDark ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm'
                        )}
                      >
                        <img
                          src={art.url}
                          alt={art.name}
                          className={clsx("w-12 h-12 rounded-lg object-cover border", isDark ? "border-zinc-700" : "border-slate-200")}
                        />
                        <span className="truncate w-full text-center">{art.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* END OF LEFT 7 COLUMNS */}

          {/* RIGHT 5 COLUMNS: STICKY INSTANT SVG PREVIEW & EXPORT */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <div className={clsx('rounded-2xl p-6 flex flex-col items-center border', isDark ? 'bg-[#111115] border-zinc-800/80' : 'bg-white border-slate-200 shadow-sm')}>
              <div className="w-full flex items-center justify-between mb-4">
                <span className={clsx('text-xs font-semibold uppercase tracking-wider', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                  Live QR Preview
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  Scannable • Vector
                </span>
              </div>

              {/* High-Contrast Studio Artboard */}
              <div
                className={clsx(
                  'w-full max-w-[310px] aspect-square rounded-2xl p-5 flex items-center justify-center border overflow-hidden transition-colors [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[270px] [&>svg]:drop-shadow-md',
                  frameColor.toLowerCase() === '#ffffff'
                    ? 'bg-zinc-900 border-zinc-800'
                    : 'bg-slate-100/90 border-slate-200/80'
                )}
                dangerouslySetInnerHTML={{ __html: svgPreview }}
              />
{/* NEW: Instant Color Themes */}
              <div className="w-full mt-6 mb-2">
                <div className="flex items-center justify-between mb-3">
                  <span className={clsx("flex items-center gap-1.5 text-xs font-semibold", isDark ? "text-zinc-300" : "text-slate-700")}>
                    <Sparkles className="w-3.5 h-3.5" /> Instant Color Themes
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-500">100% Scannable</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { name: 'Royal', fg: '#8b5cf6', g2: '#ec4899', from: 'from-violet-500', to: 'to-pink-500' },
                    { name: 'Emerald', fg: '#059669', g2: '#10b981', from: 'from-emerald-600', to: 'to-emerald-400' },
                    { name: 'Oceanic', fg: '#2563eb', g2: '#06b6d4', from: 'from-blue-600', to: 'to-cyan-400' },
                    { name: 'Sunset', fg: '#e11d48', g2: '#f97316', from: 'from-rose-600', to: 'to-orange-500' },
                    { name: 'Gold', fg: '#d97706', g2: '#eab308', from: 'from-amber-600', to: 'to-yellow-400' },
                  ].map((t) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        setFgColor(t.fg);
                        setGradientColor2(t.g2);
                        setGradientType('linear');
                        setFrameColor(t.fg);
                        setTransparentBg(false);
                      }}
                      className={clsx(
                        "flex flex-col items-center gap-1.5 p-2 rounded-xl border min-w-[76px] transition-colors",
                        isDark ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      )}
                    >
                      <div className={`w-full h-7 rounded-lg bg-gradient-to-r ${t.from} ${t.to}`} />
                      <span className={clsx("text-[10px] font-semibold", isDark ? "text-zinc-400" : "text-slate-600")}>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={handleDownloadPng}
                  className={clsx('flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-colors', isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800')}
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className={clsx('flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-semibold text-sm transition-colors', isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50')}
                >
                  <Download className="w-4 h-4" /> Vector SVG
                </button>
              </div>

              <button
                onClick={handleCopyImage}
                className={clsx('w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-medium transition-colors', isDark ? 'bg-zinc-900/70 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50')}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy QR Image'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODE 2: BUILT-IN QR SCANNER */}
      {studioMode === 'scanner' && (
          <div className={clsx('max-w-2xl mx-auto rounded-2xl p-6 space-y-5', cardClass)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">QR Code Scanner</h2>
                <p className={clsx('text-xs', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                  Upload any screenshot/QR image or scan using your camera.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold', primaryBtnClass)}
                  >
                    <Play className="w-3.5 h-3.5" /> Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold"
                  >
                    <Square className="w-3.5 h-3.5" /> Stop Camera
                  </button>
                )}
                <label className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold cursor-pointer', chipIdleClass)}>
                  <Upload className="w-3.5 h-3.5" /> Upload Image
                  <input type="file" accept="image/*" onChange={handleScanUpload} className="hidden" />
                </label>
              </div>
            </div>

            {isCameraActive && (
              <div className="rounded-xl overflow-hidden bg-black border border-zinc-800">
                <video ref={videoRef} className="w-full max-h-[340px] object-cover" playsInline muted />
              </div>
            )}

            {scanError && (
              <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {scanResult && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Decoded QR Content
                </div>
                <p className={clsx('text-sm break-all font-mono p-3 rounded-lg border', isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900')}>
                  {scanResult}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(scanResult)}
                    className={clsx('px-3 py-1.5 rounded-lg border text-xs font-medium', chipIdleClass)}
                  >
                    Copy Result
                  </button>
                  {scanResult.startsWith('http') && (
                    <a
                      href={scanResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold', primaryBtnClass)}
                    >
                      Open URL
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: BATCH STUDIO */}
        {studioMode === 'batch' && (
          <div className={clsx('max-w-2xl mx-auto rounded-2xl p-6 space-y-4', cardClass)}>
            <h2 className="text-base font-semibold">Batch QR Generator (Up to 50)</h2>
            <p className={clsx('text-xs', isDark ? 'text-zinc-400' : 'text-slate-500')}>
              Enter one URL, text, or UPI link per line. Each QR code will use your current style settings and export inside a ZIP archive.
            </p>
            <textarea
              rows={7}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              className={inputClass}
              placeholder="https://qrgenerato.com&#10;https://example.com"
            />
            <button
              onClick={handleBatchDownload}
              disabled={isBatchGenerating}
              className={clsx('w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors', primaryBtnClass)}
            >
              {isBatchGenerating ? 'Generating ZIP Archive...' : 'Download All as ZIP (.svg)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}