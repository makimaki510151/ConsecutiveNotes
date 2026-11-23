'use strict';

(function () {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d', { alpha: false });
  const state = Rules.createState();
  const fx = { accel: 0, hit: 0, ringOn: false, ringT: 0 };
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

  function burst(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 70 + Math.random() * 80;
      bursts.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.16 + Math.random() * 0.08,
        max: 0.24,
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
    fx.accel = 0;
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
      if (event.type === 'hit') {
        fx.hit = 1;
        AudioBus.hit(event.level);
        const at = point();
        burst(at.x, at.y);
      } else if (event.type === 'accel') {
        fx.accel = 1;
        AudioBus.accel(event.level);
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
    fx.accel = decay(fx.accel, dt, 3.2);
    fx.hit = decay(fx.hit, dt, 8);
    if (fx.ringOn) fx.ringT += dt;
    updateBursts(dt);
    apply(Rules.tick(state, dt));
    Story.tick(dt, shownTime(), anim, viewW, viewH);
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

  function drawLane(L) {
    const top = L.laneY - L.laneH / 2;
    ctx.fillStyle = 'rgba(4, 6, 12, 0.94)';
    roundRect(viewW * 0.03, top, viewW * 0.94, L.laneH, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 188, 220, 0.55)';
    ctx.lineWidth = 1.5;
    roundRect(viewW * 0.03, top, viewW * 0.94, L.laneH, 10);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(120, 140, 170, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(viewW * 0.05, L.laneY);
    ctx.lineTo(viewW * 0.95, L.laneY);
    ctx.stroke();
  }

  function diamond(x, y, rx, ry) {
    ctx.beginPath();
    ctx.moveTo(x, y - ry);
    ctx.lineTo(x + rx, y);
    ctx.lineTo(x, y + ry);
    ctx.lineTo(x - rx, y);
    ctx.closePath();
  }

  function drawNotes(L) {
    const travel = L.spawnX - L.judgeX;
    const win = Rules.hitWindowDist(state.level);
    const top = L.laneY - L.laneH / 2;
    ctx.save();
    roundRect(viewW * 0.03, top, viewW * 0.94, L.laneH, 10);
    ctx.clip();
    for (let i = 0; i < state.notes.length; i++) {
      const note = state.notes[i];
      const x = L.judgeX + note.dist * travel;
      if (x < -30 || x > viewW + 40) continue;
      const inside = Math.abs(note.dist) <= win;
      const rx = inside ? 18 : 15;
      const ry = inside ? 11 : 9;
      ctx.fillStyle = 'rgba(90, 150, 255, 0.35)';
      diamond(x + 16, L.laneY, rx * 0.55, ry * 0.55);
      ctx.fill();
      diamond(x + 8, L.laneY, rx * 0.75, ry * 0.72);
      ctx.fill();
      ctx.fillStyle = inside ? '#ffffff' : '#f2f6ff';
      ctx.strokeStyle = '#3d7dff';
      ctx.lineWidth = inside ? 3 : 2.5;
      diamond(x, L.laneY, rx, ry);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function noteInWindow() {
    const win = Rules.hitWindowDist(state.level);
    for (let i = 0; i < state.notes.length; i++) {
      if (Math.abs(state.notes[i].dist) <= win) return true;
    }
    return false;
  }

  function drawJudge(L) {
    const x = L.judgeX;
    const y = L.laneY;
    const half = L.laneH * 0.62;
    const arm = 18;
    const hot = noteInWindow() || fx.hit > 0.05 || fx.accel > 0.05;
    ctx.strokeStyle = hot ? '#ffffff' : '#d5e2ff';
    ctx.lineWidth = hot ? 4 : 3;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(x, y - half);
    ctx.lineTo(x, y + half);
    ctx.moveTo(x - arm, y - half);
    ctx.lineTo(x + arm, y - half);
    ctx.moveTo(x - arm, y + half);
    ctx.lineTo(x + arm, y + half);
    ctx.stroke();
  }

  function drawBursts() {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < bursts.length; i++) {
      const spark = bursts[i];
      ctx.globalAlpha = Math.max(0, spark.life / spark.max);
      ctx.beginPath();
      ctx.moveTo(spark.x, spark.y);
      ctx.lineTo(spark.x - spark.vx * 0.04, spark.y - spark.vy * 0.04);
      ctx.stroke();
    }
    ctx.restore();
  }

  function render() {
    const time = shownTime();
    Story.render(ctx, viewW, viewH, time, anim, fx);
    const L = Story.layout(viewW, viewH);
    drawLane(L);
    drawJudge(L);
    drawNotes(L);
    drawBursts();
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
