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
  Award, Coffee, Users, Book, ArrowLeft, Cake, Sparkles
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 1. DATA & CONSTANTS */
/* ------------------------------------------------------------------ */

const AGE_FLAVOR: Record<number, string> = {
  0: "Welcome to the world! 👶",
  1: "Learning to walk! 🚶‍♀️",
  2: "Tiny human with big opinions 👑",
  3: "Preschool era begins 🎨",
  4: "Kindergarten, here I come! 🎒",
  5: "Welcome Maryam Ghazi🎈",
  6: "First grade boss energy 📚",
  7: "Thala For A Reason",
  8: "Reading, writing, vibing 📖",
  9: "Welcome Zahida Bint Ghazi ✨",
  10: "DOUBLE DIGITS CLUB! 🔟",
  11: "Tween life activated 💅",
  12: "Middle school mode 🏫",
  13: "New country energy! ✈️",
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
  { id: 'maryam-birth', type: 'MEMORY', title: "DNA ROOMIE 1 IS BORNNN", description: "SHES JUST LIKE ME FR FR", buttonText: "Welcome Maryammmm💕", icon: Heart, color: "bg-purple-400", age: 5, priority: 1, tags: ['family'] },
  { id: 'zahida-birth', type: 'MEMORY', title: "DNA ROOMIE 2 IS HEREE!!", description: "SHES A DIVA, AN ARTIST📸", buttonText: "Welcome Zahida", icon: Heart, color: "bg-purple-400", age: 9, priority: 1, tags: ['family'] },
  { id: 'aapi-wedding', type: 'MEMORY', title: "Aapi's Destination Wedding", description: "Once in a lifetime experience every single day 💍", buttonText: "Best Week Ever! ✨", icon: Heart, color: "bg-pink-500", age: 11, priority: 1, tags: ['celebration'] },
  { id: 'jebel-jais-trip', type: 'MEMORY', title: "Jebel Jais Road Trip", description: "Freezing at the top of UAE's highest peak! 🏔️", buttonText: "Mountain Lover 🌄", icon: Mountain, color: "bg-teal-500", age: 12, priority: 1, tags: ['adventure'] },
  { id: 'moving-countries', type: 'OBSTACLE', title: "Moving Countries", description: "Goodbye birthplace, my room, and my comfort zone..:(", buttonText: "Adapt ✈️", icon: Plane, color: "bg-indigo-600", age: 13, priority: 2, tags: ['change'] },
  { id: 'new-school-anxiety', type: 'OBSTACLE', title: "New School Anxiety", description: "First day where everyone already has friends...", buttonText: "Make New Friends! 👋", icon: School, color: "bg-orange-500", age: 13, priority: 1, tags: ['school'] },
  { id: 'messi-leaves', type: 'OBSTACLE', title: "Messi Leaves Barcelona", description: "NOOOOO MY GOATTTT IM CRYINGGGG 💔", buttonText: "Stay Loyal💙", icon: HeartCrack, color: "bg-red-500", age: 14, priority: 1, tags: ['sports'] },
  { id: 'billie-grammy', type: 'MEMORY', title: "Billie Eilish Grammy Win", description: "MY QUEEN WON EVERYTHING!!!", buttonText: "SLAYYYY💅💅💅", icon: Music, color: "bg-green-500", age: 14, priority: 2, tags: ['music'] },
  { id: 'english-99', type: 'MEMORY', title: "99/100 in English", description: "When the teacher thought you cheated but you're just THAT good 📝", buttonText: "Absolute Genius 🧠", icon: Star, color: "bg-yellow-500", age: 16, priority: 2, tags: ['academic'] },
  { id: 'messi-world-cup', type: 'MEMORY', title: "Messi Wins World Cup", description: "CRYING, SCREAMING, HE COMPLETED FOOTBALL! 🐐", buttonText: "GOAT STATUS! 🇦🇷", icon: Trophy, color: "bg-sky-500", age: 16, priority: 1, tags: ['sports'] },
  { id: 'competitive-exams', type: 'OBSTACLE', title: "The JEE Grind", description: "Wholenights, redbulls and panic attacks.", buttonText: "Lock In! 🎯", icon: Zap, color: "bg-purple-700", age: 17, priority: 2, tags: ['academic'] },
  { id: 'college-acceptance', type: 'MEMORY', title: "College Acceptance", description: "That email that made all the stress worth it! 🎉", buttonText: "We Did It! 🎓", icon: Award, color: "bg-violet-500", age: 19, priority: 3, tags: ['academic'] },
  { id: 'adopt-pets', type: 'MEMORY', title: "Luna & Simba Homecoming", description: "The day my heart grew 3 sizes!🐱🐾", buttonText: "Furever in my heart! 💕", icon: Cat, color: "bg-orange-400", age: 18, priority: 1, tags: ['family'] },
  { id: 'moving-out', type: 'OBSTACLE', title: "Moving Out", description: "Packing life into suitcases. New Chapter awaits!", buttonText: "Bangalore Here I COMEEE!! 🧳", icon: Home, color: "bg-rose-500", age: 19, priority: 2, tags: ['change'] },
  { id: 'amarah-mom', type: 'MEMORY', title: "GRANDMA MOMENT", description: "THATS A LITERAL BABYYYYY AAAAAAAAA", buttonText: "ALHUMDULILLAH😭💕", icon: Cat, color: "bg-cyan-500", age: 19, priority: 4, tags: ['friends'] }
];

const getEventsForAge = (age: number): LifeEvent[] => LIFE_EVENTS_DB.filter(e => e.age === age).sort((a, b) => b.priority - a.priority);
const MAX_PROGRESS = 20;
const CHARACTER_PADDING = 24;

/* ------------------------------------------------------------------ */
/* COMPONENTS */
/* ------------------------------------------------------------------ */

const EventPopup = ({ event, onComplete }: { event: LifeEvent, onComplete: () => void }) => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 animate-bounce-in">
    <div className={`${event.color} text-white p-1.5 rounded-3xl shadow-2xl ${event.type === 'OBSTACLE' ? '-rotate-2' : 'rotate-2'}`}>
      <div className="bg-white text-gray-800 rounded-[20px] p-5 text-center border-4 border-dashed border-white/50">
        <div className="flex justify-center mb-3">
          <div className={`p-3 rounded-full ${event.color} bg-opacity-20`}>
            <event.icon className={`w-10 h-10 ${event.color.replace('bg-', 'text-')}`} />
          </div>
        </div>
        <h3 className={`font-black text-xl uppercase mb-1 leading-tight ${event.type === 'OBSTACLE' ? 'text-red-600' : 'text-purple-600'}`}>
          <span className="block text-xs text-gray-400 mb-1">{event.type === 'MEMORY' ? '✨ MEMORY' : '🚧 CHALLENGE'}</span>
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 mb-5 font-medium">{event.description}</p>
        <Button onClick={onComplete} className={`w-full ${event.color} hover:brightness-110 text-white font-bold py-6 rounded-xl`}>
          {event.buttonText}
        </Button>
      </div>
    </div>
  </div>
);

export function LadderScene() {
  const { updateProgress, settings, setScene } = useSceneStore();
  const [progress, setProgress] = useState(0);
  const [isClimbing, setIsClimbing] = useState(false);
  const [eventQueue, setEventQueue] = useState<LifeEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);
  const [side, setSide] = useState<'left' | 'right'>('left');
  const [shake, setShake] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [quote, setQuote] = useState(AGE_FLAVOR[0]);

  const characterRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [maxTranslateY, setMaxTranslateY] = useState(0);
  const [stepSize, setStepSize] = useState(0);

  const getTranslateForProgress = useCallback((v: number) => {
    const s = stepSize || (maxTranslateY > 0 ? maxTranslateY / MAX_PROGRESS : 0);
    return -Math.min(maxTranslateY, s * v);
  }, [maxTranslateY, stepSize]);

  useLayoutEffect(() => {
    const update = () => {
      const h = ladderRef.current?.clientHeight || 0;
      const charH = characterRef.current?.clientHeight || 64;
      const safe = Math.max(0, h - charH - CHARACTER_PADDING);
      setMaxTranslateY(safe);
      setStepSize(safe / MAX_PROGRESS);
      if (characterRef.current) gsap.set(characterRef.current, { y: getTranslateForProgress(progressRef.current) });
    };
    update();
    const obs = new ResizeObserver(update);
    if (ladderRef.current) obs.observe(ladderRef.current);
    return () => obs.disconnect();
  }, [getTranslateForProgress]);

  const processEventQueue = useCallback(() => {
    if (currentEvent || eventQueue.length === 0) return;
    const next = eventQueue[0];
    setCurrentEvent(next);
    if (settings.soundEnabled) audioManager.play(next.type === 'OBSTACLE' ? 'hit' : 'success');
    if (next.type === 'OBSTACLE') { setShake(true); setTimeout(() => setShake(false), 300); }
  }, [currentEvent, eventQueue, settings.soundEnabled]);

  const completeCurrentEvent = useCallback(() => {
    if (!currentEvent) return;
    if (settings.soundEnabled) audioManager.play('success');
    setEventQueue(prev => prev.slice(1));
    setCurrentEvent(null);
    setQuote(currentEvent.type === 'OBSTACLE' ? `Victory over ${currentEvent.title}! 💪` : `Cherished: ${currentEvent.title} ✨`);
  }, [currentEvent, settings.soundEnabled]);

  const climb = useCallback(() => {
    if (isClimbing || currentEvent || progressRef.current >= MAX_PROGRESS) return;
    const next = progressRef.current + 1;
    setProgress(next);
    progressRef.current = next;
    
    const events = getEventsForAge(next);
    if (events.length > 0) setEventQueue(prev => [...prev, ...events]);
    else setQuote(AGE_FLAVOR[next] || "Keep going!");

    setIsClimbing(true);
    const nextSide = side === 'left' ? 'right' : 'left';
    setSide(nextSide);

    if (settings.soundEnabled) audioManager.play('hit');
    
    gsap.to(characterRef.current, {
      y: getTranslateForProgress(next),
      x: (nextSide === 'left' ? 1 : -1) * 30,
      duration: 0.5,
      ease: 'back.out(1.2)',
      onComplete: () => {
        setIsClimbing(false);
        if (next >= MAX_PROGRESS) {
          updateProgress({ unlockedGifts: true, ladderProgress: MAX_PROGRESS });
          setTimeout(() => {
            setShowCompletion(true);
            if (settings.soundEnabled) audioManager.play('success');
          }, 800);
        }
      }
    });
  }, [isClimbing, currentEvent, side, settings, getTranslateForProgress, updateProgress]);

  useEffect(() => { if (!currentEvent && eventQueue.length > 0) processEventQueue(); }, [eventQueue, currentEvent, processEventQueue]);

  return (
    <div className={`relative w-full h-full flex flex-col items-center bg-gradient-to-b from-indigo-300 via-purple-300 to-pink-300 overflow-hidden transition-transform duration-100 ${shake ? 'translate-x-1' : ''}`}>
      
      {/* Background Decor */}
      <div className="absolute top-10 right-10 opacity-50"><Sun className="w-24 h-24 text-yellow-100 animate-spin-slow" /></div>

      <div className="relative z-20 w-full max-w-xl px-4 h-full flex flex-col py-8">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">AFRAH'S JOURNEY</h1>
          <div className="mt-2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-pink-900 font-bold inline-flex items-center gap-2 border border-white/40">
            <Crown className="w-4 h-4 text-yellow-500" /> AGE: {progress} / 20
          </div>
        </div>

        <div className="h-10 text-center text-purple-800 font-bold text-sm bg-white/40 rounded-xl flex items-center justify-center px-4 mb-4 backdrop-blur-sm">
          {quote}
        </div>

        <div className="flex-1 relative">
          <div ref={ladderRef} className="absolute left-1/2 -translate-x-1/2 w-24 h-[90%] bottom-0 border-x-4 border-yellow-600/20">
            {Array.from({ length: MAX_PROGRESS }).map((_, i) => (
              <div key={i} className={`absolute left-0 right-0 h-2 rounded ${i < progress ? 'bg-pink-400' : 'bg-white/30'}`} style={{ top: `${(i / (MAX_PROGRESS - 1)) * 95}%` }} />
            ))}
          </div>

          <div ref={characterRef} className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-6xl">👸</div>
          {currentEvent && <EventPopup event={currentEvent} onComplete={completeCurrentEvent} />}
        </div>

        <Button 
          onClick={currentEvent ? completeCurrentEvent : climb} 
          disabled={isClimbing || progress >= MAX_PROGRESS}
          className="mt-4 w-full h-16 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          {progress >= MAX_PROGRESS ? "FINISH!" : currentEvent ? "CONTINUE" : "GROW UP! 🚀"}
        </Button>
      </div>

      {/* --- VICTORY MODAL --- */}
      {showCompletion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in">
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={true} numberOfPieces={300} />
          <div className="bg-white rounded-[2.5rem] p-10 text-center border-8 border-pink-100 shadow-2xl animate-bounce-in max-w-sm w-full">
            <div className="text-7xl mb-6">🎂</div>
            <h2 className="text-3xl font-black text-pink-600 mb-2">HAPPY 20TH AFRAH!</h2>
            <p className="text-gray-600 font-bold text-lg mb-8">Shall we cut the cake next?</p>
            
            <div className="grid gap-4">
              <Button 
                onClick={() => setScene('cake')} 
                className="bg-green-500 hover:bg-green-600 text-white font-black py-8 rounded-2xl text-xl shadow-lg flex items-center justify-center gap-2 group"
              >
                Sure, yes! <Cake className="w-6 h-6 group-hover:rotate-12 transition-transform"/>
              </Button>
              <Button 
                onClick={() => setScene('room')} 
                variant="ghost" 
                className="text-gray-400 font-bold hover:text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2"/> No, Go Back
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in { 0% { transform: scale(0.3); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
