import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight, Sparkles, Heart, Moon, Star, Music } from 'lucide-react';

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
}

const LETTERS: Letter[] = [
  { 
    id: 1, 
    from: 'Family', 
    content: `Our dearest Afrah,

As you turn twenty, our hearts swell with memories of every moment that led here.
The laughter that filled our home, the quiet strength you've always carried.

We watch you grow into someone whose kindness touches everyone around you.
May this year bring you the peace you deserve, the joy you create, and the love you've always given.

With all our love,
Always.`,
    rotation: -1.5,
    size: 0.95,
    pinPosition: 'tl',
    glowColor: '#f0abfc',
    folded: true,
    depth: 2,
    floatIntensity: 1.2
  },
  { 
    id: 2, 
    from: 'Friends', 
    content: `Afrah,

Happy birthday, friend.
Not just for the celebrations today, but for all the ordinary days you've made extraordinary.
For the coffee runs that turned into deep talks, the silences that never felt empty.

Here's to more sunsets watched, more questions asked, more being exactly who we are.
You're one of the good ones – don't ever forget that.

Always here,
Your people.`,
    rotation: 2.2,
    size: 1.05,
    pinPosition: 'tr',
    glowColor: '#c4b5fd',
    folded: false,
    depth: 3,
    floatIntensity: 0.8
  },
  { 
    id: 3, 
    from: 'Special Someone', 
    content: `To you,

There are things I've wanted to say for a while.
How your presence makes rooms brighter, how your absence leaves them dimmer.
How you see beauty in what others overlook.

On your birthday, I wish you the courage to believe all the good things people say about you.
Because every single one of them is true.

With admiration,
Me.`,
    rotation: 0.8,
    size: 0.98,
    pinPosition: 'bl',
    glowColor: '#93c5fd',
    folded: true,
    depth: 1,
    floatIntensity: 1.5
  },
  { 
    id: 4, 
    from: 'The Gang', 
    content: `Afrah!

Twenty looks good on you.
Remember that time we... Actually, better not put that in writing.
Just know every memory with you is a favorite.

You're the reason gatherings feel like home.
The glue, the spark, the heart of it all.

Here's to more of everything,
Your crew.`,
    rotation: -2.8,
    size: 1.1,
    pinPosition: 'br',
    glowColor: '#86efac',
    folded: false,
    depth: 4,
    floatIntensity: 1.0
  },
  { 
    id: 5, 
    from: 'Yourself', 
    content: `Dear me,

Look how far you've come.
The fears you've faced, the growth you couldn't see happening.
You've built resilience from what could have broken you.

Today, give yourself permission to receive.
To accept love without questioning if you deserve it.
To celebrate without looking for the next thing to fix.

You're exactly where you need to be.
With pride,
You.`,
    rotation: 1.7,
    size: 0.92,
    pinPosition: 'tr',
    glowColor: '#fde68a',
    folded: true,
    depth: 2,
    floatIntensity: 1.3
  },
];

interface MessagesSceneProps {
  onClose: () => void;
  roomImage: string; // Pass the room scene image URL
}

export function MessagesScene({ onClose, roomImage }: MessagesSceneProps) {
  const [openedLetters, setOpenedLetters] = useState<number[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 2, ease: 'power4.out' }
      );

      lettersRef.current.forEach((ref, i) => {
        if (ref) {
          const letter = LETTERS[i];
          const positions = getLetterPositions();
          const pos = positions[i];
          
          gsap.fromTo(ref,
            { 
              opacity: 0, 
              scale: 0.3,
              x: pos.x - 50,
              y: pos.y - 50,
              rotation: letter.rotation - 10,
              z: -100
            },
            { 
              opacity: 1, 
              scale: letter.size,
              x: pos.x,
              y: pos.y,
              rotation: letter.rotation,
              z: 0,
              duration: 1.8, 
              ease: 'back.out(2.5)',
              delay: i * 0.25,
              onComplete: () => {
                startFloatingAnimation(ref, letter);
              }
            }
          );
        }
      });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const startFloatingAnimation = (ref: HTMLDivElement, letter: Letter) => {
    gsap.to(ref, {
      y: `+=${10 * letter.floatIntensity}`,
      rotation: letter.rotation + (2 * letter.floatIntensity),
      duration: 3 + letter.floatIntensity,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.2
    });
  };

  const getLetterPositions = () => {
    // Beautifully scattered positions that feel natural
    return [
      { x: -20, y: -30 }, // Top left
      { x: 60, y: -20 },  // Top right
      { x: -40, y: 40 },  // Bottom left
      { x: 70, y: 50 },   // Bottom right
      { x: 15, y: 10 },   // Center
    ].map(pos => ({
      x: `calc(50% + ${pos.x}vw)`,
      y: `calc(50% + ${pos.y}vh)`
    }));
  };

  const handleClose = () => {
    setIsClosing(true);
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
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
      gsap.to(ref, {
        scale: letter.size * 1.15,
        y: `-=${30}`,
        rotation: letter.rotation + 5,
        z: 50,
        duration: 0.8,
        ease: 'elastic.out(1.8)',
        onComplete: () => {
          setOpenedLetters(prev => [...prev, letter.id]);
          setTimeout(() => setSelectedLetter(letter), 400);
          gsap.to(ref, {
            scale: letter.size * 0.9,
            y: `+=${20}`,
            rotation: letter.rotation,
            z: 0,
            duration: 0.6,
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
          y: 30,
          rotationX: 10,
          duration: 0.6,
          ease: 'power3.in',
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
    >
      {/* Dreamy room scene backdrop with blur and opacity */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${roomImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.8)',
          opacity: 0.15,
          transform: `translate3d(${mousePosition.x * 10}px, ${mousePosition.y * 10}px, 0)`
        }}
      />
      
      {/* Enhanced gradient overlay for dreamy effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-pink-950/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
      
      {/* Subtle moving stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-px h-px bg-white rounded-full animate-star-flicker"
          style={{
            left: `${10 + (i * 4.5)}%`,
            top: `${5 + (i * 4)}%`,
            animationDelay: `${i * 0.3}s`,
            boxShadow: `0 0 ${4 + Math.random() * 6}px ${2 + Math.random() * 3}px rgba(255,255,255,0.3)`
          }}
        />
      ))}
      
      {/* Hanging string lines */}
      <div className="absolute inset-0">
        {LETTERS.map((_, i) => {
          const positions = getLetterPositions();
          const pos = positions[i];
          return (
            <div
              key={`string-${i}`}
              className="absolute w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent"
              style={{
                left: `calc(${pos.x} + 25px)`,
                top: '10%',
                height: '40vh',
                transformOrigin: 'top'
              }}
            />
          );
        })}
      </div>

      {/* Interactive cursor glow */}
      <div 
        className="fixed w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)`,
          left: `calc(${mousePosition.x * 20 + 50}% - 12rem)`,
          top: `calc(${mousePosition.y * 20 + 50}% - 12rem)`,
          filter: 'blur(40px)',
          transition: 'all 0.1s linear'
        }}
      />
      
      {/* Letters container with depth */}
      <div className="relative z-10 w-full h-full overflow-hidden perspective-1000">
        {LETTERS.map((letter, index) => {
          const isOpened = openedLetters.includes(letter.id);
          const hasFaintGlow = !allOpened && !isOpened;
          const positions = getLetterPositions();
          const position = positions[index];

          return (
            <div
              key={letter.id}
              ref={el => lettersRef.current[index] = el}
              onClick={() => openLetter(letter)}
              className="absolute cursor-pointer transform-gpu will-change-transform"
              style={{
                left: position.x,
                top: position.y,
                transform: `translate3d(0, 0, ${letter.depth * 10}px) rotate(${letter.rotation}deg) scale(${letter.size})`,
                zIndex: letter.depth,
                filter: hasFaintGlow 
                  ? `drop-shadow(0 0 30px ${letter.glowColor}60)`
                  : 'none',
              }}
            >
              {/* Folded paper effect */}
              {letter.folded && !isOpened && (
                <>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-white/40 to-white/10 rounded-lg transform rotate-12" />
                  <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-gradient-to-br from-white/30 to-white/5 rounded-lg transform -rotate-6" />
                </>
              )}
              
              {/* Pinned corner with string */}
              <div className={`absolute z-30 text-white/80 transition-all duration-500 ${
                letter.pinPosition === 'tl' ? '-top-3 -left-3' :
                letter.pinPosition === 'tr' ? '-top-3 -right-3' :
                letter.pinPosition === 'bl' ? '-bottom-3 -left-3' :
                '-bottom-3 -right-3'
              }`}>
                <div className="relative">
                  <div className="absolute -inset-2 bg-white/20 rounded-full blur-sm" />
                  {getPinIcon(letter.pinPosition)}
                  {hasFaintGlow && (
                    <Sparkles className="absolute -top-2 -right-2 w-3 h-3 text-yellow-300 animate-pulse" />
                  )}
                </div>
              </div>
              
              {/* Paper shadow with parallax */}
              <div 
                className="absolute -inset-4 bg-black/30 rounded-2xl blur-xl"
                style={{
                  transform: `translate3d(${mousePosition.x * 5}px, ${mousePosition.y * 5}px, 0)`
                }}
              />
              
              {/* Paper with texture */}
              <div className={`relative w-56 p-6 bg-gradient-to-br from-white/98 via-amber-50/97 to-white/98 
                rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_20px_40px_rgba(0,0,0,0.15)]
                border border-white/80 border-t-white/90 border-l-white/90 backdrop-blur-sm
                transition-all duration-500 hover:shadow-[0_25px_50px_-12px_rgba(168,85,247,0.4)] ${
                isOpened ? 'opacity-70' : 'hover:scale-105'
              }`}>
                
                {/* Paper grain */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wOCIvPjwvc3ZnPg==')] rounded-xl" />
                
                {/* Handwritten feel */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-purple-200/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-pink-200/15 to-transparent" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`font-cursive text-xl tracking-[0.2em] bg-gradient-to-r from-purple-800 via-pink-800 to-indigo-800 
                    bg-clip-text text-transparent mb-3 transition-all duration-500 ${
                    isOpened ? 'opacity-50' : 'opacity-100'
                  }`}>
                    {letter.from}
                  </div>
                  <div className="h-px w-20 bg-gradient-to-r from-purple-300/50 via-pink-300/50 to-transparent mb-3" />
                  <div className={`text-sm font-elegant tracking-wide italic bg-gradient-to-r from-purple-600/70 via-pink-600/70 to-indigo-600/70 
                    bg-clip-text text-transparent leading-relaxed transition-all duration-500 ${
                    isOpened ? 'opacity-30' : 'opacity-60'
                  }`}>
                    {isOpened ? 'Read with love' : 'Touch to open'}
                  </div>
                  {isOpened && (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Heart className="w-3 h-3 text-pink-400/70 fill-pink-400/30" />
                      <Star className="w-3 h-3 text-yellow-400/60" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Letter modal with enhanced dreamy effects */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Multi-layer backdrop */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-950/70 to-black/60 backdrop-blur-xl transition-opacity duration-1000"
            onClick={closeLetter}
          />
          
          {/* Animated gradient orbs */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`orb-${i}`}
              className="absolute rounded-full animate-orb-float"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                background: `radial-gradient(circle at center, ${selectedLetter.glowColor}${20 + i * 10}, transparent 70%)`,
                left: `${20 + i * 20}%`,
                top: `${10 + i * 30}%`,
                animationDelay: `${i * 0.5}s`,
                filter: 'blur(40px)',
                opacity: 0.4
              }}
            />
          ))}
          
          <div className="letter-modal relative z-50 max-w-2xl w-full animate-modal-in">
            {/* Floating particles */}
            {[...Array(12)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full animate-particle-float"
                style={{
                  background: selectedLetter.glowColor,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  filter: 'blur(2px)',
                  opacity: 0.4
                }}
              />
            ))}
            
            {/* Modal paper with depth */}
            <div className="relative bg-gradient-to-br from-white/99 via-amber-50/98 to-white/99 
              rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3),inset_0_2px_0_0_rgba(255,255,255,0.9)]
              border-2 border-white/90 border-t-white/95 border-l-white/95
              backdrop-blur-2xl overflow-hidden transform-gpu">
              
              {/* Shimmer border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer border-2 border-transparent" />
              
              {/* Paper texture with depth */}
              <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjUiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4xNSIvPjwvc3ZnPg==')]" />
              
              {/* Hand-drawn imperfections */}
              <div className="absolute top-8 left-12 w-20 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent transform rotate-2" />
              <div className="absolute bottom-10 right-14 w-16 h-px bg-gradient-to-r from-transparent via-pink-300/20 to-transparent transform -rotate-1" />
              
              <div className="relative z-10 p-8 sm:p-12">
                {/* Header with pinned effect */}
                <div className="mb-12">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100/80 to-pink-100/80 shadow-xl backdrop-blur-sm">
                          {getPinIcon(selectedLetter.pinPosition)}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-pink-300 blur-sm" />
                      </div>
                      <div>
                        <div className="font-cursive text-3xl tracking-[0.15em] bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-900 
                          bg-clip-text text-transparent">
                          From {selectedLetter.from}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm font-elegant text-purple-600/70">
                          <Music className="w-3 h-3" />
                          <span>Letter #{selectedLetter.id}</span>
                          <span>•</span>
                          <span>Pinned with care</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeLetter}
                      className="p-2 -mr-2 -mt-2 hover:bg-white/40 rounded-2xl transition-all duration-500 group backdrop-blur-sm"
                    >
                      <X className="w-6 h-6 text-purple-700/80 group-hover:text-purple-900 group-hover:rotate-180 transition-all duration-500" />
                    </button>
                  </div>
                  <div className="h-px w-32 bg-gradient-to-r from-purple-300/60 via-pink-300/60 to-indigo-300/60 ml-16" />
                </div>
                
                {/* Letter content */}
                <div className="relative">
                  <div className="font-elegant text-purple-900/95 leading-relaxed tracking-wider whitespace-pre-wrap text-lg sm:text-xl 
                    max-h-[60vh] overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-purple-300/40 scrollbar-track-transparent">
                    {selectedLetter.content}
                  </div>
                  
                  {/* Fade effect at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/98 to-transparent pointer-events-none" />
                </div>
                
                {/* Decorative footer */}
                <div className="mt-12 pt-8 border-t border-purple-200/30">
                  <div className="flex items-center justify-center gap-6">
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400/80 animate-pulse" />
                      <Moon className="w-5 h-5 text-indigo-400/70" />
                      <Heart className="w-5 h-5 text-pink-400/80 fill-pink-400/30" />
                      <Star className="w-5 h-5 text-yellow-400/70" />
                    </div>
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-pink-300/40 to-transparent" />
                  </div>
                  <div className="text-center mt-4 font-elegant text-sm text-purple-600/50">
                    Forever cherished • Always remembered
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 z-20 p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-500 group"
      >
        <X className="w-5 h-5 text-white/80 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
      </button>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-gpu {
          transform-style: preserve-3d;
        }
        
        @keyframes modal-in {
          0% { 
            opacity: 0; 
            transform: translateY(60px) scale(0.9) rotateX(15deg); 
            filter: blur(30px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1) rotateX(0); 
            filter: blur(0);
          }
        }
        
        @keyframes orb-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        
        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -15px); }
          50% { transform: translate(-5px, 5px); }
          75% { transform: translate(-10px, -10px); }
        }
        
        @keyframes star-flicker {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-modal-in {
          animation: modal-in 1s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .animate-orb-float {
          animation: orb-float 20s ease-in-out infinite;
        }
        
        .animate-particle-float {
          animation: particle-float 8s ease-in-out infinite;
        }
        
        .animate-star-flicker {
          animation: star-flicker 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 8s ease-in-out infinite;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-purple-300\/40::-webkit-scrollbar-thumb {
          background-color: rgba(196, 181, 253, 0.4);
          border-radius: 6px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        /* Smooth cursor effect */
        * {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f0abfc' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 11V6a3 3 0 0 0-6 0v5'/%3E%3Crect width='18' height='12' x='3' y='9' rx='3'/%3E%3Ccircle cx='12' cy='15' r='1'/%3E%3C/svg%3E") 12 12, auto;
        }
      `}</style>
    </div>
  );
}
