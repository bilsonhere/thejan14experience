import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight, Sparkles, Heart, Star, Home } from 'lucide-react';

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
  imperfection?: 'worn-fold' | 'off-center' | 'extra-crooked' | 'frayed-edge';
}

const LETTERS: Letter[] = [
  { 
    id: 1, 
    from: 'Maryam', 
    relation: 'Sissy',
    content: `My dearest Afrah,

As you turn twenty, I'm filled with memories of our laughter and secrets. 
You've grown into someone so strong and beautiful. 

Always here for you,
Maryam 💫`,
    rotation: -2.8,
    size: 0.92,
    pinPosition: 'tl',
    glowColor: '#f0abfc',
    folded: false,
    depth: 4,
    floatIntensity: 1.1,
    imperfection: 'worn-fold'
  },
  { 
    id: 2, 
    from: 'Fatima', 
    relation: 'Long Distance Sissy',
    content: `Afrah,

Even miles apart, you feel close. Your spirit shines through everything.
Can't wait to celebrate together soon.

With love,
Fatima 🌸`,
    rotation: 3.5,
    size: 0.95,
    pinPosition: 'tr',
    glowColor: '#c4b5fd',
    folded: true,
    depth: 2,
    floatIntensity: 0.9
  },
  { 
    id: 3, 
    from: 'Monira', 
    relation: 'Mufasa Mom',
    content: `My beautiful Afrah,

Watching you grow has been my greatest joy. You make us all proud.
Remember, you can achieve anything.

Always,
Monira 🌟`,
    rotation: 1.9,
    size: 0.88,
    pinPosition: 'bl',
    glowColor: '#93c5fd',
    folded: false,
    depth: 5,
    floatIntensity: 1.3
  },
  { 
    id: 4, 
    from: 'Lil Bro', 
    relation: 'Bilsis heartbeat',
    content: `AALU,
Best sister ever! Thanks for everything.

Love you tons,
Your Lil Bro 🎮`,
    rotation: -1.8,
    size: 1.0,
    pinPosition: 'br',
    glowColor: '#86efac',
    folded: true,
    depth: 1,
    floatIntensity: 1.0,
    imperfection: 'extra-crooked'
  },
  { 
    id: 5, 
    from: 'Anjila', 
    relation: 'Bilsi sissy',
    content: `please write,
Missing you and our moments.

Always,
Anjila 💕`,
    rotation: 2.3,
    size: 0.89,
    pinPosition: 'tl',
    glowColor: '#fde68a',
    folded: false,
    depth: 3,
    floatIntensity: 1.2
  },
  { 
    id: 6, 
    from: 'Prajol', 
    relation: 'Bilsi bestie',
    content: `my goat philoshoper,
Here's to deep talks and shared silences.

Cheers,
Prajol 🥂`,
    rotation: -3.4,
    size: 0.86,
    pinPosition: 'tr',
    glowColor: '#fca5a5',
    folded: true,
    depth: 2,
    floatIntensity: 0.8,
    imperfection: 'frayed-edge'
  },
  { 
    id: 7, 
    from: 'Aditi', 
    relation: 'Forever Friend',
    content: `Dearest Afrah,

Your kindness has always been your superpower.
May this year bring you all the joy you spread.

With admiration,
Aditi 🌺`,
    rotation: 0.7,
    size: 0.94,
    pinPosition: 'bl',
    glowColor: '#c084fc',
    folded: false,
    depth: 3,
    floatIntensity: 1.0,
    imperfection: 'off-center'
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
  const lanternsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          duration: 1.8, 
          ease: 'power3.out',
          onStart: () => {
            if (containerRef.current) {
              containerRef.current.style.display = 'block';
            }
          }
        }
      );

      // Create floating lanterns
      createFloatingLanterns();

      // Clear existing animations
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
              rotation: letter.rotation - 8,
              z: -150,
              filter: 'blur(10px)'
            },
            { 
              opacity: 1, 
              scale: isMobile ? letter.size * 0.85 : letter.size,
              x: isMobile ? pos.xMobile : pos.xDesktop,
              y: isMobile ? pos.yMobile : pos.yDesktop,
              rotation: letter.rotation,
              z: 0,
              filter: 'blur(0px)',
              duration: 1.8, 
              ease: 'power3.out',
              delay: i * 0.15,
              onComplete: () => {
                startGentleFloatingAnimation(ref, letter);
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
      animationRef.current.forEach(anim => anim.kill());
    };
  }, [isMobile]);

  const createFloatingLanterns = () => {
    if (!lanternsRef.current) return;
    
    const lanternCount = 3;
    const colors = ['#f0abfc', '#c4b5fd', '#93c5fd'];
    
    for (let i = 0; i < lanternCount; i++) {
      const lantern = document.createElement('div');
      lantern.className = 'absolute pointer-events-none';
      
      const size = 20 + Math.random() * 30;
      const left = 10 + (i * 25) + Math.random() * 10;
      const top = 15 + Math.random() * 20;
      const duration = 15 + Math.random() * 10;
      const delay = i * 2;
      
      lantern.innerHTML = `
        <div class="relative">
          <div class="absolute inset-0 rounded-full blur-md opacity-20" style="background: ${colors[i]}"></div>
          <div class="relative w-full h-full rounded-full" style="background: radial-gradient(circle at 30% 30%, ${colors[i]}40, transparent 70%)"></div>
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-4" style="background: linear-gradient(to bottom, ${colors[i]}60, transparent)"></div>
        </div>
      `;
      
      lantern.style.width = `${size}px`;
      lantern.style.height = `${size}px`;
      lantern.style.left = `${left}%`;
      lantern.style.top = `${top}%`;
      lantern.style.filter = 'blur(0.5px)';
      
      lanternsRef.current.appendChild(lantern);
      
      const timeline = gsap.timeline({ repeat: -1, delay });
      timeline
        .to(lantern, {
          y: -20,
          duration: duration,
          ease: "sine.inOut"
        })
        .to(lantern, {
          y: 0,
          duration: duration,
          ease: "sine.inOut"
        });
    }
  };

  const startGentleFloatingAnimation = (ref: HTMLDivElement, letter: Letter) => {
    const floatAnim = gsap.to(ref, {
      y: `+=${3 * letter.floatIntensity}`,
      rotation: letter.rotation + (0.5 * letter.floatIntensity),
      duration: 4 + letter.floatIntensity,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.5
    });
    animationRef.current.push(floatAnim);
  };

  const getLetterPositions = () => {
    // More breathing room, asymmetrical placement
    const desktopPositions = [
      { xDesktop: '-18vw', yDesktop: '-22vh' },   // Top left with space
      { xDesktop: '24vw', yDesktop: '-18vh' },    // Top right
      { xDesktop: '-30vw', yDesktop: '10vh' },    // Left middle - asymmetrical
      { xDesktop: '32vw', yDesktop: '12vh' },     // Right middle
      { xDesktop: '-12vw', yDesktop: '25vh' },    // Left bottom
      { xDesktop: '38vw', yDesktop: '-2vh' },     // Top right offset
      { xDesktop: '5vw', yDesktop: '30vh' },      // Center bottom - Aditi
    ];
    
    const mobilePositions = [
      { xMobile: '-20vw', yMobile: '-12vh' },
      { xMobile: '22vw', yMobile: '-8vh' },
      { xMobile: '-32vw', yMobile: '8vh' },
      { xMobile: '26vw', yMobile: '15vh' },
      { xMobile: '-14vw', yMobile: '25vh' },
      { xMobile: '18vw', yMobile: '5vh' },
      { xMobile: '0vw', yMobile: '35vh' },        // Aditi at bottom center on mobile
    ];

    return desktopPositions.map((pos, i) => ({
      ...pos,
      xMobile: mobilePositions[i].xMobile,
      yMobile: mobilePositions[i].yMobile
    }));
  };

  const handleClose = () => {
    setIsClosing(true);
    animationRef.current.forEach(anim => anim.kill());
    
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.97,
        duration: 1,
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
      animationRef.current.forEach(anim => anim.kill());
      
      gsap.to(ref, {
        scale: isMobile ? letter.size * 1.08 : letter.size * 1.12,
        y: `-=${isMobile ? 12 : 15}`,
        rotation: letter.rotation + 1.5,
        z: 25,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          setOpenedLetters(prev => [...prev, letter.id]);
          setTimeout(() => setSelectedLetter(letter), 250);
          gsap.to(ref, {
            scale: isMobile ? letter.size * 0.92 : letter.size * 0.88,
            y: `+=${isMobile ? 8 : 10}`,
            rotation: letter.rotation,
            z: 0,
            duration: 0.4,
            ease: 'power2.inOut'
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
          scale: 0.96,
          y: 15,
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
    const icons = {
      'tl': <CornerUpLeft className="w-3 h-3" />,
      'tr': <CornerUpRight className="w-3 h-3" />,
      'bl': <CornerDownLeft className="w-3 h-3" />,
      'br': <CornerDownRight className="w-3 h-3" />
    };
    return icons[position as keyof typeof icons];
  };

  const renderImperfection = (letter: Letter) => {
    switch(letter.imperfection) {
      case 'worn-fold':
        return (
          <div className="absolute -top-1 -right-1 w-6 h-8 bg-gradient-to-br from-white/30 to-white/5 rounded-sm transform rotate-12 opacity-70" />
        );
      case 'extra-crooked':
        return null; // Already handled by rotation
      case 'frayed-edge':
        return (
          <>
            <div className="absolute -bottom-1 left-2 w-8 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-1" />
            <div className="absolute -bottom-0.5 right-3 w-5 h-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -rotate-1" />
          </>
        );
      case 'off-center':
        return (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        );
      default:
        return null;
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
      {/* Fixed background with vignette */}
      <div className="fixed inset-0">
        {/* Room scene backdrop */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${roomImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'blur(6px) brightness(0.75)',
            opacity: 0.18,
          }}
        />
        
        {/* Gradient overlays with center vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-950/35 to-pink-950/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/10" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.15) 100%)'
        }} />
        
        {/* Graffiti "Happy Birthday Afrah" */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 transform -rotate-3">
            <div className="font-graffiti text-6xl sm:text-7xl md:text-8xl text-white/5 tracking-wider">
              Happy Birthday
            </div>
            <div className="font-graffiti text-5xl sm:text-6xl md:text-7xl text-white/5 tracking-wider mt-2 text-center">
              Afrah
            </div>
          </div>
        </div>
      </div>

      {/* Floating lanterns container */}
      <div ref={lanternsRef} className="absolute inset-0 pointer-events-none z-5" />

      {/* Title Section - More refined */}
      <div className="relative z-20 text-center pt-5 sm:pt-8 px-3">
        <div className="inline-flex flex-col items-center space-y-1.5">
          <h1 className="font-cursive text-2xl sm:text-3xl md:text-4xl text-white/95 tracking-wider">
            Birthday Messages
          </h1>
          <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
          <p className="font-elegant text-xs sm:text-sm text-purple-200/60 max-w-md mx-auto leading-tight">
            Letters from loved ones
          </p>
        </div>
      </div>

      {/* Counter - Subtle */}
      <div className="relative z-20 text-center mt-2 sm:mt-3">
        <div className="inline-flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5">
          <Heart className="w-3 h-3 text-pink-300/60 fill-pink-300/20" />
          <span className="font-elegant text-xs text-purple-100/70">
            {openedLetters.length} of {LETTERS.length}
          </span>
        </div>
      </div>

      {/* Main Content with breathing room */}
      <div className="relative z-10 w-full h-[calc(100%-130px)] sm:h-[calc(100%-150px)] overflow-hidden perspective-1000">
        {/* Letters */}
        <div className="relative w-full h-full">
          {LETTERS.map((letter, index) => {
            const isOpened = openedLetters.includes(letter.id);
            const isHovered = false; // We'll handle hover via CSS
            const positions = getLetterPositions();
            const xPos = isMobile ? positions[index].xMobile : positions[index].xDesktop;
            const yPos = isMobile ? positions[index].yMobile : positions[index].yDesktop;
            const cardSize = isMobile ? 'w-32 p-2.5' : 'w-36 sm:w-40 p-3 sm:p-4';
            
            // Depth-based styling
            const depthStyles = {
              1: { blur: '0px', saturation: '100%', shadow: '0 12px 24px rgba(0,0,0,0.25)' },
              2: { blur: '0.3px', saturation: '95%', shadow: '0 10px 20px rgba(0,0,0,0.2)' },
              3: { blur: '0.6px', saturation: '90%', shadow: '0 8px 16px rgba(0,0,0,0.15)' },
              4: { blur: '0.9px', saturation: '85%', shadow: '0 6px 12px rgba(0,0,0,0.12)' },
              5: { blur: '1.2px', saturation: '80%', shadow: '0 4px 8px rgba(0,0,0,0.1)' },
            };
            
            const depthStyle = depthStyles[letter.depth as keyof typeof depthStyles] || depthStyles[3];

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
                className="absolute cursor-pointer transform-gpu will-change-transform group"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(${xPos}, ${yPos}, ${letter.depth * 20}px) rotate(${letter.rotation}deg)`,
                  zIndex: letter.depth,
                  filter: `blur(${depthStyle.blur}) saturate(${depthStyle.saturation})`,
                }}
              >
                {/* Paper shadow with gradient gravity */}
                <div 
                  className="absolute -inset-2 rounded-lg opacity-40"
                  style={{
                    background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 60%)`,
                    transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1 + 2}px, 0)`,
                    filter: 'blur(6px)',
                  }}
                />

                {/* Folded paper effect */}
                {letter.folded && !isOpened && (
                  <>
                    <div className="absolute -top-1 -right-1 w-5 h-7 bg-gradient-to-br from-white/25 to-white/5 rounded-sm transform rotate-12 opacity-60" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-5 bg-gradient-to-br from-white/20 to-white/3 rounded-sm transform -rotate-6 opacity-40" />
                  </>
                )}

                {/* Imperfection */}
                {renderImperfection(letter)}
                
                {/* Pin with physical weight */}
                <div className={`absolute z-30 transition-all duration-700 group-hover:scale-110 ${
                  letter.pinPosition === 'tl' ? '-top-2 -left-2' :
                  letter.pinPosition === 'tr' ? '-top-2 -right-2' :
                  letter.pinPosition === 'bl' ? '-bottom-2 -left-2' :
                  '-bottom-2 -right-2'
                }`}>
                  <div className="relative">
                    {/* Pin shadow */}
                    <div className="absolute -inset-1 opacity-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent rounded-full blur-[1px] transform rotate-45" />
                    </div>
                    
                    {/* Pin body with metallic gradient */}
                    <div className="relative bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 p-1 rounded-full shadow-sm">
                      <div className="text-gray-600/80">
                        {getPinIcon(letter.pinPosition)}
                      </div>
                      {/* Pin head */}
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-full blur-[0.5px]" />
                    </div>
                    
                    {/* Sparkle only on hover */}
                    {!isOpened && (
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <Sparkles className="w-2 h-2 text-yellow-300/70" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Paper card */}
                <div className={`relative ${cardSize}
                  bg-gradient-to-br from-white/99 via-amber-50/98 to-white/98 
                  rounded-md sm:rounded-lg shadow-sm
                  border border-white/70 border-t-white/80 border-l-white/80
                  backdrop-blur-sm
                  transition-all duration-500 ease-out
                  ${isOpened ? 'opacity-90 saturate-80' : 'group-hover:shadow-md group-hover:border-white/80'}`}
                  style={{
                    boxShadow: depthStyle.shadow,
                  }}>
                  
                  {/* Bottom edge shading for gravity */}
                  <div className="absolute -bottom-1 left-1 right-1 h-1 bg-gradient-to-t from-black/5 to-transparent rounded-b-md sm:rounded-b-lg" />
                  
                  {/* Uneven corner radii */}
                  <div className="absolute top-0 right-0 w-3 h-3 overflow-hidden">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-white/30 rounded-bl-full transform translate-x-1 -translate-y-1" />
                  </div>
                  
                  {/* Paper texture */}
                  <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjMiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMyIvPjwvc3ZnPg==')] rounded-md sm:rounded-lg" />
                  
                  {/* Content with clear hierarchy */}
                  <div className="relative z-10">
                    {/* Sender's name - authority */}
                    <div className={`font-cursive text-base sm:text-lg tracking-[0.08em] ${
                      isOpened ? 'text-purple-700/70' : 'text-purple-900'
                    } font-medium mb-0.5 truncate`}>
                      {letter.from}
                    </div>
                    
                    {/* Relation - contextual softness */}
                    <div className="text-[10px] sm:text-[11px] font-elegant text-purple-600/50 mb-1 font-normal">
                      {letter.relation}
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px w-10 sm:w-12 bg-gradient-to-r from-purple-200/30 via-pink-200/30 to-transparent mb-1" />
                    
                    {/* Hint - whispering */}
                    <div className={`text-[10px] sm:text-[11px] font-elegant tracking-wide ${
                      isOpened ? 'text-purple-500/40 italic' : 'text-purple-600/40'
                    } leading-tight`}>
                      {isOpened ? 'cherished' : 'touch to read'}
                    </div>
                    
                    {/* Opened indicator */}
                    {isOpened && (
                      <div className="absolute bottom-1 right-1 flex gap-0.5">
                        <Heart className="w-2.5 h-2.5 text-pink-400/50 fill-pink-400/20" />
                        <Star className="w-2.5 h-2.5 text-yellow-400/30" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Letter Modal - Refined */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-950/70 to-black/60 backdrop-blur-xl"
            onClick={closeLetter}
          />
          
          <div className="letter-modal relative z-50 w-full max-w-xs sm:max-w-sm md:max-w-lg">
            {/* Modal paper */}
            <div className="relative bg-gradient-to-br from-white/99 via-amber-50/98 to-white/99 
              rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg
              border border-white/80 border-t-white/90 border-l-white/90
              backdrop-blur-xl overflow-hidden transform-gpu mx-auto">
              
              <div className="relative z-10 p-3 sm:p-4 md:p-6">
                {/* Header */}
                <div className="mb-4 sm:mb-5 md:mb-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="relative">
                        <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm">
                          {getPinIcon(selectedLetter.pinPosition)}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-cursive text-lg sm:text-xl md:text-2xl text-purple-900 font-medium truncate">
                          From {selectedLetter.from}
                        </div>
                        <div className="text-xs font-elegant text-purple-600/60 mt-0.5 truncate">
                          {selectedLetter.relation}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeLetter}
                      className="p-1 hover:bg-white/40 rounded-md transition-all duration-300 group flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600/70 group-hover:text-purple-800 transition-all duration-300" />
                    </button>
                  </div>
                  <div className="h-px w-16 sm:w-20 bg-gradient-to-r from-purple-200/40 via-pink-200/40 to-transparent" />
                </div>
                
                {/* Letter content */}
                <div className="relative">
                  <div className="font-elegant text-purple-900/90 leading-relaxed tracking-wide whitespace-pre-wrap text-sm sm:text-base 
                    max-h-[40vh] sm:max-h-[45vh] overflow-y-auto pr-1 sm:pr-2 
                    scrollbar-thin scrollbar-thumb-purple-300/20 scrollbar-track-transparent">
                    <div className="text-center py-2 sm:py-3 md:py-4">
                      <div className="text-xl sm:text-2xl font-cursive mb-3 sm:mb-4 text-purple-800">
                        {selectedLetter.content.split(',')[0]}
                      </div>
                      <div className="text-base sm:text-lg font-elegant text-purple-700/80">
                        {selectedLetter.content.split(',')[1]}
                      </div>
                    </div>
                  </div>
                  
                  {/* Fade effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 sm:h-6 bg-gradient-to-t from-white/98 to-transparent pointer-events-none" />
                </div>
                
                {/* Footer */}
                <div className="mt-3 sm:mt-4 md:mt-5 pt-2 sm:pt-3 border-t border-purple-200/20">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <div className="h-px w-4 sm:w-8 bg-gradient-to-r from-transparent via-purple-200/30 to-transparent" />
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pink-400/60 fill-pink-400/20" />
                      <span className="font-elegant text-[10px] sm:text-xs text-purple-600/40">
                        a cherished message
                      </span>
                    </div>
                    <div className="h-px w-4 sm:w-8 bg-gradient-to-r from-transparent via-pink-200/30 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-20 px-2 sm:px-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 max-w-4xl mx-auto">
          <div className="text-center sm:text-left">
            <div className="font-elegant text-xs text-purple-200/50">
              made with love
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClose}
              className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 backdrop-blur-md 
                rounded-md sm:rounded-lg transition-all duration-300 group"
            >
              <Home className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/60 group-hover:text-white/80" />
              <span className="font-elegant text-xs text-white/70 group-hover:text-white/90">return</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Instructions - More subtle */}
      {isMobile && !selectedLetter && (
        <div className="absolute bottom-14 left-0 right-0 z-20 px-2 animate-pulse" style={{ animationDuration: '4s' }}>
          <div className="text-center">
            <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="font-elegant text-[10px] text-purple-100/70">
                touch letters
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-in {
          0% { 
            opacity: 0; 
            transform: translateY(15px) scale(0.98); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        .letter-modal {
          animation: modal-in 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-gpu {
          transform-style: preserve-3d;
        }
        
        /* Graffiti font */
        .font-graffiti {
          font-family: 'Brush Script MT', cursive, sans-serif;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        /* Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 3px;
        }
        
        .scrollbar-thumb-purple-300\/20::-webkit-scrollbar-thumb {
          background-color: rgba(196, 181, 253, 0.2);
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
      `}</style>
    </div>
  );
}
