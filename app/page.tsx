// app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import QRStudio from '@/components/qr-studio';
import clsx from 'clsx';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  IndianRupee,
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
  Zap,
  Info,
  Scale,
  Globe,
  Menu,
  X,
} from 'lucide-react';

export type ActiveSiteTab = 'studio' | 'about' | 'privacy' | 'terms' | 'contact';

export default function HomePage() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveSiteTab>('studio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('qr-theme');
    const prefersDark = saved ? saved === 'dark' : true;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);

    const themeHandler = (e: Event) => {
      const nextDark = Boolean((e as CustomEvent).detail);
      setIsDark(nextDark);
      document.documentElement.classList.toggle('dark', nextDark);
    };
    window.addEventListener('qr-theme-change', themeHandler);
    return () => window.removeEventListener('qr-theme-change', themeHandler);
  }, []);

  const switchTab = (tab: ActiveSiteTab) => {
    setActiveTab(tab);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cardClass = isDark
    ? 'bg-[#111116] border-zinc-800/90 text-zinc-100 shadow-lg shadow-black/20'
    : 'bg-white border-slate-200/90 text-slate-900 shadow-md shadow-slate-200/60';

  const subCardClass = isDark
    ? 'bg-zinc-900/70 border-zinc-800 text-zinc-100'
    : 'bg-slate-50 border-slate-200/90 text-slate-900';

  const mutedText = isDark ? 'text-zinc-400' : 'text-slate-600';

  const navItems: { id: ActiveSiteTab; label: string }[] = [
    { id: 'studio', label: 'QR Generator' },
    { id: 'about', label: 'About Us' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Pick Any QR or Global Payment Type',
      desc: 'Choose URL, Bharat UPI, Europe SEPA, PayPal, Pix, Crypto, WiFi, vCard, or Cafe Menu.',
      icon: Layers,
      accent: 'text-indigo-500',
    },
    {
      step: '02',
      title: 'Customize 20 Frames & 16 Artworks',
      desc: 'Style dot shapes, corner eyes, illustrated frames, or fill QR dots with custom artwork.',
      icon: Palette,
      accent: 'text-pink-500',
    },
    {
      step: '03',
      title: 'Download 1400px PNG or Vector SVG',
      desc: 'Export print-ready high-res PNGs or infinite-scale Vector SVGs that work forever.',
      icon: Download,
      accent: 'text-emerald-500',
    },
  ];

  const useCases = [
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

  const faqs = [
    {
      q: 'Do QR codes created on QR Generato ever expire?',
      a: 'No. Every QR code generated here is 100% static. Your URL, payment ID, WiFi password, or vCard is encoded directly into the dots—meaning it works forever with unlimited scans.',
    },
    {
      q: 'Which countries and payment systems are supported?',
      a: 'We support India Bharat UPI (GPay, PhonePe, Paytm), Europe EPC SEPA IBAN transfers, Global PayPal.me, US/UK CashApp & Venmo, Wise, Revolut, Brazil Pix, Singapore/Thailand PayNow & PromptPay, Stripe, and Crypto wallets.',
    },
    {
      q: 'How do I put an image inside the QR dots vs. behind the QR code?',
      a: 'Open the "Art Presets (16)" tab, pick any preset or upload a photo, and choose "1. Art Inside QR Dots (No Background)" to paint only the QR dots on a clean background, or choose "2. Send Behind QR" to place the full image behind the code.',
    },
    {
      q: 'Is my data stored on your servers?',
      a: 'Never. QR Generato runs 100% client-side inside your browser. Your links, bank details, and logos never leave your device.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
{/* UPPER NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#121217]/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => switchTab('studio')}
            className="flex items-center gap-3.5 group cursor-pointer text-left min-w-0"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-purple-500/50 shadow-md shadow-purple-500/20 flex items-center justify-center text-purple-400 group-hover:border-purple-400 transition-colors shrink-0">
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
              <p className="text-xs text-zinc-400 truncate">
                Free Online QR Code Generator With Logo &amp; Global Payments
              </p>
            </div>
          </button>

          {/* Desktop Navigation Pill */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#09090d] border border-zinc-800/90">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchTab(item.id)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
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
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-[#121217] px-4 py-3 space-y-1.5 shadow-xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => switchTab(item.id)}
                className={clsx(
                  'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
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
          <QRStudio />

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
                {steps.map((item) => {
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
                {useCases.map((u) => {
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

            {/* FAQ Accordion */}
            <div id="faq" className={clsx('border rounded-2xl p-6 sm:p-8 space-y-4', cardClass)}>
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

              <div className={clsx('divide-y', isDark ? 'divide-zinc-800/80' : 'divide-slate-200')}>
                {faqs.map((item) => (
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

        {/* OTHER TABS VIEW */}
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
                      <h3 className="text-xs font-bold text-purple-500 mb-1.5">1400px PNG &amp; Vector SVG</h3>
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
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400">
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

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                QR Code Generators
              </h3>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button type="button" onClick={() => switchTab('studio')} className="inline-flex items-center gap-2 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Free QR Code Generator Online
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => switchTab('studio')} className="inline-flex items-center gap-2 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> UPI &amp; Global Payment QR
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Company &amp; Support
              </h3>
              <ul className="space-y-2.5 text-xs">
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}