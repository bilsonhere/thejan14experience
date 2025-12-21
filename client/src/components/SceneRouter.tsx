import { useEffect, useRef } from 'react';
import { useSceneStore } from '../lib/stores/useSceneStore';
import gsap from 'gsap';

import { IntroScene } from './scenes/IntroScene';
import { MidnightScene } from './scenes/MidnightScene';
import { RoomScene } from './scenes/RoomScene';
import { LadderScene } from './scenes/LadderScene';
import { CakeScene } from './scenes/CakeScene';
import { CandleScene } from './scenes/CandleScene';
import { GiftsScene } from './scenes/GiftsScene';

export function SceneRouter() {
  const { currentScene, previousScene, isTransitioning, setTransitioning, settings } = useSceneStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current || !previousScene) return;

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    if (settings.reducedMotion) {
      // Instant transition for reduced motion
      setTransitioning(false);
      return;
    }

    setTransitioning(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setTransitioning(false);
        timelineRef.current = null;
      }
    });

    tl.to(containerRef.current, {
      opacity: 0,
      scale: 0.96,
      duration: 0.35,
      ease: 'power3.in',
    })
    .set(containerRef.current, { opacity: 0 })
    .to(containerRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'expo.out',
    });

    timelineRef.current = tl;

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [currentScene, previousScene, setTransitioning, settings.reducedMotion]);

  const renderScene = () => {
    switch (currentScene) {
      case 'intro':
        return <IntroScene />;
      case 'midnight':
        return <MidnightScene />;
      case 'room':
        return <RoomScene />;
      case 'ladder':
        return <LadderScene />;
      case 'cake':
        return <CakeScene />;
      case 'candle':
        return <CandleScene />;
      case 'gifts':
        return <GiftsScene />;
      default:
        return <IntroScene />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ willChange: 'opacity, transform' }}
    >
      {renderScene()}
    </div>
  );
}
