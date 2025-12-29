import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import gsap from 'gsap';
import { Cake, Gift, Layers, Clock, PartyPopper, Sparkles } from 'lucide-react';
import { MessagesScene } from './MessagesScene';

export function RoomScene() {
  const { navigateTo, settings } = useSceneStore();
  const wallpaperUrl = settings.customWallpaper || '/assets/wallpaper/40.png';
  
  // Refs
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLButtonElement>(null);
  const ladderRef = useRef<HTMLButtonElement>(null);
  const giftsRef = useRef<HTMLButtonElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const messagesButtonRef = useRef<HTMLDivElement>(null);
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

  // Logic: Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000); // Updated to seconds for smoother feel if needed
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

    for (let i = 0; i < 20; i++) { // Increased count slightly
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
      mote.style.boxShadow = `0 0 ${size * 2}px ${color}`; // Add glow
      
      dustContainerRef.current.appendChild(mote);
      
      // Complex drift animation
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
          opacity: Math.random() * 0.2, // Fade out slightly
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

    // Cat swaying
    if (catRef.current) {
      const anim = gsap.to(catRef.current, {
        x: 6,
        rotation: 2,
        duration: 4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
      animations.push(anim);
    }

    // Card Hover/Float animations
    const items = [cakeRef.current, ladderRef.current, giftsRef.current];
    items.forEach((item, i) => {
      if (item) {
        // Initial entrance
        gsap.fromTo(item, 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.2 + (i * 0.1), ease: "back.out(1.2)" }
        );

        // Idle Float
        const anim = gsap.to(item, {
          y: -6,
          duration: 3 + i * 0.7, // Varied duration so they don't sync up
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.2,
        });
        animations.push(anim);
      }
    });

    // Clock Hands Continuous Rotation
    if (clockRef.current && !isBirthday) {
      const hands = clockRef.current.querySelectorAll('.clock-hand');
      hands.forEach((hand, i) => {
        const anim = gsap.to(hand, {
          rotation: 360,
          duration: 60 / (i + 1), // Seconds hand faster, etc.
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

    // Fairy Lights Flickering (Randomized)
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

        {/* Dust motes container */}
        <div ref={dustContainerRef} className="absolute inset-0 pointer-events-none z-0" />
        
        {/* Wallpaper Layer with Blend Mode */}
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
            {/* Top Gradient for text readability */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
            {/* Bottom Gradient for grounding */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Subtle Noise Texture for Film Grain look */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')]" />
            
            {/* Fairy lights background */}
            <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                <div 
                    key={i} 
                    className="fairy-light absolute w-1.5 h-1.5 rounded-full bg-yellow-100"
                    style={{
                    left: `${10 + (i * 11)}%`,
                    top: `${12 + (i % 2 === 0 ? 5 : 0)}%`, // Zigzag pattern
                    boxShadow: '0 0 10px 2px rgba(253, 224, 71, 0.4)'
                    }}
                />
                ))}
                {/* String connecting lights */}
                <svg className="absolute top-[12%] left-[10%] w-[80%] h-10 opacity-30 stroke-white/40 fill-none">
                    <path d="M0,5 Q50,25 100,5 T200,5 T300,5 T400,5" vectorEffect="non-scaling-stroke" />
                </svg>
            </div>
        </div>

        {/* Content Container */}
        <div className="relative w-full h-full flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto z-10 scrollbar-hide">
          
          {/* Header */}
          <div className="mt-8 sm:mt-0 mb-8 sm:mb-10 text-center w-full max-w-2xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-2 drop-shadow-[0_2px_10px_rgba(168,85,247,0.6)] tracking-tight">
              <span className="font-cursive bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                Afrah's Birthday Room
              </span>
            </h1>
            <p className="text-sm sm:text-base text-purple-200/90 font-elegant tracking-widest uppercase text-xs flex items-center justify-center gap-2 opacity-80">
              <span className="w-8 h-[1px] bg-purple-300/50"></span>
              🍀 Its.All.Yours ✨
              <span className="w-8 h-[1px] bg-purple-300/50"></span>
            </p>
          </div>

          {/* Main cards - 3 Column Layout */}
          <div className="w-full max-w-sm sm:max-w-xl lg:max-w-3xl mx-auto px-2 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full perspective-1000">
              
              {/* Cake Card */}
              <button
                ref={cakeRef}
                onClick={() => navigateTo('cake')}
                className="group relative p-4 sm:p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-pink-400/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] cursor-pointer overflow-hidden min-h-[110px] sm:min-h-[150px] flex flex-col items-center justify-center"
                aria-label="Go to cake scene"
              >
                {/* Inner Gradient Bloom */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-lg">🎂</div>
                  <div className="flex items-center gap-2 mb-1">
                    <Cake className="w-4 h-4 text-pink-300" />
                    <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-wide">Cake Time</h3>
                  </div>
                  <p className="text-pink-100/60 font-elegant text-xs sm:text-sm group-hover:text-pink-100 transition-colors">Slice the cake</p>
                </div>
                {/* Shine effect */}
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
              </button>

              {/* Ladder Card */}
              <button
                ref={ladderRef}
                onClick={() => navigateTo('ladder')}
                className="group relative p-4 sm:p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] cursor-pointer overflow-hidden min-h-[110px] sm:min-h-[150px] flex flex-col items-center justify-center"
                aria-label="Go to ladder game"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg">🪜</div>
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-cyan-300" />
                    <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-wide">Ladder 😍</h3>
                  </div>
                  <p className="text-cyan-100/60 font-elegant text-xs sm:text-sm group-hover:text-cyan-100 transition-colors">Climb & win!</p>
                </div>
              </button>

              {/* Gifts Card */}
              <button
                ref={giftsRef}
                onClick={() => navigateTo('gifts')}
                className="group relative p-4 sm:p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] cursor-pointer overflow-hidden min-h-[110px] sm:min-h-[150px] flex flex-col items-center justify-center"
                aria-label="Go to gifts scene"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 drop-shadow-lg">🎁</div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-4 h-4 text-amber-300" />
                    <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-wide">Open Gifts 🎀</h3>
                  </div>
                  <p className="text-amber-100/60 font-elegant text-xs sm:text-sm group-hover:text-amber-100 transition-colors">Unwrap surprises!</p>
                </div>
              </button>
            </div>
          </div>

          {/* Countdown Widget */}
          <div className="mt-2 w-full max-w-xs mx-auto mb-10">
            {isBirthday ? (
              <div className="celebration relative bg-gradient-to-br from-pink-600/30 to-purple-600/30 backdrop-blur-xl rounded-3xl border border-pink-400/30 p-6 shadow-2xl shadow-pink-500/20 transform transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-transparent to-transparent animate-pulse" />
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <PartyPopper className="w-6 h-6 text-yellow-300 animate-bounce" />
                    <h3 className="text-lg font-bold text-white tracking-wider">IT'S YOUR DAY!</h3>
                    <PartyPopper className="w-6 h-6 text-yellow-300 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  </div>
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-white mb-2 animate-shimmer bg-[length:200%_auto]">HAPPY BIRTHDAY!</div>
                  <div className="text-sm text-pink-100/90 mb-4 font-elegant italic">Today, January 14 is all about YOU! ✨</div>
                  
                  <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between text-white/90 border border-white/5">
                    <div className="text-center px-2">
                      <div className="text-lg font-mono font-bold">{currentTime}</div>
                      <div className="text-[10px] opacity-60 uppercase tracking-widest">Time</div>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-center px-2">
                      <div className="text-lg font-mono font-bold text-pink-300">20</div>
                      <div className="text-[10px] opacity-60 uppercase tracking-widest">Age</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                ref={clockRef}
                className="relative w-full flex flex-col items-center justify-center space-y-4 group"
              >
                {/* Clock Face with Glow */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 transition-transform duration-500 group-hover:scale-105">
                  <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl opacity-50 animate-pulse" />
                  
                  {/* Clock background */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]" />
                  
                  {/* Progress ring */}
                  <div className="absolute inset-2 rounded-full rotate-[-90deg]">
                    <svg className="w-full h-full">
                        <circle cx="50%" cy="50%" r="46%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                        <circle 
                            cx="50%" cy="50%" r="46%" fill="none" 
                            stroke="url(#gradient)" 
                            strokeWidth="4" 
                            strokeDasharray="289" // 2 * pi * r (approx)
                            strokeDashoffset={289 - (289 * (365 - daysUntilBirthday) / 365)}
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ec4899" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                  </div>
                  
                  {/* Clock hands */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                    <div className="clock-hand absolute top-1/2 left-1/2 w-0.5 h-8 bg-white/80 origin-bottom -translate-x-1/2 -translate-y-full rounded-full" />
                    <div className="clock-hand absolute top-1/2 left-1/2 w-0.5 h-10 bg-white origin-bottom -translate-x-1/2 -translate-y-full rounded-full" />
                    <div className="clock-hand absolute top-1/2 left-1/2 w-0.5 h-12 bg-pink-400 origin-bottom -translate-x-1/2 -translate-y-full rounded-full shadow-[0_0_5px_rgba(236,72,153,0.8)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg border border-pink-500" />
                  </div>
                  
                  {/* Center Text */}
                  <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center pointer-events-none">
                      <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Age 20</span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-pink-300" />
                    <span className="text-xs font-medium text-white/90 uppercase tracking-wide">Birthday Countdown</span>
                  </div>
                  
                  <div className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-tighter drop-shadow-lg">
                    {daysUntilBirthday}
                    <span className="text-sm font-normal text-white/60 ml-2 font-sans tracking-normal">days left</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 text-xs text-white/60 pt-2">
                    <div className="text-center">
                      <div className="font-mono text-white text-sm">{currentTime}</div>
                      <div className="text-[9px] uppercase tracking-wider mt-0.5">Now</div>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="text-center">
                      <div className="font-mono text-white text-sm">Jan 14</div>
                      <div className="text-[9px] uppercase tracking-wider mt-0.5">Target</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto-update indicator */}
            <div className="text-center mt-4 opacity-50 hover:opacity-100 transition-opacity">
              <div className="inline-flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span className="text-[10px] text-purple-200 font-mono tracking-widest uppercase">
                  {isBirthday ? '✨ Magical Day ✨' : 'Live Timer'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages Button (Fixed Position) */}
          <div
            ref={messagesButtonRef}
            onClick={() => setShowMessages(true)}
            className="fixed top-24 right-4 sm:top-1/3 sm:right-8 group cursor-pointer z-30"
          >
            <div className="relative text-3xl sm:text-4xl md:text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">💌</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1a1a2e] animate-bounce" />
            </div>
            <div className="absolute right-0 top-full mt-2 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2">
                <span className="text-xs bg-white/10 backdrop-blur-md px-2 py-1 rounded text-white border border-white/10">Read Messages</span>
            </div>
          </div>

          {/* Animated Cat */}
          <div
            ref={catRef}
            className="fixed bottom-4 left-4 text-3xl sm:text-4xl filter drop-shadow-[0_0_10px_rgba(251,191,36,0.3)] z-20 pointer-events-none opacity-90"
            role="img"
            aria-label="Animated cat"
          >
            🐱
          </div>

          {/* Mobile hint */}
          <div className="sm:hidden absolute bottom-2 left-0 right-0 text-center pointer-events-none opacity-50">
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">
              Scroll to explore
            </p>
          </div>
        </div>
        
        {/* Custom Styles */}
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
          
          /* Hide scrollbar but allow scrolling */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .perspective-1000 {
            perspective: 1000px;
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
