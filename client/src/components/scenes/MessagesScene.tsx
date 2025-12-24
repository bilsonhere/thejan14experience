import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { X, Heart, Home, Star, Sparkles } from 'lucide-react';

interface Letter {
  id: number;
  from: string;
  relation: string;
  content: string;
  rotation: number;
  size: number;
  folded: boolean;
  depth: number;
  floatIntensity: number;
  glowColor: string;
  paperColor: string;
  borderColor: string;
}

const LETTERS: Letter[] = [
  { 
    id: 1, 
    from: 'Maryam', 
    relation: 'Sissy',
    content: `TBA,
Maryam 💫`,
    rotation: -2.5,
    size: 0.85,
    folded: false,
    depth: 3,
    floatIntensity: 1.1,
    glowColor: '#f0abfc',
    paperColor: 'from-[#fff9f0] via-[#fff5e6] to-[#fff0db]',
    borderColor: 'border-orange-300/30'
  },
  { 
    id: 2, 
    from: 'Fatima', 
    relation: 'Long Distance Sissy',
    content: `TBA,
Fatima 🌸`,
    rotation: 3.2,
    size: 0.88,
    folded: true,
    depth: 2,
    floatIntensity: 0.9,
    glowColor: '#c4b5fd',
    paperColor: 'from-[#f8f7ff] via-[#f3f1ff] to-[#eae7ff]',
    borderColor: 'border-purple-300/30'
  },
  { 
    id: 3, 
    from: 'Monira', 
    relation: 'Mufasa Mom',
    content: `TBA,
Monira 🌟`,
    rotation: 1.8,
    size: 0.82,
    folded: false,
    depth: 4,
    floatIntensity: 1.3,
    glowColor: '#93c5fd',
    paperColor: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]',
    borderColor: 'border-blue-300/30'
  },
  { 
    id: 4, 
    from: 'Lil Bro', 
    relation: 'Bilsis heartbeat',
    content: `AALU,
Your Lil Bro 🎮`,
    rotation: -4.2,
    size: 0.9,
    folded: true,
    depth: 1,
    floatIntensity: 1.0,
    glowColor: '#86efac',
    paperColor: 'from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0]',
    borderColor: 'border-green-300/30'
  },
  { 
    id: 5, 
    from: 'Anjila', 
    relation: 'Bilsi sissy',
    content: `please write,
Anjila 💕`,
    rotation: 2.7,
    size: 0.86,
    folded: false,
    depth: 3,
    floatIntensity: 1.2,
    glowColor: '#fde68a',
    paperColor: 'from-[#fefce8] via-[#fef9c3] to-[#fef08a]',
    borderColor: 'border-yellow-300/30'
  },
  { 
    id: 6, 
    from: 'Prajol', 
    relation: 'Bilsi bestie',
    content: `my goat philoshoper,
Prajol 🥂`,
    rotation: -3.1,
    size: 0.84,
    folded: true,
    depth: 2,
    floatIntensity: 0.8,
    glowColor: '#fca5a5',
    paperColor: 'from-[#fef2f2] via-[#fee2e2] to-[#fecaca]',
    borderColor: 'border-red-300/30'
  },
  { 
    id: 7, 
    from: 'Aditi', 
    relation: 'Bilsi frand',
    content: `Happy Birthday Afrah!
, Aditi 🦋`,
    rotation: 6.5,
    size: 0.87,
    folded: false,
    depth: 2,
    floatIntensity: 1.15,
    glowColor: '#c084fc',
    paperColor: 'from-[#faf5ff] via-[#f3e8ff] to-[#e9d5ff]',
    borderColor: 'border-violet-300/30'
  },
];

interface MessagesSceneProps {
  onClose: () => void;
  roomImage: string;
}

export function MessagesScene({ onClose, roomImage }: MessagesSceneProps) {
  const [openedLetters, setOpenedLetters] = useState<number[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [lanterns, setLanterns] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);
  const lanternsRef = useRef<(HTMLDivElement | null)[]>([]);
  const initialAnimationDone = useRef(false);

  // Initialize lanterns
  useEffect(() => {
    const newLanterns = [];
    const lanternCount = isMobile ? 4 : 6;
    
    for (let i = 0; i < lanternCount; i++) {
      newLanterns.push({
        id: i,
        x: Math.random() * 90 + 5,
        y: Math.random() * 30 + 10,
        size: 40 + Math.random() * 30,
        speed: 20 + Math.random() * 15
      });
    }
    
    setLanterns(newLanterns);
  }, [isMobile]);

  // Handle window resize & mouse
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    const handleMouseMove = (e: MouseEvent) => {
      const targetX = (e.clientX / window.innerWidth) * 2 - 1;
      const targetY = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition(prev => ({ 
        x: prev.x + (targetX - prev.x) * 0.1,
        y: prev.y + (targetY - prev.y) * 0.1
      }));
    };

    window.addEventListener('resize', checkMobile);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animate lanterns
    const animateLanterns = () => {
      lanternsRef.current.forEach((lantern, index) => {
        if (lantern) {
          gsap.to(lantern, {
            y: `+=${10}`,
            rotation: 5,
            duration: lanterns[index]?.speed || 20,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          });
        }
      });
    };

    if (lanternsRef.current.length > 0) {
      animateLanterns();
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [lanterns]);

  // Handle GSAP animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(containerRef.current, { opacity: 1 });
      
      if (!initialAnimationDone.current) {
        // Container entrance
        gsap.from(containerRef.current, { 
          opacity: 0, 
          duration: 1.5, 
          ease: 'power2.out' 
        });

        LETTERS.forEach((letter, i) => {
          const ref = lettersRef.current[i];
          if (!ref) return;

          const positions = getLetterPositions();
          const pos = positions[i];
          const xVal = isMobile ? pos.xMobile : pos.xDesktop;
          const yVal = isMobile ? pos.yMobile : pos.yDesktop;
          const scaleVal = isMobile ? letter.size * 0.75 : letter.size * 0.9;

          gsap.set(ref, { 
            opacity: 0,
            scale: 0.3,
            x: xVal,
            y: yVal,
            rotation: letter.rotation - 15,
            z: -100
          });

          gsap.to(ref, { 
            opacity: 1, 
            scale: scaleVal,
            x: xVal,
            y: yVal,
            rotation: letter.rotation,
            z: 0,
            duration: 1.5, 
            ease: 'back.out(1.7)',
            delay: i * 0.12,
            onComplete: () => {
              startFloatingAnimation(ref, letter);
            }
          });
        });
        
        initialAnimationDone.current = true;
      } else {
        LETTERS.forEach((letter, i) => {
          const ref = lettersRef.current[i];
          if (!ref) return;

          const positions = getLetterPositions();
          const pos = positions[i];
          const xVal = isMobile ? pos.xMobile : pos.xDesktop;
          const yVal = isMobile ? pos.yMobile : pos.yDesktop;
          const scaleVal = isMobile ? letter.size * 0.75 : letter.size * 0.9;

          gsap.to(ref, {
            x: xVal,
            y: yVal,
            scale: scaleVal,
            duration: 0.8,
            ease: 'power2.out'
          });
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  const startFloatingAnimation = (ref: HTMLDivElement, letter: Letter) => {
    if (gsap.getTweensOf(ref).some(t => t.data === 'float')) return;

    gsap.to(ref, {
      y: `+=${2.5 * letter.floatIntensity}`,
      rotation: letter.rotation + (0.3 * letter.floatIntensity),
      duration: 4 + letter.floatIntensity,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      data: 'float'
    });
  };

  const getLetterPositions = () => {
    // Better spacing for mobile to prevent overlap
    const desktopPositions = [
      { xDesktop: '-28vw', yDesktop: '-15vh' },
      { xDesktop: '26vw', yDesktop: '-12vh' },
      { xDesktop: '-32vw', yDesktop: '14vh' },
      { xDesktop: '28vw', yDesktop: '18vh' },
      { xDesktop: '-18vw', yDesktop: '22vh' },
      { xDesktop: '32vw', yDesktop: '-4vh' },
      { xDesktop: '0vw', yDesktop: '-22vh' },
    ];
    
    const mobilePositions = [
      { xMobile: '-40vw', yMobile: '-12vh' },
      { xMobile: '36vw', yMobile: '-8vh' },
      { xMobile: '-42vw', yMobile: '14vh' },
      { xMobile: '38vw', yMobile: '20vh' },
      { xMobile: '-24vw', yMobile: '24vh' },
      { xMobile: '28vw', yMobile: '32vh' },
      { xMobile: '0vw', yMobile: '-18vh' },
    ];

    return desktopPositions.map((pos, i) => ({
      ...pos,
      xMobile: mobilePositions[i]?.xMobile || '0vw',
      yMobile: mobilePositions[i]?.yMobile || '0vh'
    }));
  };

  const handleClose = () => {
    setIsClosing(true);
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: onClose
    });
  };

  const openLetter = (letter: Letter) => {
    if (openedLetters.includes(letter.id)) {
      setSelectedLetter(letter);
      return;
    }

    const letterIndex = letter.id - 1;
    const ref = lettersRef.current[letterIndex];
    const scaleVal = isMobile ? letter.size * 1.05 : letter.size * 1.1;
    
    if (ref) {
      gsap.killTweensOf(ref);

      gsap.to(ref, {
        scale: scaleVal,
        y: `-=${isMobile ? 10 : 15}`,
        rotation: letter.rotation + 2,
        z: 40,
        duration: 0.5,
        ease: 'elastic.out(1.2)',
        onComplete: () => {
          setOpenedLetters(prev => [...prev, letter.id]);
          setTimeout(() => setSelectedLetter(letter), 180);
          const returnScale = isMobile ? letter.size * 0.82 : letter.size * 0.88;
          gsap.to(ref, {
            scale: returnScale,
            y: `+=${isMobile ? 6 : 10}`,
            rotation: letter.rotation,
            z: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => startFloatingAnimation(ref, letter)
          });
        }
      });
    }
  };

  const closeLetter = () => {
    if (selectedLetter) {
      const modal = document.querySelector('.letter-modal');
      if (modal) {
        gsap.to(modal, {
          opacity: 0,
          scale: 0.9,
          y: 15,
          rotationX: 5,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => setSelectedLetter(null)
        });
      } else {
        setSelectedLetter(null);
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 ${isClosing ? 'pointer-events-none' : ''}`}
      style={{ display: 'block', opacity: 1 }}
    >
      {/* Enhanced Background Layer */}
      <div className="fixed inset-0">
        <div 
          className="absolute inset-0 transition-all duration-1000"
          style={{
            backgroundImage: `url(${roomImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px) brightness(0.35)',
            transform: `scale(1.05) translate3d(${mousePosition.x * 8}px, ${mousePosition.y * 8}px, 0)`
          }}
        />
        
        {/* Clean Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-transparent to-pink-400/10" />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%]"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05) 0%, transparent 70%)`,
            }}
          />
        </div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-transparent to-pink-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
        
        {/* Floating Lanterns */}
        <div className="absolute inset-0 pointer-events-none">
          {lanterns.map((lantern, index) => (
            <div
              key={lantern.id}
              ref={el => lanternsRef.current[index] = el}
              className="absolute will-change-transform"
              style={{
                left: `${lantern.x}%`,
                top: `${lantern.y}%`,
                width: `${lantern.size}px`,
                height: `${lantern.size}px`,
              }}
            >
              <div className="relative w-full h-full">
                <div 
                  className="absolute inset-0 rounded-full blur-md opacity-30"
                  style={{ background: `radial-gradient(circle at 30% 30%, #fde68a50, transparent 70%)` }}
                />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-yellow-200/40 via-orange-200/30 to-transparent backdrop-blur-sm border border-yellow-300/30" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-yellow-400/50 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Header - Enhanced */}
      <div className="relative z-20 text-center pt-6 sm:pt-10 px-4">
        <div className="inline-flex flex-col items-center space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300/90 animate-pulse" />
            <h1 className="font-cursive text-2xl sm:text-3xl md:text-4xl text-white/95 tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Birthday Messages
            </h1>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300/90 animate-pulse" />
          </div>
          <p className="font-elegant text-xs sm:text-sm text-purple-200/80 max-w-md mx-auto drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            Letters from loved ones ✨
          </p>
          <div className="h-px w-32 sm:w-48 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent mt-2" />
        </div>
      </div>

      {/* Progress Counter */}
      <div className="relative z-20 text-center mt-3 sm:mt-4">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20 shadow-lg">
          <Heart className="w-3.5 h-3.5 text-pink-300/90 fill-pink-300/30" />
          <span className="font-elegant text-xs text-white/95">
            {openedLetters.length}/{LETTERS.length} opened
          </span>
        </div>
      </div>

      {/* Main Content with better mobile spacing */}
      <div className="relative z-10 w-full h-[calc(100%-140px)] sm:h-[calc(100%-160px)] overflow-hidden perspective-1000">
        
        {/* Clean Simple Strings */}
        <div className="absolute inset-0 pointer-events-none">
          {LETTERS.map((_, i) => {
            const positions = getLetterPositions();
            const xVal = isMobile ? parseFloat(positions[i].xMobile) : parseFloat(positions[i].xDesktop);
            const yVal = isMobile ? parseFloat(positions[i].yMobile) : parseFloat(positions[i].yDesktop);
            
            return (
              <div
                key={`string-${i}`}
                className="absolute w-[0.2px] bg-gradient-to-b from-white/20 via-white/10 to-transparent"
                style={{
                  left: `calc(50% + ${xVal / 2}vw)`,
                  top: '-2%',
                  height: `calc(50% + ${Math.abs(yVal) * 0.7}vh)`,
                  transformOrigin: 'top',
                }}
              />
            );
          })}
        </div>

        {/* Letters with improved layout */}
        <div className="relative w-full h-full">
          {LETTERS.map((letter, index) => {
            const isOpened = openedLetters.includes(letter.id);
            const positions = getLetterPositions();
            const xPos = isMobile ? positions[index].xMobile : positions[index].xDesktop;
            const yPos = isMobile ? positions[index].yMobile : positions[index].yDesktop;
            
            return (
              <div
                key={letter.id}
                ref={el => { lettersRef.current[index] = el; }}
                onClick={() => openLetter(letter)}
                className="absolute cursor-pointer transform-gpu will-change-transform group touch-manipulation"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(${xPos}, ${yPos}, ${letter.depth * 15}px) rotate(${letter.rotation}deg)`,
                  zIndex: letter.depth,
                }}
              >
                {/* Letter glow effect */}
                {!isOpened && (
                  <div className="absolute -inset-2 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
                    <div 
                      className="absolute inset-0 rounded-lg blur-md"
                      style={{ background: `radial-gradient(circle at center, ${letter.glowColor}40, transparent 70%)` }}
                    />
                  </div>
                )}

                {/* Paper Container */}
                <div 
                  className={`relative transition-all duration-500 ease-out ${
                    isMobile ? 'w-32 p-3' : 'w-36 sm:w-40 p-3.5'
                  } ${isOpened ? 'opacity-90' : 'group-hover:-translate-y-1 group-hover:scale-105'} ${
                    letter.borderColor
                  }`}
                  style={{
                    boxShadow: `
                      inset 0 2px 4px rgba(255,255,255,0.9),
                      0 4px 12px rgba(0,0,0,0.15),
                      0 12px 24px rgba(0,0,0,0.2)
                    `,
                  }}
                >
                  {/* Paper with bright gradient */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${letter.paperColor} rounded-lg border-2`}
                    style={{
                      borderImage: `linear-gradient(135deg, ${letter.glowColor}20, transparent 70%) 1`,
                      backgroundImage: `
                        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")
                      `,
                    }}
                  />
                  
                  {/* Fold effect - Subtle */}
                  {letter.folded && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-5 bg-gradient-to-br from-black/15 to-transparent rounded-sm transform rotate-12" />
                  )}
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <span className={`font-cursive text-base sm:text-lg text-gray-900 leading-tight mb-1 transition-colors duration-300 ${
                      isOpened ? 'text-gray-700' : ''
                    }`}>
                      {letter.from}
                    </span>
                    <span className="font-elegant text-[10px] text-gray-700/90 tracking-widest uppercase mb-2">
                      {letter.relation}
                    </span>
                    <div className="h-px w-10 sm:w-14 bg-gradient-to-r from-transparent via-gray-400/50 to-transparent mb-2" />
                    <div className={`transition-all duration-500 ${
                      isOpened ? 'opacity-0 h-0' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <span className="font-elegant text-[9px] text-gray-600 tracking-widest border-b border-gray-300 pb-0.5">
                        TAP TO READ
                      </span>
                    </div>
                    {isOpened && (
                      <div className="flex items-center gap-1 mt-1">
                        <Heart className="w-3.5 h-3.5 text-pink-500/90 fill-pink-500/30" />
                        <Star className="w-3 h-3 text-yellow-500/70" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 touch-manipulation">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500"
            onClick={closeLetter}
          />
          <div className="letter-modal relative z-50 w-full max-w-sm sm:max-w-md md:max-w-lg animate-modal-in">
            <div className="relative bg-gradient-to-br from-[#fffefc] via-[#fffbf6] to-[#fff8ed] rounded-lg sm:rounded-xl shadow-2xl overflow-hidden">
              {/* Modal texture */}
              <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjMiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNiIvPjwvc3ZnPg==')]" />
              
              <div className="relative z-10 p-5 sm:p-7 md:p-8">
                {/* Close button */}
                <button 
                  onClick={closeLetter}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 hover:bg-gray-100/50 rounded-lg transition-colors duration-300"
                  aria-label="Close message"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                
                {/* Header */}
                <div className="text-center mb-5 sm:mb-7">
                  <div className="font-cursive text-xl sm:text-2xl text-gray-900 mb-1.5">
                    From {selectedLetter.from}
                  </div>
                  <div className="font-elegant text-xs sm:text-sm text-gray-700/90 tracking-widest uppercase">
                    {selectedLetter.relation}
                  </div>
                  <div className="w-14 sm:w-18 h-px bg-gradient-to-r from-transparent via-gray-400/60 to-transparent mx-auto mt-3" />
                </div>
                
                {/* Content */}
                <div className="font-elegant text-gray-800 text-center px-2 sm:px-4">
                  {selectedLetter.content.split(',').map((line, i) => (
                    <p 
                      key={i} 
                      className={`leading-relaxed ${
                        i === 0 
                          ? "text-base sm:text-lg mb-3 text-gray-900" 
                          : "text-xl sm:text-2xl font-cursive text-gray-700 mt-3"
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
                
                {/* Footer */}
                <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-300/50">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent via-gray-400/40 to-transparent" />
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-pink-500/80 fill-pink-500/30" />
                      <Star className="w-3 h-3 text-yellow-500/60" />
                      <span className="font-elegant text-xs text-gray-600/80">
                        A cherished message
                      </span>
                    </div>
                    <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent via-gray-400/40 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Navigation */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
          <div className="text-center sm:text-left">
            <div className="font-elegant text-xs text-white/70">
              {openedLetters.length === LETTERS.length ? (
                <span className="flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  All messages collected ✨
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-yellow-300/70" />
                  {LETTERS.length - openedLetters.length} remaining
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/20 backdrop-blur-lg border border-white/30 rounded-full transition-all duration-300 shadow-lg"
            aria-label="Return to room"
          >
            <Home className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" />
            <span className="font-elegant text-sm text-white/95 group-hover:text-white transition-colors">
              Return to Room
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Instruction */}
      {isMobile && !selectedLetter && openedLetters.length < LETTERS.length && (
        <div className="absolute bottom-24 left-0 right-0 z-20 px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-lg rounded-full px-4 py-2 animate-pulse border border-white/20 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span className="font-elegant text-xs text-white/95">
                Tap letters to read messages
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-in {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95) rotateX(5deg); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1) rotateX(0); 
          }
        }
        
        .animate-modal-in {
          animation: modal-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-gpu {
          transform-style: preserve-3d;
        }
        
        .touch-manipulation {
          touch-action: manipulation;
        }
        
        /* Mobile optimizations */
        @media (max-width: 767px) {
          .letter-modal {
            max-width: 95%;
            margin: 0 auto;
            max-height: 85vh;
            overflow-y: auto;
          }
          
          /* Prevent text selection on mobile */
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
          
          /* Allow text selection in modal */
          .letter-modal * {
            -webkit-user-select: text;
            user-select: text;
          }
        }
        
        /* Prevent flickering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
