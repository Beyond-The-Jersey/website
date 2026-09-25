import type { TierId } from '@/lib/data/schema';
import { TIERS } from '@/lib/levels';

// Paths from the header logo in handover/design/source/Landing.dc.html.
const JERSEY =
  'M8.5 3 Q12 5.6 15.5 3 L19.6 4.3 L23 8.6 L20.3 11.4 L18.2 9.9 L18.2 21.4 Q12 22.3 5.8 21.4 L5.8 9.9 L3.7 11.4 L1 8.6 L4.4 4.3 Z';
const SPLAT =
  'M15.96 13.20 C16.15 13.50 16.21 13.77 16.51 14.23 C16.81 14.69 18.01 15.74 17.77 15.98 C17.53 16.21 15.71 15.71 15.07 15.65 C14.43 15.59 14.22 15.57 13.93 15.62 C13.63 15.66 13.51 15.78 13.31 15.92 C13.11 16.05 12.96 16.28 12.74 16.43 C12.52 16.59 12.27 16.73 12.00 16.85 C11.73 16.98 11.51 16.92 11.09 17.17 C10.68 17.42 9.78 18.51 9.51 18.37 C9.24 18.24 9.57 16.82 9.47 16.37 C9.38 15.91 9.12 15.87 8.95 15.63 C8.77 15.39 8.52 15.19 8.42 14.92 C8.33 14.66 8.38 14.32 8.37 14.03 C8.36 13.74 8.67 13.55 8.35 13.20 C8.04 12.85 6.41 12.19 6.49 11.94 C6.58 11.69 8.42 11.86 8.87 11.69 C9.31 11.53 9.08 11.23 9.18 10.95 C9.27 10.66 9.27 10.24 9.44 9.99 C9.61 9.74 9.90 9.52 10.18 9.43 C10.47 9.33 10.83 9.42 11.14 9.41 C11.44 9.40 11.66 9.60 12.00 9.37 C12.34 9.13 12.92 7.93 13.19 8.00 C13.46 8.07 13.43 9.44 13.63 9.81 C13.83 10.18 13.90 10.24 14.39 10.20 C14.89 10.15 16.44 9.30 16.59 9.54 C16.73 9.78 15.46 11.15 15.26 11.63 C15.06 12.11 15.27 12.16 15.39 12.43 C15.51 12.69 15.78 12.90 15.96 13.20 Z';
const DRIP = 'M11.7 16.6 L11.8 19.8 A0.42 0.42 0 0 0 12.64 19.8 L12.6 16.4 Z';

/** The brand mark: jersey outline with a red splat and drip. */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={JERSEY} fill="none" stroke="var(--text)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d={SPLAT} fill="var(--splat)" />
      <path d={DRIP} fill="var(--splat)" />
      <circle cx="18.7" cy="7.3" r="0.6" fill="var(--splat)" />
      <circle cx="6.4" cy="17.9" r="0.5" fill="var(--splat)" />
    </svg>
  );
}

/** An empty shirt outline, for shirts we have no photo of yet. */
export function ShirtOutline({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={JERSEY} fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
    </svg>
  );
}

/** The sponsor-card mark: the splat is scaled by the sponsor's tier (hidden, with a dashed outline, when unrated). */
export function SponsorMark({ tier, size = 46 }: { tier: TierId; size?: number }) {
  const t = TIERS[tier];
  const scored = t.splat > 0;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d={JERSEY}
        fill="none"
        stroke={scored ? 'var(--text)' : 'var(--text-5)'}
        strokeWidth="1.1"
        strokeDasharray={t.dashed ? '1.6 1.4' : undefined}
        strokeLinejoin="round"
      />
      {scored && (
        <g transform={`translate(12 13.2) scale(${t.splat}) translate(-12 -13.2)`}>
          <path d={SPLAT} fill={t.splatColor} />
          <path d={DRIP} fill={t.splatColor} />
        </g>
      )}
    </svg>
  );
}

export function CodeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 7 L3 12 L8 17" />
      <path d="M16 7 L21 12 L16 17" />
      <path d="M13.5 4 L10.5 20" />
    </svg>
  );
}

export const ARROWS = {
  worse: 'M6 1 L11 8 L7.5 8 L7.5 11 L4.5 11 L4.5 8 L1 8 Z',
  better: 'M6 11 L11 4 L7.5 4 L7.5 1 L4.5 1 L4.5 4 L1 4 Z',
  renewed: 'M1 4.5 L8 4.5 L8 1.5 L11 6 L8 10.5 L8 7.5 L1 7.5 Z',
  dash: 'M2 5 L10 5 L10 7 L2 7 Z',
} as const;

export function Arrow({ d, color, size = 12 }: { d: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={d} fill={color} />
    </svg>
  );
}
