import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import gsap from 'gsap';
import { Cake, Gift, Layers, Clock, PartyPopper, Sparkles } from 'lucide-react';
import { MessagesScene } from './MessagesScene';

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
  const messagesButtonRef = useRef<HTMLDivElement>(null);
  const dustContainerRef = useRef<HTMLDivElement>(null);
  
  const [daysUntilBirthday, setDaysUntilBirthday] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [isBirthday, setIsBirthday] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // Calculate days until next birthday (January 14) and check if it's birthday
  useEffect(() => {
    const calculateDaysUntilBirthday = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const birthday = new Date(currentYear, 0, 14);
      
      const today = new Date();
      const isTodayBirthday = 
        today.getDate() === 14 && 
        today.getMonth() === 0;
      
      setIsBirthday(isTodayBirthday);
      
      if (now > birthday) {
        birthday.setFullYear(currentYear + 1);
      }
      
      const diffTime = birthday.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilBirthday(diffDays);
    };

    calculateDaysUntilBirthday();
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
    const timeInterval = setInterval(updateTime, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  // Create drifting dust motes
  useEffect(() => {
    if (!dustContainerRef.current || settings.reducedMotion) return;

    const dustMotes = [];
    const colors = [
      'rgba(255, 255, 255, 0.2)',
      'rgba(168, 85, 247, 0.15)',
      'rgba(236, 72, 153, 0.1)',
      'rgba(139, 92, 246, 0.1)'
    ];

    // Create dust motes
    for (let i = 0; i < 15; i++) {
      const mote = document.createElement('div');
      mote.className = 'absolute rounded-full pointer-events-none';
      
      const size = 1 + Math.random() * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const driftX = (Math.random() - 0.5) * 40;
      const driftY = (Math.random() - 0.5) * 20;
      const duration = 20 + Math.random() * 30;
      const delay = Math.random() * 10;
      
      mote.style.width = `${size}px`;
      mote.style.height = `${size}px`;
      mote.style.background = color;
      mote.style.left = `${startX}%`;
      mote.style.top = `${startY}%`;
      mote.style.filter = 'blur(0.5px)';
      
      dustContainerRef.current.appendChild(mote);
      
      // Create very slow, gentle drift animation
      const timeline = gsap.timeline({
        repeat: -1,
        delay: delay,
        defaults: { ease: "sine.inOut" }
      });
      
      timeline
        .to(mote, {
          x: `+=${driftX}`,
          y: `+=${driftY}`,
          duration: duration,
          ease: "sine.inOut"
        })
        .to(mote, {
          x: `-=${driftX}`,
          y: `-=${driftY}`,
          duration: duration,
          ease: "sine.inOut"
        });
      
      dustMotes.push({ element: mote, timeline });
    }

    return () => {
      dustMotes.forEach(({ element, timeline }) => {
        timeline.kill();
        element.remove();
      });
    };
  }, [settings.reducedMotion]);

  // Main animations
  useEffect(() => {
    if (settings.reducedMotion) return;

    const animations: gsap.core.Tween[] = [];

    // Gentle wallpaper sway (1-2px)
    if (wallpaperRef.current) {
      const anim = gsap.fromTo(wallpaperRef.current,
        { x: 0 },
        { 
          x: 1, 
          duration: 15, 
          ease: 'sine.inOut', 
          repeat: -1, 
          yoyo: true,
          delay: Math.random() * 2
        }
      );
      animations.push(anim);
    }

    // Cat animation
    if (catRef.current) {
      const anim = gsap.to(catRef.current, {
        x: 8,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
      animations.push(anim);
    }

    // Card floating animations
    const items = [cakeRef.current, ladderRef.current, giftsRef.current];
    items.forEach((item, i) => {
      if (item) {
        const anim = gsap.fromTo(item,
          { y: 0 },
          {
            y: -4,
            duration: 3 + i * 0.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: i * 0.3,
          }
        );
        animations.push(anim);
      }
    });

    // Messages button glow
    if (messagesButtonRef.current && !showMessages) {
      const anim = gsap.to(messagesButtonRef.current, {
        opacity: 0.7,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      animations.push(anim);
    }

    // Clock hands
    if (clockRef.current && !isBirthday) {
      const hands = clockRef.current.querySelectorAll('.clock-hand');
      hands.forEach((hand, i) => {
        const anim = gsap.to(hand, {
          rotation: 360,
          duration: 60 / (i + 1),
          repeat: -1,
          ease: 'none',
        });
        animations.push(anim);
      });
    }

    // Birthday celebration
    if (isBirthday && clockRef.current) {
      const celebration = clockRef.current.querySelector('.celebration');
      if (celebration) {
        const anim = gsap.to(celebration, {
          scale: 1.03,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
        animations.push(anim);
      }
    }

    // Entrance animation
    if (containerRef.current) {
      const entranceAnim = gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
      animations.push(entranceAnim);
    }

    // Fairy light flicker effect
    const flickerElements = document.querySelectorAll('.fairy-light');
    flickerElements.forEach((element, i) => {
      const anim = gsap.to(element, {
        opacity: 0.3 + Math.random() * 0.4,
        duration: 2 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5
      });
      animations.push(anim);
    });

    return () => {
      animations.forEach(anim => anim.kill());
    };
  }, [settings.reducedMotion, isBirthday, showMessages]);

  return (
    <>
      <div 
        ref={containerRef} 
        className={`absolute inset-0 overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950/80 to-pink-950/90 transition-all duration-500 ${
          showMessages ? 'opacity-40 blur-sm' : 'opacity-100 blur-0'
        }`}
      >
        {/* Dust motes container */}
        <div ref={dustContainerRef} className="absolute inset-0 pointer-events-none z-0" />
        
        <div
          ref={wallpaperRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${wallpaperUrl})`,
            opacity: 0.3,
          }}
        />
        
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
          
          {/* Fairy lights background */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="fairy-light absolute w-1 h-1 rounded-full bg-white/20"
                style={{
                  left: `${10 + (i * 10)}%`,
                  top: `${15 + (i * 8)}%`,
                  boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.3)'
                }}
              />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')] opacity-10" />

        <div className="relative w-full h-full flex flex-col items-center justify-start sm:justify-center p-2 sm:p-3 md:p-4 overflow-y-auto">
          {/* Header - Compact */}
          <div className="mt-3 sm:mt-2 mb-4 sm:mb-6 md:mb-8 px-2 text-center w-full max-w-2xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white mb-1 drop-shadow-[0_1px_15px_rgba(168,85,247,0.5)]">
              <span className="font-cursive bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Afrah's Birthday Room
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 font-elegant drop-shadow-[0_1px_8px_rgba(168,85,247,0.3)] max-w-xs mx-auto">
              🍀 Its.All.Yours ✨
            </p>
          </div>

          {/* Main cards - Smaller on mobile */}
          <div className="w-full max-w-sm sm:max-w-xl lg:max-w-2xl mx-auto px-2 flex-1 flex items-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 w-full">
              <button
                ref={cakeRef}
                onClick={() => navigateTo('cake')}
                className="group relative p-3 sm:p-4 bg-gradient-to-br from-pink-600/25 via-purple-600/25 to-pink-600/25 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/15 hover:border-pink-400/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/20 cursor-pointer overflow-hidden min-h-[100px] sm:min-h-[140px]"
                aria-label="Go to cake scene"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-lg sm:rounded-xl blur-sm sm:blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-1 transition-all duration-300 group-hover:scale-105 group-hover:rotate-2">🎂</div>
                  <Cake className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-pink-200/80 transition-all duration-300 group-hover:scale-105 group-hover:text-pink-100" />
                  <h3 className="text-sm sm:text-base font-display font-semibold text-white mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">Cake Time</h3>
                  <p className="text-purple-100/70 font-elegant text-xs group-hover:text-pink-100 transition-colors duration-300">Slice the cake</p>
                </div>
              </button>

              <button
                ref={ladderRef}
                onClick={() => navigateTo('ladder')}
                className="group relative p-3 sm:p-4 bg-gradient-to-br from-blue-600/25 via-cyan-600/25 to-blue-600/25 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/15 hover:border-cyan-400/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer overflow-hidden min-h-[100px] sm:min-h-[140px]"
                aria-label="Go to ladder game"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-lg sm:rounded-xl blur-sm sm:blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-1 transition-all duration-300 group-hover:scale-105 group-hover:-rotate-1">🪜</div>
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-cyan-200/80 transition-all duration-300 group-hover:scale-105 group-hover:text-cyan-100" />
                  <h3 className="text-sm sm:text-base font-display font-semibold text-white mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">Ladder 😍</h3>
                  <p className="text-blue-100/70 font-elegant text-xs group-hover:text-cyan-100 transition-colors duration-300">Climb & win!</p>
                </div>
              </button>

              <button
                ref={giftsRef}
                onClick={() => navigateTo('gifts')}
                className="group relative p-3 sm:p-4 bg-gradient-to-br from-yellow-600/25 via-orange-600/25 to-yellow-600/25 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/15 hover:border-yellow-400/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20 cursor-pointer overflow-hidden min-h-[100px] sm:min-h-[140px]"
                aria-label="Go to gifts scene"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-lg sm:rounded-xl blur-sm sm:blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <div className="text-2xl sm:text-3xl md:text-4xl mb-1 transition-all duration-300 group-hover:scale-105 group-hover:rotate-1">🎁</div>
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 text-yellow-200/80 transition-all duration-300 group-hover:scale-105 group-hover:text-yellow-100" />
                  <h3 className="text-sm sm:text-base font-display font-semibold text-white mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">Open Gifts 🎀</h3>
                  <p className="text-yellow-100/70 font-elegant text-xs group-hover:text-yellow-100 transition-colors duration-300">Unwrap surprises!</p>
                </div>
              </button>
            </div>
          </div>

          {/* Countdown Widget - No Card, Just Clock & Text */}
          <div className="mt-4 sm:mt-6 w-full max-w-xs mx-auto">
            {isBirthday ? (
              <div className="celebration relative bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl border border-white/30 p-4 sm:p-5 overflow-hidden shadow-2xl shadow-pink-500/30 transform transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent animate-gradient-shift" />
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <PartyPopper className="w-5 h-5 text-yellow-300 animate-bounce" />
                    <h3 className="text-base font-bold text-white">🎂 IT'S YOUR DAY! 🎂</h3>
                    <PartyPopper className="w-5 h-5 text-yellow-300 animate-bounce" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 animate-pulse">HAPPY BIRTHDAY!</div>
                  <div className="text-xs text-white/90 mb-3 font-elegant">Today, January 14 is all about YOU! ✨</div>
                  <div className="flex items-center justify-center gap-3 text-white/80 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-mono">{currentTime}</div>
                      <div className="text-xs mt-0.5">Current Time</div>
                    </div>
                    <div className="h-6 w-px bg-white/30" />
                    <div className="text-center">
                      <div className="text-lg font-mono">20</div>
                      <div className="text-xs mt-0.5">New Age</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                ref={clockRef}
                className="relative w-full flex flex-col items-center justify-center space-y-3"
              >
                {/* Clock Face */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  {/* Clock background - gradient circle */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg shadow-purple-900/30" />
                  
                  {/* Progress ring */}
                  <div className="absolute inset-2 rounded-full">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent" 
                      style={{ 
                        borderImage: `conic-gradient(from 0deg, #ec4899 0%, #a855f7 ${((365 - daysUntilBirthday) / 365) * 100}%, transparent 0%) 1` 
                      }} 
                    />
                  </div>
                  
                  {/* Clock hands */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="clock-hand absolute w-0.5 h-6 bg-white/90 origin-bottom -translate-y-6" />
                    <div className="clock-hand absolute w-0.5 h-8 bg-white origin-bottom -translate-y-8" style={{ transformOrigin: 'bottom center' }} />
                    <div className="clock-hand absolute w-0.3 h-10 bg-pink-400 origin-bottom -translate-y-10" style={{ transformOrigin: 'bottom center' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-lg" />
                  </div>
                  
                  {/* Center display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-white/60 mb-0.5">Turning</div>
                      <div className="text-xl sm:text-2xl font-bold text-white">20</div>
                    </div>
                  </div>
                  
                  {/* Hour marks - subtle */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-px h-1 bg-white/30"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `rotate(${i * 30}deg) translateY(-1.2rem)`,
                        transformOrigin: 'center 0'
                      }}
                    />
                  ))}
                </div>

                {/* Text Info - No card background */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-pink-300/80" />
                    <span className="text-sm font-medium text-white/90">Birthday in</span>
                  </div>
                  
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                    {daysUntilBirthday}
                    <span className="text-xs font-normal text-white/60 ml-1.5">days</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 text-xs text-white/70">
                    <div className="text-center">
                      <div className="font-mono text-sm">{currentTime}</div>
                      <div className="text-[10px] mt-0.5">Current Time</div>
                    </div>
                    <div className="h-4 w-px bg-white/30" />
                    <div className="text-center">
                      <div className="font-mono text-sm">Jan 14</div>
                      <div className="text-[10px] mt-0.5">Target Date</div>
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full border border-white/20 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${daysUntilBirthday <= 30 ? 'bg-pink-400 animate-pulse' : 'bg-purple-400'}`} />
                    <span className="text-xs text-white/80">
                      {daysUntilBirthday <= 30 ? `${daysUntilBirthday} days left` : 'Counting down...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-update indicator */}
            <div className="text-center mt-2">
              <div className="inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white/30" />
                <span className="text-[10px] text-white/30 font-mono">
                  {isBirthday ? '✨ Today is magical! ✨' : 'Live countdown'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages Button */}
          <div
            ref={messagesButtonRef}
            onClick={() => setShowMessages(true)}
            className="fixed top-1/3 right-3 sm:right-4 md:right-6 opacity-30 hover:opacity-50 transition-all duration-500 cursor-pointer z-30"
            style={{ transform: 'translateY(-50%)' }}
          >
            <div className="relative text-3xl sm:text-4xl md:text-5xl text-white/20 hover:text-white/30 transition-colors duration-500">
              💌
              <div className="absolute inset-0 blur-sm opacity-20 animate-pulse" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          {/* Animated Cat */}
          <div
            ref={catRef}
            className="fixed bottom-2 sm:bottom-3 left-2 sm:left-3 text-2xl sm:text-3xl drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] z-20 pointer-events-none opacity-80"
            role="img"
            aria-label="Animated cat"
          >
            🐱
          </div>

          {/* Mobile hint */}
          <div className="sm:hidden mt-2 mb-1 px-3">
            <p className="text-[10px] text-purple-300/60 font-elegant text-center">
              Tap any option to explore ↓
            </p>
          </div>

          {/* Subtle vignette */}
          <div className="fixed inset-0 pointer-events-none" style={{ 
            background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.15) 100%)' 
          }} />
        </div>
        
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
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(2deg); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          
          /* Dust mote animation */
          .dust-mote {
            animation: float 20s ease-in-out infinite;
          }
          
          @keyframes dust-float {
            0%, 100% { 
              transform: translate(0, 0) rotate(0deg); 
              opacity: 0.8;
            }
            25% { 
              transform: translate(20px, -15px) rotate(90deg); 
              opacity: 0.4;
            }
            50% { 
              transform: translate(-10px, 10px) rotate(180deg); 
              opacity: 0.6;
            }
            75% { 
              transform: translate(-15px, -5px) rotate(270deg); 
              opacity: 0.5;
            }
          }
          
          /* Very slow breathing animation for cards */
          @keyframes gentle-breathe {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-1px) scale(1.001); }
          }
          
          .hover-card:hover {
            animation: gentle-breathe 3s ease-in-out infinite;
          }
        `}</style>
      </div>
      
      {showMessages && (
        <div className="fixed inset-0 z-40">
          <MessagesScene 
            onClose={() => setShowMessages(false)} 
            roomImage={wallpaperUrl} 
          />
        </div>
      )}
    </>
  );
}
