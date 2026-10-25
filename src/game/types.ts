export type TrackType =
  | 'EMPTY'
  | 'H'
  | 'V'
  | 'CURVE_TR' // Top to Right (connects Top and Right edges)
  | 'CURVE_BR' // Bottom to Right (connects Bottom and Right edges)
  | 'CURVE_BL' // Bottom to Left (connects Bottom and Left edges)
  | 'CURVE_TL' // Top to Left (connects Top and Left edges)
  | 'X';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'very_hard' | 'extreme';

export type BoardSize = 5 | 6 | 8;

export type GemPaletteId = 'ruby' | 'emerald' | 'sapphire' | 'amethyst' | 'topaz';

export interface GemPalette {
  id: GemPaletteId;
  name: string;
  polishName: string;
  gemColor: string;
  railColor: string;
  baseColor: string;
}

export type BorderEdge = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT';

export interface Endpoint {
  row: number;
  col: number;
  edge: BorderEdge;
  label: 'A' | 'B';
}

export interface Puzzle {
  size: BoardSize;
  difficulty: Difficulty;
  solution: TrackType[][];
  rowClues: number[];
  colClues: number[];
  hiddenRowClues: boolean[]; // true if clue is hidden with '?'
  hiddenColClues: boolean[];
  startPoint: Endpoint;
  endPoint: Endpoint;
  initialBoard: TrackType[][]; // pre-revealed tracks and auto-Xs
  fixedCells: boolean[][]; // cells that cannot be changed by the player
}
