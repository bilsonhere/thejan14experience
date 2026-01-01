import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { X, Heart, Home, Sparkles, Star } from 'lucide-react';

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
  color: string;
}

const LETTERS: Letter[] = [
  { id: 1, from: 'Maryam', relation: 'Sissy', content: `TBA,\nMaryam 💫`, rotation: -4, size: 0.9, pinPosition: 'tl', folded: false, depth: 2, color: '#f8f9fa' },
  { id: 2, from: 'Fatima', relation: 'Long Distance Sissy', content: `TBA,\nFatima 🌸`, rotation: 5, size: 0.92, pinPosition: 'tr', folded: true, depth: 3, color: '#fff5f5' },
  { id: 3, from: 'Monira', relation: 'Mufasa Mom', content: `TBA,\nMonira 🌟`, rotation: -2, size: 0.88, pinPosition: 'bl', folded: false, depth: 4, color: '#fffdf5' },
  { id: 4, from: 'Lil Bro', relation: 'Bilsis heartbeat', content: `Hellllooooo, Arahhhhhhhh
First of all Happpyyyy Birthdayyyyyy to youuuuuu
So proud of you!!!!!!🥳🥳

Just wanted to stay that you are truly an amazing soul. The way you make bilson (my idiot) happy and make him feel alive means a lot to me. 
Just remember even though I have never met you. You are truly great and deserve the whole world.

Allumdulhillah,\n Aayush 🎮`, rotation: 6, size: 0.95, pinPosition: 'br', folded: true, depth: 1, color: '#f8f9fa' },
  { id: 5, from: 'Anjila', relation: 'Bilsi sissy', content: `Happy birthday\n 🤍 I hope today reminds you of how loved and appreciated you are. hope this year treats you kindly and gives you moments that feel as special as a perfect race weekend for your favorite team . wishing you happiness, peace all the good things today and always 💌\nAnjila 💕`, rotation: -7, size: 0.86, pinPosition: 'tl', folded: false, depth: 2, color: '#fff0f5' },
  { id: 6, from: 'Prajol', relation: 'Bilsi bestie', content: `Hey happy birthday. I am Bilson's bestfriend. Thank you for making him a better person and I hope this message finds you well. If I have to say a piece of advice, it is this : "Now we all have a great need for acceptance, but you must trust that your beliefs are unique.” Again happy birthday from my side, enjoy the day💕\nPrajol 🥂`, rotation: 3, size: 0.84, pinPosition: 'tr', folded: true, depth: 3, color: '#fdfbf7' },
  { id: 7, from: 'Aditi', relation: 'Partner in Crime', content: `Happy Birthday Afrah!\nLove, Aditi 🦋`, rotation: -3, size: 0.9, pinPosition: 'tl', folded: false, depth: 2, color: '#fcfcfc' },
];

// Generate random lanterns
const LANTERNS = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100, // Random horizontal start
  yStart: 110 + Math.random() * 50, // Start below screen
  scale: 0.5 + Math.random() * 0.5,
  duration: 15 + Math.random() * 20,
  delay: Math.random() * -20, // Negative delay to start mid-air
}));

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
  const lanternsRef = useRef<(HTMLDivElement | null)[]>([]);
  const initialAnimationDone = useRef(false);

  // 1. Mobile Check & Mouse Parallax
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize -1 to 1
      const targetX = (e.clientX / window.innerWidth) * 2 - 1;
      const targetY = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x: targetX, y: targetY });
    };

    window.addEventListener('resize', checkMobile);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 2. GSAP Animations (Fixed Logic)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // --- Lanterns Animation ---
      lanternsRef.current.forEach((lantern, i) => {
        if (!lantern) return;
        // Float Up
        gsap.to(lantern, {
          y: '-120vh',
          duration: LANTERNS[i].duration,
          ease: 'none',
          repeat: -1,
          delay: LANTERNS[i].delay, // Start at different times/heights
        });
        // Sway
        gsap.to(lantern, {
          x: '+=30',
          duration: 3 + Math.random() * 2,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
        // Flicker
        gsap.to(lantern, {
          opacity: 0.6,
          duration: 0.5 + Math.random(),
          yoyo: true,
          repeat: -1,
          ease: 'rough({ strength: 1, points: 20 })'
        });
      });

      // --- Letters Logic ---
      LETTERS.forEach((letter, i) => {
        const ref = lettersRef.current[i];
        if (!ref) return;

        const { x, y } = getPosition(i, isMobile);

        if (!initialAnimationDone.current) {
          // INITIAL ENTRANCE (Opacity 0 -> 1)
          gsap.set(ref, { 
            x, y, 
            scale: 0, 
            opacity: 0, 
            rotation: letter.rotation + (Math.random() * 40 - 20) 
          });

          gsap.to(ref, {
            opacity: 1,
            scale: isMobile ? 0.8 : letter.size,
            x, y,
            rotation: letter.rotation,
            duration: 1.5,
            ease: 'back.out(1.2)',
            delay: 0.2 + (i * 0.1),
            onComplete: () => startHoverFloat(ref, letter)
          });
        } else {
          // RESIZE UPDATE (Keep Opacity 1)
          // We kill previous positioning tweens but keep the float loop if possible
          gsap.to(ref, {
            x, y,
            scale: isMobile ? 0.8 : letter.size,
            duration: 0.8,
            ease: 'power2.inOut',
            overwrite: 'auto', // prevents conflict
            onComplete: () => {
                // Restart float if it got killed by overwrite
                startHoverFloat(ref, letter);
            }
          });
        }
      });

      initialAnimationDone.current = true;

    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]); // Re-run when mobile changes

  const startHoverFloat = (element: Element, letter: Letter) => {
    // Only add float if not currently being opened/interacted with
    if (gsap.isTweening(element) && !initialAnimationDone.current) return;
    
    gsap.to(element, {
      y: `+=${10 + Math.random() * 10}`,
      rotation: `+=${Math.random() * 2 - 1}`,
      duration: 3 + Math.random() * 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      overwrite: false // Don't kill the positioning tween
    });
  };

  const getPosition = (index: number, mobile: boolean) => {
    if (mobile) {
        // Grid System for Mobile to prevent overlaps
        const cols = 2;
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        // Spread evenly: col 0 is left, col 1 is right
        // x: -25vw for left, 25vw for right
        const x = col === 0 ? '-22vw' : '22vw';
        
        // y: start from top, space out by 20vh
        // Shift up slightly (-30vh start)
        const y = `${-25 + (row * 18)}vh`;
        
        return { x, y };
    }
    
    // Desktop Scatter (Organized Chaos)
    const positions = [
        { x: '-20vw', y: '-22vh' },
        { x: '20vw', y: '-25vh' },
        { x: '-32vw', y: '5vh' },
        { x: '32vw', y: '8vh' },
        { x: '-10vw', y: '25vh' },
        { x: '12vw', y: '28vh' },
        { x: '0vw', y: '-2vh' }, // Center one
    ];
    return positions[index] || { x: '0vw', y: '0vh' };
  };

  const handleClose = () => {
    setIsClosing(true);
    gsap.to(containerRef.current, {
        opacity: 0,
        scale: 1.1,
        filter: 'blur(10px)',
        duration: 0.8,
        ease: 'power2.in',
        onComplete: onClose
    });
  };

  const openLetter = (letter: Letter) => {
    // Prevent opening if already animating or mobile check glitch
    if (!lettersRef.current[letter.id - 1]) return;

    if (openedLetters.includes(letter.id)) {
      setSelectedLetter(letter);
      return;
    }

    const ref = lettersRef.current[letter.id - 1];
    
    // Animate the letter "popping" up
    gsap.to(ref, {
        scale: isMobile ? 1.0 : 1.2,
        z: 100,
        rotation: 0,
        duration: 0.4,
        ease: 'back.out(1.7)',
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            setOpenedLetters(prev => [...prev, letter.id]);
            setSelectedLetter(letter);
        }
    });
  };

  const closeModal = () => {
      setSelectedLetter(null);
  };

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 overflow-hidden bg-slate-950 select-none"
    >
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out"
          style={{
            backgroundImage: `url(${roomImage})`,
            filter: 'brightness(0.3) blur(4px)',
            transform: `scale(1.1) translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`
          }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.8)_90%)]" />
      </div>

      {/* 2. Floating Lanterns (Behind Letters) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {LANTERNS.map((l, i) => (
            <div 
                key={i}
                ref={el => lanternsRef.current[i] = el}
                className="absolute left-0 bottom-0"
                style={{ 
                    left: `${l.x}%`,
                    transform: `scale(${l.scale})`
                }}
            >
                {/* Lantern Body */}
                <div className="relative flex flex-col items-center">
                    <div className="w-1 h-8 bg-white/10" /> {/* String */}
                    <div className="relative">
                        {/* Glow */}
                        <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-40 animate-pulse" />
                        <div className="w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-b from-orange-200 to-orange-500 rounded-lg opacity-90 shadow-[0_0_15px_rgba(255,165,0,0.6)] flex items-center justify-center">
                            <div className="w-2 h-2 bg-yellow-100 rounded-full blur-[1px]" />
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* 3. Header */}
      <div className="relative z-30 pt-8 sm:pt-12 text-center pointer-events-none">
        <div className="inline-block relative">
            <h1 className="font-cursive text-4xl sm:text-5xl text-orange-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Birthday Wishes
            </h1>
            <Sparkles className="absolute -top-4 -right-6 w-6 h-6 text-yellow-200 animate-spin-slow opacity-80" />
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-orange-200/50 to-transparent mt-2" />
        </div>
      </div>

      {/* 4. Letters Container */}
      <div className="relative z-20 w-full h-full flex items-center justify-center perspective-1000">
        {LETTERS.map((letter, index) => {
           const isOpened = openedLetters.includes(letter.id);

           return (
            <div
              key={letter.id}
              ref={el => lettersRef.current[index] = el}
              onClick={() => openLetter(letter)}
              className="absolute cursor-pointer will-change-transform"
              style={{ zIndex: letter.depth }}
            >
              <div 
                className={`
                    relative group transition-all duration-300
                    ${isOpened ? 'brightness-90' : 'hover:-translate-y-2 hover:brightness-110'}
                `}
              >
                 {/* Envelope / Paper */}
                 <div 
                    className="w-32 h-24 sm:w-40 sm:h-32 shadow-2xl flex items-center justify-center text-center p-3 transform-gpu"
                    style={{
                        backgroundColor: letter.color,
                        borderRadius: '2px',
                        transform: 'rotateX(10deg)',
                        boxShadow: '1px 1px 0px #e2e2e2, 2px 2px 0px #d1d1d1, 5px 5px 15px rgba(0,0,0,0.4)'
                    }}
                 >
                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }} 
                    />

                    {/* Content Preview */}
                    <div className="relative z-10">
                        <span className="font-cursive text-xl text-slate-800 block leading-none pb-1">{letter.from}</span>
                        <span className="font-sans text-[9px] uppercase tracking-widest text-slate-500 border-t border-slate-300 pt-1 block">
                            {letter.relation}
                        </span>
                    </div>

                    {/* Opened Indicator */}
                    {isOpened && (
                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                        </div>
                    )}
                 </div>

                 {/* Pin */}
                 <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-3 h-3 rounded-full bg-gradient-to-br from-red-800 to-red-600 shadow-md border border-white/20`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Modal (Reading Mode) */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={closeModal}
          />
          
          <div className="relative w-full max-w-md bg-[#fffdf5] rounded-sm p-8 shadow-2xl transform animate-in zoom-in-95 duration-300 rotate-1">
             {/* Paper Texture */}
             <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
             
             <button onClick={closeModal} className="absolute top-3 right-3 p-2 text-slate-400 hover:text-red-500 transition-colors z-20">
                <X className="w-6 h-6" />
             </button>

             <div className="relative z-10 text-center space-y-6">
                <div className="flex justify-center text-orange-300">
                    <Star className="w-5 h-5 fill-current animate-pulse" />
                </div>
                
                <h2 className="font-cursive text-4xl text-slate-800 border-b border-slate-200 pb-4 mx-8">
                    {selectedLetter.from}
                </h2>
                
                <div className="font-garamond text-[19px] leading-[1.75] text-slate-700 min-h-[120px] flex flex-col justify-center">
  {selectedLetter.content.split('\n').map((line, i, arr) => {
    const isFirst = i === 0;
    const isLast = i === arr.length - 1;
    const isSignature =
      isLast &&
      (line.includes('—') ||
        line.toLowerCase().includes('love') ||
        line.toLowerCase().includes('from') ||
        line.length < 22);

    return (
      <p
        key={i}
        className={`
          ${isFirst ? 'mb-4 text-[20px]' : 'mb-2'}
          ${isSignature ? 'mt-6 italic text-slate-600 text-right' : ''}
          whitespace-pre-wrap
        `}
      >
        {line}
      </p>
    );
  })}
</div>


                <div className="pt-4">
                    <Heart className="w-5 h-5 mx-auto text-red-300 fill-red-100" />
                </div>
             </div>
          </div>
        </div>
      )}

      {/* 6. Footer Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <button
            onClick={handleClose}
            className="pointer-events-auto flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white/90 transition-all hover:scale-105 active:scale-95 group shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
            <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-sans text-xs font-bold tracking-widest uppercase">Return to Room</span>
        </button>
      </div>

      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');

.font-garamond {
  font-family: 'EB Garamond', serif;
}

        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Playfair+Display:ital@0;1&display=swap');
        .font-cursive { font-family: 'Dancing Script', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .perspective-1000 { perspective: 1000px; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
