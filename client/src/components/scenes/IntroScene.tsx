import { useEffect, useRef } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import { Button } from '../ui/button';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';

export function IntroScene() {
  const { navigateTo, settings } = useSceneStore();
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  /* ===============================
     INIT + DESKTOP KEYBOARD
     =============================== */
  useEffect(() => {
    audioManager.init();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        navigateTo('midnight');
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    if (!settings.reducedMotion) {
      const tl = gsap.timeline();

      if (titleRef.current) {
        tl.from(titleRef.current, {
          opacity: 0,
          y: -60,
          scale: 0.95,
          duration: 1.4,
          ease: 'power3.out',
        });
      }

      if (subtitleRef.current) {
        tl.from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: 'expo.out',
          },
          '-=0.8'
        );
      }

      if (buttonRef.current) {
        tl.from(
          buttonRef.current,
          {
            opacity: 0,
            scale: 0.95,
            y: 12,
            duration: 0.8,
            ease: 'back.out(1.4)',
          },
          '-=0.5'
        );
      }

      return () => {
        tl.kill();
        window.removeEventListener('keydown', handleKeyPress);
      };
    }

    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigateTo, settings.reducedMotion]);

  /* ===============================
     MOBILE SWIPE ONLY (NO AUTO CLICK)
     =============================== */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;

      const deltaY = touchStartY.current - e.changedTouches[0].clientY;

      // Swipe UP only
      if (deltaY > 70) {
        navigateTo('midnight');
      }

      touchStartY.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [navigateTo]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-900"
    >
      {/* Particles only on desktop */}
      <div className="hidden md:block">
        <AdaptiveParticleSystem count={200} color="#e0e7ff" speed={0.4} size={2} />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <div
          ref={titleRef}
          className="mb-6"
          style={{
            textShadow:
              '0 0 32px rgba(255,255,255,0.4), 0 0 64px rgba(147,51,234,0.35)',
          }}
        >
          {/* FORCE SOLID TEXT ON MOBILE */}
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-bold text-white md:text-transparent md:bg-clip-text md:bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400 tracking-tight">
            T W E N T Y
          </h1>
        </div>

        <div ref={subtitleRef} className="mb-12">
          <p className="text-base md:text-3xl lg:text-4xl text-purple-200 font-cursive">
            An experience for your special day (❁´◡`❁)
          </p>
        </div>

        {/* BUTTON IS NOW THE PRIMARY MOBILE ACTION */}
        <Button
          ref={buttonRef}
          onClick={() => navigateTo('midnight')}
          size="lg"
          className="w-full md:w-auto max-w-xs mx-auto text-base md:text-xl px-8 md:px-12 py-5 md:py-8 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white border border-white/30 shadow-xl rounded-2xl"
        >
          🌺 Enter the Experience 🌺
        </Button>

        {/* HINTS */}
        <p className="mt-6 md:hidden text-sm text-purple-300/80">
          Swipe up or tap the button
        </p>

        <p className="mt-8 hidden md:block text-sm text-purple-300/70">
          Press Enter or Esc to continue
        </p>
      </div>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(147,51,234,0.4) 0%, transparent 60%), radial-gradient(circle at 50% 70%, rgba(236,72,153,0.3) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
