/**
 * ScanLines
 * Subtle horizontal scanner sweeps and data pulse lines.
 * Very low opacity, blend into background.
 * Pointer-events: none.
 */
import React, { memo } from 'react';

export default memo(function ScanLines() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      {/* Main horizontal scanner */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,170,255,0.12) 20%, rgba(0,170,255,0.25) 50%, rgba(0,170,255,0.12) 80%, transparent 100%)',
        animation: 'scanSweep 12s linear infinite',
        willChange: 'transform',
      }} />

      {/* Secondary slower scanner */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,42,42,0.08) 30%, rgba(255,42,42,0.15) 50%, rgba(255,42,42,0.08) 70%, transparent 100%)',
        animation: 'scanSweep 19s linear 4s infinite',
        willChange: 'transform',
      }} />

      {/* Data pulse lines – static horizontal rules at subtle opacity */}
      {[15, 35, 55, 72, 88].map((pct, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${pct}%`,
          left: 0,
          right: 0,
          height: '1px',
          background: 'rgba(255,255,255,0.025)',
        }} />
      ))}

      <style>{`
        @keyframes scanSweep {
          0%   { top: -2px; }
          100% { top: calc(100% + 2px); }
        }
      `}</style>
    </div>
  );
});