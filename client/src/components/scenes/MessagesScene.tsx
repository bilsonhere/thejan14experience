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
    setActiveIndex(MESSAGES.findIndex(m => m.id === message.id));
    
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
            Open each letter to read heartfelt messages from the special people in your life.
            Each one contains love, memories, and wishes for your 20th birthday.
          </p>
        </div>

        {/* Letters Grid */}
        {!selectedMessage && (
          <div className="w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {MESSAGES.map((message, index) => (
                <button
                  key={message.id}
                  ref={el => lettersRef.current[index] = el}
                  onClick={() => openMessage(message)}
                  onMouseEnter={() => !settings.reducedMotion && setHoveredLetter(message.id)}
                  onMouseLeave={() => setHoveredLetter(null)}
                  className={`group relative p-5 sm:p-6 rounded-xl sm:rounded-2xl
                             backdrop-blur-lg border transition-all duration-300
                             hover:scale-105 hover:shadow-2xl 
                             cursor-pointer transform-gpu
                             ${message.gradient}
                             border-white/20 hover:border-white/40
                             ${hoveredLetter && hoveredLetter !== message.id ? 'opacity-60' : 'opacity-100'}`}
                  style={{
                    transition: settings.reducedMotion ? 'none' : 'all 0.3s ease',
                    transform: hoveredLetter === message.id ? 'translateY(-8px)' : 'none'
                  }}
                  aria-label={`Open message from ${message.sender}`}
                >
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-12 h-12 rotate-45 
                                  bg-white/20 group-hover:bg-white/30 transition-colors" />
                  </div>

                  {/* Letter seal */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full 
                                bg-white/30 backdrop-blur-sm flex items-center justify-center
                                group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <span className="text-lg">{message.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <div className="mb-4">
                      <Mail className="w-12 h-12 mx-auto mb-3 
                                     text-white/80 group-hover:text-white 
                                     transition-colors" />
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                        {message.emoji}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {message.sender}
                      </h3>
                      <p className="text-sm text-white/70">
                        {message.relationship}
                      </p>
                    </div>

                    {/* Open hint */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="text-xs text-white/60 font-elegant 
                                    group-hover:text-white/80 transition-colors">
                        Click to open
                        <Sparkles className="inline-block ml-2 w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Back Button */}
            <div className="mt-10 sm:mt-12 text-center">
              <Button
                onClick={() => navigateTo('room')}
                variant="ghost"
                className="group px-6 py-3 rounded-full 
                          bg-white/10 hover:bg-white/20 
                          backdrop-blur-sm border border-white/20
                          transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Room
              </Button>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeMessage}
            />
            
            {/* Message Card */}
            <div
              ref={messageRef}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden
                        rounded-2xl sm:rounded-3xl shadow-2xl 
                        transform-gpu animate-in fade-in zoom-in duration-300"
            >
              {/* Background with message gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedMessage.gradient}`} />
              
              {/* Paper texture */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48ZGVmcz48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjYiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9Ii4wNSIvPjwvc3ZnPg==')] 
                              opacity-30" />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-white/20 bg-gradient-to-r from-white/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm 
                                    flex items-center justify-center text-2xl">
                        {selectedMessage.emoji}
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                          {selectedMessage.sender}
                        </h2>
                        <p className="text-white/70 text-sm">
                          {selectedMessage.relationship} • {selectedMessage.date}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={closeMessage}
                        variant="ghost"
                        size="sm"
                        className="rounded-full bg-white/10 hover:bg-white/20 
                                 w-8 h-8 p-0 text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                  <div className="max-w-3xl mx-auto">
                    <div className="prose prose-invert prose-lg max-w-none">
                      <div className="whitespace-pre-line text-white/90 leading-relaxed 
                                    font-elegant text-base sm:text-lg">
                        {selectedMessage.content}
                      </div>
                    </div>
                    
                    {/* Hearts indicator */}
                    <div className="mt-8 pt-8 border-t border-white/20">
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Heart
                            key={i}
                            className={`w-5 h-5 ${i < 3 ? 'fill-pink-400 text-pink-400' : 'fill-white/20 text-white/20'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-white/60">
                          Filled with love
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Navigation */}
                <div className="p-6 sm:p-8 border-t border-white/20 
                              bg-gradient-to-t from-white/10 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/60">
                      Message {activeIndex + 1} of {MESSAGES.length}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => navigateMessages('prev')}
                        variant="ghost"
                        size="sm"
                        className="rounded-full bg-white/10 hover:bg-white/20 
                                 text-white gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {MESSAGES.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedMessage(MESSAGES[index]);
                              setActiveIndex(index);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === activeIndex 
                                ? 'bg-white w-6' 
                                : 'bg-white/30 hover:bg-white/50'
                            }`}
                            aria-label={`Go to message ${index + 1}`}
                          />
                        ))}
                      </div>
                      
                      <Button
                        onClick={() => navigateMessages('next')}
                        variant="ghost"
                        size="sm"
                        className="rounded-full bg-white/10 hover:bg-white/20 
                                 text-white gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button
                      onClick={() => {
                        // Implement share functionality
                        navigator.clipboard.writeText(selectedMessage.content);
                      }}
                      variant="ghost"
                      size="sm"
                      className="rounded-full bg-white/10 hover:bg-white/20 
                               text-white"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Hint */}
        {!selectedMessage && (
          <div className="mt-8 text-center sm:hidden">
            <p className="text-xs text-purple-300/60 font-elegant">
              Tap any letter to read the message
            </p>
          </div>
        )}
      </div>

      {/* Vignette Effect */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
    </div>
  );
}
