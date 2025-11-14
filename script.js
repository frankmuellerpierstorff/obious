// Fade / slide handling
document.documentElement.classList.add('js');

const faders = Array.from(document.querySelectorAll('.fade'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  const prepareFader = el => {
    el.classList.add('fade-ready');
    el.classList.remove('visible');
    observer.observe(el);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => faders.forEach(prepareFader));
  } else {
    faders.forEach(prepareFader);
  }
} else {
  // Fallback: ensure elements are visible without animation
  faders.forEach(el => el.classList.add('visible'));
}

// Header theme swap (light/dark) based on overlapping section
const header = document.querySelector('.header');
const themedSections = Array.from(document.querySelectorAll('[data-header-theme]'));

const updateHeaderTheme = () => {
  if (!header) return;
  const headerHeight = header.getBoundingClientRect().height;
  const activeSection =
    themedSections.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= headerHeight && rect.bottom > headerHeight;
    }) || null;

  const theme = activeSection ? activeSection.getAttribute('data-header-theme') : 'light';
  if (theme === 'dark') {
    header.classList.add('header--inverse');
  } else {
    header.classList.remove('header--inverse');
    header.style.color = 'var(--text-dark)';
  }
};

if (header) {
  // Run immediately on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateHeaderTheme);
  } else {
    updateHeaderTheme();
  }
  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateHeaderTheme);
  }, { passive: true });
  window.addEventListener('resize', updateHeaderTheme);
}
