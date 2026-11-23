'use strict';

(function () {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d', { alpha: false });
  const state = Rules.createState();
  const fx = { accel: 0, miss: 0, dawn: 0, hit: 0, ringOn: false, ringT: 0 };
  const bursts = [];

  let viewW = 1;
  let viewH = 1;
  let anim = 0;
  let last = performance.now();
  let acc = 0;
  const STEP = 1000 / 60;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewW = Math.max(1, window.innerWidth);
    viewH = Math.max(1, window.innerHeight);
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function shownTime() {
    return state.total;
  }

  function decay(value, dt, speed) {
    if (value <= 0) return 0;
    const next = value - dt * speed;
    return next > 0 ? next : 0;
  }

  function point() {
    const L = Story.layout(viewW, viewH);
    return { x: L.judgeX, y: L.laneY, layout: L };
  }

  function burst(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
      const speed = 50 + Math.random() * 110;
      bursts.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.28 + Math.random() * 0.12,
        max: 0.4,
        color: color,
      });
    }
  }

  function updateBursts(dt) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const spark = bursts[i];
      spark.life -= dt;
      if (spark.life <= 0) {
        bursts.splice(i, 1);
        continue;
      }
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx *= 0.96;
      spark.vy *= 0.96;
    }
  }

  function breakWorld() {
    fx.miss = 1;
    fx.accel = 0;
    fx.dawn = 0;
    fx.hit = 0;
    fx.ringOn = false;
    fx.ringT = 0;
    bursts.length = 0;
    Story.reset();
    AudioBus.miss();
  }

  function apply(events) {
    let failed = false;
    for (let i = 0; i < events.length; i++) {
      if (events[i].type === 'miss' || events[i].type === 'empty') failed = true;
    }
    if (failed) {
      breakWorld();
      return;
    }
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.type === 'start') {
        Story.reset();
      } else if (event.type === 'hit') {
        fx.hit = 1;
        AudioBus.hit(event.level);
        const at = point();
        const look = Story.sample(state.total);
        burst(at.x, at.y, look.note);
      } else if (event.type === 'accel') {
        fx.accel = 1;
        AudioBus.accel(event.level);
        if (event.level === 2) fx.dawn = 1;
      } else if (event.type === 'complete') {
        fx.ringOn = true;
        fx.ringT = 0;
        AudioBus.complete();
      }
    }
  }

  function onPress() {
    try {
      AudioBus.ensure();
    } catch (err) {
      // 音が使えなくても、入力そのものは成立させる。
    }
    apply(Rules.press(state));
  }

  function step(dt) {
    anim += dt;
    fx.accel = decay(fx.accel, dt, 2.5);
    fx.miss = decay(fx.miss, dt, 4.8);
    fx.dawn = decay(fx.dawn, dt, 0.58);
    fx.hit = decay(fx.hit, dt, 6.5);
    if (fx.ringOn) fx.ringT += dt;
    updateBursts(dt);
    if (!state.started) {
      Story.tick(dt, shownTime(), anim, viewW, viewH);
      return;
    }
    apply(Rules.tick(state, dt));
    Story.tick(dt, shownTime(), anim, viewW, viewH);
    AudioBus.follow(state.total, state.level);
  }

  function roundRect(x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function css(c, a) {
    const r = c[0] | 0;
    const g = c[1] | 0;
    const b = c[2] | 0;
    if (a == null) return 'rgb(' + r + ',' + g + ',' + b + ')';
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function drawLane(L, look) {
    const top = L.laneY - L.laneH / 2;
    const gradient = ctx.createLinearGradient(0, top, 0, top + L.laneH);
    gradient.addColorStop(0, 'rgba(8, 10, 16, 0.08)');
    gradient.addColorStop(0.45, 'rgba(7, 9, 16, 0.72)');
    gradient.addColorStop(1, 'rgba(4, 5, 10, 0.88)');
    ctx.fillStyle = gradient;
    roundRect(viewW * 0.035, top, viewW * 0.93, L.laneH, L.laneH * 0.5);
    ctx.fill();

    ctx.save();
    roundRect(viewW * 0.035, top, viewW * 0.93, L.laneH, L.laneH * 0.5);
    ctx.clip();
    const level = state.started ? state.level : 0;
    const flow = 28 * Rules.speedMultiplier(level);
    ctx.fillStyle = css(look.note, 0.14);
    for (let i = 0; i < 7; i++) {
      const u = (anim * flow * 0.012 + i / 7) % 1;
      const x = viewW * 0.95 - u * viewW * 0.9;
      ctx.fillRect(x, L.laneY - 1, viewW * 0.05, 2);
    }
    ctx.restore();

    const travel = L.spawnX - L.judgeX;
    const win = Rules.hitWindowDist(level) * travel;
    const zone = ctx.createLinearGradient(L.judgeX - win, 0, L.judgeX + win, 0);
    zone.addColorStop(0, 'rgba(255,255,255,0)');
    zone.addColorStop(0.5, 'rgba(255, 244, 224, 0.2)');
    zone.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = zone;
    ctx.fillRect(L.judgeX - win, top + 6, win * 2, L.laneH - 12);

    ctx.strokeStyle = css(look.skyHor, 0.45);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(viewW * 0.06, top + 1.5);
    ctx.lineTo(viewW * 0.94, top + 1.5);
    ctx.stroke();
  }

  function drawOrb(x, y, color, alpha, radius, hot) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const glow = ctx.createRadialGradient(x, y, 1, x, y, radius);
    glow.addColorStop(0, hot ? '#fff' : css(color, 0.95));
    glow.addColorStop(0.35, css(color, 0.9));
    glow.addColorStop(1, css(color, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNotes(L, look) {
    const travel = L.spawnX - L.judgeX;
    const win = Rules.hitWindowDist(state.level);
    if (!state.started) {
      const cycle = (anim % 3.4) / 3.4;
      const dist = 1 - cycle;
      const x = L.judgeX + dist * travel;
      const fade = Math.sin(cycle * Math.PI);
      drawOrb(x, L.laneY, look.note, 0.28 + fade * 0.35, 16, false);
      return;
    }
    for (let i = 0; i < state.notes.length; i++) {
      const note = state.notes[i];
      const x = L.judgeX + note.dist * travel;
      if (x < -40 || x > viewW + 70) continue;
      for (let t = 3; t >= 1; t--) {
        const tx = L.judgeX + (note.dist + t * 0.02) * travel;
        drawOrb(tx, L.laneY, look.note, 0.06, 11, false);
      }
      const inside = Math.abs(note.dist) <= win;
      drawOrb(x, L.laneY, look.note, 1, inside ? 24 : 18, inside);
    }
  }

  function nearestGlow() {
    if (!state.started) return 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(anim * 2.1));
    const win = Rules.hitWindowDist(state.level);
    let best = 0;
    for (let i = 0; i < state.notes.length; i++) {
      const dist = state.notes[i].dist;
      if (dist < -win) continue;
      const glow = 1 - Math.min(1, Math.max(0, dist) / 0.38);
      if (glow > best) best = glow;
    }
    return best;
  }

  function drawLantern(L, look) {
    const near = nearestGlow();
    const hot = Math.min(1, 0.35 + near * 0.7 + fx.hit * 0.8 + fx.accel * 0.4);
    const radius = 22 + hot * 34;
    const glow = ctx.createRadialGradient(L.judgeX, L.laneY, 2, L.judgeX, L.laneY, radius);
    glow.addColorStop(0, 'rgba(255,255,255,' + (0.75 + hot * 0.25) + ')');
    glow.addColorStop(0.28, css(look.note, 0.55));
    glow.addColorStop(1, css(look.note, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(L.judgeX, L.laneY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    roundRect(L.judgeX - 2, L.laneY - L.laneH * 0.38, 4, L.laneH * 0.76, 2);
    ctx.fill();

    if (!state.started) {
      const cycle = (anim % 2.3) / 2.3;
      ctx.beginPath();
      ctx.arc(L.judgeX, L.laneY, 14 + cycle * 64, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,' + (1 - cycle) * 0.38 + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (fx.accel > 0.01) {
      const spread = 1 - fx.accel;
      ctx.beginPath();
      ctx.arc(L.judgeX, L.laneY, 16 + spread * Math.max(viewW, viewH) * 0.48, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 228, 186,' + fx.accel * 0.75 + ')';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  function drawBursts() {
    for (let i = 0; i < bursts.length; i++) {
      const spark = bursts[i];
      ctx.globalAlpha = Math.max(0, spark.life / spark.max);
      ctx.fillStyle = css(spark.color);
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function render() {
    const time = shownTime();
    const look = Story.sample(time);
    Story.render(ctx, viewW, viewH, time, anim, fx);
    const L = Story.layout(viewW, viewH);
    drawLane(L, look);
    drawNotes(L, look);
    drawLantern(L, look);
    drawBursts();
    if (fx.accel > 0.01) {
      ctx.fillStyle = 'rgba(255, 236, 210,' + fx.accel * 0.2 + ')';
      ctx.fillRect(0, 0, viewW, viewH);
    }
    if (fx.miss > 0.01) {
      ctx.fillStyle = 'rgba(255,255,255,' + fx.miss * 0.62 + ')';
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) {
      last = now;
      acc = 0;
      return;
    }
    let delta = now - last;
    last = now;
    if (delta < 0) delta = 0;
    if (delta > 80) delta = 0;
    acc += delta;
    let steps = 0;
    while (acc >= STEP && steps < 5) {
      step(STEP / 1000);
      acc -= STEP;
      steps += 1;
    }
    if (steps > 0) render();
  }

  window.addEventListener('resize', function () {
    resize();
    render();
  });
  window.addEventListener('keydown', function (event) {
    if (event.code !== 'Space' && event.key !== ' ') return;
    event.preventDefault();
    if (event.repeat) return;
    onPress();
  });
  window.addEventListener('pointerdown', function (event) {
    if (event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault();
    onPress();
  });
  window.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) AudioBus.suspend();
    else AudioBus.resume();
  });

  resize();
  render();
  requestAnimationFrame(frame);
})();
