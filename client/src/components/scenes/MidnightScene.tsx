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
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
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
              { y: 24, opacity: 0 },
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
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-purple-950 to-black">
      {/* Dark vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/60" />

      {/* Horizon glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[45%]
                        bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.22),transparent_70%)]" />
      </div>

      <AdaptiveParticleSystem
        count={window.innerWidth < 640 ? 220 : 420}
        color={countdown ? '#e9d5ff' : '#ffffff'}
        speed={countdown ? 0.55 : 0.2}
        size={2}
      />

      {showFinale && (
        <Confetti recycle={false} numberOfPieces={200} gravity={0.11} />
      )}

      <div className="relative z-10 text-center px-6 max-w-3xl">
        {!started && (
          <div className="mb-16">
            <p className="text-3xl md:text-4xl text-white/90 mb-12 font-elegant tracking-wide
                          drop-shadow-[0_0_24px_rgba(168,85,247,0.45)]">
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
            {/* Countdown Number – HERO */}
            <div
              ref={countdownRef}
              className="text-[7rem] sm:text-[9rem] md:text-[11rem]
                         font-display font-bold text-white mb-10
                         tracking-tight
                         drop-shadow-[0_0_60px_rgba(236,72,153,0.6)]"
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
                         drop-shadow-[0_0_55px_rgba(236,72,153,0.75)]"
            >
              <span className="font-elegant italic">
                AFRAH GHAZI IS 20!!!!!!!!
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-white/90 mt-6 font-elegant
                          drop-shadow-[0_0_24px_rgba(168,85,247,0.45)]">
              Pop the sugarcane juice champagne off and let the celebrations begin 🍾✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
