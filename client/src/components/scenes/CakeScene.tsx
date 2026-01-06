import { useRef, useState, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { Sparkles, Scissors, Utensils, PartyPopper } from 'lucide-react';

const TRAIL_LENGTH = 10;

export function CakeScene() {
  const { updateProgress, navigateTo, settings } = useSceneStore();
  const [sliceCount, setSliceCount] = useState(0);
  const [isSlicing, setIsSlicing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSliceGuide, setShowSliceGuide] = useState(true);
  const [bgImage, setBgImage] = useState<string>(settings.customCakeBackground || '/assets/cakes/background.png');
  
  // 1. Persistent Scars State
  const [scars, setScars] = useState<{x1: number, y1: number, x2: number, y2: number, id: number, rotation: number}[]>([]);
  const [activeSliceLines, setActiveSliceLines] = useState<{x1: number, y1: number, x2: number, y2: number, id: number}[]>([]);
  
  // 4. Dynamic Icing State
  const [icingSplit, setIcingSplit] = useState(false);
  const displayText = "20"; 

  const cakeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const knifeRef = useRef<HTMLDivElement>(null);
  const icingRef = useRef<HTMLDivElement>(null);
  const slicesRef = useRef<(HTMLDivElement | null)[]>([]);
  const trailPathRef = useRef<SVGPathElement>(null);
  
  const isDraggingRef = useRef(false);
  const lastSliceTimeRef = useRef(0);
  const sliceCooldown = 300; 
  const lastPositionRef = useRef({x: 50, y: 50});
  const trailHistory = useRef<{x: number, y: number}[]>([]);
  const velocityRef = useRef({ vx: 0, vy: 0 }); 

  // Helper to create the 3D icing look (Enhanced for "Thick Frosting" look)
  const renderAestheticIcing = (text: string) => (
    <div className="relative inline-block filter drop-shadow-lg">
        {/* Deep Shadow Layer */}
        <span className="absolute inset-0 translate-y-[4px] translate-x-[3px] text-rose-900/40 select-none z-0 blur-[1px]" aria-hidden="true">
            {text}
        </span>
        {/* Cream Body */}
        <span className="absolute inset-0 text-pink-500 select-none z-10" 
              style={{ 
                  textShadow: '2px 2px 0px #be185d, -1px -1px 2px #fbcfe8',
                  filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))'
              }} aria-hidden="true">
            {text}
        </span>
        {/* Specular Highlight (The tasty shine) */}
        <span className="relative text-white/80 select-none z-20 mix-blend-overlay" style={{ textShadow: '0px 2px 4px rgba(255,255,255,0.5)' }}>
            {text}
        </span>
    </div>
  );

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

  // Entrance Animation
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
      
      // Icing Text Entrance - Pop in
      if (icingRef.current) {
        gsap.fromTo(icingRef.current, 
           { opacity: 0, scale: 0, rotation: -20 },
           { opacity: 1, scale: 1, rotation: -5, duration: 0.8, delay: 1, ease: 'elastic.out(1.2, 0.5)' }
        );
      }
    }
  }, [settings.reducedMotion]);

  // --- INTERACTION HANDLERS ---

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (sliceCount >= 8) return;
    isDraggingRef.current = true;
    trailHistory.current = [];
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

    const dx = x - lastPositionRef.current.x;
    const dy = y - lastPositionRef.current.y;
    velocityRef.current = { vx: dx, vy: dy };

    updateKnifeVisuals(x, y, dx, dy);
    updateTrail(x, y);

    // Slice Logic
    if (isDraggingRef.current && sliceCount < 8 && !isSlicing) {
      const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      const currentTime = Date.now();
      
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
    trailHistory.current = [];
    if (trailPathRef.current) trailPathRef.current.setAttribute('d', '');
    
    if (knifeRef.current) {
      gsap.to(knifeRef.current, { rotation: 0, scale: 1, duration: 0.4, ease: 'back.out' });
    }
  };

  // --- VISUAL EFFECTS ---

  // 2. The "Swoosh" Motion Trail
  const updateTrail = (x: number, y: number) => {
    if (settings.reducedMotion) return;

    trailHistory.current.unshift({ x, y });
    if (trailHistory.current.length > TRAIL_LENGTH) {
      trailHistory.current.pop();
    }

    if (trailPathRef.current && trailHistory.current.length > 1) {
       let d = `M ${trailHistory.current[0].x} ${trailHistory.current[0].y}`;
       for (let i = 1; i < trailHistory.current.length; i++) {
         d += ` L ${trailHistory.current[i].x} ${trailHistory.current[i].y}`;
       }
       trailPathRef.current.setAttribute('d', d);
    }
  };

  const updateKnifeVisuals = (x: number, y: number, dx: number, dy: number) => {
    if (!knifeRef.current) return;
    
    const targetRotation = Math.max(-45, Math.min(45, dx * 6));
    const isMovingFast = Math.abs(dx) > 1 || Math.abs(dy) > 1;

    gsap.to(knifeRef.current, {
      left: `${x}%`,
      top: `${y}%`,
      rotation: targetRotation,
      scale: isMovingFast ? 0.9 : 1, 
      duration: 0.15, 
      ease: 'power2.out',
    });
  };

  const createSliceLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (settings.reducedMotion) return;
    
    const id = Date.now();
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    setActiveSliceLines(prev => [...prev, { x1, y1, x2, y2, id }]);
    
    // 1. Add Persistent Scar
    setScars(prev => [...prev, { x1, y1, x2, y2, id, rotation: angle }]);
    
    setTimeout(() => {
      setActiveSliceLines(prev => prev.filter(line => line.id !== id));
    }, 500);
  };

  const createCrumbsEffect = (x: number, y: number) => {
    if (settings.reducedMotion || !containerRef.current) return;
    
    const colors = ['#FCD34D', '#FFF', '#F9A8D4']; 
    
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
        border-radius: ${Math.random() > 0.5 ? '50%' : '30% 70% 70% 30%'};
        pointer-events: none;
        z-index: 45;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      `;
      
      containerRef.current.appendChild(crumb);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 20 + 5;
      
      gsap.to(crumb, {
        x: Math.cos(angle) * velocity * 5,
        y: 200 + Math.random() * 100, 
        rotation: Math.random() * 720,
        opacity: 0,
        scale: 0,
        duration: 1 + Math.random(),
        ease: 'power2.in', 
        onComplete: () => crumb.remove()
      });
    }
  };

  const performSlice = (sliceX?: number, sliceY?: number) => {
    if (sliceCount >= 8 || isSlicing) return;

    setIsSlicing(true);
    const newCount = sliceCount + 1;
    const isFinalSlice = newCount === 8;

    // 4. Dynamic Icing Logic
    if (!icingSplit && sliceX && sliceX > 30 && sliceX < 70 && sliceY && sliceY < 50) {
        setIcingSplit(true);
        if (icingRef.current) {
            const leftPart = icingRef.current.querySelector('.icing-left');
            const rightPart = icingRef.current.querySelector('.icing-right');
            if (leftPart && rightPart) {
                gsap.to(leftPart, { x: -25, y: 5, rotation: -25, duration: 0.6, ease: 'back.out(2)' });
                gsap.to(rightPart, { x: 25, y: -5, rotation: 15, duration: 0.6, ease: 'back.out(2)' });
            }
        }
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(isFinalSlice ? [50, 50, 100] : 40);
    }

    if (settings.soundEnabled) {
      audioManager.play('hit'); 
    }

    if (sliceX && sliceY) {
      createCrumbsEffect(sliceX, sliceY);
    }

    // 3. Grand Finale Slow Motion
    if (isFinalSlice && !settings.reducedMotion) {
        gsap.globalTimeline.timeScale(0.2);
        
        gsap.to(containerRef.current, {
            x: 5, y: 5, 
            duration: 0.1, 
            repeat: 5, 
            yoyo: true, 
            clearProps: "x,y",
            onComplete: () => {
                  gsap.globalTimeline.timeScale(1);
            }
        });

        gsap.fromTo("body", { backgroundColor: "white" }, { backgroundColor: "", duration: 0.1, clearProps: "all" });
    }

    // Impact Physics
    if (!settings.reducedMotion && cakeRef.current) {
      gsap.fromTo(cakeRef.current, 
        { scaleY: isFinalSlice ? 0.85 : 0.95, scaleX: isFinalSlice ? 1.15 : 1.05 },
        { scaleY: 1, scaleX: 1, duration: isFinalSlice ? 2.5 : 0.5, ease: 'elastic.out(1.5, 0.4)' }
      );
    }

    setTimeout(() => {
      setSliceCount(newCount);
      if (newCount === 1) updateProgress({ cakeSliced: true });

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
    }, isFinalSlice ? 300 : 150);
  };

  const handleCompletion = () => {
    setShowSuccess(true);
    if (settings.soundEnabled) audioManager.play('success');
    
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
    const y = 35 + (Math.random() * 20 - 10); 
    
    if (knifeRef.current) {
        gsap.to(knifeRef.current, {
            left: `${x}%`,
            top: `${y}%`,
            rotation: -45,
            duration: 0.2,
            onComplete: () => {
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
                 bg-slate-900 select-none touch-none"
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* --- BACKGROUND STAGE (IRL ROOM FEEL) --- */}
      
      {/* 1. Deep Room Colors + "Floor" Horizon */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e] via-[#2d1b4e] to-[#0f0518]" />
      
      {/* 2. Spotlight on the Table (Radial Gradient) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150vw] h-[50vh] 
                      bg-[radial-gradient(ellipse_at_center,_rgba(255,100,150,0.15),_transparent_70%)] 
                      pointer-events-none blur-3xl" />

      {/* 3. Disco / Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />

      {/* 4. GRAFFITI WALL "20" */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none opacity-40 mix-blend-overlay select-none">
          <div className="text-[12rem] sm:text-[18rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-pink-600 to-purple-800 rotate-[-5deg]"
               style={{ textShadow: '0 0 40px rgba(236, 72, 153, 0.5)', WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>
            20
          </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 animate-pulse text-yellow-200/40 text-4xl blur-[1px]">✨</div>
         <div className="absolute bottom-1/3 right-1/4 animate-pulse delay-700 text-pink-200/40 text-2xl blur-[1px]">✨</div>
      </div>

      {/* --- GAMEPLAY LAYERS --- */}

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
        
        {/* 2. Motion Trail Path */}
        <path 
           ref={trailPathRef}
           fill="none"
           stroke="rgba(255, 255, 255, 0.6)"
           strokeWidth="12"
           strokeLinecap="round"
           strokeLinejoin="round"
           style={{ filter: 'drop-shadow(0 0 10px white)' }}
        />

        {/* 1. Permanent Scars */}
        {scars.map((line) => (
          <line
            key={`scar-${line.id}`}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="#3f0f18"
            strokeWidth="4"
            strokeLinecap="round"
            className="opacity-60 mix-blend-multiply"
          />
        ))}

        {/* Active Slice Glows */}
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
            className="opacity-90"
          />
        ))}
      </svg>

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
        <div className="text-center mb-6 relative group">
           <div className="inline-flex items-center justify-center gap-3 mb-2 opacity-90">
             <span className="h-[2px] w-8 bg-pink-500/50 shadow-[0_0_10px_#ec4899]" />
             <span className="text-xs uppercase tracking-[0.4em] text-pink-300 font-bold drop-shadow-md">Level 20 Unlocked</span>
             <span className="h-[2px] w-8 bg-pink-500/50 shadow-[0_0_10px_#ec4899]" />
           </div>
           
           <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text 
                          bg-gradient-to-b from-white via-pink-100 to-rose-300 
                          drop-shadow-[0_4px_10px_rgba(255,255,255,0.2)] tracking-tight pb-2
                          transition-transform duration-500 hover:scale-[1.02]">
             CUT THE CAKE
           </h1>
           
           <div className={`absolute left-0 right-0 -bottom-12 transition-all duration-700 
                            ${showSliceGuide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
             <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-pink-500/30 text-white/90 text-sm backdrop-blur-md shadow-[0_0_20px_rgba(236,72,153,0.3)]">
               <Scissors className="w-4 h-4 animate-pulse text-pink-400" /> Swipe to slice!
             </span>
           </div>
        </div>

        {/* The Cake Interaction Zone */}
        <div className="relative group cursor-none my-4 perspective-1000">
           {/* Real Shadow to Ground the Cake */}
           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-16 bg-black/80 blur-xl rounded-[100%]" />

           <div
            ref={cakeRef}
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 
                       transition-transform will-change-transform z-20"
           >
            {/* Hover Glow Aura */}
            <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-3xl scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <img
              src="/assets/cakes/cake1.svg"
              alt="Birthday Cake"
              className="relative w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] filter brightness-105"
              draggable="false"
            />
            
            {/* 4. Aesthetic Icing Overlay "20" */}
            <div ref={icingRef} className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none" 
                 // Positioned on the top tier, slightly rotated
                 style={{ top: '-18%', transform: 'rotate(-5deg)' }}>
                {!icingSplit ? (
                    <div className="font-handwriting text-6xl sm:text-7xl md:text-8xl font-bold tracking-wider">
                        {renderAestheticIcing(displayText)}
                    </div>
                ) : (
                    <div className="flex gap-2 font-handwriting text-6xl sm:text-7xl md:text-8xl font-bold tracking-wider">
                        <div className="icing-left transform origin-bottom-right">
                            {renderAestheticIcing("2")}
                        </div>
                        <div className="icing-right transform origin-bottom-left">
                            {renderAestheticIcing("0")}
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* Custom Knife Cursor */}
          <div
            ref={knifeRef}
            className="absolute pointer-events-none z-50 w-24 h-24 flex items-center justify-center transition-opacity duration-200"
            style={{ 
                left: '50%', 
                top: '50%', 
                transform: 'translate(-50%, -50%)',
                opacity: isDraggingRef.current ? 1 : 0.7 
            }}
          >
            <div className="absolute text-7xl opacity-20 blur-sm translate-x-4 translate-y-4 rotate-45 text-black">🗡️</div>
            <div className="relative text-7xl filter drop-shadow-xl rotate-45 transform origin-bottom-left">🗡️</div>
          </div>
        </div>

        {/* HUD: Progress & Controls */}
        <div className="w-full max-w-md mt-12 flex flex-col gap-6">
          
          {/* Progress Slices (Scoreboard Style) */}
          <div className="flex justify-center items-end gap-3 h-14 px-6 py-2 bg-black/30 rounded-full backdrop-blur-xl border border-white/10 shadow-lg">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                ref={(el) => (slicesRef.current[i] = el)}
                className={`text-2xl transition-all duration-500 transform ${
                  i < sliceCount 
                    ? 'opacity-100 scale-110 filter drop-shadow-[0_0_8px_#fcd34d] -translate-y-1' 
                    : 'opacity-20 scale-90 grayscale blur-[1px]'
                }`}
              >
                🍰
              </div>
            ))}
          </div>

          {/* Controls - Glassmorphism Buttons */}
          <div className="flex gap-4">
             <Button
               onClick={(e) => { e.stopPropagation(); handleButtonSlice(); }}
               disabled={isSlicing || sliceCount >= 8}
               className={`flex-1 h-16 rounded-2xl font-bold text-lg shadow-xl backdrop-blur-md border overflow-hidden relative group transition-all duration-300
                          ${sliceCount >= 8 
                            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                            : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                          }`}
             >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <span className="relative flex items-center justify-center gap-2">
                    {sliceCount >= 8 ? <Sparkles className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
                    {sliceCount >= 8 ? 'Slice Complete!' : 'Slice for me'}
                </span>
             </Button>

             {sliceCount >= 1 && (
                <Button
                  onClick={(e) => { e.stopPropagation(); navigateTo('candle'); }}
                  variant="ghost"
                  className="h-16 px-6 rounded-2xl text-pink-200/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all font-semibold"
                >
                  Skip
                </Button>
             )}
          </div>
        </div>
      </div>

      {/* --- SUCCESS OVERLAY --- */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-700">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-black rounded-[2rem] p-8 border border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center transform animate-in zoom-in-95 duration-500">
            
            <div className="text-8xl mb-6 animate-bounce filter drop-shadow-2xl">🎁</div>
            
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 mb-2 font-serif tracking-tight">
              BON APETIT!!
            </h2>
            
            <p className="text-slate-400 mb-10 leading-relaxed font-medium">
              The cake is ready. Time to make a wish?
            </p>
            
            <Button
              onClick={() => navigateTo('candle')}
              className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all hover:scale-[1.02] active:scale-95 group border border-white/20"
            >
              <span className="flex items-center justify-center gap-3">
                 Light Candles <PartyPopper className="w-5 h-5 group-hover:rotate-12 transition-transform"/>
              </span>
            </Button>
          </div>
        </div>
      )}
      
      <style>{`
        .font-handwriting { font-family: 'Pacifico', cursive; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
}
