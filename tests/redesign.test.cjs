const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');

test('brand fonts load with swap and the illustrated hero replaces the CSS moon', () => {
  for (const font of ['Poppins', 'Nunito', 'Caveat']) assert.ok(html.includes(font));
  assert.match(html, /display=swap/);
  assert.match(html, /night-scene\.svg/);
  assert.doesNotMatch(html, /class="moon"/);
  assert.doesNotMatch(html.replace(/<[^>]+>/g, ''), /[a-zA-Z]\?[a-zA-Z]/);
});

test('stage navigation precedes early products, plans and digital guides', () => {
  const ids = ['enfoque', 'nicoleth', 'etapas', 'primeras-noches', 'servicios', 'guias', 'testimonios', 'preguntas'];
  const positions = ids.map(id => html.indexOf(`id="${id}"`));
  assert.ok(positions.every((position, index) => position >= 0 && (!index || position > positions[index - 1])));
  assert.ok(html.indexOf('data-currency-picker') < html.indexOf('id="primeras-noches"'));
  assert.match(html, /id="sleep-coach"/);
});

test('new products use MXN bases, manual Instagram delivery and an honest travel price placeholder', () => {
  assert.match(html, /data-regular-cents="49000"[^>]*data-base-currency="MXN"[^>]*data-discount="false"/);
  assert.match(html, /data-regular-cents="190000"[^>]*data-base-currency="MXN"/);
  assert.match(html, /data-regular-cents="1500"[^>]*data-unit="USD"[^>]*data-discount="false"/);
  assert.doesNotMatch(html, /Descarga inmediata|descargar al momento|Comprar y descargar/);
  assert.equal((html.match(/data-contact-product=/g) || []).length, 8);
  for (const name of ['portada-guia-primeras-noches.png', 'portada-cuaderno-primeras-noches.png', 'portada-guia-de-viaje.png']) assert.ok(html.includes(name));
});

test('FAQ, legal navigation and sharing metadata are present', () => {
  for (const phrase of ['¿Cómo recibo mi guía?', '¿Puedo llenar el cuaderno en el celular?', '¿Qué diferencia hay entre la versión digital y la asesoría?', '¿Sirve si todavía estoy embarazada?']) assert.ok(html.includes(phrase));
  for (const link of ['aviso-de-privacidad.html', 'terminos.html']) assert.ok(html.includes(link));
  for (const key of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) assert.ok(html.includes(key));
});

test('mobile navigation toggles, closes on link and Escape, and restores the menu focus', () => {
  const handlers = {}, navHandlers = {}, attrs = {}, classes = new Set();
  let focused = false;
  const button = { hidden: true, setAttribute: (k, v) => { attrs[k] = v; }, addEventListener: (k, v) => { handlers[k] = v; }, focus: () => { focused = true; } };
  const nav = { addEventListener: (k, v) => { navHandlers[k] = v; } };
  vm.runInNewContext(fs.readFileSync('redesign.js', 'utf8'), {
    document: { querySelector: selector => selector === '[data-menu-toggle]' ? button : nav,
      documentElement: { classList: { add: k => classes.add(k), toggle: (k, on) => on ? classes.add(k) : classes.delete(k) } } }
  });
  assert.equal(button.hidden, false);
  handlers.click();
  assert.equal(attrs['aria-expanded'], 'true');
  navHandlers.click({ target: { closest: () => ({}) } });
  assert.equal(attrs['aria-expanded'], 'false');
  handlers.click();
  navHandlers.keydown({ key: 'Escape' });
  assert.equal(attrs['aria-expanded'], 'false');
  assert.equal(focused, true);
});
