const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = () => fs.readFileSync(path.join(__dirname, '..', 'currency.js'), 'utf8');
function setup() {
  const handlers = {}, requests = [], timeouts = new Map();
  const make = extra => ({ hidden: false, textContent: '', listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; }, ...extra });
  const picker = make(), status = make(), retry = make();
  const radios = ['MXN', 'USD', 'COP'].map(value => make({ value, checked: value === 'MXN' }));
  const prices = [4500, 10000, 19000, 10000, 24000, 4000].map((cents, i) =>
    make({ dataset: { regularCents: String(cents), unit: i === 5 ? 'USD / mes' : 'USD' }, innerHTML: 'original-' + cents }));
  const label = make();
  const nodes = { '[data-currency-picker]': picker, '[data-currency-status]': status, '[data-currency-retry]': retry };
  const document = {
    querySelector: s => nodes[s],
    querySelectorAll: s => s === '[data-regular-cents]' ? prices : s === '[name="plan-currency"]' ? radios : [label],
    addEventListener: (type, fn) => { handlers[type] = fn; }
  };
  const context = { document, Intl, Date, AbortController,
    setTimeout(fn) { timeouts.set(1, fn); return 1; }, clearTimeout(id) { timeouts.delete(id); },
    fetch: (url, options) => new Promise((resolve, reject) => {
      requests.push({ url, options, resolve, reject });
      options.signal.addEventListener('abort', () => reject(Error('timeout')));
    })
  };
  vm.runInNewContext(source(), context);
  const flush = () => new Promise(resolve => setImmediate(resolve));
  return { picker, radios, prices, status, retry, label, requests,
    async resolve(data = { date: '2026-11-13', base: 'USD', quote: 'MXN', rate: 18.6092 }, ok = true) {
      requests.at(-1).resolve({ ok, json: async () => data }); await flush();
    },
    async fail() { requests.at(-1).reject(Error('offline')); await flush(); },
    async timeout() { timeouts.get(1)(); await flush(); },
    choose(value) { picker.listeners.change({ target: { value, name: 'plan-currency' } }); },
    promo(active) { handlers['nbmx:promotion-change']({ detail: { active } }); }
  };
}
test('MXN default converts six base prices to tens and preserves monthly unit', async () => {
  const app = setup();
  assert.match(app.status.textContent, /USD/);
  await app.resolve();
  for (const [index, amount] of ['840', '1,860', '3,540', '1,860', '4,470', '740'].entries()) {
    assert.ok(app.prices[index].innerHTML.includes('$' + amount));
    assert.match(app.prices[index].innerHTML, /MXN/);
  }
  assert.match(app.prices[5].innerHTML, /MXN \/ mes/);
  assert.equal(app.radios[0].checked, true);
  assert.equal(app.status.textContent, '');
  app.choose('USD');
  assert.equal(app.status.textContent, '');
  app.choose('MXN');
  assert.equal(app.label.textContent, 'MXN');
});
test('COP rounds base to thousands, preserves discount and monthly units', async () => {
  const app = setup(); await app.resolve(); app.choose('COP');
  assert.match(app.requests.at(-1).url, /usd\/cop$/i);
  await app.resolve({ date: '2026-11-13', base: 'USD', quote: 'COP', rate: 4123.45 });
  assert.match(app.prices[0].innerHTML, /\$186,000/);
  assert.match(app.prices[5].innerHTML, /COP \/ mes/);
  app.promo(true);
  assert.match(app.prices[0].innerHTML, /\$130,200/);
  app.choose('MXN'); assert.match(app.prices[0].innerHTML, /\$588/);
  app.choose('COP'); assert.match(app.prices[0].innerHTML, /\$130,200/);
  assert.equal(app.requests.length, 2);
  assert.equal(app.status.textContent, '');
});
test('failed COP request does not override a later MXN choice and retries COP', async () => {
  const app = setup(); await app.resolve(); app.choose('COP'); app.choose('MXN');
  await app.fail();
  assert.equal(app.label.textContent, 'MXN');
  app.choose('COP'); await app.fail();
  assert.equal(app.label.textContent, 'USD');
  app.retry.listeners.click();
  assert.match(app.requests.at(-1).url, /usd\/cop$/i);
  app.choose('USD');
  await app.resolve({ date: '2026-11-13', base: 'USD', quote: 'COP', rate: 4123.45 });
  assert.equal(app.label.textContent, 'USD');
});
test('currency changes immediately without compounding conversion and maintains exact discount', async () => {
  const app = setup(); await app.resolve(); app.promo(true);
  assert.match(app.prices[0].innerHTML, /<del[^>]*>\$840<\/del>/);
  assert.match(app.prices[0].innerHTML, /\$588/);
  app.choose('USD');
  assert.match(app.prices[0].innerHTML, /\$31.50/);
  assert.match(app.prices[5].innerHTML, /USD \/ mes/);
  app.choose('MXN'); app.choose('USD'); app.choose('MXN');
  assert.match(app.prices[0].innerHTML, /\$588/);
  app.promo(false);
  assert.match(app.prices[0].innerHTML, /\$840/);
  assert.doesNotMatch(app.prices[0].innerHTML, /<del/);
  assert.equal(app.requests.length, 1);
});
test('a late rate response does not override USD selected during loading', async () => {
  const app = setup(); app.choose('USD'); app.promo(true); await app.resolve();
  assert.equal(app.radios[1].checked, true);
  assert.match(app.prices[0].innerHTML, /\$31.50/);
  assert.match(app.prices[0].innerHTML, /USD/);
});
test('offline, invalid rates and timeout fall back to explicitly labelled USD; retry works', async () => {
  for (const mode of ['offline', 'invalid', 'http', 'timeout']) {
    const app = setup(); app.promo(true);
    if (mode === 'offline') await app.fail();
    if (mode === 'invalid') await app.resolve({ date: 'bad', base: 'USD', quote: 'MXN', rate: -1 });
    if (mode === 'http') await app.resolve({}, false);
    if (mode === 'timeout') await app.timeout();
    assert.match(app.status.textContent, /USD/);
    assert.equal(app.retry.hidden, false);
    assert.equal(app.radios[1].checked, true);
    assert.match(app.prices[0].innerHTML, /\$31.50/);
    app.retry.listeners.click();
    app.retry.listeners.click();
    assert.equal(app.requests.length, 2);
    await app.resolve();
    assert.equal(app.radios[0].checked, true);
    assert.match(app.prices[0].innerHTML, /\$588/);
  }
});
test('a new page always resets MXN without local or session storage', async () => {
  const first = setup(); await first.resolve(); first.choose('USD');
  const second = setup(); await second.resolve();
  assert.equal(second.radios[0].checked, true);
  assert.doesNotMatch(source(), /localStorage|sessionStorage/);
});
