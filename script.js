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

  // ==========================================================================
  // FLUXOGRAMA DO CURSO & CATÁLOGO DE ELETIVAS RESPONSIVO
  // ==========================================================================
  const curriculumData = window.CURRICULUM_DATA;
  if (curriculumData && curriculumData.tracks) {
    const trackTabs = $$('.track-tab-btn');
    const summaryCard = $('#trackSummaryCard');
    const btnViewFlowchart = $('#btnViewFlowchart');
    const btnViewElectives = $('#btnViewElectives');
    const flowchartViewArea = $('#flowchartViewArea');
    const electivesViewArea = $('#electivesViewArea');
    const flowchartCategoryFilters = $('#flowchartCategoryFilters');
    const flowchartColumns = $('#flowchartColumns');
    const btnClearHighlight = $('#btnClearHighlight');
    const flowchartTip = $('#flowchartTip');

    const electivesSearchInput = $('#electivesSearchInput');
    const searchClearAction = $('#searchClearAction');
    const electivesGroupFilter = $('#electivesGroupFilter');
    const electivesSortSelect = $('#electivesSortSelect');
    const electivesCountDisplay = $('#electivesCountDisplay');
    const electivesGroupDesc = $('#electivesGroupDesc');
    const electivesCardsGrid = $('#electivesCardsGrid');

    const courseModal = $('#courseModal');
    const courseModalClose = $('#courseModalClose');
    const modalHeader = $('#modalHeader');
    const modalBody = $('#modalBody');

    let activeTrackId = 'analise-dados';
    let currentCategoryFilter = 'all';
    let activeCardSelected = null;

    let electivesSearchQuery = '';
    let electivesGroup = 'all';
    let electivesSort = 'code-asc';

    // Normalize text for search (case-insensitive & accent-insensitive)
    function normalizeStr(str) {
      return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    function getTrack(id) {
      return curriculumData.tracks.find((t) => t.id === id) || curriculumData.tracks[0];
    }

    // Render Track Summary Card
    function renderSummary(track) {
      if (!summaryCard) return;
      const req = track.requirements || {};
      const totalReq = req['Total'] || { credits: '126.0', hours: 2400 };
      const obgReq = req['Disciplinas Obrigatórias'] || { credits: '80.0', hours: 1350 };
      const restReq = req['Disc. Compl. Escolha Restrita'] || { credits: '36.0', hours: 600 };
      const livreReq = req['Disc. Compl. Livre Escolha'] || { credits: '8.0', hours: 120 };

      summaryCard.innerHTML = `
        <div class="track-summary-info">
          <div class="track-summary-badge-group">
            <span class="track-summary-badge mono">MATRIZ VIGENTE · ${track.version_curriculum || '2025/1 a 9999/9'}</span>
            <span class="track-code-badge mono">CÓD. SIGA: ${track.code_siga}</span>
          </div>
          <h3>${track.name}</h3>
          <p>${track.description}</p>
          <div class="track-ref-meta mono">
            <span><b>Código SIGA:</b> ${track.code_siga}</span>
            <span><b>Versão Curricular:</b> ${track.version_curriculum || '2025/1 a 9999/9'}</span>
            <span><b>Atualizado no SIGA em:</b> ${track.updated_at || '26/10/2026 18:18'}</span>
            <span><b>Aprovação:</b> ${track.approval || 'Processo 254757/2023-16 · CEG/CEPE'}</span>
          </div>
          <div class="track-summary-actions">
            <a class="btn btn-small btn-primary" href="${track.link_siga}" target="_blank" rel="noopener noreferrer">
              Acessar grade oficial no SIGA (Cód. ${track.code_siga}) <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div class="track-summary-stats">
          <div class="summary-stat-box highlight">
            <dt>Carga Horária Total</dt>
            <dd>2.400 <small>h</small></dd>
          </div>
          <div class="summary-stat-box">
            <dt>Duração Recomendada</dt>
            <dd>8 <small>semestres</small></dd>
          </div>
          <div class="summary-stat-box">
            <dt>Créditos Totais</dt>
            <dd>${totalReq.credits} <small>cr</small></dd>
          </div>
          <div class="summary-stat-box">
            <dt>Disciplinas Obrigatórias</dt>
            <dd>${obgReq.credits} <small>cr · ${obgReq.hours}h</small></dd>
          </div>
          <div class="summary-stat-box">
            <dt>Escolha Restrita (Eletivas)</dt>
            <dd>${restReq.credits} <small>cr · ${restReq.hours}h</small></dd>
          </div>
          <div class="summary-stat-box">
            <dt>Livre Escolha</dt>
            <dd>${livreReq.credits} <small>cr · ${livreReq.hours}h</small></dd>
          </div>
        </div>
      `;
    }

    // Render Flowchart Columns
    function renderFlowchart(track) {
      if (!flowchartColumns) return;
      clearHighlights();
      flowchartColumns.innerHTML = '';

      for (let p = 1; p <= 8; p++) {
        const periodStr = String(p);
        const disciplines = track.periods[periodStr] || [];

        let totalCredits = 0;
        let totalHours = 0;
        disciplines.forEach((d) => {
          totalCredits += Number(d.credits) || 0;
          totalHours += Number(d.ch_total) || 0;
        });

        const col = document.createElement('div');
        col.className = 'period-col';
        col.innerHTML = `
          <div class="period-col-header">
            <div class="period-col-title">
              <span>${p}º Período</span>
              <span class="period-badge-num">${totalCredits} cr</span>
            </div>
            <span class="period-col-stats">${totalHours}h totais no período</span>
          </div>
          <div class="period-col-cards"></div>
        `;

        const cardsContainer = col.querySelector('.period-col-cards');

        disciplines.forEach((d) => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'course-card';
          card.dataset.code = d.code;
          card.dataset.name = d.name;
          card.dataset.credits = d.credits;
          card.dataset.ch = d.ch_total;
          card.dataset.chT = d.ch_t;
          card.dataset.chP = d.ch_p;
          card.dataset.chExt = d.ch_ext;
          card.dataset.req = d.req || '';
          card.dataset.type = d.type;
          card.dataset.period = String(p);
          card.setAttribute('aria-label', `${d.code} - ${d.name}, ${d.credits} créditos`);

          let typeLabel = 'Obrigatória';
          let tagClass = 'tag-obrigatoria';
          if (d.type === 'optativa') {
            typeLabel = 'Optativa';
            tagClass = 'tag-optativa';
          } else if (d.type === 'livre') {
            typeLabel = 'Livre';
            tagClass = 'tag-livre';
          } else if (d.type === 'extensao') {
            typeLabel = 'Extensão';
            tagClass = 'tag-extensao';
          } else if (d.type === 'tcc') {
            typeLabel = 'TCC';
            tagClass = 'tag-tcc';
          }

          const reqHtml = d.req
            ? `<div class="card-req" title="Pré-requisitos: ${d.req}"><strong>Pré-req:</strong> <span>${d.req}</span></div>`
            : '';

          card.innerHTML = `
            <div class="card-top">
              <span class="card-code">${d.code}</span>
              <span class="card-type-tag ${tagClass}">${typeLabel}</span>
            </div>
            <strong class="card-title">${d.name}</strong>
            <div class="card-meta">
              <span>${d.credits} cr</span>
              <span>${d.ch_total}h</span>
            </div>
            ${reqHtml}
          `;

          // Click handling for prerequisite tracing
          card.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCardTrace(card);
          });

          // Double click or keyboard enter to open modal
          card.addEventListener('dblclick', () => {
            openCourseModal(d, track);
          });

          cardsContainer.appendChild(card);
        });

        flowchartColumns.appendChild(col);
      }

      applyCategoryFilter(currentCategoryFilter);
    }

    // Toggle card tracing
    function toggleCardTrace(card) {
      if (activeCardSelected === card) {
        clearHighlights();
        return;
      }
      clearHighlights();
      activeCardSelected = card;
      card.classList.add('is-selected');

      const cardCode = card.dataset.code;
      const cardReq = card.dataset.req || '';
      const allCards = $$('.course-card', flowchartColumns);

      // Extract prerequisite codes from cardReq (e.g. MAC118, FIT112)
      const reqCodes = (cardReq.match(/[A-Z0-9]{5,7}/g) || []).filter((c) => c !== cardCode);

      let prereqsCount = 0;
      let dependentsCount = 0;

      allCards.forEach((other) => {
        if (other === card) return;

        const otherCode = other.dataset.code;
        const otherReq = other.dataset.req || '';

        const isPrereq = reqCodes.includes(otherCode);
        const isDependent = otherReq.includes(cardCode) && cardCode !== 'OPTATIVA' && cardCode !== 'LIVRE';

        if (isPrereq) {
          other.classList.add('is-prereq');
          prereqsCount++;
        } else if (isDependent) {
          other.classList.add('is-dependent');
          dependentsCount++;
        } else {
          other.classList.add('is-dimmed');
        }
      });

      if (btnClearHighlight) btnClearHighlight.hidden = false;
      const tipText = flowchartTip?.querySelector('span');
      if (tipText) {
        tipText.textContent = `Destacando ${cardCode} (${card.dataset.name}): ${prereqsCount} pré-requisito(s) e ${dependentsCount} disciplina(s) liberada(s). Clique duas vezes para ficha completa.`;
      }
    }

    function clearHighlights() {
      activeCardSelected = null;
      $$('.course-card', flowchartColumns).forEach((c) => {
        c.classList.remove('is-selected', 'is-prereq', 'is-dependent', 'is-dimmed');
      });
      if (btnClearHighlight) btnClearHighlight.hidden = true;
      const tipText = flowchartTip?.querySelector('span');
      if (tipText) {
        tipText.textContent = 'Clique em qualquer matéria para rastrear pré-requisitos e dependências';
      }
    }

    btnClearHighlight?.addEventListener('click', clearHighlights);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && activeCardSelected) clearHighlights();
    });

    // Category filter for flowchart
    function applyCategoryFilter(cat) {
      currentCategoryFilter = cat;
      $$('#flowchartCategoryFilters .cat-chip').forEach((chip) => {
        chip.classList.toggle('is-active', chip.dataset.cat === cat);
      });

      const cards = $$('.course-card', flowchartColumns);
      cards.forEach((card) => {
        const type = card.dataset.type;
        let match = true;
        if (cat === 'obrigatoria') match = (type === 'obrigatoria');
        else if (cat === 'optativa') match = (type === 'optativa');
        else if (cat === 'livre') match = (type === 'livre');
        else if (cat === 'suplementar') match = (type === 'extensao' || type === 'tcc');
        card.classList.toggle('is-filtered-out', !match);
      });
    }

    $$('#flowchartCategoryFilters .cat-chip').forEach((chip) => {
      chip.addEventListener('click', () => applyCategoryFilter(chip.dataset.cat));
    });

    // Electives Catalog rendering & filtering
    function getAllElectives(track) {
      const list = [];
      const groups = track.electives || {};
      for (const [groupName, items] of Object.entries(groups)) {
        items.forEach((item) => {
          list.push({ ...item, group: groupName });
        });
      }
      return list;
    }

    function renderElectives() {
      if (!electivesCardsGrid) return;
      const track = getTrack(activeTrackId);
      const allElectives = getAllElectives(track);

      // Filter by group
      let filtered = allElectives.filter((item) => {
        if (electivesGroup === 'all') return true;
        return item.group === electivesGroup;
      });

      // Filter by search query
      if (electivesSearchQuery.trim()) {
        const queryNorm = normalizeStr(electivesSearchQuery);
        filtered = filtered.filter((item) => {
          const matchCode = normalizeStr(item.code).includes(queryNorm);
          const matchName = normalizeStr(item.name).includes(queryNorm);
          const matchReq = normalizeStr(item.req).includes(queryNorm);
          const matchGroup = normalizeStr(item.group).includes(queryNorm);
          return matchCode || matchName || matchReq || matchGroup;
        });
      }

      // Sort
      filtered.sort((a, b) => {
        if (electivesSort === 'code-asc') return a.code.localeCompare(b.code);
        if (electivesSort === 'name-asc') return a.name.localeCompare(b.name, 'pt-BR');
        if (electivesSort === 'credits-desc') return b.credits - a.credits;
        if (electivesSort === 'hours-desc') return b.ch_total - a.ch_total;
        return 0;
      });

      // Update counters
      if (electivesCountDisplay) {
        electivesCountDisplay.textContent = `Mostrando ${filtered.length} de ${allElectives.length} disciplinas`;
      }
      if (electivesGroupDesc) {
        const gInfo = curriculumData.group_info[electivesGroup];
        if (gInfo) {
          electivesGroupDesc.textContent = `${gInfo.title}: ${gInfo.description}`;
        } else {
          electivesGroupDesc.textContent = 'Exibindo todas as disciplinas eletivas dos 3 grupos formativos.';
        }
      }

      // Render cards
      electivesCardsGrid.innerHTML = '';
      if (!filtered.length) {
        electivesCardsGrid.innerHTML = `
          <div class="electives-empty-state">
            <h4>Nenhuma disciplina encontrada</h4>
            <p>Tente buscar por outro termo ou selecione outro grupo formativo.</p>
            <button class="btn btn-small btn-ghost" id="btnResetElectiveFilters" type="button">Limpar filtros de busca</button>
          </div>
        `;
        $('#btnResetElectiveFilters')?.addEventListener('click', () => {
          if (electivesSearchInput) electivesSearchInput.value = '';
          electivesSearchQuery = '';
          if (searchClearAction) searchClearAction.hidden = true;
          setElectivesGroup('all');
        });
        return;
      }

      filtered.forEach((d) => {
        const card = document.createElement('article');
        card.className = 'elective-item-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${d.code} - ${d.name}`);

        let badgeClass = 'badge-g1';
        if (d.group === 'Grupo 2') badgeClass = 'badge-g2';
        if (d.group === 'Grupo 3') badgeClass = 'badge-g3';

        const reqText = d.req ? d.req : '<span class="elective-none">Sem pré-requisitos cadastrados</span>';

        card.innerHTML = `
          <div class="elective-top">
            <span class="elective-code">${d.code}</span>
            <span class="elective-group-badge ${badgeClass}">${d.group}</span>
          </div>
          <h4 class="elective-name">${d.name}</h4>
          <div class="elective-metrics">
            <span><b>${d.credits}</b> créditos</span>
            <span><b>${d.ch_total}h</b> (T:${d.ch_t} · P:${d.ch_p} · Ext:${d.ch_ext})</span>
          </div>
          <div class="elective-req-pill">
            <strong>Pré-req:</strong>
            <span>${reqText}</span>
          </div>
        `;

        card.addEventListener('click', () => openCourseModal(d, track));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openCourseModal(d, track);
          }
        });

        electivesCardsGrid.appendChild(card);
      });
    }

    function setElectivesGroup(group) {
      electivesGroup = group;
      $$('#electivesGroupFilter .group-btn').forEach((btn) => {
        const active = btn.dataset.group === group;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-checked', String(active));
      });
      renderElectives();
    }

    // Electives search input
    electivesSearchInput?.addEventListener('input', () => {
      electivesSearchQuery = electivesSearchInput.value;
      if (searchClearAction) searchClearAction.hidden = !electivesSearchQuery;
      renderElectives();
    });

    searchClearAction?.addEventListener('click', () => {
      if (electivesSearchInput) electivesSearchInput.value = '';
      electivesSearchQuery = '';
      searchClearAction.hidden = true;
      electivesSearchInput?.focus();
      renderElectives();
    });

    $$('#electivesGroupFilter .group-btn').forEach((btn) => {
      btn.addEventListener('click', () => setElectivesGroup(btn.dataset.group));
    });

    electivesSortSelect?.addEventListener('change', () => {
      electivesSort = electivesSortSelect.value;
      renderElectives();
    });

    // View toggle (Flowchart vs Electives)
    function switchView(mode) {
      const isFlowchart = mode === 'flowchart';
      btnViewFlowchart?.classList.toggle('is-active', isFlowchart);
      btnViewFlowchart?.setAttribute('aria-pressed', String(isFlowchart));
      btnViewElectives?.classList.toggle('is-active', !isFlowchart);
      btnViewElectives?.setAttribute('aria-pressed', String(!isFlowchart));

      flowchartViewArea?.classList.toggle('is-hidden', !isFlowchart);
      electivesViewArea?.classList.toggle('is-hidden', isFlowchart);
      if (flowchartCategoryFilters) flowchartCategoryFilters.hidden = !isFlowchart;
    }

    btnViewFlowchart?.addEventListener('click', () => switchView('flowchart'));
    btnViewElectives?.addEventListener('click', () => switchView('electives'));

    // Course Detail Modal
    function openCourseModal(course, track) {
      if (!courseModal || !modalHeader || !modalBody) return;
      modalHeader.innerHTML = `
        <div class="modal-eyebrow">
          <span class="modal-code">${course.code}</span>
          <span class="card-type-tag tag-obrigatoria">${course.group || course.type || 'Disciplina'}</span>
        </div>
        <h3 id="modalCourseTitle">${course.name}</h3>
      `;

      const reqDesc = course.req
        ? `<p>${course.req}</p><small style="color:var(--faint);font-size:11px;display:block;margin-top:4px;">(P) = Pré-requisito estrito · (C) = Co-requisito</small>`
        : '<p style="color:var(--faint);font-style:italic;">Sem pré-requisitos cadastrados na distribuição curricular oficial.</p>';

      modalBody.innerHTML = `
        <div class="modal-stat-grid">
          <div><dt>Créditos</dt><dd>${course.credits} cr</dd></div>
          <div><dt>C.H. Total</dt><dd>${course.ch_total} h</dd></div>
          <div><dt>Classificação</dt><dd>${course.group ? 'Escolha Restrita' : 'Grade do Período'}</dd></div>
        </div>
        <div class="modal-hours-row">
          <span>Teórica: <strong>${course.ch_t}h</strong></span>
          <span>Prática: <strong>${course.ch_p}h</strong></span>
          <span>Extensão: <strong>${course.ch_ext}h</strong></span>
        </div>
        <div class="modal-detail-block">
          <strong>Condições & Pré-requisitos</strong>
          ${reqDesc}
        </div>
        <div class="modal-detail-block">
          <strong>Referência da Versão Curricular</strong>
          <p>${track.name} — Código SIGA: <code>${track.code_siga}</code> · Versão ${track.version_curriculum || '2025/1 a 9999/9'} (Atualizado em ${track.updated_at || '26/10/2026 às 18:18'})</p>
          <a class="modal-ref-link" href="${track.link_siga}" target="_blank" rel="noopener noreferrer">Acessar grade oficial no SIGA (Cód. ${track.code_siga}) ↗</a>
        </div>
      `;

      courseModal.showModal();
    }

    courseModalClose?.addEventListener('click', () => courseModal.close());
    courseModal?.addEventListener('click', (e) => {
      const rect = courseModal.getBoundingClientRect();
      const inDialog = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!inDialog) courseModal.close();
    });

    // Select Track function
    function selectTrack(trackId) {
      activeTrackId = trackId;
      trackTabs.forEach((tab) => {
        const active = tab.dataset.trackId === trackId;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });

      const track = getTrack(trackId);
      renderSummary(track);
      renderFlowchart(track);
      renderElectives();
    }

    trackTabs.forEach((tab) => {
      tab.addEventListener('click', () => selectTrack(tab.dataset.trackId));
    });

    // Listen to external jump links (e.g. data-track-target)
    $$('[data-track-target]').forEach((link) => {
      link.addEventListener('click', () => {
        const targetTrack = link.dataset.trackTarget;
        if (targetTrack) selectTrack(targetTrack);
      });
    });

    // Initialize with default track
    selectTrack('analise-dados');
  }
})();
