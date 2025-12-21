import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { setLocalStorage } from '../../lib/utils';

const QUOTES = [
  "Keep climbing! 🌟",
  "You're doing amazing! ✨",
  "Almost there! 🎯",
  "Don't look down! 🚀",
  "Believe in yourself! 💪",
  "You've got this! 💪",
  "Keep the rhythm steady! 🎵",
  "So close! 🎯",
];

const MILESTONES = [5, 10, 15, 20];
const MAX_PROGRESS = 20;
const CHARACTER_PADDING = 16;

const STORAGE_KEYS = {
  progress: 'ladderProgress',
  milestones: 'ladderSeenMilestones',
};

export function LadderScene() {
  const { updateProgress, settings } = useSceneStore();

  const [progress, setProgress] = useState(0);
  const [isClimbing, setIsClimbing] = useState(false);
  const [quote, setQuote] = useState('');
  const [side, setSide] = useState<'left' | 'right'>('left');
  const [showMilestone, setShowMilestone] = useState(false);
  const [seenMilestones, setSeenMilestones] = useState<number[]>([]);
  const [maxTranslateY, setMaxTranslateY] = useState(0);
  const [stepSize, setStepSize] = useState(0);

  const characterRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  const progressRef = useRef(0);
  const sideRef = useRef<'left' | 'right'>('left');
  const seenMilestonesRef = useRef<Set<number>>(new Set());

  /* ------------------------------------------------------------------ */
  /* 🔁 REPLAY RESET — runs EVERY time this scene loads */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.progress, 0);
    setLocalStorage(STORAGE_KEYS.milestones, []);

    setProgress(0);
    progressRef.current = 0;
    setSeenMilestones([]);
    seenMilestonesRef.current = new Set();
    setShowMilestone(false);

    updateProgress({
      ladderProgress: 0,
      unlockedGifts: false,
    });
  }, [updateProgress]);

  /* ------------------------------------------------------------------ */
  /* Geometry + positioning */
  /* ------------------------------------------------------------------ */
  const getTranslateForProgress = useCallback(
    (value: number) => {
      const effectiveStep =
        stepSize || (maxTranslateY > 0 ? maxTranslateY / MAX_PROGRESS : 0);
      return -Math.min(maxTranslateY, effectiveStep * value);
    },
    [maxTranslateY, stepSize]
  );

  useLayoutEffect(() => {
    const ladderEl = ladderRef.current;
    if (!ladderEl) return;

    const updateGeometry = () => {
      const ladderHeight = ladderEl.clientHeight;
      const characterHeight = characterRef.current?.clientHeight ?? 64;
      const safeMax = Math.max(
        0,
        ladderHeight - characterHeight - CHARACTER_PADDING
      );

      setMaxTranslateY(safeMax);
      setStepSize(safeMax / MAX_PROGRESS || 0);

      if (characterRef.current) {
        gsap.set(characterRef.current, {
          y: getTranslateForProgress(progressRef.current),
        });
      }
    };

    updateGeometry();
    const observer = new ResizeObserver(updateGeometry);
    observer.observe(ladderEl);
    return () => observer.disconnect();
  }, [getTranslateForProgress]);

  /* ------------------------------------------------------------------ */
  /* Movement animation */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!characterRef.current) return;

    gsap.set(characterRef.current, {
      y: getTranslateForProgress(progress),
      x: (side === 'left' ? 1 : -1) * 30,
    });
  }, [progress, side, getTranslateForProgress]);

  /* ------------------------------------------------------------------ */
  /* Milestones + completion */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let timeout: number | undefined;

    const milestone = MILESTONES.find(
      (m) => m === progress && !seenMilestonesRef.current.has(m)
    );

    if (milestone) {
      setShowMilestone(true);
      seenMilestonesRef.current.add(milestone);
      setSeenMilestones(Array.from(seenMilestonesRef.current));

      if (settings.soundEnabled) {
        audioManager.play('success');
      }

      timeout = window.setTimeout(() => setShowMilestone(false), 1800);
    }

    if (progress >= MAX_PROGRESS) {
      updateProgress({
        unlockedGifts: true,
        ladderProgress: MAX_PROGRESS,
      });
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [progress, settings.soundEnabled, updateProgress]);

  /* ------------------------------------------------------------------ */
  /* Climb action */
  /* ------------------------------------------------------------------ */
  const climb = useCallback(() => {
    if (isClimbing || progressRef.current >= MAX_PROGRESS) return;

    setIsClimbing(true);

    const next = Math.min(MAX_PROGRESS, progressRef.current + 1);
    const nextSide = sideRef.current === 'left' ? 'right' : 'left';

    setProgress(next);
    progressRef.current = next;
    setSide(nextSide);
    sideRef.current = nextSide;

    if (settings.soundEnabled) {
      audioManager.play('hit');
    }

    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    if (!settings.reducedMotion && characterRef.current) {
      gsap.to(characterRef.current, {
        y: getTranslateForProgress(next),
        x: (nextSide === 'left' ? 1 : -1) * 30,
        duration: 0.35,
        ease: 'power3.out',
        onComplete: () => setIsClimbing(false),
      });

      if (quoteRef.current) {
        gsap.fromTo(
          quoteRef.current,
          { opacity: 0, y: 8, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4 }
        );
      }
    } else {
      setIsClimbing(false);
    }
  }, [isClimbing, settings, getTranslateForProgress]);

  /* Keyboard support */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        climb();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [climb]);

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900 px-4">
      {showMilestone && (
        <AdaptiveParticleSystem count={150} color="#fbbf24" speed={0.6} size={3} />
      )}
      {progress >= MAX_PROGRESS && (
        <AdaptiveParticleSystem count={300} color="#ffffff" speed={0.8} size={4} />
      )}

      <div className="relative z-10 text-center w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
          Ladder Challenge
        </h1>

        <p className="text-lg text-blue-200 mb-6">
          Progress: {progress}/20 {progress >= 20 && '🎉'}
        </p>

        {quote && (
          <div
            ref={quoteRef}
            className="mb-4 text-xl text-yellow-300 font-cursive"
          >
            {quote}
          </div>
        )}

        <div className="relative w-full aspect-square mx-auto mb-6 rounded-2xl bg-black/20 border border-white/15">
          <div
            ref={ladderRef}
            className="absolute left-1/2 -translate-x-1/2 w-16 h-full bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg"
          >
            {Array.from({ length: MAX_PROGRESS }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-0.5 bg-amber-500/80"
                style={{ top: `${(i / (MAX_PROGRESS - 1)) * 100}%` }}
              />
            ))}
          </div>

          <div
            ref={characterRef}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <img
              src="/character.png"
              alt="character"
              className="w-14 h-14 object-contain select-none"
              draggable={false}
            />
          </div>
        </div>

        <Button
          onClick={climb}
          disabled={isClimbing || progress >= MAX_PROGRESS}
          size="lg"
          className="w-full text-lg py-5 bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          {progress >= 20 ? 'Completed 🎉' : 'Climb'}
        </Button>
      </div>
    </div>
  );
}
