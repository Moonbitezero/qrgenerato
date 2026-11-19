// components/qr-studio.tsx
'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useDeferredValue,
} from 'react';
import QRCode from 'qrcode';
import clsx from 'clsx';
import {
  ANIMATED_EFFECTS,
  ANIMATED_EFFECT_MAP,
  FX_GROUPS,
  POPULAR_FX,
  buildFxLayer,
  effectLoopSeconds,
  isDarkColor,
  moduleDelay,
  renderEffectThumb,
  wrapModule,
  type FxGroupId,
} from '@/lib/qr-animations';
import { downloadBlob, exportGif, exportMp4 } from '@/lib/qr-export';
import DynamicQrPanel from '@/components/dynamic-qr-panel';
import QuickFill from '@/components/quick-fill';
import FileUploadPanel from '@/components/file-upload-panel';
import type { FileKind, OwnedFile } from '@/lib/file-client';
import { decodeQr } from '@/lib/qr-decode';
import { detect, type Detected } from '@/lib/smart-import';
import { BATCH_LIMIT, buildBatchZip, parseBatchLines } from '@/lib/qr-batch';
import { EXTRA_ART_PRESETS } from '@/lib/qr-art-extra';
import { DECO_FRAMES, DECO_FRAME_MAP, DECO_GROUPS, DECO_SIDE_PAD, isDecoFrame, renderDecoFrame, renderDecoFrameThumb, type DecoGroup } from '@/lib/qr-frames-deco';
import {
  BODY_STYLES,
  EYE_RING_STYLES,
  EYE_CENTER_STYLES,
  STYLE_PRESETS,
  DOT_SIZES,
  DOT_SPACINGS,
  EYE_THICKNESS,
  EYE_SIZES,
  bodyModule,
  finderEye,
  alignmentCenters,
  alignmentPatternSvg,
  shapePreview,
  type DotSize,
  type DotSpacing,
  type EyeThickness,
  type EyeSize,
} from '@/lib/qr-shapes';
import { CARD_MOTIONS, CARD_MOTION_GROUPS, CARD_MOTION_LOOP, CARD_MOTION_MAP, renderCardMotionThumb, type CardMotionGroup } from '@/lib/qr-card-motion';
import { CARD_DESIGNS, CARD_MAP, DEFAULT_CARD_PANEL, DEFAULT_CARD_TEXT, SAMPLE_QR_SVG, defaultFreeQr, renderCardSvg, resolveCardPlacement, type CardKind, type CardLayout, type CardLineKey, type CardPanelStyle, type CardTextStyle } from '@/lib/qr-cards';
import CardPanelControls from '@/components/card-panel-controls';
import CardTextControls, { type CardTextSelection } from '@/components/card-text-controls';
import {
  QrCode,
  Camera,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Download,
  Copy,
  Link as LinkIcon,
  Type,
  Lock,
  Contact,
  MessageCircle,
  Send,
  Share2,
  Play,
  Globe,
  FileText,
  Utensils,
  Star,
  Calendar,
  MapPin,
  Video,
  IndianRupee,
  CreditCard,
  Coins,
  Wifi,
  Mail,
  MessageSquare,
  Phone,
  Frame,
  Palette,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  CircleDot,
  ChevronDown,
  Image as ImageIcon,
  Upload,
  Gift,
  ShoppingBag,
  Coffee,
  Search,
  Music,
  Briefcase,
  Printer,
  Loader2,
  FileArchive,
  RotateCcw,
  Landmark,
  Wallet,
  DollarSign,
  LayoutGrid,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sliders,
} from 'lucide-react';

export type StudioMode = 'create' | 'scanner' | 'batch';

/** QR types that can hold an uploaded file instead of a link. */
const FILE_TYPE_KIND: Partial<Record<string, FileKind>> = { pdf: 'pdf', audio: 'audio', image: 'image' };
type CategoryId = 'links' | 'payments' | 'social' | 'business' | 'access';
type DesignTab = 'templates' | 'animate' | 'cards' | 'style' | 'logo' | 'frames' | 'artwork';
type ArtPlacement = 'qr-fill' | 'neon-cutout' | 'back-halo' | 'back-pure' | 'medallion';
type LogoShape = 'rounded' | 'circle' | 'square';

interface QRTypeOption {
  id: string;
  label: string;
  category: CategoryId;
  icon: React.ElementType;
  placeholder?: string;
}

interface PresetLogoItem {
  id: string;
  label: string;
  emoji: string;
  bg: string;
  svg?: string;
}

interface BrandTemplate {
  id: string;
  name: string;
  badge: string;
  fg: string;
  g2: string;
  grad: 'none' | 'linear' | 'radial';
  bg: string;
  bg2: string;
  bgGrad: 'none' | 'linear' | 'radial';
  dot: string;
  ring: string;
  center: string;
  customEyes: boolean;
  eyeRing: string;
  eyeDot: string;
  logo: string;
}

interface ArtPresetItem {
  id: string;
  name: string;
  fg: string;
  g2: string;
  eyeAccent: string;
  posterSvg: string;
  cutoutSvg: string;
}

function toBase64Svg(svg: string): string {
  const utf8 = encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < utf8.length; i += 3) {
    const c1 = utf8.charCodeAt(i);
    const c2 = i + 1 < utf8.length ? utf8.charCodeAt(i + 1) : NaN;
    const c3 = i + 2 < utf8.length ? utf8.charCodeAt(i + 2) : NaN;
    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (c2 >> 4);
    const e3 = isNaN(c2) ? 64 : ((c2 & 15) << 2) | (c3 >> 6);
    const e4 = isNaN(c3) ? 64 : c3 & 63;
    output += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }
  return `data:image/svg+xml;base64,${output}`;
}

function createDualArtPreset(
  id: string,
  name: string,
  fg: string,
  g2: string,
  eyeAccent: string,
  bgRectAndCircle: string,
  characterMarkup: string
): ArtPresetItem {
  const posterSvg = toBase64Svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">${bgRectAndCircle}${characterMarkup}</svg>`
  );
  const cutoutSvg = toBase64Svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">${characterMarkup}</svg>`
  );
  return { id, name, fg, g2, eyeAccent, posterSvg, cutoutSvg };
}

function hexToLuminance(hex: string): number {
  const clean = (hex || '#000000').replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const toLinear = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Darkens `hex` (mixing toward black, keeping its hue) until it reaches `target` contrast against `against`.
 * Used for "Match card colours" so a pastel accent still gives a QR that scans.
 */
function shadeForContrast(hex: string, against: string, target: number): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.padEnd(6, '0').slice(0, 6);
  const rgb = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  const toHex = (k: number) => '#' + rgb.map((v) => Math.round(v * k).toString(16).padStart(2, '0')).join('');
  for (let k = 1; k > 0; k -= 0.04) {
    const c = toHex(k);
    if (getContrastRatio(c, against) >= target) return c;
  }
  return '#000000';
}

const QR_TYPES: QRTypeOption[] = [
  { id: 'url', label: 'URL / Web', category: 'links', icon: LinkIcon, placeholder: 'https://qrgenerato.com' },
  { id: 'text', label: 'Plain Text', category: 'links', icon: Type, placeholder: 'Enter any text, note, or serial code...' },
  { id: 'pin', label: 'PIN Code', category: 'links', icon: Lock, placeholder: '482910' },
  { id: 'search', label: 'Google Search', category: 'links', icon: Search, placeholder: 'Best cafe near me' },
  { id: 'app', label: 'App Store Link', category: 'links', icon: Share2, placeholder: 'https://play.google.com/store/apps/details?id=...' },
  { id: 'coupon', label: 'Promo / Coupon', category: 'links', icon: Gift, placeholder: 'SAVE25-VIP-2026' },

  { id: 'upi', label: '🇮🇳 Bharat UPI', category: 'payments', icon: IndianRupee },
  { id: 'sepa', label: '🇪🇺 Europe SEPA', category: 'payments', icon: Landmark },
  { id: 'paypal', label: '🌎 PayPal Global', category: 'payments', icon: CreditCard },
  { id: 'cashapp', label: '🇺🇸 CashApp / Venmo', category: 'payments', icon: DollarSign },
  { id: 'revolut', label: '🌍 Wise / Revolut', category: 'payments', icon: Globe },
  { id: 'pix', label: '🇧🇷 Brazil Pix', category: 'payments', icon: Wallet },
  { id: 'paynow', label: '🇸🇬🇹🇭 PayNow / PromptPay', category: 'payments', icon: Phone },
  { id: 'crypto', label: '₿ Crypto Wallet', category: 'payments', icon: Coins },
  { id: 'stripe', label: '💳 Stripe / Checkout', category: 'payments', icon: CreditCard, placeholder: 'https://buy.stripe.com/your-link' },
  { id: 'bank', label: '🏦 Global Bank / SWIFT', category: 'payments', icon: Landmark },

  { id: 'vcard', label: 'vCard Contact', category: 'social', icon: Contact },
  { id: 'whatsapp', label: 'WhatsApp Chat', category: 'social', icon: MessageCircle },
  { id: 'telegram', label: 'Telegram', category: 'social', icon: Send, placeholder: 'https://t.me/username' },
  { id: 'instagram', label: 'Instagram', category: 'social', icon: Camera, placeholder: 'https://instagram.com/username' },
  { id: 'youtube', label: 'YouTube Video', category: 'social', icon: Play, placeholder: 'https://youtube.com/@channel' },
  { id: 'twitter', label: 'X / Twitter', category: 'social', icon: Share2, placeholder: 'https://x.com/username' },
  { id: 'linkedin', label: 'LinkedIn', category: 'social', icon: Briefcase, placeholder: 'https://linkedin.com/in/username' },
  { id: 'facebook', label: 'Facebook Page', category: 'social', icon: Globe, placeholder: 'https://facebook.com/pagename' },

  { id: 'menu', label: 'Cafe / Menu', category: 'business', icon: Utensils, placeholder: 'https://yourcafe.com/digital-menu.pdf' },
  { id: 'pdf', label: 'PDF / Brochure', category: 'business', icon: FileText, placeholder: 'https://example.com/brochure.pdf' },
  { id: 'image', label: 'Image / Photo', category: 'business', icon: ImageIcon, placeholder: 'https://example.com/photo.jpg' },
  { id: 'review', label: 'Google Review', category: 'business', icon: Star, placeholder: 'https://g.page/r/your-business-review' },
  { id: 'event', label: 'Calendar Event', category: 'business', icon: Calendar },
  { id: 'maps', label: 'Google Maps', category: 'business', icon: MapPin },
  { id: 'zoom', label: 'Video Meeting', category: 'business', icon: Video, placeholder: 'https://meet.google.com/abc-defg-hij' },
  { id: 'audio', label: 'Audio / MP3', category: 'business', icon: Music, placeholder: 'https://open.spotify.com/track/...' },
  { id: 'shop', label: 'Product / Store', category: 'business', icon: ShoppingBag, placeholder: 'https://mystore.com/featured-product' },

  { id: 'wifi', label: 'WiFi Network', category: 'access', icon: Wifi },
  { id: 'email', label: 'Email Direct', category: 'access', icon: Mail },
  { id: 'sms', label: 'SMS Message', category: 'access', icon: MessageSquare },
  { id: 'phone', label: 'Phone Call', category: 'access', icon: Phone, placeholder: '+919876543210' },
  { id: 'drive', label: 'Google Drive', category: 'access', icon: Layers, placeholder: 'https://drive.google.com/file/d/...' },
  { id: 'coffee', label: 'Table Ordering', category: 'access', icon: Coffee, placeholder: 'https://order.cafe.com/table-5' },
];

const FRAME_STYLES = [
  { id: 'none', label: 'No Frame', defaultText: '' },
  { id: 'pill', label: '💊 Bottom Pill', defaultText: 'SCAN ME' },
  { id: 'banner', label: '📢 Bold Banner', defaultText: 'SCAN QR CODE' },
  { id: 'top-tag', label: '🏷️ Top Header Tag', defaultText: 'POINT CAMERA HERE' },
  { id: 'upi-stand', label: '🇮🇳 Bharat UPI Stand', defaultText: 'SCAN & PAY WITH ANY UPI APP' },
  { id: 'shopping-bag', label: '🛍️ Retail Store Bag', defaultText: 'SCAN TO SHOP CATALOG' },
  { id: 'cafe-cup', label: '☕ Cafe Cup Menu', defaultText: 'SCAN FOR CAFE MENU' },
  { id: 'chef-menu', label: '👨‍🍳 Chef Restaurant', defaultText: 'SCAN FOR TABLE MENU' },
  { id: 'scooter-delivery', label: '🛵 Express Delivery', defaultText: 'SCAN TO ORDER ONLINE' },
  { id: 'gift-box', label: '🎁 Gift Ribbon Box', defaultText: 'SCAN TO UNLOCK OFFER' },
  { id: 'chat-bubble', label: '💬 WhatsApp Bubble', defaultText: 'SCAN TO CHAT WITH US' },
  { id: 'polaroid', label: '📸 Polaroid Photo', defaultText: 'CAPTURE & SCAN' },
  { id: 'smartphone', label: '📱 Phone Screen', defaultText: 'OPEN ON MOBILE' },
  { id: 'ticket-stub', label: '🎟️ VIP Event Ticket', defaultText: 'ADMIT ONE • SCAN PASS' },
  { id: 'review-stars', label: '⭐ 5-Star Review', defaultText: 'RATE US ON GOOGLE' },
  { id: 'wifi-card', label: '📶 Free Guest WiFi', defaultText: 'SCAN TO JOIN WIFI' },
  { id: 'coupon-cut', label: '✂️ Scissors Coupon', defaultText: 'SCAN FOR 25% OFF' },
  { id: 'neon-cyber', label: '⚡ Cyber HUD Frame', defaultText: 'ACCESS TERMINAL' },
  { id: 'clipboard-pad', label: '📋 Official Clipboard', defaultText: 'VERIFIED PAYMENT' },
  { id: 'royal-ornate', label: '👑 Royal Luxury Crest', defaultText: 'EXCLUSIVE INVITATION' },
];

const PRESET_LOGOS: PresetLogoItem[] = [
  { id: 'none', label: 'None', emoji: '🚫', bg: '#334155' },
  {
    id: 'upi',
    label: 'UPI ₹',
    emoji: '₹',
    bg: '#059669',
    svg: `<rect width="100" height="100" rx="22" fill="#059669"/><text x="50" y="68" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="56" fill="#ffffff">₹</text>`,
  },
  {
    id: 'insta',
    label: 'Instagram',
    emoji: '📸',
    bg: '#e1306c',
    svg: `<defs><linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#f58529"/><stop offset="50%" stop-color="#dd2a7b"/><stop offset="100%" stop-color="#8134af"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(#igGrad)"/><rect x="22" y="22" width="56" height="56" rx="16" fill="none" stroke="#fff" stroke-width="6"/><circle cx="50" cy="50" r="13" fill="none" stroke="#fff" stroke-width="6"/><circle cx="66" cy="34" r="4" fill="#fff"/>`,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    emoji: '▶️',
    bg: '#ff0000',
    svg: `<rect width="100" height="100" rx="22" fill="#ffffff"/><rect x="12" y="24" width="76" height="52" rx="14" fill="#ff0000"/><polygon points="43,37 43,63 65,50" fill="#ffffff"/>`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    emoji: '💬',
    bg: '#25d366',
    svg: `<circle cx="50" cy="50" r="46" fill="#25d366"/><path d="M50 22 C34.5 22 22 34.1 22 49 C22 54.4 23.6 59.4 26.5 63.6 L23 77 L37 73.5 C40.9 75.7 45.3 76.8 50 76.8 C65.5 76.8 78 64.7 78 49.8 C78 34.9 65.5 22 50 22 Z" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><path d="M40 38 C38 38 36 40 36 43 C36 49 46 60 54 62 C57 62 60 60 61 57 L55 53 L52 56 C48 54 44 50 42 46 L45 43 L41 38 Z" fill="#fff"/>`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    emoji: '📘',
    bg: '#1877f2',
    svg: `<circle cx="50" cy="50" r="46" fill="#1877f2"/><path d="M57 82 V54 H66 L67.5 43 H57 V36 C57 32.8 58 30.5 62.5 30.5 H68 V21 C65.5 20.7 62 20.5 58.5 20.5 C49.5 20.5 43.5 26 43.5 35.5 V43 H34 V54 H43.5 V82 Z" fill="#ffffff"/>`,
  },
  {
    id: 'x-black',
    label: 'X / Twitter',
    emoji: '𝕏',
    bg: '#09090b',
    svg: `<circle cx="50" cy="50" r="46" fill="#09090b" stroke="#ffffff" stroke-width="3"/><path d="M30 28 H41 L53 45 L67 28 H72 L55 48 L74 72 H63 L49 54 L34 72 H29 L47 50 Z" fill="#ffffff"/>`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    emoji: '✈️',
    bg: '#24a1de',
    svg: `<circle cx="50" cy="50" r="46" fill="#24a1de"/><path d="M23 49 L73 30 L64 71 L47 58 L39 66 L41 54 L65 36 L35 51 Z" fill="#ffffff" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>`,
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    emoji: '👻',
    bg: '#fffc00',
    svg: `<rect width="100" height="100" rx="24" fill="#fffc00"/><path d="M50 22 C37 22 33 31 33 42 V49 C30 50 26 51 26 54 C26 56 30 57 32 58 C31 64 25 67 24 69 C24 72 32 73 36 74 C38 77 43 79 50 79 C57 79 62 77 64 74 C68 73 76 72 76 69 C75 67 69 64 68 58 C70 57 74 56 74 54 C74 51 70 50 67 49 V42 C67 31 63 22 50 22 Z" fill="#ffffff" stroke="#09090b" stroke-width="4.5" stroke-linejoin="round"/>`,
  },
  {
    id: 'spotify',
    label: 'Spotify',
    emoji: '🎵',
    bg: '#1db954',
    svg: `<circle cx="50" cy="50" r="46" fill="#1db954"/><path d="M28 40 C44 35 62 37 74 44 M32 52 C45 48 59 50 69 56 M35 64 C46 61 57 62 65 67" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    emoji: '💼',
    bg: '#0a66c2',
    svg: `<rect width="100" height="100" rx="22" fill="#0a66c2"/><circle cx="31" cy="31" r="7" fill="#ffffff"/><rect x="25" y="43" width="12" height="33" rx="2" fill="#ffffff"/><path d="M45 43 H56 V48 C58 44 63 42 68 42 C76 42 80 47 80 57 V76 H68 V59 C68 54 66 51 62 51 C58 51 56 54 56 59 V76 H45 Z" fill="#ffffff"/>`,
  },
  {
    id: 'discord',
    label: 'Discord',
    emoji: '🎮',
    bg: '#5865f2',
    svg: `<rect width="100" height="100" rx="24" fill="#5865f2"/><path d="M71 31 C66 28.5 61 27 56 26.5 L54 30 C49 29.5 44 29.5 39 30 L37 26.5 C32 27 27 28.5 22 31 C14 43 12 55 14 67 C20 71.5 26 74 32 75.5 L36 70 C33 69 30 67.5 28 65.5 C35 69 43 70.5 50 70.5 C57 70.5 65 69 72 65.5 C70 67.5 67 69 64 70 L68 75.5 C74 74 80 71.5 86 67 C88 53 84 41 71 31 Z M39 57 C35.5 57 33 54 33 50 C33 46 35.5 43 39 43 C42.5 43 45 46 45 50 C45 54 42.5 57 39 57 Z M61 57 C57.5 57 55 54 55 50 C55 46 57.5 43 61 43 C64.5 43 67 46 67 50 C67 54 64.5 57 61 57 Z" fill="#ffffff"/>`,
  },
  {
    id: 'twitch',
    label: 'Twitch',
    emoji: '👾',
    bg: '#9146ff',
    svg: `<rect width="100" height="100" rx="24" fill="#9146ff"/><path d="M28 22 L22 34 V72 H36 V80 H44 L52 72 H64 L78 58 V22 H28 Z M70 54 L62 62 H48 L41 69 V62 H30 V29 H70 V54 Z M57 37 H63 V51 H57 V37 Z M43 37 H49 V51 H43 V37 Z" fill="#ffffff"/>`,
  },
  {
    id: 'g-review',
    label: 'Google 5★',
    emoji: '⭐',
    bg: '#ffffff',
    svg: `<rect width="100" height="100" rx="22" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/><text x="50" y="45" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="24" fill="#4285F4">G<tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan></text><text x="50" y="72" text-anchor="middle" font-size="16" fill="#facc15" letter-spacing="1">★★★★★</text>`,
  },
  {
    id: 'g-maps',
    label: 'Maps Pin',
    emoji: '📍',
    bg: '#ffffff',
    svg: `<rect width="100" height="100" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/><path d="M50 16 C35 16 24 27 24 42 C24 61 50 84 50 84 C50 84 76 61 76 42 C76 27 65 16 50 16 Z" fill="#EA4335"/><circle cx="50" cy="41" r="11" fill="#ffffff"/><path d="M32 25 L50 41 L24 42 C24 34 27 29 32 25 Z" fill="#4285F4"/><path d="M28 56 L50 41 L50 84 C43 77 33 65 28 56 Z" fill="#34A853"/><path d="M72 56 L50 41 L50 84 C57 77 67 65 72 56 Z" fill="#FBBC05"/>`,
  },
  {
    id: 'g-drive',
    label: 'Drive',
    emoji: '📐',
    bg: '#ffffff',
    svg: `<rect width="100" height="100" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/><polygon points="39,22 61,22 84,61 62,61" fill="#FBBC05"/><polygon points="39,22 61,61 38,78 16,61" fill="#34A853"/><polygon points="38,78 84,61 73,78 27,78" fill="#4285F4"/>`,
  },
  {
    id: 'docs-blue',
    label: 'Docs Blue',
    emoji: '📄',
    bg: '#3b82f6',
    svg: `<rect x="22" y="12" width="56" height="76" rx="10" fill="#3b82f6"/><polygon points="58,12 78,32 58,32" fill="#93c5fd"/><rect x="33" y="42" width="34" height="5" rx="2.5" fill="#ffffff"/><rect x="33" y="53" width="34" height="5" rx="2.5" fill="#ffffff"/><rect x="33" y="64" width="22" height="5" rx="2.5" fill="#ffffff"/>`,
  },
  {
    id: 'docs-gold',
    label: 'Slides Gold',
    emoji: '📙',
    bg: '#f59e0b',
    svg: `<rect x="22" y="12" width="56" height="76" rx="10" fill="#f59e0b"/><polygon points="58,12 78,32 58,32" fill="#fde68a"/><rect x="32" y="42" width="36" height="26" rx="4" fill="none" stroke="#ffffff" stroke-width="5"/><rect x="39" y="49" width="22" height="12" rx="2" fill="#ffffff"/>`,
  },
  {
    id: 'docs-purple',
    label: 'Forms Purple',
    emoji: '📋',
    bg: '#7c3aed',
    svg: `<rect x="22" y="12" width="56" height="76" rx="10" fill="#7c3aed"/><polygon points="58,12 78,32 58,32" fill="#c4b5fd"/><circle cx="35" cy="45" r="3" fill="#ffffff"/><rect x="42" y="42.5" width="25" height="5" rx="2.5" fill="#ffffff"/><circle cx="35" cy="56" r="3" fill="#ffffff"/><rect x="42" y="53.5" width="25" height="5" rx="2.5" fill="#ffffff"/><circle cx="35" cy="67" r="3" fill="#ffffff"/><rect x="42" y="64.5" width="18" height="5" rx="2.5" fill="#ffffff"/>`,
  },
  {
    id: 'mail-badge',
    label: 'Mail @',
    emoji: '✉️',
    bg: '#ea580c',
    svg: `<circle cx="50" cy="50" r="46" fill="#ea580c"/><rect x="24" y="32" width="52" height="36" rx="6" fill="none" stroke="#ffffff" stroke-width="5"/><path d="M25 35 L50 53 L75 35" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  { id: 'globalpay', label: 'Pay $', emoji: '💳', bg: '#2563eb' },
  { id: 'crypto', label: 'Crypto ₿', emoji: '₿', bg: '#d97706' },
  { id: 'wifi', label: 'WiFi', emoji: '📶', bg: '#0284c7' },
  { id: 'menu', label: 'Cafe', emoji: '☕', bg: '#b45309' },
];

// 32 TEMPLATES: 4 Normal Scanner Templates + 28 UPI & Global Brand Templates
const BRAND_TEMPLATES: BrandTemplate[] = [
  {
    id: 'normal-classic',
    name: 'Classic QR',
    badge: 'Standard B&W',
    fg: '#000000',
    g2: '#000000',
    grad: 'none',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'square',
    ring: 'square',
    center: 'square',
    customEyes: false,
    eyeRing: '#000000',
    eyeDot: '#000000',
    logo: 'none',
  },
  {
    id: 'normal-rounded',
    name: 'Modern Soft QR',
    badge: 'Clean Rounded',
    fg: '#0f172a',
    g2: '#1e293b',
    grad: 'none',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'rounded',
    ring: 'rounded',
    center: 'rounded',
    customEyes: false,
    eyeRing: '#0f172a',
    eyeDot: '#0f172a',
    logo: 'none',
  },
  {
    id: 'normal-dots',
    name: 'Minimal Dots',
    badge: 'Circle Dots',
    fg: '#18181b',
    g2: '#18181b',
    grad: 'none',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'dots',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#18181b',
    eyeDot: '#18181b',
    logo: 'none',
  },
  {
    id: 'normal-liquid',
    name: 'Liquid B&W',
    badge: 'Fluid Standard',
    fg: '#09090b',
    g2: '#09090b',
    grad: 'none',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'liquid',
    ring: 'rounded',
    center: 'circle',
    customEyes: false,
    eyeRing: '#09090b',
    eyeDot: '#09090b',
    logo: 'none',
  },
  {
    id: 'bharat-upi-green',
    name: 'UPI Official',
    badge: 'Emerald & Orange',
    fg: '#059669',
    g2: '#047857',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'rounded',
    ring: 'rounded',
    center: 'circle',
    customEyes: true,
    eyeRing: '#ea580c',
    eyeDot: '#059669',
    logo: 'upi',
  },
  {
    id: 'phonepe-purple',
    name: 'UPI Purple',
    badge: 'Merchant Pay',
    fg: '#5b21b6',
    g2: '#7c3aed',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'liquid',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#5b21b6',
    eyeDot: '#5b21b6',
    logo: 'upi',
  },
  {
    id: 'paytm-sky-navy',
    name: 'Pay Navy & Sky',
    badge: 'Fast Checkout',
    fg: '#1e3a8a',
    g2: '#0284c7',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'rounded',
    ring: 'square',
    center: 'square',
    customEyes: true,
    eyeRing: '#1e3a8a',
    eyeDot: '#00baf2',
    logo: 'upi',
  },
  {
    id: 'wifi-guest-clean',
    name: 'Guest WiFi',
    badge: '1-Scan Connect',
    fg: '#0284c7',
    g2: '#2563eb',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'rounded',
    ring: 'rounded',
    center: 'circle',
    customEyes: false,
    eyeRing: '#0284c7',
    eyeDot: '#0284c7',
    logo: 'wifi',
  },
  {
    id: 'ig-sunset-card',
    name: 'Insta Sunset',
    badge: 'Inverted Gradient',
    fg: '#ffffff',
    g2: '#ffffff',
    grad: 'none',
    bg: '#833ab4',
    bg2: '#fcb045',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'insta',
  },
  {
    id: 'ig-clean-grad',
    name: 'Insta Gradient',
    badge: 'White Card',
    fg: '#833ab4',
    g2: '#fd1d1d',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'dots',
    ring: 'circle',
    center: 'circle',
    customEyes: true,
    eyeRing: '#c13584',
    eyeDot: '#f56040',
    logo: 'insta',
  },
  {
    id: 'yt-red-card',
    name: 'YouTube Red',
    badge: 'Bold Red',
    fg: '#ffffff',
    g2: '#ffffff',
    grad: 'none',
    bg: '#ff0000',
    bg2: '#b91c1c',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'circle',
    center: 'diamond',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'youtube',
  },
  {
    id: 'yt-dark-grid',
    name: 'YouTube Dark',
    badge: 'Red & Black',
    fg: '#09090b',
    g2: '#18181b',
    grad: 'none',
    bg: '#ef4444',
    bg2: '#dc2626',
    bgGrad: 'linear',
    dot: 'dots',
    ring: 'square',
    center: 'grid',
    customEyes: false,
    eyeRing: '#09090b',
    eyeDot: '#09090b',
    logo: 'youtube',
  },
  {
    id: 'wa-neon-card',
    name: 'WhatsApp Green',
    badge: 'Green Card',
    fg: '#ffffff',
    g2: '#ffffff',
    grad: 'none',
    bg: '#25d366',
    bg2: '#059669',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'rounded',
    center: 'rounded',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'whatsapp',
  },
  {
    id: 'wa-heart-clean',
    name: 'WhatsApp Hearts',
    badge: 'Clean Green',
    fg: '#16a34a',
    g2: '#10b981',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'dots',
    ring: 'square',
    center: 'heart',
    customEyes: false,
    eyeRing: '#16a34a',
    eyeDot: '#16a34a',
    logo: 'whatsapp',
  },
  {
    id: 'fb-royal-card',
    name: 'Facebook Blue',
    badge: 'Blue Card',
    fg: '#ffffff',
    g2: '#ffffff',
    grad: 'none',
    bg: '#1877f2',
    bg2: '#1d4ed8',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'circle',
    center: 'cross',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'facebook',
  },
  {
    id: 'fb-heart-white',
    name: 'FB Hearts',
    badge: 'Heart Eyes',
    fg: '#1d4ed8',
    g2: '#2563eb',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'dots',
    ring: 'circle',
    center: 'heart',
    customEyes: false,
    eyeRing: '#1d4ed8',
    eyeDot: '#1d4ed8',
    logo: 'facebook',
  },
  {
    id: 'x-midnight',
    name: 'X Midnight Dark',
    badge: 'OLED Black',
    fg: '#ffffff',
    g2: '#e4e4e7',
    grad: 'none',
    bg: '#09090b',
    bg2: '#18181b',
    bgGrad: 'linear',
    dot: 'dots',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'x-black',
  },
  {
    id: 'tg-sky-card',
    name: 'Telegram Sky',
    badge: 'Sky Gradient',
    fg: '#ffffff',
    g2: '#ffffff',
    grad: 'none',
    bg: '#38bdf8',
    bg2: '#2563eb',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'square',
    center: 'cross',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'telegram',
  },
  {
    id: 'snap-yellow-black',
    name: 'Snap Yellow',
    badge: 'High Contrast',
    fg: '#09090b',
    g2: '#18181b',
    grad: 'none',
    bg: '#fffc00',
    bg2: '#facc15',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#09090b',
    eyeDot: '#09090b',
    logo: 'snapchat',
  },
  {
    id: 'snap-dark-gold',
    name: 'Snap Neon',
    badge: 'Black & Yellow',
    fg: '#fffc00',
    g2: '#facc15',
    grad: 'none',
    bg: '#09090b',
    bg2: '#18181b',
    bgGrad: 'none',
    dot: 'dots',
    ring: 'square',
    center: 'cross',
    customEyes: false,
    eyeRing: '#fffc00',
    eyeDot: '#fffc00',
    logo: 'snapchat',
  },
  {
    id: 'spotify-dark-green',
    name: 'Spotify Dark',
    badge: 'Music Green',
    fg: '#1db954',
    g2: '#4ade80',
    grad: 'linear',
    bg: '#09090b',
    bg2: '#18181b',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#1db954',
    eyeDot: '#1db954',
    logo: 'spotify',
  },
  {
    id: 'linkedin-pro-blue',
    name: 'LinkedIn Pro',
    badge: 'vCard & Career',
    fg: '#0a66c2',
    g2: '#1d4ed8',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'rounded',
    ring: 'rounded',
    center: 'square',
    customEyes: false,
    eyeRing: '#0a66c2',
    eyeDot: '#0a66c2',
    logo: 'linkedin',
  },
  {
    id: 'discord-purple-card',
    name: 'Discord',
    badge: 'Gamer Purple',
    fg: '#ffffff',
    g2: '#ffffff',
    grad: 'none',
    bg: '#5865f2',
    bg2: '#4338ca',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'discord',
  },
  {
    id: 'twitch-dark-violet',
    name: 'Twitch Purple',
    badge: 'Dark Violet',
    fg: '#a855f7',
    g2: '#7c3aed',
    grad: 'linear',
    bg: '#09090b',
    bg2: '#1e1b4b',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'square',
    center: 'diamond',
    customEyes: false,
    eyeRing: '#a855f7',
    eyeDot: '#a855f7',
    logo: 'twitch',
  },
  {
    id: 'google-review-violet',
    name: 'Review Violet',
    badge: '5★ Business',
    fg: '#ffffff',
    g2: '#ffffff',
    grad: 'none',
    bg: '#7c3aed',
    bg2: '#4f46e5',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'circle',
    center: 'diamond',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'g-review',
  },
  {
    id: 'google-review-blue',
    name: 'Review Blue',
    badge: '5★ Classic',
    fg: '#1d4ed8',
    g2: '#2563eb',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'liquid',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#1d4ed8',
    eyeDot: '#1d4ed8',
    logo: 'g-review',
  },
  {
    id: 'gmaps-mint',
    name: 'Maps Mint',
    badge: 'Location Pin',
    fg: '#059669',
    g2: '#10b981',
    grad: 'linear',
    bg: '#ecfdf5',
    bg2: '#d1fae5',
    bgGrad: 'linear',
    dot: 'dots',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#059669',
    eyeDot: '#059669',
    logo: 'g-maps',
  },
  {
    id: 'gdrive-gold-navy',
    name: 'Drive Gold',
    badge: '2-Tone Contrast',
    fg: '#1e3a8a',
    g2: '#1d4ed8',
    grad: 'none',
    bg: '#fde68a',
    bg2: '#fcd34d',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#1e3a8a',
    eyeDot: '#1e3a8a',
    logo: 'g-drive',
  },
  {
    id: 'docs-sky-card',
    name: 'Docs Blue',
    badge: 'Soft Blue',
    fg: '#ffffff',
    g2: '#ffffff',
    grad: 'none',
    bg: '#60a5fa',
    bg2: '#3b82f6',
    bgGrad: 'linear',
    dot: 'dots',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'docs-blue',
  },
  {
    id: 'slides-amber-dark',
    name: 'Slides Gold',
    badge: 'Black & Amber',
    fg: '#f59e0b',
    g2: '#fbbf24',
    grad: 'linear',
    bg: '#09090b',
    bg2: '#18181b',
    bgGrad: 'none',
    dot: 'liquid',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#f59e0b',
    eyeDot: '#f59e0b',
    logo: 'docs-gold',
  },
  {
    id: 'forms-violet-card',
    name: 'Forms Lavender',
    badge: 'Purple Pop',
    fg: '#ffffff',
    g2: '#ffffff',
    grad: 'none',
    bg: '#7c3aed',
    bg2: '#6d28d9',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#ffffff',
    eyeDot: '#ffffff',
    logo: 'docs-purple',
  },
  {
    id: 'cafe-roast-warm',
    name: 'Cafe Espresso',
    badge: 'Bistro Table',
    fg: '#78350f',
    g2: '#d97706',
    grad: 'linear',
    bg: '#fffbeb',
    bg2: '#fef3c7',
    bgGrad: 'linear',
    dot: 'dots',
    ring: 'leaf-tl',
    center: 'circle',
    customEyes: false,
    eyeRing: '#78350f',
    eyeDot: '#d97706',
    logo: 'menu',
  },
  {
    id: 'minimal-ink',
    name: 'Ink Minimal',
    badge: 'Editorial Classy',
    fg: '#111827',
    g2: '#111827',
    grad: 'none',
    bg: '#f8fafc',
    bg2: '#f8fafc',
    bgGrad: 'none',
    dot: 'classy',
    ring: 'cut',
    center: 'diamond',
    customEyes: false,
    eyeRing: '#111827',
    eyeDot: '#111827',
    logo: 'none',
  },
  {
    id: 'ocean-depth',
    name: 'Ocean Depth',
    badge: 'Deep Blue Gradient',
    fg: '#0c4a6e',
    g2: '#0369a1',
    grad: 'linear',
    bg: '#f0f9ff',
    bg2: '#e0f2fe',
    bgGrad: 'linear',
    dot: 'rounded',
    ring: 'rounded',
    center: 'circle',
    customEyes: false,
    eyeRing: '#0c4a6e',
    eyeDot: '#0369a1',
    logo: 'none',
  },
  {
    id: 'forest-leaf',
    name: 'Forest Leaf',
    badge: 'Organic Liquid',
    fg: '#14532d',
    g2: '#15803d',
    grad: 'linear',
    bg: '#f0fdf4',
    bg2: '#f0fdf4',
    bgGrad: 'none',
    dot: 'liquid',
    ring: 'leaf-tl',
    center: 'leaf',
    customEyes: false,
    eyeRing: '#14532d',
    eyeDot: '#15803d',
    logo: 'none',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    badge: 'Wedding & Gifts',
    fg: '#9f1239',
    g2: '#b45309',
    grad: 'linear',
    bg: '#fff1f2',
    bg2: '#ffe4e6',
    bgGrad: 'linear',
    dot: 'dots',
    ring: 'circle',
    center: 'heart',
    customEyes: true,
    eyeRing: '#9f1239',
    eyeDot: '#b45309',
    logo: 'none',
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Neon',
    badge: 'Dark Mode Glow',
    fg: '#f0abfc',
    g2: '#67e8f9',
    grad: 'linear',
    bg: '#0b0b14',
    bg2: '#1e1b4b',
    bgGrad: 'linear',
    dot: 'dots',
    ring: 'rounded',
    center: 'circle',
    customEyes: true,
    eyeRing: '#67e8f9',
    eyeDot: '#f0abfc',
    logo: 'none',
  },
  {
    id: 'retro-sunset',
    name: 'Retro Sunset',
    badge: 'Vintage Bars',
    fg: '#7c2d12',
    g2: '#be185d',
    grad: 'linear',
    bg: '#fff7ed',
    bg2: '#fde68a',
    bgGrad: 'linear',
    dot: 'v-bars',
    ring: 'square',
    center: 'square',
    customEyes: false,
    eyeRing: '#7c2d12',
    eyeDot: '#be185d',
    logo: 'none',
  },
  {
    id: 'corporate-slate',
    name: 'Corporate Slate',
    badge: 'Business Card',
    fg: '#1e293b',
    g2: '#1e293b',
    grad: 'none',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'extra-round',
    ring: 'rounded',
    center: 'rounded',
    customEyes: true,
    eyeRing: '#2563eb',
    eyeDot: '#1e293b',
    logo: 'none',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    badge: 'Starry Soft',
    fg: '#5b21b6',
    g2: '#7c3aed',
    grad: 'radial',
    bg: '#faf5ff',
    bg2: '#f3e8ff',
    bgGrad: 'radial',
    dot: 'star',
    ring: 'dotted',
    center: 'star',
    customEyes: false,
    eyeRing: '#5b21b6',
    eyeDot: '#7c3aed',
    logo: 'none',
  },
  {
    id: 'u-candy-hearts',
    name: 'Candy Hearts',
    badge: 'Heart Dots',
    fg: '#be185d',
    g2: '#7c3aed',
    grad: 'linear',
    bg: '#fff1f2',
    bg2: '#fce7f3',
    bgGrad: 'linear',
    dot: 'heart',
    ring: 'circle',
    center: 'heart',
    customEyes: true,
    eyeRing: '#be185d',
    eyeDot: '#7c3aed',
    logo: 'none',
  },
  {
    id: 'u-starry-night',
    name: 'Starry Night',
    badge: 'Star Dots',
    fg: '#1e3a8a',
    g2: '#6d28d9',
    grad: 'radial',
    bg: '#eef2ff',
    bg2: '#e0e7ff',
    bgGrad: 'radial',
    dot: 'star',
    ring: 'rounded',
    center: 'star',
    customEyes: true,
    eyeRing: '#1e3a8a',
    eyeDot: '#ca8a04',
    logo: 'none',
  },
  {
    id: 'u-royal-diamond',
    name: 'Royal Diamond',
    badge: 'Gold Diamonds',
    fg: '#78350f',
    g2: '#b45309',
    grad: 'linear',
    bg: '#fffbeb',
    bg2: '#fef3c7',
    bgGrad: 'linear',
    dot: 'diamond',
    ring: 'cut',
    center: 'diamond',
    customEyes: true,
    eyeRing: '#1e1b4b',
    eyeDot: '#b45309',
    logo: 'none',
  },
  {
    id: 'u-medic-cross',
    name: 'Medic Cross',
    badge: 'Plus Modules',
    fg: '#b91c1c',
    g2: '#dc2626',
    grad: 'none',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'cross',
    ring: 'square',
    center: 'cross',
    customEyes: true,
    eyeRing: '#0f172a',
    eyeDot: '#b91c1c',
    logo: 'none',
  },
  {
    id: 'u-ocean-bars',
    name: 'Ocean Bars',
    badge: 'Horizontal Bars',
    fg: '#0c4a6e',
    g2: '#0e7490',
    grad: 'linear',
    bg: '#ecfeff',
    bg2: '#cffafe',
    bgGrad: 'linear',
    dot: 'h-bars',
    ring: 'rounded',
    center: 'rounded',
    customEyes: false,
    eyeRing: '#0c4a6e',
    eyeDot: '#0e7490',
    logo: 'none',
  },
  {
    id: 'u-barcode-pro',
    name: 'Barcode Pro',
    badge: 'Vertical Bars',
    fg: '#111827',
    g2: '#374151',
    grad: 'linear',
    bg: '#f9fafb',
    bg2: '#f3f4f6',
    bgGrad: 'none',
    dot: 'v-bars',
    ring: 'square',
    center: 'square',
    customEyes: false,
    eyeRing: '#111827',
    eyeDot: '#111827',
    logo: 'none',
  },
  {
    id: 'u-lava-liquid',
    name: 'Lava Liquid',
    badge: 'Molten Flow',
    fg: '#7f1d1d',
    g2: '#c2410c',
    grad: 'linear',
    bg: '#fff7ed',
    bg2: '#ffedd5',
    bgGrad: 'linear',
    dot: 'liquid',
    ring: 'leaf-tr',
    center: 'leaf',
    customEyes: false,
    eyeRing: '#7f1d1d',
    eyeDot: '#c2410c',
    logo: 'none',
  },
  {
    id: 'u-mint-bubble',
    name: 'Mint Bubble',
    badge: 'Soft Dots',
    fg: '#065f46',
    g2: '#0d9488',
    grad: 'radial',
    bg: '#ecfdf5',
    bg2: '#d1fae5',
    bgGrad: 'radial',
    dot: 'dots',
    ring: 'circle',
    center: 'circle',
    customEyes: false,
    eyeRing: '#065f46',
    eyeDot: '#0d9488',
    logo: 'none',
  },
  {
    id: 'u-sunburst-gold',
    name: 'Sunburst Gold',
    badge: 'Sun Eyes',
    fg: '#92400e',
    g2: '#ea580c',
    grad: 'radial',
    bg: '#fefce8',
    bg2: '#fef9c3',
    bgGrad: 'radial',
    dot: 'extra-round',
    ring: 'dotted',
    center: 'sunburst',
    customEyes: true,
    eyeRing: '#92400e',
    eyeDot: '#ea580c',
    logo: 'none',
  },
  {
    id: 'u-grape-soda',
    name: 'Grape Soda',
    badge: 'Fizzy Purple',
    fg: '#581c87',
    g2: '#a21caf',
    grad: 'linear',
    bg: '#faf5ff',
    bg2: '#fae8ff',
    bgGrad: 'linear',
    dot: 'dots',
    ring: 'leaf-bl',
    center: 'grid',
    customEyes: true,
    eyeRing: '#581c87',
    eyeDot: '#a21caf',
    logo: 'none',
  },
  {
    id: 'u-vintage-sepia',
    name: 'Vintage Sepia',
    badge: 'Old Paper',
    fg: '#44403c',
    g2: '#78350f',
    grad: 'linear',
    bg: '#fafaf9',
    bg2: '#f5f0e6',
    bgGrad: 'linear',
    dot: 'classy',
    ring: 'cut',
    center: 'square',
    customEyes: false,
    eyeRing: '#44403c',
    eyeDot: '#78350f',
    logo: 'none',
  },
  {
    id: 'u-neon-pink-night',
    name: 'Neon Pink Night',
    badge: 'Dark Glow',
    fg: '#f472b6',
    g2: '#c084fc',
    grad: 'linear',
    bg: '#0f0a1a',
    bg2: '#1e1033',
    bgGrad: 'linear',
    dot: 'dots',
    ring: 'circle',
    center: 'circle',
    customEyes: true,
    eyeRing: '#f472b6',
    eyeDot: '#c084fc',
    logo: 'none',
  },
  {
    id: 'u-cyber-lime',
    name: 'Cyber Lime',
    badge: 'Matrix Dark',
    fg: '#a3e635',
    g2: '#22d3ee',
    grad: 'linear',
    bg: '#030712',
    bg2: '#0b1120',
    bgGrad: 'linear',
    dot: 'square',
    ring: 'square',
    center: 'square',
    customEyes: true,
    eyeRing: '#a3e635',
    eyeDot: '#22d3ee',
    logo: 'none',
  },
  {
    id: 'u-arctic-frost',
    name: 'Arctic Frost',
    badge: 'Ice Blue',
    fg: '#1e3a8a',
    g2: '#0369a1',
    grad: 'linear',
    bg: '#f0f9ff',
    bg2: '#e0f2fe',
    bgGrad: 'radial',
    dot: 'rounded',
    ring: 'leaf-tl',
    center: 'diamond',
    customEyes: true,
    eyeRing: '#0369a1',
    eyeDot: '#1e3a8a',
    logo: 'none',
  },
  {
    id: 'u-coffee-bean',
    name: 'Coffee Bean',
    badge: 'Warm Roast',
    fg: '#3f2a1d',
    g2: '#78350f',
    grad: 'linear',
    bg: '#fdf8f3',
    bg2: '#f5e9dc',
    bgGrad: 'linear',
    dot: 'extra-round',
    ring: 'rounded',
    center: 'circle',
    customEyes: false,
    eyeRing: '#3f2a1d',
    eyeDot: '#78350f',
    logo: 'none',
  },
  {
    id: 'u-rainbow-pop',
    name: 'Rainbow Pop',
    badge: 'Multi Gradient',
    fg: '#7c3aed',
    g2: '#c2410c',
    grad: 'linear',
    bg: '#ffffff',
    bg2: '#ffffff',
    bgGrad: 'none',
    dot: 'rounded',
    ring: 'circle',
    center: 'star',
    customEyes: true,
    eyeRing: '#0e7490',
    eyeDot: '#be185d',
    logo: 'none',
  },
];

// 30 Dual-Mode Artworks: Original Full-Bleed Illustrated Posters + Transparent Cutouts
const ART_PRESETS: ArtPresetItem[] = [
  createDualArtPreset(
    'crimson-hero',
    'Crimson Hero',
    '#881337',
    '#be123c',
    '#f43f5e',
    `<rect width="240" height="240" fill="#9f1239"/><circle cx="120" cy="115" r="88" fill="#be123c"/>`,
    `<path d="M30 240 C35 175 80 155 120 155 C160 155 205 175 210 240 Z" fill="#18181b"/>
     <circle cx="120" cy="105" r="46" fill="#7c2d12"/>
     <rect x="74" y="82" width="92" height="16" rx="6" fill="#18181b"/>
     <rect x="86" y="85" width="24" height="10" rx="3" fill="#f43f5e"/>
     <rect x="130" y="85" width="24" height="10" rx="3" fill="#f43f5e"/>
     <path d="M72 80 C75 45 165 45 168 80 Z" fill="#27272a"/>`
  ),
  createDualArtPreset(
    'cyber-samurai',
    'Cyber Samurai',
    '#1e1b4b',
    '#7e22ce',
    '#ec4899',
    `<rect width="240" height="240" fill="#1e1b4b"/><circle cx="120" cy="120" r="85" fill="#4c1d95" stroke="#ec4899" stroke-width="5"/>`,
    `<path d="M35 240 C45 178 85 160 120 160 C155 160 195 178 205 240 Z" fill="#09090b"/>
     <polygon points="120,42 172,95 152,155 88,155 68,95" fill="#18181b" stroke="#38bdf8" stroke-width="3"/>
     <rect x="82" y="96" width="76" height="16" rx="8" fill="#06b6d4"/>
     <path d="M95 132 H145 L135 146 H105 Z" fill="#ec4899"/>`
  ),
  createDualArtPreset(
    'lucky-neko',
    'Lucky Neko Cat',
    '#9a3412',
    '#dc2626',
    '#f59e0b',
    `<rect width="240" height="240" fill="#fef3c7"/><circle cx="120" cy="120" r="92" fill="#f59e0b"/>`,
    `<polygon points="68,95 58,42 105,68" fill="#ffffff" stroke="#dc2626" stroke-width="5"/>
     <polygon points="172,95 182,42 135,68" fill="#ffffff" stroke="#dc2626" stroke-width="5"/>
     <circle cx="120" cy="125" r="58" fill="#ffffff"/>
     <circle cx="96" cy="115" r="7" fill="#18181b"/>
     <circle cx="144" cy="115" r="7" fill="#18181b"/>
     <ellipse cx="120" cy="130" rx="8" ry="6" fill="#ef4444"/>
     <rect x="78" y="168" width="84" height="18" rx="9" fill="#dc2626"/>
     <circle cx="120" cy="177" r="11" fill="#facc15" stroke="#78350f" stroke-width="2"/>`
  ),
  createDualArtPreset(
    'royal-tiger',
    'Royal Tiger',
    '#7c2d12',
    '#b45309',
    '#ea580c',
    `<rect width="240" height="240" fill="#7c2d12"/><circle cx="120" cy="120" r="90" fill="#ea580c"/>`,
    `<circle cx="72" cy="68" r="22" fill="#9a3412"/>
     <circle cx="168" cy="68" r="22" fill="#9a3412"/>
     <polygon points="120,48 185,105 162,188 78,188 55,105" fill="#fb923c" stroke="#18181b" stroke-width="5"/>
     <path d="M75 88 L102 102 M165 88 L138 102 M120 55 V85" stroke="#18181b" stroke-width="7" stroke-linecap="round"/>
     <circle cx="94" cy="118" r="8" fill="#fef08a"/>
     <circle cx="146" cy="118" r="8" fill="#fef08a"/>
     <polygon points="120,148 104,132 136,132" fill="#18181b"/>`
  ),
  createDualArtPreset(
    'gamer-pad',
    'Neon Gamepad',
    '#312e81',
    '#db2777',
    '#8b5cf6',
    `<rect width="240" height="240" fill="#1e1b4b"/><circle cx="120" cy="120" r="88" fill="#312e81" stroke="#8b5cf6" stroke-width="4"/>`,
    `<rect x="46" y="82" width="148" height="82" rx="40" fill="#4f46e5" stroke="#ffffff" stroke-width="5"/>
     <path d="M84 108 V138 M69 123 H99" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
     <circle cx="158" cy="112" r="8" fill="#f43f5e"/>
     <circle cx="174" cy="128" r="8" fill="#38bdf8"/>
     <circle cx="142" cy="128" r="8" fill="#facc15"/>
     <circle cx="158" cy="144" r="8" fill="#4ade80"/>`
  ),
  createDualArtPreset(
    'coffee-barista',
    'Cafe Espresso',
    '#451a03',
    '#9a3412',
    '#d97706',
    `<rect width="240" height="240" fill="#fef3c7"/><circle cx="120" cy="120" r="90" fill="#d97706"/>`,
    `<path d="M70 105 H158 V152 C158 178 138 192 114 192 C90 192 70 178 70 152 Z" fill="#ffffff" stroke="#451a03" stroke-width="6"/>
     <path d="M158 116 H174 C185 116 185 146 174 146 H158" fill="none" stroke="#ffffff" stroke-width="8"/>
     <path d="M96 66 Q104 82 96 94 M120 58 Q128 76 120 92 M142 66 Q150 82 142 94" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>`
  ),
  createDualArtPreset(
    'pizza-chef',
    'Gourmet Pizza',
    '#7f1d1d',
    '#b45309',
    '#dc2626',
    `<rect width="240" height="240" fill="#fef08a"/><circle cx="120" cy="120" r="92" fill="#dc2626"/>`,
    `<polygon points="120,42 192,182 48,182" fill="#facc15" stroke="#78350f" stroke-width="6"/>
     <path d="M48 182 Q120 202 192 182" fill="none" stroke="#d97706" stroke-width="16" stroke-linecap="round"/>
     <circle cx="120" cy="108" r="12" fill="#b91c1c"/>
     <circle cx="98" cy="146" r="12" fill="#b91c1c"/>
     <circle cx="144" cy="150" r="12" fill="#b91c1c"/>`
  ),
  createDualArtPreset(
    'astro-space',
    'Space Astronaut',
    '#0f172a',
    '#1d4ed8',
    '#38bdf8',
    `<rect width="240" height="240" fill="#090d16"/><circle cx="48" cy="52" r="4" fill="#ffffff"/><circle cx="195" cy="68" r="5" fill="#facc15"/>`,
    `<circle cx="120" cy="122" r="72" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/>
     <rect x="70" y="88" width="100" height="64" rx="30" fill="#1e3a8a" stroke="#38bdf8" stroke-width="4"/>
     <path d="M86 104 Q115 94 142 106" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/>`
  ),
  createDualArtPreset(
    'dj-panda',
    'DJ Music Panda',
    '#18181b',
    '#4f46e5',
    '#ec4899',
    `<rect width="240" height="240" fill="#4f46e5"/>`,
    `<path d="M48 125 A72 72 0 0 1 192 125" fill="none" stroke="#ec4899" stroke-width="12"/>
     <circle cx="68" cy="72" r="22" fill="#18181b"/>
     <circle cx="172" cy="72" r="22" fill="#18181b"/>
     <circle cx="120" cy="128" r="64" fill="#ffffff"/>
     <ellipse cx="94" cy="118" rx="16" ry="20" fill="#18181b"/>
     <ellipse cx="146" cy="118" rx="16" ry="20" fill="#18181b"/>
     <circle cx="96" cy="115" r="5" fill="#ffffff"/>
     <circle cx="144" cy="115" r="5" fill="#ffffff"/>
     <ellipse cx="120" cy="144" rx="10" ry="7" fill="#18181b"/>
     <rect x="34" y="105" width="22" height="44" rx="10" fill="#ec4899"/>
     <rect x="184" y="105" width="22" height="44" rx="10" fill="#ec4899"/>`
  ),
  createDualArtPreset(
    'bharat-mandala',
    'Bharat Mandala',
    '#7c2d12',
    '#be185d',
    '#f59e0b',
    `<rect width="240" height="240" fill="#fffbeb"/>`,
    `<circle cx="120" cy="120" r="96" fill="#f59e0b" stroke="#b45309" stroke-width="6"/>
     <circle cx="120" cy="120" r="72" fill="#be185d" stroke="#fef08a" stroke-width="4" stroke-dasharray="10 6"/>
     <circle cx="120" cy="120" r="46" fill="#059669" stroke="#ffffff" stroke-width="4"/>
     <circle cx="120" cy="120" r="20" fill="#fef08a"/>`
  ),
  createDualArtPreset(
    'sakura-fuji',
    'Sakura Mt. Fuji',
    '#831843',
    '#1e3a8a',
    '#f43f5e',
    `<rect width="240" height="240" fill="#fce7f3"/>`,
    `<circle cx="120" cy="96" r="56" fill="#f43f5e"/>
     <polygon points="20,210 95,95 145,95 220,210" fill="#1e3a8a"/>
     <polygon points="95,95 145,95 162,130 135,120 120,134 105,120 78,130" fill="#ffffff"/>
     <circle cx="55" cy="55" r="14" fill="#f472b6"/>
     <circle cx="185" cy="65" r="18" fill="#f472b6"/>`
  ),
  createDualArtPreset(
    'retro-car',
    'Synthwave Car',
    '#311042',
    '#0284c7',
    '#ec4899',
    `<rect width="240" height="240" fill="#1e1b4b"/><rect x="0" y="150" width="240" height="90" fill="#0f172a"/>`,
    `<circle cx="120" cy="105" r="64" fill="#f43f5e"/>
     <path d="M42 165 L75 125 H165 L198 165 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="4"/>
     <rect x="34" y="158" width="172" height="28" rx="10" fill="#ec4899"/>
     <circle cx="62" cy="172" r="9" fill="#fef08a"/>
     <circle cx="178" cy="172" r="9" fill="#fef08a"/>`
  ),
  createDualArtPreset(
    'boba-tea',
    'Boba Milk Tea',
    '#581c87',
    '#db2777',
    '#f472b6',
    `<rect width="240" height="240" fill="#fdf2f8"/><circle cx="120" cy="125" r="88" fill="#f472b6"/>`,
    `<rect x="112" y="34" width="16" height="65" fill="#7c3aed"/>
     <polygon points="72,88 168,88 154,196 86,196" fill="#fef3c7" stroke="#581c87" stroke-width="6"/>
     <path d="M66 88 H174" stroke="#581c87" stroke-width="10" stroke-linecap="round"/>
     <circle cx="100" cy="176" r="8" fill="#451a03"/>
     <circle cx="120" cy="180" r="8" fill="#451a03"/>
     <circle cx="140" cy="176" r="8" fill="#451a03"/>
     <circle cx="110" cy="160" r="8" fill="#451a03"/>
     <circle cx="132" cy="160" r="8" fill="#451a03"/>`
  ),
  createDualArtPreset(
    'sneaker-pop',
    'Street Sneaker',
    '#1e3a8a',
    '#dc2626',
    '#2563eb',
    `<rect width="240" height="240" fill="#dbeafe"/><circle cx="120" cy="120" r="92" fill="#2563eb"/>`,
    `<path d="M48 162 V102 H105 L138 134 H192 C198 134 202 148 198 162 Z" fill="#dc2626" stroke="#ffffff" stroke-width="6"/>
     <rect x="44" y="160" width="156" height="18" rx="8" fill="#ffffff"/>
     <path d="M82 135 L108 150 L145 128" fill="none" stroke="#facc15" stroke-width="8" stroke-linecap="round"/>`
  ),
  createDualArtPreset(
    'golden-dragon',
    'Imperial Crest',
    '#7f1d1d',
    '#b45309',
    '#facc15',
    `<rect width="240" height="240" fill="#7f1d1d"/><circle cx="120" cy="120" r="90" fill="#991b1b" stroke="#facc15" stroke-width="6"/>`,
    `<polygon points="120,45 142,95 195,95 152,128 168,182 120,148 72,182 88,128 45,95 98,95" fill="#facc15"/>
     <circle cx="120" cy="120" r="24" fill="#7f1d1d" stroke="#ffffff" stroke-width="4"/>`
  ),
  createDualArtPreset(
    'emerald-wave',
    'Emerald Wave',
    '#064e3b',
    '#0284c7',
    '#10b981',
    `<rect width="240" height="240" fill="#ecfdf5"/><circle cx="120" cy="120" r="94" fill="#10b981"/>`,
    `<path d="M26 135 Q75 95 120 135 T214 135 L214 214 L26 214 Z" fill="#0284c7"/>
     <circle cx="85" cy="82" r="24" fill="#fef08a"/>`
  ),
  createDualArtPreset(
    'neon-paradise-bird',
    'Neon Paradise Bird',
    '#0e7490',
    '#a855f7',
    '#ec4899',
    `<rect width="240" height="240" fill="#090d16"/><circle cx="120" cy="120" r="92" fill="#1e1b4b" stroke="#22d3ee" stroke-width="4"/>`,
    `<path d="M35 140 L210 202" stroke="#b45309" stroke-width="12" stroke-linecap="round"/>
     <path d="M132 162 L116 230 L145 224 L162 170 Z" fill="#06b6d4"/>
     <ellipse cx="120" cy="116" rx="34" ry="52" transform="rotate(-14 120 116)" fill="#4ade80"/>
     <path d="M112 82 C156 80 188 135 194 202 C152 185 116 146 112 82 Z" fill="#a855f7" stroke="#ffffff" stroke-width="2"/>
     <circle cx="104" cy="56" r="26" fill="#06b6d4"/>
     <polygon points="124,48 158,58 124,66" fill="#f97316"/>
     <circle cx="104" cy="52" r="6" fill="#18181b" stroke="#f43f5e" stroke-width="3"/>`
  ),
  createDualArtPreset(
    'neon-kitsune',
    'Cyber Kitsune Fox',
    '#9d174d',
    '#ea580c',
    '#22d3ee',
    `<rect width="240" height="240" fill="#1e1b4b"/><circle cx="120" cy="120" r="90" fill="#311042" stroke="#f43f5e" stroke-width="4"/>`,
    `<polygon points="62,96 44,28 106,66" fill="#ec4899" stroke="#22d3ee" stroke-width="4"/>
     <polygon points="178,96 196,28 134,66" fill="#ec4899" stroke="#22d3ee" stroke-width="4"/>
     <polygon points="120,48 186,114 120,202 54,114" fill="#f97316" stroke="#fde047" stroke-width="4"/>
     <polygon points="120,202 78,138 162,138" fill="#ffffff"/>
     <polygon points="80,110 108,122 90,132" fill="#22d3ee"/>
     <polygon points="160,110 132,122 150,132" fill="#22d3ee"/>
     <circle cx="120" cy="186" r="9" fill="#09090b"/>`
  ),
  ...EXTRA_ART_PRESETS.map((a) => createDualArtPreset(a.id, a.name, a.fg, a.g2, a.eyeAccent, a.bg, a.art)),
];

const COLOR_THEMES = [
  { name: 'Royal', fg: '#7c3aed', g2: '#db2777', bg: '#ffffff', bg2: '#ffffff', bgGrad: 'none' as const, from: 'from-violet-600', to: 'to-pink-600' },
  { name: 'Emerald', fg: '#059669', g2: '#10b981', bg: '#ffffff', bg2: '#ffffff', bgGrad: 'none' as const, from: 'from-emerald-600', to: 'to-teal-400' },
  { name: 'Oceanic', fg: '#2563eb', g2: '#06b6d4', bg: '#ffffff', bg2: '#ffffff', bgGrad: 'none' as const, from: 'from-blue-600', to: 'to-cyan-400' },
  { name: 'Insta Card', fg: '#ffffff', g2: '#ffffff', bg: '#833ab4', bg2: '#fcb045', bgGrad: 'linear' as const, from: 'from-purple-600', to: 'to-amber-500' },
  { name: 'Cyber Gold', fg: '#facc15', g2: '#eab308', bg: '#09090b', bg2: '#18181b', bgGrad: 'linear' as const, from: 'from-yellow-400', to: 'to-zinc-900' },
];

/** Escapes characters that are special in the WIFI: QR payload format. */
function escWifi(v: string): string {
  return v.replace(/[\\;,:"]/g, (ch) => '\\' + ch);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

type TemplateCategory = 'unique' | 'basic' | 'payments' | 'social' | 'business' | 'stylish';

const TEMPLATE_CATEGORIES: { id: 'all' | TemplateCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unique', label: '✦ Unique' },
  { id: 'basic', label: 'Basic' },
  { id: 'payments', label: 'Payments' },
  { id: 'social', label: 'Social' },
  { id: 'business', label: 'Business' },
  { id: 'stylish', label: 'Stylish' },
];

function templateCategory(id: string): TemplateCategory {
  if (id.startsWith('u-')) return 'unique';
  if (/^(normal-|minimal-ink|corporate-slate)/.test(id)) return 'basic';
  if (/(upi|phonepe|paytm)/.test(id)) return 'payments';
  if (/^(ig-|yt-|wa-|fb-|x-|tg-|snap-|spotify|linkedin|discord|twitch)/.test(id)) return 'social';
  if (/^(wifi|google-|gmaps|gdrive|docs|slides|forms|cafe)/.test(id)) return 'business';
  return 'stylish';
}

/** Module grid for template thumbnails (7px cells, skipping eyes and centre), drawn in the template's dot style. */
const THUMB_CELLS: [number, number][] = (() => {
  const cells: [number, number][] = [];
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const eye = (r < 4 && c < 4) || (r < 4 && c > 7) || (r > 7 && c < 4);
      const centre = r >= 5 && r <= 6 && c >= 5 && c <= 6;
      if (eye || centre) continue;
      const h = Math.sin(r * 91.7 + c * 47.3) * 43758.5453;
      if (h - Math.floor(h) > 0.45) cells.push([8 + c * 7, 8 + r * 7]);
    }
  }
  return cells;
})();

function thumbModules(dot: string): string {
  return THUMB_CELLS.map(([x, y]) => {
    const cx = x + 3;
    const cy = y + 3;
    switch (dot) {
      case 'square':
        return `<rect x="${x}" y="${y}" width="6.4" height="6.4"/>`;
      case 'dots':
        return `<circle cx="${cx}" cy="${cy}" r="2.8"/>`;
      case 'extra-round':
      case 'liquid':
        return `<rect x="${x}" y="${y}" width="6" height="6" rx="3"/>`;
      case 'classy':
        return `<path d="M${x},${y + 2.5} Q${x},${y} ${x + 2.5},${y} H${x + 6} V${y + 3.5} Q${x + 6},${y + 6} ${x + 3.5},${y + 6} H${x} Z"/>`;
      case 'diamond':
        return `<polygon points="${cx},${y - 0.4} ${x + 6.4},${cy} ${cx},${y + 6.4} ${x - 0.4},${cy}"/>`;
      case 'star':
        return `<polygon points="${cx},${y - 0.6} ${cx + 1.1},${cy - 1.1} ${x + 6.6},${cy} ${cx + 1.1},${cy + 1.1} ${cx},${y + 6.6} ${cx - 1.1},${cy + 1.1} ${x - 0.6},${cy} ${cx - 1.1},${cy - 1.1}"/>`;
      case 'heart':
        return `<path d="M${cx},${y + 6} C${x - 1},${cy} ${x},${y} ${cx},${y + 1.8} C${x + 6},${y} ${x + 7},${cy} ${cx},${y + 6} Z"/>`;
      case 'cross':
        return `<path d="M${x + 2},${y} H${x + 4} V${y + 2} H${x + 6} V${y + 4} H${x + 4} V${y + 6} H${x + 2} V${y + 4} H${x} V${y + 2} H${x + 2} Z"/>`;
      case 'v-bars':
        return `<rect x="${x + 1}" y="${y - 0.5}" width="4" height="7" rx="2"/>`;
      case 'h-bars':
        return `<rect x="${x - 0.5}" y="${y + 1}" width="7" height="4" rx="2"/>`;
      default:
        return `<rect x="${x}" y="${y}" width="6" height="6" rx="1.8"/>`;
    }
  }).join('');
}

function renderTemplateThumbSvg(t: BrandTemplate): string {
  const gradDef =
    t.bgGrad !== 'none'
      ? `<defs><linearGradient id="bg_${t.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${t.bg}"/><stop offset="100%" stop-color="${t.bg2}"/></linearGradient></defs>`
      : '';
  const bgFill = t.bgGrad !== 'none' ? `url(#bg_${t.id})` : t.bg;
  const modFill = t.grad !== 'none' ? `url(#fg_${t.id})` : t.fg;
  const fgGradDef = t.grad !== 'none' ? `<defs><linearGradient id="fg_${t.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${t.fg}"/><stop offset="100%" stop-color="${t.g2}"/></linearGradient></defs>` : '';
  const eyeRx = t.ring === 'circle' ? 11 : t.ring === 'rounded' ? 5 : 1;
  const dotRx = t.dot === 'square' ? 0.5 : 3.5;
  const logoObj = PRESET_LOGOS.find((l) => l.id === t.logo);

  const centerBadge =
    logoObj && logoObj.id !== 'none'
      ? logoObj.svg
        ? `<g transform="translate(36, 36) scale(0.28)">${logoObj.svg}</g>`
        : `<rect x="38" y="38" width="24" height="24" rx="6" fill="${logoObj.bg}"/><text x="50" y="55" text-anchor="middle" font-size="14" fill="#fff">${logoObj.emoji}</text>`
      : `<rect x="42" y="42" width="16" height="16" rx="${dotRx}" fill="${t.fg}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    ${gradDef}${fgGradDef}
    <rect width="100" height="100" rx="18" fill="${bgFill}" stroke="rgba(148,163,184,0.25)" stroke-width="2"/>
    <rect x="12" y="12" width="22" height="22" rx="${eyeRx}" fill="none" stroke="${t.eyeRing}" stroke-width="4"/>
    <rect x="18" y="18" width="10" height="10" rx="${eyeRx * 0.5}" fill="${t.eyeDot}"/>
    <rect x="66" y="12" width="22" height="22" rx="${eyeRx}" fill="none" stroke="${t.eyeRing}" stroke-width="4"/>
    <rect x="72" y="18" width="10" height="10" rx="${eyeRx * 0.5}" fill="${t.eyeDot}"/>
    <rect x="12" y="66" width="22" height="22" rx="${eyeRx}" fill="none" stroke="${t.eyeRing}" stroke-width="4"/>
    <rect x="18" y="72" width="10" height="10" rx="${eyeRx * 0.5}" fill="${t.eyeDot}"/>
    <g fill="${modFill}">${thumbModules(t.dot)}</g>
    ${centerBadge}
  </svg>`;
}

/**
 * Thumbnail SVG strings are static, so they are built once per set — and only when a tab that shows
 * them first renders, instead of building all ~150 on page load.
 */
const THUMB_CACHE: Partial<Record<'fx' | 'card' | 'tpl' | 'cm' | 'df', Record<string, string>>> = {};
function thumb(set: 'fx' | 'card' | 'tpl' | 'cm' | 'df', id: string): string {
  let map = THUMB_CACHE[set];
  if (!map) {
    map = {};
    if (set === 'fx') for (const e of ANIMATED_EFFECTS) map[e.id] = renderEffectThumb(e);
    else if (set === 'card') for (const c of CARD_DESIGNS) map[c.id] = renderCardSvg(c, c.defaults, SAMPLE_QR_SVG, 'th');
    else if (set === 'cm') for (const m of CARD_MOTIONS) map[m.id] = renderCardMotionThumb(m.id);
    else if (set === 'df') for (const d of DECO_FRAMES) map[d.id] = renderDecoFrameThumb(d.id);
    else for (const t of BRAND_TEMPLATES) map[t.id] = renderTemplateThumbSvg(t);
    THUMB_CACHE[set] = map;
  }
  return map[id] ?? '';
}

/**
 * Same thumbnail as an <img> data URL. An image is one DOM node whose pixels the browser caches,
 * instead of hundreds of live SVG nodes that must be parsed, styled and repainted on every change.
 * Only safe for sets whose SVGs use no external images or web fonts (an SVG inside <img> can't load them).
 */
const THUMB_SRC_CACHE: Record<string, string> = {};
function thumbSrc(set: 'df', id: string): string {
  // Built one at a time, so opening the Frames tab only renders the visible group's 10 tiles.
  return (THUMB_SRC_CACHE[`${set}:${id}`] ??= `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderDecoFrameThumb(id))}`);
}

/**
 * Background rasteriser for the decorative-frame tiles. An SVG <img> is still parsed and painted as vector
 * on the main thread each time it is inserted (~10–20 ms per tile on a mid-range phone), which made switching
 * frame groups stutter. During idle time each tile is drawn once to a canvas and kept as a WebP blob URL;
 * bitmaps decode off the main thread, so swapping groups is then nearly free. Until a tile is ready it falls
 * back to the SVG data URL, so nothing ever shows blank.
 */
const DECO_RASTER: Record<string, string> = {};
const decoRasterQueue: string[] = [];
const decoRasterListeners = new Set<(id: string) => void>();
let decoRasterRunning = false;
const DECO_RASTER_W = 360;
const DECO_RASTER_H = 479; // thumbnail viewBox is 266×354

// Runs only when the browser is genuinely idle. No timeout: a forced run used to fire while people
// were typing and froze phones for ~1 s while 50 SVG frames were rasterised.
function onIdle(cb: () => void) {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => cb());
  else window.setTimeout(cb, 250); // Safari: no idle callback, so space the work out
}

function pumpDecoRaster() {
  const id = decoRasterQueue.shift();
  if (!id) {
    decoRasterRunning = false;
    return;
  }
  if (DECO_RASTER[id]) return onIdle(pumpDecoRaster);
  const img = new Image();
  img.decoding = 'async';
  img.src = thumbSrc('df', id);
  img
    .decode()
    .then(
      () =>
        new Promise<void>((resolve) =>
          onIdle(() => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = DECO_RASTER_W;
              canvas.height = DECO_RASTER_H;
              const ctx = canvas.getContext('2d');
              if (!ctx) return resolve();
              ctx.drawImage(img, 0, 0, DECO_RASTER_W, DECO_RASTER_H);
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    DECO_RASTER[id] = URL.createObjectURL(blob);
                    decoRasterListeners.forEach((fn) => fn(id));
                  }
                  resolve();
                },
                'image/webp',
                0.92
              );
            } catch {
              resolve(); // e.g. a browser that taints SVG canvases: keep the SVG fallback
            }
          })
        )
    )
    .catch(() => {})
    .finally(() => onIdle(pumpDecoRaster));
}

/** Queue tiles for rasterising (only the group on screen; other groups when they're opened). */
function queueDecoRaster(ids: string[] = DECO_FRAMES.map((d) => d.id)) {
  if (typeof window === 'undefined') return;
  const todo = ids.filter((id) => !DECO_RASTER[id]);
  for (const id of todo) {
    const i = decoRasterQueue.indexOf(id);
    if (i >= 0) decoRasterQueue.splice(i, 1);
  }
  decoRasterQueue.unshift(...todo);
  if (!decoRasterRunning && decoRasterQueue.length) {
    decoRasterRunning = true;
    onIdle(pumpDecoRaster);
  }
}

/**
 * Decorative frame picker. Kept as its own memoized component with its own group state, so switching
 * groups re-renders only this panel instead of the whole studio.
 */
const DecoFramePicker = React.memo(function DecoFramePicker({
  frameStyle,
  onPick,
  subCardClass,
  activePillClass,
  inactivePillClass,
}: {
  frameStyle: string;
  onPick: (id: string) => void;
  subCardClass: string;
  activePillClass: string;
  inactivePillClass: string;
}) {
  const [group, setGroup] = useState<DecoGroup>(() => DECO_FRAME_MAP[frameStyle]?.group ?? 'luxury');
  const selectedGroup = DECO_FRAME_MAP[frameStyle]?.group;
  // Re-render (this panel only) when a tile of the visible group finishes rasterising.
  const [, bumpRaster] = useState(0);
  useEffect(() => {
    const visible = DECO_FRAMES.filter((d) => d.group === group).map((d) => d.id);
    queueDecoRaster(visible);
    const onReady = (id: string) => {
      if (visible.includes(id)) bumpRaster((n) => n + 1);
    };
    decoRasterListeners.add(onReady);
    return () => {
      decoRasterListeners.delete(onReady);
    };
  }, [group]);
  return (
    <div className={clsx('p-3 rounded-xl border space-y-2.5', subCardClass)}>
      <span className="text-xs font-bold text-fuchsia-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" /> Decorative Frames ({DECO_FRAMES.length})
      </span>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Decorative frame groups">
        {DECO_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={group === g.id}
            onClick={() => setGroup(g.id)}
            className={clsx(
              'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer',
              group === g.id ? activePillClass : inactivePillClass
            )}
          >
            {g.label}
            {selectedGroup === g.id && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" aria-label="contains selected frame" />}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {DECO_FRAMES.filter((d) => d.group === group).map((d) => {
          const active = frameStyle === d.id;
          return (
            <button
              key={d.id}
              type="button"
              aria-pressed={active}
              title={d.label}
              onClick={() => onPick(d.id)}
              className={clsx(
                'p-1.5 rounded-xl border transition-colors cursor-pointer flex flex-col items-center gap-1',
                active ? activePillClass : inactivePillClass
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG data URL, nothing for next/image to optimise */}
              <img src={DECO_RASTER[d.id] ?? thumbSrc('df', d.id)} alt="" width={180} height={240} decoding="async" draggable={false} className="w-full h-auto aspect-[3/4] rounded-lg object-cover" />
              <span className="w-full text-[10px] font-bold leading-tight text-center line-clamp-2 min-h-[2.2em]">{d.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

/** Encodes an ImageBitmap to PNG in a throwaway worker (OffscreenCanvas), keeping the page responsive. */
function encodeInWorker(bitmap: ImageBitmap, w: number, h: number): Promise<Blob> {
  const code = `onmessage = async (e) => {
    try {
      const { bitmap, w, h } = e.data;
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0, w, h);
      bitmap.close();
      postMessage({ blob: await canvas.convertToBlob({ type: 'image/png' }) });
    } catch (err) {
      postMessage({ error: String(err) });
    }
  };`;
  const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  const worker = new Worker(url);
  return new Promise<Blob>((resolve, reject) => {
    const done = () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
    worker.onmessage = (e: MessageEvent<{ blob?: Blob; error?: string }>) => {
      done();
      if (e.data.blob) resolve(e.data.blob);
      else reject(new Error(e.data.error || 'PNG export failed'));
    };
    worker.onerror = () => {
      done();
      reject(new Error('PNG worker failed'));
    };
    worker.postMessage({ bitmap, w, h }, [bitmap]);
  });
}

export interface QRStudioProps {
  /** Mode to open in (keyword landing pages: /qr-code-scanner, /bulk-qr-code-generator). */
  initialMode?: StudioMode;
  /** Turn the Dynamic QR switch on from the start (/dynamic-qr). */
  autoDynamic?: boolean;
}

export default function QRStudio({ initialMode = 'create', autoDynamic = false }: QRStudioProps = {}) {
  // 1. Initialize strictly with server-safe default values to prevent React Error #418
  const [isDark, setIsDark] = useState(true);
  const [studioMode, setStudioMode] = useState<StudioMode>(initialMode);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('links');
  const [qrType, setQrType] = useState<string>('url');
  const [designTab, setDesignTab] = useState<DesignTab>('artwork');
  const [shapeSubTab, setShapeSubTab] = useState<'dots' | 'ring' | 'center'>('dots');
  const [mobileZoomed, setMobileZoomed] = useState(false);

  // Basic & Regional Payment Inputs
  const [inputValue, setInputValue] = useState('https://qrgenerato.com');
  /** Short q.qrgenerato.com/<code> link to encode instead of the URL when Dynamic QR is on. */
  const [dynamicUrl, setDynamicUrl] = useState<string | null>(null);
  /** Uploaded file (PDF / audio / image types): the QR encodes its q.qrgenerato.com/f/ link. */
  const [uploadedFile, setUploadedFile] = useState<OwnedFile | null>(null);
  const [upiId, setUpiId] = useState('merchant@upi');
  const [upiName, setUpiName] = useState('My Store');
  const [upiAmount, setUpiAmount] = useState('');
  const [upiNote, setUpiNote] = useState('Order Payment');

  // Europe SEPA
  const [sepaName, setSepaName] = useState('Euro Business GmbH');
  const [sepaIban, setSepaIban] = useState('DE89370400440532013000');
  const [sepaBic, setSepaBic] = useState('COBADEFFXXX');
  const [sepaAmount, setSepaAmount] = useState('49.90');
  const [sepaRef, setSepaRef] = useState('INV-2026-01');

  // Global Payments
  const [paypalUser, setPaypalUser] = useState('yourusername');
  const [paypalAmount, setPaypalAmount] = useState('25');
  const [paypalCurrency, setPaypalCurrency] = useState('USD');

  const [p2pPlatform, setP2pPlatform] = useState<'cashapp' | 'venmo'>('cashapp');
  const [p2pHandle, setP2pHandle] = useState('yourcashtag');
  const [p2pAmount, setP2pAmount] = useState('15');

  const [intlPlatform, setIntlPlatform] = useState<'revolut' | 'wise'>('revolut');
  const [intlUser, setIntlUser] = useState('yourhandle');

  const [pixKey, setPixKey] = useState('merchant@pix.com.br');
  const [pixName, setPixName] = useState('Loja Brasil');
  const [pixCity, setPixCity] = useState('SAO PAULO');
  const [pixAmount, setPixAmount] = useState('');

  const [asiaRegion, setAsiaRegion] = useState<'SG_PayNow' | 'TH_PromptPay' | 'MY_DuitNow'>('SG_PayNow');
  const [asiaId, setAsiaId] = useState('+6591234567');
  const [asiaAmount, setAsiaAmount] = useState('');

  const [cryptoCoin, setCryptoCoin] = useState<'bitcoin' | 'ethereum' | 'solana' | 'tether'>('bitcoin');
  const [cryptoAddr, setCryptoAddr] = useState('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
  const [cryptoAmount, setCryptoAmount] = useState('');

  const [bankHolder, setBankHolder] = useState('Global Exports Ltd');
  const [bankName, setBankName] = useState('HSBC / Citi / SBI');
  const [bankAccount, setBankAccount] = useState('GB29NWBK60161331926819');
  const [bankSwift, setBankSwift] = useState('HBUKGB4B');

  // WiFi / vCard / Social / Event Inputs
  const [wifiSsid, setWifiSsid] = useState('Office_WiFi_5G');
  const [wifiPass, setWifiPass] = useState('welcome2026');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('contact@qrgenerato.com');
  const [vcardOrg, setVcardOrg] = useState('QR Generato PRO');
  const [vcardWebsite, setVcardWebsite] = useState('');
  const [vcardCity, setVcardCity] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('Hello! I just scanned your QR code.');
  const [emailTo, setEmailTo] = useState('support@qrgenerato.com');
  const [emailSub, setEmailSub] = useState('Business Inquiry');
  const [emailBody, setEmailBody] = useState('Hi team, I would like to connect.');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsBody, setSmsBody] = useState('Hi, I am interested in your services.');
  const [eventTitle, setEventTitle] = useState('Product Launch 2026');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStart, setEventStart] = useState('20261201T100000Z');
  const [mapsQuery, setMapsQuery] = useState('');

  // Shape, Eye, Frame, Color, Logo & QR Art States
  const [activeTemplateId, setActiveTemplateId] = useState<string>('none');
  const [dotStyle, setDotStyle] = useState('rounded');
  const [finderShape, setFinderShape] = useState('rounded');
  const [finderCenterShape, setFinderCenterShape] = useState('circle');
  // QR Style Studio fine-tuning
  const [dotSize, setDotSize] = useState<DotSize>('medium');
  const [dotSpacing, setDotSpacing] = useState<DotSpacing>('normal');
  const [cornerRadius, setCornerRadius] = useState(55); // % for rounded bodies, rings and centres
  const [eyeThickness, setEyeThickness] = useState<EyeThickness>('medium');
  const [eyeSize, setEyeSize] = useState<EyeSize>('medium');
  const [bodyOpacity, setBodyOpacity] = useState(100); // %
  const [qrBorder, setQrBorder] = useState<'none' | 'thin' | 'medium' | 'thick'>('none');
  const [qrBorderColor, setQrBorderColor] = useState('#1e1b4b');
  const [ecLevel, setEcLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [density, setDensity] = useState<'auto' | 'dense' | 'extra'>('auto');
  const [gradientDir, setGradientDir] = useState<'horizontal' | 'vertical' | 'diagonal'>('diagonal');
  const [bgGradientDir, setBgGradientDir] = useState<'horizontal' | 'vertical' | 'diagonal'>('diagonal');
  const [useGrad3, setUseGrad3] = useState(false);
  const [gradientColor3, setGradientColor3] = useState('#7c3aed');
  const [customEyeColors, setCustomEyeColors] = useState(false);
  const [eyeBorderColor, setEyeBorderColor] = useState('#ec4899');
  const [eyeCenterColor, setEyeCenterColor] = useState('#facc15');
  const [frameStyle, setFrameStyle] = useState('none');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#4f46e5');
  const [fgColor, setFgColor] = useState('#881337');
  const [gradientColor2, setGradientColor2] = useState('#be123c');
  const [gradientType, setGradientType] = useState<'none' | 'linear' | 'radial'>('linear');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgColor2, setBgColor2] = useState('#f8fafc');
  const [bgGradientType, setBgGradientType] = useState<'none' | 'linear' | 'radial'>('none');
  const [transparentBg, setTransparentBg] = useState(false);
  const [selectedPresetLogo, setSelectedPresetLogo] = useState('none');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.22);
  const [logoShape] = useState<LogoShape>('rounded');

  // UNIFIED QR ART STATES (Supports both Classic Poster Art & Neon Cutout Art!)
  const [selectedArtId, setSelectedArtId] = useState<string>('crimson-hero');
  const [artworkUrl, setArtworkUrl] = useState<string | null>(ART_PRESETS[0].posterSvg);
  const [artCutoutUrl, setArtCutoutUrl] = useState<string | null>(ART_PRESETS[0].cutoutSvg);
  const [artPlacement, setArtPlacement] = useState<ArtPlacement>('qr-fill');
  const [artworkOpacity, setArtworkOpacity] = useState(0.88);
  const [artScale, setArtScale] = useState(0.82);
  const [artScanDots, setArtScanDots] = useState(0.5);
  const [artGlow] = useState(6);
  const [showArtAdvanced, setShowArtAdvanced] = useState(false);

  // Animated QR effects
  const [animEffectId, setAnimEffectId] = useState<string>('none');
  // Ambient motion over the whole card (petals, light sweep...); only applies while a card is selected.
  const [cardMotionId, setCardMotionId] = useState<string>('none');
  const [cardMotionGroup, setCardMotionGroup] = useState<CardMotionGroup>('universal');
  const [animSpeed, setAnimSpeed] = useState(1);
  const [fxGroup, setFxGroup] = useState<FxGroupId>('popular');
  // Printable card layouts (business, membership & event cards)
  const [cardId, setCardId] = useState<string>('none');
  // Mobile grids show the first rows only until "Show all" is tapped.
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const [templateCat, setTemplateCat] = useState<'all' | TemplateCategory>('all');
  const toggleMore = (key: string) => setShowAll((prev) => ({ ...prev, [key]: !prev[key] }));
  const [exportState, setExportState] = useState<{ format: 'gif' | 'mp4'; progress: number; label: string } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [cardKind, setCardKind] = useState<CardKind>('retro');
  /** Full-resolution artwork of the selected image card, inlined as a data URL so PNG/GIF/MP4 exports include it */
  const [cardArtData, setCardArtData] = useState<{ src: string; data: string } | null>(null);
  const [cardName, setCardName] = useState('');
  // Where the QR sits on movable (artwork) cards. `cardQrFree` is normalised to the card size.
  const [cardQrLayout, setCardQrLayout] = useState<CardLayout>('corner');
  const [cardQrFree, setCardQrFree] = useState<{ cx: number; cy: number; size: number } | null>(null);
  // Backing plate behind the QR on a card: the card's own colour, plain white, or the QR's background colour.
  const [cardPlate, setCardPlate] = useState<'card' | 'white' | 'qr-bg'>('card');
  const [cardTitle, setCardTitle] = useState('');
  const [cardExtra, setCardExtra] = useState('');
  // Custom card text: move/resize/restyle the name, title, subtitle and extra line on any card.
  const [cardTextMode, setCardTextMode] = useState<'design' | 'custom'>('design');
  const [cardText, setCardText] = useState<CardTextStyle>(DEFAULT_CARD_TEXT);
  const [cardSubtitle, setCardSubtitle] = useState('');
  const [cardTextSel, setCardTextSel] = useState<CardTextSelection>('all');
  // Name panel behind the text/QR: the design's own, removed, or a custom shape.
  const [cardPanel, setCardPanel] = useState<CardPanelStyle>(DEFAULT_CARD_PANEL);

  // Scanner & Batch States
  const [copied, setCopied] = useState(false);
  /** Which raster export is being prepared (big card PNGs take a moment): drives the button labels. */
  const [exporting, setExporting] = useState<'png' | 'copy' | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [batchZipProgress, setBatchZipProgress] = useState<string | null>(null);
  const [batchInput, setBatchInput] = useState(
    'https://qrgenerato.com\nupi://pay?pa=shop@upi&pn=MyStore&cu=INR\nWIFI:T:WPA;S:Cafe_Guest;P:coffee123;;\nhttps://paypal.me/store/25'
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const fileInputLogoRef = useRef<HTMLInputElement>(null);
  const fileInputArtRef = useRef<HTMLInputElement>(null);
  const fileInputScanRef = useRef<HTMLInputElement>(null);

  // 2. Read browser theme & URL pathing safely AFTER hydration completes
  useEffect(() => {
    const saved = localStorage.getItem('qr-theme');
    const prefersDark = saved ? saved === 'dark' : true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage/URL are only readable after hydration
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);

    // Keyword landing pages map to a QR type and the design tab that matches the page's topic.
    const LANDING_PATHS: Record<string, [type: string, tab: DesignTab]> = {
      'animated-qr-code': ['url', 'animate'],
      'qr-code-with-logo': ['url', 'logo'],
      'business-card-qr': ['vcard', 'cards'],
      'google-review-qr': ['review', 'frames'],
      'instagram-qr': ['instagram', 'templates'],
      'youtube-qr': ['youtube', 'templates'],
      'mp3-qr-code': ['audio', 'templates'],
      'image-qr-code': ['image', 'templates'],
    };
    const rawPath = window.location.pathname.replace(/^\/|\/$/g, '');
    const landingPath = LANDING_PATHS[rawPath];
    if (landingPath) setDesignTab(landingPath[1]);
    if (rawPath === 'business-card-qr') setCardKind('business');
    const path = landingPath ? landingPath[0] : rawPath;
    if (['upi', 'sepa', 'paypal', 'cashapp', 'revolut', 'pix', 'paynow', 'crypto', 'stripe', 'bank'].includes(path)) {
      setActiveCategory('payments');
    } else if (['vcard', 'whatsapp', 'telegram', 'instagram', 'youtube', 'twitter', 'linkedin', 'facebook'].includes(path)) {
      setActiveCategory('social');
    } else if (['menu', 'pdf', 'image', 'review', 'event', 'maps', 'zoom', 'audio', 'shop'].includes(path)) {
      setActiveCategory('business');
    } else if (['wifi', 'email', 'sms', 'phone', 'drive', 'coffee'].includes(path)) {
      setActiveCategory('access');
    }

    const validTypes = QR_TYPES.map((t) => t.id);
    if (validTypes.includes(path)) {
      setQrType(path);
    }

    const handler = (e: Event) => {
      const nextDark = Boolean((e as CustomEvent).detail);
      setIsDark(nextDark);
      document.documentElement.classList.toggle('dark', nextDark);
    };
    window.addEventListener('qr-theme-change', handler);
    return () => window.removeEventListener('qr-theme-change', handler);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('qr-theme', nextDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextDark);
    window.dispatchEvent(new CustomEvent('qr-theme-change', { detail: nextDark }));
  };

  const startCameraScanner = async () => {
    setScanError(null);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        // Built-in detector where available, jsQR everywhere else (iPhone Safari, Firefox, Windows).
        let busy = false;
        scanIntervalRef.current = window.setInterval(async () => {
          const video = videoRef.current;
          if (busy || !video || video.readyState < 2) return;
          busy = true;
          try {
            const text = await decodeQr(video, 720);
            if (text) {
              setScanResult(text);
              stopCameraScanner();
            }
          } catch {
            // ignore this frame
          } finally {
            busy = false;
          }
        }, 300);
      }
    } catch {
      setScanError('Camera access denied or unavailable. Please use "Upload QR Image" below.');
    }
  };

  const stopCameraScanner = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (studioMode !== 'scanner' && cameraActive) {
      stopCameraScanner();
    }
    return () => {
      if (scanIntervalRef.current) window.clearInterval(scanIntervalRef.current);
    };
  }, [studioMode, cameraActive]);

  const handleResetDesign = () => {
    setActiveTemplateId('normal-classic');
    setCardId('none');
    setAnimEffectId('none');
    setAnimSpeed(1);
    setSelectedArtId('none');
    setDotStyle('square');
    setFinderShape('square');
    setFinderCenterShape('square');
    setCustomEyeColors(false);
    setFrameStyle('none');
    setFgColor('#000000');
    setBgColor('#ffffff');
    setBgColor2('#f8fafc');
    setBgGradientType('none');
    setTransparentBg(false);
    setGradientType('none');
    setSelectedPresetLogo('none');
    setCustomLogoUrl(null);
    setArtworkUrl(null);
    setArtCutoutUrl(null);
  };

  const applyBrandTemplate = (t: BrandTemplate) => {
    setActiveTemplateId(t.id);
    setSelectedArtId('none');
    setArtworkUrl(null);
    setArtCutoutUrl(null);
    setFgColor(t.fg);
    setGradientColor2(t.g2);
    setGradientType(t.grad);
    setBgColor(t.bg);
    setBgColor2(t.bg2);
    setBgGradientType(t.bgGrad);
    setTransparentBg(false);
    setDotStyle(t.dot);
    setFinderShape(t.ring);
    setFinderCenterShape(t.center);
    setCustomEyeColors(t.customEyes);
    setEyeBorderColor(t.eyeRing);
    setEyeCenterColor(t.eyeDot);
    setSelectedPresetLogo(t.logo);
    setCustomLogoUrl(null);
    setFrameColor(t.bgGrad !== 'none' ? t.bg : t.fg === '#ffffff' ? t.bg : t.fg);
  };

  const applyArtPreset = (art: ArtPresetItem) => {
    setSelectedArtId(art.id);
    setActiveTemplateId('none');
    setArtworkUrl(art.posterSvg);
    setArtCutoutUrl(art.cutoutSvg);
    setFgColor(art.fg);
    setGradientColor2(art.g2);
    setEyeBorderColor(art.eyeAccent);
    setGradientType('linear');
    if (artPlacement !== 'neon-cutout') {
      setBgColor('#ffffff');
      setBgGradientType('none');
    }
  };

  // 1. Compute Raw Payload String
  const rawPayloadString = useMemo(() => {
    switch (qrType) {
      case 'upi': {
        const pa = encodeURIComponent(upiId.trim() || 'merchant@upi');
        const pn = encodeURIComponent(upiName.trim() || 'Store');
        const am = upiAmount.trim() ? `&am=${encodeURIComponent(upiAmount.trim())}` : '';
        const tn = upiNote.trim() ? `&tn=${encodeURIComponent(upiNote.trim())}` : '';
        return `upi://pay?pa=${pa}&pn=${pn}${am}${tn}&cu=INR`;
      }
      case 'sepa': {
        const amt = sepaAmount.trim() ? `EUR${sepaAmount.trim()}` : '';
        return `BCD\n002\n1\nSCT\n${sepaBic.trim()}\n${sepaName.trim()}\n${sepaIban.replace(/\s+/g, '')}\n${amt}\n\n${sepaRef.trim()}`;
      }
      case 'paypal': {
        const user = paypalUser.trim() || 'user';
        const amt = paypalAmount.trim() ? `/${paypalAmount.trim()}${paypalCurrency}` : '';
        return `https://paypal.me/${user}${amt}`;
      }
      case 'cashapp': {
        const handle = p2pHandle.replace(/^[$@]/, '').trim() || 'user';
        if (p2pPlatform === 'cashapp') {
          return `https://cash.app/$${handle}${p2pAmount.trim() ? `/${p2pAmount.trim()}` : ''}`;
        }
        return `https://venmo.com/${handle}${p2pAmount.trim() ? `?txn=pay&amount=${p2pAmount.trim()}` : ''}`;
      }
      case 'revolut': {
        const user = intlUser.replace(/^@/, '').trim() || 'user';
        return intlPlatform === 'revolut' ? `https://revolut.me/${user}` : `https://wise.com/pay/me/${user}`;
      }
      case 'pix':
        return `PIX:${pixKey.trim()};NAME:${pixName.trim()};CITY:${pixCity.trim()}${pixAmount.trim() ? `;AMOUNT:${pixAmount.trim()}` : ''}`;
      case 'paynow':
        return `${asiaRegion}:${asiaId.trim()}${asiaAmount.trim() ? `?amount=${asiaAmount.trim()}` : ''}`;
      case 'crypto':
        return `${cryptoCoin}:${cryptoAddr.trim()}${cryptoAmount.trim() ? `?amount=${cryptoAmount.trim()}` : ''}`;
      case 'bank':
        return `BANK TRANSFER\nAccount Holder: ${bankHolder}\nBank: ${bankName}\nIBAN/Account: ${bankAccount}\nSWIFT/BIC: ${bankSwift}`;
      case 'wifi':
        // Escape \ ; , : " as the Wi-Fi QR format requires, otherwise phones read the wrong network/password.
        return `WIFI:T:${wifiType};S:${escWifi(wifiSsid)};P:${wifiType === 'nopass' ? '' : escWifi(wifiPass)};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'vcard':
        // Only include fields the user filled in; empty URL/ADR lines show up as junk in some contact apps.
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${vcardName}`,
          vcardOrg && `ORG:${vcardOrg}`,
          vcardPhone && `TEL:${vcardPhone}`,
          vcardEmail && `EMAIL:${vcardEmail}`,
          vcardWebsite && `URL:${vcardWebsite}`,
          vcardCity && `ADR:;;${vcardCity};;;;`,
          'END:VCARD',
        ]
          .filter(Boolean)
          .join('\n');
      case 'whatsapp': {
        const cleanPhone = waPhone.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
      }
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSub)}&body=${encodeURIComponent(emailBody)}`;
      case 'sms':
        return `smsto:${smsPhone}:${smsBody}`;
      case 'phone':
        return `tel:${inputValue.trim() || '+919876543210'}`;
      case 'event':
        return `BEGIN:VEVENT\nSUMMARY:${eventTitle}\nLOCATION:${eventLocation}\nDTSTART:${eventStart}\nEND:VEVENT`;
      case 'maps':
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery || 'India')}`;
      case 'search':
        return `https://www.google.com/search?q=${encodeURIComponent(inputValue.trim() || 'QR Generato')}`;
      default:
        if (qrType === 'url' && dynamicUrl) return dynamicUrl;
        if (uploadedFile && FILE_TYPE_KIND[qrType] === uploadedFile.kind) return uploadedFile.shortUrl;
        return inputValue.trim() || 'https://qrgenerato.com';
    }
  }, [
    qrType, inputValue, dynamicUrl, uploadedFile, upiId, upiName, upiAmount, upiNote,
    sepaName, sepaIban, sepaBic, sepaAmount, sepaRef,
    paypalUser, paypalAmount, paypalCurrency,
    p2pPlatform, p2pHandle, p2pAmount, intlPlatform, intlUser,
    pixKey, pixName, pixCity, pixAmount, asiaRegion, asiaId, asiaAmount,
    cryptoCoin, cryptoAddr, cryptoAmount, bankHolder, bankName, bankAccount, bankSwift,
    wifiType, wifiSsid, wifiPass, wifiHidden,
    vcardName, vcardOrg, vcardPhone, vcardEmail, vcardWebsite, vcardCity,
    waPhone, waMessage, emailTo, emailSub, emailBody,
    smsPhone, smsBody, eventTitle, eventLocation, eventStart, mapsQuery,
  ]);

  // DEFERRED VALUES FOR 60FPS SMOOTH TYPING & SLIDERS ON MOBILE
  const payloadString = useDeferredValue(rawPayloadString);
  const defFgColor = useDeferredValue(fgColor);
  const defGrad2 = useDeferredValue(gradientColor2);
  const defBgColor = useDeferredValue(bgColor);
  const defBgColor2 = useDeferredValue(bgColor2);
  const defGrad3 = useDeferredValue(gradientColor3);
  const defQrBorderColor = useDeferredValue(qrBorderColor);
  const defCornerRadius = useDeferredValue(cornerRadius);
  const defBodyOpacity = useDeferredValue(bodyOpacity);
  const defFrameColor = useDeferredValue(frameColor);
  const defEyeBorderColor = useDeferredValue(eyeBorderColor);
  const defEyeCenterColor = useDeferredValue(eyeCenterColor);
  const defArtScale = useDeferredValue(artScale);
  const defArtOpacity = useDeferredValue(artworkOpacity);
  const defArtScanDots = useDeferredValue(artScanDots);
  const defArtGlow = useDeferredValue(artGlow);
  const defAnimEffectId = useDeferredValue(animEffectId);
  const defAnimSpeed = useDeferredValue(animSpeed);
  const defCardName = useDeferredValue(cardName);
  const defCardText = useDeferredValue(cardText);
  const defCardPanel = useDeferredValue(cardPanel);
  const defCardSubtitle = useDeferredValue(cardSubtitle);
  const defCardQrFree = useDeferredValue(cardQrFree);
  const defCardTitle = useDeferredValue(cardTitle);
  const defCardExtra = useDeferredValue(cardExtra);
  // Frame picks and label typing update the button/input immediately; the heavy SVG rebuild follows at low priority.
  const defFrameStyle = useDeferredValue(frameStyle);
  const defFrameText = useDeferredValue(frameText);

  // Live Scannability Score (0 to 100)
  const scannability = useMemo(() => {
    let score = 94;
    const isNeonMode = Boolean(artworkUrl && artPlacement === 'neon-cutout');
    const effectiveBg = isNeonMode
      ? '#07070e'
      : artworkUrl && (artPlacement === 'qr-fill' || artPlacement === 'back-halo' || artPlacement === 'back-pure')
      ? '#ffffff'
      : defBgColor;
    const contrast = getContrastRatio(defFgColor, effectiveBg);

    if (!isNeonMode) {
      if (contrast < 1.8) score -= 68;
      else if (contrast < 2.8) score -= 42;
      else if (contrast < 4.0) score -= 14;
    }

    if (artworkUrl) {
      if (artPlacement === 'neon-cutout') {
        if (defArtScale > 1.05 && defArtScanDots < 0.25) score = 36;
        else if (defArtScanDots < 0.2 && defArtOpacity > 0.9) score = 44;
        else if (defArtScanDots >= 0.45) score = 90;
        else score = 78;
      } else if (artPlacement === 'back-pure' && defArtOpacity > 0.85) {
        score -= 35;
      }
    }

    if (logoScale > 0.26) score -= 12;

    const clamped = Math.max(12, Math.min(98, score));
    const status =
      clamped < 45
        ? 'Not Scannable'
        : clamped < 68
        ? 'Hard to Scan'
        : clamped < 84
        ? 'Scannable'
        : 'Highly Scannable';
    const color =
      clamped < 45
        ? 'text-rose-500'
        : clamped < 68
        ? 'text-amber-400'
        : 'text-emerald-400';

    return { score: clamped, status, color, isRisky: clamped < 52 };
  }, [defFgColor, defBgColor, artworkUrl, artPlacement, defArtScale, defArtOpacity, defArtScanDots, logoScale]);

  const handleAutoFixScannability = () => {
    setArtScanDots(0.55);
    setArtScale(0.82);
    setArtworkOpacity(0.85);
    if (getContrastRatio(fgColor, bgColor) < 3.0 && artPlacement !== 'neon-cutout') {
      setFgColor('#1e1b4b');
      setBgColor('#ffffff');
    }
  };

  // 2. Cached QR Matrix
  const qrMatrix = useMemo(() => {
    try {
      const text = payloadString || 'https://qrgenerato.com';
      let qr = QRCode.create(text, { errorCorrectionLevel: ecLevel });
      // Pattern density: step up from the smallest QR version that fits (more, finer modules).
      if (density !== 'auto') {
        const version = Math.min(40, qr.version + (density === 'dense' ? 3 : 6));
        qr = QRCode.create(text, { errorCorrectionLevel: ecLevel, version });
      }
      const size = qr.modules.size;
      const data = qr.modules.data;
      const matrix: boolean[][] = [];
      for (let r = 0; r < size; r++) {
        const row: boolean[] = [];
        for (let c = 0; c < size; c++) {
          row.push(Boolean(data[r * size + c]));
        }
        matrix.push(row);
      }
      return matrix;
    } catch {
      return [[true]];
    }
  }, [payloadString, ecLevel, density]);

  // 3. Complete Vector SVG Renderer (Supports BOTH Original Classic Art & Neon Cutout Art!)
  const getSvgMarkup = useCallback(
    (uid: string, animate = true) => {
      const count = qrMatrix.length;
      const cellSize = 10;
      const margin = 32;
      const qrSize = count * cellSize;

      const isArtActive = Boolean(artworkUrl);
      const isNeonCutout = isArtActive && artPlacement === 'neon-cutout';
      const isMedallion = isArtActive && artPlacement === 'medallion';

      const needsTopSpace = [
        'top-tag',
        'shopping-bag',
        'cafe-cup',
        'chef-menu',
        'gift-box',
        'smartphone',
        'review-stars',
        'wifi-card',
        'clipboard-pad',
        'upi-stand',
      ].includes(defFrameStyle) || isDecoFrame(defFrameStyle);
      // Decorative frames get extra side room so ornaments never crowd the quiet zone.
      const sidePad = isDecoFrame(defFrameStyle) ? DECO_SIDE_PAD : 0;

      const needsBottomSpace = defFrameStyle !== 'none' && defFrameStyle !== 'top-tag';
      const topSpace = needsTopSpace ? 58 : 0;
      const bottomSpace = needsBottomSpace ? 82 : 0;

      const totalW = qrSize + margin * 2 + sidePad * 2;
      const totalH = qrSize + margin * 2 + topSpace + bottomSpace;
      const offsetX = margin + sidePad;
      const offsetY = margin + topSpace;

      const linId = `qrLin_${uid}`;
      const radId = `qrRad_${uid}`;
      const neonId = `qrNeon_${uid}`;
      const bgLinId = `qrBgLin_${uid}`;
      const bgRadId = `qrBgRad_${uid}`;
      const boundsId = `qrBounds_${uid}`;
      const artPatId = `qrArtPat_${uid}`;
      const badgeId = `qrBadge_${uid}`;
      const glowFilterId = `qrGlow_${uid}`;

      const hasCenterBadge =
        !isNeonCutout &&
        (customLogoUrl !== null || selectedPresetLogo !== 'none' || isMedallion);

      const effectiveBadgeScale = isMedallion ? 0.28 : logoScale;
      const centerRadiusCells = hasCenterBadge ? Math.floor(count * (effectiveBadgeScale / 2 + 0.04)) : 0;
      const mid = (count - 1) / 2;

      const isFinderZone = (r: number, c: number) =>
        (r < 7 && c < 7) || (r < 7 && c >= count - 7) || (r >= count - 7 && c < 7);

      const isCenterCutout = (r: number, c: number) => {
        if (!hasCenterBadge) return false;
        return Math.abs(r - mid) <= centerRadiusCells && Math.abs(c - mid) <= centerRadiusCells;
      };

      const isActiveBodyModule = (r: number, c: number) => {
        if (r < 0 || r >= count || c < 0 || c >= count) return false;
        if (isFinderZone(r, c) || isCenterCutout(r, c)) return false;
        return Boolean(qrMatrix[r][c]);
      };

      const safeFg = defFgColor || '#000000';
      const safeGrad2 = defGrad2 || safeFg;
      const safeBg = isNeonCutout
        ? '#07070e'
        : isArtActive && (artPlacement === 'qr-fill' || artPlacement === 'back-halo' || artPlacement === 'back-pure')
        ? '#ffffff'
        : defBgColor || '#ffffff';
      const safeBg2 = isNeonCutout ? '#161426' : defBgColor2 || safeBg;

      const mainFill = isNeonCutout
        ? `url(#${neonId})`
        : gradientType === 'linear'
        ? `url(#${linId})`
        : gradientType === 'radial'
        ? `url(#${radId})`
        : safeFg;

      const cardBgFill =
        isNeonCutout || bgGradientType === 'linear'
          ? `url(#${bgLinId})`
          : bgGradientType === 'radial'
          ? `url(#${bgRadId})`
          : safeBg;

      const fxEffect = animate ? ANIMATED_EFFECT_MAP[defAnimEffectId] : undefined;
      const fx = fxEffect
        ? buildFxLayer({
            uid,
            effect: fxEffect,
            count,
            offsetX,
            offsetY,
            qrSize,
            fg: safeFg,
            solidFill: mainFill.startsWith('url(') ? null : mainFill,
            accent: gradientType !== 'none' && safeGrad2.toLowerCase() !== safeFg.toLowerCase() ? safeGrad2 : isDarkColor(safeBg) ? '#c084fc' : '#7c3aed',
            bg: safeBg,
            speed: defAnimSpeed,
          })
        : null;

      const bodyScale = DOT_SIZES[dotSize] * DOT_SPACINGS[dotSpacing];
      const alignCenters = alignmentCenters(count).filter(([ar, ac]) => !isCenterCutout(ar, ac));
      const solidAlign = alignCenters.length > 0 && alignmentPatternSvg(dotStyle, 0, 0, 0, 0, cellSize) !== null;
      const inAlignZone = (r: number, c: number) =>
        solidAlign && alignCenters.some(([ar, ac]) => Math.abs(r - ar) <= 2 && Math.abs(c - ac) <= 2);

      let bodyPaths = '';
      let bodyModules = '';
      let contrastHalos = '';
      let wovenScanDots = '';

      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (isFinderZone(r, c) || isCenterCutout(r, c)) continue;
          const x = offsetX + c * cellSize;
          const y = offsetY + r * cellSize;
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          const isDarkMod = qrMatrix[r][c];

          if (isNeonCutout && defArtScanDots > 0.05) {
            const distFromCenter = Math.max(Math.abs(r - mid), Math.abs(c - mid)) / (count / 2);
            if (distFromCenter < defArtScale * 0.85) {
              wovenScanDots += `<rect x="${cx - 1.8}" y="${cy - 1.8}" width="3.6" height="3.6" rx="1" fill="${
                isDarkMod ? '#ffffff' : '#05050a'
              }" fill-opacity="${defArtScanDots * 0.85}" />`;
            }
          }

          if (!isDarkMod) continue;

          if (artworkUrl && artPlacement === 'back-halo') {
            contrastHalos += `<rect x="${x - 0.8}" y="${y - 0.8}" width="${cellSize + 1.6}" height="${cellSize + 1.6}" rx="2.5" fill="#ffffff" fill-opacity="0.92" />`;
          }

          // Sparse styles draw each alignment pattern as one solid mini-eye (added after the loop).
          if (inAlignZone(r, c)) continue;
          const shape = bodyModule(dotStyle, x, y, cellSize, {
            scale: bodyScale,
            radius: defCornerRadius / 100,
            right: isActiveBodyModule(r, c + 1),
            bottom: isActiveBodyModule(r + 1, c),
          });
          bodyPaths += shape;
          if (fx?.wrapModules && fxEffect?.module) {
            bodyModules += wrapModule(shape, moduleDelay(fxEffect.module.delay, r, c, count));
          }
        }
      }
      if (solidAlign) {
        for (const [ar, ac] of alignCenters) {
          const shape = alignmentPatternSvg(dotStyle, ar, ac, offsetX, offsetY, cellSize) ?? '';
          bodyPaths += shape;
          if (fx?.wrapModules && fxEffect?.module) bodyModules += wrapModule(shape, moduleDelay(fxEffect.module.delay, ar, ac, count));
        }
      }

      const renderFinderEye = (r0: number, c0: number, eyeIdx: number) => {
        const x = offsetX + c0 * cellSize;
        const y = offsetY + r0 * cellSize;
        const outer = 7 * cellSize;
        const innerOffset = 2 * cellSize;
        const inner = 3 * cellSize;

        if (isNeonCutout) {
          const neonColors = [defEyeBorderColor || '#ec4899', '#fde047', '#22d3ee'];
          const glowCol = neonColors[eyeIdx % 3];
          return `
            <g ${defArtGlow > 0 ? `filter="url(#${glowFilterId})"` : ''}>
              <rect x="${x - 2}" y="${y - 2}" width="${outer + 4}" height="${outer + 4}" rx="10" fill="#05050a" stroke="${glowCol}" stroke-width="4.5" />
              <rect x="${x + 5}" y="${y + 5}" width="${outer - 10}" height="${outer - 10}" rx="5" fill="none" stroke="#ffffff" stroke-width="${cellSize * 0.85}" />
              <rect x="${x + innerOffset}" y="${y + innerOffset}" width="${inner}" height="${inner}" rx="4" fill="#05050a" stroke="${glowCol}" stroke-width="5" />
            </g>
          `;
        }

        const borderFill = customEyeColors ? defEyeBorderColor : mainFill;
        const centerFill = customEyeColors ? defEyeCenterColor : mainFill;

        let eyeBgPlate = '';
        if (artworkUrl && (artPlacement === 'back-halo' || artPlacement === 'back-pure')) {
          eyeBgPlate = `<rect x="${x - 3}" y="${y - 3}" width="${outer + 6}" height="${outer + 6}" rx="12" fill="#ffffff" fill-opacity="0.92" />`;
        }

        const eyeSvg = finderEye(finderShape, finderCenterShape, x, y, {
          cell: cellSize,
          ringFill: borderFill,
          centerFill,
          index: eyeIdx,
          thickness: EYE_THICKNESS[eyeThickness],
          size: EYE_SIZES[eyeSize],
          radius: defCornerRadius / 100,
        });
        return `${eyeBgPlate}${eyeSvg}`;
      };

      const bSize = qrSize * effectiveBadgeScale;
      const bx = offsetX + (qrSize - bSize) / 2;
      const by = offsetY + (qrSize - bSize) / 2;
      const badgeRadius = logoShape === 'circle' ? bSize / 2 : logoShape === 'rounded' ? bSize * 0.25 : 6;

      const artPatternDef = artworkUrl
        ? `<pattern id="${artPatId}" patternUnits="userSpaceOnUse" x="${offsetX}" y="${offsetY}" width="${qrSize}" height="${qrSize}">
            <image href="${artworkUrl}" xlink:href="${artworkUrl}" x="0" y="0" width="${qrSize}" height="${qrSize}" preserveAspectRatio="xMidYMid slice" />
          </pattern>`
        : '';

      const glowFilterDef =
        defArtGlow > 0
          ? `<filter id="${glowFilterId}" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="${defArtGlow * 0.45}" flood-color="#22d3ee" flood-opacity="0.7" />
            </filter>`
          : '';

      // Gradient direction across the whole QR, and 2 or 3 dot colours.
      const gradAxis = (dir: 'horizontal' | 'vertical' | 'diagonal') =>
        dir === 'horizontal'
          ? `x1="0" y1="0" x2="${totalW}" y2="0"`
          : dir === 'vertical'
          ? `x1="0" y1="0" x2="0" y2="${totalH}"`
          : `x1="0" y1="0" x2="${totalW}" y2="${totalH}"`;
      const dotColors = useGrad3 ? [safeFg, defGrad3 || safeGrad2, safeGrad2] : [safeFg, safeGrad2];
      const stopsOf = (cols: string[]) =>
        cols.map((col, i) => `<stop offset="${Math.round((i / (cols.length - 1)) * 100)}%" stop-color="${col}" />`).join('');
      const dotStops = stopsOf(dotColors);
      const dotStopsRadial = stopsOf([...dotColors].reverse());

      const defs = `
        <defs>
          <linearGradient id="${linId}" ${gradAxis(gradientDir)} gradientUnits="userSpaceOnUse">
            ${dotStops}
          </linearGradient>
          <radialGradient id="${radId}" cx="${totalW / 2}" cy="${totalH / 2}" r="${totalW * 0.6}" gradientUnits="userSpaceOnUse">
            ${dotStopsRadial}
          </radialGradient>
          <linearGradient id="${neonId}" x1="0" y1="0" x2="${totalW}" y2="${totalH}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#a855f7" />
            <stop offset="35%" stop-color="#22d3ee" />
            <stop offset="70%" stop-color="#4ade80" />
            <stop offset="100%" stop-color="#facc15" />
          </linearGradient>
          <linearGradient id="${bgLinId}" ${gradAxis(bgGradientDir)} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${safeBg}" />
            <stop offset="100%" stop-color="${safeBg2}" />
          </linearGradient>
          <radialGradient id="${bgRadId}" cx="${totalW / 2}" cy="${totalH / 2}" r="${totalW * 0.65}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${safeBg2}" />
            <stop offset="100%" stop-color="${safeBg}" />
          </radialGradient>
          <clipPath id="${boundsId}">
            <rect x="${offsetX - 8}" y="${offsetY - 8}" width="${qrSize + 16}" height="${qrSize + 16}" rx="18" />
          </clipPath>
          <clipPath id="${badgeId}">
            <rect x="${bx}" y="${by}" width="${bSize}" height="${bSize}" rx="${badgeRadius}" />
          </clipPath>
          ${artPatternDef}
          ${glowFilterDef}
          ${fx ? fx.defs : ''}
          ${fx?.clipId ? `<clipPath id="${fx.clipId}">${bodyPaths}</clipPath>` : ''}
        </defs>
      `;

      let bgSvg = '';
      let frameSvg = '';
      const safeLabel = escapeXml(defFrameText || 'SCAN ME');
      const midX = totalW / 2;

      const deco = isDecoFrame(defFrameStyle)
        ? renderDecoFrame(defFrameStyle, {
            uid,
            W: totalW,
            H: totalH,
            qx: offsetX,
            qy: offsetY,
            qs: qrSize,
            accent: defFrameColor,
            label: safeLabel,
            cardFill: cardBgFill,
            transparent: transparentBg,
          })
        : null;

      if (deco) {
        bgSvg = deco.back;
      } else if (!transparentBg) {
        if (defFrameStyle === 'ticket-stub') {
          bgSvg = `
            <rect x="6" y="6" width="${totalW - 12}" height="${totalH - 12}" rx="24" fill="${cardBgFill}" stroke="${defFrameColor}" stroke-width="6" />
            <circle cx="6" cy="${totalH - 82}" r="16" fill="#09090b" />
            <circle cx="${totalW - 6}" cy="${totalH - 82}" r="16" fill="#09090b" />
            <line x1="26" y1="${totalH - 82}" x2="${totalW - 26}" y2="${totalH - 82}" stroke="${defFrameColor}" stroke-width="3" stroke-dasharray="8 6" />
          `;
        } else if (defFrameStyle === 'coupon-cut') {
          bgSvg = `<rect x="8" y="8" width="${totalW - 16}" height="${totalH - 16}" rx="24" fill="${cardBgFill}" stroke="${defFrameColor}" stroke-width="5" stroke-dasharray="14 8" />`;
        } else if (defFrameStyle === 'smartphone') {
          bgSvg = `
            <rect x="8" y="6" width="${totalW - 16}" height="${totalH - 12}" rx="42" fill="${cardBgFill}" stroke="${defFrameColor}" stroke-width="10" />
            <rect x="${midX - 45}" y="18" width="90" height="14" rx="7" fill="${defFrameColor}" />
            <rect x="${midX - 50}" y="${totalH - 20}" width="100" height="6" rx="3" fill="${defFrameColor}" opacity="0.5" />
          `;
        } else if (defFrameStyle === 'polaroid') {
          bgSvg = `
            <rect x="6" y="6" width="${totalW - 12}" height="${totalH - 12}" rx="16" fill="${cardBgFill}" stroke="#cbd5e1" stroke-width="3" />
            <rect x="22" y="22" width="${totalW - 44}" height="${qrSize + 36}" rx="8" fill="none" stroke="rgba(15,23,42,0.12)" stroke-width="2" />
          `;
        } else {
          bgSvg = `<rect x="4" y="4" width="${totalW - 8}" height="${totalH - 8}" rx="28" fill="${cardBgFill}" stroke="${
            defFrameStyle !== 'none'
              ? defFrameColor
              : isNeonCutout
              ? defEyeBorderColor || '#a855f7'
              : 'rgba(148,163,184,0.28)'
          }" stroke-width="${defFrameStyle !== 'none' ? 6 : 2}" />`;
        }
      }

      const bannerY = totalH - 72;
      const bannerH = 54;

      switch (defFrameStyle) {
        case 'pill':
          frameSvg = `
            <rect x="${totalW * 0.16}" y="${totalH - 66}" width="${totalW * 0.68}" height="46" rx="23" fill="${defFrameColor}" />
            <text x="${midX}" y="${totalH - 38}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.5">${safeLabel}</text>
          `;
          break;
        case 'top-tag':
          frameSvg = `
            <rect x="${totalW * 0.16}" y="18" width="${totalW * 0.68}" height="40" rx="20" fill="${defFrameColor}" />
            <text x="${midX}" y="43" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">${safeLabel}</text>
          `;
          break;
        case 'shopping-bag':
          frameSvg = `
            <path d="M${midX - 42},54 C${midX - 42},10 ${midX + 42},10 ${midX + 42},54" fill="none" stroke="${defFrameColor}" stroke-width="8" stroke-linecap="round" />
            <circle cx="${midX - 42}" cy="56" r="6" fill="${defFrameColor}" />
            <circle cx="${midX + 42}" cy="56" r="6" fill="${defFrameColor}" />
            <rect x="20" y="${bannerY}" width="${totalW - 40}" height="${bannerH}" rx="15" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 23}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${bannerY + 41}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui, sans-serif" font-weight="600" font-size="9.5" letter-spacing="1.2">🛍️ OFFICIAL STORE CATALOG</text>
          `;
          break;
        case 'upi-stand':
          frameSvg = `
            <rect x="${midX - 70}" y="16" width="46" height="8" rx="4" fill="#f97316" />
            <rect x="${midX - 22}" y="16" width="44" height="8" rx="4" fill="#cbd5e1" />
            <rect x="${midX + 24}" y="16" width="46" height="8" rx="4" fill="#16a34a" />
            <text x="${midX}" y="44" text-anchor="middle" fill="${defFrameColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="14" letter-spacing="2">INSTANT QR PAY</text>
            <rect x="18" y="${bannerY}" width="${totalW - 36}" height="${bannerH}" rx="16" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 23}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="13.5" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${bannerY + 41}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui, sans-serif" font-weight="700" font-size="9.5" letter-spacing="1.2">BHIM • GPay • PhonePe • Paytm</text>
          `;
          break;
        case 'cafe-cup':
          frameSvg = `
            <g transform="translate(${midX - 22}, 14)">
              <circle cx="22" cy="22" r="22" fill="${defFrameColor}" />
              <path d="M13 18 H29 V26 C29 30 25 33 21 33 C17 33 13 30 13 26 Z" fill="#ffffff" />
              <path d="M29 20 H32 C33.5 20 34.5 21 34.5 22.5 C34.5 24 33.5 25 32 25 H29" fill="none" stroke="#ffffff" stroke-width="2" />
            </g>
            <rect x="18" y="${bannerY}" width="${totalW - 36}" height="${bannerH}" rx="16" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 23}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${bannerY + 41}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui, sans-serif" font-weight="600" font-size="9.5" letter-spacing="1.2">☕ FRESH DIGITAL TABLE MENU</text>
          `;
          break;
        case 'chef-menu':
          frameSvg = `
            <g transform="translate(${midX - 22}, 14)">
              <circle cx="22" cy="22" r="22" fill="${defFrameColor}" />
              <path d="M14 28 H30 V31 H14 Z M15 26 V20 C13 19 13 15 16 14 C17 11 21 10 22 10 C23 10 27 11 28 14 C31 15 31 19 29 20 V26 Z" fill="#ffffff" />
            </g>
            <rect x="18" y="${bannerY}" width="${totalW - 36}" height="${bannerH}" rx="16" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 23}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${bannerY + 41}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui, sans-serif" font-weight="600" font-size="9.5" letter-spacing="1.2">🍽️ SCAN FOR FULL RESTAURANT MENU</text>
          `;
          break;
        case 'scooter-delivery':
          frameSvg = `
            <rect x="18" y="${bannerY}" width="${totalW - 36}" height="${bannerH}" rx="27" fill="${defFrameColor}" />
            <circle cx="46" cy="${bannerY + 27}" r="19" fill="#ffffff" />
            <text x="46" y="${bannerY + 33}" text-anchor="middle" font-size="18">🛵</text>
            <text x="${midX + 16}" y="${bannerY + 23}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="13.5" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX + 16}" y="${bannerY + 41}" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="system-ui, sans-serif" font-weight="600" font-size="9.5" letter-spacing="1.2">FAST EXPRESS HOME DELIVERY</text>
          `;
          break;
        case 'gift-box':
          frameSvg = `
            <path d="M${midX},12 C${midX - 35},0 ${midX - 45},38 ${midX},34 C${midX + 45},38 ${midX + 35},0 ${midX},12 Z" fill="${defFrameColor}" />
            <rect x="18" y="${bannerY}" width="${totalW - 36}" height="${bannerH}" rx="16" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 23}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${bannerY + 41}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui, sans-serif" font-weight="600" font-size="9.5" letter-spacing="1.2">🎁 SPECIAL GIFT &amp; REWARD INSIDE</text>
          `;
          break;
        case 'chat-bubble':
          frameSvg = `
            <polygon points="${midX - 24},${bannerY} ${midX + 24},${bannerY} ${midX},${bannerY - 14}" fill="${defFrameColor}" />
            <rect x="22" y="${bannerY}" width="${totalW - 44}" height="48" rx="24" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 30}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14.5" letter-spacing="1.2">💬 ${safeLabel}</text>
          `;
          break;
        case 'polaroid':
          frameSvg = `
            <text x="${midX}" y="${totalH - 34}" text-anchor="middle" fill="${defFrameColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="17" letter-spacing="2">📸 ${safeLabel}</text>
          `;
          break;
        case 'smartphone':
          frameSvg = `
            <rect x="28" y="${totalH - 70}" width="${totalW - 56}" height="40" rx="20" fill="${defFrameColor}" />
            <text x="${midX}" y="${totalH - 45}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="13" letter-spacing="1.2">📱 ${safeLabel}</text>
          `;
          break;
        case 'ticket-stub':
          frameSvg = `
            <text x="${midX}" y="${totalH - 46}" text-anchor="middle" fill="${defFrameColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="15" letter-spacing="2">🎟️ ${safeLabel}</text>
            <text x="${midX}" y="${totalH - 24}" text-anchor="middle" fill="#64748b" font-family="monospace" font-weight="700" font-size="11">VIP PASS • #2026-PRO</text>
          `;
          break;
        case 'review-stars':
          frameSvg = `
            <text x="${midX}" y="42" text-anchor="middle" font-size="22" letter-spacing="4">⭐⭐⭐⭐⭐</text>
            <rect x="20" y="${bannerY}" width="${totalW - 40}" height="48" rx="14" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 30}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14.5" letter-spacing="1.2">${safeLabel}</text>
          `;
          break;
        case 'wifi-card':
          frameSvg = `
            <text x="${midX}" y="42" text-anchor="middle" fill="${defFrameColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="16" letter-spacing="2">📶 FREE GUEST WIFI</text>
            <rect x="20" y="${bannerY}" width="${totalW - 40}" height="48" rx="14" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 30}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">${safeLabel}</text>
          `;
          break;
        case 'coupon-cut':
          frameSvg = `
            <rect x="22" y="${bannerY}" width="${totalW - 44}" height="48" rx="12" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 30}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14.5" letter-spacing="1.5">✂️ ${safeLabel}</text>
          `;
          break;
        case 'neon-cyber':
          frameSvg = `
            <path d="M18,52 V18 H52 M${totalW - 52},18 H${totalW - 18} V52 M18,${totalH - 86} V${totalH - 120} M${totalW - 18},${totalH - 86} V${totalH - 120}" fill="none" stroke="${defFrameColor}" stroke-width="6" stroke-linecap="square" />
            <polygon points="28,${bannerY} ${totalW - 18},${bannerY} ${totalW - 28},${bannerY + 48} 18,${bannerY + 48}" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 30}" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="900" font-size="14.5" letter-spacing="2">⚡ ${safeLabel}</text>
          `;
          break;
        case 'clipboard-pad':
          frameSvg = `
            <rect x="${midX - 50}" y="10" width="100" height="32" rx="10" fill="${defFrameColor}" />
            <circle cx="${midX}" cy="26" r="6" fill="#ffffff" />
            <rect x="20" y="${bannerY}" width="${totalW - 40}" height="48" rx="14" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 30}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">📋 ${safeLabel}</text>
          `;
          break;
        case 'royal-ornate':
          frameSvg = `
            <rect x="12" y="12" width="${totalW - 24}" height="${totalH - 24}" rx="22" fill="none" stroke="${defFrameColor}" stroke-width="2" stroke-dasharray="6 4" />
            <rect x="22" y="${bannerY}" width="${totalW - 44}" height="48" rx="24" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 30}" text-anchor="middle" fill="#ffffff" font-family="serif" font-weight="800" font-size="14.5" letter-spacing="2">👑 ${safeLabel}</text>
          `;
          break;
        case 'banner':
          frameSvg = `
            <rect x="18" y="${bannerY}" width="${totalW - 36}" height="50" rx="14" fill="${defFrameColor}" />
            <text x="${midX}" y="${bannerY + 31}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.5">${safeLabel}</text>
          `;
          break;
      }

      if (deco) frameSvg = deco.front;

      let artBackLayer = '';
      let artDotsOverlay = '';
      let neonForegroundArt = '';

      const scaledW = qrSize * defArtScale;
      const scaledH = qrSize * defArtScale;
      const artX = offsetX + (qrSize - scaledW) / 2;
      const artY = offsetY + (qrSize - scaledH) / 2;

      if (isNeonCutout && (artCutoutUrl || artworkUrl)) {
        const cutoutHref = artCutoutUrl || artworkUrl;
        neonForegroundArt = `
          <g clip-path="url(#${boundsId})">
            <image href="${cutoutHref}" xlink:href="${cutoutHref}" x="${artX}" y="${artY}" width="${scaledW}" height="${scaledH}" opacity="${defArtOpacity}" preserveAspectRatio="xMidYMid meet" />
          </g>
          ${wovenScanDots}
        `;
      } else if (artworkUrl && (artPlacement === 'back-halo' || artPlacement === 'back-pure')) {
        artBackLayer = `
          <g clip-path="url(#${boundsId})">
            <image href="${artworkUrl}" xlink:href="${artworkUrl}" x="${offsetX - 8}" y="${offsetY - 8}" width="${qrSize + 16}" height="${qrSize + 16}" opacity="${
              artPlacement === 'back-pure' ? Math.min(0.45, defArtOpacity * 0.55) : defArtOpacity
            }" preserveAspectRatio="xMidYMid slice" />
          </g>
        `;
      } else if (artworkUrl && artPlacement === 'qr-fill') {
        artDotsOverlay = `
          <g fill="url(#${artPatId})" opacity="${defArtOpacity}" ${fx?.wrapModules ? `class="${fx.bodyClass}"` : ''}>${fx?.wrapModules ? bodyModules : bodyPaths}</g>
        `;
      }

      let centerLogoSvg = '';
      if (!isNeonCutout) {
        if (isMedallion && artworkUrl) {
          centerLogoSvg = `
            <rect x="${bx - 5}" y="${by - 5}" width="${bSize + 10}" height="${bSize + 10}" rx="${badgeRadius + 3}" fill="#ffffff" stroke="${safeFg}" stroke-width="3" />
            <image href="${artworkUrl}" xlink:href="${artworkUrl}" x="${bx}" y="${by}" width="${bSize}" height="${bSize}" clip-path="url(#${badgeId})" preserveAspectRatio="xMidYMid slice" />
          `;
        } else if (customLogoUrl) {
          centerLogoSvg = `
            <rect x="${bx - 5}" y="${by - 5}" width="${bSize + 10}" height="${bSize + 10}" rx="${badgeRadius + 3}" fill="#ffffff" stroke="rgba(15,23,42,0.12)" stroke-width="2" />
            <image href="${customLogoUrl}" xlink:href="${customLogoUrl}" x="${bx}" y="${by}" width="${bSize}" height="${bSize}" clip-path="url(#${badgeId})" preserveAspectRatio="xMidYMid contain" />
          `;
        } else if (selectedPresetLogo !== 'none') {
          const preset = PRESET_LOGOS.find((p) => p.id === selectedPresetLogo);
          if (preset) {
            if (preset.svg) {
              centerLogoSvg = `
                <rect x="${bx - 4}" y="${by - 4}" width="${bSize + 8}" height="${bSize + 8}" rx="${badgeRadius + 3}" fill="#ffffff" />
                <svg x="${bx}" y="${by}" width="${bSize}" height="${bSize}" viewBox="0 0 100 100">
                  ${preset.svg}
                </svg>
              `;
            } else {
              centerLogoSvg = `
                <rect x="${bx - 4}" y="${by - 4}" width="${bSize + 8}" height="${bSize + 8}" rx="${badgeRadius + 2}" fill="#ffffff" />
                <rect x="${bx}" y="${by}" width="${bSize}" height="${bSize}" rx="${badgeRadius}" fill="${preset.bg}" />
                <text x="${bx + bSize / 2}" y="${by + bSize * 0.66}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="${bSize * 0.52}">${preset.emoji}</text>
              `;
            }
          }
        }
      }

      const eyesSvg =
        renderFinderEye(0, 0, 0) +
        renderFinderEye(0, count - 7, 1) +
        renderFinderEye(count - 7, 0, 2);

      // Optional border around the QR, sitting in the outer part of the quiet zone.
      const borderW = { none: 0, thin: 3, medium: 6, thick: 10 }[qrBorder];
      const qrBorderSvg = borderW
        ? `<rect x="${offsetX - margin * 0.85}" y="${offsetY - margin * 0.85}" width="${qrSize + margin * 1.7}" height="${qrSize + margin * 1.7}" rx="18" fill="none" stroke="${defQrBorderColor}" stroke-width="${borderW}" />`
        : '';
      const bodyOpacityAttr = defBodyOpacity < 100 ? `opacity="${defBodyOpacity / 100}"` : '';

      const bodyFilterAttr =
        isNeonCutout && defArtGlow > 0 ? `filter="url(#${glowFilterId})"` : '';

      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%">
        ${fx ? fx.style : ''}
        ${defs}
        ${bgSvg}
        ${artBackLayer}
        ${contrastHalos}
        ${qrBorderSvg}
        <g fill="${fx?.bodyFill ?? mainFill}" ${fx ? `class="${fx.bodyClass}"` : ''} ${bodyFilterAttr} ${bodyOpacityAttr}>${fx?.wrapModules ? bodyModules : bodyPaths}</g>
        ${artDotsOverlay}
        ${fx ? fx.overlay : ''}
        ${eyesSvg}
        ${neonForegroundArt}
        ${centerLogoSvg}
        ${frameSvg}
      </svg>`;
    },
    [
      qrMatrix, dotStyle, finderShape, finderCenterShape,
      dotSize, dotSpacing, defCornerRadius, eyeThickness, eyeSize, defBodyOpacity, qrBorder, defQrBorderColor,
      gradientDir, bgGradientDir, useGrad3, defGrad3,
      customEyeColors, defEyeBorderColor, defEyeCenterColor,
      defFrameStyle, defFrameText, defFrameColor, defFgColor,
      defGrad2, gradientType, defBgColor, defBgColor2, bgGradientType, transparentBg,
      selectedPresetLogo, customLogoUrl, logoScale, logoShape,
      artworkUrl, artCutoutUrl, artPlacement, defArtOpacity, defArtScale, defArtScanDots, defArtGlow,
      defAnimEffectId, defAnimSpeed,
    ]
  );

  // Wraps the QR in the selected card layout (if any). Empty fields fall back to the card's sample text.
  const activeCard = cardId !== 'none' ? CARD_MAP[cardId] : undefined;
  // Image cards: an SVG drawn onto a canvas cannot load linked files, so the selected card's artwork
  // is fetched once and embedded as a data URL. The preview uses the plain URL until it is ready.
  const activeArtSrc = activeCard?.artSrc;
  useEffect(() => {
    if (!activeArtSrc || cardArtData?.src === activeArtSrc) return;
    let cancelled = false;
    fetch(activeArtSrc)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          })
      )
      .then((data) => {
        if (!cancelled) setCardArtData({ src: activeArtSrc, data });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeArtSrc, cardArtData?.src]);

  const getFinalMarkup = useCallback(
    (uid: string, animate = true) => {
      const qr = getSvgMarkup(uid, animate);
      const design = activeCard
        ? renderCardSvg(
            activeCard,
            {
              name: defCardName.trim() || activeCard.defaults.name,
              title: defCardTitle.trim() || activeCard.defaults.title,
              extra: defCardExtra.trim() || activeCard.defaults.extra,
              subtitle: defCardSubtitle.trim(),
              art: activeCard.artSrc
                ? cardArtData?.src === activeCard.artSrc
                  ? cardArtData.data
                  : activeCard.artSrc
                : undefined,
            },
            qr,
            uid,
            {
              layout: cardQrLayout,
              free: defCardQrFree ?? undefined,
              plate: cardPlate === 'white' ? '#ffffff' : cardPlate === 'qr-bg' && !transparentBg ? defBgColor : undefined,
            },
            animate && cardMotionId !== 'none' ? { id: cardMotionId, speed: animSpeed } : undefined,
            cardTextMode === 'custom' ? defCardText : undefined,
            defCardPanel
          )
        : qr;
      return design;
    },
    [getSvgMarkup, activeCard, defCardName, defCardTitle, defCardExtra, defCardSubtitle, cardTextMode, defCardText, defCardPanel, cardArtData, cardQrLayout, defCardQrFree, cardPlate, transparentBg, defBgColor, cardMotionId, animSpeed]
  );

  const hasCardMotion = Boolean(activeCard) && cardMotionId !== 'none';
  const isAnimated = animEffectId !== 'none' || hasCardMotion;
  const loopSeconds = useMemo(() => {
    const fxEffect = ANIMATED_EFFECT_MAP[animEffectId];
    const longest = Math.max(fxEffect ? effectLoopSeconds(fxEffect, animSpeed) : 0, hasCardMotion ? CARD_MOTION_LOOP / animSpeed : 0);
    return Math.min(6, Math.max(1.5, Number(longest.toFixed(2)) || 3));
  }, [animEffectId, animSpeed, hasCardMotion]);

  const runExport = async (format: 'gif' | 'mp4') => {
    if (!isAnimated || exportState) return;
    setExportError(null);
    setExportState({ format, progress: 0, label: 'Preparing…' });
    try {
      const svg = getFinalMarkup('vid', true);
      const onProgress = (progress: number, label: string) => setExportState({ format, progress, label });
      const background = transparentBg ? '#ffffff' : defBgColor || '#ffffff';
      const base = activeCard ? `qr-generato-${activeCard.id}` : `qr-generato-${qrType}`;
      if (format === 'gif') {
        const blob = await exportGif(svg, { seconds: loopSeconds, fps: 20, longest: activeCard ? 600 : 480, background, onProgress });
        downloadBlob(blob, `${base}-animated.gif`);
      } else {
        const blob = await exportMp4(svg, { seconds: loopSeconds, fps: 30, longest: 1080, background, minSeconds: 6, onProgress });
        downloadBlob(blob, `${base}-animated.mp4`);
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed. Please try again.');
    } finally {
      setExportState(null);
    }
  };

  // Only the layout that is on screen gets the live SVG (the other is display:none at this width).
  // Building and parsing a hidden copy on every change doubled the work behind each click/keystroke.
  // null = not measured yet (first client render), so both are filled once to stay safe.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Animated previews are repainted every frame (SVG can't be GPU-composited). Pause them while
  // they're scrolled off screen, e.g. when reading the guide below the studio.
  useEffect(() => {
    if (!isAnimated || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) =>
      entries.forEach((e) => e.target.classList.toggle('preview-offscreen', !e.isIntersecting))
    );
    document.querySelectorAll('[data-live-preview]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isAnimated, isDesktop, studioMode]);
  // Mouse users can't scroll sideways strips (frame groups, card types…) with a normal wheel.
  // When the pointer enters such a strip, give it a wheel handler that turns vertical wheel into
  // horizontal scroll. Attached per strip on demand, so page scrolling never waits on a global listener.
  useEffect(() => {
    const wired = new WeakSet<Element>();
    const onWheel = (e: WheelEvent) => {
      const el = e.currentTarget as HTMLElement;
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // trackpad sideways / zoom: leave alone
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) return;
      const next = Math.max(0, Math.min(max, el.scrollLeft + e.deltaY));
      if (next === el.scrollLeft) return; // at either end: let the page scroll
      el.scrollLeft = next;
      e.preventDefault();
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest?.('.overflow-x-auto');
      if (!el || wired.has(el)) return;
      wired.add(el);
      el.addEventListener('wheel', onWheel as EventListener, { passive: false });
    };
    document.addEventListener('pointerover', onOver, { passive: true });
    return () => document.removeEventListener('pointerover', onOver);
  }, []);

  // ── Card QR: drag on the preview (Custom position) ──
  const canDragCardQr = Boolean(activeCard?.movable) && cardQrLayout === 'free' && cardQrFree !== null;
  const canDragCardText = Boolean(activeCard) && cardTextMode === 'custom';
  const canDragCardPanel = Boolean(activeCard?.panelSlot) && cardPanel.mode === 'custom';
  /** What the current pointer drag is moving on the card preview. */
  const cardDrag = useRef<{ mode: 'qr' | 'text' | 'panel'; line?: CardLineKey; dx: number; dy: number } | null>(null);
  const cardDragFrame = useRef(0);

  /** Pointer position as 0–1 of the card's width/height (the SVG is drawn with preserveAspectRatio "meet"). */
  const pointerOnCard = (el: HTMLElement, clientX: number, clientY: number) => {
    const svg = el.querySelector('svg');
    if (!svg || !activeCard) return null;
    const r = svg.getBoundingClientRect();
    const scale = Math.min(r.width / activeCard.w, r.height / activeCard.h);
    const ox = r.left + (r.width - activeCard.w * scale) / 2;
    const oy = r.top + (r.height - activeCard.h * scale) / 2;
    return {
      cx: Math.min(1, Math.max(0, (clientX - ox) / scale / activeCard.w)),
      cy: Math.min(1, Math.max(0, (clientY - oy) / scale / activeCard.h)),
    };
  };

  const applyCardDrag = (el: HTMLElement, clientX: number, clientY: number) => {
    const d = cardDrag.current;
    const pt = pointerOnCard(el, clientX, clientY);
    if (!d || !pt) return;
    cancelAnimationFrame(cardDragFrame.current);
    cardDragFrame.current = requestAnimationFrame(() => {
      if (d.mode === 'qr') {
        setCardQrFree((f) => (f ? { ...f, cx: pt.cx, cy: pt.cy } : f));
      } else if (d.mode === 'panel') {
        const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
        setCardPanel((pn) => ({ ...pn, cx: clamp01(pt.cx + d.dx), cy: clamp01(pt.cy + d.dy) }));
      } else {
        // Move just the grabbed line, keeping the grab point under the finger so it doesn't jump.
        const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
        const k = d.line;
        if (!k) return;
        setCardText((t) => ({ ...t, lines: { ...t.lines, [k]: { ...t.lines[k], cx: clamp01(pt.cx + d.dx), cy: clamp01(pt.cy + d.dy) } } }));
      }
    });
  };

  const endCardDrag = () => {
    cardDrag.current = null;
  };

  const cardQrDragProps =
    canDragCardQr || canDragCardText || canDragCardPanel
      ? {
          onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
            const onText = canDragCardText ? (e.target as Element).closest?.('[data-line]') : null;
            const lineKey = (onText?.getAttribute('data-line') || '') as CardLineKey;
            const pt = pointerOnCard(e.currentTarget, e.clientX, e.clientY);
            if (!pt || !activeCard) return;
            // Priority: text line > the QR itself (when movable) > custom panel > anywhere (QR, when movable)
            const q = resolveCardPlacement(activeCard, { layout: cardQrLayout, free: cardQrFree ?? undefined }).qr;
            const px = pt.cx * activeCard.w;
            const py = pt.cy * activeCard.h;
            const onQr = canDragCardQr && px >= q.x && px <= q.x + q.size && py >= q.y && py <= q.y + q.size;
            const onPanel = !onText && !onQr && canDragCardPanel && Boolean((e.target as Element).closest?.('[data-card-panel]'));
            if (!onText && !onPanel && !canDragCardQr) return; // nothing draggable here: leave the click alone
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            if (onText && cardText.lines[lineKey]) {
              const L = cardText.lines[lineKey];
              cardDrag.current = { mode: 'text', line: lineKey, dx: L.cx - pt.cx, dy: L.cy - pt.cy };
              setCardTextSel(lineKey); // the controls follow the line you grab
            } else if (onPanel) {
              cardDrag.current = { mode: 'panel', dx: cardPanel.cx - pt.cx, dy: cardPanel.cy - pt.cy };
            } else {
              cardDrag.current = { mode: 'qr', dx: 0, dy: 0 };
            }
            applyCardDrag(e.currentTarget, e.clientX, e.clientY);
          },
          onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
            if (cardDrag.current) applyCardDrag(e.currentTarget, e.clientX, e.clientY);
          },
          onPointerUp: endCardDrag,
          onPointerCancel: endCardDrag,
          title: [canDragCardText && 'text', canDragCardPanel && 'panel', canDragCardQr && 'QR'].filter(Boolean).join(', ').replace(/^/, 'Drag to move: '),
          // Marks the preview so CSS shows a "move" cursor over the text block (see globals.css).
          'data-text-draggable': canDragCardText ? '' : undefined,
          'data-panel-draggable': canDragCardPanel ? '' : undefined,
          style: { touchAction: 'none' as const, cursor: canDragCardQr ? 'move' : undefined },
        }
      : {};

  /** One click: QR dots in the card's colour (darkened enough to scan), eyes in its accent. */
  const matchCardColours = () => {
    const accent = activeCard?.accent;
    if (!accent) return;
    const against = transparentBg ? '#ffffff' : bgColor;
    setGradientType('linear');
    setFgColor(shadeForContrast(accent, against, 7));
    setGradientColor2(shadeForContrast(accent, against, 4.5));
    setCustomEyeColors(true);
    setEyeBorderColor(shadeForContrast(accent, against, 3.5));
    setEyeCenterColor(shadeForContrast(accent, against, 7));
  };

  const svgMobile = useMemo(() => (isDesktop === true ? '' : getFinalMarkup('mob')), [getFinalMarkup, isDesktop]);
  const svgDesktop = useMemo(() => (isDesktop === false ? '' : getFinalMarkup('desk')), [getFinalMarkup, isDesktop]);

  const selectCard = (id: string) => {
    if (id !== cardId) {
      // New layout: clear custom text so the card shows its own sample until the user types.
      setCardName('');
      setCardTitle('');
      setCardExtra('');
    }
    setCardId(id);
  };

  /** Raster size for an SVG string: longest side = `longest`, aspect ratio taken from its viewBox. */
  const rasterSize = (svg: string, longest: number) => {
    const m = /viewBox="[\d.-]+ [\d.-]+ ([\d.]+) ([\d.]+)"/.exec(svg);
    const vw = m ? parseFloat(m[1]) : 1;
    const vh = m ? parseFloat(m[2]) : 1;
    return vw >= vh
      ? { w: longest, h: Math.round((longest * vh) / vw) }
      : { w: Math.round((longest * vw) / vh), h: longest };
  };

  /**
   * Rasterises an SVG to a PNG Blob without freezing the page.
   * 1. The SVG gets an explicit pixel size, so every browser (incl. Safari) renders it at full resolution.
   * 2. createImageBitmap() rasterises it in the background (drawing the SVG straight onto a canvas
   *    froze the page for ~1 s on a 2000×3000 card).
   * 3. A small worker draws the bitmap on an OffscreenCanvas and encodes the PNG off the main thread.
   * Older browsers fall back step by step to the plain canvas path.
   */
  const svgToPngBlob = async (svg: string, longest: number): Promise<Blob> => {
    const { w, h } = rasterSize(svg, longest);
    const sized = svg.replace(/(<svg\b[^>]*?)\swidth="100%" height="100%"/, `$1 width="${w}" height="${h}"`);
    const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();
      let bitmap: ImageBitmap | null = null;
      try {
        bitmap = await createImageBitmap(img);
      } catch {
        bitmap = null;
      }
      if (bitmap && typeof OffscreenCanvas !== 'undefined' && typeof Worker !== 'undefined') {
        try {
          return await encodeInWorker(bitmap, w, h);
        } catch {
          bitmap = await createImageBitmap(img).catch(() => null); // the first bitmap was transferred away
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap ?? img, 0, 0, w, h);
      bitmap?.close();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      canvas.width = canvas.height = 0; // free the big bitmap right away (helps phones)
      if (!blob) throw new Error('PNG export failed');
      return blob;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  /** Lets React paint the "Preparing…" state before the heavy work starts. */
  const nextPaint = () => new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 0)));

  const handleDownloadPng = async () => {
    if (exporting) return;
    setExporting('png');
    try {
      await nextPaint();
      const svgExport = getFinalMarkup('exp', false);
      const blob = await svgToPngBlob(svgExport, activeCard ? 3000 : 1400);
      downloadBlob(blob, activeCard ? `qr-generato-${activeCard.id}-card.png` : `qr-generato-${qrType}.png`);
    } catch {
      alert('Could not create the PNG. Please try again, or download the SVG instead.');
    } finally {
      setExporting(null);
    }
  };

  const handleDownloadSvg = () => {
    const svgExport = getFinalMarkup('exp');
    downloadBlob(
      new Blob([svgExport], { type: 'image/svg+xml;charset=utf-8' }),
      isAnimated ? `qr-generato-${qrType}-animated.svg` : `qr-generato-${qrType}.svg`
    );
  };

  const handleCopyImage = async () => {
    if (exporting) return;
    setExporting('copy');
    try {
      await nextPaint();
      const blob = await svgToPngBlob(getFinalMarkup('exp', false), 1000);
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        downloadBlob(blob, `qr-generato-${qrType}.png`); // browsers without image clipboard: save instead
      }
    } catch {
      alert('Could not copy the image. Try “Download PNG” instead.');
    } finally {
      setExporting(null);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'art' | 'scan'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'logo') {
        setCustomLogoUrl(result);
        setSelectedPresetLogo('none');
      } else if (target === 'art') {
        setSelectedArtId('custom');
        setArtworkUrl(result);
        setArtCutoutUrl(result);
      } else if (target === 'scan') {
        setScanError(null);
        const img = new Image();
        img.onload = async () => {
          try {
            const text = await decodeQr(img, 1600);
            if (text) {
              setScanResult(text);
              return;
            }
            setScanError('Could not detect a QR code in this image. Try a sharper screenshot or crop closer to the code.');
          } catch {
            setScanError('Could not read this image. Please try another screenshot or photo.');
          }
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  /** Fills the form from pasted text, a scanned/imported QR, a contact file or a phone contact. */
  const applyDetected = (d: Detected) => {
    // Types whose form is the single main field (links, socials, PIN, search…).
    const SPECIAL = ['upi', 'sepa', 'paypal', 'cashapp', 'revolut', 'pix', 'paynow', 'crypto', 'bank', 'wifi', 'vcard', 'whatsapp', 'email', 'sms', 'event', 'maps'];
    const mainField = !SPECIAL.includes(qrType);
    let target: string = d.type;
    switch (d.type) {
      case 'url':
        setInputValue(d.url);
        if (mainField && !['phone', 'pin', 'search', 'text'].includes(qrType)) target = qrType; // e.g. Instagram stays Instagram
        break;
      case 'text':
        setInputValue(d.text);
        if (mainField) target = qrType;
        break;
      case 'phone':
        if (qrType === 'whatsapp') { setWaPhone(d.phone); target = 'whatsapp'; }
        else if (qrType === 'sms') { setSmsPhone(d.phone); target = 'sms'; }
        else if (qrType === 'vcard') { setVcardPhone(d.phone); target = 'vcard'; }
        else setInputValue(d.phone);
        break;
      case 'email':
        if (qrType === 'vcard' && !d.subject && !d.body) { setVcardEmail(d.to); target = 'vcard'; }
        else { setEmailTo(d.to); setEmailSub(d.subject); setEmailBody(d.body); }
        break;
      case 'wifi':
        setWifiSsid(d.ssid); setWifiPass(d.password); setWifiType(d.security); setWifiHidden(d.hidden);
        break;
      case 'vcard':
        setVcardName(d.name); setVcardOrg(d.org); setVcardPhone(d.phone); setVcardEmail(d.email); setVcardWebsite(d.website); setVcardCity(d.city);
        break;
      case 'upi':
        setUpiId(d.id); setUpiName(d.name); setUpiAmount(d.amount); setUpiNote(d.note);
        break;
      case 'whatsapp':
        setWaPhone(d.phone.replace(/[^\d+]/g, '')); setWaMessage(d.message);
        break;
      case 'sms':
        setSmsPhone(d.phone); setSmsBody(d.body);
        break;
      case 'maps':
        setMapsQuery(d.query);
        break;
    }
    const cat = QR_TYPES.find((t) => t.id === target)?.category;
    if (cat) setActiveCategory(cat as CategoryId);
    setQrType(target);
  };

  const applyQuickPreset = (preset: 'classic' | 'upi' | 'cafe' | 'cyber') => {
    if (preset === 'classic') {
      handleResetDesign();
    } else if (preset === 'upi') {
      setActiveCategory('payments');
      setQrType('upi');
      setArtworkUrl(null);
      setArtCutoutUrl(null);
      setDotStyle('liquid');
      setFinderShape('rounded');
      setFinderCenterShape('circle');
      setFgColor('#059669');
      setGradientColor2('#10b981');
      setGradientType('linear');
      setBgColor('#ffffff');
      setBgGradientType('none');
      setFrameStyle('upi-stand');
      setFrameText('SCAN & PAY WITH ANY UPI APP');
      setFrameColor('#059669');
      setSelectedPresetLogo('upi');
    } else if (preset === 'cafe') {
      setActiveCategory('business');
      setQrType('menu');
      setArtworkUrl(null);
      setArtCutoutUrl(null);
      setDotStyle('dots');
      setFinderShape('leaf-tl');
      setFinderCenterShape('circle');
      setFgColor('#b45309');
      setGradientColor2('#ea580c');
      setGradientType('linear');
      setBgColor('#ffffff');
      setBgGradientType('none');
      setFrameStyle('cafe-cup');
      setFrameText('SCAN FOR CAFE MENU');
      setFrameColor('#b45309');
      setSelectedPresetLogo('menu');
    } else if (preset === 'cyber') {
      setDesignTab('artwork');
      const bird = ART_PRESETS.find((a) => a.id === 'neon-paradise-bird') || ART_PRESETS[0];
      applyArtPreset(bird);
      setArtPlacement('neon-cutout');
      setFrameStyle('none');
    }
  };

  const renderMiniBatchSvg = (text: string) => {
    try {
      const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
      const s = qr.modules.size;
      const d = qr.modules.data;
      let rects = '';
      for (let r = 0; r < s; r++) {
        for (let c = 0; c < s; c++) {
          if (d[r * s + c]) {
            rects += `<rect x="${c * 5 + 10}" y="${r * 5 + 10}" width="5" height="5" fill="${defFgColor === '#ffffff' ? '#18181b' : defFgColor}"/>`;
          }
        }
      }
      const dim = s * 5 + 20;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="100%" height="100%"><rect width="${dim}" height="${dim}" rx="12" fill="#ffffff"/>${rects}</svg>`;
    } catch {
      return '';
    }
  };

  const handleBatchZip = async () => {
    const lines = parseBatchLines(batchInput);
    if (!lines.length || batchZipProgress) return;
    setBatchZipProgress(`0 / ${lines.length}`);
    try {
      const blob = await buildBatchZip(lines, { dark: defFgColor === '#ffffff' ? '#18181b' : defFgColor }, (done, total) =>
        setBatchZipProgress(`${done} / ${total}`)
      );
      downloadBlob(blob, `qr-codes-${lines.length}.zip`);
    } catch {
      alert('Could not build the ZIP. Check that every line is short enough for a QR code.');
    } finally {
      setBatchZipProgress(null);
    }
  };

  const handlePrintBatch = () => {
    const lines = parseBatchLines(batchInput);
    const win = window.open('', '_blank');
    if (!win) return;
    const itemsHtml = lines
      .map((line, idx) => {
        const svg = renderMiniBatchSvg(line);
        return `<div style="border:1px solid #cbd5e1;border-radius:16px;padding:16px;text-align:center;font-family:sans-serif;">
          <div style="width:150px;height:150px;margin:0 auto;">${svg}</div>
          <div style="font-size:11px;font-weight:700;margin-top:8px;color:#0f172a;word-break:break-all;">#${idx + 1}: ${escapeXml(line.slice(0, 48))}</div>
        </div>`;
      })
      .join('');
    win.document.write(`<html><head><title>Batch QR Sheet - QR Generato PRO</title></head><body style="padding:24px;"><h2 style="font-family:sans-serif;">Batch QR Print Sheet (${lines.length} Codes)</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px;">${itemsHtml}</div><script>window.onload=()=>window.print();</script></body></html>`);
    win.document.close();
  };

  const cardClass = isDark
    ? 'bg-[#111116] border-zinc-800/90 text-zinc-100 shadow-lg shadow-black/20'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-md shadow-slate-200/70';

  const subCardClass = isDark
    ? 'bg-zinc-950/75 border-zinc-800/90'
    : 'bg-slate-50 border-slate-200/90';

  const activePillClass = isDark
    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/25'
    : 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20';

  const inactivePillClass = isDark
    ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
    : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300';

  /** Ready-made combination: shapes plus a matching colour set (dots, gradient, eye ring, eye centre). */
  const applyStylePreset = (id: string) => {
    const p = STYLE_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setDotStyle(p.body);
    setFinderShape(p.ring);
    setFinderCenterShape(p.center);
    setFgColor(p.colors[0]);
    setGradientColor2(p.colors[1]);
    setGradientType('linear');
    setCustomEyeColors(true);
    setEyeBorderColor(p.colors[2]);
    setEyeCenterColor(p.colors[3]);
  };

  /** Small segmented control used across the Style tab. `labels` renames options; `hideLabel` keeps it for screen readers only. */
  const renderSeg = <T extends string>(
    label: string,
    options: readonly T[],
    value: T,
    onChange: (v: T) => void,
    labels?: Partial<Record<T, string>>,
    hideLabel = false
  ) => (
    <div className="space-y-1 min-w-0">
      <span className={clsx(hideLabel ? 'sr-only' : 'block text-[11px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>{label}</span>
      <div className={clsx('grid p-0.5 rounded-lg border', subCardClass)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className={clsx(
              'px-1 py-1.5 sm:py-1 rounded-md text-[11px] font-bold capitalize whitespace-nowrap overflow-hidden text-ellipsis transition-colors cursor-pointer',
              value === o ? 'bg-indigo-600 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {labels?.[o] ?? o}
          </button>
        ))}
      </div>
    </div>
  );

  /** Compact colour field: swatch picker + editable hex, sized to sit two per row on phones. */
  const renderColor = (label: string, value: string, onChange: (v: string) => void) => (
    <div className={clsx('flex items-center gap-2 p-1.5 pr-2 rounded-xl border min-w-0', subCardClass)}>
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-9 h-9 shrink-0 rounded-lg cursor-pointer border-0 bg-transparent p-0"
      />
      <span className="min-w-0 flex-1">
        <span className={clsx('block text-[10px] font-semibold leading-tight', isDark ? 'text-zinc-400' : 'text-slate-500')}>{label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} hex code`}
          spellCheck={false}
          className="w-full bg-transparent text-xs font-mono font-semibold outline-none uppercase"
        />
      </span>
    </div>
  );

  // Stable callback so the memoized DecoFramePicker doesn't re-render on unrelated studio changes.
  const pickDecoFrame = useCallback((id: string) => {
    const d = DECO_FRAME_MAP[id];
    if (!d) return;
    setFrameStyle(id);
    setFrameText(d.defaultText);
    setFrameColor(d.accent);
  }, []);

  const secondaryActionBtnClass = isDark
    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400'
    : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100';

  const inputClass = clsx(
    'w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30',
    isDark
      ? 'bg-zinc-900/90 border-zinc-700/90 text-zinc-100 placeholder-zinc-400 focus:bg-zinc-900'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
  );

  const labelClass = clsx(
    'block text-xs font-semibold mb-1.5',
    isDark ? 'text-zinc-300' : 'text-slate-700'
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-2 sm:pt-5 pb-14">
      {/* Compact Top Bar: Mode Switcher + Quick Actions */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div
          className={clsx(
            'inline-flex items-center p-1 rounded-xl border',
            isDark ? 'bg-[#111116] border-zinc-800/90' : 'bg-white border-slate-200/90 shadow-sm'
          )}
        >
          {[
            { id: 'create', label: 'Create', icon: QrCode },
            { id: 'scanner', label: 'Scan', icon: Camera },
            { id: 'batch', label: 'Batch', icon: Layers },
          ].map((m) => {
            const Icon = m.icon;
            const active = studioMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setStudioMode(m.id as StudioMode)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'classic', label: 'Classic' },
            { id: 'upi', label: 'UPI Stand' },
            { id: 'cafe', label: 'Cafe Menu' },
            { id: 'cyber', label: '⚡ Neon Art' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyQuickPreset(p.id as 'classic' | 'upi' | 'cafe' | 'cyber')}
              className={clsx(
                'hidden md:inline-flex px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer',
                inactivePillClass
              )}
            >
              {p.label}
            </button>
          ))}

          <button
            type="button"
            onClick={handleResetDesign}
            title="Reset Design"
            className={clsx(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer',
              inactivePillClass
            )}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer',
              isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 shadow-sm'
            )}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden min-[380px]:inline">{isDark ? 'Light' : 'Dark'}</span>
            <span className="sr-only min-[380px]:hidden">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
          </button>
        </div>
      </div>

      {/* Quick styles on mobile: one scrollable chip row (the desktop bar shows them inline) */}
      {studioMode === 'create' && (
        <div className="md:hidden -mx-1 px-1 mb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className={clsx('shrink-0 text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-zinc-500' : 'text-slate-400')}>
            Quick
          </span>
          {[
            { id: 'classic', label: 'Classic' },
            { id: 'upi', label: 'UPI Stand' },
            { id: 'cafe', label: 'Cafe Menu' },
            { id: 'cyber', label: '⚡ Neon Art' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyQuickPreset(p.id as 'classic' | 'upi' | 'cafe' | 'cyber')}
              className={clsx('shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer whitespace-nowrap', inactivePillClass)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* MODE 1: CREATE QR STUDIO */}
      {studioMode === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* LEFT COLUMN (7 Cols on PC) */}
          <div className="lg:col-span-7 space-y-4">
            {/* CLEAN, UNCLUTTERED STICKY MOBILE PREVIEW DOCK */}
            <div className="block lg:hidden sticky top-[calc(var(--header-h)+6px)] z-30">
              <div
                className={clsx(
                  'p-2.5 rounded-2xl border shadow-2xl backdrop-blur-md',
                  isDark
                    ? 'bg-[#111116]/95 border-zinc-800 shadow-black/80'
                    : 'bg-white/95 border-slate-200 shadow-slate-300/70'
                )}
              >
                {!mobileZoomed ? (
                  <div>
                    {/* Top Split Row: Crisp QR Preview + Status & Primary Export Actions */}
                    <div className="flex items-center gap-3">
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Expand QR preview"
                        onClick={() => setMobileZoomed(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setMobileZoomed(true);
                          }
                        }}
                        title="Tap to expand QR"
                        className={clsx(
                          'relative w-[72px] h-[72px] md:w-28 md:h-28 rounded-xl p-1 flex items-center justify-center border shrink-0 overflow-hidden cursor-pointer [&>svg]:w-full [&>svg]:h-full',
                          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
                        )}
                      >
                        <div data-live-preview className="w-full h-full" dangerouslySetInnerHTML={{ __html: svgMobile }} />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/80 text-white pointer-events-none">
                          ⤢ Zoom
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                        {/* Scannability Status + Expand */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={clsx(
                                'w-2 h-2 rounded-full shrink-0',
                                scannability.isRisky ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                              )}
                            />
                            <span className={clsx('text-[11px] font-extrabold uppercase tracking-wide truncate', scannability.color)}>
                              {scannability.status}
                            </span>
                          </div>
                          {scannability.isRisky ? (
                            <button
                              type="button"
                              onClick={handleAutoFixScannability}
                              className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500 text-zinc-950 shrink-0 cursor-pointer"
                            >
                              Auto-Fix ✓
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setMobileZoomed(true)}
                              className={clsx(
                                'px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer shrink-0',
                                inactivePillClass
                              )}
                            >
                              Full Size ⤢
                            </button>
                          )}
                        </div>

                        {/* Export Buttons Row (Spacious & Easy to Tap) */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={handleDownloadPng}
                            disabled={exporting === 'png'}
                            aria-busy={exporting === 'png'}
                            className={clsx(
                              'col-span-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold cursor-pointer shadow-sm',
                              isDark ? 'bg-white text-zinc-950' : 'bg-indigo-600 text-white'
                            )}
                          >
                            {exporting === 'png' ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" /> : <Download className="w-3.5 h-3.5 shrink-0" />} {exporting === 'png' ? 'Preparing…' : 'PNG'}
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadSvg}
                            className={clsx(
                              'col-span-1 py-2 px-2 rounded-xl text-xs font-bold border text-center cursor-pointer',
                              inactivePillClass
                            )}
                          >
                            SVG
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyImage}
                            className={clsx(
                              'col-span-1 py-2 px-2 rounded-xl text-xs font-bold border text-center cursor-pointer',
                              inactivePillClass
                            )}
                          >
                            {copied ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* EXPANDED FULL-SIZE MOBILE MODE */
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            'w-2 h-2 rounded-full',
                            scannability.isRisky ? 'bg-rose-500' : 'bg-emerald-500'
                          )}
                        />
                        <span className={clsx('text-xs font-bold uppercase tracking-wider', scannability.color)}>
                          {scannability.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMobileZoomed(false)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white cursor-pointer"
                      >
                        Minimize ⤡
                      </button>
                    </div>

                    <div
                      {...cardQrDragProps}
                      // While the QR or text can be dragged, a tap moves it; "Minimize" above still closes the view.
                      onClick={canDragCardQr || canDragCardText || canDragCardPanel ? undefined : () => setMobileZoomed(false)}
                      className={clsx(
                        'rounded-2xl p-2 flex items-center justify-center border overflow-hidden cursor-pointer [&>svg]:w-full [&>svg]:h-full',
                        activeCard ? (activeCard.w > activeCard.h ? 'w-full max-w-[340px]' : 'w-64') : 'w-56 h-56',
                        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
                      )}
                      style={{
                        ...(activeCard ? { aspectRatio: `${activeCard.w + 16} / ${activeCard.h + 16}` } : {}),
                        ...(canDragCardQr ? { touchAction: 'none' as const, cursor: 'move' } : {}),
                      }}
                      dangerouslySetInnerHTML={{ __html: svgMobile }}
                    />
                    {canDragCardQr && <p className={clsx('text-[11px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>Drag on the card to move the QR</p>}

                    <div className="w-full flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1">
                      <div className="flex items-center gap-1.5 shrink-0">
                        {COLOR_THEMES.map((t) => (
                          <button
                            key={t.name}
                            type="button"
                            title={t.name}
                            onClick={() => {
                              setSelectedArtId('none');
                              setArtworkUrl(null);
                              setArtCutoutUrl(null);
                              setFgColor(t.fg);
                              setGradientColor2(t.g2);
                              setGradientType('linear');
                              setBgColor(t.bg);
                              setBgColor2(t.bg2);
                              setBgGradientType(t.bgGrad);
                              setFrameColor(t.fg === '#ffffff' ? t.bg : t.fg);
                              setTransparentBg(false);
                            }}
                            className={`w-5 h-5 rounded-full bg-gradient-to-br ${t.from} ${t.to} border border-white/40 shadow-sm cursor-pointer active:scale-90 transition-transform`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {[
                          { id: 'classic', label: 'Classic' },
                          { id: 'upi', label: 'UPI' },
                          { id: 'cafe', label: 'Cafe' },
                          { id: 'cyber', label: '⚡ Neon' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => applyQuickPreset(p.id as 'classic' | 'upi' | 'cafe' | 'cyber')}
                            className={clsx(
                              'px-2 py-1 rounded-lg border text-[10px] font-semibold cursor-pointer whitespace-nowrap',
                              inactivePillClass
                            )}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadPng}
                        disabled={exporting === 'png'}
                        aria-busy={exporting === 'png'}
                        className={clsx(
                          'col-span-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold cursor-pointer shadow-sm',
                          isDark ? 'bg-white text-zinc-950' : 'bg-indigo-600 text-white'
                        )}
                      >
                        {exporting === 'png' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {exporting === 'png' ? 'Preparing PNG…' : 'Download PNG'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadSvg}
                        className={clsx('col-span-1 py-2.5 px-2 rounded-xl text-xs font-bold border cursor-pointer', inactivePillClass)}
                      >
                        SVG
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyImage}
                        className={clsx('col-span-1 py-2.5 px-2 rounded-xl text-xs font-bold border cursor-pointer', inactivePillClass)}
                      >
                        {copied ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 1: Category + Type + Input Form */}
            <div className={clsx('p-3.5 sm:p-5 rounded-2xl border space-y-3.5', cardClass)}>
              <div
                className={clsx(
                  'grid grid-cols-5 gap-1 p-1 rounded-xl border',
                  isDark ? 'bg-zinc-950/90 border-zinc-800/80' : 'bg-slate-100 border-slate-200/80'
                )}
              >
                {[
                  { id: 'links', label: 'Links', full: 'Links & Basic' },
                  { id: 'payments', label: 'Pay/UPI', full: 'Global & UPI Pay' },
                  { id: 'social', label: 'Social', full: 'Social & Contact' },
                  { id: 'business', label: 'Business', full: 'Business & Menu' },
                  { id: 'access', label: 'WiFi', full: 'WiFi & Access' },
                ].map((cat) => {
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id as CategoryId);
                        const first = QR_TYPES.find((t) => t.category === cat.id);
                        if (first) setQrType(first.id);
                      }}
                      className={clsx(
                        'py-2 px-1 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-colors cursor-pointer text-center truncate',
                        active
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                          : isDark
                          ? 'text-zinc-400 hover:text-zinc-200'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      <span className="sm:hidden lg:inline xl:hidden">{cat.label}</span>
                      <span className="hidden sm:inline lg:hidden xl:inline">{cat.full}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QR_TYPES.filter((t) => t.category === activeCategory).map((item) => {
                  const Icon = item.icon;
                  const active = qrType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setQrType(item.id)}
                      className={clsx(
                        'flex items-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer text-left',
                        active ? activePillClass : inactivePillClass
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className={clsx('p-3.5 sm:p-4 rounded-xl border space-y-2.5', subCardClass)}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Enter {QR_TYPES.find((t) => t.id === qrType)?.label} Details
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400">● 60fps Instant Sync</span>
                </div>
                <QuickFill qrType={qrType} isDark={isDark} onApply={applyDetected} />

                {qrType === 'upi' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>UPI ID / VPA</label>
                      <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="merchant@okaxis" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Payee / Shop Name</label>
                      <input type="text" value={upiName} onChange={(e) => setUpiName(e.target.value)} placeholder="My Store" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Amount ₹ (Optional)</label>
                      <input type="number" value={upiAmount} onChange={(e) => setUpiAmount(e.target.value)} placeholder="Any amount" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Note (Optional)</label>
                      <input type="text" value={upiNote} onChange={(e) => setUpiNote(e.target.value)} placeholder="Order Payment" className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'sepa' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Recipient Name (SEPA)</label>
                      <input type="text" value={sepaName} onChange={(e) => setSepaName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>IBAN Account</label>
                      <input type="text" value={sepaIban} onChange={(e) => setSepaIban(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>BIC / SWIFT</label>
                      <input type="text" value={sepaBic} onChange={(e) => setSepaBic(e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelClass}>Amount €</label>
                        <input type="text" value={sepaAmount} onChange={(e) => setSepaAmount(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Reference</label>
                        <input type="text" value={sepaRef} onChange={(e) => setSepaRef(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  </div>
                ) : qrType === 'paypal' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={labelClass}>PayPal.me User</label>
                      <input type="text" value={paypalUser} onChange={(e) => setPaypalUser(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Amount</label>
                      <input type="text" value={paypalAmount} onChange={(e) => setPaypalAmount(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Currency</label>
                      <select value={paypalCurrency} onChange={(e) => setPaypalCurrency(e.target.value)} className={inputClass}>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="AUD">AUD ($)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>
                  </div>
                ) : qrType === 'cashapp' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={labelClass}>Platform</label>
                      <select value={p2pPlatform} onChange={(e) => setP2pPlatform(e.target.value as 'cashapp' | 'venmo')} className={inputClass}>
                        <option value="cashapp">Cash App ($)</option>
                        <option value="venmo">Venmo (@)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Handle</label>
                      <input type="text" value={p2pHandle} onChange={(e) => setP2pHandle(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Amount $</label>
                      <input type="text" value={p2pAmount} onChange={(e) => setP2pAmount(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'revolut' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Service</label>
                      <select value={intlPlatform} onChange={(e) => setIntlPlatform(e.target.value as 'revolut' | 'wise')} className={inputClass}>
                        <option value="revolut">Revolut.me</option>
                        <option value="wise">Wise.com</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Username</label>
                      <input type="text" value={intlUser} onChange={(e) => setIntlUser(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'pix' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Pix Key</label>
                      <input type="text" value={pixKey} onChange={(e) => setPixKey(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Recipient Name</label>
                      <input type="text" value={pixName} onChange={(e) => setPixName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>City</label>
                      <input type="text" value={pixCity} onChange={(e) => setPixCity(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Amount R$</label>
                      <input type="text" value={pixAmount} onChange={(e) => setPixAmount(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'paynow' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={labelClass}>Standard</label>
                      <select value={asiaRegion} onChange={(e) => setAsiaRegion(e.target.value as 'SG_PayNow' | 'TH_PromptPay' | 'MY_DuitNow')} className={inputClass}>
                        <option value="SG_PayNow">🇸🇬 PayNow</option>
                        <option value="TH_PromptPay">🇹🇭 PromptPay</option>
                        <option value="MY_DuitNow">🇲🇾 DuitNow</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Phone / UEN / ID</label>
                      <input type="text" value={asiaId} onChange={(e) => setAsiaId(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Amount</label>
                      <input type="text" value={asiaAmount} onChange={(e) => setAsiaAmount(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'crypto' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={labelClass}>Network</label>
                      <select value={cryptoCoin} onChange={(e) => setCryptoCoin(e.target.value as 'bitcoin' | 'ethereum' | 'solana' | 'tether')} className={inputClass}>
                        <option value="bitcoin">Bitcoin (BTC)</option>
                        <option value="ethereum">Ethereum (ETH)</option>
                        <option value="tether">USDT</option>
                        <option value="solana">Solana (SOL)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Wallet Address</label>
                      <input type="text" value={cryptoAddr} onChange={(e) => setCryptoAddr(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Amount</label>
                      <input type="text" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'bank' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Account Holder</label>
                      <input type="text" value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Bank Name</label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>IBAN / Account No.</label>
                      <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>SWIFT / BIC / IFSC</label>
                      <input type="text" value={bankSwift} onChange={(e) => setBankSwift(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'wifi' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={labelClass}>WiFi Name (SSID)</label>
                      <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Password</label>
                      <input type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Security</label>
                      <select value={wifiType} onChange={(e) => setWifiType(e.target.value as 'WPA' | 'WEP' | 'nopass')} className={inputClass}>
                        <option value="WPA">WPA / WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Open</option>
                      </select>
                    </div>
                  </div>
                ) : qrType === 'vcard' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input type="text" value={vcardName} onChange={(e) => setVcardName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input type="text" value={vcardPhone} onChange={(e) => setVcardPhone(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input type="email" value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Company</label>
                      <input type="text" value={vcardOrg} onChange={(e) => setVcardOrg(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Website (Optional)</label>
                      <input type="url" value={vcardWebsite} onChange={(e) => setVcardWebsite(e.target.value)} placeholder="https://" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>City (Optional)</label>
                      <input type="text" value={vcardCity} onChange={(e) => setVcardCity(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'whatsapp' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>WhatsApp Number</label>
                      <input type="text" value={waPhone} onChange={(e) => setWaPhone(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Message</label>
                      <input type="text" value={waMessage} onChange={(e) => setWaMessage(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'email' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={labelClass}>To Email</label>
                      <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Subject</label>
                      <input type="text" value={emailSub} onChange={(e) => setEmailSub(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Message</label>
                      <input type="text" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'sms' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input type="text" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>SMS Message</label>
                      <input type="text" value={smsBody} onChange={(e) => setSmsBody(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'event' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className={labelClass}>Event Title</label>
                      <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Location</label>
                      <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Date (YYYYMMDD)</label>
                      <input type="text" value={eventStart} onChange={(e) => setEventStart(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ) : qrType === 'maps' ? (
                  <div>
                    <label className={labelClass}>Location / Address</label>
                    <input type="text" value={mapsQuery} onChange={(e) => setMapsQuery(e.target.value)} className={inputClass} />
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={QR_TYPES.find((t) => t.id === qrType)?.placeholder || 'https://qrgenerato.com'}
                      className={inputClass}
                    />
                    {qrType === 'url' && (
                      <DynamicQrPanel isDark={isDark} destination={inputValue} onEncodeUrl={setDynamicUrl} defaultEnabled={autoDynamic} />
                    )}
                    {FILE_TYPE_KIND[qrType] && (
                      <FileUploadPanel kind={FILE_TYPE_KIND[qrType]!} isDark={isDark} value={uploadedFile} onChange={setUploadedFile} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: Design tabs — icon-over-label tiles (4 + 3 on mobile, 7 in a row on desktop), never truncated */}
            <div className={clsx('p-3 sm:p-5 rounded-2xl border space-y-4', cardClass)}>
              <div
                role="tablist"
                aria-label="Design options"
                className={clsx(
                  'grid grid-cols-4 md:grid-cols-7 gap-1 p-1 rounded-xl border',
                  isDark ? 'bg-zinc-950/90 border-zinc-800/80' : 'bg-slate-100 border-slate-200/80'
                )}
              >
                {[
                  { id: 'templates', label: 'Templates', icon: LayoutGrid },
                  { id: 'style', label: 'Style', icon: Palette },
                  { id: 'logo', label: 'Logos', icon: ImageIcon },
                  { id: 'frames', label: 'Frames', icon: Frame },
                  { id: 'artwork', label: 'QR Art', icon: Sparkles },
                  { id: 'cards', label: 'Cards', icon: CreditCard },
                  { id: 'animate', label: 'Motion', icon: Play },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = designTab === tab.id;
                  const badge =
                    (tab.id === 'animate' && isAnimated) || (tab.id === 'cards' && cardId !== 'none');
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setDesignTab(tab.id as DesignTab)}
                      className={clsx(
                        'relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-bold leading-none transition-colors cursor-pointer min-h-[52px]',
                        active
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                          : isDark
                          ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">{tab.label}</span>
                      {badge && !active && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-400" aria-label="active" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TAB: UNIFIED QR ART STUDIO */}
              {designTab === 'artwork' && (
                <div className="space-y-3">
                  {/* Top Bar: Upload + Clear + Toggle Fine-Tune Sliders */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input ref={fileInputArtRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'art')} className="hidden" />
                      <button
                        type="button"
                        onClick={() => fileInputArtRef.current?.click()}
                        className={clsx('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer', secondaryActionBtnClass)}
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Photo / Art
                      </button>
                      {artworkUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedArtId('none');
                            setArtworkUrl(null);
                            setArtCutoutUrl(null);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer"
                        >
                          Clear Art
                        </button>
                      )}
                    </div>

                    {artworkUrl && (
                      <button
                        type="button"
                        onClick={() => setShowArtAdvanced(!showArtAdvanced)}
                        className={clsx(
                          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer',
                          showArtAdvanced ? activePillClass : inactivePillClass
                        )}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        {showArtAdvanced ? 'Hide Sliders' : 'Customize Art'}
                      </button>
                    )}
                  </div>

                  {/* Compact, Clean Mode Bar */}
                  {artworkUrl && (
                    <div className={clsx('p-3 rounded-xl border space-y-3', subCardClass)}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 w-full sm:w-auto">
                          {[
                            { id: 'qr-fill', label: '1. Art Inside QR' },
                            { id: 'neon-cutout', label: '⚡ 2. Neon Cutout' },
                            { id: 'back-halo', label: '3. Back (Halo)' },
                            { id: 'back-pure', label: '4. Back (Pure)' },
                            { id: 'medallion', label: '5. Center Badge' },
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setArtPlacement(m.id as ArtPlacement)}
                              className={clsx(
                                'px-2.5 py-2 sm:py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer text-center transition-colors',
                                artPlacement === m.id ? activePillClass : inactivePillClass
                              )}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                          <span className="text-[11px] font-medium opacity-80">Opacity:</span>
                          <input
                            type="range"
                            min="0.35"
                            max="1"
                            step="0.05"
                            value={artworkOpacity}
                            onChange={(e) => setArtworkOpacity(parseFloat(e.target.value))}
                            className="w-32 sm:w-24 accent-indigo-600 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Expandable Fine-Tune Drawer */}
                      {showArtAdvanced && (
                        <div className="pt-2.5 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span>Art Scale</span>
                              <span className="text-indigo-400">{Math.round(artScale * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.55"
                              max="1.2"
                              step="0.03"
                              value={artScale}
                              onChange={(e) => setArtScale(parseFloat(e.target.value))}
                              className="w-full accent-indigo-600 cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span>Scan-Dot Weave</span>
                              <span className="text-emerald-400">{Math.round(artScanDots * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="0.9"
                              step="0.05"
                              value={artScanDots}
                              onChange={(e) => setArtScanDots(parseFloat(e.target.value))}
                              className="w-full accent-emerald-500 cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <label className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer">
                              <span>Color 1:</span>
                              <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
                            </label>
                            <label className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer">
                              <span>Color 2:</span>
                              <input type="color" value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Full-Bleed Illustrated Poster Cards Grid */}
                  <div className={clsx('grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2', !showAll['art'] && 'max-sm:[&>*:nth-child(n+11)]:hidden')}>
                    {ART_PRESETS.length > 9 && (
                      <button
                        data-more
                        type="button"
                        onClick={() => toggleMore('art')}
                        className={clsx('col-span-full order-last sm:hidden py-2 rounded-xl border text-xs font-bold cursor-pointer', inactivePillClass)}
                      >
                        {showAll['art'] ? 'Show less' : `Show all ${ART_PRESETS.length}`}
                      </button>
                    )}
                    {ART_PRESETS.map((art) => {
                      const active = selectedArtId === art.id;
                      return (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => applyArtPreset(art)}
                          className={clsx(
                            'group p-1.5 rounded-xl border text-left transition-colors cursor-pointer',
                            active ? activePillClass : inactivePillClass
                          )}
                        >
                          <img
                            src={art.posterSvg}
                            alt={art.name}
                            loading="lazy"
                            className="w-full h-16 sm:h-14 object-cover rounded-lg mb-1"
                          />
                          <p className="text-[11px] sm:text-[10px] font-semibold text-center truncate">{art.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: ANIMATION STUDIO — QR module effects + whole-design card motion + GIF/MP4 export */}
              {designTab === 'animate' && (
                <div className="space-y-3">
                  {/* Card motion: ambient overlays over the whole card */}
                  <div className={clsx('p-3 rounded-xl border space-y-2.5', subCardClass)}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-fuchsia-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Card Motion ({CARD_MOTIONS.length})
                      </span>
                      {cardMotionId !== 'none' && (
                        <button
                          type="button"
                          onClick={() => setCardMotionId('none')}
                          className={clsx('flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer', secondaryActionBtnClass)}
                        >
                          <RotateCcw className="w-3 h-3" /> Turn Off
                        </button>
                      )}
                    </div>
                    {!activeCard ? (
                      <div className="flex items-center justify-between gap-2">
                        <p className={clsx('text-[10.5px] leading-relaxed', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                          Petals, light sweeps, snow, film grain and more move over the whole card. Pick a card first.
                        </p>
                        <button
                          type="button"
                          onClick={() => setDesignTab('cards')}
                          className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 text-white cursor-pointer"
                        >
                          Choose a card
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className={clsx('text-[10.5px] leading-relaxed', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                          Moves over the whole card but never over the QR, so it keeps scanning. You can combine it with a QR effect below.
                        </p>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Card motion groups">
                          {CARD_MOTION_GROUPS.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              role="tab"
                              aria-selected={cardMotionGroup === g.id}
                              onClick={() => setCardMotionGroup(g.id)}
                              className={clsx(
                                'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer',
                                cardMotionGroup === g.id ? activePillClass : inactivePillClass
                              )}
                            >
                              {g.label}
                              {CARD_MOTION_MAP[cardMotionId]?.group === g.id && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" aria-label="contains selected motion" />}
                            </button>
                          ))}
                        </div>
                        <div className="anim-thumbs grid grid-cols-5 gap-2">
                          {CARD_MOTIONS.filter((m) => m.group === cardMotionGroup).map((m) => {
                            const active = cardMotionId === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setCardMotionId(active ? 'none' : m.id)}
                                aria-pressed={active}
                                title={m.desc}
                                className={clsx(
                                  'p-1.5 rounded-xl border transition-colors cursor-pointer flex flex-col items-center gap-1',
                                  active ? activePillClass : inactivePillClass
                                )}
                              >
                                <div className="w-full aspect-[3/4] rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: thumb('cm', m.id) }} />
                                <span className="w-full text-[10px] font-bold leading-tight text-center line-clamp-2 min-h-[2.2em]">{m.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Animated QR Effects ({ANIMATED_EFFECTS.length})
                    </span>
                    {isAnimated && (
                      <button
                        type="button"
                        onClick={() => setAnimEffectId('none')}
                        className={clsx('flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer', secondaryActionBtnClass)}
                      >
                        <RotateCcw className="w-3 h-3" /> Turn Off
                      </button>
                    )}
                  </div>

                  <p className={clsx('text-[10.5px] leading-relaxed', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                    Animate the code’s modules. Works with any template, colour, logo or card.
                  </p>

                  {artworkUrl && artPlacement === 'qr-fill' && (() => {
                    const e = ANIMATED_EFFECT_MAP[animEffectId];
                    return Boolean(e && (e.flow || e.pattern || e.module?.anim === 'cycle'));
                  })() && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500">
                      <p className="text-[11px] font-semibold leading-snug">
                        QR Art is painting over the modules, so this colour effect is hidden.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArtId('none');
                          setArtworkUrl(null);
                          setArtCutoutUrl(null);
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-black cursor-pointer"
                      >
                        Remove art
                      </button>
                    </div>
                  )}
                  {/* Effect groups */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Effect groups">
                    {FX_GROUPS.map((g) => {
                      const active = fxGroup === g.id;
                      const hasSelected =
                        g.id === 'popular'
                          ? POPULAR_FX.some((p) => p.id === animEffectId)
                          : ANIMATED_EFFECT_MAP[animEffectId]?.group === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setFxGroup(g.id)}
                          className={clsx(
                            'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer',
                            active ? activePillClass : inactivePillClass
                          )}
                        >
                          {g.label}
                          {hasSelected && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" aria-label="contains selected effect" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="anim-thumbs grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {(fxGroup === 'popular'
                      ? POPULAR_FX.map((p) => ({ ...ANIMATED_EFFECT_MAP[p.id], name: p.label }))
                      : ANIMATED_EFFECTS.filter((e) => e.group === fxGroup)
                    ).map((e) => {
                      const active = animEffectId === e.id;
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setAnimEffectId(e.id)}
                          aria-pressed={active}
                          title={e.name}
                          className={clsx(
                            'p-1.5 rounded-xl border transition-colors cursor-pointer flex flex-col items-center gap-1',
                            active ? activePillClass : inactivePillClass
                          )}
                        >
                          <div
                            className="w-full aspect-square rounded-lg overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: thumb('fx', e.id) }}
                          />
                          <span className="w-full text-[10px] font-bold leading-tight text-center line-clamp-2 min-h-[2.2em]">{e.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Speed + tips */}
                  <div className={clsx('p-3 rounded-xl border space-y-2', subCardClass)}>
                    <div className="flex items-center justify-between">
                      <label htmlFor="fx-speed" className="text-[11px] font-bold">
                        Animation Speed
                      </label>
                      <span className="text-[11px] font-mono text-indigo-400">{animSpeed.toFixed(2)}×</span>
                    </div>
                    <input
                      id="fx-speed"
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.25}
                      value={animSpeed}
                      onChange={(e) => setAnimSpeed(Number(e.target.value))}
                      disabled={!isAnimated}
                      className="w-full accent-indigo-500 disabled:opacity-40"
                    />
                  </div>

                  {/* Animated export */}
                  <div className={clsx('p-3 rounded-xl border space-y-2.5', subCardClass)}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold">Export Animation</p>
                      <span className={clsx('text-[10px] font-mono', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                        loop {loopSeconds.toFixed(1)}s
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { id: 'gif', label: 'GIF', hint: 'Loops forever · WhatsApp, web' },
                          { id: 'mp4', label: 'MP4 Video', hint: '1080p · Instagram, Reels, ads' },
                        ] as const
                      ).map((f) => {
                        const busy = exportState?.format === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => runExport(f.id)}
                            disabled={!isAnimated || Boolean(exportState)}
                            className={clsx(
                              'relative overflow-hidden px-3 py-2.5 rounded-xl text-left border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                              f.id === 'gif'
                                ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 border-transparent text-white'
                                : secondaryActionBtnClass
                            )}
                          >
                            {busy && (
                              <span
                                className="absolute inset-y-0 left-0 bg-white/20 transition-[width]"
                                style={{ width: `${Math.round((exportState?.progress ?? 0) * 100)}%` }}
                                aria-hidden="true"
                              />
                            )}
                            <span className="relative flex items-center gap-1.5 text-xs font-bold">
                              <Download className="w-3.5 h-3.5" /> {busy ? `${Math.round((exportState?.progress ?? 0) * 100)}%` : `Download ${f.label}`}
                            </span>
                            <span className="relative block text-[9.5px] opacity-80 mt-0.5 truncate">{busy ? exportState?.label : f.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className={clsx('text-[10.5px] leading-relaxed', isDark ? 'text-zinc-400' : 'text-slate-500')} aria-live="polite">
                      {exportError ? (
                        <span className="text-rose-500 font-semibold">{exportError}</span>
                      ) : !isAnimated ? (
                        'Pick a card motion or QR effect to enable GIF & MP4 export.'
                      ) : (
                        <>
                          Eyes and quiet zone stay still so animated codes keep scanning. <b>SVG</b> also keeps the animation for
                          websites; PNG saves a still frame for print.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: PRINTABLE CARDS (BUSINESS, MEMBERSHIP & EVENTS) */}
              {designTab === 'cards' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className={clsx('inline-flex max-w-full overflow-x-auto no-scrollbar p-0.5 rounded-lg border', subCardClass)} role="tablist" aria-label="Card type">
                      {(
                        [
                          { id: 'retro', label: `Retro Aesthetic (${CARD_DESIGNS.filter((c) => c.kind === 'retro').length})` },
                          { id: 'girl', label: `Retro Girl (${CARD_DESIGNS.filter((c) => c.kind === 'girl').length})` },
                          { id: 'elegant', label: `Elegant (${CARD_DESIGNS.filter((c) => c.kind === 'elegant').length})` },
                          { id: 'indian', label: `Indian (${CARD_DESIGNS.filter((c) => c.kind === 'indian').length})` },
                          { id: 'vintage', label: `Vintage (${CARD_DESIGNS.filter((c) => c.kind === 'vintage').length})` },
                          { id: 'poster', label: `Art Posters (${CARD_DESIGNS.filter((c) => c.kind === 'poster').length})` },
                          { id: 'business', label: `Business (${CARD_DESIGNS.filter((c) => c.kind === 'business').length})` },
                        ] as const
                      ).map((k) => (
                        <button
                          key={k.id}
                          type="button"
                          role="tab"
                          aria-selected={cardKind === k.id}
                          onClick={() => setCardKind(k.id)}
                          className={clsx(
                            'px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer',
                            cardKind === k.id ? 'bg-indigo-600 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
                          )}
                        >
                          {k.label}
                        </button>
                      ))}
                    </div>
                    {cardId !== 'none' && (
                      <button
                        type="button"
                        onClick={() => setCardId('none')}
                        className={clsx('flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer', secondaryActionBtnClass)}
                      >
                        <RotateCcw className="w-3 h-3" /> QR Only
                      </button>
                    )}
                  </div>

                  {activeCard ? (
                    <div className={clsx('p-3 rounded-xl border space-y-2', subCardClass)}>
                      <p className="text-[11px] font-bold">Card Text — {activeCard.name}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {(
                          [
                            { label: 'Name / Heading', value: cardName, set: setCardName, ph: activeCard.defaults.name },
                            { label: 'Title', value: cardTitle, set: setCardTitle, ph: activeCard.defaults.title },
                            { label: 'Extra Line', value: cardExtra, set: setCardExtra, ph: activeCard.defaults.extra },
                          ] as const
                        ).map((fld) => (
                          <label key={fld.label} className="space-y-1">
                            <span className={clsx('block text-[10px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>{fld.label}</span>
                            <input
                              type="text"
                              value={fld.value}
                              maxLength={40}
                              onChange={(e) => fld.set(e.target.value)}
                              placeholder={fld.ph}
                              className={inputClass}
                            />
                          </label>
                        ))}
                      </div>
                      <CardTextControls
                        isDark={isDark}
                        mode={cardTextMode}
                        onMode={setCardTextMode}
                        value={cardText}
                        onChange={setCardText}
                        selected={cardTextSel}
                        onSelect={setCardTextSel}
                        subtitle={cardSubtitle}
                        onSubtitle={setCardSubtitle}
                        accent={activeCard.accent}
                        inputClass={inputClass}
                        segClass={subCardClass}
                      />
                      {activeCard.panelSlot && (
                        <CardPanelControls
                          isDark={isDark}
                          value={cardPanel}
                          onChange={setCardPanel}
                          hasDesignPanel={['girl', 'vintage', 'indian', 'elegant'].includes(activeCard.kind)}
                          accent={activeCard.accent}
                          segClass={subCardClass}
                        />
                      )}
                      {activeCard.movable && (
                        <div className="space-y-2 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={clsx('text-[10px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>QR position</span>
                            <div className={clsx('inline-flex p-0.5 rounded-lg border', subCardClass)} role="radiogroup" aria-label="QR position">
                              {(
                                [
                                  { id: 'corner', label: 'Corner' },
                                  { id: 'stack', label: 'Bottom centre' },
                                  { id: 'free', label: 'Custom' },
                                ] as const
                              ).map((l) => (
                                <button
                                  key={l.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={cardQrLayout === l.id}
                                  onClick={() => {
                                    if (l.id === 'free' && !cardQrFree) setCardQrFree(defaultFreeQr(activeCard));
                                    setCardQrLayout(l.id);
                                  }}
                                  className={clsx(
                                    'px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer',
                                    cardQrLayout === l.id ? 'bg-indigo-600 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
                                  )}
                                >
                                  {l.label}
                                </button>
                              ))}
                            </div>
                            {cardQrLayout === 'free' && (
                              <button
                                type="button"
                                onClick={() => setCardQrFree(defaultFreeQr(activeCard))}
                                className={clsx('text-[10.5px] font-semibold underline cursor-pointer', isDark ? 'text-zinc-400' : 'text-slate-500')}
                              >
                                Reset
                              </button>
                            )}
                          </div>
                          {cardQrLayout === 'free' && cardQrFree && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={clsx('text-[10px] font-semibold mr-0.5', isDark ? 'text-zinc-400' : 'text-slate-500')}>Quick spot</span>
                              {(
                                [
                                  { Icon: ArrowUpLeft, title: 'Top left', cx: 0, cy: 0 },
                                  { Icon: ArrowUpRight, title: 'Top right', cx: 1, cy: 0 },
                                  { Icon: CircleDot, title: 'Centre', cx: 0.5, cy: 0.5 },
                                  { Icon: ArrowDownLeft, title: 'Bottom left', cx: 0, cy: 1 },
                                  { Icon: ArrowDownRight, title: 'Bottom right', cx: 1, cy: 1 },
                                ] as const
                              ).map((p) => (
                                <button
                                  key={p.title}
                                  type="button"
                                  title={p.title}
                                  aria-label={`Move QR to ${p.title.toLowerCase()}`}
                                  onClick={() => setCardQrFree({ ...cardQrFree, cx: p.cx, cy: p.cy })}
                                  className={clsx('w-8 h-7 rounded-md border flex items-center justify-center cursor-pointer transition-colors', inactivePillClass)}
                                >
                                  <p.Icon className="w-3.5 h-3.5" />
                                </button>
                              ))}
                              <span className={clsx('text-[10.5px] ml-1', isDark ? 'text-zinc-500' : 'text-slate-500')}>or drag the QR on the preview</span>
                            </div>
                          )}
                          {cardQrLayout === 'free' && cardQrFree && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1.5">
                              {(
                                [
                                  { key: 'cx', label: 'Left ↔ Right', min: 0, max: 1 },
                                  { key: 'cy', label: 'Top ↕ Bottom', min: 0, max: 1 },
                                  { key: 'size', label: 'QR size', min: 0.19, max: 0.55 },
                                ] as const
                              ).map((sl) => (
                                <label key={sl.key} className="space-y-0.5">
                                  <span className={clsx('block text-[10px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>{sl.label}</span>
                                  <input
                                    type="range"
                                    min={sl.min}
                                    max={sl.max}
                                    step={0.005}
                                    value={cardQrFree[sl.key]}
                                    onChange={(e) => setCardQrFree({ ...cardQrFree, [sl.key]: Number(e.target.value) })}
                                    className="w-full accent-indigo-600 cursor-pointer"
                                  />
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className={clsx('text-[10px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>QR plate</span>
                        <div className={clsx('inline-flex p-0.5 rounded-lg border', subCardClass)} role="radiogroup" aria-label="QR plate colour">
                          {(
                            [
                              { id: 'card', label: 'Card style' },
                              { id: 'white', label: 'White' },
                              { id: 'qr-bg', label: 'Match QR background' },
                            ] as const
                          ).map((pl) => (
                            <button
                              key={pl.id}
                              type="button"
                              role="radio"
                              aria-checked={cardPlate === pl.id}
                              onClick={() => setCardPlate(pl.id)}
                              className={clsx(
                                'px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap',
                                cardPlate === pl.id ? 'bg-indigo-600 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
                              )}
                            >
                              {pl.label}
                            </button>
                          ))}
                        </div>
                        {activeCard.accent && (
                          <button
                            type="button"
                            onClick={matchCardColours}
                            className={clsx('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors', inactivePillClass)}
                            title="Colour the QR to match this card (kept dark enough to scan)"
                          >
                            <span className="w-3 h-3 rounded-full border border-black/20" style={{ background: activeCard.accent }} />
                            Match card colours
                          </button>
                        )}
                      </div>
                      <p className={clsx('text-[10.5px] leading-relaxed', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                        Your QR design, colours and animation are placed on the card. PNG downloads in high resolution (3000px) with clean rounded corners.
                      </p>
                    </div>
                  ) : null}

                  <div className={clsx('grid grid-cols-3 sm:grid-cols-4 gap-2', !showAll['cards'] && 'max-sm:[&>*:nth-child(n+11)]:hidden')}>
                    {CARD_DESIGNS.filter((c) => c.kind === cardKind).length > 9 && (
                      <button
                        data-more
                        type="button"
                        onClick={() => toggleMore('cards')}
                        className={clsx('col-span-full order-last sm:hidden py-2 rounded-xl border text-xs font-bold cursor-pointer', inactivePillClass)}
                      >
                        {showAll['cards'] ? 'Show less' : `Show all ${CARD_DESIGNS.filter((c) => c.kind === cardKind).length}`}
                      </button>
                    )}
                    {CARD_DESIGNS.filter((c) => c.kind === cardKind).map((c) => {
                      const active = cardId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectCard(c.id)}
                          aria-pressed={active}
                          title={c.desc}
                          className={clsx(
                            'p-2 rounded-xl border transition-colors cursor-pointer flex flex-col items-center gap-1.5',
                            active ? activePillClass : inactivePillClass
                          )}
                        >
                          <div
                            className={clsx(
                              'w-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto',
                              c.h > c.w ? 'h-36 sm:h-44' : 'h-20 sm:h-24'
                            )}
                            dangerouslySetInnerHTML={{ __html: thumb('card', c.id) }}
                          />
                          <div className="w-full text-center">
                            <p className="text-[11px] font-bold truncate">{c.name}</p>
                            <p className="hidden sm:block text-[9px] opacity-75 truncate">{c.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB: NORMAL, PAYMENT & BRAND TEMPLATES — category chips + compact tiles */}
              {designTab === 'templates' && (() => {
                const list = templateCat === 'all' ? BRAND_TEMPLATES : BRAND_TEMPLATES.filter((t) => templateCategory(t.id) === templateCat);
                const collapsed = templateCat === 'all' && !showAll['templates'] && list.length > 12;
                return (
                <div className="space-y-3">
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1" role="tablist" aria-label="Template categories">
                    {TEMPLATE_CATEGORIES.map((c) => {
                      const count = c.id === 'all' ? BRAND_TEMPLATES.length : BRAND_TEMPLATES.filter((t) => templateCategory(t.id) === c.id).length;
                      const active = templateCat === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setTemplateCat(c.id)}
                          className={clsx(
                            'shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer',
                            active ? activePillClass : inactivePillClass
                          )}
                        >
                          {c.label} <span className="opacity-60 font-semibold">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {(collapsed ? list.slice(0, 12) : list).map((t) => {
                      const active = activeTemplateId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => applyBrandTemplate(t)}
                          aria-pressed={active}
                          title={`${t.name} — ${t.badge}`}
                          className={clsx(
                            'group p-1.5 rounded-xl border transition-colors cursor-pointer flex flex-col items-center gap-1 min-w-0',
                            active ? activePillClass : inactivePillClass
                          )}
                        >
                          <div
                            className="w-full aspect-square rounded-lg overflow-hidden transition-transform group-hover:scale-[1.03]"
                            dangerouslySetInnerHTML={{ __html: thumb('tpl', t.id) }}
                          />
                          <span className="w-full text-[10px] font-semibold leading-tight text-center line-clamp-2 break-words">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {templateCat === 'all' && list.length > 12 && (
                    <button
                      type="button"
                      onClick={() => toggleMore('templates')}
                      className={clsx('w-full py-2 rounded-xl border text-xs font-bold cursor-pointer', inactivePillClass)}
                    >
                      {showAll['templates'] ? 'Show less' : `Show all ${list.length} templates`}
                    </button>
                  )}
                </div>
                );
              })()}

              {/* TAB: ORGANIZED SHAPES & EYES */}
              {/* TAB: STYLE — QR Style Studio (presets, shapes, fine-tune), then colours */}
              {designTab === 'style' && (
                <div className="space-y-4">
                  {/* Ready-made combinations */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-fuchsia-400" /> Ready-made Styles
                    </h3>
                    {/* 5 × 2 grid: everything visible at once, no sideways scrolling */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {STYLE_PRESETS.map((p) => {
                        const active = dotStyle === p.body && finderShape === p.ring && finderCenterShape === p.center;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => applyStylePreset(p.id)}
                            className={clsx(
                              'min-w-0 p-1 sm:p-1.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-colors',
                              active ? activePillClass : inactivePillClass
                            )}
                          >
                            {/* mini QR: eye in the corner over a patch of body dots, on a white card */}
                            <span className="relative w-full max-w-14 aspect-square rounded-lg bg-white overflow-hidden">
                              <span className="absolute right-[4%] bottom-[4%] w-[64%] h-[64%]" style={{ color: p.colors[0] }} dangerouslySetInnerHTML={{ __html: shapePreview('body', p.body) }} />
                              <span className="absolute left-0 top-0 w-[58%] h-[58%]" style={{ color: p.colors[2] }} dangerouslySetInnerHTML={{ __html: shapePreview('ring', p.ring) }} />
                            </span>
                            <span className="w-full text-[9px] sm:text-[10px] font-bold leading-tight text-center line-clamp-2 min-h-[2.2em]">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shape pickers */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-200/70 dark:border-zinc-800/80">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <h3 className="text-sm font-extrabold">Shapes</h3>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input type="checkbox" checked={customEyeColors} onChange={(e) => setCustomEyeColors(e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" />
                        Custom Eye Colors
                      </label>
                    </div>
                    <div className={clsx('grid grid-cols-3 w-full p-1 rounded-xl border', subCardClass)} role="tablist" aria-label="Shape part">
                      {(
                        [
                          { id: 'dots', label: 'Body', n: BODY_STYLES.length },
                          { id: 'ring', label: 'Eye Ring', n: EYE_RING_STYLES.length },
                          { id: 'center', label: 'Eye Centre', n: EYE_CENTER_STYLES.length },
                        ] as const
                      ).map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          role="tab"
                          aria-selected={shapeSubTab === sub.id}
                          onClick={() => setShapeSubTab(sub.id)}
                          className={clsx(
                            'px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer text-center',
                            shapeSubTab === sub.id ? 'bg-indigo-600 text-white shadow-sm' : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          )}
                        >
                          {sub.label} <span className="opacity-70">({sub.n})</span>
                        </button>
                      ))}
                    </div>

                    {(() => {
                      const kind = shapeSubTab === 'dots' ? 'body' : shapeSubTab === 'ring' ? 'ring' : 'center';
                      const list = kind === 'body' ? BODY_STYLES : kind === 'ring' ? EYE_RING_STYLES : EYE_CENTER_STYLES;
                      const current = kind === 'body' ? dotStyle : kind === 'ring' ? finderShape : finderCenterShape;
                      const set = kind === 'body' ? setDotStyle : kind === 'ring' ? setFinderShape : setFinderCenterShape;
                      return (
                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 sm:gap-1.5">
                          {list.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              aria-pressed={current === s.id}
                              title={s.label}
                              onClick={() => set(s.id)}
                              className={clsx(
                                'min-w-0 px-0.5 py-1 sm:p-1.5 rounded-lg sm:rounded-xl border flex flex-col items-center gap-0.5 sm:gap-1 cursor-pointer transition-colors',
                                current === s.id ? activePillClass : inactivePillClass
                              )}
                            >
                              <span className="w-7 h-7 sm:w-9 sm:h-9 block" dangerouslySetInnerHTML={{ __html: shapePreview(kind, s.id) }} />
                              <span className="w-full text-[9px] sm:text-[10px] font-semibold leading-tight text-center truncate">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    {customEyeColors && (
                      <div className={clsx('p-3 rounded-xl border flex flex-wrap items-center gap-4', subCardClass)}>
                        <label className="flex items-center gap-2 text-xs font-medium">
                          <span>Eye Ring:</span>
                          <input type="color" value={eyeBorderColor} onChange={(e) => setEyeBorderColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium">
                          <span>Eye Centre:</span>
                          <input type="color" value={eyeCenterColor} onChange={(e) => setEyeCenterColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Fine-tune (folded away; the summary shows the current settings) */}
                  <details className={clsx('group rounded-xl border', subCardClass)}>
                    <summary className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer list-none select-none">
                      <span className="text-xs font-extrabold">Fine-tune</span>
                      <span className={clsx('flex items-center gap-1.5 text-[10.5px] font-semibold capitalize min-w-0', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                        <span className="truncate">
                          {dotSize} dots · {eyeThickness} eyes · {cornerRadius}%{bodyOpacity < 100 ? ` · ${bodyOpacity}% opacity` : ''}
                        </span>
                        <ChevronDown className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" />
                      </span>
                    </summary>
                    <div className="px-3 pb-3 space-y-3">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                        {renderSeg('Dot size', ['tiny', 'small', 'medium', 'large'] as const, dotSize, setDotSize, { medium: 'Med' })}
                        {renderSeg('Dot spacing', ['compact', 'normal', 'wide'] as const, dotSpacing, setDotSpacing, { compact: 'Tight' })}
                        {renderSeg('Eye thickness', ['thin', 'medium', 'thick'] as const, eyeThickness, setEyeThickness, { medium: 'Med' })}
                        {renderSeg('Eye centre size', ['small', 'medium', 'large'] as const, eyeSize, setEyeSize, { small: 'S', medium: 'M', large: 'L' })}
                        <label className="space-y-1">
                          <span className={clsx('flex justify-between text-[11px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                            <span>Corner radius</span>
                            <span>{cornerRadius}%</span>
                          </span>
                          <input type="range" min={0} max={100} step={5} value={cornerRadius} onChange={(e) => setCornerRadius(Number(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
                        </label>
                        <label className="space-y-1">
                          <span className={clsx('flex justify-between text-[11px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                            <span>Dots opacity</span>
                            <span>{bodyOpacity}%</span>
                          </span>
                          <input type="range" min={50} max={100} step={5} value={bodyOpacity} onChange={(e) => setBodyOpacity(Number(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
                        </label>
                      </div>
                      <p className={clsx('text-[10.5px] leading-relaxed', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                        Corner radius shapes Rounded Square dots, rings and centres. Every style keeps the eye geometry phones look for, so decorative shapes still scan.
                      </p>
                    </div>
                  </details>
                </div>
              )}

              {/* TAB: FRAMES — 20 label frames + 50 decorative frames */}
              {designTab === 'frames' && (
                <div className="space-y-3">
                  <div className={clsx('grid grid-cols-3 sm:grid-cols-4 gap-2', !showAll['frames'] && 'max-sm:[&>*:nth-child(n+11)]:hidden')}>
                    {FRAME_STYLES.length > 9 && (
                      <button
                        data-more
                        type="button"
                        onClick={() => toggleMore('frames')}
                        className={clsx('col-span-full order-last sm:hidden py-2 rounded-xl border text-xs font-bold cursor-pointer', inactivePillClass)}
                      >
                        {showAll['frames'] ? 'Show less' : `Show all ${FRAME_STYLES.length}`}
                      </button>
                    )}
                    {FRAME_STYLES.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFrameStyle(f.id);
                          if (f.defaultText) setFrameText(f.defaultText);
                        }}
                        className={clsx(
                          'py-2.5 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer text-left truncate',
                          frameStyle === f.id ? activePillClass : inactivePillClass
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Decorative frames */}
                  <DecoFramePicker frameStyle={frameStyle} onPick={pickDecoFrame} subCardClass={subCardClass} activePillClass={activePillClass} inactivePillClass={inactivePillClass} />

                  {frameStyle !== 'none' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Frame Label</label>
                        <input type="text" value={frameText} onChange={(e) => setFrameText(e.target.value)} maxLength={32} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Frame Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent" />
                          <input type="text" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className={inputClass} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: STYLE (part 2) — colours, border & advanced */}
              {designTab === 'style' && (
                <div className="space-y-3 mt-4 pt-4 border-t border-slate-200/70 dark:border-zinc-800/80">
                  <h3 className="text-sm font-extrabold">Colors</h3>

                  {/* Dots */}
                  <div className="space-y-2">
                    {renderSeg('QR dots', ['none', 'linear', 'radial'] as const, gradientType, setGradientType, { none: 'Solid', linear: 'Gradient', radial: 'Radial' })}
                    <div className="grid grid-cols-2 gap-2">
                      {renderColor(gradientType === 'none' ? 'Dot colour' : 'Start', fgColor, setFgColor)}
                      {gradientType !== 'none' && useGrad3 && renderColor('Middle', gradientColor3, setGradientColor3)}
                      {gradientType !== 'none' && renderColor('End', gradientColor2, setGradientColor2)}
                    </div>
                    {gradientType !== 'none' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:items-end">
                        {gradientType === 'linear' && renderSeg('Direction', ['horizontal', 'vertical', 'diagonal'] as const, gradientDir, setGradientDir, { horizontal: '↔ Across', vertical: '↕ Down', diagonal: '⤡ Diagonal' })}
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer py-1">
                          <input type="checkbox" checked={useGrad3} onChange={(e) => setUseGrad3(e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" />
                          Use three colours
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Background */}
                  <div className="space-y-2 pt-3 border-t border-slate-200/70 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between gap-2">
                      <span className={clsx('text-[11px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500')}>Background</span>
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" />
                        Transparent
                      </label>
                    </div>
                    {!transparentBg && (
                      <>
                        {renderSeg('Background style', ['none', 'linear', 'radial'] as const, bgGradientType, setBgGradientType, { none: 'Solid', linear: 'Gradient', radial: 'Glow' }, true)}
                        <div className="grid grid-cols-2 gap-2">
                          {renderColor(bgGradientType === 'none' ? 'Background' : 'Colour 1', bgColor, setBgColor)}
                          {bgGradientType !== 'none' && renderColor('Colour 2', bgColor2, setBgColor2)}
                        </div>
                        {bgGradientType === 'linear' &&
                          renderSeg('Background direction', ['horizontal', 'vertical', 'diagonal'] as const, bgGradientDir, setBgGradientDir, { horizontal: '↔ Across', vertical: '↕ Down', diagonal: '⤡ Diagonal' })}
                      </>
                    )}
                  </div>

                  {/* Border & advanced (folded away) */}
                  <details className={clsx('group rounded-xl border', subCardClass)}>
                    <summary className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer list-none select-none">
                      <span className="text-xs font-extrabold">Border &amp; Advanced</span>
                      <span className={clsx('flex items-center gap-1.5 text-[10.5px] font-semibold min-w-0', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                        <span className="truncate">
                          Border {qrBorder} · EC {ecLevel} · {density}
                        </span>
                        <ChevronDown className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" />
                      </span>
                    </summary>
                    <div className="px-3 pb-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:items-end">
                        {renderSeg('Border', ['none', 'thin', 'medium', 'thick'] as const, qrBorder, setQrBorder)}
                        {qrBorder !== 'none' && renderColor('Border colour', qrBorderColor, setQrBorderColor)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {renderSeg('Error correction', ['L', 'M', 'Q', 'H'] as const, ecLevel, setEcLevel)}
                        {renderSeg('Pattern density', ['auto', 'dense', 'extra'] as const, density, setDensity)}
                      </div>
                      <p className={clsx('text-[10.5px] leading-relaxed', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                        Error correction: L 7% · M 15% · Q 25% · H 30% of the code can be covered and still scan. H is best with a logo or artwork. Higher density adds more, smaller modules.
                      </p>
                      {ecLevel !== 'H' && ecLevel !== 'Q' && (customLogoUrl || selectedPresetLogo !== 'none' || artworkUrl) && (
                        <p className="text-[11px] font-semibold text-amber-400">A logo or artwork covers part of the code — use Q or H so it still scans.</p>
                      )}
                    </div>
                  </details>
                </div>
              )}

              {/* TAB: 22 VECTOR BRAND LOGOS */}
              {designTab === 'logo' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input ref={fileInputLogoRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
                      <button
                        type="button"
                        onClick={() => fileInputLogoRef.current?.click()}
                        className={clsx('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer', secondaryActionBtnClass)}
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Custom Logo
                      </button>
                      {(customLogoUrl || selectedPresetLogo !== 'none') && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomLogoUrl(null);
                            setSelectedPresetLogo('none');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium opacity-75">Size:</span>
                      <input type="range" min="0.16" max="0.28" step="0.02" value={logoScale} onChange={(e) => setLogoScale(parseFloat(e.target.value))} className="w-24 sm:w-20 accent-indigo-600" />
                    </div>
                  </div>

                  <div className={clsx('grid grid-cols-4 sm:grid-cols-6 gap-2', !showAll['logos'] && 'max-sm:[&>*:nth-child(n+14)]:hidden')}>
                    {PRESET_LOGOS.length > 12 && (
                      <button
                        data-more
                        type="button"
                        onClick={() => toggleMore('logos')}
                        className={clsx('col-span-full order-last sm:hidden py-2 rounded-xl border text-xs font-bold cursor-pointer', inactivePillClass)}
                      >
                        {showAll['logos'] ? 'Show less' : `Show all ${PRESET_LOGOS.length}`}
                      </button>
                    )}
                    {PRESET_LOGOS.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetLogo(l.id);
                          setCustomLogoUrl(null);
                        }}
                        className={clsx(
                          'flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer',
                          selectedPresetLogo === l.id && !customLogoUrl ? activePillClass : inactivePillClass
                        )}
                      >
                        {l.svg ? (
                          <svg className="w-7 h-7" viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: l.svg }} />
                        ) : (
                          <span className="text-lg leading-none">{l.emoji}</span>
                        )}
                        <span className="text-[10px] truncate w-full text-center">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop Sticky Live Preview + Scannability Meter) */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20">
            <div className={clsx('p-5 rounded-2xl border flex flex-col items-center', cardClass)}>
              <div className="w-full flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-extrabold flex items-center justify-center text-white">
                    3
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold tracking-wide uppercase">
                      Preview Your QR Code
                    </h3>
                    <p className={clsx('text-[10px]', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                      Review scannability and download high-res vector
                    </p>
                  </div>
                </div>
                <span
                  className={clsx(
                    'px-2.5 py-1 rounded-full text-[10px] font-bold border',
                    scannability.isRisky
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  )}
                >
                  {scannability.status}
                </span>
              </div>

              {/* HERO QR STAGE WITH AMBIENT GLOW */}
              <div
                className={clsx(
                  'relative w-full flex items-center justify-center my-1 transition-[max-width] duration-300',
                  activeCard ? (activeCard.w > activeCard.h ? 'max-w-[400px]' : 'max-w-[300px]') : 'max-w-[275px] aspect-square'
                )}
                style={activeCard ? { aspectRatio: `${activeCard.w + 24} / ${activeCard.h + 24}` } : undefined}
              >
                <div
                  className="absolute inset-3 rounded-3xl blur-2xl opacity-25 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${defFgColor}, ${defGrad2})`,
                  }}
                />
                <div
                  {...cardQrDragProps}
                  data-live-preview
                  className={clsx(
                    'relative w-full h-full rounded-2xl p-2.5 flex items-center justify-center border overflow-hidden transition-colors [&>svg]:w-full [&>svg]:h-full',
                    isDark ? 'bg-zinc-950/95 border-zinc-800/90' : 'bg-slate-100 border-slate-200/90'
                  )}
                  dangerouslySetInnerHTML={{ __html: svgDesktop }}
                />

                {isAnimated && (
                  <button
                    type="button"
                    onClick={() => setDesignTab('animate')}
                    title="Change animation"
                    className="absolute -top-2 -right-2 z-10 max-w-[80%] inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-lg shadow-fuchsia-600/30 cursor-pointer"
                  >
                    <Play className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {[ANIMATED_EFFECT_MAP[animEffectId]?.name, hasCardMotion ? CARD_MOTION_MAP[cardMotionId]?.name : null].filter(Boolean).join(' + ')}
                    </span>
                  </button>
                )}

                {scannability.isRisky && (
                  <div
                    title="Low contrast or high art opacity may prevent phone cameras from scanning"
                    className="absolute -bottom-2 -left-2 w-11 h-11 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/40 border-2 border-white flex items-center justify-center animate-bounce"
                  >
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* LIVE SCANNABILITY METER BAR */}
              <div className="w-full max-w-[275px] mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={clsx('flex items-center gap-1', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                    <HelpCircle className="w-3.5 h-3.5 opacity-70" /> Scan Meter
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={scannability.color}>{scannability.status}</span>
                    {scannability.isRisky && (
                      <button
                        type="button"
                        onClick={handleAutoFixScannability}
                        className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer"
                      >
                        Auto-Fix ✓
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative h-3 w-full rounded-full overflow-hidden grid grid-cols-5 gap-0.5 p-0.5 bg-zinc-950 border border-zinc-800">
                  <div className="bg-rose-500 rounded-l-full" />
                  <div className="bg-orange-500" />
                  <div className="bg-amber-400" />
                  <div className="bg-teal-400" />
                  <div className="bg-emerald-500 rounded-r-full" />
                  <div
                    className="absolute -top-0.5 -bottom-0.5 w-1.5 rounded-full bg-white shadow-md border border-black/40 transition-all duration-200"
                    style={{ left: `calc(${scannability.score}% - 3px)` }}
                  />
                </div>
              </div>

              {/* Instant Color Themes Bar */}
              <div className="w-full mt-4 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className={clsx('flex items-center gap-1.5 text-xs font-semibold', isDark ? 'text-zinc-300' : 'text-slate-700')}>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Instant Color Themes
                  </span>
                  <button
                    type="button"
                    onClick={() => setDesignTab('templates')}
                    className="text-[11px] font-semibold text-indigo-400 hover:underline cursor-pointer"
                  >
                    See All 32 Styles →
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_THEMES.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => {
                        setSelectedArtId('none');
                        setArtworkUrl(null);
                        setArtCutoutUrl(null);
                        setFgColor(t.fg);
                        setGradientColor2(t.g2);
                        setGradientType('linear');
                        setBgColor(t.bg);
                        setBgColor2(t.bg2);
                        setBgGradientType(t.bgGrad);
                        setFrameColor(t.fg === '#ffffff' ? t.bg : t.fg);
                        setTransparentBg(false);
                      }}
                      className={clsx(
                        'flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-colors cursor-pointer',
                        isDark
                          ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-white'
                      )}
                    >
                      <div className={`w-full h-4 rounded-md bg-gradient-to-r ${t.from} ${t.to} shadow-sm`} />
                      <span className={clsx('text-[10px] font-semibold truncate w-full text-center', isDark ? 'text-zinc-300' : 'text-slate-700')}>
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={exporting === 'png'}
                  aria-busy={exporting === 'png'}
                  className={clsx(
                    'flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer',
                    isDark
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                  )}
                >
                  {exporting === 'png' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {exporting === 'png' ? 'Preparing PNG…' : 'Download PNG'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className={clsx(
                    'flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors cursor-pointer',
                    inactivePillClass
                  )}
                >
                  <Download className="w-4 h-4" /> Vector SVG
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyImage}
                className={clsx(
                  'w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold border transition-colors cursor-pointer',
                  inactivePillClass
                )}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Copied QR to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy QR Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: QR SCANNER */}
      {studioMode === 'scanner' && (
        <div className={clsx('max-w-2xl mx-auto p-6 rounded-2xl border text-center space-y-4', cardClass)}>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto">
            <Camera className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Instant Client-Side QR Scanner</h2>
          <p className={clsx('text-xs max-w-md mx-auto', isDark ? 'text-zinc-400' : 'text-slate-600')}>
            Scan any QR code using your camera or upload a screenshot. Decoded 100% locally in your browser.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!cameraActive ? (
              <button type="button" onClick={startCameraScanner} className={clsx('inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer', activePillClass)}>
                <Camera className="w-4 h-4" /> Start Camera
              </button>
            ) : (
              <button type="button" onClick={stopCameraScanner} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white cursor-pointer">
                Stop Camera
              </button>
            )}

            <input ref={fileInputScanRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'scan')} className="hidden" />
            <button type="button" onClick={() => fileInputScanRef.current?.click()} className={clsx('inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border cursor-pointer', secondaryActionBtnClass)}>
              <Upload className="w-4 h-4" /> Upload QR Image
            </button>
          </div>

          <video ref={videoRef} className={clsx('w-full max-w-md mx-auto rounded-xl border', cameraActive ? 'block' : 'hidden')} playsInline muted />

          {scanResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500">Decoded Content:</span>
                <button type="button" onClick={() => navigator.clipboard.writeText(scanResult)} className="text-xs font-semibold text-indigo-400 hover:underline cursor-pointer">
                  Copy
                </button>
              </div>
              <p className="text-sm font-mono break-all">{scanResult}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {/^https?:\/\//i.test(scanResult) && (
                  <a href={scanResult} target="_blank" rel="noopener noreferrer nofollow" className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border', secondaryActionBtnClass)}>
                    Open link
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    applyDetected(detect(scanResult));
                    setStudioMode('create');
                  }}
                  className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer', activePillClass)}
                >
                  Make a styled QR from this
                </button>
              </div>
            </div>
          )}

          {scanError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {scanError}
            </div>
          )}
        </div>
      )}

      {/* MODE 3: BATCH STUDIO */}
      {studioMode === 'batch' && (
        <div className={clsx('max-w-5xl mx-auto p-6 rounded-2xl border space-y-4', cardClass)}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Bulk QR Code Generator</h2>
              <p className={clsx('text-xs', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                One URL, UPI link, Wi-Fi string or serial code per line, up to {BATCH_LIMIT}. Paste a column from Excel or Google Sheets.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleBatchZip}
                disabled={!!batchZipProgress}
                className={clsx('inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-70', activePillClass)}
              >
                <FileArchive className="w-3.5 h-3.5" /> {batchZipProgress ? `Building ${batchZipProgress}` : 'Download ZIP (PNG + SVG)'}
              </button>
              <button type="button" onClick={handlePrintBatch} className={clsx('inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border', inactivePillClass)}>
                <Printer className="w-3.5 h-3.5" /> Print Sheet
              </button>
            </div>
          </div>
          <textarea rows={6} value={batchInput} onChange={(e) => setBatchInput(e.target.value)} className={inputClass} aria-label="QR code contents, one per line" />
          <p className={clsx('text-[11px]', isDark ? 'text-zinc-400' : 'text-slate-500')}>
            {(() => {
              const total = batchInput.split('\n').filter((l) => l.trim()).length;
              const n = Math.min(total, BATCH_LIMIT);
              return `${n} code${n === 1 ? '' : 's'} ready${total > BATCH_LIMIT ? ` (only the first ${BATCH_LIMIT} lines are used)` : ''}${n > 12 ? ' · previewing the first 12' : ''}. Tap a preview to style it in the full studio.`;
            })()}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {batchInput
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .slice(0, 12)
              .map((line, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setInputValue(line);
                    setQrType('url');
                    setStudioMode('create');
                  }}
                  className={clsx('p-3 rounded-xl border cursor-pointer hover:border-indigo-500 transition-colors space-y-2 flex flex-col items-center', subCardClass)}
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 p-1 bg-white" dangerouslySetInnerHTML={{ __html: renderMiniBatchSvg(line) }} />
                  <p className="w-full text-[11px] truncate font-mono opacity-85 text-center">{line}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}