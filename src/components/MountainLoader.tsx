import { CSSProperties } from 'react';

interface MountainLoaderProps {
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Animated triple-peak mountain logo used as a loading indicator.
 * Three overlapping peaks fade & drift in sequence, evoking the brand mark.
 */
export default function MountainLoader({ size = 120, label, className = '' }: MountainLoaderProps) {
  const style = { '--ml-size': `${size}px` } as CSSProperties;

  return (
    <div className={`mountain-loader ${className}`} style={style} role="status" aria-label={label || 'Loading'}>
      <svg viewBox="0 0 200 140" width={size} height={size * 0.7} fill="none" aria-hidden="true">
        {/* Back-left soft green peak */}
        <path
          className="ml-peak ml-peak-1"
          d="M20 120 Q30 118 40 100 L65 50 Q70 42 75 50 L100 100 Q110 118 120 120 Z"
          fill="hsl(142 30% 55%)"
        />
        {/* Right slate-blue peak */}
        <path
          className="ml-peak ml-peak-2"
          d="M90 120 Q100 118 110 100 L135 55 Q140 47 145 55 L170 100 Q180 118 190 120 Z"
          fill="hsl(215 25% 40%)"
        />
        {/* Front center deep-green peak (tallest) */}
        <path
          className="ml-peak ml-peak-3"
          d="M50 120 Q62 118 72 96 L100 35 Q105 26 110 35 L138 96 Q148 118 160 120 Z"
          fill="hsl(142 60% 28%)"
        />
        {/* Soft drifting wave across the peaks */}
        <path
          className="ml-wave"
          d="M30 90 Q70 70 100 88 T170 86"
          stroke="hsl(215 30% 50%)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.55"
          fill="none"
        />
      </svg>
      {label && <div className="ml-label">{label}</div>}
    </div>
  );
}
