document.documentElement.classList.add('js');

/* ——————————————————————————————
   HERO HEIGHT — MUST RUN BEFORE ANY ANIMATION
—————————————————————————————— */
function initHeroViewportHeight() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  hero.style.height = '';
  hero.style.minHeight = '';
  hero.style.maxHeight = '';

  const viewportHeight = window.innerHeight;
  hero.style.height = `${viewportHeight}px`;
  hero.style.minHeight = `${viewportHeight}px`;
  hero.style.maxHeight = `${viewportHeight}px`;
}

/* ——————————————————————————————
   FADE IN ANIMATIONS
—————————————————————————————— */
function initFadeAnimations() {
  const faders = [...document.querySelectorAll('.fade')];
  const hero = document.querySelector('.hero.fade');
  const header = document.querySelector('.header.fade');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  faders.forEach(el => {
    el.classList.add('fade-ready');
    if (el !== hero && el !== header) {
      observer.observe(el);
    }
  });

  // Hero + header fade in AFTER first layout frame
  requestAnimationFrame(() => {
    hero?.classList.add('visible');
    header?.classList.add('visible');
  });
}

/* ——————————————————————————————
   SMOOTH SCROLL FOR HERO ARROW + CONTACT LINK
—————————————————————————————— */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });
}

/* ——————————————————————————————
   HEADER THEME SWITCH
—————————————————————————————— */
function updateHeaderTheme() {
  const header = document.querySelector('.header');
  if (!header) return;

  const label = header.querySelector('.header__label');
  const contact = header.querySelector('.header__contact');
  const themedSections = [...document.querySelectorAll('[data-header-theme]')];

  const headerHeight = header.getBoundingClientRect().height;

  const activeSection =
    themedSections.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= headerHeight && rect.bottom > headerHeight;
    }) || null;

  const theme = activeSection
    ? activeSection.getAttribute('data-header-theme')
    : 'light';

  if (theme === 'dark') {
    header.classList.add('header--inverse');
    header.style.color = '#fbf9f5';
    label.style.color = '#fbf9f5';
    contact.style.color = '#fbf9f5';
  } else {
    header.classList.remove('header--inverse');
    header.style.color = '#120f08';
    label.style.color = '#120f08';
    contact.style.color = '#120f08';
  }
}

/* ——————————————————————————————
   INIT
—————————————————————————————— */

document.addEventListener('DOMContentLoaded', () => {
  initHeroViewportHeight();   // Height BEFORE animations
  initFadeAnimations();       // Fade-in system
  initSmoothScroll();         // Hero arrow + contact smooth scroll
  updateHeaderTheme();        // Initial header theme
});

window.addEventListener('resize', initHeroViewportHeight);

window.addEventListener(
  'scroll',
  () => requestAnimationFrame(updateHeaderTheme),
  { passive: true }
);