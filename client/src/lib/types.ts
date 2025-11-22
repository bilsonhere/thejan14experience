export type SceneType = 'intro' | 'midnight' | 'room' | 'ladder' | 'cake' | 'candle' | 'gifts';

export interface Scene {
  name: SceneType;
  init: () => void;
  destroy: () => void;
  timeline?: () => gsap.core.Timeline;
}

export interface GameProgress {
  ladderProgress: number;
  cakeSliced: boolean;
  candleBlown: boolean;
  giftsOpened: number[];
  unlockedGifts: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}
