import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { keys: ['Enter'], description: 'Start countdown / Confirm action', scenes: 'Midnight, General' },
    { keys: ['Escape'], description: 'Skip intro / Close modals', scenes: 'Intro, Modals' },
    { keys: ['Space', '↑'], description: 'Climb ladder', scenes: 'Ladder' },
    { keys: ['Tab'], description: 'Navigate UI elements', scenes: 'All scenes' },
    { keys: ['Arrow Keys'], description: 'Navigate options', scenes: 'General' },
    { keys: ['H'], description: 'Go to Home/Room', scenes: 'All scenes' },
    { keys: ['L'], description: 'Go to Ladder', scenes: 'All scenes' },
    { keys: ['C'], description: 'Go to Cake', scenes: 'All scenes' },
    { keys: ['G'], description: 'Go to Gifts', scenes: 'All scenes' },
    { keys: ['M'], description: 'Toggle Music', scenes: 'All scenes' },
    { keys: ['K'], description: 'Show Keyboard Shortcuts', scenes: 'All scenes' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-white/30">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-3">
            <Keyboard className="h-8 w-8" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-6 space-y-4">
          <div className="grid gap-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{shortcut.description}</div>
                  <div className="text-sm text-purple-300/70">{shortcut.scenes}</div>
                </div>
                <div className="flex gap-2">
                  {shortcut.keys.map((key, idx) => (
                    <kbd
                      key={idx}
                      className="px-3 py-2 bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/30 rounded-md text-sm font-mono min-w-[3rem] text-center"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span>💡</span> Accessibility Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li>• All features are keyboard accessible</li>
              <li>• Enable "Reduced Motion" in Settings to minimize animations</li>
              <li>• Enable "High Contrast" mode for better visibility</li>
              <li>• Use Tab to navigate through interactive elements</li>
              <li>• Screen readers are fully supported</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
