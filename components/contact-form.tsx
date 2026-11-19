// components/contact-form.tsx — Contact page form. Messages are emailed to the site owner by the
// dynamic QR server (POST q.qrgenerato.com/api/contact, see qr-generato-mobile/dynamic-server/src/contact.ts).
'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { DYNAMIC_SERVER } from '@/lib/dynamic-client';
import { getTurnstileToken } from '@/lib/turnstile';

const SUPPORT_EMAIL = 'support@qrgenerato.com';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

export default function ContactForm({ isDark = true }: { isDark?: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Support');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot, hidden from people
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === 'sending') return;
    setStatus({ kind: 'sending' });
    try {
      const turnstileToken = await getTurnstileToken(); // invisible bot check
      const res = await fetch(`${DYNAMIC_SERVER}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, website, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `Could not send (error ${res.status}).`);
      setStatus({ kind: 'sent' });
    } catch (err) {
      const offline = err instanceof TypeError;
      setStatus({
        kind: 'error',
        message: offline ? 'Could not reach our server. Check your internet connection.' : (err as Error).message,
      });
    }
  };

  const field = clsx(
    'w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30',
    isDark ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
  );
  const label = clsx('block text-xs font-semibold mb-1.5', isDark ? 'text-zinc-300' : 'text-slate-700');
  const muted = isDark ? 'text-zinc-400' : 'text-slate-600';

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[${subject}] from ${name || 'website visitor'}`)}&body=${encodeURIComponent(message)}`;

  if (status.kind === 'sent') {
    return (
      <div role="status" className="max-w-3xl p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-500">
          <CheckCircle2 className="w-5 h-5" /> Message sent. Thank you, {name.split(' ')[0] || 'friend'}!
        </p>
        <p className={clsx('text-xs', muted)}>
          We’ll reply to <strong>{email}</strong>, usually within 1–2 days. Check your spam folder if you don’t see it.
        </p>
        <button
          type="button"
          onClick={() => {
            setMessage('');
            setStatus({ kind: 'idle' });
          }}
          className={clsx('text-xs font-semibold underline', muted)}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl" noValidate={false}>
      <div>
        <label htmlFor="contact-name" className={label}>Your name</label>
        <input id="contact-name" type="text" required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor="contact-email" className={label}>Your email (for our reply)</label>
        <input id="contact-email" type="email" required maxLength={200} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="contact-topic" className={label}>Topic</label>
        <select id="contact-topic" value={subject} onChange={(e) => setSubject(e.target.value)} className={field}>
          <option value="General Support">General support</option>
          <option value="Bug Report">Bug report / scanning problem</option>
          <option value="Feature Request">Feature request / custom artwork</option>
          <option value="Dynamic QR">Dynamic QR codes</option>
          <option value="Business Inquiry">Business inquiry</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="contact-message" className={label}>Message</label>
        <textarea
          id="contact-message"
          rows={5}
          required
          minLength={10}
          maxLength={5000}
          placeholder="How can we help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={field}
        />
      </div>

      {/* Honeypot: invisible to people and screen readers, bots tend to fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="sm:col-span-2 space-y-2">
        <button
          type="submit"
          disabled={status.kind === 'sending'}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70 cursor-pointer"
        >
          {status.kind === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {status.kind === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        {status.kind === 'error' && (
          <p role="alert" className="text-xs font-semibold text-rose-500">
            {status.message}{' '}
            <a href={mailto} className="underline">
              Email us instead
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
