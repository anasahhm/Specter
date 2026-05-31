import React, { memo } from 'react';

const RINGS = [
  { r: 148, stroke: 'rgba(255,42,42,0.35)',   strokeW: 1,   dur: 18,  rev: false, dash: '4 8' },
  { r: 162, stroke: 'rgba(0,170,255,0.18)',   strokeW: 0.5, dur: 30,  rev: true,  dash: '2 12' },
  { r: 178, stroke: 'rgba(255,42,42,0.12)',   strokeW: 1,   dur: 45,  rev: false, dash: '1 20' },
  { r: 194, stroke: 'rgba(0,170,255,0.25)',   strokeW: 0.5, dur: 22,  rev: true,  dash: '6 10' },
  { r: 212, stroke: 'rgba(255,255,255,0.06)', strokeW: 1,   dur: 60,  rev: false, dash: '3 15' },
  { r: 228, stroke: 'rgba(255,42,42,0.08)',   strokeW: 0.5, dur: 90,  rev: true,  dash: '2 30' },
];


const Ticks = memo(({ r, count, color }) => {
  const ticks = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI;
    const inner = r - 5;
    const outer = r + 2;
    return {
      x1: Math.cos(angle) * inner,
      y1: Math.sin(angle) * inner,
      x2: Math.cos(angle) * outer,
      y2: Math.sin(angle) * outer,
    };
  });
  return (
    <>
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1} y1={t.y1}
          x2={t.x2} y2={t.y2}
          stroke={color}
          strokeWidth="1"
        />
      ))}
    </>
  );
});


const SweepArm = memo(({ r, color, dur, delay = 0 }) => (
  <g style={{ animation: `hudSpin ${dur}s linear ${delay}s infinite`, transformOrigin: 'center' }}>
    <defs>
      <radialGradient id={`sweepGrad_${dur}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={color} stopOpacity="0.7" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    <path
      d={`M 0 0 L ${r} -20 A ${r} ${r} 0 0 1 ${r} 20 Z`}
      fill={`url(#sweepGrad_${dur})`}
      opacity="0.35"
    />
  </g>
));

export default memo(function HUDRings({ size = 480 }) {
  const cx = size / 2;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        pointerEvents: 'none',
        zIndex: 6,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        <g transform={`translate(${cx}, ${cx})`}>

          
          {RINGS.map((ring, i) => (
            <g
              key={i}
              style={{
                animation: `${ring.rev ? 'hudSpinRev' : 'hudSpin'} ${ring.dur}s linear infinite`,
                transformOrigin: 'center',
              }}
            >
              <circle
                r={ring.r}
                fill="none"
                stroke={ring.stroke}
                strokeWidth={ring.strokeW}
                strokeDasharray={ring.dash}
              />
              {i % 2 === 0 && (
                <Ticks r={ring.r} count={i === 0 ? 24 : 16} color={ring.stroke} />
              )}
            </g>
          ))}

          
          <SweepArm r={190} color="#ff2a2a" dur={8} />
          <SweepArm r={150} color="#00aaff" dur={14} delay={3} />

          {/* Cardinal crosshair lines — subtle, no reticle dots */}
          <line x1="-220" y1="0" x2="-148" y2="0" stroke="rgba(255,42,42,0.15)" strokeWidth="0.5" strokeDasharray="3 6" />
          <line x1="148" y1="0" x2="220" y2="0" stroke="rgba(255,42,42,0.15)" strokeWidth="0.5" strokeDasharray="3 6" />
          <line x1="0" y1="-220" x2="0" y2="-148" stroke="rgba(255,42,42,0.15)" strokeWidth="0.5" strokeDasharray="3 6" />
          <line x1="0" y1="148" x2="0" y2="220" stroke="rgba(255,42,42,0.15)" strokeWidth="0.5" strokeDasharray="3 6" />

        </g>
      </svg>

      <style>{`
        @keyframes hudSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes hudSpinRev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
});