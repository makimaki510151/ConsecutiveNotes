'use strict';

// 文字を使わない生涯。同じ場所で、夜が明け、人が育ち、誰かと家を建て、
// その誰かは光になって去り、夜を経て、もう一度静かな朝が来る。
// 連続成功の秒数がそのまま時刻になる。途切れると最初の闇に戻る。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Story = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function hex(value) {
    const n = parseInt(value.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function copyVal(value) {
    return Array.isArray(value) ? value.slice() : value;
  }

  function buildKeys(rows) {
    const keys = [];
    let prev = null;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (typeof row.t !== 'number') throw new Error('story key missing t');
      const next = {};
      if (prev) {
        const names = Object.keys(prev);
        for (let i = 0; i < names.length; i++) next[names[i]] = copyVal(prev[names[i]]);
      }
      const fields = Object.keys(row);
      for (let i = 0; i < fields.length; i++) {
        const name = fields[i];
        const value = row[name];
        if (typeof value === 'string') next[name] = hex(value);
        else next[name] = value;
      }
      keys.push(next);
      prev = next;
    }
    for (let i = 1; i < keys.length; i++) {
      if (!(keys[i].t > keys[i - 1].t)) throw new Error('story keys must increase');
    }
    return keys;
  }

  const KEYS = buildKeys([
    {
      t: 0,
      skyTop: '#07060d',
      skyMid: '#14131e',
      skyHor: '#2a2740',
      ground: '#16141e',
      hillFar: '#3c3a52',
      hillNear: '#2a2838',
      canopy: '#1a1c18',
      fig: '#1a1720',
      note: '#d7def0',
      star: 0.62,
      sun: 0,
      sunX: 0.2,
      sunAlt: 0,
      moon: 0,
      moonX: 0.72,
      cloud: 0,
      grass: 0,
      flower: 0,
      tree: 0,
      tree2: 0,
      house: 0,
      window: 0,
      smoke: 0,
      figA: 0,
      figAScale: 0.42,
      figASit: 0,
      figB: 0,
      figBX: 0.92,
      figBRise: 0,
      figC: 0,
      figCScale: 0.34,
      sprout: 0,
      fall: 0,
      firefly: 0,
      pollen: 0,
      dust: 0.35,
      kite: 0,
    },
    { t: 16, star: 0.72, dust: 0.4 },
    { t: 28, skyHor: '#2a1c22', sun: 0.08, sunAlt: 0.02, star: 0.42 },
    {
      t: 36,
      skyTop: '#1a1630',
      skyMid: '#8a4058',
      skyHor: '#ffb08a',
      ground: '#241820',
      hillFar: '#322838',
      hillNear: '#2a1c24',
      sun: 0.62,
      sunAlt: 0.07,
      sunX: 0.18,
      star: 0.28,
      grass: 0.12,
      dust: 0.55,
    },
    {
      t: 78,
      skyTop: '#35507a',
      skyMid: '#e39a86',
      skyHor: '#ffd2b4',
      ground: '#3a5a38',
      hillFar: '#6e88a4',
      hillNear: '#2c5838',
      canopy: '#e7b3c2',
      note: '#ffe6d2',
      sun: 0.9,
      sunAlt: 0.18,
      sunX: 0.24,
      star: 0.06,
      grass: 0.7,
      flower: 0.16,
      tree: 0.1,
      figA: 0.7,
      figAScale: 0.48,
      pollen: 0.25,
      cloud: 0.3,
    },
    {
      t: 150,
      skyTop: '#79b6e6',
      skyMid: '#f3d0b4',
      skyHor: '#fff0dc',
      ground: '#3f8a44',
      hillFar: '#8eafcc',
      hillNear: '#2f6d40',
      canopy: '#f0c0cc',
      note: '#fff4e6',
      fig: '#1c1822',
      sun: 1,
      sunAlt: 0.34,
      sunX: 0.32,
      grass: 1,
      flower: 0.62,
      tree: 0.24,
      tree2: 0.1,
      figA: 1,
      figAScale: 0.56,
      pollen: 0.5,
      cloud: 0.58,
      kite: 0.45,
    },
    {
      t: 300,
      sunX: 0.42,
      sunAlt: 0.52,
      figAScale: 0.68,
      tree: 0.4,
      tree2: 0.22,
      flower: 0.72,
      canopy: '#3e9a52',
      kite: 1,
      figB: 0.2,
      figBX: 0.84,
      cloud: 0.7,
    },
    {
      t: 460,
      skyTop: '#62b0ea',
      skyMid: '#c5e2f6',
      skyHor: '#fff6e4',
      sunX: 0.5,
      sunAlt: 0.7,
      figB: 1,
      figBX: 0.56,
      figAScale: 0.8,
      tree: 0.55,
      tree2: 0.36,
      kite: 1,
      flower: 0.55,
      cloud: 0.72,
      canopy: '#2f8a45',
    },
    {
      t: 660,
      sunX: 0.58,
      sunAlt: 0.6,
      skyMid: '#f0d2ae',
      house: 0.28,
      kite: 0.15,
      figAScale: 0.9,
      tree: 0.68,
      canopy: '#347e40',
      flower: 0.4,
    },
    {
      t: 860,
      skyTop: '#79a8dc',
      skyMid: '#f2c896',
      skyHor: '#ffe6c0',
      ground: '#5c8a38',
      sunX: 0.66,
      sunAlt: 0.46,
      house: 0.95,
      window: 0.2,
      smoke: 0.4,
      figC: 0.85,
      figCScale: 0.42,
      kite: 0,
      tree: 0.82,
      tree2: 0.52,
      flower: 0.42,
      canopy: '#3f7a32',
      figAScale: 0.97,
    },
    {
      t: 1080,
      skyTop: '#e09458',
      skyMid: '#ffc56e',
      skyHor: '#ffe3a8',
      ground: '#7a8630',
      hillFar: '#d49a6c',
      hillNear: '#5a6a28',
      note: '#fff1cc',
      sunX: 0.76,
      sunAlt: 0.3,
      house: 1,
      window: 0.4,
      smoke: 0.75,
      figC: 1,
      figCScale: 0.52,
      figAScale: 1,
      tree: 0.92,
      tree2: 0.64,
      flower: 0.28,
      canopy: '#b8963a',
      cloud: 0.42,
    },
    {
      t: 1260,
      sunX: 0.84,
      sunAlt: 0.16,
      skyTop: '#ef8a4e',
      skyMid: '#ffb15c',
      skyHor: '#ffd18a',
      figCScale: 0.6,
      canopy: '#c9842e',
      flower: 0.18,
      fall: 0.2,
      smoke: 0.45,
    },
    {
      t: 1400,
      skyTop: '#c45e6c',
      skyMid: '#ff8d62',
      skyHor: '#ffb07a',
      ground: '#6a5a30',
      hillFar: '#a86868',
      hillNear: '#5a4030',
      sun: 0.9,
      sunAlt: 0.09,
      sunX: 0.9,
      figB: 0.8,
      figBRise: 0.2,
      fall: 0.6,
      window: 0.75,
      canopy: '#d15a28',
      smoke: 0.15,
      cloud: 0.28,
      star: 0.08,
      note: '#ffe0c0',
    },
    {
      t: 1540,
      skyTop: '#5a3058',
      skyMid: '#c46078',
      skyHor: '#e88870',
      figB: 0.05,
      figBRise: 0.9,
      fall: 0.9,
      moon: 0.4,
      moonX: 0.68,
      star: 0.28,
      sun: 0.28,
      sunAlt: 0.02,
      window: 1,
      firefly: 0.25,
      figASit: 0.2,
      canopy: '#8a4030',
      grass: 0.55,
      flower: 0.04,
      figCScale: 0.66,
    },
    {
      t: 1660,
      skyTop: '#0c1024',
      skyMid: '#1a2040',
      skyHor: '#222848',
      ground: '#121610',
      hillFar: '#161a30',
      hillNear: '#141810',
      canopy: '#243044',
      fig: '#d8dcec',
      note: '#e4ecff',
      figB: 0,
      figBRise: 1,
      sun: 0,
      moon: 0.95,
      moonX: 0.6,
      star: 0.9,
      firefly: 1,
      window: 0.8,
      figASit: 0.85,
      figCScale: 0.72,
      fall: 0.1,
      grass: 0.22,
      cloud: 0.04,
      dust: 0.2,
      tree: 0.96,
      tree2: 0.72,
      house: 1,
      smoke: 0,
    },
    {
      t: 1740,
      skyTop: '#080b18',
      skyMid: '#12182e',
      skyHor: '#1a2038',
      star: 1,
      moon: 1,
      window: 0.35,
      figASit: 1,
      figCScale: 0.76,
      firefly: 1,
      sprout: 0.08,
    },
    {
      t: 1772,
      skyTop: '#2a3348',
      skyMid: '#6a5a68',
      skyHor: '#c49890',
      fig: '#241c28',
      star: 0.4,
      moon: 0.35,
      sun: 0.3,
      sunAlt: 0.05,
      sunX: 0.16,
      window: 0.5,
      sprout: 0.4,
      firefly: 0.3,
    },
    {
      t: 1800,
      skyTop: '#8eabca',
      skyMid: '#f0c8b8',
      skyHor: '#ffe7d6',
      ground: '#4e724c',
      hillFar: '#b0c0cc',
      hillNear: '#3f6548',
      canopy: '#6eae78',
      fig: '#221c24',
      note: '#fff8f2',
      sun: 0.78,
      sunAlt: 0.15,
      sunX: 0.24,
      moon: 0.1,
      star: 0.12,
      cloud: 0.38,
      grass: 0.9,
      flower: 0.55,
      tree: 1,
      tree2: 0.8,
      house: 1,
      window: 0.62,
      smoke: 0.12,
      figA: 1,
      figAScale: 1,
      figASit: 1,
      figB: 0,
      figC: 1,
      figCScale: 0.88,
      sprout: 1,
      firefly: 0.1,
      fall: 0,
      pollen: 0.25,
      dust: 0.25,
      kite: 0,
    },
  ]);

  function blend(a, b, t, time) {
    const out = { t: time };
    const names = Object.keys(a);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      if (name === 't') continue;
      const av = a[name];
      const bv = b[name];
      if (Array.isArray(av)) {
        out[name] = [
          av[0] + (bv[0] - av[0]) * t,
          av[1] + (bv[1] - av[1]) * t,
          av[2] + (bv[2] - av[2]) * t,
        ];
      } else {
        out[name] = av + (bv - av) * t;
      }
    }
    return out;
  }

  function sample(time) {
    const last = KEYS.length - 1;
    if (time <= KEYS[0].t) return blend(KEYS[0], KEYS[0], 0, time);
    if (time >= KEYS[last].t) return blend(KEYS[last], KEYS[last], 1, time);
    let index = 1;
    while (index < KEYS.length && KEYS[index].t < time) index += 1;
    const from = KEYS[index - 1];
    const to = KEYS[index];
    const u = (time - from.t) / (to.t - from.t);
    const eased = u * u * (3 - 2 * u);
    return blend(from, to, eased, time);
  }

  function mulberry32(seed) {
    let a = seed;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function spots(count, seed) {
    const rand = mulberry32(seed);
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        x: rand(),
        h: 0.35 + rand() * 0.9,
        phase: rand() * 6.28,
        kind: rand(),
      });
    }
    return list;
  }

  const STARS = spots(84, 11).map(function (spot, index) {
    return {
      x: spot.x,
      y: 0.04 + spot.h * 0.42,
      s: spot.kind > 0.92 ? 2.4 : 1.2,
      a: 0.35 + spot.kind * 0.65,
      phase: spot.phase,
      spd: 0.6 + (index % 5) * 0.15,
    };
  });
  const GRASS = spots(72, 21);
  const FLOWERS = spots(42, 33);

  const pool = [];
  for (let i = 0; i < 160; i++) pool.push({ alive: false });
  let cursor = 0;

  function reset() {
    for (let i = 0; i < pool.length; i++) pool[i].alive = false;
    cursor = 0;
  }

  function spawn(spec) {
    for (let i = 0; i < pool.length; i++) {
      const index = (cursor + i) % pool.length;
      if (!pool[index].alive) {
        cursor = (index + 1) % pool.length;
        const p = pool[index];
        p.alive = true;
        p.x = spec.x;
        p.y = spec.y;
        p.vx = spec.vx;
        p.vy = spec.vy;
        p.life = spec.life;
        p.max = spec.life;
        p.size = spec.size;
        p.kind = spec.kind;
        p.phase = spec.phase;
        p.color = spec.color;
        return;
      }
    }
  }

  function emit(dt, rate, fn) {
    if (rate <= 0) return;
    const amount = rate * dt;
    let count = Math.floor(amount);
    if (Math.random() < amount - count) count += 1;
    for (let i = 0; i < count; i++) fn();
  }

  function layout(w, h) {
    const short = h < 520;
    const laneH = short ? Math.max(42, Math.min(h * 0.16, 72)) : Math.max(58, h * 0.112);
    const laneY = short ? h - laneH * 0.58 : h * 0.835;
    const horizon = short ? Math.min(h * 0.42, laneY - laneH) : h * 0.58;
    const feet = short ? horizon + (laneY - laneH * 0.5 - horizon) * 0.72 : h * 0.735;
    return {
      horizon: horizon,
      laneH: laneH,
      laneY: laneY,
      feet: feet,
      judgeX: Math.max(Math.min(86, w * 0.24), w * 0.22),
      spawnX: w + 46,
    };
  }

  function tick(dt, time, anim, w, h) {
    if (!(w > 0) || !(h > 0)) return;
    const s = sample(time);
    const L = layout(w, h);
    const laneTop = L.laneY - L.laneH * 0.5;
    emit(dt, s.fall * 7, function () {
      spawn({
        x: Math.random() * w,
        y: L.horizon - 30 - Math.random() * h * 0.12,
        vx: -16 - Math.random() * 24,
        vy: 16 + Math.random() * 22,
        life: 5 + Math.random() * 3,
        size: 2.5 + Math.random() * 2.2,
        kind: 'leaf',
        phase: Math.random() * 6,
        color: [206, 112, 48],
      });
    });
    emit(dt, s.firefly * 4.5, function () {
      spawn({
        x: w * (0.08 + Math.random() * 0.84),
        y: L.horizon + Math.random() * (L.feet - L.horizon),
        vx: -6 + Math.random() * 12,
        vy: -4 + Math.random() * 8,
        life: 3 + Math.random() * 3,
        size: 1.6 + Math.random() * 1.4,
        kind: 'firefly',
        phase: Math.random() * 6,
        color: [214, 230, 150],
      });
    });
    emit(dt, s.pollen * 3.5, function () {
      spawn({
        x: Math.random() * w,
        y: L.feet - Math.random() * h * 0.08,
        vx: -8 + Math.random() * 16,
        vy: -10 - Math.random() * 14,
        life: 4 + Math.random(),
        size: 1.4,
        kind: 'pollen',
        phase: Math.random() * 6,
        color: [255, 236, 206],
      });
    });
    emit(dt, s.dust * 2, function () {
      spawn({
        x: Math.random() * w,
        y: Math.random() * L.horizon,
        vx: -4 + Math.random() * 8,
        vy: -2 + Math.random() * 4,
        life: 6,
        size: 1.1,
        kind: 'dust',
        phase: Math.random() * 6,
        color: [196, 204, 224],
      });
    });
    if (s.figB > 0.04 && s.figBRise > 0.02) {
      emit(dt, 14 * s.figBRise * s.figB, function () {
        spawn({
          x: w * s.figBX + (Math.random() - 0.5) * 16,
          y: L.feet - s.figBRise * h * 0.3 - Math.random() * 20,
          vx: (Math.random() - 0.5) * 10,
          vy: -28 - Math.random() * 30,
          life: 2.4,
          size: 1.8,
          kind: 'rise',
          phase: Math.random() * 6,
          color: [255, 214, 176],
        });
      });
    }
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.alive = false;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'leaf') {
        p.x += Math.sin(anim * 2 + p.phase) * 16 * dt;
        p.vy += 6 * dt;
      } else if (p.kind === 'firefly') {
        p.y += Math.sin(anim * 1.7 + p.phase) * 12 * dt;
      }
      if (p.y > laneTop || p.x < -20 || p.x > w + 20) p.alive = false;
    }
  }

  function byte(value) {
    if (value < 0) return 0;
    if (value > 255) return 255;
    return value | 0;
  }

  function css(c, a) {
    const r = byte(c[0]);
    const g = byte(c[1]);
    const b = byte(c[2]);
    if (a == null) return 'rgb(' + r + ',' + g + ',' + b + ')';
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function scale(c, m) {
    return [c[0] * m, c[1] * m, c[2] * m];
  }

  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  function hill(ctx, w, horizon, color, amp, base, wavelength, phase) {
    ctx.beginPath();
    ctx.moveTo(0, horizon + 4);
    const steps = Math.max(28, Math.round(w / 22));
    for (let i = 0; i <= steps; i++) {
      const x = (w * i) / steps;
      const n = Math.sin(x / wavelength + phase) + 0.42 * Math.sin(x / (wavelength * 2.2) + phase * 1.6);
      ctx.lineTo(x, horizon - base - n * amp);
    }
    ctx.lineTo(w, horizon + 90);
    ctx.lineTo(0, horizon + 90);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawPerson(ctx, x, feet, hgt, alpha, sit, color, anim, phase) {
    if (alpha < 0.2 || hgt < 4) return;
    const crouch = sit < 0 ? 0 : sit > 1 ? 1 : sit;
    const bob = Math.sin(anim * 1.7 + phase) * (crouch > 0.65 ? 0.4 : 2.1);
    const body = hgt * (1 - crouch * 0.55);
    ctx.save();
    ctx.translate(x, feet + bob);
    ctx.globalAlpha = alpha > 1 ? 1 : alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 0, hgt * (0.16 + crouch * 0.2), Math.max(2, hgt * 0.04), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(color);
    if (crouch > 0.25) {
      ctx.beginPath();
      ctx.ellipse(hgt * 0.18 * crouch, -hgt * 0.02, hgt * 0.22 * crouch, hgt * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    const half = hgt * (0.11 + crouch * 0.16);
    ctx.moveTo(0, -body);
    ctx.quadraticCurveTo(half * 1.05, -body * 0.58, half * 0.72, -hgt * 0.015);
    ctx.lineTo(-half * 0.72, -hgt * 0.015);
    ctx.quadraticCurveTo(-half * 1.05, -body * 0.58, 0, -body);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -body - hgt * 0.055, hgt * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawTree(ctx, x, feet, growth, h, leaf, trunk, bare) {
    if (growth <= 0.02) return;
    const trunkH = growth * h * 0.2;
    const trunkW = h * (0.007 + growth * 0.014);
    ctx.fillStyle = css(trunk);
    ctx.fillRect(x - trunkW / 2, feet - trunkH, trunkW, trunkH);
    const radius = growth * h * (bare ? 0.085 : 0.112);
    if (radius < 3) return;
    const top = feet - trunkH;
    const blobs = [
      [0, -radius * 0.82, radius],
      [-radius * 0.62, -radius * 0.42, radius * 0.74],
      [radius * 0.66, -radius * 0.38, radius * 0.7],
      [0.1 * radius, -radius * 0.2, radius * 0.62],
    ];
    ctx.fillStyle = css(leaf);
    for (let i = 0; i < blobs.length; i++) {
      ctx.beginPath();
      ctx.arc(x + blobs[i][0], top + blobs[i][1], blobs[i][2], 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHouse(ctx, x, feet, size, build, glow, wall) {
    if (build < 0.1) return;
    const width = size * 1.42;
    const wallH = size * Math.min(1, build / 0.48);
    const left = x - width / 2;
    const top = feet - wallH;
    ctx.fillStyle = css(wall);
    ctx.fillRect(left, top, width, wallH);
    if (build > 0.48) {
      const roof = Math.min(1, (build - 0.48) / 0.28);
      ctx.beginPath();
      ctx.moveTo(left - size * 0.12, top + 1);
      ctx.lineTo(x, top - size * 0.78 * roof);
      ctx.lineTo(left + width + size * 0.12, top + 1);
      ctx.closePath();
      ctx.fill();
    }
    if (build > 0.78) {
      ctx.fillStyle = css(scale(wall, 0.55));
      const doorW = size * 0.18;
      const doorH = size * 0.4;
      ctx.fillRect(x - doorW / 2, feet - doorH, doorW, doorH);
      const win = size * 0.16;
      const wx = x + width * 0.22;
      const wy = top + wallH * 0.28;
      ctx.fillStyle = css([255, 196, 122], 0.25 + glow * 0.75);
      ctx.fillRect(wx, wy, win, win);
      if (glow > 0.04) {
        const g = ctx.createRadialGradient(wx + win / 2, wy + win / 2, 2, wx + win / 2, wy + win / 2, size * 0.85);
        g.addColorStop(0, 'rgba(255, 196, 120,' + glow * 0.55 + ')');
        g.addColorStop(1, 'rgba(255, 180, 90, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(wx - size, wy - size, size * 2.6, size * 2.6);
      }
    }
    if (build > 0.9) {
      ctx.fillStyle = css(wall);
      ctx.fillRect(x + width * 0.22, top - size * 0.55, size * 0.1, size * 0.28);
    }
  }

  function render(ctx, w, h, time, anim, fx) {
    const s = sample(time);
    const L = layout(w, h);
    const sky = ctx.createLinearGradient(0, 0, 0, L.horizon);
    sky.addColorStop(0, css(s.skyTop));
    sky.addColorStop(0.55, css(s.skyMid));
    sky.addColorStop(1, css(s.skyHor));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    for (let i = 0; i < STARS.length; i++) {
      const star = STARS[i];
      const twinkle = 0.55 + 0.45 * Math.sin(anim * star.spd + star.phase);
      const alpha = s.star * star.a * twinkle;
      if (alpha < 0.03) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#eef3ff';
      ctx.fillRect(star.x * w, star.y * L.horizon, star.s, star.s);
    }
    ctx.restore();

    if (s.sun > 0.03) {
      const sx = s.sunX * w;
      const sy = L.horizon - s.sunAlt * h * 0.46;
      const radius = Math.max(w, h) * 0.2;
      const glow = ctx.createRadialGradient(sx, sy, 8, sx, sy, radius);
      glow.addColorStop(0, css([255, 244, 220], 0.9 * s.sun));
      glow.addColorStop(0.16, css([255, 196, 140], 0.38 * s.sun));
      glow.addColorStop(1, css([255, 160, 90], 0));
      ctx.fillStyle = glow;
      ctx.fillRect(sx - radius, sy - radius, radius * 2, radius * 2);
      ctx.beginPath();
      ctx.fillStyle = css([255, 250, 236], Math.min(1, s.sun));
      ctx.arc(sx, sy, Math.max(9, h * 0.026), 0, Math.PI * 2);
      ctx.fill();
    }

    if (s.moon > 0.04) {
      const mx = s.moonX * w;
      const my = h * 0.16;
      const radius = Math.max(w, h) * 0.16;
      const glow = ctx.createRadialGradient(mx, my, 4, mx, my, radius);
      glow.addColorStop(0, css([210, 220, 255], 0.45 * s.moon));
      glow.addColorStop(1, css([180, 190, 255], 0));
      ctx.fillStyle = glow;
      ctx.fillRect(mx - radius, my - radius, radius * 2, radius * 2);
      ctx.beginPath();
      ctx.fillStyle = css([236, 240, 255], s.moon);
      ctx.arc(mx, my, Math.max(8, h * 0.02), 0, Math.PI * 2);
      ctx.fill();
    }

    if (s.cloud > 0.04) {
      const puff = [
        [0.18, 0.16, 0.11],
        [0.46, 0.12, 0.14],
        [0.72, 0.18, 0.1],
      ];
      for (let i = 0; i < puff.length; i++) {
        const drift = ((anim * (0.008 + i * 0.002) + puff[i][0]) % 1.3) - 0.15;
        const cx = drift * w;
        const cy = h * puff[i][1];
        const rw = w * puff[i][2];
        ctx.fillStyle = css(mix([255, 255, 255], s.skyHor, 0.4), 0.28 * s.cloud);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rw * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + rw * 0.45, cy + rw * 0.05, rw * 0.72, rw * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (s.sun > 0.55 && s.star < 0.25 && s.fall < 0.35) {
      ctx.save();
      ctx.strokeStyle = css(scale(s.fig, 0.7), 0.55);
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const bx = ((anim * (22 + i * 8) + i * 240) % (w + 100)) - 50;
        const by = h * (0.1 + i * 0.055) + Math.sin(anim * 0.8 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(bx - 7, by);
        ctx.lineTo(bx, by + 3.5);
        ctx.lineTo(bx + 7, by);
        ctx.stroke();
      }
      ctx.restore();
    }

    const farAmp = Math.max(22, h * 0.05);
    const nearAmp = Math.max(14, h * 0.032);
    hill(ctx, w, L.horizon, css(s.hillFar), farAmp, Math.max(26, h * 0.055), 320, 0.4);
    hill(ctx, w, L.horizon, css(s.hillNear), nearAmp, Math.max(12, h * 0.016), 210, 1.7);

    const ground = ctx.createLinearGradient(0, L.horizon, 0, h);
    ground.addColorStop(0, css(scale(s.ground, 1.08)));
    ground.addColorStop(0.45, css(s.ground));
    ground.addColorStop(1, css(scale(s.ground, 0.55)));
    ctx.fillStyle = ground;
    ctx.fillRect(0, L.horizon, w, h - L.horizon);

    if (s.sun > 0.25) {
      const wash = ctx.createRadialGradient(s.sunX * w, L.horizon, 10, s.sunX * w, L.horizon, w * 0.42);
      wash.addColorStop(0, css([255, 214, 160], 0.16 * s.sun));
      wash.addColorStop(1, css([255, 214, 160], 0));
      ctx.fillStyle = wash;
      ctx.fillRect(0, L.horizon - h * 0.08, w, (L.feet - L.horizon) + h * 0.12);
    }

    if (s.grass > 0.03) {
      ctx.save();
      ctx.strokeStyle = css(scale(s.hillNear, 0.78), 0.9);
      ctx.lineWidth = 1.4;
      const meadow = L.feet - L.horizon;
      for (let i = 0; i < GRASS.length; i++) {
        if (i / GRASS.length > s.grass) break;
        const blade = GRASS[i];
        const x = blade.x * w;
        const base = L.horizon + meadow * (0.18 + blade.kind * 0.72);
        const height = h * 0.02 * blade.h * (0.5 + s.grass * 0.5);
        const sway = Math.sin(anim * 1.35 + blade.phase) * 4 * s.grass;
        ctx.globalAlpha = 0.45 + blade.kind * 0.4;
        ctx.beginPath();
        ctx.moveTo(x, base);
        ctx.quadraticCurveTo(x + sway, base - height * 0.55, x + sway * 1.3, base - height);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (s.flower > 0.04) {
      for (let i = 0; i < FLOWERS.length; i++) {
        if (i / FLOWERS.length > s.flower) break;
        const flower = FLOWERS[i];
        const x = flower.x * w;
        const y = L.horizon + (L.feet - L.horizon) * (0.25 + flower.kind * 0.6);
        const petal = flower.kind < 0.33 ? [244, 214, 120] : flower.kind < 0.66 ? [244, 176, 196] : [236, 236, 246];
        ctx.fillStyle = css(petal, 0.85);
        ctx.beginPath();
        ctx.arc(x, y, 2.2 + flower.h, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const trunk = mix([58, 44, 36], [154, 160, 176], Math.min(1, s.star));
    const bare = s.star > 0.55 ? 1 : 0;
    drawTree(ctx, w * 0.17, L.feet, s.tree2, h * 0.82, s.canopy, trunk, bare);
    drawTree(ctx, w * 0.68, L.feet, s.tree, h, s.canopy, trunk, bare);

    const wall = mix([74, 62, 58], [188, 186, 198], Math.min(1, s.star));
    if (s.house > 0.45) {
      ctx.fillStyle = css(scale(s.ground, 1.25), 0.45);
      ctx.beginPath();
      ctx.ellipse(w * 0.3, L.feet + 2, h * 0.08, h * 0.012, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    drawHouse(ctx, w * 0.29, L.feet, h * 0.125, s.house, s.window, wall);

    if (s.smoke > 0.05 && s.house > 0.88) {
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const p = (anim * 0.12 + i / 4) % 1;
        const sx = w * 0.29 + h * 0.04;
        const sy = L.feet - h * 0.125 * 1.35 - p * h * 0.1;
        ctx.globalAlpha = (1 - p) * s.smoke * 0.32;
        ctx.fillStyle = '#efeae4';
        ctx.beginPath();
        ctx.arc(sx + Math.sin(anim + i) * 5, sy, 2.5 + p * 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const figH = h * 0.155;
    drawPerson(ctx, w * 0.41, L.feet, figH * s.figAScale, s.figA, s.figASit, s.fig, anim, 0.4);
    const farewell = s.figB * (1 - Math.min(1, s.figBRise * 1.12));
    const lift = s.figBRise * h * 0.4;
    if (farewell > 0.03) {
      const fx = w * s.figBX;
      const fy = L.feet - lift - h * 0.05;
      const glow = ctx.createRadialGradient(fx, fy, 4, fx, fy, h * 0.12);
      glow.addColorStop(0, 'rgba(255, 214, 176,' + 0.4 * s.figBRise + ')');
      glow.addColorStop(1, 'rgba(255, 214, 176, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(fx, fy, h * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    drawPerson(ctx, w * s.figBX, L.feet - lift, figH * 1.04, farewell, 0, s.fig, anim, 1.4);
    drawPerson(ctx, w * 0.5, L.feet, figH * s.figCScale, s.figC, 0, s.fig, anim, 2.2);

    if (s.kite > 0.05 && s.figA > 0.4) {
      const kx = w * 0.5 + Math.sin(anim * 0.65) * w * 0.025;
      const ky = L.horizon - h * 0.2 + Math.sin(anim * 1.2) * 7;
      ctx.save();
      ctx.globalAlpha = Math.min(1, s.kite);
      ctx.strokeStyle = css(s.fig, 0.45);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.41, L.feet - figH * s.figAScale * 0.45);
      ctx.lineTo(kx, ky);
      ctx.stroke();
      ctx.fillStyle = css([242, 208, 214]);
      ctx.beginPath();
      ctx.moveTo(kx, ky - 13);
      ctx.lineTo(kx + 9, ky);
      ctx.lineTo(kx, ky + 13);
      ctx.lineTo(kx - 9, ky);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (s.sprout > 0.03) {
      const sx = w * 0.36;
      const sh = 26 * s.sprout;
      ctx.save();
      ctx.globalAlpha = Math.min(1, s.sprout);
      ctx.strokeStyle = css([232, 240, 206]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, L.feet);
      ctx.quadraticCurveTo(sx + 3, L.feet - sh * 0.6, sx + 1, L.feet - sh);
      ctx.stroke();
      ctx.fillStyle = css([214, 232, 170]);
      ctx.beginPath();
      ctx.ellipse(sx + 7, L.feet - sh * 0.72, 6, 3, -0.7, 0, Math.PI * 2);
      ctx.ellipse(sx - 5, L.feet - sh * 0.58, 5, 2.6, 0.6, 0, Math.PI * 2);
      ctx.fill();
      const glow = ctx.createRadialGradient(sx, L.feet - sh * 0.4, 2, sx, L.feet - sh * 0.4, 28);
      glow.addColorStop(0, 'rgba(230, 255, 210, 0.55)');
      glow.addColorStop(1, 'rgba(230, 255, 210, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, L.feet - sh * 0.4, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (!p.alive) continue;
      const fade = Math.max(0, p.life / p.max);
      let alpha = fade * (p.kind === 'dust' ? 0.4 : 0.85);
      if (p.kind === 'firefly') alpha *= 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(anim * 4 + p.phase));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = css(p.color);
      ctx.beginPath();
      if (p.kind === 'leaf') ctx.ellipse(p.x, p.y, p.size * 1.4, p.size * 0.7, p.phase + anim, 0, Math.PI * 2);
      else ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (fx && fx.ringOn && fx.ringT >= 0 && fx.ringT < 5.6) {
      const p = fx.ringT / 5.6;
      ctx.beginPath();
      ctx.arc(w * 0.43, L.horizon - h * 0.02, 16 + p * Math.max(w, h) * 0.62, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 236, 214,' + (1 - p) * 0.75 + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.42, h * 0.18, w * 0.5, h * 0.48, h * 0.82);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(0.72, 'rgba(0,0,0,0.05)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  return {
    keys: KEYS,
    sample: sample,
    layout: layout,
    tick: tick,
    reset: reset,
    render: render,
  };
});
