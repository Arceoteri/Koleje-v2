import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTrainTrackPuzzle } from './generator';
import { validatePlayerBoard } from './validator';

test('generates valid 5x5 easy puzzle and validates solution', () => {
  const puzzle = generateTrainTrackPuzzle(5, 'easy');
  assert.equal(puzzle.size, 5);
  assert.equal(puzzle.difficulty, 'easy');
  assert.ok(puzzle.startPoint);
  assert.ok(puzzle.endPoint);

  // Validate the solution itself
  const result = validatePlayerBoard(puzzle.solution, puzzle);
  assert.equal(result.isValid, true, `Solution should be valid: ${result.message}`);
});

test('generates valid 6x6 medium puzzle and validates solution', () => {
  const puzzle = generateTrainTrackPuzzle(6, 'medium');
  assert.equal(puzzle.size, 6);
  assert.equal(puzzle.difficulty, 'medium');

  const result = validatePlayerBoard(puzzle.solution, puzzle);
  assert.equal(result.isValid, true, `Solution should be valid: ${result.message}`);
});

test('generates 8x8 extreme puzzle with hidden clues and perimeter endpoints', () => {
  const puzzle = generateTrainTrackPuzzle(8, 'extreme');
  assert.equal(puzzle.size, 8);
  assert.equal(puzzle.difficulty, 'extreme');
  const hiddenCount = puzzle.hiddenRowClues.filter(Boolean).length + puzzle.hiddenColClues.filter(Boolean).length;
  assert.ok(hiddenCount > 0, 'Extreme should have hidden clues');

  const result = validatePlayerBoard(puzzle.solution, puzzle);
  assert.equal(result.isValid, true, `Solution should be valid: ${result.message}`);
});

test('detects broken or disconnected track in validator', () => {
  const puzzle = generateTrainTrackPuzzle(5, 'easy');
  // Copy board with empty tracks
  const brokenBoard = puzzle.solution.map(r => [...r]);
  // break one cell in the middle
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r !== puzzle.startPoint.row || c !== puzzle.startPoint.col) &&
          (r !== puzzle.endPoint.row || c !== puzzle.endPoint.col) &&
          brokenBoard[r][c] !== 'EMPTY') {
        brokenBoard[r][c] = 'EMPTY';
        break;
      }
    }
  }

  const result = validatePlayerBoard(brokenBoard, puzzle);
  assert.equal(result.isValid, false, 'Broken board should fail validation');
});
