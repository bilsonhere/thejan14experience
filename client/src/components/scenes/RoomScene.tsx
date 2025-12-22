import { useEffect, useRef } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import gsap from 'gsap';
import { Cake, Gift, Layers } from 'lucide-react';

export function RoomScene() {
  const { navigateTo, settings } = useSceneStore();
  const wallpaperUrl = settings.customWallpaper || '/assets/wallpaper/40.png';
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLButtonElement>(null);
  const ladderRef = useRef<HTMLButtonElement>(null);
  const giftsRef = useRef<HTMLButtonElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings.reducedMotion) return;

    const animations: gsap.core.Tween[] = [];

    if (wallpaperRef.current) {
      const anim = gsap.fromTo(wallpaperRef.current,
        { y: 0 },
        { y: -16, duration: 10, ease: 'power3.inOut', repeat: -1, yoyo: true }
      );
      animations.push(anim);
    }

    if (catRef.current) {
      const anim = gsap.to(catRef.current, {
        x: 16,
        duration: 4,
        ease: 'power3.inOut',
        repeat: -1,
        yoyo: true,
      });
      animations.push(anim);
    }

    const items = [cakeRef.current, ladderRef.current, giftsRef.current];
    items.forEach((item, i) => {
      if (item) {
        const anim = gsap.fromTo(item,
          { y: 0 },
          {
            y: -6,
            duration: 2.5 + i * 0.3,
            ease: 'power3.inOut',
            repeat: -1,
            yoyo: true,
            delay: i * 0.2,
          }
        );
        animations.push(anim);
      }
    });

    // Entrance animation
    if (containerRef.current) {
      const entranceAnim = gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
      animations.push(entranceAnim);
    }

    return () => {
      animations.forEach(anim => anim.kill());
    };
  }, [settings.reducedMotion]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden 
                                      bg-gradient-to-br from-indigo-950 via-purple-900/80 to-pink-950/90">
      
      {/* Animated Wallpaper Layer - Increased opacity on mobile */}
      <div
        ref={wallpaperRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${wallpaperUrl})`,
          opacity: 0.3, // Reduced opacity on all devices
        }}
      />
      
      {/* Enhanced Gradient Overlays - Lighter on mobile */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
        <div className="absolute inset-0 opacity-20 sm:opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 40%, rgba(236, 72, 153, 0.3) 0%, transparent 45%),
              radial-gradient(circle at 85% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 45%),
              radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 35%)
            `,
          }}
        />
      </div>

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')] 
                      opacity-10" />

      {/* Main content container - Better mobile spacing */}
      <div className="relative w-full h-full flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 overflow-y-auto">
        
        {/* Header Section - Smaller on mobile */}
        <div className="mt-4 sm:mt-0 mb-6 sm:mb-8 md:mb-12 px-2 sm:px-4 text-center w-full max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-1 sm:mb-3
                        drop-shadow-[0_1px_20px_rgba(168,85,247,0.5)]">
            <span className="font-cursive bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Afrah's Birthday Room
            </span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-purple-200/80 font-elegant 
                       drop-shadow-[0_1px_10px_rgba(168,85,247,0.3)]
                       max-w-xs sm:max-w-md mx-auto">
           💕 Its.All.Yours ✨
          </p>
        </div>

        {/* Interactive Cards Grid - More compact on mobile */}
        <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-4 flex-1 flex items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full">
            
            {/* Cake Card - Much smaller on mobile */}
            <button
              ref={cakeRef}
              onClick={() => navigateTo('cake')}
              className="group relative p-4 sm:p-5 md:p-6 
                        bg-gradient-to-br from-pink-600/25 via-purple-600/25 to-pink-600/25 
                        backdrop-blur-md sm:backdrop-blur-xl rounded-xl sm:rounded-2xl
                        border border-white/15 hover:border-pink-400/50 
                        transition-all duration-300 
                        hover:scale-[1.02] hover:-translate-y-0.5 
                        hover:shadow-lg sm:hover:shadow-xl hover:shadow-pink-500/20 
                        cursor-pointer
                        overflow-hidden
                        min-h-[120px] sm:min-h-[160px] md:min-h-[180px]"
              aria-label="Go to cake scene"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 
                            rounded-xl sm:rounded-2xl blur-md sm:blur-xl opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2 transition-all duration-300 
                              group-hover:scale-105 group-hover:rotate-2">🎂</div>
                <Cake className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 sm:mb-2 
                               text-pink-200/80 transition-all duration-300 
                               group-hover:scale-105 group-hover:text-pink-100" />
                <h3 className="text-base sm:text-lg md:text-xl font-display font-semibold text-white mb-0.5 sm:mb-1
                             drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                  Cake Time
                </h3>
                <p className="text-purple-100/70 font-elegant text-xs sm:text-sm 
                            group-hover:text-pink-100 transition-colors duration-300">
                  Slice the cake
                </p>
              </div>
            </button>

            {/* Ladder Card */}
            <button
              ref={ladderRef}
              onClick={() => navigateTo('ladder')}
              className="group relative p-4 sm:p-5 md:p-6 
                        bg-gradient-to-br from-blue-600/25 via-cyan-600/25 to-blue-600/25 
                        backdrop-blur-md sm:backdrop-blur-xl rounded-xl sm:rounded-2xl
                        border border-white/15 hover:border-cyan-400/50 
                        transition-all duration-300 
                        hover:scale-[1.02] hover:-translate-y-0.5 
                        hover:shadow-lg sm:hover:shadow-xl hover:shadow-cyan-500/20 
                        cursor-pointer
                        overflow-hidden
                        min-h-[120px] sm:min-h-[160px] md:min-h-[180px]"
              aria-label="Go to ladder game"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 
                            rounded-xl sm:rounded-2xl blur-md sm:blur-xl opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2 transition-all duration-300 
                              group-hover:scale-105 group-hover:-rotate-1">🪜</div>
                <Layers className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 sm:mb-2 
                                  text-cyan-200/80 transition-all duration-300 
                                  group-hover:scale-105 group-hover:text-cyan-100" />
                <h3 className="text-base sm:text-lg md:text-xl font-display font-semibold text-white mb-0.5 sm:mb-1
                             drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                  Ladder 😍
                </h3>
                <p className="text-blue-100/70 font-elegant text-xs sm:text-sm 
                            group-hover:text-cyan-100 transition-colors duration-300">
                  Climb & win!
                </p>
              </div>
            </button>

            {/* Gifts Card */}
            <button
              ref={giftsRef}
              onClick={() => navigateTo('gifts')}
              className="group relative p-4 sm:p-5 md:p-6 
                        bg-gradient-to-br from-yellow-600/25 via-orange-600/25 to-yellow-600/25 
                        backdrop-blur-md sm:backdrop-blur-xl rounded-xl sm:rounded-2xl
                        border border-white/15 hover:border-yellow-400/50 
                        transition-all duration-300 
                        hover:scale-[1.02] hover:-translate-y-0.5 
                        hover:shadow-lg sm:hover:shadow-xl hover:shadow-yellow-500/20 
                        cursor-pointer
                        overflow-hidden
                        min-h-[120px] sm:min-h-[160px] md:min-h-[180px]"
              aria-label="Go to gifts scene"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 
                            rounded-xl sm:rounded-2xl blur-md sm:blur-xl opacity-0 group-hover:opacity-100 
                            transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2 transition-all duration-300 
                              group-hover:scale-105 group-hover:rotate-1">🎁</div>
                <Gift className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 sm:mb-2 
                               text-yellow-200/80 transition-all duration-300 
                               group-hover:scale-105 group-hover:text-yellow-100" />
                <h3 className="text-base sm:text-lg md:text-xl font-display font-semibold text-white mb-0.5 sm:mb-1
                             drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
                  Open Gifts 🎀
                </h3>
                <p className="text-yellow-100/70 font-elegant text-xs sm:text-sm 
                            group-hover:text-yellow-100 transition-colors duration-300">
                  Unwrap surprises!
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Animated Cat - Smaller and better positioned for mobile */}
        <div
          ref={catRef}
          className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 text-3xl sm:text-4xl
                    drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]
                    z-10 pointer-events-none opacity-80"
          role="img"
          aria-label="Animated cat"
        >
          🐱
        </div>

        {/* Mobile only hint */}
        <div className="sm:hidden mt-4 mb-2 px-4">
          <p className="text-xs text-purple-300/60 font-elegant text-center">
            Tap any option to explore ↓
          </p>
        </div>

        {/* Vignette Effect - Lighter on mobile */}
        <div className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)',
          }}
        />
      </div>
    </div>
  );
}
