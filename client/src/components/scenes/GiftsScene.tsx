import { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { Play, Pause, Volume2 } from 'lucide-react';

interface Gift {
  id: number;
  emoji: string;
  title: string;
  type: 'letter' | 'media' | 'audio' | 'pdf' | 'final';
}

const GOOGLE_SLIDES_LINK =
  'https://docs.google.com/presentation/d/192aK3xvHF8VkuSBFzhxgdMKcER61AhOUfQpVj_681LE/view';

const GIFTS: Gift[] = [
  { id: 1, emoji: '💛', title: 'Happy', type: 'letter' },
  { id: 2, emoji: '🎂', title: 'Birthday', type: 'media' },
  { id: 3, emoji: '🎶', title: 'To', type: 'audio' },
  { id: 4, emoji: '📄', title: 'You', type: 'pdf' },
  { id: 5, emoji: '💖', title: 'Afrah Ghazi', type: 'final' },
];

const LETTER_CONTENT_1 = `Dear Afrah,

Happy Birthday 🎉

I hope today wraps you in warmth, smiles, and the quiet joy of knowing how deeply you are appreciated.

You bring light into moments without trying, and that itself is something rare.

Here’s to laughter, growth, soft days, and dreams that feel closer than before.

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
  const [hoveredGift, setHoveredGift] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const [activeMedia, setActiveMedia] = useState<
    { type: 'image' | 'video'; src: string } | null
  >(null);

  const giftsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!settings.reducedMotion) {
      giftsRefs.current.forEach((ref, i) => {
        if (ref && !openedGifts.includes(i + 1)) {
          gsap.to(ref, {
            y: -12,
            duration: 2 + i * 0.15,
            repeat: -1,
            yoyo: true,
            ease: 'power3.inOut',
          });
        }
      });
    }
  }, [openedGifts, settings.reducedMotion]);

  const openGift = (gift: Gift) => {
    if (openedGifts.includes(gift.id)) return;

    const newOpened = [...openedGifts, gift.id];
    setOpenedGifts(newOpened);
    updateProgress({ giftsOpened: newOpened });

    setTimeout(() => setSelectedGift(gift), 300);

    if (settings.soundEnabled) {
      audioManager.play('success');
    }

    if (gift.id === 5) {
      setTimeout(() => setShowFinale(true), 1500);
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
    }

    isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(console.warn);
    setIsPlaying(!isPlaying);
  };

  const renderGiftContent = (gift: Gift) => {
    switch (gift.type) {
      case 'letter':
        return (
          <div className="font-elegant whitespace-pre-wrap text-lg leading-relaxed">
            {LETTER_CONTENT_1}
          </div>
        );

      case 'media':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  onClick={() =>
                    setActiveMedia({
                      type: 'image',
                      src: `/assets/gifts/media/img${i}.jpeg`,
                    })
                  }
                  className="cursor-zoom-in aspect-square bg-purple-800/30 rounded-lg flex items-center justify-center border border-purple-400/20"
                >
                  <span className="text-3xl">🌺</span>
                </div>
              ))}
            </div>

            <div
              onClick={() =>
                setActiveMedia({
                  type: 'video',
                  src: '/assets/gifts/media/video.mp4',
                })
              }
              className="cursor-zoom-in aspect-video bg-pink-800/30 rounded-lg flex items-center justify-center border border-pink-400/20"
            >
              <span className="text-4xl">🎬</span>
            </div>

            <p className="text-center text-purple-200/70 text-sm">
              Tap to view full media
            </p>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <Volume2 className="w-16 h-16 mx-auto text-blue-300" />
            <div className="bg-blue-800/30 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
            <Button onClick={handleAudioPlay} className="w-full">
              {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </div>
        );

      case 'pdf':
        return (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">🌺bday ppt🌺</p>
            <p className="text-sm text-white/70">
              branches, trees, garden 
            </p>
            <Button
              onClick={() =>
                window.open(GOOGLE_SLIDES_LINK, '_blank')
              }
            >
              Unwrap It
            </Button>
          </div>
        );

      case 'final':
        return (
          <div className="text-center whitespace-pre-wrap text-lg">
            {LETTER_CONTENT_FINAL}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
      {showFinale && <Confetti recycle={false} numberOfPieces={700} />}

      <h1 className="text-5xl font-bold text-white mb-10">
        🎁
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        {GIFTS.map((gift, index) => (
          <div
            key={gift.id}
            ref={(el) => (giftsRefs.current[index] = el)}
            onClick={() => openGift(gift)}
            className="p-8 rounded-3xl cursor-pointer bg-white/10 hover:bg-white/20 transition text-center"
          >
            <div className="text-5xl">{gift.emoji}</div>
            <div className="mt-2 font-semibold">{gift.title}</div>
          </div>
        ))}
      </div>

      {/* Main Gift Dialog */}
      <Dialog open={!!selectedGift} onOpenChange={() => setSelectedGift(null)}>
        <DialogContent ref={dialogRef}>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedGift?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedGift && renderGiftContent(selectedGift)}
        </DialogContent>
      </Dialog>

      {/* Media Lightbox Dialog */}
<Dialog
  open={!!activeMedia}
  onOpenChange={() => setActiveMedia(null)}
>
  <DialogContent className="max-w-5xl bg-black/95 border-none p-6 flex items-center justify-center">
    {activeMedia?.type === 'image' && (
      <div className="max-h-[85vh] max-w-full flex items-center justify-center">
        <img
          src={activeMedia.src}
          alt="Gift media"
          className="
            max-h-[85vh]
            max-w-full
            object-contain
            rounded-xl
            shadow-2xl
          "
        />
      </div>
    )}

    {activeMedia?.type === 'video' && (
      <div className="w-full max-h-[85vh] flex items-center justify-center">
        <video
          src={activeMedia.src}
          controls
          autoPlay
          className="
            max-h-[85vh]
            max-w-full
            rounded-xl
            shadow-2xl
            object-contain
          "
        />
      </div>
    )}
  </DialogContent>
</Dialog>

    </div>
  );
}
