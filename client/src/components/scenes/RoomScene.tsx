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
            y: -8,
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
    // Added position: relative and ensure it doesn't affect other elements
    <div ref={containerRef} className="absolute inset-0 overflow-hidden 
                                      bg-gradient-to-br from-indigo-950 via-purple-900/80 to-pink-950/90">
      
      {/* Animated Wallpaper Layer */}
      <div
        ref={wallpaperRef}
        className="absolute inset-0 opacity-25 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${wallpaperUrl})`,
        }}
      />
      
      {/* Enhanced Gradient Overlays */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40" />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 40%, rgba(236, 72, 153, 0.4) 0%, transparent 45%),
              radial-gradient(circle at 85% 75%, rgba(139, 92, 246, 0.4) 0%, transparent 45%),
              radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 35%)
            `,
          }}
        />
      </div>

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMyIvPjwvc3ZnPg==')] 
                      opacity-15" />

      {/* Main content container - fixed positioning to avoid layout issues */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="text-center w-full max-w-6xl">
          {/* Header Section */}
          <div className="mb-8 sm:mb-12 md:mb-16 px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 sm:mb-4
                          drop-shadow-[0_2px_30px_rgba(168,85,247,0.6)]">
              <span className="font-cursive bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Afrah's Birthday Room
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-purple-200/90 font-elegant 
                         drop-shadow-[0_2px_15px_rgba(168,85,247,0.4)]
                         max-w-xl sm:max-w-2xl mx-auto">
              Your personal celebration space — explore and enjoy! ✨
            </p>
          </div>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-2 sm:px-4">
            
            {/* Cake Card */}
            <button
              ref={cakeRef}
              onClick={() => navigateTo('cake')}
              className="group relative p-6 sm:p-8 
                        bg-gradient-to-br from-pink-600/30 via-purple-600/30 to-pink-600/30 
                        backdrop-blur-xl rounded-2xl sm:rounded-3xl
                        border border-white/20 hover:border-pink-400/60 
                        transition-all duration-300 
                        hover:scale-[1.02] hover:-translate-y-1 
                        hover:shadow-xl sm:hover:shadow-2xl hover:shadow-pink-500/30 
                        cursor-pointer
                        overflow-hidden
                        min-h-[180px] sm:min-h-[220px]"
              aria-label="Go to cake scene"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 
                            rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 
                            transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transition-all duration-300 
                              group-hover:scale-110 group-hover:rotate-3">🎂</div>
                <Cake className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 
                               text-pink-300 transition-all duration-300 
                               group-hover:scale-110 group-hover:text-pink-200" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white mb-1 sm:mb-2
                             drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Cake Time
                </h3>
                <p className="text-purple-200/80 font-elegant text-xs sm:text-sm md:text-base 
                            group-hover:text-pink-100 transition-colors duration-300">
                  Slice the delicious cake
                </p>
              </div>
            </button>

            {/* Ladder Card */}
            <button
              ref={ladderRef}
              onClick={() => navigateTo('ladder')}
              className="group relative p-6 sm:p-8 
                        bg-gradient-to-br from-blue-600/30 via-cyan-600/30 to-blue-600/30 
                        backdrop-blur-xl rounded-2xl sm:rounded-3xl
                        border border-white/20 hover:border-cyan-400/60 
                        transition-all duration-300 
                        hover:scale-[1.02] hover:-translate-y-1 
                        hover:shadow-xl sm:hover:shadow-2xl hover:shadow-cyan-500/30 
                        cursor-pointer
                        overflow-hidden
                        min-h-[180px] sm:min-h-[220px]"
              aria-label="Go to ladder game"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 
                            rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 
                            transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transition-all duration-300 
                              group-hover:scale-110 group-hover:-rotate-2">🪜</div>
                <Layers className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 
                                  text-cyan-300 transition-all duration-300 
                                  group-hover:scale-110 group-hover:text-cyan-200" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white mb-1 sm:mb-2
                             drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Ladder 😍
                </h3>
                <p className="text-blue-200/80 font-elegant text-xs sm:text-sm md:text-base 
                            group-hover:text-cyan-100 transition-colors duration-300">
                  Climb and win prizes!
                </p>
              </div>
            </button>

            {/* Gifts Card */}
            <button
              ref={giftsRef}
              onClick={() => navigateTo('gifts')}
              className="group relative p-6 sm:p-8 
                        bg-gradient-to-br from-yellow-600/30 via-orange-600/30 to-yellow-600/30 
                        backdrop-blur-xl rounded-2xl sm:rounded-3xl
                        border border-white/20 hover:border-yellow-400/60 
                        transition-all duration-300 
                        hover:scale-[1.02] hover:-translate-y-1 
                        hover:shadow-xl sm:hover:shadow-2xl hover:shadow-yellow-500/30 
                        cursor-pointer
                        overflow-hidden
                        min-h-[180px] sm:min-h-[220px]"
              aria-label="Go to gifts scene"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 
                            rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 
                            transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transition-all duration-300 
                              group-hover:scale-110 group-hover:rotate-2">🎁</div>
                <Gift className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 
                               text-yellow-300 transition-all duration-300 
                               group-hover:scale-110 group-hover:text-yellow-200" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-white mb-1 sm:mb-2
                             drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Open Gifts 🎀
                </h3>
                <p className="text-yellow-200/80 font-elegant text-xs sm:text-sm md:text-base 
                            group-hover:text-yellow-100 transition-colors duration-300">
                  Unwrap your surprises!
                </p>
              </div>
            </button>
          </div>

          {/* Animated Cat */}
          <div
            ref={catRef}
            className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 text-4xl sm:text-5xl
                      drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]
                      z-10 pointer-events-none"
            role="img"
            aria-label="Animated cat"
          >
            🐱
          </div>

          {/* Vignette Effect */}
          <div className="fixed inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.3) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
