import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Crown, ChevronRight, Sparkles } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* COMPONENT: LUXURY CLOCK HANDS (PRESERVED) */
/* ------------------------------------------------------------------ */
const ClockHands = () => (
  <div className="absolute inset-0 z-20 pointer-events-none">
    {/* Central Pin */}
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

/* ------------------------------------------------------------------ */
/* MAIN SCENE */
/* ------------------------------------------------------------------ */
type Phase = 'idle' | 'cinematic' | 'warp' | 'counting' | 'finale';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // -- State --
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [warpSpeed, setWarpSpeed] = useState(0.05); // Start very slow (breathing)
  const [warpColor, setWarpColor] = useState("#4c1d95");

  // -- Refs --
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const cinematicTextRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* INITIALIZATION */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Reveal the container from total darkness
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 4, ease: 'power2.inOut' });
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* SEQUENCE LOGIC */
  /* ------------------------------------------------------------------ */
  
  const beginJourney = () => {
    setPhase('cinematic'); // Locking phase prevents Start UI from reappearing
    if (settings.soundEnabled) audioManager.play('click');

    const tl = gsap.timeline({
        onComplete: triggerWarp
    });

    // 1. Fade out Start UI & Dim Background
    tl.to('.start-ui', { opacity: 0, filter: 'blur(10px)', duration: 1.5, ease: 'power2.in' });
    
    // 2. Cinematic Text Sequence ("Discovered" text)
    const messages = [
        { text: "BEFORE TIME...", pos: "top-1/3 left-1/4" },
        { text: "THERE WAS SILENCE", pos: "bottom-1/3 right-1/4" },
        { text: "20 YEARS AGO", pos: "center" },
        { text: "A HEARTBEAT BEGAN", pos: "center" }
    ];

    if (cinematicTextRef.current) {
        messages.forEach((msg, i) => {
            const el = document.createElement('div');
            el.innerText = msg.text;
            // "Emerging softly from blur and shadow"
            el.className = `absolute ${msg.pos === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : msg.pos} 
                            text-3xl md:text-6xl font-serif italic text-white/80 tracking-widest opacity-0 blur-xl whitespace-nowrap z-50`;
            cinematicTextRef.current?.appendChild(el);

            // Appear slowly, hold, fade back
            tl.to(el, { 
                opacity: 1, 
                blur: 0, 
                scale: 1.1, 
                duration: 2.5, 
                ease: "power2.out" 
            }, ">-0.5");
            
            tl.to(el, { 
                opacity: 0, 
                blur: 10, // Fade back into shadow
                scale: 1.15,
                duration: 1.5, 
                ease: "power2.in" 
            }, ">+0.5"); // Hold time
        });
    }

    // 3. Escalation by SCALE (Not speed)
    // We widen the sense of space before the snap
    tl.to({}, {
        duration: 4,
        onStart: () => setWarpColor("#ffffff"), // Turn stars white for the jump
        onUpdate: function() {
            // Speed stays relatively low, but we will animate the container scale in the 'warp' function
            const progress = this.progress();
            setWarpSpeed(0.1 + (progress * 2)); // Mild speed up only at the very end
        }
    }, ">-1");
  };

  const triggerWarp = () => {
    // THE HARD CUT
    // 1. Moment of stillness
    setPhase('warp');
    
    const tl = gsap.timeline();

    // 2. Sudden snap (Hard Cut)
    tl.to(containerRef.current, { backgroundColor: '#ffffff', duration: 0.1, ease: 'power4.in' });
    tl.to(containerRef.current, { backgroundColor: '#000000', duration: 0.05 }); // Snap to black
    
    // 3. Reveal Clock (Quietly and Reverently)
    tl.call(() => {
        if (cinematicTextRef.current) cinematicTextRef.current.innerHTML = ''; // Clean up text
        startClockCountdown();
    });
  };

  const startClockCountdown = () => {
    setPhase('counting');
    setWarpSpeed(0.5); // Standard consistent speed
    setWarpColor("#A78BFA");

    // Reveal Clock - Sacred Artifact style (Slow fade up, no crazy spins)
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 3, ease: 'power3.out' } // Slow, heavy reveal
        );
        
        // Gentle rotation for hands
        gsap.to('.clock-hand-second', { rotation: 360, duration: 2, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
        gsap.to('.clock-hand-minute', { rotation: 360, duration: 60, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
    }

    // Countdown Logic
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
            ease: 'elastic.out(1, 0.5)' 
        });
    }

    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { boxShadow: '0 0 60px rgba(168,85,247,0.2)' },
            { boxShadow: '0 0 30px rgba(0,0,0,0.5)', duration: 0.5 }
        );
    }
  };

  const triggerFinale = () => {
    setTimeout(() => {
        setPhase('finale');
        if (settings.soundEnabled) audioManager.play('success');

        gsap.to(containerRef.current, { 
            background: 'radial-gradient(circle at center, #831843 0%, #4c1d95 40%, #000000 100%)', 
            duration: 3 
        });

        if (titleGroupRef.current) {
            gsap.fromTo(titleGroupRef.current.children, 
                { y: 50, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.2, duration: 1.5, ease: 'power3.out' }
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
        
        {/* --- ATMOSPHERE LAYERS --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Film Grain - Heavy in the beginning */}
             <div className="absolute inset-0 opacity-[0.08] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
             
             {/* Negative Space Vignette */}
             <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] transition-all duration-2000 ${phase === 'cinematic' ? 'scale-125 opacity-100' : 'scale-100 opacity-80'}`} />
             
             {/* The "Hum" (Visual representation) - Slow rotating void */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] opacity-10 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0deg,#4c1d95_100deg,transparent_200deg,#db2777_300deg,transparent_360deg)] blur-[100px] animate-spin-very-slow" />
        </div>

        {/* --- PARTICLES (Dust suspended in universe) --- */}
        <AdaptiveParticleSystem 
            count={phase === 'cinematic' ? 200 : 80} 
            color={warpColor} 
            speed={warpSpeed}
            size={phase === 'cinematic' ? 2 : 1.5}
            className={`z-10 transition-opacity duration-500 ${phase === 'counting' ? 'opacity-30' : 'opacity-100'}`}
        />

        {/* --- CINEMATIC TEXT LAYER (Independent of React Render Cycle to prevent flashes) --- */}
        <div ref={cinematicTextRef} className="absolute inset-0 z-50 pointer-events-none" />

        {/* --- CONFETTI --- */}
        {phase === 'finale' && (
            <div className="fixed inset-0 z-50 pointer-events-none">
                <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#FCD34D', '#F472B6', '#818CF8']} gravity={0.1} />
            </div>
        )}

        {/* --- MAIN CONTENT --- */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4">
            
            {/* 1. START SCREEN (Only visible in Idle) */}
            {phase === 'idle' && (
                <div className="start-ui text-center space-y-12 animate-fade-in-up max-w-2xl mx-auto z-50">
                    <div className="space-y-6">
                         <div className="flex justify-center"><Sparkles className="w-6 h-6 text-purple-400/50 animate-pulse" /></div>
                         <h1 className="text-6xl md:text-8xl font-thin text-white/90 tracking-[0.2em] mix-blend-overlay">
                            MIDNIGHT
                        </h1>
                        <p className="text-white/30 font-light tracking-widest text-sm uppercase">
                            Put on headphones • Enter the void
                        </p>
                    </div>

                    <button
                        onClick={beginJourney}
                        className="group relative flex items-center justify-center gap-4 px-10 py-4 mx-auto transition-all duration-700 hover:scale-105"
                    >
                        <div className="absolute inset-0 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/30" />
                        <span className="relative z-10 text-white font-light text-sm tracking-[0.3em] group-hover:tracking-[0.5em] transition-all duration-500">
                            INITIATE
                        </span>
                        <ChevronRight className="relative z-10 w-4 h-4 text-purple-300 opacity-50 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {/* 2. THE MAGICAL CLOCK (Reveals after Warp) */}
            {phase === 'counting' && (
                <div className="relative w-full max-w-[min(85vw,420px)] aspect-square flex items-center justify-center">
                    <div ref={clockContainerRef} className="relative w-full h-full rounded-full">
                        {/* Outer Rim */}
                        <div className="absolute inset-[-10px] rounded-full bg-gradient-to-b from-gray-800 to-black shadow-[0_0_60px_rgba(0,0,0,0.8)] z-0" />
                        
                        {/* Glass Face */}
                        <div className="absolute inset-0 rounded-full bg-[#1a1b26] border border-white/10 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] z-10 overflow-hidden ring-1 ring-white/5">
                            <div className="absolute inset-2 rounded-full border border-white/5 opacity-50" />
                            
                            {/* Numbers */}
                            <div ref={numberRingRef} className="absolute inset-0 rounded-full z-10 will-change-transform">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1/2 origin-bottom pt-6" style={{ transform: `rotate(${i * (360/20)}deg)` }}>
                                        <div className="flex flex-col items-center justify-start h-full">
                                            <span className={`block text-3xl font-display font-bold transition-all duration-200 ${countdown === i + 1 ? 'text-white scale-150 drop-shadow-[0_0_15px_white]' : 'text-white/10'}`}
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

            {/* 3. FINALE (Preserved) */}
            {phase === 'finale' && (
                <div ref={titleGroupRef} className="text-center w-full max-w-4xl px-4 z-40">
                    <div className="mb-8 flex justify-center"><Crown className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.6)] animate-float" /></div>
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-2 tracking-tight drop-shadow-xl">AFRAH GHAZI</h1>
                    <div className="text-xl md:text-3xl font-light text-purple-200 tracking-[0.5em] mb-8">IS NOW</div>
                    <h2 className="text-7xl md:text-[10rem] font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-500 to-purple-600 animate-pulse-slow leading-none">20</h2>
                    <div className="mt-12 p-6 border-t border-b border-white/10 backdrop-blur-md">
                         <p className="text-lg md:text-xl text-gray-200 font-serif italic">"Pop the sugarcane juice champagne! 🍾"</p>
                    </div>
                </div>
            )}

        </div>

        <style>{`
            .font-display { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .animate-spin-very-slow { animation: spin 240s linear infinite; }
            @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            .animate-float { animation: float 4s ease-in-out infinite; }
        `}</style>
    </div>
  );
}
