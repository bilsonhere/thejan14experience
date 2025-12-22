import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [started, setStarted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const countdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !started) startCountdown();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [started]);

  // Add initial animation for entrance
  useEffect(() => {
    if (!settings.reducedMotion && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: 'power2.out' }
      );
    }
  }, []);

  // Button hover animation
  useEffect(() => {
    if (!settings.reducedMotion && buttonRef.current && isHovering) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        y: -2,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });
    } else if (!settings.reducedMotion && buttonRef.current && !isHovering) {
      gsap.to(buttonRef.current, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [isHovering, settings.reducedMotion]);

  const startCountdown = () => {
    if (started) return;
    setStarted(true);

    // Button click animation
    if (!settings.reducedMotion && buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.9,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }

    let count = 1;
    const interval = setInterval(() => {
      setCountdown(count);

      if (!settings.reducedMotion && countdownRef.current) {
        // Enhanced countdown animation
        gsap.fromTo(
          countdownRef.current,
          { 
            opacity: 0, 
            y: 20,
            scale: 0.8,
            rotation: -2
          },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            rotation: 0,
            duration: 0.4, 
            ease: 'back.out(1.4)'
          }
        );
        
        // Glow pulse effect
        gsap.to(countdownRef.current, {
          textShadow: '0 0 80px rgba(236,72,153,0.8)',
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          delay: 0.1
        });
      }

      if (settings.soundEnabled) {
        audioManager.play('hit');
      }

      if (count >= 20) {
        clearInterval(interval);
        setTimeout(() => {
          setShowFinale(true);

          if (settings.soundEnabled) {
            audioManager.play('success');
          }

          if (!settings.reducedMotion && titleRef.current) {
            gsap.fromTo(
              titleRef.current,
              { 
                y: 30, 
                opacity: 0,
                scale: 0.9
              },
              { 
                y: 0, 
                opacity: 1, 
                scale: 1,
                duration: 1.5, 
                ease: 'elastic.out(1, 0.5)'
              }
            );
            
            // Emoji animation
            const emojis = titleRef.current.querySelectorAll('.emoji');
            gsap.fromTo(
              emojis,
              {
                y: 20,
                opacity: 0,
                scale: 0,
              },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: 'back.out(1.7)',
                delay: 0.3,
              }
            );
          }

          setTimeout(() => {
            navigateTo('room');
          }, 5000);
        }, 500);
      }

      count++;
    }, 800);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden 
                 bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900"
    >
      {/* Enhanced Dark vignette with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/70" />
      
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full 
                        bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
                        from-purple-900/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 
                        bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
                        from-pink-900/20 via-transparent to-transparent" />
      </div>

      {/* Enhanced horizon glow with animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%]
                        bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.25),transparent_65%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[40%]
                        bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.15),transparent_70%)]
                        animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      {/* Floating particles layer */}
      <AdaptiveParticleSystem
        count={window.innerWidth < 640 ? 220 : 420}
        color={countdown ? '#e9d5ff' : '#ffffff'}
        speed={countdown ? 0.55 : 0.2}
        size={countdown ? 2.5 : 2}
      />

      {/* Enhanced confetti with better visuals */}
      {showFinale && (
        <Confetti 
          recycle={false} 
          numberOfPieces={250} 
          gravity={0.08}
          colors={['#fbbf24', '#ec4899', '#a855f7', '#60a5fa', '#34d399']}
          confettiSource={{ x: window.innerWidth / 2, y: window.innerHeight, w: 0, h: 0 }}
        />
      )}

      {/* Animated border glow effect */}
      {countdown && !showFinale && (
        <div className="absolute inset-0 border-2 border-transparent rounded-lg 
                        animate-border-glow pointer-events-none"
             style={{
               animation: 'borderGlow 3s ease-in-out infinite',
               borderImage: 'linear-gradient(45deg, #a855f7, #ec4899, #fbbf24, #ec4899, #a855f7) 1',
             }} />
      )}

      <div className="relative z-10 text-center px-6 max-w-4xl">
        {!started && (
          <div className="mb-16 space-y-12">
            <div className="space-y-6">
              <p className="text-4xl md:text-5xl text-white/95 mb-8 font-elegant tracking-wider
                            leading-relaxed drop-shadow-[0_0_32px_rgba(168,85,247,0.6)]
                            animate-soft-glow">
                Ready to begin the countdown?
              </p>
              
              {/* Animated clock emoji */}
              <div className="text-7xl mb-8 animate-bounce-slow opacity-90 
                            drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                ⏰
              </div>
            </div>

            <div className="space-y-8">
              <button
                ref={buttonRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={startCountdown}
                className="relative px-14 py-7 text-2xl sm:text-3xl font-elegant font-semibold
                           bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600
                           hover:from-purple-500 hover:via-pink-400 hover:to-purple-500
                           text-white rounded-2xl shadow-2xl
                           transition-all duration-300
                           hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]
                           group overflow-hidden"
                style={{
                  backgroundSize: '200% 100%',
                  animation: isHovering ? 'gradientShift 2s ease infinite' : 'none'
                }}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Button text with enhanced shadow */}
                <span className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Start Countdown
                </span>
                
                {/* Corner accents */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-300/50 rounded-tl-lg" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-pink-300/50 rounded-tr-lg" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-300/50 rounded-bl-lg" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-pink-300/50 rounded-br-lg" />
              </button>

              <p className="text-lg text-purple-300/80 font-elegant tracking-wide
                          drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                or press{' '}
                <kbd className="px-3 py-1.5 bg-purple-900/50 text-purple-100 rounded-lg 
                              border border-purple-700/50 shadow-inner
                              font-mono text-base tracking-wider">
                  Enter
                </kbd>
              </p>
            </div>
          </div>
        )}

        {countdown && !showFinale && (
          <>
            {/* Countdown Container with enhanced effects */}
            <div className="relative">
              {/* Glow backdrop */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 
                            blur-3xl -z-10 scale-110" />
              
              {/* Countdown Number – HERO */}
              <div
                ref={countdownRef}
                className="text-[8rem] sm:text-[10rem] md:text-[12rem]
                           font-display font-bold text-white mb-8
                           tracking-tighter leading-none
                           drop-shadow-[0_0_80px_rgba(236,72,153,0.8)]
                           transition-all duration-300"
                style={{
                  textShadow: '0 0 60px rgba(236,72,153,0.6), 0 0 100px rgba(168,85,247,0.4)'
                }}
              >
                {countdown}
              </div>
              
              {/* Progress bar */}
              <div className="w-64 sm:w-80 h-1.5 bg-purple-900/30 rounded-full mx-auto mb-8 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-800"
                  style={{ width: `${(countdown / 20) * 100}%` }}
                />
              </div>

              {/* Time display with enhanced typography */}
              <div className="text-2xl sm:text-3xl text-purple-200/90 font-elegant tracking-widest
                            space-x-4 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                <span className="bg-purple-900/30 px-4 py-2 rounded-lg">
                  {Math.floor(23 + countdown / 20)}:
                </span>
                <span className="bg-pink-900/30 px-4 py-2 rounded-lg">
                  {String(Math.floor((countdown / 20) * 60) % 60).padStart(2, '0')}:
                </span>
                <span className="bg-purple-900/30 px-4 py-2 rounded-lg">
                  {String(Math.floor((countdown / 20) * 3600) % 60).padStart(2, '0')}
                </span>
              </div>
              
              {/* Subtitle */}
              <p className="mt-6 text-lg text-purple-300/70 font-elegant tracking-wide">
                Counting down to something magical... ✨
              </p>
            </div>
          </>
        )}

        {showFinale && (
          <div ref={titleRef} className="space-y-10">
            {/* Animated emojis */}
            <div className="flex justify-center gap-6 mb-6">
              <span className="emoji text-8xl opacity-95 animate-float-1">🎉</span>
              <span className="emoji text-8xl opacity-95 animate-float-2">🎂</span>
              <span className="emoji text-8xl opacity-95 animate-float-3">🎈</span>
            </div>

            {/* Main title with enhanced gradient */}
            <div className="relative">
              {/* Title shadow effect */}
              <div className="absolute inset-0 text-5xl sm:text-6xl md:text-7xl font-display font-bold
                            text-transparent bg-clip-text
                            bg-gradient-to-r from-yellow-300/20 via-pink-400/20 to-purple-400/20
                            blur-lg -z-10 scale-110">
                <span className="font-elegant italic">
                  AFRAH GHAZI IS 20!!!!!!!!
                </span>
              </div>
              
              <h1
                className="text-5xl sm:text-6xl md:text-7xl font-display font-bold
                           text-transparent bg-clip-text
                           bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                           mb-8 leading-tight
                           drop-shadow-[0_0_60px_rgba(236,72,153,0.9)]
                           animate-gradient-shift"
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 3s ease infinite'
                }}
              >
                <span className="font-elegant italic">
                  AFRAH GHAZI IS 20!!!!!!!!
                </span>
              </h1>
            </div>

            {/* Subtitle with enhanced styling */}
            <p className="text-2xl md:text-3xl text-white/95 mt-8 font-elegant leading-relaxed
                         drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]
                         max-w-2xl mx-auto">
              Pop the sugarcane juice champagne off and let the celebrations begin 🍾✨
            </p>
            
            {/* Celebration note */}
            <div className="mt-12 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 
                          rounded-xl border border-purple-700/30 backdrop-blur-sm
                          animate-pulse" style={{ animationDuration: '2s' }}>
              <p className="text-lg text-purple-200/80 font-elegant">
                The party continues in 5 seconds...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS animations in style tag */}
      <style>{`
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(168, 85, 247, 0.3); }
          50% { border-color: rgba(236, 72, 153, 0.6); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-5deg); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        
        .animate-float-1 { animation: float1 4s ease-in-out infinite; }
        .animate-float-2 { animation: float2 5s ease-in-out infinite; }
        .animate-float-3 { animation: float3 3.5s ease-in-out infinite; }
        
        .animate-soft-glow {
          animation: softGlow 3s ease-in-out infinite;
        }
        
        @keyframes softGlow {
          0%, 100% { text-shadow: 0 0 32px rgba(168, 85, 247, 0.6); }
          50% { text-shadow: 0 0 48px rgba(236, 72, 153, 0.8); }
        }
        
        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }
        
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-gradient-shift {
          animation: gradientShift 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
