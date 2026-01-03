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
  const sliceCooldown = 300; 
  const lastPositionRef = useRef({x: 50, y: 50});
  const velocityRef = useRef({ vx: 0, vy: 0 }); 

  // --- SETTINGS & INITIALIZATION ---

  useEffect(() => {
    if (settings.customCakeBackground) {
      setBgImage(settings.customCakeBackground);
    }
  }, [settings.customCakeBackground]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSliceGuide(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Entrance Animation: A heavy, ceremonial "plonk" onto the table
  useEffect(() => {
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.fromTo(cakeRef.current,
        { scale: 0.8, opacity: 0, y: -100, rotation: -5 },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0,
          rotation: 0, 
          duration: 1.5, 
          ease: 'bounce.out' 
        }
      );
    }
  }, [settings.reducedMotion]);

  // --- INTERACTION HANDLERS ---

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
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

    // Calculate Velocity for dynamic rotation logic
    const dx = x - lastPositionRef.current.x;
    const dy = y - lastPositionRef.current.y;
    velocityRef.current = { vx: dx, vy: dy };

    updateKnifeVisuals(x, y, dx, dy);

    // Slice Logic
    if (isDraggingRef.current && sliceCount < 8 && !isSlicing) {
      const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      const currentTime = Date.now();
      
      // Needs momentum to cut
      if (distance > 3 && currentTime - lastSliceTimeRef.current > sliceCooldown) {
        createSliceLine(lastPositionRef.current.x, lastPositionRef.current.y, x, y);
        performSlice(x, y);
        lastSliceTimeRef.current = currentTime;
      }
    }

    lastPositionRef.current = {x, y};
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (knifeRef.current) {
      // Return knife to resting rotation
      gsap.to(knifeRef.current, { rotation: 0, scale: 1, duration: 0.4, ease: 'back.out' });
    }
  };

  // --- VISUAL EFFECTS ---

  const updateKnifeVisuals = (x: number, y: number, dx: number, dy: number) => {
    if (!knifeRef.current) return;
    
    // Lean the knife into the turn based on velocity (More realistic handling)
    const targetRotation = Math.max(-45, Math.min(45, dx * 6));
    const isMovingFast = Math.abs(dx) > 1 || Math.abs(dy) > 1;

    gsap.to(knifeRef.current, {
      left: `${x}%`,
      top: `${y}%`,
      rotation: targetRotation,
      scale: isMovingFast ? 0.9 : 1, // Slight squash when moving fast
      duration: 0.15, 
      ease: 'power2.out',
    });
  };

  const createSliceLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (settings.reducedMotion) return;
    
    const id = Date.now();
    setActiveSliceLines(prev => [...prev, { x1, y1, x2, y2, id }]);
    
    // Line fades out
    setTimeout(() => {
      setActiveSliceLines(prev => prev.filter(line => line.id !== id));
    }, 500);
  };

  // Enhanced "Crumbs" - Falling sponge cake physics
  const createCrumbsEffect = (x: number, y: number) => {
    if (settings.reducedMotion || !containerRef.current) return;
    
    const colors = ['#FCD34D', '#FFF', '#F9A8D4']; // Sponge, Icing, Decoration
    
    for (let i = 0; i < 12; i++) {
      const crumb = document.createElement('div');
      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      crumb.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '30% 70% 70% 30% / 30% 30% 70% 70%'};
        pointer-events: none;
        z-index: 45;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      `;
      
      containerRef.current.appendChild(crumb);

      // Physics: Explode out, then gravity takes over
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 20 + 5;
      
      gsap.to(crumb, {
        x: Math.cos(angle) * velocity * 5,
        y: 200 + Math.random() * 100, // Fall down off screen
        rotation: Math.random() * 720,
        opacity: 0,
        scale: 0,
        duration: 1 + Math.random(),
        ease: 'power2.in', // Gravity acceleration feeling
        onComplete: () => crumb.remove()
      });
    }
  };

  const performSlice = (sliceX?: number, sliceY?: number) => {
    if (sliceCount >= 8 || isSlicing) return;

    setIsSlicing(true);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40); // Crisper vibration
    }

    if (settings.soundEnabled) {
      audioManager.play('hit'); 
    }

    if (sliceX && sliceY) {
      createCrumbsEffect(sliceX, sliceY);
    }

    // Impact Physics: Cake squashes slightly when hit
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.fromTo(cakeRef.current, 
        { scaleY: 0.95, scaleX: 1.05 },
        { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1.5, 0.4)' }
      );
    }

    setTimeout(() => {
      const newCount = sliceCount + 1;
      setSliceCount(newCount);
      if (newCount === 1) updateProgress({ cakeSliced: true });

      // Animate the specific slice indicator in the HUD
      if (!settings.reducedMotion && slicesRef.current[newCount - 1]) {
        const sliceIcon = slicesRef.current[newCount - 1];
        gsap.fromTo(sliceIcon,
          { scale: 0, rotate: -180 },
          { scale: 1.2, rotate: 0, duration: 0.5, ease: 'back.out(1.7)' }
        );
        gsap.to(sliceIcon, { scale: 1, duration: 0.2, delay: 0.5 });
      }

      setIsSlicing(false);

      if (newCount >= 8) {
        handleCompletion();
      }
    }, 150); // Slight delay for impact feel
  };

  const handleCompletion = () => {
    setShowSuccess(true);
    if (settings.soundEnabled) audioManager.play('success');
    
    // Victory Spin
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.to(cakeRef.current, {
        y: -30,
        rotation: 360,
        duration: 2,
        ease: 'elastic.out(1, 0.75)',
      });
    }
  };

  const handleButtonSlice = () => {
    const x = 50 + (Math.random() * 20 - 10);
    const y = 50 + (Math.random() * 20 - 10);
    
    if (knifeRef.current) {
        gsap.to(knifeRef.current, {
            left: `${x}%`,
            top: `${y}%`,
            rotation: -45,
            duration: 0.2,
            onComplete: () => {
                // Slash motion
                gsap.to(knifeRef.current, {
                    left: `${x + 15}%`,
                    top: `${y + 15}%`, 
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
      {/* --- BACKGROUND STAGE --- */}
      
      {/* 1. Base Dark Warmth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/40 via-slate-950 to-slate-950" />
      
      {/* 2. Custom BG (faded) */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 mix-blend-overlay"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.2,
        }}
      />

      {/* 3. The Spotlight (Floor) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] 
                      bg-radial-gradient from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
      
      {/* 4. Ambient Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 animate-pulse text-yellow-200/20 text-4xl blur-[1px]">✨</div>
         <div className="absolute bottom-1/3 right-1/4 animate-pulse delay-700 text-pink-200/20 text-2xl blur-[1px]">✨</div>
      </div>


      {/* --- GAMEPLAY LAYERS --- */}

      {/* Slice Lines (Glowing Energy Trails) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
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
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#glow)"
            className="opacity-80"
          />
        ))}
      </svg>

      {/* Confetti on Success */}
      {showSuccess && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <Confetti 
            recycle={false} 
            numberOfPieces={400} 
            gravity={0.2}
            colors={['#F472B6', '#FBBF24', '#FFFFFF', '#A78BFA']}
          />
          <AdaptiveParticleSystem count={100} color="#FBBF24" speed={0.5} size={2} />
        </div>
      )}

      {/* --- MAIN STAGE UI --- */}
      <div className="relative z-30 flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto px-6">
        
        {/* Header Title */}
        <div className="text-center mb-8 relative">
           <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text 
                          bg-gradient-to-br from-yellow-100 via-pink-200 to-indigo-200 
                          drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-handwriting pb-2">
             Let's Cut the Cake!
           </h1>
           
           {/* Guide Tooltip */}
           <div className={`absolute left-0 right-0 -bottom-10 transition-all duration-700 
                           ${showSliceGuide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
             <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-pink-100/80 text-sm backdrop-blur-md shadow-lg">
               <span className="animate-bounce">👋</span> Swipe quickly to slice
             </span>
           </div>
        </div>

        {/* The Cake Interaction Zone */}
        <div className="relative group cursor-none my-4">
           {/* The Plate Shadow (Grounding the object) */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-56 h-12 bg-black/60 blur-xl rounded-[100%] scale-110" />

           <div
            ref={cakeRef}
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 
                       transition-transform will-change-transform z-20"
           >
            {/* Hover Glow Aura */}
            <div className="absolute inset-0 bg-yellow-400/5 rounded-full blur-3xl scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <img
              src="/assets/cakes/cake1.svg"
              alt="Birthday Cake"
              className="relative w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] filter brightness-110"
              draggable="false"
            />
          </div>

          {/* Custom Knife Cursor */}
          <div
            ref={knifeRef}
            className="absolute pointer-events-none z-50 w-16 h-16 flex items-center justify-center transition-opacity duration-200"
            style={{ 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)',
                opacity: isDraggingRef.current ? 1 : 0.7 
            }}
          >
            {/* Shadow for depth */}
            <div className="absolute text-6xl opacity-30 blur-sm translate-x-2 translate-y-2 filter grayscale">🔪</div>
            {/* The Actual Knife */}
            <div className="relative text-6xl filter drop-shadow-md">🔪</div>
          </div>
        </div>

        {/* HUD: Progress & Controls */}
        <div className="w-full max-w-md mt-8 flex flex-col gap-6">
          
          {/* Progress Slices (Scoreboard) */}
          <div className="flex justify-center items-end gap-2 h-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (slicesRef.current[i] = el)}
                className={`text-2xl transition-all duration-300 transform ${
                  i < sliceCount 
                    ? 'opacity-100 scale-110 grayscale-0 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
                    : 'opacity-20 scale-75 grayscale'
                }`}
              >
                🍰
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
             <Button
               onClick={(e) => { e.stopPropagation(); handleButtonSlice(); }}
               disabled={isSlicing || sliceCount >= 8}
               className={`flex-1 py-6 rounded-2xl font-bold text-lg shadow-xl border border-white/10 backdrop-blur-sm
                          transition-all duration-300 hover:-translate-y-1 active:scale-95 active:translate-y-0
                          ${sliceCount >= 8 
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50' 
                            : 'bg-gradient-to-r from-rose-600/80 to-pink-600/80 hover:from-rose-500 hover:to-pink-500 text-white'
                          }`}
             >
                {sliceCount >= 8 ? 'Perfectly Sliced! ✨' : 'Slice It! 🔪'}
             </Button>

             {sliceCount >= 1 && (
                <Button
                  onClick={(e) => { e.stopPropagation(); navigateTo('candle'); }}
                  variant="ghost"
                  className="px-6 py-6 rounded-2xl text-pink-200 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20 transition-all"
                >
                  Skip →
                </Button>
             )}
          </div>
        </div>
      </div>

      {/* --- SUCCESS OVERLAY --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2rem] p-8 border border-white/10 shadow-2xl text-center transform animate-in zoom-in-95 duration-300">
            
            <div className="text-7xl mb-6 animate-bounce filter drop-shadow-lg">🎂</div>
            
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 mb-3">
              Ready to Serve!
            </h2>
            
            <p className="text-slate-300 mb-8 leading-relaxed font-light">
              The hard part is done. Now, let's make a wish and light the candles.
            </p>
            
            <Button
              onClick={() => navigateTo('candle')}
              className="w-full py-7 text-lg font-bold rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-[0_10px_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02] active:scale-95"
            >
              Light Candles 🕯️
            </Button>
          </div>
        </div>
      )}
      
      <style>{`
        .font-handwriting { font-family: 'Pacifico', cursive; }
      `}</style>
    </div>
  );
}
