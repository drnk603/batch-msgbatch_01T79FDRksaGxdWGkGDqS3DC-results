(function() {
  'use strict';

  const DOM = {
    body: document.body,
    navToggle: document.querySelector('.navbar-toggler, .c-nav__toggle'),
    navCollapse: document.querySelector('.navbar-collapse, .c-nav'),
    navLinks: document.querySelectorAll('.nav-link, .c-nav__link'),
    forms: document.querySelectorAll('form'),
    filterBtns: document.querySelectorAll('.c-filter-btn'),
    portfolioItems: document.querySelectorAll('[data-filter-category]'),
    accordionBtns: document.querySelectorAll('.accordion-button'),
    scrollToTopBtn: document.querySelector('[data-scroll-top]'),
  };

  const STATE = {
    menuOpen: false,
    activeFilter: 'all',
  };

  const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\s\+\-\(\)]{10,20}$/,
    name: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
  };

  function initMobileMenu() {
    if (!DOM.navToggle || !DOM.navCollapse) return;

    DOM.navToggle.addEventListener('click', toggleMenu);

    DOM.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024 && STATE.menuOpen) {
          closeMenu();
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (STATE.menuOpen && 
          !DOM.navCollapse.contains(e.target) && 
          !DOM.navToggle.contains(e.target) &&
          window.innerWidth < 1024) {
        closeMenu();
      }
    });
  }

  function toggleMenu() {
    STATE.menuOpen ? closeMenu() : openMenu();
  }

  function openMenu() {
    STATE.menuOpen = true;
    DOM.navCollapse.classList.add('show');
    DOM.navToggle.setAttribute('aria-expanded', 'true');
    DOM.body.classList.add('u-no-scroll');
  }

  function closeMenu() {
    STATE.menuOpen = false;
    DOM.navCollapse.classList.remove('show');
    DOM.navToggle.setAttribute('aria-expanded', 'false');
    DOM.body.classList.remove('u-no-scroll');
  }

  function initScrollSpy() {
    if (DOM.navLinks.length === 0) return;

    const sections = Array.from(DOM.navLinks)
      .map(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          return document.querySelector(href);
        }
        return null;
      })
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          updateActiveNavLink(id);
        }
      });
    }, {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0,
    });

    sections.forEach(section => observer.observe(section));
  }

  function updateActiveNavLink(activeId) {
    DOM.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });

          if (STATE.menuOpen) {
            closeMenu();
          }
        }
      });
    });
  }

  function initFormValidation() {
    DOM.forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit);

      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
      });
    });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    clearAllErrors(form);

    const fields = {
      name: form.querySelector('#name, #firstName'),
      lastName: form.querySelector('#lastName'),
      email: form.querySelector('#email'),
      phone: form.querySelector('#phone'),
      subject: form.querySelector('#subject'),
      message: form.querySelector('#message'),
      privacy: form.querySelector('#privacy'),
    };

    let isValid = true;

    if (fields.name && !validateName(fields.name)) isValid = false;
    if (fields.lastName && !validateName(fields.lastName)) isValid = false;
    if (fields.email && !validateEmail(fields.email)) isValid = false;
    if (fields.phone && fields.phone.hasAttribute('required') && !validatePhone(fields.phone)) isValid = false;
    if (fields.subject && !validateRequired(fields.subject, 'Bitte geben Sie einen Betreff ein')) isValid = false;
    if (fields.message && !validateMessage(fields.message)) isValid = false;
    if (fields.privacy && !validateCheckbox(fields.privacy)) isValid = false;

    if (!isValid) {
      const firstError = form.querySelector('.has-error, .is-invalid');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';
    }

    setTimeout(() => {
      window.location.href = 'thank_you.html';
    }, 800);
  }

  function validateField(field) {
    const id = field.getAttribute('id');
    
    switch(id) {
      case 'name':
      case 'firstName':
      case 'lastName':
        return validateName(field);
      case 'email':
        return validateEmail(field);
      case 'phone':
        return field.hasAttribute('required') ? validatePhone(field) : true;
      case 'subject':
        return validateRequired(field, 'Bitte geben Sie einen Betreff ein');
      case 'message':
        return validateMessage(field);
      case 'privacy':
        return validateCheckbox(field);
      default:
        return true;
    }
  }

  function validateName(field) {
    const value = field.value.trim();
    
    if (!value) {
      showError(field, 'Bitte geben Sie einen Namen ein');
      return false;
    }

    if (!PATTERNS.name.test(value)) {
      showError(field, 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen)');
      return false;
    }

    return true;
  }

  function validateEmail(field) {
    const value = field.value.trim();

    if (!value) {
      showError(field, 'Bitte geben Sie eine E-Mail-Adresse ein');
      return false;
    }

    if (!PATTERNS.email.test(value)) {
      showError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return false;
    }

    return true;
  }

  function validatePhone(field) {
    const value = field.value.trim();

    if (!value) {
      showError(field, 'Bitte geben Sie eine Telefonnummer ein');
      return false;
    }

    if (!PATTERNS.phone.test(value)) {
      showError(field, 'Bitte geben Sie eine gültige Telefonnummer ein');
      return false;
    }

    return true;
  }

  function validateMessage(field) {
    const value = field.value.trim();

    if (!value) {
      showError(field, 'Bitte geben Sie eine Nachricht ein');
      return false;
    }

    if (value.length < 10) {
      showError(field, 'Die Nachricht muss mindestens 10 Zeichen lang sein');
      return false;
    }

    return true;
  }

  function validateRequired(field, message) {
    const value = field.value.trim();

    if (!value) {
      showError(field, message);
      return false;
    }

    return true;
  }

  function validateCheckbox(checkbox) {
    if (!checkbox.checked) {
      showError(checkbox, 'Bitte akzeptieren Sie die Datenschutzerklärung');
      return false;
    }

    return true;
  }

  function showError(field, message) {
    field.classList.add('has-error', 'is-invalid');
    
    const errorContainer = field.parentElement.querySelector('.c-form__error, .invalid-feedback');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
    }
  }

  function clearError(field) {
    field.classList.remove('has-error', 'is-invalid');
    
    const errorContainer = field.parentElement.querySelector('.c-form__error, .invalid-feedback');
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
    }
  }

  function clearAllErrors(form) {
    const errorFields = form.querySelectorAll('.has-error, .is-invalid');
    errorFields.forEach(field => clearError(field));
  }

  function initPortfolioFilter() {
    if (DOM.filterBtns.length === 0) return;

    DOM.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        
        DOM.filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        filterPortfolioItems(filter);
      });
    });
  }

  function filterPortfolioItems(filter) {
    STATE.activeFilter = filter;

    DOM.portfolioItems.forEach(item => {
      const category = item.getAttribute('data-filter-category');
      
      if (filter === 'all' || category === filter) {
        item.style.display = '';
        item.setAttribute('aria-hidden', 'false');
      } else {
        item.style.display = 'none';
        item.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function initAccordion() {
    DOM.accordionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-bs-target');
        const collapse = document.querySelector(target);
        
        if (!collapse) return;

        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          closeAccordion(btn, collapse);
        } else {
          openAccordion(btn, collapse);
        }
      });
    });
  }

  function openAccordion(btn, collapse) {
    btn.setAttribute('aria-expanded', 'true');
    btn.classList.remove('collapsed');
    collapse.classList.add('show');
  }

  function closeAccordion(btn, collapse) {
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.add('collapsed');
    collapse.classList.remove('show');
  }

  function initScrollToTop() {
    const btn = DOM.scrollToTopBtn || createScrollToTopBtn();
    
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  function createScrollToTopBtn() {
    const existingBtn = document.querySelector('[href="#top"], [data-scroll-top]');
    return existingBtn;
  }

  function init() {
    initMobileMenu();
    initScrollSpy();
    initSmoothScroll();
    initFormValidation();
    initPortfolioFilter();
    initAccordion();
    initScrollToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();