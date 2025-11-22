import { useRef, useState, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import gsap from 'gsap';

export function CakeScene() {
  const { updateProgress, navigateTo, settings } = useSceneStore();
  const [sliceCount, setSliceCount] = useState(0);
  const [isSlicing, setIsSlicing] = useState(false);
  const [knifePos, setKnifePos] = useState({ x: 50, y: 50 });
  const cakeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const knifeRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !knifeRef.current) return;
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
    if (sliceCount >= 8) return;

    setIsSlicing(true);
    
    if (settings.soundEnabled) {
      audioManager.play('hit');
    }

    setTimeout(() => {
      const newCount = sliceCount + 1;
      setSliceCount(newCount);
      
      if (newCount === 1) {
        updateProgress({ cakeSliced: true });
      }

      if (!settings.reducedMotion) {
        gsap.fromTo(`.slice-${newCount}`,
          { scale: 0, opacity: 0, rotation: -45 },
          { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }
        );
      }

      setIsSlicing(false);

      if (newCount >= 8 && settings.soundEnabled) {
        audioManager.play('success');
      }
    }, 300);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-pink-900 via-rose-900 to-red-900"
      onMouseMove={handleMouseMove}
    >
      <h1 className="text-5xl font-bold text-white mb-8 drop-shadow-2xl">
        🎂 Cut the Cake! 🎂
      </h1>

      <div className="relative mb-8">
        <div
          ref={cakeRef}
          className="relative w-64 h-64 bg-gradient-to-br from-yellow-400 via-orange-300 to-pink-400 rounded-full shadow-2xl flex items-center justify-center"
        >
          <div className="absolute inset-4 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full" />
          <div className="absolute inset-8 bg-gradient-to-br from-white to-pink-200 rounded-full flex items-center justify-center text-6xl">
            🍰
          </div>

          {sliceCount > 0 && (
            <div
              className="absolute inset-0"
              style={{
                clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(0)}% ${50 + 50 * Math.sin(0)}%, ${50 + 50 * Math.cos((sliceCount * Math.PI) / 4)}% ${50 + 50 * Math.sin((sliceCount * Math.PI) / 4)}%)`,
                background: 'rgba(0, 0, 0, 0.2)',
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

      <div className="flex gap-2 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`slice-${i + 1} text-3xl ${i < sliceCount ? 'opacity-100' : 'opacity-30'}`}
          >
            🍰
          </div>
        ))}
      </div>

      <Button
        onClick={sliceCake}
        disabled={isSlicing || sliceCount >= 8}
        size="lg"
        className="text-xl px-8 py-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
      >
        {sliceCount >= 8 ? 'All Sliced!' : `Slice! (${sliceCount}/8)`}
      </Button>

      {sliceCount >= 1 && (
        <Button
          onClick={() => navigateTo('candle')}
          variant="outline"
          className="mt-4 bg-white/10 backdrop-blur-sm text-white border-white/30"
        >
          Light the Candles →
        </Button>
      )}

      <p className="mt-8 text-white/70">Move your mouse to control the knife</p>
    </div>
  );
}
