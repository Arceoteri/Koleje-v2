import {
  BoardSize,
  BorderEdge,
  Difficulty,
  Endpoint,
  Puzzle,
  TrackType,
} from './types';

// Direction vectors
const DIRS: Record<BorderEdge, { dr: number; dc: number; opposite: BorderEdge }> = {
  TOP: { dr: -1, dc: 0, opposite: 'BOTTOM' },
  RIGHT: { dr: 0, dc: 1, opposite: 'LEFT' },
  BOTTOM: { dr: 1, dc: 0, opposite: 'TOP' },
  LEFT: { dr: 0, dc: -1, opposite: 'RIGHT' },
};

export const TRACK_CONNECTIONS: Record<TrackType, BorderEdge[]> = {
  EMPTY: [],
  X: [],
  H: ['LEFT', 'RIGHT'],
  V: ['TOP', 'BOTTOM'],
  CURVE_TR: ['TOP', 'RIGHT'],
  CURVE_BR: ['BOTTOM', 'RIGHT'],
  CURVE_BL: ['BOTTOM', 'LEFT'],
  CURVE_TL: ['TOP', 'LEFT'],
};

export function getTrackForDirections(edge1: BorderEdge, edge2: BorderEdge): TrackType {
  const edges = [edge1, edge2].sort();
  if (edges.includes('LEFT') && edges.includes('RIGHT')) return 'H';
  if (edges.includes('BOTTOM') && edges.includes('TOP')) return 'V';
  if (edges.includes('RIGHT') && edges.includes('TOP')) return 'CURVE_TR';
  if (edges.includes('BOTTOM') && edges.includes('RIGHT')) return 'CURVE_BR';
  if (edges.includes('BOTTOM') && edges.includes('LEFT')) return 'CURVE_BL';
  if (edges.includes('LEFT') && edges.includes('TOP')) return 'CURVE_TL';
  return 'EMPTY';
}

function getBorderEdgesForCell(r: number, c: number, size: number): BorderEdge[] {
  const edges: BorderEdge[] = [];
  if (r === 0) edges.push('TOP');
  if (r === size - 1) edges.push('BOTTOM');
  if (c === 0) edges.push('LEFT');
  if (c === size - 1) edges.push('RIGHT');
  return edges;
}

/**
 * Procedurally generates a solvable, single non-branching train track puzzle
 */
export function generateTrainTrackPuzzle(size: BoardSize, difficulty: Difficulty): Puzzle {
  let attempt = 0;
  while (attempt < 500) {
    attempt++;
    const puzzle = tryGeneratePath(size, difficulty);
    if (puzzle) return puzzle;
  }
  // Fallback default valid path if RNG fails
  return createFallbackPuzzle(size, difficulty);
}

function tryGeneratePath(size: number, difficulty: Difficulty): Puzzle | null {
  // Determine min and max target track length based on difficulty and size
  let minLength = size + 2;
  let maxTarget = Math.floor(size * size * 0.55);

  if (difficulty === 'easy') {
    minLength = size + 1;
    maxTarget = Math.min(size * 2 + 2, Math.floor(size * size * 0.45));
  } else if (difficulty === 'hard' || difficulty === 'very_hard' || difficulty === 'extreme') {
    minLength = size + 4;
    maxTarget = Math.floor(size * size * 0.7);
  }

  // 1. Pick a random border cell and external entry edge
  const borderCells: { r: number; c: number; edge: BorderEdge }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const edges = getBorderEdgesForCell(r, c, size);
      for (const e of edges) {
        borderCells.push({ r, c, edge: e });
      }
    }
  }

  const startCandidate = borderCells[Math.floor(Math.random() * borderCells.length)];
  const startPoint: Endpoint = {
    row: startCandidate.r,
    col: startCandidate.c,
    edge: startCandidate.edge,
    label: 'A',
  };

  // Randomized self-avoiding walk
  const visited: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
  const path: { r: number; c: number }[] = [{ r: startPoint.row, c: startPoint.col }];
  visited[startPoint.row][startPoint.col] = true;

  function dfs(currR: number, currC: number): { r: number; c: number; edge: BorderEdge } | null {
    if (path.length >= minLength) {
      // Check if current cell can be an exit (must touch a border edge different from start if path is small)
      const possibleExits = getBorderEdgesForCell(currR, currC, size).filter(e => {
        if (currR === startPoint.row && currC === startPoint.col) {
          return e !== startPoint.edge;
        }
        return true;
      });

      if (possibleExits.length > 0 && (path.length >= maxTarget || Math.random() < 0.25)) {
        const exitEdge = possibleExits[Math.floor(Math.random() * possibleExits.length)];
        return { r: currR, c: currC, edge: exitEdge };
      }
    }

    if (path.length >= maxTarget) {
      return null;
    }

    // Shuffle neighbor directions
    const dirKeys: BorderEdge[] = (['TOP', 'RIGHT', 'BOTTOM', 'LEFT'] as BorderEdge[]).sort(() => Math.random() - 0.5);

    for (const d of dirKeys) {
      const nr = currR + DIRS[d].dr;
      const nc = currC + DIRS[d].dc;

      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
        // To avoid dead ends, don't trap adjacent cells easily
        visited[nr][nc] = true;
        path.push({ r: nr, c: nc });

        const res = dfs(nr, nc);
        if (res) return res;

        // Backtrack
        path.pop();
        visited[nr][nc] = false;
      }
    }
    return null;
  }

  const exitResult = dfs(startPoint.row, startPoint.col);
  if (!exitResult) return null;

  const endPoint: Endpoint = {
    row: exitResult.r,
    col: exitResult.c,
    edge: exitResult.edge,
    label: 'B',
  };

  // Construct solution grid
  const solution: TrackType[][] = Array(size).fill('EMPTY').map(() => Array(size).fill('EMPTY'));

  for (let i = 0; i < path.length; i++) {
    const curr = path[i];
    let prevEdge: BorderEdge;
    let nextEdge: BorderEdge;

    // Entry edge for this cell
    if (i === 0) {
      prevEdge = startPoint.edge;
    } else {
      const prev = path[i - 1];
      if (prev.r < curr.r) prevEdge = 'TOP';
      else if (prev.r > curr.r) prevEdge = 'BOTTOM';
      else if (prev.c < curr.c) prevEdge = 'LEFT';
      else prevEdge = 'RIGHT';
    }

    // Exit edge for this cell
    if (i === path.length - 1) {
      nextEdge = endPoint.edge;
    } else {
      const next = path[i + 1];
      if (next.r < curr.r) nextEdge = 'TOP';
      else if (next.r > curr.r) nextEdge = 'BOTTOM';
      else if (next.c < curr.c) nextEdge = 'LEFT';
      else nextEdge = 'RIGHT';
    }

    solution[curr.r][curr.c] = getTrackForDirections(prevEdge, nextEdge);
  }

  // Row and Column clues
  const rowClues = Array(size).fill(0);
  const colClues = Array(size).fill(0);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (solution[r][c] !== 'EMPTY') {
        rowClues[r]++;
        colClues[c]++;
      }
    }
  }

  // Create initialBoard and fixedCells based on difficulty
  const initialBoard: TrackType[][] = Array(size).fill('EMPTY').map(() => Array(size).fill('EMPTY'));
  const fixedCells: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  const hiddenRowClues: boolean[] = Array(size).fill(false);
  const hiddenColClues: boolean[] = Array(size).fill(false);

  if (difficulty === 'easy') {
    // Reveal Start (A) & End (B)
    initialBoard[startPoint.row][startPoint.col] = solution[startPoint.row][startPoint.col];
    fixedCells[startPoint.row][startPoint.col] = true;

    initialBoard[endPoint.row][endPoint.col] = solution[endPoint.row][endPoint.col];
    fixedCells[endPoint.row][endPoint.col] = true;

    // Reveal ~20% additional tracks along the path
    const candidateIndices: number[] = [];
    for (let i = 1; i < path.length - 1; i++) {
      candidateIndices.push(i);
    }
    candidateIndices.sort(() => Math.random() - 0.5);

    const extraCluesCount = Math.max(1, Math.floor(path.length * 0.2));
    for (let k = 0; k < Math.min(extraCluesCount, candidateIndices.length); k++) {
      const idx = candidateIndices[k];
      const p = path[idx];
      initialBoard[p.r][p.c] = solution[p.r][p.c];
      fixedCells[p.r][p.c] = true;
    }

    // Auto-fill X for 0 rows/cols
    for (let r = 0; r < size; r++) {
      if (rowClues[r] === 0) {
        for (let c = 0; c < size; c++) {
          initialBoard[r][c] = 'X';
        }
      }
    }
    for (let c = 0; c < size; c++) {
      if (colClues[c] === 0) {
        for (let r = 0; r < size; r++) {
          initialBoard[r][c] = 'X';
        }
      }
    }
  } else if (difficulty === 'medium') {
    // Reveal Start & End
    initialBoard[startPoint.row][startPoint.col] = solution[startPoint.row][startPoint.col];
    fixedCells[startPoint.row][startPoint.col] = true;

    initialBoard[endPoint.row][endPoint.col] = solution[endPoint.row][endPoint.col];
    fixedCells[endPoint.row][endPoint.col] = true;

    // Reveal exactly 1 extra clue track piece
    if (path.length > 2) {
      const midIdx = Math.floor(1 + Math.random() * (path.length - 2));
      const p = path[midIdx];
      initialBoard[p.r][p.c] = solution[p.r][p.c];
      fixedCells[p.r][p.c] = true;
    }
  } else if (difficulty === 'hard') {
    // Reveal only Start & End
    initialBoard[startPoint.row][startPoint.col] = solution[startPoint.row][startPoint.col];
    fixedCells[startPoint.row][startPoint.col] = true;

    initialBoard[endPoint.row][endPoint.col] = solution[endPoint.row][endPoint.col];
    fixedCells[endPoint.row][endPoint.col] = true;
  } else if (difficulty === 'very_hard') {
    // Reveal only Start & End
    initialBoard[startPoint.row][startPoint.col] = solution[startPoint.row][startPoint.col];
    fixedCells[startPoint.row][startPoint.col] = true;

    initialBoard[endPoint.row][endPoint.col] = solution[endPoint.row][endPoint.col];
    fixedCells[endPoint.row][endPoint.col] = true;

    // Hide 2-3 clues
    const hideCount = Math.min(3, Math.floor(size / 2));
    const allClueIndices: { isRow: boolean; idx: number }[] = [];
    for (let i = 0; i < size; i++) {
      allClueIndices.push({ isRow: true, idx: i });
      allClueIndices.push({ isRow: false, idx: i });
    }
    allClueIndices.sort(() => Math.random() - 0.5);
    for (let k = 0; k < hideCount; k++) {
      const item = allClueIndices[k];
      if (item.isRow) hiddenRowClues[item.idx] = true;
      else hiddenColClues[item.idx] = true;
    }
  } else if (difficulty === 'extreme') {
    // "Popierdolony" - No tracks pre-filled on grid!
    // Start & End indicators are only on the perimeter.
    // Up to 50% clues hidden with '?'
    const totalClues = size * 2;
    const hideCount = Math.floor(totalClues * 0.45);
    const allClueIndices: { isRow: boolean; idx: number }[] = [];
    for (let i = 0; i < size; i++) {
      allClueIndices.push({ isRow: true, idx: i });
      allClueIndices.push({ isRow: false, idx: i });
    }
    allClueIndices.sort(() => Math.random() - 0.5);
    for (let k = 0; k < hideCount; k++) {
      const item = allClueIndices[k];
      if (item.isRow) hiddenRowClues[item.idx] = true;
      else hiddenColClues[item.idx] = true;
    }
  }

  return {
    size: size as BoardSize,
    difficulty,
    solution,
    rowClues,
    colClues,
    hiddenRowClues,
    hiddenColClues,
    startPoint,
    endPoint,
    initialBoard,
    fixedCells,
  };
}

function createFallbackPuzzle(size: number, difficulty: Difficulty): Puzzle {
  // Deterministic fallback path around the border
  const solution: TrackType[][] = Array(size).fill('EMPTY').map(() => Array(size).fill('EMPTY'));
  solution[0][0] = 'CURVE_BR';
  for (let c = 1; c < size - 1; c++) solution[0][c] = 'H';
  solution[0][size - 1] = 'CURVE_BL';
  for (let r = 1; r < size - 1; r++) solution[r][size - 1] = 'V';
  solution[size - 1][size - 1] = 'CURVE_TL';
  for (let c = size - 2; c >= 1; c--) solution[size - 1][c] = 'H';
  solution[size - 1][0] = 'CURVE_TR';

  const startPoint: Endpoint = { row: 0, col: 0, edge: 'TOP', label: 'A' };
  const endPoint: Endpoint = { row: size - 1, col: 0, edge: 'BOTTOM', label: 'B' };

  const rowClues = Array(size).fill(0);
  const colClues = Array(size).fill(0);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (solution[r][c] !== 'EMPTY') {
        rowClues[r]++;
        colClues[c]++;
      }
    }
  }

  const initialBoard = Array(size).fill('EMPTY').map(() => Array(size).fill('EMPTY'));
  const fixedCells = Array(size).fill(false).map(() => Array(size).fill(false));
  initialBoard[0][0] = 'CURVE_BR';
  fixedCells[0][0] = true;
  initialBoard[size - 1][0] = 'CURVE_TR';
  fixedCells[size - 1][0] = true;

  return {
    size: size as BoardSize,
    difficulty,
    solution,
    rowClues,
    colClues,
    hiddenRowClues: Array(size).fill(false),
    hiddenColClues: Array(size).fill(false),
    startPoint,
    endPoint,
    initialBoard,
    fixedCells,
  };
}
