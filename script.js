/* ═══════════════════════════════════════════════════════════════════
   PongPath — script.js (Apple-inspired)
   · Multi-language support (zh / en / ja / ko / es) via i18n.js
   · Apple-style language dropdown
   · Subtle navbar scroll state
   · Mobile hamburger
   · Subtle scroll reveal
   · Smooth anchor scroll with nav offset
   · Light parallax on phone mockup
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const I18N = window.PongPathI18n;
  if (!I18N) {
    console.error('[PongPath] i18n.js failed to load');
    return;
  }

  /* ── State ─────────────────────────────────────────────────────── */
  let currentLang = I18N.getLang();

  /* ── DOM refs ───────────────────────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const langMenu    = document.getElementById('langMenu');
  const langButton  = document.getElementById('langButton');
  const langOptions = document.getElementById('langOptions');
  const langCurrent = document.getElementById('langCurrent');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');

  /* ══════════════════════════════════════════════════════════════════
     1. LANGUAGE SYSTEM
     ══════════════════════════════════════════════════════════════════ */
  function applyLanguage(lang) {
    if (!I18N.TRANSLATIONS[lang]) lang = I18N.DEFAULT_LANG;
    currentLang = lang;
    I18N.setLang(lang);

    // Update text content for all i18n-tagged elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = I18N.t(key, lang);
      if (text != null) el.innerHTML = text;
    });

    // Update i18n-tagged attributes (e.g., placeholder, aria-label)
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      // Format: "attr:key,attr2:key2"
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) el.setAttribute(attr, I18N.t(key, lang));
      });
    });

    // Update <html lang>
    const info = I18N.info(lang);
    document.documentElement.lang = info.htmlLang;

    // Update <title>
    const titleKey = document.body.getAttribute('data-i18n-title') || 'meta.title';
    document.title = I18N.t(titleKey, lang);

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    const descKey = document.body.getAttribute('data-i18n-desc') || 'meta.description';
    if (metaDesc) metaDesc.setAttribute('content', I18N.t(descKey, lang));

    // Update language button label
    if (langCurrent) {
      langCurrent.textContent = info.short;
    }

    // Update active state in dropdown
    if (langOptions) {
      langOptions.querySelectorAll('button[data-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        btn.setAttribute('aria-checked', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
      });
    }
  }

  /* — Build dropdown items from supported languages — */
  function buildLangMenu() {
    if (!langOptions) return;
    langOptions.innerHTML = '';
    I18N.LANGUAGES.forEach(l => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-option';
      btn.setAttribute('role', 'menuitemradio');
      btn.setAttribute('data-lang', l.code);
      btn.setAttribute('lang', l.htmlLang);
      btn.textContent = l.label;
      btn.addEventListener('click', () => {
        applyLanguage(l.code);
        closeLangMenu();
      });
      langOptions.appendChild(btn);
    });
  }

  function openLangMenu() {
    if (!langMenu) return;
    langMenu.classList.add('open');
    langButton && langButton.setAttribute('aria-expanded', 'true');
  }
  function closeLangMenu() {
    if (!langMenu) return;
    langMenu.classList.remove('open');
    langButton && langButton.setAttribute('aria-expanded', 'false');
  }
  function toggleLangMenu() {
    if (!langMenu) return;
    if (langMenu.classList.contains('open')) closeLangMenu();
    else openLangMenu();
  }

  if (langButton) {
    langButton.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLangMenu();
    });
    document.addEventListener('click', (e) => {
      if (langMenu && !langMenu.contains(e.target)) closeLangMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLangMenu();
    });
  }

  buildLangMenu();
  applyLanguage(currentLang);

  /* ══════════════════════════════════════════════════════════════════
     2. NAVBAR — subtle blur opacity step
     ══════════════════════════════════════════════════════════════════ */
  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 12) {
      navbar.style.background = 'rgba(255,255,255,0.82)';
    } else {
      navbar.style.background = 'rgba(255,255,255,0.72)';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ══════════════════════════════════════════════════════════════════
     3. MOBILE HAMBURGER
     ══════════════════════════════════════════════════════════════════ */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     4. SCROLL REVEAL — Apple-style soft fade
     ══════════════════════════════════════════════════════════════════ */
  document.querySelectorAll(
    '.spotlight-inner, .section-header, .mini-card, .pricing-card, .final-inner, .analysis-card, .monitor-card, .plan-card, .privacy-section'
  ).forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  /* ══════════════════════════════════════════════════════════════════
     5. SMOOTH ANCHOR SCROLL with nav offset
     ══════════════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
        10
      ) || 44;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ══════════════════════════════════════════════════════════════════
     6. SUBTLE PHONE PARALLAX (desktop only)
     ══════════════════════════════════════════════════════════════════ */
  const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const phone = document.querySelector('.hero-phone');
  if (phone && !isTouchDevice()) {
    let raf = 0;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = Math.max(0, Math.min(window.scrollY, 600));
        const translate = y * 0.06;
        const scale = 1 - Math.min(y / 6000, 0.04);
        phone.style.transform = `translateY(${translate}px) scale(${scale})`;
        raf = 0;
      });
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════════════════
     7. ANIMATED SVG TRACE (analysis card)
     ══════════════════════════════════════════════════════════════════ */
  function initSwingAnimation() {
    const paths = document.querySelectorAll('.swing-arc path, .analysis-trace path');
    paths.forEach(path => {
      try {
        const length = path.getTotalLength ? path.getTotalLength() : 400;
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.28, 0.11, 0.32, 1) 0.3s';
      } catch (_) { /* noop */ }
    });

    const containers = document.querySelectorAll('.swing-arc, .analysis-trace');
    if (!containers.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('path').forEach(p => {
            p.style.strokeDashoffset = '0';
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    containers.forEach(c => obs.observe(c));
  }

  requestAnimationFrame(initSwingAnimation);

})();
