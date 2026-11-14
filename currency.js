(() => {
  const picker = document.querySelector('[data-currency-picker]');
  const status = document.querySelector('[data-currency-status]');
  const retry = document.querySelector('[data-currency-retry]');
  const radios = [...document.querySelectorAll('[name="plan-currency"]')];
  const prices = [...document.querySelectorAll('[data-regular-cents]')].map(node => ({
    node, original: node.innerHTML, cents: Number(node.dataset.regularCents)
  }));
  // Selection and fetched rate belong only to this page instance.
  let selected = picker ? 'MXN' : 'USD';
  const exchanges = {}, pending = new Set();
  let failed = null, promotion = false;
  const money = cents => new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN',
    minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2
  }).format(cents / 100);
  function render() {
    const exchange = exchanges[selected];
    const currency = exchange ? selected : 'USD';
    prices.forEach(({ node, original, cents }) => {
      if (currency === 'USD' && !promotion) { node.innerHTML = original; return; }
      // Round the converted BASE to tens, then apply the exact discount.
      // Never convert an already rendered or discounted amount.
      const step = currency === 'COP' ? 100000 : 1000;
      const base = exchange ? Math.round(cents * exchange.rate / step) * step : cents;
      const unit = currency + (node.dataset.unit === 'USD / mes' ? ' / mes' : '');
      node.innerHTML = promotion
        ? `<span class="promo-sr">Precio original: </span><del class="promo-original">${money(base)}</del><span class="promo-price-line"><span class="promo-sr">Con 30% de descuento: </span><strong class="promo-sale">${money(Math.round(base * 70 / 100))}</strong> <span>${unit}</span></span><span class="promo-price-note">30% de descuento · noviembre</span>`
        : `${money(base)} <span>${unit}</span>`;
    });
    radios.forEach(radio => { radio.checked = radio.value === selected; });
    document.querySelectorAll('[data-displayed-currency]').forEach(node => { node.textContent = currency; });
    if (!status) return;
    retry.hidden = !failed || pending.has(failed);
    retry.textContent = `Reintentar conversión a ${failed || selected}`;
    if (pending.has(selected)) {
      status.textContent = `Consultando el tipo de cambio a ${selected}. Por ahora se muestran precios en USD.`;
    } else if (failed) {
      status.textContent = 'No pudimos consultar el tipo de cambio. Mostramos los precios en USD.';
    } else {
      status.textContent = '';
    }
  }
  async function loadRate(currency = selected) {
    if (currency === 'USD' || pending.has(currency) || exchanges[currency]) return;
    pending.add(currency);
    failed = null;
    render();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`https://api.frankfurter.dev/v2/rate/usd/${currency.toLowerCase()}`, {
        signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer'
      });
      if (!response.ok) throw new Error('Rate unavailable');
      const data = await response.json();
      const date = typeof data.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date)
        ? Date.parse(data.date + 'T00:00:00Z') : NaN;
      if (data.base !== 'USD' || data.quote !== currency ||
          !Number.isFinite(data.rate) || data.rate <= 0 ||
          !Number.isFinite(date) || new Date(date).toISOString().slice(0, 10) !== data.date) {
        throw new Error('Invalid rate');
      }
      exchanges[currency] = { rate: data.rate, date: data.date };
      // Do not change selected here: the visitor may have chosen USD while loading.
    } catch {
      if (selected === currency) {
        failed = currency;
        selected = 'USD';
      }
    } finally {
      clearTimeout(timeout);
      pending.delete(currency);
      render();
    }
  }
  document.addEventListener('nbmx:promotion-change', event => {
    promotion = event.detail.active === true;
    render();
  });
  render();
  if (!picker) return;
  picker.hidden = false;
  picker.addEventListener('change', event => {
    if (event.target.name !== 'plan-currency' || !['MXN', 'USD', 'COP'].includes(event.target.value)) return;
    selected = event.target.value;
    failed = null;
    render();
    loadRate();
  });
  retry.addEventListener('click', () => {
    if (!failed || pending.has(failed)) return;
    selected = failed;
    loadRate();
  });
  loadRate();
})();
