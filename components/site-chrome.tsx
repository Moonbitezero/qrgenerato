// components/site-chrome.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  QrCode,
  ShieldCheck,
  Zap,
  Menu,
  X,
  IndianRupee,
  Sparkles,
  Mail,
  FileText,
  Info,
  Scale,
} from 'lucide-react';
import clsx from 'clsx';

const NAV_LINKS = [
  { href: '/', label: 'QR Generator' },
  { href: '/about', label: 'About Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/contact-us', label: 'Contact Us' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-white/[0.08] bg-[#09090f]/85 backdrop-blur-2xl sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-3.5 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-500 p-[1px] rounded-xl sm:rounded-2xl shadow-lg shadow-fuchsia-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#09090f] rounded-[11px] sm:rounded-[15px] flex items-center justify-center text-white">
              <QrCode size={18} className="text-fuchsia-400 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-transparent truncate">
                QR Code Studio
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-md bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
              Free Online QR Code Generator With Logo &amp; UPI
            </p>
          </div>
        </Link>

        {/* Desktop MPA Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden xl:flex items-center gap-1 bg-[#12121c] border border-white/[0.08] p-1 rounded-xl"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Trust Badges & Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-300">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span>No Sign Up • Free Forever</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="xl:hidden p-2 rounded-xl bg-white/[0.06] border border-white/10 text-zinc-200 hover:text-white"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="xl:hidden border-t border-white/[0.08] bg-[#0d0d15] px-4 py-3 space-y-1.5"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'block px-4 py-2.5 rounded-xl text-xs font-bold transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                    : 'text-zinc-300 hover:bg-white/[0.05]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#09090f]/95 mt-20 pb-28 lg:pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white">
                <QrCode size={17} />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                QR Code Studio
              </span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The best free QR code generator online with no sign up and no expiration. Create
              custom QR codes with logo, UPI payments, multi-stop gradients, and image-filled pixel
              artwork 100% client-side.
            </p>
          </div>

          {/* Column 2: Popular QR Generators (Internal SEO Anchor Links) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">
              QR Code Generators
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles size={12} className="text-fuchsia-400" /> Free QR Code Generator Online
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <IndianRupee size={12} className="text-emerald-400" /> UPI QR Code Generator
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-400" /> QR Code Generator With Logo
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <QrCode size={12} className="text-cyan-400" /> Link &amp; Email to QR Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & MPA Pages */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300">
              Company &amp; Support
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Info size={12} className="text-violet-400" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Mail size={12} className="text-pink-400" /> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/#faq-heading" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FileText size={12} className="text-amber-400" /> Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Legal &amp; Privacy
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-400" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Scale size={12} className="text-cyan-400" /> Terms &amp; Conditions
                </Link>
              </li>
            </ul>
            <p className="text-[11px] text-zinc-500 pt-1">
              100% browser-based execution. Zero server uploads or tracking cookies.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} QR Code Studio. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/about" className="hover:text-zinc-300">About</Link>
            <Link href="/privacy-policy" className="hover:text-zinc-300">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-zinc-300">Terms</Link>
            <Link href="/contact-us" className="hover:text-zinc-300">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}