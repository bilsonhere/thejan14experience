import { useRef, useState, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';

export function CakeScene() {
  const { updateProgress, navigateTo, settings } = useSceneStore();
  const [sliceCount, setSliceCount] = useState(0);
  const [isSlicing, setIsSlicing] = useState(false);
  const [knifePos, setKnifePos] = useState({ x: 50, y: 50 });
  const [showSuccess, setShowSuccess] = useState(false);
  const cakeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const knifeRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !knifeRef.current || sliceCount >= 8) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    gsap.to(knifeRef.current, {
      left: `${x}%`,
      top: `${y}%`,
      duration: 0.3,
      ease: 'power2.out',
    });

    setKnifePos({ x, y });
  };

  const sliceCake = () => {
    if (sliceCount >= 8 || isSlicing) return;

    setIsSlicing(true);

    if (settings.soundEnabled) {
      audioManager.play('hit');
    }

    // Visual feedback on cake
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.to(cakeRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }

    setTimeout(() => {
      const newCount = sliceCount + 1;
      setSliceCount(newCount);

      if (newCount === 1) {
        updateProgress({ cakeSliced: true });
      }

      if (!settings.reducedMotion) {
        const sliceElement = slicesRef.current[newCount - 1];
        if (sliceElement) {
          gsap.fromTo(sliceElement,
            { scale: 0, opacity: 0, rotation: -45, y: 20 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              y: 0,
              duration: 0.6,
              ease: 'back.out(1.4)',
              onComplete: () => {
                // Bounce effect after landing
                gsap.to(sliceElement, {
                  scale: 1.08,
                  duration: 0.25,
                  yoyo: true,
                  repeat: 1,
                  ease: 'power3.inOut',
                });
              }
            }
          );
        }

        // Animate cake slice visual
        if (cakeRef.current) {
          gsap.to(cakeRef.current, {
            rotation: (newCount % 2 === 0 ? 1 : -1) * 4,
            duration: 0.4,
            ease: 'expo.out',
          });
        }
      }

      setIsSlicing(false);

      if (newCount >= 8) {
        setShowSuccess(true);
        if (settings.soundEnabled) {
          audioManager.play('success');
        }
        if (!settings.reducedMotion && cakeRef.current) {
          gsap.to(cakeRef.current, {
            scale: 1.08,
            duration: 0.6,
            ease: 'back.out(1.4)',
          });
        }
      }
    }, 300);
  };

  useEffect(() => {
    // Initialize cake entrance animation
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.fromTo(cakeRef.current,
        { scale: 0, opacity: 0, rotation: -180 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: 'power3.out' }
      );
    }
  }, [settings.reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-pink-900 via-rose-900 to-red-900"
      onMouseMove={handleMouseMove}
    >
      {/* Background Image Layer */}
<div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
  style={{ 
    backgroundImage: "url('/assets/cakes/background1.jpg')",
    zIndex: 0 // Change from -z-10 to 0
  }}
/>

      {showSuccess && <AdaptiveParticleSystem count={200} color="#fbbf24" speed={0.8} size={3} />}

      <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-12 drop-shadow-2xl">
        <span className="font-cursive text-6xl md:text-7xl">Cut the Cake</span>
      </h1>

      <div className="relative mb-12">
        <div
          ref={cakeRef}
          className="relative w-80 h-80 shadow-2xl"
        >
          <img
            src="/assets/cakes/cake1.svg"
            alt="Birthday Cake"
            className="w-full h-full object-contain"
            style={{
              filter: sliceCount >= 8 ? 'brightness(0.9)' : 'brightness(1)',
              transform: `rotate(${sliceCount * 2}deg)`,
            }}
            onError={(e) => {
              // Fallback if image doesn't load
              (e.target as HTMLImageElement).src = '/assets/cakes/cake2.svg';
            }}
          />

          {sliceCount > 0 && sliceCount < 8 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(0)}% ${50 + 50 * Math.sin(0)}%, ${50 + 50 * Math.cos((sliceCount * Math.PI) / 4)}% ${50 + 50 * Math.sin((sliceCount * Math.PI) / 4)}%)`,
                background: 'rgba(0, 0, 0, 0.3)',
              }}
            />
          )}
        </div>

        <div
          ref={knifeRef}
          className="absolute pointer-events-none text-4xl will-change-transform"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
          }}
        >
          🔪
        </div>
      </div>

      <div className="flex gap-3 mb-12 flex-wrap justify-center max-w-2xl">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (slicesRef.current[i] = el)}
            className={`text-3xl transition-all duration-300 ${
              i < sliceCount
                ? 'opacity-100 scale-100 filter drop-shadow-lg'
                : 'opacity-30 scale-90'
            }`}
            style={{
              transform: i < sliceCount ? 'scale(1)' : 'scale(0.9)',
            }}
          >
            🍰
          </div>
        ))}
      </div>

      {showSuccess && (
        <div className="mb-4 text-3xl font-cursive font-bold text-yellow-300 animate-pulse">
          🎉 All Sliced! 🎉
        </div>
      )}

      <Button
        onClick={sliceCake}
        disabled={isSlicing || sliceCount >= 8}
        size="lg"
        className="text-xl px-8 py-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 hover:scale-105 shadow-2xl"
      >
        {sliceCount >= 8 ? 'All Sliced! 🎉' : `Slice! (${sliceCount}/8)`}
      </Button>

      {sliceCount >= 1 && !showSuccess && (
        <Button
          onClick={() => navigateTo('candle')}
          variant="outline"
          className="mt-4 bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 transition-all duration-300"
        >
          Light the Candles →
        </Button>
      )}

      {showSuccess && (
        <Button
          onClick={() => navigateTo('candle')}
          size="lg"
          className="mt-4 text-xl px-8 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-2xl"
        >
          Light the Candles 🕯️ →
        </Button>
      )}

      <p className="mt-8 text-white/70 text-sm font-elegant">
        {sliceCount < 8 ? 'Move your mouse to control the knife, then click to slice!' : 'Perfect! Ready to light the candles!'}
      </p>
    </div>
  );
}
