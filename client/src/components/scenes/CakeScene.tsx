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
  const [activeSliceLines, setActiveSliceLines] = useState<{x1: number, y1: number, x2: number, y2: number, id: number}[]>([]);
  
  const cakeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const knifeRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<(HTMLDivElement | null)[]>([]);
  const isDraggingRef = useRef(false);
  const lastSliceTimeRef = useRef(0);
  const sliceCooldown = 300; // Slightly faster cooldown for fun
  const lastPositionRef = useRef({x: 50, y: 50});
  const velocityRef = useRef({ vx: 0, vy: 0 }); // For knife physics

  // Update background image when settings change
  useEffect(() => {
    if (settings.customCakeBackground) {
      setBgImage(settings.customCakeBackground);
    }
  }, [settings.customCakeBackground]);

  // Hide guide after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSliceGuide(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize cake entrance animation
  useEffect(() => {
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.fromTo(cakeRef.current,
        { scale: 0, opacity: 0, y: 100, rotation: -20 },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0,
          rotation: 0, 
          duration: 1.2, 
          ease: 'elastic.out(1, 0.6)' 
        }
      );
    }
  }, [settings.reducedMotion]);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // e.preventDefault(); // Sometimes prevents scrolling on mobile, use carefully
    if (sliceCount >= 8) return;
    isDraggingRef.current = true;
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !knifeRef.current) return;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Calculate Velocity for dynamic rotation
    const dx = x - lastPositionRef.current.x;
    const dy = y - lastPositionRef.current.y;
    velocityRef.current = { vx: dx, vy: dy };

    updateKnifeVisuals(x, y, dx, dy);

    // Only slice if dragging and logic permits
    if (isDraggingRef.current && sliceCount < 8 && !isSlicing) {
      const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      const currentTime = Date.now();
      
      // Threshold: Must move fast enough or far enough to cut
      if (distance > 4 && currentTime - lastSliceTimeRef.current > sliceCooldown) {
        createSliceLine(lastPositionRef.current.x, lastPositionRef.current.y, x, y);
        performSlice(x, y);
        lastSliceTimeRef.current = currentTime;
      }
    }

    lastPositionRef.current = {x, y};
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    // Reset knife rotation when stopped
    if (knifeRef.current) {
      gsap.to(knifeRef.current, { rotation: 0, duration: 0.3, ease: 'back.out' });
    }
  };

  const updateKnifeVisuals = (x: number, y: number, dx: number, dy: number) => {
    if (!knifeRef.current) return;
    
    // Dynamic rotation based on movement direction (leaning into the cut)
    // Clamp rotation between -45 and 45 degrees
    const targetRotation = Math.max(-45, Math.min(45, dx * 5));

    gsap.to(knifeRef.current, {
      left: `${x}%`,
      top: `${y}%`,
      rotation: targetRotation,
      duration: 0.1, // Quick response
      ease: 'power2.out',
    });
  };

  const createSliceLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (settings.reducedMotion) return;
    
    const id = Date.now();
    setActiveSliceLines(prev => [...prev, { x1, y1, x2, y2, id }]);
    
    setTimeout(() => {
      setActiveSliceLines(prev => prev.filter(line => line.id !== id));
    }, 600);
  };

  // Enhanced "Crumbs" Effect - Physics based falling particles
  const createCrumbsEffect = (x: number, y: number) => {
    if (settings.reducedMotion || !containerRef.current) return;
    
    const colors = ['#FCD34D', '#FDBA74', '#F9A8D4', '#FFFFFF']; // Cake colors
    
    for (let i = 0; i < 8; i++) {
      const crumb = document.createElement('div');
      const size = Math.random() * 6 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      crumb.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none;
        z-index: 45;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
      
      containerRef.current.appendChild(crumb);

      // Physics animation: explode out then fall down
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 30 + 10;
      
      gsap.to(crumb, {
        x: Math.cos(angle) * velocity,
        y: Math.random() * 100 + 50, // Gravity effect
        rotation: Math.random() * 360,
        opacity: 0,
        duration: 0.8 + Math.random() * 0.4,
        ease: 'power1.out',
        onComplete: () => crumb.remove()
      });
    }
  };

  const performSlice = (sliceX?: number, sliceY?: number) => {
    if (sliceCount >= 8 || isSlicing) return;

    setIsSlicing(true);

    // Haptic feedback for mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
    }

    if (settings.soundEnabled) {
      audioManager.play('hit'); // Assuming 'hit' or 'slice' sound exists
    }

    if (sliceX && sliceY) {
      createCrumbsEffect(sliceX, sliceY);
    }

    // Impact animation on the cake
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.to(cakeRef.current, {
        scale: 0.95,
        rotation: (Math.random() - 0.5) * 5,
        duration: 0.05,
        yoyo: true,
        repeat: 1,
        ease: 'power3.inOut',
      });
    }

    setTimeout(() => {
      const newCount = sliceCount + 1;
      setSliceCount(newCount);

      if (newCount === 1) updateProgress({ cakeSliced: true });

      // Animate the UI counter slice
      if (!settings.reducedMotion && slicesRef.current[newCount - 1]) {
        const sliceElement = slicesRef.current[newCount - 1];
        gsap.fromTo(sliceElement,
          { scale: 0, opacity: 0, y: -20 },
          { scale: 1.3, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }
        );
        gsap.to(sliceElement, { scale: 1, duration: 0.2, delay: 0.4 });
      }

      setIsSlicing(false);

      if (newCount >= 8) {
        handleCompletion();
      }
    }, 100);
  };

  const handleCompletion = () => {
    setShowSuccess(true);
    if (settings.soundEnabled) audioManager.play('success');
    
    // Major celebration animation on the cake
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.to(cakeRef.current, {
        scale: 1.1,
        y: -20,
        rotation: 360,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  };

  const handleButtonSlice = () => {
    const x = 50 + (Math.random() * 30 - 15);
    const y = 50 + (Math.random() * 30 - 15);
    
    // Animate knife to position first
    if (knifeRef.current) {
        gsap.to(knifeRef.current, {
            left: `${x}%`,
            top: `${y}%`,
            rotation: -45,
            duration: 0.3,
            onComplete: () => {
                // Slash motion
                gsap.to(knifeRef.current, {
                    left: `${x + 10}%`,
                    top: `${y + 10}%`, 
                    duration: 0.2,
                    ease: "power4.out"
                });
                createSliceLine(x - 5, y - 5, x + 5, y + 5);
                performSlice(x, y);
            }
        });
    } else {
        performSlice(x, y);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden
                 bg-slate-950 select-none touch-none"
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* --- BACKGROUND LAYERS --- */}
      
      {/* 1. Custom/Base Image */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
        }}
      />

      {/* 2. Deep Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-950/80 via-purple-950/60 to-slate-950/90" />

      {/* 3. Texture (Noise) for "Timeless" feel */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* 4. Ambient Spotlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
      
      {/* 5. Center Spotlight (Focus on Cake) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] 
                      bg-radial-gradient from-yellow-200/10 to-transparent blur-2xl pointer-events-none" />


      {/* --- DECORATIVE FLOATERS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[10%] text-4xl opacity-10 animate-float">🎂</div>
        <div className="absolute bottom-[20%] right-[15%] text-3xl opacity-10 animate-float delay-700">🍰</div>
        <div className="absolute top-[20%] right-[20%] text-2xl opacity-15 animate-ping-slow">✨</div>
      </div>


      {/* --- GAME LAYERS --- */}

      {/* Slice Lines SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {activeSliceLines.map((line) => (
          <line
            key={line.id}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#glow)"
            className="animate-fade-stroke"
          />
        ))}
      </svg>

      {/* Success Confetti */}
      {showSuccess && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <Confetti 
            recycle={false} 
            numberOfPieces={300} 
            gravity={0.15}
            colors={['#F472B6', '#FBBF24', '#818CF8', '#34D399']}
          />
          <AdaptiveParticleSystem count={150} color="#FBBF24" speed={1} size={3} />
        </div>
      )}

      {/* --- MAIN UI CONTENT --- */}
      <div className="relative z-30 flex flex-col items-center justify-center w-full h-full px-4 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 animate-fade-in-down">
          <div className="inline-block relative">
             <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text 
                            bg-gradient-to-r from-yellow-200 via-pink-200 to-indigo-200
                            drop-shadow-[0_2px_10px_rgba(236,72,153,0.5)] pb-2 font-handwriting">
               Let's Cut the Cake!
             </h1>
             <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent blur-sm" />
          </div>
          
          <div className={`mt-4 transition-all duration-500 ${showSliceGuide ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'}`}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-pink-100 text-sm font-medium shadow-lg">
              <span className="animate-bounce">👆</span> Swipe across to slice
            </span>
          </div>
        </div>

        {/* The Cake */}
        <div className="relative group cursor-crosshair">
           {/* Plate/Shadow anchor */}
           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-12 bg-black/40 blur-xl rounded-[100%] scale-150" />

           <div
            ref={cakeRef}
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 
                       transition-transform duration-100 will-change-transform"
           >
            {/* Cake Glow Aura */}
            <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-3xl scale-90 group-hover:scale-110 transition-transform duration-700" />
            
            <img
              src="/assets/cakes/cake1.svg"
              alt="Birthday Cake"
              className="relative w-full h-full object-contain drop-shadow-2xl filter brightness-105"
              draggable="false"
            />
          </div>

          {/* Knife Cursor Follower */}
          <div
            ref={knifeRef}
            className="absolute pointer-events-none z-50 transition-opacity duration-200"
            style={{ 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)',
                opacity: isDraggingRef.current ? 1 : 0.6
            }}
          >
            <div className="text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] filter grayscale-[0.2]">
                🔪
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-8 sm:mt-12 w-full max-w-md backdrop-blur-lg bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl">
          {/* Icons Grid */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (slicesRef.current[i] = el)}
                className={`text-2xl sm:text-3xl transition-all duration-500 ${
                  i < sliceCount 
                    ? 'opacity-100 scale-110 grayscale-0 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                    : 'opacity-20 scale-90 grayscale'
                }`}
              >
                🍰
              </div>
            ))}
          </div>

          {/* Glass Bar */}
          <div className="relative h-4 bg-black/30 rounded-full overflow-hidden shadow-inner border border-white/5">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-500 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(236,72,153,0.6)]"
              style={{ width: `${(sliceCount / 8) * 100}%` }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide-bg_1s_linear_infinite]" />
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-rose-200/60 font-medium uppercase tracking-wider">
            <span>Start</span>
            <span>{sliceCount} / 8 Slices</span>
            <span>Ready</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md z-40">
           <Button
            onClick={(e) => { e.stopPropagation(); handleButtonSlice(); }}
            disabled={isSlicing || sliceCount >= 8}
            className={`flex-1 py-6 text-lg rounded-2xl font-bold shadow-xl border border-white/10 relative overflow-hidden group
                       ${sliceCount >= 8 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 cursor-default' 
                          : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500'
                       } transition-all duration-300 hover:scale-[1.02] active:scale-95`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
            <span className="relative flex items-center justify-center gap-2">
               {sliceCount >= 8 ? '✨ Perfect!' : '🔪 Slice for Me'}
            </span>
          </Button>
          
          {sliceCount >= 1 && (
             <Button
                onClick={(e) => { e.stopPropagation(); navigateTo('candle'); }}
                variant="outline"
                className="py-6 px-8 text-lg rounded-2xl font-bold border-2 border-pink-400/30 text-pink-100 hover:bg-pink-500/20 hover:border-pink-400 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-95"
             >
                Next <span className="ml-2">→</span>
             </Button>
          )}
        </div>
      </div>

      {/* --- SUCCESS MODAL --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-white/10 shadow-2xl text-center transform animate-scale-up">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-7xl filter drop-shadow-xl animate-bounce">
              🎂
            </div>
            
            <h2 className="mt-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 mb-2">
              Slices Ready!
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              The cake is perfectly cut. Now comes the magical part... lighting the candles!
            </p>
            
            <Button
              onClick={() => navigateTo('candle')}
              className="w-full py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
            >
              Light the Candles 🕯️
            </Button>
          </div>
        </div>
      )}

      {/* --- STYLES --- */}
      <style>{`
        .cursor-crosshair { cursor: none; } /* We use custom knife div */
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.5); opacity: 0.05; }
        }
        @keyframes slide-bg {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes fade-stroke {
          0% { stroke-opacity: 1; stroke-width: 6; }
          100% { stroke-opacity: 0; stroke-width: 0; }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-fade-stroke { animation: fade-stroke 0.6s ease-out forwards; }
        .animate-scale-up { animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .font-handwriting { font-family: 'Pacifico', 'Dancing Script', cursive; }
      `}</style>
    </div>
  );
}
