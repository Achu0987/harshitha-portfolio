"use client";
import { useEffect } from "react";
import Lenis from "lenis";

const SmoothScrolling = () => {
    useEffect(() => {

        const lenis = new Lenis({
            lerp: 0.1,
            direction: "vertical",
            gestureDirection: "vertical",
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: true,
            touchMultiplier: 1.5,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return null;
};

export default SmoothScrolling;
