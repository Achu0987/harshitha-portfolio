import { useRef, useState, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useTexture, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useScene } from '../../../../context/SceneContext';
import PaperMaterial from './PaperMaterial';
import GalleryClouds from './GalleryClouds';

// Define the unique projects and their textures
const UNIQUE_PROJECTS = [
    {
        id: 'monetune',
        title: 'MONETUNE',
        front: '/textures/gallery/monetuneprzod.webp',
        url: 'https://monetune.pl',
        description: 'MoneTune is a step-by-step blueprint that teaches beginners how to generate passive income using AI-created music. Without any musical skills, you will learn how to easily produce professional tracks, publish them on platforms like Spotify, and monetize your digital assets.',
        techStack: ['/textures/gallery/wordpresslogo.webp', '/textures/gallery/elementorlogo.webp', '/textures/gallery/phplogo.webp', '/textures/gallery/csslogo.webp']
    },
    {
        id: 'timber',
        title: 'TIMBERKITTY',
        front: '/textures/gallery/timberkittyprzod.webp',
        url: 'https://timberkitty.netlify.app',
        description: 'TimberKitty is an addictive, free-to-play browser arcade game built in pure JavaScript. Players control a lumberjack cat to chop wood, save birds, complete daily missions, and compete on global leaderboards.',
        techStack: ['/textures/gallery/jslogo.webp', '/textures/gallery/htmllogo.webp', '/textures/gallery/csslogo.webp', '/textures/gallery/firebaselogo.webp']
    },
    {
        id: 'young',
        title: 'YOUNG MULTI',
        front: '/textures/gallery/youngmultiprzod.webp',
        url: 'https://young-multi-strona.netlify.app',
        description: 'A sleek, modern concept website dedicated to the Polish rapper and creator Young Multi. It serves as a promotional landing page designed to highlight his personal brand, music, and online presence.',
        techStack: ['/textures/gallery/reactlogo.webp', '/textures/gallery/tailwindlogo.webp', '/textures/gallery/htmllogo.webp', '/textures/gallery/netlifylogo.webp']
    },
    {
        id: 'bio',
        title: 'BIO',
        front: '/textures/gallery/bioprzod.webp',
        url: 'https://tomkingbio.netlify.app',
        description: 'A fast, modern personal bio page serving as a central hub for my digital footprint. It showcases my latest coding projects, web development services, YouTube videos, and recommended music artists.',
        techStack: ['/textures/gallery/htmllogo.webp', '/textures/gallery/csslogo.webp', '/textures/gallery/jslogo.webp', '/textures/gallery/netlifylogo.webp']
    },
];

const PROJECT_COUNT = 10; // Keep the count for the infinite scroll feel
const GAP = 2.5;

// === CONFIGURATION ===
// Adjust this value (0.0 to 1.0) to crop the right side of the "Houses" graphic.
// 0.0 = No crop
// 0.2 = 20% crop from the right (corridor side)
const RIGHT_CROP_AMOUNT = 0.2;

// === LINE SOFTNESS ===
// Controls how much to soften black outlines on domki & railing textures.
// 0 = no change (pure black stays black)
// 80 = black becomes ~31% gray (subtle softening)
// 128 = black becomes 50% gray (strong softening)
// 200 = black becomes ~78% gray (very faint lines)
const LINE_SOFTNESS = 120;

/**
 * Processes a Three.js texture to soften black lines.
 * Remaps pixel brightness: black (0) → gray (minBrightness), white (255) → white (255).
 * Alpha channel is preserved untouched.
 */
function softenBlackLines(texture, minBrightness) {
    if (!texture || !texture.image || minBrightness <= 0) return texture;

    const img = texture.image;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const range = 255 - minBrightness;

    for (let i = 0; i < data.length; i += 4) {
        // Remap R, G, B — leave Alpha (i+3) untouched
        data[i] = minBrightness + (data[i] / 255) * range; // R
        data[i + 1] = minBrightness + (data[i + 1] / 255) * range; // G
        data[i + 2] = minBrightness + (data[i + 2] / 255) * range; // B
    }

    ctx.putImageData(imageData, 0, 0);

    const newTexture = new THREE.CanvasTexture(canvas);
    // Copy over relevant properties from the original texture
    newTexture.wrapS = texture.wrapS;
    newTexture.wrapT = texture.wrapT;
    newTexture.repeat.copy(texture.repeat);
    newTexture.offset.copy(texture.offset);
    newTexture.colorSpace = texture.colorSpace;
    newTexture.needsUpdate = true;
    return newTexture;
}

const GalleryRoom = ({ showRoom, onReady }) => {
    const { openOverlay } = useScene();
    const groupRef = useRef();
    const [scrollOffset, setScrollOffset] = useState(0);
    const targetScroll = useRef(0);
    const currentScroll = useRef(0);
    const [selectedCard, setSelectedCard] = useState(null);
    const [globalIsAnimating, setGlobalIsAnimating] = useState(false);
    const cardRefs = useRef([]);

    const handleCardClick = async (clickedIndex) => {
        if (globalIsAnimating) return;

        if (selectedCard === clickedIndex) {
            setGlobalIsAnimating(true);
            await cardRefs.current[clickedIndex].closeCard();
            setSelectedCard(null);
            setGlobalIsAnimating(false);
        } else if (selectedCard !== null) {
            setGlobalIsAnimating(true);
            await cardRefs.current[selectedCard].closeCard();
            setSelectedCard(null);
            await cardRefs.current[clickedIndex].openCard();
            setSelectedCard(clickedIndex);
            setGlobalIsAnimating(false);
        } else {
            setGlobalIsAnimating(true);
            await cardRefs.current[clickedIndex].openCard();
            setSelectedCard(clickedIndex);
            setGlobalIsAnimating(false);
        }
    };

    // Track if we've signaled ready
    const hasSignaledReady = useRef(false);
    const frameCount = useRef(0);
    const FRAMES_TO_WAIT = 5;

    useFrame(() => {
        if (hasSignaledReady.current) return;
        frameCount.current++;
        if (frameCount.current >= FRAMES_TO_WAIT) {
            hasSignaledReady.current = true;
            onReady?.();
        }
    });

    // Config
    const BALCONY_WIDTH = 5;
    const BALCONY_DEPTH = 3;
    const RAILING_HEIGHT = 1.1;

    // --- TEXTURES ---
    // Load all project front textures in a flat array
    const textureUrls = UNIQUE_PROJECTS.map(p => p.front);
    const projectTextures = useTexture(textureUrls);

    // Load the universal back texture and the button texture
    const backTextureRaw = useTexture('/textures/gallery/tylkartki.webp');
    const overlayTextureRaw = useTexture('/textures/gallery/przyciskdotylukartki.webp');

    // Preload tech stack logos to prevent stuttering on first flip
    const allLogos = [
        '/textures/gallery/csslogo.webp',
        '/textures/gallery/elementorlogo.webp',
        '/textures/gallery/firebaselogo.webp',
        '/textures/gallery/htmllogo.webp',
        '/textures/gallery/jslogo.webp',
        '/textures/gallery/netlifylogo.webp',
        '/textures/gallery/phplogo.webp',
        '/textures/gallery/wordpresslogo.webp'
    ];
    useTexture(allLogos);

    // Construct the full list of projects (repeated) with textures attached
    const projects = useMemo(() => {
        return Array.from({ length: PROJECT_COUNT }).map((_, i) => {
            const projectIndex = i % UNIQUE_PROJECTS.length;
            const projectData = UNIQUE_PROJECTS[projectIndex];

            // Extract front texture
            const frontTex = projectTextures[projectIndex];

            // Configure textures
            if (frontTex) {
                frontTex.colorSpace = THREE.SRGBColorSpace;
                // frontTex.encoding = THREE.sRGBEncoding;
            }
            if (backTextureRaw) {
                backTextureRaw.colorSpace = THREE.SRGBColorSpace;
            }
            if (overlayTextureRaw) {
                overlayTextureRaw.colorSpace = THREE.SRGBColorSpace;
            }

            return {
                ...projectData,
                index: i,
                frontTexture: frontTex,
                backTexture: backTextureRaw,
                buttonTexture: overlayTextureRaw
            };
        });
    }, [projectTextures, backTextureRaw, overlayTextureRaw]);

    // Function to scroll to a specific project index
    const scrollToIndex = (index, onComplete) => {
        const totalWidth = PROJECT_COUNT * GAP;
        const targetScrollValue = index * GAP;
        const currentScrollValue = currentScroll.current;

        let diff = targetScrollValue - currentScrollValue;
        const halfWidth = totalWidth / 2;
        while (diff > halfWidth) diff -= totalWidth;
        while (diff < -halfWidth) diff += totalWidth;

        const finalTarget = currentScrollValue + diff;

        gsap.to(targetScroll, {
            current: finalTarget,
            duration: 0.5,
            ease: 'power2.inOut'
        });

        gsap.to(currentScroll, {
            current: finalTarget,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: onComplete
        });
    };

    // --- INTERACTION ---
    useEffect(() => {
        const handleWheel = (e) => {
            if (!showRoom) return;
            // BLOCK SCROLL IF CARD IS SELECTED
            if (selectedCard !== null || globalIsAnimating) return;

            e.preventDefault();
            targetScroll.current += e.deltaY * 0.005;
        };
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [showRoom, selectedCard, globalIsAnimating]);

    const lastTouchX = useRef(0);
    useEffect(() => {
        if (!showRoom) return;

        const handleTouchStart = (e) => {
            // BLOCK TOUCH IF CARD IS SELECTED
            if (selectedCard !== null || globalIsAnimating) return;
            if (e.touches.length === 1) lastTouchX.current = e.touches[0].clientX;
        };
        const handleTouchMove = (e) => {
            // BLOCK TOUCH MOVE IF CARD IS SELECTED
            if (selectedCard !== null || globalIsAnimating) return;

            if (e.touches.length === 1) {
                const deltaX = lastTouchX.current - e.touches[0].clientX;
                lastTouchX.current = e.touches[0].clientX;
                targetScroll.current += deltaX * 0.008;
            }
        };
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [showRoom, selectedCard, globalIsAnimating]);

    useFrame((state, delta) => {
        currentScroll.current = THREE.MathUtils.lerp(currentScroll.current, targetScroll.current, delta * 5);
    });

    // --- GEOMETRY & MATERIALS ---
    const floorTexture = useTexture('/textures/gallery/floor.webp');
    const railingTextureRaw = useTexture('/textures/gallery/railing.webp');
    const housesTextureRaw = useTexture('/textures/gallery/domki.webp');
    const cityTexture = useTexture('/textures/gallery/miastotlo.webp');
    const birdTexture = useTexture('/textures/gallery/bird.webp');

    // Soften black outlines on domki & railing
    const housesTexture = useMemo(() => softenBlackLines(housesTextureRaw, LINE_SOFTNESS), [housesTextureRaw]);
    const railingTexture = useMemo(() => softenBlackLines(railingTextureRaw, LINE_SOFTNESS), [railingTextureRaw]);
    const clothespinTexture = useTexture('/textures/gallery/klamerka.webp');

    useEffect(() => {
        if (floorTexture) {
            floorTexture.wrapS = THREE.MirroredRepeatWrapping;
            floorTexture.wrapT = THREE.MirroredRepeatWrapping;
            floorTexture.repeat.set(0.5, 0.7);
            floorTexture.needsUpdate = true;
        }
        if (railingTexture) {
            railingTexture.wrapS = railingTexture.wrapT = THREE.RepeatWrapping;
            railingTexture.repeat.set(7, 1);
            railingTexture.needsUpdate = true;
        }
    }, [floorTexture, railingTexture]);

    const materials = useMemo(() => {
        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTexture,
            color: '#ffffff',
            roughness: 0.8,
            side: THREE.DoubleSide
        });
        return {
            floor: floorMat,
            rope: new THREE.MeshStandardMaterial({ color: '#666666', roughness: 1 }),
            threshold: new THREE.MeshStandardMaterial({
                map: (() => {
                    // Use existing baseboard texture logic if available, or load new
                    // Since we don't have it loaded here, let's load it or borrow it
                    // Better to load it cleanly here
                    const t = new THREE.TextureLoader().load('/textures/corridor/texturadoprogow.png');
                    t.colorSpace = THREE.SRGBColorSpace;
                    t.wrapS = t.wrapT = THREE.RepeatWrapping;
                    t.repeat.set(15 / 2.524, 1); // 15 width / ~2.5 unit per tile
                    return t;
                })(),
                roughness: 0.9,
                metalness: 0,
                side: THREE.DoubleSide
            })
        };
    }, [floorTexture]);

    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(-16, 3.5, -6),
            new THREE.Vector3(-8, 2.5, -4.5),
            new THREE.Vector3(0, 1.8, -3),
            new THREE.Vector3(8, 2.5, -4.5),
            new THREE.Vector3(16, 3.5, -6),
        ]);
    }, []);

    const ropeGeometry = useMemo(() => {
        return new THREE.TubeGeometry(curve, 64, 0.015, 8, false);
    }, [curve]);

    const floorShape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-1.1, -2.0);
        shape.lineTo(1.1, -2.0);
        shape.lineTo(7.5, 4);
        shape.lineTo(-7.5, 4);
        shape.lineTo(-1.1, -2.0);
        return shape;
    }, []);

    return (
        <group ref={groupRef}>
            <group position={[0, -0.7, -2]}>
                {/* Floor */}
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0, 0]}
                >
                    <shapeGeometry args={[floorShape]} />
                    <primitive object={materials.floor} />
                </mesh>

                {/* Floor Outline */}
                <line rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                    <bufferGeometry>
                        <float32BufferAttribute
                            attach="attributes-position"
                            count={2}
                            array={new Float32Array([7.5, 4, 0, -7.5, 4, 0])}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#999999" />
                </line>

                {/* Railing */}
                <mesh position={[0, RAILING_HEIGHT / 2, -3.9]}>
                    <planeGeometry args={[20, RAILING_HEIGHT]} />
                    <meshStandardMaterial
                        map={railingTexture}
                        transparent={true}
                        side={THREE.DoubleSide}
                        alphaTest={0.1}
                    />
                </mesh>

                {/* === THRESHOLD (At the end of the floor) === */}
                <mesh
                    position={[0, 0.01, -3.9]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[15, 0.15]} />
                    <primitive object={materials.threshold} />
                </mesh>

                {/* === CLOTHESLINE SYSTEM === */}
                <group position={[0, 1.6, -4]}>
                    <mesh geometry={ropeGeometry} material={materials.rope} />

                    {/* Proj Cards */}
                    {projects.map((project, i) => (
                        <ProjectCard
                            key={i}
                            index={i}
                            ref={el => cardRefs.current[i] = el}
                            project={project}
                            clothespinTexture={clothespinTexture}
                            total={PROJECT_COUNT}
                            currentScroll={currentScroll}
                            materials={materials}
                            curve={curve}
                            isSelected={selectedCard === i}
                            scrollToIndex={scrollToIndex}
                            onClick={handleCardClick}
                        />
                    ))}
                </group>

                {/* === SCENERY LAYERS === */}
                {/* Houses - center */}
                <mesh position={[0, -1, -9]} scale={[1, 1, 1]}>
                    <planeGeometry args={[15, 6]} />
                    <meshBasicMaterial
                        map={housesTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* Houses - left side (mirrored) */}
                <mesh position={[-15, -1, -9]} scale={[-1, 1, 1]}>
                    <planeGeometry args={[15, 6]} />
                    <meshBasicMaterial
                        map={housesTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* Houses - right side (mirrored) - CROPPED */}
                <RightSideHouses
                    texture={housesTexture}
                    baseWidth={15}
                    baseHeight={6}
                    cropAmount={RIGHT_CROP_AMOUNT}
                />

                {/* City skyline - center */}
                <mesh position={[0, 3.4, -17]} scale={[1, 1, 1]}>
                    <planeGeometry args={[30, 10]} />
                    <meshBasicMaterial
                        map={cityTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* City skyline - left (mirrored) */}
                <mesh position={[-30, 3.4, -17]} scale={[-1, 1, 1]}>
                    <planeGeometry args={[30, 10]} />
                    <meshBasicMaterial
                        map={cityTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* City skyline - right (mirrored) */}
                <mesh position={[30, 3.4, -17]} scale={[-1, 1, 1]}>
                    <planeGeometry args={[30, 10]} />
                    <meshBasicMaterial
                        map={cityTexture}
                        transparent={true}
                        alphaTest={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Flying Bird */}
                <FlyingBird texture={birdTexture} />

                {/* Clouds scattered above */}
                <GalleryClouds count={25} seed={123} />

                {/* Skybox/Environment */}
                <mesh position={[0, 5, -20]}>
                    <sphereGeometry args={[40, 32, 32]} />
                    <meshBasicMaterial color="#f0f0f0" side={THREE.BackSide} transparent opacity={0.5} />
                </mesh>
            </group>
        </group>
    );
};

// Flying bird animation component
const FlyingBird = ({ texture }) => {
    const birdRef = useRef();
    const startX = -20;
    const endX = 20;
    const speed = 0.8; // Units per second

    useFrame((state) => {
        if (!birdRef.current) return;

        const time = state.clock.getElapsedTime();

        // Move from left to right, loop back
        const progress = ((time * speed) % (endX - startX + 10)) + startX;
        birdRef.current.position.x = progress;

        // Gentle bobbing motion
        birdRef.current.position.y = 4.5 + Math.sin(time * 2) * 0.3;

        // Slight banking when flying
        birdRef.current.rotation.z = Math.sin(time * 1.5) * 0.1;
    });

    return (
        <mesh ref={birdRef} position={[-20, 4.5, -10]} scale={[0.8, 0.8, 0.8]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial
                map={texture}
                transparent={true}
                alphaTest={0.1}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// Sub-component for individual project cards
const ProjectCard = forwardRef(({ index, project, clothespinTexture, currentScroll, materials, curve, isSelected, scrollToIndex, onClick }, ref) => {
    const cardRef = useRef();
    const paperRef = useRef(); // Ref for the moving part (Paper)
    const materialRef = useRef();
    const textRef = useRef(); // Ref for the text that sticks to the paper
    const buttonGroupRef = useRef(); // Ref for the interactive back button
    const detailsGroupRef = useRef(); // Ref for the project details on the back
    const techStackGroupRef = useRef(); // Ref for the tech stack section on the back
    const [hovered, setHovered] = useState(false);
    const [btnHovered, setBtnHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);  // True ONLY during flip animation
    const [isScrolling, setIsScrolling] = useState(false);  // True during scroll phase

    // Random sway properties
    const swaySpeed = useRef(Math.random() * 0.2 + 0.3); // Slower sway speed
    const swayOffset = useRef(Math.random() * 100);

    useImperativeHandle(ref, () => ({
        closeCard: () => {
            return new Promise((resolve) => {
                setIsAnimating(true);

                const timeline = gsap.timeline({
                    onComplete: () => {
                        setIsAnimating(false);
                        resolve();
                    }
                });

                const localBaseY = -1.1;

                timeline.to(paperRef.current.position, {
                    y: localBaseY + 0.6,
                    x: 0,
                    z: 1,
                    duration: 0.35,
                    ease: 'power2.in'
                });

                timeline.to(paperRef.current.rotation, {
                    x: 0.5,
                    z: -0.05,
                    y: 0,
                    duration: 0.35,
                    ease: 'power2.in'
                }, '<');

                if (materialRef.current) {
                    timeline.to(materialRef.current, {
                        bend: 0.6,
                        duration: 0.3,
                        ease: 'power2.in'
                    }, '<');
                }

                timeline.to(paperRef.current.scale, {
                    x: 1, y: 1, z: 1,
                    duration: 0.3, ease: 'sine.inOut'
                }, '<');

                timeline.to(paperRef.current.position, {
                    y: localBaseY,
                    x: 0,
                    z: 0,
                    duration: 0.25,
                    ease: 'power3.out'
                });

                timeline.to(paperRef.current.rotation, {
                    x: 0, y: 0, z: 0,
                    duration: 0.25,
                    ease: 'power3.out'
                }, '<');

                if (materialRef.current) {
                    timeline.to(materialRef.current, {
                        bend: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    }, '<');
                }
            });
        },
        openCard: () => {
            return new Promise((resolve) => {
                setIsScrolling(true);
                scrollToIndex(index, () => {
                    setIsScrolling(false);
                    setIsAnimating(true);

                    const isMobile = window.innerWidth < 768;
                    const targetX_World = 0;
                    const targetY_World = isMobile ? -0.2 : 0.1;
                    const targetZ_World = isMobile ? 0.5 : 1.5;

                    const parentPos = cardRef.current.position;
                    const targetX = targetX_World - parentPos.x;
                    const targetY = targetY_World - parentPos.y;
                    const targetZ = targetZ_World - parentPos.z;

                    const timeline = gsap.timeline({
                        onComplete: () => {
                            setIsAnimating(false);
                            resolve();
                        }
                    });

                    timeline.to(cardRef.current.rotation, {
                        x: 0, y: 0, z: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    }, 0);

                    if (materialRef.current) materialRef.current.bend = 0;

                    const localBaseY = -1.1;

                    timeline.to(paperRef.current.position, {
                        y: localBaseY - 0.5,
                        duration: 0.15,
                        ease: 'power2.out'
                    });

                    timeline.to(paperRef.current.rotation, {
                        x: 0.5,
                        z: -0.05,
                        duration: 0.15,
                        ease: 'power2.out'
                    }, '<');

                    if (materialRef.current) {
                        timeline.to(materialRef.current, {
                            bend: 0.8,
                            duration: 0.15,
                            ease: 'power2.out'
                        }, '<');
                    }

                    timeline.to(paperRef.current.position, {
                        y: localBaseY + 1.5,
                        x: targetX * 0.2,
                        z: targetZ * 0.2,
                        duration: 0.4,
                        ease: 'power1.out'
                    });

                    timeline.to(paperRef.current.rotation, {
                        x: Math.PI * 0.8,
                        z: 0.05,
                        y: -0.02,
                        duration: 0.4,
                        ease: 'power1.inOut'
                    }, '<');

                    if (materialRef.current) {
                        timeline.to(materialRef.current, {
                            bend: -0.3,
                            duration: 0.4,
                            ease: 'power1.inOut'
                        }, '<');
                    }

                    timeline.to(paperRef.current.position, {
                        y: targetY,
                        x: targetX,
                        z: targetZ,
                        duration: 0.4,
                        ease: 'power3.out'
                    });

                    timeline.to(paperRef.current.rotation, {
                        x: Math.PI,
                        y: 0,
                        z: 0,
                        duration: 0.4,
                        ease: 'power3.out'
                    }, '<');

                    if (materialRef.current) {
                        timeline.to(materialRef.current, {
                            bend: 0,
                            duration: 0.5,
                            ease: 'power2.out'
                        }, '<');
                    }

                    timeline.to(paperRef.current.scale, {
                        x: 1.1,
                        y: 1.1,
                        z: 1.1,
                        duration: 0.3,
                        ease: 'sine.out'
                    }, '-=0.4');
                });
            });
        }
    }));

    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick) onClick(index);
    };

    // Cursor change on hover
    useEffect(() => {
        if (btnHovered && isSelected) {
            document.body.style.cursor = 'pointer';
        } else if (hovered && !isSelected) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'auto';
        }
        return () => { document.body.style.cursor = 'auto'; };
    }, [hovered, isSelected, btnHovered]);

    useFrame((state) => {
        if (!cardRef.current) return;

        // --- Zrównaj pozycję tekstu Z z animacją zaginania i falowania kartki (PRZÓD) ---
        if (textRef.current && materialRef.current) {
            const y = textRef.current.position.y;
            const uBend = materialRef.current.bend;
            const uWindStrength = materialRef.current.windStrength || 0;
            const uTime = state.clock.getElapsedTime();

            const bendAmount = Math.pow(y, 2.0) * uBend;
            const totalWind = 0.02 + uWindStrength;
            const flutter = Math.sin(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));

            textRef.current.position.z = bendAmount + flutter + 0.02;

            // Obrót tekstu by przylegał do krzywizny (pochodna dz/dy)
            const dz_dy = 2.0 * y * uBend + 2.0 * Math.cos(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));
            textRef.current.rotation.x = Math.atan(dz_dy);
        }

        // --- Zrównaj pozycję przycisku Z z animacją pleców (TYŁ) ---
        if (buttonGroupRef.current && materialRef.current) {
            const y = buttonGroupRef.current.position.y;
            const uBend = materialRef.current.bend;
            const uWindStrength = materialRef.current.windStrength || 0;
            const uTime = state.clock.getElapsedTime();

            const bendAmount = Math.pow(y, 2.0) * uBend;
            const totalWind = 0.02 + uWindStrength;
            const flutter = Math.sin(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));

            // PAMIĘTAJ! Cała płaszczyzna zgina się w przód (+Z względem rodzica).
            // A że my jesteśmy PO ZEWNĘTRZNEJ stronie (z tyłu pleców), chcemy być ułamek za płaszczyzną, np -0.03
            // Wcześniej omyłkowo odwróciłem znak całego równania ( -(bendAmount...) ), co odwróciło falowanie. Prawidłowo jest tak:
            buttonGroupRef.current.position.z = bendAmount + flutter - 0.03;

            // Obrót przycisku by przylegał do krzywizny, będąc po przeciwnej stronie (dodatkowe odwrócenie o Pi)
            const dz_dy = 2.0 * y * uBend + 2.0 * Math.cos(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));
            buttonGroupRef.current.rotation.x = Math.PI + Math.atan(dz_dy);

            // Hover animacja powiększania dla przycisku (napis się powiększa)
            const targetScale = btnHovered ? 1.08 : 1;
            buttonGroupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.15);
        }

        // --- Zrównaj pozycję górnego opisu (PROJECT DETAILS) ---
        if (detailsGroupRef.current && materialRef.current) {
            const y = detailsGroupRef.current.position.y;
            const uBend = materialRef.current.bend;
            const uWindStrength = materialRef.current.windStrength || 0;
            const uTime = state.clock.getElapsedTime();

            const bendAmount = Math.pow(y, 2.0) * uBend;
            const totalWind = 0.02 + uWindStrength;
            const flutter = Math.sin(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));

            // Z tyłu (jak button)
            detailsGroupRef.current.position.z = bendAmount + flutter - 0.03;

            // Obrót
            const dz_dy = 2.0 * y * uBend + 2.0 * Math.cos(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));
            detailsGroupRef.current.rotation.x = Math.PI + Math.atan(dz_dy);
        }

        // --- Zrównaj pozycję sekcji Tech Stack ---
        if (techStackGroupRef.current && materialRef.current) {
            const y = techStackGroupRef.current.position.y;
            const uBend = materialRef.current.bend;
            const uWindStrength = materialRef.current.windStrength || 0;
            const uTime = state.clock.getElapsedTime();

            const bendAmount = Math.pow(y, 2.0) * uBend;
            const totalWind = 0.02 + uWindStrength;
            const flutter = Math.sin(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));

            techStackGroupRef.current.position.z = bendAmount + flutter - 0.03;

            const dz_dy = 2.0 * y * uBend + 2.0 * Math.cos(uTime * 2.0 + y * 2.0) * totalWind * (1.0 + Math.abs(uBend * 3.0));
            techStackGroupRef.current.rotation.x = Math.PI + Math.atan(dz_dy);
        }

        // Skip position updates ONLY during flip animation, NOT during scroll
        if (isAnimating || isSelected) return;

        const totalWidth = PROJECT_COUNT * GAP; // GAP is available in scope because we are in the file where GAP is defined
        let rawX = (index * GAP) - currentScroll.current;
        const halfWidth = totalWidth / 2;
        let displayX = ((rawX + halfWidth) % totalWidth + totalWidth) % totalWidth - halfWidth;

        const u = (displayX + 16) / 32;
        const safeU = THREE.MathUtils.clamp(u, 0, 1);
        const pointOnCurve = curve.getPointAt(safeU);

        cardRef.current.position.set(pointOnCurve.x, pointOnCurve.y, pointOnCurve.z);

        // Wind / Sway Animation
        const time = state.clock.getElapsedTime();
        const wind = Math.sin(time * swaySpeed.current + swayOffset.current) * 0.05;

        cardRef.current.rotation.z = wind;
        cardRef.current.rotation.x = 0;

        // Visibility Check (fade out if too far)
        const dist = Math.abs(displayX);
        const scale = THREE.MathUtils.clamp(1 - (dist / 50), 0.7, 1);
        cardRef.current.scale.setScalar(scale);
    });

    return (
        <group
            ref={cardRef}
            onClick={handleClick}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
            onPointerOut={() => setHovered(false)}
        >
            {/* Clothespin (Top Center) - Does NOT move with paperRef */}
            <mesh position={[0, -0.08, 0.15]} rotation={[0, 0, Math.PI]}>
                <planeGeometry args={[0.3, 0.2]} />
                <meshBasicMaterial
                    map={clothespinTexture}
                    transparent={true}
                    alphaTest={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* The Paper / Card hanging down - This moves independently now */}
            <group
                ref={paperRef}
                position={[0, -1.1, 0]}
            >
                <mesh>
                    <planeGeometry args={[1.5, 2, 16, 16]} />
                    <PaperMaterial
                        ref={materialRef}
                        color="#ffffff"
                        map={project.frontTexture}
                        mapBack={project.backTexture}
                        side={THREE.DoubleSide}
                        roughness={0.6}
                    />
                </mesh>

                {/* === PRZYCISK: OPEN NA PLECACH KARTKI === */}
                <group
                    ref={buttonGroupRef}
                    position={[0, 0.75, 0]}
                    rotation={[Math.PI, 0, 0]}
                >
                    {/* Warstwa 1: Wizualna ramka przycisku (bez eventów) */}
                    <mesh>
                        <planeGeometry args={[1.2, 0.35]} />
                        <meshBasicMaterial
                            map={project.buttonTexture}
                            transparent={true}
                            alphaTest={0.05}
                        />
                    </mesh>

                    {/* Warstwa 2: Napis OPEN PROJECT (bez eventów) */}
                    <Text
                        position={[0, 0, 0.01]}
                        fontSize={0.11}
                        color={btnHovered ? "#333333" : "#1c1c1c"}
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="middle"
                    >
                        OPEN PROJECT
                    </Text>

                    {/* Warstwa 3: Niewidoczny hit-area pokrywający cały przycisk - łapie WSZYSTKIE eventy */}
                    <mesh
                        position={[0, 0, 0.02]}
                        onClick={(e) => {
                            if (isSelected) {
                                e.stopPropagation();
                                window.open(project.url, '_blank');
                            }
                        }}
                        onPointerOver={(e) => {
                            if (isSelected) {
                                e.stopPropagation();
                                setBtnHovered(true);
                            }
                        }}
                        onPointerOut={(e) => {
                            e.stopPropagation();
                            setBtnHovered(false);
                        }}
                    >
                        <planeGeometry args={[1.2, 0.35]} />
                        <meshBasicMaterial transparent={true} opacity={0} />
                    </mesh>
                </group>

                {/* === TEKST NA PLECACH KARTKI (PROJECT DETAILS) === */}
                <group
                    ref={detailsGroupRef}
                    position={[0, -0.5, 0]} // Miejsce u góry (gdy Y=0.75 to dół, to Y=-0.4 to góra)
                    rotation={[Math.PI, 0, 0]}
                >
                    <Text
                        position={[0, 0.28, 0.01]} // Względem środka detailsGroupRef, wyżej
                        fontSize={0.10}
                        color="#1c1c1c"
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="middle"
                    >
                        PROJECT DETAILS:
                    </Text>

                    <Text
                        position={[0, 0.2, 0.01]} // Poniżej nagłówka
                        fontSize={0.06}
                        color="#333333"
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="top"
                        maxWidth={1.1} // Maksymalna szerokość zanim zacznie łamać linie
                        lineHeight={1.4}
                        textAlign="center"
                    >
                        {project.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco."}
                    </Text>
                </group>

                {/* === SEKCJA TECH STACK NA PLECACH KARTKI === */}
                <group
                    ref={techStackGroupRef}
                    position={[0, 0.30, 0]} // Pomiędzy Project Details a przyciskiem Open Project
                    rotation={[Math.PI, 0, 0]}
                >
                    <Text
                        position={[0, 0.15, 0.01]}
                        fontSize={0.08}
                        color="#1c1c1c"
                        font="/fonts/CabinSketch-Bold.ttf"
                        anchorX="center"
                        anchorY="middle"
                    >
                        TECH STACK
                    </Text>

                    {/* Kontener na loga układane poziomo */}
                    <group position={[0, -0.05, 0.01]}>
                        {project.techStack && project.techStack.map((logoPath, idx) => {
                            // Rozstawienie kwadracików (4 sztuki wyśrodkowane)
                            const spacing = 0.30;
                            const startX = -((project.techStack.length - 1) * spacing) / 2;
                            const xPos = startX + (idx * spacing);

                            return (
                                <TechStackLogo key={idx} path={logoPath} position={[xPos, 0, 0]} />
                            );
                        })}
                    </group>
                </group>

                {/* 
                  === TEKST / TYTUŁY PROJEKTÓW ===
                  Tu możesz łatwo dostosować wygląd każdego napisu.
                  
                  position: [X, Y, Z] 
                  > X to lewo/prawo (0 to środek)
                  > Y to góra/dół (np. 0.75 to góra kartki, -0.75 dół)
                  > Z nie ruszać. Skrypt powyżej sam wylicza Z, żeby napis zginał się i przyklejał do fali kartki!
                  
                  fontSize: rozmiar fontu (domyślnie 0.15)
                  color: kolor napisu
                  font: opcjonalnie dajesz tu inną czcionkę z folderu /public/fonts/
                */}
                <Text
                    ref={textRef}
                    position={[0, 0.7, 0]} // Tylko dwa pierwsze parametry [X, Y] mają tutaj znaczenie
                    fontSize={0.20}
                    color="#1c1c1c"
                    font="/fonts/CabinSketch-Bold.ttf"
                    anchorX="center"
                    anchorY="middle"
                >
                    {project.title}
                </Text>
            </group>
        </group>
    );
});


// Component to handle the cropped right-side houses
const RightSideHouses = ({ texture, baseWidth, baseHeight, cropAmount }) => {
    // Clone texture to allow independent UV manipulation
    const croppedTexture = useMemo(() => {
        const t = texture.clone();
        // Because scale.x is -1 (mirrored), the "Right" side in world space
        // corresponds to the "Left" side of the texture (U=0).
        // To crop the world-right side, we need to crop the texture-left side.
        // So we increase offset.x.
        t.offset.x = cropAmount;
        t.repeat.x = 1 - cropAmount;
        t.needsUpdate = true;
        return t;
    }, [texture, cropAmount]);

    // Calculate new width and position
    const newWidth = baseWidth * (1 - cropAmount);

    // Original Inner Edge (World Left of this mesh) was at CenterX - Width/2
    // For the Right Side Mesh: 
    // Original Pos = 15. Width = 15.
    // Inner Edge = 15 - 7.5 = 7.5.
    // We want to keep Inner Edge at 7.5.
    // New Center = Inner Edge + NewWidth / 2
    const newX = 7.5 + (newWidth / 2);

    return (
        <mesh position={[newX, -1, -9]} scale={[-1, 1, 1]}>
            <planeGeometry args={[newWidth, baseHeight]} />
            <meshBasicMaterial
                map={croppedTexture}
                transparent={true}
                alphaTest={0.1}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// Sub-component for individual tech stack logos
const TechStackLogo = ({ path, position }) => {
    const texture = useTexture(path);

    return (
        <mesh position={position}>
            <planeGeometry args={[0.17, 0.17]} />
            <meshBasicMaterial
                map={texture}
                transparent={true}
            />
        </mesh>
    );
};

export default GalleryRoom;
