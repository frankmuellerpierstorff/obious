// Fade / slide handling
// Add 'js' class immediately to ensure CSS rules apply
if (document.documentElement) {
  document.documentElement.classList.add('js');
}

// Set hero height to viewport height (mobile only) - only once on initial load
const initHeroViewportHeight = () => {
  const hero = document.querySelector('.hero:not(.legal)');
  if (!hero) return;
  
  // Only apply on mobile (max-width: 768px)
  if (window.innerWidth <= 768) {
    const viewportHeight = window.innerHeight;
    hero.style.height = `${viewportHeight}px`;
    hero.style.minHeight = `${viewportHeight}px`;
    hero.style.maxHeight = `${viewportHeight}px`;
  } else {
    // Reset for desktop
    hero.style.height = '';
    hero.style.minHeight = '';
    hero.style.maxHeight = '';
  }
};

// Initialize fade animations
const initFadeAnimations = () => {
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

    const setupFader = el => {
      el.classList.add('fade-ready');
      el.classList.remove('visible');
      observer.observe(el);
    };

    // Setup all faders
    faders.forEach(setupFader);
    
    // Mobile fix: ensure hero animates on initial load
    // Wait for layout to settle, then check if hero needs animation
    setTimeout(() => {
      const hero = document.querySelector('.hero.fade');
      if (hero && hero.classList.contains('fade-ready') && !hero.classList.contains('visible')) {
        hero.classList.add('visible');
      }
    }, 120);
  } else {
    // Fallback: ensure elements are visible without animation
    faders.forEach(el => el.classList.add('visible'));
  }
};

// Main initialization function
const init = () => {
  // Calculate browser size and set hero height first
  initHeroViewportHeight();
  
  // Initialize fade animations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFadeAnimations);
  } else {
    initFadeAnimations();
  }
};

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
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

// Smooth scroll for anchor links
const smoothScrollTo = (targetId) => {
  const target = document.querySelector(targetId);
  if (!target) return;
  
  const header = document.querySelector('.header');
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const viewportHeight = window.innerHeight;
  const availableHeight = viewportHeight - headerHeight;
  
  // Get target's position relative to document
  const targetRect = target.getBoundingClientRect();
  const targetTop = targetRect.top + window.pageYOffset;
  const targetBottom = targetRect.bottom + window.pageYOffset;
  const targetHeight = targetRect.height;
  
  let targetPosition;
  
  if (targetHeight <= availableHeight) {
    // Block fits in available viewport: position so entire block is visible
    // Position block so it starts just below header
    targetPosition = targetTop - headerHeight;
    
    // Ensure the bottom of the block doesn't go below viewport
    const finalBottom = targetPosition + targetHeight;
    const viewportBottom = viewportHeight;
    if (finalBottom > viewportBottom) {
      // Adjust so bottom of block aligns with bottom of viewport
      targetPosition = targetBottom - viewportHeight;
    }
  } else {
    // Block is taller than available viewport: position it at the top (below header)
    targetPosition = targetTop - headerHeight;
  }
  
  // Ensure we scroll enough so the previous section is completely out of view
  // Find the section that comes before the target
  const allSections = Array.from(document.querySelectorAll('section'));
  const targetIndex = allSections.indexOf(target);
  
  if (targetIndex > 0) {
    const previousSection = allSections[targetIndex - 1];
    if (previousSection) {
      const previousBottom = previousSection.getBoundingClientRect().bottom + window.pageYOffset;
      // Make sure we scroll past the previous section completely
      if (targetPosition < previousBottom) {
        targetPosition = previousBottom;
      }
    }
  }
  
  window.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: 'smooth'
  });
};

// Handle anchor link clicks with smooth scroll
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  
  const href = link.getAttribute('href');
  if (href === '#' || href === '') return;
  
  e.preventDefault();
  smoothScrollTo(href);
}, true);
