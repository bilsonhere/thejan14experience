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

  useEffect(() => {
    audioManager.init();

    if (settings.reducedMotion) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          navigateTo('midnight');
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }

    const tl = gsap.timeline();

    if (titleRef.current) {
      tl.from(titleRef.current, {
        opacity: 0,
        y: -60,
        scale: 0.9,
        duration: 1.4,
        ease: 'power3.out',
      });
    }

    if (subtitleRef.current) {
      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: 'expo.out',
      }, '-=0.8');
    }

    if (buttonRef.current) {
      tl.from(buttonRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 16,
        duration: 0.8,
        ease: 'back.out(1.4)',
      }, '-=0.5');
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        navigateTo('midnight');
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      tl.kill();
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [navigateTo, settings.reducedMotion]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-900">
      <AdaptiveParticleSystem count={200} color="#e0e7ff" speed={0.4} size={2} />

      <div className="relative z-10 text-center px-6 max-w-6xl">
        <div
          ref={titleRef}
          className="mb-8"
          style={{
            textShadow: '0 0 32px rgba(255, 255, 255, 0.5), 0 0 64px rgba(147, 51, 234, 0.4), 0 0 96px rgba(147, 51, 234, 0.25)',
          }}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400 mb-2 tracking-tight">
            T W E N T Y 
          </h1>
        </div>

        <div ref={subtitleRef} className="mb-20">
          <p className="text-xl md:text-3xl lg:text-4xl text-purple-200/90 font-cursive font-medium tracking-wide">
            An experience for your special day(❁´◡`❁)
          </p>
        </div>

        <Button
          ref={buttonRef}
          onClick={() => navigateTo('midnight')}
          size="lg"
          className="text-lg md:text-xl px-12 py-8 bg-gradient-to-r from-purple-600/95 via-pink-600/95 to-purple-600/95 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white border-2 border-white/30 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 backdrop-blur-soft font-elegant font-semibold tracking-wide rounded-2xl"
          aria-label="Enter the Birthday House"
        >
          🌺Enter the Experience🌺
        </Button>

        <p className="mt-12 text-sm md:text-base text-purple-300/70 font-elegant">
          Press <kbd>Enter</kbd> or <kbd>Esc</kbd> to continue
        </p>
      </div>

      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 60%), radial-gradient(circle at 50% 70%, rgba(236, 72, 153, 0.3) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
