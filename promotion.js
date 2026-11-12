(() => {
  // Campaign dates are explicit: Mexico City (UTC-06:00), not the visitor's zone.
  const starts = Date.parse('2026-11-01T00:00:00-06:00');
  const ends = Date.parse('2026-12-01T00:00:00-06:00');
  const seenKey = 'nbmx-november-2026-seen';
  const banner = document.querySelector('[data-promo-banner]');
  const dialog = document.querySelector('[data-promo-dialog]');
  const details = document.querySelector('[data-promo-details]');
  if (!banner || !dialog || !details) return;
  const root = document.documentElement;
  const prices = [...document.querySelectorAll('[data-regular-cents]')].map(node => ({
    node, original: node.innerHTML, cents: Number(node.dataset.regularCents)
  }));
  const money = cents => '$' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2
  }).format(cents / 100);
  let active = false, shown = false, savedBody, scrollY, returnFocus, goToPlans = false;
  const panel = dialog.querySelector('.promo-panel');
  const viewport = window.visualViewport;
  const fitDialog = () => {
    if (!dialog.open || !viewport || !panel) return;
    panel.style.top = `${viewport.offsetTop + viewport.height / 2}px`;
    panel.style.maxHeight = `${Math.max(0, viewport.height - 32)}px`;
  };
  const measureBanner = () => {
    if (active) root.style.setProperty('--promo-banner-height', `${banner.getBoundingClientRect().height}px`);
  };
  const isActive = () => Date.now() >= starts && Date.now() < ends;
  function showOffer() {
    if (!isActive() || typeof dialog.showModal !== 'function' || document.querySelector('dialog[open]')) return;
    returnFocus = document.activeElement;
    scrollY = window.scrollY;
    const body = document.body.style;
    savedBody = { position: body.position, top: body.top, width: body.width, overflow: body.overflow };
    Object.assign(body, { position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden' });
    root.classList.add('promotion-modal-open');
    dialog.showModal();
    fitDialog();
    panel?.focus?.({ preventScroll: true });
    shown = true;
    try { localStorage.setItem(seenKey, '1'); } catch { /* The banner still works without storage. */ }
  }
  dialog.querySelector('[data-promo-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-promo-plans]').addEventListener('click', () => {
    goToPlans = true;
    dialog.close();
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    root.classList.remove('promotion-modal-open');
    if (savedBody) {
      Object.assign(document.body.style, savedBody);
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      savedBody = null;
    }
    if (goToPlans) {
      goToPlans = false;
      requestAnimationFrame(() => document.querySelector('#servicios').scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      }));
    } else if (active && returnFocus?.focus) {
      returnFocus.focus({ preventScroll: true });
    }
  });
  details.addEventListener('click', showOffer);
  function update() {
    const valid = isActive();
    if (valid !== active) {
      active = valid;
      banner.hidden = !valid;
      root.classList[valid ? 'add' : 'remove']('promotion-active');
      prices.forEach(({ node, cents, original }) => {
        if (!valid) { node.innerHTML = original; return; }
        const sale = Math.round(cents * 70 / 100);
        const unit = node.dataset.unit === 'USD / mes' ? 'USD / mes' : 'USD';
        node.innerHTML = `<span class="promo-sr">Precio original: </span><del class="promo-original">${money(cents)}</del><span class="promo-price-line"><span class="promo-sr">Con 30% de descuento: </span><strong class="promo-sale">${money(sale)}</strong> <span>${unit}</span></span><span class="promo-price-note">30% de descuento · noviembre</span>`;
      });
      if (!valid) {
        root.style.removeProperty('--promo-banner-height');
        if (dialog.open) dialog.close();
      }
      measureBanner();
    }
    if (!valid) return;
    const minutes = Math.ceil((ends - Date.now()) / 60000);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor(minutes % 1440 / 60);
    const mins = minutes % 60;
    const pad = value => String(value).padStart(2, '0');
    document.querySelectorAll('[data-promo-countdown]').forEach(node => {
      const markup = '<span class="promo-time-lead">Quedan</span>' +
        [[days, 'días'], [hours, 'horas'], [mins, 'minutos']].map(([value, unit]) =>
          `<span class="promo-time-unit"><strong>${pad(value)}</strong><span>${unit}</span></span>`
        ).join('');
      if (node.innerHTML !== markup) node.innerHTML = markup;
    });
    if (!shown) {
      let seen = false;
      try { seen = localStorage.getItem(seenKey) === '1'; } catch { /* Storage is optional. */ }
      shown = seen;
      if (!seen) showOffer();
    }
  }
  update();
  // Refresh from the absolute deadline after sleep/backgrounding, never decrement a counter.
  setInterval(update, 1000);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('pageshow', update);
  window.addEventListener('resize', measureBanner);
  viewport?.addEventListener('resize', fitDialog);
  viewport?.addEventListener('scroll', fitDialog);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measureBanner).observe(banner);
})();
