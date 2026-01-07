import { useEffect, useRef, useState, memo, useCallback } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Sparkles, Crown, Film, Lock, ArrowRight, X, Fingerprint } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* CONFIG & ASSETS */
/* ------------------------------------------------------------------ */
const PROLOGUE_LINES = [
  "Twenty years ago",
  "On a cold night in Riyadh",
  "Beneath the same dark sky",
  "A single heartbeat",
  "Then another",
  "Then another and another and another...",
  "Everything shifted",
  "Time hesitated",
  "The clock awakened",
  "And so it begins"
];

// Placeholder for the photo reveal
const CLOCK_PHOTO_SRC = "/assets/afrah.png"; 

/* ------------------------------------------------------------------ */
/* UTILS */
/* ------------------------------------------------------------------ */
const triggerHaptic = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(pattern); } catch (e) { /* Ignore if unsupported */ }
    }
};

/* ------------------------------------------------------------------ */
/* SUB-COMPONENT: CLOCK HANDS */
/* ------------------------------------------------------------------ */
const ClockHands = memo(() => (
  <div className="absolute inset-0 z-20 pointer-events-none">
    {/* Central Pin */}
    <div className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800 border border-slate-600 z-30 shadow-[0_0_15px_rgba(0,0,0,0.8)]" />
    
    {/* Hands */}
    <div className="clock-hand-hour absolute top-1/2 left-1/2 w-2.5 h-16 sm:h-20 -translate-x-1/2 -translate-y-[90%] bg-gradient-to-t from-slate-400 to-slate-200 rounded-full origin-bottom z-10 shadow-lg" 
         style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} />
    <div className="clock-hand-minute absolute top-1/2 left-1/2 w-1 h-24 sm:h-28 -translate-x-1/2 -translate-y-[92%] bg-gradient-to-t from-pink-300 via-purple-200 to-white rounded-full origin-bottom z-20 shadow-md" />
    <div className="clock-hand-second absolute top-1/2 left-1/2 w-[1px] h-28 sm:h-36 -translate-x-1/2 -translate-y-[85%] bg-gradient-to-t from-yellow-400 via-yellow-100 to-transparent origin-bottom z-20 shadow-[0_0_10px_rgba(253,224,71,0.5)] mix-blend-screen" />
  </div>
));
ClockHands.displayName = 'ClockHands';

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT */
/* ------------------------------------------------------------------ */
export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // Stages: 'lock' -> 'idle' -> 'prologue' -> 'counting' -> 'finale'
  const [stage, setStage] = useState<'lock' | 'idle' | 'prologue' | 'counting' | 'finale'>('lock');
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Hold Button State
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const prologueContainerRef = useRef<HTMLDivElement>(null); 
  const lightLeakRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  
  // Audio Refs (for pitch shifting if needed, though simple play is safer)
  const tickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* ------------------------------------------------------------------ */
  /* MOUNT & AMBIENCE */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Scene Entrance
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 3, ease: 'power2.out' });

    // Light Leaks
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

    return () => {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        if (tickTimeoutRef.current) clearTimeout(tickTimeoutRef.current);
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* LOCK SCREEN LOGIC */
  /* ------------------------------------------------------------------ */
  const handleLockAnswer = (isToday: boolean) => {
    if (isToday) {
        if (settings.soundEnabled) audioManager.play('click');
        setStage('idle');
    } else {
        navigateTo('room');
    }
  };

  /* ------------------------------------------------------------------ */
  /* HOLD TO UNLOCK LOGIC */
  /* ------------------------------------------------------------------ */
  const startHold = useCallback(() => {
      if (stage !== 'idle') return;
      
      // Clear any existing interval
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

      holdIntervalRef.current = setInterval(() => {
          setHoldProgress(prev => {
              if (prev >= 100) {
                  clearInterval(holdIntervalRef.current!);
                  startPrologue();
                  return 100;
              }
              return prev + 2; // Speed of fill (50 frames = ~800ms)
          });
      }, 16);
  }, [stage]);

  const endHold = useCallback(() => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (stage === 'idle') {
          gsap.to({}, { duration: 0.3, onUpdate: () => setHoldProgress(p => Math.max(0, p - 5)) });
      }
  }, [stage]);

  /* ------------------------------------------------------------------ */
  /* PROLOGUE SEQUENCE (UPDATED) */
  /* ------------------------------------------------------------------ */
  const startPrologue = () => {
    setStage('prologue');
    triggerHaptic(50); // Initial bump
    if (settings.soundEnabled) audioManager.play('click'); 

    const tl = gsap.timeline({
        onComplete: () => startCountdownSequence()
    });

    // Fade out Idle UI
    tl.to('.idle-ui', { opacity: 0, duration: 1.5, ease: 'power2.in' });
    tl.to(containerRef.current, { backgroundColor: '#020105', duration: 2 }, "<");

    if (prologueContainerRef.current) {
        const lines = prologueContainerRef.current.children;
        
        Array.from(lines).forEach((lineWrapper, index) => {
            const isLast = index === lines.length - 1;
            const isHeartbeat = index === 3 || index === 4; 
            
            // Find the character spans inside the line wrapper
            const chars = lineWrapper.querySelectorAll('.char');

            // 1. Reveal Wrapper
            tl.set(lineWrapper, { opacity: 1 });

            // 2. Typewriter Animation (One by One)
            tl.fromTo(chars, 
                { opacity: 0, y: 10, filter: 'blur(4px)' }, 
                { 
                    opacity: 1, 
                    y: 0, 
                    filter: 'blur(0px)', 
                    duration: 0.8, // Slightly faster per char overall feel
                    stagger: 0.04, // Typing speed (adjust to make faster/slower)
                    ease: 'power2.out',
                    onStart: () => {
                         if (isHeartbeat) triggerHaptic([30, 50, 30]);
                    }
                }
            )
            
            // 3. Fade Out Line (Reduced hold time via position parameter)
            .to(lineWrapper, { 
                opacity: 0, 
                y: -15, 
                filter: 'blur(10px)', 
                duration: 1.0, 
                ease: 'power2.inOut' 
            }, `>+${isLast ? 1.5 : 0.8}`); // Reduced delay here (was 3.0/3.5)
        });
    }
  };

  /* ------------------------------------------------------------------ */
  /* COUNTDOWN SEQUENCE (ACCELERATING) */
  /* ------------------------------------------------------------------ */
  const startCountdownSequence = () => {
    setStage('counting');

    // 1. Reveal Clock
    if (clockContainerRef.current) {
        const tl = gsap.timeline();
        tl.set(clockContainerRef.current, { opacity: 0, scale: 0.6, rotateX: 45, filter: 'brightness(0) blur(10px)' });
        tl.to(clockContainerRef.current, { opacity: 1, duration: 2, ease: 'power3.out' });
        tl.to(clockContainerRef.current, { scale: 1, rotateX: 0, filter: 'brightness(1) blur(0px)', duration: 2.5, ease: 'elastic.out(1, 0.5)' }, "-=1.5");
        
        gsap.to('.clock-hand-second', { rotation: 360, duration: 6, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
        gsap.to('.clock-hand-minute', { rotation: 360, duration: 60, repeat: -1, ease: 'linear', transformOrigin: 'bottom center' });
    }

    // 2. Recursive Accelerating Timer
    let currentCount = 0;
    
    const tick = () => {
        currentCount++;
        setCountdown(currentCount);
        handleTick(currentCount);

        if (currentCount >= 20) {
            triggerFinale();
        } else {
            // Calculate delay: Starts at 1000ms, decays to ~150ms
            const nextDelay = 1000 * Math.pow(0.85, currentCount * 0.4); // Exponential acceleration
            const clampedDelay = Math.max(150, nextDelay); // Don't go faster than 150ms
            
            tickTimeoutRef.current = setTimeout(tick, clampedDelay);
        }
    };

    // First tick after slight delay
    setTimeout(tick, 1000);
  };

  const handleTick = (num: number) => {
    if (settings.soundEnabled) audioManager.play('hit'); 
    triggerHaptic(20); // Sharp tick vibration

    // Rotate Number Ring
    if (numberRingRef.current) {
        const rotationAngle = -(num - 1) * (360 / 20); 
        gsap.to(numberRingRef.current, {
            rotation: rotationAngle,
            duration: 0.5, // Faster tween for faster ticks
            ease: 'back.out(1.5)'
        });
    }

    // Atmospheric Background Shift (Cold -> Warm)
    if (containerRef.current) {
        // Map 0-20 to colors
        const colors = ['#020105', '#0f172a', '#1e1b4b', '#312e81', '#4c1d95', '#701a75', '#831843', '#9f1239'];
        const colorIndex = Math.floor((num / 20) * (colors.length - 1));
        
        gsap.to(containerRef.current, {
            backgroundColor: colors[colorIndex],
            duration: 0.5
        });
    }

    // Heartbeat Pulse on Clock
    if (clockContainerRef.current) {
        gsap.fromTo(clockContainerRef.current, 
            { scale: 1.02 + (0.01 * num) }, // Pulse gets stronger
            { scale: 1, duration: 0.2, ease: 'power1.out' }
        );
    }
  };

  /* ------------------------------------------------------------------ */
  /* FINALE */
  /* ------------------------------------------------------------------ */
  const triggerFinale = () => {
    // 1. Photo Flash Reveal before explosion
    gsap.to('.clock-photo-reveal', { opacity: 1, duration: 0.1, ease: 'power1.in' });

    setTimeout(() => {
        setStage('finale');
        triggerHaptic([50, 100, 50, 100]); // Long vibration pattern
        if (settings.soundEnabled) audioManager.play('success');

        const tl = gsap.timeline();
        
        // Whiteout
        tl.to(containerRef.current, { backgroundColor: '#ffffff', duration: 0.1, ease: 'power4.in' })
          .to(containerRef.current, { 
              background: 'radial-gradient(circle at center, #fbbf24 0%, #be185d 40%, #000000 100%)', // Gold/Pink explosion
              duration: 2 
          });

        // Hide Clock
        if (clockContainerRef.current) {
            gsap.to(clockContainerRef.current, { scale: 3, opacity: 0, duration: 0.4, ease: 'power2.in' });
        }

        // Title
        if (titleGroupRef.current) {
            tl.fromTo(titleGroupRef.current.children, 
                { y: 50, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 1.2, ease: 'back.out(1.7)' },
                "-=1.5"
            );
        }
        
        setTimeout(() => navigateTo('room'), 7000);
    }, 600); // Wait 600ms seeing the photo before explosion
  };

  // Helper for number visibility
  const getNumberOpacity = (index: number) => {
      if (!countdown) return 0.1;
      const diff = Math.abs((index + 1) - countdown);
      if (diff === 0) return 1;
      if (diff === 1 || diff === 19) return 0.3;
      return 0.05; 
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-[#020105] text-slate-100 font-sans touch-none select-none">
        
        {/* --- CINEMATIC LAYERS --- */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#000000_100%)] opacity-80" />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.08] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Nebula */}
        <div ref={lightLeakRef} className="absolute inset-[-50%] z-0 opacity-40 mix-blend-screen pointer-events-none blur-[120px]">
            <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-purple-900 rounded-full mix-blend-multiply animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-[60vw] h-[60vw] bg-pink-900 rounded-full mix-blend-multiply" />
        </div>

        {/* --- PARTICLES --- */}
        <AdaptiveParticleSystem 
            count={stage === 'finale' ? 200 : 50} 
            color={stage === 'finale' ? "#FCD34D" : "#e2e8f0"} 
            speed={stage === 'finale' ? 2 : 0.2}
            size={stage === 'finale' ? 3 : 1}
            className="z-5 pointer-events-none"
        />

        {/* --- CONFETTI (FINALE) --- */}
        {stage === 'finale' && (
            <div className="fixed inset-0 z-50 pointer-events-none">
                <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} gravity={0.15} colors={['#FCD34D', '#F472B6', '#818CF8', '#FFFFFF']} />
            </div>
        )}

        {/* --- MAIN CONTENT --- */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4 perspective-[1200px]">
            
            {/* 1. LOCK SCREEN */}
            {stage === 'lock' && (
                <div className="idle-ui flex flex-col items-center space-y-8 animate-in fade-in duration-1000">
                    <div className="p-4 bg-white/5 rounded-full border border-white/10 mb-4 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Lock className="w-8 h-8 text-white/50" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 font-garamond italic">
                        Is it January 14 today?
                    </h2>
                    <div className="flex items-center gap-6 pt-4">
                        <button onClick={() => handleLockAnswer(true)} className="group flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="text-xs tracking-[0.2em] text-white/80">YES</span>
                            <ArrowRight className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => handleLockAnswer(false)} className="group flex items-center gap-2 px-8 py-3 bg-transparent hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-sm transition-all duration-300 opacity-60 hover:opacity-100 active:scale-95">
                            <span className="text-xs tracking-[0.2em] text-white/50">NO</span>
                            <X className="w-3 h-3 text-white/30 group-hover:text-white/50" />
                        </button>
                    </div>
                </div>
            )}

            {/* 2. IDLE (HOLD TO START) */}
            {stage === 'idle' && (
                <div className="idle-ui text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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

                    {/* HOLD BUTTON INTERACTION */}
                    <div 
                        className="relative group cursor-pointer touch-none"
                        onMouseDown={startHold}
                        onMouseUp={endHold}
                        onMouseLeave={endHold}
                        onTouchStart={startHold}
                        onTouchEnd={endHold}
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {/* Progress Ring */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/10 transition-all duration-300 group-active:scale-110" />
                        
                        {/* Fill Ring (SVG) */}
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 -rotate-90 pointer-events-none">
                            <circle
                                cx="48" cy="48" r="46"
                                fill="none"
                                stroke="#ec4899"
                                strokeWidth="2"
                                strokeDasharray="289"
                                strokeDashoffset={289 - (289 * holdProgress) / 100}
                                className="transition-all duration-75 ease-linear"
                            />
                        </svg>

                        {/* Icon */}
                        <div className="relative z-10 w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors backdrop-blur-md">
                            <Fingerprint className={`w-8 h-8 text-white/70 transition-all duration-300 ${holdProgress > 0 ? 'scale-110 text-pink-400 animate-pulse' : ''}`} />
                        </div>
                        
                        <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono group-active:text-pink-300 transition-colors">
                            {holdProgress > 0 ? 'INITIALIZING...' : 'HOLD TO BEGIN'}
                        </p>
                    </div>
                </div>
            )}

            {/* 3. PROLOGUE (MODIFIED JSX) */}
            <div ref={prologueContainerRef} className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none ${stage === 'prologue' ? 'block' : 'hidden'}`}>
                {PROLOGUE_LINES.map((line, i) => (
                    <div key={i} className="absolute inset-0 flex items-center justify-center opacity-0 px-6">
                        <h2 className="glitch-effect text-3xl md:text-5xl font-garamond italic text-white/90 tracking-widest leading-loose text-center flex flex-wrap justify-center gap-x-2">
                            {/* Split text into characters for typing animation */}
                            {line.split("").map((char, charIndex) => (
                                <span key={charIndex} className="char inline-block opacity-0">
                                    {char === " " ? "\u00A0" : char}
                                </span>
                            ))}
                        </h2>
                    </div>
                ))}
            </div>

            {/* 4. COUNTDOWN */}
            {stage === 'counting' && (
                <div className="relative w-full max-w-[min(85vw,450px)] aspect-square flex items-center justify-center">
                    <div ref={clockContainerRef} className="relative w-full h-full rounded-full transform-style-3d">
                        {/* Glows */}
                        <div className="absolute inset-4 rounded-full bg-purple-600/20 blur-[60px] animate-pulse-slow" />
                        <div className="absolute inset-[-15px] rounded-full bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-black shadow-2xl z-0 ring-1 ring-white/5" />
                        
                        {/* Face */}
                        <div className="absolute inset-0 rounded-full bg-[#0a0a0a] shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] z-10 overflow-hidden border border-white/5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]" />
                            
                            {/* PHOTO REVEAL PLACEHOLDER */}
                            <div className="clock-photo-reveal absolute inset-0 z-0 opacity-0 pointer-events-none mix-blend-overlay">
                                <img src={CLOCK_PHOTO_SRC} alt="Memory" className="w-full h-full object-cover opacity-60 grayscale" />
                            </div>

                            {/* Numbers */}
                            <div ref={numberRingRef} className="absolute inset-0 rounded-full z-10 will-change-transform">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1/2 origin-bottom pt-5 md:pt-8" style={{ transform: `rotate(${i * (360/20)}deg)` }}>
                                        <div className="flex flex-col items-center justify-start h-full">
                                            <span className={`block text-xl md:text-3xl font-display font-bold transition-all duration-100 ${countdown === i + 1 ? 'text-white scale-125 drop-shadow-[0_0_10px_white]' : 'text-white/30'}`} style={{ opacity: getNumberOpacity(i), transform: `rotate(${-i * (360/20)}deg)` }}>
                                                {i + 1}
                                            </span>
                                            <div className={`mt-2 w-[1px] h-3 rounded-full transition-all duration-100 ${countdown === i + 1 ? 'bg-pink-500 h-6 shadow-[0_0_10px_#ec4899]' : 'bg-white/5'}`} />
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

            {/* 5. FINALE */}
            {stage === 'finale' && (
                <div ref={titleGroupRef} className="text-center w-full max-w-5xl px-4 z-40">
                    <div className="mb-6 flex justify-center">
                        <div className="relative p-4 bg-gradient-to-b from-white/10 to-transparent rounded-full border border-white/20 backdrop-blur-md animate-float">
                             <Crown className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_25px_rgba(253,224,71,0.6)]" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white drop-shadow-xl mb-4 tracking-tight leading-none">AFRAH GHAZI</h1>
                    <div className="flex items-center justify-center gap-4 text-2xl md:text-3xl font-light text-pink-200/80 tracking-[0.3em] mb-8">
                        <span className="w-12 h-[1px] bg-pink-500/50" />IS OFFICIALLY<span className="w-12 h-[1px] bg-pink-500/50" />
                    </div>
                    <div className="relative inline-block perspective-[500px]">
                         <h2 className="text-6xl md:text-9xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 animate-shimmer bg-[length:200%_auto] py-4 transform rotate-x-12">
                            TWENTYYY!
                        </h2>
                        <Sparkles className="absolute -top-4 -right-8 w-10 h-10 text-white animate-spin-slow" />
                    </div>
                    <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl max-w-3xl mx-auto transform transition hover:scale-105 duration-700">
                         <p className="text-lg md:text-2xl text-slate-200 font-serif italic leading-relaxed">
                            "Pop the sugarcane juice champagne! 🍾<br/>
                            <span className="not-italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-300">A new decade of magic begins.</span>"
                        </p>
                    </div>
                    <div className="mt-16 flex items-center justify-center gap-3 opacity-70">
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                        <p className="text-xs text-pink-100 uppercase tracking-widest font-mono">Teleporting to Birthday Room</p>
                    </div>
                </div>
            )}
        </div>

        {/* --- STYLES --- */}
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
            .font-garamond { font-family: 'EB Garamond', serif; }
            .font-display { font-family: system-ui, -apple-system, sans-serif; }
            .transform-style-3d { transform-style: preserve-3d; }
            
            @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
            @keyframes pulse-slow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            
            /* CRT Glitch Effect specifically for text */
            .glitch-effect {
                text-shadow: 2px 0 rgba(255,0,0,0.5), -2px 0 rgba(0,255,255,0.5);
                animation: glitch 3s infinite alternate-reverse;
            }
            @keyframes glitch {
                0% { text-shadow: 2px 0 rgba(255,0,0,0.5), -2px 0 rgba(0,255,255,0.5); }
                95% { text-shadow: 2px 0 rgba(255,0,0,0.5), -2px 0 rgba(0,255,255,0.5); }
                96% { text-shadow: -2px 0 rgba(255,0,0,0.5), 2px 0 rgba(0,255,255,0.5); opacity: 0.8; }
                97% { text-shadow: 0 0 transparent; opacity: 1; }
                100% { text-shadow: 0 0 transparent; }
            }

            .animate-float { animation: float 6s ease-in-out infinite; }
            .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
            .animate-spin-slow { animation: spin-slow 10s linear infinite; }
            .animate-shimmer { animation: shimmer 3s linear infinite; }
        `}</style>
    </div>
  );
}
