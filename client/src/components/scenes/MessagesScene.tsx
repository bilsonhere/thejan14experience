import { useState, useRef, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { X, Heart, Mail, Sparkles, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  relationship: string;
  emoji: string;
  color: string;
  gradient: string;
  content: string;
  date: string;
}

const MESSAGES: Message[] = [
  {
    id: 1,
    sender: "Mom & Dad",
    relationship: "Parents",
    emoji: "👨‍👩‍👧",
    color: "#f472b6",
    gradient: "from-pink-500/30 via-rose-500/25 to-rose-600/20",
    content: `Our dearest Afrah,

As you turn 20, our hearts swell with pride and love watching the incredible person you've become. 
From your first steps to this milestone, every moment has been a treasure.

You've grown into someone with such depth, kindness, and a beautiful spirit that touches everyone around you. 
Your laughter still lights up our home, and your dreams inspire us daily.

May this year bring you endless joy, success in all you pursue, and the realization of every beautiful dream you carry in your heart.

We love you more than words can express. Happy 20th birthday! 💖`,
    date: "January 14, 2025"
  },
  {
    id: 2,
    sender: "Sarah",
    relationship: "Best Friend",
    emoji: "👯‍♀️",
    color: "#8b5cf6",
    gradient: "from-purple-500/30 via-violet-500/25 to-indigo-600/20",
    content: `Afrah!!!! Happy 20th! 🎉

Can you believe we're actually adults now? (Well, sort of 😜)
From late-night study sessions to spontaneous adventures, every memory with you is golden.

You're the friend who turns ordinary days into extraordinary stories. 
Your strength, your kindness, your terrible taste in movies (we'll work on that 😂) - I love it all.

Here's to more midnight talks, questionable decisions that make great stories, and watching each other grow into the amazing women we're meant to be.

Love you forever, bestie! ✨`,
    date: "January 13, 2025"
  },
  {
    id: 3,
    sender: "Alex",
    relationship: "Sibling",
    emoji: "👨‍👧",
    color: "#60a5fa",
    gradient: "from-blue-500/30 via-cyan-500/25 to-sky-600/20",
    content: `Hey little sis,

20 years old! When did that happen? 
It feels like yesterday we were fighting over the TV remote.

Watching you grow has been one of my greatest joys. 
You're smarter, kinder, and cooler than I could have ever imagined my little sister would be.

Thanks for putting up with my terrible advice and for always being there. 
You're not just my sister, you're one of my favorite people.

Can't wait to see what amazing things you accomplish this year. 
Just remember - I'll always be here to annoy you with big brother wisdom. 😉

Happy Birthday! 🎂`,
    date: "January 14, 2025"
  },
  {
    id: 4,
    sender: "Grandma",
    relationship: "Grandmother",
    emoji: "👵",
    color: "#34d399",
    gradient: "from-emerald-500/30 via-teal-500/25 to-green-600/20",
    content: `My darling Afrah,

Twenty years! How beautifully you've bloomed. 
I still see the little girl who loved bedtime stories in the wonderful woman you've become.

Your kindness reminds me of spring flowers - gentle, beautiful, and making the world brighter. 
Your laughter is music that fills every room.

My wish for you is a life filled with the same joy you bring to others. 
May your path be smooth, your dreams big, and your heart always light.

Remember, you carry our family's love in every step you take.

With all my love,
Grandma 🌸`,
    date: "January 12, 2025"
  },
  {
    id: 5,
    sender: "The Gang",
    relationship: "Friends",
    emoji: "👥",
    color: "#fbbf24",
    gradient: "from-yellow-500/30 via-amber-500/25 to-orange-600/20",
    content: `HAPPY 20TH AFRAH! 🎉🎊

If birthdays had a president, you'd be elected unanimously! 
You're the glue that holds this chaotic group together and the spark that makes every gathering legendary.

From your incredible sense of humor to your ability to remember everyone's coffee order, 
you're simply the best friend anyone could ask for.

Here's to more spontaneous trips, questionable karaoke choices, 
and creating memories that we'll laugh about when we're old and gray.

We're so proud of the person you are and excited for the person you're becoming. 
The world better watch out - Afrah's entering her twenties! 🚀

Love from all of us! 💕`,
    date: "January 14, 2025"
  }
];

export function MessagesScene() {
  const { navigateTo, settings } = useSceneStore();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLButtonElement | null)[]>([]);
  const messageRef = useRef<HTMLDivElement>(null);
  const animationRefs = useRef<gsap.core.Tween[]>([]);

  // Initialize floating animations
  useEffect(() => {
    if (!settings.reducedMotion) {
      // Clear previous animations
      animationRefs.current.forEach(anim => anim.kill());
      animationRefs.current = [];

      // Create floating animations for letters
      lettersRef.current.forEach((ref, i) => {
        if (ref && !selectedMessage) {
          const anim = gsap.to(ref, {
            y: -15,
            rotation: 5,
            duration: 3 + i * 0.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2,
          });
          animationRefs.current.push(anim);
        }
      });

      // Entrance animation
      if (containerRef.current) {
        gsap.fromTo(containerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: 'power2.out' }
        );
      }
    }

    return () => {
      animationRefs.current.forEach(anim => anim.kill());
    };
  }, [selectedMessage, settings.reducedMotion]);

  const openMessage = (message: Message) => {
    // Stop animations for all letters
    animationRefs.current.forEach(anim => anim.kill());
    
    setSelectedMessage(message);
    
    if (settings.soundEnabled) {
      // You could add a paper unfolding sound here
    }

    // Sparkle effect on letter open
    if (!settings.reducedMotion) {
      const letterElement = lettersRef.current[message.id - 1];
      if (letterElement) {
        createSparkleEffect(letterElement, message.color);
      }
    }
  };

  const createSparkleEffect = (element: HTMLElement, color: string) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.className = 'fixed text-2xl pointer-events-none z-50';
        sparkle.style.left = `${rect.left + rect.width / 2}px`;
        sparkle.style.top = `${rect.top + rect.height / 2}px`;
        sparkle.style.filter = `drop-shadow(0 0 8px ${color})`;
        document.body.appendChild(sparkle);

        gsap.to(sparkle, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100 - 50,
          opacity: 0,
          scale: 0,
          rotation: 360,
          duration: 1.2,
          ease: 'power3.out',
          onComplete: () => sparkle.remove(),
        });
      }, i * 100);
    }
  };

  const closeMessage = () => {
    if (!settings.reducedMotion && messageRef.current) {
      gsap.to(messageRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setSelectedMessage(null);
          // Restart floating animations
          if (!settings.reducedMotion) {
            setTimeout(() => {
              lettersRef.current.forEach((ref, i) => {
                if (ref) {
                  const anim = gsap.to(ref, {
                    y: -15,
                    rotation: 5,
                    duration: 3 + i * 0.3,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: i * 0.2,
                  });
                  animationRefs.current.push(anim);
                }
              });
            }, 100);
          }
        }
      });
    } else {
      setSelectedMessage(null);
    }
  };

  const navigateMessages = (direction: 'prev' | 'next') => {
    if (!selectedMessage) return;
    
    const currentIndex = MESSAGES.findIndex(m => m.id === selectedMessage.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % MESSAGES.length;
    } else {
      newIndex = (currentIndex - 1 + MESSAGES.length) % MESSAGES.length;
    }
    
    setSelectedMessage(MESSAGES[newIndex]);
    setActiveIndex(newIndex);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden 
                 bg-gradient-to-br from-slate-950 via-indigo-950/90 to-purple-950/90"
    >
      {/* Enhanced Background Layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-indigo-950/80 to-purple-950/90" />
        
        {/* Animated paper texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wMiIvPjwvc3ZnPg==')] 
                        opacity-10" />
        
        {/* Floating paper shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Subtle Particles */}
      <AdaptiveParticleSystem 
        count={150} 
        color="#e0e7ff" 
        speed={0.4} 
        size={1.5}
        className="absolute inset-0"
      />

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-3xl opacity-30 animate-float-slow">✉️</div>
      <div className="absolute top-20 right-12 text-2xl opacity-20 animate-float-slow" style={{animationDelay: '1s'}}>💌</div>
      <div className="absolute bottom-20 left-16 text-2xl opacity-20 animate-float-slow" style={{animationDelay: '2s'}}>📜</div>
      <div className="absolute bottom-16 right-10 text-3xl opacity-30 animate-float-slow" style={{animationDelay: '0.5s'}}>🕊️</div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 px-2">
          <div className="relative inline-block mb-4 sm:mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 
                          blur-2xl rounded-full" />
            <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2
                          drop-shadow-[0_0_30px_rgba(168,85,247,0.7)]">
              <span className="font-cursive bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 
                             bg-clip-text text-transparent">
                Messages from Loved Ones
              </span>
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-purple-200/90 font-elegant max-w-2xl mx-auto">
            Open each
