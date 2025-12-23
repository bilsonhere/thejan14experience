import { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { Play, Pause, X, ExternalLink, Maximize2, Music, Loader2, ArrowLeft, Pin, Heart } from 'lucide-react';

interface Letter {
  id: number;
  from: string;
  relationship: string;
  emoji: string;
  content: string;
  color: string;
  rotation: number;
  pinPosition: 'tl' | 'tr' | 'bl' | 'br';
}

const GOOGLE_SLIDES_LINK = 'https://docs.google.com/presentation/d/192aK3xvHF8VkuSBFzhxgdMKcER61AhOUfQpVj_681LE/view';
const GOOGLE_DRIVE_AUDIO_LINK = 'https://drive.google.com/file/d/1pjGcBhQoA5CrEkiLm4bNBdz0fPCfchQW/view?usp=sharing';

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
    color: '#f472b6',
    rotation: -3.5,
    pinPosition: 'tl'
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
    color: '#8b5cf6',
    rotation: 1.8,
    pinPosition: 'tr'
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
    color: '#60a5fa',
    rotation: -1.2,
    pinPosition: 'bl'
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
    color: '#34d399',
    rotation: 2.5,
    pinPosition: 'br'
  },
  { 
    id: 5, 
    from: 'Yourself', 
    relationship: 'Future You',
    emoji: '💖',
    content: `Dear Afrah,

Look at you now. 20 years of becoming.
Every challenge you've faced, every joy you've experienced has shaped you into who you are today.

Remember to be kind to yourself, to celebrate your victories, and to know your worth.
The world is brighter because you're in it.

With love and pride,
You 🌟`,
    color: '#fbbf24',
    rotation: -0.7,
    pinPosition: 'tr'
  },
];

export function GiftsScene() {
  const { navigateTo, settings } = useSceneStore();
  const [openedLetters, setOpenedLetters] = useState<number[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; src: string } | null>(null);
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLDivElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRefs = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    if (!settings.reducedMotion) {
      animationRefs.current.forEach(anim => anim.kill());
      animationRefs.current = [];

      lettersRef.current.forEach((ref, i) => {
        if (ref && !openedLetters.includes(i + 1)) {
          const anim = gsap.to(ref, {
            y: -8,
            rotation: LETTERS[i].rotation + 0.5,
            duration: 4 + i * 0.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2,
          });
          animationRefs.current.push(anim);
        }
      });

      if (openedLetters.length === 5 && !showFinale) {
        setTimeout(() => setShowFinale(true), 800);
      }

      if (containerRef.current) {
        gsap.fromTo(containerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: 'power2.out' }
        );
      }
    }

    return () => {
      animationRefs.current.forEach(anim => anim.kill());
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [openedLetters, settings.reducedMotion, showFinale]);

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
        scale: 1.1,
        y: -5,
        duration: 0.3,
        ease: 'back.out(1.7)',
      })
      .to(ref, {
        scale: 0.9,
        opacity: 0.8,
        duration: 0.2,
        ease: 'power2.out',
      });
    }

    if (settings.soundEnabled) {
      audioManager.play('success');
    }
  };

  const closeLetter = () => {
    setSelectedLetter(null);
  };

  const loadAudio = async () => {
    if (audioRef.current) return;
    
    setIsAudioLoading(true);
    setAudioError(false);
    
    try {
      audioRef.current = new Audio('/assets/gifts/audio/Hbd.wav');
      
      audioRef.current.addEventListener('canplaythrough', () => {
        setIsAudioLoading(false);
      });
      
      audioRef.current.addEventListener('error', () => {
        setIsAudioLoading(false);
        setAudioError(true);
        audioRef.current = null;
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setAudioProgress(
            (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0
          );
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioProgress(0);
      });
      
      audioRef.current.load();
      
      setTimeout(() => {
        if (isAudioLoading && audioRef.current?.readyState !== 4) {
          setIsAudioLoading(false);
          setAudioError(true);
        }
      }, 3000);
      
    } catch (error) {
      setIsAudioLoading(false);
      setAudioError(true);
      audioRef.current = null;
    }
  };

  const handleAudioPlay = async () => {
    if (audioError) {
      window.open(GOOGLE_DRIVE_AUDIO_LINK, '_blank');
      return;
    }
    
    if (!audioRef.current) {
      await loadAudio();
      if (audioError) {
        window.open(GOOGLE_DRIVE_AUDIO_LINK, '_blank');
        return;
      }
    }

    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      setAudioError(true);
      window.open(GOOGLE_DRIVE_AUDIO_LINK, '_blank');
    }
  };

  const handleDirectAudioLink = () => {
    window.open(GOOGLE_DRIVE_AUDIO_LINK, '_blank');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allOpened = openedLetters.length === LETTERS.length;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
    >
      {/* RoomScene background with low opacity */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950/80 to-pink-950/90">
        {/* Subtle blurred wallpaper texture */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
          style={{
            backgroundImage: `url('/assets/wallpaper/40.png')`,
            opacity: 0.15,
          }}
        />
        
        {/* Very subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-purple-100/3 to-pink-100/3" />
      </div>

      {/* Soft gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-purple-50/10 to-pink-50/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/20" />
        
        {/* Soft light orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-indigo-200/8 to-blue-200/8 rounded-full blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-12 left-12 text-2xl opacity-5 animate-float-slow">🕊️</div>
      <div className="absolute top-20 right-16 text-xl opacity-4 animate-float-slow" style={{animationDelay: '2s'}}>✨</div>
      <div className="absolute bottom-20 left-20 text-2xl opacity-5 animate-float-slow" style={{animationDelay: '1s'}}>🌸</div>

      {/* Celebration Effects */}
      {showFinale && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <Confetti 
              recycle={false} 
              numberOfPieces={200} 
              gravity={0.05}
              colors={['#fbbf24', '#ec4899', '#a855f7', '#60a5fa', '#34d399']}
              wind={0.01}
              opacity={0.6}
            />
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <AdaptiveParticleSystem 
              count={100} 
              color="#fbbf24" 
              speed={0.2} 
              size={1}
            />
          </div>
        </>
      )}

      {/* Navigation */}
      <button
        onClick={() => navigateTo('room')}
        className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2.5 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <ArrowLeft className="w-4 h-4 text-purple-700 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium text-purple-800">Back to Room</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 px-2">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 via-pink-200/20 to-indigo-200/20 blur-xl rounded-full" />
            <div className="relative text-5xl sm:text-6xl md:text-7xl text-purple-300/80">
              📜✨
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3
                        drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <span className="font-cursive bg-gradient-to-r from-white via-purple-200 to-pink-200 
                           bg-clip-text text-transparent">
              Letters for You
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-purple-200/80 font-elegant max-w-xl mx-auto">
            Pinned with love, waiting to be read
            <span className="block text-xs sm:text-sm text-purple-300/60 mt-1">
              {openedLetters.length === 0 ? 'Click any letter to begin...' : `${openedLetters.length}/5 letters opened`}
            </span>
          </p>
        </div>

        {/* Scattered Letters Wall */}
        <div className="relative w-full max-w-6xl h-[60vh]">
          {LETTERS.map((letter, index) => {
            const isOpened = openedLetters.includes(letter.id);
            const hasFaintGlow = !allOpened && !isOpened;
            
            const positions = [
              { top: '15%', left: '10%' },
              { top: '30%', left: '70%' },
              { top: '55%', left: '20%' },
              { top: '65%', left: '75%' },
              { top: '40%', left: '50%' },
            ];
            
            const position = positions[index % positions.length];

            return (
              <div
                key={letter.id}
                ref={el => lettersRef.current[index] = el}
                onClick={() => openLetter(letter)}
                onMouseEnter={() => setHoveredLetter(letter.id)}
                onMouseLeave={() => setHoveredLetter(null)}
                className="absolute cursor-pointer transition-all duration-500"
                style={{
                  top: position.top,
                  left: position.left,
                  transform: `rotate(${letter.rotation}deg)`,
                  opacity: isOpened ? 0.7 : 1,
                  filter: hasFaintGlow 
                    ? `drop-shadow(0 0 12px ${letter.color}50)` 
                    : 'none',
                }}
              >
                {/* Pinned letter */}
                <div className="relative">
                  {/* Pin */}
                  <div className={`absolute z-20 text-white/80 transition-colors duration-500 ${
                    letter.pinPosition === 'tl' ? '-top-2 -left-2' :
                    letter.pinPosition === 'tr' ? '-top-2 -right-2' :
                    letter.pinPosition === 'bl' ? '-bottom-2 -left-2' :
                    '-bottom-2 -right-2'
                  }`}>
                    <Pin className="w-4 h-4" />
                  </div>
                  
                  {/* Folded paper effect */}
                  <div className={`relative w-36 h-44 p-4 bg-gradient-to-br from-white/95 to-amber-50/95 
                    rounded-sm shadow-lg border border-white/40
                    transition-all duration-500 hover:shadow-xl hover:border-purple-300/60 hover:scale-105
                    ${isOpened ? 'shadow-purple-200/40' : ''}`}>
                    
                    {/* Paper texture */}
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4xIi8+PC9zdmc+')]" />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                      <div className="text-3xl mb-3">{letter.emoji}</div>
                      <div className="text-center">
                        <h3 className="font-bold text-purple-900 text-sm mb-1">
                          {letter.from}
                        </h3>
                        <p className="text-xs text-purple-600/70 font-elegant">
                          {letter.relationship}
                        </p>
                      </div>
                      
                      {/* Status */}
                      <div className="mt-4 flex items-center gap-1.5">
                        {isOpened ? (
                          <>
                            <Heart className="w-3 h-3 text-pink-500 fill-pink-200" />
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
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        {openedLetters.length > 0 && (
          <div className="mt-12 max-w-md w-full px-4 animate-fade-in">
            <div className="flex justify-between text-sm sm:text-base text-purple-200/90 mb-3">
              <span className="font-elegant">Your Journey</span>
              <span className="font-semibold">{openedLetters.length}/5</span>
            </div>
            <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 rounded-full transition-all duration-700 shadow-lg shadow-purple-500/30"
                style={{ width: `${(openedLetters.length / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-purple-300/70 text-center mt-2">
              {allOpened ? 'All letters cherished' : 'Take your time with each message...'}
            </p>
          </div>
        )}

        {/* Final celebration */}
        {showFinale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="text-center p-8 sm:p-10 bg-gradient-to-br from-purple-900/95 via-pink-900/90 to-indigo-900/95 
                          rounded-2xl border-2 border-pink-500/50 backdrop-blur-2xl 
                          max-w-sm sm:max-w-md w-full animate-scale-in shadow-2xl shadow-pink-900/50">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-500/20 blur-xl rounded-full" />
                <div className="relative text-5xl sm:text-6xl mb-4 text-white">💝✨</div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                All Messages Read
              </h2>
              <p className="text-pink-200/90 text-sm sm:text-base mb-6 font-elegant">
                Every heartfelt message has been cherished
              </p>
              <div className="text-2xl animate-pulse text-white">📜💌</div>
            </div>
          </div>
        )}
      </div>

      {/* Letter content dialog */}
      <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
        <DialogContent 
          ref={dialogRef}
          className="bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-950/95 border-white/30 
                   text-white max-w-sm sm:max-w-md md:max-w-xl 
                   rounded-2xl sm:rounded-3xl p-0 overflow-hidden shadow-2xl shadow-black/50
                   animate-dialog-in"
        >
          {selectedLetter && (
            <>
              <DialogHeader className="p-5 sm:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl sm:text-2xl flex items-center gap-3">
                    <div className="text-3xl sm:text-4xl">{selectedLetter.emoji}</div>
                    <div>
                      <div className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        {selectedLetter.from}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400 mt-0.5">
                        {selectedLetter.relationship}
                      </div>
                    </div>
                  </DialogTitle>
                  <button
                    onClick={closeLetter}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </DialogHeader>
              <div className="p-5 sm:p-6">
                <div className="font-elegant whitespace-pre-wrap text-white/95 leading-relaxed text-base sm:text-lg">
                  {selectedLetter.content}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!activeMedia} onOpenChange={() => setActiveMedia(null)}>
        <DialogContent className="max-w-4xl sm:max-w-5xl bg-black/95 border-none p-0 overflow-hidden">
          <div className="relative">
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            
            {activeMedia?.type === 'image' && (
              <div className="max-h-[80vh] sm:max-h-[85vh] flex items-center justify-center p-2 sm:p-4">
                <img
                  src={activeMedia.src}
                  alt="Special memory"
                  className="max-h-[75vh] sm:max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl shadow-black/50"
                  loading="lazy"
                />
              </div>
            )}

            {activeMedia?.type === 'video' && (
              <div className="max-h-[80vh] sm:max-h-[85vh] p-2 sm:p-4">
                <video
                  src={activeMedia.src}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[75vh] sm:max-h-[80vh] rounded-xl shadow-2xl shadow-black/50"
                  controlsList="nodownload"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes dialog-in {
          0% { transform: scale(0.95) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-dialog-in {
          animation: dialog-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
