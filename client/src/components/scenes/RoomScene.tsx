import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import gsap from 'gsap';
import { Cake, Gift, Layers, Clock, PartyPopper } from 'lucide-react';

export function RoomScene() {
  const { navigateTo, settings } = useSceneStore();
  const wallpaperUrl = settings.customWallpaper || '/assets/wallpaper/40.png';
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLButtonElement>(null);
  const ladderRef = useRef<HTMLButtonElement>(null);
  const giftsRef = useRef<HTMLButtonElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  
  const [daysUntilBirthday, setDaysUntilBirthday] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [isBirthday, setIsBirthday] = useState(false);

  // Calculate days until next birthday (January 14) and check if it's birthday
  useEffect(() => {
    const calculateDaysUntilBirthday = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const birthday = new Date(currentYear, 0, 14); // January 14 (month is 0-indexed)
      
      // Check if today is the birthday
      const today = new Date();
      const isTodayBirthday = 
        today.getDate() === 14 && 
        today.getMonth() === 0;
      
      setIsBirthday(isTodayBirthday);
      
      // If birthday has passed this year, use next year's birthday
      if (now > birthday) {
        birthday.setFullYear(currentYear + 1);
      }
      
      const diffTime = birthday.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilBirthday(diffDays);
    };

    calculateDaysUntilBirthday();
    // Update every hour to keep countdown accurate
    const interval = setInterval(calculateDaysUntilBirthday, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Real-time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(timeInterval);
  }, []);

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

    // Clock hand animation for birthday countdown
    if (clockRef.current && !isBirthday) {
      const hands = clockRef.current.querySelectorAll('.clock-hand');
      hands.forEach((hand, i) => {
        const anim = gsap.to(hand, {
          rotation: 360,
          duration: 60 / (i + 1), // Different speeds for different hands
          repeat: -1,
          ease: 'none',
        });
        animations.push(anim);
      });
    }

    // Special birthday animation
    if (isBirthday && clockRef.current) {
      const celebration = clockRef.current.querySelector('.celebration');
      if (celebration) {
        const anim = gsap.to(celebration, {
          scale: 1.05,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
        animations.push(anim);
      }
    }

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
  }, [settings.reducedMotion, isBirthday]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden 
                                      bg-gradient-to-br from-indigo-950 via-purple-950/80 to-pink-950/90">
      
      {/* Animated Wallpaper Layer - Increased opacity on mobile */}
      <div
        ref={wallpaperRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${wallpaperUrl})`,
          opacity: 0.3,
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
            🍀 Its.All.Yours ✨
          </p>
        </div>

        {/* Interactive Cards Grid - More compact on mobile, now 3 items instead of 4 */}
        <div className="w-full max-w-md sm:max-w-2xl lg:max-w-3xl mx-auto px-2 sm:px-4 flex-1 flex items-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full">
            
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

        {/* UPDATED: Minimalist Clock-Style Birthday Countdown Widget */}
        <div ref={clockRef} className="mt-6 sm:mt-8 w-full max-w-xs mx-auto">
          {isBirthday ? (
            // Special Birthday Celebration Card
            <div className="celebration relative bg-gradient-to-br from-pink-500/20 to-purple-600/20 
                          backdrop-blur-xl rounded-2xl border border-white/30 
                          p-5 sm:p-6 overflow-hidden
                          shadow-2xl shadow-pink-500/30
                          transform transition-all duration-500">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent 
                            animate-gradient-shift" />
              
              {/* Confetti overlay */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute text-xl animate-float" 
                       style={{
                         left: `${10 + i * 10}%`,
                         top: `${20 + i * 8}%`,
                         animationDelay: `${i * 0.3}s`
                       }}>
                    🎉
                  </div>
                ))}
              </div>

              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <PartyPopper className="w-6 h-6 text-yellow-300 animate-bounce" />
                  <h3 className="text-lg font-bold text-white">
                    🎂 IT'S YOUR DAY! 🎂
                  </h3>
                  <PartyPopper className="w-6 h-6 text-yellow-300 animate-bounce" />
                </div>
                
                <div className="text-4xl font-bold text-white mb-2 animate-pulse">
                  HAPPY BIRTHDAY!
                </div>
                
                <div className="text-sm text-white/90 mb-4 font-elegant">
                  Today, January 14 is all about YOU! ✨
                </div>

                <div className="flex items-center justify-center gap-4 text-white/80 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-mono">{currentTime}</div>
                    <div className="text-xs mt-1">Current Time</div>
                  </div>
                  <div className="h-8 w-px bg-white/30" />
                  <div className="text-center">
                    <div className="text-xl font-mono">20</div>
                    <div className="text-xs mt-1">New Age</div>
                  </div>
                </div>

                <div className="text-xs text-white/70 italic mt-3">
                  Make today unforgettable! 🎈
                </div>
              </div>
            </div>
          ) : (
            // Minimal Clock Countdown Widget
            <div className="relative bg-gradient-to-br from-white/5 to-white/10 
                          backdrop-blur-2xl rounded-2xl border border-white/20 
                          p-4 sm:p-5 overflow-hidden
                          shadow-xl shadow-purple-900/20
                          hover:shadow-2xl hover:shadow-purple-900/30 transition-all duration-300">
              {/* Clock face background */}
              <div className="absolute inset-4 rounded-full border border-white/10" />
              
              {/* Clock center point */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                            w-2 h-2 bg-white rounded-full" />
              
              {/* Clock hands */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {/* Hour hand (short) */}
                <div className="clock-hand absolute w-1 h-8 bg-white/90 origin-bottom -translate-y-8" />
                {/* Minute hand (medium) */}
                <div className="clock-hand absolute w-1 h-12 bg-white origin-bottom -translate-y-12" 
                     style={{ transformOrigin: 'bottom center' }} />
                {/* Second hand (long) */}
                <div className="clock-hand absolute w-0.5 h-16 bg-pink-400 origin-bottom -translate-y-16" 
                     style={{ transformOrigin: 'bottom center' }} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-pink-300" />
                  <h3 className="text-sm font-medium text-white/90">
                    Birthday Countdown
                  </h3>
                </div>
                
                {/* Main countdown display */}
                <div className="text-center mb-4">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1
                                font-mono tracking-tight">
                    {daysUntilBirthday}
                    <span className="text-sm font-normal text-white/60 ml-2">days</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 text-sm text-white/70">
                    <div>
                      <div className="font-mono text-base">{currentTime}</div>
                      <div className="text-xs mt-0.5">Current Time</div>
                    </div>
                    <div className="h-6 w-px bg-white/30" />
                    <div>
                      <div className="font-mono text-base">Jan 14</div>
                      <div className="text-xs mt-0.5">Target Date</div>
                    </div>
                  </div>
                </div>

                {/* Progress ring */}
                <div className="relative w-32 h-32 mx-auto mb-3">
                  <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                  <div 
                    className="absolute inset-2 rounded-full border-4 border-transparent"
                    style={{
                      borderImage: `conic-gradient(from 0deg, #ec4899 0%, #a855f7 ${((365 - daysUntilBirthday) / 365) * 100}%, transparent 0%) 1`,
                    }}
                  />
                  
                  {/* Age indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm text-white/60">Turning</div>
                      <div className="text-2xl font-bold text-white">20</div>
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 
                                bg-white/10 rounded-full border border-white/20">
                    <div className={`w-2 h-2 rounded-full ${daysUntilBirthday <= 30 ? 'bg-pink-400 animate-pulse' : 'bg-purple-400'}`} />
                    <span className="text-xs text-white/80">
                      {daysUntilBirthday <= 30 
                        ? `${daysUntilBirthday} days to go!` 
                        : 'Countdown active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Subtle footer text */}
          <p className="text-xs text-white/40 text-center mt-2 font-mono">
            {isBirthday ? '✨ Today is magical! ✨' : 'Auto-updating'}
          </p>
        </div>

        {/* Animated Cat - Smaller and better positioned for mobile */}
        <div
          ref={catRef}
          className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 text-3xl sm:text-4xl
                    drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]
                    z-20 pointer-events-none opacity-80"
          role="img"
          aria-label="Animated cat"
        >
          🐱
        </div>

        {/* Mobile only hint */}
        <div className="sm:hidden mt-3 mb-2 px-4">
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

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
