const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const vm = require('node:vm');
test('manual navigation respects motion preference and lightbox restores focus', () => {
  const listeners = {};
  const button = { dataset: { step: '1' }, addEventListener: (_, fn) => { listeners.next = fn; } };
  let scroll, focused = false, prevented = false, restored;
  const bodyStyle = {};
  const track = { firstElementChild: { getBoundingClientRect: () => ({ width: 300 }) }, scrollBy: value => { scroll = value; } };
  const controls = { hidden: true, querySelectorAll: () => [button] };
  const section = { querySelector: selector => selector === '.carousel-track' ? track : controls };
  const image = { removeAttribute: () => {} };
  const dialog = {
    querySelector: selector => selector === 'img' ? image : { addEventListener: (_, fn) => { listeners.closeButton = fn; } },
    showModal: () => { dialog.open = true; },
    close: () => { dialog.open = false; listeners.close(); },
    addEventListener: (type, fn) => { listeners[type] = fn; }
  };
  const link = { href: 'image.jpeg', getAttribute: () => 'Mensaje', focus: () => { focused = true; }, addEventListener: (_, fn) => { listeners.open = fn; } };
  const preference = { matches: false };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'testimonials.js'), 'utf8'), {
    window: { scrollY: 480, scrollTo: options => { restored = options.top; }, matchMedia: () => preference, getComputedStyle: () => ({ columnGap: '24px' }) },
    document: { body: { style: bodyStyle }, querySelectorAll: selector => selector === '[data-carousel]' ? [section] : [link], querySelector: () => dialog }
  });
  assert.equal(controls.hidden, false);
  listeners.next();
  assert.equal(scroll.left, 324);
  assert.equal(scroll.behavior, 'smooth');
  preference.matches = true;
  listeners.next();
  assert.equal(scroll.behavior, 'instant');
  listeners.open({ button: 0, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(dialog.open, true);
  assert.equal(image.src, 'image.jpeg');
  assert.equal(bodyStyle.position, 'fixed');
  assert.equal(bodyStyle.top, '-480px');
  listeners.closeButton();
  assert.equal(dialog.open, false);
  assert.equal(focused, true);
  assert.equal(bodyStyle.position, undefined);
  assert.equal(restored, 480);
});
test('two accessible galleries retain all sixteen original image links', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/data-carousel(?=[\s>])/g) || []).length, 2);
  const links = [...html.matchAll(/data-lightbox href="([^"]+)"/g)];
  assert.equal(links.length, 16);
  for (const [, file] of links) assert.ok(fs.existsSync(path.join(root, file)), file);
  assert.match(html, /<dialog[^>]+aria-labelledby="image-title"/);
  assert.match(html.replace(/\s+/g, ' '), /Cada bebé y cada proceso son diferentes/);
});
test('centered bounded modal contains complete images without scrolling and uses icon affordances', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.doesNotMatch(html, /Momento \d+ · Ampliar mensaje/);
  assert.match(html, /data-close[^>]*aria-label="Cerrar imagen"/);
  assert.match(html, /6-blurred.png/);
  assert.match(css, /\.image-dialog > img\s*\{[^}]*object-fit: contain/);
  assert.match(css, /\.image-dialog\s*\{[^}]*overflow: hidden/);
  assert.match(css, /\.image-dialog\s*\{[^}]*width: min\(850px, calc\(100% - 24px\)\)/);
  assert.match(css, /\.image-dialog\s*\{[^}]*margin: auto/);
  assert.match(css, /\.image-dialog\s*\{[^}]*border-radius: 16px/);
  assert.match(css, /\.image-dialog\s*\{[^}]*height: 90dvh/);
});
