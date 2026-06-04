import { useState, Suspense, useEffect, useCallback, useLayoutEffect, lazy } from 'react';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { Preload, useTexture, Text, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

import Preloader from './components/dom/Preloader';
import PaperTransition from './components/dom/PaperTransition';
import { AudioProvider, useAudio } from './context/AudioManager';
import { initAudio } from './utils/audioManager';
import { PerformanceProvider, usePerformance } from './context/PerformanceContext';
import { SceneProvider } from './context/SceneContext';
import NavigationUI from './components/ui/NavigationUI';
import GlobalOverlay from './components/ui/GlobalOverlay';
import ScreenReaderOverlay from './components/ui/ScreenReaderOverlay';
import posthog from 'posthog-js';

// Initialize PostHog
posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
});

// Lazy load the heavy 3D experience
const Experience = lazy(() => import('./components/canvas/Experience'));

import './styles/main.scss';

// --- CONDITIONAL ASSET PRELOADING ---
// On high-end devices, preloads everything for zero stutter.
// On mobile/low-end devices, only preloads core textures to prevent Out Of Memory crashes.
import {
  ENTRANCE_TEXTURES,
  CORRIDOR_TEXTURES,
  UI_TEXTURES,
  PRELOAD_ALL,
  PRELOAD_LOADER,
  ABOUT_TEXTURES,
  IMAGE_ASSETS,
  filterTexturesByDevice
} from './config/texturePreloadList';
import { TextureLoader } from 'three';

// Standard Browser-level Image Preloader (for <img> tags)
const preloadBrowserImage = (path) => {
  if (typeof window === 'undefined') return;
  const img = new Image();
  img.src = path;
};

const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
const isWeakCPU = typeof navigator.hardwareConcurrency !== 'undefined' && navigator.hardwareConcurrency <= 4;
const isLowRAM = typeof navigator.deviceMemory !== 'undefined' && navigator.deviceMemory <= 4;
const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 450;
const isLowEnd = isMobileDevice || isWeakCPU || isLowRAM || isSmallScreen;

// Refined check for "hover capability" (non-touch devices should have hover: hover)
// Laptops with touch screens (which also have a mouse/trackpad) will return true here.
const supportsHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

// Trigger Three.js preloads at module level (as standard for Drei)
if (isLowEnd) {
  const CORE_TEXTURES = [...ENTRANCE_TEXTURES, ...CORRIDOR_TEXTURES, ...UI_TEXTURES, ...IMAGE_ASSETS];
  const filteredCore = filterTexturesByDevice(CORE_TEXTURES, supportsHover);
  const filteredAbout = filterTexturesByDevice(ABOUT_TEXTURES, supportsHover);

  filteredCore.forEach(path => useTexture.preload(path));
  filteredAbout.forEach(path => useLoader.preload(TextureLoader, path));
} else {
  const filteredAll = filterTexturesByDevice(PRELOAD_ALL, supportsHover);
  const filteredLoader = filterTexturesByDevice(PRELOAD_LOADER, supportsHover);

  filteredAll.forEach(path => useTexture.preload(path));
  filteredLoader.forEach(path => useLoader.preload(TextureLoader, path));
}

const FONT_URL = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff';

// Helper component to handle global audio enable on interaction
const GlobalAudioEnabler = () => {
  const { enableAudio } = useAudio();
  useEffect(() => {
    const handleInteraction = () => enableAudio();
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [enableAudio]);
  return null;
};

// Lag-Free Ultra-Premium Artistic Loader
const PremiumLoader = ({ isLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    let currentProgress = 0;
    const origOnProgress = THREE.DefaultLoadingManager.onProgress;
    THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
      currentProgress = Math.round((loaded / total) * 100);
      setProgress(currentProgress);
      if (origOnProgress) origOnProgress(url, loaded, total);
    };

    const fallbackTimer = setTimeout(() => {
      if (currentProgress === 0) setProgress(100);
    }, 3000);

    return () => {
      THREE.DefaultLoadingManager.onProgress = origOnProgress;
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setTimeout(() => setShouldRender(false), 1200); // Wait for the fade out
    }
  }, [isLoaded]);

  if (!shouldRender) return null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Rubik+Scribble&display=swap" rel="stylesheet" />
      <style>
        {`
          @keyframes spinSlow {
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          .ultra-loader {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background-color: #E8ECEF; display: flex; flex-direction: column;
            justify-content: center; align-items: center; z-index: 9999;
            pointer-events: none; overflow: hidden;
            opacity: 1; transition: opacity 1s cubic-bezier(0.77, 0, 0.175, 1);
            will-change: opacity, transform;
          }
          .ultra-loader.exit {
            opacity: 0;
            transform: scale(1.05);
            transition: opacity 1s cubic-bezier(0.77, 0, 0.175, 1), transform 1s ease-out;
          }
        `}
      </style>
      <div className={`ultra-loader ${isLoaded ? 'exit' : ''}`}>

        {/* Dynamic Background Glow - Optimized native radial-gradient without blur filter */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '70vw', height: '70vw',
          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 30%, rgba(232,236,239,0) 70%)',
          borderRadius: '50%', zIndex: 0
        }} />

        {/* Geometric Drafting Circles (Hardware Accelerated) */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 'min(700px, 90vw)', height: 'min(700px, 90vw)',
          border: '1px solid rgba(0,0,0,0.02)', borderRadius: '50%',
          zIndex: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
          willChange: 'transform'
        }}>
          <div style={{
            position: 'absolute', top: '8%', left: '8%', right: '8%', bottom: '8%',
            border: '1px dashed rgba(0,0,0,0.05)', borderRadius: '50%',
            animation: 'spinSlow 30s linear infinite',
            willChange: 'transform'
          }} />
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '1px', height: '120%', background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0) 100%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '-10%', transform: 'translateY(-50%)', width: '120%', height: '1px', background: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0) 100%)' }} />
        </div>

        {/* CSS Wipe Text Animation with Rubik Scribble */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>

          {/* Faint Background Text */}
          <h1 style={{
            fontFamily: '"Rubik Scribble", system-ui',
            fontSize: 'clamp(38px, 12vw, 120px)',
            fontWeight: 400,
            letterSpacing: 'clamp(1px, 0.5vw, 8px)',
            color: 'rgba(0,0,0,0.06)',
            margin: 0,
            paddingLeft: 'clamp(1px, 0.5vw, 8px)',
            textAlign: 'center',
            width: '100vw'
          }}>
            HARSHITHA
          </h1>

          {/* Foreground Solid Wipe Text */}
          <h1 style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            fontFamily: '"Rubik Scribble", system-ui',
            fontSize: 'clamp(38px, 12vw, 120px)',
            fontWeight: 400,
            letterSpacing: 'clamp(1px, 0.5vw, 8px)',
            color: '#1a1a1a',
            margin: 0,
            paddingLeft: 'clamp(1px, 0.5vw, 8px)',
            textAlign: 'center',
            clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
            transition: 'clip-path 0.2s linear',
            willChange: 'clip-path'
          }}>
            HARSHITHA
          </h1>
        </div>

        {/* Minimal Progress Details */}
        <div style={{
          marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2
        }}>
          <div style={{
            fontFamily: '"Inter", sans-serif', color: '#1a1a1a', fontSize: '0.75rem', letterSpacing: '6px',
            fontWeight: 600, textTransform: 'uppercase', opacity: 0.6
          }}>
            Crafting Experience
          </div>

          {/* Elegant Growing Line */}
          <div style={{
            width: '2px', height: '50px', background: 'rgba(0,0,0,0.05)', margin: '25px 0',
            position: 'relative', overflow: 'hidden', borderRadius: '2px'
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%',
              background: 'linear-gradient(to bottom, #1a1a1a, #444)', height: `${progress}%`,
              transition: 'height 0.2s linear',
              willChange: 'height'
            }} />
          </div>

          <div style={{
            fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '2px', color: '#1a1a1a'
          }}>
            {progress < 10 ? `0${progress}` : progress}%
          </div>
        </div>
      </div>
    </>
  );
};

function AppContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  // Use Performance Context
  const { settings, downgradeTier, tier } = usePerformance();

  // Force initialize audio in the background on mount
  useEffect(() => {
    initAudio();
  }, []);

  const handleSceneReady = useCallback(() => {
    requestAnimationFrame(() => {
      setSceneReady(true);
      setIsLoaded(true); // Automatically set isLoaded since Preloader is disabled
    });
  }, []);

  return (
    <AudioProvider>
      <SceneProvider>
        <GlobalAudioEnabler />
        <div className="app">
          <PremiumLoader isLoaded={isLoaded} />
          {/* Full screen 3D Canvas */}
          <div className="canvas-wrapper">
            <Canvas
              camera={{
                position: [0, 0.2, -30],
                fov: 60,
                near: 0.1,
                far: 150
              }}
              gl={{
                antialias: settings.antialias,
                alpha: false,
                powerPreference: settings.powerPreference,
                localClippingEnabled: true,
                failIfMajorPerformanceCaveat: true
              }}
              dpr={settings.dpr}
              shadows={settings.shadows}
            >
              <color attach="background" args={['#E8ECEF']} />
              <fog attach="fog" args={['#E8ECEF', 15, 50]} />

              {/* Scale performance down if fps drops */}
              <PerformanceMonitor
                onDecline={() => downgradeTier()}
                flipflops={3}
                onFallback={() => downgradeTier()}
              />

              {/* Advanced FPS & Performance Monitor */}
              {/* <Perf position="top-left" minimal={false} /> */}

              <Suspense fallback={null}>
                <Experience
                  isLoaded={isLoaded}
                  onSceneReady={handleSceneReady}
                  performanceTier={tier}
                />
                <Preload all />
              </Suspense>
            </Canvas>
          </div>

          {/* Navigation UI - Hamburger, Map, Back, Audio */}
          {isLoaded && (
            <>
              <NavigationUI />
              <GlobalOverlay />
              <PaperTransition />
              <ScreenReaderOverlay />
            </>
          )}

          {/* 2D Preloader 
          <Preloader
            ready={sceneReady}
            onComplete={() => setIsLoaded(true)}
          />
          */}
        </div>
      </SceneProvider>
    </AudioProvider>
  );
}

import { AchievementsProvider } from './context/AchievementsContext';

export default function App() {
  // Preload browser-based images (for standard <img> tags) immediately upon mounting App
  // This ensures they are in the network waterfall during the initial loading phase.
  useEffect(() => {
    const filteredImages = filterTexturesByDevice(IMAGE_ASSETS, supportsHover);
    // console.log(`[Preload] Triggering browser-level image preloads for ${filteredImages.length} assets.`);
    filteredImages.forEach(path => preloadBrowserImage(path));
  }, []);

  return (
    <PerformanceProvider>
      <AchievementsProvider>
        <AppContent />
      </AchievementsProvider>
    </PerformanceProvider>
  );
}
