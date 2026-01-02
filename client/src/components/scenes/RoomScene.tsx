import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import gsap from 'gsap';
import { Cake, Gift, Layers, Clock, PartyPopper, Sparkles } from 'lucide-react';
import { MessagesScene } from './MessagesScene';

// --- New Cinematic Header ---
// Minimal, ambient, wide-spacing, glowing text.
const CinematicTitle = ({ text }: { text: string }) => {
  return (
    <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none select-none">
      {/* Main Text */}
      <h1 className="text-center">
        <span className="block font-sans font-light text-xl sm:text-3xl md:text-4xl text-white/90 tracking-[0.3em] sm:tracking-[0.5em] drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] animate-pulse-slow">
          {text}
        </span>
      </h1>
      
      {/* Decorative Line & Subtext */}
      <div className="flex items-center gap-4 mt-3 opacity-60">
        <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
        <span className="text-[9px] sm:text-[10px] text-pink-200 uppercase tracking-[0.3em] font-light">
          It's All Yours
        </span>
        <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
      </div>
    </div>
  );
};

export function RoomScene() {
  const { navigateTo, settings } = useSceneStore();
  const wallpaperUrl = settings.customWallpaper || '/assets/wallpaper/40.png';
  
  // Refs
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLButtonElement>(null);
  const ladderRef = useRef<HTMLButtonElement>(null);
  const giftsRef = useRef<HTMLButtonElement>(null);
  const catRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const dustContainerRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  
  // State
  const [daysUntilBirthday, setDaysUntilBirthday] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [isBirthday, setIsBirthday] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // Mouse Parallax Effect State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle Mouse Move for Parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (settings.reducedMotion || window.innerWidth < 768) return;
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20; // range -10 to 10
    const y = (clientY / window.innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  // --- Interaction: Play Meow ---
  const playMeow = () => {
    // 1. Create audio object (Ensure 'meow.mp3' exists in your /public/assets folder)
    const audio = new Audio('/assets/meow.mp3');
    audio.volume = 0.6; 
    
    // 2. Play Sound
    audio.play().catch(e => console.error("Audio play failed (interaction needed):", e));

    // 3. Visual Bounce Effect using GSAP
    if (catRef.current) {
        gsap.fromTo(catRef.current, 
            { scale: 0.9, rotate: -5 }, 
            { scale: 1, rotate: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }
        );
    }
  };

  // Apply Parallax via GSAP
  useEffect(() => {
    if (settings.reducedMotion) return;
    
    gsap.to(wallpaperRef.current, {
      x: -mousePos.x * 1.5,
      y: -mousePos.y * 1.5,
      duration: 1.5,
      ease: 'power2.out'
    });

    gsap.to(dustContainerRef.current, {
      x: mousePos.x * 2,
      y: mousePos.y * 2,
      duration: 2,
      ease: 'power2.out'
    });
  }, [mousePos, settings.reducedMotion]);

  // Logic: Birthday Calculation
  useEffect(() => {
    const calculateDaysUntilBirthday = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const birthday = new Date(currentYear, 0, 14); // Jan 14
      
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

  // Logic: Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // Animation: Dust Motes
  useEffect(() => {
    if (!dustContainerRef.current || settings.reducedMotion) return;

    const dustMotes: { element: HTMLDivElement; timeline: gsap.core.Timeline }[] = [];
    const colors = [
      'rgba(255, 255, 255, 0.4)',
      'rgba(168, 85, 247, 0.3)', // Purple
      'rgba(236, 72, 153, 0.3)', // Pink
      'rgba(250, 204, 21, 0.2)'  // Gold
    ];

    for (let i = 0; i < 20; i++) {
      const mote = document.createElement('div');
      mote.className = 'absolute rounded-full pointer-events-none mix-blend-screen';
      
      const size = 1 + Math.random() * 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      
      mote.style.width = `${size}px`;
      mote.style.height = `${size}px`;
      mote.style.background = color;
      mote.style.left = `${startX}%`;
      mote.style.top = `${startY}%`;
      mote.style.boxShadow = `0 0 ${size * 2}px ${color}`;
      
      dustContainerRef.current.appendChild(mote);
      
      const timeline = gsap.timeline({
        repeat: -1,
        defaults: { ease: "sine.inOut" }
      });
      
      timeline
        .to(mote, {
          x: `+=${(Math.random() - 0.5) * 60}`,
          y: `+=${(Math.random() - 0.5) * 60}`,
          opacity: Math.random() * 0.5 + 0.2,
          duration: 10 + Math.random() * 20,
        })
        .to(mote, {
          x: `+=${(Math.random() - 0.5) * 60}`,
          y: `+=${(Math.random() - 0.5) * 60}`,
          opacity: Math.random() * 0.2, 
          duration: 10 + Math.random() * 20,
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

  // Animation: Main Elements
  useEffect(() => {
    if (settings.reducedMotion) return;

    const animations: gsap.core.Tween[] = [];

    // Aurora Background Breathing
    if (auroraRef.current) {
      const anim = gsap.to(auroraRef.current, {
        scale: 1.2,
        opacity: 0.6,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      animations.push(anim);
    }

    // Cat swaying (Independent of click animation)
    if (catRef.current) {
      const catImage = catRef.current.querySelector('img');
      if (catImage) {
        const anim = gsap.to(catImage, {
            x: 5,
            rotation: 3,
            duration: 3,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
        });
        animations.push(anim);
      }
    }

    // Card Hover/Float animations
    const items = [ladderRef.current, cakeRef.current, giftsRef.current];
    items.forEach((item, i) => {
      if (item) {
        gsap.fromTo(item, 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.5 + (i * 0.1), ease: "back.out(1.2)" }
        );

        const anim = gsap.to(item, {
          y: -6,
          duration: 3 + i * 0.7,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.2,
        });
        animations.push(anim);
      }
    });

    // Clock Hands
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

    // Birthday Pulse
    if (isBirthday && clockRef.current) {
      const celebration = clockRef.current.querySelector('.celebration');
      if (celebration) {
        const anim = gsap.to(celebration, {
          scale: 1.05,
          boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)',
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
        animations.push(anim);
      }
    }

    // Entrance Fade
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out' }
      );
    }

    // Fairy Lights
    const flickerElements = document.querySelectorAll('.fairy-light');
    flickerElements.forEach((element) => {
      const anim = gsap.to(element, {
        opacity: Math.random() * 0.5 + 0.5,
        duration: Math.random() * 2 + 1,
        repeat: -1,
        yoyo: true,
        ease: 'rough({ template: none.out, strength: 1, points: 20, taper: "none", randomize: true, clamp: false})'
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
        onMouseMove={handleMouseMove}
        className={`absolute inset-0 overflow-hidden bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] transition-all duration-700 ${
          showMessages ? 'opacity-40 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'
        }`}
      >
        {/* Ambient Aurora Background */}
        <div 
            ref={auroraRef}
            className="absolute top-[-20%] left-[-20%] w-[140%] h-[80%] rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-indigo-500/20 blur-[100px] pointer-events-none mix-blend-screen"
        />

        <div ref={dustContainerRef} className="absolute inset-0 pointer-events-none z-0" />
        
        {/* Wallpaper Layer */}
        <div
          ref={wallpaperRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: `url(${wallpaperUrl})`,
            opacity: 0.25,
            mixBlendMode: 'overlay',
            filter: 'contrast(1.2) brightness(0.8)'
          }}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')]" />
            
            {/* Fairy lights */}
            <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                <div 
                    key={i} 
                    className="fairy-light absolute w-1.5 h-1.5 rounded-full bg-yellow-100"
                    style={{
                    left: `${10 + (i * 11)}%`,
                    top: `${12 + (i % 2 === 0 ? 5 : 0)}%`,
                    boxShadow: '0 0 10px 2px rgba(253, 224, 71, 0.4)'
                    }}
                />
                ))}
                <svg className="absolute top-[12%] left-[10%] w-[80%] h-10 opacity-30 stroke-white/40 fill-none">
                    <path d="M0,5 Q50,25 100,5 T200,5 T300,5 T400,5" vectorEffect="non-scaling-stroke" />
                </svg>
            </div>
        </div>

        {/* Content Container */}
        <div className="relative w-full h-full flex flex-col justify-evenly items-center p-4 z-10 overflow-hidden">
          
          {/* Header - Cinematic Minimal Style */}
          <div className="text-center w-full max-w-4xl mx-auto flex-shrink-0 pt-6 sm:pt-0">
             <CinematicTitle text="HAPPY BIRTHDAY AFRAH" />
          </div>

          {/* Main cards - 3 Column Layout */}
          <div className="w-full max-w-[340px] sm:max-w-3xl px-2 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full perspective-1000">
              
              {/* Ladder Card */}
              <button
                ref={ladderRef}
                onClick={() => navigateTo('ladder')}
                className="group relative p-3 sm:p-5 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-cyan-300/50 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(34,211,238,0.3)] cursor-pointer overflow-hidden min-h-[100px] sm:min-h-[160px] flex flex-col items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-3xl sm:text-5xl mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-2xl">🪜</div>
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-200" />
                    <h3 className="text-sm sm:text-lg font-display font-bold text-white tracking-wide shadow-black drop-shadow-md">Life Journey</h3>
                  </div>
                  <p className="text-cyan-100/70 font-elegant text-[10px] sm:text-sm group-hover:text-cyan-50 transition-colors text-center">
                    Explore your magical journey
                  </p>
                </div>
              </button>

              {/* Cake Card */}
              <button
                ref={cakeRef}
                onClick={() => navigateTo('cake')}
                className="group relative p-3 sm:p-5 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-pink-300/50 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)] cursor-pointer overflow-hidden min-h-[100px] sm:min-h-[160px] flex flex-col items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-3xl sm:text-5xl mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-2xl">🎂</div>
                  <div className="flex items-center gap-2 mb-1">
                    <Cake className="w-3 h-3 sm:w-4 sm:h-4 text-pink-200" />
                    <h3 className="text-sm sm:text-lg font-display font-bold text-white tracking-wide shadow-black drop-shadow-md">Cake Time</h3>
                  </div>
                  <p className="text-pink-100/70 font-elegant text-[10px] sm:text-sm group-hover:text-pink-50 transition-colors">Slice the cake</p>
                </div>
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              </button>

              {/* Gifts Card */}
              <button
                ref={giftsRef}
                onClick={() => navigateTo('gifts')}
                className="group relative p-3 sm:p-5 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-amber-300/50 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(251,191,36,0.3)] cursor-pointer overflow-hidden min-h-[100px] sm:min-h-[160px] flex flex-col items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-3xl sm:text-5xl mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 drop-shadow-2xl">🎁</div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-amber-200" />
                    <h3 className="text-sm sm:text-lg font-display font-bold text-white tracking-wide shadow-black drop-shadow-md">Open Gifts 🎀</h3>
                  </div>
                  <p className="text-amber-100/70 font-elegant text-[10px] sm:text-sm group-hover:text-amber-50 transition-colors">Unwrap surprises!</p>
                </div>
              </button>
            </div>
          </div>

          {/* Countdown Widget */}
          <div className="w-full max-w-[280px] sm:max-w-xs mx-auto flex-shrink-0">
            {isBirthday ? (
              <div className="celebration relative bg-gradient-to-br from-pink-600/40 to-purple-600/40 backdrop-blur-xl rounded-3xl border border-pink-400/40 p-4 sm:p-6 shadow-2xl shadow-pink-500/20 transform transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-transparent to-transparent animate-pulse" />
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                    <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-bounce" />
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-wider">IT'S YOUR DAY!</h3>
                    <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-white mb-2 animate-shimmer bg-[length:200%_auto]">HAPPY BIRTHDAY!</div>
                  <div className="text-xs sm:text-sm text-pink-100/90 mb-4 font-elegant italic">Today, January 14 is all about YOU! ✨</div>
                  
                  <div className="bg-black/20 rounded-xl p-2 sm:p-3 flex items-center justify-between text-white/90 border border-white/10">
                    <div className="text-center px-2">
                      <div className="text-base sm:text-lg font-mono font-bold">{currentTime}</div>
                      <div className="text-[9px] sm:text-[10px] opacity-60 uppercase tracking-widest">Time</div>
                    </div>
                    <div className="h-6 sm:h-8 w-px bg-white/20" />
                    <div className="text-center px-2">
                      <div className="text-base sm:text-lg font-mono font-bold text-pink-300">20</div>
                      <div className="text-[9px] sm:text-[10px] opacity-60 uppercase tracking-widest">Age</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                ref={clockRef}
                className="relative w-full flex flex-col items-center justify-center space-y-3 sm:space-y-4 group"
              >
                {/* Clock Face with Glow */}
                <div className="relative w-24 h-24 sm:w-36 sm:h-36 transition-transform duration-500 group-hover:scale-105">
                  <div className="absolute inset-0 rounded-full bg-pink-500/30 blur-2xl opacity-50 animate-pulse" />
                  
                  {/* Glassy Clock background */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/30 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" />
                  
                  {/* Progress ring */}
                  <div className="absolute inset-1 sm:inset-2 rounded-full rotate-[-90deg]">
                    <svg className="w-full h-full">
                        <circle cx="50%" cy="50%" r="46%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <circle 
                            cx="50%" cy="50%" r="46%" fill="none" 
                            stroke="url(#gradient)" 
                            strokeWidth="3" 
                            strokeDasharray="289"
                            strokeDashoffset={289 - (289 * (365 - daysUntilBirthday) / 365)}
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_4px_rgba(236,72,153,0.5)]"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f472b6" />
                                <stop offset="100%" stopColor="#c084fc" />
                            </linearGradient>
                        </defs>
                    </svg>
                  </div>
                  
                  {/* Clock hands */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                    <div className="clock-hand absolute top-1/2 left-1/2 w-0.5 h-[35%] bg-white/80 origin-bottom -translate-x-1/2 -translate-y-full rounded-full" />
                    <div className="clock-hand absolute top-1/2 left-1/2 w-0.5 h-[45%] bg-white origin-bottom -translate-x-1/2 -translate-y-full rounded-full" />
                    <div className="clock-hand absolute top-1/2 left-1/2 w-0.5 h-[48%] bg-pink-400 origin-bottom -translate-x-1/2 -translate-y-full rounded-full shadow-[0_0_5px_rgba(236,72,153,0.8)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg border border-pink-500" />
                  </div>
                  
                  <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center pointer-events-none">
                      <span className="text-[8px] sm:text-[10px] text-white/70 uppercase tracking-widest font-semibold drop-shadow-md">Age 20</span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="text-center space-y-1 sm:space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                    <Clock className="w-3 h-3 text-pink-300" />
                    <span className="text-[10px] sm:text-xs font-medium text-white/90 uppercase tracking-wide">Countdown</span>
                  </div>
                  
                  <div className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-tighter drop-shadow-xl text-shadow-glow">
                    {daysUntilBirthday}
                    <span className="text-xs sm:text-sm font-normal text-white/70 ml-2 font-sans tracking-normal">days left</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center mt-2 sm:mt-4 opacity-60 hover:opacity-100 transition-opacity">
              <div className="inline-flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span className="text-[9px] sm:text-[10px] text-purple-200 font-mono tracking-widest uppercase">
                  {isBirthday ? '✨ Magical Day ✨' : 'Live Timer'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages Button (Float Right) */}
          <button
            onClick={() => setShowMessages(true)}
            className="absolute top-4 right-4 sm:top-auto sm:bottom-8 sm:right-8 group cursor-pointer z-30 p-3 sm:p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all hover:scale-110"
            aria-label="Messages"
          >
            <div className="relative text-2xl sm:text-3xl">
              <span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">💌</span>
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border border-[#1a1a2e] animate-bounce" />
            </div>
            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
               Read Messages
            </span>
          </button>

          {/* Animated Interactive Cat */}
          <button 
            ref={catRef}
            onClick={playMeow}
            className="fixed bottom-4 left-4 z-40 transition-transform active:scale-95 cursor-pointer outline-none hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            title="Click me!"
          >
            <img 
              src="/assets/cat.png" 
              alt="Birthday Cat" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl"
            />
          </button>
        </div>
        
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .animate-shimmer {
            animation: shimmer 8s linear infinite;
          }
          
          @keyframes shine {
            100% { left: 125%; }
          }
          .animate-shine {
            animation: shine 1s;
          }

          @keyframes pulse-slow {
             0%, 100% { opacity: 0.9; }
             50% { opacity: 0.7; }
          }
          .animate-pulse-slow {
             animation: pulse-slow 4s ease-in-out infinite;
          }
          
          .perspective-1000 {
            perspective: 1000px;
          }

          .text-shadow-glow {
            text-shadow: 0 0 10px rgba(255,255,255,0.3);
          }
        `}</style>
      </div>
      
      {showMessages && (
        <div className="fixed inset-0 z-50">
          <MessagesScene 
            onClose={() => setShowMessages(false)} 
            roomImage={wallpaperUrl} 
          />
        </div>
      )}
    </>
  );
}
