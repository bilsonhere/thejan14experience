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

    return () => {
      animations.forEach(anim => anim.kill());
    };
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
        <div className="text-center px-6">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 drop-shadow-2xl">
            <span className="font-cursive">Afrah's Birthday Room</span>
          </h1>
          <p className="text-xl text-purple-200/90 mb-16 font-elegant">Choose your adventure...</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <button
              ref={cakeRef}
              onClick={() => navigateTo('cake')}
              className="group relative p-10 bg-gradient-to-br from-pink-500/25 to-purple-500/25 backdrop-blur-soft rounded-3xl border-2 border-white/20 hover:border-white/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/20 cursor-pointer"
              aria-label="Go to cake scene"
            >
              <div className="text-6xl mb-5 transition-transform duration-300 group-hover:scale-110">🎂</div>
              <Cake className="w-12 h-12 mx-auto mb-3 text-pink-300 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-2xl font-display font-bold text-white mb-2">Cake Time</h3>
              <p className="text-purple-200/80 font-elegant text-body-md">Slice the birthday cake</p>
            </button>

            <button
              ref={ladderRef}
              onClick={() => navigateTo('ladder')}
              className="group relative p-10 bg-gradient-to-br from-blue-500/25 to-cyan-500/25 backdrop-blur-soft rounded-3xl border-2 border-white/20 hover:border-white/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer"
              aria-label="Go to ladder game"
            >
              <div className="text-6xl mb-5 transition-transform duration-300 group-hover:scale-110">🪜</div>
              <Layers className="w-12 h-12 mx-auto mb-3 text-cyan-300 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-2xl font-display font-bold text-white mb-2">Ladder Challenge😍</h3>
              <p className="text-blue-200/80 font-elegant text-body-md">Climb to new heights:))</p>
            </button>

            <button
              ref={giftsRef}
              onClick={() => navigateTo('gifts')}
              className="group relative p-10 bg-gradient-to-br from-yellow-500/25 to-orange-500/25 backdrop-blur-soft rounded-3xl border-2 border-white/20 hover:border-white/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-500/20 cursor-pointer"
              aria-label="Go to gifts scene"
            >
              <div className="text-6xl mb-5 transition-transform duration-300 group-hover:scale-110">🎁</div>
              <Gift className="w-12 h-12 mx-auto mb-3 text-yellow-300 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-2xl font-display font-bold text-white mb-2">Open Gifts!!</h3>
              <p className="text-yellow-200/80 font-elegant text-body-md">Unwrap your surprises;)</p>
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
