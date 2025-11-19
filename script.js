// Fade / slide handling
// Add 'js' class immediately to ensure CSS rules apply
if (document.documentElement) {
  document.documentElement.classList.add('js');
}

// STEP 1: Calculate browser size and set hero height (mobile only)
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

// STEP 2: Get fade elements
const getFadeElements = () => {
  return Array.from(document.querySelectorAll('.fade'));
};

// Wait for all resources to be loaded using Performance API
const waitForResourcesLoaded = async () => {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    });
  }

  // Wait for fonts (with optional display, they render immediately)
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch(e) {}
  }

  // Wait for all resources using Performance API
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    const criticalResources = resources.filter(r => 
      r.name.includes('.css') || 
      r.name.includes('.png') || 
      r.name.includes('fonts.googleapis.com')
    );

    // Wait for all critical resources
    await Promise.all(
      criticalResources.map(resource => {
        return new Promise(resolve => {
          if (resource.duration > 0) {
            resolve(); // Already loaded
          } else {
            // Resource still loading, wait a bit
            setTimeout(resolve, 100);
          }
        });
      })
    );
  }

  // Wait for layout to be stable
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => requestAnimationFrame(r));
};

// Wait for hero headline to be rendered using MutationObserver
const waitForHeadlineRendered = async () => {
  const headline = document.querySelector('.hero__headline');
  if (!headline) return;

  return new Promise((resolve) => {
    // Check if already rendered
    const checkRendered = () => {
      const rect = headline.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(headline);
      
      if (rect.width > 0 && rect.height > 0 && computedStyle.opacity !== '0') {
        // Force layout calculation
        void headline.offsetWidth;
        resolve();
        return true;
      }
      return false;
    };

    if (checkRendered()) return;

    // Use MutationObserver to watch for changes
    const observer = new MutationObserver(() => {
      if (checkRendered()) {
        observer.disconnect();
      }
    });

    observer.observe(headline, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Fallback timeout
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 2000);
  });
};

// Smart wait: combines all waiting strategies
const smartWait = async () => {
  await waitForResourcesLoaded();
  await waitForHeadlineRendered();
  
  // Final delay for mobile Safari
  await new Promise(r => setTimeout(r, 100));
};

// Fade in hero and header after smart wait
const fadeInInitialElements = async () => {
  const hero = document.querySelector('.hero.fade');
  const header = document.querySelector('.header.fade');
  
  // Smart wait for everything to be ready
  await smartWait();
  
  // Now fade in
  if (header) header.classList.add('visible');
  if (hero) hero.classList.add('visible');
};

// STEP 3: Initialize faders and animate
const initFadeAnimations = (faders) => {
  if (!faders || faders.length === 0) return;
  
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
      { threshold: 0.15, rootMargin: '50px' }
    );

    const setupFader = el => {
      el.classList.add('fade-ready');
      el.classList.remove('visible');
      observer.observe(el);
    };

    // Setup all faders
    faders.forEach(setupFader);
  } else {
    // Fallback: ensure elements are visible without animation
    faders.forEach(el => {
      el.classList.add('visible');
    });
  }
};

// Main initialization function - correct order
const init = () => {
  // STEP 1: Calculate browser size and set hero height FIRST
  initHeroViewportHeight();
  
  // STEP 2: Get fade elements
  const faders = getFadeElements();
  
  // STEP 3: Setup fade animations
  initFadeAnimations(faders);
  
  // Fade in hero and header after smart wait
  fadeInInitialElements();
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

