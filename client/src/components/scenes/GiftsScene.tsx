import { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { Play, Pause, Volume2, X, ExternalLink, Maximize2, Music, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';

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

const GOOGLE_SLIDES_LINK = 'https://docs.google.com/presentation/d/192aK3xvHF8VkuSBFzhxgdMKcER61AhOUfQpVj_681LE/view';
const GOOGLE_DRIVE_AUDIO_LINK = 'https://drive.google.com/file/d/1pjGcBhQoA5CrEkiLm4bNBdz0fPCfchQW/view?usp=sharing';

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

The core intention behind this was to make your special day memorable,happier. 
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; src: string } | null>(null);
  const [hoveredGift, setHoveredGift] = useState<number | null>(null);
  const [bgImage, setBgImage] = useState<string>(settings.customGiftBackground || '/assets/gifts/background.jpg');

  const giftsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRefs = useRef<gsap.core.Tween[]>([]);

  // Update background image when settings change
  useEffect(() => {
    if (settings.customGiftBackground) {
      setBgImage(settings.customGiftBackground);
    }
  }, [settings.customGiftBackground]);

  // Initialize animations
  useEffect(() => {
    if (!settings.reducedMotion) {
      // Clear previous animations
      animationRefs.current.forEach(anim => anim.kill());
      animationRefs.current = [];

      // Create very slow, breathing floating animations
      giftsRefs.current.forEach((ref, i) => {
        if (ref && !openedGifts.includes(i + 1)) {
          // A slower, more organic float
          const anim = gsap.to(ref, {
            y: -8, // Reduced movement for calmness
            rotation: 1, // Micro rotation
            duration: 4 + i * 0.5, // Slower duration
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.3,
          });
          animationRefs.current.push(anim);
        }
      });

      // Background particle effect when all gifts opened
      if (openedGifts.length === 5 && !showFinale) {
        setTimeout(() => setShowFinale(true), 1500); // Longer pause before finale
      }

      // Initial entrance animation - smoother
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

    // Visual feedback - gentle and reverent
    const giftElement = giftsRefs.current[giftIndex];
    if (giftElement && !settings.reducedMotion) {
      gsap.timeline({
        onComplete: () => {
          setTimeout(() => setSelectedGift(gift), 600); // Slower pause before opening
        }
      })
      .to(giftElement, {
        scale: 1.05, // Subtle lift
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

    if (settings.soundEnabled) {
      // Intentionally using the same sound but implying a softer volume context via UI
      audioManager.play('success');
    }

    // Gentle sparkle effect
    if (!settings.reducedMotion && giftElement) {
      createSparkleEffect(giftElement, gift.glowColor);
    }

    if (gift.id === 5) {
      setTimeout(() => setShowFinale(true), 2000);
    }
  };

  const createSparkleEffect = (element: HTMLElement, color: string) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 6; i++) { // More sparkles, slower
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
          duration: 2.5, // Slower fade
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

  // Content Renderers - Elevated Aesthetics
  const renderGiftContent = (gift: Gift) => {
    switch (gift.type) {
      case 'letter':
        return (
          <div className="relative group">
             {/* Paper Texture Effect */}
            <div className="font-elegant whitespace-pre-wrap text-base sm:text-lg leading-loose text-slate-800 p-8 sm:p-10 bg-[#fffdf5] rounded-xl shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] mx-auto max-w-lg relative overflow-hidden">
               {/* Subtle grain overlay for paper feel */}
              <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjkiIG51bW9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] pointer-events-none"></div>
              
              <div className="relative z-10 selection:bg-pink-200 selection:text-pink-900">
                {LETTER_CONTENT_1}
              </div>
              <div className="absolute bottom-4 right-6 text-pink-400 opacity-50 text-xl">
                 💌
              </div>
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 px-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() =>
                    setActiveMedia({
                      type: 'image',
                      src: `/assets/gifts/media/img${i}.jpeg`,
                    })
                  }
                  className="group relative aspect-[4/5] bg-white/5 rounded-lg border border-white/10 hover:border-purple-300/40 transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.3)] overflow-hidden"
                >
                   {/* Vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl opacity-70 group-hover:scale-110 transition-transform duration-700 filter drop-shadow-md">🌺</span>
                  </div>
                  
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <Maximize2 className="w-4 h-4 text-white/80" />
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
              className="w-full group relative aspect-video bg-black/20 rounded-xl flex items-center justify-center border border-pink-500/20 hover:border-pink-500/50 transition-all duration-700 hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-900/10 via-transparent to-purple-900/10" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                 <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                    <Play className="w-6 h-6 text-white ml-1" />
                 </div>
                 <span className="text-sm font-elegant text-pink-200/80 tracking-widest uppercase text-[10px]">Play Memory</span>
              </div>
            </button>
            <p className="text-center text-white/30 text-[10px] sm:text-xs font-elegant tracking-widest uppercase">
              Collection of Moments
            </p>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-8 px-4 py-2">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative group">
                {/* Vinyl/Circle aesthetic */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)] flex items-center justify-center relative overflow-hidden">
                   <div className={`absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.1)_360deg)] opacity-30 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                   <div className="absolute inset-[35%] rounded-full border border-white/5 bg-black/40 backdrop-blur-md" />
                   <Music className={`relative z-10 w-8 h-8 text-blue-300/80 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-light text-white tracking-wide">bday song</h3>
                <p className="text-blue-200/50 text-xs sm:text-sm font-light">Mute the bg audio and put on em headphones for best experience!</p>
              </div>
            </div>
            
            <div className="space-y-6 max-w-xs mx-auto w-full">
              {/* Elegant Progress Bar */}
              <div className="relative group cursor-pointer">
                <div className="bg-white/5 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400/80 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                    style={{ width: `${audioProgress}%` }}
                  />
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
                  className="w-full py-6 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-full transition-all duration-500 hover:tracking-widest"
                >
                  {isAudioLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  <span className="font-light text-sm">
                    {isAudioLoading ? 'Loading Melody...' : audioError ? 'Open in Google Drive' : isPlaying ? 'Pause Birthday Song' : 'Play Birthday Song'}
                  </span>
                </Button>
                
                {audioError && (
                  <div className="text-center">
                    <button
                      onClick={handleDirectAudioLink}
                      className="text-xs text-red-300/70 hover:text-red-300 transition-colors border-b border-red-300/20 pb-0.5"
                    >
                      Use external link instead
                    </button>
                  </div>
                )}
                
                {!audioError && (
                   <div className="text-center">
                    <button
                      onClick={handleDirectAudioLink}
                      className="text-[10px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-widest"
                    >
                      Or open directly in Google Drive ↗
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="text-center space-y-8 py-4">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
              <div className="relative text-6xl sm:text-7xl mb-6 filter drop-shadow-2xl opacity-90">📖✨</div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-light text-white tracking-wide">bday ppt</h3>
              <div className="h-px w-12 bg-emerald-500/30 mx-auto my-3" />
              <p className="text-emerald-100/70 text-lg italic font-serif">"Branches, Trees, Garden"</p>
              <p className="text-emerald-500/40 text-sm">🍀</p>
            </div>
            
            <div className="max-w-xs mx-auto pt-4">
              <p className="text-emerald-200/40 text-xs mb-4 uppercase tracking-widest">
                📦 Document Enclosed
              </p>
              <Button 
                onClick={() => window.open(GOOGLE_SLIDES_LINK, '_blank')}
                className="w-full py-6 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-100 border border-emerald-500/20 rounded-xl transition-all duration-500 group"
              >
                <span className="group-hover:mr-2 transition-all duration-300">Unwrap it</span>
                <ExternalLink className="ml-2 w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#0a0510]" // Very dark base
    >
      {/* Cinematic Lighting - Warm Center, Dark Edges */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(60, 30, 80, 0.4) 0%, rgba(10, 5, 16, 0.9) 70%, rgba(0,0,0,1) 100%)'
        }}
      />

      {/* Custom Background Image Layer - Blended Softly */}
      <div
        className="absolute inset-0 transition-all duration-1000 z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15, // Lower opacity for ambient feel
          filter: 'blur(2px) saturate(0.8)', // Dreamy blur
        }}
      />

      {/* Grain Overlay for Texture */}
      <div className="absolute inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')]"></div>

      {/* Celebration Effects */}
      {showFinale && (
        <>
          <div className="absolute inset-0 pointer-events-none z-20">
            <Confetti 
              recycle={false} 
              numberOfPieces={300} // Reduced for elegance
              gravity={0.05} // Slower fall
              colors={['#fbbf24', '#f472b6', '#a855f7', '#fff']}
              wind={0.005}
              opacity={0.8}
            />
          </div>
          <div className="absolute inset-0 pointer-events-none z-20">
            <AdaptiveParticleSystem 
              count={150} 
              color="#fbbf24" 
              speed={0.4} 
              size={2}
            />
          </div>
        </>
      )}

      {/* Main Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Header - Minimal & Ceremonial */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 px-2 relative">
          {/* Subtle glow behind title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative inline-block mb-6">
            <div className="relative text-5xl sm:text-6xl md:text-7xl opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-float-slow">
              🎁✨
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-4 tracking-wide drop-shadow-xl">
            <span className="font-cursive bg-gradient-to-br from-amber-100 via-pink-100 to-purple-100 bg-clip-text text-transparent opacity-90">
              Unwrap Your Gifts
            </span>
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-4" />
          <p className="text-sm sm:text-base md:text-lg text-purple-200/60 font-elegant max-w-xl mx-auto tracking-wider leading-relaxed">
            💕It's all yours💕
          </p>
          <div className="mt-2 text-[10px] sm:text-xs text-purple-300/40 uppercase tracking-[0.2em]">
             {openedGifts.length === 0 ? 'Awaiting Discovery' : `${openedGifts.length} / 5 Revealed`}
          </div>
        </div>

        {/* Gifts Grid - Spaced & Breathing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto w-full px-4">
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
                className={`group relative aspect-[4/5] rounded-xl transition-all duration-1000 ease-out
                          ${isOpened 
                            ? 'opacity-40 grayscale-[0.5] scale-95 cursor-default' 
                            : 'cursor-pointer hover:-translate-y-2'
                          } backdrop-blur-sm`}
                style={{
                  // Glassmorphism with slight tint matching gift color
                  background: `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isHovered && !isOpened 
                    ? `0 20px 50px -10px ${gift.color}20, inset 0 0 20px rgba(255,255,255,0.02)` 
                    : `0 10px 30px -10px rgba(0,0,0,0.5), inset 0 0 0 transparent`,
                }}
                disabled={isOpened}
              >
                 {/* Inner Glow on Hover */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-t from-${gift.color}/10 to-transparent opacity-0 transition-opacity duration-700 ${isHovered && !isOpened ? 'opacity-20' : ''}`} />

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
                  <div className={`text-4xl sm:text-5xl md:text-6xl mb-6 transition-all duration-1000 transform
                                ${isHovered && !isOpened ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'drop-shadow-lg'}`}>
                    {gift.emoji}
                  </div>
                  
                  <div className="text-center space-y-1">
                    <h3 className={`text-sm sm:text-base font-medium tracking-widest uppercase transition-colors duration-500
                                  ${isOpened ? 'text-white/40' : 'text-white/90'}`}>
                      {gift.title}
                    </h3>
                    <p className={`text-xs font-serif italic transition-all duration-500
                                  ${isOpened ? 'opacity-0 translate-y-2' : 'text-white/50'}`}>
                      {gift.subtitle}
                    </p>
                  </div>
                </div>

                {/* Opened Checkmark - Subtle */}
                {isOpened && (
                  <div className="absolute top-4 right-4 text-white/20 text-sm border border-white/10 rounded-full w-6 h-6 flex items-center justify-center">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Cinematic Progress Bar */}
        {openedGifts.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/5">
             <div 
               className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-1000 ease-out"
               style={{ width: `${(openedGifts.length / 5) * 100}%` }}
             />
          </div>
        )}

        {/* Completion Celebration Overlay */}
        {showFinale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in duration-1000">
            <div className="text-center p-10 bg-black/40 border border-white/10 rounded-3xl backdrop-blur-xl max-w-md w-full animate-scale-in shadow-2xl relative overflow-hidden">
               {/* Shine effect */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
               
              <div className="relative mb-8">
                <div className="text-6xl sm:text-7xl animate-bounce-slow">🎉</div>
              </div>
              <h2 className="text-3xl font-light text-white mb-4 tracking-wide">All Gifts Revealed!</h2>
              <div className="h-px w-16 bg-white/20 mx-auto mb-6" />
              <p className="text-white/60 text-sm leading-relaxed mb-8 font-light">
                You've discovered every special gift prepared for your birthday!
              </p>
              <div className="text-4xl animate-pulse text-pink-300/80">💝</div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs - Deep, Dark, & Immersive */}
      <Dialog open={!!selectedGift} onOpenChange={() => setSelectedGift(null)}>
        <DialogContent 
          ref={dialogRef}
          className="bg-[#0f0a15]/95 border border-white/10 backdrop-blur-2xl text-white max-w-sm sm:max-w-md md:max-w-xl rounded-2xl p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-dialog-in"
          style={{
             boxShadow: selectedGift ? `0 0 80px -20px ${selectedGift.glowColor}20` : 'none'
          }}
        >
          {selectedGift && (
            <>
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <span 
                    className="text-3xl filter drop-shadow-md"
                  >
                    {selectedGift.emoji}
                  </span>
                  <div>
                    <div className="text-lg font-light tracking-wide text-white/90">
                      {selectedGift.title}
                    </div>
                    <div className="text-xs text-white/30 font-serif italic">
                      {selectedGift.subtitle}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedGift(null)}
                  className="text-white/20 hover:text-white/60 transition-colors p-2 hover:bg-white/5 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-0 bg-gradient-to-b from-transparent to-black/20 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {renderGiftContent(selectedGift)}
              </div>
              
              {/* Footer Gradient Fade */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Overlay */}
      {activeMedia && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setActiveMedia(null)}
        >
          <button 
            onClick={() => setActiveMedia(null)}
            className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          
          <div 
            className="relative max-w-5xl w-full max-h-full flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {activeMedia.type === 'image' ? (
              <div className="relative group">
                 {/* Photo Frame Effect */}
                <div className="bg-white p-2 sm:p-4 rounded-sm shadow-2xl transform rotate-1 transition-transform duration-500 hover:rotate-0">
                    <img 
                        src={activeMedia.src} 
                        alt="Memory" 
                        className="max-h-[80vh] w-auto object-contain bg-black/5"
                    />
                    <div className="mt-4 text-center font-handwriting text-gray-500 text-sm sm:text-base">
                        A beautiful moment 🌸
                    </div>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.3)] border border-white/10">
                <video 
                  src={activeMedia.src} 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
