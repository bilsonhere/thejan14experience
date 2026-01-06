import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Crown, ChevronRight, Sparkles, Star } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* SUB-COMPONENT: LUXURY CLOCK HANDS (PRESERVED & POLISHED) */
/* ------------------------------------------------------------------ */
const ClockHands = () => (
  <div className="absolute inset-0 z-20 pointer-events-none">
    {/* Central Pin mechanism */}
    <div className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 shadow-[0_0_20px_rgba(255,255,255,0.5)] z-30 border-2 border-slate-500 ring-2 ring-black/20" />
    <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 z-40 animate-pulse" />

    {/* Hour Hand */}
    <div className="clock-hand-hour absolute top-1/2 left-1/2 w-2 h-16 sm:h-20 -translate-x-1/2 -translate-y-[90%] bg-gradient-to-t from-slate-300 to-slate-100 rounded-full origin-bottom z-10 shadow-lg" 
         style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />

    {/* Minute Hand */}
    <div className="clock-hand-minute absolute top-1/2 left-1/2 w-1 h-24 sm:h-28 -translate-x-1/2 -translate-y-[92%] bg-gradient-to-t from-pink-300 to-purple-200 rounded-full origin-bottom z-20 shadow-[0_0_10px_rgba(236,72,153,0.4)]" />

    {/* Second Hand */}
    <div className="clock-hand-second absolute top-1/2 left-1/2 w-[2px] h-28 sm:h-36 -translate-x-1/2 -translate-y-[85%] bg-gradient-to-t from-yellow-300 via-yellow-100 to-transparent origin-bottom z-20 shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
  </div>
);

type Phase = 'idle' | 'prologue' | 'accelerating' | 'counting' | 'finale';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // Game State
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Visual State
  const [warpSpeed, setWarpSpeed] = useState(0.1); // Start very slow (stars)
  const [warpColor, setWarpColor] = useState("#A78BFA");
  const [filmGrainOpacity, setFilmGrainOpacity] = useState(0.05);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const cinematicTextRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* SETUP & IDLE */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 2 });
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 1: THE CINEMATIC PROLOGUE ("20 Years Ago...") */
  /* ------------------------------------------------------------------ */
  const startCinematicSequence = () => {
    setPhase('prologue');
    if (settings.soundEnabled) audioManager.play('click'); 

    const tl = gsap.timeline({
        onComplete: () => startWarpSequence() // Trigger warp after text
    });

    // 1. Fade out UI
    tl.to('.start-ui', { opacity: 0, y: 20, duration: 1, ease: 'power2.inOut' });

    // 2. Increase Film Grain for "Flashback" feel
    tl.to({}, { 
        duration: 1, 
        onUpdate: function() { setFilmGrainOpacity(0.15 + (this.progress() * 0.1)) } // Ramp up noise
    }, "<");

    // 3. Cinematic Text Series
    const narrative = [
        "20 YEARS AGO...",
        "A JOURNEY BEGAN",
        "MOMENTS BECAME MEMORIES",
        "AND TODAY...",
        "WE CELEBRATE YOU"
    ];
    
    if (cinematicTextRef.current) {
        narrative.forEach((text, i) => {
            const el = document.createElement('div');
            el.innerText = text;
            // Elegant Serif for the flashback feel
            el.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl font-serif italic text-white/90 tracking-widest opacity-0 blur-sm whitespace-nowrap z-40";
            cinematicTextRef.current?.appendChild(el);

            // Smooth Fade In/Out - Not rushed
            tl.to(el, { 
                opacity: 1, 
                blur: 0, 
                scale: 1.1, 
                duration: 1.5, // Slow read time
                ease: "power2.out" 
            });
            
            tl.to(el, { 
                opacity: 0, 
                blur: 5, 
                scale: 1.2, 
                duration: 1, 
                ease: "power2.in" 
            }, ">+0.5"); // Pause for reading
        });
    }
  };

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 2: THE WARP (Transition to Present) */
  /* ------------------------------------------------------------------ */
  const startWarpSequence = () => {
    setPhase('accelerating');
    
    // Clear text container just in case
    if (cinematicTextRef.current) cinematicTextRef.current.innerHTML = '';

    const tl = gsap.timeline({
        onComplete: () => startClockSequence()
    });

    // 1. Clean up grain (Moving to clean modern digital look)
    tl.to({}, { 
        duration: 2, 
        onUpdate: function() { setFilmGrainOpacity(0.15 - (this.progress() * 0.12)) }
    });

    // 2. Ramp up Warp Speed
    tl.to({}, { 
        duration: 3, 
        ease: "expo.in", 
        onStart: () => setWarpColor("#FFFFFF"),
        onUpdate: function() { 
            const progress = this.progress();
            setWarpSpeed(0.2 + (progress * 40)); 
        }
    }, "<");

    // 3. Whiteout Flash
    tl.to(containerRef.current, { backgroundColor: '#ffffff', duration: 0.2, ease: 'power4.in' });
    tl.to(containerRef.current, { backgroundColor: '#05030a', duration: 0.5 }, ">");
  };

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 3: THE CLOCK REVEAL */
  /* ------------------------------------------------------------------ */
  const startClockSequence = () => {
    setPhase('counting');
    setWarpSpeed(0.5); // Calm background
    setWarpColor("#A78BFA"); 
    
    // Dramatic Entry of the Clock
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 3, opacity: 0, rotate: -15 },
            { 
                scale: 1, 
                opacity: 1, 
                rotate: 0, 
                duration: 2, 
                ease: 'elastic.out(1, 0.8)', 
            }
        );
        
        // Spin hands
        gsap.to('.clock-hand-second', { rotation: 360, duration: 2, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
        gsap.to('.clock-hand-minute', { rotation: 360, duration: 20, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
    }

    // Start Countdown
    let count = 0;
    const timer = setInterval(() => {
        count++;
        setCountdown(count);
        handleTick(count);

        if (count >= 20) {
            clearInterval(timer);
            triggerFinale();
        }
    }, 800); 
  };

  const handleTick = (num: number) => {
    if (settings.soundEnabled) audioManager.play('hit'); 

    if (numberRingRef.current) {
        const rotationAngle = -(num - 1) * (360 / 20); 
        gsap.to(numberRingRef.current, {
            rotation: rotationAngle,
            duration: 0.8,
            ease: 'elastic.out(1.2, 0.5)' 
        });
    }

    // Heartbeat Effect on Clock
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 1.02, boxShadow: '0 0 80px rgba(168,85,247,0.3)' },
            { scale: 1, boxShadow: '0 0 40px rgba(0,0,0,0.5)', duration: 0.4, ease: 'power2.out' }
        );
    }
  };

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 4: FINALE */
  /* ------------------------------------------------------------------ */
  const triggerFinale = () => {
    setTimeout(() => {
        setPhase('finale');
        if (settings.soundEnabled) audioManager.play('success');

        // Explosion Background
        gsap.to(containerRef.current, { backgroundColor: '#ffffff', duration: 0.1, yoyo: true, repeat: 1 });
        gsap.to(containerRef.current, { 
            background: 'radial-gradient(circle at center, #831843 0%, #4c1d95 40%, #000000 100%)', 
            duration: 3 
        });

        if (titleGroupRef.current) {
            const tl = gsap.timeline();
            tl.fromTo(titleGroupRef.current.children, 
                { y: 50, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.15, duration: 1.5, ease: 'power3.out' }
            );
        }
        
        setTimeout(() => navigateTo('room'), 8000);
    }, 800);
  };

  // Helper for Clock visuals
  const getNumberOpacity = (index: number) => {
      if (!countdown) return 0.15;
      const diff = Math.abs((index + 1) - countdown);
      if (diff === 0) return 1;
      if (diff === 1 || diff === 19) return 0.4;
      return 0.05; 
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#05030a] transition-colors duration-1000 perspective-1000 font-display">
        
        {/* --- DYNAMIC BACKGROUND LAYER --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Film Grain / Noise - Dynamic Opacity */}
             <div 
                className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay transition-opacity duration-1000" 
                style={{ opacity: filmGrainOpacity }} 
             />
             
             {/* Vignette */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
             
             {/* Nebula Glow */}
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-[radial-gradient(circle,rgba(76,29,149,0.2)_0%,transparent_70%)] blur-[80px] transition-all duration-1000 ${phase === 'finale' ? 'opacity-0' : 'opacity-100'}`} />
        </div>

        {/* --- PARTICLES --- */}
        <AdaptiveParticleSystem 
            count={phase === 'accelerating' ? 400 : 100} 
            color={warpColor} 
            speed={warpSpeed}
            size={phase === 'accelerating' ? 3 : 1.5}
            className={`z-10 transition-opacity duration-1000 ${phase === 'counting' ? 'opacity-40' : 'opacity-100'}`}
        />

        {/* --- CINEMATIC TEXT CONTAINER --- */}
        <div ref={cinematicTextRef} className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center drop-shadow-2xl" />

        {/* --- CONFETTI --- */}
        {phase === 'finale' && (
            <div className="fixed inset-0 z-50 pointer-events-none">
                <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#FCD34D', '#F472B6', '#818CF8', '#FFFFFF']} gravity={0.15} />
            </div>
        )}

        {/* --- MAIN CONTENT --- */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4">
            
            {/* 1. ELEGANT START SCREEN */}
            {phase === 'idle' && (
                <div className="start-ui text-center space-y-12 animate-fade-in-up max-w-2xl mx-auto">
                    
                    {/* Floating Ornament */}
                    <div className="flex justify-center mb-8">
                        <Sparkles className="w-8 h-8 text-purple-300/50 animate-pulse" />
                    </div>

                    <div className="space-y-6 relative">
                        <h2 className="text-xs md:text-sm font-medium tracking-[0.8em] text-purple-200/70 uppercase">
                            The Prelude
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-purple-200 tracking-wider drop-shadow-2xl">
                            Midnight
                        </h1>
                        <p className="text-white/40 font-light tracking-widest text-sm max-w-md mx-auto leading-relaxed">
                            A cinematic journey through time waiting to unfold.
                        </p>
                    </div>

                    <div className="pt-8">
                        <button
                            onClick={startCinematicSequence}
                            className="group relative flex items-center justify-center gap-3 px-8 py-4 mx-auto transition-all duration-700 hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute inset-0 border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20" />
                            
                            <span className="relative z-10 text-white font-light text-sm tracking-[0.3em] group-hover:tracking-[0.5em] transition-all duration-500">
                                BEGIN JOURNEY
                            </span>
                            <ChevronRight className="relative z-10 w-4 h-4 text-purple-300 opacity-50 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            {/* 2. THE MAGICAL CLOCK */}
            {phase === 'counting' && (
                <div className="relative w-full max-w-[min(85vw,420px)] aspect-square flex items-center justify-center">
                    <div ref={clockContainerRef} className="relative w-full h-full rounded-full">
                        {/* Outer Glow */}
                        <div className="absolute inset-[-20px] bg-purple-500/20 blur-3xl rounded-full" />
                        
                        {/* Outer Rim */}
                        <div className="absolute inset-[-10px] rounded-full bg-gradient-to-b from-gray-700 to-black shadow-[0_0_50px_rgba(0,0,0,0.9)] z-0" />
                        
                        {/* Glass Face */}
                        <div className="absolute inset-0 rounded-full bg-[#1a1b26] border border-white/10 shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] z-10 overflow-hidden ring-1 ring-white/10">
                            <div className="absolute inset-2 rounded-full border border-white/5 opacity-50" />
                            
                            {/* Numbers */}
                            <div ref={numberRingRef} className="absolute inset-0 rounded-full z-10 will-change-transform">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1/2 origin-bottom pt-5" style={{ transform: `rotate(${i * (360/20)}deg)` }}>
                                        <div className="flex flex-col items-center justify-start h-full">
                                            <span className={`block text-3xl font-display font-bold transition-all duration-200 ${countdown === i + 1 ? 'text-white scale-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'text-white/10'}`}
                                                style={{ opacity: getNumberOpacity(i), transform: `rotate(${-i * (360/20)}deg)` }}>
                                                {i + 1}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <ClockHands />
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full pointer-events-none z-50 mix-blend-overlay" />
                        </div>
                    </div>
                </div>
            )}

            {/* 3. FINALE */}
            {phase === 'finale' && (
                <div ref={titleGroupRef} className="text-center w-full max-w-4xl px-4 z-40">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse" />
                            <Crown className="relative w-20 h-20 text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.6)] animate-float" />
                        </div>
                    </div>
                    
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
                        AFRAH GHAZI
                    </h1>
                    
                    <div className="flex items-center justify-center gap-4 text-purple-200 mb-8 opacity-90">
                        <div className="h-px w-12 bg-purple-300/50" />
                        <span className="text-xl md:text-2xl font-light tracking-[0.4em] uppercase">Is Now</span>
                        <div className="h-px w-12 bg-purple-300/50" />
                    </div>
                    
                    <div className="relative inline-block">
                        <h2 className="text-8xl md:text-[10rem] leading-none font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-pink-400 to-purple-600 drop-shadow-2xl">
                            20
                        </h2>
                        <Star className="absolute -top-4 -right-8 w-12 h-12 text-yellow-200 animate-spin-slow opacity-80" />
                    </div>
                    
                    <div className="mt-16 max-w-xl mx-auto">
                        <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-500">
                             <p className="text-xl md:text-2xl text-gray-100 font-serif italic leading-relaxed">
                                "Pop the sugarcane juice champagne! <span className="not-italic">🍾</span>"
                             </p>
                        </div>
                    </div>
                </div>
            )}

        </div>

        <style>{`
            .font-display { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .animate-spin-slow { animation: spin 12s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
            .animate-float { animation: float 5s ease-in-out infinite; }
        `}</style>
    </div>
  );
}
