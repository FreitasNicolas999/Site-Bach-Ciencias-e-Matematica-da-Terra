(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const pad = (number) => String(number).padStart(2, '0');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // UTC clock
  const clock = $('#clock');
  const footerClock = $('#footerClock');

  function updateClock() {
    const now = new Date();
    const time = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`;
    if (clock) {
      clock.textContent = time;
      clock.dateTime = now.toISOString();
    }
    if (footerClock) footerClock.textContent = `${time} · ÓRBITA EM ANDAMENTO`;
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  // Decorative orbital ticker
  const tickerData = [
    ['ALT', '408 KM'], ['VEL', '27.600 KM/H'], ['PERÍODO', '92 MIN'],
    ['INCLINAÇÃO', '51,6°'], ['NASCERES DO SOL', '16 POR DIA'], ['TRIPULAÇÃO ISS', '≈ 7'],
    ['DISTÂNCIA MÉDIA À LUA', '384.400 KM'], ['CIRCUNFERÊNCIA DA TERRA', '40.075 KM']
  ];
  const track = $('#tickerTrack');

  if (track) {
    const items = tickerData.map(([key, value]) => (
      `<div class="ticker-item"><span class="dot"></span>${key} <b>${value}</b></div>`
    )).join('');
    track.innerHTML = items + items;
  }

  // Mobile navigation
  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');

  function closeMenu() {
    if (!menuToggle || !navLinks) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
    navLinks.classList.remove('is-open');
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menuToggle.setAttribute('aria-label', open ? 'Abrir menu de navegação' : 'Fechar menu de navegação');
      navLinks.classList.toggle('is-open', !open);
    });

    $$('#navLinks a').forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeMenu();
    }, { passive: true });
  }

  // Scroll progress + parallax
  const railFill = $('#railFill');
  const railLabel = $('#railLabel');
  const backgrounds = $$('.panel-bg');
  let rafId = null;

  function updateScrollEffects() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

    if (railFill) railFill.style.height = `${percentage}%`;
    if (railLabel) railLabel.textContent = `${String(Math.round(percentage)).padStart(3, '0')}%`;

    if (!reduceMotion) {
      backgrounds.forEach((background) => {
        const speed = Number.parseFloat(background.dataset.speed || '0.15');
        const rect = background.parentElement.getBoundingClientRect();
        background.style.transform = `translate3d(0, ${rect.top * speed}px, 0)`;
      });
    }
  }

  function requestScrollUpdate() {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(() => {
      updateScrollEffects();
      rafId = null;
    });
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  updateScrollEffects();

  // Reveal sections and highlight current navigation item
  const panels = $$('.panel');
  const navAnchors = $$('#navLinks a');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { threshold: 0.22 });

    panels.forEach((panel) => revealObserver.observe(panel));

    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navAnchors.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-35% 0px -50% 0px', threshold: [0, 0.1, 0.25, 0.5] });

    panels.filter((panel) => panel.id !== 'topo').forEach((panel) => sectionObserver.observe(panel));
  } else {
    panels.forEach((panel) => panel.classList.add('in-view'));
  }

  // Accessible 3D carousel
  const carousel = $('#areasCarousel');
  const cards = carousel ? $$('.cmt-card', carousel) : [];
  const nextButton = $('.carousel-btn.next');
  const previousButton = $('.carousel-btn.prev');
  const carouselStatus = $('#carouselStatus');
  let activeIndex = 0;

  function normalizedIndex(index) {
    return (index % cards.length + cards.length) % cards.length;
  }

  function carouselRadius() {
    if (window.innerWidth <= 560) return 175;
    if (window.innerWidth <= 860) return 205;
    return 245;
  }

  function positionCards(announce = false) {
    if (!cards.length) return;

    const angle = 360 / cards.length;
    const radius = carouselRadius();

    cards.forEach((card, index) => {
      const relativeIndex = index - activeIndex;
      const rotation = relativeIndex * angle;
      card.style.transform = `rotateY(${rotation}deg) translateZ(${radius}px)`;

      const isActive = index === activeIndex;
      card.classList.toggle('active', isActive);
      card.setAttribute('aria-current', isActive ? 'true' : 'false');
      card.tabIndex = isActive ? 0 : -1;
    });

    if (announce && carouselStatus) {
      const label = cards[activeIndex].dataset.label || cards[activeIndex].textContent.trim();
      carouselStatus.textContent = `${label}. Item ${activeIndex + 1} de ${cards.length}.`;
    }
  }

  function moveCarousel(direction) {
    if (!cards.length) return;
    activeIndex = normalizedIndex(activeIndex + direction);
    positionCards(true);
    cards[activeIndex].focus({ preventScroll: true });
  }

  if (cards.length) {
    nextButton?.addEventListener('click', () => moveCarousel(1));
    previousButton?.addEventListener('click', () => moveCarousel(-1));

    cards.forEach((card, index) => {
      card.addEventListener('click', (event) => {
        if (index !== activeIndex) {
          event.preventDefault();
          activeIndex = index;
          positionCards(true);
          card.focus({ preventScroll: true });
        }
      });
    });

    carousel?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveCarousel(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveCarousel(-1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        activeIndex = 0;
        positionCards(true);
        cards[activeIndex].focus({ preventScroll: true });
      } else if (event.key === 'End') {
        event.preventDefault();
        activeIndex = cards.length - 1;
        positionCards(true);
        cards[activeIndex].focus({ preventScroll: true });
      }
    });

    let carouselResizeId = null;
    window.addEventListener('resize', () => {
      window.clearTimeout(carouselResizeId);
      carouselResizeId = window.setTimeout(() => positionCards(false), 120);
    }, { passive: true });

    positionCards(false);
  }
})();
