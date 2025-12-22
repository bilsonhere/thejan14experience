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
  const [showSliceGuide, setShowSliceGuide] = useState(true);
  
  const cakeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const knifeRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<(HTMLDivElement | null)[]>([]);
  const isDraggingRef = useRef(false);
  const lastSliceTimeRef = useRef(0);
  const sliceCooldown = 500; // ms between slices

  // Hide guide after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSliceGuide(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Simple mouse/touch movement for knife
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !knifeRef.current || sliceCount >= 8) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Calculate angle based on mouse movement
    const knife = knifeRef.current;
    const currentLeft = parseFloat(knife.style.left || '50');
    const currentTop = parseFloat(knife.style.top || '50');
    const dx = x - currentLeft;
    const dy = y - currentTop;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    gsap.to(knifeRef.current, {
      left: `${x}%`,
      top: `${y}%`,
      rotation: angle,
      duration: 0.1,
      ease: 'power2.out',
    });
  };

  // Handle touch/mouse down
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (sliceCount >= 8) return;
    isDraggingRef.current = true;
    
    // Get coordinates
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    handlePointerMove(e);
  };

  // Handle touch/mouse move
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || sliceCount >= 8 || isSlicing) return;
    
    // Get coordinates
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Update knife position
    if (containerRef.current && knifeRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      const knife = knifeRef.current;
      const currentLeft = parseFloat(knife.style.left || '50');
      const currentTop = parseFloat(knife.style.top || '50');
      const dx = x - currentLeft;
      const dy = y - currentTop;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      gsap.to(knifeRef.current, {
        left: `${x}%`,
        top: `${y}%`,
        rotation: angle,
        duration: 0.1,
        ease: 'power2.out',
      });

      // Check if we should slice (based on movement speed/distance)
      const distance = Math.sqrt(dx * dx + dy * dy);
      const currentTime = Date.now();
      
      if (distance > 8 && currentTime - lastSliceTimeRef.current > sliceCooldown) {
        performSlice();
        lastSliceTimeRef.current = currentTime;
      }
    }
  };

  // Handle pointer up/leave
  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const performSlice = () => {
    if (sliceCount >= 8 || isSlicing) return;

    setIsSlicing(true);

    if (settings.soundEnabled) {
      audioManager.play('hit');
    }

    // Cake shake animation
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

      // Show slice indicator
      if (!settings.reducedMotion && slicesRef.current[newCount - 1]) {
        const sliceElement = slicesRef.current[newCount - 1];
        gsap.fromTo(sliceElement,
          { scale: 0, opacity: 0, rotate: -180 },
          { 
            scale: 1, 
            opacity: 1, 
            rotate: 0,
            duration: 0.4, 
            ease: 'back.out(1.7)',
          }
        );
      }

      setIsSlicing(false);

      if (newCount >= 8) {
        setShowSuccess(true);
        if (settings.soundEnabled) audioManager.play('success');
        
        // Celebration animation
        if (!settings.reducedMotion && cakeRef.current) {
          gsap.to(cakeRef.current, {
            scale: 1.1,
            duration: 0.8,
            yoyo: true,
            repeat: 1,
            ease: 'elastic.out(1, 0.5)',
          });
        }
      }
    }, 100);
  };

  const handleButtonSlice = () => {
    performSlice();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden
                 bg-gradient-to-br from-rose-950/90 via-purple-950/80 to-indigo-950/90"
    >
      {/* Simplified Background - Better performance */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/40 via-purple-900/30 to-indigo-900/40" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMyIvPjwvc3ZnPg==')] 
                    opacity-[0.03]" />
      </div>

      {/* Interactive Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
        {/* Celebration Particles - Only when success */}
        {showSuccess && (
          <div className="absolute inset-0 pointer-events-none">
            <AdaptiveParticleSystem 
              count={200} 
              color="#fbbf24" 
              speed={0.6} 
              size={2} 
            />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-2
                        drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
            <span className="font-cursive bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 
                           bg-clip-text text-transparent">
              Slice the Cake
            </span>
          </h1>
          <p className="text-base sm:text-lg text-rose-200/80 font-elegant max-w-md mx-auto">
            Drag or tap to slice the birthday cake! {showSliceGuide && "👇"}
          </p>
        </div>

        {/* Cake Container */}
        <div className="relative mb-8 sm:mb-12">
          {/* Cake Image */}
          <div
            ref={cakeRef}
            className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 
                       cursor-pointer select-none
                       transition-transform duration-300"
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onClick={() => {
              if (!isDraggingRef.current) {
                performSlice();
              }
            }}
          >
            <img
              src="/assets/cakes/cake1.svg"
              alt="Birthday Cake"
              className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]"
              draggable="false"
            />
            
            {/* Cake Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-500/5 to-purple-600/5 
                          rounded-full blur-xl -z-10" />
          </div>

          {/* Knife */}
          <div
            ref={knifeRef}
            className="absolute pointer-events-none text-4xl sm:text-5xl
                       drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]
                       z-20"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }}
          >
            🔪
          </div>
        </div>

        {/* Slice Progress */}
        <div className="mb-8">
          <div className="flex gap-1 sm:gap-2 mb-4 justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (slicesRef.current[i] = el)}
                className={`text-2xl sm:text-3xl transition-all duration-300 ${i < sliceCount ? 'opacity-100 scale-105' : 'opacity-25 scale-90'}`}
              >
                🍰
              </div>
            ))}
          </div>
          
          {/* Progress Text */}
          <p className="text-center text-base sm:text-lg text-rose-200/80 font-elegant">
            {sliceCount} of 8 slices {sliceCount >= 8 ? '🎉' : ''}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button
            onClick={handleButtonSlice}
            disabled={isSlicing || sliceCount >= 8}
            className="relative px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg 
                       bg-gradient-to-r from-rose-600 to-pink-600
                       hover:from-rose-500 hover:to-pink-500
                       text-white rounded-xl sm:rounded-2xl shadow-lg
                       hover:shadow-xl hover:shadow-rose-500/30
                       transition-all duration-300
                       hover:scale-[1.02] active:scale-95
                       min-w-[180px] sm:min-w-[200px]
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sliceCount >= 8 ? (
              <span className="flex items-center gap-2">
                <span className="text-xl">🎉</span> Cake Sliced!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-lg">🔪</span> SLICE ({sliceCount}/8)
              </span>
            )}
          </Button>

          {sliceCount >= 1 && (
            <Button
              onClick={() => navigateTo('candle')}
              variant="outline"
              className="px-6 sm:px-8 py-3 sm:py-4 text-white border-rose-400/40
                       hover:bg-rose-900/30 hover:border-rose-300/60
                       hover:shadow-md hover:shadow-rose-500/20
                       transition-all duration-300
                       rounded-xl"
            >
              <span className="flex items-center gap-2">
                Continue <span className="text-lg">→</span>
              </span>
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-rose-300/60 font-elegant">
            💡 {window.innerWidth < 640 ? 'Tap cake or button to slice' : 'Drag knife or click button to slice'}
          </p>
        </div>

        {/* Success Overlay - Simplified */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <div className="text-center p-6 bg-gradient-to-br from-rose-900/95 to-purple-900/95 
                          rounded-2xl border border-rose-500/30 backdrop-blur-md
                          max-w-sm w-full">
              <div className="text-4xl mb-4">🎂✨</div>
              <h2 className="text-2xl font-bold text-white mb-2">Perfectly Sliced!</h2>
              <p className="text-rose-200/80 mb-6">All slices ready! Time for candles 🕯️</p>
              <Button
                onClick={() => navigateTo('candle')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 
                         hover:from-yellow-400 hover:to-orange-400
                         py-4 text-lg"
              >
                Light Candles →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
