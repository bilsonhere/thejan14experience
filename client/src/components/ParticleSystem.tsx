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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    particlesRef.current = Array.from({ length: count }, () => createParticle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;
        particle.life += 1;
        particle.opacity = 1 - (particle.life / particle.maxLife);

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
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count, color, speed, size]);

  function createParticle(): Particle {
    const canvas = canvasRef.current!;
    return {
      id: Math.random().toString(36),
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
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
      style={{ zIndex: 1 }}
    />
  );
}
