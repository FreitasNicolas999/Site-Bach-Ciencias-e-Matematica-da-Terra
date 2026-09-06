(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header + mobile navigation
  const header = $('#siteHeader');
  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');

  function closeMenu() {
    if (!menuToggle || !navLinks) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    navLinks.classList.remove('is-open');
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menuToggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
      navLinks.classList.toggle('is-open', !open);
    });
    $$('#navLinks a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); }, { passive: true });
  }

  // Progress, compact header and subtle hero parallax
  const progressBar = $('#progressBar');
  const parallax = $('[data-parallax]');
  let scrollRaf = null;

  function updateScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (y / max) * 100 : 0;
    if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    header?.classList.toggle('scrolled', y > 24);
    if (parallax && !reduceMotion) parallax.style.transform = `translate3d(0, ${y * 0.08}px, 0) scale(1.02)`;
    scrollRaf = null;
  }

  window.addEventListener('scroll', () => {
    if (scrollRaf !== null) return;
    scrollRaf = requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();

  // Reveal on scroll
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('in-view'));
  }

  // Active navigation section
  const navAnchors = $$('#navLinks a[href^="#"]');
  const navSections = navAnchors.map((link) => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navAnchors.forEach((link) => {
        if (link.getAttribute('href') === `#${visible.target.id}`) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0.05, 0.2, 0.5] });
    navSections.forEach((section) => navObserver.observe(section));
  }

  // Editorial carousel
  const carousel = $('#areasCarousel');
  const slides = carousel ? $$('.emphasis-slide', carousel) : [];
  const prev = $('.carousel-btn.prev');
  const next = $('.carousel-btn.next');
  const dotsWrap = $('#carouselDots');
  const currentLabel = $('#carouselCurrent');
  const carouselStatus = $('#carouselStatus');
  let activeSlide = 0;

  function goToSlide(index, announce = true) {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    carousel.style.transform = `translate3d(-${activeSlide * 100}%, 0, 0)`;
    slides.forEach((slide, i) => {
      const active = i === activeSlide;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      $$('a', slide).forEach((link) => { link.tabIndex = active ? 0 : -1; });
    });
    if (currentLabel) currentLabel.textContent = String(activeSlide + 1).padStart(2, '0');
    $$('#carouselDots button').forEach((dot, i) => {
      dot.classList.toggle('active', i === activeSlide);
      dot.setAttribute('aria-current', i === activeSlide ? 'true' : 'false');
    });
    if (announce && carouselStatus) carouselStatus.textContent = `${slides[activeSlide].dataset.label}. Item ${activeSlide + 1} de ${slides.length}.`;
  }

  if (slides.length && dotsWrap) {
    slides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Mostrar ${slide.dataset.label}`);
      dot.addEventListener('click', () => goToSlide(index));
      dotsWrap.appendChild(dot);
    });
    prev?.addEventListener('click', () => goToSlide(activeSlide - 1));
    next?.addEventListener('click', () => goToSlide(activeSlide + 1));
    $('#carouselViewport')?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); goToSlide(activeSlide - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goToSlide(activeSlide + 1); }
    });
    $('#carouselViewport')?.setAttribute('tabindex', '0');
    goToSlide(0, false);
  }

  // Interest pathfinder. This is intentionally suggestive, not academic advice.
  const picker = $('#interestPicker');
  const result = $('#pathfinderResult');
  const emphasisData = [
    { name: 'CMT — Puro', text: 'Boa primeira leitura para quem valoriza amplitude científica, matemática e liberdade curricular.', href: '#cmt-puro' },
    { name: 'Análise de Dados', text: 'Vale começar aqui se programação, modelagem, estatística e informação chamam mais a sua atenção.', href: '#analise-dados' },
    { name: 'Sensoriamento Remoto', text: 'Um bom ponto de partida para interesses em mapas, imagens, satélites, SIG e análise espacial.', href: '#sensoriamento' },
    { name: 'Patrimônio Natural', text: 'Explore primeiro este percurso se geologia, geodiversidade, conservação e patrimônio natural são seus temas.', href: '#patrimonio' }
  ];

  function updatePathfinder() {
    if (!picker || !result) return;
    const selected = $$('button[aria-pressed="true"]', picker);
    if (!selected.length) {
      result.innerHTML = '<span class="mono">SEU PONTO DE PARTIDA</span><h3>Escolha alguns interesses acima.</h3><p>Você pode combinar quantos quiser.</p>';
      return;
    }
    const scores = [0, 0, 0, 0];
    selected.forEach((button) => {
      button.dataset.scores.split(',').map(Number).forEach((score, index) => { scores[index] += score; });
    });
    const highest = Math.max(...scores);
    const winner = scores.indexOf(highest);
    const item = emphasisData[winner];
    result.innerHTML = `<span class="mono">SEU PONTO DE PARTIDA</span><h3>${item.name}</h3><p>${item.text}</p><a href="${item.href}">Explorar percurso →</a>`;
  }

  picker?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-scores]');
    if (!button) return;
    const pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!pressed));
    updatePathfinder();
  });
  $$('#interestPicker button').forEach((button) => button.setAttribute('aria-pressed', 'false'));

  // Keep only one FAQ item open at a time on smaller screens.
  const faqItems = $$('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open || window.innerWidth > 820) return;
      faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });
})();
