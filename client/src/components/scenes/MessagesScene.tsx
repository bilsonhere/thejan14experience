import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight, Sparkles, Heart } from 'lucide-react';

interface Letter {
  id: number;
  from: string;
  content: string;
  rotation: number;
  size: number;
  pinPosition: 'tl' | 'tr' | 'bl' | 'br';
  glowColor: string;
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
    size: 1,
    pinPosition: 'tl',
    glowColor: '#f0abfc'
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
    size: 0.95,
    pinPosition: 'tr',
    glowColor: '#c4b5fd'
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
    size: 1.05,
    pinPosition: 'bl',
    glowColor: '#93c5fd'
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
    size: 0.98,
    pinPosition: 'br',
    glowColor: '#86efac'
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
    size: 1.02,
    pinPosition: 'tr',
    glowColor: '#fde68a'
  },
];

interface MessagesSceneProps {
  onClose: () => void;
}

export function MessagesScene({ onClose }: MessagesSceneProps) {
  const [openedLetters, setOpenedLetters] = useState<number[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: 'power4.out' }
      );

      lettersRef.current.forEach((ref, i) => {
        if (ref) {
          const letter = LETTERS[i];
          gsap.fromTo(ref,
            { 
              opacity: 0, 
              scale: 0.8, 
              y: 40,
              rotation: letter.rotation - 5 
            },
            { 
              opacity: 1, 
              scale: letter.size, 
              y: 0,
              rotation: letter.rotation,
              duration: 1.2, 
              ease: 'elastic.out(1, 0.5)',
              delay: i * 0.18
            }
          );
        }
      });
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'power3.in',
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
        scale: LETTERS[letterIndex].size * 1.1,
        y: -10,
        rotation: LETTERS[letterIndex].rotation + 2,
        duration: 0.6,
        ease: 'back.out(1.7)',
        onComplete: () => {
          gsap.to(ref, {
            scale: LETTERS[letterIndex].size,
            y: 0,
            rotation: LETTERS[letterIndex].rotation,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              setOpenedLetters(prev => [...prev, letter.id]);
              setTimeout(() => setSelectedLetter(letter), 300);
            }
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
          y: 20,
          duration: 0.5,
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
      className={`absolute inset-0 ${isClosing ? 'pointer-events-none' : ''}`}
    >
      {/* Dreamy backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-purple-950/90 to-pink-950/95">
        {/* Animated gradient clouds */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-t from-indigo-500/10 via-blue-500/5 to-transparent" />
        
        {/* Soft texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMyIvPjwvc3ZnPg==')]" />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${10 + (i * 6)}%`,
              top: `${20 + (i * 4)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Close backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-all duration-700"
        onClick={handleClose}
      />
      
      {/* Dreamy glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-full blur-3xl" />
      
      {/* Letters wall */}
      <div className="relative z-10 w-full h-full p-4 sm:p-6 md:p-8 overflow-hidden">
        <div className="relative w-full h-full">
          {/* Wall texture overlay */}
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjUiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')]" />
          
          {LETTERS.map((letter, index) => {
            const isOpened = openedLetters.includes(letter.id);
            const hasFaintGlow = !allOpened && !isOpened;
            
            const positions = [
              { top: '12%', left: '8%' },
              { top: '28%', left: '68%' },
              { top: '58%', left: '15%' },
              { top: '65%', left: '78%' },
              { top: '38%', left: '52%' },
            ];
            
            const position = positions[index % positions.length];

            return (
              <div
                key={letter.id}
                ref={el => lettersRef.current[index] = el}
                onClick={() => openLetter(letter)}
                className="absolute cursor-pointer transition-all duration-700 hover:z-10"
                style={{
                  top: position.top,
                  left: position.left,
                  transform: `rotate(${letter.rotation}deg) scale(${letter.size})`,
                  opacity: isOpened ? 0.7 : 1,
                  filter: hasFaintGlow 
                    ? `drop-shadow(0 0 20px ${letter.glowColor}40)` 
                    : 'none',
                }}
              >
                {/* Paper with magical glow */}
                <div className="relative">
                  {/* Glow aura */}
                  {hasFaintGlow && (
                    <div className="absolute -inset-6 opacity-30">
                      <div 
                        className="absolute inset-0 rounded-lg blur-xl"
                        style={{ background: `radial-gradient(circle at center, ${letter.glowColor}30, transparent 70%)` }}
                      />
                    </div>
                  )}
                  
                  {/* Pin with sparkle */}
                  <div className={`absolute z-20 text-white/90 transition-all duration-500 ${
                    letter.pinPosition === 'tl' ? 'top-0.5 left-0.5' :
                    letter.pinPosition === 'tr' ? 'top-0.5 right-0.5' :
                    letter.pinPosition === 'bl' ? 'bottom-0.5 left-0.5' :
                    'bottom-0.5 right-0.5'
                  }`}>
                    <div className="relative">
                      {getPinIcon(letter.pinPosition)}
                      {hasFaintGlow && (
                        <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-yellow-300/80 animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  {/* Paper shadow with depth */}
                  <div className="absolute -inset-3 bg-black/20 rounded-xl blur-lg" />
                  <div className="absolute -inset-2 bg-gradient-to-br from-black/10 via-transparent to-black/5 rounded-lg blur-md" />
                  
                  {/* Paper body */}
                  <div className={`relative w-52 sm:w-60 p-6 sm:p-7 bg-gradient-to-br from-white/95 via-amber-50/90 to-white/95 
                    rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm
                    border border-white/60 border-t-white/80 border-l-white/80
                    transition-all duration-700 hover:shadow-[0_12px_48px_rgba(168,85,247,0.25)] ${
                    hasFaintGlow ? 'hover:scale-105' : ''
                  }`}>
                    {/* Subtle paper grain */}
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4xNSIvPjwvc3ZnPg==')] rounded-lg" />
                    
                    {/* Paper imperfections */}
                    <div className="absolute top-3 right-5 w-10 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 w-8 h-px bg-gradient-to-r from-transparent via-pink-300/20 to-transparent" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className={`font-cursive text-lg tracking-widest bg-gradient-to-r from-purple-800 via-pink-800 to-indigo-800 
                        bg-clip-text text-transparent mb-4 transition-all duration-500 ${
                        isOpened ? 'opacity-60' : 'opacity-100'
                      }`}>
                        {letter.from}
                      </div>
                      <div className="h-px w-16 bg-gradient-to-r from-purple-300/60 via-pink-300/60 to-transparent mb-4" />
                      <div className={`text-xs font-elegant tracking-wide italic bg-gradient-to-r from-purple-600/70 via-pink-600/70 to-indigo-600/70 
                        bg-clip-text text-transparent leading-relaxed transition-all duration-500 ${
                        isOpened ? 'opacity-40' : 'opacity-70'
                      }`}>
                        {isOpened ? 'Cherished memory' : 'Waiting to be read'}
                      </div>
                      {isOpened && (
                        <Heart className="absolute top-2 right-2 w-4 h-4 text-pink-400/60 fill-pink-400/20" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Letter modal - Dreamy overlay */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/40 via-purple-950/50 to-black/40 backdrop-blur-lg transition-opacity duration-700"
            onClick={closeLetter}
          />
          
          {/* Animated glow behind modal */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at center, ${selectedLetter.glowColor}30, transparent 70%)`,
              filter: 'blur(60px)'
            }}
          />
          
          <div className="letter-modal relative z-50 max-w-2xl w-full animate-modal-in">
            {/* Floating particles around modal */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-float"
                style={{
                  background: `radial-gradient(circle at center, ${selectedLetter.glowColor}50, transparent)`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${4 + Math.random() * 3}s`
                }}
              />
            ))}
            
            {/* Modal paper */}
            <div className="relative bg-gradient-to-br from-white/98 via-amber-50/95 to-white/98 
              rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.25)] 
              border border-white/70 border-t-white/90 border-l-white/90
              backdrop-blur-xl overflow-hidden">
              
              {/* Shimmer edge */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              
              {/* Paper texture */}
              <div className="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4yIi8+PC9zdmc+')]" />
              
              {/* Paper imperfections */}
              <div className="absolute top-6 left-10 w-16 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
              <div className="absolute bottom-8 right-12 w-12 h-px bg-gradient-to-r from-transparent via-pink-300/30 to-transparent" />
              
              <div className="relative z-10 p-8 sm:p-10">
                {/* Header */}
                <div className="mb-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg">
                          {getPinIcon(selectedLetter.pinPosition)}
                        </div>
                        <div>
                          <div className="font-cursive text-2xl tracking-widest bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-900 
                            bg-clip-text text-transparent">
                            From {selectedLetter.from}
                          </div>
                          <div className="text-sm font-elegant text-purple-600/70 mt-1">
                            Letter #{selectedLetter.id} • Pinned with care
                          </div>
                        </div>
                      </div>
                      <div className="h-px w-24 bg-gradient-to-r from-purple-300/60 via-pink-300/60 to-indigo-300/60 mt-4" />
                    </div>
                    <button
                      onClick={closeLetter}
                      className="p-2 -mr-2 -mt-2 hover:bg-white/30 rounded-xl transition-all duration-300 group"
                    >
                      <X className="w-5 h-5 text-purple-700/70 group-hover:text-purple-900 group-hover:rotate-90 transition-all duration-300" />
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="font-elegant text-purple-900/90 leading-relaxed tracking-wide whitespace-pre-wrap text-base sm:text-lg 
                  max-h-[50vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-purple-300/30 scrollbar-track-transparent">
                  {selectedLetter.content}
                </div>
                
                {/* Bottom decoration */}
                <div className="mt-10 pt-6 border-t border-purple-200/40">
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />
                    <Sparkles className="w-4 h-4 text-purple-400/60 animate-pulse" />
                    <Heart className="w-4 h-4 text-pink-400/60 fill-pink-400/20" />
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(8px) scale(0.995); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes modal-in {
          0% { 
            opacity: 0; 
            transform: translateY(40px) scale(0.95) rotateX(10deg); 
            filter: blur(20px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1) rotateX(0); 
            filter: blur(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-modal-in {
          animation: modal-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        
        .scrollbar-thumb-purple-300\/30::-webkit-scrollbar-thumb {
          background-color: rgba(196, 181, 253, 0.3);
          border-radius: 4px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
