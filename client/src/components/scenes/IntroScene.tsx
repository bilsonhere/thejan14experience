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
  const decorationRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      // Animate decorative elements
      decorationRefs.current.forEach((ref, i) => {
        if (ref) {
          gsap.fromTo(ref,
            { opacity: 0, scale: 0.5, rotation: -45 },
            {
              opacity: 0.4,
              scale: 1,
              rotation: 0,
              duration: 1.2,
              ease: 'elastic.out(1, 0.5)',
              delay: i * 0.2,
            }
          );
        }
      });

      if (titleRef.current) {
        tl.from(titleRef.current, {
          opacity: 0,
          y: -80,
          scale: 0.8,
          rotationX: -15,
          duration: 1.6,
          ease: 'power4.out',
          clearProps: "all"
        });
      }

      if (subtitleRef.current) {
        tl.from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 40,
            scale: 0.9,
            duration: 1.2,
            ease: 'expo.out',
          },
          '-=0.9'
        );
      }

      if (buttonRef.current) {
        tl.from(
          buttonRef.current,
          {
            opacity: 0,
            scale: 0.85,
            y: 30,
            duration: 1,
            ease: 'back.out(1.7)',
          },
          '-=0.6'
        );
      }

      // Floating animation for title
      if (titleRef.current && !settings.reducedMotion) {
        gsap.to(titleRef.current, {
          y: -10,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2,
        });
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
      className="relative w-full h-full flex items-center justify-center overflow-hidden 
                 bg-gradient-to-br from-gray-900 via-purple-950/90 to-pink-950/90"
    >
      {/* Enhanced Background Layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/80 to-fuchsia-900/90" />
        
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full 
                          bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] 
                          from-purple-900 via-transparent to-transparent" />
          <div className="absolute bottom-0 right-0 w-full h-full 
                          bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] 
                          from-pink-900 via-transparent to-transparent" />
        </div>
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMyIvPjwvc3ZnPg==')] 
                        opacity-15" />
      </div>

      {/* Enhanced ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] 
                        bg-gradient-to-r from-purple-600/20 to-pink-600/20 
                        rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[35%] h-[35%] 
                        bg-gradient-to-r from-pink-600/15 to-purple-600/15 
                        rounded-full blur-3xl" />
      </div>

      {/* Particles for all devices with adjusted settings */}
      <AdaptiveParticleSystem 
        count={window.innerWidth < 768 ? 120 : 250} 
        color="#e0e7ff" 
        speed={0.5} 
        size={window.innerWidth < 768 ? 1.5 : 2}
        className="absolute inset-0"
      />

      {/* Decorative floating elements */}
      <div className="absolute top-8 left-8 text-3xl sm:text-4xl opacity-30 animate-float-slow">✨</div>
      <div className="absolute top-12 right-10 text-2xl sm:text-3xl opacity-20 animate-float-slow" style={{animationDelay: '1s'}}>🌺</div>
      <div className="absolute bottom-16 left-10 text-2xl sm:text-3xl opacity-20 animate-float-slow" style={{animationDelay: '2s'}}>🎉</div>
      <div className="absolute bottom-20 right-8 text-3xl sm:text-4xl opacity-30 animate-float-slow" style={{animationDelay: '0.5s'}}>🎂</div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl w-full">
        {/* Title Container */}
        <div className="relative mb-6 sm:mb-8 md:mb-10">
          {/* Title Glow Backdrop */}
          <div className="absolute inset-0 blur-3xl opacity-60 scale-110">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 via-pink-500/40 to-purple-500/40 rounded-full" />
          </div>
          
          {/* Main Title - FIXED for mobile visibility */}
          <div
            ref={titleRef}
            className="relative"
          >
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 
                          font-display font-bold tracking-tight leading-tight
                          text-white md:text-transparent md:bg-clip-text 
                          md:bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400
                          drop-shadow-[0_2px_30px_rgba(255,255,255,0.3)]
                          md:drop-shadow-[0_0_80px_rgba(168,85,247,0.6)]">
              T W E N T Y
            </h1>
            
            {/* Subtitle Glow Effect */}
            <div className="absolute -inset-4 -z-10 blur-2xl opacity-30 
                          bg-gradient-to-r from-yellow-400/30 via-pink-500/30 to-purple-500/30 
                          rounded-full" />
          </div>
          
          {/* Subtle border effect for title */}
          <div className="h-px w-48 sm:w-64 md:w-80 mx-auto mt-6 sm:mt-8 
                        bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="mb-10 sm:mb-14 md:mb-16">
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 
                       text-purple-100/90 font-cursive font-medium
                       drop-shadow-[0_2px_15px_rgba(168,85,247,0.4)]
                       max-w-3xl mx-auto px-4">
            An experience for your special day (❁´◡`❁)
          </p>
          
          {/* Decorative line under subtitle */}
          <div className="h-0.5 w-32 sm:w-40 md:w-48 mx-auto mt-4 sm:mt-6
                        bg-gradient-to-r from-pink-400/40 via-purple-400/60 to-pink-400/40 
                        rounded-full" />
        </div>

        {/* Enhanced Button */}
        <div className="relative">
          <Button
            ref={buttonRef}
            onClick={() => navigateTo('midnight')}
            size="lg"
            className="relative px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-8 
                       text-base sm:text-lg md:text-xl lg:text-2xl
                       bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600
                       hover:from-purple-500 hover:via-pink-500 hover:to-purple-500
                       text-white border-2 border-white/40
                       shadow-2xl hover:shadow-3xl hover:shadow-pink-500/40
                       rounded-2xl md:rounded-3xl
                       transition-all duration-300
                       hover:scale-[1.03] active:scale-95
                       w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto
                       group overflow-hidden"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl 
                          bg-gradient-to-r from-transparent via-white/20 to-transparent
                          -translate-x-full group-hover:translate-x-full 
                          transition-transform duration-1000" />
            
            {/* Button text with decorative flowers */}
            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
              <span className="text-lg sm:text-xl md:text-2xl transition-transform duration-300 group-hover:rotate-12">🌺</span>
              <span className="font-semibold">Enter the Experience</span>
              <span className="text-lg sm:text-xl md:text-2xl transition-transform duration-300 group-hover:-rotate-12">🌺</span>
            </span>
          </Button>
          
          {/* Button glow effect */}
          <div className="absolute inset-0 -z-10 blur-xl opacity-50 
                        bg-gradient-to-r from-purple-600/50 via-pink-600/50 to-purple-600/50
                        rounded-2xl md:rounded-3xl scale-105" />
        </div>

        {/* Instructions */}
        <div className="mt-8 sm:mt-10 md:mt-12 space-y-4">
          {/* Mobile Instructions */}
          <p className="md:hidden text-sm sm:text-base text-purple-200/80 font-elegant
                      drop-shadow-[0_1px_8px_rgba(168,85,247,0.3)]">
            👆 Swipe up or tap the button above
          </p>
          
          {/* Desktop Instructions */}
          <p className="hidden md:block text-sm md:text-base text-purple-200/70 font-elegant
                      drop-shadow-[0_1px_8px_rgba(168,85,247,0.3)]">
            Press <kbd className="px-2 py-1 mx-1 bg-purple-800/50 text-purple-100 rounded border border-purple-700/50">Enter</kbd> 
            or <kbd className="px-2 py-1 mx-1 bg-purple-800/50 text-purple-100 rounded border border-purple-700/50">Esc</kbd> to continue
          </p>
          
          {/* Decorative separator */}
          <div className="flex items-center justify-center gap-4 opacity-60">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-400/50" />
            <div className="text-sm text-purple-300/50">✨</div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-pink-400/50" />
          </div>
        </div>
      </div>

      {/* Bottom gradient for mobile */}
      <div className="sm:hidden absolute bottom-0 left-0 right-0 h-32 
                      bg-gradient-to-t from-black/70 via-transparent to-transparent 
                      pointer-events-none" />

      {/* CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 30px rgba(168, 85, 247, 0.5)); }
          50% { opacity: 0.9; filter: drop-shadow(0 0 50px rgba(236, 72, 153, 0.8)); }
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        /* Ensure text remains visible on mobile */
        @media (max-width: 768px) {
          h1 {
            text-shadow: 0 2px 20px rgba(255, 255, 255, 0.4),
                         0 0 40px rgba(168, 85, 247, 0.5);
          }
        }
        
        /* Extra small screens optimization */
        @media (max-width: 380px) {
          h1 {
            font-size: 2.5rem;
            letter-spacing: -0.5px;
          }
          .text-lg {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
