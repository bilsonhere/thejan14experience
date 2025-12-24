import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { ChevronUp, Star, Trophy, Sparkles, Cloud, Moon } from 'lucide-react';

const QUOTES = [
  "Every step brings you closer to the stars ✨",
  "Feel the rhythm of your climb 🌙",
  "The view gets better with each step 🌄",
  "You're painting the sky with your progress 🎨",
  "Breathe in, climb higher 🌬️",
  "The ladder to dreams is built step by step 🌠",
  "Soothing ascent to celestial heights 🌌",
  "Your effort creates constellations ⭐",
];

const ENCOURAGEMENT = [
  "Beautiful!",
  "So graceful!",
  "Perfect rhythm!",
  "Like floating!",
  "Effortless climb!",
  "Dreamy movement!",
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
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementText, setEncouragementText] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [autoClimb, setAutoClimb] = useState(false);
  const [bgImage, setBgImage] = useState<string>(settings.customLadderBackground || '/assets/ladder/background.jpg');

  const characterRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<(HTMLDivElement | null)[]>([]);

  const progressRef = useRef(0);
  const sideRef = useRef<'left' | 'right'>('left');
  const seenMilestonesRef = useRef<Set<number>>(new Set());
  const autoClimbInterval = useRef<NodeJS.Timeout | null>(null);

  // Update background image when settings change
  useEffect(() => {
    if (settings.customLadderBackground) {
      setBgImage(settings.customLadderBackground);
    }
  }, [settings.customLadderBackground]);

  /* ------------------------------------------------------------------ */
  /* Scene initialization with dreamy effects */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.progress, 0);
    setLocalStorage(STORAGE_KEYS.milestones, []);

    setProgress(0);
    progressRef.current = 0;
    setSeenMilestones([]);
    seenMilestonesRef.current = new Set();
    setShowMilestone(false);
    setShowCompletion(false);

    updateProgress({
      ladderProgress: 0,
      unlockedGifts: false,
    });

    // Create floating stars
    if (!settings.reducedMotion && containerRef.current) {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const star = document.createElement('div');
          star.innerHTML = '✨';
          star.className = 'fixed text-2xl pointer-events-none z-10 opacity-0';
          star.style.left = `${Math.random() * 90}%`;
          star.style.top = `${Math.random() * 90}%`;
          containerRef.current?.appendChild(star);

          gsap.to(star, {
            opacity: 0.4,
            scale: 1.2,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            delay: i * 0.3,
          });
        }, i * 300);
      }
    }

    return () => {
      if (autoClimbInterval.current) {
        clearInterval(autoClimbInterval.current);
      }
    };
  }, [updateProgress]);

  /* ------------------------------------------------------------------ */
  /* Auto-climb functionality */
  /* ------------------------------------------------------------------ */
  const startAutoClimb = () => {
    if (autoClimbInterval.current) {
      clearInterval(autoClimbInterval.current);
    }

    setAutoClimb(true);
    autoClimbInterval.current = setInterval(() => {
      if (progressRef.current >= MAX_PROGRESS) {
        if (autoClimbInterval.current) {
          clearInterval(autoClimbInterval.current);
        }
        return;
      }
      climb();
    }, 800);
  };

  const stopAutoClimb = () => {
    if (autoClimbInterval.current) {
      clearInterval(autoClimbInterval.current);
      autoClimbInterval.current = null;
    }
    setAutoClimb(false);
  };

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
  /* Movement animation with enhanced dreamy effects */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!characterRef.current) return;

    gsap.set(characterRef.current, {
      y: getTranslateForProgress(progress),
      x: (side === 'left' ? 1 : -1) * 35,
    });

    // Create trail effect
    if (!settings.reducedMotion && progress > 0) {
      const trail = document.createElement('div');
      trail.innerHTML = '✨';
      trail.className = 'fixed text-xl pointer-events-none z-20';
      const charRect = characterRef.current.getBoundingClientRect();
      trail.style.left = `${charRect.left + charRect.width / 2}px`;
      trail.style.top = `${charRect.top + charRect.height / 2}px`;
      document.body.appendChild(trail);

      gsap.to(trail, {
        y: -20,
        opacity: 0,
        scale: 0,
        rotation: 360,
        duration: 1.5,
        ease: 'power3.out',
        onComplete: () => trail.remove(),
      });
    }
  }, [progress, side, getTranslateForProgress, settings.reducedMotion]);

  /* ------------------------------------------------------------------ */
  /* Milestones + completion with enhanced visuals */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let timeout: number | undefined;

    const milestone = MILESTONES.find(
      (m) => m === progress && !seenMilestonesRef.current.has(m)
    );

    if (milestone) {
      setCurrentMilestone(milestone);
      setShowMilestone(true);
      seenMilestonesRef.current.add(milestone);
      setSeenMilestones(Array.from(seenMilestonesRef.current));

      if (settings.soundEnabled) {
        audioManager.play('success');
      }

      // Create milestone celebration
      if (!settings.reducedMotion && characterRef.current) {
        createMilestoneEffect(milestone);
      }

      timeout = window.setTimeout(() => {
        setShowMilestone(false);
        setCurrentMilestone(null);
      }, 2000);
    }

    if (progress >= MAX_PROGRESS) {
      updateProgress({
        unlockedGifts: true,
        ladderProgress: MAX_PROGRESS,
      });
      setTimeout(() => setShowCompletion(true), 500);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [progress, settings, updateProgress]);

  const createMilestoneEffect = (milestone: number) => {
    if (!characterRef.current) return;
    
    const charRect = characterRef.current.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = milestone === 20 ? '🏆' : '⭐';
        sparkle.className = 'fixed text-2xl pointer-events-none z-30';
        sparkle.style.left = `${charRect.left + charRect.width / 2}px`;
        sparkle.style.top = `${charRect.top + charRect.height / 2}px`;
        document.body.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 150,
          y: (Math.random() - 0.5) * 150 - 100,
          opacity: 0,
          scale: 0,
          rotation: 720,
          duration: 2,
          ease: 'power3.out',
          onComplete: () => sparkle.remove(),
        });
      }, i * 100);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Enhanced climb action with dreamy feedback */
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

    // Show random encouragement
    if (Math.random() > 0.7) {
      setEncouragementText(ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)]);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 1200);
    }

    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    if (!settings.reducedMotion && characterRef.current) {
      // Enhanced character animation
      gsap.to(characterRef.current, {
        y: getTranslateForProgress(next),
        x: (nextSide === 'left' ? 1 : -1) * 35,
        duration: 0.45,
        ease: 'power3.out',
        onComplete: () => setIsClimbing(false),
      });

      // Bounce effect
      gsap.to(characterRef.current, {
        scale: 1.2,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });

      if (quoteRef.current) {
        gsap.fromTo(
          quoteRef.current,
          { opacity: 0, y: 12, scale: 0.8 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
      }

      // Rung highlight animation
      const rungs = document.querySelectorAll('.ladder-rung');
      if (rungs[next - 1]) {
        gsap.fromTo(rungs[next - 1],
          { scale: 1, opacity: 0.7 },
          { scale: 1.3, opacity: 1, duration: 0.3, yoyo: true, repeat: 1 }
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
      if (e.key === 'a' && !autoClimb) {
        startAutoClimb();
      }
      if (e.key === 's' && autoClimb) {
        stopAutoClimb();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [climb, autoClimb]);

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden 
                 bg-gradient-to-br from-sky-950 via-indigo-950/90 to-purple-950/90"
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

      {/* Enhanced Background Layers */}
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/70 via-blue-900/50 to-indigo-900/70" />
        
        {/* Animated cloud-like forms */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        
        {/* Starfield */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJzdGFycyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjAuMyIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+PGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMC40IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48Y2lyY2xlIGN4PSI5MCIgY3k9IjE1IiByPSIwLjYiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMpIi8+PC9zdmc+')] 
                        opacity-30" />
      </div>

      {/* Celebration Particles */}
      {showMilestone && (
        <div className="absolute inset-0 pointer-events-none">
          <AdaptiveParticleSystem count={200} color="#fbbf24" speed={0.7} size={3} />
        </div>
      )}
      {progress >= MAX_PROGRESS && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <AdaptiveParticleSystem count={400} color="#ffffff" speed={1} size={4} />
            <Confetti 
              recycle={false} 
              numberOfPieces={300} 
              gravity={0.05}
              colors={['#fbbf24', '#60a5fa', '#a855f7', '#34d399']}
              wind={0.01}
            />
          </div>
        </>
      )}

      {/* Floating Decorations */}
      <div className="absolute top-8 left-8 text-3xl opacity-30 animate-float-slow">
        <Cloud className="w-8 h-8" />
      </div>
      <div className="absolute top-12 right-10 text-2xl opacity-20 animate-float-slow" style={{animationDelay: '1s'}}>
        <Moon className="w-6 h-6" />
      </div>
      <div className="absolute bottom-16 left-10 text-2xl opacity-20 animate-float-slow" style={{animationDelay: '2s'}}>
        <Star className="w-6 h-6" />
      </div>
      <div className="absolute bottom-20 right-8 text-3xl opacity-30 animate-float-slow" style={{animationDelay: '0.5s'}}>
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="relative z-20 text-center w-full max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="relative inline-block mb-3">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 
                          blur-2xl rounded-full" />
            <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-2
                          drop-shadow-[0_0_30px_rgba(96,165,250,0.7)]">
              <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 
                             bg-clip-text text-transparent">
                Can you make it to the top
              </span>
            </h1>
          </div>
          <p className="text-sm sm:text-base text-blue-200/90 font-elegant">
          🎈 Climb with care 🎈
          </p>
        </div>

        {/* Progress Display */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {progress}<span className="text-blue-300/70">/20</span>
              </div>
              <div className="text-xs sm:text-sm text-blue-300/70">Steps</div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-blue-900/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/30"
                  style={{ width: `${(progress / MAX_PROGRESS) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-blue-300/60 mt-1">
                <span>Start</span>
                <span>Summit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Display */}
        {quote && (
          <div
            ref={quoteRef}
            className="mb-4 sm:mb-6 text-base sm:text-lg md:text-xl text-cyan-300/90 font-cursive italic
                     drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]"
          >
            "{quote}"
          </div>
        )}

        {/* Encouragement Popup */}
        {showEncouragement && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-300 animate-ping-slow
                          drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
              {encouragementText}
            </div>
          </div>
        )}

        {/* Ladder Game Area */}
        <div className="relative w-full aspect-square max-w-md mx-auto mb-6 sm:mb-8 
                      rounded-3xl bg-gradient-to-br from-black/30 to-black/20 
                      border-2 border-blue-500/30 backdrop-blur-lg
                      shadow-2xl shadow-blue-900/30 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-purple-500/10" />
          
          {/* Ladder */}
          <div
            ref={ladderRef}
            className="absolute left-1/2 -translate-x-1/2 w-20 h-[90%] top-5
                      bg-gradient-to-b from-blue-400/20 via-cyan-400/30 to-purple-400/20 
                      rounded-xl border-2 border-blue-400/40 backdrop-blur-sm"
          >
            {/* Rungs */}
            {Array.from({ length: MAX_PROGRESS }).map((_, i) => (
              <div
                key={i}
                className={`ladder-rung absolute left-0 right-0 h-1 
                          transition-all duration-300 ${i < progress ? 'bg-gradient-to-r from-blue-300 to-cyan-300' : 'bg-blue-400/40'}`}
                style={{ top: `${(i / (MAX_PROGRESS - 1)) * 100}%` }}
              />
            ))}
          </div>

          {/* Character */}
          <div
            ref={characterRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-300"
          >
            <div className="relative">
              {/* Character Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 
                            rounded-full blur-lg" />
              
              {/* Character Image */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full 
                            bg-gradient-to-br from-blue-400 to-cyan-400
                            border-4 border-white/40 shadow-2xl shadow-blue-500/50
                            flex items-center justify-center
                            transition-transform duration-300">
                <div className="text-3xl sm:text-4xl">🧚</div>
                
                {/* Character Sparkle */}
                <div className="absolute -top-2 -right-2 text-xl animate-ping">
                  ✨
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Celebration */}
          {showMilestone && currentMilestone && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="text-center animate-scale-in">
                <div className="text-4xl sm:text-5xl mb-2">
                  {currentMilestone === 20 ? '🏆' : '⭐'}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-300">
                  Level {currentMilestone}!
                </div>
                <div className="text-sm text-cyan-300">
                  {currentMilestone === 20 ? 'YOU MADE IT' : 'Milestone Achieved'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Main Climb Button */}
          <Button
            onClick={climb}
            disabled={isClimbing || progress >= MAX_PROGRESS}
            className="relative w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 
                       text-base sm:text-lg md:text-xl
                       bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500
                       hover:from-blue-400 hover:via-cyan-400 hover:to-blue-400
                       text-white rounded-2xl shadow-2xl
                       hover:shadow-3xl hover:shadow-blue-500/40
                       transition-all duration-300
                       hover:scale-[1.02] active:scale-95
                       group overflow-hidden
                       min-w-[200px]"
          >
            {progress >= MAX_PROGRESS ? (
              <span className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                YOU MADE ITTT! 🎉
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-y-[-2px] transition-transform" />
                Climb with peace:)
              </span>
            )}
            {/* Button shine effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent
                          -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>

          {/* Auto Climb Controls */}
          {progress < MAX_PROGRESS && (
            <div className="flex gap-3 justify-center">
              {!autoClimb ? (
                <Button
                  onClick={startAutoClimb}
                  variant="outline"
                  className="px-4 py-3 text-sm border-blue-400/40 text-blue-300
                           hover:bg-blue-900/30 hover:border-blue-300/60"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto Climb (A)
                </Button>
              ) : (
                <Button
                  onClick={stopAutoClimb}
                  variant="outline"
                  className="px-4 py-3 text-sm border-red-400/40 text-red-300
                           hover:bg-red-900/30 hover:border-red-300/60"
                >
                  <div className="w-4 h-4 mr-2 rounded-full bg-red-500 animate-pulse" />
                  Stop Auto Climb (S)
                </Button>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs sm:text-sm text-blue-300/70 space-y-1">
            <p>Press <kbd className="px-2 py-1 bg-blue-800/50 rounded border border-blue-700/50">Space</kbd> or <kbd className="px-2 py-1 bg-blue-800/50 rounded border border-blue-700/50">↑</kbd> to climb</p>
            <p>Press <kbd className="px-2 py-1 bg-blue-800/50 rounded border border-blue-700/50">A</kbd> for auto climb</p>
          </div>
        </div>

        {/* Completion Overlay */}
        {showCompletion && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-lg z-50 p-4 animate-fade-in">
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-blue-900/95 via-cyan-900/90 to-purple-900/95 
                          rounded-2xl sm:rounded-3xl border-2 border-cyan-500/50 backdrop-blur-2xl
                          max-w-sm sm:max-w-md w-full animate-scale-in">
              <div className="relative mb-4 sm:mb-6">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-purple-400/30 
                              blur-2xl rounded-full" />
                <div className="relative text-5xl sm:text-6xl mb-4">🏆✨</div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">YOUUUU MADE IT SO FARRR!</h2>
              <p className="text-cyan-200/90 text-sm sm:text-base mb-6">
                 Everyone is proud of you! Your journey has been inspiring. Alhumdulillah💕
              </p>
              <div className="text-3xl animate-bounce">🎉</div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.6)); }
          50% { opacity: 1; filter: drop-shadow(0 0 40px rgba(34, 211, 238, 0.9)); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 0.6s ease-in-out infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #60a5fa, #22d3ee);
          border-radius: 4px;
        }
        
        /* Selection color */
        ::selection {
          background: rgba(96, 165, 250, 0.3);
          color: white;
        }
      `}</style>
    </div>
  );
}

// Helper function to set localStorage
function setLocalStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to set localStorage:', error);
  }
}
