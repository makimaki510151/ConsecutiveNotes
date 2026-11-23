'use strict';

const assert = require('assert');
const AudioBus = require('../js/audio.js');

assert.strictEqual(AudioBus.volume(), 0.85);

AudioBus.setVolume(0.4);
assert.strictEqual(AudioBus.volume(), 0.4);

AudioBus.setVolume(0);
assert.strictEqual(AudioBus.volume(), 0);

AudioBus.setVolume(1);
assert.strictEqual(AudioBus.volume(), 1);

AudioBus.setVolume(1.4);
assert.strictEqual(AudioBus.volume(), 1);

AudioBus.setVolume(-0.2);
assert.strictEqual(AudioBus.volume(), 1);

console.log('audio ok');
