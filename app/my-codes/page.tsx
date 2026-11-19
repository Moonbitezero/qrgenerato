import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import DynamicQrManager from '@/components/dynamic-qr-manager';
import FilesManager from '@/components/files-manager';

// Personal page: shows codes saved in the visitor's own browser, so keep it out of search results.
export const metadata: Metadata = {
  title: 'My QR Codes – Edit, Pause or Delete | QR Generato',
  description: 'Manage the dynamic QR codes and uploaded files you created on QR Generato.',
  alternates: { canonical: '/my-codes' },
  robots: { index: false, follow: true },
};

export default function MyCodesRoute() {
  return (
    <div className="min-h-screen bg-[#09090f] text-zinc-100 flex flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 pb-4 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">My QR Codes</h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Your dynamic QR codes and uploaded files. Change where a code goes, replace a file, pause it, see scans, or delete it.
            They’re saved in <strong className="text-zinc-200">this browser</strong>. To manage a code on another phone or computer,
            open its <strong className="text-zinc-200">edit link</strong> there (“Copy edit link” on each code).
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="inline-flex items-center rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-4 py-2.5 text-xs font-bold text-white">
              Create a new QR code
            </Link>
            <Link href="/dynamic-qr" className="inline-flex items-center rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-100">
              New dynamic QR
            </Link>
          </div>
        </div>
        <DynamicQrManager alwaysShow />
        <FilesManager alwaysShow />
        <div className="max-w-7xl mx-auto px-4 pt-2">
          <p className="text-xs text-zinc-500 max-w-2xl">
            Deleting a code is permanent: anyone who scans it afterwards sees “not found”. Normal (non-dynamic) QR codes aren’t listed
            here because they aren’t stored anywhere; they keep working forever.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
