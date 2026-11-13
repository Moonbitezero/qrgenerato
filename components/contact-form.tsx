// components/contact-form.tsx
'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feature Request');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClass =
    'w-full bg-[#0b0b12] border border-white/[0.1] hover:border-violet-500/40 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500 transition-all placeholder:text-zinc-500';

  if (submitted) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-3">
        <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
        <h3 className="text-lg font-extrabold text-white">Message Ready to Send!</h3>
        <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
          Thank you, <strong>{name || 'Creator'}</strong>. Click below to open your email client with
          your pre-filled message, or reach us directly at{' '}
          <span className="text-emerald-300 font-mono">support@qrcodestudio.app</span>.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <a
            href={`mailto:support@qrcodestudio.app?subject=${encodeURIComponent(
              `[${subject}] from ${name}`
            )}&body=${encodeURIComponent(message + `\n\nReply to: ${email}`)}`}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
          >
            Open in Email App
          </a>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="px-4 py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-zinc-200"
          >
            Edit Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-violet-300 mb-1.5">Your Name *</label>
          <input
            type="text"
            required
            placeholder="Yourname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-violet-300 mb-1.5">Email Address *</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-pink-300 mb-1.5">Inquiry Topic</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
        >
          <option value="Feature Request">Feature Request / Custom Artwork</option>
          <option value="Bug Report">Bug Report / Scanning Feedback</option>
          <option value="Business Partnership">Business &amp; API Inquiry</option>
          <option value="General Support">General Support</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-300 mb-1.5">Message *</label>
        <textarea
          required
          rows={5}
          placeholder="Tell us how we can help or what feature you'd love to see next..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/25 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send size={16} /> Send Message
      </button>
    </form>
  );
}
