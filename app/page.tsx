// app/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import clsx from 'clsx';
import type { LandingContent } from '@/lib/landing-content';
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
  Send,
  ArrowLeft,
  Info,
  Scale,
  Globe,
  Menu,
  X,
} from 'lucide-react';

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

export type ActiveSiteTab = 'studio' | 'about' | 'privacy' | 'terms' | 'contact' | 'faq';

const VALID_TABS: ActiveSiteTab[] = ['studio', 'about', 'privacy', 'terms', 'contact', 'faq'];

// Hoisted static arrays outside the component so React never recreates them on re-renders
const NAV_ITEMS: { id: ActiveSiteTab; label: string }[] = [
  { id: 'studio', label: 'QR Generator' },
  { id: 'about', label: 'About Us' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'contact', label: 'Contact Us' },
  { id: 'faq', label: 'FAQ' },
];

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
    desc: '56 templates, 30 QR artworks, 104 printable cards and 70 animated effects.',
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

const GENERATOR_LINKS: [href: string, label: string][] = [
  ['/', 'Free QR Code Generator'],
  ['/animated-qr-code', 'Animated QR Code'],
  ['/qr-code-with-logo', 'QR Code With Logo'],
  ['/business-card-qr', 'Business Card QR'],
  ['/wifi', 'WiFi QR Code'],
  ['/upi', 'UPI QR Code'],
  ['/paypal', 'PayPal QR Code'],
  ['/whatsapp', 'WhatsApp QR Code'],
  ['/vcard', 'vCard QR Code'],
  ['/google-review-qr', 'Google Review QR'],
  ['/instagram-qr', 'Instagram QR Code'],
  ['/youtube-qr', 'YouTube QR Code'],
  ['/dynamic-qr', 'Dynamic QR Code'],
  ['/pdf', 'PDF & Menu QR Code'],
  ['/crypto', 'Crypto Wallet QR Code'],
];

const FAQS = [
  {
    q: 'Do QR codes created on QR Generato ever expire?',
    a: 'No. Every QR code made here is static: your link, payment ID, WiFi details or contact card is stored directly in the code, so it works forever with unlimited scans and no subscription.',
  },
  {
    q: 'Is QR Generato really a free QR code generator?',
    a: 'Yes. Creating, styling and downloading QR codes is completely free — no sign-up, no watermark and no hidden fees, including PNG, SVG, GIF and MP4 downloads.',
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
    a: 'Yes. The Cards tab has 104 printable layouts — 11 retro pixel-art cards, 12 Retro Girl lo-fi game cards, 12 elegant Art-Nouveau portraits, 26 Indian travel-poster and folk-art cards, 31 vintage poster, blueprint and botanical cards, plus business, ID, membership, ticket, invitation and menu cards. Add your own name and details and download a 3000px PNG ready for print.',
  },
  {
    q: 'Can I add artwork or a logo to my QR code?',
    a: 'Yes. Choose from 30 QR art presets or upload your own image to blend art into the QR dots, place it behind the code or show it as a centre badge. You can also add a preset or custom logo in the Logos tab.',
  },
  {
    q: 'Is there a built-in QR code scanner?',
    a: 'Yes. Switch to Scan at the top of the studio to read QR codes with your camera or by uploading a screenshot.',
  },
  {
    q: 'Which payment QR codes are supported?',
    a: 'Bharat UPI (Google Pay, PhonePe, Paytm, BHIM), SEPA bank transfers, PayPal.me, Cash App, Revolut, Brazil Pix, Singapore PayNow, Stripe payment links, bank transfer details and crypto wallets (Bitcoin, Ethereum, Solana, USDT).',
  },
  {
    q: 'Is my data stored on your servers?',
    a: 'No. QR Generato runs entirely in your browser. Your links, bank details, photos and logos never leave your device.',
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

const APP_SCHEMA_JSON = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'QR Generato',
  alternateName: 'QR Generato – Free QR Code Generator',
  url: 'https://qrgenerato.com/',
  description:
    'Free online QR code generator with logo, colors, frames and payment QR codes. No sign-up, no watermark, permanent static codes.',
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
    'PNG and SVG download',
    'Batch QR generation',
    'QR code scanner',
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
}: {
  initialTab?: ActiveSiteTab;
  heading?: string;
  /** Tool landing pages (/wifi, /upi…) get their own guide section + FAQ schema */
  landing?: LandingContent;
}) {
  const landingData = landing ?? null;
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveSiteTab>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/faq') return 'faq';
      if (p === '/about' || p === '/about-us') return 'about';
      if (p === '/contact' || p === '/contact-us') return 'contact';
      if (p === '/privacy' || p === '/privacy-policy') return 'privacy';
      if (p === '/terms' || p === '/terms-and-conditions') return 'terms';
      const hash = window.location.hash.replace('#', '') as ActiveSiteTab;
      if (VALID_TABS.includes(hash)) return hash;
    }
    return initialTab;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);

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

    const popStateHandler = () => {
      const currentHash = window.location.hash.replace('#', '') as ActiveSiteTab;
      if (window.location.pathname === '/faq') {
        setActiveTab('faq');
      } else if (VALID_TABS.includes(currentHash)) {
        setActiveTab(currentHash);
      } else {
        setActiveTab('studio');
      }
    };

    window.addEventListener('qr-theme-change', themeHandler);
    window.addEventListener('popstate', popStateHandler);
    return () => {
      window.removeEventListener('qr-theme-change', themeHandler);
      window.removeEventListener('popstate', popStateHandler);
    };
  }, []);

  const switchTab = useCallback((tab: ActiveSiteTab) => {
    setActiveTab(tab);
    setMenuOpen(false);
    // Instant scroll on mobile prevents smooth-scroll frame drops during layout shifts
    window.scrollTo({ top: 0, behavior: window.innerWidth < 768 ? 'auto' : 'smooth' });

    // Update URL cleanly without triggering a Next.js page reload or flash
    if (tab === 'studio') {
      window.history.pushState(null, '', '/');
    } else if (tab === 'faq') {
      window.history.pushState(null, '', '/faq');
    } else {
      window.history.pushState(null, '', `/#${tab}`);
    }
  }, []);

  const cardClass = isDark
    ? 'bg-[#111116] border-zinc-800/90 text-zinc-100 shadow-lg shadow-black/20'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-md shadow-slate-200/60';

  const subCardClass = isDark
    ? 'bg-zinc-900/70 border-zinc-800 text-zinc-100'
    : 'bg-slate-50 border-slate-200/90 text-slate-900';

  const mutedText = isDark ? 'text-zinc-400' : 'text-slate-600';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Inject Google FAQ Schema */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: landingData ? faqSchemaJson(landingData.faqs) : FAQ_SCHEMA_JSON }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: APP_SCHEMA_JSON }}
      />

      {/* UPPER NAVBAR - Solid on mobile for 60fps scrolling, blurred on desktop */}
      <header className="sticky top-0 z-50 bg-[#121217] lg:bg-[#121217]/95 lg:backdrop-blur-md border-b border-zinc-800/80 text-zinc-100 pt-[env(safe-area-inset-top)]">
        {/* Fixed 60px row (+1px border) = --header-h in globals.css, which sticky panels below rely on */}
        <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => switchTab('studio')}
            className="flex items-center gap-3.5 group cursor-pointer text-left min-w-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-zinc-900 border border-purple-500/50 shadow-md shadow-purple-500/20 flex items-center justify-center text-purple-400 group-hover:border-purple-400 transition-colors shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white truncate">
                  QR Generato
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PRO
                </span>
              </div>
              <p className="hidden sm:block lg:hidden xl:block text-xs text-zinc-400 truncate">
                Free Online QR Code Generator With Logo &amp; Global Payments
              </p>
            </div>
          </button>

          {/* Desktop Navigation Pill - 100% Instant State Tabs */}
          <nav aria-label="Main" className="hidden lg:flex shrink-0 items-center gap-1 xl:gap-1.5 p-1.5 rounded-2xl bg-[#09090d] border border-zinc-800/90">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchTab(item.id)}
                  className={clsx(
                    'px-3 xl:px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap',
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/25'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 cursor-pointer"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {menuOpen && (
          <div className="lg:hidden border-t border-zinc-800 bg-[#121217] px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 shadow-xl max-h-[calc(100dvh-var(--header-h))] overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => switchTab(item.id)}
                className={clsx(
                  'w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer',
                  activeTab === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800/80'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* MAIN BODY */}
      <main className="flex-1">
        <div className={activeTab === 'studio' ? 'block' : 'hidden'}>
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
          <QRStudio />

          {landingData && (
            <section className="max-w-7xl mx-auto px-4 pt-2 pb-6" aria-labelledby="landing-guide">
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

          <section className="max-w-7xl mx-auto px-4 pb-16 pt-2 space-y-6">
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
                  className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 cursor-pointer"
                >
                  View All FAQs →
                </button>
              </div>

              <div className={clsx('divide-y', isDark ? 'divide-zinc-800/80' : 'divide-slate-200')}>
                {FAQS.slice(0, 4).map((item) => (
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
          </section>
        </div>

        {/* OTHER TABS VIEW (INCLUDING FAQ TAB - ZERO FLASH) */}
        {activeTab !== 'studio' && (
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
                    Your privacy is 100% protected because QR Generato runs entirely inside your web browser:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-emerald-500 mb-1.5">1. Zero Server Uploads</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        URLs, bank details, UPI IDs, and WiFi passwords are encoded locally in JavaScript and never leave your device.
                      </p>
                    </div>
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-indigo-500 mb-1.5">2. Local Image Memory</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        Uploaded brand logos and custom photos are processed directly inside your browser via HTML5 FileReader.
                      </p>
                    </div>
                    <div className={clsx('p-5 rounded-xl border', subCardClass)}>
                      <h3 className="text-xs font-bold text-purple-500 mb-1.5">3. No Tracking Cookies</h3>
                      <p className={clsx('text-xs leading-relaxed', mutedText)}>
                        We only save your Dark/Light theme preference in local storage. We never track scans or user identities.
                      </p>
                    </div>
                  </div>
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
                  {contactSent ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Thank you! Your message has been received.
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setContactSent(true);
                      }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl"
                    >
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        className={clsx(
                          'w-full rounded-xl border px-3.5 py-2.5 text-sm',
                          isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        )}
                      />
                      <input
                        type="email"
                        required
                        placeholder="Your Email"
                        className={clsx(
                          'w-full rounded-xl border px-3.5 py-2.5 text-sm',
                          isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        )}
                      />
                      <textarea
                        rows={4}
                        required
                        placeholder="How can we help?"
                        className={clsx(
                          'sm:col-span-2 w-full rounded-xl border px-3.5 py-2.5 text-sm',
                          isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        )}
                      />
                      <div>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Send Message
                        </button>
                      </div>
                    </form>
                  )}
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

      {/* FOOTER - Solid on mobile for smooth scrolling, blurred on desktop */}
      <footer className="bg-white dark:bg-[#0a0a0f] md:bg-white/95 md:dark:bg-[#0a0a0f]/95 md:backdrop-blur-md border-t border-slate-200/90 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  QR Generato
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                The best free QR code generator online with no sign up and no expiration. Create custom QR codes with logo, UPI, SEPA, PayPal, Pix, and smart artwork 100% client-side.
              </p>
            </div>

            {/* Real links (not buttons) so search engines can discover every generator page */}
            <nav className="space-y-3" aria-label="QR code generators">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                QR Code Generators
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {GENERATOR_LINKS.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Company &amp; Support
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button type="button" onClick={() => switchTab('faq')} className="inline-flex items-center gap-2 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Frequently Asked Questions
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => switchTab('about')} className="inline-flex items-center gap-2 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                    <Info className="w-3.5 h-3.5 text-indigo-500" /> About Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => switchTab('contact')} className="inline-flex items-center gap-2 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                    <Mail className="w-3.5 h-3.5 text-pink-500" /> Contact Us
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Legal &amp; Privacy
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button type="button" onClick={() => switchTab('privacy')} className="inline-flex items-center gap-2 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => switchTab('terms')} className="inline-flex items-center gap-2 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                    <Scale className="w-3.5 h-3.5 text-sky-500" /> Terms &amp; Conditions
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-500">
            <p>© {new Date().getFullYear()} QR Generato. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <button type="button" onClick={() => switchTab('about')} className="hover:text-slate-900 dark:hover:text-zinc-300 cursor-pointer">About</button>
              <button type="button" onClick={() => switchTab('privacy')} className="hover:text-slate-900 dark:hover:text-zinc-300 cursor-pointer">Privacy</button>
              <button type="button" onClick={() => switchTab('terms')} className="hover:text-slate-900 dark:hover:text-zinc-300 cursor-pointer">Terms</button>
              <button type="button" onClick={() => switchTab('contact')} className="hover:text-slate-900 dark:hover:text-zinc-300 cursor-pointer">Contact</button>
              <button type="button" onClick={() => switchTab('faq')} className="hover:text-slate-900 dark:hover:text-zinc-300 cursor-pointer">FAQ</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}