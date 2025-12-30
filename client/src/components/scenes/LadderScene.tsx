import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { 
  Trophy, Cloud, Sun, Castle, Crown, Heart, Zap, 
  BookOpen, GraduationCap, Plane, HeartCrack, Mountain, 
  Cat, Music, Star, Award, Users, Book, Layers
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 1. CONFIGURATION */
/* ------------------------------------------------------------------ */

const AGE_FLAVOR: Record<number, string> = {
  0: "Welcome to the world! 👶",
  1: "First steps & First words! 🗣️",
  2: "The 'Terrible Twos' (Adorable though) 🍼",
  3: "Preschool era begins 🎨",
  4: "Kindergarten ready! 🎒",
  5: "Making best friends 👫",
  6: "First grade boss energy 📚",
  7: "Losing baby teeth! 🦷",
  8: "Reading, writing, vibing 📖",
  9: "Last single digit year! ✨",
  10: "DOUBLE DIGITS CLUB! 🔟",
  11: "Tween life activated 💅",
  12: "Middle school mode 🏫",
  13: "Teenager unlocked! 🔓",
  14: "High school freshman 🎭",
  15: "Sweet Sixteen loading... ⏳",
  16: "Junior year grind 📚",
  17: "Senioritis incoming 🎓",
  18: "Legal Adult! (Kinda) 🦋",
  19: "College life begins 🏛️",
  20: "THE QUEEN ARRIVES! 👑"
};

interface LifeEvent {
  id: string;
  type: 'OBSTACLE' | 'MEMORY';
  title: string;
  description: string;
  buttonText: string;
  icon: any;
  color: string;
  age: number;
  priority: number; 
}

// REMOVED 'first-job' as requested
const LIFE_EVENTS_DB: LifeEvent[] = [
  // --- CHILDHOOD ---
  {
    id: 'first-day-school',
    type: 'OBSTACLE',
    title: "First Day of School",
    description: "Big bag, new shoes, crying at the gate...",
    buttonText: "Be Brave! 🦁",
    icon: BookOpen,
    color: "bg-blue-500",
    age: 4,
    priority: 1
  },
  {
    id: 'preschool-graduation',
    type: 'MEMORY',
    title: "Preschool Graduation",
    description: "Cap, gown, and the proudest smile ever! 📸",
    buttonText: "So Grown Up! 🎓",
    icon: GraduationCap,
    color: "bg-purple-400",
    age: 5,
    priority: 1
  },
  {
    id: 'aapi-wedding',
    type: 'MEMORY',
    title: "Aapi's Destination Wedding",
    description: "Henna, sparkles, and all the family vibes! 💍",
    buttonText: "Best Week Ever! ✨",
    icon: Heart,
    color: "bg-pink-500",
    age: 11,
    priority: 1
  },
  {
    id: 'jebel-jais-trip',
    type: 'MEMORY',
    title: "Jebel Jais Road Trip",
    description: "Freezing at the top of UAE's highest peak! 🏔️",
    buttonText: "What a view! 🌄",
    icon: Mountain,
    color: "bg-teal-500",
    age: 12,
    priority: 1
  },

  // --- TEENAGE YEARS ---
  {
    id: 'moving-countries',
    type: 'OBSTACLE',
    title: "Moving Countries",
    description: "Saying goodbye to childhood home & friends...",
    buttonText: "Embrace Change ✈️",
    icon: Plane,
    color: "bg-indigo-600",
    age: 14, // Adjusted age per previous request context
    priority: 2
  },
  {
    id: 'messi-leaves',
    type: 'OBSTACLE',
    title: "The Heartbreak",
    description: "Messi leaves Barcelona. Actual tears were shed. 💔",
    buttonText: "Stay Loyal 🔴🔵",
    icon: HeartCrack,
    color: "bg-red-500",
    age: 16,
    priority: 1
  },
  {
    id: 'billie-grammy',
    type: 'MEMORY',
    title: "Billie Eilish Grammy!",
    description: "She won! Fan girl moment of the century! 🎵",
    buttonText: "Slay! 💅",
    icon: Music,
    color: "bg-green-500",
    age: 15,
    priority: 1
  },
  {
    id: 'english-99',
    type: 'MEMORY',
    title: "Academic Weapon",
    description: "99/100 in English?! Who is she?! 📝",
    buttonText: "Smarty Pants! 🧠",
    icon: Star,
    color: "bg-yellow-500",
    age: 17,
    priority: 1
  },
  {
    id: 'competitive-exams',
    type: 'OBSTACLE',
    title: "JEETARD Mode",
    description: "The stress. The books. The pressure. The Grind.",
    buttonText: "Lock In! 🎯",
    icon: Zap,
    color: "bg-purple-700",
    age: 18,
    priority: 1
  },
  {
    id: 'college-acceptance',
    type: 'MEMORY',
    title: "College Acceptance",
    description: "The email that changed everything! 🎉",
    buttonText: "We Did It! 🎓",
    icon: Award,
    color: "bg-violet-500",
    age: 19,
    priority: 2
  },
  {
    id: 'first-college-friends',
    type: 'MEMORY',
    title: "Finding My People",
    description: "New city, new faces, instant connection! 👯‍♀️",
    buttonText: "Squad Goals 🤝",
    icon: Users,
    color: "bg-cyan-500",
    age: 19,
    priority: 1
  },
  {
    id: 'messi-world-cup',
    type: 'MEMORY',
    title: "Messi Wins World Cup",
    description: "THE GOAT COMPLETED FOOTBALL! 🏆",
    buttonText: "VAMOS! 🇦🇷",
    icon: Trophy,
    color: "bg-sky-500",
    age: 19, // Late 19/Early 20 context
    priority: 3
  },
  { // Happens right before 20
    id: 'adopt-pets',
    type: 'MEMORY',
    title: "Luna & Simba",
    description: "Adopted the cutest babies ever! 🐱",
    buttonText: "Meow! 🐾",
    icon: Cat,
    color: "bg-orange-400",
    age: 19, 
    priority: 4 
  }
];

const getEventsForAge = (age: number): LifeEvent[] => {
  return LIFE_EVENTS_DB
    .filter(event => event.age === age)
    .sort((a, b) => b.priority - a.priority);
};

const MAX_PROGRESS = 20;
const CHARACTER_PADDING = 24;

/* ------------------------------------------------------------------ */
/* COMPONENT: FLOATING ELEMENTS */
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

/* ------------------------------------------------------------------ */
/* COMPONENT: EVENT POPUP */
/* ------------------------------------------------------------------ */

const EventPopup = ({ event, onComplete, count, total }: { event: LifeEvent, onComplete: () => void, count: number, total: number }) => {
  const [showConfetti, setShowConfetti] = useState(event.type === 'MEMORY');

  return (
    <>
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-40">
          <Confetti recycle={false} numberOfPieces={150} gravity={0.25} colors={['#FFD700', '#FF69B4', '#FFFFFF']} />
        </div>
      )}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 animate-bounce-in">
        <div className={`${event.color} text-white p-1.5 rounded-3xl shadow-2xl ${event.type === 'OBSTACLE' ? '-rotate-1' : 'rotate-1'}`}>
          <div className="bg-white text-gray-800 rounded-[20px] p-5 text-center border-4 border-dashed border-white/50 relative">
            
            {/* Multi-event indicator */}
            {total > 1 && (
               <div className="absolute top-2 right-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 border border-gray-200 flex items-center gap-1">
                 <Layers className="w-3 h-3" /> {count}/{total}
               </div>
            )}

            {/* Icon Bubble */}
            <div className="flex justify-center mb-3">
              <div className={`p-4 rounded-full ${event.color} bg-opacity-20 shadow-inner`}>
                <event.icon className={`w-10 h-10 ${event.color.replace('bg-', 'text-')}`} />
              </div>
            </div>

            {/* Title */}
            <h3 className={`font-black text-xl uppercase mb-1 leading-tight ${event.type === 'OBSTACLE' ? 'text-red-600' : 'text-purple-600'}`}>
              {event.type === 'MEMORY' && <span className="block text-xs text-yellow-500 mb-1">✨ MEMORY UNLOCKED ✨</span>}
              {event.type === 'OBSTACLE' && <span className="block text-xs text-red-500 mb-1">🚧 CHALLENGE AHEAD 🚧</span>}
              {event.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mb-5 font-medium leading-relaxed">
              {event.description}
            </p>
            
            {/* Action Button */}
            <Button 
              onClick={onComplete}
              className={`w-full ${event.color} hover:brightness-110 text-white font-bold py-6 rounded-xl text-lg animate-pulse shadow-md transition-transform hover:scale-105 active:scale-95`}
            >
              {event.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN SCENE */
/* ------------------------------------------------------------------ */

export function LadderScene() {
  const { updateProgress, settings } = useSceneStore();

  // STATE
  const [progress, setProgress] = useState(0); 
  const [isClimbing, setIsClimbing] = useState(false);
  
  // QUEUE SYSTEM
  const [eventQueue, setEventQueue] = useState<LifeEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);
  // Track queue depth for UI (1/3, 2/3 etc)
  const [queueTotal, setQueueTotal] = useState(0); 
  
  const [side, setSide] = useState<'left' | 'right'>('left');
  
  // VISUALS
  const [shake, setShake] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [quote, setQuote] = useState(AGE_FLAVOR[0]);

  // REFS
  const characterRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  // SETUP GEOMETRY
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
    setEventQueue([]);
    setCurrentEvent(null);
    updateProgress({ ladderProgress: 0, unlockedGifts: false });
  }, [updateProgress]);

  /* ------------------------------------------------------------------ */
  /* GAME LOGIC & SCHEDULER */
  /* ------------------------------------------------------------------ */

  // 1. Process Queue: Triggered after climb finishes or an event closes
  const processNextInQueue = useCallback(() => {
    setEventQueue(prev => {
      if (prev.length === 0) return prev;
      
      const nextEvent = prev[0];
      const remaining = prev.slice(1);
      
      // Update UI immediately
      setCurrentEvent(nextEvent);

      // Effects
      if (settings.soundEnabled) {
        audioManager.play(nextEvent.type === 'OBSTACLE' ? 'hit' : 'success');
      }
      if (nextEvent.type === 'OBSTACLE') {
        setShake(true);
        setTimeout(() => setShake(false), 300);
      }
      
      return remaining;
    });
  }, [settings.soundEnabled]);

  // 2. Complete Event: User clicks button on popup
  const completeCurrentEvent = () => {
    if (!currentEvent) return;

    if (settings.soundEnabled) audioManager.play('success');

    // Visual feedback
    if (characterRef.current) {
      gsap.fromTo(characterRef.current, 
        { scale: 1.5, filter: 'brightness(1.5)' }, 
        { scale: 1, filter: 'brightness(1)', duration: 0.5 }
      );
    }

    setQuote(currentEvent.type === 'OBSTACLE' ? `Overcame: ${currentEvent.title}!` : `Stored Memory: ${currentEvent.title} ✨`);

    // Reset current event
    setCurrentEvent(null);

    // If more in queue, process next after slight delay
    // If queue empty, show age flavor
    if (eventQueue.length > 0) {
        setTimeout(processNextInQueue, 200);
    } else {
        setTimeout(() => {
             if (AGE_FLAVOR[progressRef.current]) {
                 setQuote(AGE_FLAVOR[progressRef.current]);
             }
        }, 1000);
    }
  };

  // 3. The Climb Action
  const climb = useCallback(() => {
    // Constraints
    if (isClimbing || currentEvent || eventQueue.length > 0 || progressRef.current >= MAX_PROGRESS) return;

    const nextAge = progressRef.current + 1;
    
    // START MOVEMENT
    setIsClimbing(true);
    const nextSide = side === 'left' ? 'right' : 'left';
    
    // Update Logic
    setProgress(nextAge); // Update visual number immediately
    progressRef.current = nextAge;
    setSide(nextSide);
    
    if (settings.soundEnabled) audioManager.play('hit');

    // Animation
    if (!settings.reducedMotion && characterRef.current) {
      // Jump
      gsap.to(characterRef.current, {
        y: getTranslateForProgress(nextAge),
        x: (nextSide === 'left' ? 1 : -1) * 30, 
        rotation: (nextSide === 'left' ? -5 : 5),
        duration: 0.6,
        ease: 'back.out(1.2)',
        onComplete: () => {
            // MOVEMENT FINISHED - NOW CHECK FOR EVENTS
            setIsClimbing(false);
            
            // Check for wins
            if (nextAge >= MAX_PROGRESS) {
                updateProgress({ unlockedGifts: true, ladderProgress: MAX_PROGRESS });
                setTimeout(() => setShowCompletion(true), 800);
                return;
            }

            // Check for events
            const newEvents = getEventsForAge(nextAge);
            if (newEvents.length > 0) {
                setEventQueue(newEvents);
                setQueueTotal(newEvents.length);
                // Trigger first event shortly after landing
                setTimeout(processNextInQueue, 100); 
            } else {
                // No events, just show flavor text
                if (AGE_FLAVOR[nextAge]) {
                    setQuote(AGE_FLAVOR[nextAge]);
                    setShowLevelUp(true);
                    setTimeout(() => setShowLevelUp(false), 1000);
                }
            }
        }
      });
      
      // Squish
      gsap.fromTo(characterRef.current.querySelector('.princess-avatar'),
        { scaleY: 0.8, scaleX: 1.2 },
        { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }
      );
    } else {
      // Reduced Motion Fallback
      setIsClimbing(false);
      const newEvents = getEventsForAge(nextAge);
      if (newEvents.length > 0) {
          setEventQueue(newEvents);
          setQueueTotal(newEvents.length);
          processNextInQueue();
      }
    }

  }, [isClimbing, currentEvent, eventQueue, side, settings, getTranslateForProgress, updateProgress, processNextInQueue]);


  /* ------------------------------------------------------------------ */
  /* INPUT HANDLING */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') { 
            e.preventDefault(); 
            if (currentEvent) completeCurrentEvent();
            else climb(); 
        }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [climb, currentEvent, completeCurrentEvent]);

  /* ------------------------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------------------------ */
  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden 
                      bg-gradient-to-b from-indigo-300 via-purple-300 to-pink-300
                      transition-transform duration-100 ${shake ? 'translate-x-1 rotate-1' : ''}`}>
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 right-10 animate-spin-slow opacity-80">
            <Sun className="text-yellow-200 w-32 h-32" />
        </div>
        <CloudPlatform delay={0} top="15%" left="10%" scale={1} />
        <CloudPlatform delay={2} top="40%" left="80%" scale={0.8} />
        <CloudPlatform delay={4} top="70%" left="20%" scale={1.2} />
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIi8+PC9zdmc+')] animate-pan-bg"></div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-20 w-full max-w-2xl px-4 h-full flex flex-col py-6">

        {/* HEADER */}
        <div className="flex-none text-center mb-2">
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white drop-shadow-md stroke-pink-700">
                AFRAH'S JOURNEY
            </h1>
            <div className="inline-block mt-2 bg-white/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/50 shadow-lg transition-all duration-300 hover:scale-105">
                <span className="text-pink-900 font-bold flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                    AGE: <span className="text-2xl min-w-[30px]">{progress}</span> / 20
                </span>
            </div>
        </div>

        {/* FLAVOR TEXT */}
        <div className="h-12 flex items-center justify-center mb-2 z-30">
            <div key={quote} className="animate-pop-in bg-white/95 backdrop-blur text-purple-600 px-6 py-2 rounded-2xl font-bold text-sm sm:text-base shadow-xl border-2 border-purple-100">
                {quote}
            </div>
        </div>

        {/* GAME AREA */}
        <div className="flex-1 relative w-full max-w-md mx-auto min-h-0">
            
            <FloatingCastle />

            {/* LADDER */}
            <div ref={ladderRef} className="absolute left-1/2 -translate-x-1/2 w-32 h-[85%] bottom-0 top-16">
                <div className="absolute left-0 h-full w-3 bg-gradient-to-b from-yellow-200 to-yellow-500 rounded-full shadow-lg border-x border-yellow-600/30" />
                <div className="absolute right-0 h-full w-3 bg-gradient-to-b from-yellow-200 to-yellow-500 rounded-full shadow-lg border-x border-yellow-600/30" />
                
                {Array.from({ length: MAX_PROGRESS }).map((_, i) => (
                    <div key={i} 
                         className={`absolute left-3 right-3 h-4 rounded-md shadow-sm border-b-2 transition-colors duration-500
                                   ${i < progress ? 'bg-pink-400 border-pink-600' : 'bg-white/40 border-white/60'}`}
                         style={{ top: `${(i / (MAX_PROGRESS - 1)) * 95}%` }}
                    />
                ))}
            </div>

            {/* POPUP */}
            {currentEvent && (
                <EventPopup 
                    event={currentEvent} 
                    onComplete={completeCurrentEvent}
                    count={(queueTotal - eventQueue.length) + 1}
                    total={queueTotal}
                />
            )}

            {/* AVATAR */}
            <div ref={characterRef} className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="princess-avatar relative w-24 h-24 transition-transform">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-float-slow">
                        <Crown className="w-8 h-8 text-yellow-400 fill-yellow-200 drop-shadow-md" />
                    </div>
                    <div className="w-full h-full flex items-center justify-center text-6xl drop-shadow-2xl filter hover:brightness-110">
                        👸
                    </div>
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
             <Button
                onClick={currentEvent ? completeCurrentEvent : climb}
                disabled={isClimbing || progress >= MAX_PROGRESS}
                className={`w-full max-w-sm mx-auto h-auto py-5 rounded-3xl text-xl font-black tracking-wide shadow-xl transition-all
                           ${currentEvent 
                               ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 hover:scale-105' 
                               : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:scale-[1.02] border-b-4 border-pink-800 active:border-b-0 active:translate-y-1'
                           } text-white`}
             >
                {progress >= MAX_PROGRESS ? (
                    <span className="flex items-center gap-2"><Trophy /> HAPPY 20TH!</span>
                ) : currentEvent ? (
                    <span className="flex items-center gap-2">
                        {currentEvent.type === 'OBSTACLE' ? '💪 OVERCOME!' : '✨ CELEBRATE!'}
                    </span>
                ) : isClimbing ? (
                     <span>GROWING...</span>
                ) : (
                    <span>GROW UP! (Click)</span>
                )}
             </Button>

             {eventQueue.length > 0 && !currentEvent && (
                <div className="text-center text-white/80 text-sm font-medium animate-pulse">
                    More moments incoming...
                </div>
             )}
        </div>

      </div>

      {/* VICTORY MODAL */}
      {showCompletion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 p-1.5 rounded-[2rem] w-full max-w-sm shadow-2xl animate-bounce-in">
              <div className="bg-white rounded-[1.8rem] p-8 text-center border-4 border-pink-200">
                  <div className="text-7xl mb-4 animate-bounce">🎂</div>
                  <h2 className="text-3xl font-black text-pink-600 mb-2">HAPPY 20TH AFRAH!</h2>
                  <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                      You've navigated 20 years of life, laughter, and challenges. Here's to the next chapter!
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
