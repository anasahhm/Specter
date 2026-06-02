import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';


const panelBase = {
  position: 'absolute',
  zIndex: 8,
  pointerEvents: 'none',
  background: 'rgba(8, 11, 16, 0.75)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '6px',
  fontFamily: '"Geist Mono", "Courier New", monospace',
};

const panelHeaderStyle = {
  fontSize: '8.5px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontFamily: '"Geist Mono", monospace',
  borderBottom: '1px solid rgba(0,170,255,0.12)',
  paddingBottom: '0.5rem',
  marginBottom: '0.5rem',
};

const labelStyle = {
  fontSize: '9px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(160,180,200,0.55)',
  marginBottom: '2px',
  fontFamily: '"Geist Mono", monospace',
};

const valueStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#e2e8f0',
  fontFamily: '"Geist Mono", monospace',
};

const divider = {
  height: '1px',
  background: 'rgba(255,255,255,0.05)',
  margin: '0.55rem 0',
};

const LINE_POOL = [
  { text: '> init_scan_engine v4.2.1',             color: '#00aaff' },
  { text: 'LOAD  /proc/net/tcp6  → 0x4f2a',        color: '#a0c4ff' },
  { text: 'DNS   query A paypal-secure-auth.com',   color: '#ff6b6b' },
  { text: '0x7ffd9a3c  48 89 e5 48 83 ec 10',       color: '#4ade80' },
  { text: 'SSL   CERT  fingerprint mismatch ✗',     color: '#ff2a2a' },
  { text: 'WIRE  scrape_depth=3  links=47',         color: '#00aaff' },
  { text: 'ML    phish_score=0.913  threshold=0.7', color: '#facc15' },
  { text: '> fork(0x2f) → child PID 14892',         color: '#a0c4ff' },
  { text: 'IOC   ip=185.220.101.47  MATCH',         color: '#ff2a2a' },
  { text: '0x0000  ff d8 ff e0 00 10 4a 46',        color: '#4ade80' },
  { text: 'OSINT reputation_score=-82',             color: '#ff6b6b' },
  { text: 'REDIRECT chain: 6 hops detected',        color: '#ff9500' },
  { text: 'SYN   →  185.220.101.47:443',            color: '#00aaff' },
  { text: 'HASH  md5=3d4f8c1a9b2e7055af10c3d2',     color: '#4ade80' },
  { text: 'ENV   SPECTER_KEY=ask_0199*****762',      color: '#a0c4ff' },
  { text: 'AI    brand_impersonation=0.941',        color: '#facc15' },
  { text: '> exec("/bin/analyse", NULL)',            color: '#00aaff' },
  { text: 'TLS   version=1.0  DEPRECATED',          color: '#ff9500' },
  { text: 'WHOIS registrar=NameCheap  age=3d',      color: '#ff6b6b' },
  { text: '0x1a2b  c3 d4 e5 f6 07 18 29 3a',        color: '#4ade80' },
  { text: 'THREAT score=87/100  lvl=CRITICAL',      color: '#ff2a2a' },
  { text: 'NET   bytes_recv=14,882  tx=2,041',      color: '#a0c4ff' },
  { text: '> map_memory(0xdeadbeef, 4096)',          color: '#00aaff' },
  { text: 'JS    obfuscation_layers=4 detected',    color: '#facc15' },
  { text: 'FORM  input[type=password] harvested',   color: '#ff2a2a' },
  { text: 'WIRE  screenshot → /tmp/sc_4f2a.png',   color: '#a0c4ff' },
  { text: '0x3c00  7f 45 4c 46 02 01 01 00',        color: '#4ade80' },
  { text: 'CNAME paypal-secure-auth → 46.x.x.x',   color: '#ff6b6b' },
  { text: 'SCAN  port 443 open  port 22 filtered',  color: '#00aaff' },
  { text: 'DB    write investigation_id=6a1c22',    color: '#a0c4ff' },
  { text: '> signal(SIGTERM, handler_0x4fbc)',      color: '#4ade80' },
  { text: 'MX    record anomaly — spoofed domain',  color: '#ff9500' },
];


function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


const VISIBLE_LINES = 18;   
const INTERVAL_MS   = 520;  

const LiveTerminal = memo(() => {
  const [lines, setLines]     = useState(() => shuffled(LINE_POOL).slice(0, VISIBLE_LINES));
  const [typing, setTyping]   = useState('');   
  const [typingColor, setTypingColor] = useState('#00aaff');
  const poolRef               = useRef(shuffled(LINE_POOL));
  const idxRef                = useRef(0);
  const charIdxRef            = useRef(0);
  const pendingRef            = useRef(null);   
  const typingTimer           = useRef(null);
  const lineTimer             = useRef(null);


  const nextEntry = useCallback(() => {
    if (idxRef.current >= poolRef.current.length) {
      poolRef.current = shuffled(LINE_POOL);
      idxRef.current  = 0;
    }
    return poolRef.current[idxRef.current++];
  }, []);

  
  const typeChar = useCallback(() => {
    if (!pendingRef.current) return;
    const { text, color } = pendingRef.current;
    charIdxRef.current += 1;
    const partial = text.slice(0, charIdxRef.current);
    setTyping(partial);
    setTypingColor(color);

    if (charIdxRef.current < text.length) {
      
      const delay = 18 + Math.random() * 22;
      typingTimer.current = setTimeout(typeChar, delay);
    } else {
      
      setLines(prev => {
        const next = [...prev, { text, color }];
        return next.length > VISIBLE_LINES ? next.slice(next.length - VISIBLE_LINES) : next;
      });
      setTyping('');
      pendingRef.current  = null;
      charIdxRef.current  = 0;
    }
  }, []);

  
  useEffect(() => {
    const tick = () => {
      if (!pendingRef.current) {
        pendingRef.current = nextEntry();
        charIdxRef.current = 0;
        typeChar();
      }
      lineTimer.current = setTimeout(tick, INTERVAL_MS);
    };
    lineTimer.current = setTimeout(tick, 300);
    return () => {
      clearTimeout(lineTimer.current);
      clearTimeout(typingTimer.current);
    };
  }, [nextEntry, typeChar]);

  return (
    <div style={{
      ...panelBase,
      left: '2rem',
      top: '5.5rem',
      width: '264px',
      maxHeight: 'calc(100vh - 10rem)',
      overflow: 'hidden',
    }}
    className="analysis-panel-left"
    >
      
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #ff2a2a, transparent)',
        borderRadius: '6px 6px 0 0',
      }} />

      
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '0.65rem 0.85rem 0.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff2a2a', display: 'block', opacity: 0.9 }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff9500', display: 'block', opacity: 0.7 }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'block', opacity: 0.7 }} />
        <span style={{
          marginLeft: '6px',
          fontSize: '8px', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(0,170,255,0.6)',
          fontFamily: '"Geist Mono", monospace',
        }}>SPECTER // LIVE ANALYSIS</span>
      </div>

      
      <div style={{
        padding: '0.5rem 0.85rem 0.5rem',
        height: '220px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40px',
          background: 'linear-gradient(to bottom, rgba(8,11,16,0.95), transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '100%' }}>
          {lines.map((line, i) => (
            <div key={i} style={{
              fontSize: '10px',
              lineHeight: '1.7',
              color: line.color,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              opacity: 0.5 + (i / lines.length) * 0.5,   // older lines fade
              fontFamily: '"Geist Mono", monospace',
            }}>
              {line.text}
            </div>
          ))}

          
          {typing && (
            <div style={{
              fontSize: '10px',
              lineHeight: '1.7',
              color: typingColor,
              fontFamily: '"Geist Mono", monospace',
              whiteSpace: 'nowrap',
            }}>
              {typing}
              <span style={{
                display: 'inline-block',
                width: '6px', height: '11px',
                background: typingColor,
                marginLeft: '1px',
                verticalAlign: 'middle',
                animation: 'termCursor 0.7s step-end infinite',
              }} />
            </div>
          )}
        </div>
      </div>

      
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '0.35rem 0.85rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '8px', color: 'rgba(0,170,255,0.5)', letterSpacing: '0.1em', fontFamily: '"Geist Mono", monospace' }}>
          ● SCANNING
        </span>
        <span style={{ fontSize: '8px', color: 'rgba(255,42,42,0.6)', letterSpacing: '0.1em', fontFamily: '"Geist Mono", monospace' }}>
          RISK: CRITICAL
        </span>
      </div>

      
      <style>{`
        @keyframes termCursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
});


export default function AnalysisPanels() {
  return (
    <>
      <LiveTerminal />
      <style>{`
        @media (max-width: 900px) {
          .analysis-panel-left,
          .analysis-panel-right { display: none !important; }
        }
      `}</style>
    </>
  );
}
