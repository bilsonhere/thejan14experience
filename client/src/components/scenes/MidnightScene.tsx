import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Crown } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* COMPONENT: THE SACRED CLOCK */
/* A darker, more "artifact-like" design. Less UI, more physical. */
/* ------------------------------------------------------------------ */
const SacredClock = ({ countdown, totalTicks = 20 }: { countdown: number | null, totalTicks?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Handle the "Click" rotation
  useEffect(() => {
    if (countdown && ringRef.current) {
        // We move the ring to align the number
        const rotationAngle = -(countdown - 1) * (360 / totalTicks);
        
        gsap.to(ringRef.current, {
            rotation: rotationAngle,
            duration: 1.2, // Slow, heavy mechanical movement
            ease: "elastic.out(1, 0.5)"
        });

        // Subtle shockwave on the container
        gsap.fromTo(containerRef.current, 
            { scale: 1.02 }, 
            { scale: 1, duration: 0.8, ease: "power2.out" }
        );
    }
  }, [countdown, totalTicks]);

  return (
    <div ref={containerRef} className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full shadow-2xl">
        {/* The Obsidian Base */}
        <div className="absolute inset-0 rounded-full bg-[#050505] shadow-[0_0_100px_rgba(255,255,255,0.05)] border border-white/5 ring-1 ring-white/5">
            
            {/* The Gold Rim (Subtle) */}
            <div className="absolute inset-2 rounded-full border border-yellow-900/20 opacity-50" />

            {/* The Numbers Ring */}
            <div ref={ringRef} className="absolute inset-0 rounded-full z-10">
                {Array.from({ length: totalTicks }).map((_, i) => {
                    const isActive = countdown === i + 1;
                    const isNeighbor = countdown && (Math.abs(countdown - (i + 1)) === 1);
                    
                    return (
                        <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1/2 origin-bottom pt-6" 
                             style={{ transform: `rotate(${i * (360/totalTicks)}deg)` }}>
                            <div className="flex flex-col items-center justify-start h-full">
                                <span className={`font-serif text-2xl transition-all duration-700 
                                    ${isActive ? 'text-white scale-125 font-light tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 
                                      isNeighbor ? 'text-white/20 scale-90 blur-[1px]' : 'text-white/5 scale-75 blur-[2px]'}`}
                                    style={{ transform: `rotate(${-i * (360/totalTicks)}deg)` }}>
                                    {i + 1}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* The Hands - Minimalist, floating */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white z-30 shadow-[0_0_20px_white]" />
                <div className="absolute top-1/2 left-1/2 w-[1px] h-32 -translate-x-1/2 -translate-y-full bg-gradient-to-t from-white via-white/50 to-transparent origin-bottom z-10" />
            </div>
            
            {/* Reflection Overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-50 mix-blend-overlay" />
        </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN SCENE */
/* ------------------------------------------------------------------ */
type Phase = 'void' | 'memory_1' | 'memory_2' | 'memory_3' | 'stillness' | 'warp_cut' | 'arrival' | 'counting' | 'finale';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  const [phase, setPhase] = useState<Phase>('void');
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  // START SEQUENCE
  const beginSequence = () => {
    // Audio Note: This should trigger a deep, low frequency drone (The "Universe breathing")
    if (settings.soundEnabled) audioManager.play('ambient_drone'); 

    const tl = gsap.timeline();

    // ACT I: THE VOID & MEMORY
    // We use long durations and empty space.
    
    // Line 1: 20 Years Ago...
    tl.call(() => setPhase('memory_1'));
    tl.fromTo('#text-1', 
        { opacity: 0, filter: 'blur(10px)', scale: 0.95 },
        { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 4, ease: "power2.out" }
    );
    tl.to('#text-1', { opacity: 0, filter: 'blur(10px)', scale: 1.05, duration: 3, ease: "power2.in" }, "+=2");

    // Line 2: A Moment...
    tl.call(() => setPhase('memory_2'));
    tl.fromTo('#text-2', 
        { opacity: 0, letterSpacing: '0em', filter: 'blur(15px)' },
        { opacity: 0.8, letterSpacing: '0.2em', filter: 'blur(0px)', duration: 5, ease: "power2.out" }
    );
    tl.to('#text-2', { opacity: 0, filter: 'blur(20px)', duration: 2, ease: "power2.in" }, "+=1");

    // Line 3: Becomes a Lifetime (The realization)
    tl.call(() => setPhase('memory_3'));
    tl.fromTo('#text-3', 
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 4, ease: "power3.out" }
    );
    
    // ACT II: THE BREATH (Stillness)
    tl.call(() => setPhase('stillness'));
    tl.to('#text-3', { opacity: 0, duration: 2 }); // Fade out text
    tl.to({}, { duration: 2 }); // Absolute silence/blackness for 2 seconds. The "Breath".

    // ACT III: THE CUT (Warp)
    tl.call(() => triggerWarpCut());
  };

  const triggerWarpCut = () => {
    setPhase('warp_cut');
    
    // Audio Note: A sharp "suck" sound, then silence, then a heavy "thud" or "gong"
    if (settings.soundEnabled) audioManager.play('warp_boom');

    // The Flash Bang
    const tl = gsap.timeline({ onComplete: () => startTheClock() });
    
    if (flashRef.current) {
        // Instant white
        tl.set(flashRef.current, { opacity: 1 });
        // Fast fade to reveal the "Arrival" (The Clock)
        tl.to(flashRef.current, { opacity: 0, duration: 2.5, ease: "power4.inOut" });
    }
  };

  const startTheClock = () => {
    setPhase('arrival'); // The clock is now visible, floating in the dark
    
    // Let the viewer stare at the clock for a moment before it moves.
    // This makes it feel like an artifact.
    setTimeout(() => {
        setPhase('counting');
        startCountdown();
    }, 2500);
  };

  const startCountdown = () => {
    let count = 0;
    const timer = setInterval(() => {
        count++;
        setCountdown(count);
        if (settings.soundEnabled) audioManager.play('clock_tick_heavy'); // Use a heavy, metallic tick

        if (count >= 20) {
            clearInterval(timer);
            triggerFinale();
        }
    }, 1200); // Slower ticks. More weight.
  };

  const triggerFinale = () => {
    setTimeout(() => {
        setPhase('finale');
        if (settings.soundEnabled) audioManager.play('orchestral_swell');
        
        // Background swell
        if (containerRef.current) {
            gsap.to(containerRef.current, { 
                background: 'radial-gradient(circle at center, #3d0c0c 0%, #000000 100%)', 
                duration: 4 
            });
        }
        
        // Navigate away after soaking it in
        setTimeout(() => navigateTo('room'), 8000);
    }, 1000);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#020202] text-white font-serif cursor-none">
        
        {/* --- LAYER 0: THE GRAIN (Always present, subtle texture) --- */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
             <svg className='w-full h-full'>
                <filter id='noiseFilter'>
                    <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/>
                </filter>
                <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
            </svg>
        </div>

        {/* --- LAYER 1: THE IGNITION (Only visible at start) --- */}
        {phase === 'void' && (
             <button 
                onClick={beginSequence}
                className="z-50 opacity-0 hover:opacity-100 transition-opacity duration-1000 text-[10px] tracking-[0.5em] text-white/20 uppercase"
             >
                ( Click to Initialize )
             </button>
        )}

        {/* --- LAYER 2: THE MEMORY (Text Sequence) --- */}
        <div ref={textRef} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            {phase === 'memory_1' && (
                <h1 id="text-1" className="text-xl md:text-3xl tracking-[0.5em] font-light text-white/80">
                    20 YEARS AGO
                </h1>
            )}
            {phase === 'memory_2' && (
                <h1 id="text-2" className="text-lg md:text-2xl font-light text-white/60 italic">
                    a moment in time
                </h1>
            )}
            {phase === 'memory_3' && (
                <div id="text-3" className="text-center">
                    <h1 className="text-2xl md:text-4xl tracking-[0.3em] font-medium text-white mb-4">
                        BECAME A LIFETIME
                    </h1>
                </div>
            )}
        </div>

        {/* --- LAYER 3: THE HEARTBEAT (Visible during intro) --- */}
        {(phase === 'void' || phase === 'memory_1' || phase === 'memory_2') && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/20 animate-pulse-slow pointer-events-none" />
        )}

        {/* --- LAYER 4: THE ARTIFACT (Clock) --- */}
        {(phase === 'arrival' || phase === 'counting' || phase === 'finale') && (
            <div className="z-30 animate-fade-in-slow">
                <SacredClock countdown={countdown} />
            </div>
        )}

        {/* --- LAYER 5: THE FINALE TEXT --- */}
        {phase === 'finale' && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                 <Crown className="w-12 h-12 text-yellow-500/80 mb-8 animate-float" />
                 <h1 className="text-6xl md:text-8xl font-thin tracking-tighter text-white mb-4 drop-shadow-2xl">
                    AFRAH
                 </h1>
                 <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent mb-4" />
                 <p className="text-sm tracking-[0.5em] text-white/60 uppercase">
                    Chapter Twenty Begins
                 </p>
                 <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={200} gravity={0.05} colors={['#FFD700', '#FFFFFF']} />
            </div>
        )}

        {/* --- LAYER 6: THE FLASH (Warp Cut) --- */}
        <div ref={flashRef} className="absolute inset-0 bg-white opacity-0 pointer-events-none z-[100]" />

        <style>{`
            .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .animate-fade-in-slow { animation: fadeIn 3s ease-out forwards; }
            .animate-float { animation: float 6s ease-in-out infinite; }
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        `}</style>
    </div>
  );
}
