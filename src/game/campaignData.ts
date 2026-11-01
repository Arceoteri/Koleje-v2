import { BoardSize, Difficulty, Puzzle } from './types';
import { generateTrainTrackPuzzle, createSeededRNG, hashDateStringToSeed } from './generator';
import { LocomotiveSkinId } from './skins';

export interface CampaignRegion {
  id: number;
  name: string;
  subtitle: string;
  themeDesc: string;
  levelRange: [number, number];
  unlockStars: number;
  color: string;
  accentBg: string;
}

export interface CampaignLevel {
  id: number;
  regionId: number;
  name: string;
  description: string;
  size: BoardSize;
  difficulty: Difficulty;
  targetSeconds: number; // Time threshold for 3rd star
  targetMoves: number;   // Move count threshold for 3rd star
}

export interface CampaignLevelRecord {
  completed: boolean;
  stars: number; // 1, 2, or 3
  seconds: number;
  moves: number;
  usedHint: boolean;
  completedAt?: string;
}

export interface CampaignSaveData {
  records: Record<number, CampaignLevelRecord>;
  selectedSkin: LocomotiveSkinId;
}

export const CAMPAIGN_REGIONS: CampaignRegion[] = [
  {
    id: 1,
    name: 'Dolina Parowozów',
    subtitle: 'Region 1 · Stacje 1–10',
    themeDesc: 'Sielskie niziny, zielone pastwiska i zabytkowe wiejskie parowozownie.',
    levelRange: [1, 10],
    unlockStars: 0,
    color: '#10b981', // emerald
    accentBg: 'from-emerald-950/80 to-slate-900',
  },
  {
    id: 2,
    name: 'Leśna Magistrala',
    subtitle: 'Region 2 · Stacje 11–20',
    themeDesc: 'Gęste bory sosnowe, leśne tartaki i stacje pośród pradawnej puszczy.',
    levelRange: [11, 20],
    unlockStars: 18,
    color: '#06b6d4', // cyan
    accentBg: 'from-cyan-950/80 to-slate-900',
  },
  {
    id: 3,
    name: 'Skalny Wąwóz',
    subtitle: 'Region 3 · Stacje 21–30',
    themeDesc: 'Kamienne wiadukty nad rzekami, urwiska i zdradliwe górskie serpentyny.',
    levelRange: [21, 30],
    unlockStars: 42,
    color: '#f59e0b', // amber
    accentBg: 'from-amber-950/80 to-slate-900',
  },
  {
    id: 4,
    name: 'Lodowa Przełęcz',
    subtitle: 'Region 4 · Stacje 31–40',
    themeDesc: 'Zaśnieżone szczyty, lodowate tunele i skute mrozem zwrotnice.',
    levelRange: [31, 40],
    unlockStars: 72,
    color: '#38bdf8', // sky
    accentBg: 'from-sky-950/80 to-slate-900',
  },
  {
    id: 5,
    name: 'Kolej Transkontynentalna',
    subtitle: 'Region 5 · Stacje 41–50',
    themeDesc: 'Główny węzeł metropolitalny. Gigantyczne rozjazdy dla mistrzów inżynierii.',
    levelRange: [41, 50],
    unlockStars: 105,
    color: '#ec4899', // pink/ruby
    accentBg: 'from-pink-950/80 to-slate-900',
  },
];

const STATION_NAMES_AND_LORE: { name: string; desc: string }[] = [
  // Region 1 (1..10) 5x5 Easy
  { name: 'Stacja Początkowa', desc: 'Pierwsze rozpalenie kotła w starej parowozowni.' },
  { name: 'Młyn nad Potokiem', desc: 'Dojazd do młyna wodnego na skraju doliny.' },
  { name: 'Złote Łany', desc: 'Spokojna linia przez falujące pola pszenicy.' },
  { name: 'Brzozowy Gaj', desc: 'Urokliwa mijanka pośród białych brzóz.' },
  { name: 'Cicha Polana', desc: 'Peron dla podróżnych zmierzających na targ.' },
  { name: 'Jabłoniowy Sad', desc: 'Odgałęzienie do lokalnych sadów owocowych.' },
  { name: 'Rzeczne Zakole', desc: 'Krótki łuk wzdłuż malowniczego brzegu rzeki.' },
  { name: 'Most Drewniany', desc: 'Tymczasowa przeprawa przed wjazdem w las.' },
  { name: 'Wzgórze Wiatraków', desc: 'Łagodny podjazd na wietrzne wzniesienie.' },
  { name: 'Brama Puszczy', desc: 'Koniec doliny i wjazd na Leśną Magistralę.' },

  // Region 2 (11..20) 6x6 Medium
  { name: 'Sosnowy Bór', desc: 'Zapach żywicy i tory przecinające leśną głuszę.' },
  { name: 'Tartak Parowy', desc: 'Transport pni dębowych do przetwórni.' },
  { name: 'Bagnisty Przesmyk', desc: 'Podkłady kolejowe ułożone na grząskim gruncie.' },
  { name: 'Wilczy Jar', desc: 'Wąski przesmyk skalny otoczony wiekowymi sosnami.' },
  { name: 'Mijanka Świerkowa', desc: 'Dodatkowy tor umożliwiający wyminięcie składów.' },
  { name: 'Leśniczówka Stara', desc: 'Samotny peron w samym sercu pradawnej puszczy.' },
  { name: 'Grzybowy Zakątek', desc: 'Trakcja kolejowa wijąca się wśród mchów.' },
  { name: 'Kamienna Rampa', desc: 'Punkt załadunku piaskowca z leśnego kamieniołomu.' },
  { name: 'Szumiący Wodospad', desc: 'Most tuż nad spienioną leśną kaskadą.' },
  { name: 'Przełęcz Cieni', desc: 'Ostatnia stacja leśna przed skalistym masywem.' },

  // Region 3 (21..30) 6x6 & 8x8 Hard
  { name: 'Wąwóz Bazaltowy', desc: 'Czarne wulkaniczne skały i strome zjazdy.' },
  { name: 'Wiadukt Wiszący', desc: 'Śmiała konstrukcja inżynieryjna nad przepaścią.' },
  { name: 'Jaskinia Echa', desc: 'Dym parowozu odbija się od sklepienia groty.' },
  { name: 'Stary Szyb Górniczy', desc: 'Porzucone sztolnie rudy żelaza i miedzi.' },
  { name: 'Szarotkowa Półka', desc: 'Tory wykute bezpośrednio w pionowej skale.' },
  { name: 'Grzmiący Kanion', desc: 'Ryk rwącej rzeki zagłusza stukot kół pociągu.' },
  { name: 'Kamieniołom Granitu', desc: 'Ciężkie składy z blokami granitu na budowę.' },
  { name: 'Orle Gniazdo', desc: 'Wysoko położony punkt obserwacyjny i semafory.' },
  { name: 'Iglica Skalna', desc: 'Pętla wokół ostrej baszty z czerwonego piaskowca.' },
  { name: 'Brama Lodowca', desc: 'Granica wiecznego śniegu i wejście w strefę mrozu.' },

  // Region 4 (31..40) 8x8 Very Hard
  { name: 'Śnieżna Kotlina', desc: 'Świerki uginające się pod ciężarem świeżego puchu.' },
  { name: 'Mroźny Płaskowyż', desc: 'Porywisty wiatr i zmrożone na kość podkłady.' },
  { name: 'Biała Przełęcz', desc: 'Pług wirnikowy toruje drogę przed parowozem.' },
  { name: 'Zamarznięte Jezioro', desc: 'Grobla kolejowa przecinająca taflę lodu.' },
  { name: 'Lodowy Tunel', desc: 'Długi korytarz wydrążony wewnątrz wiecznego lodu.' },
  { name: 'Świst Wichru', desc: 'Komin bucha parą w mroźne powietrze o zmierzchu.' },
  { name: 'Stacja Meteorologiczna', desc: 'Ostatni punkt łączności telegraficznej w górach.' },
  { name: 'Błękitna Rozpadlina', desc: 'Głęboka szczelina lodowa o szafirowym odcieniu.' },
  { name: 'Sople Kwarcowe', desc: 'Kryształy lodu zwisające z konstrukcji wsporczych.' },
  { name: 'Szczyt Iglicowy', desc: 'Najwyższy punkt całej trasy – 2400 m n.p.m.' },

  // Region 5 (41..50) 8x8 Extreme
  { name: 'Zjazd z Grani', desc: 'Hamulce parowe rozgrzane do czerwoności na zjeździe.' },
  { name: 'Węzeł Wschodni', desc: 'Zbieg czterech głównych linii dalekobieżnych.' },
  { name: 'Żelazny Most Łukowy', desc: 'Monumentalna nitowana konstrukcja nad doliną.' },
  { name: 'Kolejowy Port Przeładunkowy', desc: 'Dźwigi parowe i dziesiątki bocznic kolejowych.' },
  { name: 'Zagłębie Przemysłowe', desc: 'Huty, dymiące kominy i tętniący ruch pociągów.' },
  { name: 'Młoda Metropolia', desc: 'Wjazd w granice dynamicznie rosnącego miasta.' },
  { name: 'Węzeł Rozrządowy', desc: 'Gęsty labirynt zwrotnic i semaforów ramiennych.' },
  { name: 'Wiadukt Miejski', desc: 'Linia poprowadzona nad dachami kamienic.' },
  { name: 'Perony Cesarskie', desc: 'Zadaszone perony ze szkła i ozdobnego żeliwa.' },
  { name: 'Wielki Dworzec Centralny', desc: 'Zwieńczenie Transkontynentalnej Magistrali Kolejowej.' },
];

export const CAMPAIGN_LEVELS: CampaignLevel[] = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  const regionId = Math.floor(i / 10) + 1;
  const info = STATION_NAMES_AND_LORE[i];

  let size: BoardSize = 5;
  let difficulty: Difficulty = 'easy';
  let targetSeconds = 60;
  let targetMoves = 16;

  if (regionId === 1) {
    size = 5;
    difficulty = 'easy';
    targetSeconds = 60 + (id % 5) * 5;
    targetMoves = 14 + (id % 4) * 2;
  } else if (regionId === 2) {
    size = 6;
    difficulty = 'medium';
    targetSeconds = 90 + (id % 5) * 8;
    targetMoves = 22 + (id % 4) * 2;
  } else if (regionId === 3) {
    size = id <= 25 ? 6 : 8;
    difficulty = 'hard';
    targetSeconds = 120 + (id % 5) * 10;
    targetMoves = 28 + (id % 5) * 3;
  } else if (regionId === 4) {
    size = 8;
    difficulty = 'very_hard';
    targetSeconds = 160 + (id % 5) * 12;
    targetMoves = 38 + (id % 5) * 4;
  } else {
    size = 8;
    difficulty = 'extreme';
    targetSeconds = 200 + (id % 5) * 15;
    targetMoves = 45 + (id % 5) * 5;
  }

  return {
    id,
    regionId,
    name: info.name,
    description: info.desc,
    size,
    difficulty,
    targetSeconds,
    targetMoves,
  };
});

export function getCampaignLevel(levelId: number): CampaignLevel {
  const level = CAMPAIGN_LEVELS.find(l => l.id === levelId);
  return level || CAMPAIGN_LEVELS[0];
}

export function generateCampaignPuzzle(levelId: number): Puzzle {
  const level = getCampaignLevel(levelId);
  // Deterministic seed ensures this level's layout is completely consistent forever
  const seedString = `TRAIN_EXPEDITION_CAMPAIGN_LEVEL_v2_${levelId}_${level.size}_${level.difficulty}`;
  const seedNum = hashDateStringToSeed(seedString);
  const rng = createSeededRNG(seedNum);

  const puzzle = generateTrainTrackPuzzle(level.size, level.difficulty, rng);
  puzzle.isCampaign = true;
  puzzle.campaignLevelId = levelId;
  return puzzle;
}

const LOCAL_STORAGE_CAMPAIGN_KEY = 'tory_kolejowe_campaign_save_v1';

export function loadCampaignData(): CampaignSaveData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CAMPAIGN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.records === 'object') {
        return {
          records: parsed.records || {},
          selectedSkin: parsed.selectedSkin || 'classic',
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load campaign data from localStorage', e);
  }
  return {
    records: {},
    selectedSkin: 'classic',
  };
}

export function saveCampaignData(data: CampaignSaveData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CAMPAIGN_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save campaign data to localStorage', e);
  }
}

export function calculateTotalStars(records: Record<number, CampaignLevelRecord>): number {
  return Object.values(records).reduce((acc, curr) => acc + (curr.stars || 0), 0);
}
