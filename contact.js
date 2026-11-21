(() => {
  const links = document.querySelectorAll('[data-contact-product]');
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'contact-dialog';
  dialog.setAttribute('aria-labelledby', 'contact-title');
  dialog.innerHTML = `<div class="contact-panel"><button type="button" class="contact-close" aria-label="Cerrar mensaje">×</button><p class="eyebrow">CONVERSEMOS</p><h2 id="contact-title">Tu primer mensaje</h2><p>Copia este mensaje y pégalo en el chat de Instagram. Puedes ajustarlo antes de enviarlo.</p><label for="contact-message">Mensaje para Nicoleth</label><textarea id="contact-message" rows="5"></textarea><p role="status" aria-live="polite" class="contact-status"></p><div class="actions"><button type="button" class="button" data-copy-message>Copiar mensaje</button><a class="button outline" href="https://ig.me/m/nochesbonitas.mx" target="_blank" rel="noopener">Abrir Instagram</a></div><p class="contact-note">Nada se envía automáticamente. Si el chat no abre, busca <a href="https://www.instagram.com/nochesbonitas.mx/" target="_blank" rel="noopener">@nochesbonitas.mx</a>.</p></div>`;
  document.body.append(dialog);
  const message = dialog.querySelector('textarea');
  const status = dialog.querySelector('.contact-status');
  let opener, scrollY = 0, previousStyle;
  function close() { dialog.close(); }
  dialog.querySelector('.contact-close').addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => {
    document.body.style.cssText = previousStyle;
    window.scrollTo({ top: scrollY, behavior: 'instant' });
    opener?.focus({ preventScroll: true });
  });
  links.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    opener = link;
    const price = link.closest('article')?.querySelector('.price');
    const clone = price?.cloneNode(true);
    clone?.querySelectorAll('del, .promo-sr, .promo-price-note').forEach(node => node.remove());
    const rendered = clone?.textContent.replace(/\s+/g, ' ').trim();
    const amount = rendered && !rendered.includes('[') ? rendered : '';
    message.value = `Hola, Nicoleth. Me interesa ${link.dataset.contactProduct}.${amount ? ` Vi el precio de ${amount}.` : ''} ¿Me compartes más información y cómo puedo contratarlo?`;
    status.textContent = '';
    scrollY = window.scrollY;
    previousStyle = document.body.style.cssText;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    dialog.showModal();
  }));
  dialog.querySelector('[data-copy-message]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(message.value);
      if (dialog.open) status.textContent = 'Mensaje copiado. Abre Instagram y pégalo en el chat.';
    } catch {
      if (!dialog.open) return;
      message.focus(); message.select();
      status.textContent = 'Seleccionamos el texto para que puedas copiarlo manualmente.';
    }
  });
})();
