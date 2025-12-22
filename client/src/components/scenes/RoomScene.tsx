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
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
      animations.push(entranceAnim);
    }

    return () => {
      animations.forEach(anim => anim.kill());
    };
  }, [settings.reducedMotion]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden 
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

      <div className="relative z-10 w-full h-full flex items-center justify-center px-4 py-8 sm:p-8">
        <div className="text-center w-full max-w-6xl">
          {/* Header Section */}
          <div className="mb-8 sm:mb-12 md:mb-16 px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-4 sm:mb-6
                          drop-shadow-[0_2px_30px_rgba(168,85,247,0.6)]
                          animate-gradient-title"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #ffffff, #e9d5ff, #f0abfc, #ffffff)',
                  backgroundSize: '200% auto',
                }}>
              <span className="font-cursive bg-clip-text text-transparent">
                Afrah's Birthday Room
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-purple-200/90 font-elegant 
                         drop-shadow-[0_2px_15px_rgba(168,85,247,0.4)]
                         max-w-2xl mx-auto">
              Your personal celebration space — explore and enjoy! ✨
            </p>
          </div>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto px-2 sm:px-4">
            
            {/* Cake Card */}
            <button
              ref={cakeRef}
              onClick={() => navigateTo('cake')}
              className="group relative p-6 sm:p-8 lg:p-10 
                        bg-gradient-to-br from-pink-600/30 via-purple-600/30 to-pink-600/30 
                        backdrop-blur-xl rounded-3xl 
                        border border-white/20 hover:border-pink-400/60 
                        transition-all duration-300 
                        hover:scale-[1.02] hover:-translate-y-1 
                        hover:shadow-2xl hover:shadow-pink-500/30 
                        cursor-pointer
                        overflow-hidden"
              aria-label="Go to cake scene"
            >
              {/* Card Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 
                            rounded-3xl blur-xl opacity-0 group-hover:opacity-100 
                            transition-opacity duration-500" />
              
              {/* Card Content */}
              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 transition-all duration-300 
                              group-hover:scale-110 group-hover:rotate-3">🎂</div>
                <Cake className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 
                               text-pink-300 transition-all duration-300 
                               group-hover:scale-110 group-hover:text-pink-200" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white mb-2 sm:mb-3
                             drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Cake Time
                </h3>
                <p className="text-purple-200/80 font-elegant text-sm sm:text-base 
                            group-hover:text-pink-100 transition-colors duration-300">
                  Slice the delicious birthday cake
                </p>
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-3 left-3 w-3 h-3 sm:top-4 sm:left-4 sm:w-4 sm:h-4 
                            border-t-2 border-l-2 border-pink-300/50 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-3 h-3 sm:top-4 sm:right-4 sm:w-4 sm:h-4 
                            border-t-2 border-r-2 border-purple-300/50 rounded-tr-lg" />
            </button>

            {/* Ladder Card */}
            <button
              ref={ladderRef}
              onClick={() => navigateTo('ladder')}
              className="group relative p-6 sm:p-8 lg:p-10 
                        bg-gradient-to-br from-blue-600/30 via-cyan-600/30 to-blue-600/30 
                        backdrop-blur-xl rounded-3xl 
                        border border-white/20 hover:border-cyan-400/60 
                        transition-all duration-300 
                        hover:scale-[1.02] hover:-translate-y-1 
                        hover:shadow-2xl hover:shadow-cyan-500/30 
                        cursor-pointer
                        overflow-hidden"
              aria-label="Go to ladder game"
            >
              {/* Card Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 
                            rounded-3xl blur-xl opacity-0 group-hover:opacity-100 
                            transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 transition-all duration-300 
                              group-hover:scale-110 group-hover:-rotate-2">🪜</div>
                <Layers className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 
                                  text-cyan-300 transition-all duration-300 
                                  group-hover:scale-110 group-hover:text-cyan-200" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white mb-2 sm:mb-3
                             drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Ladder Challenge 😍
                </h3>
                <p className="text-blue-200/80 font-elegant text-sm sm:text-base 
                            group-hover:text-cyan-100 transition-colors duration-300">
                  Climb to new heights and win prizes! 🏆
                </p>
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-3 left-3 w-3 h-3 sm:top-4 sm:left-4 sm:w-4 sm:h-4 
                            border-t-2 border-l-2 border-blue-300/50 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-3 h-3 sm:top-4 sm:right-4 sm:w-4 sm:h-4 
                            border-t-2 border-r-2 border-cyan-300/50 rounded-tr-lg" />
            </button>

            {/* Gifts Card */}
            <button
              ref={giftsRef}
              onClick={() => navigateTo('gifts')}
              className="group relative p-6 sm:p-8 lg:p-10 
                        bg-gradient-to-br from-yellow-600/30 via-orange-600/30 to-yellow-600/30 
                        backdrop-blur-xl rounded-3xl 
                        border border-white/20 hover:border-yellow-400/60 
                        transition-all duration-300 
                        hover:scale-[1.02] hover:-translate-y-1 
                        hover:shadow-2xl hover:shadow-yellow-500/30 
                        cursor-pointer
                        overflow-hidden
                        sm:col-span-2 lg:col-span-1"
              aria-label="Go to gifts scene"
            >
              {/* Card Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 
                            rounded-3xl blur-xl opacity-0 group-hover:opacity-100 
                            transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 transition-all duration-300 
                              group-hover:scale-110 group-hover:rotate-2">🎁</div>
                <Gift className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 
                               text-yellow-300 transition-all duration-300 
                               group-hover:scale-110 group-hover:text-yellow-200" />
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white mb-2 sm:mb-3
                             drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  Open Gifts!! 🎀
                </h3>
                <p className="text-yellow-200/80 font-elegant text-sm sm:text-base 
                            group-hover:text-yellow-100 transition-colors duration-300">
                  Unwrap your birthday surprises! 😊
                </p>
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-3 left-3 w-3 h-3 sm:top-4 sm:left-4 sm:w-4 sm:h-4 
                            border-t-2 border-l-2 border-yellow-300/50 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-3 h-3 sm:top-4 sm:right-4 sm:w-4 sm:h-4 
                            border-t-2 border-r-2 border-orange-300/50 rounded-tr-lg" />
            </button>
          </div>

          {/* Animated Cat */}
          <div
            ref={catRef}
            className="fixed bottom-4 sm:bottom-8 left-4 sm:left-8 text-5xl sm:text-6xl
                      drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]
                      z-20"
            role="img"
            aria-label="Animated cat"
          >
            🐱
          </div>

          {/* Decorative Elements */}
          <div className="hidden lg:block fixed top-8 right-8 text-4xl opacity-60 animate-pulse-slow">✨</div>
          <div className="hidden lg:block fixed top-16 left-8 text-3xl opacity-50 animate-bounce-slow">🎈</div>
        </div>
      </div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.5) 100%)',
        }}
      />

      {/* Mobile Bottom Gradient */}
      <div className="sm:hidden absolute bottom-0 left-0 right-0 h-32 
                      bg-gradient-to-t from-black/80 via-transparent to-transparent 
                      pointer-events-none" />

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes gradient-title {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-title {
          animation: gradient-title 3s ease infinite;
          background-clip: text;
          -webkit-background-clip: text;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        
        /* Improve touch targets on mobile */
        @media (max-width: 640px) {
          button {
            min-height: 180px;
          }
        }
        
        /* Reduce animations on low-end devices */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
