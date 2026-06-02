import { useState, useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Text, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import SkyChunk, { CHUNK_LENGTH, ROOM_Z } from './SkyChunk';
import { useScene } from '../../../../context/SceneContext';
import '../../shaders/RevealBasicMaterial'; // Registers brush-stroke reveal for BasicMaterial
import { isTouchDevice } from '../../../../utils/deviceDetect';

// Reusable Vector3 to avoid allocations in event handlers
const _tempVec3 = new THREE.Vector3();

/**
 * InfiniteSkyManager Component
 * 
 * Manages dynamic generation/removal of sky chunks for infinite scroll.
 * World group moves with scroll, chunks stay at fixed positions relative to group.
 * Includes Story Milestones that loop with the content!
 */

import { useAudio } from '../../../../context/AudioManager';

export const BALLOON_AUDIO_SETTINGS = {
    volume: 1.0,
    distance: 2,
    rolloff: 2
};

/**
 * Reusable Button Component with Hover Effect + Brush-Stroke Reveal
 */
const AwardButton = ({ onClick, texture, paintedTexture, width, height, position, onHoverChange }) => {
    const isTouch = isTouchDevice();
    const meshRef = useRef();
    const buttonRevealRef = useRef(); // RevealBasicMaterial ref for button sketch
    const paintedRef = useRef(); // Painted button mesh visibility
    const hideDelayRef = useRef(); // Track pending gsap.delayedCall
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Smoothly lerp scale based on hover state
            const targetScale = hovered ? 1.05 : 1.0;
            const lerpFactor = 10 * delta;

            meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, lerpFactor);
            meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, lerpFactor);
            meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, lerpFactor);
        }
    });

    const handlePointerOver = () => {
        if (isTouch) return;
        setHovered(true);
        document.body.style.cursor = 'pointer';
        onHoverChange?.(true);

        // Brush-stroke reveal button
        if (buttonRevealRef.current) {
            gsap.to(buttonRevealRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (hideDelayRef.current) hideDelayRef.current.kill();
        if (paintedRef.current) {
            paintedRef.current.visible = true;
            if (paintedRef.current.material) paintedRef.current.material.opacity = 1;
        }
    };

    const handlePointerOut = () => {
        if (isTouch) return;
        setHovered(false);
        document.body.style.cursor = 'auto';
        onHoverChange?.(false);

        // Reverse reveal
        if (buttonRevealRef.current) {
            gsap.to(buttonRevealRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        hideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (paintedRef.current && paintedRef.current.material) {
                paintedRef.current.material.opacity = 0;
            }
        });
    };

    return (
        <group ref={meshRef} position={position}>
            {/* Painted button (behind) - hidden until hover */}
            <mesh ref={paintedRef} position={[0, 0, -0.001]} visible={true}>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial color="#e0e0e0"
                    map={paintedTexture}
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                    alphaTest={0.5}
                    depthWrite={false}
                />
            </mesh>
            {/* Sketch button (front) with reveal */}
            <mesh
                onClick={onClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <planeGeometry args={[width, height]} />
                <revealBasicMaterial
                    ref={buttonRevealRef}
                    map={texture}
                    transparent
                    side={THREE.DoubleSide}
                    alphaTest={0.1}
                    depthWrite={false}
                    uProgress={0.0}
                />
            </mesh>
            <Text
                position={[0, 0, 0.05]}
                fontSize={0.25}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                VIEW
            </Text>
        </group>
    );
};

// Story milestones configuration
// Each milestone appears once per "story cycle" (6 chunks = 240 units)
const STORY_CYCLE_LENGTH = 240;

// === TWARDA LINIA ZANIKANIA DLA MILESTONES (WORLD SPACE) ===
// Pokój About jest na Z = -25, więc -25 to drzwi pokoju
// -27 = 2 metry za drzwiami (w głąb pokoju) - musi matchować CORRIDOR_CLIP_Z w SkyChunk
const MILESTONE_CORRIDOR_CLIP_Z = -8.0;

const InfiniteSkyManager = ({ scrollProgressRef }) => {
    // PRE-CALCULATED FOR scrolProgress = 0
    // currentChunk = floor(0/40) = 0 -> [-1, 0, 1, 2]
    const [activeChunks, setActiveChunks] = useState([-1, 0, 1, 2]);
    // currentStoryCycle = floor(0/160) = 0 -> [-1, 0, 1]
    const [activeStoryCycles, setActiveStoryCycles] = useState([-1, 0, 1]);
    const worldRef = useRef();

    // Track current chunk for recycling
    const getCurrentChunk = (worldZ) => {
        return Math.floor(worldZ / CHUNK_LENGTH);
    };

    // Track current story cycle
    const getCurrentStoryCycle = (worldZ) => {
        return Math.floor(worldZ / STORY_CYCLE_LENGTH);
    };

    // Update chunks based on world position
    useFrame(() => {
        if (!worldRef.current) return;

        const scrollProgress = scrollProgressRef?.current || 0;

        // Move world directly
        worldRef.current.position.z = scrollProgress;

        // Figure out which chunk we're in
        const currentChunk = getCurrentChunk(scrollProgress);
        const shouldBeActiveChunks = [
            currentChunk - 1,
            currentChunk,
            currentChunk + 1,
            currentChunk + 2,
        ];

        const chunksNeedUpdate = shouldBeActiveChunks.some(c => !activeChunks.includes(c)) ||
            activeChunks.some(c => !shouldBeActiveChunks.includes(c));

        if (chunksNeedUpdate) {
            setActiveChunks(shouldBeActiveChunks);
        }

        // Update story cycles
        const currentStoryCycle = getCurrentStoryCycle(scrollProgress);
        const shouldBeActiveCycles = [
            currentStoryCycle - 1,
            currentStoryCycle,
            currentStoryCycle + 1,
        ];

        const cyclesNeedUpdate = shouldBeActiveCycles.some(c => !activeStoryCycles.includes(c)) ||
            activeStoryCycles.some(c => !shouldBeActiveCycles.includes(c));

        if (cyclesNeedUpdate) {
            setActiveStoryCycles(shouldBeActiveCycles);
        }
    });

    return (
        <group ref={worldRef}>
            {/* === SKY CHUNKS WITH CLOUDS === */}
            {activeChunks.map((chunkIndex) => (
                <SkyChunk
                    key={`sky-chunk-${chunkIndex}`}
                    chunkIndex={chunkIndex}
                    seed={42}
                    scrollProgressRef={scrollProgressRef}
                />
            ))}

            {/* === STORY MILESTONES (loop every 160 units) === */}
            {activeStoryCycles.map((cycleIndex) => (
                <group key={`story-cycle-${cycleIndex}`}>
                    {/* === INTRO MILESTONE === */}
                    <IntroMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 15)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === SERVICES MILESTONE === */}
                    <ServicesMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 55)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === JOURNEY MILESTONE === */}
                    <JourneyMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 95)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === SKILLS MILESTONE === */}

                    <SkillsMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 135)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === DOORS MILESTONE === */}
                    <DoorsMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 175)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === THANK YOU MILESTONE === */}
                    <ThankYouMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 215)}
                        scrollProgressRef={scrollProgressRef}
                    />
                </group>
            ))}
        </group>
    );
};

/**
 * INTRO Milestone - Special detailed layout
 * Elements spread apart as they approach camera
 */
const IntroMilestone = ({ z, scrollProgressRef }) => {
    // Load avatar texture
    const avatarTexture = useLoader(THREE.TextureLoader, '/textures/about/awatarnachmurce_clear.png');
    const { camera, viewport } = useThree();
    const isTouch = isTouchDevice();

    // Refs for all animated elements
    const groupRef = useRef();
    const titleRef = useRef();
    const brandRef = useRef();
    const avatarRef = useRef();
    const motto1Ref = useRef();
    const motto2Ref = useRef();

    // Base positions
    const baseY = 2;

    // Use actual dimensions (1024x1024) to prevent stretching
    const legacyAspectRatio = 1024 / 1024;
    const avatarWidth = 9; // Increased avatar size
    const avatarHeight = avatarWidth / legacyAspectRatio;

    // Animation: floating + spread apart when close
    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;

        // === TWARDA LINIA CLIP (RĘCZNE OBLICZENIE WORLD Z) ===
        // worldZ = pokój(-25) + scrollProgress + lokalna pozycja milestone
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;

        // Skip rest if not visible
        if (!groupRef.current.visible) return;

        // FIX: Use consistent distance based on scrollProgress + offset
        // This ensures animations work IDENTICALLY regardless of chunk/camera position
        // Base Start Z (-15) + Scroll (0) - Offset (55) = -70 (Matches "Working" Chunk 0 feel)
        const distanceZ = z + scrollProgress - 55;

        // Spread effect: starts at z = -25, full spread at z = -5
        // This makes elements spread BEFORE they reach the camera
        // === EDYTUJ TUTAJ (INTRO) ===
        // Zwiększ różnicę między Start a End, żeby animacja była wolniejsza
        const spreadStart = -70; // Startuje wcześniej
        const spreadEnd = -50;   // Kończy później
        let spreadFactor = 0;

        if (distanceZ > spreadStart && distanceZ < spreadEnd) {
            // Calculate spread: 0 at spreadStart, 1 at spreadEnd
            spreadFactor = (distanceZ - spreadStart) / (spreadEnd - spreadStart);
            spreadFactor = Math.min(1, Math.max(0, spreadFactor));
            // Ease out for smoother animation
            spreadFactor = spreadFactor * spreadFactor;
        } else if (distanceZ >= spreadEnd) {
            spreadFactor = 1;
        }

        // Apply spread to elements (move left/right) - MORE AGGRESSIVE
        const maxSpread = 15; // How far elements spread (increased!)

        if (titleRef.current) {
            titleRef.current.position.x = -spreadFactor * maxSpread * 0.8;
        }
        if (brandRef.current) {
            brandRef.current.position.x = spreadFactor * maxSpread * 0.6;
        }
        if (avatarRef.current) {
            // Avatar: floating + spread upward
            avatarRef.current.position.y = baseY + Math.sin(time * 0.8) * 0.15 + spreadFactor * 3;
            avatarRef.current.position.x = -spreadFactor * maxSpread * 0.3;
        }
        if (motto1Ref.current) {
            motto1Ref.current.position.x = spreadFactor * maxSpread * 0.7;
        }
        if (motto2Ref.current) {
            motto2Ref.current.position.x = -spreadFactor * maxSpread * 0.5;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Main title - Name (spreads left) */}
            <Text
                ref={titleRef}
                position={[0, 5.8, 0.1]}
                fontSize={0.8}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
            >
                Harshitha Ganesan
            </Text>

            {/* Subtitle - Brand (spreads right) */}
            <Text
                ref={brandRef}
                position={[0, 4.9, 0.1]}
                fontSize={0.45}
                color="#4a4a4a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
            >
                (Achuu)
            </Text>

            {/* Avatar on cloud - floating + spreads up-left */}
            <mesh ref={avatarRef} position={[0, baseY, 0]}>
                <planeGeometry args={[avatarWidth, avatarHeight]} />
                <meshBasicMaterial color="#ffffff"
                    map={avatarTexture}
                    transparent
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Motto - Line 1 (spreads right) */}
            <Text
                ref={motto1Ref}
                position={[0, -1.3, 0.1]}
                fontSize={0.32}
                color="#555555"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
                fontStyle="italic"
            >
                "Creative Software Developer
            </Text>

            {/* Motto - Line 2 (spreads left) */}
            <Text
                ref={motto2Ref}
                position={[0, -1.9, 0]}
                fontSize={0.32}
                color="#555555"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
                fontStyle="italic"
            >
                App Developer (Mobile Apps) "
            </Text>
        </group>
    );
};

/**
 * SERVICES Milestone - 2x2 Grid of Floating Cards
 */
const ServiceCard = ({ title, icon, x, y, delay, texture, paintedTexture, scrollProgressRef, z, cardWidth, cardHeight }) => {
    const isTouch = isTouchDevice();
    const groupRef = useRef();
    const revealRef = useRef();
    const paintedRef = useRef();
    const hideDelayRef = useRef();
    const [hovered, setHovered] = useState(false);

    const handlePointerOver = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';

        if (revealRef.current) {
            gsap.to(revealRef.current, { uProgress: 1.0, duration: 0.8, ease: 'power2.out', overwrite: true });
        }
        if (hideDelayRef.current) hideDelayRef.current.kill();
        if (paintedRef.current) {
            paintedRef.current.visible = true;
            if (paintedRef.current.material) paintedRef.current.material.opacity = 1;
        }
    };

    const handlePointerOut = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';

        if (revealRef.current) {
            gsap.to(revealRef.current, { uProgress: 0.0, duration: 0.5, ease: 'power2.out', overwrite: true });
        }
        hideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (paintedRef.current && paintedRef.current.material) {
                paintedRef.current.material.opacity = 0;
            }
        });
    };

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const scrollProgress = scrollProgressRef?.current || 0;
        const distanceZ = z + scrollProgress - 55;

        // Spread & reveal animation
        const revealStart = -110 + delay * 10;
        const revealEnd = -40;
        let factor = 0;

        if (distanceZ > revealStart && distanceZ < revealEnd) {
            factor = (distanceZ - revealStart) / (revealEnd - revealStart);
            factor = Math.min(1, Math.max(0, factor));
            factor = 1 - Math.pow(1 - factor, 3);
        } else if (distanceZ >= revealEnd) {
            factor = 1;
        }

        const time = state.clock.elapsedTime;
        const floatY = Math.sin(time * 1.5 + delay * 0.5) * 0.08;
        const floatX = Math.cos(time * 1.2 + delay * 0.5) * 0.04;

        groupRef.current.position.x = (x * factor) + floatX;
        groupRef.current.position.y = (y * factor) + floatY;

        // Gentle tilt based on float
        groupRef.current.rotation.z = Math.sin(time * 1.5 + delay * 0.5) * 0.02;

        const targetScale = hovered ? 1.08 : 1.0;
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 8 * delta);
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <mesh ref={paintedRef} position={[0, 0, -0.001]} visible={true}>
                <planeGeometry args={[cardWidth, cardHeight]} />
                <meshBasicMaterial color="#e0e0e0" map={paintedTexture} transparent opacity={0} side={THREE.DoubleSide} alphaTest={0.5} />
            </mesh>
            <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
                <planeGeometry args={[cardWidth, cardHeight]} />
                <revealBasicMaterial ref={revealRef} map={texture} transparent side={THREE.DoubleSide} uProgress={0.0} />
            </mesh>
            {/* Content overlay */}
            <Text position={[0, 0.4, 0.05]} fontSize={0.6} color="#1a1a1a" anchorX="center" anchorY="middle">
                {icon}
            </Text>
            <Text position={[0, -0.2, 0.05]} fontSize={0.28} color="#1a1a1a" anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf" textAlign="center" lineHeight={1.2}>
                {title}
            </Text>
        </group>
    );
};

const ServicesMilestone = ({ z, scrollProgressRef }) => {
    const { camera, viewport } = useThree();
    const isTouch = isTouchDevice();
    const groupRef = useRef();

    // Reusing SOTY texture as it looks like a nice sketch card
    const cardTexture = useLoader(THREE.TextureLoader, '/textures/about/SOTY.webp');
    const cardPaintedTexture = useLoader(THREE.TextureLoader, isTouch ? '/textures/about/SOTY.webp' : '/textures/about/SOTY_painted.webp');

    cardTexture.colorSpace = THREE.SRGBColorSpace;
    cardPaintedTexture.colorSpace = THREE.SRGBColorSpace;

    const cardLegacyAspect = 2400 / 1760;
    const cardHeight = 2.4;
    const cardWidth = cardHeight * cardLegacyAspect;

    const services = [
        { title: 'Website\nDevelopment', icon: '💻', x: -cardWidth * 0.58, y: cardHeight * 0.55, delay: 0 },
        { title: 'Landing Page\nDesign', icon: '🎨', x: cardWidth * 0.63, y: cardHeight * 0.55, delay: 1 },
        { title: 'E-commerce\nDevelopment', icon: '🛍️', x: -cardWidth * 0.65, y: -cardHeight * 0.65, delay: 2 },
        { title: 'Mobile App\nDevelopment', icon: '📱', x: cardWidth * 0.68, y: -cardHeight * 0.75, delay: 3 }
    ];

    useFrame((state) => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
    });

    return (
        <group ref={groupRef} position={[0, 2, z]}>
            <Text position={[0, 4.5, 0.5]} fontSize={1.2} color="#1a1a1a" anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
                SERVICES
            </Text>
            {services.map((svc, i) => (
                <ServiceCard key={i} {...svc} texture={cardTexture} paintedTexture={cardPaintedTexture} scrollProgressRef={scrollProgressRef} z={z} cardWidth={cardWidth} cardHeight={cardHeight} />
            ))}
        </group>
    );
};

/**
 * JOURNEY Milestone - Floating Islands
 * UO Island (left) and Freelance Island (right) floating in clouds
 */
const JourneyMilestone = ({ z, scrollProgressRef }) => {
    const { camera, viewport } = useThree();
    const isTouch = isTouchDevice();
    const groupRef = useRef();
    const revealFactorRef = useRef(0);
    const timeRef = useRef(0);

    const texA = useLoader(THREE.TextureLoader, '/textures/about/freelancewyspa.webp');
    const patchTex = useLoader(THREE.TextureLoader, '/textures/about/button.webp');
    texA.colorSpace = THREE.SRGBColorSpace;
    patchTex.colorSpace = THREE.SRGBColorSpace;

    const iH = 3.3; // Slightly smaller to ensure all 4 fit on screen
    const iW = iH * (2816 / 1536);

    // Use freelance texture (texA) for all 4 islands
    // Perfectly aligned rows: Top row at y=2.0, Bottom row at y=-0.8 (shifted up so it doesn't cut off)
    const islands = [
        { texture: texA, year: '2023', role: 'Career Start', xPos: -3.4, yPos: 2.0, floatPhase: 0.0, floatSpeed: 0.45, revealDelay: 0.00 },
        { texture: texA, year: '2024', role: 'Fullstack Developer', xPos: 3.4, yPos: 2.0, floatPhase: 1.5, floatSpeed: 0.50, revealDelay: 0.10 },
        { texture: texA, year: '2025', role: 'Mobile App Developer', xPos: -3.4, yPos: -0.8, floatPhase: 3.0, floatSpeed: 0.42, revealDelay: 0.20 },
        { texture: texA, year: '2026', role: 'Designer & Trainer', xPos: 3.4, yPos: -0.8, floatPhase: 4.5, floatSpeed: 0.48, revealDelay: 0.30 },
    ];

    useFrame((state) => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        timeRef.current = state.clock.elapsedTime;
        const dist = z + scrollProgress - 55;
        revealFactorRef.current = Math.min(1, Math.max(0, (dist + 100) / 80));
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Title */}
            <Text
                position={[0, 5, 0.3]}
                fontSize={1.2}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
            >
                JOURNEY
            </Text>

            {/* Subtitle */}
            <Text
                position={[0, 4.2, 0.3]}
                fontSize={0.35}
                color="#555555"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
            >
                My path so far...
            </Text>

            {islands.map((isl, i) => (
                <JourneyIsland
                    key={`island-${i}`}
                    texture={isl.texture}
                    patchTexture={patchTex}
                    islandW={iW}
                    islandH={iH}
                    year={isl.year}
                    role={isl.role}
                    xPos={isl.xPos}
                    yPos={isl.yPos}
                    floatPhase={isl.floatPhase}
                    floatSpeed={isl.floatSpeed}
                    revealDelay={isl.revealDelay}
                    revealFactorRef={revealFactorRef}
                    timeRef={timeRef}
                />
            ))}
        </group>
    );
};

const JourneyIsland = ({
    texture, patchTexture, islandW, islandH,
    year, role,
    xPos, yPos, floatPhase, floatSpeed,
    revealDelay, revealFactorRef, timeRef,
}) => {
    const ref = useRef();

    useFrame((state) => {
        if (!ref.current) return;

        const revealFactor = revealFactorRef?.current ?? 0;
        const time = timeRef?.current ?? state.clock.elapsedTime;

        // Staggered slide-up reveal
        const delayed = Math.min(1, Math.max(0, (revealFactor - revealDelay) / (1 - revealDelay + 0.001)));
        const eased = 1 - Math.pow(1 - delayed, 3);

        // Slide up from below
        ref.current.position.y = (yPos - 5) + eased * 5;
        ref.current.position.x = xPos;

        // Gentle floating bob (after reveal)
        ref.current.position.y += Math.sin(time * floatSpeed + floatPhase) * 0.15 * eased;

        // Very subtle tilt
        ref.current.rotation.z = Math.sin(time * floatSpeed * 0.5 + floatPhase) * 0.025 * eased;
    });

    // The baked text is in the top quarter of the island.
    // Shifted slightly up and made taller to completely hide the stone text peeking over the top.
    const patchY = islandH * 0.24;
    const patchW = islandW * 0.95;
    const patchH = islandH * 0.38;

    // The hanging wooden sign is near the bottom (freelance texture specific)
    const yearY = -islandH * 0.145;

    return (
        <group ref={ref} position={[xPos, yPos - 5, 0]}>
            {/* Island image */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[islandW, islandH]} />
                <meshBasicMaterial
                    map={texture}
                    transparent
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* --- PAPER PATCH (Covers the baked text beautifully) --- */}
            <mesh position={[0, patchY, 0.05]}>
                <planeGeometry args={[patchW, patchH]} />
                <meshBasicMaterial
                    map={patchTexture}
                    transparent
                    depthWrite={false}
                />
            </mesh>

            {/* Role text (on the cloud patch) */}
            <Text
                position={[0, patchY, 0.1]}
                fontSize={0.34}
                color="#111111"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
                textAlign="center"
                maxWidth={patchW * 0.8}
                lineHeight={1.1}
                renderOrder={5}
            >
                {role}
            </Text>

            {/* Year text (on the bottom hanging wooden sign) */}
            <Text
                position={[0, yearY, 0.1]}
                fontSize={0.45}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
                letterSpacing={0.06}
                renderOrder={5}
            >
                {year}
            </Text>
        </group>
    );
};

/**
 * SKILLS Milestone - Floating Balloons
 * Colorful balloons floating upward, each representing a skill
 */

// Balloon configuration: size category, texture path, position offset
// === EDYTUJ WYSOKOŚĆ TUTAJ (zmień wartość 'y' dla każdego balona) ===
const BALLOON_CONFIG = [
    // Large balloons (main skills) - front and center
    { texture: '/textures/about/reactduzybalon.webp', paintedTexture: '/textures/about/reactduzybalon_painted.webp', label: 'React', size: 'large', x: -2.5, y: 2, z: 0.3, phase: 0 },
    { texture: '/textures/about/threejsduzybalon.webp', paintedTexture: '/textures/about/threejsduzybalon_painted.webp', label: 'Three.js', size: 'large', x: 2.5, y: 2.5, z: 0.2, phase: 1.5 },
    { texture: '/textures/about/GSAPduzybalon.webp', paintedTexture: '/textures/about/GSAPduzybalon_painted.webp', label: 'GSAP', size: 'large', x: 0, y: 3, z: 0.5, phase: 3 },

    // Medium balloons - scattered around
    { texture: '/textures/about/JSSREDNIBALON.webp', paintedTexture: '/textures/about/JSSREDNIBALON_painted.webp', label: 'JavaScript', size: 'medium', x: -4, y: 1, z: -0.3, phase: 0.8 },
    { texture: '/textures/about/csssrednibalon.webp', paintedTexture: '/textures/about/csssrednibalon_painted.webp', label: 'CSS', size: 'medium', x: 4, y: 1.5, z: -0.2, phase: 2.2 },
    { texture: '/textures/about/nextjssrednibalon.webp', paintedTexture: '/textures/about/nextjssrednibalon_painted.webp', label: 'Next.js', size: 'medium', x: 0, y: 0.5, z: -0.4, phase: 4 },

    // Small balloons - background accents
    { texture: '/textures/about/htmlmalybalon.webp', paintedTexture: '/textures/about/htmlmalybalon_painted.webp', label: 'HTML', size: 'small', x: -5.5, y: 2.5, z: -0.8, phase: 1.2 },
    { texture: '/textures/about/gitmalybalon.webp', paintedTexture: '/textures/about/gitmalybalon_painted.webp', label: 'Git', size: 'small', x: 5.5, y: 3, z: -0.7, phase: 2.8 },
    { texture: '/textures/about/figmamalybalon.webp', paintedTexture: '/textures/about/figmamalybalon_painted.webp', label: 'Figma', size: 'small', x: -3, y: 4.5, z: -0.5, phase: 3.5 },
    { texture: '/textures/about/firebasemalybalon.webp', paintedTexture: '/textures/about/firebasemalybalon_painted.webp', label: 'Firebase', size: 'small', x: 3.5, y: 4, z: -0.6, phase: 4.5 },
];

// Size multipliers for balloon categories
const SIZE_MULTIPLIERS = {
    large: 3.0,
    medium: 2.2,
    small: 1.6,
};

// Individual balloon component
const SkillBalloon = ({ config, revealFactorRef, spreadFactorRef, timeRef }) => {
    const { viewport } = useThree();
    const isTouch = isTouchDevice();
    const texture = useLoader(THREE.TextureLoader, config.texture);
    const paintedTextureUrl = isTouch ? config.texture : config.paintedTexture;
    const paintedTexture = useLoader(THREE.TextureLoader, paintedTextureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    paintedTexture.colorSpace = THREE.SRGBColorSpace;

    const [isPopping, setIsPopping] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [isFadingOutText, setIsFadingOutText] = useState(false);
    const popRef = useRef(0);
    const textFadeRef = useRef(1); // 1 = fully visible, 0 = hidden
    const respawnOffsetRef = useRef(0); // For floating back up after respawn
    const balloonMatRef = useRef();
    const balloonRevealRef = useRef(); // RevealBasicMaterial ref for sketch
    const paintedMeshRef = useRef(); // Painted balloon mesh visibility
    const paintedMatRef = useRef(); // Painted balloon material opacity control
    const hideDelayRef = useRef(); // Track pending gsap.delayedCall
    const textRef = useRef();

    // Audio Ref
    const balloonAudioRef = useRef();
    const { globalVolume, isMuted } = useAudio();

    const playBalloonSound = () => {
        if (balloonAudioRef.current) {
            const vol = isMuted ? 0 : BALLOON_AUDIO_SETTINGS.volume * globalVolume;
            balloonAudioRef.current.setVolume(vol);
            if (balloonAudioRef.current.isPlaying) balloonAudioRef.current.stop();
            balloonAudioRef.current.play();
        }
    };

    // LEGACY FIX: Use original aspect ratios from BALLOON_CONFIG or hardcoded for categories
    const legacyAspects = {
        'reactduzybalon.webp': 736 / 1447,
        'threejsduzybalon.webp': 1141 / 1964,
        'GSAPduzybalon.webp': 1.0, // GSAP balloon is square
        'default_small_medium': 631 / 1482 // Common ratio for others
    };

    const filename = config.texture.split('/').pop();
    const aspect = legacyAspects[filename] || legacyAspects['default_small_medium'];
    const baseHeight = SIZE_MULTIPLIERS[config.size];

    const outerGroupRef = useRef();
    const innerGroupRef = useRef();
    const targetScale = useRef(1.0);
    const currentScale = useRef(1.0);
    const targetMagnet = useRef({ x: 0, y: 0 });
    const currentMagnet = useRef({ x: 0, y: 0 });

    // === RESPONSYWNOŚĆ ===
    // Na mobile (wąski viewport) balony są bliżej środka
    const positionScale = isTouch ? 0.5 : 1; // Jak bardzo ściskamy pozycje na mobile
    const spreadScale = isTouch ? 0.4 : 1;   // Jak bardzo zmniejszamy spread na mobile
    const sizeScale = isTouch ? 0.85 : 1;    // Trochę mniejsze balony na mobile

    // Cursor handling
    useEffect(() => {
        if (hovered && !isPopping) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'auto';
        }
    }, [hovered, isPopping]);

    // Handle text fade out timer
    useEffect(() => {
        if (isPopping) {
            // Start fading out text after 3 seconds
            const timer = setTimeout(() => {
                setIsFadingOutText(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isPopping]);

    // Hover handlers for brush-stroke reveal
    const handlePointerOver = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        if (!isPopping) setHovered(true);

        // Brush-stroke reveal: show painted balloon
        if (balloonRevealRef.current) {
            gsap.to(balloonRevealRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (hideDelayRef.current) hideDelayRef.current.kill();
        if (paintedMeshRef.current) paintedMeshRef.current.visible = true;
        if (paintedMatRef.current) paintedMatRef.current.opacity = 1;
    };

    const handlePointerOut = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        setHovered(false);

        // Reverse reveal
        if (balloonRevealRef.current) {
            gsap.to(balloonRevealRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        hideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (paintedMatRef.current) paintedMatRef.current.opacity = 0;
        });
    };

    // Animation update loop
    useFrame((state, delta) => {
        if (hovered && !isPopping) {
            targetScale.current = 1.05; // lekkie powiększenie
        } else {
            targetScale.current = 1.0;
            targetMagnet.current.x = 0;
            targetMagnet.current.y = 0;
        }

        currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, 8 * delta);
        currentMagnet.current.x = THREE.MathUtils.lerp(currentMagnet.current.x, targetMagnet.current.x, 8 * delta);
        currentMagnet.current.y = THREE.MathUtils.lerp(currentMagnet.current.y, targetMagnet.current.y, 8 * delta);

        if (isPopping) {
            // Smooth, slow pop animation
            popRef.current = THREE.MathUtils.lerp(popRef.current, 1, 2.5 * delta);

            // Also hide painted mesh during pop (kill any pending reveals)
            if (hideDelayRef.current) hideDelayRef.current.kill();
            if (balloonRevealRef.current) {
                balloonRevealRef.current.uProgress = 0;
            }
        }

        if (isFadingOutText) {
            // Fade out the text slowly
            textFadeRef.current = THREE.MathUtils.lerp(textFadeRef.current, 0, 2 * delta);

            // Once fully faded, respawn the balloon from below
            if (textFadeRef.current < 0.05) {
                setIsPopping(false);
                setHovered(false);
                setIsFadingOutText(false);
                popRef.current = 0;
                textFadeRef.current = 1;
                respawnOffsetRef.current = -12; // Teleport below to float up again

                // Immediately teleport the mesh to prevent pointer events at the old location
                if (outerGroupRef.current) {
                    outerGroupRef.current.position.y -= 12;
                }

                // Immediately reset opacities to prevent flashing
                if (balloonRevealRef.current) balloonRevealRef.current.opacity = 1;
                if (textRef.current) textRef.current.fillOpacity = 0;
                // Reset reveal state on respawn
                if (balloonRevealRef.current) balloonRevealRef.current.uProgress = 0;
                if (paintedMatRef.current) paintedMatRef.current.opacity = 0;
                if (paintedMeshRef.current) paintedMeshRef.current.visible = false;
            }
        }

        // Float back up if respawning
        if (respawnOffsetRef.current < -0.01) {
            respawnOffsetRef.current = THREE.MathUtils.lerp(respawnOffsetRef.current, 0, 1.5 * delta);
        }

        // Apply opacities if not fully respawned
        if (balloonRevealRef.current && isPopping) {
            balloonRevealRef.current.opacity = 1 - popRef.current;
        }
        if (paintedMatRef.current && isPopping) {
            paintedMatRef.current.opacity = 1 - popRef.current;
        }
        if (textRef.current && isPopping) {
            // Combine pop-in and fade-out opacities
            textRef.current.fillOpacity = popRef.current * textFadeRef.current;
            textRef.current.outlineOpacity = popRef.current * textFadeRef.current;
        }
    });

    // Floating animation with unique phase — now computed inside useFrame
    // Moved from render body to avoid re-renders

    // Bazowa pozycja X (skalowana na mobile)
    const baseX = config.x * positionScale;

    // P2: Compute position/scale/rotation imperatively inside useFrame
    useFrame(() => {
        if (!outerGroupRef.current) return;

        const time = timeRef.current;
        const revealFactor = revealFactorRef.current;
        const spreadFactor = spreadFactorRef.current;

        // Floating animation with unique phase
        const floatY = Math.sin(time * 0.6 + config.phase) * 0.3;
        const floatX = Math.sin(time * 0.4 + config.phase * 0.7) * 0.15;
        const rotation = Math.sin(time * 0.3 + config.phase) * 0.08;

        // Reveal: balloons float up from below, including respawn offset
        const startY = config.y - 8;
        const endY = config.y;
        const currentY = startY + revealFactor * (endY - startY) + floatY + respawnOffsetRef.current;

        // Scale up as they reveal
        let scale = revealFactor * sizeScale;
        const popScaleEffect = currentScale.current + popRef.current * 0.4;
        scale *= popScaleEffect;

        // === SPREAD EFFECT (ROZSUWANIE) ===
        const maxSpread = 15 * spreadScale;
        let spreadX = 0;

        if (config.x < -0.5) {
            spreadX = -spreadFactor * maxSpread * (0.5 + Math.abs(config.x) / 6);
        } else if (config.x > 0.5) {
            spreadX = spreadFactor * maxSpread * (0.5 + Math.abs(config.x) / 6);
        } else {
            spreadX = config.phase > 3.5
                ? spreadFactor * maxSpread * 0.8
                : -spreadFactor * maxSpread * 0.8;
        }

        // Apply imperatively
        outerGroupRef.current.position.set(baseX + floatX + spreadX, currentY, config.z);
        outerGroupRef.current.rotation.z = rotation;
        const s = Math.max(0.001, scale); // Avoid zero scale
        outerGroupRef.current.scale.set(s, s, s);

        // Update magnet position on inner group imperatively
        if (innerGroupRef.current) {
            innerGroupRef.current.position.set(currentMagnet.current.x, currentMagnet.current.y, 0);
        }
    });

    return (
        <group
            ref={outerGroupRef}
            position={[baseX, config.y - 8, config.z]}
        >
            <group ref={innerGroupRef}>
                {/* Painted balloon (behind) - hidden until hover */}
                <mesh ref={paintedMeshRef} visible={true}>
                    <planeGeometry args={[baseHeight * aspect, baseHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        ref={paintedMatRef}
                        map={paintedTexture}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        alphaTest={0.5}
                        depthWrite={false}
                    />
                </mesh>

                {/* Sketch balloon (front) with brush-stroke reveal */}
                <mesh
                    position={[0, 0, 0.001]}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isPopping) {
                            setIsPopping(true);
                            playBalloonSound();
                        }
                    }}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                    onPointerMove={(e) => {
                        if (hovered && !isPopping && outerGroupRef.current) {
                            outerGroupRef.current.getWorldPosition(_tempVec3);
                            // Reduced magnetic pull from 0.5 to 0.15 for gentler effect
                            targetMagnet.current.x = (e.point.x - _tempVec3.x) * 0.15;
                            targetMagnet.current.y = (e.point.y - _tempVec3.y) * 0.15;
                        }
                    }}
                    visible={popRef.current < 0.99}
                >
                    <planeGeometry args={[baseHeight * aspect, baseHeight]} />
                    <revealBasicMaterial
                        ref={balloonRevealRef}
                        map={texture}
                        transparent
                        side={THREE.DoubleSide}
                        depthWrite={false}
                        uProgress={0.0}
                    />
                </mesh>

                {/* Stack Name Text that fades in then out */}
                {isPopping && textFadeRef.current > 0.01 && (
                    <Text
                        ref={textRef}
                        position={[0, 0, 0.1]}
                        fontSize={baseHeight * 0.4}
                        color="#1a1a1a"
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/RubikScribble-Regular.ttf"
                        fillOpacity={0}
                        outlineWidth={0.02}
                        outlineColor="#fff"
                        outlineOpacity={0}
                    >
                        {config.label}
                    </Text>
                )}

                <PositionalAudio
                    ref={balloonAudioRef}
                    url="/sounds/baloonpoop.mp3"
                    distanceModel="exponential"
                    rolloffFactor={BALLOON_AUDIO_SETTINGS.rolloff}
                    refDistance={BALLOON_AUDIO_SETTINGS.distance}
                    loop={false}
                />
            </group>
        </group>
    );
};

const SkillsMilestone = ({ z, scrollProgressRef }) => {
    const { camera, viewport } = useThree();
    const isTouch = isTouchDevice();
    const groupRef = useRef();
    // P2: Use refs instead of state to avoid 60 re-renders/sec inside useFrame
    const revealFactorRef = useRef(0);
    const spreadFactorRef = useRef(0);
    const timeRef = useRef(0);

    useFrame((state) => {
        if (!groupRef.current) return;

        // === TWARDA LINIA CLIP (RĘCZNE OBLICZENIE WORLD Z) ===
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        timeRef.current = state.clock.elapsedTime;

        // FIX: Use consistent distance based on scrollProgress + offset
        const distanceZ = z + scrollProgress - 55;

        // Reveal effect (balloons float up)
        // === EDYTUJ TUTAJ (SKILLS REVEAL) ===
        const revealStart = -100;
        const revealEnd = -25;
        let newRevealFactor = 0;

        if (distanceZ > revealStart && distanceZ < revealEnd) {
            newRevealFactor = (distanceZ - revealStart) / (revealEnd - revealStart);
            newRevealFactor = Math.min(1, Math.max(0, newRevealFactor));
            newRevealFactor = 1 - Math.pow(1 - newRevealFactor, 3); // ease out cubic
        } else if (distanceZ >= revealEnd) {
            newRevealFactor = 1;
        }

        revealFactorRef.current = newRevealFactor;

        // === SPREAD EFFECT (EDYTUJ TUTAJ SKILLS SPREAD) ===
        // Im bliżej kamery, tym bardziej balony się rozsuwają
        // Większy zakres = dłuższa, bardziej widoczna animacja
        const spreadStart = -70; // Kiedy animacja SIĘ ZACZYNA (Wcześniej)
        const spreadEnd = -40;    // Kiedy animacja jest PEŁNA (Później)
        let newSpreadFactor = 0;

        if (distanceZ > spreadStart && distanceZ < spreadEnd) {
            newSpreadFactor = (distanceZ - spreadStart) / (spreadEnd - spreadStart);
            newSpreadFactor = Math.min(1, Math.max(0, newSpreadFactor));
            newSpreadFactor = newSpreadFactor * newSpreadFactor; // ease in
        } else if (distanceZ >= spreadEnd) {
            newSpreadFactor = 1;
        }

        spreadFactorRef.current = newSpreadFactor;
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Title */}
            <Text
                position={[0, 6, 0.5]}
                fontSize={1.2}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
            >
                SKILLS
            </Text>

            {/* Subtitle */}
            <Text
                position={[0, 5.2, 0.5]}
                fontSize={0.35}
                color="#555555"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
            >
                Technologies I love working with
            </Text>

            {/* === FLOATING BALLOONS === */}
            {BALLOON_CONFIG.map((config, index) => (
                <SkillBalloon
                    key={index}
                    config={config}
                    revealFactorRef={revealFactorRef}
                    spreadFactorRef={spreadFactorRef}
                    timeRef={timeRef}
                />
            ))}
        </group>
    );
};

// =========================================
// NOTE: Use this component inside the loop!
// =========================================

const DoorsMilestone = ({ z, scrollProgressRef }) => {
    const { camera, viewport } = useThree();
    const isTouch = isTouchDevice();
    const groupRef = useRef();

    useFrame((state) => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
    });

    const doors = [
        { label: 'About Us', roomId: 'AboutMain', type: 'about', x: -7.5, y: 0.5, delay: 0 },
        { label: 'Projects', roomId: 'Gallery', type: 'projekty', x: 0, y: 0.5, delay: 1 },
        { label: 'Contact', roomId: 'Contact', type: 'kontakt', x: 7.5, y: 0.5, delay: 2 }
    ];

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            <Text position={[0, 5.5, 0.5]} fontSize={1.2} color="#1a1a1a" anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
                EXPLORE
            </Text>
            <Text position={[0, 4.5, 0.5]} fontSize={0.35} color="#555555" anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
                Where to next?
            </Text>
            {doors.map((door, i) => (
                <FloatingDoor key={i} {...door} scrollProgressRef={scrollProgressRef} z={z} />
            ))}
        </group>
    );
};

const FloatingDoor = ({ label, roomId, type, x, y, delay, z, scrollProgressRef }) => {
    const isTouch = isTouchDevice();
    const groupRef = useRef();
    const revealRef = useRef();
    const paintedRef = useRef();
    const hideDelayRef = useRef();
    const [hovered, setHovered] = useState(false);

    // Use proper themed clean door textures instead of the sticker one
    const texUrl = `/textures/corridor/doors/drzwi${type}.webp`;
    const paintedTexUrl = isTouch ? texUrl : `/textures/corridor/doors/drzwi${type}_painted.webp`;

    const texture = useLoader(THREE.TextureLoader, texUrl);
    const paintedTexture = useLoader(THREE.TextureLoader, paintedTexUrl);

    texture.colorSpace = THREE.SRGBColorSpace;
    paintedTexture.colorSpace = THREE.SRGBColorSpace;

    const { teleportToRoom } = useScene();

    // Increased size while maintaining the 1.2 x 2.2 aspect ratio of the corridor doors
    const doorWidth = 3.6;
    const doorHeight = 6.6;

    const handlePointerOver = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';

        if (revealRef.current) {
            gsap.to(revealRef.current, { uProgress: 1.0, duration: 0.8, ease: 'power2.out', overwrite: true });
        }
        if (hideDelayRef.current) hideDelayRef.current.kill();
        if (paintedRef.current) {
            paintedRef.current.visible = true;
            if (paintedRef.current.material) paintedRef.current.material.opacity = 1;
        }
    };

    const handlePointerOut = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';

        if (revealRef.current) {
            gsap.to(revealRef.current, { uProgress: 0.0, duration: 0.5, ease: 'power2.out', overwrite: true });
        }
        hideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (paintedRef.current && paintedRef.current.material) {
                paintedRef.current.material.opacity = 0;
            }
        });
    };

    const handleClick = (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
        if (roomId === 'AboutMain') {
            window.location.href = '/about';
        } else if (roomId === 'Contact') {
            window.location.href = '/contact';
        } else if (roomId === 'Gallery') {
            window.location.href = '/projects';
        } else if (roomId) {
            teleportToRoom(roomId);
        }
    };

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const scrollProgress = scrollProgressRef?.current || 0;
        const distanceZ = z + scrollProgress - 55;

        // Spread & reveal animation
        const revealStart = -130 + delay * 10;
        const revealEnd = -40;
        let factor = 0;

        if (distanceZ > revealStart && distanceZ < revealEnd) {
            factor = (distanceZ - revealStart) / (revealEnd - revealStart);
            factor = Math.min(1, Math.max(0, factor));
            factor = 1 - Math.pow(1 - factor, 3);
        } else if (distanceZ >= revealEnd) {
            factor = 1;
        }

        const time = state.clock.elapsedTime;
        const floatY = Math.sin(time * 1.5 + delay * 0.5) * 0.15;
        const floatX = Math.cos(time * 1.2 + delay * 0.5) * 0.08;

        const startY = y - 10;
        const currentY = startY + (y - startY) * factor + floatY;

        groupRef.current.position.x = x + floatX;
        groupRef.current.position.y = currentY;
        groupRef.current.rotation.z = Math.sin(time * 1.5 + delay * 0.5) * 0.03;

        const targetScale = hovered ? 1.05 : 1.0;
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 8 * delta);
    });

    return (
        <group ref={groupRef} position={[x, y - 10, 0]}>
            <mesh ref={paintedRef} position={[0, 0, -0.001]} visible={true}>
                <planeGeometry args={[doorWidth, doorHeight]} />
                <meshBasicMaterial color="#e0e0e0" map={paintedTexture} transparent opacity={0} side={THREE.DoubleSide} alphaTest={0.5} />
            </mesh>
            <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
                <planeGeometry args={[doorWidth, doorHeight]} />
                <revealBasicMaterial ref={revealRef} map={texture} transparent side={THREE.DoubleSide} uProgress={0.0} alphaTest={0.1} depthWrite={false} />
            </mesh>

            {/* Label in the center of the door */}
            <mesh position={[0, 0.1, 0.04]}>
                <planeGeometry args={[label.length * 0.25 + 0.8, 1.2]} />
                <meshBasicMaterial color="#f0f0f0" transparent opacity={0.85} />
            </mesh>
            <Text position={[0, 0.1, 0.05]} fontSize={0.7} color="#1a1a1a" anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
                {label}
            </Text>
        </group>
    );
};

const ConfettiParticle = ({ position, color, delay }) => {
    const meshRef = useRef();
    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime + delay;
        meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.8;
        meshRef.current.position.x = position[0] + Math.cos(time * 1.2) * 0.3;
        meshRef.current.rotation.x = time * 2.5;
        meshRef.current.rotation.y = time * 2;
    });
    return (
        <mesh ref={meshRef} position={position}>
            <boxGeometry args={[0.25, 0.25, 0.05]} />
            <meshBasicMaterial color={color} />
        </mesh>
    );
};

const ThankYouMilestone = ({ z, scrollProgressRef }) => {
    const { camera } = useThree();
    const groupRef = useRef();
    const textRef = useRef();

    useFrame((state) => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;

        // Gentle floating animation
        const time = state.clock.elapsedTime;
        if (textRef.current) {
            textRef.current.position.y = 4 + Math.sin(time * 2) * 0.2;
            textRef.current.rotation.z = Math.sin(time * 1.5) * 0.02;
        }
    });

    // Generate static confetti configuration once
    const [confetti] = useState(() => {
        const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#9D50BB'];
        return Array.from({ length: 35 }).map(() => ({
            position: [
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 10 + 4,
                (Math.random() - 0.5) * 2
            ],
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            delay: Math.random() * 5
        }));
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            <group ref={textRef}>
                <Text position={[0, 0, 0.5]} fontSize={2.5} color="#1a1a1a" anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
                    THANK YOU
                </Text>

                <Text position={[0, -1.8, 0.5]} fontSize={0.6} color="#555555" anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
                    For exploring my journey
                </Text>

                {/* Decorative background behind text */}
                <mesh position={[0, -0.4, 0.1]}>
                    <planeGeometry args={[16, 6]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
                </mesh>
            </group>

            {/* Confetti Particles */}
            {confetti.map((props, i) => (
                <ConfettiParticle key={i} {...props} />
            ))}
        </group>
    );
};

export default InfiniteSkyManager;
