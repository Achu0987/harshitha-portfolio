'use client';

import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import {
  Zap as ZapIcon,
  Layers as LayersIcon,
  Star as StarIcon,
  Activity as ActivityIcon,
  Package as PackageIcon,
  Wifi as WifiIcon,
  Home as HomeIcon,
  User as UserIcon,
  Cpu as CpuIcon,
  PenTool as PenToolIcon,
  MousePointer as MousePointerIcon,
  Terminal as TerminalIcon,
  FileCode as FileCodeIcon,
  CheckCircle2 as CheckCircleIcon,
  ArrowRight as ArrowRightIcon
} from 'lucide-react';

const SECTIONS = [
  {
    url: null,
    text: "Harshitha Ganesan\nWeb & Mobile Developer • UI/UX Designer • Tech Trainer",
  },
  {
    url: '/icon-set-one-v4-optimize.glb',
    text: "Web Development\nArchitecting fast, scalable, and responsive web applications.",
  },
  {
    url: '/icon-set-two-v3-optimize.glb',
    text: "Mobile App Development\nEngineering fluid, premium mobile apps for iOS and Android.",
  },
  {
    url: '/icon-set-three-v2-optimize.glb',
    text: "UI/UX Design\nCrafting intuitive interfaces where aesthetics meet seamless usability.",
  },
  {
    url: '/icon-set-four-v2-optimize.glb',
    text: "Tech Training & Mentorship\nEmpowering the next generation of developers with hands-on skills.",
  },
  {
    content: (
      <>Merging expert coding with AI-driven workflows.<br />I don't just use tools—I <span className="font-semibold text-[#ff8c00]">build solutions.</span></>
    ),
    isFinal: true
  },
  {
    content: (
      <>Ready to turn your vision into reality?<br />Let's build something extraordinary.</>
    ),
    isFinal: true,
    hasButton: true,
    buttonText: "Let's Connect"
  },
  {
    content: null, // Custom dashboard handled by InteractiveDashboardOverlay directly
    isFinal: true
  },
  {
    content: null, // Custom mobile mockup handled by InteractiveMobileOverlay directly
    isFinal: true
  },
  {
    content: null, // Custom Figma compiler handled by InteractiveHandoffOverlay directly
    isFinal: true
  },
  {
    content: null, // Custom Canva compiler handled by InteractiveCanvaOverlay directly
    isFinal: true
  },
  {
    content: null, // Custom Trainer handled by InteractiveTrainerOverlay directly
    isFinal: false
  },
  {
    content: null, // Custom Ending handled by InteractiveEndingOverlay directly
    isFinal: true
  }
];

function InteractiveDashboardOverlay({ progress }) {
  const heroSize = 0.05;
  const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
  const startRange = heroSize + 6 * remainingSize; // Section 7 (Index 7)
  const endRange = startRange + remainingSize;     // End of Section 7 (Index 7)
  const sectionSize = remainingSize;

  // Fade in at the start of section 7, and fade out when transitioning to section 8
  const opacity = useTransform(
    progress,
    [startRange - sectionSize * 0.3, startRange + sectionSize * 0.1, endRange - sectionSize * 0.15, endRange],
    [0, 1, 1, 0]
  );

  // Link laser scanner to scroll progress!
  const laserTop = useTransform(progress, [startRange, endRange - sectionSize * 0.25], ["0%", "100%"]);
  const laserOpacity = useTransform(
    progress,
    [startRange - sectionSize * 0.1, startRange, endRange - sectionSize * 0.25, endRange],
    [0, 0.9, 0.9, 0]
  );

  // Link terminal logs to scroll progress!
  const [activeLogs, setActiveLogs] = useState([]);

  const allLogs = useMemo(() => [
    "[09:12:45] AI Agent Initialized successfully.",
    "[09:12:46] Reading creative brief: 'Premium Cybernetic Portfolio'",
    "[09:12:48] Wireframing main container (Grid 12 cols, HSL palette)",
    "[09:12:50] Injecting glassmorphic CSS panels...",
    "[09:12:52] Applying neon borders #ff5f00 and #ff8c00...",
    "[09:12:54] Compiling interactive component nodes...",
    "[09:12:56] Performance audit: 100/100. Smooth 60fps.",
    "[09:12:58] Deploying layout to CDN node...",
    "[09:13:00] Design finalized. Ready for co-creation."
  ], []);

  // Sync logs based on scroll progress!
  useEffect(() => {
    return progress.on("change", (latest) => {
      if (latest < startRange) {
        setActiveLogs(allLogs.slice(0, 3));
        return;
      }
      if (latest > endRange) {
        setActiveLogs(allLogs);
        return;
      }
      const scrollFraction = Math.max(0, Math.min(1, (latest - startRange) / sectionSize));
      const logsCount = 3 + Math.floor(scrollFraction * (allLogs.length - 3));
      setActiveLogs(allLogs.slice(0, Math.min(allLogs.length, logsCount)));
    });
  }, [progress, startRange, sectionSize, allLogs]);

  // Stage 1: Physical entry path animations for each block
  const headerY = useTransform(progress, [startRange + sectionSize * 0.02, startRange + sectionSize * 0.22, startRange + sectionSize * 0.27], [-80, 5, 0]);
  const headerScale = useTransform(progress, [startRange + sectionSize * 0.02, startRange + sectionSize * 0.22, startRange + sectionSize * 0.27], [0.75, 1.03, 1]);
  const headerWireframeOpacity = useTransform(progress, [startRange + sectionSize * 0.01, startRange + sectionSize * 0.1, startRange + sectionSize * 0.5, startRange + sectionSize * 0.6], [0, 1, 1, 0]);
  const headerTagsOpacity = useTransform(progress, [startRange + sectionSize * 0.15, startRange + sectionSize * 0.22, startRange + sectionSize * 0.45, startRange + sectionSize * 0.55], [0, 1, 1, 0]);

  const heroX = useTransform(progress, [startRange + sectionSize * 0.2, startRange + sectionSize * 0.42, startRange + sectionSize * 0.47], [-150, 8, 0]);
  const heroScale = useTransform(progress, [startRange + sectionSize * 0.2, startRange + sectionSize * 0.42, startRange + sectionSize * 0.47], [0.75, 1.03, 1]);
  const heroWireframeOpacity = useTransform(progress, [startRange + sectionSize * 0.18, startRange + sectionSize * 0.27, startRange + sectionSize * 0.65, startRange + sectionSize * 0.75], [0, 1, 1, 0]);
  const heroTagsOpacity = useTransform(progress, [startRange + sectionSize * 0.35, startRange + sectionSize * 0.42, startRange + sectionSize * 0.6, startRange + sectionSize * 0.7], [0, 1, 1, 0]);

  const gridY = useTransform(progress, [startRange + sectionSize * 0.38, startRange + sectionSize * 0.6, startRange + sectionSize * 0.65], [120, -5, 0]);
  const gridScale = useTransform(progress, [startRange + sectionSize * 0.38, startRange + sectionSize * 0.6, startRange + sectionSize * 0.65], [0.75, 1.03, 1]);
  const gridWireframeOpacity = useTransform(progress, [startRange + sectionSize * 0.35, startRange + sectionSize * 0.45, startRange + sectionSize * 0.8, startRange + sectionSize * 0.9], [0, 1, 1, 0]);
  const gridTagsOpacity = useTransform(progress, [startRange + sectionSize * 0.52, startRange + sectionSize * 0.6, startRange + sectionSize * 0.75, startRange + sectionSize * 0.85], [0, 1, 1, 0]);

  // Stage 4: Rendered elements (rich style, interactive)
  // Slowly fade in as wireframes dissolve
  const headerRenderedOpacity = useTransform(progress, [startRange + sectionSize * 0.45, startRange + sectionSize * 0.65], [0, 1]);
  const heroRenderedOpacity = useTransform(progress, [startRange + sectionSize * 0.6, startRange + sectionSize * 0.8], [0, 1]);
  const gridRenderedOpacity = useTransform(progress, [startRange + sectionSize * 0.75, startRange + sectionSize * 0.95], [0, 1]);

  return (
    <motion.div
      style={{ opacity, pointerEvents: opacity.get() > 0.1 ? 'auto' : 'none' }}
      className="absolute inset-0 z-20 flex flex-col justify-center items-center px-6 md:px-24 py-16 overflow-hidden pointer-events-none"
    >
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 z-0"></div>

      {/* Title */}
      <div className="relative z-10 text-center mb-10 flex flex-col items-center max-w-3xl gap-3">
        <div className="px-4 py-1.5 border border-[#ff5f00]/40 rounded-full bg-[#ff5f00]/5 text-[#ff5f00] text-[11px] font-semibold tracking-[3px] uppercase animate-pulse">
          AI Design Agent // Active
        </div>
        <h2 className="text-[28px] md:text-[48px] font-light leading-[1.1] tracking-[-1px] text-white">
          Designing the Web, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f00] to-[#ff8c00]">Powered by AI.</span>
        </h2>
      </div>

      {/* Main dashboard container - INCREASED width and vertical spacing */}
      <div className="relative z-10 w-full max-w-6xl rounded-2xl border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-xl p-5 md:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row gap-5 items-stretch pointer-events-auto">

        {/* Left Side: Real-time Terminal Logs - flex-[0.8] to give Right Side (Website mockup) even more space! */}
        <div className="flex-[0.8] flex flex-col gap-4 bg-black/60 rounded-xl p-4 border border-white/5 font-mono text-[12px] min-h-[380px]">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5f00] animate-ping"></span>
              <span className="text-white/80 font-semibold tracking-[1px] text-[10px] uppercase">Agent Logs</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2 justify-end">
            {activeLogs.map((log, idx) => (
              <div key={idx} className={`leading-relaxed ${idx === activeLogs.length - 1 ? 'text-[#ff8c00]' : 'text-white/50'}`}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Visual Website Layout Mockup - wider flex-[1.9] and min-h-[380px] */}
        <div className="flex-[1.9] relative rounded-xl border border-white/5 bg-black/40 overflow-hidden min-h-[380px] flex flex-col">
          {/* Glowing laser sweeping line linked to scroll! */}
          <motion.div
            style={{ top: laserTop, opacity: laserOpacity }}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff5f00] to-transparent shadow-[0_0_15px_#ff5f00] z-10 pointer-events-none"
          />

          {/* Blueprint background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ff5f00_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] z-0"></div>

          {/* Browser header */}
          <div className="px-4 py-2 bg-black/80 border-b border-white/10 flex justify-between items-center z-10">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/10"></span>
              <span className="w-2 h-2 rounded-full bg-white/10"></span>
              <span className="w-2 h-2 rounded-full bg-white/10"></span>
            </div>
            <div className="px-8 py-0.5 bg-white/5 border border-[#ff5f00]/30 rounded-md text-[9px] text-[#ff8c00] tracking-[1px] font-semibold animate-pulse">
              https://ai-design-sandbox.v6
            </div>
            <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center text-[8px] text-white/40">i</div>
          </div>

          {/* Browser Mockup Content - Increased min-h-[380px] and vertical gaps */}
          <div className="flex-1 p-6 flex flex-col gap-6 relative z-10 min-h-[380px] justify-between">

            {/* Header bar area */}
            <div className="relative h-10 w-full">
              {/* Wireframe Header with HTML Tag and Blueprint Label */}
              <motion.div
                style={{ opacity: headerWireframeOpacity, y: headerY, scale: headerScale }}
                className="absolute inset-0 flex justify-between items-center border border-dashed border-[#ff5f00]/30 rounded px-3 bg-black/40"
              >
                <div className="flex items-center gap-2">
                  <motion.span style={{ opacity: headerTagsOpacity }} className="text-[7px] font-mono text-[#ff5f00]">&lt;header&gt;</motion.span>
                  <div className="w-16 h-3 bg-white/10 rounded border border-white/5"></div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-2.5 bg-white/5 rounded"></div>
                  <div className="w-8 h-2.5 bg-white/5 rounded"></div>
                  <div className="w-8 h-2.5 bg-white/5 rounded"></div>
                  <motion.span style={{ opacity: headerTagsOpacity }} className="text-[7px] font-mono text-cyan-400 font-bold ml-1">[nav: 3 items]</motion.span>
                </div>
              </motion.div>

              {/* Rendered Header */}
              <motion.div
                style={{ opacity: headerRenderedOpacity }}
                className="absolute inset-0 flex justify-between items-center pointer-events-none px-1"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#ff5f00] to-[#ff8c00] flex items-center justify-center text-[11px] font-bold text-white shadow-[0_0_8px_rgba(255,95,0,0.4)]">H</div>
                  <span className="text-[12px] font-bold tracking-[1.5px] text-white">H STUDIO</span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-[10px] font-medium text-white/60 hover:text-white transition-colors cursor-pointer pointer-events-auto">Work</span>
                  <span className="text-[10px] font-medium text-white/60 hover:text-white transition-colors cursor-pointer pointer-events-auto">Labs</span>
                  <span className="text-[10px] px-3.5 py-1 bg-gradient-to-r from-[#ff5f00] to-[#ff8c00] text-white font-semibold rounded-full shadow-[0_0_12px_rgba(255,95,0,0.3)] hover:shadow-[0_0_18px_rgba(255,95,0,0.6)] cursor-pointer pointer-events-auto">Launch</span>
                </div>
              </motion.div>
            </div>

            {/* Hero container area - Increased height to h-32 */}
            <div className="relative h-32 w-full mt-1">
              {/* Wireframe Hero with HTML Tags and Measurements */}
              <motion.div
                style={{ opacity: heroWireframeOpacity, x: heroX, scale: heroScale }}
                className="absolute inset-0 flex gap-4 items-center border border-dashed border-cyan-400/20 rounded p-3 bg-black/40"
              >
                <div className="flex-1 flex flex-col gap-2 relative">
                  <motion.span style={{ opacity: heroTagsOpacity }} className="absolute -top-4 left-0 text-[7px] font-mono text-[#ff5f00]">&lt;section.hero&gt;</motion.span>
                  <div className="w-[85%] h-7 bg-gradient-to-r from-white/15 to-white/5 rounded border border-white/10"></div>
                  <div className="w-[60%] h-4 bg-white/5 rounded-sm"></div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-18 h-6 bg-[#ff5f00]/20 border border-[#ff5f00] rounded-full"></div>
                    <motion.span style={{ opacity: heroTagsOpacity }} className="text-[7px] font-mono text-cyan-400">[button: cta]</motion.span>
                  </div>
                </div>
                <div className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2 p-1 relative">
                  <motion.span style={{ opacity: heroTagsOpacity }} className="absolute -top-4 right-0 text-[7px] font-mono text-cyan-400">96x96px</motion.span>
                  <div className="w-10 h-10 rounded-full border border-[#ff5f00]/30 border-dashed animate-spin"></div>
                  <span className="text-[6.5px] font-mono text-white/30">mesh</span>
                </div>
              </motion.div>

              {/* Rendered Hero */}
              <motion.div
                style={{ opacity: heroRenderedOpacity }}
                className="absolute inset-0 flex gap-4 items-center pointer-events-none"
              >
                <div className="flex-1 flex flex-col gap-2">
                  <div className="px-2 py-0.5 border border-[#ff8c00]/30 rounded bg-[#ff8c00]/5 text-[#ff8c00] text-[8px] font-bold tracking-[1.5px] uppercase w-fit">v2.4 Stable</div>
                  <h3 className="text-[19px] md:text-[25px] font-bold text-white leading-tight">
                    Hyper-dimensional <br />Web Architectures.
                  </h3>
                  <p className="text-[10px] text-white/50 leading-relaxed max-w-[280px]">Crafted at 60fps with raw WebGL performance and elegant responsive layouts.</p>
                </div>
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#ff5f00]/15 to-[#ff8c00]/5 border border-[#ff5f00]/25 flex items-center justify-center relative overflow-hidden shadow-[0_0_25px_rgba(255,95,0,0.15)]">
                  {/* Glowing rendered abstract gradient orb */}
                  <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-[#ff5f00] via-[#ff8c00] to-purple-600 opacity-90 blur-[1px] animate-pulse"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2),transparent_60%)]"></div>
                  {/* Fine spinning grid element on top */}
                  <div className="w-16 h-16 rounded-full border border-white/20 border-dashed animate-spin [animation-duration:14s] relative z-10"></div>
                </div>
              </motion.div>
            </div>

            {/* Grid features area - Increased height to h-24 */}
            <div className="relative h-24 w-full">
              {/* Wireframe Grid with Blueprint Measurement Indicators */}
              <motion.div
                style={{ opacity: gridWireframeOpacity, y: gridY, scale: gridScale }}
                className="absolute inset-0 grid grid-cols-3 gap-4 border border-dashed border-[#ff5f00]/20 rounded p-2 bg-black/40"
              >
                <div className="h-full rounded bg-white/5 border border-white/10 p-2 flex flex-col gap-2 relative justify-center">
                  <motion.span style={{ opacity: gridTagsOpacity }} className="absolute -top-4 left-0 text-[6px] font-mono text-[#ff5f00]">&lt;col-1&gt;</motion.span>
                  <div className="w-4.5 h-4.5 rounded bg-[#ff8c00]/20"></div>
                  <div className="w-[70%] h-2.5 bg-white/10 rounded"></div>
                </div>
                <div className="h-full rounded bg-[#ff5f00]/5 border border-[#ff5f00]/30 p-2 flex flex-col gap-2 relative justify-center">
                  <motion.span style={{ opacity: gridTagsOpacity }} className="absolute -top-4 left-0 text-[6px] font-mono text-cyan-400">gap: 16px</motion.span>
                  <div className="w-4.5 h-4.5 rounded bg-[#ff5f00]/30"></div>
                  <div className="w-[70%] h-2.5 bg-white/20 rounded"></div>
                </div>
                <div className="h-full rounded bg-white/5 border border-white/10 p-2 flex flex-col gap-2 relative justify-center">
                  <motion.span style={{ opacity: gridTagsOpacity }} className="absolute -top-4 right-0 text-[6px] font-mono text-cyan-400">w-1/3</motion.span>
                  <div className="w-4.5 h-4.5 rounded bg-[#ff8c00]/20"></div>
                  <div className="w-[70%] h-2.5 bg-white/10 rounded"></div>
                </div>
              </motion.div>

              {/* Rendered Grid */}
              <motion.div
                style={{ opacity: gridRenderedOpacity }}
                className="absolute inset-0 grid grid-cols-3 gap-4 pointer-events-none"
              >
                <div className="h-full rounded-xl bg-white/5 backdrop-blur-[5px] border border-white/10 p-3 flex flex-col justify-between hover:border-[#ff5f00]/40 transition-colors duration-300 pointer-events-auto cursor-pointer">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <StarIcon size={12} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white tracking-[0.5px] leading-tight">Mesh Engine</h4>
                    <p className="text-[8px] text-white/40 leading-none">Fast 3D canvas</p>
                  </div>
                </div>
                <div className="h-full rounded-xl bg-gradient-to-br from-[#ff5f00]/10 to-[#ff8c00]/5 backdrop-blur-[5px] border border-[#ff5f00]/30 p-3 flex flex-col justify-between hover:border-[#ff8c00] transition-colors duration-300 pointer-events-auto cursor-pointer shadow-[0_0_15px_rgba(255,95,0,0.05)]">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ff5f00] to-[#ff8c00] flex items-center justify-center shadow-[0_0_10px_rgba(255,95,0,0.4)]">
                    <LayersIcon size={12} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white tracking-[0.5px] leading-tight">AI Layouts</h4>
                    <p className="text-[8px] text-white/50 leading-none">Generative CSS</p>
                  </div>
                </div>
                <div className="h-full rounded-xl bg-white/5 backdrop-blur-[5px] border border-white/10 p-3 flex flex-col justify-between hover:border-[#ff8c00]/40 transition-colors duration-300 pointer-events-auto cursor-pointer">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    <ZapIcon size={12} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white tracking-[0.5px] leading-tight">Fluid 60FPS</h4>
                    <p className="text-[8px] text-white/40 leading-none">Sub-ms response</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InteractiveMobileOverlay({ progress }) {
  const heroSize = 0.05;
  const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
  const startRange = heroSize + 7 * remainingSize; // Section 8 (Index 8)
  const endRange = startRange + remainingSize;     // End of Section 8 (Index 8)
  const sectionSize = remainingSize;

  // Fade in at the start of section 8, and fade out when transitioning to section 9
  const opacity = useTransform(
    progress,
    [startRange - sectionSize * 0.3, startRange + sectionSize * 0.1, endRange - sectionSize * 0.15, endRange],
    [0, 1, 1, 0]
  );

  // Link laser scanner to scroll progress of Section 8!
  const laserTop = useTransform(progress, [startRange, endRange - sectionSize * 0.15], ["0%", "100%"]);
  const laserOpacity = useTransform(
    progress,
    [startRange - sectionSize * 0.1, startRange, endRange - sectionSize * 0.15, endRange],
    [0, 0.9, 0.9, 0]
  );

  // Sync logs based on scroll progress!
  const [activeLogs, setActiveLogs] = useState([]);

  const allLogs = useMemo(() => [
    "[10:14:02] AI Mobile Compiler Initialized.",
    "[10:14:03] Optimizing React Native bundle...",
    "[10:14:04] Designing bottom tab navigation bar...",
    "[10:14:05] Injecting mobile glassmorphic widgets...",
    "[10:14:06] Applying glow filters & status bar HUD...",
    "[10:14:07] Compiling native component nodes...",
    "[10:14:08] Auditing performance: 60fps locked.",
    "[10:14:09] Building iOS / Android IPA/APK binaries...",
    "[10:14:10] App deployed. Live interactive sandbox ready."
  ], []);

  useEffect(() => {
    return progress.on("change", (latest) => {
      if (latest < startRange) {
        setActiveLogs(allLogs.slice(0, 3));
        return;
      }
      const scrollFraction = Math.max(0, Math.min(1, (latest - startRange) / sectionSize));
      const logsCount = 3 + Math.floor(scrollFraction * (allLogs.length - 3));
      setActiveLogs(allLogs.slice(0, Math.min(allLogs.length, logsCount)));
    });
  }, [progress, startRange, sectionSize, allLogs]);

  // Snapping flight entries for mobile boxes
  const navY = useTransform(progress, [startRange + sectionSize * 0.05, startRange + sectionSize * 0.25, startRange + sectionSize * 0.3], [60, -3, 0]);
  const navScale = useTransform(progress, [startRange + sectionSize * 0.05, startRange + sectionSize * 0.25, startRange + sectionSize * 0.3], [0.8, 1.05, 1]);
  const navWireframeOpacity = useTransform(progress, [startRange + sectionSize * 0.01, startRange + sectionSize * 0.1, startRange + sectionSize * 0.55, startRange + sectionSize * 0.65], [0, 1, 1, 0]);
  const navTagsOpacity = useTransform(progress, [startRange + sectionSize * 0.18, startRange + sectionSize * 0.25, startRange + sectionSize * 0.5, startRange + sectionSize * 0.6], [0, 1, 1, 0]);

  const cardX = useTransform(progress, [startRange + sectionSize * 0.22, startRange + sectionSize * 0.45, startRange + sectionSize * 0.5], [-120, 5, 0]);
  const cardScale = useTransform(progress, [startRange + sectionSize * 0.22, startRange + sectionSize * 0.45, startRange + sectionSize * 0.5], [0.8, 1.05, 1]);
  const cardWireframeOpacity = useTransform(progress, [startRange + sectionSize * 0.2, startRange + sectionSize * 0.3, startRange + sectionSize * 0.72, startRange + sectionSize * 0.82], [0, 1, 1, 0]);
  const cardTagsOpacity = useTransform(progress, [startRange + sectionSize * 0.38, startRange + sectionSize * 0.45, startRange + sectionSize * 0.65, startRange + sectionSize * 0.75], [0, 1, 1, 0]);

  const listY = useTransform(progress, [startRange + sectionSize * 0.42, startRange + sectionSize * 0.65, startRange + sectionSize * 0.7], [100, -5, 0]);
  const listScale = useTransform(progress, [startRange + sectionSize * 0.42, startRange + sectionSize * 0.65, startRange + sectionSize * 0.7], [0.8, 1.05, 1]);
  const listWireframeOpacity = useTransform(progress, [startRange + sectionSize * 0.4, startRange + sectionSize * 0.5, startRange + sectionSize * 0.88, startRange + sectionSize * 0.98], [0, 1, 1, 0]);
  const listTagsOpacity = useTransform(progress, [startRange + sectionSize * 0.58, startRange + sectionSize * 0.65, startRange + sectionSize * 0.82, startRange + sectionSize * 0.92], [0, 1, 1, 0]);

  // Stage 4: Rendered elements opacities
  const navRenderedOpacity = useTransform(progress, [startRange + sectionSize * 0.5, startRange + sectionSize * 0.7], [0, 1]);
  const cardRenderedOpacity = useTransform(progress, [startRange + sectionSize * 0.65, startRange + sectionSize * 0.85], [0, 1]);
  const listRenderedOpacity = useTransform(progress, [startRange + sectionSize * 0.8, startRange + sectionSize * 0.98], [0, 1]);

  return (
    <motion.div
      style={{ opacity, pointerEvents: opacity.get() > 0.1 ? 'auto' : 'none' }}
      className="absolute inset-0 z-20 flex flex-col justify-center items-center px-6 md:px-24 py-16 overflow-hidden pointer-events-none"
    >
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 z-0"></div>

      {/* Title */}
      <div className="relative z-10 text-center mb-6 flex flex-col items-center max-w-3xl gap-3">
        <div className="px-4 py-1.5 border border-[#ff8c00]/40 rounded-full bg-[#ff8c00]/5 text-[#ff8c00] text-[11px] font-semibold tracking-[3px] uppercase animate-pulse">
          AI App Compiler // Active
        </div>
        <h2 className="text-[28px] md:text-[48px] font-light leading-[1.1] tracking-[-1px] text-white">
          Compiling Mobile Design, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f00] to-[#ff8c00]">Into Smooth React Native.</span>
        </h2>
      </div>

      {/* Main dashboard container */}
      <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-xl p-5 md:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row gap-6 items-center justify-center pointer-events-auto">

        {/* Left Side: Real-time Terminal Logs */}
        <div className="flex-1 w-full md:w-auto self-stretch flex flex-col gap-4 bg-black/60 rounded-xl p-4 border border-white/5 font-mono text-[12px] min-h-[300px] md:min-h-[460px]">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff8c00] animate-ping"></span>
              <span className="text-white/80 font-semibold tracking-[1px] text-[10px] uppercase">Mobile Logs</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2 justify-end">
            {activeLogs.map((log, idx) => (
              <div key={idx} className={`leading-relaxed ${idx === activeLogs.length - 1 ? 'text-[#ff8c00]' : 'text-white/50'}`}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Visual Mobile Layout Mockup */}
        <div className="relative w-[300px] md:w-[320px] h-[460px] md:h-[500px] rounded-[36px] border-[6px] border-white/15 bg-black/80 overflow-hidden flex flex-col shadow-[0_0_40px_rgba(255,140,0,0.15)]">
          {/* Status Bar */}
          <div className="px-5 pt-3 pb-1 flex justify-between items-center text-[9px] text-white/50 z-20 font-mono">
            <span>10:14 AM</span>
            {/* Dynamic Island */}
            <div className="w-18 h-3.5 bg-black rounded-full border border-white/5 absolute left-1/2 -translate-x-1/2 top-2.5 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-900 rounded-full absolute right-2.5"></div>
            </div>
            <div className="flex items-center gap-1">
              <span>5G</span>
              <div className="w-4 h-2 border border-white/30 rounded-sm p-0.5 flex items-center"><div className="w-2 h-full bg-white/70"></div></div>
            </div>
          </div>

          {/* Glowing laser sweeping line */}
          <motion.div
            style={{ top: laserTop, opacity: laserOpacity }}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff8c00] to-transparent shadow-[0_0_15px_#ff8c00] z-20 pointer-events-none"
          />

          {/* Screen Content Wrapper */}
          <div className="flex-1 px-4 py-3 flex flex-col justify-between relative z-10 overflow-hidden">

            {/* App Header / Upper section */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-white/40 font-mono tracking-wider">HARSHITHA APP</span>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer pointer-events-auto">
                <StarIcon size={10} className="text-white/60" />
              </div>
            </div>

            {/* Dynamic Card Area (Snapping Hero widget) */}
            <div className="relative flex-1 min-h-[140px] flex items-center justify-center mt-2 mb-3">
              {/* Wireframe Hero Widget */}
              <motion.div
                style={{ opacity: cardWireframeOpacity, x: cardX, scale: cardScale }}
                className="absolute inset-0 border border-dashed border-[#ff8c00]/30 rounded-2xl p-3 flex flex-col justify-between bg-black/40"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[6.5px] font-mono text-[#ff8c00]">&lt;CardWidget&gt;</span>
                  <span className="text-[6.5px] font-mono text-cyan-400">w-full h-32</span>
                </div>
                <div className="w-full h-8 bg-white/5 rounded border border-white/5"></div>
                <div className="w-[60%] h-3.5 bg-white/5 rounded"></div>
              </motion.div>

              {/* Rendered Hero Widget */}
              <motion.div
                style={{ opacity: cardRenderedOpacity }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ff5f00]/15 to-[#ff8c00]/5 border border-[#ff5f00]/30 p-3.5 flex flex-col justify-between shadow-[0_0_20px_rgba(255,95,0,0.1)] pointer-events-none"
              >
                <div className="flex justify-between items-center">
                  <div className="px-2 py-0.5 bg-[#ff8c00]/10 border border-[#ff8c00]/30 rounded text-[7px] text-[#ff8c00] font-bold tracking-[1px] uppercase">Node Active</div>
                  <div className="flex items-center gap-1">
                    <ActivityIcon size={8} className="text-white/40 animate-pulse" />
                    <span className="text-[8px] text-white/40 font-mono">ID: #992X</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-white/40">Total Operations</span>
                  <div className="text-[20px] font-bold text-white tracking-[-0.5px]">948,012 <span className="text-[9px] text-emerald-400 font-mono">+12.4%</span></div>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[74%] h-full bg-gradient-to-r from-[#ff5f00] to-[#ff8c00] rounded-full"></div>
                </div>
              </motion.div>
            </div>

            {/* List Activity Widget (Snapping Vertical Scrollable Cards) */}
            <div className="relative h-[150px] flex items-center justify-center mb-2">
              {/* Wireframe List */}
              <motion.div
                style={{ opacity: listWireframeOpacity, y: listY, scale: listScale }}
                className="absolute inset-0 border border-dashed border-cyan-400/20 rounded-xl p-2.5 flex flex-col gap-2 bg-black/40"
              >
                <span className="text-[6.5px] font-mono text-[#ff5f00]">&lt;FlatList&gt;</span>
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded bg-white/5 border border-white/5"></div>
                  <div className="flex-1 flex flex-col gap-1"><div className="w-16 h-2 bg-white/5 rounded"></div><div className="w-24 h-1.5 bg-white/5 rounded"></div></div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded bg-white/5 border border-white/5"></div>
                  <div className="flex-1 flex flex-col gap-1"><div className="w-16 h-2 bg-white/5 rounded"></div><div className="w-24 h-1.5 bg-white/5 rounded"></div></div>
                </div>
              </motion.div>

              {/* Rendered List */}
              <motion.div
                style={{ opacity: listRenderedOpacity }}
                className="absolute inset-0 flex flex-col gap-2 pointer-events-none"
              >
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#ff5f00]/40 transition-colors pointer-events-auto cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                      <PackageIcon size={12} className="text-blue-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-bold text-white">GLB Engine Assets</span>
                      <span className="text-[7.5px] text-white/40">Optimized 4 models</span>
                    </div>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Sync</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#ff8c00]/40 transition-colors pointer-events-auto cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                      <WifiIcon size={12} className="text-purple-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-bold text-white">WebSocket Portals</span>
                      <span className="text-[7.5px] text-white/40">3 connections open</span>
                    </div>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#ff8c00]/10 text-[#ff8c00]">Live</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom Nav Bar (Snapping Mobile bottom bar) */}
            <div className="relative h-12 w-full mt-1">
              {/* Wireframe Navigation Bar */}
              <motion.div
                style={{ opacity: navWireframeOpacity, y: navY, scale: navScale }}
                className="absolute inset-0 border border-dashed border-[#ff5f00]/30 rounded-xl px-4 flex justify-between items-center bg-black/40"
              >
                <span className="text-[6.5px] font-mono text-[#ff5f00]">&lt;TabBar&gt;</span>
                <div className="w-5 h-5 rounded bg-white/10"></div>
                <div className="w-5 h-5 rounded bg-white/10"></div>
                <div className="w-5 h-5 rounded bg-white/10"></div>
              </motion.div>

              {/* Rendered Navigation Bar */}
              <motion.div
                style={{ opacity: navRenderedOpacity }}
                className="absolute inset-0 rounded-xl bg-white/5 border border-white/10 px-6 flex justify-between items-center pointer-events-none"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer pointer-events-auto">
                  <HomeIcon size={14} className="text-white/60 hover:text-white transition-colors" />
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-tr from-[#ff5f00] to-[#ff8c00] text-white shadow-[0_0_12px_rgba(255,95,0,0.4)] cursor-pointer pointer-events-auto">
                  <CpuIcon size={14} className="text-white" />
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer pointer-events-auto">
                  <UserIcon size={14} className="text-white/60 hover:text-white transition-colors" />
                </div>
              </motion.div>
            </div>

          </div>

          {/* Home indicator bar */}
          <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mb-2 mt-1 z-20"></div>
        </div>

      </div>
    </motion.div>
  );
}

function InteractiveHandoffOverlay({ progress }) {
  const heroSize = 0.05;
  const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
  const startRange = heroSize + 8 * remainingSize;
  const endRange = 1.0;
  const sectionSize = remainingSize;

  const opacity = useTransform(
    progress,
    [startRange - sectionSize * 0.3, startRange + sectionSize * 0.1, startRange + sectionSize * 0.8, startRange + sectionSize * 0.95],
    [0, 1, 1, 0]
  );

  const mouseX = useTransform(progress, [startRange, startRange + sectionSize * 0.4], [-40, 90]);
  const mouseY = useTransform(progress, [startRange, startRange + sectionSize * 0.4], [180, 60]);

  const figmaBox1Opacity = useTransform(progress, [startRange + sectionSize * 0.05, startRange + sectionSize * 0.25], [0, 1]);
  const figmaBox2Opacity = useTransform(progress, [startRange + sectionSize * 0.15, startRange + sectionSize * 0.35], [0, 1]);
  const figmaVectorLineOpacity = useTransform(progress, [startRange + sectionSize * 0.2, startRange + sectionSize * 0.5], [0, 0.8]);

  const dashOffset = useTransform(progress, [startRange + sectionSize * 0.2, endRange - sectionSize * 0.1], [600, 0]);

  const codeLines = useMemo(() => [
    "import React from 'react';",
    "import { Canvas } from '@react-three/fiber';",
    "import { Model } from './Model';",
    "",
    "export default function App() {",
    "  return (",
    "    <Canvas camera={{ position: [0, 0, 5] }}>",
    "      <ambientLight intensity={0.5} />",
    "      <directionalLight position={[10, 10, 5]} />",
    "      <Model url='/face-mesh.glb' />",
    "    </Canvas>",
    "  );",
    "}"
  ], []);

  const allHandoffLogs = useMemo(() => [
    "⚡ Parser: Parsing Figma coordinates...",
    "⚡ AST: Mapping TailwindCSS utility nodes...",
    "⚡ Tokenizer: Binding active HSL states...",
    "✓ Code generation successful.",
    "✓ Module bundled. HMR Node fully synced."
  ], []);

  const [activeCodeLines, setActiveCodeLines] = useState([]);
  const [handoffLogs, setHandoffLogs] = useState([]);

  useEffect(() => {
    return progress.on("change", (latest) => {
      if (latest < startRange) {
        setActiveCodeLines([]);
        setHandoffLogs([]);
        return;
      }
      const scrollFraction = Math.max(0, Math.min(1, (latest - startRange) / sectionSize));

      const linesCount = Math.floor(scrollFraction * codeLines.length * 1.4);
      setActiveCodeLines(codeLines.slice(0, Math.min(codeLines.length, linesCount)));

      const logsCount = Math.floor(scrollFraction * allHandoffLogs.length * 1.2);
      setHandoffLogs(allHandoffLogs.slice(0, Math.min(allHandoffLogs.length, logsCount)));
    });
  }, [progress, startRange, sectionSize, codeLines, allHandoffLogs]);

  const idePanelOpacity = useTransform(progress, [startRange + sectionSize * 0.35, startRange + sectionSize * 0.55], [0, 1]);
  const successBadgeOpacity = useTransform(progress, [startRange + sectionSize * 0.6, startRange + sectionSize * 0.8], [0, 1]);

  return (
    <motion.div
      style={{ opacity, pointerEvents: opacity.get() > 0.1 ? 'auto' : 'none' }}
      className="absolute inset-0 z-20 flex flex-col justify-center items-center px-6 md:px-24 py-16 overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 z-0"></div>

      <div className="relative z-10 text-center mb-6 flex flex-col items-center max-w-3xl gap-3">
        <div className="px-4 py-1.5 border border-[#ff5f00]/40 rounded-full bg-[#ff5f00]/5 text-[#ff5f00] text-[11px] font-semibold tracking-[3px] uppercase animate-pulse">
          Figma To React // Handoff Workspace
        </div>
        <h2 className="text-[28px] md:text-[48px] font-light leading-[1.1] tracking-[-1px] text-white">
          Compiling Vector Mockups, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f00] to-[#ff8c00]">Into Production React Nodes.</span>
        </h2>
      </div>

      <div className="relative z-10 w-full max-w-6xl rounded-2xl border border-white/10 bg-[#080808]/90 backdrop-blur-xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row gap-6 items-center justify-between pointer-events-auto">

        <div className="w-full lg:w-[48%] h-[380px] md:h-[460px] rounded-xl border border-white/10 bg-black/60 relative overflow-hidden p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#f24e1e] rounded-sm"></div>
              <span className="text-[10px] text-white/50 uppercase font-mono tracking-wider font-bold">Figma Canvas // live_editor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono">100%</span>
            </div>
          </div>

          <div className="flex-1 relative my-4 border border-dashed border-white/5 rounded-lg bg-black/30 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#ff5f00_1px,transparent_1px)] bg-[size:16px_16px] opacity-10"></div>

            <motion.div
              style={{ opacity: figmaBox1Opacity }}
              className="absolute left-6 top-10 border border-blue-500 rounded p-2.5 bg-blue-500/5 flex flex-col gap-1 w-32 shadow-[0_0_10px_rgba(59,130,246,0.15)] pointer-events-none"
            >
              <div className="flex justify-between items-center text-[7px] font-mono text-blue-400">
                <span>&lt;HeroTitle&gt;</span>
                <span>w: 128px</span>
              </div>
              <div className="h-4 bg-blue-500/20 rounded"></div>
              <div className="h-2 w-[70%] bg-blue-500/10 rounded"></div>
              <span className="absolute -top-3.5 -left-1 px-1 bg-blue-500 text-[6px] text-white rounded font-mono">TitleNode</span>
            </motion.div>

            <motion.div
              style={{ opacity: figmaBox2Opacity }}
              className="absolute right-10 bottom-12 border border-[#ff5f00] rounded p-2.5 bg-[#ff5f00]/5 flex flex-col gap-1 w-36 shadow-[0_0_10px_rgba(255,95,0,0.15)] pointer-events-none"
            >
              <div className="flex justify-between items-center text-[7px] font-mono text-[#ff5f00]">
                <span>&lt;ThreeCanvas&gt;</span>
                <span>h: 180px</span>
              </div>
              <div className="h-12 bg-[#ff5f00]/10 rounded border border-[#ff5f00]/20 flex items-center justify-center text-[8px] text-white/30 font-mono">
                3D Scene Layout
              </div>
              <span className="absolute -top-3.5 -left-1 px-1 bg-[#ff5f00] text-[6px] text-white rounded font-mono">SceneMesh</span>
            </motion.div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <motion.path
                style={{ opacity: figmaVectorLineOpacity }}
                d="M 120 70 C 180 100, 200 120, 220 180"
                fill="none"
                stroke="#ff8c00"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <motion.g style={{ opacity: figmaVectorLineOpacity }} transform="translate(170, 115)">
                <rect x="-24" y="-8" width="48" height="16" rx="4" fill="#ff5f00" />
                <text x="0" y="3" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  gap: 40
                </text>
              </motion.g>
            </svg>

            <motion.div
              style={{ x: mouseX, y: mouseY }}
              className="absolute w-5 h-5 text-blue-500 pointer-events-none z-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
            >
              <MousePointerIcon size={18} fill="currentColor" />
              <div className="absolute left-4 top-4 bg-blue-500 text-[6.5px] text-white font-mono font-bold px-1 py-0.5 rounded shadow whitespace-nowrap">
                Harshitha.G
              </div>
            </motion.div>
          </div>

          <div className="flex justify-between items-center font-mono text-[9px] text-white/30 pt-2 border-t border-white/5">
            <div className="flex gap-2">
              <span>X: 420px</span>
              <span>Y: 108px</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <PenToolIcon size={8} />
              <span>Vector Pen Active</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-[8%] h-24 flex-col items-center justify-center relative">
          <svg className="w-full h-12 pointer-events-none overflow-visible">
            <line x1="0" y1="24" x2="100%" y2="24" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="6,6" />
            <motion.line
              x1="0" y1="24" x2="100%" y2="24"
              stroke="url(#beamGradientFigma)"
              strokeWidth="2.5"
              strokeDasharray="40 100"
              style={{ strokeDashoffset: dashOffset }}
            />
            <defs>
              <linearGradient id="beamGradientFigma" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff5f00" stopOpacity="0" />
                <stop offset="50%" stopColor="#ff8c00" stopOpacity="1" />
                <stop offset="100%" stopColor="#ff5f00" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <ArrowRightIcon size={14} className="text-[#ff8c00]/60 animate-pulse mt-1" />
        </div>

        <motion.div
          style={{ opacity: idePanelOpacity }}
          className="w-full lg:w-[44%] h-[380px] md:h-[460px] rounded-xl border border-white/10 bg-[#050505]/95 shadow-2xl overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center bg-black/60 px-3 border-b border-white/5">
            <div className="flex gap-1.5 mr-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/20"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/20"></span>
            </div>
            <div className="px-3.5 py-2.5 bg-[#050505] border-r border-white/5 flex items-center gap-1.5 text-[9px] text-[#ff8c00] font-mono border-t-[2px] border-t-[#ff8c00] font-bold">
              <FileCodeIcon size={10} />
              <span>App.tsx</span>
            </div>
            <div className="px-3 py-2 text-[9px] text-white/30 font-mono hover:text-white/60 transition-colors cursor-pointer">
              <span>Experience.css</span>
            </div>
          </div>

          <div className="flex-1 p-4 font-mono text-[9.5px] leading-[1.4] text-white/70 overflow-hidden flex flex-col justify-between">
            <div className="flex-1 flex flex-col gap-0.5 justify-start border-l border-white/5 pl-2 overflow-y-auto max-h-[220px]">
              {activeCodeLines.map((line, idx) => (
                <div key={idx} className="whitespace-pre">
                  <span className="text-white/20 select-none mr-3 text-right inline-block w-4">{idx + 1}</span>
                  <span className={
                    line.includes("import") ? "text-purple-400" :
                      line.includes("export") || line.includes("return") ? "text-pink-400" :
                        line.includes("<") || line.includes("/>") ? "text-cyan-400 font-semibold" :
                          "text-white/80"
                  }>{line}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3 mt-2 flex flex-col gap-1 font-mono text-[8.5px] text-white/40">
              <div className="flex items-center gap-1.5 font-bold text-white/60 mb-0.5 uppercase tracking-wider">
                <TerminalIcon size={10} className="text-[#ff5f00]" />
                <span>Compiler Status</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {handoffLogs.map((log, idx) => (
                  <div key={idx} className={log.startsWith("✓") ? "text-emerald-400" : "text-white/40"}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-black/60 px-3 py-1.5 border-t border-white/5 flex justify-between items-center text-[8.5px] font-mono text-white/30">
            <span>Ln 13, Col 2</span>
            <div className="flex items-center gap-2">
              <span>UTF-8</span>
              <span className="text-[#ff8c00]">TypeScript JSX</span>
              <motion.div
                style={{ opacity: successBadgeOpacity }}
                className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
              >
                <CheckCircleIcon size={8} />
                <span>BUILD OK</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function InteractiveCanvaOverlay({ progress }) {
  const heroSize = 0.05;
  const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
  const startRange = heroSize + 9 * remainingSize;
  const endRange = 1.0;
  const sectionSize = remainingSize;

  const opacity = useTransform(
    progress,
    [startRange - sectionSize * 0.3, startRange + sectionSize * 0.1, startRange + sectionSize * 0.8, startRange + sectionSize * 0.95],
    [0, 1, 1, 0]
  );

  const mouseX = useTransform(progress, [startRange, startRange + sectionSize * 0.4], [-40, 90]);
  const mouseY = useTransform(progress, [startRange, startRange + sectionSize * 0.4], [180, 60]);

  const figmaBox1Opacity = useTransform(progress, [startRange + sectionSize * 0.05, startRange + sectionSize * 0.25], [0, 1]);
  const figmaBox2Opacity = useTransform(progress, [startRange + sectionSize * 0.15, startRange + sectionSize * 0.35], [0, 1]);
  const rightPanelOpacity = useTransform(progress, [startRange + sectionSize * 0.35, startRange + sectionSize * 0.55], [0, 1]);

  const asset1 = useTransform(progress, [startRange + sectionSize * 0.4, startRange + sectionSize * 0.5], [0, 1]);
  const asset2 = useTransform(progress, [startRange + sectionSize * 0.45, startRange + sectionSize * 0.55], [0, 1]);
  const asset3 = useTransform(progress, [startRange + sectionSize * 0.5, startRange + sectionSize * 0.6], [0, 1]);

  return (
    <motion.div
      style={{ opacity, pointerEvents: opacity.get() > 0.1 ? 'auto' : 'none' }}
      className="absolute inset-0 z-20 flex flex-col justify-center items-center px-6 md:px-24 py-16 overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,196,204,0.05)_0%,transparent_70%)] z-0"></div>

      <div className="relative z-10 text-center mb-6 flex flex-col items-center max-w-3xl gap-3">
        <div className="px-4 py-1.5 border border-[#00C4CC]/40 rounded-full bg-[#00C4CC]/5 text-[#00C4CC] text-[11px] font-semibold tracking-[3px] uppercase animate-pulse">
          Creative Design // Canva Studio
        </div>
        <h2 className="text-[28px] md:text-[48px] font-light leading-[1.1] tracking-[-1px] text-white">
          Crafting Stunning Visuals, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00C4CC] to-[#7D2AE8]">With Pixel-Perfect Precision.</span>
        </h2>
      </div>

      <div className="relative z-10 w-full max-w-6xl rounded-2xl border border-white/10 bg-[#080808]/90 backdrop-blur-xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row gap-6 items-center justify-between pointer-events-auto">

        {/* Left Side: Canva Editor */}
        <div className="w-full lg:w-[48%] h-[380px] md:h-[460px] rounded-xl border border-white/10 bg-[#111] relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-tr from-[#00C4CC] to-[#7D2AE8] rounded-full"></div>
              <span className="text-[11px] text-white/70 font-medium tracking-wide">Social_Media_Campaign.cnv</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded text-[10px] text-white/50">
              1080 x 1080 px
            </div>
          </div>

          <div className="flex-1 relative m-4 border border-white/10 bg-[#0a0a0a] rounded-lg overflow-hidden flex items-center justify-center">
            <motion.div style={{ opacity: figmaBox1Opacity }} className="absolute w-[60%] h-[40%] bg-gradient-to-br from-[#00C4CC]/20 to-[#7D2AE8]/20 rounded-xl border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <div className="w-[80%] h-4 bg-white/20 rounded-full"></div>
              <div className="w-[50%] h-3 bg-white/10 rounded-full"></div>
            </motion.div>

            <motion.div style={{ opacity: figmaBox2Opacity }} className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-[#00C4CC]/30 border border-[#00C4CC]/50 shadow-[0_0_20px_rgba(0,196,204,0.3)]"></motion.div>
            <motion.div style={{ opacity: figmaBox2Opacity }} className="absolute top-10 right-10 w-24 h-24 rotate-45 bg-[#7D2AE8]/20 border border-[#7D2AE8]/40 shadow-[0_0_20px_rgba(125,42,232,0.2)]"></motion.div>

            <motion.div
              style={{ x: mouseX, y: mouseY }}
              className="absolute w-5 h-5 text-white pointer-events-none z-10 drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
            >
              <MousePointerIcon size={20} fill="currentColor" />
              <div className="absolute left-4 top-4 bg-gradient-to-r from-[#00C4CC] to-[#7D2AE8] text-[9px] text-white font-medium px-2 py-1 rounded-full shadow-lg whitespace-nowrap">
                Designing...
              </div>
            </motion.div>
          </div>
        </div>

        {/* Center Arrow */}
        <div className="hidden lg:flex w-[8%] justify-center">
          <ArrowRightIcon size={24} className="text-[#00C4CC]/60 animate-pulse" />
        </div>

        {/* Right Side: Brand Kit / Assets (NO CODE) */}
        <motion.div
          style={{ opacity: rightPanelOpacity }}
          className="w-full lg:w-[44%] h-[380px] md:h-[460px] rounded-xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center bg-[#1a1a1a] px-4 py-3 border-b border-white/5">
            <span className="text-[11px] text-white/70 font-medium tracking-wide">Brand Kit & Assets</span>
          </div>

          <div className="flex-1 p-4 md:p-5 flex flex-col gap-4 overflow-y-auto overflow-x-hidden">

            <motion.div style={{ opacity: asset1 }} className="flex flex-col gap-2">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Color Palette</span>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00C4CC] border border-white/10 shadow-[0_0_15px_rgba(0,196,204,0.3)]"></div>
                <div className="w-10 h-10 rounded-full bg-[#7D2AE8] border border-white/10 shadow-[0_0_15px_rgba(125,42,232,0.3)]"></div>
                <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/20"></div>
                <div className="w-10 h-10 rounded-full bg-white border border-white/10"></div>
              </div>
            </motion.div>

            <motion.div style={{ opacity: asset2 }} className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Typography</span>
              <div className="flex flex-col gap-1.5">
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">Heading (Bold)</div>
                <div className="text-md md:text-lg font-medium text-white/80">Subheading (Medium)</div>
                <div className="text-xs md:text-sm font-light text-white/50">Body text goes here. Keep it clean and readable.</div>
              </div>
            </motion.div>

            <motion.div style={{ opacity: asset3 }} className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Export Ready</span>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-[#00C4CC]/10 text-[#00C4CC] border border-[#00C4CC]/30 rounded text-[10px] font-medium">PNG (High-Res)</div>
                <div className="px-3 py-1.5 bg-[#7D2AE8]/10 text-[#7D2AE8] border border-[#7D2AE8]/30 rounded text-[10px] font-medium">SVG (Vector)</div>
              </div>
              <div className="mt-1 w-full py-2.5 bg-gradient-to-r from-[#00C4CC] to-[#7D2AE8] rounded-lg text-white text-center text-[11px] font-bold tracking-wide shadow-[0_0_20px_rgba(125,42,232,0.4)] cursor-pointer hover:scale-[1.02] transition-transform">
                PUBLISH DESIGN
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function InteractiveTrainerOverlay({ progress }) {
  const heroSize = 0.05;
  const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
  const startRange = heroSize + 10 * remainingSize;
  const endRange = 1.0;
  const sectionSize = remainingSize;

  const opacity = useTransform(
    progress,
    [startRange - sectionSize * 0.3, startRange + sectionSize * 0.1, startRange + sectionSize * 0.8, startRange + sectionSize * 0.95],
    [0, 1, 1, 0]
  );

  const slideOpacity = useTransform(progress, [startRange + sectionSize * 0.1, startRange + sectionSize * 0.3], [0, 1]);
  const chat1 = useTransform(progress, [startRange + sectionSize * 0.3, startRange + sectionSize * 0.4], [0, 1]);
  const chat2 = useTransform(progress, [startRange + sectionSize * 0.45, startRange + sectionSize * 0.55], [0, 1]);
  const chat3 = useTransform(progress, [startRange + sectionSize * 0.6, startRange + sectionSize * 0.7], [0, 1]);

  return (
    <motion.div
      style={{ opacity, pointerEvents: opacity.get() > 0.1 ? 'auto' : 'none' }}
      className="absolute inset-0 z-20 flex flex-col justify-center items-center px-6 md:px-24 py-16 overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.05)_0%,transparent_70%)] z-0"></div>

      <div className="relative z-10 text-center mb-6 flex flex-col items-center max-w-3xl gap-3">
        <div className="px-4 py-1.5 border border-pink-500/40 rounded-full bg-pink-500/5 text-pink-400 text-[11px] font-semibold tracking-[3px] uppercase animate-pulse">
          Mentorship // Masterclass
        </div>
        <h2 className="text-[28px] md:text-[48px] font-light leading-[1.1] tracking-[-1px] text-white">
          Empowering Next-Gen Creators, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-[#7D2AE8]">Through Live Mentorship.</span>
        </h2>
      </div>

      <div className="relative z-10 w-full max-w-6xl rounded-2xl border border-white/10 bg-[#080808]/90 backdrop-blur-xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row gap-6 items-center justify-between pointer-events-auto">

        {/* Left Side: Live Screen Share */}
        <div className="w-full lg:w-[60%] h-[380px] md:h-[460px] rounded-xl border border-white/10 bg-[#111] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-3 border-b border-white/5">
            <span className="text-[11px] text-white/70 font-medium tracking-wide">Live Presentation Screen</span>
            <div className="flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              <span className="text-[9px] text-red-400 font-bold tracking-wider">LIVE</span>
            </div>
          </div>

          <div className="flex-1 relative bg-[#0a0a0a] flex items-center justify-center p-6">
            <motion.div style={{ opacity: slideOpacity }} className="w-full h-full border border-white/10 rounded-lg bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center gap-6 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[50px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#7D2AE8]/10 blur-[60px] rounded-full"></div>

              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight z-10 text-center">Web & Mobile: Client Acquisition</h3>
              <p className="text-white/50 text-center max-w-md z-10 text-sm md:text-base">Learn how to build high-converting applications and secure premium freelance clients globally.</p>

              <div className="flex gap-4 mt-4 z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-white/10 flex items-center justify-center text-white">
                  <TerminalIcon size={24} />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] border border-white/10 flex items-center justify-center text-white">
                  <LayersIcon size={24} />
                </div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-white/10 flex items-center justify-center text-white">
                  <StarIcon size={24} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Live Chat / Q&A */}
        <div className="w-full lg:w-[38%] h-[380px] md:h-[460px] rounded-xl border border-white/10 bg-[#111] overflow-hidden flex flex-col">
          <div className="flex items-center bg-[#1a1a1a] px-4 py-3 border-b border-white/5">
            <span className="text-[11px] text-white/70 font-medium tracking-wide">Student Q&A</span>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            <motion.div style={{ opacity: chat1 }} className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 font-bold">Sarah M.</span>
              <div className="bg-white/5 border border-white/10 rounded-r-lg rounded-bl-lg p-3 text-[12px] text-white/80">
                What's the best way to land my first freelance client for a React project?
              </div>
            </motion.div>

            <motion.div style={{ opacity: chat2 }} className="flex flex-col gap-1 items-end">
              <span className="text-[10px] text-pink-400 font-bold">Harshitha (Instructor)</span>
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-l-lg rounded-br-lg p-3 text-[12px] text-white">
                Start by building a strong portfolio with interactive elements! Then leverage platforms like Upwork and LinkedIn.
              </div>
            </motion.div>

            <motion.div style={{ opacity: chat3 }} className="flex flex-col gap-1">
              <span className="text-[10px] text-white/40 font-bold">Alex K.</span>
              <div className="bg-white/5 border border-white/10 rounded-r-lg rounded-bl-lg p-3 text-[12px] text-white/80">
                That makes sense! Should I focus on Next.js or React Native first?
              </div>
            </motion.div>
          </div>

          <div className="p-4 border-t border-white/5 bg-[#1a1a1a]">
            <div className="w-full bg-black border border-white/10 rounded-full px-4 py-2 text-[10px] text-white/30 flex items-center justify-between">
              <span>Type a message...</span>
              <div className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center">
                <ArrowRightIcon size={8} className="text-white/50" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function InteractiveEndingOverlay({ progress }) {
  const heroSize = 0.05;
  const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
  const startRange = heroSize + 11 * remainingSize;
  const sectionSize = remainingSize;

  const opacity = useTransform(
    progress,
    [startRange - sectionSize * 0.3, startRange + sectionSize * 0.1, 1.0, 1.0],
    [0, 1, 1, 1]
  );

  const yPos = useTransform(progress, [startRange - sectionSize * 0.3, startRange + sectionSize * 0.1], [100, 0]);
  const scale = useTransform(progress, [startRange - sectionSize * 0.3, startRange + sectionSize * 0.1], [0.9, 1]);

  return (
    <motion.div
      style={{ opacity, pointerEvents: opacity.get() > 0.1 ? 'auto' : 'none' }}
      className="absolute inset-0 z-30 flex flex-col justify-center items-center px-6 py-16 overflow-hidden"
    >
      <motion.div style={{ y: yPos, scale }} className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center gap-8 text-center">

        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-r from-[#ff5f00]/30 via-[#00C4CC]/30 to-[#7D2AE8]/30 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-3 px-6 py-2 border border-white/20 rounded-full bg-white/5 backdrop-blur-lg shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <StarIcon size={14} className="text-[#ff5f00] animate-pulse" />
          <span className="text-[12px] md:text-[14px] text-white font-medium tracking-widest uppercase">Portfolio Journey Complete</span>
          <StarIcon size={14} className="text-[#ff5f00] animate-pulse" />
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          Let's Build Something <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f00] via-[#ff8c00] to-[#00C4CC]">Extraordinary.</span>
        </h1>

        <p className="text-lg md:text-2xl text-white/60 max-w-2xl font-light">
          Whether it's an immersive 3D experience, a high-converting landing page, or a complete digital ecosystem—I'm ready to bring your vision to life.
        </p>

        <div className="flex flex-col md:flex-row gap-6 mt-8">
          <button className="px-10 py-5 bg-white text-black rounded-full font-bold text-[16px] md:text-[18px] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.8)] shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center gap-3 group">
            Start a Project
            <ArrowRightIcon size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="px-10 py-5 bg-transparent text-white border-2 border-white/20 rounded-full font-bold text-[16px] md:text-[18px] transition-all hover:bg-white/10 hover:border-white/40 flex items-center gap-3">
            Download Resume
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Scene({ smoothProgress }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <Environment preset="city" />
      {SECTIONS.map((section, i) => (
        section.url && <Model key={i} url={section.url} index={i} smoothProgress={smoothProgress} />
      ))}
      <FaceModel smoothProgress={smoothProgress} />
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.5} intensity={0.8} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </>
  );
}

function FaceModel({ smoothProgress }) {
  const { scene } = useGLTF('/filename-face-v2-optimize.glb');
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const progress = smoothProgress.get();

    // Face appears starting from section 5 (index 5)
    const heroSize = 0.05;
    const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
    const startRange = heroSize + 4 * remainingSize; // Start of section 5
    const endRange = startRange + 2 * remainingSize;     // End of section 6
    const sectionSize = remainingSize;

    // Fade in between section 4 and 5
    const fadeStart = startRange - sectionSize * 0.5;
    let visibility = Math.max(0, Math.min(1, (progress - fadeStart) / (sectionSize * 0.5)));

    // Fade out as we transition into Section 7
    if (progress > endRange - sectionSize * 0.2) {
      const fadeOutProgress = Math.max(0, Math.min(1, (progress - (endRange - sectionSize * 0.2)) / (sectionSize * 0.2)));
      visibility = 1.0 - fadeOutProgress;
    }

    ref.current.visible = visibility > 0.01;

    if (visibility > 0) {
      scene.traverse(c => {
        if (c.isMesh || c.isPoints) {
          c.material.transparent = true;
          c.material.opacity = visibility;

          if (c.material.color !== undefined) {
            c.material.color.setHex(0xffffff); // Restore bright premium look
          }
          if (c.material.emissive !== undefined) {
            c.material.emissive.setHex(0x113355); // Very subtle icy blue glow
            c.material.emissiveIntensity = visibility * 0.4;
          }
        }
      });

      const targetX = state.viewport.width < 5 ? 0 : state.viewport.width * 0.22; // Closer to center for bold focal anchor
      const targetY = state.viewport.width < 5 ? 1 : 0.0;

      ref.current.position.x = targetX;
      ref.current.position.y = targetY + Math.sin(state.clock.getElapsedTime()) * 0.04;

      // Adjusted rotation - rotated to face straight out towards the camera/user
      ref.current.rotation.y = -1.9;
      ref.current.rotation.x = 0;

      // Scale grows from fadeStart to the end of section 5
      const scrollRangeProgress = Math.max(0, Math.min(1, (progress - fadeStart) / (endRange - fadeStart)));
      const scaleFactor = THREE.MathUtils.lerp(0.4, 1.4, scrollRangeProgress);
      const baseScale = state.viewport.width < 5 ? 0.8 : 0.7;
      ref.current.scale.setScalar(baseScale * scaleFactor);
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
      <primitive object={scene} ref={ref} />
    </Float>
  );
}

function Model({ url, index, smoothProgress }) {
  const { scene } = useGLTF(url);
  const ref = useRef();
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame(() => {
    if (!ref.current) return;
    const progress = smoothProgress.get();
    const heroSize = 0.05;
    const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
    const start = index === 0 ? 0 : heroSize + (index - 1) * remainingSize;
    const end = start + (index === 0 ? heroSize : remainingSize);
    const sectionSize = index === 0 ? heroSize : remainingSize;

    const visibility = Math.max(0, 1 - Math.abs((progress - (start + end) / 2) / (sectionSize / 2)));
    const localProgress = Math.min(1, Math.max(0, (progress - start) / sectionSize));

    ref.current.scale.setScalar(THREE.MathUtils.lerp(0.5, 2.5, localProgress));
    ref.current.position.z = THREE.MathUtils.lerp(-10, 5, localProgress);

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = visibility;
      }
    });
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive object={clonedScene} ref={ref} />
    </Float>
  );
}

function VideoBackground({ smoothProgress }) {
  const heroSize = 0.05;
  const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
  const startRange = heroSize + 3.5 * remainingSize; // Mid of section 4
  const endRange = heroSize + 4.5 * remainingSize;   // Mid of section 5

  const startFadeOut = heroSize + 5.5 * remainingSize; // Mid of section 6
  const endFadeOut = heroSize + 6.0 * remainingSize;   // Start of section 7

  const opacity = useTransform(
    smoothProgress,
    [startRange, endRange, startFadeOut, endFadeOut],
    [0, 1, 1, 0]
  );

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden bg-black">
      <video
        src="https://files.peachworlds.com/website/82bf5dbe-cc5c-4a8e-b4d9-35ab4db584d5/abstrac-fractal-alpha.mp4"
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover object-left-bottom"
      />
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          maskImage: 'linear-gradient(to right, transparent 30%, black 70%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 30%, black 70%)'
        }}
      >
        <video
          src="https://files.peachworlds.com/website/69bfead5-004a-4610-813b-4f6efcd16073/hud-480.mp4"
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover object-right opacity-60 mix-blend-screen"
        />
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const containerRef = useRef(null);
  const { scrollYProgress, scrollY } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 30, damping: 25, restDelta: 0.001 });

  const heroSize = 0.05;
  const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);

  return (
    <div ref={containerRef} className="relative w-full bg-black font-outfit">
      <div className="h-[2800vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <motion.div
            style={{
              opacity: useTransform(
                smoothProgress,
                [heroSize + 5.5 * remainingSize, heroSize + 6.0 * remainingSize],
                [1, 0]
              )
            }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(20,20,20,1)_0%,_rgba(0,0,0,1)_100%)] z-[-2]"
          />
          <VideoBackground smoothProgress={smoothProgress} />
          <motion.div
            style={{
              opacity: useTransform(
                smoothProgress,
                [heroSize + 5.5 * remainingSize, heroSize + 6.0 * remainingSize],
                [1, 0]
              )
            }}
            className="absolute inset-0 z-0"
          >
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
              <Suspense fallback={null}>
                <Scene smoothProgress={smoothProgress} />
              </Suspense>
            </Canvas>
          </motion.div>
          <UIOverlay scrollYProgress={scrollYProgress} scrollY={scrollY} />
          <InteractiveDashboardOverlay progress={smoothProgress} />
          <InteractiveMobileOverlay progress={smoothProgress} />
          <InteractiveHandoffOverlay progress={smoothProgress} />
          <InteractiveCanvaOverlay progress={smoothProgress} />
          <InteractiveTrainerOverlay progress={smoothProgress} />
          <InteractiveEndingOverlay progress={smoothProgress} />
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center">
            {SECTIONS.map((section, i) => (
              <SectionText key={i} section={section} index={i} progress={smoothProgress} scrollY={scrollY} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionText({ section, index, progress, scrollY }) {
  if (index >= 7 && index <= 12) return null; // Custom overlays handled directly

  const { text, hasButton } = section;
  const heroSize = 0.05;
  const remainingSize = (1 - heroSize) / (SECTIONS.length - 1);
  const start = index === 0 ? 0 : heroSize + (index - 1) * remainingSize;
  const end = start + (index === 0 ? heroSize : remainingSize);
  const sectionSize = index === 0 ? heroSize : remainingSize;

  const isLast = index === SECTIONS.length - 1;
  const opacity = useTransform(
    progress,
    index === 0 ? [0, end - sectionSize * 0.2, end] :
      isLast ? [start, start + sectionSize * 0.3, 1, 1] :
        [start, start + sectionSize * 0.3, end - sectionSize * 0.3, end],
    index === 0 ? [1, 1, 0] :
      isLast ? [0, 1, 1, 1] :
        [0, 1, 1, 0]
  );

  const y = useTransform(progress, [start, end], [20, -20]);

  return (
    <motion.div style={{ opacity, y }} className={`absolute inset-0 flex flex-col justify-center px-10 md:px-24 pointer-events-none z-10 ${section.isFinal ? 'items-start text-left pb-[5vh]' : 'items-center text-center'}`}>
      <div className={`flex flex-col gap-8 max-w-3xl ${section.isFinal ? 'items-start' : 'items-center'}`}>
        <h1 className={`font-light leading-[1.1] text-white ${section.isFinal ? 'text-[32px] md:text-[56px] tracking-[-1px] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]' : 'text-[32px] md:text-[64px] tracking-[-1px] md:tracking-[-2px] drop-shadow-[0_0_20px_rgba(0,0,0,1)] whitespace-pre-line'}`}>
          {section.content || text}
        </h1>
        {hasButton && (
          <button className="px-10 py-4 bg-white text-black rounded-full font-semibold text-[16px] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] shadow-[0_0_20px_rgba(255,255,255,0.5)] pointer-events-auto cursor-pointer mt-4">
            {section.buttonText || "Let's Connect"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function UIOverlay({ scrollYProgress, scrollY }) {
  const dotTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <nav className="absolute top-0 left-0 right-0 px-[60px] py-[40px] flex justify-between items-center pointer-events-auto">
        <div className="text-[14px] font-medium tracking-[2px] text-white/70 uppercase">MAIN</div>
        <button className="px-[24px] py-[8px] border border-[#ff8c00]/40 rounded-[12px] bg-[#ff8c00]/5 text-[#ff8c00] text-[14px] cursor-pointer transition-all duration-300 backdrop-blur-[5px] hover:bg-[#ff8c00]/15 hover:border-[#ff8c00]/80">About Us</button>
      </nav>
      <div className="absolute left-[60px] top-[100px] bottom-[100px] w-[1px] bg-white/10 flex flex-col justify-between items-center">
        <motion.div style={{ top: dotTop }} className="w-[8px] h-[8px] bg-[#ff5f00] rounded-full absolute left-[-3.5px] shadow-[0_0_10px_#ff5f00] animate-pulse" />
        {Array.from({ length: SECTIONS.length }).map((_, i) => <div key={i} className="w-[6px] h-[1px] bg-white/20" />)}
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      <motion.footer style={{ opacity: useTransform(scrollY, [0, 100], [1, 0]) }} className="absolute bottom-[40px] left-0 right-0 text-center flex flex-col items-center gap-4">
        <div className="text-[12px] font-medium text-white/40 tracking-[3px] uppercase">Scroll</div>
        <div className="w-[1px] h-[60px] bg-gradient-to-b from-white/40 to-transparent" />
      </motion.footer>
    </div>
  );
}

SECTIONS.forEach(s => s.url && useGLTF.preload(s.url));
useGLTF.preload('/filename-face-v2-optimize.glb');
