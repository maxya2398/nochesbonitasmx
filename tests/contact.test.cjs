const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('contact keeps a direct Instagram fallback and never claims automatic delivery', () => {
  const js = fs.readFileSync('contact.js', 'utf8');
  assert.match(js, /https:\/\/ig.me\/m\/nochesbonitas.mx/);
  assert.match(js, /navigator.clipboard.writeText\(message.value\)/);
  assert.match(js, /message.select\(\)/);
  assert.match(js, /!rendered.includes\('\['\)/);
  assert.match(js, /del, .promo-sr, .promo-price-note/);
  assert.match(js, /previousStyle/);
  for (const name of ['aviso-de-privacidad.html', 'terminos.html']) {
    const html = fs.readFileSync(name, 'utf8');
    assert.match(html, /Borrador/);
    assert.match(html, /\[CORREO DE CONTACTO\]/);
  }
});

test('product links open Instagram directly without contact interception', () => {
 const html = fs.readFileSync('index.html', 'utf8');
 assert.doesNotMatch(html, /<script[^>]+contact\.js/);
 assert.match(html, /promo-emblem promo-brand/);
});
