// app/contact/page.tsx
import React from 'react';
import { Mail, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 py-12 px-4 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-8 shadow-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-4">
            <MessageSquare className="w-3.5 h-3.5" /> Support & Feedback
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Contact Us</h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Have a feature request, bug report, or business inquiry? Reach out to our team directly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
              <Mail className="w-5 h-5 text-indigo-500 mb-2" />
              <h2 className="text-sm font-semibold">Email Support</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">support@qrgenerato.com</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800">
              <Clock className="w-5 h-5 text-emerald-500 mb-2" />
              <h2 className="text-sm font-semibold">Response Time</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Usually within 24 hours</p>
            </div>
          </div>

          <form className="space-y-4 mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Your Name</label>
                <input
                  type="text"
                  placeholder="Sameer"
                  className="w-full rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1.5">Message</label>
              <textarea
                rows={4}
                placeholder="How can we help?"
                className="w-full rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}