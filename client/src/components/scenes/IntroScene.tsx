import { useEffect, useRef } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import { Button } from '../ui/button';
import gsap from 'gsap';
import { audioManager } from '../../lib/audioManager';
import { Sparkles, MousePointer2, ChevronUp } from 'lucide-react'; // Added icons for visual polish

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

      // Animate decorative elements (Emojis/Stars)
      decorationRefs.current.forEach((ref, i) => {
        if (ref) {
          gsap.fromTo(ref,
            { opacity: 0, scale: 0, rotation: -45 },
            {
              opacity: 0.6,
              scale: 1,
              rotation: 0,
              duration: 1.5,
              ease: 'elastic.out(1, 0.5)',
              delay: i * 0.1,
            }
          );
        }
      });

      if (titleRef.current) {
        // Main Title Entry
        tl.from(titleRef.current, {
          opacity: 0,
          y: 50,
          scale: 0.9,
          filter: 'blur(10px)',
          duration: 1.8,
          ease: 'power3.out',
          clearProps: "all"
        });
      }

      if (subtitleRef.current) {
        tl.from(subtitleRef.current, {
          opacity: 0,
          y: 20,
          duration: 1.2,
          ease: 'power2.out',
        }, '-=1.0');
      }

      if (buttonRef.current) {
        tl.from(buttonRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 20,
          duration: 1,
          ease: 'back.out(1.7)',
        }, '-=0.8');
      }

      // Gentle floating animation for title (Desktop only to save mobile battery)
      if (titleRef.current && !settings.reducedMotion && window.innerWidth >= 768) {
        gsap.to(titleRef.current, {
          y: -10,
          duration: 4,
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
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#05020A]"
    >
      {/* ==================== 
          BACKGROUND LAYERS 
         ==================== */}
      
      {/* 1. Deep Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_#2e1065_0%,_#0f0518_50%,_#000000_100%)] opacity-80" />
      
      {/* 2. Grain/Noise Texture (Adds premium feel) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1vY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]" />

      {/* 3. Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-pink-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

      {/* 4. Particle System */}
      <AdaptiveParticleSystem 
        count={window.innerWidth < 768 ? 60 : 120} 
        color="#fbbf24" // Gold/Warm color
        speed={0.3} 
        size={1.5}
        className="z-0"
      />

      {/* ==================== 
          DECORATIVE ELEMENTS 
         ==================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
        <div ref={el => decorationRefs.current[0] = el} className="absolute top-[15%] left-[10%] text-3xl opacity-40 animate-float-delayed">✨</div>
        <div ref={el => decorationRefs.current[1] = el} className="absolute top-[20%] right-[15%] text-2xl opacity-30 animate-float">🌺</div>
        <div ref={el => decorationRefs.current[2] = el} className="absolute bottom-[20%] left-[15%] text-2xl opacity-30 animate-float">🎂</div>
        <div ref={el => decorationRefs.current[3] = el} className="absolute bottom-[15%] right-[10%] text-3xl opacity-40 animate-float-delayed">🎉</div>
      </div>

      {/* ==================== 
          MAIN CONTENT 
         ==================== */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 py-12 text-center">
        
        {/* Title Section */}
        <div ref={titleRef} className="relative mb-8 sm:mb-10 group cursor-default">
          {/* Glow behind title */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-3xl opacity-50 rounded-full transform scale-150" />
          
          <h1 className="relative font-display font-bold tracking-[0.2em] leading-tight
                         text-5xl sm:text-7xl md:text-8xl lg:text-9xl
                         text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]
                         transition-all duration-500">
            {/* Split for gradient effect on desktop, solid white on mobile for readability */}
            <span className="md:text-transparent md:bg-clip-text md:bg-gradient-to-br md:from-amber-100 md:via-pink-200 md:to-purple-200">
              TWENTY
            </span>
          </h1>
          
          <div className="h-px w-24 sm:w-48 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mt-4 sm:mt-6" />
        </div>

        {/* Subtitle Section */}
        <div ref={subtitleRef} className="relative mb-12 sm:mb-16 space-y-2">
           <div className="flex items-center justify-center gap-2 text-pink-200/60 mb-2">
              <Sparkles className="w-4 h-4" />
           </div>
          <p className="font-cursive text-xl sm:text-2xl md:text-3xl text-purple-100/90 font-light tracking-wide drop-shadow-md">
            An experience for your special day (❁´◡`❁)
          </p>
        </div>

        {/* Action Section */}
        <div className="relative w-full max-w-xs sm:max-w-sm mx-auto perspective-1000">
          <Button
            ref={buttonRef}
            onClick={() => navigateTo('midnight')}
            className="group relative w-full h-14 sm:h-16 rounded-full overflow-hidden
                       bg-white/5 backdrop-blur-md border border-white/10
                       hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]
                       transition-all duration-500 ease-out shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]"
          >
            {/* Button Gradient Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex items-center justify-center gap-3 text-white">
              <span className="uppercase tracking-[0.15em] text-sm sm:text-base font-medium">Enter Experience</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </Button>

          {/* Desktop Instruction */}
          <div className="hidden md:flex items-center justify-center gap-6 mt-6 opacity-40 text-xs tracking-widest uppercase text-white font-light">
            <span className="flex items-center gap-2"><kbd className="border border-white/20 rounded px-1.5 py-0.5">Enter</kbd> to start</span>
            <span>•</span>
            <span className="flex items-center gap-2"><MousePointer2 className="w-3 h-3" /> or click</span>
          </div>

          {/* Mobile Instruction */}
          <div className="md:hidden mt-8 flex flex-col items-center gap-2 animate-bounce-slow opacity-60">
             <ChevronUp className="w-5 h-5 text-purple-200" />
             <span className="text-xs text-purple-200/80 tracking-widest uppercase font-light">Swipe Up</span>
          </div>

        </div>

        {/* Device Hint */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <div className="px-4 py-2 bg-black/20 backdrop-blur-sm rounded-full border border-white/5 text-[10px] sm:text-xs text-white/30 tracking-widest uppercase">
              🎧 Best experienced with headphones
            </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite 1s; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
}
