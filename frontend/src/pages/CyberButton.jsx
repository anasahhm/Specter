/**
 * CyberButton
 * Premium dark glass CTA button with:
 *  - Cryptic text scramble on idle (every ~8s) and on hover
 *  - Border scanning energy streak
 *  - Animated gradient glow on hover
 *  - Metallic depth
 * 
 * Props:
 *   label     {string}   – the real button text
 *   onClick   {fn}       – click handler
 *   icon      {ReactNode} – optional right icon
 *   variant   {'primary'|'secondary'} – style variant
 *   className {string}   – additional classes
 */
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

const GLITCH_CHARS = '!@#$%^&*_-+=<>?/\\|[]{}0123456789';
const LEET = { a:'4', e:'3', i:'1', o:'0', s:'5', t:'7', g:'9' };

function leetify(str) {
  return str.split('').map(c => {
    if (Math.random() < 0.5) return c;
    const low = c.toLowerCase();
    return LEET[low] ? (Math.random() > 0.5 ? LEET[low] : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]) : c;
  }).join('');
}

function scramble(str, progress) {
  // progress 0 = fully scrambled, 1 = original
  return str.split('').map((char, i) => {
    if (char === ' ') return ' ';
    if (Math.random() < progress) return char;
    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  }).join('');
}

function useScrambleText(label, active) {
  const [display, setDisplay] = useState(label);
  const frameRef = useRef(null);
  const progressRef = useRef(1);
  const dirRef = useRef('idle'); // 'scrambling' | 'resolving' | 'idle'

  const animate = useCallback(() => {
    if (dirRef.current === 'scrambling') {
      progressRef.current = Math.max(0, progressRef.current - 0.07);
      setDisplay(scramble(label, progressRef.current));
      if (progressRef.current > 0) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        dirRef.current = 'resolving';
        setTimeout(() => {
          dirRef.current = 'resolving';
          frameRef.current = requestAnimationFrame(animate);
        }, 200);
      }
    } else if (dirRef.current === 'resolving') {
      progressRef.current = Math.min(1, progressRef.current + 0.06);
      setDisplay(scramble(label, progressRef.current));
      if (progressRef.current < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(label);
        dirRef.current = 'idle';
      }
    }
  }, [label]);

  // Trigger scramble
  const triggerScramble = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    progressRef.current = 1;
    dirRef.current = 'scrambling';
    frameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // Hover: instant scramble then resolve
  useEffect(() => {
    if (active) {
      triggerScramble();
    } else {
      // Resolve immediately on unhover
      if (dirRef.current !== 'idle') {
        cancelAnimationFrame(frameRef.current);
        dirRef.current = 'resolving';
        progressRef.current = 0;
        frameRef.current = requestAnimationFrame(animate);
      }
    }
  }, [active, triggerScramble, animate]);

  // Idle scramble every 8–12s
  useEffect(() => {
    let timeout;
    function scheduleIdle() {
      timeout = setTimeout(() => {
        if (dirRef.current === 'idle') triggerScramble();
        scheduleIdle();
      }, 8000 + Math.random() * 4000);
    }
    scheduleIdle();
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameRef.current);
    };
  }, [triggerScramble]);

  // Sync label changes
  useEffect(() => {
    if (dirRef.current === 'idle') setDisplay(label);
  }, [label]);

  return display;
}

// Energy streak (border scanner)
const EnergyStreak = memo(({ active, color }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      overflow: 'hidden',
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '60%',
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        transform: active ? 'translateX(200%)' : 'translateX(-100%)',
        transition: active ? 'transform 0.6s ease' : 'none',
        opacity: active ? 0.9 : 0,
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '60%',
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        transform: active ? 'translateX(-200%)' : 'translateX(100%)',
        transition: active ? 'transform 0.6s ease 0.1s' : 'none',
        opacity: active ? 0.9 : 0,
      }}
    />
  </div>
));

export default memo(function CyberButton({
  label = 'Start Investigation',
  onClick,
  icon,
  variant = 'primary',
  className = '',
  style = {},
}) {
  const [hovered, setHovered] = useState(false);
  const displayText = useScrambleText(label, hovered);

  const isPrimary = variant === 'primary';

  const baseStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    borderRadius: '6px',
    border: isPrimary
      ? '1px solid rgba(255,42,42,0.5)'
      : '1px solid rgba(255,255,255,0.15)',
    background: isPrimary
      ? hovered
        ? 'linear-gradient(135deg, rgba(255,42,42,0.25), rgba(0,100,200,0.15))'
        : 'linear-gradient(135deg, rgba(255,42,42,0.15), rgba(0,80,160,0.1))'
      : hovered
        ? 'rgba(255,255,255,0.07)'
        : 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    color: '#fff',
    fontFamily: '"Orbitron", "Geist Mono", monospace',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: hovered
      ? isPrimary
        ? '0 0 24px rgba(255,42,42,0.3), 0 0 48px rgba(255,42,42,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
        : '0 0 12px rgba(0,170,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
      : 'inset 0 1px 0 rgba(255,255,255,0.05)',
    borderColor: hovered
      ? isPrimary ? 'rgba(255,42,42,0.8)' : 'rgba(255,255,255,0.3)'
      : isPrimary ? 'rgba(255,42,42,0.4)' : 'rgba(255,255,255,0.12)',
    ...style,
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={baseStyle}
      className={className}
    >
      {/* Corner brackets */}
      <span style={{ position: 'absolute', top: 3, left: 3, width: 8, height: 8,
        borderTop: `1px solid ${isPrimary ? 'rgba(255,42,42,0.7)' : 'rgba(0,170,255,0.5)'}`,
        borderLeft: `1px solid ${isPrimary ? 'rgba(255,42,42,0.7)' : 'rgba(0,170,255,0.5)'}`,
        pointerEvents: 'none',
        opacity: hovered ? 1 : 0.4,
        transition: 'opacity 0.3s',
      }} />
      <span style={{ position: 'absolute', bottom: 3, right: 3, width: 8, height: 8,
        borderBottom: `1px solid ${isPrimary ? 'rgba(255,42,42,0.7)' : 'rgba(0,170,255,0.5)'}`,
        borderRight: `1px solid ${isPrimary ? 'rgba(255,42,42,0.7)' : 'rgba(0,170,255,0.5)'}`,
        pointerEvents: 'none',
        opacity: hovered ? 1 : 0.4,
        transition: 'opacity 0.3s',
      }} />

      {/* Energy streak */}
      <EnergyStreak active={hovered} color={isPrimary ? '#ff2a2a' : '#00aaff'} />

      {/* Scrambling text */}
      <span style={{ fontFamily: 'inherit', letterSpacing: 'inherit', minWidth: '12ch', textAlign: 'center' }}>
        {displayText}
      </span>

      {/* Icon */}
      {icon && (
        <span style={{
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
          transition: 'transform 0.25s ease',
          display: 'flex',
          alignItems: 'center',
        }}>
          {icon}
        </span>
      )}
    </button>
  );
});