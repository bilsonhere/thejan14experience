import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, ArrowLeft, Heart, Sparkles } from 'lucide-react';

interface Letter {
  id: number;
  from: string;
  relationship: string;
  emoji: string;
  content: string;
  color: string;
}

const LETTERS: Letter[] = [
  { 
    id: 1, 
    from: 'Mom & Dad', 
    relationship: 'Parents',
    emoji: '👨‍👩‍👧',
    content: `Our dearest Afrah,

As you celebrate your 20th birthday, our hearts are filled with pride and joy. 
Watching you grow into the incredible person you are today has been the greatest blessing.

May this year bring you endless happiness, success in all your endeavors, 
and the fulfillment of every beautiful dream in your heart.

With all our love,
Mom & Dad 💕`,
    color: '#f472b6'
  },
  { 
    id: 2, 
    from: 'Sarah', 
    relationship: 'Best Friend',
    emoji: '👯‍♀️',
    content: `Afrah! Happy 20th! 🎉

Can you believe we're actually adults now? 
Every memory with you is golden - from late-night talks to spontaneous adventures.

You're the friend who makes ordinary days extraordinary. 
Here's to more laughter, more memories, and watching each other grow.

Love you forever, bestie! ✨`,
    color: '#8b5cf6'
  },
  { 
    id: 3, 
    from: 'Alex', 
    relationship: 'Sibling',
    emoji: '👨‍👧',
    content: `Hey little sis,

20 years old! When did that happen? 
Watching you grow has been one of my greatest joys.

You're smarter, kinder, and cooler than I could have ever imagined. 
Thanks for being amazing and for putting up with my terrible advice.

Can't wait to see what you accomplish this year. 
Happy Birthday! 🎂`,
    color: '#60a5fa'
  },
  { 
    id: 4, 
    from: 'Grandma', 
    relationship: 'Grandmother',
    emoji: '👵',
    content: `My darling Afrah,

Twenty years! How beautifully you've bloomed. 
I still see the little girl who loved bedtime stories in the wonderful woman you've become.

Your kindness reminds me of spring flowers - gentle, beautiful, and making the world brighter. 
My wish for you is a life filled with the same joy you bring to others.

With all my love,
Grandma 🌸`,
    color: '#34d399'
  },
  { 
    id: 5, 
    from: 'The Gang', 
    relationship: 'Friends',
    emoji: '👥',
    content: `HAPPY 20TH AFRAH! 🎉🎊

You're the glue that holds this chaotic group together 
and the spark that makes every gathering legendary.

From your incredible sense of humor to your caring heart, 
you're simply the best friend anyone could ask for.

Here's to more spontaneous trips, questionable karaoke choices, 
and creating memories that we'll laugh about forever.

Love from all of us! 💕`,
    color: '#fbbf24'
  },
];

interface MessagesSceneProps {
  onClose: () => void;
}

export function MessagesScene({ onClose }: MessagesSceneProps) {
  const [openedLetters, setOpenedLetters] = useState<number[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' }
      );

      lettersRef.current.forEach((ref, i) => {
        if (ref) {
          gsap.fromTo(ref,
            { opacity: 0, y: 30, scale: 0.9 },
            { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              duration: 0.6, 
              ease: 'back.out(1.7)',
              delay: i * 0.1
            }
          );
        }
      });
    }
  }, []);

  const openLetter = (letter: Letter) => {
    const isOpeningNew = !openedLetters.includes(letter.id);
    
    if (isOpeningNew) {
      const letterIndex = letter.id - 1;
      const ref = lettersRef.current[letterIndex];
      
      if (ref) {
        gsap.to(ref, {
          scale: 1.15,
          y: -10,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            setOpenedLetters(prev => [...prev, letter.id]);
            setTimeout(() => setSelectedLetter(letter), 200);
          }
        });
      }
    } else {
      setSelectedLetter(letter);
    }
  };

  const closeLetter = () => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setSelectedLetter(null)
      });
    } else {
      setSelectedLetter(null);
    }
  };

  const allOpened = openedLetters.length === LETTERS.length;

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50/95 via-pink-50/90 to-amber-50/95"
    >
      {/* Soft textured background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/30" />
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjUiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')]" />
        
        {/* Soft spotlight circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-200/20 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl" />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <ArrowLeft className="w-4 h-4 text-purple-700 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium text-purple-800">Back to Room</span>
      </button>

      {/* Title */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-1">
          Birthday Messages for You
        </h1>
        <p className="text-sm text-purple-600/80 font-elegant">
          Click any letter to read heartfelt messages
        </p>
      </div>

      {/* Letters display */}
      <div className="relative z-10 max-w-6xl w-full px-4 py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8">
          {LETTERS.map((letter, index) => {
            const isOpened = openedLetters.includes(letter.id);
            const hasFaintGlow = !allOpened && !isOpened;
            
            return (
              <div
                key={letter.id}
                ref={el => lettersRef.current[index] = el}
                onClick={() => openLetter(letter)}
                className={`relative cursor-pointer transition-all duration-500 ${
                  hasFaintGlow ? 'hover:scale-105' : ''
                }`}
              >
                {/* Glow effect for unread letters */}
                {hasFaintGlow && (
                  <div className="absolute -inset-3">
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-40 blur-lg"
                      style={{ background: `radial-gradient(circle at center, ${letter.color}30, transparent 70%)` }}
                    />
                  </div>
                )}

                {/* Envelope/Letter card */}
                <div className={`relative bg-gradient-to-br from-white to-amber-50 rounded-xl sm:rounded-2xl 
                  shadow-lg border-2 transition-all duration-500 overflow-hidden group
                  ${isOpened ? 'border-purple-300/50 shadow-purple-200/30' : 'border-purple-200/60 hover:border-purple-300/80 hover:shadow-xl'}`}>
                  
                  {/* Paper texture */}
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4xIi8+PC9zdmc+')]" />
                  
                  {/* Content */}
                  <div className="relative z-10 p-5 sm:p-6 flex flex-col items-center justify-center h-full">
                    <div className={`text-4xl sm:text-5xl mb-3 transition-all duration-500 ${
                      hasFaintGlow ? 'group-hover:scale-110 group-hover:rotate-3' : ''
                    }`}>
                      {letter.emoji}
                    </div>
                    
                    <div className="text-center">
                      <h3 className="font-bold text-purple-900 text-base sm:text-lg mb-1">
                        {letter.from}
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-600/70 font-elegant">
                        {letter.relationship}
                      </p>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="mt-4 flex items-center gap-1.5">
                      {isOpened ? (
                        <>
                          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-200" />
                          <span className="text-xs text-purple-500/70">Read</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                          <span className="text-xs text-purple-500/70">Unread</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress hint */}
        {openedLetters.length > 0 && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-purple-700">
                {openedLetters.length} of {LETTERS.length} messages read
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Letter content overlay */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeLetter}
          />
          
          {/* Letter paper */}
          <div 
            ref={contentRef}
            className="relative z-50 max-w-2xl w-full bg-gradient-to-br from-amber-50 via-white to-amber-50/80 rounded-2xl shadow-2xl border-2 border-amber-200/60 overflow-hidden animate-scale-in"
          >
            {/* Vintage paper texture */}
            <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4xNSIvPjwvc3ZnPg==')]" />
            
            {/* Paper imperfections */}
            <div className="absolute top-6 left-8 w-16 h-px bg-amber-300/40" />
            <div className="absolute bottom-8 right-10 w-12 h-px bg-amber-300/30" />
            
            {/* Letter content */}
            <div className="relative z-10 p-8 sm:p-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{selectedLetter.emoji}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-purple-900">{selectedLetter.from}</h2>
                      <p className="text-purple-600/80 font-elegant">{selectedLetter.relationship}</p>
                    </div>
                  </div>
                  <div className="h-px w-20 bg-gradient-to-r from-purple-300 to-transparent" />
                </div>
                <button
                  onClick={closeLetter}
                  className="p-2 hover:bg-white/50 rounded-xl transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-purple-700/70" />
                </button>
              </div>
              
              {/* Message content */}
              <div className="font-elegant text-purple-900/90 leading-relaxed text-lg whitespace-pre-wrap">
                {selectedLetter.content}
              </div>
              
              {/* Decorative footer */}
              <div className="mt-10 pt-6 border-t border-amber-200/50">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-200" />
                  <span className="text-sm text-purple-600/70 font-elegant">Birthday Love</span>
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-200" />
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          0% { 
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          100% { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
