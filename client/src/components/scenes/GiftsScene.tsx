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
  ChevronLeft, ChevronRight, Lock, RotateCcw, LogOut
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
}https://github.com/bilsonhere/thejan14experience/edit/main/client/src/components/scenes/GiftsScene.tsx

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumbnailContent?: React.ReactNode; 
}

const GOOGLE_SLIDES_LINK = 'https://docs.google.com/presentation/d/192aK3xvHF8VkuSBFzhxgdMKcER61AhOUfQpVj_681LE/view';
const GOOGLE_DRIVE_AUDIO_LINK = 'https://drive.google.com/file/d/1pjGcBhQoA5CrEkiLm4bNBdz0fPCfchQW/view?usp=sharing';

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

const LETTER_CONTENT_1 = `(midnight wish)
Happy birthday Afrah. I hope today treats you with comfort and gives you moments you can cherish for ages. May this decade brings you all the happiness, peace, prosperity and success in your and your loved ones lives. You are a wonderful human being. Keep being yourself. May Allah grant you with the guidance and wisdom you will need in every path. Ameen.`;
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


Wishing you well. Always in my Duas!`;

// --- Helper Component: Typewriter ---
const TypewriterText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
  const [display, setDisplay] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplay(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 30); // Typing speed
    return () => clearInterval(interval);
  }, [text]);

  return <div className="whitespace-pre-wrap">{display}<span className="animate-pulse text-amber-400">|</span></div>;
};

export function GiftsScene() {
  const { updateProgress, settings } = useSceneStore();
  const [openedGifts, setOpenedGifts] = useState<number[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // State for exit black screen
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  // Media Overlay State
  const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
  
  // UI State
  const [hoveredGift, setHoveredGift] = useState<number | null>(null);
  const [bgImage, setBgImage] = useState<string>(settings.customGiftBackground || '/assets/gifts/background.jpg');

  // Refs
  const giftsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const animationRefs = useRef<gsap.core.Tween[]>([]);

  // --- Effects ---

  
  // 2. Initial Animation & Floating
  useEffect(() => {
    if (!settings.reducedMotion) {
      animationRefs.current.forEach(anim => anim.kill());
      animationRefs.current = [];

      giftsRefs.current.forEach((ref, i) => {
        if (ref && !openedGifts.includes(i + 1)) {
          // Floating animation
          const anim = gsap.to(ref, {
            y: -8,
            duration: 3 + i * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2,
          });
          animationRefs.current.push(anim);
        }
      });

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
  }, [openedGifts, settings.reducedMotion]);

  // 3. Handle End Screen Transition
  const handleDialogClose = () => {
    if (selectedGift?.id === 5) {
      setSelectedGift(null);
      if (gridRef.current) {
        gsap.to(gridRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => setShowEndScreen(true)
        });
      } else {
        setShowEndScreen(true);
      }
    } else {
      setSelectedGift(null);
    }
  };

  const handleReplay = () => {
    setShowEndScreen(false);
    setShowFinale(false);
    setOpenedGifts([]);
    updateProgress({ giftsOpened: [] });
    if (gridRef.current) {
      gsap.set(gridRef.current, { opacity: 0, scale: 0.95 });
      gsap.to(gridRef.current, { opacity: 1, scale: 1, duration: 1, delay: 0.2 });
    }
  };

  const handleExit = () => {
    setIsExiting(true);
    audioManager.stop(); // Stop all sound
    
    // Attempt to close window (Note: this often fails in modern browsers if not opened by script)
    setTimeout(() => {
      try {
        window.close();
      } catch (e) {
        console.log("Cannot close window via script");
      }
    }, 1000);
  };

  // --- Logic Functions ---

  const openGift = (gift: Gift, index: number) => {
    // Sequential Locking Logic
    const isLocked = index > 0 && !openedGifts.includes(GIFTS[index - 1].id);
    if (isLocked) {
      if (settings.soundEnabled) audioManager.play('error');
      const el = giftsRefs.current[index];
      if (el) {
        gsap.to(el, { x: 5, duration: 0.1, yoyo: true, repeat: 3 });
      }
      return;
    }

    if (openedGifts.includes(gift.id)) {
      setSelectedGift(gift);
      return;
    }

    if (animationRefs.current[index]) {
      animationRefs.current[index].kill();
    }

    const newOpened = [...openedGifts, gift.id];
    setOpenedGifts(newOpened);
    updateProgress({ giftsOpened: newOpened });

    const giftElement = giftsRefs.current[index];
    if (giftElement && !settings.reducedMotion) {
      gsap.timeline({
        onComplete: () => {
          setTimeout(() => setSelectedGift(gift), 300);
        }
      })
      .to(giftElement, {
        scale: 1.1,
        y: -15,
        boxShadow: `0 0 50px ${gift.glowColor}80`,
        duration: 0.6,
        ease: 'back.out(1.7)',
      })
      .to(giftElement, {
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    } else {
      setTimeout(() => setSelectedGift(gift), 300);
    }

    if (settings.soundEnabled) audioManager.play('success');

    if (!settings.reducedMotion && giftElement) {
      createSparkleEffect(giftElement, gift.glowColor);
    }

    if (gift.id === 5) {
      setTimeout(() => setShowFinale(true), 1000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (settings.reducedMotion || openedGifts.includes(index + 1)) return;
    
    const el = giftsRefs.current[index];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(el, {
      x: x * 0.2, 
      y: y * 0.2,
      rotation: x * 0.05,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = (index: number) => {
    const el = giftsRefs.current[index];
    if (!el) return;
    
    gsap.to(el, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    });
  };

  const createSparkleEffect = (element: HTMLElement, color: string) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'fixed text-xl pointer-events-none z-50 text-white/80';
        sparkle.style.left = `${rect.left + rect.width / 2}px`;
        sparkle.style.top = `${rect.top + rect.height / 2}px`;
        sparkle.style.filter = `drop-shadow(0 0 4px ${color})`;
        document.body.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100 - 40,
          opacity: 0,
          scale: 0,
          rotation: Math.random() * 180,
          duration: 2 + Math.random(),
          ease: 'power2.out',
          onComplete: () => sparkle.remove(),
        });
      }, i * 150);
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
        if (audioRef.current) setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioProgress(0);
      });
      audioRef.current.load();
    } catch (error) {
      setIsAudioLoading(false);
      setAudioError(true);
      audioRef.current = null;
    }
  };

  const handleAudioPlay = async () => {
    if (audioError) { window.open(GOOGLE_DRIVE_AUDIO_LINK, '_blank'); return; }
    if (!audioRef.current) { await loadAudio(); if (audioError) return; }
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

  // --- Renderers ---

  const renderGiftContent = (gift: Gift) => {
    switch (gift.type) {
      case 'letter':
        return (
          <div className="relative group p-2">
            <div className="font-elegant whitespace-pre-wrap text-base leading-loose text-slate-800 p-6 sm:p-10 bg-[#fffdf5] rounded-xl shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] mx-auto max-w-lg relative overflow-hidden">
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
              </div>
            </div>
            
            <div className="space-y-6 max-w-xs mx-auto w-full">
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
            <div className="relative font-elegant text-base sm:text-lg leading-loose text-amber-50/90 p-8 sm:p-10 bg-gradient-to-b from-black/40 to-black/60 rounded-xl border border-amber-500/10 backdrop-blur-xl text-center shadow-2xl">
              <div className="mb-6 opacity-80">✨</div>
              <TypewriterText text={LETTER_CONTENT_FINAL} />
              <div className="mt-6 opacity-80">💖</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const MediaOverlay = () => {
    if (activeMediaIndex === null) return null;
    const currentMedia = MEDIA_ITEMS[activeMediaIndex];
    
    // Swipe Logic
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
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
      if (distance > minSwipeDistance) handleNext();
      else if (distance < -minSwipeDistance) handlePrev();
    };

    const handleNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveMediaIndex((prev) => prev === null ? null : (prev + 1) % MEDIA_ITEMS.length);
    };

    const handlePrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveMediaIndex((prev) => prev === null ? null : (prev - 1 + MEDIA_ITEMS.length) % MEDIA_ITEMS.length);
    };

    return createPortal(
      <div 
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setActiveMediaIndex(null)}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
        <button onClick={(e) => { e.stopPropagation(); setActiveMediaIndex(null); }} className="absolute top-4 right-4 z-[10000] p-3 bg-white/10 text-white rounded-full"><X /></button>
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()} key={activeMediaIndex}>
            {currentMedia.type === 'image' ? (
              <img src={currentMedia.src} alt="Memory" className="max-h-[85vh] max-w-[95vw] object-contain rounded-md shadow-2xl bg-black/50 animate-in zoom-in-95 duration-300" />
            ) : (
              <div className="w-[95vw] max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"><video src={currentMedia.src} controls autoPlay playsInline className="w-full h-full" /></div>
            )}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-[10000]">
          {MEDIA_ITEMS.map((_, idx) => (
            <div key={idx} className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeMediaIndex ? 'bg-white w-4' : 'bg-white/20'}`} />
          ))}
        </div>
        <button onClick={handlePrev} className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white"><ChevronLeft className="w-8 h-8" /></button>
        <button onClick={handleNext} className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white"><ChevronRight className="w-8 h-8" /></button>
      </div>,
      document.body
    );
  };

  // --- Main Exit "Blackout" Screen ---
  if (isExiting) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black animate-in fade-in duration-1000 flex items-center justify-center">
        <div className="text-white/20 font-light tracking-[0.5em] text-sm animate-pulse">^_^</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0a0510]">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 40%, rgba(60, 30, 80, 0.4) 0%, rgba(10, 5, 16, 0.9) 70%, rgba(0,0,0,1) 100%)' }} />
      
      <div 
        className="absolute inset-0 transition-all duration-1000 z-0" 
        style={{ 
          backgroundImage: `url(${bgImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          opacity: 0.15 + (openedGifts.length * 0.05),
          filter: `blur(${Math.max(0, 2 - openedGifts.length * 0.4)}px) saturate(${0.8 + openedGifts.length * 0.1})` 
        }} 
      />
      
      <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')]"></div>

      {showFinale && !showEndScreen && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <Confetti recycle={true} numberOfPieces={150} gravity={0.03} colors={['#fbbf24', '#f472b6', '#a855f7', '#fff']} wind={0.005} opacity={0.6} />
          <AdaptiveParticleSystem count={150} color="#fbbf24" speed={0.4} size={2} />
        </div>
      )}

      {/* --- Main Grid View --- */}
      {!showEndScreen ? (
        <div ref={gridRef} className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
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
              const isLocked = index > 0 && !openedGifts.includes(GIFTS[index - 1].id);

              return (
                <div
                  key={gift.id}
                  ref={(el) => (giftsRefs.current[index] = el)}
                  onMouseEnter={(e) => { setHoveredGift(gift.id); handleMouseMove(e, index); }}
                  onMouseMove={(e) => handleMouseMove(e, index)}
                  onMouseLeave={() => { setHoveredGift(null); handleMouseLeave(index); }}
                  onClick={() => openGift(gift, index)}
                  className={`group relative aspect-[4/5] rounded-xl transition-all duration-500 ease-out border backdrop-blur-sm cursor-pointer
                            ${isLocked ? 'border-white/5 opacity-50 grayscale' : 'border-white/10 hover:-translate-y-2'}
                            ${isOpened ? 'opacity-90' : ''}`}
                  style={{
                    background: isLocked ? 'rgba(0,0,0,0.3)' : `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                    boxShadow: isHovered && !isLocked ? `0 10px 30px -5px ${gift.color}30` : `0 5px 15px -5px rgba(0,0,0,0.5)`,
                  }}
                >
                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2">
                    {isLocked ? (
                       <Lock className="w-8 h-8 text-white/20 mb-2" />
                    ) : (
                      <>
                        <div className={`text-4xl sm:text-5xl mb-4 transition-transform duration-500 ${isHovered && !isOpened ? 'scale-110' : ''}`}>
                          {isOpened ? '✨' : gift.emoji}
                        </div>
                        <div className="text-center">
                          <h3 className={`text-xs sm:text-sm font-medium tracking-widest uppercase ${isOpened ? 'text-amber-200' : 'text-white/90'}`}>
                            {gift.title}
                          </h3>
                          <p className={`text-[10px] sm:text-xs mt-1 font-serif opacity-80 ${isOpened ? 'text-white/40' : 'text-purple-200/60'}`}>
                            {gift.subtitle}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {openedGifts.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/5">
               <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 transition-all duration-1000 ease-out" style={{ width: `${(openedGifts.length / 5) * 100}%` }} />
            </div>
          )}
        </div>
      ) : (
        /* --- Finale / End Screen --- */
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
           <div className="text-center space-y-8 p-6">
             <div className="text-6xl sm:text-8xl animate-bounce duration-[3000ms]">🎂</div>
             <h1 className="text-4xl sm:text-6xl font-cursive text-amber-100 drop-shadow-lg">Wishing You To Have A Great Day!</h1>
             <p className="text-white/60 font-light tracking-widest uppercase text-sm">الحمد لله</p>
             
             <div className="flex gap-4 items-center justify-center mt-8">
               <Button onClick={handleReplay} variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2 min-w-[120px]">
                  <RotateCcw className="w-4 h-4" /> Replay
               </Button>
               <Button onClick={handleExit} variant="destructive" className="bg-red-500/10 hover:bg-red-500/20 text-red-200 border border-red-500/20 gap-2 min-w-[120px]">
                  <LogOut className="w-4 h-4" /> Exit
               </Button>
             </div>
           </div>
        </div>
      )}

      {/* --- Gift Dialog --- */}
      <Dialog open={!!selectedGift} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent 
          ref={gridRef}
          className="bg-[#0f0a15]/95 border border-white/10 backdrop-blur-2xl text-white max-w-[95vw] sm:max-w-lg rounded-2xl p-0 overflow-hidden animate-dialog-in flex flex-col max-h-[calc(100dvh-40px)]"
          style={{ boxShadow: selectedGift ? `0 0 60px -20px ${selectedGift.glowColor}30` : 'none' }}
        >
          {selectedGift && (
            <>
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedGift.emoji}</span>
                  <div>
                    <div className="text-base font-light tracking-wide text-white/90">{selectedGift.title}</div>
                  </div>
                </div>
                <button onClick={() => handleDialogClose()} className="text-white/40 hover:text-white p-2">
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
