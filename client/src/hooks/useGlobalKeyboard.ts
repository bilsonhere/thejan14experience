import { useEffect } from 'react';
import { useSceneStore } from '../lib/stores/useSceneStore';
import { audioManager } from '../lib/audioManager';

export function useGlobalKeyboard() {
  const { navigateTo, toggleSound, settings } = useSceneStore();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'h':
          navigateTo('room');
          break;
        case 'l':
          navigateTo('ladder');
          break;
        case 'c':
          navigateTo('cake');
          break;
        case 'g':
          navigateTo('gifts');
          break;
        case 'm':
          toggleSound();
          audioManager.setEnabled(!settings.soundEnabled);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigateTo, toggleSound, settings.soundEnabled]);
}
