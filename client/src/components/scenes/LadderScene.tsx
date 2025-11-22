import { useEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import gsap from 'gsap';
import { getLocalStorage, setLocalStorage } from '../../lib/utils';

const QUOTES = [
  "Keep climbing! 🌟",
  "You're doing amazing! ✨",
  "Almost there! 🎯",
  "Don't look down! 🚀",
  "Believe in yourself! 💪",
];

const MILESTONES = [5, 10, 15, 20];

export function LadderScene() {
  const { updateProgress, settings } = useSceneStore();
  const [progress, setProgress] = useState(0);
  const [isClimbing, setIsClimbing] = useState(false);
  const [quote, setQuote] = useState('');
  const [side, setSide] = useState<'left' | 'right'>('left');
  const characterRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedProgress = getLocalStorage('ladderProgress') || 0;
    setProgress(savedProgress);
  }, []);

  useEffect(() => {
    if (MILESTONES.includes(progress) && progress > 0) {
      if (settings.soundEnabled) {
        audioManager.play('success');
      }
    }

    if (progress >= 20) {
      updateProgress({ unlockedGifts: true, ladderProgress: 20 });
    }
  }, [progress, settings.soundEnabled, updateProgress]);

  const climbStartTimeRef = useRef<number>(0);

  const climb = () => {
    if (isClimbing || progress >= 20) return;

    const now = Date.now();
    const timeSinceLastClimb = now - climbStartTimeRef.current;
    
    setIsClimbing(true);
    climbStartTimeRef.current = now;

    const PERFECT_TIMING_MIN = 400;
    const PERFECT_TIMING_MAX = 1200;
    const TOO_FAST = timeSinceLastClimb < PERFECT_TIMING_MIN && progress > 0;
    const TOO_SLOW = timeSinceLastClimb > PERFECT_TIMING_MAX && progress > 0;
    
    const success = progress === 0 || (!TOO_FAST && !TOO_SLOW);

    setTimeout(() => {
      if (success) {
        const newProgress = progress + 1;
        setProgress(newProgress);
        setLocalStorage('ladderProgress', newProgress);
        updateProgress({ ladderProgress: newProgress });
        setSide(side === 'left' ? 'right' : 'left');

        if (settings.soundEnabled) {
          audioManager.play('hit');
        }

        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setQuote(randomQuote);

        if (!settings.reducedMotion && characterRef.current) {
          gsap.to(characterRef.current, {
            y: -40 * newProgress,
            x: (side === 'left' ? 1 : -1) * 30,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      } else {
        if (!settings.reducedMotion && characterRef.current) {
          gsap.timeline()
            .to(characterRef.current, {
              scaleY: 0.7,
              scaleX: 1.2,
              duration: 0.2,
              ease: 'power2.in',
            })
            .to(characterRef.current, {
              y: 0,
              scaleY: 1,
              scaleX: 1,
              duration: 0.5,
              ease: 'bounce.out',
            });
        }

        setProgress(0);
        setLocalStorage('ladderProgress', 0);
        updateProgress({ ladderProgress: 0 });
        setSide('left');
        setQuote(TOO_FAST ? 'Too fast! Slow down! 😅' : 'Too slow! Keep the rhythm! 😅');
      }

      setIsClimbing(false);
    }, 100);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        climb();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [climb]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900">
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Ladder Challenge</h1>
        <p className="text-xl text-blue-200 mb-8">
          Progress: {progress}/20 {progress >= 20 && '🎉 Completed!'}
        </p>

        {quote && (
          <div className="mb-4 text-2xl text-yellow-300 animate-pulse">
            {quote}
          </div>
        )}

        <div className="relative w-96 h-96 mx-auto mb-8">
          <div
            ref={ladderRef}
            className="absolute left-1/2 -translate-x-1/2 w-20 h-full bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg shadow-2xl"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-1 bg-amber-500"
                style={{ top: `${i * 10}%` }}
              />
            ))}
          </div>

          <div
            ref={characterRef}
            className="absolute bottom-4 text-4xl transition-transform"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            🧗
          </div>
        </div>

        <Button
          onClick={climb}
          disabled={isClimbing || progress >= 20}
          size="lg"
          className="text-xl px-8 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          {progress >= 20 ? 'Completed!' : 'Climb (Space / ↑)'}
        </Button>

        <div className="mt-4 flex gap-2 justify-center">
          {MILESTONES.map((milestone) => (
            <div
              key={milestone}
              className={`w-4 h-4 rounded-full ${
                progress >= milestone ? 'bg-yellow-400' : 'bg-gray-600'
              }`}
              aria-label={`Milestone ${milestone}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
