// app/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ContactForm from '@/components/contact-form';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GENERATOR_LINKS, SiteFooter, SiteHeader, TAB_PATHS } from '@/components/site-shell';
import clsx from 'clsx';
import type { LandingContent } from '@/lib/landing-content';
import type { StudioMode } from '@/components/qr-studio';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  Wifi,
  Utensils,
  Contact,
  HelpCircle,
  CheckCircle2,
  Download,
  Palette,
  Layers,
  Mail,
  ArrowLeft,
  Globe,
} from 'lucide-react';

// My QR Codes lists: only downloaded when that section is opened
const DynamicQrManager = dynamic(() => import('@/components/dynamic-qr-manager'));
const FilesManager = dynamic(() => import('@/components/files-manager'));

// Lazy-load the heavy QRStudio engine so initial page paint and tab switches are instant on old phones
const QRStudio = dynamic(() => import('@/components/qr-studio'), {
  loading: () => (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="w-full h-[540px] rounded-2xl border border-zinc-800/80 bg-[#111116] animate-pulse flex flex-col items-center justify-center gap-3 text-zinc-400">
        <QrCode className="w-8 h-8 text-purple-500 animate-bounce" />
        <span className="text-xs font-semibold tracking-wide">Loading QR Studio...</span>
      </div>
    </div>
  ),
});

export type ActiveSiteTab = 'studio' | 'my-codes' | 'about' | 'privacy' | 'terms' | 'contact' | 'faq';

const VALID_TABS: ActiveSiteTab[] = ['studio', 'about', 'privacy', 'terms', 'contact', 'faq'];
// ('my-codes' is reachable by path only: its hash carries edit links like #code=…&key=…)

const PATH_TABS: Record<string, ActiveSiteTab> = {
  '/my-codes': 'my-codes',
  '/faq': 'faq',
  '/about': 'about',
  '/about-us': 'about',
  '/contact': 'contact',
  '/contact-us': 'contact',
  '/privacy': 'privacy',
  '/privacy-policy': 'privacy',
  '/terms': 'terms',
  '/terms-and-conditions': 'terms',
};

/** Section for the current address: real paths first, then old-style /#about links. */
function tabFromLocation(): ActiveSiteTab | null {
  const byPath = PATH_TABS[window.location.pathname.replace(/\/$/, '') || '/'];
  if (byPath) return byPath;
  const hash = window.location.hash.replace('#', '') as ActiveSiteTab;
  return VALID_TABS.includes(hash) ? hash : null;
}

// Hoisted static arrays outside the component so React never recreates them on re-renders

const STEPS = [
  {
    step: '01',
    title: 'Pick Any QR or Global Payment Type',
    desc: 'Choose URL, Bharat UPI, Europe SEPA, PayPal, Pix, Crypto, WiFi, vCard, or Cafe Menu.',
    icon: Layers,
    accent: 'text-indigo-500',
  },
  {
    step: '02',
    title: 'Style It: Art, Cards & Animation',
    desc: '56 templates, 30 QR artworks, 135 printable cards and 70 animated effects.',
    icon: Palette,
    accent: 'text-pink-500',
  },
  {
    step: '03',
    title: 'Download PNG, SVG, GIF or MP4',
    desc: 'Print-ready PNG, infinite-scale SVG, or animated GIF & MP4 for social media. Codes never expire.',
    icon: Download,
    accent: 'text-emerald-500',
  },
];

const USE_CASES = [
  {
    icon: Globe,
    color: 'text-emerald-500',
    badge: 'India & Global',
    title: 'UPI, SEPA, PayPal & Pix',
    desc: 'Generate instant payment QR codes for Bharat UPI, European IBAN SEPA, PayPal.me, CashApp, Pix, and Crypto.',
  },
  {
    icon: Utensils,
    color: 'text-amber-500',
    badge: '20 Unique Frames',
    title: 'Cafe & Storefront Frames',
    desc: 'Use our Coffee Cup, Chef Hat, Shopping Bag, or Express Delivery Scooter frames for instant scans.',
  },
  {
    icon: Wifi,
    color: 'text-sky-500',
    badge: '1-Scan Connect',
    title: 'Instant Guest WiFi Access',
    desc: 'Let visitors, hotel guests, or office clients join your WiFi network without typing passwords.',
  },
  {
    icon: Contact,
    color: 'text-indigo-500',
    badge: 'Digital Business Card',
    title: 'vCard & WhatsApp Direct',
    desc: 'Save your phone number, company, email, and website straight into a client’s phone contacts.',
  },
];


const FAQS = [
  {
    q: 'Do QR codes created on QR Generato ever expire?',
    a: 'Normal QR codes never expire: your link, payment ID, Wi-Fi details or contact card is stored inside the code, so it works forever with unlimited scans. Dynamic QR codes don’t expire either and need no subscription. Uploaded PDF, audio and image files are kept as long as people scan them (files with no scans for 6 months are deleted).',
  },
  {
    q: 'Is QR Generato really a free QR code generator?',
    a: 'Yes. Creating, styling and downloading QR codes is completely free — no sign-up, no watermark and no hidden fees, including PNG, SVG, GIF and MP4 downloads.',
  },
  {
    q: 'Can I use this free QR generator without signing up?',
    a: 'Yes. There is no account, no email and no login. Open the QR generator, type your link or details and download your QR code straight away. Dynamic QR codes are saved in your browser, so even those work without signing up.',
  },
  {
    q: 'How do I make a QR code with a logo for free?',
    a: 'Enter your link or details, open the Logos tab and pick a preset logo or upload your own image (PNG, JPG or SVG). The generator raises error correction automatically so the code still scans with the logo in the middle. Then download it as PNG or SVG — free, with no watermark.',
  },
  {
    q: 'Does Google have a free QR code generator?',
    a: 'Google Chrome can make a basic black-and-white QR code for the page you are viewing from its share menu, but you cannot add a logo or colours, or make Wi-Fi, payment, contact or file QR codes. QR Generato does all of that for free, and every code scans with Google Lens, the Google app and any phone camera.',
  },
  {
    q: 'What makes a good free QR generator?',
    a: 'Look for four things: no sign-up, no watermark, codes that never expire, and high-resolution downloads (PNG for screens, SVG for print). Many “free” generators make dynamic codes that stop working after a trial. On QR Generato, normal codes never expire, dynamic codes are free with no subscription, and every download is free for commercial use.',
  },
  {
    q: 'What is the difference between a static and a dynamic QR code?',
    a: 'A static QR code stores your data inside the pattern itself, so it never expires and needs no server. A dynamic QR code holds a short link that redirects to your destination, so you can change where it goes after printing and count scans. QR Generato offers both for free: turn on Dynamic QR under URL / Web, then manage your codes at /dynamic-qr.',
  },
  {
    q: 'Can I make an animated QR code?',
    a: 'Yes. The Motion tab has 20 card motions (falling petals, snow, fireflies, light sweeps, film grain and more) plus 70 animated QR effects — light sweeps, radar, liquid fill, glitch, rainbow and more. The corner eyes stay still so animated codes keep scanning, and you can download them as GIF, MP4 or animated SVG.',
  },
  {
    q: 'Can I put my QR code on a business card?',
    a: 'Yes. The Cards tab has 135 printable layouts — 12 retro pixel-art cards, 12 Retro Girl lo-fi game cards, 12 elegant Art-Nouveau portraits, 26 Indian travel-poster and folk-art cards, 31 vintage poster, blueprint and botanical cards, 30 screen-print Art Posters, plus business, ID, membership, ticket, invitation and menu cards. Add your own name and details and download a 3000px PNG ready for print.',
  },
  {
    q: 'Can I add artwork or a logo to my QR code?',
    a: 'Yes. Choose from 30 QR art presets or upload your own image to blend art into the QR dots, place it behind the code or show it as a centre badge. You can also add a preset or custom logo in the Logos tab.',
  },
  {
    q: 'Can I turn a PDF, MP3 or image into a QR code?',
    a: 'Yes. Choose PDF, Audio or Image and upload your file (PDFs and audio up to 15 MB, images up to 8 MB). Scanning opens a page with a PDF viewer, audio player or the image, plus a download button. You can replace the file later without reprinting the code.',
  },
  {
    q: 'How do I edit or delete a dynamic QR code?',
    a: 'Open My QR Codes from the menu. There you can change where a code points, rename it, pause it, replace an uploaded file, see scans, or delete it. Codes are saved in the browser that created them; use “Copy edit link” to manage a code from another phone or computer.',
  },
  {
    q: 'Can I create many QR codes at once?',
    a: 'Yes. The Bulk QR Code Generator makes up to 200 codes from a list (for example a column pasted from Excel or Google Sheets) and downloads them all as PNG and SVG files in one ZIP, with an index CSV.',
  },
  {
    q: 'Is there a built-in QR code scanner?',
    a: 'Yes. Open the QR Code Scanner (or switch to Scan in the studio) to read codes with your camera or from a screenshot or photo. It works on iPhone, Android and computers, and the image is decoded in your browser, never uploaded.',
  },
  {
    q: 'Which payment QR codes are supported?',
    a: 'Bharat UPI (Google Pay, PhonePe, Paytm, BHIM), SEPA bank transfers, PayPal.me, Cash App, Revolut, Brazil Pix, Singapore PayNow, Stripe payment links, bank transfer details and crypto wallets (Bitcoin, Ethereum, Solana, USDT).',
  },
  {
    q: 'Is my data stored on your servers?',
    a: 'Not for normal QR codes: they are made in your browser, and your links, bank details, photos and logos never leave your device. Only the optional features use our server: dynamic QR codes (destination link and scan counts) and uploaded PDF, audio or image files. See the Privacy Policy for details.',
  },
  {
    q: 'Can I use these QR codes commercially?',
    a: 'Yes. All downloads — high-resolution PNG, scalable SVG, GIF and MP4 — are free for commercial use on packaging, flyers, menus, signs and ads. Always test a printed code with a phone before a large print run.',
  },
];

const FAQ_SCHEMA_JSON = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
});

const WEBSITE_SCHEMA_JSON = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'QR Generato',
  alternateName: ['QRGenerato', 'qrgenerato.com'],
  url: 'https://qrgenerato.com/',
});

const APP_SCHEMA_JSON = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'QR Generato',
  alternateName: 'QR Generato – Free QR Code Generator',
  url: 'https://qrgenerato.com/',
  description:
    'Free online QR code generator with logo, colors and frames. Dynamic QR codes you can edit, PDF, MP3 and image QR codes with file upload, payment QR codes, bulk generation and a QR scanner. No sign-up, no watermark.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'QR code generator with logo',
    'Custom colors, gradients and frames',
    'Wi-Fi, vCard, WhatsApp, URL, email and SMS QR codes',
    'UPI, PayPal, SEPA, Pix and crypto payment QR codes',
    'Dynamic QR codes with editable links and scan statistics',
    'PDF, MP3 and image QR codes with free file upload',
    'Animated QR codes with GIF and MP4 export',
    'PNG and SVG download',
    'Bulk QR code generator with ZIP download',
    'QR code scanner for camera and screenshots',
  ],
});

function faqSchemaJson(faqs: { q: string; a: string }[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  });
}

export default function HomePage({
  initialTab = 'studio',
  heading = 'Free QR Code Generator Online',
  landing,
  studioMode = 'create',
  autoDynamic = false,
  children,
}: {
  initialTab?: ActiveSiteTab;
  heading?: string;
  /** Tool landing pages (/wifi, /upi…) get their own guide section + FAQ schema */
  landing?: LandingContent;
  /** Studio mode to open in (/qr-code-scanner, /bulk-qr-code-generator) */
  studioMode?: StudioMode;
  /** Start with the Dynamic QR switch on (/dynamic-qr) */
  autoDynamic?: boolean;
  /** Extra section shown right under the studio (e.g. the saved dynamic codes list) */
  children?: React.ReactNode;
}) {
  const landingData = landing ?? null;
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveSiteTab>(() => {
    if (typeof window !== 'undefined') return tabFromLocation() ?? initialTab;
    return initialTab;
  });

  useEffect(() => {
    // Initial tab (hash/path) is already resolved by the useState initializer above.
    const saved = localStorage.getItem('qr-theme');
    const prefersDark = saved ? saved === 'dark' : true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);

    const themeHandler = (e: Event) => {
      const nextDark = Boolean((e as CustomEvent).detail);
      setIsDark(nextDark);
      document.documentElement.classList.toggle('dark', nextDark);
    };

    const popStateHandler = () => setActiveTab(tabFromLocation() ?? 'studio');

    window.addEventListener('qr-theme-change', themeHandler);
    window.addEventListener('popstate', popStateHandler);

    // Fetch the My QR Codes code in the background once the page is idle, so opening it is instant
    const warm = () => {
      void import('@/components/dynamic-qr-manager');
      void import('@/components/files-manager');
    };
    const idle = 'requestIdleCallback' in window
      ? window.requestIdleCallback(warm, { timeout: 2000 }) as number
      : setTimeout(warm, 1500);

    return () => {
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle as unknown as number);
      window.removeEventListener('qr-theme-change', themeHandler);
      window.removeEventListener('popstate', popStateHandler);
    };
  }, []);

  const switchTab = useCallback((tab: ActiveSiteTab) => {
    setActiveTab(tab);
    // Instant scroll on mobile prevents smooth-scroll frame drops during layout shifts
    window.scrollTo({ top: 0, behavior: window.innerWidth < 768 ? 'auto' : 'smooth' });

    // Real page address (/about, /privacy-policy…) without a reload, so links are shareable and match the pages Google indexes
    window.history.pushState(null, '', TAB_PATHS[tab]);
  }, []);

  const cardClass = isDark
    ? 'bg-[#111116] border-zinc-800/90 text-zinc-100 shadow-lg shadow-black/20'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-md shadow-slate-200/60';

  const subCardClass = isDark
    ? 'bg-zinc-900/70 border-zinc-800 text-zinc-100'
    : 'bg-slate-50 border-slate-200/90 text-slate-900';

  const mutedText = isDark ? 'text-zinc-400' : 'text-slate-600';

  const pathname = usePathname() || '/';
  const otherGenerators = GENERATOR_LINKS.filter(([href]) => href !== pathname && href !== '/');
  const generatorLinks = (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {otherGenerators.map(([href, label]) => (
        <li key={href}>
          <Link
            href={href}
            className={clsx(
              'h-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors',
              isDark ? 'bg-zinc-900/70 border-zinc-800 hover:border-indigo-500/60' : 'bg-slate-50 border-slate-200 hover:border-indigo-400'
            )}
          >
            <QrCode className="w-4 h-4 text-indigo-500 shrink-0" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Google FAQ markup — only on pages that show these questions (structured data must match visible content) */}
      {(initialTab === 'studio' || initialTab === 'faq') && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: landingData ? faqSchemaJson(landingData.faqs) : FAQ_SCHEMA_JSON }}
        />
      )}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: APP_SCHEMA_JSON }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: WEBSITE_SCHEMA_JSON }}
      />

      {/* UPPER NAVBAR - Solid on mobile for 60fps scrolling, blurred on desktop */}
      <SiteHeader active={activeTab} onTab={switchTab} />

      {/* MAIN BODY */}
      <main className="flex-1">
        <div className={activeTab === 'studio' ? 'block' : 'studio-parked'} aria-hidden={activeTab !== 'studio' || undefined}>
          {activeTab === 'studio' && (
            <div className="max-sm:sr-only max-w-7xl mx-auto px-4 pt-4 sm:pt-6 pb-0">
              {/* Visually hidden on phones (kept in the DOM for SEO / screen readers), shown from sm up. */}
              <h1 className="text-[22px] leading-[1.15] sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-balance">
                {heading.replace(/ Online$/, '')}
                {heading.endsWith(' Online') && (
                  <>
                    {' '}
                    <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                      Online
                    </span>
                  </>
                )}
              </h1>
              <p className={clsx('mt-1 sm:mt-2 text-[13px] leading-snug sm:text-[15px] max-w-4xl', mutedText)}>
                Custom QR codes with logo, colours, cards &amp; animation.
                <span className="hidden sm:inline"> Free forever — no sign-up, no watermark, codes never expire.</span>
              </p>
              <ul className="hidden sm:flex flex-wrap gap-2 mt-2.5" aria-label="Highlights">
                {['100% free', 'No sign-up', 'Never expires', 'PNG · SVG · GIF · MP4'].map((chip) => (
                  <li
                    key={chip}
                    className={clsx(
                      'px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                      isDark ? 'border-zinc-800 bg-zinc-900/70 text-zinc-300' : 'border-slate-200 bg-white text-slate-600'
                    )}
                  >
                    ✓ {chip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <QRStudio initialMode={studioMode} autoDynamic={autoDynamic} />
          {children}

          {landingData && (
            <section className="cv-auto max-w-7xl mx-auto px-4 pt-2 pb-6" aria-labelledby="landing-guide">
              <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-6', cardClass)}>
                <div className="space-y-2 max-w-3xl">
                  <h2 id="landing-guide" className="text-xl sm:text-2xl font-bold tracking-tight">
                    {landingData.title}
                  </h2>
                  {landingData.intro.map((para) => (
                    <p key={para} className={clsx('text-sm leading-relaxed', mutedText)}>
                      {para}
                    </p>
                  ))}
                </div>

                {landingData.sections && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
                    {landingData.sections.map((sec) => (
                      <div key={sec.heading} className="space-y-2">
                        <h3 className="text-base font-bold">{sec.heading}</h3>
                        {sec.paragraphs.map((para) => (
                          <p key={para} className={clsx('text-sm leading-relaxed', mutedText)}>
                            {para}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {landingData.steps.map((step, i) => (
                    <li key={step.title} className={clsx('p-5 rounded-xl border space-y-1.5', subCardClass)}>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">Step {i + 1}</span>
                      <h3 className="text-sm font-bold">{step.title}</h3>
                      <p className={clsx('text-xs sm:text-sm leading-relaxed', mutedText)}>{step.text}</p>
                    </li>
                  ))}
                </ol>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold">Popular uses</h3>
                    <ul className={clsx('text-sm space-y-1.5', mutedText)}>
                      {landingData.uses.map((u) => (
                        <li key={u} className="flex gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {u}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold">Tips</h3>
                    <ul className={clsx('text-sm space-y-1.5 list-disc pl-5', mutedText)}>
                      {landingData.tips.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold">Frequently asked questions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {landingData.faqs.map((f) => (
                      <div key={f.q} className={clsx('p-4 rounded-xl border space-y-1', subCardClass)}>
                        <h4 className="text-sm font-semibold">{f.q}</h4>
                        <p className={clsx('text-xs sm:text-sm leading-relaxed', mutedText)}>{f.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="cv-auto max-w-7xl mx-auto px-4 pb-16 pt-2 space-y-6">
            {!landingData && (
              <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-5', cardClass)} aria-labelledby="free-qr-generator">
                <div className="max-w-3xl space-y-2">
                  <h2 id="free-qr-generator" className="text-xl sm:text-2xl font-bold tracking-tight">
                    Free QR Generator Online — No Sign Up, With Logo
                  </h2>
                  <p className={clsx('text-sm leading-relaxed', mutedText)}>
                    QR Generato is a free QR generator that works right in your browser. Type a link, text, Wi-Fi password,
                    phone number or payment ID and your QR code appears instantly. Add a logo, change the colours, pick a
                    frame and download it as a high-resolution PNG or SVG. There is no account to create, no watermark on
                    your code and no trial that runs out.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={clsx('p-5 rounded-xl border space-y-2', subCardClass)}>
                    <h3 className="text-sm font-bold">Free QR generator with no sign up</h3>
                    <p className={clsx('text-xs leading-relaxed', mutedText)}>
                      Open the page and start. No email, no login and no credit card. Your QR codes are made on your own
                      device, so your links and details stay private.
                    </p>
                  </div>
                  <div className={clsx('p-5 rounded-xl border space-y-2', subCardClass)}>
                    <h3 className="text-sm font-bold">Free QR generator with logo</h3>
                    <p className={clsx('text-xs leading-relaxed', mutedText)}>
                      Put your brand logo, a social icon or your own image in the middle of the code. Error correction is
                      raised automatically so the QR code still scans reliably.
                    </p>
                  </div>
                  <div className={clsx('p-5 rounded-xl border space-y-2', subCardClass)}>
                    <h3 className="text-sm font-bold">QR codes that never expire</h3>
                    <p className={clsx('text-xs leading-relaxed', mutedText)}>
                      Normal QR codes keep working forever with unlimited scans. Free dynamic QR codes let you change the
                      link after printing and count scans, with no subscription.
                    </p>
                  </div>
                </div>
                <p className={clsx('text-sm leading-relaxed max-w-4xl', mutedText)}>
                  Every code works with the iPhone and Android camera, Google Lens and any QR scanner app. Make QR codes for
                  websites, PDFs, MP3 and images, Wi-Fi, WhatsApp, vCard business cards, Google reviews, Instagram, YouTube,
                  UPI, PayPal and crypto payments — all with the same free online QR code generator, on phone, tablet or
                  computer.
                </p>
                <div className="space-y-3 pt-1">
                  <h3 className="text-sm font-bold">Popular free QR code generators</h3>
                  {generatorLinks}
                </div>
              </div>
            )}

            {landingData && (
              <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-4', cardClass)}>
                <h2 className="text-lg font-bold tracking-tight">More free QR code generators</h2>
                {generatorLinks}
              </div>
            )}

            {!landingData && (<>
            {/* Simple 3-Step Workflow */}
            <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-5', cardClass)}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Simple 3-Step Workflow
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    How to Create a Custom QR Code in Seconds
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> No Sign-Up • 100% Permanent
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STEPS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className={clsx('p-5 rounded-xl border space-y-2', subCardClass)}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                          Step {item.step}
                        </span>
                        <Icon className={`w-4 h-4 ${item.accent}`} />
                      </div>
                      <h3 className="text-sm font-bold">{item.title}</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Use Cases */}
            <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-5', cardClass)}>
              <div className="max-w-3xl space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Built for Speed &amp; Privacy
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Why Creators &amp; Businesses Use QR Generato
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {USE_CASES.map((u) => {
                  const Icon = u.icon;
                  return (
                    <div key={u.title} className={clsx('p-4 rounded-xl border space-y-2', subCardClass)}>
                      <div className="flex items-center justify-between">
                        <Icon className={`w-5 h-5 ${u.color}`} />
                        <span
                          className={clsx(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
                          )}
                        >
                          {u.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold pt-1">{u.title}</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>{u.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAQ Accordion on Home */}
            <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-4', cardClass)}>
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Frequently Asked Questions</h2>
                    <p className={clsx('text-xs', mutedText)}>
                      Everything you need to know about static QR codes, global payments, and printing.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => switchTab('faq')}
                  className="py-2 -my-2 text-xs font-semibold text-indigo-500 hover:text-indigo-400 cursor-pointer"
                >
                  View All FAQs →
                </button>
              </div>

              <div className={clsx('divide-y', isDark ? 'divide-zinc-800/80' : 'divide-slate-200')}>
                {FAQS.map((item) => (
                  <details key={item.q} className="group py-3.5">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold hover:text-indigo-500 transition-colors">
                      <span>{item.q}</span>
                      <span
                        className={clsx(
                          'ml-4 text-xs px-2 py-0.5 rounded border group-open:rotate-45 transition-transform',
                          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
                        )}
                      >
                        +
                      </span>
                    </summary>
                    <p className={clsx('mt-2 text-xs sm:text-sm leading-relaxed pr-6', mutedText)}>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
            </>)}
          </section>
        </div>

        {activeTab === 'my-codes' && (
          <div className="py-8 sm:py-10">
            <div className="max-w-7xl mx-auto px-4 pb-4 space-y-3">
              <h1 className={clsx('text-3xl sm:text-4xl font-extrabold', isDark ? 'text-white' : 'text-slate-900')}>My QR Codes</h1>
              <p className={clsx('text-sm max-w-2xl', mutedText)}>
                Your dynamic QR codes and uploaded files. Change where a code goes, replace a file, pause it, see scans, or delete it.
                They’re saved in <strong className={isDark ? 'text-zinc-200' : 'text-slate-800'}>this browser</strong>. To manage a code on
                another phone or computer, open its <strong className={isDark ? 'text-zinc-200' : 'text-slate-800'}>edit link</strong> there
                (“Copy edit link” on each code).
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => switchTab('studio')}
                  className="inline-flex items-center min-h-10 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-4 py-2.5 text-xs font-bold text-white cursor-pointer"
                >
                  Create a new QR code
                </button>
                <Link
                  href="/dynamic-qr"
                  className={clsx(
                    'inline-flex items-center min-h-10 rounded-xl px-4 py-2.5 text-xs font-bold',
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-800'
                  )}
                >
                  New dynamic QR
                </Link>
              </div>
            </div>
            {/* Own boundary: the heading above shows instantly even if the lists are still downloading */}
            <React.Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-6"><div className="h-40 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 animate-pulse" /></div>}>
              <DynamicQrManager alwaysShow />
              <FilesManager alwaysShow />
            </React.Suspense>
            <div className="max-w-7xl mx-auto px-4 pt-2">
              <p className={clsx('text-xs max-w-2xl', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                Deleting a code is permanent: anyone who scans it afterwards sees “not found”. Normal (non-dynamic) QR codes aren’t listed
                here because they aren’t stored anywhere; they keep working forever.
              </p>
            </div>
          </div>
        )}

        {/* OTHER TABS VIEW (INCLUDING FAQ TAB - ZERO FLASH) */}
        {activeTab !== 'studio' && activeTab !== 'my-codes' && (
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-16">
            <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-6', cardClass)}>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-200/80 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => switchTab('studio')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to QR Generator
                </button>
                <span className="text-xs font-semibold text-emerald-500">
                  100% Free • Client-Side Studio
                </span>
              </div>

              {activeTab === 'about' && (
                <div className="space-y-5">
                  <h1 className="text-2xl sm:text-3xl font-bold">About QR Generato PRO</h1>
                  <p className={clsx('text-sm leading-relaxed max-w-4xl', mutedText)}>
                    QR Generato is a fast, 100% free online QR code studio built for creators, shops, restaurants, and businesses worldwide. Every QR code you create here is static, permanent, and works forever with zero scan limits or subscriptions.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-indigo-500 mb-1.5">38+ Global &amp; Local QR Types</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        Supports Bharat UPI, Europe SEPA IBAN, PayPal, CashApp, Pix, PayNow, Crypto, WiFi, vCards, and Menus.
                      </p>
                    </div>
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-emerald-500 mb-1.5">20 Frames &amp; 16 Art Presets</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        Customize corner eyes, add center logos, or fill QR dots with illustrated artwork.
                      </p>
                    </div>
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-purple-500 mb-1.5">PNG, SVG, GIF &amp; MP4</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        Download print-ready high-resolution images for flyers, table tents, and product packaging.
                      </p>
                    </div>
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-amber-500 mb-1.5">Zero Server Storage</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        100% browser-based execution ensures your links and payment details stay private on your device.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-5">
                  <h1 className="text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
                  <p className={clsx('text-sm leading-relaxed max-w-4xl', mutedText)}>
                    Most of QR Generato runs inside your browser and sends nothing anywhere. A few optional features use our server. This page lists exactly what is stored, and for how long. Last updated: November 2026.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: '1. Made in your browser (not uploaded)',
                        color: 'text-emerald-500',
                        text: 'Normal QR codes, the links and details you type, Wi-Fi passwords, payment details, logos, photos used for QR art, and images you scan are processed on your device and never sent to us.',
                      },
                      {
                        title: '2. Dynamic QR codes (optional)',
                        color: 'text-indigo-500',
                        text: 'When you create a dynamic QR code we store its destination link, the name you give it, and scan statistics: time, country and device type. We never store IP addresses; a one-way hash of your IP is used only to enforce daily limits. Your edit key is kept in your browser and we store only a hash of it.',
                      },
                      {
                        title: '3. Uploaded files (optional)',
                        color: 'text-fuchsia-500',
                        text: 'PDF, audio and image files you upload are stored with our cloud storage provider (Backblaze, in the United States) and can be opened by anyone who has the QR code or link. They are deleted when you delete them, or automatically after 6 months without scans. Files reported by visitors may be reviewed and removed.',
                      },
                      {
                        title: '4. Contact form',
                        color: 'text-sky-500',
                        text: 'Your name, email address and message are emailed to our support inbox so we can reply. We don’t add you to any mailing list.',
                      },
                      {
                        title: '5. Analytics',
                        color: 'text-amber-500',
                        text: 'On qrgenerato.com we use Google Analytics to count visits and see which pages are useful. Google may set cookies for this. It doesn’t receive the content of your QR codes.',
                      },
                      {
                        title: '6. Stored on your device',
                        color: 'text-purple-500',
                        text: 'Your theme choice and the edit keys for your dynamic QR codes and uploaded files are saved in your browser’s local storage. Clearing your browser data removes them.',
                      },
                    ].map((item) => (
                      <div key={item.title} className={clsx('p-5 rounded-xl border', subCardClass)}>
                        <h3 className={clsx('text-xs font-bold mb-1.5', item.color)}>{item.title}</h3>
                        <p className={clsx('text-xs leading-relaxed', mutedText)}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                  <p className={clsx('text-xs leading-relaxed max-w-4xl', mutedText)}>
                    To ask about your data or have a dynamic code or file deleted, email support@qrgenerato.com.
                  </p>
                </div>
              )}

              {activeTab === 'terms' && (
                <div className="space-y-5">
                  <h1 className="text-2xl sm:text-3xl font-bold">Terms &amp; Conditions</h1>
                  <p className={clsx('text-sm leading-relaxed max-w-4xl', mutedText)}>
                    Simple, transparent terms for personal and commercial use:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-indigo-500 mb-1.5">1. Free Commercial License</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        All downloaded PNG and Vector SVG QR codes are 100% free for commercial use on packaging, menus, storefronts, and flyers.
                      </p>
                    </div>
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-emerald-500 mb-1.5">2. Acceptable Use</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        You are responsible for the links and payment details you encode. Do not generate QR codes for phishing or illegal content.
                      </p>
                    </div>
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-amber-500 mb-1.5">3. Print Verification</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        Always test your downloaded QR code with a phone camera before printing in bulk.
                      </p>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold pt-2">Uploaded files and dynamic QR codes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: '4. Only upload what you have the right to share',
                        text: 'You must own the file or have permission to share it. Do not upload pirated music, films or books, malware, scams or phishing, sexual content involving minors, violent or hateful content, or other people’s personal information.',
                      },
                      {
                        title: '5. We may remove content',
                        text: 'We may hide or delete files and disable dynamic QR codes that break these rules or the law, or that are reported by visitors, without notice. Report a file with the “Report this file” link on its page or by emailing support@qrgenerato.com.',
                      },
                      {
                        title: '6. Limits and deletion',
                        text: 'Files can be up to 15 MB (PDF and audio) or 8 MB (images). Each person can upload 8 files a day and keep up to 15 files (100 MB) at a time. Very popular files may pause for the rest of the day after 1,000 opens. Files nobody scans for 6 months are deleted automatically. Keep your own copy of anything important.',
                      },
                      {
                        title: '7. Free service, no guarantee',
                        text: 'Dynamic codes and file hosting are free and provided as is. We work to keep them running but can’t guarantee they will always be available. Keep your edit links safe: anyone who has one can change or delete that code.',
                      },
                    ].map((item) => (
                      <div key={item.title} className={clsx('p-5 rounded-xl border', subCardClass)}>
                        <h3 className="text-xs font-bold text-fuchsia-500 mb-1.5">{item.title}</h3>
                        <p className={clsx('text-xs leading-relaxed', mutedText)}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Contact Us</h1>
                    <p className={clsx('text-sm mt-1', mutedText)}>
                      Have feedback, a question, or a custom QR request? Send us a quick message below.
                    </p>
                  </div>
                  <ContactForm isDark={isDark} />
                  <div className={clsx('pt-3 border-t text-xs flex items-center gap-2', isDark ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-500')}>
                    <Mail className="w-4 h-4 text-indigo-500" /> Direct Email: support@qrgenerato.com
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      <HelpCircle className="w-3.5 h-3.5" /> Help Center
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Frequently Asked Questions
                    </h1>
                    <p className={clsx('text-sm', mutedText)}>
                      Everything you need to know about static QR codes, global payment links, custom frames, and print formatting.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {FAQS.map((item, idx) => (
                      <div key={idx} className={clsx('p-5 rounded-xl border space-y-2', subCardClass)}>
                        <h3 className="text-sm font-bold flex items-center gap-2">
                          <span className="text-indigo-500">Q{idx + 1}:</span> {item.q}
                        </h3>
                        <p className={clsx('text-xs sm:text-sm leading-relaxed pl-5', mutedText)}>{item.a}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 dark:border-zinc-800/80 text-center space-y-3">
                    <p className={clsx('text-xs', mutedText)}>Have a question that is not answered here?</p>
                    <button
                      type="button"
                      onClick={() => switchTab('contact')}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 cursor-pointer transition-colors"
                    >
                      Contact Support Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter onTab={switchTab} />
    </div>
  );
}