/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BoardSize,
  Difficulty,
  GemPalette,
  GemPaletteId,
  Puzzle,
  TrackType,
} from './game/types';
import { generateTrainTrackPuzzle } from './game/generator';
import { validatePlayerBoard, ValidationResult } from './game/validator';
import { TrackTile, TrackMiniPreview } from './components/TrackTile';
import { RulesModal } from './components/RulesModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { VictoryModal } from './components/VictoryModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { soundManager } from './utils/audio';
import {
  ACHIEVEMENTS_LIST,
  saveUnlockedAchievement,
  loadUnlockedAchievements,
  loadGameStats,
  saveGameStats,
} from './game/achievements';
import {
  Palette,
  Sun,
  Moon,
  HelpCircle,
  RotateCcw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  Footprints,
  Train,
  ArrowRight,
  Eraser,
  X as XIcon,
  Volume2,
  VolumeX,
  Trophy,
  Lightbulb,
  Undo2,
  RefreshCw,
} from 'lucide-react';

// 5 Gemstone Palettes - NO Diamond, as requested!
const GEM_PALETTES: GemPalette[] = [
  {
    id: 'ruby',
    name: 'Ruby',
    polishName: 'Rubin',
    gemColor: '#ef4444',
    railColor: '#dc2626',
    baseColor: '#f87171',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    polishName: 'Szmaragd',
    gemColor: '#10b981',
    railColor: '#059669',
    baseColor: '#34d399',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    polishName: 'Szafir',
    gemColor: '#3b82f6',
    railColor: '#2563eb',
    baseColor: '#60a5fa',
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    polishName: 'Ametyst',
    gemColor: '#a855f7',
    railColor: '#9333ea',
    baseColor: '#c084fc',
  },
  {
    id: 'topaz',
    name: 'Topaz',
    polishName: 'Topaz',
    gemColor: '#f59e0b',
    railColor: '#d97706',
    baseColor: '#fbbf24',
  },
];

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

type ToolType =
  | 'cycle'
  | 'H'
  | 'V'
  | 'CURVE_TR'
  | 'CURVE_BR'
  | 'CURVE_BL'
  | 'CURVE_TL'
  | 'x'
  | 'erase';

export default function App() {
  const [size, setSize] = useState<BoardSize>(6);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [paletteIndex, setPaletteIndex] = useState<number>(0);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const [toastAchievement, setToastAchievement] = useState<string | null>(null);
  const [hintedCell, setHintedCell] = useState<{ r: number; c: number } | null>(null);
  const [hintToast, setHintToast] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [lockedHintKeys, setLockedHintKeys] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<TrackType[][][]>([]);
  const [erasingSelection, setErasingSelection] = useState<Set<string>>(new Set());
  const [isDraggingEraser, setIsDraggingEraser] = useState<boolean>(false);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);

  const hintTimeoutRef = useRef<any>(null);
  const hintToastTimeoutRef = useRef<any>(null);
  const longPressTimerRef = useRef<any>(null);
  const isLongPressTriggered = useRef<boolean>(false);

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [board, setBoard] = useState<TrackType[][]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('cycle');

  const [moves, setMoves] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const hasCheckedWithError = useRef<boolean>(false);

  const activePalette = GEM_PALETTES[paletteIndex];

  // Helper to trigger achievement unlock & toast
  const triggerAchievement = useCallback((achievementId: string) => {
    const isNew = saveUnlockedAchievement(achievementId);
    if (isNew) {
      const ach = ACHIEVEMENTS_LIST.find(a => a.id === achievementId);
      if (ach) {
        setToastAchievement(`${ach.icon} ${ach.title}`);
        setTimeout(() => {
          setToastAchievement(null);
        }, 4000);
      }
    }
  }, []);

  // Toggle audio mute
  const toggleMute = () => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
  };

  // Start new game
  const startNewGame = useCallback(
    (newSize: BoardSize = size, newDiff: Difficulty = difficulty) => {
      soundManager.playClick();
      const newPuzzle = generateTrainTrackPuzzle(newSize, newDiff);
      setPuzzle(newPuzzle);
      // Copy initial board
      setBoard(newPuzzle.initialBoard.map(row => [...row]));
      setMoves(0);
      setSeconds(0);
      setIsTimerRunning(true);
      setValidation(null);
      setHintedCell(null);
      setHintToast(null);
      setShowConfetti(false);
      setShowVictoryModal(false);
      setLockedHintKeys(new Set());
      setHistory([]);
      setErasingSelection(new Set());
      setIsDraggingEraser(false);
      setHintsUsedCount(0);
      hasCheckedWithError.current = false;
    },
    [size, difficulty]
  );

  // Initialize on mount
  useEffect(() => {
    startNewGame(size, difficulty);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Window pointerup listener to commit drag eraser safely anywhere
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDraggingEraser) {
        commitDragErase();
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [isDraggingEraser, erasingSelection, board, puzzle, lockedHintKeys]);

  // Batch erase completion
  const commitDragErase = () => {
    setIsDraggingEraser(false);
    if (!puzzle || erasingSelection.size === 0) {
      setErasingSelection(new Set());
      return;
    }

    let hasErasedAny = false;
    const newBoard = board.map(row => [...row]);

    erasingSelection.forEach(key => {
      const [rStr, cStr] = key.split(',');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (!puzzle.fixedCells[r][c] && !lockedHintKeys.has(key)) {
        if (newBoard[r][c] !== 'EMPTY') {
          newBoard[r][c] = 'EMPTY';
          hasErasedAny = true;
        }
      }
    });

    if (hasErasedAny) {
      // Push history before erasing
      setHistory(prev => [...prev.slice(-40), board.map(row => [...row])]);
      setBoard(newBoard);
      // Increment moves counter for the batch erase action
      setMoves(m => m + 1);
      soundManager.playEraseOrX();
      if (validation && !validation.isValid) {
        setValidation(null);
      }
    }
    setErasingSelection(new Set());
  };

  // Undo last move: strictly correlates with moves count and tracking systems as requested
  const handleUndo = () => {
    if (history.length === 0) return;
    soundManager.playClick();
    const previousState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setBoard(previousState.map(row => [...row]));

    // "co istotne i ważne musi to być skorelowane z doliczaniem do licznika wykonanych ruchów i ze wszystkimi systemami naliczającymi ruchy"
    setMoves(m => m + 1);

    const stats = loadGameStats();
    stats.gamesPlayed = (stats.gamesPlayed || 0);
    saveGameStats(stats);

    if (validation && !validation.isValid) {
      setValidation(null);
    }
  };

  // Long press start handler
  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    if (!puzzle) return;
    const key = `${r},${c}`;
    if (puzzle.fixedCells[r][c] || lockedHintKeys.has(key)) return;

    if (activeTool === 'erase') {
      setIsDraggingEraser(true);
      setErasingSelection(new Set([key]));
      return;
    }

    // Long press start timer (~480ms)
    isLongPressTriggered.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      if (board[r][c] !== 'EMPTY') {
        // Save history before resetting cell to empty
        setHistory(prev => [...prev.slice(-40), board.map(row => [...row])]);
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = 'EMPTY';
        setBoard(newBoard);
        setMoves(m => m + 1);
        soundManager.playEraseOrX();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(45);
        }
        if (validation && !validation.isValid) {
          setValidation(null);
        }
      }
    }, 480);
  };

  // Pointer enter during drag erase
  const handlePointerEnter = (r: number, c: number) => {
    if (activeTool === 'erase' && isDraggingEraser) {
      const key = `${r},${c}`;
      if (!puzzle?.fixedCells[r][c] && !lockedHintKeys.has(key)) {
        setErasingSelection(prev => {
          if (prev.has(key)) return prev;
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    }
  };

  // Pointer up/cancel clears long press timer
  const handlePointerUpOrCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Touch move hit-tester for drag erase across mobile touchscreens (Android & iOS Safari)
  const handleGridPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingEraser || activeTool !== 'erase') return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const cellEl = target?.closest('[data-cell-pos]');
    if (cellEl) {
      const pos = cellEl.getAttribute('data-cell-pos');
      if (pos) {
        const [rStr, cStr] = pos.split('-');
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);
        const key = `${r},${c}`;
        if (
          !puzzle?.fixedCells[r][c] &&
          !lockedHintKeys.has(key)
        ) {
          setErasingSelection(prev => {
            if (prev.has(key)) return prev;
            const next = new Set(prev);
            next.add(key);
            return next;
          });
        }
      }
    }
  };

  // Handle cell click (with long press suppression and hint/fixed lock enforcement)
  const handleCellClick = (r: number, c: number) => {
    if (isLongPressTriggered.current) {
      isLongPressTriggered.current = false;
      return;
    }
    if (!puzzle) return;
    const key = `${r},${c}`;
    // Cannot edit pre-revealed clue tiles or locked hint tiles!
    if (puzzle.fixedCells[r][c] || lockedHintKeys.has(key)) return;

    // Single click in eraser mode erases cell immediately
    if (activeTool === 'erase') {
      if (board[r][c] !== 'EMPTY') {
        setHistory(prev => [...prev.slice(-40), board.map(row => [...row])]);
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = 'EMPTY';
        setBoard(newBoard);
        setMoves(m => m + 1);
        soundManager.playEraseOrX();
        if (validation && !validation.isValid) {
          setValidation(null);
        }
      }
      return;
    }

    const cycleTypes: TrackType[] = [
      'EMPTY',
      'H',
      'V',
      'CURVE_TR',
      'CURVE_BR',
      'CURVE_BL',
      'CURVE_TL',
      'X',
    ];
    const curr = board[r][c];
    let next: TrackType = curr;

    if (activeTool === 'cycle') {
      const idx = cycleTypes.indexOf(curr);
      next = cycleTypes[(idx + 1) % cycleTypes.length];
    } else if (activeTool === 'H') {
      next = curr === 'H' ? 'EMPTY' : 'H';
    } else if (activeTool === 'V') {
      next = curr === 'V' ? 'EMPTY' : 'V';
    } else if (activeTool === 'x') {
      next = curr === 'X' ? 'EMPTY' : 'X';
    } else if (
      activeTool === 'CURVE_TR' ||
      activeTool === 'CURVE_BR' ||
      activeTool === 'CURVE_BL' ||
      activeTool === 'CURVE_TL'
    ) {
      // Direct placement of selected curve
      next = curr === activeTool ? 'EMPTY' : activeTool;
    }

    if (next !== curr) {
      // Push history before modifying
      setHistory(prev => [...prev.slice(-40), board.map(row => [...row])]);
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = next;
      setBoard(newBoard);
      setMoves(m => m + 1);

      // Play procedural audio
      if (next === 'X' || next === 'EMPTY') {
        soundManager.playEraseOrX();
      } else {
        soundManager.playTrackPlace(next);
      }

      // Update game stats & check step achievements
      const stats = loadGameStats();
      if (next === 'X') {
        stats.xMarksPlaced += 1;
        if (stats.xMarksPlaced >= 20) {
          triggerAchievement('x_marks_20');
        }
      } else if (next !== 'EMPTY') {
        stats.tracksPlaced += 1;
        if (stats.tracksPlaced >= 50) {
          triggerAchievement('tracks_placed_50');
        }
      }
      saveGameStats(stats);

      // Clear previous validation error when user alters board
      if (validation && !validation.isValid) {
        setValidation(null);
      }
    }
  };

  // Reset to initial puzzle state (preserves permanently bought hints)
  const handleReset = () => {
    if (!puzzle) return;
    soundManager.playClick();
    setHistory(prev => [...prev.slice(-40), board.map(row => [...row])]);

    const resetBoard = puzzle.initialBoard.map(row => [...row]);
    lockedHintKeys.forEach(key => {
      const [rStr, cStr] = key.split(',');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      resetBoard[r][c] = puzzle.solution[r][c];
    });

    setBoard(resetBoard);
    setValidation(null);
    setHintedCell(null);
  };

  // Pobierz wskazówkę: reveals correct track with permanent lock & +3 moves penalty
  const handleHint = () => {
    if (!puzzle) return;

    // Find non-fixed & non-hint-locked cells that differ from the puzzle solution
    const emptyCandidates: { r: number; c: number }[] = [];
    const incorrectCandidates: { r: number; c: number }[] = [];

    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const key = `${r},${c}`;
        if (!puzzle.fixedCells[r][c] && !lockedHintKeys.has(key) && board[r][c] !== puzzle.solution[r][c]) {
          if (board[r][c] === 'EMPTY' || board[r][c] === 'X') {
            emptyCandidates.push({ r, c });
          } else {
            incorrectCandidates.push({ r, c });
          }
        }
      }
    }

    // Prioritize empty cells as requested: "ujawnia prawidłowy typ ścieżki dla losowej pustej komórki"
    const pool = emptyCandidates.length > 0 ? emptyCandidates : incorrectCandidates;

    if (pool.length === 0) {
      setHintToast('Wszystkie tory są już ułożone poprawnie! Kliknij Sprawdź Tor.');
      if (hintToastTimeoutRef.current) clearTimeout(hintToastTimeoutRef.current);
      hintToastTimeoutRef.current = setTimeout(() => setHintToast(null), 3200);
      return;
    }

    const target = pool[Math.floor(Math.random() * pool.length)];
    const correctTrack = puzzle.solution[target.r][target.c];
    const hintKey = `${target.r},${target.c}`;

    // Push history before hint
    setHistory(prev => [...prev.slice(-40), board.map(row => [...row])]);

    const newBoard = board.map(row => [...row]);
    newBoard[target.r][target.c] = correctTrack;
    setBoard(newBoard);

    // Lock hinted cell permanently: "Wykupiona odpowiedź nie może być edytowalna i nie można jej zmazać opcja gumka"
    setLockedHintKeys(prev => new Set(prev).add(hintKey));
    setHintsUsedCount(h => h + 1);

    // Apply moves penalty (+3 moves penalty to balance gameplay)
    setMoves(m => m + 3);

    // Audio cue
    soundManager.playTrackPlace(correctTrack);

    // Highlight hinted cell
    setHintedCell(target);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => {
      setHintedCell(null);
    }, 3200);

    // Provide friendly clear Polish feedback
    setHintToast(
      `Wskazówka: ujawniono i zablokowano [Wiersz ${target.r + 1}, Kol. ${target.c + 1}] (+3 ruchy kary)`
    );
    if (hintToastTimeoutRef.current) clearTimeout(hintToastTimeoutRef.current);
    hintToastTimeoutRef.current = setTimeout(() => {
      setHintToast(null);
    }, 4000);

    // Clear prior error state
    if (validation && !validation.isValid) {
      setValidation(null);
    }
  };

  // Verify solution & trigger victory modal
  const handleCheck = () => {
    if (!puzzle) return;
    const result = validatePlayerBoard(board, puzzle);
    setValidation(result);

    if (result.isValid) {
      soundManager.playVictory();
      setIsTimerRunning(false);
      setShowConfetti(true);
      setShowVictoryModal(true);

      // Check all matching win achievements
      triggerAchievement('first_win');
      if (size === 5) triggerAchievement('size_5x5');
      if (size === 6) triggerAchievement('size_6x6');
      if (size === 8) triggerAchievement('size_8x8');

      if (difficulty === 'hard') triggerAchievement('diff_hard');
      if (difficulty === 'very_hard') triggerAchievement('diff_very_hard');
      if (difficulty === 'extreme') triggerAchievement('diff_extreme');

      if (seconds < 60) triggerAchievement('speed_under_60');
      if (size === 5 && seconds < 30) triggerAchievement('speed_5x5_under_30');

      if (!hasCheckedWithError.current) triggerAchievement('flawless_win');
      if (moves < 25) triggerAchievement('efficient_builder');

      // Palette achievements
      if (activePalette.id === 'ruby') triggerAchievement('palette_ruby');
      if (activePalette.id === 'emerald') triggerAchievement('palette_emerald');
      if (activePalette.id === 'sapphire' && isDark) triggerAchievement('palette_sapphire_dark');
      if (activePalette.id === 'amethyst') triggerAchievement('palette_amethyst');
      if (activePalette.id === 'topaz') triggerAchievement('palette_topaz');

      const stats = loadGameStats();
      stats.gamesWon += 1;
      if (stats.gamesWon >= 10) triggerAchievement('station_master_10');
      saveGameStats(stats);
    } else {
      soundManager.playError();
      hasCheckedWithError.current = true;
    }
  };

  // Cycle gem palette
  const togglePalette = () => {
    soundManager.playClick();
    const nextIdx = (paletteIndex + 1) % GEM_PALETTES.length;
    setPaletteIndex(nextIdx);

    const nextPal = GEM_PALETTES[nextIdx];
    const stats = loadGameStats();
    if (!stats.palettesSeen.includes(nextPal.id)) {
      stats.palettesSeen.push(nextPal.id);
      saveGameStats(stats);
      if (stats.palettesSeen.length >= 5) {
        triggerAchievement('gemologist');
      }
    }
  };

  // Format time
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Edge label in Polish for extreme mode
  const getEdgePolish = (edge: string) => {
    switch (edge) {
      case 'TOP':
        return 'GÓRA';
      case 'BOTTOM':
        return 'DÓŁ';
      case 'LEFT':
        return 'LEWO';
      case 'RIGHT':
        return 'PRAWO';
      default:
        return edge;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 font-sans ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Header Bar */}
      <header
        className={`sticky top-0 z-30 px-3 py-2.5 sm:px-6 sm:py-3 border-b backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {/* Title & Logo */}
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg shadow-sm"
              style={{ backgroundColor: activePalette.gemColor }}
            >
              <Train className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight flex items-center gap-1.5">
                Tory Kolejowe
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-amber-500/15 text-amber-500">
                  PWA
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Krzyżówka logiczna Train Tracks
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* PWA Install Button & Offline Badge */}
            <PWAInstallButton />

            {/* Gemstone Palette Button */}
            <button
              type="button"
              onClick={togglePalette}
              title={`Zmień paletę torów (Aktualna: ${activePalette.polishName})`}
              aria-label={`Paleta szyn: ${activePalette.polishName}`}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition active:scale-95 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                  : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" style={{ color: activePalette.gemColor }} />
              <span className="hidden sm:inline">{activePalette.polishName}</span>
              <span
                className="w-2.5 h-2.5 rounded-full inline-block sm:hidden"
                style={{ backgroundColor: activePalette.gemColor }}
              />
            </button>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Włącz jasny motyw' : 'Włącz ciemny motyw'}
              aria-label="Przełącz motyw jasny / ciemny"
              className={`p-1.5 sm:p-2 rounded-lg border transition active:scale-95 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-400'
                  : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Sound Mute / Unmute Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? 'Włącz dźwięki' : 'Wycisz dźwięki'}
              aria-label={isMuted ? 'Włącz dźwięki' : 'Wycisz dźwięki'}
              className={`p-1.5 sm:p-2 rounded-lg border transition active:scale-95 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Achievements Modal Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowAchievements(true);
              }}
              title="Osiągnięcia Maszynisty"
              aria-label="Otwórz listę osiągnięć"
              className={`p-1.5 sm:p-2 rounded-lg border transition active:scale-95 relative ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-400'
                  : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-amber-600'
              }`}
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Rules Modal Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowRules(true);
              }}
              title="Zasady gry"
              aria-label="Otwórz zasady gry"
              className={`p-1.5 sm:p-2 rounded-lg border transition active:scale-95 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-sky-400'
                  : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-sky-600'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Achievement Unlocked Toast Notification */}
      {toastAchievement && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce bg-amber-500 text-slate-950 px-4 py-2 rounded-xl shadow-2xl font-black text-xs sm:text-sm flex items-center gap-2 border-2 border-amber-300">
          <Sparkles className="w-4 h-4" />
          <span>Odblokowano osiągnięcie: {toastAchievement}!</span>
        </div>
      )}

      {/* Hint Toast Notification */}
      {hintToast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 animate-bounce bg-slate-900/95 text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2 border border-amber-500/60 backdrop-blur-md">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{hintToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-3 py-3 sm:py-5 flex flex-col gap-3.5">
        {/* Game Config Bar: Grid Size and Difficulty on the exact same height */}
        <section
          className={`p-1.5 sm:p-2 rounded-2xl border grid grid-cols-2 gap-2 text-xs shadow-sm transition ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Size Select */}
          <div
            className={`flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border transition ${
              isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <label htmlFor="sizeSelect" className="font-semibold text-slate-400 shrink-0">
              Siatka:
            </label>
            <select
              id="sizeSelect"
              value={size}
              onChange={e => {
                const newSize = parseInt(e.target.value) as BoardSize;
                setSize(newSize);
                startNewGame(newSize, difficulty);
              }}
              className={`w-full bg-transparent font-bold focus:outline-none cursor-pointer text-xs text-right pr-1 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              <option value={5} className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>5 × 5</option>
              <option value={6} className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>6 × 6</option>
              <option value={8} className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>8 × 8</option>
            </select>
          </div>

          {/* Difficulty Select */}
          <div
            className={`flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl border transition ${
              isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <label htmlFor="diffSelect" className="font-semibold text-slate-400 shrink-0">
              Trudność:
            </label>
            <select
              id="diffSelect"
              value={difficulty}
              onChange={e => {
                const newDiff = e.target.value as Difficulty;
                setDifficulty(newDiff);
                startNewGame(size, newDiff);
              }}
              className={`w-full bg-transparent font-bold focus:outline-none cursor-pointer text-xs text-right pr-1 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              <option value="easy" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>🟢 Łatwy</option>
              <option value="medium" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>🟡 Średni</option>
              <option value="hard" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>🔴 Trudny</option>
              <option value="very_hard" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>💜 B. trudny</option>
              <option value="extreme" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>☠️ Popierdolony</option>
            </select>
          </div>
        </section>

        {/* Unified Game HUD & Route Control Center */}
        <section
          className={`rounded-2xl border shadow-md transition-all overflow-hidden ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 shadow-black/20'
              : 'bg-white border-slate-200 shadow-slate-100'
          }`}
        >
          {/* Top Row: Timer, Moves, and 4 Square Action Buttons (Nowa gra, Cofnij, Wskazówka, Reset) */}
          <div
            className={`px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2 border-b ${
              isDark ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'
            }`}
          >
            {/* Left: Stats (Timer + Moves) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Timer */}
              <div
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-9 sm:h-10 rounded-xl border font-mono text-xs font-bold shadow-sm ${
                  isDark
                    ? 'bg-slate-800/90 border-slate-700/80 text-amber-400'
                    : 'bg-white border-slate-200 text-amber-600'
                }`}
                title="Czas obecnej gry"
              >
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{formatTime(seconds)}</span>
              </div>

              {/* Moves */}
              <div
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 h-9 sm:h-10 rounded-xl border text-xs font-semibold shadow-sm ${
                  isDark
                    ? 'bg-slate-800/90 border-slate-700/80 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
                title={`Liczba wykonanych ruchów: ${moves}`}
              >
                <Footprints className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  Ruchy: <strong className="font-bold text-sky-400 font-mono">{moves}</strong>
                </span>
              </div>
            </div>

            {/* Right: 4 Square Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              {/* Nowa gra: Square, no icon */}
              <button
                type="button"
                onClick={() => startNewGame(size, difficulty)}
                title="Nowa gra (rozpocznij nową planszę)"
                aria-label="Nowa gra"
                className="aspect-square h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex flex-col items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-black leading-none transition shadow-sm active:scale-95 cursor-pointer select-none"
              >
                <span className="text-[11px] sm:text-xs">Nowa</span>
                <span className="text-[9px] opacity-90 -mt-0.5 font-bold">gra</span>
              </button>

              {/* Undo: Square */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={history.length === 0}
                title="Cofnij ostatni ruch (+1 do licznika)"
                aria-label="Cofnij ruch"
                className={`aspect-square h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center border font-semibold transition shadow-sm active:scale-95 cursor-pointer select-none ${
                  history.length === 0
                    ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-sky-300 hover:bg-slate-750'
                    : 'bg-white border-slate-300 text-sky-700 hover:bg-slate-100'
                }`}
              >
                <Undo2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Hint: Square, no text description, with small +3 badge */}
              <button
                type="button"
                onClick={handleHint}
                title="Wskazówka: ujawnia i trwale blokuje poprawny tor dla losowego pola (kara +3 ruchy)"
                aria-label="Wskazówka (+3 ruchy)"
                className={`relative aspect-square h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center border font-semibold transition shadow-sm active:scale-95 cursor-pointer select-none ${
                  isDark
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black leading-tight shadow-sm">
                  +3
                </span>
              </button>

              {/* Reset: Square, with new unique RefreshCw icon */}
              <button
                type="button"
                onClick={handleReset}
                title="Wyczyść planszę do stanu początkowego (reset torów)"
                aria-label="Resetuj planszę"
                className={`aspect-square h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center border transition active:scale-95 cursor-pointer select-none ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-amber-400 hover:bg-slate-750'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-slate-100'
                }`}
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Route (Start A -> Meta B with high-contrast, prominent coordinates) */}
          {puzzle && (
            <div
              className={`p-2 sm:p-2.5 border-t transition-colors ${
                difficulty === 'extreme'
                  ? isDark
                    ? 'bg-rose-950/40 border-rose-900/60'
                    : 'bg-rose-50/80 border-rose-200'
                  : isDark
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Subtle connecting train indicator banner */}
              <div className="flex items-center justify-center gap-2 mb-1.5 px-2">
                <span className="h-[2px] flex-1 bg-gradient-to-r from-emerald-500/60 via-amber-500/30 to-transparent rounded-full" />
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 select-none">
                  <Train className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Trasa Kolejowa</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
                <span className="h-[2px] flex-1 bg-gradient-to-l from-rose-500/60 via-amber-500/30 to-transparent rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {/* Start A Card */}
                <div
                  className={`p-2 sm:p-2.5 rounded-xl border flex items-center gap-2 sm:gap-2.5 transition shadow-sm ${
                    isDark
                      ? 'bg-slate-900/90 border-emerald-500/40 text-slate-100'
                      : 'bg-white border-emerald-300 text-slate-900'
                  }`}
                  title={`Start A: krawędź ${getEdgePolish(puzzle.startPoint.edge)}, wiersz ${puzzle.startPoint.row + 1}, kolumna ${puzzle.startPoint.col + 1}`}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-md ring-2 ring-emerald-400/40">
                      A
                    </span>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 leading-tight">
                      <span
                        className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${
                          isDark ? 'text-emerald-400' : 'text-emerald-700'
                        }`}
                      >
                        START
                      </span>
                      <span
                        className={`text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.5 rounded border ${
                          isDark
                            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        }`}
                      >
                        {getEdgePolish(puzzle.startPoint.edge)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs sm:text-sm font-bold leading-tight">
                      <span className="flex items-center gap-1">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Wiersz:</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-black text-xs sm:text-sm ${
                            isDark
                              ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/40'
                              : 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-300'
                          }`}
                        >
                          {puzzle.startPoint.row + 1}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Kolumna:</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-black text-xs sm:text-sm ${
                            isDark
                              ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/40'
                              : 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-300'
                          }`}
                        >
                          {puzzle.startPoint.col + 1}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meta B Card */}
                <div
                  className={`p-2 sm:p-2.5 rounded-xl border flex items-center gap-2 sm:gap-2.5 transition shadow-sm ${
                    isDark
                      ? 'bg-slate-900/90 border-rose-500/40 text-slate-100'
                      : 'bg-white border-rose-300 text-slate-900'
                  }`}
                  title={`Meta B: krawędź ${getEdgePolish(puzzle.endPoint.edge)}, wiersz ${puzzle.endPoint.row + 1}, kolumna ${puzzle.endPoint.col + 1}`}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500 text-white font-black text-xs sm:text-sm shadow-md ring-2 ring-rose-400/40">
                      B
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 leading-tight">
                      <span
                        className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${
                          isDark ? 'text-rose-400' : 'text-rose-700'
                        }`}
                      >
                        META
                      </span>
                      <span
                        className={`text-[10px] sm:text-[11px] font-extrabold px-1.5 py-0.5 rounded border ${
                          isDark
                            ? 'bg-rose-950/80 border-rose-800 text-rose-300'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}
                      >
                        {getEdgePolish(puzzle.endPoint.edge)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs sm:text-sm font-bold leading-tight">
                      <span className="flex items-center gap-1">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Wiersz:</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-black text-xs sm:text-sm ${
                            isDark
                              ? 'bg-rose-500/25 text-rose-300 ring-1 ring-rose-500/40'
                              : 'bg-rose-100 text-rose-950 ring-1 ring-rose-300'
                          }`}
                        >
                          {puzzle.endPoint.row + 1}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Kolumna:</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-black text-xs sm:text-sm ${
                            isDark
                              ? 'bg-rose-500/25 text-rose-300 ring-1 ring-rose-500/40'
                              : 'bg-rose-100 text-rose-950 ring-1 ring-rose-300'
                          }`}
                        >
                          {puzzle.endPoint.col + 1}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* The Grid Board */}
        {puzzle && (
          <div className="flex justify-center w-full my-auto">
            <div
              className={`relative p-2.5 sm:p-4 rounded-2xl border shadow-xl w-full max-w-[440px] transition-all ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-white border-slate-200 shadow-slate-200'
              }`}
            >
              <div
                onPointerMove={handleGridPointerMove}
                className="grid gap-1 sm:gap-1.5 w-full aspect-square touch-none"
                style={{
                  gridTemplateColumns: `repeat(${puzzle.size + 1}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${puzzle.size + 1}, minmax(0, 1fr))`,
                }}
              >
                {/* Top-Left Corner Empty Badge */}
                <div className="flex items-center justify-center font-bold text-slate-600 text-xs select-none">
                  #
                </div>

                {/* Column Clues (Top Row) */}
                {puzzle.colClues.map((clue, c) => {
                  const isHidden = puzzle.hiddenColClues[c];
                  const isColError = validation?.colErrors?.includes(c);
                  return (
                    <div
                      key={`col-clue-${c}`}
                      className={`flex items-center justify-center font-black text-xs sm:text-sm rounded-md transition-colors select-none ${
                        isColError
                          ? 'bg-rose-500/20 text-rose-500 ring-1 ring-rose-500 font-extrabold'
                          : isDark
                          ? 'bg-slate-800/80 text-amber-400'
                          : 'bg-slate-100 text-amber-600'
                      }`}
                    >
                      {isHidden ? '?' : clue}
                    </div>
                  );
                })}

                {/* Grid Rows (Row Clue + Cells) */}
                {Array.from({ length: puzzle.size }).map((_, r) => {
                  const isHidden = puzzle.hiddenRowClues[r];
                  const isRowError = validation?.rowErrors?.includes(r);

                  return (
                    <React.Fragment key={`row-frag-${r}`}>
                      {/* Row Clue Badge */}
                      <div
                        className={`flex items-center justify-center font-black text-xs sm:text-sm rounded-md transition-colors select-none ${
                          isRowError
                            ? 'bg-rose-500/20 text-rose-500 ring-1 ring-rose-500 font-extrabold'
                            : isDark
                            ? 'bg-slate-800/80 text-amber-400'
                            : 'bg-slate-100 text-amber-600'
                        }`}
                      >
                        {isHidden ? '?' : puzzle.rowClues[r]}
                      </div>

                      {/* Cells in Row */}
                      {Array.from({ length: puzzle.size }).map((__, c) => {
                        const track = board[r]?.[c] || 'EMPTY';
                        const key = `${r},${c}`;
                        const isFixed = puzzle.fixedCells[r][c];
                        const isHintLocked = lockedHintKeys.has(key);
                        const isDragSelected = erasingSelection.has(key);
                        const isStart =
                          difficulty !== 'extreme' &&
                          r === puzzle.startPoint.row &&
                          c === puzzle.startPoint.col;
                        const isEnd =
                          difficulty !== 'extreme' &&
                          r === puzzle.endPoint.row &&
                          c === puzzle.endPoint.col;
                        const endpointLabel = isStart ? 'A' : isEnd ? 'B' : undefined;
                        const isPathError =
                          validation?.pathErrorCell?.r === r &&
                          validation?.pathErrorCell?.c === c;
                        const isHinted = hintedCell?.r === r && hintedCell?.c === c;

                        return (
                          <TrackTile
                            key={`cell-${r}-${c}`}
                            track={track}
                            gemPalette={activePalette}
                            isFixed={isFixed}
                            isHintLocked={isHintLocked}
                            isDragSelected={isDragSelected}
                            dataCellPos={`${r}-${c}`}
                            isStart={isStart}
                            isEnd={isEnd}
                            endpointLabel={endpointLabel}
                            isError={isPathError}
                            isHighlighted={isHinted}
                            onClick={() => handleCellClick(r, c)}
                            onPointerDown={(e) => handlePointerDown(r, c, e)}
                            onPointerEnter={() => handlePointerEnter(r, c)}
                            onPointerUp={handlePointerUpOrCancel}
                            onPointerCancel={handlePointerUpOrCancel}
                            className={
                              isDark
                                ? 'bg-slate-950/60 border border-slate-800/60'
                                : 'bg-slate-50 border border-slate-200'
                            }
                          />
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Validation Result Feedback Message */}
        {validation && (
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm transition-all ${
              validation.isValid
                ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                : validation.type === 'warning'
                ? 'bg-amber-950/40 border-amber-600/60 text-amber-300'
                : 'bg-rose-950/40 border-rose-600/60 text-rose-300'
            }`}
          >
            {validation.isValid ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{validation.message}</p>
              {validation.isValid && (
                <p className="text-xs text-emerald-400/80 mt-1">
                  Ukończono w czasie {formatTime(seconds)} z liczbą {moves} ruchów!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Tool Selector & Action Bar */}
        <section
          className={`p-2.5 rounded-2xl border shadow-lg flex flex-col gap-2 transition ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs px-1 text-slate-400 font-semibold">
            <span>Narzędzie wprowadzania:</span>
            <span className="text-[11px] text-amber-500 font-normal">
              Dotknij narzędzie, potem kafelek
            </span>
          </div>

          {/* Tools Grid (9 dedicated tools: Cycle, Horizontal, Vertical, 4 Curves, X, Eraser) */}
          <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
            {/* Cycle mode */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTool('cycle');
              }}
              title="Tryb cykliczny: kliknięcie w kafelek przełącza kolejno rodzaje torów"
              aria-label="Narzędzie cykliczne"
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition active:scale-95 cursor-pointer select-none ${
                activeTool === 'cycle'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-1 ring-amber-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 shrink-0" />
              <span className="tracking-tighter sm:tracking-normal truncate">Cykl</span>
            </button>

            {/* Horizontal Track Tool */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTool('H');
              }}
              title="Pozioma linia torów (━): kliknij pole, aby wstawić prosty tor poziomy"
              aria-label="Pozioma linia torów"
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition active:scale-95 cursor-pointer select-none ${
                activeTool === 'H'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-1 ring-amber-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrackMiniPreview track="H" gemPalette={activePalette} className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span className="tracking-tighter sm:tracking-normal truncate">Poziom</span>
            </button>

            {/* Vertical Track Tool */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTool('V');
              }}
              title="Pionowa linia torów (┃): kliknij pole, aby wstawić prosty tor pionowy"
              aria-label="Pionowa linia kolejowa"
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition active:scale-95 cursor-pointer select-none ${
                activeTool === 'V'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-1 ring-amber-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrackMiniPreview track="V" gemPalette={activePalette} className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span className="tracking-tighter sm:tracking-normal truncate">Pion</span>
            </button>

            {/* 4 Dedicated Curve Tools with Realistic Miniature Previews */}
            {/* Top-Right Curve */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTool('CURVE_TR');
              }}
              title="Zakręt Góra-Prawo (łączy górną i prawą krawędź)"
              aria-label="Zakręt Góra-Prawo"
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition active:scale-95 cursor-pointer select-none ${
                activeTool === 'CURVE_TR'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-1 ring-amber-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrackMiniPreview track="CURVE_TR" gemPalette={activePalette} className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span className="tracking-tighter sm:tracking-normal truncate">G-P</span>
            </button>

            {/* Bottom-Right Curve */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTool('CURVE_BR');
              }}
              title="Zakręt Prawo-Dół (łączy prawą i dolną krawędź)"
              aria-label="Zakręt Prawo-Dół"
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition active:scale-95 cursor-pointer select-none ${
                activeTool === 'CURVE_BR'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-1 ring-amber-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrackMiniPreview track="CURVE_BR" gemPalette={activePalette} className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span className="tracking-tighter sm:tracking-normal truncate">P-D</span>
            </button>

            {/* Bottom-Left Curve */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTool('CURVE_BL');
              }}
              title="Zakręt Dół-Lewo (łączy dolną i lewą krawędź)"
              aria-label="Zakręt Dół-Lewo"
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition active:scale-95 cursor-pointer select-none ${
                activeTool === 'CURVE_BL'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-1 ring-amber-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrackMiniPreview track="CURVE_BL" gemPalette={activePalette} className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span className="tracking-tighter sm:tracking-normal truncate">D-L</span>
            </button>

            {/* Top-Left Curve */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTool('CURVE_TL');
              }}
              title="Zakręt Góra-Lewo (łączy górną i lewą krawędź)"
              aria-label="Zakręt Góra-Lewo"
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition active:scale-95 cursor-pointer select-none ${
                activeTool === 'CURVE_TL'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-1 ring-amber-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrackMiniPreview track="CURVE_TL" gemPalette={activePalette} className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span className="tracking-tighter sm:tracking-normal truncate">G-L</span>
            </button>

            {/* X Cross Tool */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTool('x');
              }}
              title="Brak torów (X): oznacz pole jako puste"
              aria-label="Narzędzie krzyżyk X"
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition active:scale-95 cursor-pointer select-none ${
                activeTool === 'x'
                  ? 'bg-rose-500 text-white border-rose-400 shadow-sm ring-1 ring-rose-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-rose-400 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-rose-600 hover:bg-slate-200'
              }`}
            >
              <XIcon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 shrink-0" />
              <span className="tracking-tighter sm:tracking-normal truncate">Brak</span>
            </button>

            {/* Eraser Tool */}
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTool('erase');
              }}
              title="Gumka: kliknij pojedyncze pole lub przeciągnij palcem po kilku kafelkach"
              aria-label="Narzędzie gumka"
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition active:scale-95 cursor-pointer select-none ${
                activeTool === 'erase'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm ring-1 ring-amber-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Eraser className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 shrink-0" />
              <span className="tracking-tighter sm:tracking-normal truncate">Gumka</span>
            </button>
          </div>

          {/* Action Row: Pobierz wskazówkę & Sprawdź Tor Kolejowy */}
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={handleHint}
              title="Ujawnij prawidłowy typ toru dla losowej pustej komórki (kara +3 ruchy)"
              className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm rounded-xl border transition active:scale-[0.98] flex items-center justify-center gap-1.5 shrink-0 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-750 text-amber-400 border-slate-700'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Wskazówka (+3)</span>
            </button>

            {/* Big Check Button */}
            <button
              type="button"
              onClick={handleCheck}
              className="flex-1 py-3 px-4 font-bold text-xs sm:text-sm rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>Sprawdź Tor Kolejowy</span>
            </button>
          </div>
        </section>
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} isDark={isDark} />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        isDark={isDark}
      />

      {/* Confetti Particle Overlay */}
      <ConfettiCanvas
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Victory Choice Modal */}
      <VictoryModal
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        onPlayAgainSame={() => {
          setShowVictoryModal(false);
          startNewGame(size, difficulty);
        }}
        onIncreaseDifficulty={() => {
          const nextDiff = NEXT_DIFFICULTY[difficulty];
          setDifficulty(nextDiff);
          setShowVictoryModal(false);
          startNewGame(size, nextDiff);
        }}
        onIncreaseSize={() => {
          const nextSize = NEXT_SIZE[size];
          setSize(nextSize);
          setShowVictoryModal(false);
          startNewGame(nextSize, difficulty);
        }}
        currentDifficulty={difficulty}
        currentSize={size}
        moves={moves}
        seconds={seconds}
        hintsUsed={hintsUsedCount}
      />
    </div>
  );
}
