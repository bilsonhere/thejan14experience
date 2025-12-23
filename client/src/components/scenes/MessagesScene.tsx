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
    size: 0.98,
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
    size: 1.05,
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
    size: 0.95,
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
    size: 1.08,
    pinPosition: 'br',
    glowColor: '#86efac',
    folded: true,
    depth: 1,
    floatIntensity: 1.0
  },
  { 
    id: 5, 
    from: 'Anjila', 
    relation: 'Bilsi's sissy',
    content: `please write,
Anjila 💕`,
    rotation: 2.7,
    size: 1.02,
    pinPosition: 'tl',
    glowColor: '#fde68a',
    folded: false,
    depth: 2,
    floatIntensity: 1.2
  },
  { 
    id: 6, 
    from: 'Prajol', 
    relation: 'Bilsi's bestie',
    content: `my goat philoshoper,
Prajol 🥂`,
    rotation: -3.1,
    size: 0.96,
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
      y: `+=${8 * letter.floatIntensity}`,
      rotation: letter.rotation + (1.5 * letter.floatIntensity),
      duration: 2.5 + letter.floatIntensity,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.3
    });
    animationRef.current.push(floatAnim);
  };

  const getLetterPositions = () => {
    // Desktop positions
    const desktopPositions = [
      { xDesktop: '-15vw', yDesktop: '-20vh' },
      { xDesktop: '20vw', yDesktop: '-15vh' },
      { xDesktop: '-25vw', yDesktop: '25vh' },
      { xDesktop: '30vw', yDesktop: '30vh' },
      { xDesktop: '-10vw', yDesktop: '40vh' },
      { xDesktop: '35vw', yDesktop: '-5vh' },
    ];
    
    // Mobile positions
    const mobilePositions = [
      { xMobile: '-30vw', yMobile: '-10vh' },
      { xMobile: '25vw', yMobile: '-5vh' },
      { xMobile: '-35vw', yMobile: '15vh' },
      { xMobile: '30vw', yMobile: '20vh' },
      { xMobile: '-15vw', yMobile: '30vh' },
      { xMobile: '20vw', yMobile: '40vh' },
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
        scale: letter.size * (isMobile ? 1.25 : 1.15),
        y: `-=${isMobile ? 40 : 30}`,
        rotation: letter.rotation + 5,
        z: 50,
        duration: 0.7,
        ease: 'elastic.out(1.8)',
        onComplete: () => {
          setOpenedLetters(prev => [...prev, letter.id]);
          setTimeout(() => setSelectedLetter(letter), 300);
          gsap.to(ref, {
            scale: letter.size * (isMobile ? 1.1 : 0.95),
            y: `+=${isMobile ? 30 : 20}`,
            rotation: letter.rotation,
            z: 0,
            duration: 0.5,
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
      case 'tl': return <CornerUpLeft className="w-4 h-4" />;
      case 'tr': return <CornerUpRight className="w-4 h-4" />;
      case 'bl': return <CornerDownLeft className="w-4 h-4" />;
      case 'br': return <CornerDownRight className="w-4 h-4" />;
      default: return <CornerUpLeft className="w-4 h-4" />;
    }
  };

  const allOpened = openedLetters.length === LETTERS.length;

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 ${isClosing ? 'pointer-events-none' : ''}`}
      style={{ 
        display: 'block', // FIX: Prevent flickering
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
            backgroundAttachment: 'fixed', // FIX: Prevents flickering
            filter: 'blur(12px) brightness(0.7)',
            opacity: 0.18,
            transform: `translate3d(${mousePosition.x * 15}px, ${mousePosition.y * 15}px, 0)`
          }}
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-purple-950/40 to-pink-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      </div>

      {/* Title Section */}
      <div className="relative z-20 text-center pt-8 sm:pt-12 md:pt-16 px-4">
        <div className="inline-flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-300/80 animate-pulse" />
            <h1 className="font-cursive text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 
              bg-clip-text text-transparent tracking-widest">
              Birthday Messages
            </h1>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-300/80 animate-pulse" />
          </div>
          <p className="font-elegant text-sm sm:text-base text-purple-200/70 max-w-xl mx-auto leading-relaxed">
           ✨ Letters from the specials for your special day 🎈
          </p>
          <div className="h-px w-32 sm:w-48 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent mt-4" />
        </div>
      </div>

      {/* Counter */}
      <div className="relative z-20 text-center mt-4">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <Heart className="w-4 h-4 text-pink-300/80 fill-pink-300/30" />
          <span className="font-elegant text-sm text-purple-100/90">
            {openedLetters.length} of {LETTERS.length} messages opened
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-[calc(100%-160px)] overflow-hidden perspective-1000">
        {/* Hanging strings */}
        <div className="absolute inset-0 pointer-events-none">
          {LETTERS.map((_, i) => {
            const positions = getLetterPositions();
            return (
              <div
                key={`string-${i}`}
                className="absolute w-px bg-gradient-to-b from-white/15 via-white/10 to-transparent"
                style={{
                  left: `calc(50% + ${isMobile ? 
                    parseFloat(positions[i].xMobile) / 2 : 
                    parseFloat(positions[i].xDesktop) / 2}vw)`,
                  top: '5%',
                  height: '20vh',
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
                  // FIX: Ensure element exists in DOM
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
                {/* Glow effect for unopened letters */}
                {!isOpened && (
                  <div className="absolute -inset-6">
                    <div 
                      className="absolute inset-0 rounded-xl blur-xl opacity-60 animate-pulse"
                      style={{ 
                        background: `radial-gradient(circle at center, ${letter.glowColor}40, transparent 70%)` 
                      }}
                    />
                  </div>
                )}

                {/* Folded paper effect */}
                {letter.folded && !isOpened && (
                  <>
                    <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-white/40 to-white/10 rounded-lg transform rotate-12" />
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-white/30 to-white/5 rounded-lg transform -rotate-6" />
                  </>
                )}
                
                {/* Pinned corner */}
                <div className={`absolute z-30 text-white/90 transition-all duration-500 ${
                  letter.pinPosition === 'tl' ? '-top-3 -left-3' :
                  letter.pinPosition === 'tr' ? '-top-3 -right-3' :
                  letter.pinPosition === 'bl' ? '-bottom-3 -left-3' :
                  '-bottom-3 -right-3'
                }`}>
                  <div className="relative">
                    <div className="absolute -inset-2 bg-white/20 rounded-full blur-sm" />
                    {getPinIcon(letter.pinPosition)}
                    {!isOpened && (
                      <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-yellow-300 animate-pulse" />
                    )}
                  </div>
                </div>
                
                {/* Paper shadow */}
                <div 
                  className="absolute -inset-3 bg-black/30 rounded-xl blur-lg"
                  style={{
                    transform: `translate3d(${mousePosition.x * 3}px, ${mousePosition.y * 3}px, 0)`
                  }}
                />
                
                {/* Paper card */}
                <div className={`relative w-48 sm:w-56 md:w-64 p-4 sm:p-6 
                  bg-gradient-to-br from-white/98 via-amber-50/97 to-white/98 
                  rounded-lg sm:rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_15px_30px_rgba(0,0,0,0.2)]
                  border border-white/80 border-t-white/90 border-l-white/90 backdrop-blur-sm
                  transition-all duration-300 hover:shadow-[0_20px_40px_-8px_rgba(168,85,247,0.4)] ${
                  isOpened ? 'opacity-75' : 'hover:scale-105'
                }`}>
                  
                  {/* Paper texture */}
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wOCIvPjwvc3ZnPg==')] rounded-lg sm:rounded-xl" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`font-cursive text-lg sm:text-xl tracking-[0.15em] bg-gradient-to-r ${isOpened ? 
                      'from-purple-600/60 via-pink-600/60 to-indigo-600/60' : 
                      'from-purple-800 via-pink-800 to-indigo-800'} 
                      bg-clip-text text-transparent mb-2 sm:mb-3`}>
                      {letter.from}
                    </div>
                    <div className="text-xs sm:text-sm font-elegant text-purple-600/60 mb-1">
                      {letter.relation}
                    </div>
                    <div className="h-px w-16 sm:w-20 bg-gradient-to-r from-purple-300/40 via-pink-300/40 to-transparent mb-2 sm:mb-3" />
                    <div className={`text-xs sm:text-sm font-elegant tracking-wide ${isOpened ? 
                      'text-purple-500/40 italic' : 
                      'bg-gradient-to-r from-purple-600/70 via-pink-600/70 to-indigo-600/70 bg-clip-text text-transparent'} 
                      leading-relaxed`}>
                      {isOpened ? '💖' : 'Tap to read message'}
                    </div>
                    {isOpened && (
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400/70 fill-pink-400/30" />
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400/60" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Letter Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-950/80 to-black/70 backdrop-blur-xl"
            onClick={closeLetter}
          />
          
          <div className="letter-modal relative z-50 w-full max-w-2xl animate-modal-in">
            {/* Modal paper */}
            <div className="relative bg-gradient-to-br from-white/99 via-amber-50/98 to-white/99 
              rounded-2xl md:rounded-3xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4),inset_0_2px_0_0_rgba(255,255,255,0.9)]
              border-2 border-white/90 border-t-white/95 border-l-white/95
              backdrop-blur-2xl overflow-hidden transform-gpu mx-auto">
              
              <div className="relative z-10 p-6 sm:p-8 md:p-10">
                {/* Header */}
                <div className="mb-6 sm:mb-8 md:mb-10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative">
                        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-100/80 to-pink-100/80 shadow-lg">
                          {getPinIcon(selectedLetter.pinPosition)}
                        </div>
                      </div>
                      <div>
                        <div className="font-cursive text-2xl sm:text-3xl tracking-[0.15em] bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-900 
                          bg-clip-text text-transparent">
                          From {selectedLetter.from}
                        </div>
                        <div className="text-sm font-elegant text-purple-600/70 mt-1">
                          {selectedLetter.relation} • Message #{selectedLetter.id}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeLetter}
                      className="p-2 self-start sm:self-center hover:bg-white/40 rounded-xl transition-all duration-300 group"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700/80 group-hover:text-purple-900 transition-all duration-300" />
                    </button>
                  </div>
                  <div className="h-px w-24 sm:w-32 bg-gradient-to-r from-purple-300/60 via-pink-300/60 to-indigo-300/60" />
                </div>
                
                {/* Letter content */}
                <div className="relative">
                  <div className="font-elegant text-purple-900/95 leading-relaxed tracking-wide whitespace-pre-wrap text-base sm:text-lg 
                    max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2 sm:pr-4 
                    scrollbar-thin scrollbar-thumb-purple-300/30 scrollbar-track-transparent">
                    {selectedLetter.content}
                  </div>
                  
                  {/* Fade effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 bg-gradient-to-t from-white/98 to-transparent pointer-events-none" />
                </div>
                
                {/* Footer */}
                <div className="mt-6 sm:mt-8 md:mt-10 pt-4 sm:pt-6 border-t border-purple-200/30">
                  <div className="flex items-center justify-center gap-3 sm:gap-6">
                    <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400/80 animate-pulse" />
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400/80 fill-pink-400/30" />
                      <span className="font-elegant text-xs sm:text-sm text-purple-600/60">
                        URTHEBEST
                      </span>
                    </div>
                    <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent via-pink-300/40 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="text-center sm:text-left">
            <div className="font-elegant text-sm text-purple-200/70">
              You are deeply cherished by everyone in the world. 
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md 
                rounded-xl transition-all duration-300 group"
            >
              <Home className="w-4 h-4 text-white/80 group-hover:text-white" />
              <span className="font-elegant text-sm text-white/90">Return to Room</span>
            </button>
            
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
              <Star className="w-3 h-3 text-yellow-300/80" />
              <span className="font-elegant text-xs text-purple-200/70">
                Subhanallah<3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Instructions */}
      {isMobile && !selectedLetter && (
        <div className="absolute bottom-20 left-0 right-0 z-20 px-4 animate-bounce">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span className="font-elegant text-xs text-purple-100">
                Tap letters to read messages!
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-in {
          0% { 
            opacity: 0; 
            transform: translateY(40px) scale(0.95); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .animate-modal-in {
          animation: modal-in 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-gpu {
          transform-style: preserve-3d;
        }
        
        /* Enhanced scrollbar for mobile */
        @media (max-width: 640px) {
          .scrollbar-thin::-webkit-scrollbar {
            width: 3px;
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
