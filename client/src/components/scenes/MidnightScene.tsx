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
  const countdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

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
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Ambient depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40" />
      <div className="absolute inset-0 backdrop-blur-[1.5px]" />

      {/* Soft radial depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.18),transparent_60%)]" />
      </div>

      <AdaptiveParticleSystem
        count={window.innerWidth < 640 ? 260 : 500}
        color={countdown ? '#facc15' : '#ffffff'}
        speed={countdown ? 0.7 : 0.25}
        size={3}
      />

      {showFinale && (
        <Confetti recycle={false} numberOfPieces={220} gravity={0.12} />
      )}

      <div className="relative z-10 text-center px-6 max-w-3xl">
        {!started && (
          <div className="mb-16">
            <p className="text-3xl md:text-4xl text-white/90 mb-12 font-elegant tracking-wide drop-shadow-[0_0_18px_rgba(168,85,247,0.45)]">
              Ready to begin the countdown?
            </p>

            <div className="text-6xl mb-12 opacity-90">⏰</div>

            <button
              onClick={startCountdown}
              className="px-10 sm:px-12 py-5 sm:py-6 text-xl sm:text-2xl font-elegant font-semibold
                         bg-gradient-to-r from-purple-600 to-pink-500
                         hover:from-purple-500 hover:to-pink-400
                         text-white rounded-2xl shadow-xl
                         transition-all duration-300
                         hover:scale-[1.04] hover:-translate-y-0.5"
              aria-label="Start countdown"
            >
              Start Countdown
            </button>

            <p className="mt-6 text-sm text-purple-300/70 font-elegant">
              or press <kbd className="px-1">Enter</kbd>
            </p>
          </div>
        )}

        {countdown && !showFinale && (
          <>
            {/* Midnight Orb */}
            <div className="relative mx-auto mb-16 w-44 h-44 sm:w-52 sm:h-52">
              {/* Outer aura */}
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-60"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(236,72,153,0.55), transparent 65%)',
                  animation: 'auraPulse 5s ease-in-out infinite',
                }}
              />

              {/* Inner orb */}
              <div
                className="relative w-full h-full rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, #f5d0fe, #a855f7 45%, #581c87 75%)',
                  boxShadow:
                    '0 0 90px rgba(168,85,247,0.65), inset 0 0 35px rgba(0,0,0,0.45)',
                  animation: 'orbFloat 4s ease-in-out infinite',
                }}
              />
            </div>

            <div
              ref={countdownRef}
              className="text-7xl sm:text-8xl md:text-9xl font-display font-bold text-white mb-10
                         drop-shadow-[0_0_40px_rgba(236,72,153,0.6)]"
            >
              {countdown}
            </div>

            <div className="text-xl sm:text-2xl text-purple-300/80 font-elegant tracking-widest">
              {Math.floor(23 + countdown / 20)}:
              {String(Math.floor((countdown / 20) * 60) % 60).padStart(2, '0')}:
              {String(Math.floor((countdown / 20) * 3600) % 60).padStart(2, '0')}
            </div>
          </>
        )}

        {showFinale && (
          <div ref={titleRef}>
            <div className="text-7xl mb-10 opacity-95">🎉🎂🎈</div>

            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-display font-bold
                         text-transparent bg-clip-text
                         bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400
                         mb-8
                         drop-shadow-[0_0_45px_rgba(236,72,153,0.7)]"
            >
              <span className="font-elegant italic">
                AFRAH GHAZI IS 20!!!!!!!!
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-white/90 mt-6 font-elegant drop-shadow-[0_0_20px_rgba(168,85,247,0.45)]">
              Pop the sugarcane juice champagne off and let the celebrations begin 🍾✨
            </p>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes orbFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.03);
          }
        }

        @keyframes auraPulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
