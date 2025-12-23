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
      // FIX: Set initial opacity to prevent flickering
      gsap.set(containerRef.current, { opacity: 1 });
      
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1.5, 
          ease: 'power4.out',
          onStart: () => {
            // Ensure no flickering by setting display
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
              scale: letter.size,
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
      y: `+=${6 * letter.floatIntensity}`,
      rotation: letter.rotation + (1 * letter.floatIntensity),
      duration: 2.5 + letter.floatIntensity,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.3
    });
    animationRef.current.push(floatAnim);
  };

  const getLetterPositions = () => {
    // Desktop positions - MOVED UPWARD significantly
    const desktopPositions = [
      { xDesktop: '-15vw', yDesktop: '-15vh' },   // Top left - moved up
      { xDesktop: '20vw', yDesktop: '-10vh' },    // Top right - moved up
      { xDesktop: '-25vw', yDesktop: '15vh' },    // Middle left - moved up
      { xDesktop: '30vw', yDesktop: '18vh' },     // Middle right - moved up
      { xDesktop: '-10vw', yDesktop: '25vh' },    // Bottom left - moved up
      { xDesktop: '35vw', yDesktop: '5vh' },      // Center right - moved up
    ];
    
    // Mobile positions - ADJUSTED for better visibility
    const mobilePositions = [
      { xMobile: '-25vw', yMobile: '-5vh' },      // Top left
      { xMobile: '20vw', yMobile: '0vh' },        // Top right
      { xMobile: '-30vw', yMobile: '15vh' },      // Middle left
      { xMobile: '25vw', yMobile: '20vh' },       // Middle right
      { xMobile: '-10vw', yMobile: '25vh' },      // Bottom left
      { xMobile: '15vw', yMobile: '30vh' },       // Bottom right
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
        scale: letter.size * (isMobile ? 1.15 : 1.1),
        y: `-=${isMobile ? 20 : 15}`,
        rotation: letter.rotation + 3,
        z: 30,
        duration: 0.6,
        ease: 'elastic.out(1.6)',
        onComplete: () => {
          setOpenedLetters(prev => [...prev, letter.id]);
          setTimeout(() => setSelectedLetter(letter), 250);
          gsap.to(ref, {
            scale: letter.size * (isMobile ? 1.05 : 0.9),
            y: `+=${isMobile ? 15 : 10}`,
            rotation: letter.rotation,
            z: 0,
            duration: 0.4,
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
      case 'tl': return <CornerUpLeft className="w-3 h-3" />;
      case 'tr': return <CornerUpRight className="w-3 h-3" />;
      case 'bl': return <CornerDownLeft className="w-3 h-3" />;
      case 'br': return <CornerDownRight className="w-3 h-3" />;
      default: return <CornerUpLeft className="w-3 h-3" />;
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
            filter: 'blur(10px) brightness(0.7)',
            opacity: 0.2,
            transform: `translate3d(${mousePosition.x * 10}px, ${mousePosition.y * 10}px, 0)`
          }}
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-purple-950/40 to-pink-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      </div>

      {/* Title Section */}
      <div className="relative z-20 text-center pt-6 sm:pt-10 md:pt-12 px-4">
        <div className="inline-flex flex-col items-center">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-pink-300/80 animate-pulse" />
            <h1 className="font-cursive text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 
              bg-clip-text text-transparent tracking-wider">
              Birthday Messages
            </h1>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-pink-300/80 animate-pulse" />
          </div>
          <p className="font-elegant text-xs sm:text-sm text-purple-200/70 max-w-xl mx-auto leading-relaxed">
            ✨ Letters from the specials for your special day 🎈
          </p>
          <div className="h-px w-24 sm:w-40 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent mt-2 sm:mt-3" />
        </div>
      </div>

      {/* Counter - Smaller and positioned better */}
      <div className="relative z-20 text-center mt-2 sm:mt-3">
        <div className="inline-flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 sm:px-4 sm:py-2">
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-300/80 fill-pink-300/30" />
          <span className="font-elegant text-xs sm:text-sm text-purple-100/90">
            {openedLetters.length}/{LETTERS.length} opened
          </span>
        </div>
      </div>

      {/* Main Content - Adjusted height for upward shift */}
      <div className="relative z-10 w-full h-[calc(100%-140px)] sm:h-[calc(100%-160px)] overflow-hidden perspective-1000">
        {/* Hanging strings - shorter since letters moved up */}
        <div className="absolute inset-0 pointer-events-none">
          {LETTERS.map((_, i) => {
            const positions = getLetterPositions();
            const yOffset = isMobile ? -15 : -20; // Shorter strings
            return (
              <div
                key={`string-${i}`}
                className="absolute w-px bg-gradient-to-b from-white/15 via-white/10 to-transparent"
                style={{
                  left: `calc(50% + ${isMobile ? 
                    parseFloat(positions[i].xMobile) / 2 : 
                    parseFloat(positions[i].xDesktop) / 2}vw)`,
                  top: `${15 + yOffset}%`,
                  height: '15vh',
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
                  transform: `translate3d(${xPos}, ${yPos}, ${letter.depth * 10}px) rotate(${letter.rotation}deg) scale(${letter.size})`,
                  zIndex: letter.depth,
                }}
              >
                {/* Glow effect for unopened letters - smaller */}
                {!isOpened && (
                  <div className="absolute -inset-4">
                    <div 
                      className="absolute inset-0 rounded-lg blur-md opacity-50 animate-pulse"
                      style={{ 
                        background: `radial-gradient(circle at center, ${letter.glowColor}30, transparent 70%)` 
                      }}
                    />
                  </div>
                )}

                {/* Folded paper effect - smaller */}
                {letter.folded && !isOpened && (
                  <>
                    <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-white/40 to-white/10 rounded transform rotate-12" />
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-white/30 to-white/5 rounded transform -rotate-6" />
                  </>
                )}
                
                {/* Pinned corner - smaller */}
                <div className={`absolute z-30 text-white/90 transition-all duration-500 ${
                  letter.pinPosition === 'tl' ? '-top-2 -left-2' :
                  letter.pinPosition === 'tr' ? '-top-2 -right-2' :
                  letter.pinPosition === 'bl' ? '-bottom-2 -left-2' :
                  '-bottom-2 -right-2'
                }`}>
                  <div className="relative">
                    <div className="absolute -inset-1 bg-white/20 rounded-full blur-xs" />
                    {getPinIcon(letter.pinPosition)}
                    {!isOpened && (
                      <Sparkles className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 text-yellow-300 animate-pulse" />
                    )}
                  </div>
                </div>
                
                {/* Paper shadow - smaller */}
                <div 
                  className="absolute -inset-2 bg-black/25 rounded-lg blur-md"
                  style={{
                    transform: `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 0)`
                  }}
                />
                
                {/* Paper card - SMALLER OUTER CARD */}
                <div className={`relative w-36 sm:w-44 md:w-48 p-3 sm:p-4 
                  bg-gradient-to-br from-white/98 via-amber-50/97 to-white/98 
                  rounded-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_10px_20px_rgba(0,0,0,0.15)]
                  border border-white/80 border-t-white/90 border-l-white/90 backdrop-blur-sm
                  transition-all duration-300 hover:shadow-[0_15px_30px_-6px_rgba(168,85,247,0.4)] ${
                  isOpened ? 'opacity-80' : 'hover:scale-102'
                }`}>
                  
                  {/* Paper texture */}
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wOCIvPjwvc3ZnPg==')] rounded-lg" />
                  
                  {/* Content - IMPROVED READABILITY */}
                  <div className="relative z-10">
                    <div className={`font-cursive text-base sm:text-lg tracking-[0.12em] bg-gradient-to-r ${
                      isOpened ? 'from-purple-600/70 via-pink-600/70 to-indigo-600/70' : 
                      'from-purple-800 via-pink-800 to-indigo-800'} 
                      bg-clip-text text-transparent mb-1 sm:mb-2 font-semibold`}>
                      {letter.from}
                    </div>
                    <div className="text-[10px] sm:text-xs font-elegant text-purple-700/70 mb-1 font-medium">
                      {letter.relation}
                    </div>
                    <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-purple-300/50 via-pink-300/50 to-transparent mb-1 sm:mb-2" />
                    <div className={`text-[10px] sm:text-xs font-elegant tracking-wide leading-tight ${
                      isOpened ? 'text-purple-500/60 italic' : 
                      'bg-gradient-to-r from-purple-700/80 via-pink-700/80 to-indigo-700/80 bg-clip-text text-transparent font-medium'
                    }`}>
                      {isOpened ? '💖' : 'Tap to read'}
                    </div>
                    {isOpened && (
                      <div className="absolute bottom-1 right-1 flex gap-0.5">
                        <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-400/70 fill-pink-400/30" />
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400/60" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Letter Modal - IMPROVED READABILITY */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/75 via-purple-950/85 to-black/75 backdrop-blur-xl"
            onClick={closeLetter}
          />
          
          <div className="letter-modal relative z-50 w-full max-w-lg sm:max-w-xl md:max-w-2xl animate-modal-in">
            {/* Modal paper */}
            <div className="relative bg-gradient-to-br from-white/99 via-amber-50/98 to-white/99 
              rounded-xl sm:rounded-2xl md:rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4),inset_0_2px_0_0_rgba(255,255,255,0.9)]
              border border-white/90 border-t-white/95 border-l-white/95
              backdrop-blur-2xl overflow-hidden transform-gpu mx-auto">
              
              <div className="relative z-10 p-4 sm:p-6 md:p-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative">
                        <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-100/80 to-pink-100/80 shadow-md">
                          {getPinIcon(selectedLetter.pinPosition)}
                        </div>
                      </div>
                      <div>
                        <div className="font-cursive text-xl sm:text-2xl md:text-3xl tracking-[0.1em] bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-900 
                          bg-clip-text text-transparent font-semibold">
                          From {selectedLetter.from}
                        </div>
                        <div className="text-xs sm:text-sm font-elegant text-purple-600/70 mt-0.5 font-medium">
                          {selectedLetter.relation}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeLetter}
                      className="p-1.5 sm:p-2 self-start sm:self-center hover:bg-white/40 rounded-lg transition-all duration-300 group"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700/80 group-hover:text-purple-900 transition-all duration-300" />
                    </button>
                  </div>
                  <div className="h-px w-20 sm:w-28 bg-gradient-to-r from-purple-300/60 via-pink-300/60 to-indigo-300/60" />
                </div>
                
                {/* Letter content - IMPROVED READABILITY */}
                <div className="relative">
                  <div className="font-elegant text-purple-900/95 leading-relaxed tracking-wide whitespace-pre-wrap text-base sm:text-lg 
                    max-h-[50vh] sm:max-h-[55vh] overflow-y-auto pr-2 sm:pr-4 
                    scrollbar-thin scrollbar-thumb-purple-300/40 scrollbar-track-transparent
                    bg-gradient-to-b from-white/80 to-transparent bg-clip-text">
                    <div className="text-center py-4 sm:py-6">
                      <div className="text-2xl sm:text-3xl font-cursive mb-3 sm:mb-4 bg-gradient-to-r from-purple-700 via-pink-700 to-indigo-700 bg-clip-text text-transparent">
                        {selectedLetter.content.split(',')[0]}
                      </div>
                      <div className="text-lg sm:text-xl font-elegant text-purple-800/90">
                        {selectedLetter.content.split(',')[1]}
                      </div>
                    </div>
                  </div>
                  
                  {/* Fade effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-6 sm:h-8 bg-gradient-to-t from-white/98 to-transparent pointer-events-none" />
                </div>
                
                {/* Footer */}
                <div className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 border-t border-purple-200/30">
                  <div className="flex items-center justify-center gap-2 sm:gap-4">
                    <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400/80 animate-pulse" />
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400/80 fill-pink-400/30" />
                      <span className="font-elegant text-xs sm:text-sm text-purple-600/60 font-medium">
                        URTHEBEST
                      </span>
                    </div>
                    <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent via-pink-300/40 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Adjusted position */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-20 px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 max-w-4xl mx-auto">
          <div className="text-center sm:text-left">
            <div className="font-elegant text-xs sm:text-sm text-purple-200/70">
              🎈🎈🎈
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md 
                rounded-lg sm:rounded-xl transition-all duration-300 group"
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4 text-white/80 group-hover:text-white" />
              <span className="font-elegant text-xs sm:text-sm text-white/90">Return to Room</span>
            </button>
            
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-2.5 py-1.5">
              <Star className="w-2.5 h-2.5 text-yellow-300/80" />
              <span className="font-elegant text-xs text-purple-200/70">
                Subhanallah<3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Instructions - Adjusted position */}
      {isMobile && !selectedLetter && (
        <div className="absolute bottom-16 left-0 right-0 z-20 px-3 animate-bounce">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
              <span className="font-elegant text-[10px] text-purple-100">
                Tap letters to read!
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-in {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .animate-modal-in {
          animation: modal-in 0.4s cubic-bezier(0.19, 1, 0.22, 1);
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
          width: 4px;
        }
        
        .scrollbar-thumb-purple-300\/40::-webkit-scrollbar-thumb {
          background-color: rgba(196, 181, 253, 0.4);
          border-radius: 4px;
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
        
        /* Small blur utility */
        .blur-xs {
          filter: blur(2px);
        }
      `}</style>
    </div>
  );
}
