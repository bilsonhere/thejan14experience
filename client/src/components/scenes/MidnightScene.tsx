import { useEffect, useRef, useState, memo } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Sparkles, Crown, Film } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* CONFIG: PROLOGUE TEXTS */
/* ------------------------------------------------------------------ */
const PROLOGUE_LINES = [
  "Twenty years ago.",
  "On a cold night in Riyadh.",
  "Beneath the same dark sky.",
  "A single heartbeat.",
  "Then another.",
  "Everything shifted.",
  "Time hesitated.",
  "The clock awakened.",
  "And so it begins."
];

/* ------------------------------------------------------------------ */
/* SUB-COMPONENT: CINEMATIC CLOCK HANDS (MEMOIZED FOR PERFORMANCE) */
/* ------------------------------------------------------------------ */
// Wrapped in memo() so it doesn't re-render with every countdown tick
const ClockHands = memo(() => (
  <div className="absolute inset-0 z-20 pointer-events-none">
    {/* Central Pin mechanism */}
    <div className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_45deg,#94a3b8,#e2e8f0,#94a3b8)] shadow-[0_0_20px_rgba(255,255,255,0.3)] z-30 border border-slate-600" />
    <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 z-40 animate-pulse shadow-[0_0_10px_#ec4899]" />

    {/* Hour Hand */}
    <div className="clock-hand-hour absolute top-1/2 left-1/2 w-2.5 h-16 sm:h-20 -translate-x-1/2 -translate-y-[90%] bg-gradient-to-t from-slate-400 to-slate-200 rounded-full origin-bottom z-10 shadow-[-4px_4px_10px_rgba(0,0,0,0.5)]" 
         style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />

    {/* Minute Hand */}
    <div className="clock-hand-minute absolute top-1/2 left-1/2 w-1 h-24 sm:h-28 -translate-x-1/2 -translate-y-[92%] bg-gradient-to-t from-pink-300 via-purple-200 to-white rounded-full origin-bottom z-20 shadow-[-2px_2px_8px_rgba(0,0,0,0.4)]" />

    {/* Second Hand - Optimized shadow for performance */}
    <div className="clock-hand-second absolute top-1/2 left-1/2 w-[1px] h-28 sm:h-36 -translate-x-1/2 -translate-y-[85%] bg-gradient-to-t from-yellow-400 via-yellow-100 to-transparent origin-bottom z-20 shadow-[0_0_10px_rgba(253,224,71,0.5)] mix-blend-screen" />
  </div>
));

ClockHands.displayName = 'ClockHands';

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------------------------ */
export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // Stages: 'idle' -> 'prologue' -> 'counting' -> 'finale'
  const [stage, setStage] = useState<'idle' | 'prologue' | 'counting' | 'finale'>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const prologueContainerRef = useRef<HTMLDivElement>(null); // Parent of text lines
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const lightLeakRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* ATMOSPHERE & AMBIENCE */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // 1. Scene Entrance
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 3, ease: 'power2.out' });

    // 2. Light Leaks Animation
    if (lightLeakRef.current) {
        gsap.to(lightLeakRef.current, {
            rotation: 360,
            scale: 1.2,
            duration: 60,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && stage === 'idle') startPrologue();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stage]);

  /* ------------------------------------------------------------------ */
  /* PHASE 1: THE PROLOGUE (SEQUENTIAL) */
  /* ------------------------------------------------------------------ */
  const startPrologue = () => {
    if (stage !== 'idle') return;
    setStage('prologue');
    if (settings.soundEnabled) audioManager.play('click'); 

    const tl = gsap.timeline({
        onComplete: () => startCountdownSequence()
    });

    // Fade out Idle UI
    tl.to('.idle-ui', { opacity: 0, duration: 1, ease: 'power2.in' });
    tl.to(containerRef.current, { backgroundColor: '#020105', duration: 2 }, "<");

    // Get all text lines
    if (prologueContainerRef.current) {
        const lines = prologueContainerRef.current.children;
        
        // Loop through each line to create the sequence
        Array.from(lines).forEach((line, index) => {
            // Calculate timing based on text length or dramatic effect
            // The last few lines ("Time hesitated", "The clock awakened") go slightly faster
            const isLast = index === lines.length - 1;
            const displayDuration = isLast ? 2.5 : 2; 

            tl.fromTo(line, 
                { opacity: 0, y: 25, filter: 'blur(12px)', scale: 0.95 }, 
                { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 1.5, ease: 'power3.out' }
            )
            .to(line, { 
                opacity: 0, 
                y: -10, 
                filter: 'blur(10px)', 
                duration: 1, 
                ease: 'power2.in' 
            }, `>+${displayDuration === 2.5 ? 0.5 : 0.2}`); // Small pause before fading out
        });
    }
  };

  /* ------------------------------------------------------------------ */
  /* PHASE 2: THE AWAKENING (CLOCK REVEAL & COUNT) */
  /* ------------------------------------------------------------------ */
  const startCountdownSequence = () => {
    setStage('counting');

    // 1. Dramatic Clock Reveal
    if (clockContainerRef.current) {
        const tl = gsap.timeline();
        
        // Initial silhouette
        tl.set(clockContainerRef.current, { opacity: 0, scale: 0.6, rotateX: 45, filter: 'brightness(0) blur(10px)' });
        
        // Rim light reveal
        tl.to(clockContainerRef.current, { 
            opacity: 1, 
            duration: 2, 
            ease: 'power3.out' 
        });
        
        // Full detail & rotation correction
        tl.to(clockContainerRef.current, {
            scale: 1,
            rotateX: 0,
            filter: 'brightness(1) blur(0px)',
            duration: 2.5,
            ease: 'elastic.out(1, 0.5)'
        }, "-=1.5");

        // Continuous delicate rotation for hands - Triggered once, runs forever independently of React state
        gsap.to('.clock-hand-second', { rotation: 360, duration: 6, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
        gsap.to('.clock-hand-minute', { rotation: 360, duration: 60, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
    }

    // 2. Start the Ticking Logic
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

    // Mechanical Ring Rotation (The Lock Mechanism)
    if (numberRingRef.current) {
        const rotationAngle = -(num - 1) * (360 / 20); 
        gsap.to(numberRingRef.current, {
            rotation: rotationAngle,
            duration: 0.8,
            ease: 'back.out(1.7)' // Snappy mechanical movement
        });
    }

    // Atmospheric Pulse
    const intensity = num / 20;
    
    // Clock Heartbeat
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 1 + (0.05 * intensity) },
            { scale: 1, duration: 0.4, ease: 'power2.out' }
        );
    }
    
    // Background Color Shift
    if (containerRef.current) {
        gsap.to(containerRef.current, {
            backgroundColor: num > 15 ? '#2e1065' : '#05030a', 
            duration: 0.1,
            yoyo: true,
            repeat: 1,
        });
    }
  };

  /* ------------------------------------------------------------------ */
  /* PHASE 3: THE FINALE */
  /* ------------------------------------------------------------------ */
  const triggerFinale = () => {
    setTimeout(() => {
        setStage('finale');
        if (settings.soundEnabled) audioManager.play('success');

        // Cinematic Whiteout Flash
        const tl = gsap.timeline();
        tl.to(containerRef.current, { backgroundColor: '#ffffff', duration: 0.15, ease: 'power4.in' })
          .to(containerRef.current, { 
              background: 'radial-gradient(circle at center, #be185d 0%, #4c1d95 50%, #000000 100%)', 
              duration: 2 
          });

        // Hide Clock
        if (clockContainerRef.current) {
            gsap.to(clockContainerRef.current, { scale: 2, opacity: 0, duration: 0.5, ease: 'power2.in' });
        }

        // Animate Title Sequence
        if (titleGroupRef.current) {
            tl.fromTo(titleGroupRef.current.children, 
                { y: 50, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 1.2, ease: 'back.out(1.7)' },
                "-=1.5"
            );
        }
        
        setTimeout(() => navigateTo('room'), 7000);
    }, 800);
  };

  // Helper: Visual clarity for active numbers
  const getNumberOpacity = (index: number) => {
      if (!countdown) return 0.1;
      const diff = Math.abs((index + 1) - countdown);
      if (diff === 0) return 1;
      if (diff === 1 || diff === 19) return 0.3;
      return 0.05; 
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#020105] text-slate-100 font-sans">
        
        {/* --- CINEMATIC LAYERS --- */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#000000_100%)] opacity-80" />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Nebula/Light Leaks */}
        <div ref={lightLeakRef} className="absolute inset-[-50%] z-0 opacity-40 mix-blend-screen pointer-events-none blur-[120px]">
            <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-purple-900 rounded-full mix-blend-multiply animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-[60vw] h-[60vw] bg-pink-900 rounded-full mix-blend-multiply" />
        </div>

        {/* --- PARTICLES --- */}
        <AdaptiveParticleSystem 
            count={stage === 'finale' ? 150 : 40} 
            color={stage === 'finale' ? "#FCD34D" : "#e2e8f0"} 
            speed={stage === 'finale' ? 1.5 : 0.2}
            size={stage === 'finale' ? 3 : 1}
            className="z-5 pointer-events-none"
        />

        {/* --- CONFETTI (FINALE) --- */}
        {stage === 'finale' && (
            <div className="fixed inset-0 z-50 pointer-events-none">
                <Confetti 
                    width={window.innerWidth} 
                    height={window.innerHeight}
                    recycle={false} 
                    numberOfPieces={500}
                    gravity={0.12}
                    colors={['#FCD34D', '#F472B6', '#818CF8', '#FFFFFF']} 
                />
            </div>
        )}

        {/* --- CONTENT LAYER --- */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4 perspective-[1200px]">
            
            {/* STAGE: IDLE (Start Screen) */}
            {stage === 'idle' && (
                <div className="idle-ui text-center space-y-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-[10px] tracking-[0.3em] uppercase text-white/40">
                            <Film className="w-3 h-3" /> TWO DECADES IN
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-thin text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-transparent tracking-[0.2em] drop-shadow-2xl">
                           ITS MIDNIGHT
                        </h1>
                        <p className="text-xs md:text-sm font-mono text-pink-200/50 tracking-widest uppercase">
                            A temporal transition
                        </p>
                    </div>

                    <button
                        onClick={startPrologue}
                        className="group relative px-10 py-3 bg-transparent overflow-hidden rounded-sm transition-all duration-500 hover:tracking-[0.3em] cursor-pointer"
                    >
                        <div className="absolute inset-0 border-y border-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-center" />
                        <span className="relative z-20 flex items-center justify-center gap-3 text-white/70 group-hover:text-white font-light text-sm tracking-[0.2em] transition-all duration-500">
                            BEGIN SEQUENCE
                        </span>
                    </button>
                </div>
            )}

            {/* STAGE: PROLOGUE (Sequential Text) */}
            {/* We render all texts, but they are hidden by opacity:0 initially. GSAP reveals them one by one. */}
            <div 
                ref={prologueContainerRef} 
                className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none ${stage === 'prologue' ? 'block' : 'hidden'}`}
            >
                {PROLOGUE_LINES.map((line, i) => (
                    <div key={i} className="absolute inset-0 flex items-center justify-center opacity-0">
                         <h2 className="text-xl md:text-4xl font-serif italic text-white/90 tracking-widest leading-loose drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-center px-4">
                            {line}
                        </h2>
                    </div>
                ))}
            </div>

            {/* STAGE: COUNTING (The Clock) */}
            {stage === 'counting' && (
                <div className="relative w-full max-w-[min(85vw,450px)] aspect-square flex items-center justify-center">
                    
                    {/* Clock Container */}
                    <div ref={clockContainerRef} className="relative w-full h-full rounded-full transform-style-3d">
                        
                        {/* Back Glow */}
                        <div className="absolute inset-4 rounded-full bg-purple-600/20 blur-[60px] animate-pulse-slow" />

                        {/* Outer Rim */}
                        <div className="absolute inset-[-15px] rounded-full bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-black shadow-[0_0_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] z-0 ring-1 ring-white/5" />
                        
                        {/* The Face */}
                        <div className="absolute inset-0 rounded-full bg-[#0a0a0a] shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] z-10 overflow-hidden border border-white/5">
                            
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]" />
                            <div className="absolute inset-10 rounded-full border border-white/5 opacity-20" />

                            {/* ROTATING NUMBERS */}
                            <div ref={numberRingRef} className="absolute inset-0 rounded-full z-10 will-change-transform">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1/2 origin-bottom pt-5 md:pt-8"
                                        style={{ transform: `rotate(${i * (360/20)}deg)` }}
                                    >
                                        <div className="flex flex-col items-center justify-start h-full">
                                            <span className={`block text-xl md:text-3xl font-display font-bold transition-all duration-300
                                                ${countdown === i + 1 
                                                    ? 'text-white scale-150 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                                                    : 'text-white/30'}`}
                                                style={{ 
                                                    opacity: getNumberOpacity(i),
                                                    transform: `rotate(${-i * (360/20)}deg)` 
                                                }}
                                            >
                                                {i + 1}
                                            </span>
                                            
                                            {/* Tick Mark */}
                                            <div className={`mt-2 w-[1px] h-3 rounded-full transition-all duration-300 
                                                ${countdown === i + 1 ? 'bg-pink-500 h-6 shadow-[0_0_10px_#ec4899]' : 'bg-white/5'}`} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* MEMOIZED CLOCK HANDS */}
                            <ClockHands />
                            
                            {/* Glass Reflection */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full pointer-events-none z-50 mix-blend-overlay" />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute -bottom-24 w-32 h-[2px] bg-white/10 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_#ec4899] transition-all duration-300 ease-linear"
                            style={{ width: `${(countdown || 0) / 20 * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* STAGE: FINALE (Celebration) */}
            {stage === 'finale' && (
                <div ref={titleGroupRef} className="text-center w-full max-w-5xl px-4 z-40">
                    
                    <div className="mb-6 flex justify-center">
                        <div className="relative p-4 bg-gradient-to-b from-white/10 to-transparent rounded-full border border-white/20 backdrop-blur-md animate-float">
                             <Crown className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_25px_rgba(253,224,71,0.6)]" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-white drop-shadow-xl mb-4 tracking-tight leading-none">
                        AFRAH GHAZI
                    </h1>
                    
                    <div className="flex items-center justify-center gap-4 text-2xl md:text-3xl font-light text-pink-200/80 tracking-[0.3em] mb-8">
                        <span className="w-12 h-[1px] bg-pink-500/50" />
                        IS OFFICIALLY
                        <span className="w-12 h-[1px] bg-pink-500/50" />
                    </div>

                    <div className="relative inline-block perspective-[500px]">
                         <h2 className="text-6xl md:text-9xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 animate-shimmer bg-[length:200%_auto] py-4 transform rotate-x-12">
                            TWENTYYY!
                        </h2>
                        <Sparkles className="absolute -top-4 -right-8 w-10 h-10 text-white animate-spin-slow" />
                        <Sparkles className="absolute top-1/2 -left-12 w-8 h-8 text-yellow-300 animate-pulse" />
                    </div>

                    <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl max-w-3xl mx-auto transform transition hover:scale-105 duration-700">
                         <p className="text-lg md:text-2xl text-slate-200 font-serif italic leading-relaxed">
                            "Pop the sugarcane juice champagne! 🍾<br/>
                            <span className="not-italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-300">
                                A new decade of magic begins.
                            </span>"
                        </p>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-3 opacity-70">
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                        <p className="text-xs text-pink-100 uppercase tracking-widest font-mono">
                            Teleporting to Birthday Room
                        </p>
                    </div>
                </div>
            )}

        </div>

        {/* --- CUSTOM CSS ANIMATIONS --- */}
        <style>{`
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
            }
            @keyframes pulse-slow {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.05); }
            }
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .animate-float { animation: float 6s ease-in-out infinite; }
            .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            .animate-spin-slow { animation: spin-slow 10s linear infinite; }
            .animate-shimmer { animation: shimmer 3s linear infinite; }
            
            .font-display { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .transform-style-3d { transform-style: preserve-3d; }
        `}</style>
    </div>
  );
}
