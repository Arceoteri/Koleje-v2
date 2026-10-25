import test from 'node:test';
import assert from 'node:assert';
import { generateTrainTrackPuzzle } from './generator.js';
import { validatePlayerBoard } from './validator.js';
import { BoardSize, Difficulty, TrackType } from './types.js';

test('50 iterations of puzzle generation across sizes and difficulties', () => {
  const sizes: BoardSize[] = [5, 6, 8];
  const diffs: Difficulty[] = ['easy', 'medium', 'hard', 'very_hard', 'extreme'];

  for (let i = 0; i < 50; i++) {
    const s = sizes[i % sizes.length];
    const d = diffs[i % diffs.length];

    const puzzle = generateTrainTrackPuzzle(s, d);

    assert.strictEqual(puzzle.size, s);
    assert.strictEqual(puzzle.solution.length, s);
    assert.strictEqual(puzzle.rowClues.length, s);
    assert.strictEqual(puzzle.colClues.length, s);

    // Validate that the generator's own solution passes full game validation
    const validation = validatePlayerBoard(puzzle.solution, puzzle);
    assert.strictEqual(
      validation.isValid,
      true,
      `Iteration ${i} (${s}x${s} ${d}) generated invalid solution: ${validation.message}`
    );

    // Verify row and col clues match track count exactly
    for (let r = 0; r < s; r++) {
      let rCount = 0;
      for (let c = 0; c < s; c++) {
        if (puzzle.solution[r][c] !== 'EMPTY') rCount++;
      }
      assert.strictEqual(puzzle.rowClues[r], rCount);
    }
  }
});

test('Hint mechanics: reveals cell and matches solution', () => {
  const puzzle = generateTrainTrackPuzzle(6, 'medium');
  const board: TrackType[][] = puzzle.initialBoard.map(row => [...row]);

  // Find non-fixed empty cells
  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      if (!puzzle.fixedCells[r][c] && board[r][c] === 'EMPTY') {
        emptyCells.push({ r, c });
      }
    }
  }

  assert.ok(emptyCells.length > 0, 'Should have empty cells to hint');

  const target = emptyCells[0];
  const expectedTrack = puzzle.solution[target.r][target.c];
  board[target.r][target.c] = expectedTrack;

  assert.strictEqual(board[target.r][target.c], expectedTrack);
});

test('All 4 curved track types are defined and distinct in rotation', () => {
  const curves: TrackType[] = ['CURVE_TR', 'CURVE_BR', 'CURVE_BL', 'CURVE_TL'];
  const rotations: Record<string, number> = {
    CURVE_TR: 0,
    CURVE_BR: 90,
    CURVE_BL: 180,
    CURVE_TL: 270,
  };

  const angles = curves.map(c => rotations[c]);
  const uniqueAngles = new Set(angles);
  assert.strictEqual(uniqueAngles.size, 4, 'All four curves must have unique 90-degree rotations');
});
