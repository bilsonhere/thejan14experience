import { useRef, useState, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';
import { Mic, Sparkles, Wind, PartyPopper, Volume2, VolumeX } from 'lucide-react';

export function CandleScene() {
  const { updateProgress, navigateTo, settings } = useSceneStore();
  const [isLit, setIsLit] = useState(true);
  const [isBlowing, setIsBlowing] = useState(false);
  const [blowStrength, setBlowStrength] = useState(0);
  const [wishMade, setWishMade] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [showWishPrompt, setShowWishPrompt] = useState(false);
  
  const candle1Ref = useRef<HTMLDivElement>(null);
  const candle2Ref = useRef<HTMLDivElement>(null);
  const flame1Ref = useRef<HTMLDivElement>(null);
  const flame2Ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wishRef = useRef<HTMLDivElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isLitRef = useRef<boolean>(true);
  const animationFrameRef = useRef<number | null>(null);

  // Initial entrance animation
  useEffect(() => {
    if (!settings.reducedMotion && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    isLitRef.current = isLit;
  }, [isLit]);

  // Enhanced candle flame animations
  useEffect(() => {
    if (!settings.reducedMotion && isLit) {
      const animations: gsap.core.Tween[] = [];
      
      [flame1Ref, flame2Ref].forEach((ref, index) => {
        if (ref.current) {
          // Fluttering flame animation
          const timeline = gsap.timeline({ repeat: -1, delay: index * 0.3 });
          
          timeline.to(ref.current, {
            scaleX: 0.9 + Math.random() * 0.2,
            scaleY: 0.85 + Math.random() * 0.3,
            x: (Math.random() - 0.5) * 6,
            rotation: (Math.random() - 0.5) * 10,
            duration: 0.2 + Math.random() * 0.2,
            ease: 'sine.inOut',
          }).to(ref.current, {
            scaleX: 1.1 + Math.random() * 0.2,
            scaleY: 1.05 + Math.random() * 0.3,
            x: (Math.random() - 0.5) * 8,
            rotation: (Math.random() - 0.5) * 8,
            duration: 0.25 + Math.random() * 0.2,
            ease: 'sine.inOut',
          }).to(ref.current, {
            scaleX: 1,
            scaleY: 1,
            x: 0,
            rotation: 0,
            duration: 0.3 + Math.random() * 0.2,
            ease: 'sine.inOut',
          });
          
          animations.push(timeline);
        }
      });

      // Candle glow animation
      [candle1Ref, candle2Ref].forEach((ref, index) => {
        if (ref.current) {
          const anim = gsap.to(ref.current, {
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.6)',
            duration: 1.5 + index * 0.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
          animations.push(anim);
        }
      });

      return () => animations.forEach(anim => anim.kill());
    }
  }, [isLit, settings.reducedMotion]);

  const requestMicrophoneAccess = async () => {
    try {
      setMicActive(true);
      
      // Visual feedback
      if (!settings.reducedMotion) {
        gsap.to('.mic-button', {
          scale: 1.1,
          duration: 0.3,
          ease: 'back.out(1.7)',
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.7;
      
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const volumeHistory: number[] = [];

      const checkBlowing = () => {
        if (!isLitRef.current) {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        const lowFreq = dataArray.slice(0, Math.floor(dataArray.length / 4));
        const average = lowFreq.reduce((a, b) => a + b, 0) / lowFreq.length;
        
        // Smooth the blow strength
        volumeHistory.push(average);
        if (volumeHistory.length > 10) volumeHistory.shift();
        const smoothedAverage = volumeHistory.reduce((a, b) => a + b, 0) / volumeHistory.length;
        
        setBlowStrength(smoothedAverage);

        // Visual feedback for blowing
        if (smoothedAverage > 15) {
          if (!settings.reducedMotion) {
            [flame1Ref, flame2Ref].forEach((ref, index) => {
              if (ref.current) {
                gsap.to(ref.current, {
                  x: index % 2 === 0 ? -smoothedAverage / 2 : smoothedAverage / 2,
                  rotation: index % 2 === 0 ? -smoothedAverage / 3 : smoothedAverage / 3,
                  duration: 0.1,
                  ease: 'power1.out',
                });
              }
            });
          }
        }

        if (smoothedAverage > 45) {
          setShowWishPrompt(true);
          blowOut();
        } else {
          animationFrameRef.current = requestAnimationFrame(checkBlowing);
        }
      };

      checkBlowing();
    } catch (error) {
      console.log('Microphone access denied, using fallback button');
      setMicActive(false);
    }
  };

  const blowOut = () => {
    if (!isLit || isBlowing) return;

    setIsBlowing(true);
    isLitRef.current = false;
    setWishMade(true);

    // Visual wish confirmation
    if (wishRef.current && !settings.reducedMotion) {
      gsap.fromTo(wishRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' }
      );
    }

    // Stop microphone if active
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (!settings.reducedMotion) {
      // Enhanced blow-out animation
      [flame1Ref, flame2Ref].forEach((ref, index) => {
        if (ref.current) {
          gsap.timeline({
            delay: index * 0.1,
            onComplete: () => {
              if (ref.current) ref.current.style.opacity = '0';
            }
          })
            .to(ref.current, {
              scaleX: 1.5,
              scaleY: 0.3,
              x: index % 2 === 0 ? -20 : 20,
              rotation: index % 2 === 0 ? -30 : 30,
              duration: 0.2,
              ease: 'power3.in',
            })
            .to(ref.current, {
              scaleX: 0,
              scaleY: 0,
              opacity: 0,
              duration: 0.3,
              ease: 'expo.out',
            });
        }
      });

      // Smoke effect
      [candle1Ref, candle2Ref].forEach((ref, index) => {
        if (ref.current) {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              const smoke = document.createElement('div');
              smoke.className = 'absolute w-4 h-4 bg-gradient-to-b from-gray-300/70 to-transparent rounded-full';
              smoke.style.left = `${50 + (index === 0 ? -40 : 40)}%`;
              smoke.style.top = '20%';
              smoke.style.filter = 'blur(4px)';
              ref.current?.parentElement?.appendChild(smoke);

              gsap.to(smoke, {
                y: -100,
                x: (Math.random() - 0.5) * 60,
                opacity: 0,
                scale: 3,
                rotation: 360,
                duration: 2 + Math.random(),
                ease: 'power2.out',
                onComplete: () => smoke.remove(),
              });
            }, i * 100);
          }
        }
      });
    }

    if (settings.soundEnabled) {
      audioManager.play('success');
    }

    setTimeout(() => {
      setIsLit(false);
      updateProgress({ candleBlown: true });
      setIsBlowing(false);
      setBlowStrength(0);
    }, 1000);
  };

  const makeWish = () => {
    setWishMade(true);
    setTimeout(() => {
      setShowWishPrompt(false);
      blowOut();
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.warn);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden 
                 bg-gradient-to-br from-purple-950 via-indigo-950 to-pink-900"
    >
      {/* Enhanced Background Layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/90 via-indigo-950/80 to-pink-900/90" />
        
        {/* Star particles */}
        {isLit && <AdaptiveParticleSystem count={200} color="#fbbf24" speed={0.3} size={1.5} />}
        
        {/* Floating magical particles */}
        {isLit && !isBlowing && (
          <AdaptiveParticleSystem count={80} color="#ffffff" speed={0.1} size={2} />
        )}
        
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[80vh] h-[80vh] bg-radial-gradient(ellipse_at_center,rgba(251,191,36,0.05),transparent_70%)" />
      </div>

      {/* Animated decorative elements */}
      <div className="absolute top-8 left-8 text-3xl opacity-20 animate-float">✨</div>
      <div className="absolute top-12 right-10 text-2xl opacity-15 animate-float" style={{ animationDelay: '1s' }}>🕯️</div>
      <div className="absolute bottom-16 left-12 text-2xl opacity-15 animate-float" style={{ animationDelay: '2s' }}>🌟</div>
      <div className="absolute bottom-10 right-12 text-3xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🎇</div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-pink-500/20 
                          blur-2xl rounded-full" />
            <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-3
                          drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">
              <span className="font-cursive bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 
                             bg-clip-text text-transparent">
                Make a Wish
              </span>
              <span className="ml-4 text-4xl sm:text-5xl">🌟</span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-purple-200/90 font-elegant max-w-2xl mx-auto">
            Blow out the candles and make your birthday wish come true!
          </p>
        </div>

        {/* Candles Display */}
        <div className="relative mb-12 sm:mb-20">
          {/* Wish Message */}
          {wishMade && (
            <div 
              ref={wishRef}
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-md 
                        bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
                        backdrop-blur-lg rounded-2xl p-4 border border-yellow-400/30
                        text-center z-20"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-lg font-semibold text-white">
                  Your wish has been made!
                </span>
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <p className="text-yellow-200/80 text-sm">
                The birthday magic is working its wonders...
              </p>
            </div>
          )}

          <div className="flex gap-10 sm:gap-16 relative">
            {[1, 2].map((candle, index) => (
              <div key={candle} className="relative group">
                {/* Candle */}
                <div 
                  ref={index === 0 ? candle1Ref : candle2Ref}
                  className={`w-14 sm:w-16 h-64 sm:h-72 rounded-t-2xl rounded-b-lg shadow-2xl 
                            transition-all duration-300 ${index === 0 ? 
                            'bg-gradient-to-b from-red-500/90 via-red-600 to-red-700' : 
                            'bg-gradient-to-b from-blue-500/90 via-blue-600 to-blue-700'}`}
                  style={{
                    boxShadow: isLit ? 
                      `0 10px 40px rgba(251, 191, 36, 0.4), 
                       inset 0 -20px 30px rgba(0, 0, 0, 0.3)` : 
                      'inset 0 -20px 30px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Candle wax drips */}
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-8 h-12 
                                bg-gradient-to-b from-yellow-600/40 to-transparent rounded-full" />
                  <div className="absolute top-2/3 right-2 w-4 h-8 
                                bg-gradient-to-b from-yellow-600/30 to-transparent rounded-full" />
                  <div className="absolute bottom-1/3 left-3 w-6 h-10 
                                bg-gradient-to-b from-yellow-600/30 to-transparent rounded-full" />
                </div>

                {/* Flame with enhanced glow */}
                {isLit && (
                  <div
                    ref={index === 0 ? flame1Ref : flame2Ref}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                  >
                    {/* Outer glow */}
                    <div className="absolute w-24 h-24 -top-6 -left-8 
                                  bg-gradient-to-t from-yellow-400/20 to-transparent 
                                  rounded-full blur-xl" />
                    
                    {/* Flame core */}
                    <div className="relative w-8 h-12">
                      <div className="absolute w-full h-full bg-gradient-to-t 
                                    from-yellow-300 via-orange-400 to-transparent 
                                    rounded-full blur-[2px]" />
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 
                                    w-4 h-6 bg-gradient-to-t from-white to-yellow-200 
                                    rounded-full blur-[1px]" />
                    </div>
                    
                    {/* Flame tip */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 
                                  w-3 h-4 bg-gradient-to-t from-yellow-200 to-transparent 
                                  rounded-t-full" />
                  </div>
                )}

                {/* Candle number */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 
                              text-white/60 font-display text-sm">
                  {index === 0 ? '🎂' : '🎉'}
                </div>
              </div>
            ))}
          </div>

          {/* Blow Strength Indicator */}
          {isLit && blowStrength > 0 && micActive && (
            <div className="mt-6 sm:mt-8 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <Wind className="w-5 h-5 text-blue-300" />
                <span className="text-white/80 font-elegant">Blow strength</span>
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-red-500 
                              animate-pulse" />
              </div>
              <div className="w-48 sm:w-64 h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 
                            rounded-full transition-all duration-150"
                  style={{ width: `${Math.min(blowStrength * 2, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-white/60">
                {blowStrength > 35 ? 'Keep blowing!' : 'Blow harder!'}
              </div>
            </div>
          )}
        </div>

        {/* Interaction Controls */}
        {isLit ? (
          <div className="flex flex-col gap-6 items-center w-full max-w-md">
            {/* Wish Prompt */}
            {showWishPrompt && !wishMade && (
              <div className="animate-pulse bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
                            backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/40 
                            text-center w-full mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">
                  ✨ Make Your Wish! ✨
                </h3>
                <p className="text-yellow-200/80 mb-4">
                  Close your eyes, think of your wish...
                </p>
                <Button
                  onClick={makeWish}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 
                           hover:from-yellow-600 hover:to-orange-600"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Make My Wish
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {/* Microphone Button */}
              <Button
                onClick={requestMicrophoneAccess}
                size="lg"
                variant="outline"
                className={`mic-button h-auto py-6 backdrop-blur-lg border 
                          ${micActive ? 
                            'border-green-500/50 bg-green-500/10' : 
                            'border-white/30 bg-white/10'} 
                          hover:bg-white/20 transition-all duration-300`}
                disabled={micActive}
              >
                <div className="flex flex-col items-center gap-3">
                  {micActive ? (
                    <>
                      <div className="relative">
                        <Mic className="w-8 h-8 text-green-400" />
                        <div className="absolute -inset-2 bg-green-500/20 rounded-full animate-ping" />
                      </div>
                      <span className="text-white text-lg">Listening...</span>
                      <span className="text-green-300/80 text-sm">Blow into microphone</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-8 h-8 text-white" />
                      <span className="text-white text-lg">Use Microphone</span>
                      <span className="text-white/60 text-sm">For realistic blowing</span>
                    </>
                  )}
                </div>
              </Button>

              {/* Manual Blow Button */}
              <Button
                onClick={blowOut}
                size="lg"
                className="h-auto py-6 bg-gradient-to-r from-purple-500 to-pink-500 
                         hover:from-purple-600 hover:to-pink-600 
                         transition-all duration-300 group"
                disabled={isBlowing}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="text-2xl group-hover:scale-110 transition-transform">
                      💨
                    </div>
                    {isBlowing && (
                      <div className="absolute -inset-2 bg-white/20 rounded-full animate-ping" />
                    )}
                  </div>
                  <span className="text-white text-lg">
                    {isBlowing ? 'Making Wish...' : 'Blow Out Candles'}
                  </span>
                  <span className="text-white/80 text-sm">Click to blow</span>
                </div>
              </Button>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-white/70">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span className="text-sm">
                  Sound: {settings.soundEnabled ? 'On' : 'Off'}
                </span>
              </div>
              <div className="h-4 w-px bg-white/30" />
              <div className="text-sm text-white/60">
                Make sure to make a wish before blowing!
              </div>
            </div>
          </div>
        ) : (
          /* Celebration Screen */
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <div className="mb-8">
              <div className="flex justify-center gap-4 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-4xl sm:text-5xl animate-float" 
                       style={{ animationDelay: `${i * 0.2}s` }}>
                    {['✨', '🎉', '✨'][i]}
                  </div>
                ))}
              </div>
              
              <div className="relative inline-block mb-6">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-pink-500/30 
                              blur-2xl rounded-full" />
                <p className="relative text-3xl sm:text-4xl text-white font-bold 
                            drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                  Wish granted!
                </p>
              </div>

              <p className="text-xl text-purple-200/90 mb-8 font-elegant max-w-md mx-auto">
                Your birthday wish is on its way to becoming reality!
              </p>
            </div>

            <Button
              onClick={() => navigateTo('gifts')}
              size="lg"
              className="group px-10 py-6 text-xl 
                       bg-gradient-to-r from-yellow-500 to-orange-500 
                       hover:from-yellow-600 hover:to-orange-600
                       rounded-2xl shadow-2xl shadow-yellow-900/30"
            >
              <PartyPopper className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              Open Your Birthday Gifts!
              <span className="ml-3 text-2xl">🎁</span>
            </Button>

            <p className="mt-6 text-sm text-purple-300/70 font-elegant">
              Your magical birthday journey continues...
            </p>
          </div>
        )}

        {/* Back Navigation */}
        <div className="mt-12 sm:mt-16">
          <Button
            onClick={() => navigateTo('room')}
            variant="ghost"
            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 
                     backdrop-blur-sm border border-white/20"
          >
            ← Back to Room
          </Button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
