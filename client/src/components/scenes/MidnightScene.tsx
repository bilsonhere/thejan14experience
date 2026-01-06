import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Crown } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* SUB-COMPONENT: LUXURY CLOCK HANDS (PRESERVED) */
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

type Phase = 'idle' | 'accelerating' | 'silence' | 'counting' | 'finale';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // Game State
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Visual State for Warp Effect
  const [warpSpeed, setWarpSpeed] = useState(0.05); // Starts extremely slow (suspended in gravity)
  const [warpColor, setWarpColor] = useState("#4c1d95"); // Deep space purple

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const singularityRef = useRef<HTMLDivElement>(null);
  const cinematicTextRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* SETUP & IDLE */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Start in absolute darkness. 
    if (containerRef.current) {
      gsap.set(containerRef.current, { backgroundColor: '#000000' });
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 3, ease: 'power2.inOut' });
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 1: THE ACCELERATION (Cinematic Build Up) */
  /* ------------------------------------------------------------------ */
  const startApproachSequence = () => {
    setPhase('accelerating');
    if (settings.soundEnabled) audioManager.play('click'); 

    const tl = gsap.timeline({
        onComplete: () => {
            // Hard Cut to Silence/Black
            setPhase('silence');
            setWarpSpeed(0); // Freeze particles
            gsap.set(containerRef.current, { backgroundColor: '#000000' });
            
            // The "Breath" before the scream (1 second of total void)
            setTimeout(() => startClockSequence(), 1200); 
        }
    });

    // 1. The Singularity Implodes (The click feedback)
    if (singularityRef.current) {
        tl.to(singularityRef.current, { 
            scale: 0, 
            opacity: 0, 
            duration: 0.4, 
            ease: "back.in(2)" 
        });
    }

    // 2. Cinematic Text - "Discovered" in the fog
    // We keep it small, widely spaced, using negative space.
    const messages = ["LEAVING 19", "TIME IS RELATIVE", "ARRIVAL IMMINENT"];
    
    if (cinematicTextRef.current) {
        messages.forEach((msg, i) => {
            const el = document.createElement('div');
            el.innerText = msg;
            // Style: Small, tracking wide, barely visible at first
            el.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm md:text-xl font-light text-gray-300 tracking-[1.5em] uppercase opacity-0 blur-sm whitespace-nowrap z-40 font-mono mix-blend-difference";
            cinematicTextRef.current?.appendChild(el);

            // The "Discovery" motion: subtle drift, focusing in, then fading out
            tl.to(el, { 
                opacity: 0.8, 
                blur: 0, 
                scale: 1, 
                duration: 1.5, 
                ease: "power2.out" 
            }, ">-0.5"); // Overlap previous

            tl.to(el, { 
                opacity: 0, 
                blur: 5, 
                scale: 1.1, 
                duration: 1.0, 
                ease: "power2.in" 
            }, ">-0.5");
        });
    }

    // 3. The Warp (Escalation) - Happens concurrently with text, peaking at end
    tl.to({}, { 
        duration: 5, // Total sequence time
        onStart: () => {
            const start = { val: 0.05 };
            gsap.to(start, { 
                val: 80, // Massive warp speed
                duration: 5, 
                ease: "expo.in", // Slow start, explosive finish
                onUpdate: () => setWarpSpeed(start.val) 
            });
            
            // Shift stars from deep purple to blinding white
            gsap.to({}, {
                duration: 4,
                onUpdate: function() {
                    const progress = this.progress();
                    if(progress > 0.8) setWarpColor("#FFFFFF");
                }
            })
        }
    }, 0);

    // 4. The Flash (The Cut)
    tl.to(containerRef.current, { 
        backgroundColor: '#FFFFFF', 
        duration: 0.05, 
        ease: 'linear' 
    }, ">-0.1"); // Triggers right at the end
  };

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 2: THE CLOCK REVEAL (The Artifact) */
  /* ------------------------------------------------------------------ */
  const startClockSequence = () => {
    setPhase('counting');
    setWarpSpeed(0.5); // Return to a gentle drift
    setWarpColor("#A78BFA"); 
    
    if (cinematicTextRef.current) cinematicTextRef.current.innerHTML = ''; 

    // Dramatic Entry: The Clock snaps into existence from the void
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 0.8, opacity: 0, filter: 'blur(10px)' },
            { 
                scale: 1, 
                opacity: 1, 
                filter: 'blur(0px)',
                duration: 2.5, 
                ease: 'power4.out', // Smooth deceleration
            }
        );
        
        // Spin hands
        gsap.to('.clock-hand-second', { rotation: 360, duration: 2, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
        gsap.to('.clock-hand-minute', { rotation: 360, duration: 20, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
    }

    // Allow a moment of reverence (no counting yet)
    // "When the clock appears, make it Sacred"
    setTimeout(() => {
        startCounting();
    }, 1500);
  };

  const startCounting = () => {
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

    if (clockContainerRef.current) {
        // Heartbeat effect on the clock itself
        gsap.fromTo(clockContainerRef.current, 
            { scale: 1.02, boxShadow: '0 0 60px rgba(167, 139, 250, 0.2)' },
            { scale: 1, boxShadow: '0 0 30px rgba(0,0,0,0.8)', duration: 0.6, ease: 'power2.out' }
        );
    }
    
    // Subtle background pulse
    if (containerRef.current) {
         gsap.to(containerRef.current, {
            backgroundColor: '#110a21', // Very dark purple
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            onComplete: () => gsap.to(containerRef.current, { backgroundColor: '#000000', duration: 0.4 })
        });
    }
  };

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 3: FINALE (PRESERVED) */
  /* ------------------------------------------------------------------ */
  const triggerFinale = () => {
    setTimeout(() => {
        setPhase('finale');
        if (settings.soundEnabled) audioManager.play('success');

        gsap.to(containerRef.current, { backgroundColor: '#ffffff', duration: 0.1, yoyo: true, repeat: 1 });
        gsap.to(containerRef.current, { 
            background: 'radial-gradient(circle at center, #831843 0%, #4c1d95 40%, #000000 100%)', 
            duration: 2.5 
        });

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

  // Helper
  const getNumberOpacity = (index: number) => {
      if (!countdown) return 0.15;
      const diff = Math.abs((index + 1) - countdown);
      if (diff === 0) return 1;
      if (diff === 1 || diff === 19) return 0.4;
      return 0.05; 
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black transition-colors duration-1000 perspective-1000 font-display cursor-none">
        
        {/* --- DYNAMIC BACKGROUND --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Heavy Cinematic Grain */}
             <div className="absolute inset-0 opacity-[0.12] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay animate-grain" />
             
             {/* Vignette */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_80%)]" />
        </div>

        {/* --- INTERACTIVE PARTICLES (The Stars) --- */}
        {/* During 'silence' phase, we hide particles to sell the 'cut' */}
        <div className={`transition-opacity duration-75 ${phase === 'silence' ? 'opacity-0' : 'opacity-100'}`}>
            <AdaptiveParticleSystem 
                count={phase === 'accelerating' ? 800 : 200} 
                color={warpColor} 
                speed={warpSpeed}
                size={phase === 'accelerating' ? 2 : 1}
                className="z-10"
            />
        </div>

        {/* --- CINEMATIC TEXT CONTAINER --- */}
        <div ref={cinematicTextRef} className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center" />

        {/* --- CONFETTI --- */}
        {phase === 'finale' && (
            <div className="fixed inset-0 z-50 pointer-events-none">
                <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={400} colors={['#FCD34D', '#F472B6', '#818CF8', '#FFFFFF']} />
            </div>
        )}

        {/* --- MAIN CONTENT --- */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4">
            
            {/* 1. THE SINGULARITY (The Start) */}
            {phase === 'idle' && (
                <div 
                    ref={singularityRef}
                    onClick={startApproachSequence}
                    className="group relative cursor-pointer p-20 flex items-center justify-center" // Large hit area
                >
                    {/* The "Universe Breathing" hum visual */}
                    <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_20px_white] animate-pulse-fast z-20" />
                    
                    {/* Subtle ripples */}
                    <div className="absolute w-20 h-20 rounded-full border border-white/5 animate-ping-slow" />
                    <div className="absolute w-40 h-40 rounded-full border border-white/5 animate-ping-slower delay-75" />
                    
                    {/* Invitation Text (Only appears on hover or very faintly) */}
                    <div className="absolute mt-16 text-[10px] tracking-[0.8em] text-white/30 font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        Initialize
                    </div>
                </div>
            )}

            {/* 2. THE MAGICAL CLOCK */}
            {phase === 'counting' && (
                <div className="relative w-full max-w-[min(85vw,420px)] aspect-square flex items-center justify-center">
                    <div ref={clockContainerRef} className="relative w-full h-full rounded-full">
                        {/* Outer Rim */}
                        <div className="absolute inset-[-10px] rounded-full bg-gradient-to-b from-gray-800 to-black shadow-[0_0_80px_rgba(0,0,0,1)] z-0" />
                        
                        {/* Glass Face */}
                        <div className="absolute inset-0 rounded-full bg-[#0a0a0f] border border-white/10 shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] z-10 overflow-hidden ring-1 ring-white/5">
                            <div className="absolute inset-2 rounded-full border border-white/5 opacity-50" />
                            
                            {/* Numbers */}
                            <div ref={numberRingRef} className="absolute inset-0 rounded-full z-10 will-change-transform">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1/2 origin-bottom pt-5" style={{ transform: `rotate(${i * (360/20)}deg)` }}>
                                        <div className="flex flex-col items-center justify-start h-full">
                                            <span className={`block text-3xl font-display font-bold transition-all duration-200 ${countdown === i + 1 ? 'text-white scale-150 drop-shadow-[0_0_10px_white]' : 'text-white/10'}`}
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
                    <div className="mb-6 flex justify-center"><Crown className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.6)] animate-float" /></div>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-2 tracking-tight drop-shadow-xl">AFRAH GHAZI</h1>
                    <div className="text-xl md:text-3xl font-light text-purple-200 tracking-[0.5em] mb-8">IS NOW</div>
                    <h2 className="text-6xl md:text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-500 animate-pulse-slow">20</h2>
                    <div className="mt-12 p-6 border-t border-b border-white/10 backdrop-blur-md">
                         <p className="text-lg md:text-xl text-gray-200 font-serif italic">"Pop the sugarcane juice champagne! 🍾"</p>
                    </div>
                </div>
            )}

        </div>

        <style>{`
            .font-display { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .animate-spin-slow { animation: spin 120s linear infinite; }
            .animate-pulse-fast { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
            .animate-ping-slower { animation: ping 5s cubic-bezier(0, 0, 0.2, 1) infinite; }
            @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            .animate-float { animation: float 4s ease-in-out infinite; }
            .animate-grain { animation: grain 1s steps(10) infinite; }
            @keyframes grain { 0%, 100% { transform: translate(0, 0); } 10% { transform: translate(-5%, -5%); } 20% { transform: translate(-10%, 5%); } 30% { transform: translate(5%, -10%); } 40% { transform: translate(-5%, 15%); } 50% { transform: translate(-10%, 5%); } 60% { transform: translate(15%, 0); } 70% { transform: translate(0, 10%); } 80% { transform: translate(3%, 35%); } 90% { transform: translate(-10%, 10%); } }
        `}</style>
    </div>
  );
}
