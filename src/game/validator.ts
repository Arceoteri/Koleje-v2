import { BorderEdge, Puzzle, TrackType } from './types';
import { TRACK_CONNECTIONS } from './generator';

const OPPOSITE_EDGE: Record<BorderEdge, BorderEdge> = {
  TOP: 'BOTTOM',
  RIGHT: 'LEFT',
  BOTTOM: 'TOP',
  LEFT: 'RIGHT',
};

const EDGE_DELTA: Record<BorderEdge, { dr: number; dc: number }> = {
  TOP: { dr: -1, dc: 0 },
  RIGHT: { dr: 0, dc: 1 },
  BOTTOM: { dr: 1, dc: 0 },
  LEFT: { dr: 0, dc: -1 },
};

export interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
  rowErrors?: number[];
  colErrors?: number[];
  pathErrorCell?: { r: number; c: number };
}

export function validatePlayerBoard(board: TrackType[][], puzzle: Puzzle): ValidationResult {
  const size = puzzle.size;
  const isTrack = (t: TrackType) => t !== 'EMPTY' && t !== 'X';

  // 1. Check Row & Column Clues
  const rowErrors: number[] = [];
  const colErrors: number[] = [];

  for (let r = 0; r < size; r++) {
    let count = 0;
    for (let c = 0; c < size; c++) {
      if (isTrack(board[r][c])) count++;
    }
    if (!puzzle.hiddenRowClues[r] && count !== puzzle.rowClues[r]) {
      rowErrors.push(r);
    }
  }

  for (let c = 0; c < size; c++) {
    let count = 0;
    for (let r = 0; r < size; r++) {
      if (isTrack(board[r][c])) count++;
    }
    if (!puzzle.hiddenColClues[c] && count !== puzzle.colClues[c]) {
      colErrors.push(c);
    }
  }

  // Count total tracks on board
  let totalTracks = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isTrack(board[r][c])) totalTracks++;
    }
  }

  if (totalTracks === 0) {
    return {
      isValid: false,
      message: 'Plansza jest pusta! Rozpocznij budowanie trasy kolejowej.',
      type: 'warning',
    };
  }

  const expectedTotalTracks = puzzle.rowClues.reduce((a, b) => a + b, 0);

  // Check start cell
  const startR = puzzle.startPoint.row;
  const startC = puzzle.startPoint.col;
  const startTrack = board[startR][startC];

  if (!isTrack(startTrack)) {
    return {
      isValid: false,
      message: `Punkt wjazdowy A (Wiersz ${startR + 1}, Kolumna ${startC + 1}) nie ma ustawionego toru!`,
      type: 'error',
      rowErrors,
      colErrors,
      pathErrorCell: { r: startR, c: startC },
    };
  }

  const startConns = TRACK_CONNECTIONS[startTrack];
  if (!startConns.includes(puzzle.startPoint.edge)) {
    return {
      isValid: false,
      message: `Tor w punkcie A nie łączy się z krawędzią wjazdu (${puzzle.startPoint.edge})!`,
      type: 'error',
      rowErrors,
      colErrors,
      pathErrorCell: { r: startR, c: startC },
    };
  }

  // Traverse the track from Start to End
  const visited: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
  let currR = startR;
  let currC = startC;
  let incomingEdge: BorderEdge = puzzle.startPoint.edge;
  let traversedCount = 0;

  while (true) {
    traversedCount++;
    visited[currR][currC] = true;

    const currTrack = board[currR][currC];
    const conns = TRACK_CONNECTIONS[currTrack];

    // Find exit edge from current tile
    const exitEdge = conns.find(e => e !== incomingEdge);
    if (!exitEdge) {
      return {
        isValid: false,
        message: `Tor na pozycji (${currR + 1}, ${currC + 1}) nie ma wyjścia lub zapętla się!`,
        type: 'error',
        rowErrors,
        colErrors,
        pathErrorCell: { r: currR, c: currC },
      };
    }

    // Check if reached end point
    if (currR === puzzle.endPoint.row && currC === puzzle.endPoint.col && exitEdge === puzzle.endPoint.edge) {
      // Reached the destination edge!
      break;
    }

    // Next cell
    const delta = EDGE_DELTA[exitEdge];
    const nextR = currR + delta.dr;
    const nextC = currC + delta.dc;

    if (nextR < 0 || nextR >= size || nextC < 0 || nextC >= size) {
      return {
        isValid: false,
        message: `Tor na pozycji (${currR + 1}, ${currC + 1}) wychodzi poza planszę w niewłaściwym miejscu!`,
        type: 'error',
        rowErrors,
        colErrors,
        pathErrorCell: { r: currR, c: currC },
      };
    }

    const nextTrack = board[nextR][nextC];
    if (!isTrack(nextTrack)) {
      return {
        isValid: false,
        message: `Trasa urywa się na polu (${nextR + 1}, ${nextC + 1})!`,
        type: 'error',
        rowErrors,
        colErrors,
        pathErrorCell: { r: nextR, c: nextC },
      };
    }

    const expectedNextIncoming = OPPOSITE_EDGE[exitEdge];
    const nextConns = TRACK_CONNECTIONS[nextTrack];

    if (!nextConns.includes(expectedNextIncoming)) {
      return {
        isValid: false,
        message: `Tory między (${currR + 1}, ${currC + 1}) a (${nextR + 1}, ${nextC + 1}) nie pasują do siebie!`,
        type: 'error',
        rowErrors,
        colErrors,
        pathErrorCell: { r: nextR, c: nextC },
      };
    }

    if (visited[nextR][nextC]) {
      return {
        isValid: false,
        message: `Trasa zapętla się wokół pola (${nextR + 1}, ${nextC + 1})! Tory nie mogą tworzyć pętli.`,
        type: 'error',
        rowErrors,
        colErrors,
        pathErrorCell: { r: nextR, c: nextC },
      };
    }

    currR = nextR;
    currC = nextC;
    incomingEdge = expectedNextIncoming;
  }

  // Check if there are disconnected tracks left over
  if (traversedCount < totalTracks) {
    return {
      isValid: false,
      message: 'Na planszy znajdują się odłączone fragmenty torów, które nie należą do głównej trasy!',
      type: 'error',
      rowErrors,
      colErrors,
    };
  }

  // Check clue errors
  if (rowErrors.length > 0 || colErrors.length > 0) {
    return {
      isValid: false,
      message: 'Trasa łączy punkty A i B, ale liczby torów w zaznaczonych wierszach/kolumnach nie zgadzają się z podpowiedziami!',
      type: 'warning',
      rowErrors,
      colErrors,
    };
  }

  if (totalTracks !== expectedTotalTracks) {
    return {
      isValid: false,
      message: `Całkowita liczba torów (${totalTracks}) nie zgadza się z sumą łamigłówki (${expectedTotalTracks})!`,
      type: 'warning',
      rowErrors,
      colErrors,
    };
  }

  return {
    isValid: true,
    message: '🎉 Brawo! Trasa kolejowa jest w 100% poprawna, spójna i zgodna ze wskazówkami!',
    type: 'success',
  };
}
