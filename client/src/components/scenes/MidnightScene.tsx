import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Sparkles, Crown, ArrowRight, Stars } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* SUB-COMPONENT: MAGICAL CLOCK HANDS */
/* ------------------------------------------------------------------ */
const ClockHands = () => (
  <>
    {/* Center Pin */}
    <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-100 to-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.8)] z-20" />
    
    {/* Hour Hand */}
    <div className="clock-hand-hour absolute top-1/2 left-1/2 w-1.5 h-16 sm:h-20 -translate-x-1/2 -translate-y-[90%] bg-gradient-to-t from-yellow-500/80 to-transparent rounded-full origin-bottom z-10 blur-[0.5px]" />
    
    {/* Minute Hand */}
    <div className="clock-hand-minute absolute top-1/2 left-1/2 w-1 h-24 sm:h-28 -translate-x-1/2 -translate-y-[90%] bg-gradient-to-t from-pink-400/80 to-transparent rounded-full origin-bottom z-10" />
    
    {/* Second Hand (The fast one) */}
    <div className="clock-hand-second absolute top-1/2 left-1/2 w-[1px] h-28 sm:h-32 -translate-x-1/2 -translate-y-[85%] bg-white/90 rounded-full origin-bottom z-10 shadow-[0_0_10px_white]" />
  </>
);

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // Game State
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [started, setStarted] = useState(false);
  const [celebrateMode, setCelebrateMode] = useState(false);
  
  // Refs for Animation
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* ------------------------------------------------------------------ */
  /* SETUP & ENTRANCE */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Initial Fade In
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: 'power2.out' });
    }

    // Keyboard support
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
    if (settings.soundEnabled) audioManager.play('click'); // Replace with a 'magical_chime' if available

    // 2. Animate Button Out
    if (buttonRef.current) {
        gsap.to(buttonRef.current, { scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.in(2)' });
    }

    // 3. Reveal Clock
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 0.5, opacity: 0, rotation: -90 },
            { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.7)', delay: 0.2 }
        );
        
        // Start continuous clock rotation (Decorational)
        gsap.to('.clock-hand-second', { rotation: 360, duration: 2, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
        gsap.to('.clock-hand-minute', { rotation: 360, duration: 12, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
    }

    // 4. Begin Countdown Loop
    let count = 0;
    // We start at 1 and go to 20
    const timer = setInterval(() => {
        count++;
        setCountdown(count);
        handleTick(count);

        if (count >= 20) {
            clearInterval(timer);
            triggerFinale();
        }
    }, 800); // Slightly faster than a second for excitement
  };

  const handleTick = (num: number) => {
    if (settings.soundEnabled) audioManager.play('hit'); // Tick sound

    // Rotate the number ring so current number is at Top Center
    if (numberRingRef.current) {
        const rotationAngle = -(num - 1) * (360 / 20); // 20 steps circle
        gsap.to(numberRingRef.current, {
            rotation: rotationAngle,
            duration: 0.6,
            ease: 'back.out(1.7)'
        });
    }

    // Pulse the clock
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 1.05, filter: 'brightness(1.2)' },
            { scale: 1, filter: 'brightness(1)', duration: 0.4 }
        );
    }
  };

  const triggerFinale = () => {
    // A brief pause at 20 before the drop
    setTimeout(() => {
        setShowFinale(true);
        setCelebrateMode(true);
        if (settings.soundEnabled) audioManager.play('success');

        // Flash Effect
        gsap.to(containerRef.current, { backgroundColor: '#fff', duration: 0.1, yoyo: true, repeat: 1 });

        // Change Background
        gsap.to(containerRef.current, { 
            background: 'radial-gradient(circle at center, #4c0519 0%, #2e1065 40%, #000000 100%)', // Deep Rose to Purple to Black
            duration: 2 
        });

        // Animate Title In
        if (titleGroupRef.current) {
            const tl = gsap.timeline();
            tl.fromTo(titleGroupRef.current.children, 
                { y: 50, opacity: 0, scale: 0.8 },
                { y: 0, opacity: 1, scale: 1, stagger: 0.2, duration: 1, ease: 'power3.out' }
            );
        }
        
        // Auto navigate after celebration
        setTimeout(() => navigateTo('room'), 7000);
    }, 800);
  };

  /* ------------------------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------------------------ */

  // Calculate opacity for the number ring (fades out numbers far from top)
  const getNumberOpacity = (index: number) => {
      if (!countdown) return 0.3;
      // Current index (0-19) vs Target index
      const diff = Math.abs((index + 1) - countdown);
      if (diff === 0) return 1;
      if (diff === 1 || diff === 19) return 0.6; // Wrap around math simplified
      return 0.15; 
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#05030a]">
        
        {/* --- DYNAMIC BACKGROUND --- */}
        <div className="absolute inset-0 z-0">
             {/* Deep Vignette */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#0a0514] to-black" />
             
             {/* Moving Stars (Parallax) */}
             <div className="absolute inset-0 opacity-40 animate-pan-slow bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
             
             {/* Aurora Glow */}
             <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[60%] blur-[100px] transition-all duration-1000
                            ${celebrateMode ? 'bg-pink-600/20' : 'bg-purple-900/20'}`} />
        </div>

        {/* --- PARTICLES --- */}
        <AdaptiveParticleSystem 
            count={celebrateMode ? 200 : 80} 
            color={celebrateMode ? "#FFD700" : "#E2E8F0"} 
            speed={celebrateMode ? 0.8 : 0.2}
            className="z-10"
        />

        {/* --- CONFETTI (FINALE) --- */}
        {showFinale && (
            <div className="fixed inset-0 z-50 pointer-events-none">
                <Confetti 
                    width={window.innerWidth} 
                    height={window.innerHeight}
                    recycle={false} 
                    numberOfPieces={500}
                    gravity={0.08}
                    colors={['#FFD700', '#F472B6', '#C084FC', '#FFFFFF']} // Gold, Pink, Purple, White
                />
            </div>
        )}

        {/* --- MAIN CONTENT LAYER --- */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4">
            
            {/* 1. START SCREEN */}
            {!started && !showFinale && (
                <div className="text-center space-y-12 animate-fade-in-up">
                    <div className="space-y-4">
                        <div className="inline-block p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-4 animate-float">
                            <Crown className="w-8 h-8 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-light text-white tracking-wider drop-shadow-lg">
                            Midnight <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400 font-bold">Awaits</span>
                        </h1>
                        <p className="text-purple-200/60 font-medium tracking-widest uppercase text-sm">
                            The transition to 20
                        </p>
                    </div>

                    <button
                        ref={buttonRef}
                        onClick={startSequence}
                        className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:scale-105"
                    >
                        {/* Button Glow Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-80 blur-lg group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute inset-0 bg-black/20 rounded-full border border-white/20 backdrop-blur-sm"></div>
                        
                        <span className="relative flex items-center gap-3 text-white font-bold text-lg tracking-wide group-hover:gap-5 transition-all">
                            ENTER THE MOMENT <ArrowRight className="w-5 h-5" />
                        </span>
                    </button>
                    
                    <p className="text-xs text-white/30 fixed bottom-10 left-0 w-full text-center">
                        Press [Enter] to begin
                    </p>
                </div>
            )}

            {/* 2. THE MAGICAL CLOCK (COUNTDOWN) */}
            {started && !showFinale && (
                <div className="relative w-full max-w-[min(90vw,450px)] aspect-square flex items-center justify-center">
                    
                    {/* Outer Glow Halo */}
                    <div className="absolute inset-[-20%] bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>

                    {/* Clock Container */}
                    <div ref={clockContainerRef} className="relative w-full h-full">
                        
                        {/* Glassmorphism Face */}
                        <div className="absolute inset-0 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] box-border">
                            
                            {/* Inner Rim Detail */}
                            <div className="absolute inset-4 rounded-full border border-white/5"></div>

                            {/* The Number Ring */}
                            <div ref={numberRingRef} className="absolute inset-0 rounded-full pointer-events-none transition-transform will-change-transform">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 md:-translate-y-16 text-center"
                                        style={{ 
                                            transform: `rotate(${i * (360/20)}deg)`, 
                                            transformOrigin: `center calc(50% + 48px + 12px)` // Adjust based on font size/radius
                                        }}
                                    >
                                        <div 
                                            className="h-[calc(50vw-2rem)] md:h-[225px] flex flex-col justify-start origin-bottom"
                                            style={{ transform: `rotate(${i * -(360/20)}deg)` }} // Counter-rotate text so it stays upright? Or keep it radial? 
                                            // Actually, for a ring, we usually want radial. Let's keep numbers upright relative to the slot.
                                        >
                                           <span 
                                                className={`block text-2xl md:text-4xl font-black font-display transition-all duration-300
                                                ${countdown === i + 1 ? 'text-yellow-300 scale-125 drop-shadow-[0_0_15px_gold]' : 'text-white'}`}
                                                style={{ opacity: getNumberOpacity(i), transform: `rotate(${-i * (360/20)}deg)` }} // Keep text upright
                                           >
                                               {i + 1}
                                           </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Clock Hands Component */}
                            <ClockHands />

                        </div>
                    </div>

                    {/* Bottom Progress Text */}
                    <div className="absolute -bottom-24 text-center space-y-2">
                        <div className="text-pink-200/80 font-serif italic text-xl animate-float">
                            Almost time...
                        </div>
                    </div>
                </div>
            )}

            {/* 3. GRAND FINALE */}
            {showFinale && (
                <div ref={titleGroupRef} className="text-center w-full max-w-2xl px-4 z-40">
                    
                    {/* Floating Icons */}
                    <div className="flex justify-center gap-6 mb-8">
                        <Stars className="w-10 h-10 text-yellow-300 animate-spin-slow" />
                        <Crown className="w-12 h-12 text-pink-400 animate-bounce-slow" />
                        <Stars className="w-10 h-10 text-yellow-300 animate-spin-slow" />
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-pink-200 to-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight">
                        HAPPY<br/>20TH!
                    </h1>

                    <h2 className="text-2xl md:text-4xl font-display text-pink-300 mb-8 tracking-widest border-y border-pink-500/30 py-4">
                        AFRAH GHAZI
                    </h2>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                         <p className="text-lg md:text-xl text-gray-100 font-light leading-relaxed">
                            "Pop the sugarcane juice champagne! 🍾<br/>
                            <span className="font-bold text-yellow-300">The Queen has arrived.</span>"
                        </p>
                    </div>

                    <div className="mt-12 opacity-80 animate-pulse">
                        <p className="text-sm text-purple-300 uppercase tracking-widest">Proceeding to the Royal Chamber...</p>
                    </div>

                </div>
            )}

        </div>

        {/* --- STYLES --- */}
        <style>{`
            @keyframes pan-slow {
                0% { background-position: 0% 0%; }
                100% { background-position: 100% 100%; }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            @keyframes pulse-slow {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.05); }
            }
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes bounce-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
            }
            .animate-pan-slow { animation: pan-slow 60s linear infinite; }
            .animate-float { animation: float 6s ease-in-out infinite; }
            .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            .animate-spin-slow { animation: spin-slow 12s linear infinite; }
            .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            
            /* Font utilities for specific looks */
            .font-display { font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.02em; }
        `}</style>
    </div>
  );
}
