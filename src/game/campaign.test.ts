import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMPAIGN_REGIONS,
  CAMPAIGN_LEVELS,
  getCampaignLevel,
  generateCampaignPuzzle,
  calculateTotalStars,
} from './campaignData';
import { LOCOMOTIVE_SKINS } from './skins';
import { hashDateStringToSeed, createSeededRNG, generateDailyPuzzle } from './generator';
import { validatePlayerBoard } from './validator';

test('Campaign structure: 5 regions and 50 stations configured correctly', () => {
  assert.equal(CAMPAIGN_REGIONS.length, 5, 'Must have exactly 5 regions');
  assert.equal(CAMPAIGN_LEVELS.length, 50, 'Must have exactly 50 campaign stations');

  for (let id = 1; id <= 50; id++) {
    const level = getCampaignLevel(id);
    assert.equal(level.id, id);
    assert.ok(level.name.length > 0, `Level ${id} must have a name`);
    assert.ok(level.description.length > 0, `Level ${id} must have lore description`);
    assert.ok([5, 6, 8].includes(level.size), `Level ${id} size must be 5, 6, or 8`);
    assert.ok(level.targetSeconds > 0, `Level ${id} must have target seconds`);
    assert.ok(level.targetMoves > 0, `Level ${id} must have target moves`);
  }
});

test('Campaign puzzle generation is deterministic and valid for sample stations', () => {
  // Test Station 1 (Region 1 - 5x5 Easy)
  const p1_a = generateCampaignPuzzle(1);
  const p1_b = generateCampaignPuzzle(1);

  assert.equal(p1_a.size, 5);
  assert.equal(p1_a.difficulty, 'easy');
  assert.equal(p1_a.isCampaign, true);
  assert.equal(p1_a.campaignLevelId, 1);

  // Check determinism: both generated instances must have identical solutions
  assert.deepEqual(p1_a.solution, p1_b.solution, 'Campaign Station 1 must generate deterministically');

  const v1 = validatePlayerBoard(p1_a.solution, p1_a);
  assert.equal(v1.isValid, true, 'Campaign Station 1 solution must validate successfully');

  // Test Station 15 (Region 2 - 6x6 Medium)
  const p15 = generateCampaignPuzzle(15);
  assert.equal(p15.size, 6);
  assert.equal(p15.difficulty, 'medium');
  const v15 = validatePlayerBoard(p15.solution, p15);
  assert.equal(v15.isValid, true, 'Campaign Station 15 solution must validate');

  // Test Station 45 (Region 5 - 8x8 Extreme)
  const p45 = generateCampaignPuzzle(45);
  assert.equal(p45.size, 8);
  assert.equal(p45.difficulty, 'extreme');
  const v45 = validatePlayerBoard(p45.solution, p45);
  assert.equal(v45.isValid, true, 'Campaign Station 45 solution must validate');
});

test('Locomotive skins configuration: 4 skins with ascending star requirements', () => {
  const skins = Object.values(LOCOMOTIVE_SKINS);
  assert.equal(skins.length, 4, 'Must have exactly 4 locomotive skins');

  const classic = LOCOMOTIVE_SKINS.classic;
  const forest = LOCOMOTIVE_SKINS.forest;
  const arrow = LOCOMOTIVE_SKINS.arrow;
  const gold = LOCOMOTIVE_SKINS.gold;

  assert.equal(classic.requiredStars, 0, 'Classic skin must be free / unlocked at start');
  assert.equal(forest.requiredStars, 25, 'Forest skin unlocks at 25 stars');
  assert.equal(arrow.requiredStars, 70, 'Arrow skin unlocks at 70 stars');
  assert.equal(gold.requiredStars, 130, 'Gold skin unlocks at 130 stars');

  for (const s of skins) {
    assert.ok(s.bodyGradient.start && s.bodyGradient.mid && s.bodyGradient.end);
    assert.ok(s.trimColor && s.roofColor && s.bufferColor && s.lightBeamColor && s.steamColor);
  }
});

test('Daily challenge seed guarantee: different dates produce distinct unique puzzles', () => {
  const seed1 = hashDateStringToSeed('2026-11-01');
  const seed2 = hashDateStringToSeed('2026-11-02');
  const seed3 = hashDateStringToSeed('2026-11-03');

  assert.notEqual(seed1, seed2, 'Consecutive days must have different seeds');
  assert.notEqual(seed2, seed3, 'Consecutive days must have different seeds');

  const p1 = generateDailyPuzzle('2026-11-01');
  const p1Again = generateDailyPuzzle('2026-11-01');
  assert.deepEqual(p1.solution, p1Again.solution, 'Same day must always generate the exact same puzzle');
  assert.equal(p1.isDaily, true);

  const val = validatePlayerBoard(p1.solution, p1);
  assert.equal(val.isValid, true, 'Daily puzzle solution must be valid');
});

test('Total stars calculation sums up stars correctly', () => {
  const sampleRecords = {
    1: { completed: true, stars: 3, seconds: 40, moves: 12, usedHint: false },
    2: { completed: true, stars: 2, seconds: 50, moves: 18, usedHint: false },
    3: { completed: true, stars: 1, seconds: 80, moves: 25, usedHint: true },
  };
  const total = calculateTotalStars(sampleRecords);
  assert.equal(total, 6);
});
