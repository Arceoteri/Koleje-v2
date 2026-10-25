import React from 'react';
import { BoardSize, Difficulty } from '../game/types';
import { Trophy, Clock, Footprints, RotateCcw, TrendingUp, Maximize2, Eye, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgainSame: () => void;
  onIncreaseDifficulty: () => void;
  onIncreaseSize: () => void;
  currentDifficulty: Difficulty;
  currentSize: BoardSize;
  moves: number;
  seconds: number;
  hintsUsed: number;
}

const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
  very_hard: 'Bardzo trudny',
  extreme: 'Ekstremalny',
};

const NEXT_DIFFICULTY: Record<Difficulty, Difficulty> = {
  easy: 'medium',
  medium: 'hard',
  hard: 'very_hard',
  very_hard: 'extreme',
  extreme: 'easy',
};

const NEXT_SIZE: Record<BoardSize, BoardSize> = {
  5: 6,
  6: 8,
  8: 5,
};

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  onPlayAgainSame,
  onIncreaseDifficulty,
  onIncreaseSize,
  currentDifficulty,
  currentSize,
  moves,
  seconds,
  hintsUsed,
}) => {
  if (!isOpen) return null;

  const nextDiff = NEXT_DIFFICULTY[currentDifficulty];
  const nextSize = NEXT_SIZE[currentSize];

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.35)] overflow-hidden p-6 sm:p-7 text-slate-100 animate-scale-in">
        
        {/* Glow header banner */}
        <div className="text-center mb-6">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/30 border border-amber-400/40 text-amber-400 mb-3 shadow-[0_0_24px_rgba(251,191,36,0.3)]">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
            Tor Kolejowy Gotowy!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Wspaniała trasa! Wszystkie odcinki są połączone i zgodne z oznaczeniami.
          </p>
        </div>

        {/* Stats summary cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Czas</span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-100">{formatTime(seconds)}</div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1">
              <Footprints className="w-3.5 h-3.5 text-amber-400" />
              <span>Ruchy</span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-100">{moves}</div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Wskazówki</span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-100">{hintsUsed}</div>
          </div>
        </div>

        {/* Decision choices requested by user */}
        <div className="space-y-2.5">
          {/* 1. Play again on same level */}
          <button
            onClick={onPlayAgainSame}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950/20 rounded-xl">
                <RotateCcw className="w-4 h-4 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="font-extrabold">Nowa gra (ten sam poziom)</div>
                <div className="text-xs text-slate-800 font-medium">
                  {currentSize}x{currentSize} • {DIFFICULTY_NAMES[currentDifficulty]}
                </div>
              </div>
            </div>
            <span className="text-xs uppercase tracking-wider font-black px-2 py-1 bg-slate-950/15 rounded-lg">Graj</span>
          </button>

          {/* 2. Increase difficulty */}
          <button
            onClick={onIncreaseDifficulty}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-amber-500/40 text-slate-100 font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-slate-100">Zwiększ poziom trudności</div>
                <div className="text-xs text-slate-400 font-normal">
                  Przejdź na poziom: <strong className="text-amber-400">{DIFFICULTY_NAMES[nextDiff]}</strong>
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-700 text-amber-300 rounded-lg">Wybierz</span>
          </button>

          {/* 3. Increase board size */}
          <button
            onClick={onIncreaseSize}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-emerald-500/40 text-slate-100 font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-slate-100">Zwiększ wielkość planszy</div>
                <div className="text-xs text-slate-400 font-normal">
                  Większy teren kolejowy: <strong className="text-emerald-400">{nextSize}x{nextSize}</strong>
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-700 text-emerald-300 rounded-lg">Wybierz</span>
          </button>

          {/* 4. Admire the created route / close modal */}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Przejrzyj ułożoną trasę na planszy</span>
          </button>
        </div>

      </div>
    </div>
  );
};
