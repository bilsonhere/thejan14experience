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
type Phase = 'silence' | 'intro' | 'narrative' | 'accelerating' | 'stillness' | 'warp' | 'counting' | 'finale';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  
  // -- State --
  const [phase, setPhase] = useState<Phase>('silence');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [warpSpeed, setWarpSpeed] = useState(0.2); 
  const [warpColor, setWarpColor] = useState("#1a1a2e");
  const [particleCount, setParticleCount] = useState(20);
  const [currentText, setCurrentText] = useState<string>('');

  // -- Refs --
  const containerRef = useRef<HTMLDivElement>(null);
  const clockContainerRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const cinematicContainerRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
  const startNarrativeSequence = () => {
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
        setPhase('intro');
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
  };

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
            onComplete: revealClock
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
  /* SEQUENCE 3: THE CLOCK REVEAL & COUNTDOWN */
  /* ------------------------------------------------------------------ */
  const revealClock = () => {
    setPhase('counting');
    setWarpSpeed(0.5); // Calm down particles
    setWarpColor("#A78BFA"); // Back to purple
    if (cinematicContainerRef.current) cinematicContainerRef.current.innerHTML = '';

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
        size={phase === 'accelerating' ? 4 : phase === 'counting' ? 1.2 : 1}
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

      {/* --- CONFETTI (Finale) --- */}
      {phase === 'finale' && (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#FCD34D', '#E879F9', '#818CF8']} />
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="relative z-30 w-full h-full flex flex-col items-center justify-center px-6">
          
          {/* 1. START SCREEN (After narrative) */}
          {(phase === 'intro' || phase === 'narrative') && !currentText && (
              <div className="start-ui text-center space-y-16 max-w-2xl mx-auto animate-fade-in-very-slow">
                  <div className="space-y-8">
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
                      ref={buttonRef}
                      onClick={startApproachSequence}
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
              <div ref={titleGroupRef} className="text-center z-50 animate-fade-in-up">
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
          @keyframes spin-very-slow {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
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
          
          @keyframes fade-in-very-slow {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          .animate-spin-very-slow {
            animation: spin-very-slow 240s linear infinite;
          }
          
          .animate-text-emerge {
            animation: text-emerge 2s ease-out forwards;
          }
          
          .animate-fade-in-very-slow {
            animation: fade-in-very-slow 4s ease-out forwards;
          }
          
          .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          .animate-bounce-slow { animation: bounce 3s infinite; }
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
          
          .font-disletter {
            font-family: 'Times New Roman', Times, serif;
            font-variant: small-caps;
          }
      `}</style>
    </div>
  );
}
