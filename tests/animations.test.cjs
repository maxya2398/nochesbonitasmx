const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function setup({ reduced = false, observerAvailable = true } = {}) {
  const calls = [];
  const animations = [];
  let preferenceChange;
  let enter;
  let disconnected = false;
  const element = {
    animate(frames, options) {
      const animation = { cancel() { animation.cancelled = true; } };
      animations.push(animation);
      calls.push({ frames, options });
      return animation;
    },
  };
  const preference = {
    matches: reduced,
    addEventListener(type, callback) { preferenceChange = callback; },
  };
  const context = {
    matchMedia: () => preference,
    document: { querySelectorAll: () => [element] },
    IntersectionObserver: observerAvailable ? class {
      constructor(callback) { enter = callback; }
      observe() {}
      unobserve(target) { assert.equal(target, element); }
      disconnect() { disconnected = true; }
    } : undefined,
  };
  vm.runInNewContext(readFileSync('animations.js', 'utf8'), context);
  return {
    calls, animations,
    enter() { enter([{ target: element, isIntersecting: true }]); },
    reduce() { preference.matches = true; preferenceChange({ matches: true }); },
    get disconnected() { return disconnected; },
  };
}

test('sections animate once on entry without hiding content beforehand', () => {
  const page = setup();
  assert.equal(page.calls.length, 0);
  page.enter();
  page.enter();
  assert.equal(page.calls.length, 1);
  assert.equal(page.calls[0].frames.at(-1).opacity, 1);
  assert.ok(page.calls[0].options.duration <= 700);
});

test('reduced motion skips animation', () => {
  assert.equal(setup({ reduced: true }).calls.length, 0);
});

test('changing motion preference cancels animation and observation', () => {
  const page = setup();
  page.enter();
  page.reduce();
  assert.equal(page.animations[0].cancelled, true);
  assert.equal(page.disconnected, true);
});

test('missing observer does not break the page', () => {
  assert.equal(setup({ observerAvailable: false }).calls.length, 0);
});
