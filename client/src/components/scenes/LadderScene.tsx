import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import gsap from 'gsap';
import Confetti from 'react-confetti';
import { 
  Trophy, Cloud, Sun, Castle, Crown, Heart, Zap, 
  BookOpen, Plane, HeartCrack, Mountain, 
  Cat, Music, Star, School, Home,
  Award, Book, ArrowLeft, Cake, Sparkles
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 1. DATA & CONSTANTS (Unchanged text/logic) */
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
  { id: 'first-day-school', type: 'OBSTACLE', title: "First Day of School", description: "Crying at the gate with a backpack bigger than me...", buttonText: "Be Brave! 🦁", icon: BookOpen, color: "bg-blue-500", age: 4, priority: 1, tags: ['school'] },
  { id: 'maryam-birth', type: 'MEMORY', title: "DNA ROOMIE 1 IS BORNNN", description: "SHES JUST LIKE ME FR FR", buttonText: "Welcome Maryammmm💕", icon: Heart, color: "bg-purple-400", age: 3, priority: 1, tags: ['family'] },
  { id: 'zahida-birth', type: 'MEMORY', title: "DNA ROOMIE 2 IS HEREE!!", description: "SHES A DIVA, AN ARTIST📸", buttonText: "Welcome Zahida", icon: Heart, color: "bg-purple-400", age: 8, priority: 1, tags: ['family'] },
  { id: 'aapi-wedding', type: 'MEMORY', title: "Aapi's Destination Wedding", description: "Once in a lifetime experience every single day 💍", buttonText: "Best Week Ever! ✨", icon: Heart, color: "bg-pink-500", age: 11, priority: 1, tags: ['family'] },
  { id: 'jebel-jais-trip', type: 'MEMORY', title: "Jebel Jais Road Trip", description: "Freezing at the top of UAE's highest peak! 🏔️", buttonText: "Mountain Lover 🌄", icon: Mountain, color: "bg-teal-500", age: 12, priority: 1, tags: ['travel'] },
  { id: 'moving-countries', type: 'OBSTACLE', title: "Moving Countries", description: "Goodbye to my beloved birthplace, my room, my friends, my comfort zone..:(", buttonText: "Adapt ✈️", icon: Plane, color: "bg-indigo-600", age: 13, priority: 2, tags: ['change'] },
  { id: 'new-school-anxiety', type: 'OBSTACLE', title: "New School, New Anxiety", description: "First day at a new school where everyone already has friends...", buttonText: "Make New Friends! 👋", icon: School, color: "bg-orange-500", age: 13, priority: 1, tags: ['school'] },
  { id: 'messi-leaves', type: 'OBSTACLE', title: "Messi Leaves Barcelona", description: "NOOOOO MY GOATTTT IM CRYINGGGG 💔", buttonText: "Stay Loyal💙", icon: HeartCrack, color: "bg-red-500", age: 14, priority: 1, tags: ['sports'] },
  { id: 'billie-grammy', type: 'MEMORY', title: "Billie Eilish Grammy Win", description: "MY QUEEN WON EVERYTHING!!!", buttonText: "SLAYYYY💅💅💅", icon: Music, color: "bg-green-500", age: 14, priority: 2, tags: ['music'] },
  { id: 'english-99', type: 'MEMORY', title: "99/100 in English", description: "When the teacher thought you cheated but you're just THAT good 📝", buttonText: "Absolute Genius 🧠", icon: Star, color: "bg-yellow-500", age: 16, priority: 2, tags: ['academic'] },
  { id: 'messi-world-cup', type: 'MEMORY', title: "Messi Wins World Cup", description: "CRYING, SCREAMING, HE COMPLETED FOOTBALL! 🐐", buttonText: "GOAT STATUS! 🇦🇷", icon: Trophy, color: "bg-sky-500", age: 16, priority: 1, tags: ['sports'] },
  { id: 'competitive-exams', type: 'OBSTACLE', title: "The JEE Grind", description: "Wholenights, redbulls and panic attacks.", buttonText: "Lock In!🎯", icon: Zap, color: "bg-purple-700", age: 17, priority: 2, tags: ['academic'] },
  { id: 'college-acceptance', type: 'MEMORY', title: "College Acceptance Letter", description: "That email that made all the stress worth it! 🎉", buttonText: "We Did It! 🎓", icon: Award, color: "bg-violet-500", age: 19, priority: 3, tags: ['academic'] },
  { id: 'adopt-pets', type: 'MEMORY', title: "Luna & Simba Homecoming", description: "The day my heart grew 3 sizes!🐱🐾", buttonText: "Furever in my heart! 💕", icon: Cat, color: "bg-orange-400", age: 18, priority: 1, tags: ['pets'] },
  { id: 'moving-out', type: 'OBSTACLE', title: "Moving Out for College", description: "Packing my life into suitcases. New Chapter awaits!", buttonText: "Bangalore Here I COMEEE!! 🧳", icon: Home, color: "bg-rose-500", age: 19, priority: 2, tags: ['change'] },
  { id: 'amarah-mom', type: 'MEMORY', title: "GRANDMA MOMENT", description: "THATS A LITERAL BABYYYYY AAAAAAAAA", buttonText: "ALHUMDULILLAH😭💕", icon: Cat, color: "bg-cyan-500", age: 19, priority: 4, tags: ['friends'] }
];

const getEventsForAge = (age: number): LifeEvent[] => {
  return LIFE_EVENTS_DB.filter(event => event.age === age).sort((a, b) => b.priority - a.priority);
};

const MAX_PROGRESS = 20;

/* ------------------------------------------------------------------ */
/* 2. ENHANCED VISUAL COMPONENTS */
/* ------------------------------------------------------------------ */

const RobloxButton = ({ onClick, children, className, disabled, variant = "primary" }: any) => {
  const colors = {
    primary: "bg-[#00B2FF] border-[#0085BF] hover:bg-[#00C2FF]",
    success: "bg-[#00E676] border-[#00C853] hover:bg-[#00F47B]",
    danger: "bg-[#FF5252] border-[#D50000] hover:bg-[#FF6E6E]",
    neutral: "bg-[#BDBDBD] border-[#9E9E9E]"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-4 rounded-2xl font-black text-white uppercase tracking-wider
        border-b-[6px] active:border-b-0 active:translate-y-[6px] 
        transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none
        text-shadow-sm flex items-center justify-center gap-2
        ${(colors as any)[variant]} ${className}
      `}
    >
      {children}
    </button>
  );
};

const EventPopup = ({ event, onComplete }: { event: LifeEvent, onComplete: () => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`
        relative w-full max-w-sm rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)]
        ${event.type === 'OBSTACLE' ? 'bg-[#FF5252]' : 'bg-[#7C4DFF]'}
      `}>
        <div className="bg-white rounded-[2rem] p-6 text-center border-4 border-white/20">
          <div className={`
            w-20 h-20 mx-auto -mt-16 mb-4 rounded-3xl flex items-center justify-center shadow-lg transform rotate-12
            ${event.color} border-4 border-white
          `}>
            <event.icon className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-black text-gray-800 uppercase leading-tight mb-2">
            {event.title}
          </h3>
          
          <div className="inline-block px-4 py-1 rounded-full bg-gray-100 text-gray-500 font-bold text-xs mb-4">
            LEVEL {event.age}
          </div>

          <p className="text-gray-600 font-medium mb-6 leading-relaxed">
            {event.description}
          </p>

          <RobloxButton 
            variant={event.type === 'OBSTACLE' ? 'danger' : 'success'} 
            className="w-full" 
            onClick={onComplete}
          >
            {event.buttonText}
          </RobloxButton>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 3. MAIN SCENE */
/* ------------------------------------------------------------------ */

export function LadderScene() {
  const { updateProgress, settings, navigateTo } = useSceneStore();
  const [progress, setProgress] = useState(0);
  const [isClimbing, setIsClimbing] = useState(false);
  const [eventQueue, setEventQueue] = useState<LifeEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);
  const [side, setSide] = useState<'left' | 'right'>('left');
  const [quote, setQuote] = useState(AGE_FLAVOR[0]);
  const [showCompletion, setShowCompletion] = useState(false);

  const characterRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  // Geometry
  const [maxTranslateY, setMaxTranslateY] = useState(0);
  const stepSize = maxTranslateY / MAX_PROGRESS;

  useLayoutEffect(() => {
    const update = () => {
      const h = ladderRef.current?.clientHeight || 0;
      setMaxTranslateY(h - 80);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const processEventQueue = useCallback(() => {
    if (currentEvent || eventQueue.length === 0) return;
    const next = eventQueue[0];
    setCurrentEvent(next);
    if (settings.soundEnabled) audioManager.play(next.type === 'OBSTACLE' ? 'hit' : 'success');
  }, [currentEvent, eventQueue, settings.soundEnabled]);

  const completeCurrentEvent = useCallback(() => {
    if (!currentEvent) return;
    setQuote(currentEvent.type === 'OBSTACLE' ? `COMPLETED: ${currentEvent.title}!` : `MEMORIZED: ${currentEvent.title}!`);
    setEventQueue(prev => prev.slice(1));
    setCurrentEvent(null);
    if (settings.soundEnabled) audioManager.play('success');
  }, [currentEvent, settings.soundEnabled]);

  const climb = useCallback(() => {
    if (isClimbing || currentEvent || progress >= MAX_PROGRESS) return;

    const nextAge = progress + 1;
    setProgress(nextAge);
    progressRef.current = nextAge;

    const events = getEventsForAge(nextAge);
    setIsClimbing(true);
    const nextSide = side === 'left' ? 'right' : 'left';
    setSide(nextSide);

    if (settings.soundEnabled) audioManager.play('hit');

    // Roblox-style Jump Animation
    gsap.to(characterRef.current, {
      y: -(nextAge * stepSize),
      x: nextSide === 'left' ? -20 : 20,
      rotation: nextSide === 'left' ? -10 : 10,
      duration: 0.4,
      ease: "back.out(1.7)",
      onComplete: () => {
        setIsClimbing(false);
        if (events.length > 0) setEventQueue(prev => [...prev, ...events]);
        else setQuote(AGE_FLAVOR[nextAge] || quote);
        
        if (nextAge >= MAX_PROGRESS) {
          updateProgress({ unlockedGifts: true, ladderProgress: MAX_PROGRESS });
          setTimeout(() => setShowCompletion(true), 800);
        }
      }
    });

    // Squash effect
    gsap.fromTo(".avatar-body", 
      { scaleY: 0.7, scaleX: 1.3 }, 
      { scaleY: 1, scaleX: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" }
    );
  }, [isClimbing, currentEvent, progress, side, stepSize, quote, settings.soundEnabled, updateProgress]);

  useEffect(() => { processEventQueue(); }, [eventQueue, processEventQueue]);

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-[#87CEEB] overflow-hidden font-sans">
      
      {/* ROBLOX BACKGROUND DECO */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,transparent_70%)] animate-pulse" />
        <Cloud className="absolute top-[10%] left-[10%] w-24 h-24 text-white/60" />
        <Cloud className="absolute top-[30%] right-[15%] w-32 h-32 text-white/40" />
        <Sun className="absolute top-10 left-10 w-20 h-20 text-yellow-300 animate-spin-slow" />
      </div>

      {/* TOP HUD */}
      <div className="relative z-10 w-full p-6 flex flex-col items-center">
        <h1 className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] uppercase">
          Step Up To 20!
        </h1>
        <div className="mt-4 flex gap-4">
          <div className="bg-black/20 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white/50 flex items-center gap-2 shadow-xl">
             <Crown className="text-yellow-400 fill-yellow-400 w-5 h-5" />
             <span className="text-white font-black text-xl">AGE: {progress}</span>
          </div>
        </div>
      </div>

      {/* GAME TRACK */}
      <div className="flex-1 relative w-full max-w-md">
        {/* The Castle Finish Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80">
          <Castle className="w-32 h-32 text-white drop-shadow-2xl" />
        </div>

        {/* The Ladder (Roblox Truss style) */}
        <div ref={ladderRef} className="absolute inset-y-20 left-1/2 -translate-x-1/2 w-24">
          {/* Main Rails */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-[#616161] rounded-full border-r-4 border-black/20" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-[#616161] rounded-full border-l-4 border-black/20" />
          
          {/* Truss Steps */}
          {Array.from({ length: MAX_PROGRESS + 1 }).map((_, i) => (
            <div 
              key={i} 
              className={`absolute left-0 right-0 h-4 border-y-2 border-black/10 transition-colors
                ${i <= progress ? 'bg-[#FF4081]' : 'bg-[#E0E0E0]'}
              `}
              style={{ bottom: `${(i / MAX_PROGRESS) * 100}%` }}
            />
          ))}
        </div>

        {/* CHARACTER POD */}
        <div ref={characterRef} className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30">
          <div className="avatar-body relative group">
            {/* Name Tag */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded text-white text-[10px] font-bold whitespace-nowrap border border-white/20 uppercase">
              Afrah [Lv.{progress}]
            </div>
            {/* Aura Effect */}
            <div className="absolute inset-0 bg-white/50 blur-2xl rounded-full scale-150 animate-pulse" />
            <div className="relative text-7xl filter drop-shadow-[0_5px_0_rgba(0,0,0,0.3)]">
              👸
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="relative z-40 w-full p-6 bg-gradient-to-t from-black/20 to-transparent">
        <div className="max-w-xs mx-auto flex flex-col gap-3">
          <div className="bg-white/90 p-3 rounded-2xl shadow-lg border-2 border-pink-200 text-center animate-bounce-in">
             <p className="text-pink-600 font-black text-sm uppercase tracking-tight italic">
               "{quote}"
             </p>
          </div>
          
          <RobloxButton 
            onClick={climb} 
            disabled={isClimbing || !!currentEvent || progress >= MAX_PROGRESS}
            className="w-full text-2xl h-20"
          >
            {progress >= MAX_PROGRESS ? "WINNER!" : "CLIMB! [Space]"}
          </RobloxButton>
        </div>
      </div>

      {/* EVENT OVERLAY */}
      {currentEvent && <EventPopup event={currentEvent} onComplete={completeCurrentEvent} />}

      {/* FINAL VICTORY SCREEN */}
      {showCompletion && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#7C4DFF] animate-fade-in">
          <Confetti gravity={0.1} numberOfPieces={300} />
          <div className="text-center p-8">
            <div className="relative inline-block mb-8">
               <div className="absolute inset-0 bg-white blur-3xl rounded-full opacity-50 animate-pulse" />
               <Cake className="w-32 h-32 text-white relative animate-bounce" />
            </div>
            <h2 className="text-5xl font-black text-white uppercase italic mb-4 drop-shadow-xl">
              Level 20 Reached!
            </h2>
            <p className="text-white/90 text-xl font-bold mb-10 max-w-sm">
              You've made it so far Afrah. Everyone is proud of you. Alhumdulillah for this Journey!!
            </p>
            
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <RobloxButton variant="success" onClick={() => navigateTo('cake')} className="py-6 text-2xl">
                LETS CUT CAKE! <Sparkles />
              </RobloxButton>
              <button 
                onClick={() => navigateTo('room')}
                className="text-white/70 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors"
              >
                Go Back to Room
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .text-shadow-sm { text-shadow: 0 2px 0 rgba(0,0,0,0.2); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
}
