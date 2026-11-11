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
  const panel = dialog.querySelector('.image-dialog-panel');
  let opener;
  let savedScroll = 0;
  let savedBodyStyles;
  // Browser bars can change the visible viewport independently of layout.
  const viewport = window.visualViewport;
  const fitViewport = () => {
    if (!dialog.open || !viewport) return;
    panel.style.height = `${viewport.height * 0.9}px`;
    panel.style.maxHeight = `${viewport.height * 0.9}px`;
    panel.style.top = `${viewport.offsetTop + viewport.height * 0.05}px`;
  };
  viewport?.addEventListener('resize', fitViewport);
  viewport?.addEventListener('scroll', fitViewport);
  dialog.addEventListener('keydown', () => dialog.removeAttribute('data-pointer-open'));
  document.querySelectorAll('[data-lightbox]').forEach((link) => {
    link.addEventListener('keydown', () => link.removeAttribute('data-pointer-focus'));
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      opener = link;
      if (event.detail > 0) {
        link.setAttribute('data-pointer-focus', '');
        dialog.setAttribute('data-pointer-open', '');
      } else {
        link.removeAttribute('data-pointer-focus');
        dialog.removeAttribute('data-pointer-open');
      }
      image.src = link.href;
      image.alt = link.getAttribute('aria-label');
      savedScroll = window.scrollY;
      const body = document.body.style;
      savedBodyStyles = { position: body.position, top: body.top, width: body.width, overflow: body.overflow };
      Object.assign(body, { position: 'fixed', top: `-${savedScroll}px`, width: '100%', overflow: 'hidden' });
      document.documentElement.classList.add('image-modal-open');
      dialog.showModal();
      fitViewport();
      dialog.scrollTop = 0;
    });
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('image-modal-open');
    if (savedBodyStyles) {
      Object.assign(document.body.style, savedBodyStyles);
      window.scrollTo({ top: savedScroll, behavior: 'instant' });
      savedBodyStyles = null;
    }
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
})();
