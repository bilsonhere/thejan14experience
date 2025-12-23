import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Sparkles } from 'lucide-react';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [started, setStarted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [celebrateMode, setCelebrateMode] = useState(false);
  
  const countdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const celebrationRef = useRef<HTMLDivElement>(null);
  const emojiRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !started) startCountdown();
    };
    window.addEventListener('keydown', handleKeyPress);
    
    // Initial entrance animation
    if (!settings.reducedMotion && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out' }
      );
    }
    
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [started]);

  const createSparkleEffect = (element: HTMLElement) => {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'fixed text-2xl pointer-events-none z-50';
        const rect = element.getBoundingClientRect();
        sparkle.style.left = `${rect.left + rect.width / 2}px`;
        sparkle.style.top = `${rect.top + rect.height / 2}px`;
        document.body.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 120,
          y: (Math.random() - 0.5) * 120 - 60,
          opacity: 0,
          scale: 0,
          rotation: 360,
          duration: 1.2,
          ease: 'power3.out',
          onComplete: () => sparkle.remove(),
        });
      }, i * 100);
    }
  };

  const startCountdown = () => {
    if (started) return;
    setStarted(true);

    if (!settings.reducedMotion && buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.92,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
      
      // Sparkle effect on button click
      createSparkleEffect(buttonRef.current);
    }

    let count = 1;
    const interval = setInterval(() => {
      setCountdown(count);

      if (!settings.reducedMotion && countdownRef.current) {
        // Enhanced countdown animation with multiple effects
        gsap.fromTo(
          countdownRef.current,
          { 
            scale: 0.7, 
            opacity: 0, 
            filter: 'blur(8px)',
            rotation: -5
          },
          {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            rotation: 0,
            duration: 0.4,
            ease: 'back.out(1.7)',
          }
        );
        
        // Glow pulse effect
        gsap.to(countdownRef.current, {
          textShadow: '0 0 100px rgba(236,72,153,0.9)',
          duration: 0.3,
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
          setCelebrateMode(true);

          if (settings.soundEnabled) {
            audioManager.play('success');
          }

          if (!settings.reducedMotion && titleRef.current) {
            gsap.fromTo(
              titleRef.current,
              { 
                y: 50, 
                opacity: 0,
                scale: 0.8
              },
              { 
                y: 0, 
                opacity: 1, 
                scale: 1,
                duration: 1.5, 
                ease: 'elastic.out(1, 0.5)'
              }
            );
            
            // Enhanced emoji animation
            emojiRefs.current.forEach((emoji, i) => {
              if (emoji) {
                gsap.fromTo(emoji,
                  {
                    y: 30,
                    opacity: 0,
                    scale: 0,
                    rotation: -180,
                  },
                  {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: 'back.out(2)',
                  }
                );
              }
            });
          }

          // Background transformation for celebration
          if (!settings.reducedMotion && containerRef.current) {
            gsap.to(containerRef.current, {
              background: 'linear-gradient(135deg, #000000 0%, #1e1b4b 30%, #6d28d9 70%, #be185d 100%)',
              duration: 2,
              ease: 'power2.inOut',
            });
          }

          setTimeout(() => {
            navigateTo('room');
          }, 6000);
        }, 500);
      }

      count++;
    }, 800);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden 
                 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900
                 transition-all duration-1000"
    >
      
      {/* Enhanced Cosmic Background */}
      <div className="absolute inset-0">
        {/* Animated nebula effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full 
                          bg-[radial-gradient(ellipse_at_20%_20%,_var(--tw-gradient-stops))] 
                          from-purple-900/80 via-transparent to-transparent 
                          animate-pulse" style={{animationDuration: '8s'}} />
          <div className="absolute bottom-0 right-0 w-full h-full 
                          bg-[radial-gradient(ellipse_at_80%_80%,_var(--tw-gradient-stops))] 
                          from-pink-900/60 via-transparent to-transparent
                          animate-pulse" style={{animationDuration: '12s', animationDelay: '1s'}} />
        </div>
        
        {/* Starfield effect */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJzdGFycyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjAuNSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjAuNyIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMC4zIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48Y2lyY2xlIGN4PSI5MCIgY3k9IjE1IiByPSIxIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjI1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3N0YXJzKSIvPjwvc3ZnPg==')] 
                        opacity-40" />
        
        {/* Dynamic horizon glow - intensifies during countdown */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[50%]
                        bg-[radial-gradient(ellipse_at_center,${celebrateMode ? 'rgba(168,85,247,0.35)' : 'rgba(168,85,247,0.2)'},transparent_65%)]
                        transition-all duration-1000`} />
      </div>

      {/* Enhanced Particle System */}
      <AdaptiveParticleSystem
        count={celebrateMode ? 600 : 500}
        color={countdown ? '#facc15' : celebrateMode ? '#ffffff' : '#e0e7ff'}
        speed={celebrateMode ? 1 : countdown ? 0.8 : 0.3}
        size={celebrateMode ? 4 : countdown ? 3.5 : 2.5}
        className="transition-all duration-1000"
      />

      {/* Celebration Confetti - Enhanced */}
      {showFinale && (
        <>
          <Confetti
            recycle={false}
            numberOfPieces={400}
            gravity={0.08}
            colors={['#fbbf24', '#ec4899', '#a855f7', '#60a5fa', '#34d399', '#f97316']}
            wind={0.02}
            opacity={0.9}
            style={{ position: 'fixed' }}
          />
          <div className="absolute inset-0 pointer-events-none">
            <AdaptiveParticleSystem
              count={300}
              color="#fbbf24"
              speed={1.2}
              size={3}
            />
          </div>
        </>
      )}

      {/* Floating Sparkles during celebration */}
      {showFinale && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl animate-float-slow"
              style={{
                left: `${10 + i * 20}%`,
                top: `${20 + (i * 15)}%`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.7
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl w-full">
        {!started && (
          <div className="mb-12 sm:mb-16 space-y-10 sm:space-y-14">
            <div className="space-y-6 sm:space-y-8">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 
                              blur-2xl rounded-full opacity-50" />
                <p className="relative text-3xl sm:text-4xl md:text-5xl text-white/95 mb-8 sm:mb-12 font-elegant tracking-wider
                            leading-relaxed drop-shadow-[0_0_40px_rgba(168,85,247,0.7)]">
                  The Countdown Begins Now
                </p>
              </div>
              
              {/* Animated clock with glow */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-pink-500/30 to-purple-500/30 
                              blur-2xl rounded-full animate-pulse" style={{animationDuration: '3s'}} />
                <div className="relative text-6xl sm:text-7xl md:text-8xl mb-8 sm:mb-12 opacity-95 
                              drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]
                              animate-soft-bounce">
                  ⏰
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <button
                ref={buttonRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={startCountdown}
                className="relative px-8 sm:px-12 md:px-14 py-5 sm:py-6 md:py-7 
                           text-xl sm:text-2xl md:text-3xl font-elegant font-semibold
                           bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600
                           hover:from-purple-500 hover:via-pink-400 hover:to-purple-500
                           text-white rounded-2xl shadow-2xl
                           transition-all duration-300
                           hover:scale-[1.04] hover:-translate-y-1
                           hover:shadow-[0_0_60px_rgba(168,85,247,0.8)]
                           group overflow-hidden
                           w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"
                aria-label="Start countdown"
                style={{
                  backgroundSize: '200% 100%',
                  animation: isHovering ? 'gradientShift 2s ease infinite' : 'none'
                }}
              >
                {/* Button glow layer */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Button shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Button text */}
                <span className="relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] 
                               flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  Begin Celebration
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
              </button>

              <p className="text-sm sm:text-base md:text-lg text-purple-300/80 font-elegant tracking-wide
                          drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                or press{' '}
                <kbd className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-br from-purple-800/60 to-pink-800/60 
                              text-purple-100 rounded-lg border border-purple-600/50 shadow-inner
                              font-mono text-sm sm:text-base tracking-wider">
                  Enter
                </kbd>
              </p>
            </div>
          </div>
        )}

        {countdown && !showFinale && (
          <>
            {/* Countdown Display - Peak Design */}
            <div className="relative">
              {/* Animated orb behind countdown */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                              w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96
                              bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 
                              rounded-full blur-3xl animate-pulse" style={{animationDuration: '2s'}} />
              </div>
              
              {/* Countdown Number - Hero Display */}
              <div
                ref={countdownRef}
                className="text-[7rem] sm:text-[9rem] md:text-[11rem] lg:text-[12rem]
                           font-display font-black text-white mb-8 sm:mb-12
                           tracking-tighter leading-none
                           drop-shadow-[0_0_100px_rgba(236,72,153,0.9)]
                           animate-pulse-glow"
                style={{
                  textShadow: `0 0 80px rgba(236,72,153,0.8), 
                               0 0 120px rgba(168,85,247,0.6),
                               0 0 160px rgba(245,158,11,0.4)`
                }}
              >
                {countdown}
              </div>
              
              {/* Progress Indicator */}
              <div className="relative w-56 sm:w-72 md:w-80 h-1.5 sm:h-2 mx-auto mb-10 sm:mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 
                              rounded-full blur-sm" />
                <div className="relative h-full bg-purple-900/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full 
                             transition-all duration-800 shadow-lg shadow-pink-500/30"
                    style={{ width: `${(countdown / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Time Display - Futuristic */}
              <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                {['HRS', 'MIN', 'SEC'].map((label, i) => (
                  <div key={label} className="text-center">
                    <div className="text-xs sm:text-sm text-purple-300/70 font-mono mb-1">{label}</div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br from-purple-900/50 to-pink-900/50 
                                  px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-purple-700/30
                                  backdrop-blur-sm shadow-lg">
                      {i === 0 ? Math.floor(23 + countdown / 20) :
                       i === 1 ? String(Math.floor((countdown / 20) * 60) % 60).padStart(2, '0') :
                       String(Math.floor((countdown / 20) * 3600) % 60).padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Countdown Message */}
              <p className="text-base sm:text-lg md:text-xl text-purple-200/80 font-elegant tracking-wide
                          drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]
                          animate-pulse" style={{animationDuration: '2s'}}>
                {countdown < 10 ? 'Getting closer...' : 
                 countdown < 15 ? 'Almost there!' : 
                 'Get ready! ✨'}
              </p>
            </div>
          </>
        )}

        {showFinale && (
          <div ref={titleRef} className="space-y-8 sm:space-y-12 md:space-y-16">
            {/* Celebration Header with enhanced effects */}
            <div className="relative">
              {/* Background glow */}
              <div className="absolute -inset-8 sm:-inset-12 bg-gradient-to-r from-yellow-500/10 via-pink-500/20 to-purple-500/10 
                            blur-3xl rounded-full" />
              
              {/* Animated Emojis */}
              <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                {['🎉', '🎂', '🎈'].map((emoji, i) => (
                  <span
                    key={i}
                    ref={el => emojiRefs.current[i] = el}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl opacity-95
                             drop-shadow-[0_0_30px_rgba(251,191,36,0.7)]
                             animate-float-enhanced"
                    style={{animationDelay: `${i * 0.2}s`}}
                  >
                    {emoji}
                  </span>
                ))}
              </div>

              {/* Main Celebration Title */}
              <div className="relative">
                {/* Title glow layers */}
                <div className="absolute -inset-6 sm:-inset-8 bg-gradient-to-r from-yellow-400/40 via-pink-500/40 to-purple-500/40 
                              blur-2xl rounded-full opacity-60" />
                <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-yellow-300/30 via-pink-400/30 to-purple-400/30 
                              blur-xl rounded-full opacity-40" />
                
                {/* Main Title */}
                <h1
                  className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black
                           text-transparent bg-clip-text
                           bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                           leading-tight py-4 sm:py-6
                           drop-shadow-[0_0_80px_rgba(236,72,153,0.9)]
                           animate-gradient-title"
                >
                  <span className="font-cursive italic block">
                    AFRAH GHAZI
                  </span>
                  <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-2 sm:mt-4
                                 bg-gradient-to-r from-yellow-200 via-pink-300 to-purple-300
                                 bg-clip-text text-transparent">
                    IS OFFICIALLY 20!
                  </span>
                </h1>
              </div>
            </div>

            {/* Celebration Message */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 
                            blur-xl rounded-2xl" />
              <p className="relative text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/95 
                         font-elegant leading-relaxed p-6 sm:p-8
                         backdrop-blur-sm rounded-xl border border-purple-500/30
                         shadow-2xl shadow-purple-900/30">
                Pop the sugarcane juice champagne off<br className="hidden sm:block" /> 
                and let the celebrations begin 🍾✨
              </p>
            </div>

            {/* Countdown to Next Scene */}
            <div className="mt-8 sm:mt-12">
              <div className="inline-flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-3 sm:py-4
                            bg-gradient-to-r from-purple-900/50 via-pink-900/40 to-purple-900/50
                            rounded-2xl border border-purple-500/30 backdrop-blur-lg
                            shadow-lg shadow-purple-900/30
                            animate-pulse-slow">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping" />
                <p className="text-sm sm:text-base md:text-lg text-purple-200/90 font-elegant">
                  The party begins in <span className="font-bold text-white">5</span> seconds...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes soft-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        
        @keyframes float-enhanced {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-20px) rotate(5deg) scale(1.1); }
          75% { transform: translateY(-10px) rotate(-5deg) scale(1.05); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 80px rgba(236,72,153,0.8)); }
          50% { filter: drop-shadow(0 0 120px rgba(245,158,11,0.9)); }
        }
        
        @keyframes gradient-title {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        
        .animate-soft-bounce {
          animation: soft-bounce 3s ease-in-out infinite;
        }
        
        .animate-float-enhanced {
          animation: float-enhanced 4s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-gradient-title {
          animation: gradient-title 3s ease infinite;
          background-size: 200% auto;
        }
        
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 4px;
        }
        
        /* Selection color */
        ::selection {
          background: rgba(168, 85, 247, 0.3);
          color: white;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .font-cursive {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}
