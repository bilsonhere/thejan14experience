import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { getLocalStorage, setLocalStorage } from '../../lib/utils';

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

  // Translate progress into clamped ladder movement so the character never leaves the rails.
  const getTranslateForProgress = useCallback(
    (value: number) => {
      const effectiveStep =
        stepSize || (maxTranslateY > 0 ? maxTranslateY / MAX_PROGRESS : 0);
      const target = Math.min(maxTranslateY, effectiveStep * value);
      return -target;
    },
    [maxTranslateY, stepSize]
  );

  useEffect(() => {
    const storedProgress = Number(getLocalStorage(STORAGE_KEYS.progress)) || 0;
    const hydratedProgress = Math.min(storedProgress, MAX_PROGRESS);
    progressRef.current = hydratedProgress;
    setProgress(hydratedProgress);

    const storedMilestones = getLocalStorage(STORAGE_KEYS.milestones);
    const hydratedMilestones = Array.isArray(storedMilestones)
      ? storedMilestones
      : MILESTONES.filter((milestone) => milestone <= hydratedProgress);
    setSeenMilestones(hydratedMilestones);
    seenMilestonesRef.current = new Set(hydratedMilestones);
    if (!storedMilestones) {
      setLocalStorage(STORAGE_KEYS.milestones, hydratedMilestones);
    }

    if (hydratedProgress >= MAX_PROGRESS) {
      updateProgress({ unlockedGifts: true, ladderProgress: MAX_PROGRESS });
    }
  }, [updateProgress]);

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
        const perStep = safeMax / MAX_PROGRESS || 0;
        const current = Math.min(safeMax, perStep * progressRef.current);
        gsap.set(characterRef.current, { y: -current });
      }
    };

    updateGeometry();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateGeometry);
    observer.observe(ladderEl);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    sideRef.current = side;
  }, [side]);

  useEffect(() => {
    if (!characterRef.current) return;

    gsap.set(characterRef.current, {
      y: getTranslateForProgress(progress),
      x: (side === 'left' ? 1 : -1) * 30,
    });
  }, [progress, side, getTranslateForProgress]);

  useEffect(() => {
    let milestoneTimeout: number | undefined;

    if (progress > 0) {
      const milestoneJustReached = MILESTONES.find(
        (milestone) =>
          milestone === progress && !seenMilestonesRef.current.has(milestone)
      );

      if (milestoneJustReached) {
        setShowMilestone(true);
        seenMilestonesRef.current.add(milestoneJustReached);
        const updated = Array.from(seenMilestonesRef.current).sort(
          (a, b) => a - b
        );
        setSeenMilestones(updated);
        setLocalStorage(STORAGE_KEYS.milestones, updated);

        if (settings.soundEnabled) {
          audioManager.play('success');
        }

        milestoneTimeout = window.setTimeout(
          () => setShowMilestone(false),
          2000
        );
      }

      if (progress >= MAX_PROGRESS) {
        updateProgress({ unlockedGifts: true, ladderProgress: MAX_PROGRESS });
      }
    }

    return () => {
      if (milestoneTimeout) {
        window.clearTimeout(milestoneTimeout);
      }
    };
  }, [progress, settings.soundEnabled, updateProgress]);

  const climb = useCallback(() => {
    const currentProgress = progressRef.current;

    if (isClimbing || currentProgress >= MAX_PROGRESS) return;

    // Timing mechanic removed per requirements—each input yields exactly one climb.
    setIsClimbing(true);

    const nextProgress = Math.min(MAX_PROGRESS, currentProgress + 1);
    const nextSide = sideRef.current === 'left' ? 'right' : 'left';
    const finishClimb = () => setIsClimbing(false);

    setProgress(nextProgress);
    progressRef.current = nextProgress;
    setLocalStorage(STORAGE_KEYS.progress, nextProgress);
    updateProgress({
      ladderProgress: nextProgress,
      unlockedGifts: nextProgress >= MAX_PROGRESS,
    });
    setSide(nextSide);
    sideRef.current = nextSide;

    if (settings.soundEnabled) {
      audioManager.play('hit');
    }

    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);

    if (!settings.reducedMotion && characterRef.current) {
      gsap.to(characterRef.current, {
        y: getTranslateForProgress(nextProgress),
        x: (nextSide === 'left' ? 1 : -1) * 30,
        duration: 0.35,
        ease: 'power3.out',
        onComplete: finishClimb,
      });

      if (quoteRef.current) {
        gsap.fromTo(
          quoteRef.current,
          { opacity: 0, y: 8, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)' }
        );
      }
    } else {
      if (characterRef.current) {
        gsap.set(characterRef.current, {
          y: getTranslateForProgress(nextProgress),
          x: (nextSide === 'left' ? 1 : -1) * 30,
        });
      }
      finishClimb();
    }
  }, [
    getTranslateForProgress,
    isClimbing,
    settings.reducedMotion,
    settings.soundEnabled,
    updateProgress,
  ]);

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

  useEffect(() => {
    // Lightweight instrumentation for QA validation.
    console.info('[QA][LadderScene]', {
      progress,
      stepSize,
      seenMilestones,
    });
  }, [progress, stepSize, seenMilestones]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900">
      {showMilestone && <AdaptiveParticleSystem count={150} color="#fbbf24" speed={0.6} size={3} />}
      {progress >= 20 && <AdaptiveParticleSystem count={300} color="#ffffff" speed={0.8} size={4} />}
      
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-display font-bold text-white mb-6 drop-shadow-2xl">Ladder Challenge</h1>
        <p className="text-xl text-blue-200/90 mb-12 font-elegant">
          Progress: {progress}/20 {progress >= 20 && '🎉 Completed!'}
        </p>

        {showMilestone && (
          <div className="mb-4 text-4xl font-bold text-yellow-300 animate-pulse">
            🎉 Milestone Reached! 🎉
          </div>
        )}

        {quote && (
          <div 
            ref={quoteRef}
            className="mb-4 text-2xl text-yellow-300 font-cursive font-semibold drop-shadow-lg"
          >
            {quote}
          </div>
        )}

        <div className="relative w-96 h-96 mx-auto mb-8 glass-card border border-white/20">
          <div
            ref={ladderRef}
            className="absolute left-1/2 -translate-x-1/2 w-20 h-full bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg shadow-2xl"
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
            className="absolute bottom-4 transition-transform will-change-transform"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <img 
              src="/character.png"
              alt="character"
              className="w-16 h-16 object-contain select-none"
              draggable="false"
            />
          </div>

        </div>

        <Button
          onClick={climb}
          disabled={isClimbing || progress >= 20}
          size="lg"
          className="text-xl px-8 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105 shadow-2xl"
        >
          {progress >= 20 ? 'Completed! 🎉' : isClimbing ? 'Climbing...' : 'Climb (Space / ↑)'}
        </Button>
        
        {progress > 0 && progress < 20 && (
          <p className="mt-4 text-sm text-blue-300/70">
            Keep tapping (or press space/↑) to reach the summit—every climb counts!
          </p>
        )}

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
