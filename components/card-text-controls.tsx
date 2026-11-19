// components/card-text-controls.tsx — "Text layout" controls in the Cards panel: keep the card's own text,
// or switch to custom text you can move, resize, align, restyle and show/hide line by line.
'use client';

import React from 'react';
import clsx from 'clsx';
import { AlignCenter, AlignLeft, AlignRight, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { DEFAULT_CARD_TEXT, type CardTextFont, type CardTextStyle } from '@/lib/qr-cards';

interface Props {
  isDark: boolean;
  mode: 'design' | 'custom';
  onMode: (m: 'design' | 'custom') => void;
  value: CardTextStyle;
  onChange: (v: CardTextStyle) => void;
  subtitle: string;
  onSubtitle: (v: string) => void;
  /** The card's signature colour, offered as a swatch */
  accent?: string;
  inputClass: string;
  segClass: string;
}

const SPOTS: { label: string; cx: number; cy: number; align: CardTextStyle['align'] }[] = [
  { label: 'Top left', cx: 0, cy: 0.06, align: 'left' },
  { label: 'Top centre', cx: 0.5, cy: 0.06, align: 'center' },
  { label: 'Centre', cx: 0.5, cy: 0.5, align: 'center' },
  { label: 'Bottom left', cx: 0, cy: 0.92, align: 'left' },
  { label: 'Bottom centre', cx: 0.5, cy: 0.92, align: 'center' },
];

const FONTS: { id: CardTextFont; label: string; style: React.CSSProperties }[] = [
  { id: 'sans', label: 'Sans', style: { fontFamily: 'system-ui, sans-serif' } },
  { id: 'serif', label: 'Serif', style: { fontFamily: 'Georgia, serif' } },
  { id: 'bold', label: 'Bold', style: { fontFamily: "'Arial Black', Impact, sans-serif", fontWeight: 900 } },
  { id: 'mono', label: 'Mono', style: { fontFamily: 'ui-monospace, Consolas, monospace' } },
  { id: 'script', label: 'Script', style: { fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontStyle: 'italic' } },
];

export default function CardTextControls({ isDark, mode, onMode, value, onChange, subtitle, onSubtitle, accent, inputClass, segClass }: Props) {
  const set = (patch: Partial<CardTextStyle>) => onChange({ ...value, ...patch });
  const label = clsx('text-[10px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500');
  const seg = (active: boolean) =>
    clsx(
      'px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap',
      active ? 'bg-indigo-600 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
    );
  const swatches = Array.from(new Set(['#ffffff', '#111111', accent || '#f59e0b', '#fbbf24', '#f472b6', '#38bdf8'].map((c) => c.toLowerCase())));

  return (
    <div className="space-y-2 pt-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className={label}>Text layout</span>
        <div className={clsx('inline-flex p-0.5 rounded-lg border', segClass)} role="radiogroup" aria-label="Text layout">
          <button type="button" role="radio" aria-checked={mode === 'design'} onClick={() => onMode('design')} className={seg(mode === 'design')}>
            Card design
          </button>
          <button type="button" role="radio" aria-checked={mode === 'custom'} onClick={() => onMode('custom')} className={seg(mode === 'custom')}>
            Custom
          </button>
        </div>
        {mode === 'custom' && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_CARD_TEXT)}
            className={clsx('inline-flex items-center gap-1 text-[10.5px] font-semibold underline cursor-pointer', isDark ? 'text-zinc-400' : 'text-slate-500')}
          >
            <RotateCcw className="w-3 h-3" /> Reset text
          </button>
        )}
      </div>

      {mode === 'custom' && (
        <div className={clsx('rounded-lg border p-2.5 space-y-2.5', segClass)}>
          {/* 4th line + per-line visibility */}
          <label className="block space-y-1">
            <span className={label}>Subtitle (optional 4th line)</span>
            <input type="text" value={subtitle} maxLength={40} onChange={(e) => onSubtitle(e.target.value)} placeholder="e.g. Since 2015 · Mumbai" className={inputClass} />
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={clsx(label, 'mr-0.5')}>Show</span>
            {(
              [
                ['name', 'Name'],
                ['title', 'Title'],
                ['subtitle', 'Subtitle'],
                ['extra', 'Extra line'],
              ] as const
            ).map(([k, l]) => {
              const on = value.show[k];
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ show: { ...value.show, [k]: !on } })}
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold transition-colors cursor-pointer',
                    on ? (isDark ? 'border-indigo-500/60 bg-indigo-500/15 text-zinc-100' : 'border-indigo-400 bg-indigo-50 text-slate-900') : isDark ? 'border-zinc-700 text-zinc-500' : 'border-slate-300 text-slate-400'
                  )}
                >
                  {on ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} {l}
                </button>
              );
            })}
          </div>

          {/* Position */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={clsx(label, 'mr-0.5')}>Quick spot</span>
            {SPOTS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => set({ cx: p.cx, cy: p.cy, align: p.align })}
                className={clsx('px-2 py-1 rounded-md border text-[11px] font-semibold transition-colors cursor-pointer', isDark ? 'border-zinc-700 text-zinc-300 hover:border-indigo-500' : 'border-slate-300 text-slate-700 hover:border-indigo-500')}
              >
                {p.label}
              </button>
            ))}
            <span className={clsx('text-[10.5px] ml-1', isDark ? 'text-zinc-500' : 'text-slate-500')}>or drag the text on the preview</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1.5">
            {(
              [
                { key: 'cx', label: 'Left ↔ Right', min: 0, max: 1, step: 0.005 },
                { key: 'cy', label: 'Top ↕ Bottom', min: 0, max: 1, step: 0.005 },
                { key: 'scale', label: `Text size (${Math.round(value.scale * 100)}%)`, min: 0.6, max: 1.8, step: 0.05 },
              ] as const
            ).map((sl) => (
              <label key={sl.key} className="space-y-0.5">
                <span className={clsx('block', label)}>{sl.label}</span>
                <input
                  type="range"
                  min={sl.min}
                  max={sl.max}
                  step={sl.step}
                  value={value[sl.key]}
                  onChange={(e) => set({ [sl.key]: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </label>
            ))}
          </div>

          {/* Alignment + font */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={label}>Align</span>
            <div className={clsx('inline-flex p-0.5 rounded-lg border', segClass)} role="radiogroup" aria-label="Text alignment">
              {(
                [
                  ['left', AlignLeft, 'Left'],
                  ['center', AlignCenter, 'Centre'],
                  ['right', AlignRight, 'Right'],
                ] as const
              ).map(([a, Icon, l]) => (
                <button key={a} type="button" role="radio" aria-checked={value.align === a} aria-label={l} title={l} onClick={() => set({ align: a })} className={seg(value.align === a)}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
            <span className={clsx(label, 'ml-1')}>Font</span>
            <div className={clsx('inline-flex flex-wrap p-0.5 rounded-lg border', segClass)} role="radiogroup" aria-label="Font">
              {FONTS.map((f) => (
                <button key={f.id} type="button" role="radio" aria-checked={value.font === f.id} onClick={() => set({ font: f.id })} className={seg(value.font === f.id)} style={f.style}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colour + backing */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={label}>Colour</span>
            <div className="flex items-center gap-1.5">
              {swatches.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Text colour ${c}`}
                  onClick={() => set({ color: c })}
                  className={clsx('w-6 h-6 rounded-full border-2 cursor-pointer', value.color.toLowerCase() === c ? 'border-indigo-500 ring-2 ring-indigo-500/40' : isDark ? 'border-zinc-600' : 'border-slate-300')}
                  style={{ background: c }}
                />
              ))}
              <label className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-dashed cursor-pointer" title="Pick any colour" style={{ borderColor: isDark ? '#52525b' : '#cbd5e1' }}>
                <input type="color" value={value.color} onChange={(e) => set({ color: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Pick any text colour" />
                <span className="block w-full h-full" style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
              </label>
            </div>
            <span className={clsx(label, 'ml-1')}>Backing</span>
            <div className={clsx('inline-flex p-0.5 rounded-lg border', segClass)} role="radiogroup" aria-label="Text backing">
              {(
                [
                  ['none', 'None'],
                  ['shadow', 'Outline'],
                  ['panel', 'Panel'],
                ] as const
              ).map(([b, l]) => (
                <button key={b} type="button" role="radio" aria-checked={value.bg === b} onClick={() => set({ bg: b })} className={seg(value.bg === b)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <p className={clsx('text-[10.5px]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
            Tip: keep text clear of the QR code so it stays easy to scan. Use “Outline” or “Panel” on busy artwork.
          </p>
        </div>
      )}
    </div>
  );
}
