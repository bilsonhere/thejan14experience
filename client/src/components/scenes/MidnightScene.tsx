import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';
import { Sparkles, Clock, Cake, Gift, Heart, Star, Moon } from 'lucide-react';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [started, setStarted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [celebrateMode, setCelebrateMode] = useState(false);
  const [memories, setMemories] = useState<string[]>([]);
  
  const countdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const celebrationRef = useRef<HTMLDivElement>(null);
  const emojiRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const clockRef = useRef<HTMLDivElement>(null);
  const numberRingRef = useRef<HTMLDivElement>(null);
  const memoryRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Birthday memories/phrases that appear during countdown
  const birthdayMemories = [
    "First steps into 20 ✨",
    "New adventures await 🚀",
    "Making beautiful memories 🌸",
    "Growing wiser every year 📚",
    "Spreading joy and light 💫",
    "Chasing dreams fearlessly 🌟",
    "Creating your own magic ✨",
    "The best is yet to come 🌈"
  ];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !started) startCountdown();
    };
    window.addEventListener('keydown', handleKeyPress);
    
    if (!settings.reducedMotion && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: 'power3.out' }
      );
    }
    
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [started]);

  const createSparkleEffect = (element: HTMLElement, count: number = 12) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'fixed text-2xl pointer-events-none z-50 animate-ping';
        const rect = element.getBoundingClientRect();
        sparkle.style.left = `${rect.left + Math.random() * rect.width}px`;
        sparkle.style.top = `${rect.top + Math.random() * rect.height}px`;
        document.body.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 150,
          y: (Math.random() - 0.5) * 150 - 80,
          opacity: 0,
          scale: 0,
          rotation: 360,
          duration: 1.5,
          ease: 'power4.out',
          onComplete: () => sparkle.remove(),
        });
      }, i * 80);
    }
  };

  const createBirthdayMemory = () => {
    if (memories.length >= 4) return;
    
    const newMemory = birthdayMemories[memories.length % birthdayMemories.length];
    setMemories(prev => [...prev, newMemory]);
    
    // Animate memory appearance
    setTimeout(() => {
      const lastMemory = memoryRefs.current[memories.length];
      if (lastMemory) {
        gsap.fromTo(lastMemory,
          { opacity: 0, y: 20, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
        );
      }
    }, 100);
  };

  const startCountdown = () => {
    if (started) return;
    setStarted(true);
    setMemories([]); // Clear previous memories

    if (!settings.reducedMotion && buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.9,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'elastic.out(1.5)',
      });
      
      createSparkleEffect(buttonRef.current, 15);
    }

    // Start the clock animation
    if (clockRef.current && !settings.reducedMotion) {
      gsap.to(clockRef.current.querySelector('.clock-hand-hour'), {
        rotation: 360,
        duration: 20,
        ease: 'linear',
        repeat: -1
      });
      gsap.to(clockRef.current.querySelector('.clock-hand-minute'), {
        rotation: 360,
        duration: 10,
        ease: 'linear',
        repeat: -1
      });
      gsap.to(clockRef.current.querySelector('.clock-hand-second'), {
        rotation: 360,
        duration: 5,
        ease: 'linear',
        repeat: -1
      });
    }

    let count = 1;
    const interval = setInterval(() => {
      setCountdown(count);

      // Every 3-4 counts, show a birthday memory
      if (count % Math.floor(Math.random() * 2 + 3) === 0) {
        createBirthdayMemory();
      }

      if (!settings.reducedMotion) {
        // Animate number ring rotation
        if (numberRingRef.current) {
          const rotation = -(count - 1) * (360 / 20);
          gsap.to(numberRingRef.current, {
            rotation: rotation,
            duration: 0.7,
            ease: 'power2.out'
          });
        }

        // Enhanced countdown animation with 3D effect
        if (countdownRef.current) {
          gsap.fromTo(countdownRef.current,
            { 
              scale: 0.6, 
              opacity: 0.5,
              filter: 'blur(10px)',
              rotationX: -15,
              z: -50
            },
            {
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              rotationX: 0,
              z: 0,
              duration: 0.5,
              ease: 'back.out(2)',
            }
          );

          // Color shift based on count
          const colors = [
            '#f0abfc', '#c4b5fd', '#93c5fd', '#86efac', '#fde68a', '#fca5a5'
          ];
          const color = colors[(count - 1) % colors.length];
          
          gsap.to(countdownRef.current, {
            textShadow: `0 0 60px ${color}80, 0 0 120px ${color}40`,
            duration: 0.4,
            yoyo: true,
            repeat: 1
          });
        }

        // Pulse the background gradient
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            background: `linear-gradient(135deg, #000000 0%, #1e1b4b ${30 + count * 2}%, #6d28d9 ${50 + count * 2}%, #be185d 100%)`,
            duration: 0.8,
            ease: 'power2.inOut',
          });
        }
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

          // Final celebration animations...
          // ... (keep existing celebration animations)

          setTimeout(() => {
            navigateTo('room');
          }, 6000);
        }, 800);
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
        <div className="absolute inset-0 opacity-40">
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
        
        {/* Dynamic horizon glow */}
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

      {/* Celebration Confetti */}
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

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl w-full">
        {!started && (
          <div className="mb-12 sm:mb-16 space-y-10 sm:space-y-14">
            <div className="space-y-6 sm:space-y-8">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 
                              blur-2xl rounded-full opacity-50" />
                <p className="relative text-3xl sm:text-4xl md:text-5xl text-white/95 mb-8 sm:mb-12 font-elegant tracking-wider
                            leading-relaxed drop-shadow-[0_0_40px_rgba(168,85,247,0.7)]">
                  The Countdown to 20 Begins
                </p>
              </div>
              
              {/* Animated clock preview */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-pink-500/30 to-purple-500/30 
                              blur-2xl rounded-full animate-pulse" style={{animationDuration: '3s'}} />
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80
                              rounded-full border-4 border-purple-500/30
                              bg-gradient-to-br from-purple-900/20 to-pink-900/20
                              backdrop-blur-sm flex items-center justify-center
                              shadow-[0_0_60px_rgba(168,85,247,0.4)]">
                  <div className="text-5xl sm:text-6xl md:text-7xl text-white/90
                                animate-soft-bounce font-bold">
                    20
                  </div>
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
                style={{
                  backgroundSize: '200% 100%',
                  animation: isHovering ? 'gradientShift 2s ease infinite' : 'none'
                }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] 
                               flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  Begin Countdown
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
            {/* Enhanced Countdown Display */}
            <div className="relative space-y-6 sm:space-y-8">
              {/* Animated orb background */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                              w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96
                              bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 
                              rounded-full blur-3xl animate-pulse" style={{animationDuration: '2s'}} />
              </div>
              
              {/* Animated Clock Circle with Rotating Numbers */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mx-auto mb-6">
                {/* Outer ring with numbers */}
                <div 
                  ref={numberRingRef}
                  className="absolute inset-0 rounded-full border-2 border-purple-500/30 
                            transform-gpu will-change-transform"
                >
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2
                                text-sm sm:text-base font-bold transition-all duration-300
                                ${countdown === i + 1 ? 'text-yellow-300 scale-125' : 'text-purple-300/60'}`}
                      style={{
                        transform: `rotate(${i * (360 / 20)}deg) translateY(-120px) rotate(-${i * (360 / 20)}deg)`
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Clock face */}
                <div 
                  ref={clockRef}
                  className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-900/40 to-pink-900/40
                            backdrop-blur-sm border border-purple-500/20 flex items-center justify-center"
                >
                  {/* Clock center */}
                  <div className="absolute w-4 h-4 bg-gradient-to-br from-yellow-300 to-pink-400 rounded-full z-10" />
                  
                  {/* Clock hands */}
                  <div className="clock-hand-hour absolute w-1 h-16 bg-gradient-to-t from-purple-400 to-pink-400 
                                rounded-t-full origin-bottom transform -translate-y-8" />
                  <div className="clock-hand-minute absolute w-0.5 h-20 bg-gradient-to-t from-yellow-300 to-orange-400 
                                rounded-t-full origin-bottom transform -translate-y-10" />
                  <div className="clock-hand-second absolute w-0.3 h-24 bg-gradient-to-t from-pink-400 to-rose-400 
                                rounded-t-full origin-bottom transform -translate-y-12" />
                  
                  {/* Hour markers */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-3 bg-purple-400/50 rounded-full"
                      style={{
                        transform: `rotate(${i * 30}deg) translateY(-50px)`,
                        transformOrigin: 'center 60px'
                      }}
                    />
                  ))}
                </div>

                {/* Main Countdown Number */}
                <div
                  ref={countdownRef}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-[5rem] sm:text-[7rem] md:text-[9rem] font-display font-black 
                               text-transparent bg-clip-text
                               bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-400
                               drop-shadow-[0_0_80px_rgba(236,72,153,0.8)]
                               animate-pulse-glow"
                  >
                    {countdown}
                  </div>
                </div>
              </div>

              {/* Progress Rings */}
              <div className="relative w-56 sm:w-72 md:w-80 mx-auto">
                <div className="relative h-3 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 
                              rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full 
                             transition-all duration-800 shadow-lg shadow-pink-500/30"
                    style={{ width: `${(countdown / 20) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-purple-300/70">1</span>
                  <span className="text-xs text-purple-300/70">20</span>
                </div>
              </div>

              {/* Birthday Memories Display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {memories.map((memory, index) => (
                  <div
                    key={index}
                    ref={el => memoryRefs.current[index] = el}
                    className="px-3 py-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 
                              backdrop-blur-sm rounded-lg border border-purple-500/20
                              text-xs sm:text-sm text-purple-200 text-center
                              shadow-lg shadow-purple-900/20"
                  >
                    {memory}
                  </div>
                ))}
              </div>

              {/* Countdown Status */}
              <div className="flex items-center justify-center gap-4">
                {countdown < 10 && <Cake className="w-5 h-5 text-yellow-300/80 animate-bounce" />}
                {countdown >= 10 && countdown < 15 && <Star className="w-5 h-5 text-yellow-300/80 animate-spin-slow" />}
                {countdown >= 15 && <Heart className="w-5 h-5 text-pink-400/80 animate-pulse" />}
                <p className="text-base sm:text-lg text-purple-200/80 font-elegant tracking-wide
                            drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  {countdown < 7 ? 'Starting the journey... 🌟' : 
                   countdown < 12 ? 'Time is flying! ✨' : 
                   countdown < 17 ? 'Almost at the peak! 🚀' : 
                   'Final moments! 🎉'}
                </p>
              </div>

              {/* Time Visualization */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-1">
                    {20 - countdown}
                  </div>
                  <div className="text-xs text-purple-300/70">Steps Left</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-pink-300 mb-1">
                    {countdown}
                  </div>
                  <div className="text-xs text-purple-300/70">Moments Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-300 mb-1">
                    {Math.round((countdown / 20) * 100)}%
                  </div>
                  <div className="text-xs text-purple-300/70">Journey Complete</div>
                </div>
              </div>
            </div>
          </>
        )}

        {showFinale && (
          // ... (keep existing finale code)
          <div ref={titleRef} className="space-y-8 sm:space-y-12 md:space-y-16">
            {/* Celebration content remains the same */}
          </div>
        )}
      </div>

      {/* CSS Animations - Add new animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes number-glow {
          0%, 100% { 
            text-shadow: 0 0 20px currentColor, 0 0 40px currentColor; 
          }
          50% { 
            text-shadow: 0 0 40px currentColor, 0 0 80px currentColor; 
          }
        }
        
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-number-glow {
          animation: number-glow 2s ease-in-out infinite;
        }
        
        .animate-ring-pulse {
          animation: ring-pulse 2s ease-in-out infinite;
        }
        
        /* Existing animations remain the same */
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes soft-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        
        /* ... other existing animations ... */
        
        .transform-gpu {
          transform-style: preserve-3d;
        }
        
        .will-change-transform {
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
