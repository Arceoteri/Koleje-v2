/**
 * Train Tracks Puzzle - Achievements System
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'starter' | 'difficulty' | 'speed' | 'palette' | 'mastery';
  progress?: { current: number; max: number };
  unlockedAt?: number; // timestamp
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  // 1. Starter / Pierwsze kroki
  {
    id: 'first_win',
    title: 'Pierwszy Gwizdek',
    description: 'Ukończ pomyślnie swoją pierwszą trasę kolejową.',
    icon: '🚂',
    category: 'starter',
  },
  {
    id: 'tracks_placed_50',
    title: 'Mistrz Manewrowy',
    description: 'Postaw łącznie 50 elementów torów w trakcie rozgrywek.',
    icon: '🔧',
    category: 'starter',
    progress: { current: 0, max: 50 },
  },
  {
    id: 'x_marks_20',
    title: 'Czysty Tor',
    description: 'Postaw znacznik wykluczenia X co najmniej 20 razy.',
    icon: '❌',
    category: 'starter',
    progress: { current: 0, max: 20 },
  },
  {
    id: 'gemologist',
    title: 'Kolejowy Gemolog',
    description: 'Wypróbuj w grze wszystkie 5 szlachetnych palet szyn.',
    icon: '💎',
    category: 'starter',
    progress: { current: 1, max: 5 },
  },

  // 2. Board sizes & Difficulties / Rozmiary i Trudności
  {
    id: 'size_5x5',
    title: 'Lokalna Trasa',
    description: 'Ukończ z sukcesem planszę o rozmiarze 5×5.',
    icon: '🛤️',
    category: 'difficulty',
  },
  {
    id: 'size_6x6',
    title: 'Główna Linia',
    description: 'Ukończ z sukcesem standardową planszę 6×6.',
    icon: '🚉',
    category: 'difficulty',
  },
  {
    id: 'size_8x8',
    title: 'Wielka Magistrala',
    description: 'Pokonaj mistrzowską planszę o rozmiarze 8×8.',
    icon: '🗺️',
    category: 'difficulty',
  },
  {
    id: 'diff_hard',
    title: 'Trudny Szlak',
    description: 'Rozwiąż planszę na poziomie Trudnym.',
    icon: '⛰️',
    category: 'difficulty',
  },
  {
    id: 'diff_very_hard',
    title: 'Kolejowa Wirtuozeria',
    description: 'Rozwiąż planszę na poziomie Bardzo Trudnym.',
    icon: '⚡',
    category: 'difficulty',
  },
  {
    id: 'diff_extreme',
    title: 'Ekspres Widmo',
    description: 'Pokonaj ekstremalny poziom z ukrytymi wskazówkami liczbowymi.',
    icon: '☠️',
    category: 'difficulty',
  },

  // 3. Speed & Precision / Prędkość i Perfekcja
  {
    id: 'speed_under_60',
    title: 'Ekspres Polarny',
    description: 'Ukończ dowolną trasę w czasie poniżej 60 sekund.',
    icon: '⏱️',
    category: 'speed',
  },
  {
    id: 'speed_5x5_under_30',
    title: 'Błyskawica',
    description: 'Rozwiąż planszę 5×5 w czasie poniżej 30 sekund.',
    icon: '⚡',
    category: 'speed',
  },
  {
    id: 'flawless_win',
    title: 'Bez Kolizji',
    description: 'Wygraj planszę za pierwszym sprawdzeniem, bez żadnych błędów.',
    icon: '🎯',
    category: 'speed',
  },
  {
    id: 'efficient_builder',
    title: 'Ekonomiczny Inżynier',
    description: 'Ukończ planszę wykonując łącznie poniżej 25 ruchów.',
    icon: '📐',
    category: 'speed',
  },

  // 4. Gemstone Palettes / Kolekcja Szlachetnych Szyn
  {
    id: 'palette_ruby',
    title: 'Rubinowy Pęd',
    description: 'Wygraj grę korzystając ze szlachetnej palety Rubin.',
    icon: '🔴',
    category: 'palette',
  },
  {
    id: 'palette_emerald',
    title: 'Szmaragdowa Dolina',
    description: 'Wygraj grę korzystając ze szlachetnej palety Szmaragd.',
    icon: '🟢',
    category: 'palette',
  },
  {
    id: 'palette_sapphire_dark',
    title: 'Szafirowa Noc',
    description: 'Wygraj planszę z szafirowymi szynami w trybie ciemnym.',
    icon: '🔵',
    category: 'palette',
  },
  {
    id: 'palette_amethyst',
    title: 'Ametystowy Szlak',
    description: 'Wygraj grę korzystając ze szlachetnej palety Ametyst.',
    icon: '🟣',
    category: 'palette',
  },
  {
    id: 'palette_topaz',
    title: 'Złoty Topaz',
    description: 'Wygraj grę korzystając ze szlachetnej palety Topaz.',
    icon: '🟡',
    category: 'palette',
  },

  // 5. Mastery / Weteran
  {
    id: 'station_master_10',
    title: 'Zawiadowca Stacji',
    description: 'Rozwiąż łącznie 10 łamigłówek kolejowych.',
    icon: '🎖️',
    category: 'mastery',
    progress: { current: 0, max: 10 },
  },
];

const STORAGE_KEY = 'train_tracks_achievements_v1';
const STATS_KEY = 'train_tracks_stats_v1';

export interface GameStats {
  gamesWon: number;
  tracksPlaced: number;
  xMarksPlaced: number;
  palettesSeen: string[];
  undoCount?: number;
  movesTotal?: number;
  gamesPlayed?: number;
}

export function loadUnlockedAchievements(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUnlockedAchievement(id: string): boolean {
  try {
    const current = loadUnlockedAchievements();
    if (!current[id]) {
      current[id] = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return true; // Newly unlocked
    }
    return false;
  } catch {
    return false;
  }
}

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          gamesWon: 0,
          tracksPlaced: 0,
          xMarksPlaced: 0,
          palettesSeen: ['ruby'],
        };
  } catch {
    return {
      gamesWon: 0,
      tracksPlaced: 0,
      xMarksPlaced: 0,
      palettesSeen: ['ruby'],
    };
  }
}

export function saveGameStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}
