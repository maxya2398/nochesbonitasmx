const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const html = readFileSync('index.html', 'utf8');

test('action arrows use decorative SVGs instead of platform emoji glyphs', () => {
  assert.doesNotMatch(html, /[\u2197\u2193]/u);
  const icons = html.match(/<svg\s+class="icon-arrow"[^>]*>/g) || [];
  assert.equal(icons.length, 12);
  for (const icon of icons) {
    assert.match(icon, /aria-hidden="true"/);
    assert.match(icon, /focusable="false"/);
    assert.match(icon, /stroke="currentColor"/);
  }
});

test('plan headings retain word boundaries when desktop breaks are hidden', () => {
  const titles = [...html.matchAll(/<h3>(.*?)<\/h3>/g)]
    .map((match) => match[1].replace(/<br\s*\/?\s*>/g, '').trim());
  for (const title of ['Consulta Sueño Express', 'Plan Sueño en Calma', 'Plan Noches Bonitas']) {
    assert.ok(titles.includes(title), `Missing readable title: ${title}`);
  }
});
test('header links to services and testimonials', () => {
  const page = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
  const navigation = page.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/)[1];
  assert.match(navigation, /href="#servicios">Planes<\/a>/);
  assert.match(navigation, /href="#testimonios">Testimonios<\/a>/);
  assert.match(page, /id="testimonios"/);
});
