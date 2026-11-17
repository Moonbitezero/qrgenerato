import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import DynamicQrManager from '@/components/dynamic-qr-manager';

export const metadata: Metadata = pageMetadata(
  '/dynamic-qr',
  'Free Dynamic QR Code Generator – Edit Link & Track Scans | QR Generato',
  'Create a free dynamic QR code: change the destination after printing and see how many people scanned it. No sign-up needed.'
);

export default function DynamicQrRoute() {
  return (
    <div className="min-h-screen bg-[#09090f] text-zinc-100 flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <DynamicQrManager />
      </main>
      <SiteFooter />
    </div>
  );
}
