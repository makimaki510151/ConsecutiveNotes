'use strict';

// 成功音と加速、ミスの短い音。ファイルは使わない。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AudioBus = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let level = 0.85;

  function hitFreq(level) {
    const steps = [0, 2, 4, 7, 9];
    const semi = steps[level % 5];
    const octave = Math.min(1, Math.floor(level / 5));
    return 466.16 * Math.pow(2, (semi + 12 * octave) / 12);
  }

  function ensureNoise() {
    if (noiseBuf) return noiseBuf;
    const length = Math.floor(ctx.sampleRate * 0.2);
    noiseBuf = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  function env(time, peak, attack, dur, destination) {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), time + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    gain.connect(destination || master);
    return gain;
  }

  function tone(freq, time, dur, type, peak, attack) {
    const osc = ctx.createOscillator();
    const gain = env(time, peak, attack || 0.008, dur);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
    osc.onended = function () {
      osc.disconnect();
      gain.disconnect();
    };
  }

  function noiseTick(time) {
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = env(time, 0.11, 0.003, 0.028);
    src.buffer = ensureNoise();
    filter.type = 'highpass';
    filter.frequency.value = 1200;
    src.connect(filter);
    filter.connect(gain);
    src.start(time);
    src.stop(time + 0.04);
    src.onended = function () {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  function ensure() {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return;
    try {
    if (!ctx) {
      ctx = new AC({ latencyHint: 'interactive' });
      master = ctx.createGain();
      master.gain.value = level;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.knee.value = 16;
      comp.ratio.value = 2.4;
      comp.attack.value = 0.004;
      comp.release.value = 0.16;
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    } catch (err) {
      ctx = null;
    }
  }

  function hit(level) {
    if (!ctx) return;
    try { hitNow(level); } catch (err) { /* 音がなくても判定は進める */ }
  }

  function hitNow(level) {
    const now = ctx.currentTime;
    const freq = hitFreq(level);
    const rich = Math.min(1, level / 10);
    noiseTick(now);
    tone(freq, now, 0.1, 'sine', 0.15, 0.006);
    tone(freq * 2, now, 0.06, 'triangle', 0.045, 0.004);
    if (rich > 0) tone(freq * 1.5, now, 0.09, 'sine', 0.04 * rich, 0.008);
  }

  function accel(level) {
    if (!ctx) return;
    try { accelNow(level); } catch (err) { /* 音がなくても加速は進める */ }
  }

  function accelNow(level) {
    const now = ctx.currentTime;
    const freq = hitFreq(level);
    const osc = ctx.createOscillator();
    const gain = env(now, 0.09, 0.02, 0.48);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.75, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.42);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.5);
    osc.onended = function () {
      osc.disconnect();
      gain.disconnect();
    };
    tone(freq * 1.5, now + 0.04, 0.5, 'sine', 0.055, 0.02);
    tone(freq * 2, now + 0.09, 0.36, 'triangle', 0.04, 0.015);
  }

  function miss() {
    if (!ctx) return;
    try { missNow(); } catch (err) { /* 音がなくてもリセットは進める */ }
  }

  function missNow() {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = env(now, 0.1, 0.01, 0.26);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(196, now);
    osc.frequency.exponentialRampToValueAtTime(68, now + 0.22);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.28);
    osc.onended = function () {
      osc.disconnect();
      gain.disconnect();
    };
  }

  function complete() {
    if (!ctx) return;
    try { completeNow(); } catch (err) { /* 音がなくても物語の完結は進める */ }
  }

  function completeNow() {
    const now = ctx.currentTime;
    const chord = [392, 493.88, 587.33, 783.99];
    for (let i = 0; i < chord.length; i++) {
      tone(chord[i], now + i * 0.05, 2.1, 'sine', 0.045, 0.09);
    }
  }

  function setVolume(value) {
    const next = Number(value);
    level = next >= 0 && next <= 1 ? next : level;
    if (master) master.gain.value = level;
  }

  function volume() {
    return level;
  }

  function suspend() {
    if (ctx && ctx.state === 'running') ctx.suspend();
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  return {
    ensure: ensure,
    setVolume: setVolume,
    volume: volume,
    hit: hit,
    accel: accel,
    miss: miss,
    complete: complete,
    suspend: suspend,
    resume: resume,
  };
});
