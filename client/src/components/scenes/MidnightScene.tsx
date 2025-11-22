import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { ParticleSystem } from '../ParticleSystem';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import Confetti from 'react-confetti';

export function MidnightScene() {
  const { navigateTo, settings } = useSceneStore();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [started, setStarted] = useState(false);
  const earthRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !started) {
        startCountdown();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [started]);

  const startCountdown = () => {
    setStarted(true);
    
    let count = 1;
    const interval = setInterval(() => {
      setCountdown(count);
      
      if (!settings.reducedMotion && countdownRef.current) {
        gsap.fromTo(countdownRef.current,
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
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
          
          setTimeout(() => {
            navigateTo('room');
          }, 5000);
        }, 500);
      }

      count++;
    }, 800);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (!settings.reducedMotion && earthRef.current) {
      gsap.to(earthRef.current, {
        rotation: 360,
        duration: countdown && countdown > 18 ? 2 : 20,
        ease: 'none',
        repeat: -1,
      });
    }
  }, [countdown, settings.reducedMotion]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ParticleSystem count={200} color={countdown ? '#fbbf24' : '#ffffff'} speed={countdown ? 0.8 : 0.3} size={4} />

      {showFinale && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="relative z-10 text-center">
        {!started && (
          <div className="mb-12">
            <p className="text-3xl text-white/80 mb-8">Ready to begin the countdown?</p>
            <div className="text-6xl mb-8 animate-pulse">⏰</div>
            <button
              onClick={startCountdown}
              className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-2xl transition-all hover:scale-105"
              aria-label="Start countdown"
            >
              Start Countdown
            </button>
            <p className="mt-4 text-sm text-purple-300/70">Or press <kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd></p>
          </div>
        )}

        {countdown && !showFinale && (
          <>
            <div
              ref={earthRef}
              className="mx-auto mb-12 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-green-500 shadow-2xl"
              style={{
                boxShadow: '0 0 60px rgba(59, 130, 246, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.3)',
              }}
            />
            
            <div ref={countdownRef} className="text-9xl font-bold text-white mb-8">
              {countdown}
            </div>

            <div className="text-2xl text-purple-300">
              {Math.floor(23 + (countdown / 20))}:{String(Math.floor((countdown / 20) * 60) % 60).padStart(2, '0')}:{String(Math.floor((countdown / 20) * 3600) % 60).padStart(2, '0')}
            </div>
          </>
        )}

        {showFinale && (
          <div ref={titleRef}>
            <div className="text-8xl mb-8">🎉🎂🎈</div>
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-4">
              HAPPY 20th, AFRAH!
            </h1>
            <p className="text-3xl text-white/90 mt-8">
              Let the celebration begin! 🎊
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
