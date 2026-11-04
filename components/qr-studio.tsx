'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import clsx from 'clsx';
import {
  QrCode,
  Camera,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Download,
  Copy,
  Check,
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
  Eye,
  Frame,
  Palette,
  Image as ImageIcon,
  Upload,
  Gift,
  ShoppingBag,
  Coffee,
  Search,
  Music,
  Briefcase,
  Printer,
  RotateCcw,
  Landmark,
  Wallet,
  DollarSign,
} from 'lucide-react';

type StudioMode = 'create' | 'scanner' | 'batch';
type CategoryId = 'links' | 'payments' | 'social' | 'business' | 'access';
type DesignTab = 'shapes' | 'frames' | 'colors' | 'logo' | 'artwork';
type ArtPlacement = 'qr-fill' | 'back-halo' | 'back-pure' | 'medallion';
type LogoShape = 'rounded' | 'circle' | 'square';

interface QRTypeOption {
  id: string;
  label: string;
  category: CategoryId;
  icon: React.ElementType;
  placeholder?: string;
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

const QR_TYPES: QRTypeOption[] = [
  // 1. Links & Basic
  { id: 'url', label: 'URL / Web', category: 'links', icon: LinkIcon, placeholder: 'https://qrgenerato.com' },
  { id: 'text', label: 'Plain Text', category: 'links', icon: Type, placeholder: 'Enter any text, note, or serial code...' },
  { id: 'pin', label: 'PIN Code', category: 'links', icon: Lock, placeholder: '482910' },
  { id: 'search', label: 'Google Search', category: 'links', icon: Search, placeholder: 'Best cafe near me' },
  { id: 'app', label: 'App Store Link', category: 'links', icon: Share2, placeholder: 'https://play.google.com/store/apps/details?id=...' },
  { id: 'coupon', label: 'Promo / Coupon', category: 'links', icon: Gift, placeholder: 'SAVE25-VIP-2026' },

  // 2. Global Payments (India, Europe, US, UK, Brazil, Asia, Crypto)
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

  // 3. Contact & Social
  { id: 'vcard', label: 'vCard Contact', category: 'social', icon: Contact },
  { id: 'whatsapp', label: 'WhatsApp Chat', category: 'social', icon: MessageCircle },
  { id: 'telegram', label: 'Telegram', category: 'social', icon: Send, placeholder: 'https://t.me/username' },
  { id: 'instagram', label: 'Instagram', category: 'social', icon: Camera, placeholder: 'https://instagram.com/username' },
  { id: 'youtube', label: 'YouTube Video', category: 'social', icon: Play, placeholder: 'https://youtube.com/@channel' },
  { id: 'twitter', label: 'X / Twitter', category: 'social', icon: Share2, placeholder: 'https://x.com/username' },
  { id: 'linkedin', label: 'LinkedIn', category: 'social', icon: Briefcase, placeholder: 'https://linkedin.com/in/username' },
  { id: 'facebook', label: 'Facebook Page', category: 'social', icon: Globe, placeholder: 'https://facebook.com/pagename' },

  // 4. Business & Media
  { id: 'menu', label: 'Cafe / Menu', category: 'business', icon: Utensils, placeholder: 'https://yourcafe.com/digital-menu.pdf' },
  { id: 'pdf', label: 'PDF Brochure', category: 'business', icon: FileText, placeholder: 'https://example.com/brochure.pdf' },
  { id: 'review', label: 'Google Review', category: 'business', icon: Star, placeholder: 'https://g.page/r/your-business-review' },
  { id: 'event', label: 'Calendar Event', category: 'business', icon: Calendar },
  { id: 'maps', label: 'Google Maps', category: 'business', icon: MapPin },
  { id: 'zoom', label: 'Video Meeting', category: 'business', icon: Video, placeholder: 'https://meet.google.com/abc-defg-hij' },
  { id: 'audio', label: 'Music / Spotify', category: 'business', icon: Music, placeholder: 'https://open.spotify.com/track/...' },
  { id: 'shop', label: 'Product / Store', category: 'business', icon: ShoppingBag, placeholder: 'https://mystore.com/featured-product' },

  // 5. Files & Access
  { id: 'wifi', label: 'WiFi Network', category: 'access', icon: Wifi },
  { id: 'email', label: 'Email Direct', category: 'access', icon: Mail },
  { id: 'sms', label: 'SMS Message', category: 'access', icon: MessageSquare },
  { id: 'phone', label: 'Phone Call', category: 'access', icon: Phone, placeholder: '+919876543210' },
  { id: 'drive', label: 'Google Drive', category: 'access', icon: Layers, placeholder: 'https://drive.google.com/file/d/...' },
  { id: 'coffee', label: 'Table Ordering', category: 'access', icon: Coffee, placeholder: 'https://order.cafe.com/table-5' },
];

const BODY_SHAPES = [
  { id: 'square', label: 'Square' },
  { id: 'dots', label: 'Dots' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'extra-round', label: 'Extra Round' },
  { id: 'classy', label: 'Classy' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'cross', label: 'Cross / Plus' },
  { id: 'v-bars', label: 'V-Bars' },
  { id: 'h-bars', label: 'H-Bars' },
];

const EYE_BORDER_SHAPES = [
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

const EYE_CENTER_SHAPES = [
  { id: 'square', label: 'Square' },
  { id: 'circle', label: 'Circle' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'star', label: 'Star' },
  { id: 'cross', label: 'Cross' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'sunburst', label: 'Sunburst' },
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

const PRESET_LOGOS = [
  { id: 'none', label: 'None', emoji: '🚫', bg: '#334155' },
  { id: 'upi', label: 'UPI ₹', emoji: '₹', bg: '#059669' },
  { id: 'globalpay', label: 'Pay $', emoji: '💳', bg: '#2563eb' },
  { id: 'euro', label: 'SEPA €', emoji: '€', bg: '#4f46e5' },
  { id: 'crypto', label: 'Crypto ₿', emoji: '₿', bg: '#d97706' },
  { id: 'whatsapp', label: 'Chat', emoji: '💬', bg: '#16a34a' },
  { id: 'wifi', label: 'WiFi', emoji: '📶', bg: '#0284c7' },
  { id: 'menu', label: 'Cafe', emoji: '☕', bg: '#b45309' },
  { id: 'food', label: 'Dining', emoji: '🍽️', bg: '#ea580c' },
  { id: 'insta', label: 'Camera', emoji: '📸', bg: '#db2777' },
  { id: 'star', label: 'Review', emoji: '⭐', bg: '#ca8a04' },
  { id: 'shop', label: 'Store', emoji: '🛍️', bg: '#7c3aed' },
];

const ART_PRESETS = [
  {
    id: 'crimson-hero',
    name: 'Crimson Hero',
    fg: '#881337',
    g2: '#be123c',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#9f1239"/>
        <circle cx="120" cy="115" r="88" fill="#be123c"/>
        <path d="M30 240 C35 175 80 155 120 155 C160 155 205 175 210 240 Z" fill="#18181b"/>
        <circle cx="120" cy="105" r="46" fill="#7c2d12"/>
        <rect x="74" y="82" width="92" height="16" rx="6" fill="#18181b"/>
        <rect x="86" y="85" width="24" height="10" rx="3" fill="#f43f5e"/>
        <rect x="130" y="85" width="24" height="10" rx="3" fill="#f43f5e"/>
        <path d="M72 80 C75 45 165 45 168 80 Z" fill="#27272a"/>
      </svg>`
    ),
  },
  {
    id: 'cyber-samurai',
    name: 'Cyber Samurai',
    fg: '#1e1b4b',
    g2: '#7e22ce',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#1e1b4b"/>
        <circle cx="120" cy="120" r="85" fill="#4c1d95" stroke="#ec4899" stroke-width="5"/>
        <path d="M35 240 C45 178 85 160 120 160 C155 160 195 178 205 240 Z" fill="#09090b"/>
        <polygon points="120,42 172,95 152,155 88,155 68,95" fill="#18181b" stroke="#38bdf8" stroke-width="3"/>
        <rect x="82" y="96" width="76" height="16" rx="8" fill="#06b6d4"/>
        <path d="M95 132 H145 L135 146 H105 Z" fill="#ec4899"/>
      </svg>`
    ),
  },
  {
    id: 'lucky-neko',
    name: 'Lucky Neko Cat',
    fg: '#9a3412',
    g2: '#dc2626',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#fef3c7"/>
        <circle cx="120" cy="120" r="92" fill="#f59e0b"/>
        <polygon points="68,95 58,42 105,68" fill="#ffffff" stroke="#dc2626" stroke-width="5"/>
        <polygon points="172,95 182,42 135,68" fill="#ffffff" stroke="#dc2626" stroke-width="5"/>
        <circle cx="120" cy="125" r="58" fill="#ffffff"/>
        <circle cx="96" cy="115" r="7" fill="#18181b"/>
        <circle cx="144" cy="115" r="7" fill="#18181b"/>
        <ellipse cx="120" cy="130" rx="8" ry="6" fill="#ef4444"/>
        <rect x="78" y="168" width="84" height="18" rx="9" fill="#dc2626"/>
        <circle cx="120" cy="177" r="11" fill="#facc15" stroke="#78350f" stroke-width="2"/>
      </svg>`
    ),
  },
  {
    id: 'royal-tiger',
    name: 'Royal Tiger',
    fg: '#7c2d12',
    g2: '#b45309',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#7c2d12"/>
        <circle cx="120" cy="120" r="90" fill="#ea580c"/>
        <circle cx="72" cy="68" r="22" fill="#9a3412"/>
        <circle cx="168" cy="68" r="22" fill="#9a3412"/>
        <polygon points="120,48 185,105 162,188 78,188 55,105" fill="#fb923c" stroke="#18181b" stroke-width="5"/>
        <path d="M75 88 L102 102 M165 88 L138 102 M120 55 V85" stroke="#18181b" stroke-width="7" stroke-linecap="round"/>
        <circle cx="94" cy="118" r="8" fill="#fef08a"/>
        <circle cx="146" cy="118" r="8" fill="#fef08a"/>
        <polygon points="120,148 104,132 136,132" fill="#18181b"/>
      </svg>`
    ),
  },
  {
    id: 'gamer-pad',
    name: 'Neon Gamepad',
    fg: '#312e81',
    g2: '#db2777',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#1e1b4b"/>
        <circle cx="120" cy="120" r="88" fill="#312e81" stroke="#8b5cf6" stroke-width="4"/>
        <rect x="46" y="82" width="148" height="82" rx="40" fill="#4f46e5" stroke="#ffffff" stroke-width="5"/>
        <path d="M84 108 V138 M69 123 H99" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
        <circle cx="158" cy="112" r="8" fill="#f43f5e"/>
        <circle cx="174" cy="128" r="8" fill="#38bdf8"/>
        <circle cx="142" cy="128" r="8" fill="#facc15"/>
        <circle cx="158" cy="144" r="8" fill="#4ade80"/>
      </svg>`
    ),
  },
  {
    id: 'coffee-barista',
    name: 'Cafe Espresso',
    fg: '#451a03',
    g2: '#9a3412',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#fef3c7"/>
        <circle cx="120" cy="120" r="90" fill="#d97706"/>
        <path d="M70 105 H158 V152 C158 178 138 192 114 192 C90 192 70 178 70 152 Z" fill="#ffffff" stroke="#451a03" stroke-width="6"/>
        <path d="M158 116 H174 C185 116 185 146 174 146 H158" fill="none" stroke="#ffffff" stroke-width="8"/>
        <path d="M96 66 Q104 82 96 94 M120 58 Q128 76 120 92 M142 66 Q150 82 142 94" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      </svg>`
    ),
  },
  {
    id: 'pizza-chef',
    name: 'Gourmet Pizza',
    fg: '#7f1d1d',
    g2: '#b45309',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#fef08a"/>
        <circle cx="120" cy="120" r="92" fill="#dc2626"/>
        <polygon points="120,42 192,182 48,182" fill="#facc15" stroke="#78350f" stroke-width="6"/>
        <path d="M48 182 Q120 202 192 182" fill="none" stroke="#d97706" stroke-width="16" stroke-linecap="round"/>
        <circle cx="120" cy="108" r="12" fill="#b91c1c"/>
        <circle cx="98" cy="146" r="12" fill="#b91c1c"/>
        <circle cx="144" cy="150" r="12" fill="#b91c1c"/>
      </svg>`
    ),
  },
  {
    id: 'astro-space',
    name: 'Space Astronaut',
    fg: '#0f172a',
    g2: '#1d4ed8',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#090d16"/>
        <circle cx="48" cy="52" r="4" fill="#ffffff"/>
        <circle cx="195" cy="68" r="5" fill="#facc15"/>
        <circle cx="120" cy="122" r="72" fill="#f8fafc" stroke="#94a3b8" stroke-width="6"/>
        <rect x="70" y="88" width="100" height="64" rx="30" fill="#1e3a8a" stroke="#38bdf8" stroke-width="4"/>
        <path d="M86 104 Q115 94 142 106" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none"/>
      </svg>`
    ),
  },
  {
    id: 'dj-panda',
    name: 'DJ Music Panda',
    fg: '#18181b',
    g2: '#4f46e5',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#4f46e5"/>
        <path d="M48 125 A72 72 0 0 1 192 125" fill="none" stroke="#ec4899" stroke-width="12"/>
        <circle cx="68" cy="72" r="22" fill="#18181b"/>
        <circle cx="172" cy="72" r="22" fill="#18181b"/>
        <circle cx="120" cy="128" r="64" fill="#ffffff"/>
        <ellipse cx="94" cy="118" rx="16" ry="20" fill="#18181b"/>
        <ellipse cx="146" cy="118" rx="16" ry="20" fill="#18181b"/>
        <circle cx="96" cy="115" r="5" fill="#ffffff"/>
        <circle cx="144" cy="115" r="5" fill="#ffffff"/>
        <ellipse cx="120" cy="144" rx="10" ry="7" fill="#18181b"/>
        <rect x="34" y="105" width="22" height="44" rx="10" fill="#ec4899"/>
        <rect x="184" y="105" width="22" height="44" rx="10" fill="#ec4899"/>
      </svg>`
    ),
  },
  {
    id: 'bharat-mandala',
    name: 'Bharat Mandala',
    fg: '#7c2d12',
    g2: '#be185d',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#fffbeb"/>
        <circle cx="120" cy="120" r="96" fill="#f59e0b" stroke="#b45309" stroke-width="6"/>
        <circle cx="120" cy="120" r="72" fill="#be185d" stroke="#fef08a" stroke-width="4" stroke-dasharray="10 6"/>
        <circle cx="120" cy="120" r="46" fill="#059669" stroke="#ffffff" stroke-width="4"/>
        <circle cx="120" cy="120" r="20" fill="#fef08a"/>
      </svg>`
    ),
  },
  {
    id: 'sakura-fuji',
    name: 'Sakura Mt. Fuji',
    fg: '#831843',
    g2: '#1e3a8a',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#fce7f3"/>
        <circle cx="120" cy="96" r="56" fill="#f43f5e"/>
        <polygon points="20,210 95,95 145,95 220,210" fill="#1e3a8a"/>
        <polygon points="95,95 145,95 162,130 135,120 120,134 105,120 78,130" fill="#ffffff"/>
        <circle cx="55" cy="55" r="14" fill="#f472b6"/>
        <circle cx="185" cy="65" r="18" fill="#f472b6"/>
      </svg>`
    ),
  },
  {
    id: 'retro-car',
    name: 'Synthwave Car',
    fg: '#311042',
    g2: '#0284c7',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#1e1b4b"/>
        <circle cx="120" cy="105" r="64" fill="#f43f5e"/>
        <rect x="0" y="150" width="240" height="90" fill="#0f172a"/>
        <path d="M42 165 L75 125 H165 L198 165 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="4"/>
        <rect x="34" y="158" width="172" height="28" rx="10" fill="#ec4899"/>
        <circle cx="62" cy="172" r="9" fill="#fef08a"/>
        <circle cx="178" cy="172" r="9" fill="#fef08a"/>
      </svg>`
    ),
  },
  {
    id: 'boba-tea',
    name: 'Boba Milk Tea',
    fg: '#581c87',
    g2: '#db2777',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#fdf2f8"/>
        <circle cx="120" cy="125" r="88" fill="#f472b6"/>
        <rect x="112" y="34" width="16" height="65" fill="#7c3aed"/>
        <polygon points="72,88 168,88 154,196 86,196" fill="#fef3c7" stroke="#581c87" stroke-width="6"/>
        <path d="M66 88 H174" stroke="#581c87" stroke-width="10" stroke-linecap="round"/>
        <circle cx="100" cy="176" r="8" fill="#451a03"/>
        <circle cx="120" cy="180" r="8" fill="#451a03"/>
        <circle cx="140" cy="176" r="8" fill="#451a03"/>
        <circle cx="110" cy="160" r="8" fill="#451a03"/>
        <circle cx="132" cy="160" r="8" fill="#451a03"/>
      </svg>`
    ),
  },
  {
    id: 'sneaker-pop',
    name: 'Street Sneaker',
    fg: '#1e3a8a',
    g2: '#dc2626',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#dbeafe"/>
        <circle cx="120" cy="120" r="92" fill="#2563eb"/>
        <path d="M48 162 V102 H105 L138 134 H192 C198 134 202 148 198 162 Z" fill="#dc2626" stroke="#ffffff" stroke-width="6"/>
        <rect x="44" y="160" width="156" height="18" rx="8" fill="#ffffff"/>
        <path d="M82 135 L108 150 L145 128" fill="none" stroke="#facc15" stroke-width="8" stroke-linecap="round"/>
      </svg>`
    ),
  },
  {
    id: 'golden-dragon',
    name: 'Imperial Crest',
    fg: '#7f1d1d',
    g2: '#b45309',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#7f1d1d"/>
        <circle cx="120" cy="120" r="90" fill="#991b1b" stroke="#facc15" stroke-width="6"/>
        <polygon points="120,45 142,95 195,95 152,128 168,182 120,148 72,182 88,128 45,95 98,95" fill="#facc15"/>
        <circle cx="120" cy="120" r="24" fill="#7f1d1d" stroke="#ffffff" stroke-width="4"/>
      </svg>`
    ),
  },
  {
    id: 'emerald-wave',
    name: 'Emerald Wave',
    fg: '#064e3b',
    g2: '#0284c7',
    svgData: toBase64Svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
        <rect width="240" height="240" fill="#ecfdf5"/>
        <circle cx="120" cy="120" r="94" fill="#10b981"/>
        <path d="M26 135 Q75 95 120 135 T214 135 L214 214 L26 214 Z" fill="#0284c7"/>
        <circle cx="85" cy="82" r="24" fill="#fef08a"/>
      </svg>`
    ),
  },
];

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

export default function QRStudio() {
  const [isDark, setIsDark] = useState(true);
  const [studioMode, setStudioMode] = useState<StudioMode>('create');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('links');
  const [qrType, setQrType] = useState<string>('url');
  const [designTab, setDesignTab] = useState<DesignTab>('shapes');
  const [shapeSubTab, setShapeSubTab] = useState<'dots' | 'ring' | 'center'>('dots');

  // Basic & Regional Payment Inputs
  const [inputValue, setInputValue] = useState('https://qrgenerato.com');
  const [upiId, setUpiId] = useState('merchant@upi');
  const [upiName, setUpiName] = useState('My Store');
  const [upiAmount, setUpiAmount] = useState('');
  const [upiNote, setUpiNote] = useState('Order Payment');

  // Europe SEPA (EPC QR Standard)
  const [sepaName, setSepaName] = useState('Euro Business GmbH');
  const [sepaIban, setSepaIban] = useState('DE89370400440532013000');
  const [sepaBic, setSepaBic] = useState('COBADEFFXXX');
  const [sepaAmount, setSepaAmount] = useState('49.90');
  const [sepaRef, setSepaRef] = useState('INV-2026-01');

  // Global PayPal / CashApp / Venmo / Revolut / Wise / Pix / PayNow / Bank
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
  const [vcardName, setVcardName] = useState('Sameer Kumar');
  const [vcardPhone, setVcardPhone] = useState('+919876543210');
  const [vcardEmail, setVcardEmail] = useState('contact@qrgenerato.com');
  const [vcardOrg, setVcardOrg] = useState('QR Generato PRO');
  const [vcardWebsite, setVcardWebsite] = useState('https://qrgenerato.com');
  const [vcardCity, setVcardCity] = useState('Haryana, India');
  const [waPhone, setWaPhone] = useState('919876543210');
  const [waMessage, setWaMessage] = useState('Hello! I just scanned your QR code.');
  const [emailTo, setEmailTo] = useState('support@qrgenerato.com');
  const [emailSub, setEmailSub] = useState('Business Inquiry');
  const [emailBody, setEmailBody] = useState('Hi team, I would like to connect.');
  const [smsPhone, setSmsPhone] = useState('+919876543210');
  const [smsBody, setSmsBody] = useState('Hi, I am interested in your services.');
  const [eventTitle, setEventTitle] = useState('Product Launch 2026');
  const [eventLocation, setEventLocation] = useState('Chandigarh Convention Center');
  const [eventStart, setEventStart] = useState('20261201T100000Z');
  const [mapsQuery, setMapsQuery] = useState('Sector 17, Chandigarh, India');

  // Shape, Eye, Frame, Color, Logo & Artwork States
  const [dotStyle, setDotStyle] = useState('square');
  const [finderShape, setFinderShape] = useState('square');
  const [finderCenterShape, setFinderCenterShape] = useState('square');
  const [customEyeColors, setCustomEyeColors] = useState(false);
  const [eyeBorderColor, setEyeBorderColor] = useState('#4f46e5');
  const [eyeCenterColor, setEyeCenterColor] = useState('#ec4899');
  const [frameStyle, setFrameStyle] = useState('none');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#4f46e5');
  const [fgColor, setFgColor] = useState('#000000');
  const [gradientColor2, setGradientColor2] = useState('#4f46e5');
  const [gradientType, setGradientType] = useState<'none' | 'linear' | 'radial'>('none');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [transparentBg, setTransparentBg] = useState(false);
  const [selectedPresetLogo, setSelectedPresetLogo] = useState('none');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.22);
  const [logoShape, setLogoShape] = useState<LogoShape>('rounded');
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [artPlacement, setArtPlacement] = useState<ArtPlacement>('qr-fill');
  const [artworkOpacity, setArtworkOpacity] = useState(0.88);

  // Scanner & Batch States
  const [copied, setCopied] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [batchInput, setBatchInput] = useState(
    'https://qrgenerato.com\nupi://pay?pa=shop@upi&pn=MyStore&cu=INR\nWIFI:T:WPA;S:Cafe_Guest;P:coffee123;;\nhttps://paypal.me/store/25'
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const fileInputLogoRef = useRef<HTMLInputElement>(null);
  const fileInputArtRef = useRef<HTMLInputElement>(null);
  const fileInputScanRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('qr-theme');
    const prefersDark = saved ? saved === 'dark' : true;
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

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('qr-theme', nextDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextDark);
    window.dispatchEvent(new CustomEvent('qr-theme-change', { detail: nextDark }));
  };

  useEffect(() => {
    if (studioMode !== 'scanner' && cameraActive) {
      stopCameraScanner();
    }
    return () => {
      if (scanIntervalRef.current) window.clearInterval(scanIntervalRef.current);
    };
  }, [studioMode, cameraActive]);

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
        if ('BarcodeDetector' in window) {
          // @ts-expect-error experimental
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          scanIntervalRef.current = window.setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const codes = await detector.detect(videoRef.current);
                if (codes.length > 0 && codes[0].rawValue) {
                  setScanResult(codes[0].rawValue);
                  stopCameraScanner();
                }
              } catch {
                // ignore
              }
            }
          }, 350);
        }
      }
    } catch {
      setScanError('Camera access denied or unavailable. Please use "Upload QR Screenshot" below.');
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

  const handleResetDesign = () => {
    setDotStyle('square');
    setFinderShape('square');
    setFinderCenterShape('square');
    setCustomEyeColors(false);
    setFrameStyle('none');
    setFgColor('#000000');
    setBgColor('#ffffff');
    setTransparentBg(false);
    setGradientType('none');
    setSelectedPresetLogo('none');
    setCustomLogoUrl(null);
    setArtworkUrl(null);
  };

  // 1. Compute Final Payload String
  const payloadString = useMemo(() => {
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
        return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nURL:${vcardWebsite}\nADR:;;${vcardCity};;;;\nEND:VCARD`;
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
        return inputValue.trim() || 'https://qrgenerato.com';
    }
  }, [
    qrType, inputValue, upiId, upiName, upiAmount, upiNote,
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

  // 2. Cached QR Matrix
  const qrMatrix = useMemo(() => {
    try {
      const qr = QRCode.create(payloadString || 'https://qrgenerato.com', {
        errorCorrectionLevel: 'H',
      });
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
  }, [payloadString]);

  // 3. Complete Vector SVG Renderer with Scoped Unique IDs (Fixes Mobile + Desktop Duplicate ID Collision!)
  const getSvgMarkup = useCallback(
    (uid: string) => {
      const count = qrMatrix.length;
      const cellSize = 10;
      const margin = 36;
      const qrSize = count * cellSize;

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
      ].includes(frameStyle);

      const needsBottomSpace = frameStyle !== 'none' && frameStyle !== 'top-tag';
      const topSpace = needsTopSpace ? 56 : 0;
      const bottomSpace = needsBottomSpace ? 72 : 0;

      const totalW = qrSize + margin * 2;
      const totalH = qrSize + margin * 2 + topSpace + bottomSpace;
      const offsetX = margin;
      const offsetY = margin + topSpace;

      const linId = `qrLin_${uid}`;
      const radId = `qrRad_${uid}`;
      const boundsId = `qrBounds_${uid}`;
      const artPatId = `qrArtPat_${uid}`;
      const badgeId = `qrBadge_${uid}`;

      const hasCenterBadge =
        customLogoUrl !== null ||
        selectedPresetLogo !== 'none' ||
        (artworkUrl !== null && artPlacement === 'medallion');

      const centerRadiusCells = hasCenterBadge ? Math.floor(count * (logoScale / 2 + 0.04)) : 0;
      const mid = (count - 1) / 2;

      const isFinderZone = (r: number, c: number) =>
        (r < 7 && c < 7) || (r < 7 && c >= count - 7) || (r >= count - 7 && c < 7);

      const isCenterCutout = (r: number, c: number) => {
        if (!hasCenterBadge) return false;
        return Math.abs(r - mid) <= centerRadiusCells && Math.abs(c - mid) <= centerRadiusCells;
      };

      const safeFg = fgColor || '#000000';
      const safeGrad2 = gradientColor2 || safeFg;

      const mainFill =
        gradientType === 'linear'
          ? `url(#${linId})`
          : gradientType === 'radial'
          ? `url(#${radId})`
          : safeFg;

      let bodyPaths = '';
      let contrastHalos = '';

      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (!qrMatrix[r][c] || isFinderZone(r, c) || isCenterCutout(r, c)) continue;
          const x = offsetX + c * cellSize;
          const y = offsetY + r * cellSize;
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;

          if (artworkUrl && artPlacement === 'back-halo') {
            contrastHalos += `<rect x="${x - 0.8}" y="${y - 0.8}" width="${cellSize + 1.6}" height="${cellSize + 1.6}" rx="2.5" fill="#ffffff" fill-opacity="0.9" />`;
          }

          switch (dotStyle) {
            case 'dots':
              bodyPaths += `<circle cx="${cx}" cy="${cy}" r="${cellSize * 0.44}" />`;
              break;
            case 'rounded':
              bodyPaths += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${cellSize - 1}" height="${cellSize - 1}" rx="3" />`;
              break;
            case 'extra-round':
              bodyPaths += `<rect x="${x + 0.4}" y="${y + 0.4}" width="${cellSize - 0.8}" height="${cellSize - 0.8}" rx="4.5" />`;
              break;
            case 'classy':
              bodyPaths += `<path d="M${x},${y + 4} Q${x},${y} ${x + 4},${y} L${x + cellSize},${y} L${x + cellSize},${y + cellSize - 4} Q${x + cellSize},${y + cellSize} ${x + cellSize - 4},${y + cellSize} L${x},${y + cellSize} Z" />`;
              break;
            case 'diamond':
              bodyPaths += `<polygon points="${cx},${y} ${x + cellSize},${cy} ${cx},${y + cellSize} ${x},${cy}" />`;
              break;
            case 'star':
              bodyPaths += `<polygon points="${cx},${y} ${cx + 1.8},${cy - 1.8} ${x + cellSize},${cy} ${cx + 1.8},${cy + 1.8} ${cx},${y + cellSize} ${cx - 1.8},${cy + 1.8} ${x},${cy} ${cx - 1.8},${cy - 1.8}" />`;
              break;
            case 'heart':
              bodyPaths += `<path d="M${cx},${y + cellSize * 0.88} C${x + 1},${cy + 1} ${x},${y + 2.5} ${cx - 2.3},${y + 2} C${cx - 0.5},${y + 1.8} ${cx},${y + 3.2} ${cx},${y + 3.5} C${cx},${y + 3.2} ${cx + 0.5},${y + 1.8} ${cx + 2.3},${y + 2} C${x + cellSize},${y + 2.5} ${x + cellSize - 1},${cy + 1} ${cx},${y + cellSize * 0.88} Z" />`;
              break;
            case 'cross':
              bodyPaths += `<path d="M${x + 3},${y + 0.8} H${x + 7} V${y + 3} H${x + 9.2} V${y + 7} H${x + 7} V${y + 9.2} H${x + 3} V${y + 7} H${x + 0.8} V${y + 3} H${x + 3} Z" />`;
              break;
            case 'v-bars':
              bodyPaths += `<rect x="${x + 1.3}" y="${y}" width="${cellSize - 2.6}" height="${cellSize}" rx="3.2" />`;
              break;
            case 'h-bars':
              bodyPaths += `<rect x="${x}" y="${y + 1.3}" width="${cellSize}" height="${cellSize - 2.6}" rx="3.2" />`;
              break;
            default:
              bodyPaths += `<rect x="${x}" y="${y}" width="${cellSize + 0.25}" height="${cellSize + 0.25}" />`;
          }
        }
      }

      const renderFinderEye = (r0: number, c0: number) => {
        const x = offsetX + c0 * cellSize;
        const y = offsetY + r0 * cellSize;
        const outer = 7 * cellSize;
        const innerOffset = 2 * cellSize;
        const inner = 3 * cellSize;
        const cx = x + outer / 2;
        const cy = y + outer / 2;

        const borderFill = customEyeColors ? eyeBorderColor : mainFill;
        const centerFill = customEyeColors ? eyeCenterColor : mainFill;

        let eyeBgPlate = '';
        if (artworkUrl && (artPlacement === 'back-halo' || artPlacement === 'back-pure')) {
          eyeBgPlate = `<rect x="${x - 3}" y="${y - 3}" width="${outer + 6}" height="${outer + 6}" rx="12" fill="#ffffff" fill-opacity="0.92" />`;
        }

        const sw = cellSize;
        const half = sw / 2;
        const bx = x + half;
        const by = y + half;
        const bw = outer - sw;
        let outerSvg = '';

        switch (finderShape) {
          case 'circle':
            outerSvg = `<circle cx="${cx}" cy="${cy}" r="${bw / 2}" fill="none" stroke="${borderFill}" stroke-width="${sw}" />`;
            break;
          case 'rounded':
            outerSvg = `<rect x="${bx}" y="${by}" width="${bw}" height="${bw}" rx="16" fill="none" stroke="${borderFill}" stroke-width="${sw}" />`;
            break;
          case 'leaf-tl':
            outerSvg = `<path d="M${bx + 22},${by} H${bx + bw} V${by + bw - 22} Q${bx + bw},${by + bw} ${bx + bw - 22},${by + bw} H${bx} V${by + 22} Q${bx},${by} ${bx + 22},${by} Z" fill="none" stroke="${borderFill}" stroke-width="${sw}" />`;
            break;
          case 'leaf-tr':
            outerSvg = `<path d="M${bx},${by} H${bx + bw - 22} Q${bx + bw},${by} ${bx + bw},${by + 22} V${by + bw} H${bx + 22} Q${bx},${by + bw} ${bx},${by + bw - 22} Z" fill="none" stroke="${borderFill}" stroke-width="${sw}" />`;
            break;
          case 'leaf-bl':
            outerSvg = `<path d="M${bx},${by} H${bx + bw} V${by + bw} H${bx + 22} Q${bx},${by + bw} ${bx},${by + bw - 22} Z" fill="none" stroke="${borderFill}" stroke-width="${sw}" />`;
            break;
          case 'leaf-br':
            outerSvg = `<path d="M${bx},${by} H${bx + bw} V${by + bw - 22} Q${bx + bw},${by + bw} ${bx + bw - 22},${by + bw} H${bx} Z" fill="none" stroke="${borderFill}" stroke-width="${sw}" />`;
            break;
          case 'cut':
            outerSvg = `<polygon points="${bx + 12},${by} ${bx + bw - 12},${by} ${bx + bw},${by + 12} ${bx + bw},${by + bw - 12} ${bx + bw - 12},${by + bw} ${bx + 12},${by + bw} ${bx},${by + bw - 12} ${bx},${by + 12}" fill="none" stroke="${borderFill}" stroke-width="${sw}" />`;
            break;
          case 'dotted':
            outerSvg = `<rect x="${bx}" y="${by}" width="${bw}" height="${bw}" rx="10" fill="none" stroke="${borderFill}" stroke-width="${sw}" stroke-dasharray="${cellSize * 0.9} ${cellSize * 0.45}" />`;
            break;
          default:
            outerSvg = `<rect x="${bx}" y="${by}" width="${bw}" height="${bw}" fill="none" stroke="${borderFill}" stroke-width="${sw}" />`;
        }

        const ix = x + innerOffset;
        const iy = y + innerOffset;
        let innerSvg = '';

        switch (finderCenterShape) {
          case 'circle':
            innerSvg = `<circle cx="${cx}" cy="${cy}" r="${inner / 2}" fill="${centerFill}" />`;
            break;
          case 'rounded':
            innerSvg = `<rect x="${ix}" y="${iy}" width="${inner}" height="${inner}" rx="8" fill="${centerFill}" />`;
            break;
          case 'diamond':
            innerSvg = `<polygon points="${cx},${iy} ${ix + inner},${cy} ${cx},${iy + inner} ${ix},${cy}" fill="${centerFill}" />`;
            break;
          case 'star':
            innerSvg = `<polygon points="${cx},${iy} ${cx + 5},${cy - 5} ${ix + inner},${cy} ${cx + 5},${cy + 5} ${cx},${iy + inner} ${cx - 5},${cy + 5} ${ix},${cy} ${cx - 5},${cy - 5}" fill="${centerFill}" />`;
            break;
          case 'cross':
            innerSvg = `<path d="M${cx - 5},${iy} H${cx + 5} V${cy - 5} H${ix + inner} V${cy + 5} H${cx + 5} V${iy + inner} H${cx - 5} V${cy + 5} H${ix} V${cy - 5} H${cx - 5} Z" fill="${centerFill}" />`;
            break;
          case 'leaf':
            innerSvg = `<path d="M${ix + 12},${iy} H${ix + inner} V${iy + inner - 12} Q${ix + inner},${iy + inner} ${ix + inner - 12},${iy + inner} H${ix} V${iy + 12} Q${ix},${iy} ${ix + 12},${iy} Z" fill="${centerFill}" />`;
            break;
          case 'sunburst':
            innerSvg = `<circle cx="${cx}" cy="${cy}" r="${inner * 0.38}" fill="${centerFill}" /><circle cx="${cx}" cy="${cy}" r="${inner * 0.48}" fill="none" stroke="${centerFill}" stroke-width="3" stroke-dasharray="4 3" />`;
            break;
          default:
            innerSvg = `<rect x="${ix}" y="${iy}" width="${inner}" height="${inner}" fill="${centerFill}" />`;
        }

        return `${eyeBgPlate}${outerSvg}${innerSvg}`;
      };

      const bSize = qrSize * logoScale;
      const bx = offsetX + (qrSize - bSize) / 2;
      const by = offsetY + (qrSize - bSize) / 2;
      const badgeRadius = logoShape === 'circle' ? bSize / 2 : logoShape === 'rounded' ? bSize * 0.25 : 4;

      const artPatternDef = artworkUrl
        ? `<pattern id="${artPatId}" patternUnits="userSpaceOnUse" x="${offsetX}" y="${offsetY}" width="${qrSize}" height="${qrSize}">
            <image href="${artworkUrl}" xlink:href="${artworkUrl}" x="0" y="0" width="${qrSize}" height="${qrSize}" preserveAspectRatio="xMidYMid slice" />
          </pattern>`
        : '';

      const defs = `
        <defs>
          <linearGradient id="${linId}" x1="0" y1="0" x2="${totalW}" y2="${totalH}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${safeFg}" />
            <stop offset="100%" stop-color="${safeGrad2}" />
          </linearGradient>
          <radialGradient id="${radId}" cx="${totalW / 2}" cy="${totalH / 2}" r="${totalW * 0.6}" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${safeGrad2}" />
            <stop offset="100%" stop-color="${safeFg}" />
          </radialGradient>
          <clipPath id="${boundsId}">
            <rect x="${offsetX - 8}" y="${offsetY - 8}" width="${qrSize + 16}" height="${qrSize + 16}" rx="18" />
          </clipPath>
          <clipPath id="${badgeId}">
            <rect x="${bx}" y="${by}" width="${bSize}" height="${bSize}" rx="${badgeRadius}" />
          </clipPath>
          ${artPatternDef}
        </defs>
      `;

      let bgSvg = '';
      let frameSvg = '';
      const safeLabel = escapeXml(frameText || 'SCAN ME');
      const midX = totalW / 2;

      if (!transparentBg) {
        if (frameStyle === 'ticket-stub') {
          bgSvg = `
            <rect x="6" y="6" width="${totalW - 12}" height="${totalH - 12}" rx="24" fill="${bgColor}" stroke="${frameColor}" stroke-width="6" />
            <circle cx="6" cy="${totalH - 76}" r="16" fill="#09090b" />
            <circle cx="${totalW - 6}" cy="${totalH - 76}" r="16" fill="#09090b" />
            <line x1="26" y1="${totalH - 76}" x2="${totalW - 26}" y2="${totalH - 76}" stroke="${frameColor}" stroke-width="3" stroke-dasharray="8 6" />
          `;
        } else if (frameStyle === 'coupon-cut') {
          bgSvg = `<rect x="8" y="8" width="${totalW - 16}" height="${totalH - 16}" rx="24" fill="${bgColor}" stroke="${frameColor}" stroke-width="5" stroke-dasharray="14 8" />`;
        } else if (frameStyle === 'smartphone') {
          bgSvg = `
            <rect x="8" y="6" width="${totalW - 16}" height="${totalH - 12}" rx="42" fill="${bgColor}" stroke="${frameColor}" stroke-width="10" />
            <rect x="${midX - 45}" y="18" width="90" height="14" rx="7" fill="${frameColor}" />
            <rect x="${midX - 50}" y="${totalH - 22}" width="100" height="6" rx="3" fill="${frameColor}" opacity="0.5" />
          `;
        } else if (frameStyle === 'polaroid') {
          bgSvg = `
            <rect x="6" y="6" width="${totalW - 12}" height="${totalH - 12}" rx="16" fill="${bgColor}" stroke="#cbd5e1" stroke-width="3" />
            <rect x="22" y="22" width="${totalW - 44}" height="${qrSize + 36}" rx="8" fill="none" stroke="rgba(15,23,42,0.12)" stroke-width="2" />
          `;
        } else {
          bgSvg = `<rect x="4" y="4" width="${totalW - 8}" height="${totalH - 8}" rx="30" fill="${bgColor}" stroke="${
            frameStyle !== 'none' ? frameColor : 'rgba(148,163,184,0.28)'
          }" stroke-width="${frameStyle !== 'none' ? 7 : 2}" />`;
        }
      }

      switch (frameStyle) {
        case 'pill':
          frameSvg = `
            <rect x="${totalW * 0.16}" y="${totalH - 62}" width="${totalW * 0.68}" height="44" rx="22" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 35}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="16" letter-spacing="1.5">${safeLabel}</text>
          `;
          break;
        case 'top-tag':
          frameSvg = `
            <rect x="${totalW * 0.16}" y="18" width="${totalW * 0.68}" height="40" rx="20" fill="${frameColor}" />
            <text x="${midX}" y="43" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">${safeLabel}</text>
          `;
          break;
        case 'shopping-bag':
          frameSvg = `
            <path d="M${midX - 42},54 C${midX - 42},10 ${midX + 42},10 ${midX + 42},54" fill="none" stroke="${frameColor}" stroke-width="8" stroke-linecap="round" />
            <circle cx="${midX - 42}" cy="56" r="6" fill="${frameColor}" />
            <circle cx="${midX + 42}" cy="56" r="6" fill="${frameColor}" />
            <rect x="20" y="${totalH - 68}" width="${totalW - 40}" height="50" rx="14" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 42}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${totalH - 25}" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-family="system-ui, sans-serif" font-weight="600" font-size="10" letter-spacing="1">🛍️ OFFICIAL STORE CATALOG</text>
          `;
          break;
        case 'upi-stand':
          frameSvg = `
            <rect x="${midX - 70}" y="16" width="46" height="8" rx="4" fill="#f97316" />
            <rect x="${midX - 22}" y="16" width="44" height="8" rx="4" fill="#cbd5e1" />
            <rect x="${midX + 24}" y="16" width="46" height="8" rx="4" fill="#16a34a" />
            <text x="${midX}" y="44" text-anchor="middle" fill="${frameColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="14" letter-spacing="2">INSTANT QR PAY</text>
            <rect x="18" y="${totalH - 68}" width="${totalW - 36}" height="50" rx="16" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 42}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${totalH - 25}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui, sans-serif" font-weight="700" font-size="10" letter-spacing="1">BHIM • GPay • PhonePe • Paytm</text>
          `;
          break;
        case 'cafe-cup':
          frameSvg = `
            <g transform="translate(${midX - 22}, 14)">
              <circle cx="22" cy="22" r="22" fill="${frameColor}" />
              <path d="M13 18 H29 V26 C29 30 25 33 21 33 C17 33 13 30 13 26 Z" fill="#ffffff" />
              <path d="M29 20 H32 C33.5 20 34.5 21 34.5 22.5 C34.5 24 33.5 25 32 25 H29" fill="none" stroke="#ffffff" stroke-width="2" />
            </g>
            <rect x="18" y="${totalH - 68}" width="${totalW - 36}" height="50" rx="16" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 42}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${totalH - 25}" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-family="system-ui, sans-serif" font-weight="600" font-size="10" letter-spacing="1">☕ FRESH DIGITAL TABLE MENU</text>
          `;
          break;
        case 'chef-menu':
          frameSvg = `
            <g transform="translate(${midX - 22}, 14)">
              <circle cx="22" cy="22" r="22" fill="${frameColor}" />
              <path d="M14 28 H30 V31 H14 Z M15 26 V20 C13 19 13 15 16 14 C17 11 21 10 22 10 C23 10 27 11 28 14 C31 15 31 19 29 20 V26 Z" fill="#ffffff" />
            </g>
            <rect x="18" y="${totalH - 68}" width="${totalW - 36}" height="50" rx="16" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 42}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${totalH - 25}" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-family="system-ui, sans-serif" font-weight="600" font-size="10" letter-spacing="1">🍽️ SCAN FOR FULL RESTAURANT MENU</text>
          `;
          break;
        case 'scooter-delivery':
          frameSvg = `
            <rect x="18" y="${totalH - 68}" width="${totalW - 36}" height="50" rx="25" fill="${frameColor}" />
            <circle cx="46" cy="${totalH - 43}" r="18" fill="#ffffff" />
            <text x="46" y="${totalH - 37}" text-anchor="middle" font-size="18">🛵</text>
            <text x="${midX + 14}" y="${totalH - 42}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1">${safeLabel}</text>
            <text x="${midX + 14}" y="${totalH - 26}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="system-ui, sans-serif" font-weight="600" font-size="10" letter-spacing="1">FAST EXPRESS HOME DELIVERY</text>
          `;
          break;
        case 'gift-box':
          frameSvg = `
            <path d="M${midX},12 C${midX - 35},0 ${midX - 45},38 ${midX},34 C${midX + 45},38 ${midX + 35},0 ${midX},12 Z" fill="${frameColor}" />
            <rect x="18" y="${totalH - 68}" width="${totalW - 36}" height="50" rx="16" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 42}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.2">${safeLabel}</text>
            <text x="${midX}" y="${totalH - 25}" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-family="system-ui, sans-serif" font-weight="600" font-size="10" letter-spacing="1">🎁 SPECIAL GIFT &amp; REWARD INSIDE</text>
          `;
          break;
        case 'chat-bubble':
          frameSvg = `
            <polygon points="${midX - 24},${totalH - 68} ${midX + 24},${totalH - 68} ${midX},${totalH - 42}" fill="${frameColor}" />
            <rect x="22" y="${totalH - 68}" width="${totalW - 44}" height="46" rx="23" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 40}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.2">💬 ${safeLabel}</text>
          `;
          break;
        case 'polaroid':
          frameSvg = `
            <text x="${midX}" y="${totalH - 32}" text-anchor="middle" fill="${frameColor}" font-family="system-ui, sans-serif" font-weight="800" font-size="18" letter-spacing="2">📸 ${safeLabel}</text>
          `;
          break;
        case 'smartphone':
          frameSvg = `
            <rect x="28" y="${totalH - 68}" width="${totalW - 56}" height="38" rx="19" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 44}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="13" letter-spacing="1.2">📱 ${safeLabel}</text>
          `;
          break;
        case 'ticket-stub':
          frameSvg = `
            <text x="${midX}" y="${totalH - 42}" text-anchor="middle" fill="${frameColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="15" letter-spacing="2">🎟️ ${safeLabel}</text>
            <text x="${midX}" y="${totalH - 22}" text-anchor="middle" fill="#64748b" font-family="monospace" font-weight="700" font-size="11">VIP PASS • #2026-PRO</text>
          `;
          break;
        case 'review-stars':
          frameSvg = `
            <text x="${midX}" y="42" text-anchor="middle" font-size="22" letter-spacing="4">⭐⭐⭐⭐⭐</text>
            <rect x="20" y="${totalH - 66}" width="${totalW - 40}" height="46" rx="14" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 38}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.2">${safeLabel}</text>
          `;
          break;
        case 'wifi-card':
          frameSvg = `
            <text x="${midX}" y="42" text-anchor="middle" fill="${frameColor}" font-family="system-ui, sans-serif" font-weight="900" font-size="16" letter-spacing="2">📶 FREE GUEST WIFI</text>
            <rect x="20" y="${totalH - 66}" width="${totalW - 40}" height="46" rx="14" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 38}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">${safeLabel}</text>
          `;
          break;
        case 'coupon-cut':
          frameSvg = `
            <rect x="22" y="${totalH - 66}" width="${totalW - 44}" height="46" rx="12" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 38}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.5">✂️ ${safeLabel}</text>
          `;
          break;
        case 'neon-cyber':
          frameSvg = `
            <path d="M18,52 V18 H52 M${totalW - 52},18 H${totalW - 18} V52 M18,${totalH - 82} V${totalH - 116} M${totalW - 18},${totalH - 82} V${totalH - 116}" fill="none" stroke="${frameColor}" stroke-width="6" stroke-linecap="square" />
            <polygon points="28,${totalH - 66} ${totalW - 18},${totalH - 66} ${totalW - 28},${totalH - 20} 18,${totalH - 20}" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 38}" text-anchor="middle" fill="#ffffff" font-family="monospace" font-weight="900" font-size="15" letter-spacing="2">⚡ ${safeLabel}</text>
          `;
          break;
        case 'clipboard-pad':
          frameSvg = `
            <rect x="${midX - 50}" y="10" width="100" height="32" rx="10" fill="${frameColor}" />
            <circle cx="${midX}" cy="26" r="6" fill="#ffffff" />
            <rect x="20" y="${totalH - 66}" width="${totalW - 40}" height="46" rx="14" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 38}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="14" letter-spacing="1.2">📋 ${safeLabel}</text>
          `;
          break;
        case 'royal-ornate':
          frameSvg = `
            <rect x="12" y="12" width="${totalW - 24}" height="${totalH - 24}" rx="22" fill="none" stroke="${frameColor}" stroke-width="2" stroke-dasharray="6 4" />
            <rect x="22" y="${totalH - 66}" width="${totalW - 44}" height="46" rx="23" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 38}" text-anchor="middle" fill="#ffffff" font-family="serif" font-weight="800" font-size="15" letter-spacing="2">👑 ${safeLabel}</text>
          `;
          break;
        case 'banner':
          frameSvg = `
            <rect x="18" y="${totalH - 66}" width="${totalW - 36}" height="48" rx="14" fill="${frameColor}" />
            <text x="${midX}" y="${totalH - 37}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="15" letter-spacing="1.5">${safeLabel}</text>
          `;
          break;
      }

      let artBackLayer = '';
      let artDotsOverlay = '';

      if (artworkUrl && (artPlacement === 'back-halo' || artPlacement === 'back-pure')) {
        artBackLayer = `
          <g clip-path="url(#${boundsId})">
            <image href="${artworkUrl}" xlink:href="${artworkUrl}" x="${offsetX - 8}" y="${offsetY - 8}" width="${qrSize + 16}" height="${qrSize + 16}" opacity="${
              artPlacement === 'back-pure' ? Math.min(0.45, artworkOpacity * 0.55) : artworkOpacity
            }" preserveAspectRatio="xMidYMid slice" />
          </g>
        `;
      } else if (artworkUrl && artPlacement === 'qr-fill') {
        // Mode 1: Background stays 100% clean white, artwork paints strictly inside the QR dots!
        artDotsOverlay = `
          <g fill="url(#${artPatId})" opacity="${artworkOpacity}">${bodyPaths}</g>
        `;
      }

      let centerLogoSvg = '';
      if (artworkUrl && artPlacement === 'medallion') {
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
          centerLogoSvg = `
            <rect x="${bx - 4}" y="${by - 4}" width="${bSize + 8}" height="${bSize + 8}" rx="${badgeRadius + 2}" fill="#ffffff" />
            <rect x="${bx}" y="${by}" width="${bSize}" height="${bSize}" rx="${badgeRadius}" fill="${preset.bg}" />
            <text x="${bx + bSize / 2}" y="${by + bSize * 0.66}" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="${bSize * 0.52}">${preset.emoji}</text>
          `;
        }
      }

      const eyesSvg =
        renderFinderEye(0, 0) +
        renderFinderEye(0, count - 7) +
        renderFinderEye(count - 7, 0);

      return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%">
        ${defs}
        ${bgSvg}
        ${artBackLayer}
        ${contrastHalos}
        <g fill="${mainFill}">${bodyPaths}</g>
        ${artDotsOverlay}
        ${eyesSvg}
        ${centerLogoSvg}
        ${frameSvg}
      </svg>`;
    },
    [
      qrMatrix, dotStyle, finderShape, finderCenterShape,
      customEyeColors, eyeBorderColor, eyeCenterColor,
      frameStyle, frameText, frameColor, fgColor,
      gradientColor2, gradientType, bgColor, transparentBg,
      selectedPresetLogo, customLogoUrl, logoScale, logoShape,
      artworkUrl, artPlacement, artworkOpacity,
    ]
  );

  // Scoped SVG strings so Mobile, Desktop, Sticky Bar, and Export never collide in the DOM
  const svgMobile = useMemo(() => getSvgMarkup('mob'), [getSvgMarkup]);
  const svgDesktop = useMemo(() => getSvgMarkup('desk'), [getSvgMarkup]);
  const svgSticky = useMemo(() => getSvgMarkup('bar'), [getSvgMarkup]);
  const svgExport = useMemo(() => getSvgMarkup('exp'), [getSvgMarkup]);

  const handleDownloadPng = () => {
    const svgBlob = new Blob([svgExport], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1400;
      canvas.height = 1400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1400, 1400);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `qr-generato-${qrType}.png`;
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgExport], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-generato-${qrType}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyImage = () => {
    const svgBlob = new Blob([svgExport], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1000, 1000);
        canvas.toBlob((blob) => {
          if (blob && navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
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
        setArtworkUrl(result);
      } else if (target === 'scan') {
        setScanError(null);
        const img = new Image();
        img.onload = async () => {
          try {
            if ('BarcodeDetector' in window) {
              // @ts-expect-error experimental Web API
              const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
              const barcodes = await detector.detect(img);
              if (barcodes.length > 0) {
                setScanResult(barcodes[0].rawValue);
                return;
              }
            }
            setScanError('Could not detect a QR code in this image. Please try a clearer screenshot.');
          } catch {
            setScanError('QR detection works best in Chrome, Edge, or Brave browsers.');
          }
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const applyQuickPreset = (preset: 'classic' | 'upi' | 'cafe' | 'cyber') => {
    if (preset === 'classic') {
      handleResetDesign();
    } else if (preset === 'upi') {
      setActiveCategory('payments');
      setQrType('upi');
      setDotStyle('rounded');
      setFinderShape('rounded');
      setFinderCenterShape('circle');
      setFgColor('#059669');
      setGradientColor2('#10b981');
      setGradientType('linear');
      setFrameStyle('upi-stand');
      setFrameText('SCAN & PAY WITH ANY UPI APP');
      setFrameColor('#059669');
      setSelectedPresetLogo('upi');
    } else if (preset === 'cafe') {
      setActiveCategory('business');
      setQrType('menu');
      setDotStyle('dots');
      setFinderShape('leaf-tl');
      setFinderCenterShape('circle');
      setFgColor('#b45309');
      setGradientColor2('#ea580c');
      setGradientType('linear');
      setFrameStyle('cafe-cup');
      setFrameText('SCAN FOR CAFE MENU');
      setFrameColor('#b45309');
      setSelectedPresetLogo('menu');
    } else if (preset === 'cyber') {
      setDotStyle('extra-round');
      setFinderShape('rounded');
      setFinderCenterShape('diamond');
      setFgColor('#4f46e5');
      setGradientColor2('#ec4899');
      setGradientType('linear');
      setFrameStyle('neon-cyber');
      setFrameText('ACCESS TERMINAL');
      setFrameColor('#4f46e5');
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
            rects += `<rect x="${c * 5 + 10}" y="${r * 5 + 10}" width="5" height="5" fill="${fgColor}"/>`;
          }
        }
      }
      const dim = s * 5 + 20;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="100%" height="100%"><rect width="${dim}" height="${dim}" rx="12" fill="#ffffff"/>${rects}</svg>`;
    } catch {
      return '';
    }
  };

  const handlePrintBatch = () => {
    const lines = batchInput.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 30);
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
    ? 'bg-zinc-950/70 border-zinc-800/80'
    : 'bg-slate-50 border-slate-200/90';

  const activePillClass = isDark
    ? 'bg-white text-zinc-950 border-white shadow-sm'
    : 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20';

  const inactivePillClass = isDark
    ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
    : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300';

  const inputClass = clsx(
    'w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:border-indigo-500',
    isDark
      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
      : 'bg-slate-50 border-slate-300/90 text-slate-900 placeholder-slate-400 focus:bg-white'
  );

  const labelClass = clsx(
    'block text-xs font-semibold mb-1.5',
    isDark ? 'text-zinc-300' : 'text-slate-700'
  );

  const colorThemes = [
    { name: 'Royal', fg: '#7c3aed', g2: '#db2777', from: 'from-violet-600', to: 'to-pink-600' },
    { name: 'Emerald', fg: '#059669', g2: '#10b981', from: 'from-emerald-600', to: 'to-teal-400' },
    { name: 'Oceanic', fg: '#2563eb', g2: '#06b6d4', from: 'from-blue-600', to: 'to-cyan-400' },
    { name: 'Sunset', fg: '#e11d48', g2: '#f97316', from: 'from-rose-600', to: 'to-orange-500' },
    { name: 'Gold', fg: '#b45309', g2: '#eab308', from: 'from-amber-700', to: 'to-yellow-500' },
  ];

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
                  'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  active
                    ? isDark
                      ? 'bg-white text-black shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
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
            { id: 'cyber', label: 'Cyber' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyQuickPreset(p.id as 'classic' | 'upi' | 'cafe' | 'cyber')}
              className={clsx(
                'hidden md:inline-flex px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer',
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
              'flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
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
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
              isDark
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 shadow-sm'
            )}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: CREATE QR STUDIO */}
      {studioMode === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* LEFT COLUMN (7 Cols on PC) */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
            
            {/* MOBILE STICKY COMPACT PREVIEW BAR (Pins to top on mobile so you see live changes while scrolling!) */}
            <div className="block lg:hidden sticky top-[58px] z-30">
              <div
                className={clsx(
                  'p-3 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-3 shadow-lg',
                  isDark ? 'bg-[#111116]/95 border-zinc-800' : 'bg-white/95 border-slate-200'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={clsx(
                      'w-20 h-20 rounded-xl p-1.5 flex items-center justify-center border shrink-0 overflow-hidden [&>svg]:w-full [&>svg]:h-full',
                      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
                    )}
                    dangerouslySetInnerHTML={{ __html: svgMobile }}
                  />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold truncate">Live QR Preview</span>
                    </div>
                    {/* Mini Color Dots on Mobile */}
                    <div className="flex items-center gap-1.5">
                      {colorThemes.map((t) => (
                        <button
                          key={t.name}
                          type="button"
                          title={t.name}
                          onClick={() => {
                            setFgColor(t.fg);
                            setGradientColor2(t.g2);
                            setGradientType('linear');
                            setFrameColor(t.fg);
                            setTransparentBg(false);
                          }}
                          className={`w-5 h-5 rounded-full bg-gradient-to-br ${t.from} ${t.to} border border-white/30 shadow-sm cursor-pointer active:scale-90 transition-transform`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right-side Mobile Action Stack */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className={clsx(
                      'flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-sm',
                      isDark ? 'bg-white text-zinc-950' : 'bg-indigo-600 text-white'
                    )}
                  >
                    <Download className="w-3.5 h-3.5" /> PNG
                  </button>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className={clsx('py-1.5 px-2 rounded-lg text-[10px] font-bold border text-center cursor-pointer', inactivePillClass)}
                    >
                      SVG
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyImage}
                      className={clsx('py-1.5 px-2 rounded-lg text-[10px] font-bold border text-center cursor-pointer', inactivePillClass)}
                    >
                      {copied ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 1: Category + Type + Input Form */}
            <div className={clsx('p-3.5 sm:p-5 rounded-2xl border space-y-3.5', cardClass)}>
              {/* 5-Column Equal Grid on Mobile so NO Category Tab gets cut off! */}
              <div className="grid grid-cols-5 gap-1 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5 pb-2.5 border-b border-slate-200/80 dark:border-zinc-800/80">
                {[
                  { id: 'links', label: 'Links', full: 'Links & Basic' },
                  { id: 'payments', label: 'Pay/UPI', full: 'Global & UPI Pay' },
                  { id: 'social', label: 'Social', full: 'Social & Contact' },
                  { id: 'business', label: 'Business', full: 'Business & Menu' },
                  { id: 'access', label: 'WiFi', full: 'WiFi & Access' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id as CategoryId);
                      const first = QR_TYPES.find((t) => t.category === cat.id);
                      if (first) setQrType(first.id);
                    }}
                    className={clsx(
                      'px-1.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer text-center truncate',
                      activeCategory === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : inactivePillClass
                    )}
                  >
                    <span className="sm:hidden">{cat.label}</span>
                    <span className="hidden sm:inline">{cat.full}</span>
                  </button>
                ))}
              </div>

              {/* Compact 3-Col Mobile / 4-Col Desktop Pill Grid for QR Types */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {QR_TYPES.filter((t) => t.category === activeCategory).map((item) => {
                  const Icon = item.icon;
                  const active = qrType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setQrType(item.id)}
                      className={clsx(
                        'flex items-center gap-1.5 py-2 px-2.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-left',
                        active ? activePillClass : inactivePillClass
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Input Box */}
              <div className={clsx('p-3 sm:p-4 rounded-xl border space-y-2.5', subCardClass)}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Enter {QR_TYPES.find((t) => t.id === qrType)?.label} Details
                  </span>
                  <span className="text-[10px] font-medium text-emerald-500">● Instant Sync</span>
                </div>

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
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: Organized Customization Card (5 Equal Tabs on Mobile) */}
            <div className={clsx('p-3.5 sm:p-5 rounded-2xl border space-y-4', cardClass)}>
              <div className="grid grid-cols-5 gap-1 sm:flex sm:items-center sm:gap-1.5 pb-2.5 border-b border-slate-200/80 dark:border-zinc-800/80">
                {[
                  { id: 'shapes', label: 'Shapes', full: 'Shape & Eyes', icon: Eye },
                  { id: 'frames', label: 'Frames', full: 'Frames (20)', icon: Frame },
                  { id: 'colors', label: 'Colors', full: 'Colors', icon: Palette },
                  { id: 'logo', label: 'Logo', full: 'Logo Badge', icon: ImageIcon },
                  { id: 'artwork', label: 'Art', full: 'Art Presets (16)', icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = designTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDesignTab(tab.id as DesignTab)}
                      className={clsx(
                        'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-1.5 px-1 sm:px-3 rounded-xl text-[10px] sm:text-xs font-semibold border transition-all cursor-pointer truncate',
                        active ? activePillClass : inactivePillClass
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="sm:hidden truncate">{tab.label}</span>
                      <span className="hidden sm:inline">{tab.full}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: ORGANIZED SHAPES & EYES */}
              {designTab === 'shapes' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className={clsx('grid grid-cols-3 sm:inline-flex w-full sm:w-auto p-1 rounded-xl border', subCardClass)}>
                      {[
                        { id: 'dots', label: '1. Body Dots' },
                        { id: 'ring', label: '2. Eye Ring' },
                        { id: 'center', label: '3. Eye Dot' },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setShapeSubTab(sub.id as 'dots' | 'ring' | 'center')}
                          className={clsx(
                            'px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center',
                            shapeSubTab === sub.id
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : isDark
                              ? 'text-zinc-400 hover:text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          )}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customEyeColors}
                        onChange={(e) => setCustomEyeColors(e.target.checked)}
                        className="w-4 h-4 rounded accent-indigo-600"
                      />
                      Custom Eye Colors
                    </label>
                  </div>

                  <div className={clsx('p-3 rounded-xl border', subCardClass)}>
                    {shapeSubTab === 'dots' && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                        {BODY_SHAPES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setDotStyle(s.id)}
                            className={clsx(
                              'py-2 px-2 rounded-lg border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer truncate',
                              dotStyle === s.id ? activePillClass : inactivePillClass
                            )}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {shapeSubTab === 'ring' && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                        {EYE_BORDER_SHAPES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setFinderShape(s.id)}
                            className={clsx(
                              'py-2 px-2 rounded-lg border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer truncate',
                              finderShape === s.id ? activePillClass : inactivePillClass
                            )}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {shapeSubTab === 'center' && (
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
                        {EYE_CENTER_SHAPES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setFinderCenterShape(s.id)}
                            className={clsx(
                              'py-2 px-1.5 rounded-lg border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer truncate',
                              finderCenterShape === s.id ? activePillClass : inactivePillClass
                            )}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {customEyeColors && (
                    <div className={clsx('p-3 rounded-xl border flex flex-wrap items-center gap-4', subCardClass)}>
                      <label className="flex items-center gap-2 text-xs font-medium">
                        <span>Outer Ring:</span>
                        <input type="color" value={eyeBorderColor} onChange={(e) => setEyeBorderColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium">
                        <span>Inner Dot:</span>
                        <input type="color" value={eyeCenterColor} onChange={(e) => setEyeCenterColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: 20 ILLUSTRATED FRAMES */}
              {designTab === 'frames' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[210px] overflow-y-auto pr-1">
                    {FRAME_STYLES.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFrameStyle(f.id);
                          if (f.defaultText) setFrameText(f.defaultText);
                        }}
                        className={clsx(
                          'py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left truncate',
                          frameStyle === f.id ? activePillClass : inactivePillClass
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

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

              {/* TAB 3: COLORS */}
              {designTab === 'colors' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'none', label: 'Solid Color' },
                      { id: 'linear', label: 'Linear Gradient' },
                      { id: 'radial', label: 'Radial Gradient' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGradientType(g.id as 'none' | 'linear' | 'radial')}
                        className={clsx(
                          'px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                          gradientType === g.id ? activePillClass : inactivePillClass
                        )}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={clsx('p-3 rounded-xl border', subCardClass)}>
                      <label className={labelClass}>Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                        <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className={inputClass} />
                      </div>
                    </div>

                    {gradientType !== 'none' && (
                      <div className={clsx('p-3 rounded-xl border', subCardClass)}>
                        <label className={labelClass}>Second Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                          <input type="text" value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} className={inputClass} />
                        </div>
                      </div>
                    )}

                    <div className={clsx('p-3 rounded-xl border', subCardClass)}>
                      <label className={labelClass}>Background</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={bgColor} disabled={transparentBg} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                        <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                          <input type="checkbox" checked={transparentBg} onChange={(e) => setTransparentBg(e.target.checked)} className="rounded accent-indigo-600" />
                          Transparent
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LOGO */}
              {designTab === 'logo' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input ref={fileInputLogoRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" />
                      <button
                        type="button"
                        onClick={() => fileInputLogoRef.current?.click()}
                        className={clsx('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer', activePillClass)}
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Logo
                      </button>
                      {(customLogoUrl || selectedPresetLogo !== 'none') && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomLogoUrl(null);
                            setSelectedPresetLogo('none');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium opacity-75">Size:</span>
                      <input type="range" min="0.16" max="0.28" step="0.02" value={logoScale} onChange={(e) => setLogoScale(parseFloat(e.target.value))} className="w-20 accent-indigo-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {PRESET_LOGOS.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetLogo(l.id);
                          setCustomLogoUrl(null);
                        }}
                        className={clsx(
                          'flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-semibold cursor-pointer',
                          selectedPresetLogo === l.id && !customLogoUrl ? activePillClass : inactivePillClass
                        )}
                      >
                        <span className="text-base">{l.emoji}</span>
                        <span className="text-[10px]">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: ARTWORK */}
              {designTab === 'artwork' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input ref={fileInputArtRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'art')} className="hidden" />
                      <button
                        type="button"
                        onClick={() => fileInputArtRef.current?.click()}
                        className={clsx('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer', activePillClass)}
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Photo / Art
                      </button>
                      {artworkUrl && (
                        <button
                          type="button"
                          onClick={() => setArtworkUrl(null)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 cursor-pointer"
                        >
                          Clear Art
                        </button>
                      )}
                    </div>
                  </div>

                  {artworkUrl && (
                    <div className={clsx('p-3 rounded-xl border space-y-2.5', subCardClass)}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 w-full sm:w-auto">
                          {[
                            { id: 'qr-fill', label: '1. Art Inside QR' },
                            { id: 'back-halo', label: '2. Back (Halo)' },
                            { id: 'back-pure', label: '3. Back (Pure)' },
                            { id: 'medallion', label: '4. Center Badge' },
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setArtPlacement(m.id as ArtPlacement)}
                              className={clsx(
                                'px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer text-center',
                                artPlacement === m.id ? activePillClass : inactivePillClass
                              )}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium opacity-80">Opacity:</span>
                          <input type="range" min="0.3" max="1" step="0.05" value={artworkOpacity} onChange={(e) => setArtworkOpacity(parseFloat(e.target.value))} className="w-24 accent-indigo-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[210px] overflow-y-auto pr-1">
                    {ART_PRESETS.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => {
                          setArtworkUrl(art.svgData);
                          setFgColor(art.fg);
                          setGradientColor2(art.g2);
                          setGradientType('linear');
                        }}
                        className={clsx(
                          'group p-1.5 rounded-xl border text-left cursor-pointer',
                          artworkUrl === art.svgData ? activePillClass : inactivePillClass
                        )}
                      >
                        <img src={art.svgData} alt={art.name} className="w-full h-14 object-cover rounded-lg mb-1" />
                        <p className="text-[10px] font-semibold text-center truncate">{art.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop Sticky Live Preview) */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20">
            <div className={clsx('p-6 rounded-2xl border flex flex-col items-center', cardClass)}>
              <div className="w-full flex items-center justify-between mb-4">
                <span className={clsx('text-xs font-bold tracking-wider uppercase', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                  LIVE QR PREVIEW
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Scannable • Vector
                </span>
              </div>

              <div
                className={clsx(
                  'w-full max-w-[300px] aspect-square rounded-2xl p-4 flex items-center justify-center border overflow-hidden transition-colors [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[270px] [&>svg]:drop-shadow-sm',
                  isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-slate-100 border-slate-200/90'
                )}
                dangerouslySetInnerHTML={{ __html: svgDesktop }}
              />

              {/* Instant Color Themes Bar */}
              <div className="w-full mt-5 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className={clsx('flex items-center gap-1.5 text-xs font-semibold', isDark ? 'text-zinc-300' : 'text-slate-700')}>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Instant Color Themes
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    100% Scannable
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {colorThemes.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => {
                        setFgColor(t.fg);
                        setGradientColor2(t.g2);
                        setGradientType('linear');
                        setFrameColor(t.fg);
                        setTransparentBg(false);
                      }}
                      className={clsx(
                        'flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all cursor-pointer',
                        isDark
                          ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-white'
                      )}
                    >
                      <div className={`w-full h-5 rounded-lg bg-gradient-to-r ${t.from} ${t.to} shadow-sm`} />
                      <span className={clsx('text-[10px] font-semibold', isDark ? 'text-zinc-300' : 'text-slate-700')}>
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className={clsx(
                    'flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    isDark
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                  )}
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className={clsx(
                    'flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer',
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
                  'w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                  inactivePillClass
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" /> Copied QR to Clipboard!
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
            <button type="button" onClick={() => fileInputScanRef.current?.click()} className={clsx('inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border cursor-pointer', inactivePillClass)}>
              <Upload className="w-4 h-4" /> Upload QR Image
            </button>
          </div>

          <video ref={videoRef} className={clsx('w-full max-w-md mx-auto rounded-xl border', cameraActive ? 'block' : 'hidden')} playsInline muted />

          {scanResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-500">Decoded Content:</span>
                <button type="button" onClick={() => navigator.clipboard.writeText(scanResult)} className="text-xs font-semibold text-indigo-500 hover:underline cursor-pointer">
                  Copy
                </button>
              </div>
              <p className="text-sm font-mono break-all">{scanResult}</p>
            </div>
          )}

          {scanError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500">
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
              <h2 className="text-lg font-bold">Batch QR Code Studio</h2>
              <p className={clsx('text-xs', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                Enter one URL, UPI link, or serial code per line.
              </p>
            </div>
            <button type="button" onClick={handlePrintBatch} className={clsx('inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer', activePillClass)}>
              <Printer className="w-3.5 h-3.5" /> Print Sheet
            </button>
          </div>

          <textarea rows={4} value={batchInput} onChange={(e) => setBatchInput(e.target.value)} className={inputClass} />

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
                  className={clsx('p-3 rounded-xl border cursor-pointer hover:border-indigo-500 transition-all space-y-2 flex flex-col items-center', subCardClass)}
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