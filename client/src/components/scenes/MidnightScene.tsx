import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Crown, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* HELPER: LUXURY CLOCK HANDS */
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
/* COMPONENT: MIDNIGHT SCENE */
/* ------------------------------------------------------------------ */
type Phase = 'idle' | 'cinematic_intro' | 'transition_warp' | 'counting' | 'finale';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // -- State --
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [warpSpeed, setWarpSpeed] = useState(0.2); 
  const [warpColor, setWarpColor] = useState("#A78BFA");

  // -- Refs --
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const cinematicTextRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* SETUP */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Reveal container gracefully
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 3, ease: 'power2.out' });
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 1: THE CINEMATIC OPENING ("20 Years Ago...") */
  /* ------------------------------------------------------------------ */
  const startCinematicSequence = () => {
    setPhase('cinematic_intro');
    if (settings.soundEnabled) audioManager.play('click'); 

    const tl = gsap.timeline({
        onComplete: () => startWarpTransition()
    });

    // 1. Fade out UI
    tl.to('.start-ui', { opacity: 0, y: 20, duration: 1, ease: 'power2.inOut' });

    // 2. Define the Narrative
    const storyLines = [
        { text: "20 YEARS AGO...", sub: "A chapter began" },
        { text: "COUNTLESS MEMORIES", sub: "Led to this moment" },
        { text: "AND NOW", sub: "The next era awaits" }
    ];

    if (cinematicTextRef.current) {
        storyLines.forEach((line, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = "absolute flex flex-col items-center justify-center text-center w-full px-4";
            
            const mainText = document.createElement('h2');
            mainText.innerText = line.text;
            mainText.className = "text-3xl md:text-6xl font-serif text-white tracking-widest opacity-0 mb-4";
            
            const subText = document.createElement('p');
            subText.innerText = line.sub;
            subText.className = "text-sm md:text-xl font-sans text-purple-200 tracking-[0.5em] uppercase opacity-0";

            wrapper.appendChild(mainText);
            wrapper.appendChild(subText);
            cinematicTextRef.current?.appendChild(wrapper);

            // Animate In (Slow & Dreamy)
            tl.to([mainText, subText], {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 2,
                stagger: 0.3,
                ease: "power2.out",
                startAt: { y: 10, scale: 0.95, filter: 'blur(10px)' }
            });

            // Hold
            tl.to({}, { duration: 1.5 });

            // Animate Out (Fade into background)
            tl.to([mainText, subText], {
                opacity: 0,
                scale: 1.1,
                filter: 'blur(20px)',
                duration: 1.5,
                ease: "power2.in"
            });
        });
    }
  };

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 2: THE ACCELERATION (Short transition to Present) */
  /* ------------------------------------------------------------------ */
  const startWarpTransition = () => {
    setPhase('transition_warp');
    
    // Simulate "Hyperdrive" to bring us to the present
    const tl = gsap.timeline({
        onComplete: () => revealClock()
    });

    // Ramp up particles massively for a short burst
    const speedObj = { val: 0.2 };
    tl.to(speedObj, {
        val: 80,
        duration: 2,
        ease: "expo.in",
        onUpdate: () => setWarpSpeed(speedObj.val),
        onStart: () => setWarpColor("#FFFFFF") // Turn stars white
    });

    // Screen flash at the peak of speed
    tl.to(containerRef.current, { backgroundColor: '#fff', duration: 0.1, ease: 'power1.inOut' });
    tl.to(containerRef.current, { backgroundColor: '#05030a', duration: 0.5 });
  };

  /* ------------------------------------------------------------------ */
  /* SEQUENCE 3: THE CLOCK REVEAL & COUNTDOWN */
  /* ------------------------------------------------------------------ */
  const revealClock = () => {
    setPhase('counting');
    setWarpSpeed(0.5); // Calm down particles
    setWarpColor("#A78BFA"); // Back to purple
    if (cinematicTextRef.current) cinematicTextRef.current.innerHTML = '';

    // Animate Clock In
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 5, opacity: 0, rotateZ: -90 },
            { scale: 1, opacity: 1, rotateZ: 0, duration: 2, ease: 'elastic.out(1, 0.75)' }
        );
        
        // Spin hands initially
        gsap.to('.clock-hand-second', { rotation: 360, duration: 2, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
        gsap.to('.clock-hand-minute', { rotation: 360, duration: 60, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
    }

    // Begin Counting
    let count = 0;
    const intervalTime = 800; // slightly faster than a second for excitement
    
    const timer = setInterval(() => {
        count++;
        setCountdown(count);
        handleTick(count);

        if (count >= 20) {
            clearInterval(timer);
            triggerFinale();
        }
    }, intervalTime); 
  };

  const handleTick = (num: number) => {
    if (settings.soundEnabled) audioManager.play('hit'); 

    // Rotate ring
    if (numberRingRef.current) {
        const rotationAngle = -(num - 1) * (360 / 20); 
        gsap.to(numberRingRef.current, {
            rotation: rotationAngle,
            duration: 0.6,
            ease: 'back.out(1.7)' 
        });
    }

    // Pulse clock
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 1.05, boxShadow: '0 0 80px rgba(167,139,250,0.3)' },
            { scale: 1, boxShadow: '0 0 40px rgba(0,0,0,0.5)', duration: 0.4 }
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

        gsap.to(containerRef.current, { 
            background: 'radial-gradient(circle at center, #581c87 0%, #000000 100%)', 
            duration: 3 
        });

        setTimeout(() => navigateTo('room'), 6000);
    }, 600);
  };

  // Helper for dimming numbers that aren't active
  const getNumberOpacity = (index: number) => {
      if (!countdown) return 0.1;
      const target = index + 1;
      if (target === countdown) return 1;
      // Show neighbors slightly
      const diff = Math.abs(target - countdown);
      if (diff === 1 || diff === 19) return 0.3;
      return 0.05; 
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#05030a] font-display perspective-[1200px]">
        
        {/* --- DYNAMIC BACKGROUND --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
             
             {/* Time Tunnel Effect */}
             <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${phase === 'cinematic_intro' ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] 
                                bg-[radial-gradient(circle,transparent_40%,#1e1b4b_100%)] opacity-60 animate-pulse-slow" />
             </div>
        </div>

        {/* --- PARTICLES --- */}
        <AdaptiveParticleSystem 
            count={phase === 'transition_warp' ? 600 : 150} 
            color={warpColor} 
            speed={warpSpeed}
            size={phase === 'cinematic_intro' ? 1 : 2}
            className="z-10"
        />

        {/* --- CINEMATIC TEXT CONTAINER --- */}
        <div ref={cinematicTextRef} className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center" />

        {/* --- CONFETTI (Finale) --- */}
        {phase === 'finale' && (
            <div className="fixed inset-0 z-50 pointer-events-none">
                <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#FCD34D', '#E879F9', '#818CF8']} />
            </div>
        )}

        {/* --- MAIN CONTENT AREA --- */}
        <div className="relative z-30 w-full h-full flex flex-col items-center justify-center px-6">
            
            {/* 1. START SCREEN */}
            {phase === 'idle' && (
                <div className="start-ui text-center space-y-12 max-w-2xl mx-auto">
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1 rounded-full border border-purple-500/30 bg-purple-900/10 backdrop-blur-md mb-4">
                            <span className="text-xs tracking-[0.4em] text-purple-300 uppercase">Interactive Experience</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 tracking-wide drop-shadow-2xl">
                            MIDNIGHT
                        </h1>
                        <p className="text-white/40 font-light tracking-[0.2em] text-sm md:text-base max-w-md mx-auto leading-relaxed">
                            A journey through time, leading to this very moment.
                        </p>
                    </div>

                    <button
                        onClick={startCinematicSequence}
                        className="group relative inline-flex items-center justify-center gap-3 px-12 py-4 overflow-hidden rounded-full transition-all duration-500 hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-md border border-white/10 group-hover:border-white/30 transition-all duration-500" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-purple-400 to-pink-400 blur-xl transition-opacity duration-700" />
                        
                        <span className="relative z-10 text-white text-sm tracking-[0.3em] font-medium">BEGIN JOURNEY</span>
                        <ChevronRight className="relative z-10 w-4 h-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {/* 2. THE CLOCK */}
            {phase === 'counting' && (
                <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center animate-fade-in">
                    <div ref={clockContainerRef} className="relative w-full h-full">
                        {/* Clock Body */}
                        <div className="absolute inset-0 rounded-full bg-[#0f172a] border-4 border-slate-700 shadow-2xl overflow-hidden">
                            {/* Inner Gradient */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e293b_0%,#020617_100%)]" />
                            
                            {/* The Moving Number Ring */}
                            <div ref={numberRingRef} className="absolute inset-0 rounded-full z-10">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1/2 origin-bottom pt-4" 
                                         style={{ transform: `rotate(${i * (360/20)}deg)` }}>
                                        <div className="flex justify-center h-full">
                                            <span 
                                                className={`text-2xl md:text-3xl font-serif font-bold transition-all duration-300 ${countdown === i+1 ? 'text-white scale-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'text-slate-600'}`}
                                                style={{ opacity: getNumberOpacity(i), transform: `rotate(${-i * (360/20)}deg)` }}
                                            >
                                                {i + 1}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <ClockHands />
                            
                            {/* Glass Reflection */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent rounded-full pointer-events-none z-50" />
                        </div>
                    </div>
                </div>
            )}

            {/* 3. FINAL TITLE */}
            {phase === 'finale' && (
                <div className="text-center z-50 animate-fade-in-up">
                    <Crown className="w-20 h-20 mx-auto text-yellow-400 mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] animate-bounce-slow" />
                    <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-400 to-purple-500 mb-4 tracking-tighter filter drop-shadow-lg">
                        20
                    </h1>
                    <p className="text-2xl text-white font-serif tracking-widest italic opacity-90">
                        Happy Birthday Afrah
                    </p>
                </div>
            )}
        </div>

        <style>{`
            .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .animate-bounce-slow { animation: bounce 3s infinite; }
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        `}</style>
    </div>
  );
}
