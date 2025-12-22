import { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { Play, Pause, Volume2, X, ExternalLink, Maximize2, Music } from 'lucide-react';

interface Gift {
  id: number;
  emoji: string;
  title: string;
  type: 'letter' | 'media' | 'audio' | 'pdf' | 'final';
  color: string;
  gradient: string;
}

const GOOGLE_SLIDES_LINK =
  'https://docs.google.com/presentation/d/192aK3xvHF8VkuSBFzhxgdMKcER61AhOUfQpVj_681LE/view';

const GIFTS: Gift[] = [
  { 
    id: 1, 
    emoji: '💌', 
    title: 'Heartfelt Letter', 
    type: 'letter',
    color: '#f472b6',
    gradient: 'from-pink-500/20 via-rose-500/15 to-rose-600/10'
  },
  { 
    id: 2, 
    emoji: '📸', 
    title: 'Precious Memories', 
    type: 'media',
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 via-violet-500/15 to-indigo-600/10'
  },
  { 
    id: 3, 
    emoji: '🎵', 
    title: 'Birthday Melody', 
    type: 'audio',
    color: '#60a5fa',
    gradient: 'from-blue-500/20 via-cyan-500/15 to-sky-600/10'
  },
  { 
    id: 4, 
    emoji: '📖', 
    title: 'Special Presentation', 
    type: 'pdf',
    color: '#34d399',
    gradient: 'from-emerald-500/20 via-teal-500/15 to-green-600/10'
  },
  { 
    id: 5, 
    emoji: '✨', 
    title: 'Final Message', 
    type: 'final',
    color: '#fbbf24',
    gradient: 'from-yellow-500/20 via-amber-500/15 to-orange-600/10'
  },
];

const LETTER_CONTENT_1 = `Dearest Afrah,

Happy 20th Birthday! 🎉

May this day wrap you in warmth, joy, and the quiet comfort of knowing how deeply cherished you are. Your presence brings light to every moment without effort - a rare and beautiful gift.

Here's to laughter that echoes, growth that inspires, peaceful days, and dreams that feel closer than ever.

Wishing you endless happiness,
With love 💛`;

const LETTER_CONTENT_FINAL = `Afrah,

Some souls leave imprints on time without ever realizing their impact.
You are one of those remarkable souls.

Thank you for being exactly who you are - for the memories, the calm amidst chaos, the laughter, and the meaning you bring.

May life treat you gently.
May joy find you often.
May you always recognize your incredible worth.

Happy Birthday.
May this year be your most beautiful yet.

Forever. 💖`;

export function GiftsScene() {
  const { updateProgress, settings } = useSceneStore();
  const [openedGifts, setOpenedGifts] = useState<number[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; src: string } | null>(null);
  const [hoveredGift, setHoveredGift] = useState<number | null>(null);

  const giftsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRefs = useRef<gsap.core.Tween[]>([]);

  // Initialize animations
  useEffect(() => {
    if (!settings.reducedMotion) {
      // Clear previous animations
      animationRefs.current.forEach(anim => anim.kill());
      animationRefs.current = [];

      // Create floating animations for unopened gifts
      giftsRefs.current.forEach((ref, i) => {
        if (ref && !openedGifts.includes(i + 1)) {
          const anim = gsap.to(ref, {
            y: -15,
            duration: 2.5 + i * 0.2,
            repeat: -1,
            yoyo: true,
            ease: 'power3.inOut',
            delay: i * 0.1,
          });
          animationRefs.current.push(anim);
        }
      });

      // Background particle effect when all gifts opened
      if (openedGifts.length === 5 && !showFinale) {
        setTimeout(() => setShowFinale(true), 500);
      }
    }

    return () => {
      animationRefs.current.forEach(anim => anim.kill());
    };
  }, [openedGifts, settings.reducedMotion, showFinale]);

  const openGift = (gift: Gift) => {
    if (openedGifts.includes(gift.id)) return;

    // Stop animation for this gift
    const giftIndex = gift.id - 1;
    if (animationRefs.current[giftIndex]) {
      animationRefs.current[giftIndex].kill();
    }

    const newOpened = [...openedGifts, gift.id];
    setOpenedGifts(newOpened);
    updateProgress({ giftsOpened: newOpened });

    // Visual feedback
    const giftElement = giftsRefs.current[giftIndex];
    if (giftElement && !settings.reducedMotion) {
      gsap.to(giftElement, {
        scale: 1.2,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          setTimeout(() => setSelectedGift(gift), 300);
        }
      });
    } else {
      setTimeout(() => setSelectedGift(gift), 300);
    }

    if (settings.soundEnabled) {
      audioManager.play('success');
    }

    // Create sparkle effect
    if (!settings.reducedMotion && giftElement) {
      createSparkleEffect(giftElement);
    }

    if (gift.id === 5) {
      setTimeout(() => setShowFinale(true), 800);
    }
  };

  const createSparkleEffect = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'fixed text-2xl pointer-events-none z-50';
        sparkle.style.left = `${rect.left + rect.width / 2}px`;
        sparkle.style.top = `${rect.top + rect.height / 2}px`;
        document.body.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100 - 50,
          opacity: 0,
          scale: 0,
          duration: 1,
          ease: 'power2.out',
          onComplete: () => sparkle.remove(),
        });
      }, i * 100);
    }
  };

  const handleAudioPlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/assets/gifts/audio/Hbd.wav');
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
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.warn);
    }
    setIsPlaying(!isPlaying);
  };

  const renderGiftContent = (gift: Gift) => {
    switch (gift.type) {
      case 'letter':
        return (
          <div className="relative">
            <div className="absolute -top-6 -right-6 text-4xl opacity-20">💌</div>
            <div className="font-elegant whitespace-pre-wrap text-lg leading-relaxed text-white/90 p-6 bg-gradient-to-br from-pink-900/20 to-rose-900/10 rounded-2xl border border-pink-500/20 backdrop-blur-sm">
              {LETTER_CONTENT_1}
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() =>
                    setActiveMedia({
                      type: 'image',
                      src: `/assets/gifts/media/img${i}.jpeg`,
                    })
                  }
                  className="group relative aspect-square bg-gradient-to-br from-purple-900/30 to-violet-900/20 rounded-xl flex items-center justify-center border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-violet-500/0 group-hover:from-purple-500/10 group-hover:to-violet-500/10 transition-all duration-300" />
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🌺</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Maximize2 className="w-6 h-6 text-white/80" />
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setActiveMedia({
                  type: 'video',
                  src: '/assets/gifts/media/video.mp4',
                })
              }
              className="group relative aspect-video bg-gradient-to-br from-pink-900/30 to-rose-900/20 rounded-xl flex items-center justify-center border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-transparent to-rose-500/0 group-hover:from-pink-500/10 group-hover:to-rose-500/10 transition-all duration-300" />
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🎬</span>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm text-pink-200/80">Click to watch video</p>
              </div>
            </button>
            <p className="text-center text-purple-300/60 text-sm font-elegant">
              Click on any media to view in full size
            </p>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Music className="w-12 h-12 text-blue-300" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-1">Birthday Melody</h3>
                <p className="text-blue-300/70 text-sm">A special song for you</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-900/30 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-blue-300/60">
                <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                <span>{formatTime(audioRef.current?.duration || 0)}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleAudioPlay}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl group"
            >
              {isPlaying ? (
                <Pause className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <Play className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
              {isPlaying ? 'Pause Melody' : 'Play Birthday Melody'}
            </Button>
          </div>
        );
      case 'pdf':
        return (
          <div className="text-center space-y-6">
            <div className="text-5xl mb-4">📖✨</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Special Birthday Presentation</h3>
              <p className="text-emerald-300/80 mb-1">"Branches, Trees, Garden"</p>
              <p className="text-emerald-200/60 text-sm">A curated collection of memories and wishes</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-emerald-900/30 to-green-900/20 rounded-xl border border-emerald-500/20">
              <p className="text-emerald-200/70 mb-4">
                This interactive presentation holds heartfelt messages and beautiful memories curated just for you.
              </p>
              <Button 
                onClick={() => window.open(GOOGLE_SLIDES_LINK, '_blank')}
                className="w-full py-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl group"
              >
                <ExternalLink className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                Open Special Presentation
              </Button>
            </div>
          </div>
        );
      case 'final':
        return (
          <div className="relative">
            <div className="absolute -top-8 -right-8 text-5xl opacity-20 animate-pulse">✨</div>
            <div className="absolute -bottom-8 -left-8 text-5xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>💖</div>
            <div className="font-elegant whitespace-pre-wrap text-lg leading-relaxed text-white/90 p-8 bg-gradient-to-br from-yellow-900/20 via-amber-900/15 to-orange-900/10 rounded-2xl border border-amber-500/20 backdrop-blur-sm text-center">
              {LETTER_CONTENT_FINAL}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950/80 to-pink-950/90"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-indigo-900/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMyIvPjwvc3ZnPg==')] 
                    opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Celebration Effects */}
      {showFinale && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <Confetti 
              recycle={false} 
              numberOfPieces={500} 
              gravity={0.07}
              colors={['#fbbf24', '#ec4899', '#a855f7', '#60a5fa', '#34d399']}
              wind={0.01}
            />
          </div>
          <AdaptiveParticleSystem 
            count={200} 
            color="#fbbf24" 
            speed={0.6} 
            size={2.5}
            className="absolute inset-0 pointer-events-none"
          />
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="text-5xl sm:text-6xl md:text-7xl mb-4 animate-float">
            🎁✨
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3
                        drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]">
            <span className="font-cursive bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 
                           bg-clip-text text-transparent">
              Your Birthday Gifts
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-purple-200/80 font-elegant max-w-2xl mx-auto">
            Unwrap each gift to discover something special waiting for you
            <span className="block text-xs sm:text-sm text-purple-300/60 mt-1">
              {openedGifts.length === 0 ? 'Click on any gift to begin!' : `${openedGifts.length}/5 gifts opened`}
            </span>
          </p>
        </div>

        {/* Gifts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto w-full px-2 sm:px-4">
          {GIFTS.map((gift, index) => {
            const isOpened = openedGifts.includes(gift.id);
            const isHovered = hoveredGift === gift.id;
            
            return (
              <button
                key={gift.id}
                ref={(el) => (giftsRefs.current[index] = el)}
                onClick={() => openGift(gift)}
                onMouseEnter={() => setHoveredGift(gift.id)}
                onMouseLeave={() => setHoveredGift(null)}
                className={`group relative p-4 sm:p-5 md:p-6 rounded-2xl transition-all duration-300 
                          ${isOpened 
                            ? 'opacity-80 scale-95 cursor-default' 
                            : 'cursor-pointer hover:scale-105 active:scale-95'
                          } overflow-hidden`}
                style={{
                  background: isOpened 
                    ? `linear-gradient(135deg, ${gift.color}15, ${gift.color}08)` 
                    : `linear-gradient(135deg, ${gift.color}30, ${gift.color}15)`,
                  border: `1px solid ${gift.color}${isOpened ? '20' : '40'}`,
                  boxShadow: isHovered && !isOpened 
                    ? `0 20px 40px ${gift.color}40, 0 0 60px ${gift.color}30` 
                    : `0 10px 30px ${gift.color}20`,
                }}
                disabled={isOpened}
              >
                {/* Background Glow */}
                <div 
                  className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                    isHovered && !isOpened ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    background: `radial-gradient(circle at center, ${gift.color}30, transparent 70%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className={`text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 transition-transform duration-300 
                                ${isHovered && !isOpened ? 'scale-110 rotate-12' : ''}`}>
                    {gift.emoji}
                  </div>
                  <h3 className={`text-sm sm:text-base md:text-lg font-semibold text-center transition-colors duration-300
                               ${isOpened ? 'text-white/70' : 'text-white'}`}>
                    {gift.title}
                  </h3>
                  <div className={`mt-1 text-xs sm:text-sm transition-all duration-300 
                                ${isOpened ? 'opacity-0 scale-0' : 'opacity-60'}`}>
                    {isOpened ? 'Opened' : 'Click to open'}
                  </div>
                </div>

                {/* Hover Indicator */}
                {isHovered && !isOpened && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-white/80 rounded-full animate-ping" />
                )}

                {/* Opened Checkmark */}
                {isOpened && (
                  <div className="absolute top-2 right-2 text-lg opacity-70">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress Indicator */}
        {openedGifts.length > 0 && (
          <div className="mt-8 sm:mt-12 max-w-md w-full">
            <div className="flex justify-between text-sm text-purple-300/80 mb-2">
              <span>Progress</span>
              <span>{openedGifts.length}/5 gifts</span>
            </div>
            <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${(openedGifts.length / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Completion Message */}
        {showFinale && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-purple-900/95 via-pink-900/90 to-yellow-900/90 
                          rounded-2xl sm:rounded-3xl border border-pink-500/30 backdrop-blur-xl
                          max-w-sm sm:max-w-md w-full animate-scale-in">
              <div className="text-5xl sm:text-6xl mb-4">🎉✨</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">All Gifts Opened!</h2>
              <p className="text-pink-200/80 mb-6">
                You've discovered all the special gifts prepared for you!
              </p>
              <div className="text-3xl animate-bounce">🎁</div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={!!selectedGift} onOpenChange={() => setSelectedGift(null)}>
        <DialogContent 
          ref={dialogRef}
          className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-white/20 
                   backdrop-blur-xl text-white max-w-md sm:max-w-lg md:max-w-xl 
                   rounded-2xl p-0 overflow-hidden"
        >
          {selectedGift && (
            <>
              <DialogHeader className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl sm:text-2xl flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl">{selectedGift.emoji}</span>
                    <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      {selectedGift.title}
                    </span>
                  </DialogTitle>
                  <button
                    onClick={() => setSelectedGift(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </DialogHeader>
              <div className="p-6">
                {renderGiftContent(selectedGift)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!activeMedia} onOpenChange={() => setActiveMedia(null)}>
        <DialogContent className="max-w-5xl bg-black/95 border-none p-0 overflow-hidden">
          <div className="relative">
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {activeMedia?.type === 'image' && (
              <div className="max-h-[85vh] flex items-center justify-center p-4">
                <img
                  src={activeMedia.src}
                  alt="Special memory"
                  className="max-h-[80vh] max-w-full object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
            )}

            {activeMedia?.type === 'video' && (
              <div className="max-h-[85vh] p-4">
                <video
                  src={activeMedia.src}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[80vh] rounded-lg"
                  controlsList="nodownload"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        /* Improve scrolling for dialogs on mobile */
        @media (max-height: 700px) {
          [role="dialog"] > div {
            max-height: 90vh;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}
