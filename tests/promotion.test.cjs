const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const key = 'nbmx-november-2026-seen';
function setup(time, storage = new Map(), blocked = false) {
  const make = (extra = {}) => ({
    hidden: true, innerHTML: '', textContent: '', listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    ...extra
  });
  const banner = make({ getBoundingClientRect: () => ({ height: 92 }) });
  const close = make(), plans = make(), details = make({ focus() {} });
  const timer = make(), body = { style: {} };
  const classes = new Set();
  const events = {};
  const prices = [4500, 10000, 19000, 10000, 24000, 4000].map((cents, i) =>
    make({ dataset: { regularCents: String(cents), unit: i === 5 ? 'USD / mes' : 'USD' }, innerHTML: 'original-' + cents }));
  const dialog = make({
    open: false, style: {},
    showModal() { this.open = true; },
    close() { this.open = false; this.listeners.close(); },
    querySelector(s) { return s === '[data-promo-close]' ? close : plans; }
  });
  let tick, now = Date.parse(time), scrollRestored;
  const elements = { '[data-promo-banner]': banner, '[data-promo-dialog]': dialog,
    '[data-promo-details]': details, '#servicios': { scrollIntoView() {} } };
  const context = {
    Date: class extends Date { static now() { return now; } }, Intl,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    window: { scrollY: 123, scrollTo: options => { scrollRestored = options.top; },
      matchMedia: () => ({ matches: true }), addEventListener() {} },
    localStorage: { getItem(k) { if (blocked) throw Error('blocked'); return storage.get(k); },
      setItem(k,v) { if (blocked) throw Error('blocked'); storage.set(k,v); } },
    document: { body, activeElement: details, visibilityState: 'visible',
      addEventListener(type, fn) { events[type] = fn; },
      dispatchEvent(event) { events[event.type]?.(event); },
      documentElement: { classList: { add: k => classes.add(k), remove: k => classes.delete(k) },
        style: { setProperty() {}, removeProperty() {} } },
      querySelector: s => s === 'dialog[open]' ? (dialog.open ? dialog : null) : elements[s],
      querySelectorAll: s => s === '[data-regular-cents]' ? prices : s === '[data-promo-countdown]' ? [timer] : [] },
    setInterval: fn => { tick = fn; return 1; }, clearInterval() {},
    requestAnimationFrame: fn => fn()
  };
  const runtime = vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'currency.js'), 'utf8'), runtime);
  vm.runInContext(fs.readFileSync(path.join(root, 'promotion.js'), 'utf8'), runtime);
  return { banner, dialog, prices, timer, storage, close, body,
    get restored() { return scrollRestored; },
    update(time) { now = Date.parse(time); tick(); } };
}
test('November applies exactly 30 percent to all six current prices and preserves monthly unit', () => {
  const app = setup('2026-11-12T12:00:00-06:00');
  assert.equal(app.banner.hidden, false);
  for (const [i, amount] of ['31.50', '70', '133', '70', '168', '28'].entries()) {
    assert.match(app.prices[i].innerHTML, new RegExp('\\$' + amount.replace('.', '\\.')));
    assert.match(app.prices[i].innerHTML, /<del/);
  }
  assert.match(app.prices[5].innerHTML, /USD \/ mes/);
  assert.equal(app.dialog.open, true);
  assert.equal(app.body.style.position, 'fixed');
  app.close.listeners.click();
  assert.equal(app.restored, 123);
  assert.equal(app.body.style.position, undefined);
});
test('welcome is once per campaign and blocked storage does not break the offer', () => {
  const store = new Map();
  setup('2026-11-12T12:00:00-06:00', store);
  assert.equal(store.get(key), '1');
  assert.equal(setup('2026-11-13T12:00:00-06:00', store).dialog.open, false);
  assert.equal(setup('2026-11-12T12:00:00-06:00', new Map(), true).dialog.open, true);
});
test('countdown uses Mexico City cutoff and expires an already open page', () => {
  const app = setup('2026-11-30T23:59:00-06:00');
  assert.match(app.timer.innerHTML, /Quedan/);
  assert.match(app.timer.innerHTML, /00.*00.*01/);
  assert.equal((app.timer.innerHTML.match(/class="promo-time-unit"/g) || []).length, 3);
  app.update('2026-12-01T00:00:00-06:00');
  assert.equal(app.banner.hidden, true);
  assert.equal(app.dialog.open, false);
  assert.equal(app.prices[0].innerHTML, 'original-4500');
});
test('outside November there is no promotion, altered price, or welcome popup', () => {
  for (const time of ['2026-10-31T23:59:59-06:00', '2026-12-01T00:00:00-06:00', '2027-11-12T12:00:00-06:00']) {
    const app = setup(time);
    assert.equal(app.banner.hidden, true);
    assert.equal(app.dialog.open, false);
    assert.equal(app.prices[0].innerHTML, 'original-4500');
  }
});
test('campaign begins at local midnight and all real cards expose their existing base amount', () => {
  assert.equal(setup('2026-11-01T00:00:00-06:00').banner.hidden, false);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const cards = [...html.matchAll(/data-regular-cents="(\d+)" data-unit="([^"]+)">\$(\d+)/g)];
  assert.equal(cards.length, 6);
  for (const [, cents, unit, amount] of cards) {
    assert.equal(Number(cents), Number(amount) * 100);
    assert.ok(['USD', 'USD / mes'].includes(unit));
  }
  assert.match(html, /data-promo-banner[^>]*hidden/);
  assert.match(html, /role="timer" aria-live="off"/);
});
