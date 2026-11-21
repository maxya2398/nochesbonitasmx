(() => {
  const button = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('#main-navigation');
  if (!button || !navigation) return;
  const root = document.documentElement;
  let open = false;
  const setOpen = value => {
    open = value;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    root.classList.toggle('menu-open', open);
  };
  root.classList.add('menu-enhanced');
  button.hidden = false;
  button.addEventListener('click', () => setOpen(!open));
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  const closeWithEscape = event => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      button.focus();
    }
  };
  navigation.addEventListener('keydown', closeWithEscape);
  button.addEventListener('keydown', closeWithEscape);
})();
