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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !started) startCountdown();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [started]);

  const startCountdown = () => {
    if (started) return;
    setStarted(true);

    if (!settings.reducedMotion && buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
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
        gsap.fromTo(
          countdownRef.current,
          { scale: 0.85, opacity: 0, filter: 'blur(6px)' },
          {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.35,
            ease: 'power3.out',
          }
        );
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
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
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
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden 
                    bg-gradient-to-br from-gray-900 via-purple-900/40 to-gray-900">
      
      {/* Enhanced background with subtle depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40" />
      
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 opacity-[0.15]">
        <div className="absolute top-0 left-0 w-full h-full 
                        bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] 
                        from-purple-900 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 
                        bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] 
                        from-pink-800/30 via-transparent to-transparent" />
      </div>

      {/* Dynamic horizon glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[130%] h-[45%]
                        bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.18),transparent_70%)]" />
      </div>

      {/* Subtle noise texture for depth */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')] 
                      opacity-20" />

      <AdaptiveParticleSystem
        count={500}
        color={countdown ? '#facc15' : '#ffffff'}
        speed={countdown ? 0.7 : 0.25}
        size={countdown ? 3.5 : 3}
      />

      {showFinale && (
        <Confetti
          recycle={false}
          numberOfPieces={220}
          gravity={0.12}
          colors={['#fbbf24', '#ec4899', '#a855f7', '#60a5fa']}
        />
      )}

      <div className="relative z-10 text-center px-6 max-w-3xl">
        {!started && (
          <div className="mb-16 space-y-14">
            <div className="space-y-8">
              <p className="text-4xl md:text-5xl text-white/92 mb-12 font-elegant tracking-wider
                            leading-relaxed drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                Are You Ready?
              </p>
              
              {/* Enhanced clock emoji with subtle animation */}
              <div className="text-7xl mb-12 opacity-95 
                            drop-shadow-[0_0_25px_rgba(251,191,36,0.4)]
                            animate-soft-bounce">
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
                           hover:scale-[1.03] hover:-translate-y-0.5
                           hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]
                           group overflow-hidden"
                aria-label="Start countdown"
                style={{
                  backgroundSize: '200% 100%',
                  animation: isHovering ? 'gradientShift 2s ease infinite' : 'none'
                }}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Button text with enhanced shadow */}
                <span className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  Let's go!!
                </span>
                
                {/* Corner accents */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-300/50 rounded-tl-lg" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-pink-300/50 rounded-tr-lg" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-300/50 rounded-bl-lg" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-pink-300/50 rounded-br-lg" />
              </button>

              <p className="text-lg text-purple-300/80 font-elegant tracking-wide
                          drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
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
            {/* Enhanced Countdown Display */}
            <div className="relative">
              {/* Glow backdrop for countdown number */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 
                            blur-3xl -z-10 scale-110" />
              
              {/* Countdown Number */}
              <div
                ref={countdownRef}
                className="text-[8rem] sm:text-[10rem] md:text-[12rem]
                           font-display font-bold text-white mb-12
                           tracking-tighter leading-none
                           drop-shadow-[0_0_70px_rgba(236,72,153,0.8)]"
                style={{
                  textShadow: '0 0 60px rgba(236,72,153,0.6), 0 0 90px rgba(168,85,247,0.4)'
                }}
              >
                {countdown}
              </div>
              
              {/* Enhanced progress indicator */}
              <div className="w-64 sm:w-80 h-2 bg-purple-900/30 rounded-full mx-auto mb-12 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-800"
                  style={{ width: `${(countdown / 20) * 100}%` }}
                />
              </div>

              {/* Time display with enhanced styling */}
              <div className="text-2xl sm:text-3xl text-purple-200/90 font-elegant tracking-widest
                            space-x-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                <span className="bg-purple-900/40 px-5 py-3 rounded-xl">
                  {Math.floor(23 + countdown / 20)}:
                </span>
                <span className="bg-pink-900/40 px-5 py-3 rounded-xl">
                  {String(Math.floor((countdown / 20) * 60) % 60).padStart(2, '0')}:
                </span>
                <span className="bg-purple-900/40 px-5 py-3 rounded-xl">
                  {String(Math.floor((countdown / 20) * 3600) % 60).padStart(2, '0')}
                </span>
              </div>
              
              {/* Subtle indicator text */}
              <p className="mt-8 text-lg text-purple-300/70 font-elegant tracking-wide
                          drop-shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                Prepare yourself... ✨
              </p>
            </div>
          </>
        )}

        {showFinale && (
          <div ref={titleRef} className="space-y-12">
            {/* Celebratory emojis with subtle spacing */}
            <div className="flex justify-center gap-8 mb-12">
              <span className="text-8xl opacity-95 animate-float-1">🎉</span>
              <span className="text-8xl opacity-95 animate-float-2">🎂</span>
              <span className="text-8xl opacity-95 animate-float-3">🎈</span>
            </div>

            {/* Main title with enhanced effects */}
            <div className="relative">
              {/* Title glow backdrop */}
              <div className="absolute inset-0 text-5xl sm:text-6xl md:text-7xl font-display font-bold
                            text-transparent bg-clip-text
                            bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-500/20
                            blur-xl -z-10 scale-110">
                <span className="font-elegant italic">
                  AFRAH GHAZI IS 20!!!!!!!!
                </span>
              </div>
              
              <h1
                className="text-5xl sm:text-6xl md:text-7xl font-display font-bold
                           text-transparent bg-clip-text
                           bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500
                           mb-10 leading-tight
                           drop-shadow-[0_0_50px_rgba(236,72,153,0.8)]"
              >
                <span className="font-elegant italic">
                  AFRAH GHAZI IS 20!!!!!!!!
                </span>
              </h1>
            </div>

            {/* Subtitle with enhanced styling */}
            <p className="text-2xl md:text-3xl text-white/95 mt-8 font-elegant leading-relaxed
                         drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]
                         max-w-2xl mx-auto">
              Pop the sugarcane juice champagne off and let the celebrations begin 🍾✨
            </p>
            
            {/* Countdown to next scene */}
            <div className="mt-14 p-5 bg-gradient-to-r from-purple-900/40 to-pink-900/40 
                          rounded-2xl border border-purple-700/30 backdrop-blur-sm
                          animate-pulse" style={{ animationDuration: '1.5s' }}>
              <p className="text-xl text-purple-200/90 font-elegant">
                The experience will begin soon...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes soft-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        
        .animate-soft-bounce {
          animation: soft-bounce 3s ease-in-out infinite;
        }
        
        .animate-float-1 { animation: float1 4s ease-in-out infinite; }
        .animate-float-2 { animation: float2 5s ease-in-out infinite; }
        .animate-float-3 { animation: float3 3.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
