import { useRef, useState, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';

interface SlicePoint {
  x: number;
  y: number;
  angle: number;
}

export function CakeScene() {
  const { updateProgress, navigateTo, settings } = useSceneStore();
  const [sliceCount, setSliceCount] = useState(0);
  const [isSlicing, setIsSlicing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSlice, setActiveSlice] = useState<SlicePoint | null>(null);
  const [showSliceGuide, setShowSliceGuide] = useState(true);
  
  const cakeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const knifeRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<(HTMLDivElement | null)[]>([]);
  const sliceLinesRef = useRef<(SVGLineElement | null)[]>([]);
  const isDraggingRef = useRef(false);
  const lastSliceTimeRef = useRef(0);
  const sliceCooldown = 300; // ms between slices

  // Hide guide after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSliceGuide(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Setup touch/mouse event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      handleSliceStart(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || sliceCount >= 8) return;
      handleSliceMove(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      setActiveSlice(null);
    };

    // Add event listeners
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerUp);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [sliceCount]);

  const handleSliceStart = (clientX: number, clientY: number) => {
    if (sliceCount >= 8) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setActiveSlice({ x, y, angle: 45 });
    updateKnifePosition(x, y, 45);
  };

  const handleSliceMove = (clientX: number, clientY: number) => {
    if (sliceCount >= 8 || !activeSlice) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Calculate angle based on movement
    const dx = x - activeSlice.x;
    const dy = y - activeSlice.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.Path.PI);
    
    setActiveSlice(prev => prev ? { ...prev, x, y, angle } : null);
    updateKnifePosition(x, y, angle);

    // Check if we should create a slice (based on distance and cooldown)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const currentTime = Date.now();
    
    if (distance > 15 && currentTime - lastSliceTimeRef.current > sliceCooldown) {
      performSlice();
      lastSliceTimeRef.current = currentTime;
    }
  };

  const updateKnifePosition = (x: number, y: number, angle: number) => {
    if (!knifeRef.current) return;
    
    gsap.to(knifeRef.current, {
      left: `${x}%`,
      top: `${y}%`,
      rotation: angle,
      duration: 0.1,
      ease: 'power2.out',
    });
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
      
      // Sparkle effect at slice point
      if (activeSlice) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'absolute text-2xl pointer-events-none';
        sparkle.style.left = `${activeSlice.x}%`;
        sparkle.style.top = `${activeSlice.y}%`;
        sparkle.style.transform = 'translate(-50%, -50%)';
        containerRef.current?.appendChild(sparkle);

        gsap.to(sparkle, {
          scale: 1.5,
          opacity: 0,
          duration: 0.5,
          onComplete: () => sparkle.remove(),
        });
      }
    }

    setTimeout(() => {
      const newCount = sliceCount + 1;
      setSliceCount(newCount);

      if (newCount === 1) {
        updateProgress({ cakeSliced: true });
      }

      // Create slice line
      if (!settings.reducedMotion) {
        const sliceLine = sliceLinesRef.current[newCount - 1];
        if (sliceLine && activeSlice) {
          // Create a slice line from center to edge
          const centerX = 50;
          const centerY = 50;
          const angle = activeSlice.angle;
          const length = 60;
          
          const endX = centerX + Math.cos(angle * Math.PI / 180) * length;
          const endY = centerY + Math.sin(angle * Math.PI / 180) * length;

          gsap.fromTo(sliceLine,
            { x1: centerX + '%', y1: centerY + '%', x2: centerX + '%', y2: centerY + '%', opacity: 0 },
            {
              x2: endX + '%',
              y2: endY + '%',
              opacity: 1,
              duration: 0.3,
              ease: 'power2.out',
            }
          );
        }
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
            rotation: 5,
            duration: 0.8,
            yoyo: true,
            repeat: 2,
            ease: 'elastic.out(1, 0.5)',
          });
        }
      }
    }, 100);
  };

  const handleButtonSlice = () => {
    // For button click, slice from a random position
    const x = 50 + (Math.random() * 20 - 10);
    const y = 50 + (Math.random() * 20 - 10);
    setActiveSlice({ x, y, angle: Math.random() * 360 });
    performSlice();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden
                 bg-gradient-to-br from-rose-950/90 via-purple-950/80 to-indigo-950/90"
    >
      {/* Enhanced Background Layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/assets/cakes/background1.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/40 via-purple-900/30 to-indigo-900/40" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] 
                    opacity-10" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-8 left-8 text-4xl opacity-30">🎂</div>
      <div className="absolute top-12 right-12 text-3xl opacity-30">🍰</div>
      <div className="absolute bottom-16 left-16 text-3xl opacity-30">✨</div>
      <div className="absolute bottom-12 right-8 text-4xl opacity-30">🔪</div>

      {/* Interactive Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
        {/* Celebration Particles */}
        {showSuccess && (
          <AdaptiveParticleSystem 
            count={300} 
            color="#fbbf24" 
            speed={0.8} 
            size={3} 
            className="absolute inset-0"
          />
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-3
                        drop-shadow-[0_0_30px_rgba(236,72,153,0.6)]">
            <span className="font-cursive bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 
                           bg-clip-text text-transparent">
              Slice the Birthday Cake
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-rose-200/80 font-elegant max-w-md mx-auto
                       drop-shadow-[0_2px_15px_rgba(168,85,247,0.3)]">
            Drag or swipe across the cake to make perfect slices! {showSliceGuide && "↓"}
          </p>
        </div>

        {/* Cake Container */}
        <div className="relative mb-8 sm:mb-12">
          {/* Slice Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                ref={(el) => (sliceLinesRef.current[i] = el)}
                stroke="#f472b6"
                strokeWidth="2"
                strokeDasharray="5,3"
                opacity="0.7"
                className="stroke-pink-400"
              />
            ))}
          </svg>

          {/* Cake Image with enhanced styling */}
          <div
            ref={cakeRef}
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 
                       cursor-crosshair select-none
                       transition-transform duration-300"
            onClick={performSlice}
          >
            <img
              src="/assets/cakes/cake1.svg"
              alt="Birthday Cake"
              className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(245,158,11,0.4)]"
              draggable="false"
            />
            
            {/* Cake Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-500/15 to-purple-600/10 
                          rounded-full blur-2xl -z-10" />
          </div>

          {/* Knife Cursor - Enhanced */}
          <div
            ref={knifeRef}
            className="absolute pointer-events-none text-4xl sm:text-5xl md:text-6xl
                       drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]
                       transition-transform duration-100 z-30"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }}
          >
            🔪
            {/* Knife Glow */}
            <div className="absolute inset-0 bg-red-500/20 blur-md -z-10 rounded-full" />
          </div>

          {/* Interactive Overlay */}
          <div className="absolute inset-0 cursor-crosshair z-20" 
               onPointerDown={(e) => {
                 e.preventDefault();
                 isDraggingRef.current = true;
                 const rect = e.currentTarget.getBoundingClientRect();
                 handleSliceStart(e.clientX, e.clientY);
               }}
               onPointerMove={(e) => {
                 if (!isDraggingRef.current || sliceCount >= 8) return;
                 handleSliceMove(e.clientX, e.clientY);
               }}
               onPointerUp={() => {
                 isDraggingRef.current = false;
                 setActiveSlice(null);
               }}
               onPointerLeave={() => {
                 isDraggingRef.current = false;
                 setActiveSlice(null);
               }} />
        </div>

        {/* Slice Progress */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-1 sm:gap-2 mb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (slicesRef.current[i] = el)}
                className={`text-2xl sm:text-3xl transition-all duration-300 ${i < sliceCount ? 'opacity-100 scale-110' : 'opacity-30 scale-90'}`}
              >
                🍰
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-64 sm:w-80 h-2 bg-rose-900/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(sliceCount / 8) * 100}%` }}
            />
          </div>
          
          <p className="text-sm sm:text-base text-rose-200/70 mt-2 font-elegant">
            {sliceCount}/8 slices completed
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button
            onClick={handleButtonSlice}
            disabled={isSlicing || sliceCount >= 8}
            className="relative px-8 sm:px-12 py-5 sm:py-6 text-lg sm:text-xl 
                       bg-gradient-to-r from-rose-600 to-pink-600
                       hover:from-rose-500 hover:to-pink-500
                       text-white rounded-2xl shadow-xl
                       hover:shadow-2xl hover:shadow-rose-500/40
                       transition-all duration-300
                       hover:scale-[1.02] hover:-translate-y-0.5
                       active:scale-95
                       min-w-[200px] sm:min-w-[240px]"
          >
            {sliceCount >= 8 ? (
              <span className="flex items-center gap-2">
                <span className="text-2xl">🎉</span> Cake Sliced!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-xl">🔪</span> SLICE CAKE ({sliceCount}/8)
              </span>
            )}
            {/* Button shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent
                          -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>

          {sliceCount >= 1 && (
            <Button
              onClick={() => navigateTo('candle')}
              variant="outline"
              className="px-6 sm:px-8 py-4 sm:py-5 text-white border-rose-400/50
                       hover:bg-rose-900/30 hover:border-rose-300/70
                       hover:shadow-lg hover:shadow-rose-500/20
                       transition-all duration-300
                       rounded-xl sm:rounded-2xl"
            >
              <span className="flex items-center gap-2">
                Continue to Candles <span className="text-xl">🕯️→</span>
              </span>
            </Button>
          )}
        </div>

        {/* Instructions for Mobile */}
        <div className="sm:hidden mt-6 text-center">
          <p className="text-xs text-rose-300/60 font-elegant">
            💡 Tip: Swipe across the cake or tap the button to slice
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40">
            <div className="text-center p-8 bg-gradient-to-br from-rose-900/90 to-purple-900/90 
                          rounded-3xl border border-rose-500/30 backdrop-blur-xl
                          animate-pulse" style={{ animationDuration: '2s' }}>
              <div className="text-5xl mb-4">🎂✨</div>
              <h2 className="text-3xl font-bold text-white mb-2">Cake Perfectly Sliced!</h2>
              <p className="text-rose-200/80 mb-4">All 8 slices are ready to serve! 🍰</p>
              <Button
                onClick={() => navigateTo('candle')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
              >
                Light the Candles! 🕯️
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.6)); }
          50% { filter: drop-shadow(0 0 30px rgba(236, 72, 153, 0.8)); }
        }
        
        .cursor-crosshair {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M16 2 L16 10 M16 22 L16 30 M2 16 L10 16 M22 16 L30 16' stroke='%23f472b6' stroke-width='2'/%3E%3C/svg%3E") 16 16, crosshair;
        }
        
        /* Slice animation for mobile */
        @media (max-width: 640px) {
          .cursor-crosshair {
            cursor: default;
          }
        }
        
        /* Improve touch experience */
        @media (pointer: coarse) {
          button, [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
}
