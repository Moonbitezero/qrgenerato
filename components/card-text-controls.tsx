// components/card-text-controls.tsx — "Text layout" controls in the Cards panel.
// Custom mode gives every line (Name, Title, Subtitle, Extra) its own position and style. "All lines"
// edits every line at once; picking a line edits just that one. Lines can also be dragged on the preview.
'use client';

import React from 'react';
import clsx from 'clsx';
import { AlignCenter, AlignLeft, AlignRight, Bold, CaseUpper, Eye, EyeOff, Italic, RotateCcw } from 'lucide-react';
import { CARD_LINE_KEYS, DEFAULT_CARD_TEXT, type CardLineKey, type CardTextFont, type CardTextLine, type CardTextStyle } from '@/lib/qr-cards';

export type CardTextSelection = 'all' | CardLineKey;

interface Props {
  isDark: boolean;
  mode: 'design' | 'custom';
  onMode: (m: 'design' | 'custom') => void;
  value: CardTextStyle;
  onChange: (v: CardTextStyle) => void;
  /** Which line the controls edit ('all' = every line). Dragging a line on the preview selects it. */
  selected: CardTextSelection;
  onSelect: (s: CardTextSelection) => void;
  subtitle: string;
  onSubtitle: (v: string) => void;
  /** The card's signature colour, offered as a swatch */
  accent?: string;
  inputClass: string;
  segClass: string;
}

const LINE_LABEL: Record<CardLineKey, string> = { name: 'Name', title: 'Title', subtitle: 'Subtitle', extra: 'Extra line' };

const FONTS: { id: CardTextFont; label: string; style: React.CSSProperties }[] = [
  { id: 'sans', label: 'Sans', style: { fontFamily: 'system-ui, sans-serif' } },
  { id: 'serif', label: 'Serif', style: { fontFamily: 'Georgia, serif' } },
  { id: 'bold', label: 'Bold', style: { fontFamily: "'Arial Black', Impact, sans-serif", fontWeight: 900 } },
  { id: 'mono', label: 'Mono', style: { fontFamily: 'ui-monospace, Consolas, monospace' } },
  { id: 'script', label: 'Script', style: { fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontStyle: 'italic' } },
];

/** Whole-group spots: where the block of visible lines goes (relative spacing is kept). */
const GROUP_SPOTS: { label: string; x: number; y: 'top' | 'middle' | 'bottom'; align: CardTextLine['align'] }[] = [
  { label: 'Top left', x: 0.08, y: 'top', align: 'left' },
  { label: 'Top centre', x: 0.5, y: 'top', align: 'center' },
  { label: 'Centre', x: 0.5, y: 'middle', align: 'center' },
  { label: 'Bottom left', x: 0.08, y: 'bottom', align: 'left' },
  { label: 'Bottom centre', x: 0.5, y: 'bottom', align: 'center' },
];

export default function CardTextControls(p: Props) {
  const { isDark, mode, value, selected } = p;
  const lines = value.lines;
  const label = clsx('text-[10px] font-semibold', isDark ? 'text-zinc-400' : 'text-slate-500');
  const seg = (active: boolean) =>
    clsx(
      'px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap',
      active ? 'bg-indigo-600 text-white' : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
    );
  const chip = (on: boolean) =>
    clsx(
      'inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold transition-colors cursor-pointer',
      on ? (isDark ? 'border-indigo-500/60 bg-indigo-500/15 text-zinc-100' : 'border-indigo-400 bg-indigo-50 text-slate-900') : isDark ? 'border-zinc-700 text-zinc-400' : 'border-slate-300 text-slate-500'
    );

  /** Lines the controls act on right now. */
  const targets: CardLineKey[] = selected === 'all' ? CARD_LINE_KEYS : [selected];
  /** Line whose values the controls display. */
  const shown = lines[selected === 'all' ? 'name' : selected];

  const patchLines = (patch: Partial<CardTextLine>) => {
    const next = { ...lines };
    for (const k of targets) next[k] = { ...next[k], ...patch };
    p.onChange({ ...value, lines: next });
  };

  const moveGroup = (spot: (typeof GROUP_SPOTS)[number]) => {
    const visible = CARD_LINE_KEYS.filter((k) => lines[k].show);
    const ys = (visible.length ? visible : CARD_LINE_KEYS).map((k) => lines[k].cy);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const shift = spot.y === 'top' ? 0.07 - top : spot.y === 'bottom' ? 0.93 - bottom : 0.5 - (top + bottom) / 2;
    const next = { ...lines };
    for (const k of CARD_LINE_KEYS) next[k] = { ...next[k], cx: spot.x, cy: Math.min(1, Math.max(0, next[k].cy + shift)), align: spot.align };
    p.onChange({ ...value, lines: next });
  };

  const swatches = Array.from(new Set(['#ffffff', '#111111', p.accent || '#f59e0b', '#fbbf24', '#f472b6', '#38bdf8'].map((c) => c.toLowerCase())));
  const resetLink = clsx('inline-flex items-center gap-1 text-[10.5px] font-semibold underline cursor-pointer', isDark ? 'text-zinc-400' : 'text-slate-500');

  return (
    <div className="space-y-2 pt-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className={label}>Text layout</span>
        <div className={clsx('inline-flex p-0.5 rounded-lg border', p.segClass)} role="radiogroup" aria-label="Text layout">
          <button type="button" role="radio" aria-checked={mode === 'design'} onClick={() => p.onMode('design')} className={seg(mode === 'design')}>
            Card design
          </button>
          <button type="button" role="radio" aria-checked={mode === 'custom'} onClick={() => p.onMode('custom')} className={seg(mode === 'custom')}>
            Custom
          </button>
        </div>
        {mode === 'custom' && (
          <button
            type="button"
            onClick={() => {
              p.onChange(DEFAULT_CARD_TEXT);
              p.onSelect('all');
            }}
            className={resetLink}
          >
            <RotateCcw className="w-3 h-3" /> Reset all text
          </button>
        )}
      </div>

      {mode === 'custom' && (
        <div className={clsx('rounded-lg border p-2.5 space-y-2.5', p.segClass)}>
          <label className="block space-y-1">
            <span className={label}>Subtitle (optional 4th line)</span>
            <input type="text" value={p.subtitle} maxLength={40} onChange={(e) => p.onSubtitle(e.target.value)} placeholder="e.g. Since 2015 · Mumbai" className={p.inputClass} />
          </label>

          {/* Show / hide each line: a hidden line keeps its own position and style for when it comes back */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={clsx(label, 'mr-0.5')}>Show</span>
            {CARD_LINE_KEYS.map((k) => {
              const on = lines[k].show;
              return (
                <button key={k} type="button" aria-pressed={on} onClick={() => p.onChange({ ...value, lines: { ...lines, [k]: { ...lines[k], show: !on } } })} className={chip(on)}>
                  {on ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} {LINE_LABEL[k]}
                </button>
              );
            })}
          </div>

          {/* What the controls below edit */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={label}>Edit</span>
            <div className={clsx('inline-flex flex-wrap p-0.5 rounded-lg border', p.segClass)} role="radiogroup" aria-label="Line to edit">
              {(['all', ...CARD_LINE_KEYS] as CardTextSelection[]).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={selected === k} onClick={() => p.onSelect(k)} className={seg(selected === k)}>
                  {k === 'all' ? 'All lines' : LINE_LABEL[k]}
                </button>
              ))}
            </div>
            {selected !== 'all' && (
              <button
                type="button"
                onClick={() => p.onChange({ ...value, lines: { ...lines, [selected]: { ...DEFAULT_CARD_TEXT.lines[selected], show: lines[selected].show } } })}
                className={resetLink}
              >
                <RotateCcw className="w-3 h-3" /> Reset {LINE_LABEL[selected].toLowerCase()}
              </button>
            )}
          </div>
          <p className={clsx('text-[10.5px] -mt-1', isDark ? 'text-zinc-500' : 'text-slate-500')}>
            {selected === 'all'
              ? 'Changes apply to every line. Drag any line on the preview to move just that line.'
              : `Changes apply to the ${LINE_LABEL[selected].toLowerCase()} only. You can also drag it on the preview.`}
          </p>

          {/* Position */}
          {selected === 'all' ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={clsx(label, 'mr-0.5')}>Move all to</span>
              {GROUP_SPOTS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => moveGroup(s)}
                  className={clsx('px-2 py-1 rounded-md border text-[11px] font-semibold transition-colors cursor-pointer', isDark ? 'border-zinc-700 text-zinc-300 hover:border-indigo-500' : 'border-slate-300 text-slate-700 hover:border-indigo-500')}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
              {(
                [
                  ['cx', 'Left ↔ Right'],
                  ['cy', 'Top ↕ Bottom'],
                ] as const
              ).map(([k, l]) => (
                <label key={k} className="space-y-0.5">
                  <span className={clsx('block', label)}>{l}</span>
                  <input type="range" min={0} max={1} step={0.005} value={shown[k]} onChange={(e) => patchLines({ [k]: Number(e.target.value) })} className="w-full accent-indigo-600 cursor-pointer" />
                </label>
              ))}
            </div>
          )}

          {/* Size + spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
            <label className="space-y-0.5">
              <span className={clsx('block', label)}>Text size ({Math.round(shown.size * 100)}%)</span>
              <input type="range" min={0.5} max={2.5} step={0.05} value={shown.size} onChange={(e) => patchLines({ size: Number(e.target.value) })} className="w-full accent-indigo-600 cursor-pointer" />
            </label>
            <label className="space-y-0.5">
              <span className={clsx('block', label)}>Letter spacing ({shown.spacing.toFixed(1)})</span>
              <input type="range" min={0} max={6} step={0.2} value={shown.spacing} onChange={(e) => patchLines({ spacing: Number(e.target.value) })} className="w-full accent-indigo-600 cursor-pointer" />
            </label>
          </div>

          {/* Style */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={label}>Style</span>
            <button type="button" aria-pressed={shown.bold} title="Bold" aria-label="Bold" onClick={() => patchLines({ bold: !shown.bold })} className={chip(shown.bold)}>
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button type="button" aria-pressed={shown.italic} title="Italic" aria-label="Italic" onClick={() => patchLines({ italic: !shown.italic })} className={chip(shown.italic)}>
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button type="button" aria-pressed={shown.upper} title="ALL CAPS" aria-label="All caps" onClick={() => patchLines({ upper: !shown.upper })} className={chip(shown.upper)}>
              <CaseUpper className="w-3.5 h-3.5" />
            </button>
            <span className={clsx(label, 'ml-1')}>Align</span>
            <div className={clsx('inline-flex p-0.5 rounded-lg border', p.segClass)} role="radiogroup" aria-label="Text alignment">
              {(
                [
                  ['left', AlignLeft, 'Left'],
                  ['center', AlignCenter, 'Centre'],
                  ['right', AlignRight, 'Right'],
                ] as const
              ).map(([a, Icon, l]) => (
                <button key={a} type="button" role="radio" aria-checked={shown.align === a} aria-label={l} title={l} onClick={() => patchLines({ align: a })} className={seg(shown.align === a)}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={label}>Font</span>
            <div className={clsx('inline-flex flex-wrap p-0.5 rounded-lg border', p.segClass)} role="radiogroup" aria-label="Font">
              {FONTS.map((f) => (
                <button key={f.id} type="button" role="radio" aria-checked={shown.font === f.id} onClick={() => patchLines({ font: f.id })} className={seg(shown.font === f.id)} style={f.style}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={label}>Colour</span>
            <div className="flex items-center gap-1.5">
              {swatches.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Text colour ${c}`}
                  onClick={() => patchLines({ color: c })}
                  className={clsx('w-6 h-6 rounded-full border-2 cursor-pointer', shown.color.toLowerCase() === c ? 'border-indigo-500 ring-2 ring-indigo-500/40' : isDark ? 'border-zinc-600' : 'border-slate-300')}
                  style={{ background: c }}
                />
              ))}
              <label className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-dashed cursor-pointer" title="Pick any colour" style={{ borderColor: isDark ? '#52525b' : '#cbd5e1' }}>
                <input type="color" value={shown.color} onChange={(e) => patchLines({ color: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Pick any text colour" />
                <span className="block w-full h-full" style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }} />
              </label>
            </div>
            <span className={clsx(label, 'ml-1')}>Backing (all lines)</span>
            <div className={clsx('inline-flex p-0.5 rounded-lg border', p.segClass)} role="radiogroup" aria-label="Text backing">
              {(
                [
                  ['none', 'None'],
                  ['shadow', 'Outline'],
                  ['panel', 'Panel'],
                ] as const
              ).map(([b, l]) => (
                <button key={b} type="button" role="radio" aria-checked={value.bg === b} onClick={() => p.onChange({ ...value, bg: b })} className={seg(value.bg === b)}>
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
