import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { X, Heart, Home, Star } from 'lucide-react';

interface Letter {
  id: number;
  from: string;
  relation: string;
  content: string;
  rotation: number;
  size: number;
  pinPosition: 'tl' | 'tr' | 'bl' | 'br';
  folded: boolean;
  depth: number;
  floatIntensity: number;
  imperfection: string;
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
    folded: false,
    depth: 2,
    floatIntensity: 1.1,
    imperfection: '2px 4px 2px 255px'
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
    folded: true,
    depth: 3,
    floatIntensity: 0.9,
    imperfection: '255px 15px 225px 15px/15px 225px 15px 255px'
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
    folded: false,
    depth: 4,
    floatIntensity: 1.3,
    imperfection: '3px 3px 3px 3px'
  },
  { 
    id: 4, 
    from: 'Lil Bro', 
    relation: 'Bilsis heartbeat',
    content: `AALU,
Your Lil Bro 🎮`,
    rotation: -4.2,
    size: 0.9,
    pinPosition: 'br',
    folded: true,
    depth: 1,
    floatIntensity: 1.0,
    imperfection: '2px 2px 25px 2px'
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
    folded: false,
    depth: 2,
    floatIntensity: 1.2,
    imperfection: '1px 1px 1px 1px'
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
    folded: true,
    depth: 3,
    floatIntensity: 0.8,
    imperfection: '2px 10px 2px 5px'
  },
  { 
    id: 7, 
    from: 'Aditi', 
    relation: 'Partner in Crime',
    content: `Happy Birthday Afrah!
Love, Aditi 🦋`,
    rotation: 6.5,
    size: 0.87,
    pinPosition: 'tl',
    folded: false,
    depth: 2,
    floatIntensity: 1.15,
    imperfection: '5px 2px 8px 2px'
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
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);
  // We use a ref to track if initial entrance animation is done so we don't repeat it on resize
  const initialAnimationDone = useRef(false);

  // 1. Handle Window Resize & Mouse (No GSAP here)
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
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 2. Handle GSAP Animations safely
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Setup Container
      gsap.set(containerRef.current, { opacity: 1 });
      
      // If this is the FIRST render, play entrance animation
      if (!initialAnimationDone.current) {
        gsap.from(containerRef.current, { 
          opacity: 0, 
          duration: 2, 
          ease: 'power2.inOut' 
        });

        LETTERS.forEach((letter, i) => {
          const ref = lettersRef.current[i];
          if (!ref) return;

          const positions = getLetterPositions();
          const pos = positions[i];
          const xVal = isMobile ? pos.xMobile : pos.xDesktop;
          const yVal = isMobile ? pos.yMobile : pos.yDesktop;

          // Set initial state
          gsap.set(ref, { 
            opacity: 0,
            scale: 0.3,
            x: xVal,
            y: yVal,
            rotation: letter.rotation + (Math.random() * 20 - 10),
            z: -100
          });

          // Animate In
          gsap.to(ref, { 
            opacity: 1, 
            scale: isMobile ? letter.size * 0.9 : letter.size,
            x: xVal,
            y: yVal,
            rotation: letter.rotation,
            z: 0,
            duration: 2, 
            ease: 'power3.out',
            delay: i * 0.15,
            onComplete: () => {
              // Start floating only after entrance is done
              startFloatingAnimation(ref, letter);
            }
          });
        });
        initialAnimationDone.current = true;
      } else {
        // If resizing (update), just move them to new positions smoothly
        // WITHOUT resetting opacity to 0
        LETTERS.forEach((letter, i) => {
          const ref = lettersRef.current[i];
          if (!ref) return;

          const positions = getLetterPositions();
          const pos = positions[i];
          const xVal = isMobile ? pos.xMobile : pos.xDesktop;
          const yVal = isMobile ? pos.yMobile : pos.yDesktop;

          // Kill only positioning tweens, keep float alive if possible
          // But simplest is to just re-animate position
          gsap.to(ref, {
            x: xVal,
            y: yVal,
            scale: isMobile ? letter.size * 0.9 : letter.size,
            duration: 0.5,
            ease: 'power2.out'
          });
          
          // Ensure float is running if it was killed by strict mode cleanup
          if (!gsap.isTweening(ref)) {
             startFloatingAnimation(ref, letter);
          }
        });
      }
    }, containerRef); // Scope to container

    return () => ctx.revert(); // Cleanup GSAP on unmount
  }, [isMobile]); // Re-run when mobile state changes

  const startFloatingAnimation = (ref: HTMLDivElement, letter: Letter) => {
    // Check if already floating to avoid double animations
    if (gsap.getTweensOf(ref).some(t => t.data === 'float')) return;

    gsap.to(ref, {
      y: `+=${3 * letter.floatIntensity}`,
      rotation: letter.rotation + (0.5 * letter.floatIntensity),
      duration: 3 + letter.floatIntensity,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      data: 'float' // Tag this tween
    });
  };

  const getLetterPositions = () => {
    const desktopPositions = [
      { xDesktop: '-18vw', yDesktop: '-22vh' },
      { xDesktop: '22vw', yDesktop: '-18vh' },
      { xDesktop: '-28vw', yDesktop: '8vh' },
      { xDesktop: '28vw', yDesktop: '12vh' },
      { xDesktop: '-12vw', yDesktop: '18vh' },
      { xDesktop: '32vw', yDesktop: '-2vh' },
      { xDesktop: '2vw', yDesktop: '-28vh' },
    ];
    
    const mobilePositions = [
      { xMobile: '-25vw', yMobile: '-18vh' },
      { xMobile: '20vw', yMobile: '-12vh' },
      { xMobile: '-28vw', yMobile: '8vh' },
      { xMobile: '25vw', yMobile: '15vh' },
      { xMobile: '-10vw', yMobile: '18vh' },
      { xMobile: '15vw', yMobile: '24vh' },
      { xMobile: '-5vw', yMobile: '-28vh' },
    ];

    return desktopPositions.map((pos, i) => ({
      ...pos,
      xMobile: mobilePositions[i] ? mobilePositions[i].xMobile : '0vw',
      yMobile: mobilePositions[i] ? mobilePositions[i].yMobile : '0vh'
    }));
  };

  const handleClose = () => {
    setIsClosing(true);
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.98,
        duration: 1,
        ease: 'power2.inOut',
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
      // Kill the float, but KEEP the current position so it doesn't jump
      gsap.killTweensOf(ref); 

      gsap.to(ref, {
        scale: isMobile ? letter.size * 1.05 : letter.size * 1.1,
        y: `-=${isMobile ? 15 : 15}`,
        rotation: letter.rotation + 1,
        z: 30,
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => {
          setOpenedLetters(prev => [...prev, letter.id]);
          setTimeout(() => setSelectedLetter(letter), 150);
          gsap.to(ref, {
            scale: isMobile ? letter.size * 0.95 : letter.size * 0.9,
            y: `+=${isMobile ? 10 : 10}`,
            rotation: letter.rotation,
            z: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => startFloatingAnimation(ref, letter) // Resume float
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
          scale: 0.95,
          y: 10,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => setSelectedLetter(null)
        });
      } else {
        setSelectedLetter(null);
      }
    }
  };

  const renderPin = (position: string) => {
    return (
        <div className={`absolute z-30 transition-all duration-500 ${
            position === 'tl' ? '-top-2 -left-1' :
            position === 'tr' ? '-top-2 -right-1' :
            position === 'bl' ? '-bottom-2 -left-1' :
            '-bottom-2 -right-1'
        }`}>
            <div className="absolute top-1.5 left-0.5 w-3 h-3 bg-black/40 blur-[2px] rounded-full" />
            <div className={`relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(0,0,0,0.3)] flex items-center justify-center`}>
                <div className="w-1 h-1 bg-slate-100/50 rounded-full blur-[0.5px]" />
            </div>
        </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 ${isClosing ? 'pointer-events-none' : ''}`}
      style={{ display: 'block', opacity: 1 }}
    >
      {/* Background Layer */}
      <div className="fixed inset-0">
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${roomImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'blur(12px) brightness(0.4)',
            transform: `scale(1.1) translate3d(${mousePosition.x * 5}px, ${mousePosition.y * 5}px, 0)`
          }}
        />
        
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-20 mix-blend-overlay rotate-[-5deg] z-0"
            style={{ transform: `translate(-50%, -50%) rotate(-5deg) translate3d(${mousePosition.x * -10}px, ${mousePosition.y * -10}px, 0)` }}
        >
            <h1 className="font-cursive text-6xl sm:text-8xl md:text-9xl text-pink-200/60 blur-[2px] tracking-widest">
                Happy Birthday Afrah
            </h1>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      </div>

      {/* Header */}
      <div className="relative z-20 text-center pt-8 sm:pt-10 px-4">
        <div className="inline-flex flex-col items-center">
          <h1 className="font-cursive text-2xl sm:text-3xl text-white/90 tracking-widest drop-shadow-lg">
            Messages
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent mt-3" />
        </div>
      </div>

      {/* Main Interactions */}
      <div className="relative z-10 w-full h-[calc(100%-120px)] overflow-hidden perspective-1000">
        
        {/* Strings */}
        <div className="absolute inset-0 pointer-events-none">
          {LETTERS.map((_, i) => {
            const positions = getLetterPositions();
            return (
              <div
                key={`string-${i}`}
                className="absolute w-[0.5px] bg-white/20"
                style={{
                  left: `calc(50% + ${isMobile ? parseFloat(positions[i].xMobile) / 2 : parseFloat(positions[i].xDesktop) / 2}vw)`,
                  top: '-10%',
                  height: '40%',
                  transformOrigin: 'top',
                  maskImage: 'linear-gradient(to bottom, black, transparent)'
                }}
              />
            );
          })}
        </div>

        {/* Letters */}
        <div className="relative w-full h-full">
          {LETTERS.map((letter, index) => {
            const isOpened = openedLetters.includes(letter.id);
            // We set initial styles here so they are visible even before GSAP takes over if there's a delay
            const positions = getLetterPositions();
            const xPos = isMobile ? positions[index].xMobile : positions[index].xDesktop;
            const yPos = isMobile ? positions[index].yMobile : positions[index].yDesktop;
            
            return (
              <div
                key={letter.id}
                ref={el => { lettersRef.current[index] = el; }}
                onClick={() => openLetter(letter)}
                className="absolute cursor-pointer transform-gpu will-change-transform group"
                style={{
                  left: '50%',
                  top: '50%',
                  // Fallback transform in case GSAP is slow
                  transform: `translate3d(${xPos}, ${yPos}, ${letter.depth * 10}px) rotate(${letter.rotation}deg)`,
                  zIndex: letter.depth,
                }}
              >
                <div 
                  className={`relative w-32 sm:w-40 p-4 transition-all duration-500 ease-out ${isOpened ? 'opacity-90 grayscale-[0.2]' : 'hover:-translate-y-1'}`}
                  style={{
                     boxShadow: `1px 2px 2px rgba(0,0,0,0.1), 2px 4px 8px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.15)`,
                  }}
                >
                  <div 
                    className="absolute inset-0 bg-[#fdfbf7]"
                    style={{
                        borderRadius: letter.imperfection || '2px',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
                    }}
                  />
                  {letter.folded && (
                     <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-black/5 to-transparent pointer-events-none rounded-br-sm" />
                  )}
                  {renderPin(letter.pinPosition)}

                  <div className="relative z-10 flex flex-col items-center justify-center min-h-[5rem] text-center">
                    <span className={`font-cursive text-lg text-slate-800 leading-none mb-1 transition-colors duration-300 ${isOpened ? 'text-slate-600' : ''}`}>
                      {letter.from}
                    </span>
                    <span className="font-elegant text-[10px] text-slate-500 tracking-wider uppercase opacity-80 mb-2">
                      {letter.relation}
                    </span>
                    <div className={`transition-all duration-500 ${isOpened ? 'opacity-0 h-0' : 'opacity-0 group-hover:opacity-100'}`}>
                        <span className="font-elegant text-[9px] text-slate-400 tracking-widest border-b border-slate-200 pb-0.5">
                            TAP TO READ
                        </span>
                    </div>
                    {isOpened && (
                         <Heart className="w-3 h-3 text-rose-300/80 fill-rose-100 mt-1" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500"
            onClick={closeLetter}
          />
          <div className="letter-modal relative z-50 w-full max-w-md animate-modal-in perspective-1000">
            <div className="relative bg-[#fdfbf7] rounded-sm sm:rounded-md shadow-2xl overflow-hidden transform-gpu rotate-1">
                <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wOCIvPjwvc3ZnPg==')]" />
                <div className="relative z-10 p-8 sm:p-10">
                    <button onClick={closeLetter} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="text-center mb-8">
                        <div className="font-cursive text-3xl text-slate-800 mb-2">{selectedLetter.from}</div>
                        <div className="font-elegant text-xs text-slate-500 uppercase tracking-widest">{selectedLetter.relation}</div>
                        <div className="w-12 h-px bg-slate-200 mx-auto mt-4" />
                    </div>
                    <div className="font-elegant text-slate-700 text-base leading-loose text-center px-4">
                        {selectedLetter.content.split(',').map((line, i) => (
                             <p key={i} className={i === 0 ? "mb-6 italic" : "font-cursive text-xl text-slate-600"}>
                                {line}
                             </p>
                        ))}
                    </div>
                    <div className="mt-10 flex justify-center">
                        <Heart className="w-4 h-4 text-rose-300 fill-rose-50" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
           <div className="flex gap-2">
                {openedLetters.length === LETTERS.length && (
                    <span className="font-elegant text-xs text-white/50 animate-pulse">All letters collected</span>
                )}
           </div>
           <button
             onClick={handleClose}
             className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full transition-all duration-500"
           >
             <Home className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
             <span className="font-elegant text-xs text-white/70 group-hover:text-white transition-colors tracking-wide">RETURN</span>
           </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          0% { opacity: 0; transform: translateY(20px) rotateX(10deg); }
          100% { opacity: 1; transform: translateY(0) rotateX(0); }
        }
        .animate-modal-in {
          animation: modal-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .perspective-1000 {
          perspective: 1200px;
        }
        .transform-gpu {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
