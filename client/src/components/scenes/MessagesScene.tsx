import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

interface Letter {
  id: number;
  emoji: string;
  from: string;
  content: string;
  color: string;
}

const LETTERS: Letter[] = [
  { id: 1, emoji: '💌', from: 'Family', content: 'Our dearest Afrah, on your special day...', color: '#f472b6' },
  { id: 2, emoji: '📜', from: 'Friends', content: 'Happy Birthday! Wishing you endless joy...', color: '#8b5cf6' },
  { id: 3, emoji: '✉️', from: 'Special Someone', content: 'To the most amazing person...', color: '#60a5fa' },
  { id: 4, emoji: '🎀', from: 'The Gang', content: 'Here\'s to more memories together...', color: '#34d399' },
  { id: 5, emoji: '💝', from: 'Yourself', content: 'Remember how far you\'ve come...', color: '#fbbf24' },
];

interface MessagesSceneProps {
  onClose: () => void;
}

export function MessagesScene({ onClose }: MessagesSceneProps) {
  const [openedLetters, setOpenedLetters] = useState<number[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRefs = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' }
      );
    }

    lettersRef.current.forEach((ref, i) => {
      if (ref && !openedLetters.includes(i + 1)) {
        const anim = gsap.to(ref, {
          y: -10,
          rotation: 2,
          duration: 3 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2,
        });
        animationRefs.current.push(anim);
      }
    });

    return () => {
      animationRefs.current.forEach(anim => anim.kill());
    };
  }, [openedLetters]);

  const openLetter = (letter: Letter) => {
    if (openedLetters.includes(letter.id)) {
      setSelectedLetter(letter);
      return;
    }

    const letterIndex = letter.id - 1;
    const ref = lettersRef.current[letterIndex];
    
    if (ref) {
      animationRefs.current[letterIndex]?.kill();
      
      gsap.timeline({
        onComplete: () => {
          setOpenedLetters(prev => [...prev, letter.id]);
          setTimeout(() => setSelectedLetter(letter), 300);
        }
      })
      .to(ref, {
        scale: 1.2,
        duration: 0.3,
        ease: 'back.out(1.7)',
      })
      .to(ref, {
        scale: 1,
        opacity: 0.7,
        duration: 0.2,
        ease: 'power2.inOut',
      });
    }
  };

  const closeLetter = () => {
    setSelectedLetter(null);
  };

  const allOpened = openedLetters.length === LETTERS.length;

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-6 p-4">
          {LETTERS.map((letter, index) => {
            const isOpened = openedLetters.includes(letter.id);
            
            return (
              <div
                key={letter.id}
                ref={el => lettersRef.current[index] = el}
                onClick={() => openLetter(letter)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isOpened ? 'opacity-70' : 'opacity-100'
                } ${allOpened ? '' : 'hover:scale-105'}`}
              >
                <div 
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-4 backdrop-blur-sm border transition-all duration-300 ${
                    isOpened ? 'border-white/20' : 'border-white/40'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${letter.color}30, ${letter.color}15)`,
                    boxShadow: isOpened 
                      ? `0 4px 12px ${letter.color}20`
                      : allOpened 
                        ? `0 4px 12px ${letter.color}10`
                        : `0 8px 24px ${letter.color}40, 0 0 32px ${letter.color}30`
                  }}
                >
                  <div className="text-4xl mb-2">{letter.emoji}</div>
                  <div className={`text-sm text-center text-white/90 font-medium ${isOpened ? 'opacity-60' : 'opacity-100'}`}>
                    {letter.from}
                  </div>
                  {isOpened && (
                    <div className="absolute top-2 right-2 text-xs text-white/60">✓</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedLetter && (
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={closeLetter}
          />
          
          <div className="relative z-30 max-w-md w-full bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-2xl rounded-2xl border border-white/30 overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="text-3xl"
                  style={{ filter: `drop-shadow(0 0 8px ${selectedLetter.color}80)` }}
                >
                  {selectedLetter.emoji}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">From {selectedLetter.from}</div>
                  <div className="text-sm text-white/60">Letter #{selectedLetter.id}</div>
                </div>
              </div>
              <button
                onClick={closeLetter}
                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="font-elegant whitespace-pre-wrap text-white/95 leading-relaxed">
                {selectedLetter.content}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
