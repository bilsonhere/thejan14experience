import { useRef, useState, useEffect, useMemo } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { Mic, Sparkles, Wind, PartyPopper, Volume2, VolumeX, Heart } from 'lucide-react';

// Coordinates to form the number "20" with candles (0-100% relative container space)
const CANDLE_POSITIONS = [
  // The "2"
  { x: 15, y: 30 }, { x: 22, y: 20 }, { x: 32, y: 20 }, { x: 40, y: 30 }, 
  { x: 40, y: 45 }, { x: 30, y: 55 }, { x: 20, y: 65 }, { x: 15, y: 80 }, 
  { x: 28, y: 80 }, { x: 40, y: 80 },
  // The "0"
  { x: 60, y: 30 }, { x: 72, y: 20 }, { x: 85, y: 30 }, { x: 85, y: 50 }, 
  { x: 85, y: 70 }, { x: 72, y: 80 }, { x: 60, y: 70 }, { x: 60, y: 50 },
  // Decorative accents (Making it exactly 20 and aesthetic)
  { x: 50, y: 50 }, // Center
  { x: 27.5, y: 40 }, // Filler for 2 curve
];

export function CandleScene() {
  const { updateProgress, navigateTo, settings } = useSceneStore();
  const [isLit, setIsLit] = useState(true);
  const [isBlowing, setIsBlowing] = useState(false);
  const [blowStrength, setBlowStrength] = useState(0);
  const [wishMade, setWishMade] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [showWishPrompt, setShowWishPrompt] = useState(false);
  
  // Arrays of refs for the 20 candles
  const candleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const flameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const wishRef = useRef<HTMLDivElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isLitRef = useRef<boolean>(true);
  const animationFrameRef = useRef<number | null>(null);

  // Generate random properties for candles once to avoid re-renders
  const candleVariations = useMemo(() => {
    return CANDLE_POSITIONS.map(() => ({
      height: 60 + Math.random() * 40, // Random height between 60-100px
      hue: Math.random() > 0.5 ? 'from-amber-200 via-orange-200 to-amber-100' : 'from-rose-200 via-pink-200 to-rose-100', // Gold or Rose Gold
      delay: Math.random() * 0.5,
    }));
  }, []);

  // Initial entrance
  useEffect(() => {
    if (!settings.reducedMotion && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }
      );
      
      // Animate candles popping up
      gsap.from('.candle-item', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'back.out(1.7)',
        delay: 0.3
      });
    }
  }, [settings.reducedMotion]);

  useEffect(() => {
    isLitRef.current = isLit;
  }, [isLit]);

  // Enhanced flame animation loop
  useEffect(() => {
    if (!settings.reducedMotion && isLit) {
      const animations: gsap.core.Tween[] = [];
      
      flameRefs.current.forEach((ref, index) => {
        if (ref) {
          // Flicker
          const flicker = gsap.to(ref, {
            scaleX: 'random(0.8, 1.2)',
            scaleY: 'random(0.9, 1.1)',
            opacity: 'random(0.8, 1)',
            duration: 0.1,
            repeat: -1,
            yoyo: true,
            ease: 'rough({ strength: 1, points: 20, template: none, randomize: true, clamp: false })'
          });
          
          // Gentle sway
          const sway = gsap.to(ref, {
            rotation: 'random(-5, 5)',
            x: 'random(-2, 2)',
            duration: 'random(1, 2)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random()
          });

          animations.push(flicker, sway);
        }
      });

      return () => animations.forEach(anim => anim.kill());
    }
  }, [isLit, settings.reducedMotion]);

  const requestMicrophoneAccess = async () => {
    try {
      setMicActive(true);
      
      if (!settings.reducedMotion) {
        gsap.to('.mic-button', { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.5; // More responsive
      
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const volumeHistory: number[] = [];

      const checkBlowing = () => {
        if (!isLitRef.current) {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        // Focus on lower frequencies for "blowing" sound
        const lowFreq = dataArray.slice(0, 20); 
        const average = lowFreq.reduce((a, b) => a + b, 0) / lowFreq.length;
        
        volumeHistory.push(average);
        if (volumeHistory.length > 5) volumeHistory.shift();
        const smoothedAverage = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;
        
        setBlowStrength(smoothedAverage);

        // Visual feedback based on blow strength
        if (smoothedAverage > 10 && !settings.reducedMotion) {
           flameRefs.current.forEach(ref => {
             if (ref) {
               const lean = Math.min(smoothedAverage / 2, 45); // Cap lean at 45deg
               gsap.to(ref, {
                 rotation: (Math.random() - 0.5) * lean, // Randomize direction slightly
                 scaleY: 1 - (smoothedAverage / 200), // Squish flame
                 opacity: 0.7,
                 duration: 0.1
               });
             }
           });
        }

        if (smoothedAverage > 55) { // Threshold
          setShowWishPrompt(true);
          blowOut();
        } else {
          animationFrameRef.current = requestAnimationFrame(checkBlowing);
        }
      };

      checkBlowing();
    } catch (error) {
      console.log('Microphone access denied');
      setMicActive(false);
    }
  };

  const blowOut = () => {
    if (!isLit || isBlowing) return;

    setIsBlowing(true);
    isLitRef.current = false;
    setWishMade(true);

    if (wishRef.current && !settings.reducedMotion) {
      gsap.fromTo(wishRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)' }
      );
    }

    // Cleanup Audio
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (!settings.reducedMotion) {
      // Staggered blowout animation (Domino effect)
      // Shuffle indices for random blowout order
      const indices = flameRefs.current.map((_, i) => i).sort(() => Math.random() - 0.5);
      
      indices.forEach((index, i) => {
        const flame = flameRefs.current[index];
        const candle = candleRefs.current[index];
        
        if (flame && candle) {
          const delay = i * 0.05; // Fast ripple effect

          // Flame extinguishes
          gsap.to(flame, {
            scale: 0,
            opacity: 0,
            duration: 0.2,
            delay: delay,
            ease: 'power1.in',
            onComplete: () => {
              // Smoke particle logic
              createSmoke(candle, delay);
            }
          });
        }
      });
    }

    if (settings.soundEnabled) {
      audioManager.play('success'); // Replace with 'blowout' sound if available
    }

    setTimeout(() => {
      setIsLit(false);
      updateProgress({ candleBlown: true });
      setIsBlowing(false);
      setBlowStrength(0);
    }, 2000);
  };

  const createSmoke = (element: HTMLElement, delay: number) => {
    // Create multiple smoke wisps
    for (let k = 0; k < 3; k++) {
      const smoke = document.createElement('div');
      smoke.className = 'absolute w-2 h-2 bg-gray-400 rounded-full blur-sm z-50';
      // Append directly to the candle container for positioning relative to candle
      element.appendChild(smoke);
      
      // Position at the top of the candle
      gsap.set(smoke, { 
        top: 0, 
        left: '50%', 
        xPercent: -50,
        opacity: 0.6 
      });

      gsap.to(smoke, {
        y: -50 - Math.random() * 50,
        x: (Math.random() - 0.5) * 40,
        scale: 4,
        opacity: 0,
        duration: 1.5 + Math.random(),
        delay: delay + (k * 0.1),
        ease: 'power2.out',
        onComplete: () => smoke.remove()
      });
    }
  };

  const makeWish = () => {
    setWishMade(true);
    setTimeout(() => {
      setShowWishPrompt(false);
      blowOut();
    }, 1000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close().catch(console.warn);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden 
                 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm vignette */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isLit ? 'opacity-60' : 'opacity-20'}
                        bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-transparent to-black`} />
        
        {/* Animated Dust/Stars */}
        {isLit && <AdaptiveParticleSystem count={150} color="#fbbf24" speed={0.2} size={1} />}
        {!isLit && <AdaptiveParticleSystem count={50} color="#ffffff" speed={0.1} size={1.5} />}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col items-center justify-center">
        
        {/* Title Group */}
        <div className="text-center mb-8 sm:mb-12 mt-8 transition-all duration-700">
          <h1 className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200
                         text-5xl sm:text-6xl md:text-7xl drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] mb-2">
            Happy 20th!
          </h1>
          <p className="font-cursive text-2xl sm:text-3xl text-rose-200/90 animate-pulse">
            Make a Wish 
            <Heart className="inline-block w-6 h-6 ml-2 text-rose-400 fill-rose-400" />
          </p>
        </div>

        {/* The Candle Display */}
        <div className="relative w-full max-w-lg aspect-[4/3] mb-8">
          
          {/* Wish Confirmation Overlay */}
          {wishMade && (
             <div ref={wishRef} 
                  className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-amber-500/30 text-center
                                transform transition-all duration-500">
                   <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-2 animate-spin-slow" />
                   <h2 className="text-2xl font-bold text-white mb-1">Wish Sent!</h2>
                   <p className="text-amber-200 text-sm">Magic is in the air...</p>
                </div>
             </div>
          )}

          {/* Candle Container using Coordinate System */}
          <div className="absolute inset-0">
            {CANDLE_POSITIONS.map((pos, i) => {
              const variant = candleVariations[i];
              return (
                <div
                  key={i}
                  className="candle-item absolute transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    zIndex: Math.floor(pos.y), // Lower candles appear in front
                  }}
                >
                  {/* The Candle Stick */}
                  <div 
                    ref={el => candleRefs.current[i] = el}
                    className={`relative w-3 sm:w-4 rounded-t-sm shadow-lg
                               bg-gradient-to-b ${variant.hue}`}
                    style={{ 
                      height: `${variant.height}px`,
                      boxShadow: isLit ? '0 0 15px rgba(251, 191, 36, 0.2)' : 'none'
                    }}
                  >
                    {/* Stripes/Texture */}
                    <div className="absolute top-0 inset-x-0 h-full opacity-30 
                                  bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_6px)]" />
                  </div>

                  {/* The Flame */}
                  <div
                    ref={el => flameRefs.current[i] = el}
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-6 origin-bottom
                               transition-opacity duration-300
                               ${isLit ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {/* Flame Core */}
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500 via-yellow-300 to-white rounded-full blur-[1px]" />
                    {/* Flame Glow Halo */}
                    <div className="absolute -inset-4 bg-orange-400/30 rounded-full blur-md animate-pulse" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Controls Area */}
        <div className="w-full max-w-md space-y-4 min-h-[160px]">
          {isLit ? (
            <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom duration-500">
              
              {/* Blow Strength Visualizer */}
              {blowStrength > 5 && (
                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-100 ease-out"
                         style={{ width: `${Math.min(blowStrength * 1.5, 100)}%` }} />
                 </div>
              )}

              <div className="grid grid-cols-2 gap-4 w-full">
                <Button
                  onClick={requestMicrophoneAccess}
                  disabled={micActive}
                  className={`mic-button relative h-16 rounded-xl border transition-all duration-300
                            ${micActive 
                              ? 'bg-emerald-500/20 border-emerald-500/50' 
                              : 'bg-white/5 border-white/20 hover:bg-white/10'}`}
                >
                  <div className="flex flex-col items-center">
                    {micActive ? (
                      <>
                         <Mic className="w-6 h-6 text-emerald-400 animate-pulse" />
                         <span className="text-xs text-emerald-200 mt-1">Blow now!</span>
                      </>
                    ) : (
                      <>
                         <Mic className="w-6 h-6 text-white/80" />
                         <span className="text-xs text-white/60 mt-1">Use Mic</span>
                      </>
                    )}
                  </div>
                </Button>

                <Button
                  onClick={blowOut}
                  disabled={isBlowing}
                  className="h-16 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 
                             hover:from-rose-600 hover:to-orange-600 border-0 shadow-lg shadow-orange-900/20"
                >
                  <div className="flex flex-col items-center">
                    <Wind className="w-6 h-6 text-white" />
                    <span className="text-xs text-white mt-1">Blow Out</span>
                  </div>
                </Button>
              </div>
              
              <div className="text-white/40 text-xs font-elegant flex items-center gap-2">
                 <Sparkles className="w-3 h-3" />
                 <span>Tip: Make a wish before you blow!</span>
                 <Sparkles className="w-3 h-3" />
              </div>
            </div>
          ) : (
            /* Post-Blowout Success State */
            <div className="text-center animate-in zoom-in fade-in duration-700">
              <h3 className="text-2xl font-bold text-white mb-2">Wishes Granted! ✨</h3>
              <p className="text-purple-200/80 mb-6 text-sm">
                The universe has heard you. Now, let's see what else awaits...
              </p>
              
              <Button
                 onClick={() => navigateTo('gifts')}
                 className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500
                            hover:from-amber-500 hover:to-orange-600 shadow-xl shadow-amber-900/30
                            text-white font-bold group transform transition-all hover:scale-[1.02]"
              >
                <PartyPopper className="w-6 h-6 mr-2 group-hover:-rotate-12 transition-transform" />
                Open Presents
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer / Audio Toggle */}
      <div className="absolute bottom-4 left-4 z-20">
         <Button
           variant="ghost"
           size="sm"
           className="text-white/40 hover:text-white hover:bg-white/10 rounded-full px-3"
         >
           {settings.soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
           <span className="text-xs">Ambience</span>
         </Button>
      </div>

      <style>{`
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
