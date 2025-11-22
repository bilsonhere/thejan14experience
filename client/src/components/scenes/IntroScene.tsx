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

    if (settings.reducedMotion) return;

    const tl = gsap.timeline();

    tl.from(titleRef.current, {
      opacity: 0,
      y: -50,
      scale: 0.8,
      duration: 1.5,
      ease: 'back.out(1.7)',
    })
    .from(subtitleRef.current, {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.8')
    .from(buttonRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
    }, '-=0.5');

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigateTo('midnight');
      } else if (e.key === 'Enter') {
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
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AdaptiveParticleSystem count={150} color="#ffffff" speed={0.3} size={3} />
      
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div
          ref={titleRef}
          className="mb-8"
          style={{
            textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(147, 51, 234, 0.5)',
          }}
        >
          <h1 className="text-7xl md:text-9xl font-bold text-white mb-4 tracking-wider">
            AFRAH20
          </h1>
        </div>

        <div ref={subtitleRef}>
          <p className="text-2xl md:text-4xl text-purple-200 mb-12 font-light tracking-wide">
            A Night For Afrah
          </p>
        </div>

        <Button
          ref={buttonRef}
          onClick={() => navigateTo('midnight')}
          size="lg"
          className="text-xl px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-2 border-white/30 shadow-2xl backdrop-blur-sm"
          aria-label="Enter the Birthday House"
        >
          Enter the Birthday House
        </Button>

        <p className="mt-8 text-sm text-purple-300/70">
          Press <kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd> or{' '}
          <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd> to skip
        </p>
      </div>

      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
