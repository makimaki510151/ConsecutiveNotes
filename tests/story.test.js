'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Story = require('../js/story.js');

function luma(color) {
  return color[0] + color[1] + color[2];
}

function finiteSample(time) {
  const sample = Story.sample(time);
  const names = Object.keys(sample);
  for (let i = 0; i < names.length; i++) {
    const value = sample[names[i]];
    if (Array.isArray(value)) {
      assert.strictEqual(value.length, 3, names[i] + ' at ' + time);
      for (let c = 0; c < 3; c++) assert.ok(Number.isFinite(value[c]));
    } else {
      assert.ok(Number.isFinite(value), names[i] + ' at ' + time);
    }
  }
  return sample;
}

for (let t = 0; t <= 1800; t += 15) finiteSample(t);

const names = Object.keys(Story.keys[0]).sort();
for (let i = 1; i < Story.keys.length; i++) {
  assert.deepStrictEqual(Object.keys(Story.keys[i]).sort(), names);
  assert.ok(Story.keys[i].t > Story.keys[i - 1].t);
}

const origin = finiteSample(0);
const before = finiteSample(20);
assert.strictEqual(origin.figA, 0);
assert.strictEqual(origin.house, 0);
assert.ok(before.sun < 0.05);
assert.strictEqual(before.figA, 0);
assert.strictEqual(before.house, 0);
assert.ok(luma(before.skyTop) < 80);
assert.ok(luma(origin.skyTop) < 50);

const dawn = finiteSample(45);
assert.ok(dawn.sun > 0.4, 'dawn begins around the second acceleration');
assert.ok(dawn.figA < 0.2);

const child = finiteSample(120);
assert.ok(child.figA > 0.75);
assert.ok(child.grass > 0.6);

const together = finiteSample(500);
assert.ok(together.figB > 0.9);
assert.ok(together.house < 0.3);

const home = finiteSample(900);
assert.ok(home.house > 0.9);
assert.ok(home.figC > 0.7);
assert.ok(luma(home.skyTop) > 250);

const leaving = finiteSample(1460);
assert.ok(leaving.figBRise > 0.15);
assert.ok(leaving.fall > 0.4);

const night = finiteSample(1700);
assert.ok(night.star > 0.8);
assert.ok(night.figB < 0.02);
assert.ok(night.figASit > 0.8);
assert.ok(luma(night.skyTop) < 90);
assert.ok(night.moon > 0.7);

const end = finiteSample(1800);
assert.strictEqual(end.sprout, 1);
assert.strictEqual(end.tree, 1);
assert.strictEqual(end.house, 1);
assert.strictEqual(end.figASit, 1);
assert.ok(end.sun > 0.5);
assert.ok(end.figCScale > 0.8);
assert.ok(luma(end.skyTop) > 400);
assert.strictEqual(finiteSample(2400).sprout, 1);
assert.ok(end.tree > child.tree);

const root = path.join(__dirname, '..');
const sources = ['js/game.js', 'js/story.js', 'js/audio.js', 'js/rules.js', 'index.html'];
for (let i = 0; i < sources.length; i++) {
  const text = fs.readFileSync(path.join(root, sources[i]), 'utf8');
  assert.ok(!text.includes('fillText'), sources[i]);
  assert.ok(!text.includes('strokeText'), sources[i]);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const body = html.split('<body>')[1].split('</body>')[0];
const visible = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '').trim();
assert.strictEqual(visible, '');

console.log('story ok', { beats: Story.keys.length });
