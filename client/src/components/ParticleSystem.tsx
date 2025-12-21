import { useEffect, useRef, useState } from 'react';
import { Particle } from '../lib/types';

interface ParticleSystemProps {
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
  className?: string;
}

export function ParticleSystem({ 
  count = 100, 
  color = '#ffffff',
  speed = 0.5,
  size = 2,
  className = ''
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    const resizeHandler = () => resizeCanvas();
    window.addEventListener('resize', resizeHandler);

    // Initialize particles after canvas is sized
    particlesRef.current = Array.from({ length: count }, () => createParticle());

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;
        particle.life += 1;
        particle.opacity = Math.max(0, 1 - (particle.life / particle.maxLife));

        // Wrap around edges
        if (particle.x < 0) particle.x = rect.width;
        if (particle.x > rect.width) particle.x = 0;
        if (particle.y < 0) particle.y = rect.height;
        if (particle.y > rect.height) particle.y = 0;

        if (particle.life >= particle.maxLife) {
          particlesRef.current[index] = createParticle();
        }

        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [count, color, speed, size]);

  function createParticle(): Particle {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      id: Math.random().toString(36),
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 0,
      maxLife: Math.random() * 200 + 100,
      size: Math.random() * size + 1,
      color: color,
      opacity: 1,
    };
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 1, width: '100%', height: '100%' }}
    />
  );
}
