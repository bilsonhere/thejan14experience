import { useState } from 'react';
import { Home, Music, Settings, Cake, Gift, Layers, Keyboard, Image } from 'lucide-react';
import { useSceneStore } from '../lib/stores/useSceneStore';
import { audioManager } from '../lib/audioManager';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Dialog, DialogContent } from './ui/dialog';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { WallpaperUpload } from './WallpaperUpload';

export function FloatingUI() {
  const { navigateTo, currentScene, settings, toggleSound, toggleReducedMotion, toggleHighContrast } = useSceneStore();
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showWallpaperUpload, setShowWallpaperUpload] = useState(false);

  const handleSoundToggle = () => {
    toggleSound();
    audioManager.setEnabled(!settings.soundEnabled);
  };

  if (currentScene === 'intro') return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2" role="navigation" aria-label="Main navigation">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigateTo('room')}
        aria-label="Go to Room"
        className="backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white border border-white/20"
      >
        <Home className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigateTo('ladder')}
        aria-label="Go to Ladder Game"
        className="backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white border border-white/20"
      >
        <Layers className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigateTo('cake')}
        aria-label="Go to Cake"
        className="backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white border border-white/20"
      >
        <Cake className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigateTo('gifts')}
        aria-label="Go to Gifts"
        className="backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white border border-white/20"
      >
        <Gift className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        onClick={handleSoundToggle}
        aria-label={settings.soundEnabled ? 'Mute sound' : 'Unmute sound'}
        className="backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white border border-white/20"
      >
        <Music className={`h-4 w-4 ${!settings.soundEnabled ? 'opacity-50' : ''}`} />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Settings"
            className="backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white border border-white/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="backdrop-blur-md bg-black/80 text-white border-white/20">
          <DropdownMenuCheckboxItem
            checked={settings.soundEnabled}
            onCheckedChange={handleSoundToggle}
          >
            Sound Effects
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={settings.reducedMotion}
            onCheckedChange={toggleReducedMotion}
          >
            Reduced Motion
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={settings.highContrast}
            onCheckedChange={toggleHighContrast}
          >
            High Contrast
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowWallpaperUpload(true)}>
            <Image className="h-4 w-4 mr-2" />
            Customize Wallpaper
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowKeyboardShortcuts(true)}>
            <Keyboard className="h-4 w-4 mr-2" />
            Keyboard Shortcuts
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigateTo('intro')}>
            Return to Start
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <KeyboardShortcutsModal 
        open={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />

      <Dialog open={showWallpaperUpload} onOpenChange={setShowWallpaperUpload}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/30">
          <WallpaperUpload onClose={() => setShowWallpaperUpload(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
