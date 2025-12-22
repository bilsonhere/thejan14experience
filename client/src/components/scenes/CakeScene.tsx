import { useRef, useState, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';

export function CakeScene() {
  const { updateProgress, navigateTo, settings } = useSceneStore();
  const [sliceCount, setSliceCount] = useState(0);
  const [isSlicing, setIsSlicing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSliceGuide, setShowSliceGuide] = useState(true);
  const [bgImage, setBgImage] = useState<string>(settings.customCakeBackground || '/assets/cakes/background.png');
  const [activeSliceLines, setActiveSliceLines] = useState<{x1: number, y1: number, x2: number, y2: number}[]>([]);
  
  const cakeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const knifeRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<(HTMLDivElement | null)[]>([]);
  const sliceLineRef = useRef<SVGSVGElement>(null);
  const isDraggingRef = useRef(false);
  const lastSliceTimeRef = useRef(0);
  const sliceCooldown = 400;
  const lastPositionRef = useRef({x: 50, y: 50});

  // Update background image when settings change
  useEffect(() => {
    if (settings.customCakeBackground) {
      setBgImage(settings.customCakeBackground);
    }
  }, [settings.customCakeBackground]);

  // Hide guide after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSliceGuide(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize cake entrance animation
  useEffect(() => {
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.fromTo(cakeRef.current,
        { scale: 0.8, opacity: 0, rotation: -10 },
        { 
          scale: 1, 
          opacity: 1, 
          rotation: 0, 
          duration: 0.8, 
          ease: 'back.out(1.7)' 
        }
      );
    }
  }, [settings.reducedMotion]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !knifeRef.current || sliceCount >= 8) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    updateKnifePosition(x, y);
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (sliceCount >= 8) return;
    isDraggingRef.current = true;
    
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

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || sliceCount >= 8 || isSlicing) return;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    if (containerRef.current && knifeRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      updateKnifePosition(x, y);

      const distance = Math.sqrt(
        Math.pow(x - lastPositionRef.current.x, 2) + 
        Math.pow(y - lastPositionRef.current.y, 2)
      );
      const currentTime = Date.now();
      
      if (distance > 6 && currentTime - lastSliceTimeRef.current > sliceCooldown) {
        createSliceLine(lastPositionRef.current.x, lastPositionRef.current.y, x, y);
        performSlice(x, y);
        lastSliceTimeRef.current = currentTime;
      }

      lastPositionRef.current = {x, y};
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const updateKnifePosition = (x: number, y: number) => {
    if (!knifeRef.current) return;
    
    const currentLeft = parseFloat(knifeRef.current.style.left || '50');
    const currentTop = parseFloat(knifeRef.current.style.top || '50');
    const dx = x - currentLeft;
    const dy = y - currentTop;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    gsap.to(knifeRef.current, {
      left: `${x}%`,
      top: `${y}%`,
      rotation: angle,
      duration: 0.08,
      ease: 'power2.out',
    });
  };

  const createSliceLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (settings.reducedMotion) return;
    
    const newLine = { x1, y1, x2, y2 };
    setActiveSliceLines(prev => [...prev, newLine]);
    
    setTimeout(() => {
      setActiveSliceLines(prev => prev.filter(line => line !== newLine));
    }, 1000);
  };

  const createSparkleEffect = (x: number, y: number) => {
    if (settings.reducedMotion || !containerRef.current) return;
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'fixed text-2xl pointer-events-none z-50';
        sparkle.style.left = `${x}%`;
        sparkle.style.top = `${y}%`;
        sparkle.style.transform = 'translate(-50%, -50%)';
        containerRef.current?.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 40,
          y: (Math.random() - 0.5) * 40 - 20,
          opacity: 0,
          scale: 0,
          rotation: 360,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => sparkle.remove(),
        });
      }, i * 100);
    }
  };

  const performSlice = (sliceX?: number, sliceY?: number) => {
    if (sliceCount >= 8 || isSlicing) return;

    setIsSlicing(true);

    if (settings.soundEnabled) {
      audioManager.play('hit');
    }

    // Create sparkle at slice position
    if (sliceX && sliceY) {
      createSparkleEffect(sliceX, sliceY);
    }

    // Enhanced cake shake animation
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.to(cakeRef.current, {
        scale: 0.92,
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        ease: 'power3.inOut',
      });
      
      // Cake glow effect
      gsap.to(cakeRef.current, {
        boxShadow: '0 0 60px rgba(236, 72, 153, 0.6)',
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      });
    }

    setTimeout(() => {
      const newCount = sliceCount + 1;
      setSliceCount(newCount);

      if (newCount === 1) {
        updateProgress({ cakeSliced: true });
      }

      // Enhanced slice indicator animation
      if (!settings.reducedMotion && slicesRef.current[newCount - 1]) {
        const sliceElement = slicesRef.current[newCount - 1];
        gsap.fromTo(sliceElement,
          { scale: 0, opacity: 0, rotate: -180, y: 20 },
          { 
            scale: 1.2, 
            opacity: 1, 
            rotate: 0,
            y: 0,
            duration: 0.5, 
            ease: 'back.out(1.7)',
            onComplete: () => {
              gsap.to(sliceElement, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out'
              });
            }
          }
        );
      }

      setIsSlicing(false);

      if (newCount >= 8) {
        setShowSuccess(true);
        if (settings.soundEnabled) audioManager.play('success');
        
        // Enhanced celebration animation
        if (!settings.reducedMotion && cakeRef.current) {
          gsap.to(cakeRef.current, {
            scale: 1.15,
            rotation: 5,
            duration: 0.6,
            yoyo: true,
            repeat: 2,
            ease: 'elastic.out(1.2, 0.5)',
          });
        }
      }
    }, 80);
  };

  const handleButtonSlice = () => {
    // For button slice, use center position
    const x = 50 + (Math.random() * 20 - 10);
    const y = 50 + (Math.random() * 20 - 10);
    updateKnifePosition(x, y);
    createSliceLine(50, 50, x, y);
    performSlice(x, y);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden
                 bg-gradient-to-br from-rose-950/90 via-purple-950/80 to-indigo-950/90"
    >
      {/* Custom Background Image Layer */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.2,
          filter: 'blur(0.5px)',
        }}
      />

      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/70 via-purple-900/50 to-indigo-900/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')] 
                    opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute top-12 left-12 text-3xl opacity-20 animate-float-slow">🎂</div>
      <div className="absolute top-24 right-16 text-2xl opacity-15 animate-float-slow" style={{animationDelay: '2s'}}>🍰</div>
      <div className="absolute bottom-20 left-20 text-2xl opacity-15 animate-float-slow" style={{animationDelay: '1s'}}>✨</div>
      <div className="absolute bottom-24 right-12 text-3xl opacity-20 animate-float-slow" style={{animationDelay: '3s'}}>🔪</div>

      {/* Celebration Effects */}
      {showSuccess && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <Confetti 
              recycle={false} 
              numberOfPieces={400} 
              gravity={0.09}
              colors={['#fbbf24', '#ec4899', '#a855f7', '#60a5fa', '#34d399']}
              wind={0.01}
              opacity={0.9}
            />
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <AdaptiveParticleSystem 
              count={250} 
              color="#fbbf24" 
              speed={0.7} 
              size={2.5}
            />
          </div>
        </>
      )}

      {/* Slice Lines SVG */}
      <svg 
        ref={sliceLineRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      >
        {activeSliceLines.map((line, index) => (
          <line
            key={index}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="url(#sliceGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
            className="animate-fade-out"
          />
        ))}
        <defs>
          <linearGradient id="sliceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      {/* Interactive Content Layer */}
      <div className="relative z-30 flex flex-col items-center justify-center w-full h-full px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 blur-2xl rounded-full opacity-40" />
            <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2
                          drop-shadow-[0_0_30px_rgba(236,72,153,0.7)]">
              <span className="font-cursive bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 
                             bg-clip-text text-transparent">
                Slice the Birthday Cake
              </span>
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-rose-200/90 font-elegant max-w-md mx-auto">
            {showSliceGuide ? 'Drag across the cake or tap to slice! 🎂' : 'Make 8 perfect slices!'}
            <span className="block text-xs sm:text-sm text-rose-300/60 mt-1">
              {sliceCount === 0 ? 'Start slicing to begin!' : `${sliceCount}/8 slices made`}
            </span>
          </p>
        </div>

        {/* Cake Container */}
        <div className="relative mb-8 sm:mb-12 md:mb-16">
          {/* Cake Image with enhanced styling */}
          <div
            ref={cakeRef}
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 
                       cursor-crosshair select-none
                       transition-all duration-300 rounded-full"
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onClick={(e) => {
              if (!isDraggingRef.current) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                createSliceLine(x, y, x + 10, y + 10);
                performSlice(x, y);
              }
            }}
          >
            {/* Cake Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 via-pink-500/20 to-purple-600/15 
                          rounded-full blur-2xl -z-10 animate-pulse-glow" />
            
            {/* Cake Shadow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-black/30 to-transparent blur-xl -z-20" />
            
            <img
              src="/assets/cakes/cake1.svg"
              alt="Birthday Cake"
              className="relative w-full h-full object-contain drop-shadow-[0_0_50px_rgba(245,158,11,0.5)] 
                       hover:drop-shadow-[0_0_60px_rgba(236,72,153,0.6)] transition-all duration-300"
              draggable="false"
            />
          </div>

          {/* Enhanced Knife */}
          <div
            ref={knifeRef}
            className="absolute pointer-events-none text-4xl sm:text-5xl md:text-6xl
                       drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]
                       z-40 transition-transform duration-100"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.5))',
            }}
          >
            🔪
            {/* Knife Glow */}
            <div className="absolute inset-0 bg-red-500/30 blur-lg -z-10 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Slice Progress with enhanced visuals */}
        <div className="mb-8 sm:mb-10 w-full max-w-md">
          <div className="flex gap-2 sm:gap-3 mb-4 justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (slicesRef.current[i] = el)}
                className={`relative text-2xl sm:text-3xl md:text-4xl transition-all duration-500 
                          ${i < sliceCount 
                            ? 'opacity-100 scale-110 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                            : 'opacity-30 scale-90'
                          }`}
              >
                🍰
                {/* Slice Glow */}
                {i < sliceCount && (
                  <div className="absolute inset-0 bg-yellow-400/30 blur-md -z-10 rounded-full" />
                )}
              </div>
            ))}
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm sm:text-base text-rose-300/90 px-1">
              <span className="font-elegant">Slicing Progress</span>
              <span className="font-semibold">{sliceCount}/8</span>
            </div>
            <div className="h-2.5 sm:h-3 bg-rose-900/40 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full transition-all duration-700 shadow-lg shadow-pink-500/30"
                style={{ width: `${(sliceCount / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons with enhanced styling */}
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-md">
          <Button
            onClick={handleButtonSlice}
            disabled={isSlicing || sliceCount >= 8}
            className="relative px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg md:text-xl 
                       bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600
                       hover:from-rose-500 hover:via-pink-500 hover:to-rose-500
                       text-white rounded-xl sm:rounded-2xl shadow-xl
                       hover:shadow-2xl hover:shadow-rose-500/40
                       transition-all duration-300
                       hover:scale-[1.03] active:scale-95
                       w-full sm:w-auto
                       disabled:opacity-50 disabled:cursor-not-allowed
                       overflow-hidden group"
          >
            {sliceCount >= 8 ? (
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">🎉</span>
                <span className="font-semibold">Cake Perfectly Sliced!</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <span className="text-xl sm:text-2xl">🔪</span>
                <span className="font-semibold">SLICE CAKE ({sliceCount}/8)</span>
              </span>
            )}
            {/* Button shine effect */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/15 to-transparent
                          -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>

          {sliceCount >= 1 && (
            <Button
              onClick={() => navigateTo('candle')}
              variant="outline"
              className="px-7 sm:px-8 py-4 sm:py-5 text-white border-2 border-rose-400/50
                       hover:bg-rose-900/40 hover:border-rose-300/70
                       hover:shadow-lg hover:shadow-rose-500/30
                       transition-all duration-300
                       rounded-xl sm:rounded-2xl
                       w-full sm:w-auto group"
            >
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <span className="font-semibold">Continue to Candles</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">🕯️→</span>
              </span>
            </Button>
          )}
        </div>

        {/* Instructions with better styling */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-rose-300/70 font-elegant px-4 py-2 
                       bg-gradient-to-r from-rose-900/30 to-pink-900/20 
                       rounded-lg border border-rose-500/20 backdrop-blur-sm">
            💡 {window.innerWidth < 640 
                ? 'Tap cake or use button to slice' 
                : 'Drag across cake or click button to slice'}
          </p>
        </div>

        {/* Enhanced Success Overlay */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-lg z-50 p-4 animate-fade-in">
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-rose-900/95 via-pink-900/90 to-purple-900/95 
                          rounded-2xl sm:rounded-3xl border-2 border-rose-500/50 backdrop-blur-2xl
                          max-w-sm sm:max-w-md w-full animate-scale-in shadow-2xl shadow-pink-900/50">
              <div className="relative mb-5 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 blur-2xl rounded-full opacity-40" />
                <div className="relative text-5xl sm:text-6xl animate-bounce">🎂✨</div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Perfectly Sliced!</h2>
              <p className="text-rose-200/90 text-sm sm:text-base mb-6">
                All 8 slices are ready! Time to light the birthday candles 🕯️
              </p>
              <Button
                onClick={() => navigateTo('candle')}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 
                         hover:from-yellow-400 hover:via-orange-400 hover:to-pink-400
                         text-white rounded-xl sm:rounded-2xl text-lg
                         shadow-lg hover:shadow-xl shadow-yellow-500/30
                         transition-all duration-300 group"
              >
                <span className="flex items-center justify-center gap-3">
                  <span>Light the Candles</span>
                  <span className="text-xl group-hover:scale-110 transition-transform">🕯️→</span>
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @keyframes fade-out {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-fade-out {
          animation: fade-out 1s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .cursor-crosshair {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M16 2 L16 10 M16 22 L16 30 M2 16 L10 16 M22 16 L30 16' stroke='%23f472b6' stroke-width='2' fill='none'/%3E%3C/svg%3E") 16 16, crosshair;
        }
        
        /* Improve touch experience */
        @media (pointer: coarse) {
          button, [role="button"] {
            min-height: 48px;
            min-width: 48px;
          }
        }
      `}</style>
    </div>
  );
}
