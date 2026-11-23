'use strict';

const assert = require('assert');
const Rules = require('../js/rules.js');

function approx(actual, expected, eps) {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    actual + ' is not within ' + eps + ' of ' + expected
  );
}

function play(seconds) {
  const state = Rules.createState();
  state.engaged = true;
  const dt = 1 / 60;
  const steps = Math.round(seconds / dt);
  const tally = { hits: 0, accels: 0, misses: 0, empties: 0, completes: 0 };
  for (let i = 0; i < steps; i++) {
    const ev = Rules.tick(state, dt);
    count(ev, tally);
    const win = Rules.hitWindowDist(state.level);
    let ready = false;
    for (let n = 0; n < state.notes.length; n++) {
      if (Math.abs(state.notes[n].dist) <= win) ready = true;
    }
    if (ready) count(Rules.press(state), tally);
  }
  return { state: state, tally: tally };
}

function count(events, tally) {
  for (let i = 0; i < events.length; i++) {
    const type = events[i].type;
    if (type === 'hit') tally.hits += 1;
    else if (type === 'accel') tally.accels += 1;
    else if (type === 'miss') tally.misses += 1;
    else if (type === 'empty') tally.empties += 1;
    else if (type === 'complete') tally.completes += 1;
  }
}

assert.strictEqual(Rules.accelDelay(0), 10);
assert.strictEqual(Rules.accelDelay(1), 20);
assert.strictEqual(Rules.accelDelay(2), 30);
assert.strictEqual(Rules.accelDelay(17), 180);

assert.deepStrictEqual(Rules.progressAt(0), { level: 0, segment: 0 });
assert.deepStrictEqual(Rules.progressAt(10), { level: 1, segment: 0 });
assert.deepStrictEqual(Rules.progressAt(30), { level: 2, segment: 0 });
assert.deepStrictEqual(Rules.progressAt(60), { level: 3, segment: 0 });
assert.deepStrictEqual(Rules.progressAt(1710), { level: 18, segment: 0 });
assert.deepStrictEqual(Rules.progressAt(1800), { level: 18, segment: 90 });
assert.deepStrictEqual(Rules.progressAt(1900), { level: 19, segment: 0 });

const growth = Rules.speedMultiplier(1);
assert.ok(growth > 1.02 && growth < 1.05, 'each step should be a small speed increase');
assert.ok(Rules.speedMultiplier(18) < 2.1, 'tempo stays playable at the end of the story');

for (let level = 0; level <= 40; level++) {
  const interval = Rules.spawnInterval(level);
  const windowSec = Rules.hitWindowSeconds(level);
  assert.ok(windowSec * 2 < interval * 0.92, 'windows overlap at level ' + level);
}

const early = play(9);
assert.strictEqual(early.tally.accels, 0);
assert.strictEqual(early.tally.misses, 0);
assert.strictEqual(early.state.level, 0);

const first = play(10.2);
assert.strictEqual(first.tally.misses, 0);
assert.strictEqual(first.state.level, 1);
assert.strictEqual(first.tally.accels, 1);

const second = play(35);
assert.strictEqual(second.tally.misses, 0);
assert.strictEqual(second.state.level, 2);
assert.strictEqual(second.tally.accels, 2);
approx(second.state.segment, 5, 0.05);

const quarter = play(15);
assert.strictEqual(quarter.state.level, 1);
approx(quarter.state.segment, 5, 0.05);
approx(quarter.state.total, 15, 0.05);

const emptied = Rules.createState();
emptied.engaged = true;
const dt = 1 / 60;
for (let i = 0; i < 15 * 60; i++) {
  Rules.tick(emptied, dt);
  const win = Rules.hitWindowDist(emptied.level);
  for (let n = 0; n < emptied.notes.length; n++) {
    if (Math.abs(emptied.notes[n].dist) <= win) {
      Rules.press(emptied);
      break;
    }
  }
}
assert.strictEqual(emptied.level, 1);
const emptyEvents = Rules.press(emptied);
assert.strictEqual(emptyEvents[0].type, 'empty');
assert.strictEqual(emptied.level, 0);
assert.strictEqual(emptied.segment, 0);
assert.strictEqual(emptied.total, 0);
assert.strictEqual(emptied.storyDone, false);
assert.strictEqual(emptied.notes.length, 1);
assert.strictEqual(emptied.notes[0].dist, 1);
assert.strictEqual(emptied.engaged, false);
let emptyAgain = 0;
for (let i = 0; i < 5 * 60; i++) {
  const ev = Rules.tick(emptied, dt);
  if (ev.some((e) => e.type === 'miss')) emptyAgain += 1;
}
assert.strictEqual(emptyAgain, 0);
assert.strictEqual(emptied.engaged, false);
assert.strictEqual(emptied.total, 0);
assert.ok(emptied.notes.length >= 2, 'after an empty hit the stream flows until the next click');

const missed = Rules.createState();
missed.engaged = true;
let sawMiss = false;
for (let i = 0; i < 60 * 4; i++) {
  const ev = Rules.tick(missed, dt);
  if (ev.some((e) => e.type === 'miss')) {
    sawMiss = true;
    break;
  }
}
assert.strictEqual(sawMiss, true);
assert.strictEqual(missed.level, 0);
assert.strictEqual(missed.total, 0);
assert.strictEqual(missed.segment, 0);
assert.strictEqual(missed.engaged, false);
assert.strictEqual(missed.notes[0].dist, 1);
let missAgain = 0;
for (let i = 0; i < 5 * 60; i++) {
  const ev = Rules.tick(missed, dt);
  if (ev.some((e) => e.type === 'miss' || e.type === 'accel')) missAgain += 1;
}
assert.strictEqual(missAgain, 0);
assert.strictEqual(missed.engaged, false);
assert.strictEqual(missed.total, 0);
assert.ok(missed.notes.some((note) => note.dist < 0), 'a later note can pass the bar without resetting');
while (!missed.notes.some((note) => Math.abs(note.dist) <= Rules.hitWindowDist(0))) {
  Rules.tick(missed, dt);
}
const resumed = Rules.press(missed);
assert.strictEqual(resumed[0].type, 'hit');
assert.strictEqual(missed.engaged, true);
assert.strictEqual(missed.level, 0);
const duplicate = Rules.press(missed);
assert.deepStrictEqual(duplicate, []);
assert.strictEqual(missed.engaged, true);
assert.ok(missed.notes.length > 1, 'the extra tap does not clear the stream');

const fresh = Rules.createState();
for (let i = 0; i < 90; i++) Rules.tick(fresh, dt);
const flowing = fresh.notes.map((note) => note.dist);
const untouched = Rules.press(fresh);
assert.deepStrictEqual(untouched, []);
assert.strictEqual(fresh.engaged, false);
assert.deepStrictEqual(fresh.notes.map((note) => note.dist), flowing);
assert.ok(flowing.length > 1, 'an early press leaves the flowing notes in place');

const locked = Rules.createState();
locked.engaged = true;
const emptiedNow = Rules.press(locked);
assert.strictEqual(emptiedNow[0].type, 'empty');
assert.deepStrictEqual(Rules.press(locked), []);
assert.strictEqual(locked.notes[0].dist, 1);

const ending = play(1801);
assert.strictEqual(ending.tally.misses, 0);
assert.strictEqual(ending.tally.empties, 0);
assert.strictEqual(ending.tally.completes, 1);
assert.strictEqual(ending.state.storyDone, true);
assert.strictEqual(ending.state.level, 18);
assert.ok(ending.state.total >= 1800);
assert.ok(ending.tally.hits > 2800);

const after = play(1901);
assert.strictEqual(after.tally.completes, 1);
assert.strictEqual(after.state.level, 19);
assert.strictEqual(after.tally.misses, 0);

const idle = Rules.createState();
assert.strictEqual(idle.engaged, false);
let idleMiss = 0;
for (let i = 0; i < 5 * 60; i++) {
  const ev = Rules.tick(idle, dt);
  if (ev.some((e) => e.type === 'miss' || e.type === 'accel')) idleMiss += 1;
}
assert.strictEqual(idleMiss, 0);
assert.strictEqual(idle.total, 0);
assert.strictEqual(idle.level, 0);
assert.strictEqual(idle.engaged, false);
assert.ok(idle.notes.length >= 2, 'notes keep arriving before the first click');
assert.ok(
  idle.notes.every((note) => note.dist > -0.45),
  'passed notes leave without resetting the run'
);

const opening = Rules.createState();
while (!opening.notes.some((note) => Math.abs(note.dist) <= Rules.hitWindowDist(0))) {
  Rules.tick(opening, dt);
}
const waiting = opening.notes.length;
const opened = Rules.press(opening);
assert.strictEqual(opened[0].type, 'hit');
assert.strictEqual(opening.engaged, true);
assert.strictEqual(opening.total, 0);
assert.strictEqual(opening.notes.length, waiting - 1);
assert.ok(opening.notes.some((note) => note.dist > 0.4), 'the rest of the stream stays');

assert.strictEqual(Rules.progressPercent(0), 0);
assert.strictEqual(Rules.progressPercent(-3), 0);
assert.strictEqual(Rules.progressPercent(17.9), 0);
assert.strictEqual(Rules.progressPercent(18), 1);
assert.strictEqual(Rules.progressPercent(900), 50);
assert.strictEqual(Rules.progressPercent(1799), 99);
assert.strictEqual(Rules.progressPercent(1800), 100);
assert.strictEqual(Rules.progressPercent(2400), 100);

console.log('rules ok', {
  hitsAt30Min: ending.tally.hits,
  speedAtStoryEnd: Number(Rules.speedMultiplier(18).toFixed(3)),
});
