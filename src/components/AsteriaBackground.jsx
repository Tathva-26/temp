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
        let staticStars = [];
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
            stars = Array.from({ length: 200 }, () => ({
                x: (Math.random() - 0.5) * 2500,
                y: (Math.random() - 0.5) * 2500,
                z: Math.random() * 2000,
                baseRadius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.8 + 0.2
            }));

            staticStars = Array.from({ length: 400 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.03 + 0.005,
                twinkleDir: Math.random() > 0.5 ? 1 : -1
            }));
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

            let bass = 0;
            if (window.globalAudioData) {
                let sum = 0;
                for (let i = 0; i < 16; i++) sum += window.globalAudioData[i];
                const rawBass = (sum / 16) / 255;
                bass = rawBass * rawBass;
            }

            // Center of the screen
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const FOV = 300; // Field of view constant
            
            // Draw static twinkling night sky
            staticStars.forEach(star => {
                if (!reducedMotion) {
                    star.opacity += star.twinkleSpeed * star.twinkleDir;
                    if (star.opacity >= 1) {
                        star.opacity = 1;
                        star.twinkleDir = -1;
                    } else if (star.opacity <= 0.1) {
                        star.opacity = 0.1;
                        star.twinkleDir = 1;
                    }
                }
                
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.8})`;
                const size = Math.max(star.radius * 2, 1);
                ctx.fillRect(star.x - size / 2, star.y - size / 2, size, size);
            });
            
            stars.forEach(star => {
              // 1. Continuous forward movement + Bass Warp
              const baseSpeed = 2; // Ambient forward flight
              const currentSpeed = baseSpeed + (bass * 80);
              star.z -= currentSpeed;

              // 2. Respawn stars that fly past the camera
              if (star.z <= 1) {
                star.z = 2000; // Send back to the abyss
                star.x = (Math.random() - 0.5) * 2500;
                star.y = (Math.random() - 0.5) * 2500;
              }

              // 3. 3D-to-2D Perspective Projection
              const scale = FOV / star.z;
              const projX = centerX + (star.x * scale);
              const projY = centerY + (star.y * scale);
              
              const trailZ = star.z + (currentSpeed * 2.5); // Trail length scales dynamically with speed
              const trailScale = FOV / trailZ;
              const trailX = centerX + (star.x * trailScale);
              const trailY = centerY + (star.y * trailScale);

              // 4. Render the star
              // Only draw if within screen bounds to save GPU cycles
              if (projX > 0 && projX < canvas.width && projY > 0 && projY < canvas.height) {
                const radius = star.baseRadius * scale;
                
                // Fade in smoothly from the dark abyss
                const depthOpacity = Math.min(1, 1 - (star.z / 2000));
                const finalOpacity = star.opacity * depthOpacity;

                ctx.beginPath();
                
                // Always draw 3D Motion Blur Streak so they look distinctly different from static stars
                ctx.moveTo(trailX, trailY);
                ctx.lineTo(projX, projY);
                
                // Baseline cyan tint, gets brighter and wider with bass
                const r = Math.floor(100 + (bass * 155));
                const g = Math.floor(200 + (bass * 55));
                const b = 255;
                
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
                ctx.lineWidth = radius * (1 + bass * 2);
                ctx.stroke();
              }
            });

            // Handle meteors logic
            if (!reducedMotion && time - lastMeteorTime > nextMeteorDelay) {
                createMeteor();
                lastMeteorTime = time;
                nextMeteorDelay = Math.random() * 4000 + 4000;
            }

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
