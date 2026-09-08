"use client";

import React, { useRef, useEffect } from 'react';

export default function AsteriaBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Request an alpha channel in context for transparent background
        const ctx = canvas.getContext('2d', { alpha: true });

        let animationFrameId;
        let stars = [];
        let meteors = [];

        let width, height;
        let dpr = 1;
        let mouse = { x: null, y: null };
        let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let isUnmounted = false;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionChange = (e) => {
            reducedMotion = e.matches;
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleMotionChange);
        } else {
            mediaQuery.addListener(handleMotionChange);
        }

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap rendering at 2x for performance

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            ctx.scale(dpr, dpr);

            createStars();
        };

        const createStars = () => {
            stars = [];
            const numStars = width < 768 ? 120 : 250;
            for (let i = 0; i < numStars; i++) {
                // depth: 0 (far/dim) to 1 (near/bright)
                const depth = Math.random();
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: (depth * 0.8 + 0.2) + Math.random() * 0.5,
                    baseOpacity: depth * 0.4 + 0.1,
                    twinkleSpeed: Math.random() * 0.02 + 0.005,
                    twinklePhase: Math.random() * Math.PI * 2,
                    vx: (Math.random() - 0.5) * 0.05 * (depth + 0.2),
                    vy: (Math.random() * 0.04 + 0.01) * (depth + 0.2), // gentle falling 
                    depth: depth
                });
            }
        };

        let lastMeteorTime = 0;
        let nextMeteorDelay = Math.random() * 4000 + 4000; // 4 to 8 seconds delay

        const createMeteor = () => {
            if (reducedMotion) return;
            const angle = (Math.PI / 180) * (Math.random() * 20 + 35); // downward diagonal
            const speed = Math.random() * 4 + 4;
            const length = Math.random() * 80 + 40;

            meteors.push({
                x: Math.random() * width * 1.5 - width * 0.25, // spawn wide across the top
                y: -100, // spawn above viewport
                length: length,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                opacity: Math.random() * 0.4 + 0.4,
                life: 0,
                maxLife: Math.random() * 100 + 100
            });
        };

        const drawConstellations = (parallaxOffsetX, parallaxOffsetY) => {
            if (reducedMotion) return;

            ctx.lineWidth = 0.5;

            // Connecting mid-to-foreground stars (sparse subset comparison)
            for (let i = 0; i < stars.length; i += 3) {
                const s1 = stars[i];
                if (s1.depth < 0.5) continue; // Only connect nearer stars

                // Look ahead for a limited number of stars for connections
                for (let j = i + 1; j < Math.min(i + 15, stars.length); j++) {
                    const s2 = stars[j];
                    if (s2.depth < 0.5) continue;

                    let px1 = s1.x - parallaxOffsetX * s1.depth;
                    let py1 = s1.y - parallaxOffsetY * s1.depth;
                    let px2 = s2.x - parallaxOffsetX * s2.depth;
                    let py2 = s2.y - parallaxOffsetY * s2.depth;

                    const dx = px1 - px2;
                    const dy = py1 - py2;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < 10000) { // dist < 100
                        const opacity = (1 - Math.sqrt(distSq) / 100) * 0.15;
                        if (opacity > 0) {
                            ctx.beginPath();
                            ctx.moveTo(px1, py1);
                            ctx.lineTo(px2, py2);
                            ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
                            ctx.stroke();
                        }
                    }
                }
            }
        };

        const drawMeteors = () => {
            for (let i = meteors.length - 1; i >= 0; i--) {
                const m = meteors[i];

                const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
                const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

                const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
                grad.addColorStop(0, `rgba(255,255,255,${m.opacity})`);
                grad.addColorStop(1, `rgba(255,255,255,0)`);

                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(tailX, tailY);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.stroke();

                // draw slightly brighter meteor head
                ctx.beginPath();
                ctx.arc(m.x, m.y, 1.0, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${m.opacity})`;
                ctx.fill();

                if (!reducedMotion) {
                    m.x += m.vx;
                    m.y += m.vy;
                    m.life++;
                }

                // Remove dead meteors
                if (m.life > m.maxLife || (m.x > width + m.length && m.y > height + m.length)) {
                    meteors.splice(i, 1);
                }
            }
        };

        const render = (time) => {
            if (isUnmounted) return;

            ctx.clearRect(0, 0, width, height);

            let mouseParallaxX = 0;
            let mouseParallaxY = 0;
            if (mouse.x !== null && !reducedMotion) {
                // Extremely subtle shift
                mouseParallaxX = (mouse.x - width / 2) * 0.05;
                mouseParallaxY = (mouse.y - height / 2) * 0.05;
            }

            // Handle meteors logic
            if (!reducedMotion && time - lastMeteorTime > nextMeteorDelay) {
                createMeteor();
                lastMeteorTime = time;
                nextMeteorDelay = Math.random() * 4000 + 4000;
            }

            stars.forEach(star => {
                // Move stars
                if (!reducedMotion) {
                    star.x += star.vx;
                    star.y += star.vy;

                    // Wrap around bounds
                    // Add a buffer so pop-in isn't visible
                    if (star.x < -40) star.x = width + 40;
                    else if (star.x > width + 40) star.x = -40;
                    if (star.y < -40) star.y = height + 40;
                    else if (star.y > height + 40) star.y = -40;
                }

                // Render with parallax offset
                const px = star.x - mouseParallaxX * star.depth;
                const py = star.y - mouseParallaxY * star.depth;

                const twinkleOpacity = reducedMotion
                    ? star.baseOpacity
                    : star.baseOpacity + Math.sin(time * star.twinkleSpeed + star.twinklePhase) * star.baseOpacity * 0.5;

                ctx.beginPath();
                ctx.arc(px, py, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, Math.min(1, twinkleOpacity))})`;
                ctx.fill();
            });

            drawConstellations(mouseParallaxX, mouseParallaxY);

            if (!reducedMotion) {
                drawMeteors();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        // Events
        const handleResize = () => {
            init();
        };

        // Detect touch device to avoid unnatural mobile mouse tracking
        let touchDevice = false;
        try {
            touchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
        } catch (e) { }

        const handleMouseMove = (e) => {
            if (!touchDevice) {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            }
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        init();

        // Kickoff loop
        animationFrameId = requestAnimationFrame(render);

        return () => {
            isUnmounted = true;
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleMotionChange);
            } else {
                mediaQuery.removeListener(handleMotionChange);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Allow clicks to pass through
                zIndex: 0,             // Render beneath content
                background: 'transparent'
            }}
            aria-hidden="true"
        />
    );
}
