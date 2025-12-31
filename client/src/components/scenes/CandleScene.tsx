import { useRef, useState, useEffect, useMemo } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { Mic, Sparkles, Wind, PartyPopper, Volume2, VolumeX, Heart, Flame } from 'lucide-react';

// Define relative positions for the number "2" (approx 10 candles)
const POSITIONS_2 = [
  { left: '20%', top: '10%' }, { left: '50%', top: '5%' }, { left: '80%', top: '15%' }, // Top curve
  { left: '85%', top: '35%' }, { left: '60%', top: '55%' }, { left: '40%', top: '70%' }, // Diagonal down
  { left: '20%', top: '85%' }, { left: '50%', top: '90%' }, { left: '85%', top: '90%' }, // Bottom base
  { left: '15%', top: '30%' } // Extra curve filler
];

// Define relative positions for the number "0" (approx 10 candles)
const POSITIONS_0 = [
  { left: '50%', top: '5%' }, { left: '80%', top: '15%' }, { left: '90%', top: '40%' }, // Top right arc
  { left: '90%', top: '65%' }, { left: '80%', top: '85%' }, { left: '50%', top: '95%' }, // Bottom right arc
  { left: '20%', top: '85%' }, { left: '10%', top: '65%' }, { left: '10%', top: '40%' }, // Bottom left arc
  { left: '20%', top: '15%' } // Top left arc
];

export function CandleScene() {
  const { updateProgress, navigateTo, settings } = useSceneStore();
  const [isLit, setIsLit] = useState(true);
  const [isBlowing, setIsBlowing] = useState(false);
  const [blowStrength, setBlowStrength] = useState(0);
  const [wishMade, setWishMade] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [showWishPrompt, setShowWishPrompt] = useState(false);
  
  // Arrays of refs for all candles and flames
  const flameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const wishRef = useRef<HTMLDivElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isLitRef = useRef<boolean>(true);
  const animationFrameRef = useRef<number | null>(null);

  // Total candles count
  const totalCandles = POSITIONS_2.length + POSITIONS_0.length;

  // Generate random properties for candles
  const candleVariations = useMemo(() => {
    return Array.from({ length: totalCandles }).map((_, i) => ({
      // Alternate colors between gold and rose for the "2" and "0"
      colorClass: i < POSITIONS_2.length 
        ? 'bg-gradient-to-b from-amber-200 via-yellow-100 to-amber-50' // Goldish for '2'
        : 'bg-gradient-to-b from-rose-200 via-pink-100 to-rose-50', // Rose for '0'
      height: Math.random() * 20 + 50, // Random height 50-70px
      rotation: Math.random() * 10 - 5, // Slight random tilt
    }));
  }, [totalCandles]);

  // Sync ref for audio loop
  useEffect(() => {
    isLitRef.current = isLit;
  }, [isLit]);

  // Initial Entrance Animation
  useEffect(() => {
    if (!settings.reducedMotion && containerRef.current) {
      const ctx = gsap.context(() => {
        // Fade in container
        gsap.from(containerRef.current, { opacity: 0, duration: 1 });

        // Staggered candle pop-up
        gsap.from('.candle-container', {
          y: 50,
          opacity: 0,
          scale: 0.8,
          duration: 0.8,
          stagger: 0.05,
          ease: 'back.out(1.5)',
          delay: 0.5
        });

        // Ignite flames
        gsap.fromTo('.flame', 
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.05, delay: 1.2, ease: 'power2.out' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [settings.reducedMotion]);

  // Flame Flicker Animation Loop
  useEffect(() => {
    if (!settings.reducedMotion && isLit) {
      const ctx = gsap.context(() => {
        flameRefs.current.forEach((ref) => {
          if (!ref) return;
          
          // Realistic randomized flicker
          const flicker = gsap.timeline({ repeat: -1, yoyo: true });
          flicker.to(ref, {
            scaleX: 'random(0.9, 1.1)',
            scaleY: 'random(0.95, 1.05)',
            opacity: 'random(0.8, 1)',
            duration: 'random(0.05, 0.2)',
            ease: 'none'
          });

          // Gentle sway
          gsap.to(ref, {
            rotation: 'random(-3, 3)',
            x: 'random(-1, 1)',
            duration: 'random(1.5, 3)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random()
          });
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLit, settings.reducedMotion]);

  const requestMicrophoneAccess = async () => {
    try {
      setMicActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const checkBlowing = () => {
        if (!isLitRef.current) return;

        analyser.getByteFrequencyData(dataArray);
        // Average of lower frequencies
        const average = dataArray.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
        setBlowStrength(average);

        // Visual feedback on flames leaning
        if (average > 15 && !settings.reducedMotion) {
           gsap.to('.flame-core', {
             rotation: (Math.random() - 0.5) * (average / 2),
             scaleY: 1 - (average / 255),
             duration: 0.1,
             overwrite: 'auto'
           });
        }

        if (average > 65) {
          setShowWishPrompt(true);
          blowOut();
        } else {
          animationFrameRef.current = requestAnimationFrame(checkBlowing);
        }
      };
      checkBlowing();
    } catch (error) {
      console.error('Mic access denied:', error);
      setMicActive(false);
    }
  };

  const blowOut = () => {
    if (!isLit || isBlowing) return;
    setIsBlowing(true);
    isLitRef.current = false; // Stop audio loop immediately
    setWishMade(true);

    // Stop Audio
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();

    if (!settings.reducedMotion) {
      // Shuffle flames for random blowout order
      const shuffledFlames = [...flameRefs.current]
        .filter(f => f !== null)
        .sort(() => Math.random() - 0.5);

      shuffledFlames.forEach((flame, i) => {
        const delay = i * 0.04; // Fast ripple
        
        gsap.to(flame, {
          scale: 0,
          opacity: 0,
          y: -20, // Move up as it disappears
          duration: 0.3,
          delay: delay,
          ease: 'power2.in',
          onComplete: () => {
            // IMPORTANT: Ensure it stays hidden
            gsap.set(flame, { autoAlpha: 0 }); 
            createSmoke(flame.parentElement!.parentElement!);
          }
        });
      });
    }

    if (settings.soundEnabled) audioManager.play('success');

    setTimeout(() => {
      setIsLit(false); // Triggers re-render showing success state
      updateProgress({ candleBlown: true });
      setIsBlowing(false);
      setBlowStrength(0);
    }, 2500); // Wait for smoke animation to finish
  };

  const createSmoke = (candleElement: HTMLElement) => {
    const smokeContainer = document.createElement('div');
    smokeContainer.className = 'absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none';
    candleElement.appendChild(smokeContainer);

    for (let i = 0; i < 3; i++) {
      const puff = document.createElement('div');
      puff.className = 'absolute w-3 h-3 bg-gray-200/40 rounded-full blur-sm';
      smokeContainer.appendChild(puff);
      
      gsap.fromTo(puff, 
        { scale: 0.5, opacity: 0.6, x: 0, y: 0 },
        { 
          scale: 3 + Math.random() * 2,
          opacity: 0,
          x: (Math.random() - 0.5) * 50,
          y: -80 - Math.random() * 50,
          rotation: Math.random() * 360,
          duration: 1.5 + Math.random(),
          delay: i * 0.1,
          ease: 'power1.out',
          onComplete: () => { if (i === 2) smokeContainer.remove(); }
        }
      );
    }
  };

  const makeWish = () => {
    setWishMade(true);
    // Animate wish prompt away
    gsap.to(wishRef.current, { opacity: 0, scale: 1.1, duration: 0.5 });
    setTimeout(() => {
      setShowWishPrompt(false);
      blowOut();
    }, 800);
  };

  // Render a single candle
  const renderCandle = (pos: {left: string, top: string}, index: number) => {
    const variation = candleVariations[index];
    return (
      <div 
        key={index}
        className="candle-container absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: pos.left, top: pos.top }}
      >
        {/* Candle Body */}
        <div 
          className={`relative w-3 sm:w-4 rounded-sm shadow-sm ${variation.colorClass}`}
          style={{ 
            height: `${variation.height}px`,
            transform: `rotate(${variation.rotation}deg)`,
            boxShadow: isLit ? '0 4px 15px rgba(251, 191, 36, 0.3), inset 0 -10px 20px rgba(0,0,0,0.1)' : 'inset 0 -10px 20px rgba(0,0,0,0.1)'
          }}
        >
          {/* Wick */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-800 opacity-80" />
        </div>

        {/* Flame Container (Ref goes here) */}
        <div 
          ref={el => flameRefs.current[index] = el}
          className="flame absolute -top-5 left-1/2 -translate-x-1/2 w-6 h-8 pointer-events-none origin-bottom"
          // Use autoAlpha for GSAP visibility toggling
          style={{ visibility: isLit ? 'visible' : 'hidden', opacity: isLit ? 1 : 0 }} 
        >
            {/* Flame Glow Halo */}
            <div className="absolute inset-0 -m-4 bg-amber-300/30 rounded-full blur-xl animate-pulse-slow" />
            {/* The Flame itself */}
            <div className="flame-core relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-yellow-300 to-white rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] blur-[1px]" />
            </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden 
                 bg-[#1a1120]" // Deep warm dark background
    >
      {/* --- Ambient Background ("Cakey Environment") --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm Golden Hour Gradient */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isLit ? 'opacity-80' : 'opacity-30'}
                        bg-[radial-gradient(circle_at_50%_30%,_var(--tw-gradient-stops))] from-amber-800/40 via-[#2a1a30] to-[#1a1120]`} />
        
        {/* Bokeh Lights (Out of focus festive lights) */}
        <div className={`absolute inset-0 bg-[url('/assets/bokeh.png')] bg-cover opacity-20 mix-blend-screen transition-opacity duration-1000 ${isLit ? 'opacity-30' : 'opacity-10'}`} />

        {/* Floating Dust/Magic */}
        {isLit && <AdaptiveParticleSystem count={100} color="#fbbf24" speed={0.15} size={1.5} />}
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col items-center justify-center py-8">
        
        {/* Header */}
        <div className="text-center mb-8 transition-all duration-700">
          <h1 className="font-handwriting font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100
                         text-5xl sm:text-7xl drop-shadow-[0_2px_15px_rgba(251,191,36,0.5)] mb-2 leading-tight">
            Happy 20th!
          </h1>
          {isLit && (
            <p className="font-serif text-2xl sm:text-3xl text-amber-100/90 flex items-center justify-center gap-2 animate-pulse-slow">
              <Sparkles className="w-5 h-5 text-amber-300" />
              Make a Wish
              <Sparkles className="w-5 h-5 text-amber-300" />
            </p>
          )}
        </div>

        {/* --- The "20" Candle Display --- */}
        <div className="relative w-full max-w-2xl aspect-[16/9] sm:aspect-[2/1] mb-8 flex justify-center items-center gap-8 sm:gap-16">
          
           {/* Container for "2" */}
           <div className="relative w-1/3 h-full max-h-[300px]">
              {POSITIONS_2.map((pos, i) => renderCandle(pos, i))}
           </div>

           {/* Container for "0" */}
           <div className="relative w-1/3 h-full max-h-[300px]">
              {POSITIONS_0.map((pos, i) => renderCandle(pos, i + POSITIONS_2.length))}
           </div>

           {/* Wish Prompt Overlay */}
           {showWishPrompt && !wishMade && (
              <div ref={wishRef} className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-64 text-center animate-in zoom-in-95 duration-300">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                  <h3 className="text-xl font-bold text-amber-100 mb-2">Ready to wish?</h3>
                  <Button size="sm" onClick={makeWish} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                    Yes, blow them out! ✨
                  </Button>
                </div>
              </div>
           )}
        </div>

        {/* --- Controls Area --- */}
        <div className="w-full max-w-md min-h-[180px] flex items-end justify-center">
          {isLit ? (
            /* Pre-Blowout Controls */
            <div className="w-full flex flex-col items-center gap-5 animate-in slide-in-from-bottom duration-500">
              
              {/* Blow Strength Meter */}
              <div className={`w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/10 transition-opacity duration-300 ${blowStrength > 5 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-white transition-all duration-100 ease-out box-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                        style={{ width: `${Math.min(blowStrength, 100)}%` }} />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                {/* Mic Button */}
                <Button
                  onClick={requestMicrophoneAccess}
                  disabled={micActive}
                  className={`relative h-16 rounded-2xl border transition-all duration-300 group overflow-hidden
                            ${micActive 
                              ? 'bg-emerald-900/40 border-emerald-500/50' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'}`}
                >
                  <div className="flex flex-col items-center relative z-10">
                    {micActive ? (
                      <>
                         <Mic className="w-7 h-7 text-emerald-400 animate-pulse" />
                         <span className="text-xs text-emerald-200 font-semibold mt-1">Blow into mic!</span>
                      </>
                    ) : (
                      <>
                         <Mic className="w-7 h-7 text-white/70 group-hover:text-white transition-colors" />
                         <span className="text-xs text-white/60 group-hover:text-white/90 mt-1">Use Microphone</span>
                      </>
                    )}
                  </div>
                  {micActive && <div className="absolute inset-0 bg-emerald-500/10 animate-pulse-slow" />}
                </Button>

                {/* Manual Blow Button */}
                <Button
                  onClick={blowOut}
                  disabled={isBlowing}
                  className="h-16 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 
                             hover:from-rose-600 hover:to-orange-600 border-0 shadow-lg shadow-orange-900/30
                             group relative overflow-hidden transition-transform active:scale-95"
                >
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <div className="flex flex-col items-center relative z-10">
                    <Wind className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
                    <span className="text-xs text-white font-bold mt-1">Blow Out Now</span>
                  </div>
                </Button>
              </div>
              
              <p className="text-amber-200/60 text-xs font-serif italic flex items-center gap-2">
                 <Flame className="w-3 h-3" /> Close your eyes and make a wish first!
              </p>
            </div>
          ) : (
            /* Post-Blowout Success State */
            <div className="text-center animate-in zoom-in fade-in duration-1000 flex flex-col items-center justify-center h-full">
               <div className="mb-4 relative">
                 <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse-slow" />
                 <Heart className="w-16 h-16 text-rose-400 fill-rose-400 relative z-10 animate-bounce-slow" />
               </div>
              <h3 className="text-3xl font-bold text-white mb-2 font-handwriting">Wishes made! ✨</h3>
              <p className="text-amber-100/80 mb-8 text-lg max-w-xs mx-auto font-serif leading-relaxed">
                May this year bring you everything you've hoped for.
              </p>
              
              <Button
                 onClick={() => navigateTo('gifts')}
                 className="w-full max-w-sm py-4 text-xl rounded-full bg-gradient-to-r from-amber-400 to-orange-500
                            hover:from-amber-500 hover:to-orange-600 shadow-[0_0_30px_rgba(251,191,36,0.4)]
                            text-white font-bold group transform transition-all hover:scale-105 active:scale-95"
              >
                <PartyPopper className="w-6 h-6 mr-3 group-hover:-rotate-12 transition-transform" />
                Open Presents
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Toggle */}
      <div className="absolute bottom-4 left-4 z-20">
         <Button variant="ghost" size="sm" className="text-white/40 hover:text-white hover:bg-white/10 rounded-full px-3 border border-transparent hover:border-white/20 transition-all">
           {settings.soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
           <span className="text-xs">Sound</span>
         </Button>
      </div>

      <style>{`
        .font-handwriting { font-family: 'Pacifico', 'Dancing Script', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
      `}</style>
    </div>
  );
}
