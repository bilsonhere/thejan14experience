import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { 
  Trophy, Cloud, Sun, Castle, Crown, Heart, Zap, 
  BookOpen, GraduationCap, Plane, HeartCrack, Mountain, 
  Cat, Music, Star, Gift, PartyPopper 
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 1. CONFIGURATION: EASY TO EDIT */
/* ------------------------------------------------------------------ */

// TEXT THAT APPEARS AT THE TOP (The "Vibe" of that age)
const AGE_FLAVOR: Record<number, string> = {
  1: "First steps! 👶",
  5: "Kindergarten starts! 🎒",
  10: "Double digits! 🔟",
  14: "New Country, New Challenges ✈️",
  15: "High School Drama 🎭",
  16: "JEETARD MODE ON 📚",
  17: "The Grind Never Stops ✍️",
  18: "Freedom? Maybe? 🦋",
  19: "College Life / Adulting 🧺",
  20: "THE QUEEN ARRIVES! 👑"
};

// COMBINED LIST OF CHALLENGES (Obstacles) AND MEMORIES (Good Moments)
// Type: 'OBSTACLE' (Stops you, red color, hard) OR 'MEMORY' (Stops you, gold color, celebration)
const LIFE_EVENTS: Record<number, { 
    type: 'OBSTACLE' | 'MEMORY', 
    title: string, 
    description: string, 
    buttonText: string, 
    icon: any, 
    color: string 
}> = {
  // --- CHILDHOOD ---
  4: { 
    type: 'OBSTACLE',
    title: "First Day of School", 
    description: "Big bag, new shoes, crying at the gate...", 
    buttonText: "Be Brave! 🦁", 
    icon: BookOpen,
    color: "bg-blue-500"
  },
  11: { 
    type: 'MEMORY',
    title: "Aapi's Destination Wedding", 
    description: "Dressing up, henna, and pure vibes! 💍", 
    buttonText: "Best Memories! 📸", 
    icon: Heart,
    color: "bg-pink-500"
  },
  13: { 
    type: 'MEMORY',
    title: "Trip to Jebel Jais", 
    description: "The mountains, the cold, the road trip! 🏔️", 
    buttonText: "What a view! 🌄", 
    icon: Mountain,
    color: "bg-teal-500"
  },
  
  // --- THE TEENAGE SHIFT ---
  14: { 
    type: 'OBSTACLE',
    title: "Leaving Birth Country", 
    description: "Saying goodbye to childhood home & friends...", 
    buttonText: "Embrace Change ✈️", 
    icon: Plane,
    color: "bg-indigo-600"
  },
  15: {
    type: 'MEMORY',
    title: "Billie Eilish Grammy!",
    description: "She won! Fan girl moment of the century! 🎵",
    buttonText: "Slay! 💅",
    icon: Music,
    color: "bg-green-500"
  },
  
  // --- HIGH SCHOOL HIGHS & LOWS ---
  16: { 
    type: 'OBSTACLE',
    title: "The Heartbreak", 
    description: "Messi leaves Barcelona... I can't.", 
    buttonText: "Stay Loyal 💔", 
    icon: HeartCrack,
    color: "bg-red-500"
  },
  17: {
    type: 'MEMORY',
    title: "Academic Weapon",
    description: "99/100 in English?! Who is she?! 📝",
    buttonText: "Smarty Pants! 🧠",
    icon: Star,
    color: "bg-yellow-500"
  },
  18: { 
    type: 'OBSTACLE',
    title: "Competitive Exams", 
    description: "The stress. The books. The pressure.", 
    buttonText: "Lock In! 🎯", 
    icon: Zap,
    color: "bg-purple-700"
  },
  
  // --- RECENT WINS ---
  19: {
    type: 'MEMORY',
    title: "Messi Wins World Cup",
    description: "THE GOAT COMPLETED FOOTBALL! 🏆",
    buttonText: "VAMOS! 🇦🇷",
    icon: Trophy,
    color: "bg-sky-500" // Argentina blue
  },
  20: { // Technically happens right before 20 in game logic
    type: 'MEMORY',
    title: "Luna & Simba",
    description: "Adopted the cutest babies ever! 🐱",
    buttonText: "Meow! 🐾",
    icon: Cat,
    color: "bg-orange-400"
  }
};

const MAX_PROGRESS = 20; // 20 Years
const CHARACTER_PADDING = 24;

/* ------------------------------------------------------------------ */
/* DECORATIVE COMPONENTS */
/* ------------------------------------------------------------------ */

const FloatingCastle = () => (
  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-0 opacity-80 animate-float-slow">
    <Castle className="w-32 h-32 text-pink-200 drop-shadow-[0_0_15px_rgba(255,192,203,0.8)]" />
    <div className="absolute -bottom-4 left-0 w-full h-8 bg-white/20 blur-xl rounded-full" />
  </div>
);

const CloudPlatform = ({ delay, top, left, scale }: { delay: number, top: string, left: string, scale: number }) => (
  <div 
    className="absolute pointer-events-none opacity-60 z-0"
    style={{ 
      top, left, 
      transform: `scale(${scale})`,
      animation: `float-cloud 6s ease-in-out infinite`,
      animationDelay: `${delay}s`
    }}
  >
    <Cloud fill="white" className="text-white w-24 h-24 blur-sm" />
  </div>
);

export function LadderScene() {
  const { updateProgress, settings } = useSceneStore();

  /* ------------------------------------------------------------------ */
  /* STATE */
  /* ------------------------------------------------------------------ */
  const [progress, setProgress] = useState(0); // Age 0-20
  const [isClimbing, setIsClimbing] = useState(false);
  
  // The current event (Obstacle OR Memory) blocking the screen
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  
  const [side, setSide] = useState<'left' | 'right'>('left');
  
  // Visual states
  const [shake, setShake] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showMemoryConfetti, setShowMemoryConfetti] = useState(false); // Mini confetti for memory popups
  const [quote, setQuote] = useState("Journey to 20 Begins! ✨");

  // Refs
  const characterRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  /* ------------------------------------------------------------------ */
  /* SETUP */
  /* ------------------------------------------------------------------ */
  const [maxTranslateY, setMaxTranslateY] = useState(0);
  const [stepSize, setStepSize] = useState(0);

  const getTranslateForProgress = useCallback((value: number) => {
    const effectiveStep = stepSize || (maxTranslateY > 0 ? maxTranslateY / MAX_PROGRESS : 0);
    return -Math.min(maxTranslateY, effectiveStep * value);
  }, [maxTranslateY, stepSize]);

  // Handle Resize
  useLayoutEffect(() => {
    const ladderEl = ladderRef.current;
    if (!ladderEl) return;
    const updateGeometry = () => {
      const ladderHeight = ladderEl.clientHeight;
      const charH = characterRef.current?.clientHeight ?? 64;
      const safeMax = Math.max(0, ladderHeight - charH - CHARACTER_PADDING);
      setMaxTranslateY(safeMax);
      setStepSize(safeMax / MAX_PROGRESS || 0);
      
      if (characterRef.current) {
        gsap.set(characterRef.current, { y: getTranslateForProgress(progressRef.current) });
      }
    };
    updateGeometry();
    const obs = new ResizeObserver(updateGeometry);
    obs.observe(ladderEl);
    return () => obs.disconnect();
  }, [getTranslateForProgress]);

  // Init
  useEffect(() => {
    setProgress(0);
    progressRef.current = 0;
    setShowCompletion(false);
    updateProgress({ ladderProgress: 0, unlockedGifts: false });
  }, [updateProgress]);

  /* ------------------------------------------------------------------ */
  /* GAME LOGIC */
  /* ------------------------------------------------------------------ */

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const climb = useCallback(() => {
    // 1. Check constraints
    if (isClimbing || activeEvent || progressRef.current >= MAX_PROGRESS) return;

    // 2. Determine Next Step
    const currentAge = progressRef.current;
    const nextAge = currentAge + 1;

    // 3. Check for LIFE EVENTS (Obstacles OR Memories)
    if (LIFE_EVENTS[nextAge]) {
      // Pause! We hit an event.
      setActiveEvent(nextAge);
      
      // Different sound/effect based on type
      if (LIFE_EVENTS[nextAge].type === 'OBSTACLE') {
        triggerShake();
        if (settings.soundEnabled) audioManager.play('hit'); 
      } else {
        // Memory
        if (settings.soundEnabled) audioManager.play('success');
        setShowMemoryConfetti(true);
      }
      return;
    }

    // 4. Normal Climb
    setIsClimbing(true);
    const nextSide = side === 'left' ? 'right' : 'left';
    
    setProgress(nextAge);
    progressRef.current = nextAge;
    setSide(nextSide);

    // Update flavor text (The vibe of the age)
    if (AGE_FLAVOR[nextAge]) {
        setQuote(AGE_FLAVOR[nextAge]);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 1000);
    }

    if (settings.soundEnabled) audioManager.play('hit');

    // 5. Animation
    if (!settings.reducedMotion && characterRef.current) {
      // Jump Arc
      gsap.to(characterRef.current, {
        y: getTranslateForProgress(nextAge),
        x: (nextSide === 'left' ? 1 : -1) * 30, 
        rotation: (nextSide === 'left' ? -5 : 5),
        duration: 0.5,
        ease: 'back.out(1.4)', // Very bouncy
        onComplete: () => setIsClimbing(false)
      });
      
      // Avatar Squish
      gsap.fromTo(characterRef.current.querySelector('.princess-avatar'),
        { scaleY: 0.8, scaleX: 1.2 },
        { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }
      );
    } else {
      setIsClimbing(false);
    }

    // 6. Win Condition
    if (nextAge >= MAX_PROGRESS) {
        updateProgress({ unlockedGifts: true, ladderProgress: MAX_PROGRESS });
        setTimeout(() => setShowCompletion(true), 800);
    }

  }, [isClimbing, activeEvent, side, settings, getTranslateForProgress, updateProgress]);

  // Logic to handle clicking the button on a Pop-up (Memory or Obstacle)
  const handleEventAction = () => {
    if (!activeEvent) return;
    
    const eventData = LIFE_EVENTS[activeEvent];

    // Sound
    if (settings.soundEnabled) audioManager.play('success');
    
    // Visual "Power Up"
    if (characterRef.current) {
        gsap.fromTo(characterRef.current, 
            { scale: 1.5, filter: 'brightness(1.5)' }, 
            { scale: 1, filter: 'brightness(1)', duration: 0.5 }
        );
    }

    // Resume climbing logic for that specific step
    const nextAge = activeEvent;
    
    setIsClimbing(true);
    const nextSide = side === 'left' ? 'right' : 'left';
    
    setActiveEvent(null); // Clear popup
    setShowMemoryConfetti(false); // Stop mini confetti
    setProgress(nextAge);
    progressRef.current = nextAge;
    setSide(nextSide);

    // Set Quote based on what just happened
    if (eventData.type === 'OBSTACLE') {
       setQuote(`Overcame: ${eventData.title}! 💪`);
    } else {
       setQuote(`Memory Unlocked: ${eventData.title} ✨`);
    }

    // Check if there is specific flavor text for this age to overwrite the "Overcame" text
    if (AGE_FLAVOR[nextAge]) {
        setTimeout(() => setQuote(AGE_FLAVOR[nextAge]), 1500);
    }

    // Animate move
    if (!settings.reducedMotion && characterRef.current) {
        gsap.to(characterRef.current, {
          y: getTranslateForProgress(nextAge),
          x: (nextSide === 'left' ? 1 : -1) * 30, 
          duration: 0.6,
          ease: 'power4.out', // Powerful move
          onComplete: () => setIsClimbing(false)
        });
    } else {
        setIsClimbing(false);
    }
  };

  // Keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
        if (activeEvent) return; // Prevent key spam during popup
        if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); climb(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [climb, activeEvent]);

  /* ------------------------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------------------------ */
  
  // Current Event Data
  const currentEventData = activeEvent ? LIFE_EVENTS[activeEvent] : null;

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden 
                      bg-gradient-to-b from-indigo-300 via-purple-300 to-pink-300
                      transition-transform duration-100 ${shake ? 'translate-x-1 rotate-1' : ''}`}>
      
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 right-10 animate-spin-slow opacity-80">
            <Sun className="text-yellow-200 w-32 h-32" />
        </div>
        <CloudPlatform delay={0} top="15%" left="10%" scale={1} />
        <CloudPlatform delay={2} top="40%" left="80%" scale={0.8} />
        <CloudPlatform delay={4} top="70%" left="20%" scale={1.2} />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIi8+PC9zdmc+')] animate-pan-bg"></div>
      </div>

      {/* --- CONFETTI ON WIN OR MEMORY --- */}
      {showMemoryConfetti && (
         <div className="absolute inset-0 pointer-events-none z-50">
           <Confetti recycle={false} numberOfPieces={100} gravity={0.3} colors={['#FFD700', '#FFFFFF']} />
         </div>
      )}
      {progress >= MAX_PROGRESS && (
         <div className="absolute inset-0 pointer-events-none z-50">
           <Confetti recycle={true} numberOfPieces={200} colors={['#FFD700', '#FF69B4', '#FFFFFF']} />
         </div>
      )}

      {/* --- MAIN UI CONTAINER --- */}
      <div className="relative z-20 w-full max-w-2xl px-4 h-full flex flex-col py-6">

        {/* HEADER */}
        <div className="flex-none text-center mb-2">
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white drop-shadow-md stroke-pink-700">
                AFRAH'S JOURNEY
            </h1>
            <div className="inline-block mt-2 bg-white/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/50 shadow-lg">
                <span className="text-pink-900 font-bold flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                    AGE: <span className="text-2xl">{progress}</span> / 20
                </span>
            </div>
        </div>

        {/* FLAVOR TEXT AREA */}
        <div className="h-12 flex items-center justify-center mb-2">
            <div key={quote} className="animate-pop-in bg-white/90 text-purple-600 px-6 py-2 rounded-2xl font-bold text-sm sm:text-base shadow-xl border-2 border-purple-100">
                {quote}
            </div>
        </div>

        {/* GAME AREA */}
        <div className="flex-1 relative w-full max-w-md mx-auto min-h-0">
            
            {/* CASTLE AT TOP */}
            <FloatingCastle />

            {/* THE LADDER */}
            <div ref={ladderRef} className="absolute left-1/2 -translate-x-1/2 w-32 h-[85%] bottom-0 top-16">
                {/* Rails */}
                <div className="absolute left-0 h-full w-3 bg-gradient-to-b from-yellow-200 to-yellow-500 rounded-full shadow-lg border-x border-yellow-600/30" />
                <div className="absolute right-0 h-full w-3 bg-gradient-to-b from-yellow-200 to-yellow-500 rounded-full shadow-lg border-x border-yellow-600/30" />
                
                {/* Steps */}
                {Array.from({ length: MAX_PROGRESS }).map((_, i) => (
                    <div key={i} 
                         className={`absolute left-3 right-3 h-4 rounded-md shadow-sm border-b-2 transition-colors duration-300
                                   ${i < progress ? 'bg-pink-400 border-pink-600' : 'bg-white/40 border-white/60'}`}
                         style={{ top: `${(i / (MAX_PROGRESS - 1)) * 95}%` }}
                    />
                ))}
            </div>

            {/* --- POP-UP OVERLAY (OBSTACLES & MEMORIES) --- */}
            {activeEvent && currentEventData && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-72 animate-bounce-in">
                    {/* Rotate different directions for fun */}
                    <div className={`${currentEventData.color} text-white p-1.5 rounded-3xl shadow-2xl ${currentEventData.type === 'OBSTACLE' ? '-rotate-2' : 'rotate-2'}`}>
                        <div className="bg-white text-gray-800 rounded-[20px] p-5 text-center border-4 border-dashed border-white/50">
                            
                            {/* Icon Bubble */}
                            <div className="flex justify-center mb-3">
                                <div className={`p-3 rounded-full ${currentEventData.color} bg-opacity-20`}>
                                    <currentEventData.icon className={`w-10 h-10 ${currentEventData.color.replace('bg-', 'text-')}`} />
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className={`font-black text-xl uppercase mb-1 leading-tight ${currentEventData.type === 'OBSTACLE' ? 'text-red-600' : 'text-purple-600'}`}>
                                {currentEventData.type === 'MEMORY' && <span className="block text-xs text-yellow-500 mb-1">✨ SPECIAL MEMORY ✨</span>}
                                {currentEventData.title}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-5 font-medium leading-snug">
                                {currentEventData.description}
                            </p>
                            
                            {/* Action Button */}
                            <Button 
                                onClick={handleEventAction}
                                className={`w-full ${currentEventData.color} hover:brightness-110 text-white font-bold py-6 rounded-xl text-lg animate-pulse shadow-md transition-transform hover:scale-105 active:scale-95`}
                            >
                                {currentEventData.buttonText}
                            </Button>
                        </div>
                    </div>
                 </div>
            )}

            {/* THE PRINCESS AVATAR */}
            <div ref={characterRef} className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="princess-avatar relative w-24 h-24 transition-transform">
                    {/* Crown Icon floating above head */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-float-slow">
                        <Crown className="w-8 h-8 text-yellow-400 fill-yellow-200 drop-shadow-md" />
                    </div>
                    {/* The Princess Emoji */}
                    <div className="w-full h-full flex items-center justify-center text-6xl drop-shadow-2xl filter hover:brightness-110">
                        👸
                    </div>
                    
                    {/* Level Up Effect */}
                    {showLevelUp && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 font-black text-xl animate-float-up whitespace-nowrap stroke-black">
                            +1 YEAR!
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* CONTROLS */}
        <div className="flex-none pt-2 pb-4 space-y-3">
             {/* Main Button */}
             <Button
                onClick={climb}
                disabled={isClimbing || !!activeEvent || progress >= MAX_PROGRESS}
                className={`w-full max-w-sm mx-auto h-auto py-5 rounded-3xl text-xl font-black tracking-wide shadow-xl transition-all
                           ${activeEvent 
                               ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                               : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:scale-[1.02] border-b-4 border-pink-800 active:border-b-0 active:translate-y-1'
                           } text-white`}
             >
                {progress >= MAX_PROGRESS ? (
                    <span className="flex items-center gap-2"><Trophy /> HAPPY 20TH!</span>
                ) : activeEvent ? (
                    <span className="flex items-center gap-2">LOCKED 🔒</span>
                ) : (
                    <span>GROW UP! (Click)</span>
                )}
             </Button>
        </div>

      </div>

      {/* --- VICTORY MODAL --- */}
      {showCompletion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 p-1.5 rounded-[2rem] w-full max-w-sm shadow-2xl animate-bounce-in">
              <div className="bg-white rounded-[1.8rem] p-8 text-center border-4 border-pink-200">
                  <div className="text-7xl mb-4 animate-bounce">🎂</div>
                  <h2 className="text-3xl font-black text-pink-600 mb-2">HAPPY 20TH AFRAH!</h2>
                  <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                      From Jebel Jais to moving out, from heartbreak to finding Luna & Simba. You made it to 20!
                  </p>
                  <div className="bg-pink-50 p-4 rounded-xl mb-6">
                      <p className="text-sm text-pink-800 font-bold">"Every step was worth it. Alhumdulillah" 💖</p>
                  </div>
                  <Button onClick={() => window.location.reload()} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl py-4 text-lg shadow-lg">
                      Replay The Journey 🔄
                  </Button>
              </div>
           </div>
        </div>
      )}

      {/* --- STYLES --- */}
      <style>{`
        @keyframes float-slow {
           0%, 100% { transform: translateY(0px); }
           50% { transform: translateY(-10px); }
        }
        @keyframes float-cloud {
           0%, 100% { transform: translateX(0) scale(var(--tw-scale-x)); }
           50% { transform: translateX(20px) scale(var(--tw-scale-x)); }
        }
        @keyframes bounce-in {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            80% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes pop-in {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pan-bg {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes float-up {
            0% { transform: translate(-50%, 0); opacity: 1; }
            100% { transform: translate(-50%, -40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
