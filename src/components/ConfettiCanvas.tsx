import React, { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  active: boolean;
  durationMs?: number;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  shape: 'rect' | 'circle' | 'strip';
  opacity: number;
}

const PALETTE_COLORS = [
  '#ef4444', // Rubin
  '#10b981', // Szmaragd
  '#3b82f6', // Szafir
  '#a855f7', // Ametyst
  '#f59e0b', // Topaz
  '#fbbf24', // Złoto
  '#ec4899', // Róż
  '#06b6d4', // Turkus
  '#8b5cf6', // Fiolet
];

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({
  active,
  durationMs = 4000,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];

    // 1. Center upward celebration burst (80 particles)
    for (let i = 0; i < 80; i++) {
      const startX = width * 0.5 + (Math.random() - 0.5) * 120;
      const startY = height * 0.65;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.7; // upwards fan
      const speed = 10 + Math.random() * 18;

      particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        width: 10 + Math.random() * 8,
        height: 6 + Math.random() * 8,
        color: PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.06 + Math.random() * 0.08,
        shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'strip' : 'circle',
        opacity: 1,
      });
    }

    // 2. Full-width descending shower (80 particles)
    for (let i = 0; i < 80; i++) {
      const startX = Math.random() * width;
      const startY = -10 - Math.random() * (height * 0.35);
      const speed = 3.5 + Math.random() * 6;

      particles.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 4,
        vy: speed,
        width: 10 + Math.random() * 8,
        height: 8 + Math.random() * 10,
        color: PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.05 + Math.random() * 0.07,
        shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'strip' : 'circle',
        opacity: 1,
      });
    }

    const startTime = performance.now();
    let animId: number;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      ctx.clearRect(0, 0, width, height);

      const gravity = 0.32;
      const drag = 0.985;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        // Fade out in last 25% of duration
        if (progress > 0.75) {
          p.opacity = 1 - (progress - 0.75) / 0.25;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        const wobbleScaleX = Math.cos(p.wobble);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.ellipse(0, 0, Math.abs(p.width * wobbleScaleX * 0.5), p.height * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'strip') {
          ctx.fillRect(-p.width * wobbleScaleX * 0.5, -p.height * 0.5, p.width * wobbleScaleX, p.height * 1.6);
        } else {
          ctx.fillRect(-p.width * wobbleScaleX * 0.5, -p.height * 0.5, p.width * wobbleScaleX, p.height);
        }

        ctx.restore();
      }

      if (progress < 1) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-50 w-full h-full ${
        active ? 'block' : 'hidden'
      }`}
      aria-hidden="true"
    />
  );
};
