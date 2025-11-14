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
  const label = header.querySelector('.header__label');
  const contact = header.querySelector('.header__contact');
  
  const headerHeight = header.getBoundingClientRect().height;
  
  const activeSection =
    themedSections.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= headerHeight && rect.bottom > headerHeight;
    }) || null;

  let theme = 'light'; // Default to light (black)
  
  if (activeSection) {
    theme = activeSection.getAttribute('data-header-theme');
  } else {
    // If no active section, check if we're at the top (where hero section is)
    const scrollY = window.scrollY || window.pageYOffset;
    const isAtTop = scrollY < 100;
    if (isAtTop) {
      // At top, check first section (should be hero with dark theme)
      const firstSection = themedSections[0];
      if (firstSection && firstSection.getAttribute('data-header-theme') === 'dark') {
        theme = 'dark';
      }
    }
  }
  
  if (theme === 'dark') {
    header.classList.add('header--inverse');
    header.style.color = '#fbf9f5';
    if (label) label.style.color = '#fbf9f5';
    if (contact) contact.style.color = '#fbf9f5';
  } else {
    header.classList.remove('header--inverse');
    header.style.color = '#120f08';
    if (label) label.style.color = '#120f08';
    if (contact) contact.style.color = '#120f08';
  }
};

if (header) {
  // Set initial white color immediately
  const label = header.querySelector('.header__label');
  const contact = header.querySelector('.header__contact');
  header.style.color = '#fbf9f5';
  if (label) label.style.color = '#fbf9f5';
  if (contact) contact.style.color = '#fbf9f5';
  
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
  // Fix for iOS overscroll - reapply theme when scroll position changes
  window.addEventListener('touchmove', () => {
    window.requestAnimationFrame(updateHeaderTheme);
  }, { passive: true });
  // Fix for Chrome overscroll - reapply on any interaction
  window.addEventListener('touchstart', () => {
    window.requestAnimationFrame(updateHeaderTheme);
  }, { passive: true });
  window.addEventListener('wheel', () => {
    window.requestAnimationFrame(updateHeaderTheme);
  }, { passive: true });
}
