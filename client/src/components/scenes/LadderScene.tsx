import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { 
  Trophy, Cloud, Sun, Castle, Crown, Heart, Zap, 
  BookOpen, GraduationCap, Plane, HeartCrack, Mountain, 
  Cat, Music, Star, Gift, PartyPopper, School, Home,
  Award, Coffee, Users, Book, ArrowLeft, Check, Cake
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 1. DATA & CONSTANTS (KEPT IDENTICAL) */
/* ------------------------------------------------------------------ */

const AGE_FLAVOR: Record<number, string> = {
  0: "Welcome to the world! 👶",
  1: "Learning to walk! 🚶‍♀️",
  2: "Tiny human with big opinions 👑",
  3: "Welcome Maryam Ghazi💖",
  4: "Kindergarten, here I come! 🎒",
  5: "Fancy stationary and keychain items💅",
  6: "7",
  7: "Thala For A Reason",
  8: "Welcome Zahida Bint Ghazi💖",
  9: "Showing glimpses of greatness already😻",
  10: "DOUBLE DIGITS CLUB! 🔟",
  11: "Tween life activated 💅",
  12: "Middle school mode 🏫",
  13: "We crossing oceans baby! ✈️",
  14: "Bihari Blood embedded 📚",
  15: "COVID ERA 🐼",
  16: "Locked in for 10th Boards",
  17: "JEETARD ERA 🎓",
  18: "ADULTINGGGGG????!!!!! 🧺",
  19: "#UNI_LYF begins 🏛️",
  20: "NO MORE A TEENAGER 👑"
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
  tags: string[];
}

const LIFE_EVENTS_DB: LifeEvent[] = [
  // --- CHILDHOOD (0-12) ---
  {
    id: 'first-day-school',
    type: 'OBSTACLE',
    title: "First Day of School",
    description: "Crying at the gate with a backpack bigger than me...",
    buttonText: "Be Brave! 🦁",
    icon: BookOpen,
    color: "bg-blue-500",
    age: 4,
    priority: 1,
    tags: ['school', 'milestone']
  },
  {
    id: 'maryam-birth',
    type: 'MEMORY',
    title: "DNA ROOMIE 1 IS BORNNN",
    description: "SHES JUST LIKE ME FR FR",
    buttonText: "Welcome Maryammmm💕",
    icon: Heart,
    color: "bg-purple-400",
    age: 3,
    priority: 1,
    tags: ['achievement', 'school']
  },
   {
    id: 'zahida-birth',
    type: 'MEMORY',
    title: "DNA ROOMIE 2 IS HEREE!!",
    description: "SHES A DIVA, AN ARTIST📸",
    buttonText: "Welcome Zahida",
    icon: Heart,
    color: "bg-purple-400",
    age: 8,
    priority: 1,
    tags: ['achievement', 'school']
  },
  {
    id: 'aapi-wedding',
    type: 'MEMORY',
    title: "Aapi's Destination Wedding",
    description: "Once in a lifetime experience every single day 💍",
    buttonText: "Best Week Ever! ✨",
    icon: Heart,
    color: "bg-pink-500",
    age: 11,
    priority: 1,
    tags: ['family', 'travel', 'celebration']
  },
  {
    id: 'jebel-jais-trip',
    type: 'MEMORY',
    title: "Jebel Jais Road Trip",
    description: "Freezing at the top of UAE's highest peak! 🏔️",
    buttonText: "Mountain Lover 🌄",
    icon: Mountain,
    color: "bg-teal-500",
    age: 12,
    priority: 1,
    tags: ['travel', 'adventure']
  },

  // --- TEENAGE YEARS (13-19) ---
  {
    id: 'moving-countries',
    type: 'OBSTACLE',
    title: "Moving Countries",
    description: "Goodbye to my beloved birthplace, my room, my friends, my comfort zone..:(",
    buttonText: "Adapt ✈️",
    icon: Plane,
    color: "bg-indigo-600",
    age: 13,
    priority: 2,
    tags: ['change', 'emotional']
  },
  {
    id: 'new-school-anxiety',
    type: 'OBSTACLE',
    title: "New School, New Anxiety",
    description: "First day at a new school where everyone already has friends...",
    buttonText: "Make New Friends! 👋",
    icon: School,
    color: "bg-orange-500",
    age: 13,
    priority: 1,
    tags: ['school', 'social']
  },
  {
    id: 'messi-leaves',
    type: 'OBSTACLE',
    title: "Messi Leaves Barcelona",
    description: "NOOOOO MY GOATTTT IM CRYINGGGG 💔",
    buttonText: "Stay Loyal💙",
    icon: HeartCrack,
    color: "bg-red-500",
    age: 14,
    priority: 1,
    tags: ['sports', 'emotional']
  },
  {
    id: 'billie-grammy',
    type: 'MEMORY',
    title: "Billie Eilish Grammy Win",
    description: "MY QUEEN WON EVERYTHING!!!",
    buttonText: "SLAYYYY💅💅💅",
    icon: Music,
    color: "bg-green-500",
    age: 14,
    priority: 2,
    tags: ['music', 'achievement']
  },
  {
    id: 'english-99',
    type: 'MEMORY',
    title: "99/100 in English",
    description: "When the teacher thought you cheated but you're just THAT good 📝",
    buttonText: "Absolute Genius 🧠",
    icon: Star,
    color: "bg-yellow-500",
    age: 16,
    priority: 2,
    tags: ['academic', 'achievement']
  },
  {
    id: 'messi-world-cup',
    type: 'MEMORY',
    title: "Messi Wins World Cup",
    description: "CRYING, SCREAMING, HE COMPLETED FOOTBALL! 🐐",
    buttonText: "GOAT STATUS! 🇦🇷",
    icon: Trophy,
    color: "bg-sky-500",
    age: 16,
    priority: 1,
    tags: ['sports', 'celebration']
  },
  {
    id: 'competitive-exams',
    type: 'OBSTACLE',
    title: "The JEE Grind",
    description: "Wholenights, redbulls and panic attacks.",
    buttonText: "Lock In!🎯",
    icon: Zap,
    color: "bg-purple-700",
    age: 17,
    priority: 2,
    tags: ['academic', 'stress']
  },
  {
    id: 'college-acceptance',
    type: 'MEMORY',
    title: "College Acceptance Letter",
    description: "That email that made all the stress worth it! 🎉",
    buttonText: "We Did It! 🎓",
    icon: Award,
    color: "bg-violet-500",
    age: 19,
    priority: 3,
    tags: ['academic', 'achievement']
  },
  {
    id: 'adopt-pets',
    type: 'MEMORY',
    title: "Luna & Simba Homecoming",
    description: "The day my heart grew 3 sizes!🐱🐾",
    buttonText: "Furever in my heart! 💕",
    icon: Cat,
    color: "bg-orange-400",
    age: 18,
    priority: 1,
    tags: ['family', 'pets']
  },
  {
    id: 'moving-out',
    type: 'OBSTACLE',
    title: "Moving Out for College",
    description: "Packing my life into suitcases. New Chapter awaits!",
    buttonText: "Bangalore Here I COMEEE!! 🧳",
    icon: Home,
    color: "bg-rose-500",
    age: 19,
    priority: 2,
    tags: ['change', 'adulting']
  },
  {
    id: 'amarah-mom',
    type: 'MEMORY',
    title: "GRANDMA MOMENT",
    description: "THATS A LITERAL BABYYYYY AAAAAAAAA",
    buttonText: "ALHUMDULILLAH😭💕",
    icon: Cat,
    color: "bg-cyan-500",
    age: 19,
    priority: 4,
    tags: ['friends', 'social']
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
/* 2. VISUAL COMPONENTS */
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

// Styled Event Popup
const EventPopup = ({ event, onComplete }: { event: LifeEvent, onComplete: () => void }) => {
  const [showConfetti, setShowConfetti] = useState(event.type === 'MEMORY');

  const handleClick = () => {
    onComplete();
  };

  return (
    <>
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-40">
          <Confetti 
            recycle={false} 
            numberOfPieces={event.type === 'MEMORY' ? 100 : 30}
            gravity={0.3} 
            colors={event.type === 'MEMORY' ? ['#FFD700', '#FF69B4', '#FFFFFF'] : ['#FFFFFF', '#FF6B6B']}
          />
        </div>
      )}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 animate-bounce-in">
        <div className={`${event.color} text-white p-1.5 rounded-3xl shadow-2xl ${event.type === 'OBSTACLE' ? '-rotate-2' : 'rotate-2'}`}>
          <div className="bg-white text-gray-800 rounded-[20px] p-5 text-center border-4 border-dashed border-white/50">
            
            {/* Icon Bubble */}
            <div className="flex justify-center mb-3">
              <div className={`p-3 rounded-full ${event.color} bg-opacity-20`}>
                <event.icon className={`w-10 h-10 ${event.color.replace('bg-', 'text-')}`} />
              </div>
            </div>

            {/* Title */}
            <h3 className={`font-black text-xl uppercase mb-1 leading-tight ${event.type === 'OBSTACLE' ? 'text-red-600' : 'text-purple-600'}`}>
              {event.type === 'MEMORY' && (
                <span className="block text-xs text-yellow-500 mb-1">
                  ✨ MEMORY UNLOCKED ✨
                </span>
              )}
              {event.type === 'OBSTACLE' && (
                <span className="block text-xs text-red-500 mb-1">
                  🚧 CHALLENGE AHEAD 🚧
                </span>
              )}
              {event.title}
            </h3>
            
            {/* Age Badge */}
            <div className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
              Age {event.age}
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mb-5 font-medium leading-snug">
              {event.description}
            </p>
            
            {/* Action Button */}
            <Button 
              onClick={handleClick}
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
/* 3. MAIN SCENE */
/* ------------------------------------------------------------------ */

export function LadderScene() {
  const { updateProgress, settings, navigateTo } = useSceneStore();

  // STATE
  const [progress, setProgress] = useState(0); 
  const [isClimbing, setIsClimbing] = useState(false);
  const [eventQueue, setEventQueue] = useState<LifeEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);
  const [side, setSide] = useState<'left' | 'right'>('left');
  
  // Visual states
  const [shake, setShake] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [quote, setQuote] = useState(AGE_FLAVOR[0] || "Journey to 20 Begins! ✨");

  // Refs
  const characterRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const eventQueueRef = useRef<LifeEvent[]>([]);

  // Geometry Setup
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
    eventQueueRef.current = [];
    setCurrentEvent(null);
    setQuote(AGE_FLAVOR[0] || "Journey to 20 Begins! ✨");
    updateProgress({ ladderProgress: 0, unlockedGifts: false });
  }, [updateProgress]);

  // Event Queue Processing
  const processEventQueue = useCallback(() => {
    if (currentEvent || eventQueueRef.current.length === 0) return;
    
    const nextEvent = eventQueueRef.current[0];
    setCurrentEvent(nextEvent);
    
    if (settings.soundEnabled) {
      if (nextEvent.type === 'OBSTACLE') {
        audioManager.play('hit');
      } else {
        audioManager.play('success');
      }
    }
    
    if (nextEvent.type === 'OBSTACLE') {
      triggerShake();
    }
  }, [currentEvent, settings.soundEnabled]);

  const completeCurrentEvent = useCallback(() => {
    if (!currentEvent) return;
    
    if (settings.soundEnabled) audioManager.play('success');
    
    // Power-up effect
    if (characterRef.current) {
      gsap.fromTo(characterRef.current, 
        { scale: 1.5, filter: 'brightness(1.5)' }, 
        { scale: 1, filter: 'brightness(1)', duration: 0.5 }
      );
    }
    
    if (currentEvent.type === 'OBSTACLE') {
      setQuote(`Overcame: ${currentEvent.title}! 💪`);
    } else {
      setQuote(`Celebrating: ${currentEvent.title}! ✨`);
    }
    
    eventQueueRef.current = eventQueueRef.current.slice(1);
    setEventQueue(eventQueueRef.current);
    setCurrentEvent(null);
    
    setTimeout(() => {
      if (eventQueueRef.current.length === 0 && AGE_FLAVOR[progressRef.current]) {
        setQuote(AGE_FLAVOR[progressRef.current]);
      }
    }, 1500);
    
    setTimeout(processEventQueue, 100);
  }, [currentEvent, processEventQueue, settings.soundEnabled]);

  useEffect(() => {
    eventQueueRef.current = eventQueue;
  }, [eventQueue]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  const climb = useCallback(() => {
    if (isClimbing || currentEvent || progressRef.current >= MAX_PROGRESS) return;

    const currentAge = progressRef.current;
    const nextAge = currentAge + 1;

    setProgress(nextAge);
    progressRef.current = nextAge;

    const eventsAtAge = getEventsForAge(nextAge);
    if (eventsAtAge.length > 0) {
      eventQueueRef.current = [...eventQueueRef.current, ...eventsAtAge];
      setEventQueue(eventQueueRef.current);
    } else {
      if (AGE_FLAVOR[nextAge]) {
        setQuote(AGE_FLAVOR[nextAge]);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 1000);
      }
    }

    setIsClimbing(true);
    const nextSide = side === 'left' ? 'right' : 'left';
    setSide(nextSide);

    if (settings.soundEnabled) audioManager.play('hit');

    if (!settings.reducedMotion && characterRef.current) {
      // Jump Arc
      gsap.to(characterRef.current, {
        y: getTranslateForProgress(nextAge),
        x: (nextSide === 'left' ? 1 : -1) * 30, 
        rotation: (nextSide === 'left' ? -5 : 5),
        duration: 0.5,
        ease: 'back.out(1.4)',
        onComplete: () => {
          setIsClimbing(false);
          if (eventsAtAge.length > 0) {
            setTimeout(processEventQueue, 100);
          }
        }
      });
      
      // Avatar Squish Animation (Roblox/Cartoon style)
      gsap.fromTo(characterRef.current.querySelector('.princess-avatar'),
        { scaleY: 0.8, scaleX: 1.2 },
        { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }
      );
    } else {
      setIsClimbing(false);
      if (eventsAtAge.length > 0) {
        setTimeout(processEventQueue, 100);
      }
    }

    if (nextAge >= MAX_PROGRESS) {
      updateProgress({ unlockedGifts: true, ladderProgress: MAX_PROGRESS });
      setTimeout(() => setShowCompletion(true), 1200);
    }
  }, [isClimbing, currentEvent, side, settings, getTranslateForProgress, updateProgress, processEventQueue]);

  // Check queue
  useEffect(() => {
    if (!currentEvent && eventQueue.length > 0) {
      processEventQueue();
    }
  }, [eventQueue, currentEvent, processEventQueue]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showCompletion) return;
      
      if (currentEvent) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          completeCurrentEvent();
        }
        return;
      }
      
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        climb();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [climb, currentEvent, completeCurrentEvent, showCompletion]);

  /* ------------------------------------------------------------------ */
  /* 4. RENDER */
  /* ------------------------------------------------------------------ */

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

      {/* --- EVENT QUEUE INDICATOR --- */}
      {eventQueue.length > 0 && !currentEvent && (
        <div className="absolute top-4 right-4 z-30 animate-pulse">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-purple-200">
            <span className="text-purple-600 font-bold text-sm flex items-center gap-1">
              <Book className="w-4 h-4" />
              {eventQueue.length} event{eventQueue.length !== 1 ? 's' : ''} queued
            </span>
          </div>
        </div>
      )}

      {/* --- MAIN UI CONTAINER --- */}
      <div className="relative z-20 w-full max-w-2xl px-4 h-full flex flex-col py-6">

        {/* HEADER */}
        <div className="flex-none text-center mb-2">
          <h1 className="text-3xl sm:text-5xl font-display font-black text-white drop-shadow-md stroke-pink-700">
           🎈 ONE TWO...   TWENTYYY 🎈
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

          {/* --- EVENT POPUP --- */}
          {currentEvent && (
            <EventPopup 
              event={currentEvent}
              onComplete={completeCurrentEvent}
            />
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
            onClick={currentEvent ? completeCurrentEvent : climb}
            disabled={isClimbing || progress >= MAX_PROGRESS}
            className={`w-full max-w-sm mx-auto h-auto py-5 rounded-3xl text-xl font-black tracking-wide shadow-xl transition-all
                        ${currentEvent 
                           ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500' 
                           : isClimbing
                             ? 'bg-gray-400 cursor-not-allowed opacity-50'
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
              <span>Climbing... 🧗‍♀️</span>
            ) : (
              <span>GROW UP! (Click or Space)</span>
            )}
          </Button>
          
          {/* Queue Info */}
          {eventQueue.length > 0 && !currentEvent && (
            <div className="text-center text-sm text-white/80 font-medium animate-pulse">
              {eventQueue.length} event{eventQueue.length !== 1 ? 's' : ''} queued at age {progress}
            </div>
          )}
        </div>

      </div>

      {/* --- VICTORY MODAL & FINAL DECISION --- */}
      {showCompletion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
          {/* CELEBRATION EFFECTS */}
          <Confetti 
            width={window.innerWidth} 
            height={window.innerHeight} 
            recycle={true}
            numberOfPieces={400}
            gravity={0.2}
          />
          
          {/* MODAL CONTENT */}
          <div className="relative z-[110] bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 p-1.5 rounded-[2rem] w-full max-w-sm shadow-2xl animate-bounce-in mx-4">
            <div className="bg-white rounded-[1.8rem] p-8 text-center border-4 border-pink-200">
              
              {/* Animated Big Icon */}
              <div className="text-8xl mb-4 animate-bounce filter drop-shadow-lg">🎂</div>
              
              {/* Header */}
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-4 tracking-tight">
                HAPPY 20TH!
              </h2>
              
              {/* Question */}
              <p className="text-xl text-gray-700 font-bold mb-8 leading-relaxed">
                You've made it so far Afrah. Everyone is proud of you. Alhumdulillah for this Journey!!
                <br/>
                <span className="text-pink-600 block mt-2 text-2xl">Shall we cut the cake next?</span>
              </p>
              
              {/* Decision Buttons */}
              <div className="flex flex-col gap-3">
                
                {/* Option 1: YES - Go to CakeScene */}
                <Button 
                  onClick={() => navigateTo('cake')}
                  className="w-full bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-black rounded-2xl py-6 text-xl shadow-lg transform transition hover:scale-105 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Sure, yes! <Cake className="w-6 h-6 group-hover:rotate-12 transition-transform"/>
                  </span>
                </Button>

                {/* Option 2: NO - Go back to RoomScene */}
                <Button 
                  onClick={() => navigateTo('room')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold rounded-2xl py-4 text-base shadow-sm transform transition hover:scale-100"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4"/> No, Go Back
                  </span>
                </Button>

              </div>
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
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
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
