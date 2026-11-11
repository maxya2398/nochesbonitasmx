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
  const viewportListeners = {};
  const viewport = { height: 600, offsetTop: 0, addEventListener: (type, fn) => { viewportListeners[type] = fn; } };
  const attributes = new Set();
  const rootClasses = new Set();
  const track = { firstElementChild: { getBoundingClientRect: () => ({ width: 300 }) }, scrollBy: value => { scroll = value; } };
  const controls = { hidden: true, querySelectorAll: () => [button] };
  const section = { querySelector: selector => selector === '.carousel-track' ? track : controls };
  const image = { removeAttribute: () => {} };
  const panel = { style: {} };
  const dialog = {
    style: {},
    setAttribute: name => attributes.add(name),
    removeAttribute: name => attributes.delete(name),
    querySelector: selector => selector === 'img' ? image : selector === '.image-dialog-panel' ? panel : { addEventListener: (_, fn) => { listeners.closeButton = fn; } },
    showModal: () => { dialog.open = true; },
    close: () => { dialog.open = false; listeners.close(); },
    addEventListener: (type, fn) => { listeners[type] = fn; }
  };
  const linkAttributes = new Set();
  const link = { href: 'image.jpeg', setAttribute: name => linkAttributes.add(name), removeAttribute: name => linkAttributes.delete(name), getAttribute: () => 'Mensaje', focus: () => { focused = true; }, addEventListener: (type, fn) => { listeners[type === 'click' ? 'open' : 'linkKey'] = fn; } };
  const preference = { matches: false };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'testimonials.js'), 'utf8'), {
    window: { visualViewport: viewport, scrollY: 480, scrollTo: options => { restored = options.top; }, matchMedia: () => preference, getComputedStyle: () => ({ columnGap: '24px' }) },
    document: { documentElement: { classList: { add: name => rootClasses.add(name), remove: name => rootClasses.delete(name) } }, body: { style: bodyStyle }, querySelectorAll: selector => selector === '[data-carousel]' ? [section] : [link], querySelector: () => dialog }
  });
  assert.equal(controls.hidden, false);
  listeners.next();
  assert.equal(scroll.left, 324);
  assert.equal(scroll.behavior, 'smooth');
  preference.matches = true;
  listeners.next();
  assert.equal(scroll.behavior, 'instant');
  listeners.open({ button: 0, detail: 1, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(dialog.open, true);
  assert.equal(image.src, 'image.jpeg');
  assert.equal(bodyStyle.position, 'fixed');
  assert.equal(bodyStyle.top, '-480px');
  assert.equal(rootClasses.has('image-modal-open'), true);
  assert.equal(attributes.has('data-pointer-open'), true);
  assert.equal(linkAttributes.has('data-pointer-focus'), true);
  assert.equal(panel.style.height, '540px');
  viewport.height = 800;
  viewport.offsetTop = 20;
  viewportListeners.resize();
  assert.equal(panel.style.height, '720px');
  assert.equal(panel.style.top, '60px');
  listeners.keydown({ key: 'Tab' });
  assert.equal(attributes.has('data-pointer-open'), false);
  listeners.closeButton();
  assert.equal(dialog.open, false);
  assert.equal(focused, true);
  assert.equal(bodyStyle.position, undefined);
  assert.equal(restored, 480);
  assert.equal(rootClasses.has('image-modal-open'), false);
  listeners.linkKey();
  assert.equal(linkAttributes.has('data-pointer-focus'), false);
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
  assert.match(css, /\.image-dialog-panel > img\s*\{[^}]*object-fit: contain/);
  assert.match(css, /\.image-dialog\s*\{[^}]*overflow: hidden/);
  assert.match(css, /\.image-dialog-panel\s*\{[^}]*width: min\(850px, calc\(100% - 24px\)\)/);
  assert.match(css, /\.image-dialog-panel\s*\{[^}]*border-radius: 16px/);
  assert.match(css, /\.image-dialog-panel\s*\{[^}]*height: 90dvh/);
  assert.match(css, /html\.image-modal-open\s*\{[^}]*background: #304858/);
  assert.match(css, /\.image-dialog\s*\{[^}]*height: 100lvh[^}]*background: #304858/);
  assert.match(css, /\.image-dialog::backdrop\s*\{[^}]*background: #304858/);
  assert.match(html, /class="image-dialog-panel"/);
  assert.match(css, /\.experience-card:focus-visible\s*\{[^}]*outline-offset: -4px/);
  assert.match(css, /\[data-pointer-open\] \[data-close\]:focus\s*\{ outline: none/);
});
