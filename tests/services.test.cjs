const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const html = readFileSync('index.html', 'utf8');
const cards = [...html.matchAll(/<article class="(?:plan|wide-plan)[^"]*">(.*?)<\/article>/gs)].map(m => m[1]);

test('service cards match the updated guide prices and eligibility', () => {
  const expected = [
    ['Consulta', '$800'], ['en Calma', '$2,000'],
    ['<br>Noches Bonitas', '$3,500'], ['Noches Bonitas Contigo', '$4,500'],
    ['Tu Sleep Coach', '$750'], ['Asesoría Hábitos Saludables', '$2,000'],
  ];
  assert.equal(cards.length, 6);
  for (const [name, price] of expected) {
    const card = cards.find(c => c.includes(name));
    assert.ok(card?.includes(price), name);
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
