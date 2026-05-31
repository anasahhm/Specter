/**
 * AlertFlash
 * Rare, subtle security-alert pulses at random intervals (8–15s).
 * Never distracts – very low opacity, brief duration.
 * Pointer-events: none.
 */
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';

const ALERTS = [
  { label: 'THREAT DETECTED', color: '#ff2a2a' },
  { label: 'SCANNING...', color: '#00aaff' },
  { label: 'ANOMALY FOUND', color: '#ff9500' },
  { label: 'IOC MATCH', color: '#ff2a2a' },
];

function randomInterval() {
  return 8000 + Math.random() * 7000; // 8–15s
}

export default memo(function AlertFlash() {
  const [flash, setFlash] = useState(null); // { label, color }
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const triggerFlash = useCallback(() => {
    const alert = ALERTS[Math.floor(Math.random() * ALERTS.length)];
    setFlash(alert);
    setVisible(true);

    // Fade out after 900ms
    setTimeout(() => setVisible(false), 900);

    // Schedule next
    timerRef.current = setTimeout(triggerFlash, randomInterval());
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(triggerFlash, randomInterval());
    return () => clearTimeout(timerRef.current);
  }, [triggerFlash]);

  if (!flash) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Edge pulse ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `1px solid ${flash.color}`,
          opacity: visible ? 0.18 : 0,
          transition: visible
            ? 'opacity 0.05s ease'
            : 'opacity 0.85s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Center sweep line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${flash.color}, transparent)`,
          opacity: visible ? 0.25 : 0,
          transition: visible
            ? 'opacity 0.05s ease'
            : 'opacity 0.85s ease',
          top: '50%',
        }}
      />

      {/* Label badge */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          right: '12%',
          padding: '3px 10px',
          border: `1px solid ${flash.color}`,
          background: `rgba(${flash.color === '#ff2a2a' ? '255,42,42' : flash.color === '#00aaff' ? '0,170,255' : '255,149,0'}, 0.08)`,
          borderRadius: '3px',
          fontFamily: '"Geist Mono", monospace',
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: flash.color,
          fontWeight: 700,
          opacity: visible ? 0.85 : 0,
          transition: visible
            ? 'opacity 0.05s ease'
            : 'opacity 0.85s ease',
          whiteSpace: 'nowrap',
        }}
      >
        ■ {flash.label}
      </div>
    </div>
  );
});