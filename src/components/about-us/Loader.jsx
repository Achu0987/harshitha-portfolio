'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const DURATION_MS = 4500;

/* ── Scan line over image ── */
function ScanLine({ go }) {
  return (
    <motion.div
      initial={{ top: '-2px', opacity: 0 }}
      animate={go ? { top: ['0%', '100%'], opacity: [0, 0.9, 0] } : {}}
      transition={{ duration: 1.8, delay: 0.4, ease: 'linear' }}
      style={{
        position: 'absolute', left: 0, right: 0, height: 2, zIndex: 5,
        background: 'linear-gradient(90deg, transparent, #a855f7 30%, #06b6d4 70%, transparent)',
        boxShadow: '0 0 20px #a855f7, 0 0 40px #06b6d4',
        pointerEvents: 'none',
      }}
    />
  );
}

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [go, setGo] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setGo(true), 150);
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min(((now - start) / DURATION_MS) * 100, 100);
      setProgress(p);
      if (p < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setExiting(true);
          setTimeout(onComplete, 1000);
        }, 350);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(t); };
  }, [onComplete]);

  return (
    <motion.div
      // Exit: smooth fade out to let the expanding website reveal beautifully from behind
      animate={exiting ? { opacity: 0 } : { opacity: 1 }}
      transition={exiting ? { duration: 0.9, ease: [0.76, 0, 0.24, 1] } : { duration: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#060606',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', userSelect: 'none',
        fontFamily: '"Inter","Helvetica Neue",Arial,sans-serif',
      }}
    >
      {/* ─── Top progress bar ─── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 1.5, background: 'rgba(255,255,255,0.06)',
      }}>
        <motion.div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #a855f7, #ffffff 50%, #06b6d4)',
          transformOrigin: 'left',
          scaleX: progress / 100,
        }} />
      </div>

      {/* ─── Portfolio label top-left ─── */}
      <div style={{ position: 'absolute', top: 30, left: 40, overflow: 'hidden' }}>
        <motion.p
          initial={{ y: '110%' }} animate={{ y: '0%' }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ margin: 0, fontSize: 9, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}
        >
          About Us
        </motion.p>
      </div>

      {/* ─── Live dot + 2025 top-right ─── */}
      <div style={{ position: 'absolute', top: 28, right: 40, display: 'flex', alignItems: 'center', gap: 8 }}>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.6, 1] }}
          transition={{ delay: 0.5, duration: 1.2 }}
          style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}
        />
        <div style={{ overflow: 'hidden' }}>
          <motion.p
            initial={{ y: '110%' }} animate={{ y: '0%' }}
            transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{ margin: 0, fontSize: 9, letterSpacing: '0.45em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}
          >
            2026
          </motion.p>
        </div>
      </div>

      {/* ══════════════════════════════
          CENTER CONTENT: IMAGE + TYPOGRAPHY
      ══════════════════════════════ */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
        position: 'relative',
        zIndex: 1,
        width: 'min(580px, 80vw)',
      }}>
        {/* Handshake Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={go ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', width: '100%' }}
        >
          {/* Ambient glow behind image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={go ? { opacity: 1 } : {}}
            transition={{ duration: 1.8, delay: 0.5 }}
            style={{
              position: 'absolute', inset: '-50px -70px',
              background: 'radial-gradient(ellipse at 50% 55%, rgba(168,85,247,0.32) 0%, rgba(6,182,212,0.18) 45%, transparent 68%)',
              filter: 'blur(36px)',
              zIndex: 0, pointerEvents: 'none',
            }}
          />

          {/* Scan line */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 3, pointerEvents: 'none' }}>
            <ScanLine go={go} />
          </div>

          {/* Edge vignette — kills white PNG background, blends to dark */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
            background: `
              radial-gradient(ellipse at 50% 50%, transparent 35%, #060606 100%),
              linear-gradient(to bottom, #060606 0%, transparent 12%, transparent 82%, #060606 100%),
              linear-gradient(to right, #060606 0%, transparent 12%, transparent 88%, #060606 100%)
            `,
          }} />

          {/* The image */}
          <motion.img
            src="/handshake.png"
            alt="Human and AI handshake"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={go ? { clipPath: 'inset(0% 0% 0% 0%)' } : {}}
            transition={{ duration: 1.0, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%', display: 'block', position: 'relative', zIndex: 1,
              mixBlendMode: 'luminosity',
              filter: 'contrast(1.1) brightness(0.9) saturate(1.6)',
            }}
          />

          {/* Human label bottom-left */}
          <motion.span
            initial={{ opacity: 0, x: -8 }} animate={go ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 1.1, duration: 0.45 }}
            style={{
              position: 'absolute', bottom: 20, left: 4, zIndex: 5,
              fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(251,191,36,0.8)', fontFamily: 'monospace',
              textShadow: '0 0 10px rgba(251,191,36,0.45)',
            }}
          >
            Human
          </motion.span>

          {/* AI label bottom-right */}
          <motion.span
            initial={{ opacity: 0, x: 8 }} animate={go ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 1.1, duration: 0.45 }}
            style={{
              position: 'absolute', bottom: 20, right: 4, zIndex: 5,
              fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(6,182,212,0.8)', fontFamily: 'monospace',
              textShadow: '0 0 10px rgba(6,182,212,0.45)',
            }}
          >
            AI
          </motion.span>
        </motion.div>

        {/* ─── TYPOGRAPHY: HARSHITHA GANESAN PORTFOLIO ─── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'center',
          marginTop: '8px',
        }}>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={go ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              margin: 0,
              fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#ffffff',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            HARSHITHA GANESAN
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={go ? { opacity: 0.4, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              margin: 0,
              fontSize: '9px',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: '#ffffff',
              fontFamily: 'monospace',
            }}
          >
            About Us ✦ 2026
          </motion.p>
        </div>
      </div>

      {/* ─── Progress counter bottom-right ─── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          position: 'absolute', bottom: 30, right: 40,
          fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.22)',
          fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace',
        }}
      >
        {String(Math.round(progress)).padStart(3, '0')}%
      </motion.div>

      {/* ─── "Loading" bottom-left ─── */}
      <div style={{ position: 'absolute', bottom: 30, left: 40, overflow: 'hidden' }}>
        <motion.p
          initial={{ y: '110%' }} animate={{ y: '0%' }}
          transition={{ duration: 0.55, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ margin: 0, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.16)', textTransform: 'uppercase' }}
        >
          Loading experience
        </motion.p>
      </div>
    </motion.div>
  );
}
