'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Experience from "./Experience";
import Loader from "./Loader";
import SmoothScrolling from "./SmoothScrolling";

export default function MainPage() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const nativeLoader = document.getElementById('native-loader');
        if (nativeLoader) {
            nativeLoader.style.display = 'none';
            nativeLoader.remove();
        }
    }, []);

    return (
        <>
            <SmoothScrolling />
            {/* Loader fades out on complete */}
            {!isLoaded && (
                <Loader onComplete={() => setIsLoaded(true)} />
            )}

            {/* Website scales in from center when loader finishes */}
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={isLoaded ? { scale: 1, opacity: 1 } : { scale: 0.92, opacity: 0 }}
                transition={{
                    duration: 1.1,
                    ease: [0.16, 1, 0.3, 1], // smooth spring-like ease
                }}
                style={{
                    position: 'relative',
                    zIndex: 1,
                    transformOrigin: 'center center',
                }}
            >
                <Experience />
            </motion.div>
        </>
    );
}
