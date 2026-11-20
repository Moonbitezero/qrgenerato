// components/site-shell.tsx — the one header and footer used on every page, so moving between pages
// never makes the menu jump or change. Items are real links (crawlable, shareable, open-in-new-tab);
// on pages built from HomePage, `onTab` intercepts clicks to switch sections instantly without a reload.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { FolderOpen, HelpCircle, Info, Mail, Menu, QrCode, Scale, ShieldCheck, X } from 'lucide-react';

export type SiteTab = 'studio' | 'about' | 'privacy' | 'terms' | 'contact' | 'faq';
export type SiteSection = SiteTab | 'my-codes';

/** Real page address for each in-page section. */
export const TAB_PATHS: Record<SiteTab, string> = {
  studio: '/',
  about: '/about',
  privacy: '/privacy-policy',
  terms: '/terms-and-conditions',
  contact: '/contact-us',
  faq: '/faq',
};

const NAV: { id: SiteSection; label: string; href: string }[] = [
  { id: 'studio', label: 'QR Generator', href: '/' },
  { id: 'my-codes', label: 'My QR Codes', href: '/my-codes' },
  { id: 'about', label: 'About Us', href: '/about' },
  { id: 'privacy', label: 'Privacy Policy', href: '/privacy-policy' },
  { id: 'terms', label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { id: 'contact', label: 'Contact Us', href: '/contact-us' },
  { id: 'faq', label: 'FAQ', href: '/faq' },
];

export const GENERATOR_LINKS: [href: string, label: string][] = [
  ['/', 'Free QR Code Generator'],
  ['/dynamic-qr', 'Dynamic QR Code'],
  ['/pdf', 'PDF to QR Code'],
  ['/mp3-qr-code', 'MP3 & Audio QR Code'],
  ['/image-qr-code', 'Image to QR Code'],
  ['/qr-code-scanner', 'QR Code Scanner'],
  ['/bulk-qr-code-generator', 'Bulk QR Code Generator'],
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
  ['/crypto', 'Crypto Wallet QR Code'],
];

const isTab = (id: SiteSection): id is SiteTab => id !== 'my-codes';

/** Left-click without modifier keys: safe to handle in-page instead of navigating. */
const plainClick = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

interface ShellProps {
  active: SiteSection;
  /** When set (HomePage), tab links switch sections in place instead of loading a new page. */
  onTab?: (tab: SiteTab) => void;
}

export function SiteHeader({ active, onTab }: ShellProps) {
  const [open, setOpen] = useState(false);

  const handle = (id: SiteSection) => (e: React.MouseEvent) => {
    setOpen(false);
    if (onTab && isTab(id) && plainClick(e)) {
      e.preventDefault();
      onTab(id);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#121217] lg:bg-[#121217]/95 lg:backdrop-blur-md border-b border-zinc-800/80 text-zinc-100 pt-[env(safe-area-inset-top)]">
      {/* Fixed 60px row (+1px border) = --header-h in globals.css, which sticky panels below rely on */}
      <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center justify-between gap-4">
        <Link href="/" onClick={handle('studio')} className="flex items-center gap-2.5 sm:gap-3.5 group text-left min-w-0" aria-label="QR Generato home">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-zinc-900 border border-purple-500/50 shadow-md shadow-purple-500/20 flex items-center justify-center text-purple-400 group-hover:border-purple-400 transition-colors shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white truncate">QR Generato</span>
              <span className="hidden min-[400px]:inline text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">PRO</span>
            </div>
            <p className="hidden sm:block lg:hidden xl:block text-xs text-zinc-400 truncate">Free Online QR Code Generator With Logo &amp; Global Payments</p>
          </div>
        </Link>

        <nav aria-label="Main" className="hidden lg:flex shrink-0 items-center gap-1 xl:gap-1.5 p-1.5 rounded-2xl bg-[#09090d] border border-zinc-800/90">
          {NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={handle(item.id)}
              aria-current={active === item.id ? 'page' : undefined}
              className={clsx(
                'px-3 xl:px-4 py-2 pointer-coarse:py-3 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap',
                active === item.id
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Phones/tablets: My QR Codes one tap away (not hidden in the menu) + the menu button */}
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <Link
            href="/my-codes"
            onClick={() => setOpen(false)}
            aria-current={active === 'my-codes' ? 'page' : undefined}
            className={clsx(
              'inline-flex items-center gap-1.5 h-11 px-3 rounded-xl border text-sm font-semibold transition-colors',
              active === 'my-codes' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
            )}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="hidden min-[400px]:inline">My QR Codes</span>
            <span className="hidden min-[375px]:inline min-[400px]:hidden">My Codes</span>
            <span className="sr-only min-[375px]:hidden">My QR Codes</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="h-11 w-11 inline-flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="site-mobile-menu"
          aria-label="Main"
          className="lg:hidden border-t border-zinc-800 bg-[#121217] px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 shadow-xl max-h-[calc(100dvh-var(--header-h))] overflow-y-auto"
        >
          {NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={handle(item.id)}
              aria-current={active === item.id ? 'page' : undefined}
              className={clsx(
                'w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors',
                active === item.id ? 'bg-purple-600 text-white' : 'text-zinc-300 hover:bg-zinc-800/80'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter({ onTab }: Pick<ShellProps, 'onTab'>) {
  const link = (tab: SiteTab, label: React.ReactNode, className: string) => (
    <Link
      href={TAB_PATHS[tab]}
      onClick={(e) => {
        if (onTab && plainClick(e)) {
          e.preventDefault();
          onTab(tab);
        }
      }}
      className={className}
    >
      {label}
    </Link>
  );
  const row = 'inline-flex items-center gap-2 py-1.5 lg:pointer-fine:py-0 hover:text-indigo-600 dark:hover:text-white transition-colors';
  const small = 'py-2 lg:pointer-fine:py-0 hover:text-slate-900 dark:hover:text-zinc-300';

  return (
    <footer className="cv-auto bg-white dark:bg-[#0a0a0f] md:bg-white/95 md:dark:bg-[#0a0a0f]/95 md:backdrop-blur-md border-t border-slate-200/90 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">QR Generato</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
              The best free QR code generator online with no sign up and no expiration. Create custom QR codes with logo, UPI, SEPA, PayPal, Pix and smart artwork, made right in your browser.
            </p>
          </div>

          <nav className="space-y-3 lg:col-span-1" aria-label="QR code generators">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">QR Code Generators</h3>
            <ul className="grid grid-cols-2 gap-x-4 lg:pointer-fine:gap-y-2 text-xs">
              {GENERATOR_LINKS.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="block py-2 lg:pointer-fine:py-0 hover:text-indigo-600 dark:hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">Company &amp; Support</h3>
            <ul className="space-y-1 lg:pointer-fine:space-y-2.5 text-xs">
              <li>
                <Link href="/my-codes" className={row}>
                  <QrCode className="w-3.5 h-3.5 text-fuchsia-500" /> My QR Codes
                </Link>
              </li>
              <li>{link('faq', <><HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Frequently Asked Questions</>, row)}</li>
              <li>{link('about', <><Info className="w-3.5 h-3.5 text-indigo-500" /> About Us</>, row)}</li>
              <li>{link('contact', <><Mail className="w-3.5 h-3.5 text-pink-500" /> Contact Us</>, row)}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Legal &amp; Privacy</h3>
            <ul className="space-y-1 lg:pointer-fine:space-y-2.5 text-xs">
              <li>{link('privacy', <><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Privacy Policy</>, row)}</li>
              <li>{link('terms', <><Scale className="w-3.5 h-3.5 text-sky-500" /> Terms &amp; Conditions</>, row)}</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} QR Generato. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {link('about', 'About', small)}
            {link('privacy', 'Privacy', small)}
            {link('terms', 'Terms', small)}
            {link('contact', 'Contact', small)}
            {link('faq', 'FAQ', small)}
          </div>
        </div>
      </div>
    </footer>
  );
}
