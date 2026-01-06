import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Sparkles, Crown, ArrowRight, Clock as ClockIcon, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* SUB-COMPONENT: LUXURY CLOCK HANDS */
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

type Phase = 'idle' | 'accelerating' | 'counting' | 'finale';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // Game State
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Visual State for Warp Effect
  const [warpSpeed, setWarpSpeed] = useState(0.2); // Normal speed
  const [warpColor, setWarpColor] = useState("#A78BFA");

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cinematicTextRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* SETUP & IDLE */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Reveal container
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 2 });
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 1: THE ACCELERATION (Walking/Running to scene) */
  /* ------------------------------------------------------------------ */
  const startApproachSequence = () => {
    setPhase('accelerating');
    if (settings.soundEnabled) audioManager.play('click'); 

    const tl = gsap.timeline({
        onComplete: () => startClockSequence()
    });

    // 1. Hide the Start UI immediately & smoothly
    tl.to('.start-ui', { opacity: 0, scale: 0.95, duration: 0.5, ease: 'power2.in' });

    // 2. RAMP UP PARTICLES (Simulate Warp Speed)
    // We do this by updating the state that controls the particle system
    tl.to({}, { 
        duration: 4, 
        onStart: () => {
            // Manually animate the state values over time using a dummy tween
            const start = { val: 0.2 };
            gsap.to(start, { 
                val: 50, // Massive speed increase
                duration: 4, 
                ease: "expo.in", 
                onUpdate: () => setWarpSpeed(start.val) 
            });
            setWarpColor("#FFFFFF"); // Turn stars white/bright
        }
    }, "<");

    // 3. CINEMATIC TEXT SEQUENCE (The "Thoughts" while walking)
    const messages = ["LEAVING 19", "APPROACHING", "THE MOMENT"];
    
    if (cinematicTextRef.current) {
        messages.forEach((msg, i) => {
            const el = document.createElement('div');
            el.innerText = msg;
            // High-end cinematic typography styles
            el.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-[0.5em] uppercase opacity-0 blur-sm whitespace-nowrap z-40 font-display";
            cinematicTextRef.current?.appendChild(el);

            // Flash In/Out logic
            // Overlap them slightly for speed
            const offset = i * 1.2; 
            
            tl.to(el, { 
                opacity: 1, 
                blur: 0, 
                scale: 1.1, 
                duration: 0.4, 
                ease: "power2.out" 
            }, `<+${i === 0 ? 0.5 : 0.2}`);

            tl.to(el, { 
                opacity: 0, 
                blur: 10, 
                scale: 1.5, // Fly towards camera
                duration: 0.3, 
                ease: "power2.in" 
            }, `>+0.5`);
        });
    }

    // 4. THE IMPACT (Screen Shake + Flash)
    tl.to(containerRef.current, { 
        x: -5, y: 5, duration: 0.05, repeat: 5, yoyo: true, ease: "linear" // Rumble
    }, "-=1.0");
    
    tl.to(containerRef.current, { backgroundColor: '#ffffff', duration: 0.1, ease: 'power4.in' }, ">-0.2");
    tl.to(containerRef.current, { backgroundColor: '#05030a', duration: 0.5 }, ">");
  };

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 2: THE CLOCK REVEAL */
  /* ------------------------------------------------------------------ */
  const startClockSequence = () => {
    setPhase('counting');
    setWarpSpeed(0.5); // Slow particles back down
    setWarpColor("#A78BFA"); // Return to purple
    
    if (cinematicTextRef.current) cinematicTextRef.current.innerHTML = ''; // Clean up text

    // Dramatic Entry of the Clock
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 3, opacity: 0, rotate: -45 },
            { 
                scale: 1, 
                opacity: 1, 
                rotate: 0, 
                duration: 1.5, 
                ease: 'elastic.out(1, 0.7)', 
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

    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 1.05, boxShadow: '0 0 100px rgba(255,255,255,0.1)' },
            { scale: 1, boxShadow: '0 0 50px rgba(0,0,0,0.5)', duration: 0.5, ease: 'power2.out' }
        );
    }
    
    // Ambient Flash
    if (containerRef.current) {
        gsap.to(containerRef.current, {
            backgroundColor: '#1a103c', 
            duration: 0.05,
            yoyo: true,
            repeat: 1,
            onComplete: () => gsap.to(containerRef.current, { backgroundColor: '#05030a', duration: 0.5 })
        });
    }
  };

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 3: FINALE */
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
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#05030a] transition-colors duration-1000 perspective-1000 font-display">
        
        {/* --- DYNAMIC BACKGROUND --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Noise Texture */}
             <div className="absolute inset-0 opacity-[0.07] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
             
             {/* Vignette - gets heavier during acceleration */}
             <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)] transition-all duration-1000 ${phase === 'accelerating' ? 'scale-125 opacity-90' : 'scale-100 opacity-100'}`} />
             
             {/* Rotating Nebula (Subtle) */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] opacity-20 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0deg,#4c1d95_100deg,transparent_200deg,#db2777_300deg,transparent_360deg)] blur-[100px] animate-spin-slow" />
        </div>

        {/* --- INTERACTIVE PARTICLES (The Warp Drive) --- */}
        <AdaptiveParticleSystem 
            count={phase === 'accelerating' ? 400 : 80} 
            color={warpColor} 
            speed={warpSpeed}
            size={phase === 'accelerating' ? 3 : 1.5}
            className={`z-10 transition-opacity duration-1000 ${phase === 'counting' ? 'opacity-30' : 'opacity-100'}`}
        />

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
            
            {/* 1. ELEGANT START SCREEN */}
            {phase === 'idle' && (
                <div className="start-ui text-center space-y-16 animate-fade-in-up max-w-2xl mx-auto">
                    
                    {/* Header Group */}
                    <div className="space-y-2 relative group cursor-default">
                        <div className="absolute -inset-10 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        
                        <h2 className="text-sm md:text-base font-medium tracking-[0.6em] text-purple-300 uppercase opacity-80 mb-4">
                            The Sequence
                        </h2>
                        <h1 className="text-6xl md:text-8xl font-thin text-white tracking-[0.2em] drop-shadow-2xl mix-blend-overlay">
                            MIDNIGHT
                        </h1>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-8" />
                    </div>

                    {/* Interaction Trigger */}
                    <div className="relative pt-8">
                        <button
                            ref={buttonRef}
                            onClick={startApproachSequence}
                            className="group relative flex items-center justify-center gap-4 px-10 py-5 mx-auto transition-all duration-500 hover:scale-105 active:scale-95"
                        >
                            {/* Button Background with "Glow" on hover */}
                            <div className="absolute inset-0 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/30 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]" />
                            
                            {/* Text */}
                            <span className="relative z-10 text-white font-light text-lg tracking-[0.3em] group-hover:tracking-[0.4em] transition-all duration-500">
                                ENTER
                            </span>
                            
                            {/* Icon */}
                            <ChevronRight className="relative z-10 w-5 h-5 text-purple-300 transition-transform duration-500 group-hover:translate-x-1" />
                        </button>
                        
                        <p className="mt-6 text-[10px] text-white/30 uppercase tracking-widest font-mono">
                            Initialize Transition
                        </p>
                    </div>
                </div>
            )}

            {/* 2. THE MAGICAL CLOCK */}
            {phase === 'counting' && (
                <div className="relative w-full max-w-[min(85vw,420px)] aspect-square flex items-center justify-center">
                    <div ref={clockContainerRef} className="relative w-full h-full rounded-full">
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
            @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            .animate-float { animation: float 4s ease-in-out infinite; }
        `}</style>
    </div>
  );
}
