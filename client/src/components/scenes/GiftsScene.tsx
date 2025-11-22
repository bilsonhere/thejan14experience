import { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import gsap from 'gsap';
import Confetti from 'react-confetti';

const GIFTS = [
  { id: 1, emoji: '💌', title: 'A Sweet Message', content: 'Dear Afrah,\n\nHappy 20th Birthday! May this year bring you endless joy, amazing adventures, and all the success you deserve. You are truly special!\n\nWith love,\nYour Friends & Family', type: 'text' },
  { id: 2, emoji: '📷', title: 'Memories', content: '🖼️ Beautiful moments captured in time', type: 'image' },
  { id: 3, emoji: '🎵', title: 'Your Favorite Song', content: '🎶 A special melody just for you', type: 'audio' },
  { id: 4, emoji: '⭐', title: 'Words of Wisdom', content: '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt\n\nMay you chase all your dreams fearlessly!', type: 'text' },
  { id: 5, emoji: '🎨', title: 'Creative Wishes', content: '🎨 A canvas of possibilities awaits you!', type: 'image' },
  { id: 6, emoji: '🌟', title: 'The Final Surprise', content: 'Congratulations on completing your birthday journey! 🎉\n\nYou are amazing, talented, and destined for greatness. Here\'s to an incredible year ahead!\n\nHappy Birthday, Afrah! 🎂✨', type: 'final' },
];

export function GiftsScene() {
  const { updateProgress, settings } = useSceneStore();
  const [openedGifts, setOpenedGifts] = useState<number[]>([]);
  const [selectedGift, setSelectedGift] = useState<typeof GIFTS[0] | null>(null);
  const [showFinale, setShowFinale] = useState(false);
  const giftsRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!settings.reducedMotion) {
      giftsRefs.current.forEach((ref, i) => {
        if (ref && !openedGifts.includes(i + 1)) {
          gsap.to(ref, {
            y: -15,
            duration: 1.5 + i * 0.2,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: i * 0.1,
          });
        }
      });
    }
  }, [openedGifts, settings.reducedMotion]);

  const openGift = (gift: typeof GIFTS[0]) => {
    if (openedGifts.includes(gift.id)) return;

    const newOpened = [...openedGifts, gift.id];
    setOpenedGifts(newOpened);
    updateProgress({ giftsOpened: newOpened });
    setSelectedGift(gift);

    if (settings.soundEnabled) {
      audioManager.play('success');
    }

    if (gift.id === 6) {
      setTimeout(() => {
        setShowFinale(true);
      }, 1000);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-violet-900 via-fuchsia-900 to-pink-900 p-8">
      {showFinale && <Confetti recycle={false} numberOfPieces={800} />}

      <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
        🎁 Your Birthday Gifts! 🎁
      </h1>
      <p className="text-xl text-purple-200 mb-12">
        {openedGifts.length}/6 gifts opened
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
        {GIFTS.map((gift, index) => (
          <div
            key={gift.id}
            ref={(el) => (giftsRefs.current[index] = el)}
            onClick={() => !openedGifts.includes(gift.id) && openGift(gift)}
            className={`
              relative p-8 rounded-2xl cursor-pointer transition-all duration-300
              ${openedGifts.includes(gift.id)
                ? 'bg-gradient-to-br from-gray-600/30 to-gray-800/30 scale-95 opacity-60'
                : 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 hover:scale-110 backdrop-blur-md'
              }
              border-2 border-white/20 hover:border-white/40
            `}
            role="button"
            aria-label={`${openedGifts.includes(gift.id) ? 'Opened' : 'Open'} gift: ${gift.title}`}
            tabIndex={0}
          >
            <div className="text-6xl mb-2">{gift.emoji}</div>
            {openedGifts.includes(gift.id) && (
              <div className="text-2xl">✅</div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!selectedGift} onOpenChange={() => setSelectedGift(null)}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-900 to-pink-900 text-white border-white/30">
          <DialogHeader>
            <DialogTitle className="text-3xl flex items-center gap-3">
              <span className="text-5xl">{selectedGift?.emoji}</span>
              {selectedGift?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            {selectedGift?.type === 'text' || selectedGift?.type === 'final' ? (
              <div className="whitespace-pre-wrap text-lg leading-relaxed bg-white/10 p-6 rounded-xl">
                {selectedGift.content}
              </div>
            ) : (
              <div className="text-center text-xl p-8 bg-white/10 rounded-xl">
                {selectedGift?.content}
              </div>
            )}
          </div>
          {selectedGift?.type === 'final' && (
            <div className="mt-6 text-center">
              <div className="text-6xl mb-4">🎊🎉🎈🎂🎁</div>
              <p className="text-2xl font-bold text-yellow-300">
                Thank you for celebrating with us!
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
