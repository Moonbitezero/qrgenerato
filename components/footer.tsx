// components/footer.tsx
import Link from 'next/link';
import { QrCode } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#09090f] py-12 px-4 sm:px-8 mt-20">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold">
            <QrCode size={16} />
          </div>
          <span className="text-sm font-bold text-white">QR GENERATO</span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Generator</Link>
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
        </div>

        <p className="text-xs text-zinc-500">
          © {new Date().getFullYear()} QR GENERATO. All rights reserved.
        </p>
      </div>
    </footer>
  );
}