(() => {
  const picker = document.querySelector('[data-currency-picker]');
  const status = document.querySelector('[data-currency-status]');
  const retry = document.querySelector('[data-currency-retry]');
  const radios = [...document.querySelectorAll('[name="plan-currency"]')];
  const prices = [...document.querySelectorAll('[data-regular-cents]')].map(node => ({
    node, original: node.innerHTML, cents: Number(node.dataset.regularCents),
    currency: node.dataset.baseCurrency || 'USD'
  }));
  // Selection and fetched rate belong only to this page instance.
  let selected = picker ? 'MXN' : 'USD';
  const exchanges = {}, pending = new Set(), failed = new Set();
  let promotion = false;
  const money = cents => new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN',
    minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2
  }).format(cents / 100);
  // Every quote is USD-based. Cross-currency prices need both legs of the path.
  function requiredRates() {
    const required = new Set();
    prices.forEach(({ currency }) => {
      if (currency === selected) return;
      if (currency !== 'USD') required.add(currency);
      if (selected !== 'USD') required.add(selected);
    });
    return [...required];
  }
  function render() {
    const displayed = new Set();
    prices.forEach(({ node, original, cents, currency: native }) => {
      const from = native === 'USD' ? 1 : exchanges[native]?.rate;
      const to = selected === 'USD' ? 1 : exchanges[selected]?.rate;
      const currency = native === selected || (from && to) ? selected : native;
      displayed.add(currency);
      const discounted = promotion && node.dataset.discount !== 'false';
      if (currency === native && !discounted) { node.innerHTML = original; return; }
      // Preserve exact native prices; round only converted BASES before discounting.
      // Never convert a rendered, rounded, or discounted amount.
      const step = currency === 'COP' ? 100000 : currency === 'USD' ? 500 : 1000;
      const base = currency === native ? cents : Math.round(cents / from * to / step) * step;
      const unit = currency + (node.dataset.unit || native).replace(/^[A-Z]{3}/, '');
      node.innerHTML = discounted
        ? `<span class="promo-sr">Precio original: </span><del class="promo-original">${money(base)}</del><span class="promo-price-line"><span class="promo-sr">Con 30% de descuento: </span><strong class="promo-sale">${money(Math.round(base * 70 / 100))}</strong> <span>${unit}</span></span><span class="promo-price-note">30% de descuento · noviembre</span>`
        : `${money(base)} <span>${unit}</span>`;
    });
    radios.forEach(radio => { radio.checked = radio.value === selected; });
    const label = displayed.size === 1 ? [...displayed][0] : 'su moneda de origen';
    document.querySelectorAll('[data-displayed-currency]').forEach(node => { node.textContent = label; });
    if (!status) return;
    const required = requiredRates();
    retry.hidden = !required.some(currency => failed.has(currency) && !pending.has(currency));
    retry.textContent = `Reintentar conversión a ${selected}`;
    const fallback = displayed.size === 1 ? `Los precios se muestran en ${label}.`
      : 'Los precios sin conversión se muestran en su moneda de origen.';
    if (required.some(currency => pending.has(currency))) {
      status.textContent = `Consultando el tipo de cambio a ${selected}. ${fallback}`;
    } else if (required.some(currency => failed.has(currency))) {
      status.textContent = `No pudimos consultar el tipo de cambio. ${fallback}`;
    } else {
      status.textContent = '';
    }
  }
  async function loadRate(currency) {
    if (currency === 'USD' || pending.has(currency) || exchanges[currency]) return;
    pending.add(currency);
    failed.delete(currency);
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
      failed.add(currency);
    } finally {
      clearTimeout(timeout);
      pending.delete(currency);
      render();
    }
  }
  function loadRates() {
    requiredRates().forEach(loadRate);
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
    render();
    loadRates();
  });
  retry.addEventListener('click', () => {
    loadRates();
  });
  loadRates();
})();
