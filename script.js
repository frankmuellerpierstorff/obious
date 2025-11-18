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

// STEP 2: Get fade elements (CSS already hides them via .js .fade:not(.fade-ready))
const getFadeElements = () => {
  return Array.from(document.querySelectorAll('.fade'));
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
      { threshold: 0.1, rootMargin: '0px' }
    );

    const setupFader = el => {
      el.classList.add('fade-ready');
      el.classList.remove('visible');
      observer.observe(el);
    };

    // Setup all faders
    faders.forEach(setupFader);
    
    // STEP 4: Animate elements that are already in viewport
    const animateVisibleElements = () => {
      // Special handling for header (always visible on load, position: fixed)
      const header = document.querySelector('.header.fade');
      if (header && header.classList.contains('fade-ready') && !header.classList.contains('visible')) {
        header.classList.add('visible');
      }
      
      // Special handling for hero section (always visible on load)
      const hero = document.querySelector('.hero.fade');
      if (hero && hero.classList.contains('fade-ready') && !hero.classList.contains('visible')) {
        hero.classList.add('visible');
      }
      
      // Check other elements
      faders.forEach(el => {
        // Skip header and hero (already handled)
        if (el === header || el === hero) return;
        
        if (!el.classList.contains('fade-ready')) return;
        if (el.classList.contains('visible')) return;
        
        const rect = el.getBoundingClientRect();
        const isInViewport = (
          rect.top < window.innerHeight * 1.5 &&
          rect.bottom > -window.innerHeight * 0.5 &&
          rect.left < window.innerWidth &&
          rect.right > 0
        );
        
        if (isInViewport) {
          el.classList.add('visible');
        }
      });
    };
    
    // Wait for everything to be fully loaded before animating
    // This ensures background colors and styles are rendered
    const checkBackgroundRendered = () => {
      const hero = document.querySelector('.hero.fade');
      if (!hero) return true;
      
      const computedStyle = window.getComputedStyle(hero);
      const bgColor = computedStyle.backgroundColor;
      
      // Check if blue background is rendered (rgb(30, 0, 255) or similar)
      // Also accept rgba format
      const isBlue = bgColor.includes('30') && bgColor.includes('255');
      const hasRgb30 = bgColor.includes('rgb(30');
      const notTransparent = bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
      
      return isBlue || hasRgb30 || notTransparent;
    };
    
    const startAnimations = () => {
      const tryAnimate = () => {
        // Check if background is rendered
        if (checkBackgroundRendered()) {
          animateVisibleElements();
          return true;
        }
        return false;
      };
      
      // Wait for window load event (all resources loaded)
      if (document.readyState !== 'complete') {
        window.addEventListener('load', () => {
          // Check multiple times until background is rendered
          let attempts = 0;
          const maxAttempts = 10;
          
          const checkAndAnimate = () => {
            if (tryAnimate() || attempts >= maxAttempts) {
              return;
            }
            attempts++;
            setTimeout(checkAndAnimate, 50);
          };
          
          setTimeout(checkAndAnimate, 100);
        });
      } else {
        // Already loaded, check if background is ready
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkAndAnimate = () => {
          if (tryAnimate() || attempts >= maxAttempts) {
            return;
          }
          attempts++;
          setTimeout(checkAndAnimate, 50);
        };
        
        setTimeout(checkAndAnimate, 150);
      }
      
      // Also use requestAnimationFrame as backup (after multiple frames)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!tryAnimate()) {
                // Fallback: animate anyway after delay
                setTimeout(animateVisibleElements, 300);
              }
            });
          });
        });
      });
    };
    
    startAnimations();
  } else {
    // Fallback: ensure elements are visible without animation
    faders.forEach(el => {
      el.classList.add('visible');
    });
  }
};

// Main initialization function - correct order
const init = () => {
  // STEP 1: Get fade elements (CSS already hides them via .js class)
  const faders = getFadeElements();
  
  // STEP 2: Calculate browser size and set hero height
  initHeroViewportHeight();
  
  // STEP 3 & 4: Setup and animate after layout is stable
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initFadeAnimations(faders);
    });
  });
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
