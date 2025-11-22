import { useEffect, useState } from 'react';
import { Trophy, Star, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useSceneStore } from '../lib/stores/useSceneStore';
import Confetti from 'react-confetti';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: () => boolean;
}

const THEMES = [
  { id: 'cosmic', name: 'Cosmic Dream', colors: 'from-indigo-900 via-purple-900 to-pink-900', locked: false },
  { id: 'sunset', name: 'Sunset Glow', colors: 'from-orange-600 via-pink-600 to-purple-600', locked: true, requirement: 'Visit all scenes' },
  { id: 'ocean', name: 'Ocean Breeze', colors: 'from-blue-900 via-teal-700 to-cyan-600', locked: true, requirement: 'Complete ladder' },
  { id: 'aurora', name: 'Aurora Lights', colors: 'from-green-600 via-blue-600 to-purple-600', locked: true, requirement: 'Open all gifts' },
  { id: 'midnight', name: 'Midnight Magic', colors: 'from-slate-950 via-purple-950 to-indigo-950', locked: true, requirement: 'Master all achievements' },
];

export function AchievementSystem() {
  const { progress } = useSceneStore();
  const [showModal, setShowModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [visitedScenes, setVisitedScenes] = useState<Set<string>>(new Set());
  const [selectedTheme, setSelectedTheme] = useState('cosmic');

  useEffect(() => {
    const handleSceneVisit = () => {
      const currentScene = useSceneStore.getState().currentScene;
      setVisitedScenes(prev => new Set(prev).add(currentScene));
    };

    const unsubscribe = useSceneStore.subscribe(handleSceneVisit);
    return () => unsubscribe();
  }, []);

  const achievements: Achievement[] = [
    {
      id: 'explorer',
      title: 'Scene Explorer',
      description: 'Visit all 7 scenes',
      icon: '🗺️',
      unlocked: visitedScenes.size >= 7,
      condition: () => visitedScenes.size >= 7,
    },
    {
      id: 'climber',
      title: 'Master Climber',
      description: 'Reach level 20 in the ladder game',
      icon: '🪜',
      unlocked: progress.ladderProgress >= 20,
      condition: () => progress.ladderProgress >= 20,
    },
    {
      id: 'baker',
      title: 'Expert Baker',
      description: 'Slice the birthday cake',
      icon: '🎂',
      unlocked: progress.cakeSliced || false,
      condition: () => progress.cakeSliced || false,
    },
    {
      id: 'wisher',
      title: 'Wish Maker',
      description: 'Blow out the candles',
      icon: '🕯️',
      unlocked: progress.candleBlown || false,
      condition: () => progress.candleBlown || false,
    },
    {
      id: 'collector',
      title: 'Gift Collector',
      description: 'Open all 6 birthday gifts',
      icon: '🎁',
      unlocked: (progress.giftsOpened?.length || 0) >= 6,
      condition: () => (progress.giftsOpened?.length || 0) >= 6,
    },
    {
      id: 'perfectionist',
      title: 'Birthday Perfectionist',
      description: 'Complete all achievements',
      icon: '🌟',
      unlocked: false,
      condition: function() {
        return achievements.slice(0, -1).every(a => a.unlocked);
      },
    },
  ];

  achievements[5].unlocked = achievements.slice(0, 5).every(a => a.unlocked);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const unlockedThemes = THEMES.filter((theme, index) => {
    if (index === 0) return true;
    if (index === 1) return visitedScenes.size >= 7;
    if (index === 2) return progress.ladderProgress >= 20;
    if (index === 3) return (progress.giftsOpened?.length || 0) >= 6;
    if (index === 4) return achievements[5].unlocked;
    return false;
  });

  useEffect(() => {
    if (achievements[5].unlocked && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [achievements[5].unlocked]);

  const applyTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      document.body.setAttribute('data-theme', themeId);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="secondary"
        size="icon"
        className="backdrop-blur-sm bg-black/30 hover:bg-black/50 text-white border border-white/20"
        aria-label="View Achievements"
      >
        <Trophy className="h-4 w-4" />
      </Button>

      {showCelebration && <Confetti recycle={false} numberOfPieces={800} />}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-white/30">
          <DialogHeader>
            <DialogTitle className="text-3xl flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-400" />
              Achievements & Themes
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Achievements ({unlockedCount}/{achievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
                        : 'bg-white/5 border-white/10 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{achievement.title}</h4>
                        <p className="text-sm text-purple-200/70">{achievement.description}</p>
                        {achievement.unlocked && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-400/50 rounded-full text-xs">
                            <Zap className="h-3 w-3" />
                            Unlocked!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/20 pt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🎨</span>
                Visual Themes ({unlockedThemes.length}/{THEMES.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {THEMES.map((theme) => {
                  const isUnlocked = unlockedThemes.some(t => t.id === theme.id);
                  return (
                    <button
                      key={theme.id}
                      onClick={() => isUnlocked && applyTheme(theme.id)}
                      disabled={!isUnlocked}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isUnlocked
                          ? `bg-gradient-to-r ${theme.colors} border-white/30 hover:scale-105 cursor-pointer ${
                              selectedTheme === theme.id ? 'ring-2 ring-yellow-400' : ''
                            }`
                          : 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-semibold text-lg mb-1">{theme.name}</div>
                      {!isUnlocked && theme.requirement && (
                        <div className="text-xs text-purple-200/60">🔒 {theme.requirement}</div>
                      )}
                      {isUnlocked && selectedTheme === theme.id && (
                        <div className="mt-2 text-xs text-yellow-300">✓ Active</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {achievements[5].unlocked && (
              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-xl text-center">
                <div className="text-5xl mb-3">🏆</div>
                <h3 className="text-2xl font-bold mb-2">Master Achievement Unlocked!</h3>
                <p className="text-purple-200">You've completed all achievements! You're a birthday celebration champion! 🎉</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
