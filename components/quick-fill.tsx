// components/quick-fill.tsx — one-tap ways to fill QR fields instead of typing:
// paste (auto-detects Wi-Fi, contacts, UPI, links…), copy from an existing QR image,
// pick a phone contact (Android), import a .vcf contact file (iPhone/Android "Share contact"),
// or use the current location.
'use client';

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ClipboardPaste, Contact, FileUp, Loader2, LocateFixed, ScanLine } from 'lucide-react';
import { contactPickerSupported, describe, detect, parseVCard, pickPhoneContact, type ContactFields, type Detected } from '@/lib/smart-import';
import { decodeQrFromFile } from '@/lib/qr-decode';

const CONTACT_TYPES = new Set(['vcard', 'phone', 'sms', 'whatsapp', 'email']);

function fromContact(c: ContactFields, qrType: string): Detected {
  switch (qrType) {
    case 'phone': return { type: 'phone', phone: c.phone };
    case 'sms': return { type: 'sms', phone: c.phone, body: '' };
    case 'whatsapp': return { type: 'whatsapp', phone: c.phone, message: '' };
    case 'email': return { type: 'email', to: c.email, subject: '', body: '' };
    default: return { type: 'vcard', ...c };
  }
}

interface Props {
  qrType: string;
  isDark: boolean;
  onApply: (d: Detected) => void;
}

export default function QuickFill({ qrType, isDark, onApply }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [canPickContact, setCanPickContact] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const vcfRef = useRef<HTMLInputElement>(null);

  // Feature checks run after hydration (the server can't know the device).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- device capability is only known on the client
    setCanPickContact(contactPickerSupported());
  }, []);

  const run = async (name: string, fn: () => Promise<string | null>) => {
    setBusy(name);
    setMsg(null);
    try {
      const done = await fn();
      if (done) setMsg({ ok: true, text: done });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'That didn’t work. Please try again.' });
    } finally {
      setBusy(null);
    }
  };

  const apply = (d: Detected, source: string) => {
    onApply(d);
    return `Filled from ${source}: ${describe(d)}.`;
  };

  const paste = () =>
    run('paste', async () => {
      if (!navigator.clipboard?.readText) throw new Error('Your browser can’t read the clipboard here. Long-press the field and choose Paste.');
      let text = '';
      try {
        text = await navigator.clipboard.readText();
      } catch {
        throw new Error('Clipboard access was blocked. Long-press the field and choose Paste.');
      }
      if (!text.trim()) throw new Error('The clipboard is empty. Copy a link, contact or Wi-Fi details first.');
      // In Plain Text mode, keep exactly what was copied.
      return apply(qrType === 'text' ? { type: 'text', text: text.trim() } : detect(text), 'clipboard');
    });

  const fromImage = (file: File) =>
    run('image', async () => {
      const text = await decodeQrFromFile(file);
      if (!text) throw new Error('No QR code found in that image. Try a sharper screenshot or crop closer to the code.');
      return apply(detect(text), 'QR image');
    });

  const fromVcf = (file: File) =>
    run('vcf', async () => {
      const cards = parseVCard(await file.text());
      if (!cards.length) throw new Error('That file has no contact in it. Choose a .vcf contact file.');
      return apply(fromContact(cards[0], qrType), 'contact file') + (cards.length > 1 ? ` (first of ${cards.length})` : '');
    });

  const fromPhone = () =>
    run('contact', async () => {
      const c = await pickPhoneContact();
      return c ? apply(fromContact(c, qrType), 'contacts') : null;
    });

  const fromLocation = () =>
    run('location', async () => {
      if (!navigator.geolocation) throw new Error('Location isn’t available in this browser.');
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 })
      ).catch(() => {
        throw new Error('Couldn’t get your location. Allow location access and try again.');
      });
      const q = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
      return apply({ type: 'maps', query: q }, 'your location');
    });

  const chip = clsx(
    'inline-flex items-center gap-1.5 shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-60',
    isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-indigo-500' : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-500'
  );
  const icon = (name: string, Icon: typeof ClipboardPaste) =>
    busy === name ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />;

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Quick fill">
        <span className={clsx('text-[10px] font-bold uppercase tracking-wider mr-0.5', isDark ? 'text-zinc-500' : 'text-slate-400')}>Quick fill</span>
        <button type="button" onClick={paste} disabled={!!busy} className={chip} title="Paste a link, Wi-Fi details, contact, UPI link…">
          {icon('paste', ClipboardPaste)} Paste
        </button>
        <button type="button" onClick={() => imageRef.current?.click()} disabled={!!busy} className={chip} title="Copy the content of an existing QR code from a photo or screenshot">
          {icon('image', ScanLine)} From QR image
        </button>
        {CONTACT_TYPES.has(qrType) && canPickContact && (
          <button type="button" onClick={fromPhone} disabled={!!busy} className={chip}>
            {icon('contact', Contact)} From contacts
          </button>
        )}
        {qrType === 'vcard' && (
          <button type="button" onClick={() => vcfRef.current?.click()} disabled={!!busy} className={chip} title="A .vcf file from Contacts → Share contact">
            {icon('vcf', FileUp)} Import contact file
          </button>
        )}
        {qrType === 'maps' && (
          <button type="button" onClick={fromLocation} disabled={!!busy} className={chip}>
            {icon('location', LocateFixed)} My location
          </button>
        )}
      </div>

      {qrType === 'wifi' && !msg && (
        <p className={clsx('text-[10.5px] leading-snug', isDark ? 'text-zinc-500' : 'text-slate-500')}>
          Tip: on Android, Settings → Wi-Fi → your network → Share shows a QR. Screenshot it and use “From QR image”.
        </p>
      )}
      {qrType === 'vcard' && !canPickContact && !msg && (
        <p className={clsx('text-[10.5px] leading-snug', isDark ? 'text-zinc-500' : 'text-slate-500')}>
          iPhone: Contacts → choose a contact → Share Contact → Save to Files, then “Import contact file”.
        </p>
      )}
      {msg && (
        <p role="status" className={clsx('text-[11px] font-semibold', msg.ok ? 'text-emerald-500' : 'text-rose-500')}>
          {msg.text}
        </p>
      )}

      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void fromImage(f);
        }}
      />
      <input
        ref={vcfRef}
        type="file"
        accept=".vcf,text/vcard,text/x-vcard"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void fromVcf(f);
        }}
      />
    </div>
  );
}
