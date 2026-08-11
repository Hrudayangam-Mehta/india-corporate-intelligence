import { useMemo, useState, useRef, useCallback, useId } from 'react';
import { STATES, VIEWBOX, labelMode, spiralWithin, type StateGeo } from '../../data/geo';
import type { StateCode } from '../../graph/schema';

/**
 * The India map.
 *
 * Cartographic engraving, not dashboard chrome: real 36-state geometry, hairline
 * internal borders, a heavier national edge, a plate mark, and a quantile-binned
 * choropleth. Indian state market cap is extremely heavy-tailed — Maharashtra
 * alone carries a large plurality — so a linear ramp renders thirty states
 * identical. Quantile is the default; log and linear are offered.
 *
 * Marks are positioned WITHIN a state on a golden-angle spiral, not geocoded.
 * The caption says so wherever they appear.
 */

export interface MapMark {
  id: string;
  label: string;
  state: StateCode;
  /** Drives mark radius. Typically market cap in ₹ crore. */
  weight?: number;
  kind?: 'company' | 'psu' | 'person' | 'ministry';
  exchanges?: ('NSE' | 'BSE')[];
  href?: string;
}

export interface MapDatum {
  value: number | null;
  label?: string;
  detail?: string;
}

export type ScaleMode = 'quantile' | 'log' | 'linear';

interface Props {
  /** state code → value. Absent or null means NO DATA — rendered as hatch, not zero. */
  data: Partial<Record<StateCode, MapDatum>>;
  marks?: MapMark[];
  metricLabel: string;
  unit?: string;
  scaleMode?: ScaleMode;
  selected?: StateCode | null;
  onSelect?: (s: StateCode | null) => void;
  /** Sequential ramp, light → dark. Perceptually ordered; never rainbow. */
  ramp?: string[];
  showMarks?: boolean;
  height?: number;
  format?: (v: number) => string;
}

/**
 * Sequential ramp, perceptually ordered low → high.
 *
 * The bottom step is deliberately well clear of the page background: a state in the
 * lowest bin must still read as a filled state, or "small" becomes visually
 * indistinguishable from "no data" — which are entirely different claims.
 */
const DEFAULT_RAMP = ['#2e373f', '#354e55', '#3d6668', '#487f7c', '#61988e', '#89b19f', '#b7cbb0'];

function quantileBins(values: number[], k: number): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const cuts: number[] = [];
  for (let i = 1; i < k; i++) cuts.push(sorted[Math.floor((i / k) * (sorted.length - 1))]);
  return cuts;
}

export default function IndiaMap({
  data,
  marks = [],
  metricLabel,
  unit = '',
  scaleMode = 'quantile',
  selected = null,
  onSelect,
  ramp = DEFAULT_RAMP,
  showMarks = true,
  height = 620,
  format,
}: Props) {
  const [hover, setHover] = useState<StateGeo | null>(null);
  const [hoverMark, setHoverMark] = useState<MapMark | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const [hasFocus, setHasFocus] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, '');

  const fmt = format ?? ((v: number) => (v >= 1e5 ? `${(v / 1e5).toFixed(2)} L` : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`));

  const present = useMemo(
    () => STATES.map((s) => data[s.id]?.value).filter((v): v is number => typeof v === 'number' && v > 0),
    [data],
  );

  const colorOf = useCallback(
    (v: number | null | undefined): string | null => {
      if (typeof v !== 'number' || !present.length) return null;
      if (scaleMode === 'quantile') {
        const cuts = quantileBins(present, ramp.length);
        let i = 0;
        while (i < cuts.length && v > cuts[i]) i++;
        return ramp[Math.min(i, ramp.length - 1)];
      }
      const max = Math.max(...present);
      const min = Math.min(...present);
      const t =
        scaleMode === 'log'
          ? (Math.log(Math.max(v, 1)) - Math.log(Math.max(min, 1))) / Math.max(1e-6, Math.log(max) - Math.log(Math.max(min, 1)))
          : (v - min) / Math.max(1e-6, max - min);
      return ramp[Math.min(ramp.length - 1, Math.max(0, Math.round(t * (ramp.length - 1))))];
    },
    [present, ramp, scaleMode],
  );

  // Marks grouped per state so the spiral index is stable.
  const marksByState = useMemo(() => {
    const m = new Map<StateCode, MapMark[]>();
    for (const mk of marks) {
      if (!m.has(mk.state)) m.set(mk.state, []);
      m.get(mk.state)!.push(mk);
    }
    for (const list of m.values()) list.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    return m;
  }, [marks]);

  /**
   * Outboard labels for states too small to hold one.
   *
   * Each label goes to the nearer gutter and sits as close to its own latitude as
   * collision allows — a leader that sweeps across the whole map is worse than no
   * label at all. Within a gutter, labels are stacked in latitude order and pushed
   * apart to a minimum spacing, so leaders stay short and roughly horizontal.
   */
  const leaders = useMemo(() => {
    const LEFT = 14;
    const RIGHT = 598;
    const MIN_GAP = 21;
    const place = (list: StateGeo[], gutterX: number, anchor: 'start' | 'end') => {
      const sorted = [...list].sort((a, b) => a.cy - b.cy);
      let prev = -Infinity;
      return sorted.map((s) => {
        const y = Math.max(s.cy, prev + MIN_GAP);
        prev = y;
        return { s, gutterY: Math.min(y, 688), gutterX, anchor };
      });
    };
    const all = STATES.filter((s) => labelMode(s) === 'leader');
    return [
      ...place(all.filter((s) => s.cx < 306), LEFT, 'start'),
      ...place(all.filter((s) => s.cx >= 306), RIGHT, 'end'),
    ];
  }, []);

  const shortName = (name: string) =>
    name
      .replace('Andaman and Nicobar Islands', 'Andaman & Nicobar')
      .replace('Dadra and Nagar Haveli', 'Dadra & N. Haveli')
      .replace('Daman and Diu', 'Daman & Diu');

  const ordered = useMemo(() => [...STATES].sort((a, b) => a.cy - b.cy), []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      setFocusIdx((i) => (i + 1) % ordered.length);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setFocusIdx((i) => (i - 1 + ordered.length) % ordered.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(ordered[focusIdx].id);
    } else if (e.key === 'Escape') {
      onSelect?.(null);
    }
  };

  const active = hover ?? (selected ? STATES.find((s) => s.id === selected) ?? null : null);
  const activeDatum = active ? data[active.id] : undefined;
  const noDataCount = STATES.filter((s) => typeof data[s.id]?.value !== 'number').length;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={VIEWBOX}
        style={{ height, width: '100%' }}
        role="img"
        aria-label={`Map of India shaded by ${metricLabel}. Use arrow keys to move between states, Enter to open one.`}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        className="outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-lg"
      >
        <defs>
          {/*
            No-data hatch. A hatched state means "not measured", never "zero", so it
            has to be unmistakable at a glance — wide spacing and a warm stroke, so it
            can never be confused with the dark end of the sequential ramp.
          */}
          <pattern id={`nodata-${uid}`} width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="7" height="7" fill="#101116" />
            <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(201,168,108,0.30)" strokeWidth="1.1" />
          </pattern>
          <radialGradient id={`sea-${uid}`} cx="50%" cy="42%" r="72%">
            <stop offset="0%" stopColor="rgba(90,142,196,0.06)" />
            <stop offset="100%" stopColor="rgba(90,142,196,0)" />
          </radialGradient>
        </defs>

        {/* ground + plate mark */}
        <rect x="0" y="0" width="612" height="696" fill={`url(#sea-${uid})`} />
        <rect
          x="8"
          y="8"
          width="596"
          height="680"
          fill="none"
          stroke="var(--color-border,rgba(244,240,232,0.08))"
          strokeWidth="0.75"
        />

        {/* state fills */}
        <g>
          {STATES.map((s) => {
            const d = data[s.id];
            const c = colorOf(d?.value);
            const isActive = active?.id === s.id;
            const isSelected = selected === s.id;
            return (
              <path
                key={s.id}
                d={s.path}
                fill={c ?? `url(#nodata-${uid})`}
                stroke={isSelected ? 'var(--color-accent,#c9a86c)' : 'rgba(10,10,12,0.85)'}
                strokeWidth={isSelected ? 1.6 : isActive ? 1.1 : 0.5}
                strokeLinejoin="round"
                opacity={active && !isActive ? 0.72 : 1}
                style={{ cursor: 'pointer', transition: 'opacity .18s ease, stroke-width .18s ease' }}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect?.(selected === s.id ? null : s.id)}
              />
            );
          })}
        </g>

        {/* coastline pass — a warm hairline over every boundary, which reads as an
            engraved edge and separates the landmass from the ground */}
        <g pointerEvents="none">
          {STATES.map((s) => (
            <path key={`o-${s.id}`} d={s.path} fill="none" stroke="rgba(201,168,108,0.22)" strokeWidth="0.4" strokeLinejoin="round" />
          ))}
        </g>

        {/* entity marks */}
        {showMarks && (
          <g>
            {[...marksByState.entries()].map(([code, list]) => {
              const s = STATES.find((x) => x.id === code);
              if (!s) return null;
              const shown = list.slice(0, 14);
              return shown.map((mk, i) => {
                const { x, y } = spiralWithin(s, i, Math.max(shown.length, 2));
                const w = mk.weight ?? 0;
                const r = Math.max(1.6, Math.min(5.4, 1.6 + Math.sqrt(w) / 190));
                const isPsu = mk.kind === 'psu';
                return (
                  <circle
                    key={mk.id}
                    cx={x}
                    cy={y}
                    r={hoverMark?.id === mk.id ? r + 1.6 : r}
                    fill={isPsu ? 'rgba(90,142,196,0.85)' : 'rgba(201,168,108,0.9)'}
                    stroke="rgba(10,10,12,0.9)"
                    strokeWidth="0.5"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoverMark(mk)}
                    onMouseLeave={() => setHoverMark(null)}
                  >
                    <title>{`${mk.label} — ${s.name}`}</title>
                  </circle>
                );
              });
            })}
          </g>
        )}

        {/* labels */}
        <g pointerEvents="none" fontFamily="var(--font-sans, Inter, system-ui)">
          {STATES.map((s) => {
            const mode = labelMode(s);
            if (mode === 'leader') return null;
            const text = mode === 'full' ? shortName(s.name) : s.id.toUpperCase();
            const size = mode === 'full' ? Math.min(11, Math.max(7.5, s.clearance / 3.4)) : 7;
            return (
              <text
                key={`l-${s.id}`}
                x={s.cx}
                y={s.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size}
                fontWeight={mode === 'full' ? 500 : 600}
                letterSpacing={mode === 'code' ? '0.06em' : '0.01em'}
                fill="rgba(240,236,228,0.82)"
                stroke="rgba(10,10,12,0.55)"
                strokeWidth="2"
                paintOrder="stroke"
              >
                {text}
              </text>
            );
          })}

          {/* outboard labels with elbowed leader lines */}
          {leaders.map(({ s, gutterY, gutterX, anchor }) => {
            // Elbow: leave the state horizontally, then run flat into the gutter.
            const textW = shortName(s.name).length * 4.1;
            const stop = anchor === 'end' ? gutterX - textW - 5 : gutterX + textW + 5;
            const elbow = anchor === 'end' ? Math.max(s.cx + 8, stop - 16) : Math.min(s.cx - 8, stop + 16);
            return (
              <g key={`lead-${s.id}`}>
                <path
                  d={`M ${s.cx} ${s.cy} L ${elbow} ${gutterY} L ${stop} ${gutterY}`}
                  stroke="rgba(201,168,108,0.30)"
                  strokeWidth="0.45"
                  fill="none"
                />
                <circle cx={s.cx} cy={s.cy} r="1.3" fill="rgba(201,168,108,0.75)" />
                <text
                  x={gutterX}
                  y={gutterY}
                  textAnchor={anchor}
                  dominantBaseline="central"
                  fontSize="7.8"
                  fill="rgba(240,236,228,0.7)"
                  stroke="rgba(10,10,12,0.6)"
                  strokeWidth="1.8"
                  paintOrder="stroke"
                >
                  {shortName(s.name)}
                </text>
              </g>
            );
          })}
        </g>

        {/* keyboard focus ring — only while the map actually has focus */}
        {hasFocus && ordered[focusIdx] && (
          <circle
            cx={ordered[focusIdx].cx}
            cy={ordered[focusIdx].cy}
            r={Math.max(6, ordered[focusIdx].clearance * 0.5)}
            fill="none"
            stroke="var(--color-accent,#c9a86c)"
            strokeWidth="1"
            strokeDasharray="3 2"
            pointerEvents="none"
            opacity="0.6"
          />
        )}
      </svg>

      {/* legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="uppercase tracking-wider">{metricLabel}</span>
          <span className="flex">
            {ramp.map((c) => (
              <span key={c} style={{ background: c }} className="inline-block w-5 h-2.5" />
            ))}
          </span>
          <span>
            low → high {unit && `(${unit})`}
          </span>
        </div>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-5 h-2.5 border border-border"
            style={{ background: 'repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(232,228,220,.18) 2px,rgba(232,228,220,.18) 3px)' }}
          />
          no data ({noDataCount} of 36) — not zero
        </span>
        {showMarks && marks.length > 0 && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'rgba(201,168,108,.9)' }} />
              listed company
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'rgba(90,142,196,.85)' }} />
              public-sector
            </span>
            <span className="italic">marks positioned within state — not geocoded</span>
          </>
        )}
        <span className="ml-auto">scale: {scaleMode}</span>
      </div>

      {/* readout */}
      {(active || hoverMark) && (
        <div className="pointer-events-none absolute top-3 left-3 max-w-[16rem] rounded-lg border border-border-light bg-bg-elevated/95 backdrop-blur px-3 py-2 shadow-lg">
          {hoverMark ? (
            <>
              <p className="text-sm font-medium leading-tight">{hoverMark.label}</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {hoverMark.exchanges?.join(' · ') ?? ''} {hoverMark.weight ? `· ₹${fmt(hoverMark.weight)} cr` : ''}
              </p>
            </>
          ) : active ? (
            <>
              <p className="text-sm font-medium leading-tight">{active.name}</p>
              <p className="text-[11px] text-text-muted mt-0.5">
                {typeof activeDatum?.value === 'number'
                  ? `${metricLabel}: ${fmt(activeDatum.value)} ${unit}`
                  : 'no data recorded'}
              </p>
              {activeDatum?.detail && <p className="text-[11px] text-text-secondary mt-1">{activeDatum.detail}</p>}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
