import { useEffect } from "react";
import { useSceneStore } from "./lib/stores/useSceneStore";
import { SceneRouter } from "./components/SceneRouter";
import { FloatingUI } from "./components/FloatingUI";
import { audioManager } from "./lib/audioManager";
import { useGlobalKeyboard } from "./hooks/useGlobalKeyboard";
import { initCustomCursor } from "./lib/customCursor";
import "@fontsource/inter";

function App() {
  const { settings } = useSceneStore();
  useGlobalKeyboard();

  useEffect(() => {
    audioManager.init();

    const handleUserInteraction = () => {
      if (settings.soundEnabled) {
        audioManager.playMusic();
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [settings.soundEnabled]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const currentSetting = useSceneStore.getState().settings.reducedMotion;
    
    if (mediaQuery.matches && !currentSetting) {
      useSceneStore.getState().toggleReducedMotion();
    }
  }, []);

  useEffect(() => {
    document.body.dataset.reducedMotion = settings.reducedMotion ? 'true' : 'false';
    document.body.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.highContrast, settings.reducedMotion]);

  useEffect(() => {
    const destroyCursor = initCustomCursor({ disabled: settings.reducedMotion });
    return destroyCursor;
  }, [settings.reducedMotion]);

  return (
    <div className="w-screen h-screen relative overflow-hidden glass-app-shell">
      <div className="glass-card glass-app-surface">
        <SceneRouter />
        <FloatingUI />
      </div>
    </div>
  );
}

export default App;
