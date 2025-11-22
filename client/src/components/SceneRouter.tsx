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
  const { currentScene, previousScene, isTransitioning, setTransitioning } = useSceneStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !previousScene) return;

    setTransitioning(true);

    const tl = gsap.timeline({
      onComplete: () => setTransitioning(false)
    });

    tl.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: 'power3.in',
    })
    .set(containerRef.current, { opacity: 0 })
    .to(containerRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'power3.out',
    });

    return () => {
      tl.kill();
    };
  }, [currentScene, previousScene, setTransitioning]);

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
