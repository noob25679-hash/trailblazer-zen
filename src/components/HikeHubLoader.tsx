import { CSSProperties } from 'react';

interface HikeHubLoaderProps {
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Animated overlapping triple-peak loader inspired by the HikeHub mark.
 * Three translucent peaks drift, fade, and a soft wave glides across them.
 */
export default function HikeHubLoader({ size = 140, label, className = '' }: HikeHubLoaderProps) {
  const style = { '--hh-size': `${size}px` } as CSSProperties;

  return (
    <div className={`hikehub-loader ${className}`} style={style} role="status" aria-label={label || 'Loading'}>
      <svg viewBox="0 0 240 170" width={size} height={size * 0.71} fill="none" aria-hidden="true">
        <g style={{ mixBlendMode: 'multiply' }}>
          {/* Soft sage left peak */}
          <path
            className="hh-peak hh-peak-1"
            d="M20 150 Q34 148 50 122 L82 60 Q90 48 98 60 L130 122 Q146 148 160 150 Z"
            fill="hsl(140 22% 55%)"
          />
          {/* Slate-blue right peak */}
          <path
            className="hh-peak hh-peak-2"
            d="M100 150 Q114 148 130 122 L162 62 Q170 50 178 62 L210 122 Q226 148 240 150 Z"
            fill="hsl(212 22% 42%)"
          />
          {/* Deep forest center peak (tallest) */}
          <path
            className="hh-peak hh-peak-3"
            d="M55 150 Q72 148 88 118 L120 40 Q128 28 136 40 L168 118 Q184 148 200 150 Z"
            fill="hsl(150 38% 26%)"
          />
        </g>
        {/* Drifting wave */}
        <path
          className="hh-wave"
          d="M30 110 Q80 86 120 108 T210 104"
          stroke="hsl(212 28% 48%)"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.55"
          fill="none"
        />
      </svg>
      {label && <div className="hh-label">{label}</div>}
    </div>
  );
}
