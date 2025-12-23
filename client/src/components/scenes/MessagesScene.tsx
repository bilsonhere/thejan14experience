import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight } from 'lucide-react';

interface Letter {
  id: number;
  from: string;
  content: string;
  rotation: number;
  size: number;
  pinPosition: 'tl' | 'tr' | 'bl' | 'br';
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
    pinPosition: 'tl'
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
    pinPosition: 'tr'
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
    pinPosition: 'bl'
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
    pinPosition: 'br'
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
    pinPosition: 'tr'
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

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, ease: 'power2.out' }
      );

      lettersRef.current.forEach((ref, i) => {
        if (ref) {
          gsap.fromTo(ref,
            { opacity: 0, scale: 0.9, y: 20 },
            { 
              opacity: 1, 
              scale: LETTERS[i].size, 
              y: 0, 
              duration: 0.8, 
              ease: 'power2.out',
              delay: i * 0.12
            }
          );
        }
      });
    }
  }, []);

  const openLetter = (letter: Letter) => {
    if (openedLetters.includes(letter.id)) {
      setSelectedLetter(letter);
      return;
    }

    const letterIndex = letter.id - 1;
    const ref = lettersRef.current[letterIndex];
    
    if (ref) {
      gsap.to(ref, {
        opacity: 0.6,
        scale: LETTERS[letterIndex].size * 0.98,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          setOpenedLetters(prev => [...prev, letter.id]);
          setTimeout(() => setSelectedLetter(letter), 200);
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
          scale: 0.98,
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
    <div ref={containerRef} className="absolute inset-0">
      {/* Wall texture background */}
      <div className="absolute inset-0 bg-[#f5f1e9]">
        {/* Subtle paper texture */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjYiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNCIvPjwvc3ZnPg==')]" />
        
        {/* Gentle vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5" />
        
        {/* Wall imperfections */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-stone-300/10 blur-2xl" />
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-stone-400/5 blur-3xl" />
      </div>

      {/* Close backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-500"
        onClick={onClose}
      />
      
      {/* Letters wall */}
      <div className="relative z-10 w-full h-full p-4 sm:p-6 md:p-8">
        <div className="relative w-full h-full">
          {LETTERS.map((letter, index) => {
            const isOpened = openedLetters.includes(letter.id);
            const hasFaintGlow = !allOpened && !isOpened;
            
            // Natural positioning - not grid-based
            const positions = [
              { top: '15%', left: '10%' },
              { top: '25%', left: '65%' },
              { top: '55%', left: '20%' },
              { top: '60%', left: '75%' },
              { top: '40%', left: '50%' },
            ];
            
            const position = positions[index % positions.length];

            return (
              <div
                key={letter.id}
                ref={el => lettersRef.current[index] = el}
                onClick={() => openLetter(letter)}
                className="absolute cursor-pointer transition-all duration-500"
                style={{
                  top: position.top,
                  left: position.left,
                  transform: `rotate(${letter.rotation}deg) scale(${letter.size})`,
                  opacity: isOpened ? 0.6 : 1,
                  filter: hasFaintGlow ? 'brightness(1.05)' : 'brightness(1)',
                }}
              >
                {/* Paper */}
                <div className="relative">
                  {/* Pin */}
                  <div className={`absolute z-10 text-stone-500/70 transition-colors duration-500 ${
                    letter.pinPosition === 'tl' ? 'top-1 left-1' :
                    letter.pinPosition === 'tr' ? 'top-1 right-1' :
                    letter.pinPosition === 'bl' ? 'bottom-1 left-1' :
                    'bottom-1 right-1'
                  }`}>
                    {getPinIcon(letter.pinPosition)}
                  </div>
                  
                  {/* Paper shadow */}
                  <div className="absolute -inset-2 bg-stone-900/5 rounded-lg blur-sm" />
                  
                  {/* Paper body */}
                  <div className={`relative w-48 sm:w-56 p-5 sm:p-6 bg-[#faf7f2] rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-500 ${
                    hasFaintGlow ? 'shadow-[0_2px_12px_rgba(120,80,50,0.1)]' : ''
                  }`}>
                    {/* Paper texture */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4xIi8+PC9zdmc+')] opacity-30 rounded-sm" />
                    
                    {/* Paper imperfections */}
                    <div className="absolute top-2 right-4 w-8 h-px bg-stone-300/40" />
                    <div className="absolute bottom-3 left-3 w-6 h-px bg-stone-300/30" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className={`font-serif text-sm tracking-wide text-stone-700 mb-3 transition-colors duration-500 ${
                        isOpened ? 'text-stone-600' : 'text-stone-800'
                      }`}>
                        {letter.from}
                      </div>
                      <div className="h-px w-12 bg-stone-300/50 mb-4" />
                      <div className="text-xs text-stone-500 italic leading-relaxed font-serif">
                        {isOpened ? 'Read' : 'Unread'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Letter modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity duration-500"
            onClick={closeLetter}
          />
          
          <div className="letter-modal relative z-30 max-w-lg w-full animate-fade-in">
            {/* Pin */}
            <div className={`absolute z-20 text-stone-500/80 ${
              selectedLetter.pinPosition === 'tl' ? 'top-2 left-2' :
              selectedLetter.pinPosition === 'tr' ? 'top-2 right-2' :
              selectedLetter.pinPosition === 'bl' ? 'bottom-2 left-2' :
              'bottom-2 right-2'
            }`}>
              {getPinIcon(selectedLetter.pinPosition)}
            </div>
            
            {/* Paper shadow */}
            <div className="absolute -inset-4 bg-stone-900/10 rounded-lg blur-md" />
            
            {/* Paper */}
            <div className="relative bg-[#faf7f2] rounded-sm shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
              {/* Paper texture */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4xIi8+PC9zdmc+')] opacity-40 rounded-sm" />
              
              {/* Paper imperfections */}
              <div className="absolute top-3 left-8 w-12 h-px bg-stone-300/40" />
              <div className="absolute bottom-4 right-6 w-8 h-px bg-stone-300/30" />
              
              <div className="relative z-10 p-6 sm:p-8">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-serif text-lg tracking-wider text-stone-800">
                        From {selectedLetter.from}
                      </div>
                      <div className="h-px w-16 bg-stone-300/60 mt-2 mb-4" />
                    </div>
                    <button
                      onClick={closeLetter}
                      className="p-1.5 -mr-1.5 -mt-1.5 hover:bg-stone-200/30 rounded transition-colors duration-300"
                    >
                      <X className="w-4 h-4 text-stone-500/70" />
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="font-serif text-stone-700 leading-relaxed tracking-wide whitespace-pre-wrap text-sm sm:text-base">
                  {selectedLetter.content}
                </div>
                
                {/* Bottom line */}
                <div className="h-px w-24 bg-stone-300/50 mx-auto mt-8" />
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
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
