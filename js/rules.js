'use strict';

// リズムのルールだけを置く。描画も音も知らない。
// 加速までの連続成功時間は 10秒、20秒、30秒… と 10秒ずつ延びる。
// 速度は段階ごとに少しだけ上がる。物語は連続成功 30分で完結する。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Rules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const STORY_SECONDS = 30 * 60;
  const BASE_INTERVAL = 0.6;
  const BASE_APPROACH = 2.05;
  const HIT_WINDOW = 0.11;
  const SPEED_GROWTH = 1.034;
  const INPUT_LOCK = 0.28;

  function accelDelay(level) {
    return (level + 1) * 10;
  }

  function speedMultiplier(level) {
    return Math.pow(SPEED_GROWTH, level);
  }

  function approachDuration(level) {
    return BASE_APPROACH / speedMultiplier(level);
  }

  function spawnInterval(level) {
    return BASE_INTERVAL / speedMultiplier(level);
  }

  function hitWindowSeconds(level) {
    const interval = spawnInterval(level);
    return Math.min(HIT_WINDOW, interval * 0.34);
  }

  function hitWindowDist(level) {
    return hitWindowSeconds(level) / approachDuration(level);
  }

  function progressAt(total) {
    let level = 0;
    let consumed = 0;
    let guard = 0;
    while (consumed + accelDelay(level) <= total + 1e-9 && guard++ < 1000) {
      consumed += accelDelay(level);
      level += 1;
    }
    return { level: level, segment: total - consumed };
  }

  function createState() {
    return {
      started: false,
      level: 0,
      segment: 0,
      total: 0,
      clock: 0,
      spawnAcc: 0,
      notes: [],
      storyDone: false,
      inputLock: 0,
    };
  }

  function wipe(state) {
    state.level = 0;
    state.segment = 0;
    state.total = 0;
    state.clock = 0;
    state.spawnAcc = 0;
    state.notes = [];
    state.storyDone = false;
    state.inputLock = 0;
  }

  function arm(state) {
    wipe(state);
    state.notes.push({ dist: 1 });
    state.inputLock = INPUT_LOCK;
  }

  function nearestIndex(state) {
    const win = hitWindowDist(state.level);
    let best = -1;
    let bestAbs = Infinity;
    for (let i = 0; i < state.notes.length; i++) {
      const dist = Math.abs(state.notes[i].dist);
      if (dist <= win && dist < bestAbs) {
        bestAbs = dist;
        best = i;
      }
    }
    return best;
  }

  function press(state) {
    if (!state.started) {
      state.started = true;
      arm(state);
      return [{ type: 'start' }];
    }
    const index = nearestIndex(state);
    if (index < 0) {
      if (state.inputLock > 0) return [];
      arm(state);
      return [{ type: 'empty' }];
    }
    state.notes.splice(index, 1);
    return [{ type: 'hit', level: state.level }];
  }

  function tick(state, dt) {
    const events = [];
    if (!state.started || !(dt > 0)) return events;
    if (state.inputLock > 0) state.inputLock = Math.max(0, state.inputLock - dt);

    state.clock += dt;
    state.segment += dt;
    state.total += dt;

    let guard = 0;
    while (state.segment + 1e-9 >= accelDelay(state.level) && guard++ < 16) {
      state.segment -= accelDelay(state.level);
      state.level += 1;
      events.push({ type: 'accel', level: state.level });
    }

    if (!state.storyDone && state.total >= STORY_SECONDS) {
      state.storyDone = true;
      events.push({ type: 'complete' });
    }

    const step = dt / approachDuration(state.level);
    for (let i = 0; i < state.notes.length; i++) state.notes[i].dist -= step;

    state.spawnAcc += dt;
    const interval = spawnInterval(state.level);
    let spawned = 0;
    while (state.spawnAcc >= interval && spawned++ < 8) {
      state.spawnAcc -= interval;
      state.notes.push({ dist: 1 });
    }

    const win = hitWindowDist(state.level);
    for (let i = 0; i < state.notes.length; i++) {
      if (state.notes[i].dist < -win) {
        arm(state);
        events.push({ type: 'miss' });
        return events;
      }
    }
    return events;
  }

  return {
    STORY_SECONDS: STORY_SECONDS,
    BASE_INTERVAL: BASE_INTERVAL,
    BASE_APPROACH: BASE_APPROACH,
    HIT_WINDOW: HIT_WINDOW,
    SPEED_GROWTH: SPEED_GROWTH,
    INPUT_LOCK: INPUT_LOCK,
    accelDelay: accelDelay,
    speedMultiplier: speedMultiplier,
    approachDuration: approachDuration,
    spawnInterval: spawnInterval,
    hitWindowSeconds: hitWindowSeconds,
    hitWindowDist: hitWindowDist,
    progressAt: progressAt,
    createState: createState,
    press: press,
    tick: tick,
  };
});
