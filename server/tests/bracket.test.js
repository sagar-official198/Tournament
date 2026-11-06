import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBracket } from '../utils/bracket.js';

const ids = (n) => Array.from({ length: n }, (_, i) => `t${i + 1}`);

test('8 teams: 4 + 2 + 1 matches, no byes', () => {
  const { matches, rounds } = buildBracket(ids(8), { shuffleTeams: false });
  assert.equal(rounds, 3);
  assert.equal(matches.length, 7);
  assert.equal(matches.filter((m) => m.bye).length, 0);
  assert.equal(matches[0].teamA, 't1');
  assert.equal(matches[0].teamB, 't5');
});

test('11 teams: bracket of 16 with 5 byes, all teams present', () => {
  const { matches, size } = buildBracket(ids(11));
  assert.equal(size, 16);
  assert.equal(matches.filter((m) => m.bye).length, 5);
  const round1 = matches.filter((m) => m.round === 1);
  const seen = new Set();
  round1.forEach((m) => { if (m.teamA) seen.add(m.teamA); if (m.teamB) seen.add(m.teamB); });
  assert.equal(seen.size, 11);
});

test('no match has two byes and bye winners reach round 2', () => {
  const { matches } = buildBracket(ids(9), { shuffleTeams: false });
  matches.filter((m) => m.round === 1).forEach((m) => assert.ok(m.teamA));
  const byes = matches.filter((m) => m.bye);
  byes.forEach((m) => {
    const next = matches[m.nextIndex];
    assert.equal(next[m.nextSlot === 'A' ? 'teamA' : 'teamB'], m.winner);
  });
});

test('2 teams make a single final', () => {
  const { matches, rounds } = buildBracket(ids(2));
  assert.equal(rounds, 1);
  assert.equal(matches.length, 1);
});

test('fewer than 2 teams throws', () => {
  assert.throws(() => buildBracket(ids(1)));
});

test('8 teams with 3rd-place match: includes 3rd place playoff match', () => {
  const { matches, rounds } = buildBracket(ids(8), { shuffleTeams: false, includeThirdPlace: true });
  assert.equal(rounds, 3);
  assert.equal(matches.length, 8); // 4 + 2 + 1 + 1 (3rd place)
  const thirdPlace = matches.find((m) => m.isThirdPlace);
  assert.ok(thirdPlace);
  assert.equal(thirdPlace.round, 3);
  assert.equal(thirdPlace.matchNumber, 2);
  assert.equal(thirdPlace.label, '3rd Place Playoff');
});
