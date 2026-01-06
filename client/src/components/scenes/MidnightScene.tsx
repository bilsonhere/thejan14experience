import { useEffect, useRef, useState, useCallback } from 'react';
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

/* ------------------------------------------------------------------ */
/* SUB-COMPONENT: CINEMATIC TEXT REVEAL */
/* ------------------------------------------------------------------ */

const CinematicText = ({ text, delay = 0, duration = 2000 }: { text: string; delay?: number; duration?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), duration);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay, duration]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
      <div className="relative">
        {/* Text shadow/glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-2xl animate-pulse" />
        
        {/* Main text */}
        <div className="relative animate-text-reveal">
          <span className="text-4xl md:text-7xl font-light tracking-[0.5em] text-white/90 uppercase">
            {text}
          </span>
        </div>
        
        {/* Underline effect */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent animate-line-expand" />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN SCENE */
/* ------------------------------------------------------------------ */

type Phase = 'silence' | 'intro' | 'narrative' | 'accelerating' | 'stillness' | 'warp' | 'clock' | 'counting' | 'finale';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // Game State
  const [phase, setPhase] = useState<Phase>('silence');
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Visual State for Warp Effect
  const [warpSpeed, setWarpSpeed] = useState(0.2);
  const [warpColor, setWarpColor] = useState("#1a1a2e");
  const [particleCount, setParticleCount] = useState(20);
  
  // Text Sequence
  const [currentText, setCurrentText] = useState<string>('');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cinematicContainerRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* ACT I: SILENCE & DARKNESS */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    // Initial setup - total darkness
    if (containerRef.current) {
      gsap.set(containerRef.current, { opacity: 0 });
      
      // Start with ambient sound
      if (settings.soundEnabled) {
        audioManager.play('ambient', { loop: true, volume: 0.3 });
      }
      
      // Slowly fade in grain/noise
      setTimeout(() => {
        setPhase('intro');
        gsap.to(containerRef.current, { 
          opacity: 1, 
          duration: 8, 
          ease: 'power2.inOut',
          onComplete: () => startNarrativeSequence()
        });
      }, 2000);
    }
    
    // Ambient particles
    const interval = setInterval(() => {
      setParticleCount(prev => prev + (prev < 80 ? 1 : 0));
    }, 100);
    
    return () => clearInterval(interval);
  }, [settings.soundEnabled]);

  /* ------------------------------------------------------------------ */
  /* ACT II: NARRATIVE & TIME FEELING */
  /* ------------------------------------------------------------------ */

  const startNarrativeSequence = useCallback(() => {
    setPhase('narrative');
    
    const texts = [
      "BEFORE TIME",
      "THERE WAS DARKNESS",
      "AND FROM THE DARKNESS",
      "A HEARTBEAT",
      "20 YEARS AGO..."
    ];
    
    let textIndex = 0;
    
    const showNextText = () => {
      if (textIndex >= texts.length) {
        // End of narrative, wait for interaction
        setPhase('clock');
        return;
      }
      
      setCurrentText(texts[textIndex]);
      textIndex++;
      
      // Longer pause for dramatic effect
      setTimeout(() => {
        setCurrentText('');
        setTimeout(showNextText, 1000); // Silence between lines
      }, 3000);
    };
    
    showNextText();
    
    // Slowly increase particle drift to simulate "coming to life"
    gsap.to({}, {
      duration: 20,
      onUpdate: () => {
        setWarpSpeed(prev => Math.min(prev + 0.01, 0.5));
        setWarpColor(`rgb(${40 + textIndex * 10}, ${20 + textIndex * 5}, ${80 + textIndex * 20})`);
      }
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /* TRANSITION: APPROACHING THE MOMENT */
  /* ------------------------------------------------------------------ */

  const startApproachSequence = () => {
    setPhase('accelerating');
    
    if (settings.soundEnabled) {
      audioManager.stop('ambient');
      audioManager.play('click');
    }

    const tl = gsap.timeline({
      onComplete: () => setPhase('stillness')
    });

    // 1. Hide UI with cinematic dissolve
    tl.to('.start-ui', { 
      opacity: 0, 
      scale: 0.9, 
      duration: 1.5, 
      ease: 'power2.inOut',
      filter: 'blur(20px)'
    });

    // 2. Negative space expansion
    tl.to(containerRef.current, {
      scale: 1.2,
      duration: 4,
      ease: 'power2.inOut'
    }, "-=1");

    // 3. Warp speed build-up
    tl.to({}, {
      duration: 3,
      onUpdate: function() {
        const progress = this.progress();
        setWarpSpeed(progress * 30);
        setParticleCount(Math.floor(80 + progress * 300));
        setWarpColor(`rgb(${255}, ${255 - progress * 200}, ${255})`);
      }
    }, "<");

    // 4. Cinematic text during acceleration
    const accelerationTexts = ["LEAVING 19", "APPROACHING", "THE MOMENT"];
    
    accelerationTexts.forEach((text, i) => {
      const el = document.createElement('div');
      el.innerText = text;
      el.className = `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        text-5xl md:text-8xl font-thin text-transparent bg-clip-text 
        bg-gradient-to-b from-white/90 to-white/40 
        tracking-[0.3em] uppercase opacity-0 blur-sm 
        whitespace-nowrap z-40 font-disletter`;
      
      cinematicContainerRef.current?.appendChild(el);
      
      const offset = i * 1.5;
      
      tl.to(el, {
        opacity: 1,
        blur: 0,
        scale: 1.05,
        duration: 0.6,
        ease: "power2.out"
      }, `+=${offset}`);
      
      tl.to(el, {
        opacity: 0,
        blur: 20,
        scale: 1.8,
        duration: 0.4,
        ease: "power2.in"
      }, `+=0.8`);
    });

    // 5. Final buildup to stillness
    tl.to(containerRef.current, {
      backgroundColor: '#0a0a0a',
      duration: 1,
      onComplete: () => {
        setTimeout(() => {
          setPhase('warp');
          triggerWarpCut();
        }, 1500);
      }
    });
  };

  /* ------------------------------------------------------------------ */
  /* THE WARP CUT */
  /* ------------------------------------------------------------------ */

  const triggerWarpCut = () => {
    // Immediate effect - like a film cut
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        backgroundColor: '#ffffff',
        duration: 0.05,
        onComplete: () => {
          gsap.to(containerRef.current, {
            backgroundColor: '#05030a',
            duration: 0.8,
            onComplete: startClockSequence
          });
        }
      });
    }
    
    // Screen shake
    gsap.to(containerRef.current, {
      x: -10,
      y: 10,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: 'power4.inOut'
    });
    
    // Sound effect for warp
    if (settings.soundEnabled) {
      audioManager.play('success');
    }
  };

  /* ------------------------------------------------------------------ */
  /* ACT III: THE CLOCK & COUNTING */
  /* ------------------------------------------------------------------ */

  const startClockSequence = () => {
    setPhase('clock');
    setWarpSpeed(0.3);
    setWarpColor("#A78BFA");
    setParticleCount(120);
    
    // Clear any remaining text
    if (cinematicContainerRef.current) {
      cinematicContainerRef.current.innerHTML = '';
    }

    // Dramatic Clock Entry
    if (clockContainerRef.current) {
      gsap.fromTo(clockContainerRef.current, 
        { 
          scale: 4, 
          opacity: 0, 
          rotate: -90,
          filter: 'blur(40px)'
        },
        { 
          scale: 1, 
          opacity: 1, 
          rotate: 0,
          filter: 'blur(0px)',
          duration: 2,
          ease: 'expo.out',
          onComplete: () => {
            setTimeout(() => {
              setPhase('counting');
              beginCountdown();
            }, 2000); // Let the clock be admired
          }
        }
      );
      
      // Subtle ambient pulse
      gsap.to(clockContainerRef.current, {
        boxShadow: '0 0 100px rgba(168, 85, 247, 0.3)',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    // Start clock hands animation
    setTimeout(() => {
      gsap.to('.clock-hand-second', { 
        rotation: 360, 
        duration: 2, 
        repeat: -1, 
        ease: 'linear', 
        transformOrigin: 'bottom center' 
      });
      gsap.to('.clock-hand-minute', { 
        rotation: 360, 
        duration: 20, 
        repeat: -1, 
        ease: 'linear', 
        transformOrigin: 'bottom center' 
      });
    }, 500);
  };

  const beginCountdown = () => {
    let count = 0;
    const timer = setInterval(() => {
      count++;
      setCountdown(count);
      handleTick(count);

      if (count >= 20) {
        clearInterval(timer);
        setTimeout(triggerFinale, 1500);
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
        { scale: 1.08 },
        { scale: 1, duration: 0.6, ease: 'elastic.out(1.5, 0.5)' }
      );
    }
    
    // Ambient flash for each tick
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        backgroundColor: '#1a103c',
        duration: 0.05,
        yoyo: true,
        repeat: 1,
        onComplete: () => gsap.to(containerRef.current, { 
          backgroundColor: '#05030a', 
          duration: 0.5 
        })
      });
    }
  };

  /* ------------------------------------------------------------------ */
  /* FINALE CELEBRATION */
  /* ------------------------------------------------------------------ */

  const triggerFinale = () => {
    setPhase('finale');
    
    if (settings.soundEnabled) {
      audioManager.play('success');
    }

    // Celebration flash
    gsap.to(containerRef.current, { 
      backgroundColor: '#ffffff', 
      duration: 0.1, 
      yoyo: true, 
      repeat: 2 
    });
    
    gsap.to(containerRef.current, { 
      background: 'radial-gradient(circle at center, #831843 0%, #4c1d95 40%, #000000 100%)', 
      duration: 3 
    });

    // Title reveal
    if (titleGroupRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(titleGroupRef.current.children, 
        { y: 100, opacity: 0, filter: 'blur(20px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.3, duration: 1.5, ease: 'power4.out' }
      );
    }
    
    // Auto navigation after celebration
    setTimeout(() => navigateTo('room'), 7000);
  };

  // Helper
  const getNumberOpacity = (index: number) => {
    if (!countdown) return 0.1;
    const diff = Math.abs((index + 1) - countdown);
    if (diff === 0) return 1;
    if (diff === 1 || diff === 19) return 0.5;
    return 0.08;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black transition-all duration-1000 font-display">

      {/* --- ACT I: DARKNESS & GRAIN --- */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-3000 ${phase === 'silence' ? 'opacity-10' : 'opacity-30'}`}>
        {/* Film grain texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        
        {/* Cosmic dust */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)]" />
      </div>

      {/* --- NEGATIVE SPACE VIGNETTE --- */}
      <div className={`absolute inset-0 z-5 transition-all duration-2000 ${
        phase === 'accelerating' ? 'bg-[radial-gradient(circle_at_center,transparent_10%,#000000_90%)] scale-150' :
        phase === 'silence' ? 'bg-[radial-gradient(circle_at_center,transparent_30%,#000000_80%)]' :
        'bg-[radial-gradient(circle_at_center,transparent_40%,#000000_70%)]'
      }`} />

      {/* --- CINEMATIC TEXT OVERLAY --- */}
      <div ref={cinematicContainerRef} className="absolute inset-0 z-40 pointer-events-none" />
      {currentText && phase === 'narrative' && (
        <div className="absolute inset-0 z-45 pointer-events-none flex items-center justify-center">
          <div className="animate-text-emerge">
            <span className="text-3xl md:text-5xl font-light tracking-[0.8em] text-white/70 uppercase px-8 text-center leading-relaxed">
              {currentText}
            </span>
          </div>
        </div>
      )}

      {/* --- INTERACTIVE PARTICLES --- */}
      <AdaptiveParticleSystem 
        count={particleCount}
        color={warpColor}
        speed={warpSpeed}
        size={phase === 'accelerating' ? 4 : phase === 'clock' ? 1.2 : 1}
        className={`z-10 transition-opacity duration-1000 ${
          phase === 'counting' ? 'opacity-40' :
          phase === 'silence' ? 'opacity-20' :
          'opacity-60'
        }`}
        shape={phase === 'accelerating' ? 'star' : 'circle'}
      />

      {/* --- ROTATING NEBULA BACKGROUND --- */}
      {phase !== 'silence' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300vw] h-[300vw] opacity-10 mix-blend-screen bg-[conic-gradient(from_0deg,transparent_0deg,#4c1d95_100deg,transparent_200deg,#db2777_300deg,transparent_360deg)] blur-[150px] animate-spin-very-slow" />
      )}

      {/* --- CONFETTI --- */}
      {phase === 'finale' && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti 
            width={window.innerWidth} 
            height={window.innerHeight} 
            recycle={false} 
            numberOfPieces={400} 
            colors={['#FCD34D', '#F472B6', '#818CF8', '#FFFFFF']} 
          />
        </div>
      )}

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-4">

        {/* ACT I/II: START UI (Only in intro/narrative phases) */}
        {(phase === 'intro' || phase === 'narrative') && (
          <div className="start-ui text-center space-y-24 animate-fade-in-very-slow max-w-xl mx-auto">
            
            {/* Title Group - Very minimal */}
            <div className="space-y-6 relative">
              <div className="opacity-0">Spacer</div> {/* Negative space */}
              
              <h1 className="text-5xl md:text-7xl font-thin text-white/90 tracking-[0.3em] uppercase leading-none">
                MIDNIGHT
              </h1>
              
              <div className="w-48 mx-auto h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <p className="text-xs tracking-[0.5em] text-white/30 uppercase mt-12">
                The Transition
              </p>
            </div>

            {/* Interaction Trigger - Appears after narrative */}
            {phase === 'narrative' && !currentText && (
              <div className="relative pt-16">
                <button
                  ref={buttonRef}
                  onClick={startApproachSequence}
                  className="group relative flex items-center justify-center gap-3 px-8 py-4 mx-auto transition-all duration-1000 hover:scale-[1.02]"
                >
                  {/* Minimal button glow */}
                  <div className="absolute inset-0 border border-white/5 bg-white/2 backdrop-blur-sm rounded-full transition-all duration-700 group-hover:bg-white/5 group-hover:border-white/20" />
                  
                  {/* Text */}
                  <span className="relative z-10 text-white/80 font-light text-sm tracking-[0.5em] group-hover:text-white group-hover:tracking-[0.6em] transition-all duration-500">
                    APPROACH
                  </span>
                  
                  {/* Icon */}
                  <ChevronRight className="relative z-10 w-4 h-4 text-white/50 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-500" />
                </button>
                
                <p className="mt-8 text-[9px] text-white/20 uppercase tracking-widest font-mono">
                  Ready when you are
                </p>
              </div>
            )}
          </div>
        )}

        {/* ACT III: THE SACRED CLOCK */}
        {(phase === 'clock' || phase === 'counting') && (
          <div className="relative w-full max-w-[min(85vw,420px)] aspect-square flex items-center justify-center">
            <div ref={clockContainerRef} className="relative w-full h-full rounded-full">
              
              {/* Outer Cosmic Ring */}
              <div className="absolute inset-[-15px] rounded-full bg-gradient-to-b from-gray-900/50 to-black/90 shadow-[0_0_80px_rgba(0,0,0,0.8)] z-0" />
              
              {/* Glass Face with Depth */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 to-black border border-white/5 shadow-[inset_0_0_100px_rgba(0,0,0,0.95)] z-10 overflow-hidden">
                
                {/* Inner reflections */}
                <div className="absolute inset-4 rounded-full border border-white/10 opacity-30" />
                <div className="absolute inset-8 rounded-full border border-white/5 opacity-20" />
                
                {/* Numbers Ring */}
                <div ref={numberRingRef} className="absolute inset-0 rounded-full z-10 will-change-transform">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-1/2 origin-bottom pt-6" 
                         style={{ transform: `rotate(${i * (360/20)}deg)` }}>
                      <div className="flex flex-col items-center justify-start h-full">
                        <span className={`block text-3xl font-light transition-all duration-500 ${
                          countdown === i + 1 ? 
                          'text-white scale-150 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 
                          'text-white/20'
                        }`}
                          style={{ 
                            opacity: getNumberOpacity(i),
                            transform: `rotate(${-i * (360/20)}deg)`,
                            fontVariantNumeric: 'tabular-nums'
                          }}>
                          {i + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <ClockHands />
                
                {/* Glass refraction effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent rounded-full pointer-events-none z-50 mix-blend-overlay" />
              </div>
              
              {/* Glowing aura */}
              <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl opacity-50 animate-pulse-slow" />
            </div>
          </div>
        )}

        {/* FINALE CELEBRATION */}
        {phase === 'finale' && (
          <div ref={titleGroupRef} className="text-center w-full max-w-4xl px-4 z-40 space-y-8">
            
            {/* Crown Icon */}
            <div className="flex justify-center">
              <Crown className="w-20 h-20 text-yellow-300 drop-shadow-[0_0_30px_rgba(253,224,71,0.8)] animate-float-slow" />
            </div>
            
            {/* Name */}
            <div className="overflow-hidden">
              <h1 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
                AFRAH GHAZI
              </h1>
            </div>
            
            {/* Transition Text */}
            <div className="overflow-hidden">
              <div className="text-xl md:text-3xl font-light text-purple-300/80 tracking-[0.4em] uppercase">
                IS NOW
              </div>
            </div>
            
            {/* Age Number - Centerpiece */}
            <div className="overflow-hidden py-8">
              <h2 className="text-7xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-500 animate-shimmer bg-[length:200%_auto] leading-none">
                20
              </h2>
            </div>
            
            {/* Quote */}
            <div className="mt-12 p-8 border-t border-b border-white/10 backdrop-blur-lg bg-white/5 rounded-2xl">
              <p className="text-lg md:text-2xl text-gray-200 font-serif italic">
                "Pop the sugarcane juice champagne! 🍾"
              </p>
              <p className="text-sm text-gray-400/70 mt-4 tracking-widest uppercase">
                The celebration begins...
              </p>
            </div>
          </div>
        )}

      </div>

      {/* --- CUSTOM STYLES --- */}
      <style jsx>{`
        @keyframes spin-very-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes text-emerge {
          0% { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            filter: blur(10px);
          }
          100% { 
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }
        
        @keyframes text-reveal {
          0% { 
            letter-spacing: 1em;
            opacity: 0;
          }
          100% { 
            letter-spacing: 0.5em;
            opacity: 1;
          }
        }
        
        @keyframes line-expand {
          0% { width: 0%; opacity: 0; }
          100% { width: 32rem; opacity: 1; }
        }
        
        @keyframes fade-in-very-slow {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-spin-very-slow {
          animation: spin-very-slow 240s linear infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-text-emerge {
          animation: text-emerge 2s ease-out forwards;
        }
        
        .animate-text-reveal {
          animation: text-reveal 3s ease-out forwards;
        }
        
        .animate-line-expand {
          animation: line-expand 2s ease-out forwards;
        }
        
        .animate-fade-in-very-slow {
          animation: fade-in-very-slow 4s ease-out forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 8s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .font-disletter {
          font-family: 'Times New Roman', Times, serif;
          font-variant: small-caps;
        }
      `}</style>
    </div>
  );
}
