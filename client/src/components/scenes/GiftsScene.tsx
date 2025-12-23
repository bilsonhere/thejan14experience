import { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { Play, Pause, Volume2, X, ExternalLink, Maximize2, Music, Loader2, Image as ImageIcon, Sparkles, Heart, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

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
  const [chosenGiftId, setChosenGiftId] = useState<number | null>(null);
  const [showChoicePrompt, setShowChoicePrompt] = useState(true);

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

      // Create floating animations only for the chosen gift (if any)
      if (chosenGiftId) {
        const chosenIndex = chosenGiftId - 1;
        const ref = giftsRefs.current[chosenIndex];
        if (ref && !openedGifts.includes(chosenGiftId)) {
          const anim = gsap.to(ref, {
            y: -15,
            rotation: 3,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
          animationRefs.current.push(anim);
        }
      }

      // Background particle effect when all gifts opened
      if (openedGifts.length === 5 && !showFinale) {
        setTimeout(() => setShowFinale(true), 800);
      }

      // Initial entrance animation
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
  }, [openedGifts, settings.reducedMotion, showFinale, chosenGiftId]);

  const chooseGift = (gift: Gift) => {
    if (chosenGiftId && chosenGiftId !== gift.id) {
      // If already chosen a different gift, show gentle message
      if (!settings.reducedMotion && dialogRef.current) {
        gsap.fromTo(dialogRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );
      }
      return;
    }

    if (!chosenGiftId) {
      // First choice - set the chosen gift
      setChosenGiftId(gift.id);
      setShowChoicePrompt(false);
      
      // Gentle glow animation for the chosen gift
      const giftElement = giftsRefs.current[gift.id - 1];
      if (giftElement && !settings.reducedMotion) {
        gsap.to(giftElement, {
          scale: 1.1,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });

        // Gentle pulse effect
        gsap.to(giftElement, {
          boxShadow: `0 0 40px ${gift.glowColor}60`,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (settings.soundEnabled) {
        audioManager.play('success');
      }
    }
  };

  const openGift = (gift: Gift) => {
    if (openedGifts.includes(gift.id)) return;

    // Only open if this is the chosen gift (or any gift after one is opened)
    if (openedGifts.length === 0 && gift.id !== chosenGiftId) {
      return;
    }

    // Stop animation for this gift
    const giftIndex = gift.id - 1;
    if (animationRefs.current[giftIndex]) {
      animationRefs.current[giftIndex].kill();
    }

    const newOpened = [...openedGifts, gift.id];
    setOpenedGifts(newOpened);
    updateProgress({ giftsOpened: newOpened });

    // Visual feedback with slow, gentle opening
    const giftElement = giftsRefs.current[giftIndex];
    if (giftElement && !settings.reducedMotion) {
      gsap.timeline({
        onComplete: () => {
          setTimeout(() => setSelectedGift(gift), 400);
        }
      })
      .to(giftElement, {
        scale: 1.25,
        duration: 0.6,
        ease: 'back.out(1.7)',
      })
      .to(giftElement, {
        scale: 1,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    } else {
      setTimeout(() => setSelectedGift(gift), 400);
    }

    if (settings.soundEnabled) {
      audioManager.play('success');
    }

    // Create gentle sparkle effect
    if (!settings.reducedMotion && giftElement) {
      createSparkleEffect(giftElement, gift.glowColor);
    }

    // After opening first gift, other gifts become available
    if (newOpened.length === 1) {
      // Start gentle animations for remaining gifts
      setTimeout(() => {
        GIFTS.forEach((g, index) => {
          if (!newOpened.includes(g.id) && giftsRefs.current[index]) {
            gsap.fromTo(giftsRefs.current[index],
              { opacity: 0.3 },
              { opacity: 0.8, duration: 1.5, ease: 'power2.out', delay: index * 0.2 }
            );
          }
        });
      }, 800);
    }

    if (gift.id === 5) {
      setTimeout(() => setShowFinale(true), 1200);
    }
  };

  const createSparkleEffect = (element: HTMLElement, color: string) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'fixed text-xl pointer-events-none z-50';
        sparkle.style.left = `${rect.left + rect.width / 2}px`;
        sparkle.style.top = `${rect.top + rect.height / 2}px`;
        sparkle.style.filter = `drop-shadow(0 0 6px ${color})`;
        document.body.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 60,
          y: (Math.random() - 0.5) * 60 - 40,
          opacity: 0,
          scale: 0,
          rotation: 180,
          duration: 1.5,
          ease: 'power2.out',
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

  const renderGiftContent = (gift: Gift) => {
    switch (gift.type) {
      case 'letter':
        return (
          <div className="relative">
            <div className="absolute -top-4 -right-4 text-3xl opacity-30 animate-float-slow">💌</div>
            <div className="absolute -bottom-4 -left-4 text-2xl opacity-20 animate-float-slow" style={{animationDelay: '1s'}}>💛</div>
            <div className="font-elegant whitespace-pre-wrap text-base sm:text-lg leading-relaxed text-white/95 p-5 sm:p-6 bg-gradient-to-br from-pink-900/40 to-rose-900/30 rounded-2xl border-2 border-pink-500/30 backdrop-blur-xl shadow-2xl shadow-pink-900/30">
              {LETTER_CONTENT_1}
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() =>
                    setActiveMedia({
                      type: 'image',
                      src: `/assets/gifts/media/img${i}.jpeg`,
                    })
                  }
                  className="group relative aspect-square bg-gradient-to-br from-purple-900/40 to-violet-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-purple-500/40 hover:border-purple-400/70 transition-all duration-500 hover:scale-110 overflow-hidden shadow-lg shadow-purple-900/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-violet-500/0 group-hover:from-purple-500/20 group-hover:to-violet-500/20 transition-all duration-500" />
                  <span className="text-3xl sm:text-4xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">🌺</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/30">
                    <Maximize2 className="w-6 h-6 sm:w-8 sm:h-8 text-white/90" />
                  </div>
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-white/20 rounded-xl sm:rounded-2xl transition-all duration-500" />
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
              className="group relative aspect-video bg-gradient-to-br from-pink-900/40 to-rose-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-pink-500/40 hover:border-pink-400/70 transition-all duration-500 overflow-hidden shadow-lg shadow-pink-900/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-transparent to-rose-500/0 group-hover:from-pink-500/20 group-hover:to-rose-500/20 transition-all duration-500" />
              <span className="text-4xl sm:text-5xl group-hover:scale-125 transition-all duration-500">🎬</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-black/60 backdrop-blur-sm rounded-full p-3 sm:p-4">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
            </button>
            <p className="text-center text-purple-300/70 text-xs sm:text-sm font-elegant">
              Click on any media to view in full size
            </p>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full" />
                <Music className="relative w-12 h-12 sm:w-16 sm:h-16 text-blue-300" />
              </div>
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">bday song</h3>
                <p className="text-blue-300/80 text-sm sm:text-base">Mute the bg audio and put on em headphones for best experience!</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="bg-blue-900/40 h-2.5 sm:h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-sky-400 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/30"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-blue-300/70 mt-2">
                  <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                  <span>{formatTime(audioRef.current?.duration || 0)}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleAudioPlay}
                disabled={isAudioLoading}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 hover:from-blue-500 hover:via-cyan-500 hover:to-sky-500 text-white rounded-xl sm:rounded-2xl group relative overflow-hidden shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                {isAudioLoading ? (
                  <Loader2 className="mr-3 w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                ) : (
                  <Play className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
                {isAudioLoading ? 'Loading Melody...' : audioError ? 'Open in Google Drive' : isPlaying ? 'Pause Birthday Song' : 'Play Birthday Song'}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
              
              {audioError && (
                <div className="text-center p-3 bg-red-900/30 rounded-xl border border-red-500/30">
                  <p className="text-sm text-red-300/90 mb-2">Couldn't load audio directly</p>
                  <Button
                    onClick={handleDirectAudioLink}
                    variant="outline"
                    className="w-full py-3 text-sm border-blue-400/50 text-blue-300 hover:bg-blue-900/40"
                  >
                    <ExternalLink className="mr-2 w-4 h-4" />
                    Open in Google Drive
                  </Button>
                </div>
              )}
              
              <div className="text-center">
                <button
                  onClick={handleDirectAudioLink}
                  className="text-xs sm:text-sm text-blue-400/80 hover:text-blue-300 transition-colors underline underline-offset-2 decoration-blue-400/50 hover:decoration-blue-300"
                >
                  Or open directly in Google Drive ↗
                </button>
              </div>
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="text-center space-y-5 sm:space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <div className="relative text-5xl sm:text-6xl mb-4">📖✨</div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">bday ppt</h3>
              <p className="text-emerald-300/90 text-lg sm:text-xl mb-2">"Branches, Trees, Garden"</p>
              <p className="text-emerald-200/70 text-sm sm:text-base">🍀</p>
            </div>
            
            <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-900/40 to-green-900/30 rounded-2xl border-2 border-emerald-500/40 backdrop-blur-lg shadow-xl shadow-emerald-900/30">
              <p className="text-emerald-200/80 text-sm sm:text-base mb-4">
                📦
              </p>
              <Button 
                onClick={() => window.open(GOOGLE_SLIDES_LINK, '_blank')}
                className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:via-teal-500 hover:to-green-500 text-white rounded-xl sm:rounded-2xl group relative overflow-hidden shadow-lg shadow-emerald-500/30"
              >
                <ExternalLink className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                Unwrap it
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </div>
          </div>
        );
      case 'final':
        return (
          <div className="relative">
            <div className="absolute -top-6 -right-6 text-4xl sm:text-5xl opacity-30 animate-float">✨</div>
            <div className="absolute -bottom-6 -left-6 text-4xl sm:text-5xl opacity-30 animate-float" style={{animationDelay: '1s'}}>💖</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/10 blur-3xl rounded-full" />
            <div className="relative font-elegant whitespace-pre-wrap text-base sm:text-lg leading-relaxed text-white/95 p-6 sm:p-8 bg-gradient-to-br from-yellow-900/40 via-amber-900/35 to-orange-900/30 rounded-2xl border-2 border-amber-500/40 backdrop-blur-xl shadow-2xl shadow-amber-900/30 text-center">
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

  // Calculate gift states
  const isFirstGiftChosen = !!chosenGiftId;
  const isGiftAvailable = (giftId: number) => {
    if (!isFirstGiftChosen) return true; // Can choose first gift
    if (openedGifts.length === 0) return giftId === chosenGiftId; // Only chosen gift can open first
    return true; // All gifts available after first is opened
  };
  const isGiftOpened = (giftId: number) => openedGifts.includes(giftId);
  const isGiftChosen = (giftId: number) => giftId === chosenGiftId;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-indigo-950/90 via-purple-950/80 to-pink-950/90"
    >
      {/* Custom Background Image Layer */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.2,
          filter: 'blur(0.5px)',
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-pink-900/50 to-indigo-900/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBzdGl0Y2hUaWxlcz0ic3RpdGchoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')] 
                    opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute top-10 left-10 text-3xl sm:text-4xl opacity-20 animate-float-slow">🎀</div>
      <div className="absolute top-20 right-12 text-2xl sm:text-3xl opacity-15 animate-float-slow" style={{animationDelay: '2s'}}>✨</div>
      <div className="absolute bottom-16 left-16 text-2xl sm:text-3xl opacity-15 animate-float-slow" style={{animationDelay: '1s'}}>🎁</div>
      <div className="absolute bottom-20 right-10 text-3xl sm:text-4xl opacity-20 animate-float-slow" style={{animationDelay: '3s'}}>💝</div>

      {/* Celebration Effects */}
      {showFinale && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <Confetti 
              recycle={false} 
              numberOfPieces={500} 
              gravity={0.08}
              colors={['#fbbf24', '#ec4899', '#a855f7', '#60a5fa', '#34d399']}
              wind={0.01}
              opacity={0.9}
            />
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <AdaptiveParticleSystem 
              count={200} 
              color="#fbbf24" 
              speed={0.6} 
              size={2.5}
            />
          </div>
        </>
      )}

      {/* Choice Prompt Overlay */}
      {showChoicePrompt && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-purple-900/80 to-pink-900/80 
                        backdrop-blur-2xl rounded-3xl border border-white/30 
                        p-6 sm:p-8 max-w-md w-full text-center 
                        animate-fade-in shadow-2xl shadow-purple-900/50">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 blur-xl rounded-full opacity-30" />
              <div className="relative text-4xl sm:text-5xl animate-float">✨</div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Choose Your First Gift
            </h2>
            <p className="text-purple-200/90 text-sm sm:text-base mb-4">
              Take your time to choose one gift to open first.
              <span className="block text-yellow-300/90 text-lg mt-2">
                You decide the order...
              </span>
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-purple-300/80 mt-4">
              <Heart className="w-4 h-4" />
              <span>Click any gift to begin your journey</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 px-2">
          <div className="relative inline-block mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 blur-xl rounded-full opacity-50" />
            <div className="relative text-5xl sm:text-6xl md:text-7xl animate-float">
              🎁✨
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3
                        drop-shadow-[0_0_40px_rgba(168,85,247,0.8)]">
            <span className="font-cursive bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 
                           bg-clip-text text-transparent">
              Your Gifts
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-purple-200/90 font-elegant max-w-xl mx-auto">
            💕It's all yours💕
            <span className="block text-xs sm:text-sm text-purple-300/60 mt-1">
              {!isFirstGiftChosen 
                ? 'Choose your first gift...' 
                : openedGifts.length === 0 
                  ? 'Open your chosen gift...' 
                  : `${openedGifts.length}/5 gifts opened`}
            </span>
          </p>
        </div>

        {/* Gifts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto w-full px-2">
          {GIFTS.map((gift, index) => {
            const isOpened = isGiftOpened(gift.id);
            const isHovered = hoveredGift === gift.id;
            const isChosen = isGiftChosen(gift.id);
            const isAvailable = isGiftAvailable(gift.id);
            const isDimmed = isFirstGiftChosen && !isChosen && openedGifts.length === 0;
            
            return (
              <button
                key={gift.id}
                ref={(el) => (giftsRefs.current[index] = el)}
                onClick={() => {
                  if (!isFirstGiftChosen) {
                    chooseGift(gift);
                  } else if (isAvailable) {
                    openGift(gift);
                  }
                }}
                onMouseEnter={() => isAvailable && setHoveredGift(gift.id)}
                onMouseLeave={() => setHoveredGift(null)}
                className={`group relative p-4 sm:p-5 md:p-6 rounded-2xl transition-all duration-700 
                          ${isOpened 
                            ? 'opacity-90 scale-95 cursor-default' 
                            : isAvailable 
                              ? 'cursor-pointer hover:scale-105 active:scale-102' 
                              : 'cursor-not-allowed opacity-40 blur-[1px]'
                          } 
                          ${isChosen && !isOpened ? 'ring-4 ring-white/50 ring-opacity-50' : ''}
                          overflow-hidden backdrop-blur-sm`}
                style={{
                  background: isDimmed 
                    ? `linear-gradient(135deg, ${gift.color}20, ${gift.color}10)`
                    : `linear-gradient(135deg, ${gift.color}40, ${gift.color}20)`,
                  border: `2px solid ${gift.color}${isOpened ? '40' : isDimmed ? '20' : '60'}`,
                  boxShadow: isHovered && isAvailable && !isOpened 
                    ? `0 20px 40px ${gift.color}40, 0 0 60px ${gift.color}30, inset 0 0 30px ${gift.color}20` 
                    : `0 10px 25px ${gift.color}30, inset 0 0 15px ${gift.color}10`,
                  transform: isChosen ? 'translateY(-8px)' : 'none',
                }}
                disabled={!isAvailable}
              >
                {/* Gentle Glow Ring for chosen gift */}
                {isChosen && !isOpened && (
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-60"
                    style={{
                      background: `radial-gradient(circle at center, ${gift.color}40, transparent 70%)`,
                      filter: 'blur(12px)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  />
                )}

                {/* Dimmed Overlay */}
                {isDimmed && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl" />
                )}

                {/* Lock Icon for unavailable gifts */}
                {!isAvailable && openedGifts.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                    <Lock className="w-8 h-8 text-white/60" />
                  </div>
                )}

                {/* Content */}
                <div className={`relative z-10 flex flex-col items-center justify-center transition-all duration-500
                               ${isDimmed ? 'opacity-70' : 'opacity-100'}`}>
                  <div className={`text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 transition-all duration-500 
                                ${isHovered && isAvailable && !isOpened ? 'scale-110 rotate-6' : ''}
                                ${isChosen ? 'animate-soft-pulse' : ''}`}>
                    {gift.emoji}
                  </div>
                  <h3 className={`text-base sm:text-lg md:text-xl font-bold text-center transition-all duration-300
                               ${isOpened ? 'text-white/80' : 'text-white'}`}>
                    {gift.title}
                  </h3>
                  <p className={`text-xs sm:text-sm text-center mt-1 transition-all duration-300
                              ${isOpened ? 'opacity-0 scale-0' : 'opacity-70'}`}>
                    {gift.subtitle}
                  </p>
                  
                  {/* Status Indicators */}
                  {isChosen && !isOpened && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-white/80">
                      <Sparkles className="w-3 h-3" />
                      <span>Chosen</span>
                    </div>
                  )}
                </div>

                {/* Opened Overlay */}
                {isOpened && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="absolute top-3 right-3 text-lg sm:text-xl opacity-90">
                      ✓
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress Indicator - Only show after first gift opened */}
        {openedGifts.length > 0 && (
          <div className="mt-8 sm:mt-12 max-w-md w-full px-4 animate-fade-in">
            <div className="flex justify-between text-sm sm:text-base text-purple-300/90 mb-3">
              <span className="font-elegant">Your Gift Journey</span>
              <span className="font-semibold">{openedGifts.length}/5</span>
            </div>
            <div className="h-2 sm:h-3 bg-purple-900/40 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full transition-all duration-1000 shadow-lg shadow-purple-500/30"
                style={{ width: `${(openedGifts.length / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-purple-300/70 text-center mt-2">
              {openedGifts.length === 1 
                ? 'Take your time with each gift...' 
                : 'Continue at your own pace...'}
            </p>
          </div>
        )}

        {/* Completion Celebration */}
        {showFinale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4 animate-fade-in">
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-purple-900/95 via-pink-900/90 to-yellow-900/95 
                          rounded-2xl sm:rounded-3xl border-2 border-pink-500/50 backdrop-blur-2xl
                          max-w-sm sm:max-w-md w-full animate-scale-in shadow-2xl shadow-pink-900/50">
              <div className="relative mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 blur-2xl rounded-full opacity-30" />
                <div className="relative text-5xl sm:text-6xl animate-float">🎉✨</div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">All Gifts Revealed!</h2>
              <p className="text-pink-200/90 text-sm sm:text-base mb-4">
                You've discovered every special gift prepared for your birthday!
              </p>
              <p className="text-yellow-300/90 text-sm italic mb-6">
                Thank you for taking this journey at your own pace...
              </p>
              <div className="text-3xl sm:text-4xl animate-pulse">🎁💝</div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={!!selectedGift} onOpenChange={() => setSelectedGift(null)}>
        <DialogContent 
          ref={dialogRef}
          className="bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-950/95 border-white/30 
                   backdrop-blur-2xl text-white max-w-sm sm:max-w-md md:max-w-xl 
                   rounded-2xl sm:rounded-3xl p-0 overflow-hidden shadow-2xl shadow-black/50
                   animate-dialog-in"
        >
          {selectedGift && (
            <>
              <DialogHeader className="p-5 sm:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl sm:text-2xl flex items-center gap-3">
                    <span 
                      className="text-3xl sm:text-4xl filter drop-shadow-lg"
                      style={{ filter: `drop-shadow(0 0 10px ${selectedGift.glowColor}80)` }}
                    >
                      {selectedGift.emoji}
                    </span>
                    <div>
                      <div className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        {selectedGift.title}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400 mt-0.5">
                        {selectedGift.subtitle}
                      </div>
                    </div>
                  </DialogTitle>
                  <button
                    onClick={() => setSelectedGift(null)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:rotate-90"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </DialogHeader>
              <div className="p-5 sm:p-6">
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

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes soft-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.2); }
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
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .animate-soft-pulse {
          animation: soft-pulse 2s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-dialog-in {
          animation: dialog-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
