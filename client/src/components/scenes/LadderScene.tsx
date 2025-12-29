import { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { ChevronUp, Star, Trophy, Sparkles, Cloud, Sun, Wind } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* CONFIG & DATA */
/* ------------------------------------------------------------------ */

const QUOTES = [
  "To the moon! 🚀",
  "Don't look down! (Just kidding) ☁️",
  "Top of the world! 🌍",
  "Keep hopping! 🐇",
  "Sky's the limit! ✨",
  "Level up! ⬆️",
  "Almost touching clouds! 🌥️",
  "Gravity who? 🎈",
];

const ENCOURAGEMENT = [
  "BOOM! 💥",
  "Epic! 🎸",
  "So Fast! ⚡",
  "Floating! 🧞‍♂️",
  "Wow! 🤩",
  "Nice Moves! 🕺",
];

const MILESTONES = [5, 10, 15, 20];
const MAX_PROGRESS = 20;
const CHARACTER_PADDING = 20;

const STORAGE_KEYS = {
  progress: 'ladderProgress',
  milestones: 'ladderSeenMilestones',
};

/* ------------------------------------------------------------------ */
/* HELPER COMPONENTS (Visual Decor) */
/* ------------------------------------------------------------------ */

// A Roblox-style floating island decoration
const FloatingIsland = ({ delay, size, x, y, speed }: { delay: number, size: number, x: string, y: string, speed: number }) => (
  <div 
    className="absolute pointer-events-none opacity-60 z-0"
    style={{ 
      left: x, 
      top: y, 
      animation: `float-island ${speed}s ease-in-out infinite`,
      animationDelay: `${delay}s`
    }}
  >
    {/* Top Grass */}
    <div 
      className="bg-[#4ade80] rounded-t-xl relative z-10"
      style={{ width: size, height: size / 3 }}
    />
    {/* Dirt Bottom */}
    <div 
      className="bg-[#854d0e] rounded-b-xl -mt-1 relative z-0"
      style={{ width: size, height: size / 2, boxShadow: 'inset -5px -5px 0px rgba(0,0,0,0.2)' }}
    />
  </div>
);

// Procedural Clouds
const BackgroundCloud = ({ delay, duration, top, scale, opacity }: { delay: number, duration: number, top: string, scale: number, opacity: number }) => (
  <div 
    className="absolute text-white pointer-events-none z-0"
    style={{ 
      top, 
      left: '-20%',
      opacity,
      transform: `scale(${scale})`,
      animation: `drift-cloud ${duration}s linear infinite`,
      animationDelay: `-${delay}s` // Negative delay to start mid-animation
    }}
  >
    <Cloud fill="white" className="w-32 h-32 blur-sm" />
  </div>
);

export function LadderScene() {
  const { updateProgress, settings } = useSceneStore();

  /* ------------------------------------------------------------------ */
  /* STATE */
  /* ------------------------------------------------------------------ */
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
  const [shake, setShake] = useState(false); // New: Camera shake state

  // Refs
  const characterRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const sideRef = useRef<'left' | 'right'>('left');
  const seenMilestonesRef = useRef<Set<number>>(new Set());
  const autoClimbInterval = useRef<NodeJS.Timeout | null>(null);

  /* ------------------------------------------------------------------ */
  /* INITIALIZATION */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // Reset or Load logic (Simplified for this snippet to always start fresh or load safely)
    setProgress(0);
    progressRef.current = 0;
    setSeenMilestones([]);
    seenMilestonesRef.current = new Set();
    setShowMilestone(false);
    setShowCompletion(false);

    updateProgress({ ladderProgress: 0, unlockedGifts: false });

    return () => {
      if (autoClimbInterval.current) clearInterval(autoClimbInterval.current);
    };
  }, [updateProgress]);

  /* ------------------------------------------------------------------ */
  /* GEOMETRY & RESIZING */
  /* ------------------------------------------------------------------ */
  const getTranslateForProgress = useCallback((value: number) => {
    const effectiveStep = stepSize || (maxTranslateY > 0 ? maxTranslateY / MAX_PROGRESS : 0);
    return -Math.min(maxTranslateY, effectiveStep * value);
  }, [maxTranslateY, stepSize]);

  useLayoutEffect(() => {
    const ladderEl = ladderRef.current;
    if (!ladderEl) return;

    const updateGeometry = () => {
      const ladderHeight = ladderEl.clientHeight;
      const characterHeight = characterRef.current?.clientHeight ?? 64;
      const safeMax = Math.max(0, ladderHeight - characterHeight - CHARACTER_PADDING);
      
      setMaxTranslateY(safeMax);
      setStepSize(safeMax / MAX_PROGRESS || 0);

      // Reset position immediately on resize
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
  /* GAMEPLAY LOGIC */
  /* ------------------------------------------------------------------ */
  
  // Trigger camera shake effect
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 200);
  };

  const climb = useCallback(() => {
    if (isClimbing || progressRef.current >= MAX_PROGRESS) return;

    setIsClimbing(true);
    triggerShake(); // Visual feedback

    const next = Math.min(MAX_PROGRESS, progressRef.current + 1);
    const nextSide = sideRef.current === 'left' ? 'right' : 'left';

    setProgress(next);
    progressRef.current = next;
    setSide(nextSide);
    sideRef.current = nextSide;

    if (settings.soundEnabled) audioManager.play('hit');

    // Random Encouragement
    if (Math.random() > 0.6) {
      setEncouragementText(ENCOURAGEMENT[Math.floor(Math.random() * ENCOURAGEMENT.length)]);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 1000);
    }
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // ANIMATION
    if (!settings.reducedMotion && characterRef.current) {
      // Jump up
      gsap.to(characterRef.current, {
        y: getTranslateForProgress(next),
        x: (nextSide === 'left' ? 1 : -1) * 35, // Zig zag
        rotation: (nextSide === 'left' ? -5 : 5), // Tilt body slightly
        duration: 0.4,
        ease: 'back.out(1.2)', // Bouncy easing
        onComplete: () => {
          setIsClimbing(false);
          // Return rotation to near zero but keep it lively
          gsap.to(characterRef.current, { rotation: 0, duration: 0.2 });
        },
      });

      // Squash and stretch effect on the character
      gsap.fromTo(characterRef.current.querySelector('.char-avatar'), 
        { scaleX: 1.3, scaleY: 0.7 }, // Squash
        { scaleX: 1, scaleY: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' } // Snap back
      );
    } else {
      setIsClimbing(false);
    }

  }, [isClimbing, settings, getTranslateForProgress]);

  /* ------------------------------------------------------------------ */
  /* AUTO CLIMB */
  /* ------------------------------------------------------------------ */
  const startAutoClimb = () => {
    if (autoClimbInterval.current) clearInterval(autoClimbInterval.current);
    setAutoClimb(true);
    autoClimbInterval.current = setInterval(() => {
      if (progressRef.current >= MAX_PROGRESS) {
        if (autoClimbInterval.current) clearInterval(autoClimbInterval.current);
        return;
      }
      climb();
    }, 600); // Faster auto climb for game feel
  };

  const stopAutoClimb = () => {
    if (autoClimbInterval.current) clearInterval(autoClimbInterval.current);
    setAutoClimb(false);
  };

  /* ------------------------------------------------------------------ */
  /* MILESTONES & COMPLETION */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const milestone = MILESTONES.find(m => m === progress && !seenMilestonesRef.current.has(m));
    if (milestone) {
      setCurrentMilestone(milestone);
      setShowMilestone(true);
      seenMilestonesRef.current.add(milestone);
      setSeenMilestones(Array.from(seenMilestonesRef.current));
      
      if (settings.soundEnabled) audioManager.play('success');

      // Milestone Particles
      if (!settings.reducedMotion && characterRef.current) {
        const charRect = characterRef.current.getBoundingClientRect();
        for(let i=0; i<8; i++) {
           // Simple DOM manipulation for instant feedback or use the ParticleSystem props
        }
      }
      setTimeout(() => { setShowMilestone(false); setCurrentMilestone(null); }, 2000);
    }

    if (progress >= MAX_PROGRESS) {
      updateProgress({ unlockedGifts: true, ladderProgress: MAX_PROGRESS });
      setTimeout(() => setShowCompletion(true), 500);
    }
  }, [progress, settings, updateProgress]);

  /* ------------------------------------------------------------------ */
  /* KEYBOARD CONTROLS */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); climb(); }
      if (e.key === 'a' && !autoClimb) startAutoClimb();
      if (e.key === 's' && autoClimb) stopAutoClimb();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [climb, autoClimb]);

  /* ------------------------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------------------------ */
  
  // Memoize background elements to prevent re-renders
  const backgroundElements = useMemo(() => (
    <>
       {/* Floating Islands (The Obby Look) */}
       <FloatingIsland delay={0} size={120} x="10%" y="20%" speed={6} />
       <FloatingIsland delay={2} size={80} x="85%" y="15%" speed={5} />
       <FloatingIsland delay={1} size={160} x="75%" y="60%" speed={7} />
       <FloatingIsland delay={3} size={60} x="15%" y="70%" speed={4} />

       {/* Drifting Clouds */}
       <BackgroundCloud delay={0} duration={40} top="10%" scale={1.2} opacity={0.4} />
       <BackgroundCloud delay={15} duration={55} top="40%" scale={0.8} opacity={0.3} />
       <BackgroundCloud delay={8} duration={35} top="70%" scale={1.5} opacity={0.2} />
    </>
  ), []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden 
                 bg-gradient-to-b from-[#38bdf8] via-[#818cf8] to-[#f472b6]
                 transition-transform duration-100 ${shake ? 'translate-y-1 scale-[1.01]' : ''}`}
    >
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
         {/* Sun */}
         <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-80 animate-pulse-slow" />
         <Sun className="absolute top-12 right-12 w-28 h-28 text-yellow-100 opacity-90 animate-spin-slow" />
         
         {backgroundElements}
      </div>

      {/* --- PARTICLES --- */}
      {showMilestone && (
        <div className="absolute inset-0 pointer-events-none z-30">
          <AdaptiveParticleSystem count={150} color="#fbbf24" speed={1} size={5} />
        </div>
      )}
      {progress >= MAX_PROGRESS && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <Confetti recycle={false} numberOfPieces={400} />
        </div>
      )}

      {/* --- UI LAYER --- */}
      <div className="relative z-20 text-center w-full max-w-2xl px-4 flex flex-col h-full py-6">
        
        {/* Header Area */}
        <div className="flex-none mb-4">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] tracking-wide stroke-black">
              SKY CLIMB
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
                <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-white font-bold border-2 border-white/40 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    <span>Level {Math.floor(progress / 5) + 1}</span>
                </div>
            </div>
        </div>

        {/* Floating Quote */}
        <div className="h-12 flex items-center justify-center mb-2">
            {quote && (
              <div key={quote} className="animate-pop-in bg-white text-blue-600 px-4 py-2 rounded-xl font-bold text-sm shadow-xl transform -rotate-1">
                {quote}
              </div>
            )}
        </div>

        {/* --- GAME AREA (LADDER) --- */}
        <div className="flex-1 relative w-full max-w-md mx-auto min-h-0">
            {/* Encouragement Popup */}
            {showEncouragement && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                    <div className="text-4xl sm:text-6xl font-black text-yellow-400 stroke-text animate-bounce-in drop-shadow-xl rotate-12">
                        {encouragementText}
                    </div>
                </div>
            )}

            {/* The Ladder Structure */}
            <div 
                ref={ladderRef}
                className="absolute left-1/2 -translate-x-1/2 w-28 h-full
                          bg-gradient-to-b from-white/10 to-white/5
                          rounded-t-3xl border-x-4 border-white/50 backdrop-blur-sm
                          shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
                {/* Rails (Neon Glow) */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-cyan-300 shadow-[0_0_15px_#22d3ee]"></div>
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-cyan-300 shadow-[0_0_15px_#22d3ee]"></div>

                {/* Rungs */}
                {Array.from({ length: MAX_PROGRESS }).map((_, i) => (
                    <div
                        key={i}
                        className={`absolute left-2 right-2 h-3 rounded-full 
                                  transition-all duration-300 border-b-2 border-black/10
                                  ${i < progress ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_10px_#4ade80]' : 'bg-white/30'}`}
                        style={{ top: `${(i / (MAX_PROGRESS - 1)) * 95}%` }}
                    />
                ))}
            </div>

            {/* The Character */}
            <div
                ref={characterRef}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 transition-transform will-change-transform"
            >
                <div className="char-avatar relative w-20 h-20">
                     {/* Wings */}
                    <div className="absolute top-4 -left-4 text-3xl animate-flutter opacity-90">🪽</div>
                    <div className="absolute top-4 -right-4 text-3xl animate-flutter opacity-90 scale-x-[-1]">🪽</div>
                    
                    {/* Body */}
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl 
                                  border-4 border-white shadow-xl flex items-center justify-center
                                  transform hover:scale-105 transition-transform">
                        <span className="text-4xl filter drop-shadow-md">😃</span>
                    </div>

                    {/* Trail when moving */}
                    {isClimbing && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full flex justify-center gap-2">
                             <span className="animate-fall-fade text-xs">☁️</span>
                             <span className="animate-fall-fade delay-75 text-xs">✨</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Milestone Text Overlay */}
            {showMilestone && currentMilestone && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 text-center w-64">
                 <div className="text-6xl animate-bounce mb-2">⭐</div>
                 <div className="bg-yellow-400 text-yellow-900 border-4 border-white rounded-xl py-2 px-4 font-black text-xl shadow-xl animate-pop-in">
                    CHECKPOINT!
                 </div>
              </div>
            )}
        </div>

        {/* --- CONTROLS FOOTER --- */}
        <div className="flex-none pt-4 pb-2 space-y-3">
             {/* Progress Bar (Health Bar style) */}
             <div className="w-full max-w-xs mx-auto bg-black/30 p-1 rounded-full backdrop-blur-sm border border-white/20">
                <div className="relative h-4 rounded-full overflow-hidden w-full bg-black/20">
                    <div 
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out"
                        style={{ width: `${(progress / MAX_PROGRESS) * 100}%` }}
                    />
                    {/* Stripes pattern on bar */}
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqgOxVEwMtztAAkAAAAAASUVORK5CYII=')]"></div>
                </div>
             </div>
             <div className="text-white/80 text-xs font-bold tracking-wider">{progress} / {MAX_PROGRESS} STEPS</div>

             {/* Main Action Button */}
             <Button
                onClick={climb}
                disabled={isClimbing || progress >= MAX_PROGRESS}
                className="w-full max-w-sm mx-auto h-auto py-4 rounded-2xl
                         bg-gradient-to-b from-blue-400 to-blue-600
                         border-b-8 border-blue-800
                         active:border-b-0 active:translate-y-2
                         hover:brightness-110 transition-all
                         shadow-xl group relative overflow-hidden"
             >
                {progress >= MAX_PROGRESS ? (
                    <div className="text-2xl font-black text-white flex items-center justify-center gap-2">
                        <Trophy className="w-8 h-8 animate-bounce" />
                        VICTORY!
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
                           {autoClimb ? 'Auto Climbing...' : 'CLIMB UP!'}
                        </span>
                        <span className="text-xs text-blue-100 font-bold opacity-80">
                           {autoClimb ? '(Press S to stop)' : '(Press Spacebar)'}
                        </span>
                    </div>
                )}
             </Button>

             {/* Auto Climb Toggle (Small) */}
             {progress < MAX_PROGRESS && (
                <button 
                  onClick={autoClimb ? stopAutoClimb : startAutoClimb}
                  className="text-xs font-bold text-white/70 hover:text-white hover:underline bg-black/10 px-3 py-1 rounded-full transition-colors"
                >
                    {autoClimb ? "Stop Auto-Pilot" : "Enable Auto-Pilot"}
                </button>
             )}
        </div>
      </div>

      {/* --- COMPLETION MODAL --- */}
      {showCompletion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 p-1 rounded-3xl w-full max-w-sm shadow-2xl animate-bounce-in">
              <div className="bg-white rounded-[20px] p-6 text-center border-4 border-yellow-200 border-dashed">
                  <div className="text-6xl mb-4 animate-pulse">👑</div>
                  <h2 className="text-3xl font-black text-yellow-500 mb-2 uppercase">You Did It!</h2>
                  <p className="text-gray-500 font-medium mb-6">
                      You've reached the highest clouds! The view is amazing from here.
                  </p>
                  <Button onClick={() => window.location.reload()} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl py-6 text-xl">
                      Play Again 🔄
                  </Button>
              </div>
           </div>
        </div>
      )}

      {/* --- STYLES --- */}
      <style>{`
        @keyframes float-island {
           0%, 100% { transform: translateY(0px); }
           50% { transform: translateY(-15px); }
        }
        @keyframes drift-cloud {
           from { transform: translateX(-100%) scale(1); }
           to { transform: translateX(500%) scale(1); }
        }
        @keyframes flutter {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(10deg); }
        }
        @keyframes bounce-in {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); }
        }
        @keyframes pop-in {
            0% { transform: scale(0.8) translateY(10px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes fall-fade {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(20px) scale(0); opacity: 0; }
        }
        .stroke-text {
            -webkit-text-stroke: 2px #000;
        }
      `}</style>
    </div>
  );
}
