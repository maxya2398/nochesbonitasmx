(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-carousel]').forEach((section) => {
    const track = section.querySelector('.carousel-track');
    const controls = section.querySelector('.carousel-controls');
    controls.hidden = false;
    controls.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const card = track.firstElementChild;
        const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
        track.scrollBy({
          left: Number(button.dataset.step) * (card.getBoundingClientRect().width + gap),
          behavior: reducedMotion.matches ? 'instant' : 'smooth'
        });
      });
    });
  });

  const dialog = document.querySelector('.image-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('img');
  let opener;
  let savedScroll = 0;
  let savedBodyStyles;
  document.querySelectorAll('[data-lightbox]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.getAttribute('aria-label');
      dialog.showModal();
      savedScroll = window.scrollY;
      const body = document.body.style;
      savedBodyStyles = { position: body.position, top: body.top, width: body.width, overflow: body.overflow };
      Object.assign(body, { position: 'fixed', top: `-${savedScroll}px`, width: '100%', overflow: 'hidden' });
      dialog.scrollTop = 0;
    });
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (savedBodyStyles) {
      Object.assign(document.body.style, savedBodyStyles);
      window.scrollTo({ top: savedScroll, behavior: 'instant' });
      savedBodyStyles = null;
    }
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
})();
