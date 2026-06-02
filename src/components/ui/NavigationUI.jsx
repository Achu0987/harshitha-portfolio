import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useScene } from '../../context/SceneContext';
import { useAudio } from '../../context/AudioManager';
import { setMusicVolume, getMusicVolume } from '../../utils/audioManager';
import { useAchievements } from '../../context/AchievementsContext';
import AchievementPopup from './AchievementPopup';
import AchievementsPanel from './AchievementsPanel';
import '../../styles/NavigationUI.scss';

// Room data for the map - positions are percentages on the map image
// These positions correspond to the visual elements on the map
const ROOMS = [
    { id: 'about', label: 'About', x: 43, y: 38 },      // Paper airplane (left side)
    { id: 'gallery', label: 'Projects', x: 43, y: 72 },  // City buildings (bottom left)
    { id: 'contact', label: 'Contact', x: 57, y: 25 },  // Pier/dock (top right)
    { id: 'studio', label: 'Explore', x: 57, y: 55 },    // Monitors stack (right side)
];

// Pin starting position - the dashed circle at the bottom of the tower
const PIN_START_POSITION = { x: 50.5, y: 97 };

const NavigationUI = () => {
    const { currentRoom, isInRoom, requestExit, hasEntered, teleportTo, isTeleporting } = useScene();
    const { isMuted, toggleMute, globalVolume, setGlobalVolume } = useAudio();
    const { showTutorial, unlockAchievement } = useAchievements();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hoveredRoom, setHoveredRoom] = useState(null);
    const [isExiting, setIsExiting] = useState(false); // Track when back button is clicked

    // Audio controls state
    const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [bgmVol, setBgmVol] = useState(0.3);
    const [isUIHidden, setIsUIHidden] = useState(false);

    // Refs for focus management
    const mapPanelRef = useRef();
    const mapCloseRef = useRef();

    useEffect(() => {
        const handleInspectChange = (e) => {
            setIsUIHidden(e.detail);
            if (e.detail) {
                setIsMenuOpen(false);
                setIsAudioMenuOpen(false);
                setIsAchievementsOpen(false);
            }
        };
        window.addEventListener('inspectChange', handleInspectChange);
        return () => window.removeEventListener('inspectChange', handleInspectChange);
    }, []);

    const paintedMapsRefs = {
        about: useRef(),
        gallery: useRef(),
        contact: useRef(),
        studio: useRef()
    };

    useEffect(() => {
        // About (zone: left 10%, top 20%, width 30%, height 35%)
        // -> X: 10% to 40%, Y: 20% to 55%
        if (paintedMapsRefs.about.current) {
            gsap.to(paintedMapsRefs.about.current, {
                clipPath: (hoveredRoom === 'about' || currentRoom === 'about')
                    ? 'polygon(10% 20%, 40% 20%, 40% 55%, 10% 55%)'
                    : 'polygon(10% 20%, 10% 20%, 10% 55%, 10% 55%)',
                duration: 0.5,
                ease: "power2.out"
            });
        }

        // Gallery (zone: left 10%, bottom 8%, width 30%, height 35%)
        // -> X: 10% to 40%, Y: 57% to 92% (since bottom=8% means top is 100-8-35=57%)
        if (paintedMapsRefs.gallery.current) {
            gsap.to(paintedMapsRefs.gallery.current, {
                clipPath: (hoveredRoom === 'gallery' || currentRoom === 'gallery')
                    ? 'polygon(10% 57%, 40% 57%, 40% 92%, 10% 92%)'
                    : 'polygon(10% 57%, 10% 57%, 10% 92%, 10% 92%)',
                duration: 0.5,
                ease: "power2.out"
            });
        }

        // Contact (zone: right 5%, top 10%, width 35%, height 25%)
        // -> X: 60% to 95% (since right=5% means left is 100-5-35=60%), Y: 10% to 35%
        if (paintedMapsRefs.contact.current) {
            gsap.to(paintedMapsRefs.contact.current, {
                clipPath: (hoveredRoom === 'contact' || currentRoom === 'contact')
                    ? 'polygon(60% 10%, 95% 10%, 95% 35%, 60% 35%)'
                    : 'polygon(95% 10%, 95% 10%, 95% 35%, 95% 35%)',
                duration: 0.5,
                ease: "power2.out"
            });
        }

        // Studio / Explore (zone: right 15%, bottom 19%, width 25%, height 40%)
        if (paintedMapsRefs.studio.current) {
            gsap.to(paintedMapsRefs.studio.current, {
                clipPath: (hoveredRoom === 'studio' || currentRoom === 'studio')
                    ? 'polygon(60% 41%, 85% 41%, 85% 81%, 60% 81%)'
                    : 'polygon(85% 41%, 85% 41%, 85% 81%, 85% 81%)',
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }, [hoveredRoom, currentRoom]);

    useEffect(() => {
        setBgmVol(getMusicVolume());

        const handleMusicVolumeChange = (e) => {
            setBgmVol(e.detail);
        };
        window.addEventListener('musicVolumeChanged', handleMusicVolumeChange);

        return () => window.removeEventListener('musicVolumeChanged', handleMusicVolumeChange);
    }, []);

    const handleBgmChange = (val) => {
        setBgmVol(val);
        setMusicVolume(val);
    };

    // Show entrance hint before entering, and explore hint when user enters
    useEffect(() => {
        if (!hasEntered && !isTeleporting) {
            showTutorial('corridor_enter');
        } else if (hasEntered && !isTeleporting && !isInRoom) {
            showTutorial('corridor_explore');
        }
    }, [hasEntered, isTeleporting, isInRoom, showTutorial]);

    // Close menu when entering a room or starting teleport
    useEffect(() => {
        if (isInRoom || isTeleporting) {
            setIsMenuOpen(false);
            setIsAudioMenuOpen(false);
            setIsAchievementsOpen(false);
            setIsExiting(false);
        }
    }, [isInRoom, isTeleporting]);

    // Reset exiting state when not in room anymore
    useEffect(() => {
        if (!isInRoom) {
            setIsExiting(false);
        }
    }, [isInRoom]);

    // A4: Focus management for map panel — auto-focus, Escape, and focus trap
    useEffect(() => {
        if (isMenuOpen) {
            // Auto-focus on close button when map opens
            setTimeout(() => mapCloseRef.current?.focus(), 100);
        }
    }, [isMenuOpen]);

    // Global Escape key handler — closes any open panel
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (isMenuOpen) setIsMenuOpen(false);
                if (isAudioMenuOpen) setIsAudioMenuOpen(false);
                if (isAchievementsOpen) setIsAchievementsOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen, isAudioMenuOpen, isAchievementsOpen]);

    // Focus trap handler for map panel
    const handleMapKeyDown = (e) => {
        if (e.key !== 'Tab' || !mapPanelRef.current) return;

        const focusable = mapPanelRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            // Shift+Tab on first element → wrap to last
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            // Tab on last element → wrap to first
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    const handleRoomClick = (roomId) => {
        // Close map first
        setIsMenuOpen(false);
        setIsAudioMenuOpen(false);
        setIsAchievementsOpen(false);
        
        // Navigate to the respective pages
        if (roomId === 'about') {
            window.location.href = '/about';
        } else if (roomId === 'gallery') {
            window.location.href = '/projects';
        } else if (roomId === 'contact') {
            window.location.href = '/contact';
        } else if (roomId === 'studio') {
            // 'Explore' button clicked - do nothing else but close the map
            // so the user can explore the 3D corridor
        }
    };

    const handleBackClick = () => {
        setIsExiting(true); // Immediately start exit animation
        // Request exit - DoorSection will handle the animation
        requestExit();
    };

    return (
        <div className="navigation-ui">
            {/* Global Achievement Popup */}
            <AchievementPopup />

            {/* Left side controls - Back Button & Socials */}
            {hasEntered && (
                <div className={`social-controls ${isMenuOpen || isAudioMenuOpen ? 'menu-open' : ''} ${isUIHidden ? 'ui-hidden' : ''}`}>
                    {isInRoom && (
                        <button
                            className={`nav-btn back-btn ${isExiting ? 'exiting' : ''}`}
                            onClick={handleBackClick}
                            aria-label="Back to corridor"
                        >
                            <svg viewBox="0 0 24 24" className="icon-back">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-btn social-btn"
                        aria-label="Instagram"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-btn social-btn"
                        aria-label="LinkedIn"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-btn social-btn"
                        aria-label="Twitter"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                        </svg>
                    </a>
                </div>
            )}

            {/* Global Header - Centered Logo */}
            {hasEntered && (
                <header className={`global-header ${isUIHidden ? 'ui-hidden' : ''}`}>
                    <div className="header-logo">
                        <h1>HARSHITHA</h1>
                        <span className="subtitle">CREATIVE DEVELOPER</span>
                    </div>
                </header>
            )}

            {/* Right side controls - Only visible after entering */}
            {hasEntered && (
                <div className={`nav-controls ${isMenuOpen || isAudioMenuOpen ? 'menu-open' : ''} ${isUIHidden ? 'ui-hidden' : ''}`}>
                    {/* Hamburger Menu Button */}
                    <button
                        className={`nav-btn hamburger-btn ${isMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <div className="hamburger-icon">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                    {/* Audio Toggle Button */}
                    <button
                        className={`nav-btn audio-btn ${isAudioMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                        aria-label="Audio Settings"
                        aria-expanded={isAudioMenuOpen}
                    >
                        {isMuted ? (
                            <svg viewBox="0 0 24 24" className="icon-audio">
                                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                <line x1="23" y1="9" x2="17" y2="15" />
                                <line x1="17" y1="9" x2="23" y2="15" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" className="icon-audio">
                                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                <path d="M15 9a5 5 0 0 1 0 6" />
                                <path d="M18 5a9 9 0 0 1 0 14" />
                            </svg>
                        )}
                    </button>
                    {/* Services Toggle Button */}
                    <button
                        className={`nav-btn achievements-btn ${isAchievementsOpen ? 'open' : ''}`}
                        onClick={() => setIsAchievementsOpen(!isAchievementsOpen)}
                        aria-label="Services"
                        aria-expanded={isAchievementsOpen}
                    >
                        <svg viewBox="0 0 24 24" className="icon-services" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 12 12 17 22 12"></polyline>
                            <polyline points="2 17 12 22 22 17"></polyline>
                        </svg>
                    </button>
                </div>
            )}

            {/* Map Panel - Drops from top when open */}
            {hasEntered && (
                <div className={`map-panel ${isMenuOpen ? 'open' : ''}`} inert={!isMenuOpen ? true : undefined} ref={mapPanelRef} onKeyDown={handleMapKeyDown} role="dialog" aria-label="Map">
                    {/* SVG Border Overlay */}
                    <svg
                        className="map-border-overlay"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: 10
                        }}
                    >
                        <path
                            d="M 0 0 L 100 0 L 100 0 L 99 3 L 100 6 L 98 10 L 100 14 L 99 18 L 100 22 L 98 26 L 100 30 L 99 35 L 100 40 L 98 45 L 100 50 L 99 55 L 100 60 L 98 65 L 100 70 L 99 75 L 100 80 L 98 85 L 100 90 L 99 95 L 100 100 L 96 99 L 92 100 L 88 98 L 84 100 L 80 99 L 76 100 L 72 98 L 68 100 L 64 99 L 60 100 L 56 98 L 52 100 L 48 99 L 44 100 L 40 98 L 36 100 L 32 99 L 28 100 L 24 98 L 20 100 L 16 99 L 12 100 L 8 98 L 4 100 L 0 99 L 0.5 99.5 L 1 95 L 0 90 L 2 85 L 0 80 L 1 75 L 0 70 L 2 65 L 0 60 L 1 55 L 0 50 L 2 45 L 0 40 L 1 35 L 0 30 L 2 26 L 0 22 L 1 18 L 0 14 L 2 10 L 0 6 L 1 3 L 0 0 Z"
                            fill="none"
                            stroke="#1a1a1a"
                            strokeWidth="0.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    <div className="map-content-clipped">
                        <div className="map-header">
                            <h3>MAP</h3>
                            <button
                                ref={mapCloseRef}
                                className="close-btn"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Close map"
                            >
                                <svg viewBox="0 0 24 24">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="map-container">
                            {/* Map background image */}
                            <img src="/images/map.webp" alt="Portfolio Map" className="map-image" />

                            {/* Painted Map Overlays */}
                            <img ref={paintedMapsRefs.about} src="/images/map_about_painted.webp" alt="" className="painted-map-layer" style={{ clipPath: 'polygon(10% 20%, 10% 20%, 10% 55%, 10% 55%)' }} />
                            <img ref={paintedMapsRefs.gallery} src="/images/map_gallery_painted.webp" alt="" className="painted-map-layer" style={{ clipPath: 'polygon(10% 57%, 10% 57%, 10% 92%, 10% 92%)' }} />
                            <img ref={paintedMapsRefs.contact} src="/images/map_contact_painted.webp" alt="" className="painted-map-layer" style={{ clipPath: 'polygon(95% 10%, 95% 10%, 95% 35%, 95% 35%)' }} />
                            <img ref={paintedMapsRefs.studio} src="/images/map_studio_painted.webp" alt="" className="painted-map-layer" style={{ clipPath: 'polygon(85% 41%, 85% 41%, 85% 81%, 85% 81%)' }} />

                            {/* Hover Zones — covering the map */}
                            <button
                                type="button"
                                className="map-hover-zone zone-about"
                                onMouseEnter={() => setHoveredRoom('about')}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onFocus={() => setHoveredRoom('about')}
                                onBlur={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick('about')}
                                aria-label="Go to About page"
                            />
                            <button
                                type="button"
                                className="map-hover-zone zone-gallery"
                                onMouseEnter={() => setHoveredRoom('gallery')}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onFocus={() => setHoveredRoom('gallery')}
                                onBlur={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick('gallery')}
                                aria-label="Go to Projects page"
                            />
                            <button
                                type="button"
                                className="map-hover-zone zone-contact"
                                onMouseEnter={() => setHoveredRoom('contact')}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onFocus={() => setHoveredRoom('contact')}
                                onBlur={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick('contact')}
                                aria-label="Go to Contact page"
                            />
                            <button
                                type="button"
                                className="map-hover-zone zone-studio"
                                onMouseEnter={() => setHoveredRoom('studio')}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onFocus={() => setHoveredRoom('studio')}
                                onBlur={() => setHoveredRoom(null)}
                                onClick={() => handleRoomClick('studio')}
                                aria-label="Explore 3D Corridor"
                            />

                            {/* Permanent Map Text Labels */}
                            <div className="map-room-label about">ABOUT</div>
                            <div className="map-room-label gallery" style={{ letterSpacing: '0.15em' }}>PROJECTS</div>
                            <div className="map-room-label contact">CONTACT</div>
                            <div className="map-room-label studio" style={{ letterSpacing: '0.25em' }}>EXPLORE</div>

                            {/* Pin slot markers - 4 locations */}
                            {ROOMS.map((room) => (
                                <button
                                    key={room.id}
                                    className={`pin-slot ${currentRoom === room.id ? 'active' : ''} ${hoveredRoom === room.id ? 'hovered' : ''}`}
                                    style={{ left: `${room.x}%`, top: `${room.y}%` }}
                                    onClick={() => handleRoomClick(room.id)}
                                    onMouseEnter={() => setHoveredRoom(room.id)}
                                    onMouseLeave={() => setHoveredRoom(null)}
                                    title={room.label}
                                >
                                    <img src="/images/pin-slot.webp" alt="" className="slot-image" />
                                </button>
                            ))}

                            {/* The pin marker - moves to hovered slot, or current room, or start position */}
                            <div
                                className="pin-marker"
                                style={{
                                    left: `${hoveredRoom
                                        ? ROOMS.find(r => r.id === hoveredRoom)?.x || PIN_START_POSITION.x
                                        : currentRoom && isInRoom
                                            ? ROOMS.find(r => r.id === currentRoom)?.x || PIN_START_POSITION.x
                                            : PIN_START_POSITION.x
                                        }%`,
                                    top: `${hoveredRoom
                                        ? ROOMS.find(r => r.id === hoveredRoom)?.y || PIN_START_POSITION.y
                                        : currentRoom && isInRoom
                                            ? ROOMS.find(r => r.id === currentRoom)?.y || PIN_START_POSITION.y
                                            : PIN_START_POSITION.y
                                        }%`
                                }}
                            >
                                <img src="/images/pin.webp" alt="You are here" className="pin-image" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Audio Panel — drops down from the button */}
            {hasEntered && (
                <div className={`audio-panel ${isAudioMenuOpen ? 'open' : ''}`} inert={!isAudioMenuOpen ? true : undefined}>
                    <div className="audio-card">
                        <div className="audio-header">
                            <h3>AUDIO SETTINGS</h3>
                            <button
                                className="close-btn"
                                onClick={() => setIsAudioMenuOpen(false)}
                                aria-label="Close audio settings"
                            >
                                <svg viewBox="0 0 24 24">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="audio-sliders-container">
                            <div className="slider-group">
                                <div className="slider-label">
                                    <span>Music</span>
                                    <span>{Math.round(bgmVol * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={bgmVol}
                                    onChange={(e) => handleBgmChange(parseFloat(e.target.value))}
                                    className="paper-slider"
                                    aria-label="Music volume"
                                    aria-valuetext={`${Math.round(bgmVol * 100)} percent`}
                                />
                            </div>
                            <div className="slider-group">
                                <div className="slider-label">
                                    <span>SFX</span>
                                    <span>{Math.round(globalVolume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.01"
                                    value={globalVolume}
                                    onChange={(e) => setGlobalVolume(parseFloat(e.target.value))}
                                    className="paper-slider"
                                    aria-label="SFX volume"
                                    aria-valuetext={`${Math.round(globalVolume * 100)} percent`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievements Panel */}
            <AchievementsPanel
                isOpen={isAchievementsOpen}
                onClose={() => setIsAchievementsOpen(false)}
            />

            {/* Overlay to close menus */}
            {(isMenuOpen || isAudioMenuOpen || isAchievementsOpen) && (
                <div
                    className="menu-overlay"
                    onClick={() => {
                        setIsMenuOpen(false);
                        setIsAudioMenuOpen(false);
                        setIsAchievementsOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default NavigationUI;
