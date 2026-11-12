const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const html = readFileSync('index.html', 'utf8').replace(/\s+/g, ' ');
const cards = [...html.matchAll(/<article class="(?:plan|wide-plan)[^"]*">(.*?)<\/article>/gs)].map(m => m[1]);

test('service cards preserve current regular USD prices and eligibility', () => {
  const expected = [
    ['Consulta', '$45'], ['en Calma', '$100'],
    ['<br>Noches Bonitas', '$190'], ['Noches Bonitas Contigo', '$240'],
    ['Tu Sleep Coach', '$40'], ['Asesoría Hábitos Saludables', '$100'],
  ];
  assert.equal(cards.length, 6);
  assert.ok(cards.find(c => c.includes('Tu Sleep Coach')).includes('USD / mes'));
  for (const [name, price] of expected) {
    const card = cards.find(c => c.includes(name));
    assert.ok(card?.includes(price + ' <span>USD'), name);
    assert.ok(!card.includes('MXN'), name);
  }
  const early = cards.find(c => c.includes('Asesoría Hábitos Saludables'));
  for (const text of ['90 minutos', '0 a 5 meses', 'embarazo', 'sin entrenamiento de sueño', 'Guía digital']) {
    assert.ok(early.includes(text), text);
  }
  for (const name of ['en Calma', '<br>Noches Bonitas', 'Noches Bonitas Contigo']) {
    assert.ok(cards.find(c => c.includes(name)).includes('Desde los 6 meses'));
  }
  assert.ok(cards.find(c => c.includes('Tu Sleep Coach')).includes('ya realizaron un plan completo'));
});
