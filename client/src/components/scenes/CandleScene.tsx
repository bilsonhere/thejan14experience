import { useRef, useState, useEffect } from 'react';
import { useSceneStore } from '../../lib/stores/useSceneStore';
import { audioManager } from '../../lib/audioManager';
import { Button } from '../ui/button';
import { AdaptiveParticleSystem } from '../AdaptiveParticleSystem';
import gsap from 'gsap';

export function CandleScene() {
  const { updateProgress, navigateTo, settings } = useSceneStore();
  const [isLit, setIsLit] = useState(true);
  const [isBlowing, setIsBlowing] = useState(false);
  const [blowStrength, setBlowStrength] = useState(0);
  const candle1Ref = useRef<HTMLDivElement>(null);
  const candle2Ref = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isLitRef = useRef<boolean>(true);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    isLitRef.current = isLit;
  }, [isLit]);

  useEffect(() => {
    if (!settings.reducedMotion && isLit) {
      const animations: gsap.core.Tween[] = [];
      [candle1Ref, candle2Ref].forEach((ref, index) => {
        if (ref.current) {
          const anim = gsap.to(ref.current, {
            scaleY: 1.08,
            opacity: 0.85,
            duration: 0.4 + index * 0.1,
            ease: 'power3.inOut',
            repeat: -1,
            yoyo: true,
          });
          animations.push(anim);
        }
      });
      return () => animations.forEach(anim => anim.kill());
    }
  }, [isLit, settings.reducedMotion]);

  const requestMicrophoneAccess = async () => {
    try {
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
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkBlowing = () => {
        // Use ref to avoid stale closure
        if (!isLitRef.current) {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        // Focus on lower frequencies for blowing detection
        const lowFreq = dataArray.slice(0, Math.floor(dataArray.length / 3));
        const average = lowFreq.reduce((a, b) => a + b, 0) / lowFreq.length;
        
        setBlowStrength(average);

        if (average > 40) {
          blowOut();
        } else {
          animationFrameRef.current = requestAnimationFrame(checkBlowing);
        }
      };

      checkBlowing();
    } catch (error) {
      console.log('Microphone access denied, using fallback button');
    }
  };

  const blowOut = () => {
    if (!isLit || isBlowing) return;

    setIsBlowing(true);
    isLitRef.current = false;

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
      [candle1Ref, candle2Ref].forEach((ref, index) => {
        if (ref.current) {
          gsap.timeline({
            delay: index * 0.08,
          })
            .to(ref.current, {
              scaleX: 0.4,
              x: index % 2 === 0 ? -12 : 12,
              duration: 0.25,
              ease: 'power3.in',
            })
            .to(ref.current, {
              opacity: 0,
              scale: 0,
              duration: 0.35,
              ease: 'expo.out',
            });
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
    }, 500);
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
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      {isLit && <AdaptiveParticleSystem count={100} color="#fbbf24" speed={0.5} size={2} />}

      <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-16 drop-shadow-2xl">
        <span className="font-cursive text-6xl md:text-7xl">Make a Wish</span> 🌟
      </h1>

      <div className="relative mb-16">
        <div className="flex gap-8">
          <div className="relative">
            <div className="w-16 h-48 bg-gradient-to-b from-red-400 to-red-600 rounded-t-full rounded-b-sm shadow-xl" />
            {isLit && (
              <div
                ref={candle1Ref}
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-yellow-500 via-orange-400 to-transparent rounded-full"
                style={{
                  filter: 'blur(2px)',
                  boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
                }}
              />
            )}
          </div>

          <div className="relative">
            <div className="w-16 h-48 bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-full rounded-b-sm shadow-xl" />
            {isLit && (
              <div
                ref={candle2Ref}
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-yellow-500 via-orange-400 to-transparent rounded-full"
                style={{
                  filter: 'blur(2px)',
                  boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
                }}
              />
            )}
          </div>
        </div>

        {isLit && blowStrength > 0 && (
          <div className="mt-4 text-center text-white">
            Blow strength: {Math.round(blowStrength)}
          </div>
        )}
      </div>

      {isLit ? (
        <div className="flex flex-col gap-4 items-center">
          <Button
            onClick={requestMicrophoneAccess}
            size="lg"
            variant="outline"
            className="text-xl px-8 py-6 bg-white/10 backdrop-blur-sm text-white border-white/30"
          >
            🎤 Use Microphone
          </Button>
          
          <p className="text-white/70">or</p>
          
          <Button
            onClick={blowOut}
            size="lg"
            className="text-xl px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            💨 Blow Out Candles
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-6">✨🎉✨</div>
          <p className="text-3xl text-white mb-8">Wish granted!</p>
          <Button
            onClick={() => navigateTo('gifts')}
            size="lg"
            className="text-xl px-8 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            Open Your Gifts! 🎁
          </Button>
        </div>
      )}
    </div>
  );
}
