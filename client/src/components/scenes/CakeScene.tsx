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
      duration: 0.1, // Snappier movement
      ease: 'power2.out',
    });
  };

  const sliceCake = (e: React.MouseEvent) => {
    // Prevent event bubbling
    e.stopPropagation();
    
    if (sliceCount >= 8 || isSlicing) return;

    setIsSlicing(true);

    if (settings.soundEnabled) {
      audioManager.play('hit');
    }

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

      if (!settings.reducedMotion && slicesRef.current[newCount - 1]) {
        const sliceElement = slicesRef.current[newCount - 1];
        gsap.fromTo(sliceElement,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out' }
        );
      }

      setIsSlicing(false);

      if (newCount >= 8) {
        setShowSuccess(true);
        if (settings.soundEnabled) audioManager.play('success');
      }
    }, 100);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* 1. BACKGROUND LAYER - Fixed with pointer-events-none */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-40"
        style={{ 
          backgroundImage: "url('/assets/cakes/background1.jpg')",
          zIndex: 0 
        }}
      />

      {/* 2. INTERACTIVE CONTENT LAYER */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-auto">
        
        {showSuccess && <AdaptiveParticleSystem count={200} color="#fbbf24" speed={0.8} size={3} />}

        <h1 className="text-5xl font-display font-bold text-white mb-12 drop-shadow-2xl">
          <span className="font-cursive">Cut the Cake</span>
        </h1>

        <div className="relative mb-12">
          <div ref={cakeRef} className="relative w-72 h-72">
            <img
              src="/assets/cakes/cake1.svg"
              alt="Cake"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Knife Layer - Higher Z-Index */}
          <div
            ref={knifeRef}
            className="absolute pointer-events-none text-5xl"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              zIndex: 50
            }}
          >
            🔪
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              ref={(el) => (slicesRef.current[i] = el)}
              className={`text-3xl transition-opacity ${i < sliceCount ? 'opacity-100' : 'opacity-20'}`}
            >
              🍰
            </div>
          ))}
        </div>

        {/* The Button - explicitly high z-index and cursor-pointer */}
        <Button
          onClick={sliceCake}
          disabled={isSlicing || sliceCount >= 8}
          className="relative z-30 text-xl px-12 py-8 bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-xl active:scale-95 transition-transform"
        >
          {sliceCount >= 8 ? 'Done! 🎉' : `SLICE CAKE (${sliceCount}/8)`}
        </Button>

        {sliceCount >= 1 && (
          <Button
            onClick={() => navigateTo('candle')}
            variant="outline"
            className="mt-4 relative z-30 text-white border-white/50"
          >
            Continue to Candles →
          </Button>
        )}
      </div>
    </div>
  );
}
