import React, { useState } from 'react';
import {
  ACHIEVEMENTS_LIST,
  Achievement,
  loadUnlockedAchievements,
  loadGameStats,
} from '../game/achievements';
import { X, Trophy, CheckCircle, Lock, Sparkles } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const unlockedMap = loadUnlockedAchievements();
  const stats = loadGameStats();
  const totalAchievements = ACHIEVEMENTS_LIST.length;
  const unlockedCount = Object.keys(unlockedMap).length;

  const categories = [
    { id: 'all', label: 'Wszystkie' },
    { id: 'starter', label: 'Start' },
    { id: 'difficulty', label: 'Trudność' },
    { id: 'speed', label: 'Prędkość' },
    { id: 'palette', label: 'Palety' },
    { id: 'mastery', label: 'Mistrz' },
  ];

  const filteredAchievements =
    activeCategory === 'all'
      ? ACHIEVEMENTS_LIST
      : ACHIEVEMENTS_LIST.filter(a => a.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-lg max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Osiągnięcia Maszynisty
              </h2>
              <p className="text-xs text-slate-400">
                Zdobyto: <span className="text-amber-500 font-bold">{unlockedCount}</span> / {totalAchievements} ({Math.round((unlockedCount / totalAchievements) * 100)}%)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div
          className={`px-4 py-2 border-b flex gap-1.5 overflow-x-auto scrollbar-none text-xs font-semibold ${
            isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition active:scale-95 ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : isDark
                  ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List of achievements */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
          {filteredAchievements.map((item: Achievement) => {
            const isUnlocked = Boolean(unlockedMap[item.id]);

            // dynamic progress resolution
            let currentProg = 0;
            let maxProg = 1;
            if (item.id === 'tracks_placed_50') {
              currentProg = Math.min(stats.tracksPlaced, 50);
              maxProg = 50;
            } else if (item.id === 'x_marks_20') {
              currentProg = Math.min(stats.xMarksPlaced, 20);
              maxProg = 20;
            } else if (item.id === 'gemologist') {
              currentProg = Math.min(stats.palettesSeen.length, 5);
              maxProg = 5;
            } else if (item.id === 'station_master_10') {
              currentProg = Math.min(stats.gamesWon, 10);
              maxProg = 10;
            }

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-start gap-3 transition ${
                  isUnlocked
                    ? isDark
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-amber-50/70 border-amber-300'
                    : isDark
                    ? 'bg-slate-800/40 border-slate-800 text-slate-400 opacity-70'
                    : 'bg-slate-50 border-slate-200 text-slate-500 opacity-80'
                }`}
              >
                <div
                  className={`text-2xl p-2 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500/15'
                      : isDark
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isUnlocked ? item.icon : <Lock className="w-5 h-5 text-slate-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3
                      className={`font-bold text-sm ${
                        isUnlocked
                          ? isDark
                            ? 'text-amber-400'
                            : 'text-amber-700'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-700'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Zdobyte
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Zablokowane</span>
                    )}
                  </div>

                  <p className="text-xs mt-0.5 text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Optional progress bar */}
                  {item.progress && !isUnlocked && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((currentProg / maxProg) * 100))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {currentProg}/{maxProg}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`p-3 border-t flex justify-end ${
            isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition active:scale-95"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
