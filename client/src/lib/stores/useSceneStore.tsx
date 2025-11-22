import { create } from 'zustand';
import { SceneType, GameProgress } from '../types';

interface SceneState {
  currentScene: SceneType;
  previousScene: SceneType | null;
  isTransitioning: boolean;
  progress: GameProgress;
  settings: {
    soundEnabled: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    customWallpaper: string | null;
  };
  
  navigateTo: (scene: SceneType) => void;
  setTransitioning: (transitioning: boolean) => void;
  updateProgress: (updates: Partial<GameProgress>) => void;
  toggleSound: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  setCustomWallpaper: (url: string | null) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  currentScene: 'intro',
  previousScene: null,
  isTransitioning: false,
  progress: {
    ladderProgress: 0,
    cakeSliced: false,
    candleBlown: false,
    giftsOpened: [],
    unlockedGifts: false,
  },
  settings: {
    soundEnabled: true,
    reducedMotion: false,
    highContrast: false,
    customWallpaper: null,
  },
  
  navigateTo: (scene) => set((state) => ({
    previousScene: state.currentScene,
    currentScene: scene,
  })),
  
  setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  
  updateProgress: (updates) => set((state) => ({
    progress: { ...state.progress, ...updates }
  })),
  
  toggleSound: () => set((state) => ({
    settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled }
  })),
  
  toggleReducedMotion: () => set((state) => ({
    settings: { ...state.settings, reducedMotion: !state.settings.reducedMotion }
  })),
  
  toggleHighContrast: () => set((state) => ({
    settings: { ...state.settings, highContrast: !state.settings.highContrast }
  })),
  
  setCustomWallpaper: (url) => set((state) => ({
    settings: { ...state.settings, customWallpaper: url }
  })),
}));
