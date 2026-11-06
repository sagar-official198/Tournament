import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, applyEvent, aliveCount } from '../utils/kabaddiEngine.js';

const run = (state, ...events) => events.reduce((s, e) => {
  const r = applyEvent(s, e);
  assert.ok(!r.error, r.error);
  return r.state;
}, state);

test('raid scores one point per touch and switches raiding team', () => {
  const s = run(createState(), { type: 'RAID', touches: 2 });
  assert.equal(s.score[0], 2);
  assert.equal(aliveCount(s, 1), 5);
  assert.equal(s.raiding, 1);
});

test('bonus point needs 6 or 7 defenders and never revives', () => {
  let s = run(createState(), { type: 'RAID', touches: 1 }); // B has 6
  s = run(s, { type: 'RAID', touches: 1 });                 // B scores, A has 6
  const r = applyEvent(s, { type: 'RAID', touches: 0, bonus: true });
  assert.ok(!r.error);
  assert.equal(r.state.score[0], 2); // A: 1 from first raid + 1 bonus
  assert.equal(aliveCount(r.state, 1), 7); // bonus never takes a player out
});

test('bonus is ignored when defence has fewer than 6', () => {
  let s = createState();
  s = run(s, { type: 'RAID', touches: 2 }, { type: 'EMPTY' }); // B has 5, A raids again
  const r = applyEvent(s, { type: 'RAID', touches: 1, bonus: true });
  assert.ok(r.effects.some((e) => e.type === 'BONUS_IGNORED'));
  assert.equal(r.state.score[0], 3);
});

test('raid with only an ignored bonus is rejected', () => {
  let s = createState();
  s = run(s, { type: 'RAID', touches: 2 }, { type: 'EMPTY' });
  const r = applyEvent(s, { type: 'RAID', touches: 0, bonus: true });
  assert.ok(r.error);
});

test('super raid at 3 points', () => {
  const r = applyEvent(createState(), { type: 'RAID', touches: 3 });
  assert.ok(r.effects.some((e) => e.type === 'SUPER_RAID'));
});

test('tackle gives defence a point and revives one defender in order', () => {
  let s = run(createState(), { type: 'RAID', touches: 2 }); // A +2, B has 5 (players 0,1 out)
  const r = applyEvent(s, { type: 'TACKLE' });               // B raids, A tackles -> A +1
  assert.equal(r.state.score[0], 3);
  assert.equal(aliveCount(r.state, 1), 4); // B raider is out
});

test('revival follows the order players went out', () => {
  let s = run(createState(), { type: 'RAID', touches: 2 }); // B players 0,1 out
  s = run(s, { type: 'RAID', touches: 1 });                  // B scores 1, revives player 0
  assert.equal(s.alive[1][0], true);
  assert.equal(s.alive[1][1], false);
});

test('super tackle when defence has 3 or fewer', () => {
  let s = createState();
  s.alive[0] = [true, true, true, false, false, false, false];
  s.queue[0] = [3, 4, 5, 6];
  s.raiding = 1;
  const r = applyEvent(s, { type: 'TACKLE' });
  assert.ok(r.effects.some((e) => e.type === 'SUPER_TACKLE'));
  assert.equal(r.state.score[0], 2);
});

test('two empty raids make the third a do-or-die', () => {
  let s = run(createState(), { type: 'EMPTY' }, { type: 'EMPTY' }, { type: 'EMPTY' }, { type: 'EMPTY' });
  s.raiding = 0;
  const r = applyEvent(s, { type: 'EMPTY' });
  assert.ok(r.effects.some((e) => e.type === 'DO_OR_DIE_FAILED'));
  assert.equal(r.state.score[1], 1);
  assert.equal(aliveCount(r.state, 0), 6);
});

test('all out gives 2 extra points and revives everyone', () => {
  let s = createState();
  s.alive[1] = [true, false, false, false, false, false, false];
  s.queue[1] = [1, 2, 3, 4, 5, 6];
  const r = applyEvent(s, { type: 'RAID', touches: 1 });
  assert.equal(r.state.score[0], 1 + 2);
  assert.equal(aliveCount(r.state, 1), 7);
  assert.ok(r.effects.some((e) => e.type === 'ALL_OUT'));
});
