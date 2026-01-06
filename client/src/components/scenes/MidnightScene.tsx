import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Sparkles, Crown, ArrowRight, Stars, Clock as ClockIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* SUB-COMPONENT: LUXURY CLOCK HANDS */
/* ------------------------------------------------------------------ */
const ClockHands = () => (
  <div className="absolute inset-0 z-20 pointer-events-none">
    {/* Central Pin mechanism */}
    <div className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 shadow-[0_0_20px_rgba(255,255,255,0.5)] z-30 border-2 border-slate-500 ring-2 ring-black/20" />
    <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 z-40 animate-pulse" />

    {/* Hour Hand - Heavy, Industrial */}
    <div className="clock-hand-hour absolute top-1/2 left-1/2 w-2 h-16 sm:h-20 -translate-x-1/2 -translate-y-[90%] bg-gradient-to-t from-slate-300 to-slate-100 rounded-full origin-bottom z-10 shadow-lg" 
         style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />

    {/* Minute Hand - Elegant, Long */}
    <div className="clock-hand-minute absolute top-1/2 left-1/2 w-1 h-24 sm:h-28 -translate-x-1/2 -translate-y-[92%] bg-gradient-to-t from-pink-300 to-purple-200 rounded-full origin-bottom z-20 shadow-[0_0_10px_rgba(236,72,153,0.4)]" />

    {/* Second Hand - Laser-like */}
    <div className="clock-hand-second absolute top-1/2 left-1/2 w-[2px] h-28 sm:h-36 -translate-x-1/2 -translate-y-[85%] bg-gradient-to-t from-yellow-300 via-yellow-100 to-transparent origin-bottom z-20 shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
  </div>
);

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // Game State
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [started, setStarted] = useState(false);
  const [celebrateMode, setCelebrateMode] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* SETUP & ENTRANCE */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Initial Fade In
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 2, ease: 'power2.out' });
    }

    // Nebula Movement
    if (nebulaRef.current) {
        gsap.to(nebulaRef.current, {
            rotation: 360,
            scale: 1.5,
            duration: 120,
            repeat: -1,
            ease: "linear"
        });
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !started) startSequence();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [started]);

  /* ------------------------------------------------------------------ */
  /* LOGIC: THE SEQUENCE */
  /* ------------------------------------------------------------------ */
  
  const startSequence = () => {
    if (started) return;
    setStarted(true);
    
    // 1. Audio Start
    if (settings.soundEnabled) audioManager.play('click'); 

    // 2. Animate Button Out
    if (buttonRef.current) {
        gsap.to(buttonRef.current, { scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.in(2)' });
    }

    // 3. Reveal Clock (Dramatic Entry)
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 0.5, opacity: 0, rotate: -180, filter: 'blur(20px)' },
            { 
                scale: 1, 
                opacity: 1, 
                rotate: 0, 
                filter: 'blur(0px)', 
                duration: 1.5, 
                ease: 'elastic.out(1, 0.7)', 
                delay: 0.2 
            }
        );
        
        // Continuous rotation for hands
        gsap.to('.clock-hand-second', { rotation: 360, duration: 2, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
        gsap.to('.clock-hand-minute', { rotation: 360, duration: 20, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
    }

    // 4. Begin Countdown Loop
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

    // Rotate the ring: "Locking" mechanism feel
    if (numberRingRef.current) {
        const rotationAngle = -(num - 1) * (360 / 20); 
        gsap.to(numberRingRef.current, {
            rotation: rotationAngle,
            duration: 0.8,
            ease: 'elastic.out(1.2, 0.5)' // Bouncy mechanical lock
        });
    }

    // Pulse the clock & background
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 1.05, boxShadow: '0 0 100px rgba(255,255,255,0.2)' },
            { scale: 1, boxShadow: '0 0 50px rgba(0,0,0,0.5)', duration: 0.5, ease: 'power2.out' }
        );
    }
    
    // Ambient Background Flash
    if (containerRef.current) {
        gsap.to(containerRef.current, {
            backgroundColor: '#1a103c', // Lighter purple flash
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            onComplete: () => gsap.to(containerRef.current, { backgroundColor: '#05030a', duration: 0.5 })
        });
    }
  };

  const triggerFinale = () => {
    setTimeout(() => {
        setShowFinale(true);
        setCelebrateMode(true);
        if (settings.soundEnabled) audioManager.play('success');

        // Whiteout Flash
        gsap.to(containerRef.current, { backgroundColor: '#ffffff', duration: 0.1, yoyo: true, repeat: 1 });

        // Change Background to Celebration Mode
        gsap.to(containerRef.current, { 
            background: 'radial-gradient(circle at center, #831843 0%, #4c1d95 40%, #000000 100%)', 
            duration: 2.5 
        });

        // Animate Title In
        if (titleGroupRef.current) {
            const tl = gsap.timeline();
            tl.fromTo(titleGroupRef.current.children, 
                { y: 100, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.2, duration: 1.2, ease: 'power4.out' }
            );
        }
        
        setTimeout(() => navigateTo('room'), 7000);
    }, 800);
  };

  // Helper: Ring Opacity Logic
  const getNumberOpacity = (index: number) => {
      if (!countdown) return 0.15;
      const diff = Math.abs((index + 1) - countdown);
      if (diff === 0) return 1;
      if (diff === 1 || diff === 19) return 0.4;
      return 0.05; 
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#05030a] transition-colors duration-1000">
        
        {/* --- AMBIENT BACKGROUND LAYERS --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* 1. Grain/Noise Texture for "Film" look */}
             <div className="absolute inset-0 opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
             
             {/* 2. Deep Vignette */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)]" />

             {/* 3. Rotating Nebula */}
             <div ref={nebulaRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] opacity-30 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0deg,#4c1d95_100deg,transparent_200deg,#db2777_300deg,transparent_360deg)] blur-[100px]" />
        </div>

        {/* --- PARTICLES --- */}
        <AdaptiveParticleSystem 
            count={celebrateMode ? 150 : 60} 
            color={celebrateMode ? "#FCD34D" : "#A78BFA"} 
            speed={celebrateMode ? 1.5 : 0.4}
            size={celebrateMode ? 3 : 1.5}
            className="z-10"
        />

        {/* --- CONFETTI (FINALE) --- */}
        {showFinale && (
            <div className="fixed inset-0 z-50 pointer-events-none">
                <Confetti 
                    width={window.innerWidth} 
                    height={window.innerHeight}
                    recycle={false} 
                    numberOfPieces={400}
                    gravity={0.15}
                    initialVelocityX={10}
                    initialVelocityY={20}
                    colors={['#FCD34D', '#F472B6', '#818CF8', '#FFFFFF']} 
                />
            </div>
        )}

        {/* --- CONTENT LAYER --- */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4 perspective-[1000px]">
            
            {/* 1. START SCREEN */}
            {!started && !showFinale && (
                <div className="text-center space-y-12 animate-fade-in-up">
                    <div className="space-y-6 relative">
                        {/* Glowing backdrop for text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full" />
                        
                        <div className="relative inline-flex p-4 rounded-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border border-white/10 mb-6 animate-float shadow-2xl">
                            <ClockIcon className="w-10 h-10 text-pink-300 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
                        </div>
                        
                        <div>
                            <h1 className="text-5xl md:text-7xl font-display font-thin text-white tracking-[0.2em] drop-shadow-2xl">
                                MIDNIGHT
                            </h1>
                            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-pink-400 to-transparent my-4 opacity-50" />
                            <h2 className="text-2xl md:text-3xl font-light text-purple-200 tracking-widest uppercase">
                                Awaits
                            </h2>
                        </div>
                        
                        <p className="text-white/40 font-mono text-xs tracking-[0.3em] uppercase">
                            The transition to 20
                        </p>
                    </div>

                    <button
                        ref={buttonRef}
                        onClick={startSequence}
                        className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full transition-all duration-500 hover:scale-105 cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>
                        <div className="absolute inset-[1px] bg-[#05030a] rounded-full z-10"></div>
                        
                        <span className="relative z-20 flex items-center gap-3 text-white font-medium text-sm md:text-base tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500">
                            ENTER <ArrowRight className="w-4 h-4 text-pink-400" />
                        </span>
                    </button>
                    
                    <p className="text-[10px] text-white/20 fixed bottom-8 left-0 w-full text-center uppercase tracking-widest">
                        Press [Enter] to begin
                    </p>
                </div>
            )}

            {/* 2. THE MAGICAL CLOCK */}
            {started && !showFinale && (
                <div className="relative w-full max-w-[min(85vw,420px)] aspect-square flex items-center justify-center">
                    
                    {/* Clock Container */}
                    <div ref={clockContainerRef} className="relative w-full h-full rounded-full">
                        
                        {/* Outer Rim (Metallic) */}
                        <div className="absolute inset-[-10px] rounded-full bg-gradient-to-b from-gray-700 to-black shadow-[0_0_30px_rgba(0,0,0,0.8)] z-0" />
                        
                        {/* Glass Face */}
                        <div className="absolute inset-0 rounded-full bg-[#1a1b26]/80 backdrop-blur-md border border-white/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(168,85,247,0.1)] z-10 overflow-hidden ring-1 ring-white/5">
                            
                            {/* Inner Glow Ring */}
                            <div className="absolute inset-2 rounded-full border border-white/5 opacity-50" />
                            <div className="absolute inset-8 rounded-full border border-white/5 opacity-30" />

                            {/* The Rotating Number Ring */}
                            <div ref={numberRingRef} className="absolute inset-0 rounded-full z-10 will-change-transform">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1/2 origin-bottom pt-4 md:pt-6"
                                        style={{ transform: `rotate(${i * (360/20)}deg)` }}
                                    >
                                        <div 
                                            className="flex flex-col items-center justify-start h-full"
                                            // Counter-rotate text to keep it somewhat readable/oriented or just keep radial
                                        >
                                           <span 
                                                className={`block text-2xl md:text-4xl font-display font-bold transition-all duration-300 transform
                                                ${countdown === i + 1 
                                                    ? 'text-yellow-100 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] scale-125' 
                                                    : 'text-white/20'}`}
                                                style={{ 
                                                    opacity: getNumberOpacity(i),
                                                    // Optional: rotate text to face inward
                                                    transform: `rotate(${-i * (360/20)}deg)`
                                                }}
                                           >
                                                {i + 1}
                                           </span>
                                           
                                           {/* Tick Mark under number */}
                                           <div className={`mt-2 w-0.5 h-2 rounded-full transition-colors duration-300 ${countdown === i + 1 ? 'bg-pink-500' : 'bg-white/10'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <ClockHands />
                            
                            {/* Reflection Gloss */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full pointer-events-none z-50" />
                        </div>
                    </div>

                    {/* Ambient Progress Indicator */}
                    <div className="absolute -bottom-20 flex flex-col items-center space-y-2 opacity-80">
                         <div className="w-16 h-1 rounded-full bg-gray-800 overflow-hidden">
                            <div 
                                className="h-full bg-pink-500 shadow-[0_0_10px_#ec4899] transition-all duration-300"
                                style={{ width: `${(countdown || 0) / 20 * 100}%` }}
                            />
                         </div>
                        <div className="text-pink-200/60 font-mono text-[10px] tracking-widest uppercase animate-pulse">
                            Synchronizing...
                        </div>
                    </div>
                </div>
            )}

            {/* 3. GRAND FINALE */}
            {showFinale && (
                <div ref={titleGroupRef} className="text-center w-full max-w-4xl px-4 z-40">
                    
                    {/* Glowing Crown */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-40 animate-pulse-slow" />
                            <Crown className="relative w-20 h-20 text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)] animate-float" />
                        </div>
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-100 to-pink-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] mb-2 leading-none tracking-tight">
                        AFRAH GHAZI
                    </h1>
                    <div className="text-2xl md:text-4xl font-light text-white/80 tracking-[0.5em] mb-10">
                        IS
                    </div>

                    <div className="relative inline-block">
                         <h2 className="text-5xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-500 animate-shimmer bg-[length:200%_auto] py-2">
                            TWENTYYY!!!!!!!!!!!!!!!!
                        </h2>
                        {/* Decorative sparkles around text */}
                        <Sparkles className="absolute -top-8 -right-8 w-12 h-12 text-yellow-300 animate-spin-slow" />
                        <Sparkles className="absolute -bottom-4 -left-8 w-8 h-8 text-pink-400 animate-bounce-slow" />
                    </div>

                    <div className="mt-12 bg-black/20 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-2xl max-w-2xl mx-auto transform transition hover:scale-105 duration-500">
                         <p className="text-xl md:text-2xl text-gray-100 font-serif italic leading-relaxed">
                            "Pop the sugarcane juice champagne! 🍾<br/>
                            <span className="not-italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">
                                Let the celebrations begin.
                            </span>"
                        </p>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-2 opacity-60">
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                        <p className="text-xs text-pink-200 uppercase tracking-widest font-mono">
                            Proceeding to the Birthday Room
                        </p>
                    </div>

                </div>
            )}

        </div>

        {/* --- CUSTOM STYLES --- */}
        <style>{`
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
            }
            @keyframes pulse-slow {
                0%, 100% { opacity: 0.4; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.1); }
            }
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes bounce-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .animate-float { animation: float 6s ease-in-out infinite; }
            .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
            .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            .animate-bounce-slow { animation: bounce-slow 2.5s ease-in-out infinite; }
            .animate-shimmer { animation: shimmer 3s linear infinite; }
            
            .font-display { font-family: system-ui, sans-serif; }
            .perspective-1000 { perspective: 1000px; }
        `}</style>
    </div>
  );
}
