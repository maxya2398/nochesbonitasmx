(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || typeof IntersectionObserver === 'undefined') return;

  const played = new WeakSet();
  const running = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || played.has(entry.target)) continue;
      played.add(entry.target);
      observer.unobserve(entry.target);
      if (preference.matches || typeof entry.target.animate !== 'function') continue;

      // Content remains visible when JavaScript or animation support is unavailable.
      const animation = entry.target.animate([
        { opacity: 0.35, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      running.add(animation);
      animation.onfinish = animation.oncancel = () => running.delete(animation);
    }
  }, { threshold: 0.08 });

  document.querySelectorAll(
    '.hero-copy, .night-art, .principles article, .about > div, .section-heading, .plan, .wide-plan, .faq > div, .contact .wrap',
  ).forEach((element) => observer.observe(element));

  preference.addEventListener('change', (event) => {
    if (!event.matches) return;
    observer.disconnect();
    running.forEach((animation) => animation.cancel());
    running.clear();
  });
})();
