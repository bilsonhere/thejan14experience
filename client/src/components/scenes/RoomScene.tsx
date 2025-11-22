import { useEffect, useRef } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import gsap from 'gsap';
import { Cake, Gift, Layers } from 'lucide-react';

export function RoomScene() {
  const { navigateTo, settings } = useSceneStore();
  const wallpaperUrl = settings.customWallpaper || '/assets/wallpaper/cosmic1.jpg';
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLButtonElement>(null);
  const ladderRef = useRef<HTMLButtonElement>(null);
  const giftsRef = useRef<HTMLButtonElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings.reducedMotion) return;

    gsap.fromTo(wallpaperRef.current,
      { y: 0 },
      { y: -20, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true }
    );

    gsap.to(catRef.current, {
      x: 20,
      duration: 3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    const items = [cakeRef.current, ladderRef.current, giftsRef.current];
    items.forEach((item, i) => {
      if (item) {
        gsap.fromTo(item,
          { y: 0 },
          {
            y: -10,
            duration: 2 + i * 0.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: i * 0.3,
          }
        );
      }
    });
  }, [settings.reducedMotion]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      <div
        ref={wallpaperRef}
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{
          backgroundImage: `url(${wallpaperUrl})`,
        }}
      />
      
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-8 drop-shadow-2xl">Afrah's Cosmic Room</h1>
          <p className="text-xl text-purple-200 mb-12">Choose your adventure...</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto px-4">
            <button
              ref={cakeRef}
              onClick={() => navigateTo('cake')}
              className="group relative p-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-3xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer"
              aria-label="Go to cake scene"
            >
              <div className="text-6xl mb-4">🎂</div>
              <Cake className="w-12 h-12 mx-auto mb-2 text-pink-300" />
              <h3 className="text-2xl font-bold text-white">Cake Time</h3>
              <p className="text-purple-200 mt-2">Slice the birthday cake</p>
            </button>

            <button
              ref={ladderRef}
              onClick={() => navigateTo('ladder')}
              className="group relative p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-3xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer"
              aria-label="Go to ladder game"
            >
              <div className="text-6xl mb-4">🪜</div>
              <Layers className="w-12 h-12 mx-auto mb-2 text-cyan-300" />
              <h3 className="text-2xl font-bold text-white">Ladder Challenge</h3>
              <p className="text-blue-200 mt-2">Climb to new heights</p>
            </button>

            <button
              ref={giftsRef}
              onClick={() => navigateTo('gifts')}
              className="group relative p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-3xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer"
              aria-label="Go to gifts scene"
            >
              <div className="text-6xl mb-4">🎁</div>
              <Gift className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
              <h3 className="text-2xl font-bold text-white">Open Gifts</h3>
              <p className="text-yellow-200 mt-2">Discover your surprises</p>
            </button>
          </div>

          <div
            ref={catRef}
            className="absolute bottom-8 left-8 text-6xl"
            role="img"
            aria-label="Animated cat"
          >
            🐱
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
    </div>
  );
}
