import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight, Sparkles, Heart, Moon, Star, Music, Home } from 'lucide-react';

interface Letter {
  id: number;
  from: string;
  content: string;
  rotation: number;
  size: number;
  pinPosition: 'tl' | 'tr' | 'bl' | 'br';
  glowColor: string;
  folded: boolean;
  depth: number;
  floatIntensity: number;
  relation: string;
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
    pinPosition: 'tl',
    glowColor: '#f0abfc',
    folded: false,
    depth: 2,
    floatIntensity: 1.1
  },
  { 
    id: 2, 
    from: 'Fatima', 
    relation: 'Long Distance Sissy',
    content: `TBA,
Fatima 🌸`,
    rotation: 3.2,
    size: 0.88,
    pinPosition: 'tr',
    glowColor: '#c4b5fd',
    folded: true,
    depth: 3,
    floatIntensity: 0.9
  },
  { 
    id: 3, 
    from: 'Monira', 
    relation: 'Mufasa Mom',
    content: `TBA,
Monira 🌟`,
    rotation: 1.8,
    size: 0.82,
    pinPosition: 'bl',
    glowColor: '#93c5fd',
    folded: false,
    depth: 4,
    floatIntensity: 1.3
  },
  { 
    id: 4, 
    from: 'Lil Bro', 
    relation: 'Bilsis heartbeat',
    content: `AALU,
Your Lil Bro 🎮`,
    rotation: -1.2,
    size: 0.9,
    pinPosition: 'br',
    glowColor: '#86efac',
    folded: true,
    depth: 1,
    floatIntensity: 1.0
  },
  { 
    id: 5, 
    from: 'Anjila', 
    relation: 'Bilsi sissy',
    content: `please write,
Anjila 💕`,
    rotation: 2.7,
    size: 0.86,
    pinPosition: 'tl',
    glowColor: '#fde68a',
    folded: false,
    depth: 2,
    floatIntensity: 1.2
  },
  { 
    id: 6, 
    from: 'Prajol', 
    relation: 'Bilsi bestie',
    content: `my goat philoshoper,
Prajol 🥂`,
    rotation: -3.1,
    size: 0.84,
    pinPosition: 'tr',
    glowColor: '#fca5a5',
    folded: true,
    depth: 3,
    floatIntensity: 0.8
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
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize with GSAP
    if (containerRef.current) {
      gsap.set(containerRef.current, { opacity: 1 });
      
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1.5, 
          ease: 'power4.out',
          onStart: () => {
            if (containerRef.current) {
              containerRef.current.style.display = 'block';
            }
          }
        }
      );

      // Clear any existing animations
      animationRef.current.forEach(anim => anim.kill());
      animationRef.current = [];

      LETTERS.forEach((letter, i) => {
        const ref = lettersRef.current[i];
        if (ref) {
          const positions = getLetterPositions();
          const pos = positions[i];
          
          // Set initial state
          gsap.set(ref, {
            opacity: 1,
            display: 'block'
          });
          
          const anim = gsap.fromTo(ref,
            { 
              opacity: 0, 
              scale: 0.3,
              x: isMobile ? pos.xMobile : pos.xDesktop,
              y: isMobile ? pos.yMobile : pos.yDesktop,
              rotation: letter.rotation - 10,
              z: -100
            },
            { 
              opacity: 1, 
              scale: isMobile ? letter.size * 0.9 : letter.size, // Smaller on mobile
              x: isMobile ? pos.xMobile : pos.xDesktop,
              y: isMobile ? pos.yMobile : pos.yDesktop,
              rotation: letter.rotation,
              z: 0,
              duration: 1.5, 
              ease: 'back.out(2.5)',
              delay: i * 0.2,
              onComplete: () => {
                startFloatingAnimation(ref, letter);
              }
            }
          );
          animationRef.current.push(anim);
        }
      });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
      // Clean up animations
      animationRef.current.forEach(anim => anim.kill());
    };
  }, [isMobile]);

  const startFloatingAnimation = (ref: HTMLDivElement, letter: Letter) => {
    const floatAnim = gsap.to(ref, {
      y: `+=${4 * letter.floatIntensity}`,
      rotation: letter.rotation + (0.8 * letter.floatIntensity),
      duration: 2.5 + letter.floatIntensity,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.3
    });
    animationRef.current.push(floatAnim);
  };

  const getLetterPositions = () => {
    // Desktop positions - MOVED UPWARD even more
    const desktopPositions = [
      { xDesktop: '-15vw', yDesktop: '-25vh' },   // Top left - moved up more
      { xDesktop: '20vw', yDesktop: '-20vh' },    // Top right - moved up more
      { xDesktop: '-25vw', yDesktop: '5vh' },     // Middle left - moved up significantly
      { xDesktop: '30vw', yDesktop: '8vh' },      // Middle right - moved up significantly
      { xDesktop: '-10vw', yDesktop: '15vh' },    // Bottom left - moved up
      { xDesktop: '35vw', yDesktop: '-5vh' },     // Center right - moved up
    ];
    
    // Mobile positions - MOVED UPWARD and made smaller
    const mobilePositions = [
      { xMobile: '-22vw', yMobile: '-15vh' },     // Top left - moved up more
      { xMobile: '18vw', yMobile: '-10vh' },      // Top right - moved up more
      { xMobile: '-28vw', yMobile: '5vh' },       // Middle left - moved up
      { xMobile: '22vw', yMobile: '10vh' },       // Middle right - moved up
      { xMobile: '-8vw', yMobile: '15vh' },       // Bottom left - moved up
      { xMobile: '12vw', yMobile: '20vh' },       // Bottom right - moved up
    ];

    return desktopPositions.map((pos, i) => ({
      ...pos,
      xMobile: mobilePositions[i].xMobile,
      yMobile: mobilePositions[i].yMobile
    }));
  };

  const handleClose = () => {
    setIsClosing(true);
    // Clean up animations before closing
    animationRef.current.forEach(anim => anim.kill());
    
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'power3.inOut',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  const openLetter = (letter: Letter) => {
    if (openedLetters.includes(letter.id)) {
      setSelectedLetter(letter);
      return;
    }

    const letterIndex = letter.id - 1;
    const ref = lettersRef.current[letterIndex];
    
    if (ref) {
      // Kill floating animation for this letter
      animationRef.current.forEach(anim => anim.kill());
      
      gsap.to(ref, {
        scale: isMobile ? letter.size * 1.05 : letter.size * 1.1,
        y: `-=${isMobile ? 15 : 15}`,
        rotation: letter.rotation + 2,
        z: 20,
        duration: 0.5,
        ease: 'elastic.out(1.4)',
        onComplete: () => {
          setOpenedLetters(prev => [...prev, letter.id]);
          setTimeout(() => setSelectedLetter(letter), 200);
          gsap.to(ref, {
            scale: isMobile ? letter.size * 0.95 : letter.size * 0.9,
            y: `+=${isMobile ? 10 : 10}`,
            rotation: letter.rotation,
            z: 0,
            duration: 0.3,
            ease: 'power2.out'
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
          y: 20,
          rotationX: 5,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => setSelectedLetter(null)
        });
      } else {
        setSelectedLetter(null);
      }
    }
  };

  const getPinIcon = (position: string) => {
    switch(position) {
      case 'tl': return <CornerUpLeft className="w-2.5 h-2.5" />;
      case 'tr': return <CornerUpRight className="w-2.5 h-2.5" />;
      case 'bl': return <CornerDownLeft className="w-2.5 h-2.5" />;
      case 'br': return <CornerDownRight className="w-2.5 h-2.5" />;
      default: return <CornerUpLeft className="w-2.5 h-2.5" />;
    }
  };

  const allOpened = openedLetters.length === LETTERS.length;

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 ${isClosing ? 'pointer-events-none' : ''}`}
      style={{ 
        display: 'block',
        opacity: 1 
      }}
    >
      {/* Fixed background - prevents flickering */}
      <div className="fixed inset-0">
        {/* Room scene backdrop */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${roomImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'blur(8px) brightness(0.7)',
            opacity: 0.2,
            transform: `translate3d(${mousePosition.x * 8}px, ${mousePosition.y * 8}px, 0)`
          }}
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-purple-950/40 to-pink-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      </div>

      {/* Title Section - Compact */}
      <div className="relative z-20 text-center pt-4 sm:pt-8 px-3">
        <div className="inline-flex flex-col items-center">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300/80 animate-pulse" />
            <h1 className="font-cursive text-xl sm:text-2xl md:text-3xl bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 
              bg-clip-text text-transparent tracking-wider">
              Birthday Messages
            </h1>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300/80 animate-pulse" />
          </div>
          <p className="font-elegant text-[10px] sm:text-xs text-purple-200/70 max-w-md mx-auto leading-tight">
            ✨ Letters from the specials for your special day 🎈
          </p>
          <div className="h-px w-16 sm:w-32 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent mt-1.5 sm:mt-2" />
        </div>
      </div>

      {/* Counter - Compact */}
      <div className="relative z-20 text-center mt-1.5 sm:mt-2">
        <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5">
          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-300/80 fill-pink-300/30" />
          <span className="font-elegant text-[10px] sm:text-xs text-purple-100/90">
            {openedLetters.length}/{LETTERS.length}
          </span>
        </div>
      </div>

      {/* Main Content - More space at top */}
      <div className="relative z-10 w-full h-[calc(100%-120px)] sm:h-[calc(100%-140px)] overflow-hidden perspective-1000">
        {/* Hanging strings - shorter */}
        <div className="absolute inset-0 pointer-events-none">
          {LETTERS.map((_, i) => {
            const positions = getLetterPositions();
            const yOffset = isMobile ? -20 : -25; // Shorter strings
            return (
              <div
                key={`string-${i}`}
                className="absolute w-px bg-gradient-to-b from-white/15 via-white/10 to-transparent"
                style={{
                  left: `calc(50% + ${isMobile ? 
                    parseFloat(positions[i].xMobile) / 2 : 
                    parseFloat(positions[i].xDesktop) / 2}vw)`,
                  top: `${20 + yOffset}%`,
                  height: '12vh',
                  transformOrigin: 'top'
                }}
              />
            );
          })}
        </div>

        {/* Letters */}
        <div className="relative w-full h-full">
          {LETTERS.map((letter, index) => {
            const isOpened = openedLetters.includes(letter.id);
            const positions = getLetterPositions();
            const xPos = isMobile ? positions[index].xMobile : positions[index].xDesktop;
            const yPos = isMobile ? positions[index].yMobile : positions[index].yDesktop;
            const cardSize = isMobile ? 'w-32 p-2.5' : 'w-36 sm:w-40 p-3 sm:p-4';

            return (
              <div
                key={letter.id}
                ref={el => {
                  lettersRef.current[index] = el;
                  if (el) {
                    gsap.set(el, { opacity: 1, display: 'block' });
                  }
                }}
                onClick={() => openLetter(letter)}
                className="absolute cursor-pointer transform-gpu will-change-transform"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(${xPos}, ${yPos}, ${letter.depth * 10}px) rotate(${letter.rotation}deg)`,
                  zIndex: letter.depth,
                }}
              >
                {/* Glow effect for unopened letters - smaller */}
                {!isOpened && (
                  <div className="absolute -inset-3">
                    <div 
                      className="absolute inset-0 rounded-md blur-sm opacity-50 animate-pulse"
                      style={{ 
                        background: `radial-gradient(circle at center, ${letter.glowColor}30, transparent 70%)` 
                      }}
                    />
                  </div>
                )}

                {/* Folded paper effect - smaller */}
                {letter.folded && !isOpened && (
                  <>
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-white/40 to-white/10 rounded transform rotate-12" />
                    <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-gradient-to-br from-white/30 to-white/5 rounded transform -rotate-6" />
                  </>
                )}
                
                {/* Pinned corner - smaller */}
                <div className={`absolute z-30 text-white/90 transition-all duration-500 ${
                  letter.pinPosition === 'tl' ? '-top-1.5 -left-1.5' :
                  letter.pinPosition === 'tr' ? '-top-1.5 -right-1.5' :
                  letter.pinPosition === 'bl' ? '-bottom-1.5 -left-1.5' :
                  '-bottom-1.5 -right-1.5'
                }`}>
                  <div className="relative">
                    <div className="absolute -inset-1 bg-white/20 rounded-full blur-[1px]" />
                    {getPinIcon(letter.pinPosition)}
                    {!isOpened && (
                      <Sparkles className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 text-yellow-300 animate-pulse" />
                    )}
                  </div>
                </div>
                
                {/* Paper shadow - smaller */}
                <div 
                  className="absolute -inset-1.5 bg-black/25 rounded-md blur-sm"
                  style={{
                    transform: `translate3d(${mousePosition.x * 1.5}px, ${mousePosition.y * 1.5}px, 0)`
                  }}
                />
                
                {/* Paper card - EVEN SMALLER ON MOBILE */}
                <div className={`relative ${cardSize}
                  bg-gradient-to-br from-white/98 via-amber-50/97 to-white/98 
                  rounded-md sm:rounded-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_8px_16px_rgba(0,0,0,0.15)]
                  border border-white/80 border-t-white/90 border-l-white/90 backdrop-blur-sm
                  transition-all duration-250 hover:shadow-[0_12px_24px_-4px_rgba(168,85,247,0.4)] ${
                  isOpened ? 'opacity-85' : 'hover:scale-102'
                }`}>
                  
                  {/* Paper texture */}
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wOCIvPjwvc3ZnPg==')] rounded-md sm:rounded-lg" />
                  
                  {/* Content - COMPACT BUT READABLE */}
                  <div className="relative z-10">
                    <div className={`font-cursive text-sm sm:text-base tracking-[0.1em] bg-gradient-to-r ${
                      isOpened ? 'from-purple-600/70 via-pink-600/70 to-indigo-600/70' : 
                      'from-purple-800 via-pink-800 to-indigo-800'} 
                      bg-clip-text text-transparent mb-0.5 sm:mb-1 font-semibold truncate`}>
                      {letter.from}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-elegant text-purple-700/70 mb-0.5 font-medium truncate">
                      {letter.relation}
                    </div>
                    <div className="h-px w-8 sm:w-10 bg-gradient-to-r from-purple-300/50 via-pink-300/50 to-transparent mb-0.5 sm:mb-1" />
                    <div className={`text-[9px] sm:text-[10px] font-elegant tracking-wide leading-tight ${
                      isOpened ? 'text-purple-500/60 italic' : 
                      'bg-gradient-to-r from-purple-700/80 via-pink-700/80 to-indigo-700/80 bg-clip-text text-transparent font-medium'
                    }`}>
                      {isOpened ? '💖' : isMobile ? 'Tap' : 'Tap to read'}
                    </div>
                    {isOpened && (
                      <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
                        <Heart className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-pink-400/70 fill-pink-400/30" />
                        <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-400/60" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Letter Modal - Compact for mobile */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-950/90 to-black/80 backdrop-blur-xl"
            onClick={closeLetter}
          />
          
          <div className="letter-modal relative z-50 w-full max-w-xs sm:max-w-sm md:max-w-lg animate-modal-in">
            {/* Modal paper */}
            <div className="relative bg-gradient-to-br from-white/99 via-amber-50/98 to-white/99 
              rounded-lg sm:rounded-xl md:rounded-2xl shadow-[0_15px_30px_-8px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.9)]
              border border-white/90 border-t-white/95 border-l-white/95
              backdrop-blur-xl overflow-hidden transform-gpu mx-auto">
              
              <div className="relative z-10 p-3 sm:p-4 md:p-6">
                {/* Header - Compact */}
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="relative">
                        <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-purple-100/80 to-pink-100/80 shadow-sm">
                          {getPinIcon(selectedLetter.pinPosition)}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-cursive text-lg sm:text-xl md:text-2xl tracking-[0.08em] bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-900 
                          bg-clip-text text-transparent font-semibold truncate">
                          From {selectedLetter.from}
                        </div>
                        <div className="text-xs font-elegant text-purple-600/70 mt-0.5 font-medium truncate">
                          {selectedLetter.relation}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeLetter}
                      className="p-1 hover:bg-white/40 rounded-md transition-all duration-300 group flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-700/80 group-hover:text-purple-900 transition-all duration-300" />
                    </button>
                  </div>
                  <div className="h-px w-16 sm:w-20 bg-gradient-to-r from-purple-300/60 via-pink-300/60 to-indigo-300/60" />
                </div>
                
                {/* Letter content - Compact */}
                <div className="relative">
                  <div className="font-elegant text-purple-900/95 leading-relaxed tracking-wide whitespace-pre-wrap text-sm sm:text-base 
                    max-h-[40vh] sm:max-h-[45vh] overflow-y-auto pr-1 sm:pr-2 
                    scrollbar-thin scrollbar-thumb-purple-300/40 scrollbar-track-transparent">
                    <div className="text-center py-2 sm:py-3 md:py-4">
                      <div className="text-xl sm:text-2xl font-cursive mb-2 sm:mb-3 bg-gradient-to-r from-purple-700 via-pink-700 to-indigo-700 bg-clip-text text-transparent">
                        {selectedLetter.content.split(',')[0]}
                      </div>
                      <div className="text-base sm:text-lg font-elegant text-purple-800/90">
                        {selectedLetter.content.split(',')[1]}
                      </div>
                    </div>
                  </div>
                  
                  {/* Fade effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 sm:h-6 bg-gradient-to-t from-white/98 to-transparent pointer-events-none" />
                </div>
                
                {/* Footer - Compact */}
                <div className="mt-3 sm:mt-4 md:mt-5 pt-2 sm:pt-3 border-t border-purple-200/30">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <div className="h-px w-4 sm:w-8 bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400/80 animate-pulse" />
                      <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-400/80 fill-pink-400/30" />
                      <span className="font-elegant text-[10px] sm:text-xs text-purple-600/60 font-medium">
                        URTHEBEST
                      </span>
                    </div>
                    <div className="h-px w-4 sm:w-8 bg-gradient-to-r from-transparent via-pink-300/40 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Compact */}
      <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-20 px-2 sm:px-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 max-w-4xl mx-auto">
          <div className="text-center sm:text-left">
            <div className="font-elegant text-[10px] sm:text-xs text-purple-200/70">
              🎈🎈🎈
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClose}
              className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md 
                rounded-md sm:rounded-lg transition-all duration-300 group"
            >
              <Home className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/80 group-hover:text-white" />
              <span className="font-elegant text-[10px] sm:text-xs text-white/90">Return</span>
            </button>
            
            <div className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star className="w-2 h-2 text-yellow-300/80" />
              <span className="font-elegant text-[10px] text-purple-200/70">
                Subhanallah!!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Instructions - Compact */}
      {isMobile && !selectedLetter && (
        <div className="absolute bottom-14 left-0 right-0 z-20 px-2 animate-bounce">
          <div className="text-center">
            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
              <Sparkles className="w-2 h-2 text-yellow-300" />
              <span className="font-elegant text-[9px] text-purple-100">
                Tap letters!
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-in {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .animate-modal-in {
          animation: modal-in 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-gpu {
          transform-style: preserve-3d;
        }
        
        .hover-scale-102:hover {
          transform: scale(1.02);
        }
        
        /* Enhanced scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 3px;
        }
        
        .scrollbar-thumb-purple-300\/40::-webkit-scrollbar-thumb {
          background-color: rgba(196, 181, 253, 0.4);
          border-radius: 3px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        /* Prevent flickering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          backface-visibility: hidden;
        }
        
        /* Truncate text utility */
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
