import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { 
  Play, Pause, X, ExternalLink, Maximize2, Music, Loader2, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';

// --- Types & Constants ---
interface Gift {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  type: 'letter' | 'media' | 'audio' | 'pdf' | 'final';
  color: string;
  gradient: string;
  glowColor: string;
}

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumbnailContent?: React.ReactNode; // Emoji or Icon for the grid view
}

const GOOGLE_SLIDES_LINK = 'https://docs.google.com/presentation/d/192aK3xvHF8VkuSBFzhxgdMKcER61AhOUfQpVj_681LE/view';
const GOOGLE_DRIVE_AUDIO_LINK = 'https://drive.google.com/file/d/1pjGcBhQoA5CrEkiLm4bNBdz0fPCfchQW/view?usp=sharing';

// Centralized Media Array for Easy Navigation
const MEDIA_ITEMS: MediaItem[] = [
  ...[1, 2, 3, 4, 5].map((i) => ({
    type: 'image' as const,
    src: `/assets/gifts/media/img${i}.jpeg`,
    thumbnailContent: '🌺'
  })),
  {
    type: 'video' as const,
    src: '/assets/gifts/media/video.mp4',
    thumbnailContent: <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-1" />
  }
];

const GIFTS: Gift[] = [
  { 
    id: 1, 
    emoji: '💛', 
    title: 'Happy', 
    subtitle: 'سعيد', 
    type: 'letter', 
    color: '#f472b6', 
    gradient: 'from-pink-500/30 via-rose-500/25 to-rose-600/20', 
    glowColor: '#f472b6' 
  },
  { 
    id: 2, 
    emoji: '🎂', 
    title: 'Birthday', 
    subtitle: 'ميلاد', 
    type: 'media', 
    color: '#8b5cf6', 
    gradient: 'from-purple-500/30 via-violet-500/25 to-indigo-600/20', 
    glowColor: '#8b5cf6' 
  },
  { 
    id: 3, 
    emoji: '🎶', 
    title: 'To', 
    subtitle: 'لكِ', 
    type: 'audio', 
    color: '#60a5fa', 
    gradient: 'from-blue-500/30 via-cyan-500/25 to-sky-600/20', 
    glowColor: '#60a5fa' 
  },
  { 
    id: 4, 
    emoji: '📄', 
    title: 'You', 
    subtitle: 'أنتِ', 
    type: 'pdf', 
    color: '#34d399', 
    gradient: 'from-emerald-500/30 via-teal-500/25 to-green-600/20', 
    glowColor: '#34d399' 
  },
  { 
    id: 5, 
    emoji: '💖', 
    title: 'Afrah Ghazi', 
    subtitle: 'أفراح غازي', 
    type: 'final', 
    color: '#fbbf24', 
    gradient: 'from-yellow-500/30 via-amber-500/25 to-orange-600/20', 
    glowColor: '#fbbf24' 
  },
];

const LETTER_CONTENT_1 = `i will write this on january 14 12 am.`;
const LETTER_CONTENT_FINAL = `Dear Afrah,

Thanks a lot for giving this your time.

The core intention behind this was to make your special day memorable, happier. 
It was to honour this special day, this special moment that happened two decades ago.
You being what you are is what truly helped to craft this.
This is all yours.
You are free to percieve this in any way your heart feels.

Happy Birthday,
May life treat you the way you desire.
May joy find you all the time.
May you always recognize your incredible worth.

Happy Birthday.
May this year be your most beautiful yet.
And the next one more beautiful.
And so on,

Forever. 💖`;

export function GiftsScene() {
  const { updateProgress, settings } = useSceneStore();
  const [openedGifts, setOpenedGifts] = useState<number[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  // Media Overlay State - Now storing INDEX instead of object
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  
  // UI State
  const [hoveredGift, setHoveredGift] = useState<number | null>(null);
  const [bgImage, setBgImage] = useState<string>(settings.customGiftBackground || '/assets/gifts/background.jpg');

  // Refs
  const giftsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRefs = useRef<gsap.core.Tween[]>([]);

  // --- Effects ---

  useEffect(() => {
    if (settings.customGiftBackground) {
      setBgImage(settings.customGiftBackground);
    }
  }, [settings.customGiftBackground]);

  // Initial Animation
  useEffect(() => {
    if (!settings.reducedMotion) {
      animationRefs.current.forEach(anim => anim.kill());
      animationRefs.current = [];

      giftsRefs.current.forEach((ref, i) => {
        if (ref && !openedGifts.includes(i + 1)) {
          const anim = gsap.to(ref, {
            y: -8,
            rotation: 1,
            duration: 4 + i * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.3,
          });
          animationRefs.current.push(anim);
        }
      });

      if (openedGifts.length === 5 && !showFinale) {
        setTimeout(() => setShowFinale(true), 1500);
      }

      if (containerRef.current) {
        gsap.fromTo(containerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 2, ease: 'power2.inOut' }
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
  }, [openedGifts, settings.reducedMotion, showFinale]);

  // --- Logic Functions ---

  const openGift = (gift: Gift) => {
    if (openedGifts.includes(gift.id)) {
      setSelectedGift(gift);
      return;
    }

    const giftIndex = gift.id - 1;
    if (animationRefs.current[giftIndex]) {
      animationRefs.current[giftIndex].kill();
    }

    const newOpened = [...openedGifts, gift.id];
    setOpenedGifts(newOpened);
    updateProgress({ giftsOpened: newOpened });

    const giftElement = giftsRefs.current[giftIndex];
    if (giftElement && !settings.reducedMotion) {
      gsap.timeline({
        onComplete: () => {
          setTimeout(() => setSelectedGift(gift), 600);
        }
      })
      .to(giftElement, {
        scale: 1.05,
        y: -10,
        boxShadow: `0 0 30px ${gift.glowColor}60`,
        duration: 0.8,
        ease: 'power2.out',
      })
      .to(giftElement, {
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      });
    } else {
      setTimeout(() => setSelectedGift(gift), 600);
    }

    if (settings.soundEnabled) audioManager.play('success');

    if (!settings.reducedMotion && giftElement) {
      createSparkleEffect(giftElement, gift.glowColor);
    }

    if (gift.id === 5) {
      setTimeout(() => setShowFinale(true), 2000);
    }
  };

  const createSparkleEffect = (element: HTMLElement, color: string) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'fixed text-xl pointer-events-none z-50 text-white/80';
        sparkle.style.left = `${rect.left + rect.width / 2}px`;
        sparkle.style.top = `${rect.top + rect.height / 2}px`;
        sparkle.style.filter = `drop-shadow(0 0 4px ${color})`;
        document.body.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80 - 30,
          opacity: 0,
          scale: 0,
          rotation: 90,
          duration: 2.5,
          ease: 'power1.out',
          onComplete: () => sparkle.remove(),
        });
      }, i * 200);
    }
  };

  const loadAudio = async () => {
    if (audioRef.current) return;
    
    setIsAudioLoading(true);
    setAudioError(false);
    
    try {
      audioRef.current = new Audio('/assets/gifts/audio/Hbd.mp3');
      
      audioRef.current.addEventListener('canplaythrough', () => setIsAudioLoading(false));
      audioRef.current.addEventListener('error', () => {
        setIsAudioLoading(false);
        setAudioError(true);
        audioRef.current = null;
      });
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Renderers ---

  const renderGiftContent = (gift: Gift) => {
    switch (gift.type) {
      case 'letter':
        return (
          <div className="relative group p-2">
            <div className="font-elegant whitespace-pre-wrap text-base leading-loose text-slate-800 p-6 sm:p-10 bg-[#fffdf5] rounded-xl shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] mx-auto max-w-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjkiIG51bW9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] pointer-events-none"></div>
              <div className="relative z-10 selection:bg-pink-200 selection:text-pink-900">
                {LETTER_CONTENT_1}
              </div>
              <div className="absolute bottom-4 right-6 text-pink-400 opacity-50 text-xl">💌</div>
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="space-y-6 px-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              {MEDIA_ITEMS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMediaIndex(i)}
                  className={`group relative aspect-[4/5] rounded-lg border border-white/10 hover:border-purple-300/40 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden
                    ${item.type === 'video' ? 'col-span-2 sm:col-span-1 bg-black/40 aspect-video sm:aspect-[4/5]' : 'bg-white/5'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  
                  {item.type === 'image' && (
                     <img src={item.src} alt="thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                  )}

                  <div className="absolute inset-0 flex flex-col items-center justify-center relative z-10">
                    {typeof item.thumbnailContent === 'string' ? (
                        <span className="text-xl sm:text-3xl opacity-90 group-hover:scale-110 transition-transform drop-shadow-md">{item.thumbnailContent}</span>
                    ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                           {item.thumbnailContent}
                        </div>
                    )}
                  </div>

                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-10">
                    <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-white/80" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-8 px-4 py-2">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)] flex items-center justify-center relative overflow-hidden">
                   <div className={`absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.1)_360deg)] opacity-30 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                   <div className="absolute inset-[35%] rounded-full border border-white/5 bg-black/40 backdrop-blur-md" />
                   <Music className={`relative z-10 w-8 h-8 text-blue-300/80 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-light text-white tracking-wide">bday song</h3>
                <p className="text-blue-200/50 text-xs sm:text-sm font-light">Mute bg audio & use headphones!</p>
              </div>
            </div>
            
            <div className="space-y-6 max-w-xs mx-auto w-full">
              <div className="relative group">
                <div className="bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400/80 rounded-full transition-all duration-300" style={{ width: `${audioProgress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-2 font-mono tracking-wider">
                  <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                  <span>{formatTime(audioRef.current?.duration || 0)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleAudioPlay}
                  disabled={isAudioLoading}
                  variant="ghost"
                  className="w-full py-6 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-full transition-all duration-300"
                >
                  {isAudioLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  <span className="font-light text-sm">
                    {isAudioLoading ? 'Loading...' : audioError ? 'Open Link' : isPlaying ? 'Pause' : 'Play Song'}
                  </span>
                </Button>
                
                <div className="text-center">
                   <button onClick={() => window.open(GOOGLE_DRIVE_AUDIO_LINK, '_blank')} className="text-[10px] text-white/20 hover:text-white/40 uppercase tracking-widest">
                     Open in Drive ↗
                   </button>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="text-center space-y-8 py-4">
            <div className="relative text-6xl sm:text-7xl mb-6 filter drop-shadow-2xl opacity-90">📖✨</div>
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-light text-white tracking-wide">bday ppt</h3>
              <div className="h-px w-12 bg-emerald-500/30 mx-auto my-3" />
              <p className="text-emerald-100/70 text-lg italic font-serif">"Branches, Trees, Garden"</p>
            </div>
            <div className="max-w-xs mx-auto pt-4">
              <Button onClick={() => window.open(GOOGLE_SLIDES_LINK, '_blank')} className="w-full py-6 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-100 border border-emerald-500/20 rounded-xl transition-all duration-500">
                Unwrap it <ExternalLink className="ml-2 w-4 h-4 opacity-50" />
              </Button>
            </div>
          </div>
        );
      case 'final':
        return (
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative font-elegant whitespace-pre-wrap text-base sm:text-lg leading-loose text-amber-50/90 p-8 sm:p-10 bg-gradient-to-b from-black/40 to-black/60 rounded-xl border border-amber-500/10 backdrop-blur-xl text-center shadow-2xl">
              <div className="mb-6 opacity-80">✨</div>
              {LETTER_CONTENT_FINAL}
              <div className="mt-6 opacity-80">💖</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // --- Optimized Media Overlay with Swipe Support ---
  const MediaOverlay = () => {
    // We check if index is not null to render
    if (activeMediaIndex === null) return null;

    const currentMedia = MEDIA_ITEMS[activeMediaIndex];
    
    // Swipe Logic State
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px) 
    const minSwipeDistance = 50; 

    const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null); 
      setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe) {
        handleNext();
      } else if (isRightSwipe) {
        handlePrev();
      }
    };

    const handleNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveMediaIndex((prev) => 
        prev === null ? null : (prev + 1) % MEDIA_ITEMS.length
      );
    };

    const handlePrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveMediaIndex((prev) => 
        prev === null ? null : (prev - 1 + MEDIA_ITEMS.length) % MEDIA_ITEMS.length
      );
    };

    return createPortal(
      <div 
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setActiveMediaIndex(null)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'none' }} 
      >
        {/* Close Button */}
        <button 
          onClick={(e) => {
             e.stopPropagation();
             setActiveMediaIndex(null);
          }}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[10000] p-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg"
          style={{ 
             marginRight: 'env(safe-area-inset-right)', 
             marginTop: 'env(safe-area-inset-top)' 
          }}
          aria-label="Close Media"
        >
          <X className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Previous Arrow (Desktop/Tablet) */}
        <button
          onClick={handlePrev}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-[10000] p-4 bg-black/20 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Next Arrow (Desktop/Tablet) */}
        <button
          onClick={handleNext}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-[10000] p-4 bg-black/20 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
        
        {/* Content Container */}
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
          <div 
            className="relative max-w-full max-h-full flex items-center justify-center transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
            key={activeMediaIndex} // Key forces react to remount on change (restarting video, resetting zoom)
          >
            {currentMedia.type === 'image' ? (
              <img 
                src={currentMedia.src} 
                alt="Memory" 
                className="max-h-[85vh] max-w-[95vw] w-auto h-auto object-contain rounded-md shadow-2xl bg-black/50 animate-in zoom-in-95 duration-300"
              />
            ) : (
              <div className="w-[95vw] max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
                <video 
                  src={currentMedia.src} 
                  controls 
                  autoPlay 
                  playsInline
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Swipe Hints (Dots) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-[10000]">
          {MEDIA_ITEMS.map((_, idx) => (
            <div 
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeMediaIndex ? 'bg-white w-4' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0a0510]">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(60, 30, 80, 0.4) 0%, rgba(10, 5, 16, 0.9) 70%, rgba(0,0,0,1) 100%)' }} />
      <div className="absolute inset-0 transition-all duration-1000 z-0" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, filter: 'blur(2px) saturate(0.8)' }} />
      <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')]"></div>

      {showFinale && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <Confetti recycle={false} numberOfPieces={300} gravity={0.05} colors={['#fbbf24', '#f472b6', '#a855f7', '#fff']} wind={0.005} opacity={0.8} />
          <AdaptiveParticleSystem count={150} color="#fbbf24" speed={0.4} size={2} />
        </div>
      )}

      {/* Main Grid */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
        <div className="text-center mb-6 sm:mb-12 relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-2 tracking-wide drop-shadow-xl">
            <span className="font-cursive bg-gradient-to-br from-amber-100 via-pink-100 to-purple-100 bg-clip-text text-transparent opacity-90">
              Unwrap Your Gifts
            </span>
          </h1>
          <p className="text-sm text-purple-200/60 font-elegant tracking-wider">💕It's all yours💕</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8 max-w-6xl mx-auto w-full px-2">
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
                className={`group relative aspect-[4/5] rounded-xl transition-all duration-500 ease-out border border-white/10
                          ${isOpened ? 'opacity-70 grayscale-[0.3] scale-100' : 'hover:-translate-y-2'} backdrop-blur-sm`}
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                  boxShadow: isHovered ? `0 10px 30px -5px ${gift.color}30` : `0 5px 15px -5px rgba(0,0,0,0.5)`,
                }}
              >
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2">
                  <div className={`text-4xl sm:text-5xl mb-4 transition-transform ${isHovered && !isOpened ? 'scale-110' : ''}`}>
                    {gift.emoji}
                  </div>
                  <div className="text-center">
                    <h3 className={`text-xs sm:text-sm font-medium tracking-widest uppercase ${isOpened ? 'text-white/60' : 'text-white/90'}`}>
                      {gift.title}
                    </h3>
                  </div>
                </div>
                {isOpened && (
                  <div className="absolute top-2 right-2 text-green-300 text-xs bg-green-900/40 rounded-full w-5 h-5 flex items-center justify-center">✓</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        {openedGifts.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/5">
             <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 transition-all duration-1000 ease-out" style={{ width: `${(openedGifts.length / 5) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Gift Content Modal */}
      <Dialog open={!!selectedGift} onOpenChange={() => setSelectedGift(null)}>
        <DialogContent 
          ref={dialogRef}
          className="bg-[#0f0a15]/95 border border-white/10 backdrop-blur-2xl text-white max-w-[95vw] sm:max-w-lg rounded-2xl p-0 overflow-hidden animate-dialog-in max-h-[85vh] flex flex-col"
          style={{ boxShadow: selectedGift ? `0 0 60px -20px ${selectedGift.glowColor}30` : 'none' }}
        >
          {selectedGift && (
            <>
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedGift.emoji}</span>
                  <div>
                    <div className="text-base font-light tracking-wide text-white/90">{selectedGift.title}</div>
                    <div className="text-[10px] text-white/40 font-serif italic">{selectedGift.subtitle}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedGift(null)} className="text-white/40 hover:text-white p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {renderGiftContent(selectedGift)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <MediaOverlay />
    </div>
  );
}
