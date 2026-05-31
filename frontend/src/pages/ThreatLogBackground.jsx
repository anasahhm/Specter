import React, { useMemo, useEffect, useRef } from 'react';

const LOG_ENTRIES = [
  '[WIRE] URL scan initiated',
  '[DNS] Enumerating records',
  '[SSL] Certificate verification',
  '[AI] Credential harvesting pattern detected',
  '[THREAT] Risk Score: 87',
  '[OSINT] Reputation lookup complete',
  '[ML] Brand impersonation confidence: 94%',
  '[ALERT] Suspicious redirect chain',
  '[WIRE] Screenshot captured',
  '[IOC] Newly registered domain',
  '[DNS] MX record anomaly',
  '[SSL] Certificate expired 3 days ago',
  '[AI] Phishing template match: 0.91',
  '[WIRE] JS fingerprinting detected',
  '[THREAT] TLD risk: HIGH',
  '[ML] Form harvesting probability: 78%',
  '[IOC] IP reputation: MALICIOUS',
  '[OSINT] Domain age: 4 days',
  '[WIRE] Redirect chain depth: 6',
  '[AI] Urgency language pattern detected',
  '[THREAT] Risk Score: 43',
  '[DNS] A record → suspicious CDN',
  '[SSL] Self-signed certificate',
  '[ML] Typosquat distance: 1',
];


function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function ThreatLogBackground() {
  const containerRef = useRef(null);

  // Generate stable lane configs once
  const lanes = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const topPct   = 4 + seededRand(i * 3)     * 92;   
      const duration = 22 + seededRand(i * 7)    * 28;   
      const delay    = -seededRand(i * 13)       * 40;   
      const opacity  = 0.07 + seededRand(i * 17) * 0.05; 
      const fontSize = 10 + seededRand(i * 5)   * 2;    
      // Pick 3-4 entries per lane, cycling
      const entryCount = 3 + Math.floor(seededRand(i * 11) * 2);
      const entries = Array.from({ length: entryCount }, (_, j) =>
        LOG_ENTRIES[(i * 3 + j * 5) % LOG_ENTRIES.length]
      );
      return { topPct, duration, delay, opacity, fontSize, entries };
    });
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        userSelect: 'none',
      }}
    >
      {lanes.map((lane, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${lane.topPct}%`,
            left: 0,
            whiteSpace: 'nowrap',
            display: 'flex',
            gap: '6rem',
            willChange: 'transform',
            animation: `threatLaneScroll ${lane.duration}s linear ${lane.delay}s infinite`,
            opacity: lane.opacity,
            fontSize: `${lane.fontSize}px`,
            fontFamily: '"Geist Mono", "Courier New", monospace',
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: i % 3 === 0 ? '#ff2a2a' : i % 3 === 1 ? '#00aaff' : '#a0b4c8',
          }}
        >
          
          {[...lane.entries, ...lane.entries, ...lane.entries].map((entry, j) => (
            <span key={j}>{entry}</span>
          ))}
        </div>
      ))}

      <style>{`
        @keyframes threatLaneScroll {
          from { transform: translate3d(100vw, 0, 0); }
          to   { transform: translate3d(-300%, 0, 0); }
        }
      `}</style>
    </div>
  );
}