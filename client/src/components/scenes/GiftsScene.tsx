import { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { Play, Pause, Volume2, X, ExternalLink, Maximize2, Music, Loader2 } from 'lucide-react';

interface Gift {
  id: number;
  emoji: string;
  title: string;
  type: 'letter' | 'media' | 'audio' | 'pdf' | 'final';
  color: string;
  gradient: string;
}

const GOOGLE_SLIDES_LINK = 'https://docs.google.com/presentation/d/192aK3xvHF8VkuSBFzhxgdMKcER61AhOUfQpVj_681LE/view';
const GOOGLE_DRIVE_AUDIO_LINK = 'https://drive.google.com/file/d/1pjGcBhQoA5CrEkiLm4bNBdz0fPCfchQW/view?usp=sharing';

const GIFTS: Gift[] = [
  { 
    id: 1, 
    emoji: '💛', 
    title: 'Happy', 
    type: 'letter',
    color: '#f472b6',
    gradient: 'from-pink-500/20 via-rose-500/15 to-rose-600/10'
  },
  { 
    id: 2, 
    emoji: '🎂', 
    title: 'Birthday', 
    type: 'media',
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 via-violet-500/15 to-indigo-600/10'
  },
  { 
    id: 3, 
    emoji: '🎶', 
    title: 'To', 
    type: 'audio',
    color: '#60a5fa',
    gradient: 'from-blue-500/20 via-cyan-500/15 to-sky-600/10'
  },
  { 
    id: 4, 
    emoji: '📄', 
    title: 'You', 
    type: 'pdf',
    color: '#34d399',
    gradient: 'from-emerald-500/20 via-teal-500/15 to-green-600/10'
  },
  { 
    id: 5, 
    emoji: '💖', 
    title: 'Afrah Ghazi', 
    type: 'final',
    color: '#fbbf24',
    gradient: 'from-yellow-500/20 via-amber-500/15 to-orange-600/10'
  },
];

const LETTER_CONTENT_1 = `Dear Afrah,

Happy Birthday 🎉

I hope today wraps you in warmth, smiles, and the quiet joy of knowing how deeply you are appreciated.

You bring light into moments without trying, and that itself is something rare.

Here's to laughter, growth, soft days, and dreams that feel closer than before.

Always wishing you happiness,
Your Friend 💛`;

const LETTER_CONTENT_FINAL = `Afrah,

Some people leave marks on time without realizing it.
You are one of them.

Thank you for existing exactly as you are.
Thank you for the memories, the calm, the chaos, the meaning.

May life be gentle with you.
May joy find you often.
May you always know your worth.

Happy Birthday.

Always. 💖`;

export function GiftsScene() {
  const { updateProgress, settings } = useSceneStore();
  const [openedGifts, setOpenedGifts] = useState<number[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
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
            y: -12,
            duration: 2 + i * 0.15,
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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
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
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          setTimeout(() => setSelectedGift(gift), 200);
        }
      });
    } else {
      setTimeout(() => setSelectedGift(gift), 200);
    }

    if (settings.soundEnabled) {
      audioManager.play('success');
    }

    // Create sparkle effect
    if (!settings.reducedMotion && giftElement) {
      createSparkleEffect(giftElement);
    }

    if (gift.id === 5) {
      setTimeout(() => setShowFinale(true), 600);
    }
  };

  const createSparkleEffect = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'fixed text-2xl pointer-events-none z-50';
        sparkle.style.left = `${rect.left + rect.width / 2}px`;
        sparkle.style.top = `${rect.top + rect.height / 2}px`;
        document.body.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80 - 40,
          opacity: 0,
          scale: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => sparkle.remove(),
        });
      }, i * 100);
    }
  };

  const loadAudio = async () => {
    if (audioRef.current) return;
    
    setIsAudioLoading(true);
    setAudioError(false);
    
    try {
      // Try to load the audio file
      audioRef.current = new Audio('/assets/gifts/audio/Hbd.wav');
      
      // Set up event listeners
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
      
      // Preload the audio
      audioRef.current.load();
      
      // If still loading after 3 seconds, mark as error
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
      console.warn('Audio play failed:', error);
      setAudioError(true);
      window.open(GOOGLE_DRIVE_AUDIO_LINK, '_blank');
    }
  };

  const handleDirectAudioLink = () => {
    window.open(GOOGLE_DRIVE_AUDIO_LINK, '_blank');
  };

  const renderGiftContent = (gift: Gift) => {
    switch (gift.type) {
      case 'letter':
        return (
          <div className="relative">
            <div className="absolute -top-4 -right-4 text-3xl opacity-20">💌</div>
            <div className="font-elegant whitespace-pre-wrap text-base sm:text-lg leading-relaxed text-white/90 p-4 sm:p-6 bg-gradient-to-br from-pink-900/20 to-rose-900/10 rounded-xl sm:rounded-2xl border border-pink-500/20 backdrop-blur-sm">
              {LETTER_CONTENT_1}
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() =>
                    setActiveMedia({
                      type: 'image',
                      src: `/assets/gifts/media/img${i}.jpeg`,
                    })
                  }
                  className="group relative aspect-square bg-gradient-to-br from-purple-900/30 to-violet-900/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-violet-500/0 group-hover:from-purple-500/10 group-hover:to-violet-500/10 transition-all duration-300" />
                  <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-300">🌺</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
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
              className="group relative aspect-video bg-gradient-to-br from-pink-900/30 to-rose-900/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-transparent to-rose-500/0 group-hover:from-pink-500/10 group-hover:to-rose-500/10 transition-all duration-300" />
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">🎬</span>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs sm:text-sm text-pink-200/80">Click to watch</p>
              </div>
            </button>
            <p className="text-center text-purple-300/60 text-xs sm:text-sm font-elegant">
              Click on any media to view full size
            </p>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <Music className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-300" />
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Birthday Melody</h3>
                <p className="text-blue-300/70 text-xs sm:text-sm">A special song for you</p>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="bg-blue-900/30 h-2 sm:h-2.5 rounded-full overflow-hidden">
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
            
            <div className="space-y-3">
              <Button 
                onClick={handleAudioPlay}
                disabled={isAudioLoading}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg sm:rounded-xl group relative"
              >
                {isAudioLoading ? (
                  <Loader2 className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                ) : (
                  <Play className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                )}
                {isAudioLoading ? 'Loading...' : audioError ? 'Open in Google Drive' : isPlaying ? 'Pause Melody' : 'Play Birthday Melody'}
              </Button>
              
              {audioError && (
                <div className="text-center">
                  <p className="text-sm text-red-300/80 mb-2">Audio loading failed</p>
                  <Button
                    onClick={handleDirectAudioLink}
                    variant="outline"
                    className="w-full py-3 text-sm border-blue-400/40 text-blue-300 hover:bg-blue-900/30"
                  >
                    <ExternalLink className="mr-2 w-4 h-4" />
                    Open in Google Drive
                  </Button>
                </div>
              )}
              
              <div className="text-center">
                <button
                  onClick={handleDirectAudioLink}
                  className="text-xs sm:text-sm text-blue-400/70 hover:text-blue-300 transition-colors underline underline-offset-2"
                >
                  Or open directly in Google Drive
                </button>
              </div>
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📖✨</div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Special Birthday Presentation</h3>
              <p className="text-emerald-300/80 text-sm sm:text-base">"Branches, Trees, Garden"</p>
              <p className="text-emerald-200/60 text-xs sm:text-sm mt-1">A curated collection of memories and wishes</p>
            </div>
            
            <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-900/30 to-green-900/20 rounded-lg sm:rounded-xl border border-emerald-500/20">
              <p className="text-emerald-200/70 text-sm sm:text-base mb-3 sm:mb-4">
                This interactive presentation holds heartfelt messages and beautiful memories curated just for you.
              </p>
              <Button 
                onClick={() => window.open(GOOGLE_SLIDES_LINK, '_blank')}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-lg sm:rounded-xl group"
              >
                <ExternalLink className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                Open Special Presentation
              </Button>
            </div>
          </div>
        );
      case 'final':
        return (
          <div className="relative">
            <div className="absolute -top-6 -right-6 text-3xl sm:text-4xl opacity-20 animate-pulse">✨</div>
            <div className="absolute -bottom-6 -left-6 text-3xl sm:text-4xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>💖</div>
            <div className="font-elegant whitespace-pre-wrap text-base sm:text-lg leading-relaxed text-white/90 p-4 sm:p-6 bg-gradient-to-br from-yellow-900/20 via-amber-900/15 to-orange-900/10 rounded-xl sm:rounded-2xl border border-amber-500/20 backdrop-blur-sm text-center">
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
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')] 
                    opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-purple-500/10 rounded-full blur-2xl sm:blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-pink-500/10 rounded-full blur-2xl sm:blur-3xl" />
      </div>

      {/* Celebration Effects */}
      {showFinale && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <Confetti 
              recycle={false} 
              numberOfPieces={400} 
              gravity={0.08}
              colors={['#fbbf24', '#ec4899', '#a855f7', '#60a5fa', '#34d399']}
              wind={0.01}
            />
          </div>
          <AdaptiveParticleSystem 
            count={150} 
            color="#fbbf24" 
            speed={0.5} 
            size={2}
            className="absolute inset-0 pointer-events-none"
          />
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 md:mb-12 px-2">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 animate-float">
            🎁✨
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2
                        drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <span className="font-cursive bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 
                           bg-clip-text text-transparent">
              Unwrap Your Gifts
            </span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-purple-200/80 font-elegant max-w-xl mx-auto">
            Click on each gift to discover something special
            <span className="block text-xs text-purple-300/60 mt-1">
              {openedGifts.length === 0 ? 'Start with the first gift!' : `${openedGifts.length}/5 gifts opened`}
            </span>
          </p>
        </div>

        {/* Gifts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto w-full px-2">
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
                className={`group relative p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 
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
                    ? `0 15px 30px ${gift.color}30, 0 0 40px ${gift.color}20` 
                    : `0 8px 20px ${gift.color}15`,
                }}
                disabled={isOpened}
              >
                {/* Background Glow */}
                <div 
                  className={`absolute inset-0 rounded-xl sm:rounded-2xl transition-opacity duration-300 ${
                    isHovered && !isOpened ? 'opacity-80' : 'opacity-0'
                  }`}
                  style={{
                    background: `radial-gradient(circle at center, ${gift.color}25, transparent 70%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className={`text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2 transition-transform duration-300 
                                ${isHovered && !isOpened ? 'scale-110' : ''}`}>
                    {gift.emoji}
                  </div>
                  <h3 className={`text-sm sm:text-base font-semibold text-center transition-colors duration-300
                               ${isOpened ? 'text-white/70' : 'text-white'}`}>
                    {gift.title}
                  </h3>
                </div>

                {/* Opened Checkmark */}
                {isOpened && (
                  <div className="absolute top-2 right-2 text-base sm:text-lg opacity-70">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress Indicator */}
        {openedGifts.length > 0 && (
          <div className="mt-6 sm:mt-8 max-w-sm w-full px-4">
            <div className="flex justify-between text-xs sm:text-sm text-purple-300/80 mb-2">
              <span>Progress</span>
              <span>{openedGifts.length}/5 gifts</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-purple-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${(openedGifts.length / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Completion Message */}
        {showFinale && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <div className="text-center p-5 sm:p-6 bg-gradient-to-br from-purple-900/95 via-pink-900/90 to-yellow-900/90 
                          rounded-xl sm:rounded-2xl border border-pink-500/30 backdrop-blur-xl
                          max-w-xs sm:max-w-sm w-full animate-scale-in">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎉✨</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">All Gifts Opened!</h2>
              <p className="text-pink-200/80 text-sm sm:text-base mb-4">
                You've discovered all the special gifts!
              </p>
              <div className="text-2xl sm:text-3xl animate-bounce">🎁</div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={!!selectedGift} onOpenChange={() => setSelectedGift(null)}>
        <DialogContent 
          ref={dialogRef}
          className="bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-white/20 
                   backdrop-blur-xl text-white max-w-xs sm:max-w-md md:max-w-lg 
                   rounded-xl sm:rounded-2xl p-0 overflow-hidden"
        >
          {selectedGift && (
            <>
              <DialogHeader className="p-4 sm:p-6 pb-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg sm:text-xl flex items-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl">{selectedGift.emoji}</span>
                    <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      {selectedGift.title}
                    </span>
                  </DialogTitle>
                  <button
                    onClick={() => setSelectedGift(null)}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </DialogHeader>
              <div className="p-4 sm:p-6">
                {renderGiftContent(selectedGift)}
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
              className="absolute top-2 sm:top-4 right-2 sm:right-4 z-50 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </button>
            
            {activeMedia?.type === 'image' && (
              <div className="max-h-[80vh] sm:max-h-[85vh] flex items-center justify-center p-2 sm:p-4">
                <img
                  src={activeMedia.src}
                  alt="Special memory"
                  className="max-h-[75vh] sm:max-h-[80vh] max-w-full object-contain rounded-lg"
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
                  className="w-full h-auto max-h-[75vh] sm:max-h-[80vh] rounded-lg"
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
          50% { transform: translateY(-8px); }
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
            max-height: 85vh;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}
