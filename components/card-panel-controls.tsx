// components/card-panel-controls.tsx — "Name panel" controls in the Cards panel: keep the card's own
// panel (the box behind the name and QR), remove it, or replace it with a custom one you can reshape,
// recolour, resize and move (also by dragging it on the preview).
'use client';

import React from 'react';
import clsx from 'clsx';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_CARD_PANEL, type CardPanelShape, type CardPanelStyle } from '@/lib/qr-cards';

interface Props {
  isDark: boolean;
  value: CardPanelStyle;
  onChange: (v: CardPanelStyle) => void;
  /** False for designs without a panel of their own (Retro, Art Posters): "Card design" = no panel */
  hasDesignPanel: boolean;
  accent?: string;
  segClass: string;
}

const SHAPES: { id: CardPanelShape; label: string }[] = [
  { id: 'square', label: 'Square' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'pill', label: 'Pill' },
  { id: 'cut', label: 'Cut corners' },
];

const SPOTS: { label: string; patch: Partial<CardPanelStyle> }[] = [
  { label: 'Bottom', patch: { cx: 0.5, cy: 0.835, w: 0.89, h: 0.27 } },
  { label: 'Top', patch: { cx: 0.5, cy: 0.16, w: 0.89, h: 0.22 } },
  { label: 'Middle', patch: { cx: 0.5, cy: 0.5, w: 0.89, h: 0.25 } },
  { label: 'Bottom strip', patch: { cx: 0.5, cy: 0.93, w: 1, h: 0.13 } },
  { label: 'Left half', patch: { cx: 0.31, cy: 0.83, w: 0.56, h: 0.26 } },
];

export default function CardPanelControls({ isDark, value, onChange, hasDesignPanel, accent, segClass }: Props) {
  const set = (patch: Partial<CardPanelStyle>) => onChange({ ...value, ...patch });
  const label = clsx('text-[10px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500');
  const seg = (active: boolean) =>
    clsx(
      'px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap',
      active ? 'bg-indigo-600 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
    );
  const swatch = (c: string, current: string, pick: (c: string) => void, title: string) => (
    <button
      key={c || 'none'}
      type="button"
      aria-label={title}
      title={title}
      onClick={() => pick(c)}
      className={clsx(
        'w-6 h-6 rounded-full border-2 cursor-pointer',
        current.toLowerCase() === c.toLowerCase() ? 'border-indigo-500 ring-2 ring-indigo-500/40' : isDark ? 'border-zinc-600' : 'border-slate-300'
      )}
      style={c ? { background: c } : { background: 'repeating-linear-gradient(45deg,#e4e4e7 0 3px,#fff 3px 6px)' }}
    />
  );
  const picker = (current: string, pick: (c: string) => void, title: string) => (
    <label className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-dashed cursor-pointer" title={title} style={{ borderColor: isDark ? '#52525b' : '#cbd5e1' }}>
      <input type="color" value={current || '#ffffff'} onChange={(e) => pick(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label={title} />
      <span className="block w-full h-full" style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
    </label>
  );
  const fills = Array.from(new Set(['#111116', '#fbf5e9', '#ffffff', '#000000', accent || '#7c3aed']));
  const borders = Array.from(new Set(['', '#ffffff', '#111111', accent || '#f59e0b', '#d4af37']));

  const modes: { id: CardPanelStyle['mode']; label: string }[] = hasDesignPanel
    ? [
        { id: 'design', label: 'Card design' },
        { id: 'none', label: 'Remove' },
        { id: 'custom', label: 'Custom' },
      ]
    : [
        { id: 'design', label: 'None' },
        { id: 'custom', label: 'Add custom' },
      ];

  return (
    <div className="space-y-2 pt-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className={label}>Name panel</span>
        <div className={clsx('inline-flex p-0.5 rounded-lg border', segClass)} role="radiogroup" aria-label="Name panel">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={value.mode === m.id || (!hasDesignPanel && m.id === 'design' && value.mode === 'none')}
              onClick={() => set(m.id === 'custom' && value.mode !== 'custom' && !value.border ? { mode: 'custom', border: accent || '#ffffff' } : { mode: m.id })}
              className={seg(value.mode === m.id || (!hasDesignPanel && m.id === 'design' && value.mode === 'none'))}
            >
              {m.label}
            </button>
          ))}
        </div>
        {value.mode === 'custom' && (
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_CARD_PANEL, mode: 'custom', border: accent || DEFAULT_CARD_PANEL.border })}
            className={clsx('inline-flex items-center gap-1 text-[10.5px] font-semibold underline cursor-pointer', isDark ? 'text-zinc-400' : 'text-slate-500')}
          >
            <RotateCcw className="w-3 h-3" /> Reset panel
          </button>
        )}
      </div>
      {value.mode === 'none' && hasDesignPanel && (
        <p className={clsx('text-[10.5px]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
          Panel removed. If the text is hard to read on the artwork, use Text layout → Custom with “Outline” or “Panel”.
        </p>
      )}

      {value.mode === 'custom' && (
        <div className={clsx('rounded-lg border p-2.5 space-y-2.5', segClass)}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={label}>Shape</span>
            <div className={clsx('inline-flex flex-wrap p-0.5 rounded-lg border', segClass)} role="radiogroup" aria-label="Panel shape">
              {SHAPES.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={value.shape === s.id} onClick={() => set({ shape: s.id })} className={seg(value.shape === s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={label}>Fill</span>
            <div className="flex items-center gap-1.5">
              {fills.map((c) => swatch(c, value.color, (v) => set({ color: v }), `Panel colour ${c}`))}
              {picker(value.color, (v) => set({ color: v }), 'Pick any panel colour')}
            </div>
            <span className={clsx(label, 'ml-1')}>Border</span>
            <div className="flex items-center gap-1.5">
              {borders.map((c) => swatch(c, value.border, (v) => set({ border: v }), c ? `Border ${c}` : 'No border'))}
              {picker(value.border, (v) => set({ border: v }), 'Pick any border colour')}
            </div>
            <button
              type="button"
              aria-pressed={value.double}
              disabled={!value.border}
              onClick={() => set({ double: !value.double })}
              className={clsx(
                'px-2 py-1 rounded-md border text-[11px] font-semibold cursor-pointer disabled:opacity-40',
                value.double ? (isDark ? 'border-indigo-500/60 bg-indigo-500/15 text-zinc-100' : 'border-indigo-400 bg-indigo-50 text-slate-900') : isDark ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-500'
              )}
            >
              Double line
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className={clsx(label, 'mr-0.5')}>Quick spot</span>
            {SPOTS.map((sp) => (
              <button
                key={sp.label}
                type="button"
                onClick={() => set(sp.patch)}
                className={clsx('px-2 py-1 rounded-md border text-[11px] font-semibold transition-colors cursor-pointer', isDark ? 'border-zinc-700 text-zinc-300 hover:border-indigo-500' : 'border-slate-300 text-slate-700 hover:border-indigo-500')}
              >
                {sp.label}
              </button>
            ))}
            <span className={clsx('text-[10.5px] ml-1', isDark ? 'text-zinc-500' : 'text-slate-500')}>or drag the panel on the preview</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-1.5">
            {(
              [
                ['cx', 'Left ↔ Right', 0, 1, 0.005],
                ['cy', 'Top ↕ Bottom', 0, 1, 0.005],
                ['w', 'Width', 0.2, 1, 0.01],
                ['h', 'Height', 0.06, 0.9, 0.01],
                ['opacity', `Opacity (${Math.round(value.opacity * 100)}%)`, 0.1, 1, 0.05],
              ] as const
            ).map(([k, l, min, max, step]) => (
              <label key={k} className="space-y-0.5">
                <span className={clsx('block', label)}>{l}</span>
                <input type="range" min={min} max={max} step={step} value={value[k]} onChange={(e) => set({ [k]: Number(e.target.value) })} className="w-full accent-indigo-600 cursor-pointer" />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
