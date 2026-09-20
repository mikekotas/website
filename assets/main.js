/**
 * Portfolio site behaviour.
 *
 * Two small things, both progressive enhancements: the page is complete and
 * usable with this file blocked. No dependencies, no tracking, no cookies.
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------- theme */

  const root = document.documentElement;
  const meta = document.querySelector('meta[name="color-scheme"]');
  const toggle = document.getElementById('theme-toggle');
  const label = document.getElementById('theme-label');

  // "system" is the default and stays the default. The CSS already follows the
  // OS preference, so this only ever applies an explicit override.
  const ORDER = ['system', 'light', 'dark'];
  const LABELS = { system: 'System', light: 'Light', dark: 'Dark' };

  const readPreference = () => {
    try {
      const stored = localStorage.getItem('color-scheme');
      return ORDER.includes(stored) ? stored : 'system';
    } catch (err) {
      // Private mode, or site data blocked. Not an error worth surfacing.
      return 'system';
    }
  };

  const applyPreference = (preference) => {
    if (preference === 'system') {
      delete root.dataset.theme;
      if (meta) meta.content = 'dark light';
    } else {
      root.dataset.theme = preference;
      if (meta) meta.content = preference;
    }

    if (label) label.textContent = LABELS[preference];
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        `Colour theme: ${LABELS[preference]}. Activate to change.`,
      );
    }
  };

  applyPreference(readPreference());

  toggle?.addEventListener('click', () => {
    const next = ORDER[(ORDER.indexOf(readPreference()) + 1) % ORDER.length];
    try {
      if (next === 'system') localStorage.removeItem('color-scheme');
      else localStorage.setItem('color-scheme', next);
    } catch (err) {
      // Preference won't persist, but the toggle still works this session.
    }
    applyPreference(next);
  });

  /* ------------------------------------------------------------ reveal */

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setupReveal = () => {
    // Bail out entirely rather than degrade: without the observer, or with
    // reduced motion requested, the content must simply be visible.
    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      root.classList.remove('js-reveal');
      return;
    }

    root.classList.add('js-reveal');

    const targets = document.querySelectorAll('.card, .case, .principle');
    targets.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          // One-shot: nothing re-animates on the way back up.
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    targets.forEach((el) => observer.observe(el));
  };

  setupReveal();

  // The OS preference can change while the page is open.
  prefersReducedMotion.addEventListener('change', (event) => {
    if (!event.matches) return;
    root.classList.remove('js-reveal');
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  });
})();
