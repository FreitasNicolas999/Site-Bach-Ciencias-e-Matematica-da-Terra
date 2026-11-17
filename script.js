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
          let cardTypeClass = 'card-obrigatoria';

          if (d.type === 'optativa') {
            typeLabel = 'Optativa';
            tagClass = 'tag-optativa';
            cardTypeClass = 'card-optativa';
          } else if (d.type === 'livre') {
            typeLabel = 'Livre';
            tagClass = 'tag-livre';
            cardTypeClass = 'card-livre';
          } else if (d.type === 'extensao') {
            typeLabel = 'Extensão';
            tagClass = 'tag-extensao';
            cardTypeClass = 'card-extensao';
          } else if (d.type === 'tcc') {
            typeLabel = 'TCC';
            tagClass = 'tag-tcc';
            cardTypeClass = 'card-tcc';
          }

          card.className = `course-card ${cardTypeClass}`;

          const isOptativeSlot = (d.type === 'optativa' || d.type === 'livre' || d.code === 'OPTATIVA' || d.code === 'LIVRE');
          const cueLabel = (d.type === 'livre' || d.code === 'LIVRE') ? 'Ver regras de escolha' : 'Ver matérias do grupo';
          const actionCueHtml = isOptativeSlot
            ? `<div class="card-action-cue"><span>${cueLabel}</span> <b>↗</b></div>`
            : '';

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
            ${actionCueHtml}
          `;

          // Click handling: optatives open group modal immediately; others toggle trace
          card.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOptativeSlot) {
              openOptativesModal(d, track);
            } else {
              toggleCardTrace(card);
            }
          });

          // Double click to open course modal or optatives modal
          card.addEventListener('dblclick', () => {
            if (isOptativeSlot) {
              openOptativesModal(d, track);
            } else {
              openCourseModal(d, track);
            }
          });

          // Keyboard Enter or Space opens modal
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (isOptativeSlot) {
                openOptativesModal(d, track);
              } else {
                openCourseModal(d, track);
              }
            }
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

    // Modal de Optativas por Grupo Formativo
    function openOptativesModal(course, track) {
      if (!courseModal || !modalHeader || !modalBody) return;
      courseModal.classList.add('modal-wide');

      // Detect group key
      let groupKey = 'Grupo 1';
      if (course.name.includes('Grupo 2')) groupKey = 'Grupo 2';
      else if (course.name.includes('Grupo 3')) groupKey = 'Grupo 3';
      else if (course.type === 'livre' || course.code === 'LIVRE' || course.name.includes('Livre')) groupKey = 'Livre';

      if (groupKey === 'Livre') {
        modalHeader.innerHTML = `
          <div class="modal-eyebrow">
            <span class="modal-code">LIVRE ESCOLHA</span>
            <span class="card-type-tag tag-livre">UFRJ · Aberta</span>
          </div>
          <h3 id="modalCourseTitle">Atividades Acadêmicas de Livre Escolha</h3>
        `;

        modalBody.innerHTML = `
          <p class="modal-group-lead">
            As disciplinas de <strong>Livre Escolha</strong> conferem autonomia ao estudante para enriquecer sua formação interdisciplinar com disciplinas de qualquer centro ou curso da UFRJ, respeitado o teto institucional de 1/3 da carga horária fora do curso.
          </p>
          <div class="modal-detail-block">
            <strong>Opções e Recomendações Acadêmicas:</strong>
            <ul style="padding-left:18px;margin-top:8px;font-size:12.5px;color:var(--text);line-height:1.65;">
              <li><strong>Grupos Eletivos do BCMT:</strong> Disciplinas adicionais dos Grupos 1 (Ciências da Terra), 2 (Exatas & Computação) ou 3 (Oficinas e Práticas Integradas) além do mínimo obrigatório.</li>
              <li><strong>Instituto de Geociências (IGEO):</strong> Geologia Geral, Cartografia Digital, Sedimentologia, Sensoriamento Avançado.</li>
              <li><strong>Instituto de Matemática & DCC:</strong> Estruturas de Dados, Inteligência Artificial, Cálculo Numérico, Álgebra Linear Aplicada.</li>
              <li><strong>COPPE & Escola Politécnica:</strong> Engenharia Ambiental, Recursos Hídricos, Geotécnica.</li>
              <li><strong>Instituto de Biologia & Outros:</strong> Ecologia Geral, Conservação da Biodiversidade, Legislação Ambiental.</li>
            </ul>
          </div>
          <div class="modal-group-footer">
            <button class="btn btn-primary btn-small" id="btnModalExploreElectives" type="button">Explorar Catálogo de Eletivas do BCMT ↗</button>
            <button class="btn btn-ghost btn-small" id="btnModalCloseOptatives" type="button">Fechar Janela</button>
          </div>
        `;

        $('#btnModalExploreElectives', modalBody)?.addEventListener('click', () => {
          courseModal.close();
          switchView('electives');
          setElectivesGroup('all');
        });
        $('#btnModalCloseOptatives', modalBody)?.addEventListener('click', () => courseModal.close());
        courseModal.showModal();
        return;
      }

      const disciplines = (track.electives && track.electives[groupKey]) || [];
      const gInfo = (curriculumData.group_info && curriculumData.group_info[groupKey]) || {
        title: groupKey,
        description: 'Disciplinas formativas de escolha restrita da ênfase.'
      };

      modalHeader.innerHTML = `
        <div class="modal-eyebrow">
          <span class="modal-code">${groupKey.toUpperCase()}</span>
          <span class="card-type-tag tag-optativa">Escolha Restrita · ${disciplines.length} Matérias Disponíveis</span>
        </div>
        <h3 id="modalCourseTitle">${gInfo.title}</h3>
      `;

      modalBody.innerHTML = `
        <p class="modal-group-lead">${gInfo.description}</p>
        <div class="modal-search-wrap">
          <input type="search" class="modal-search-input" id="modalOptativesSearch" placeholder="Buscar por código, nome ou pré-requisito no ${groupKey}..." autocomplete="off">
          <span class="modal-count-indicator mono" id="modalOptativesCount">${disciplines.length} de ${disciplines.length} matérias</span>
        </div>
        <div class="modal-electives-list" id="modalOptativesList"></div>
        <div class="modal-group-footer">
          <button class="btn btn-primary btn-small" id="btnModalJumpToCatalog" type="button">Ver todas no Catálogo Completo ↗</button>
          <button class="btn btn-ghost btn-small" id="btnModalCloseGroup" type="button">Fechar Janela</button>
        </div>
      `;

      const listContainer = $('#modalOptativesList', modalBody);
      const countIndicator = $('#modalOptativesCount', modalBody);
      const searchInput = $('#modalOptativesSearch', modalBody);

      function renderModalList(items) {
        if (!listContainer) return;
        listContainer.innerHTML = '';
        if (!items.length) {
          listContainer.innerHTML = '<div style="grid-column:1/-1;padding:28px 16px;text-align:center;color:var(--muted);font-size:12.5px;background:rgba(255,255,255,.02);border-radius:12px;border:1px dashed var(--line);">Nenhuma disciplina encontrada com esse termo de busca.</div>';
          return;
        }
        items.forEach((item) => {
          const card = document.createElement('div');
          card.className = 'modal-elective-card';
          card.setAttribute('role', 'button');
          card.setAttribute('tabindex', '0');
          card.style.cursor = 'pointer';

          const reqSpan = item.req
            ? `<span class="modal-elective-req has-req" title="Pré-requisitos: ${item.req}">Req: ${item.req}</span>`
            : '<span class="modal-elective-req no-req">Sem pré-req</span>';

          card.innerHTML = `
            <div class="modal-elective-top">
              <span class="modal-elective-code mono">${item.code}</span>
              <span class="modal-elective-credits mono">${item.credits} cr · ${item.ch_total}h</span>
            </div>
            <strong class="modal-elective-name">${item.name}</strong>
            <div class="modal-elective-bottom">
              ${reqSpan}
              <span class="modal-elective-hours mono">T:${item.ch_t} P:${item.ch_p}</span>
            </div>
          `;

          card.addEventListener('click', () => {
            openCourseModal(item, track);
          });
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openCourseModal(item, track);
            }
          });

          listContainer.appendChild(card);
        });
      }

      renderModalList(disciplines);

      searchInput?.addEventListener('input', () => {
        const q = normalizeStr(searchInput.value);
        const filtered = disciplines.filter((d) => {
          return normalizeStr(d.code).includes(q) ||
                 normalizeStr(d.name).includes(q) ||
                 normalizeStr(d.req).includes(q);
        });
        if (countIndicator) {
          countIndicator.textContent = `${filtered.length} de ${disciplines.length} matérias`;
        }
        renderModalList(filtered);
      });

      $('#btnModalJumpToCatalog', modalBody)?.addEventListener('click', () => {
        courseModal.close();
        switchView('electives');
        setElectivesGroup(groupKey);
        $('#electivesViewArea')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      $('#btnModalCloseGroup', modalBody)?.addEventListener('click', () => courseModal.close());

      courseModal.showModal();
    }

    // Course Detail Modal
    function openCourseModal(course, track) {
      if (!courseModal || !modalHeader || !modalBody) return;
      courseModal.classList.remove('modal-wide');

      let tagClass = 'tag-obrigatoria';
      let tagLabel = 'Obrigatória';
      if (course.type === 'tcc') {
        tagClass = 'tag-tcc';
        tagLabel = 'Trabalho de Conclusão (TCC)';
      } else if (course.type === 'extensao') {
        tagClass = 'tag-extensao';
        tagLabel = 'Extensão Universitária';
      } else if (course.type === 'optativa') {
        tagClass = 'tag-optativa';
        tagLabel = `Optativa (${course.group || 'Eletiva'})`;
      } else if (course.type === 'livre') {
        tagClass = 'tag-livre';
        tagLabel = 'Livre Escolha';
      }

      modalHeader.innerHTML = `
        <div class="modal-eyebrow">
          <span class="modal-code">${course.code}</span>
          <span class="card-type-tag ${tagClass}">${tagLabel}</span>
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

    // Initialize with query param track or default track
    const urlParams = new URLSearchParams(window.location.search);
    const requestedTrack = urlParams.get('track');
    if (requestedTrack && curriculumData.tracks.some((t) => t.id === requestedTrack)) {
      selectTrack(requestedTrack);
    } else if (trackTabs.length > 0) {
      selectTrack('analise-dados');
    }
  }

  // ==========================================================================
  // MULTI-PAGE NAVIGATION ACTIVE HIGHLIGHT (GLOBAL)
  // ==========================================================================
  const pagePath = window.location.pathname.split('/').pop() || 'index.html';
  $$('#navLinks a:not(.nav-cta)').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === pagePath || (pagePath === '' && href === 'index.html')) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('is-active');
    } else {
      link.removeAttribute('aria-current');
      link.classList.remove('is-active');
    }
  });

  // ==========================================================================
  // PESQUISA GLOBAL NO PORTAL DO BCMT (SITE SEARCH)
  // ==========================================================================
  const searchModal = $('#siteSearchModal');
  const searchBtn = $('#siteSearchBtn');
  const searchInput = $('#siteSearchInput');
  const searchClear = $('#siteSearchClear');
  const searchClose = $('#siteSearchClose');
  const searchResults = $('#siteSearchResults');
  const searchCounter = $('#searchResultsCounter');
  const searchFilterChips = $$('#searchFilterChips .search-chip');

  if (searchModal && searchBtn && searchInput && searchResults) {
    let currentFilter = 'all';
    let focusedIndex = -1;

    const SITE_SEARCH_INDEX = [
      // --- O CURSO / GERAL ---
      {
        title: "O que é o BCMT & Proposta Interdisciplinar",
        category: "curso",
        categoryLabel: "Início & O Curso",
        badgeClass: "tag-curso",
        url: "index.html#proposta",
        snippet: "Graduação interdisciplinar que conecta matemática, computação, física, astronomia, meteorologia, geografia, geologia e ciências da Terra.",
        keywords: ["bcmt", "o que e", "sobre", "ciencias matematicas e da terra", "interdisciplinar", "ufrj", "ccmn", "astronomia", "meteorologia", "geografia", "geologia", "fisica", "matematica", "computacao"]
      },
      {
        title: "Formas de Ingresso na UFRJ (SiSU, Transferência e Acesso Graduação)",
        category: "curso",
        categoryLabel: "Início & O Curso",
        badgeClass: "tag-curso",
        url: "https://www.acessograduacao.ufrj.br/",
        snippet: "Ingresso anual pelo SiSU/Enem, editais de transferência externa, mudança de curso e vagas remanescentes da UFRJ.",
        keywords: ["como entrar", "sisu", "enem", "vestibular", "ingresso", "transferencia", "mudanca de curso", "isencao", "acesso graduacao"]
      },
      {
        title: "Histórico e Criação do BCMT na UFRJ",
        category: "curso",
        categoryLabel: "Início & O Curso",
        badgeClass: "tag-curso",
        url: "index.html#proposta",
        snippet: "Criação aprovada pelo Consuni em 2008, turmas iniciadas em 2009 e matriz reformulada em 2025/1 com quatro ênfases.",
        keywords: ["historia", "criacao", "consuni", "2008", "2009", "2025", "reformulacao", "matriz curricular"]
      },
      {
        title: "Evolução Regulatória & Entrave no MEC (Reforma de 2024)",
        category: "curso",
        categoryLabel: "Início & O Curso",
        badgeClass: "tag-curso",
        url: "index.html#historico-regulatorio",
        snippet: "Entenda por que o curso foi reestruturado pelo CEG em 2024: unificação de códigos avulsos, segurança para o diploma e inclusão de 10% de extensão.",
        keywords: ["regulatorio", "mec", "emec", "reforma 2024", "ceg", "portaria mec 770", "diploma", "extencao", "curricularizacao da extensao", "habilitações", "entraves", "historia"]
      },
      {
        title: "Grades Antigas do BCMT (Repositório SIGA 2013 e até 2024)",
        category: "grade",
        categoryLabel: "Grade & Matérias",
        badgeClass: "tag-grade",
        url: "fluxograma.html#grades-antigas",
        snippet: "Acesse as matrizes anteriores no SIGA: Sensoriamento Remoto (2013), Patrimônio Natural (2013), Tronco Comum (2013), Suporte à Decisão (2013) e Matriz até 2024.",
        keywords: ["grades antigas", "grade antiga", "grade 2013", "matriz 2013", "matrizes antigas", "matriz antiga", "historico de matrizes", "siga", "suporte a decisao", "codigo 87a624e1", "equivalencia"]
      },
      {
        title: "Portal do Curso & Navegação por Páginas",
        category: "curso",
        categoryLabel: "Início & O Curso",
        badgeClass: "tag-curso",
        url: "index.html#explore",
        snippet: "Central de navegação com acesso às 4 ênfases, grade curricular com fluxograma, oportunidades acadêmicas e secretaria.",
        keywords: ["portal", "navegacao", "atalhos", "secoes", "paginas", "hub"]
      },
      {
        title: "CCMN — Centro de Ciências Matemáticas e da Natureza",
        category: "curso",
        categoryLabel: "Início & O Curso",
        badgeClass: "tag-curso",
        url: "https://ccmn.ufrj.br/",
        snippet: "Centro universitário da UFRJ no Fundão que abriga o BCMT, Instituto de Matemática, Física, Geociências e Observatório do Valongo.",
        keywords: ["ccmn", "centro de ciencias matematicas e da natureza", "bloco d", "bloco f", "fundao", "unidades"]
      },
      {
        title: "UFRJ — Universidade Federal do Rio de Janeiro",
        category: "curso",
        categoryLabel: "Início & O Curso",
        badgeClass: "tag-curso",
        url: "https://ufrj.br/",
        snippet: "Portal oficial da universidade com notícias, editais acadêmicos, calendário de graduação e serviços institucionais.",
        keywords: ["ufrj", "universidade federal do rio de janeiro", "portal ufrj", "calendario oficial"]
      },

      // --- AS 4 ÊNFASES ---
      {
        title: "As Quatro Ênfases Formativas do BCMT",
        category: "enfases",
        categoryLabel: "Ênfases",
        badgeClass: "tag-enfases",
        url: "enfases.html#enfases",
        snippet: "Conheça os percursos formativos que você escolhe a partir do 5º período: CMT Puro, Análise de Dados, Sensoriamento e Patrimônio.",
        keywords: ["enfases", "percursos", "formacoes", "habilitacoes", "trajetorias", "quatro enfases"]
      },
      {
        title: "Ênfase em CMT — Puro (Formação Geral)",
        category: "enfases",
        categoryLabel: "Ênfases",
        badgeClass: "tag-enfases",
        url: "enfases.html#detalhes",
        snippet: "Percurso generalista que preserva ampla liberdade científica e flexibilidade entre matemática, física, computação e ciências da Terra.",
        keywords: ["cmt puro", "puro", "enfase pura", "formacao geral", "liberdade curricular", "interdisciplinar"]
      },
      {
        title: "Ênfase em Análise de Dados",
        category: "enfases",
        categoryLabel: "Ênfases",
        badgeClass: "tag-enfases",
        url: "enfases.html#detalhes",
        snippet: "Formação em ciência de dados, programação, estruturas de dados, modelagem matemática, inteligência artificial e estatística.",
        keywords: ["analise de dados", "dados", "data science", "programacao", "python", "estatistica", "machine learning", "ia", "inteligencia artificial", "computacao"]
      },
      {
        title: "Ênfase em Sensoriamento Remoto & Geoprocessamento",
        category: "enfases",
        categoryLabel: "Ênfases",
        badgeClass: "tag-enfases",
        url: "enfases.html#detalhes",
        snippet: "Dados espaciais, imagens orbitais de satélite, SIG (Sistemas de Informações Geográficas) e análise territorial.",
        keywords: ["sensoriamento remoto", "geoprocessamento", "sig", "gis", "satelite", "imagens orbitais", "drones", "dados espaciais", "cartografia"]
      },
      {
        title: "Ênfase em Patrimônio Natural",
        category: "enfases",
        categoryLabel: "Ênfases",
        badgeClass: "tag-enfases",
        url: "enfases.html#detalhes",
        snippet: "Geodiversidade, valorização e conservação da memória geológica, geoparques, meio físico e sustentabilidade ambiental.",
        keywords: ["patrimonio natural", "geodiversidade", "geoconservacao", "geoparques", "geologia", "meio ambiente", "sustentabilidade"]
      },
      {
        title: "Simulador de Afinidade por Ênfase (Pathfinder)",
        category: "enfases",
        categoryLabel: "Ênfases",
        badgeClass: "tag-enfases",
        url: "enfases.html#afinidade",
        snippet: "Teste interativo que recomenda qual das 4 ênfases mais combina com você a partir dos seus temas de maior interesse.",
        keywords: ["simulador", "afinidade", "pathfinder", "teste", "qual enfase escolher", "interesses", "recomendacao"]
      },

      // --- GRADE, FLUXOGRAMA & MATÉRIAS ---
      {
        title: "Fluxograma Interativo dos 8 Períodos (Matriz 2025/1)",
        category: "grade",
        categoryLabel: "Grade & Matérias",
        badgeClass: "tag-grade",
        url: "fluxograma.html#fluxograma",
        snippet: "Visualização interativa das disciplinas período a período, requisitos encadeados e dependências liberadas ao clicar.",
        keywords: ["fluxograma", "grade", "grade curricular", "periodos", "materias", "disciplinas", "pre-requisitos", "dependencias", "matriz 2025"]
      },
      {
        title: "Disciplinas Obrigatórias do Núcleo Comum",
        category: "grade",
        categoryLabel: "Grade & Matérias",
        badgeClass: "tag-grade",
        url: "fluxograma.html#fluxograma",
        snippet: "Cálculo I, II, III e IV, Álgebra Linear, Física I e II, Introdução à Computação, Estatística, Mecânica e Geologia Geral.",
        keywords: ["obrigatorias", "calculo", "calculo 1", "calculo 2", "calculo 3", "calculo 4", "algebra linear", "fisica", "computacao", "geologia", "estatistica", "mecanica"]
      },
      {
        title: "Disciplinas Optativas / Escolha Restrita por Grupo (A a K)",
        category: "grade",
        categoryLabel: "Grade & Matérias",
        badgeClass: "tag-grade",
        url: "fluxograma.html#fluxograma",
        snippet: "Modal interativo no fluxograma com as matérias disponíveis para cursar em cada grupo de escolha restrita das ênfases.",
        keywords: ["optativas", "escolha restrita", "grupo a", "grupo b", "grupo c", "grupo d", "grupo e", "modal optativas", "creditos"]
      },
      {
        title: "Catálogo Completo de Disciplinas Eletivas da UFRJ",
        category: "grade",
        categoryLabel: "Grade & Matérias",
        badgeClass: "tag-grade",
        url: "fluxograma.html#electivesViewArea",
        snippet: "Pesquise por nome, código ou departamento em toda a base de matérias eletivas do BCMT oferecidas na universidade.",
        keywords: ["catalogo", "eletivas", "busca de materias", "busca disciplinas", "todas as materias", "departamentos"]
      },
      {
        title: "Atividades de Livre Escolha (8 Créditos Abertos)",
        category: "grade",
        categoryLabel: "Grade & Matérias",
        badgeClass: "tag-grade",
        url: "fluxograma.html#fluxograma",
        snippet: "8 créditos que você pode cursar livremente em qualquer curso, faculdade ou instituto da UFRJ.",
        keywords: ["livre escolha", "creditos livres", "aberta ufrj", "disciplinas externas", "outros cursos"]
      },
      {
        title: "Trabalho de Conclusão de Curso (TCC I e TCC II)",
        category: "grade",
        categoryLabel: "Grade & Matérias",
        badgeClass: "tag-grade",
        url: "fluxograma.html#fluxograma",
        snippet: "Monografia ou projeto prático no 7º e 8º períodos sob orientação de um docente, avaliado por banca examinadora.",
        keywords: ["tcc", "tcc 1", "tcc 2", "trabalho de conclusao", "monografia", "orientador", "defesa", "banca", "formatura", "conclusao"]
      },
      {
        title: "Extensão Curricular (ACEX — 240 Horas Obrigatórias)",
        category: "grade",
        categoryLabel: "Grade & Matérias",
        badgeClass: "tag-grade",
        url: "fluxograma.html#fluxograma",
        snippet: "Carga horária de extensão universitária cumprida em projetos, programas, cursos e ações com a sociedade.",
        keywords: ["extensao", "acex", "horas de extensao", "240 horas", "curricularizacao da extensao", "projetos"]
      },
      {
        title: "Guia Oficial de Inscrição em Disciplinas no SIGA (portal.ufrj.br)",
        category: "grade",
        categoryLabel: "Grade & Matérias",
        badgeClass: "tag-grade",
        url: "vida-academica.html#inscricoes",
        snippet: "Como funciona a matrícula no SIGA pelo Portal do Aluno, critérios de prioridade (CCR, período ideal, reprovação) e prazos.",
        keywords: ["siga", "inscricao em disciplinas", "portal do aluno", "matricula", "portal.ufrj.br", "criterios de prioridade", "trancamento de turma", "ccr", "reprovacao"]
      },

      // --- VIDA ACADÊMICA & COTIDIANO FUNDÃO ---
      {
        title: "Guia do Calouro & Primeiro Período",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#alunos",
        snippet: "Matrícula automática de calouros, semana de acolhimento e dicas fundamentais para os primeiros meses na UFRJ.",
        keywords: ["calouro", "calouros", "primeiro periodo", "guia do calouro", "ingressantes", "boas vindas", "semana de acolhimento"]
      },
      {
        title: "Restaurantes Universitários (RU / Bandejão do Fundão)",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#campus-essentials",
        snippet: "Bandejão Central, Letras e CT. Almoço, jantar e desjejum com alimentação balanceada a preço subsidiado para alunos.",
        keywords: ["ru", "bandejao", "restaurante universitario", "almoco", "jantar", "refeicao", "comida fundao", "saldo ru", "cardapio"]
      },
      {
        title: "Transporte Intercampi Gratuito & Ônibus Interno",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#campus-essentials",
        snippet: "Ônibus gratuitos da UFRJ entre o Fundão, Praia Vermelha, Nova América / Del Castilho e linhas circulares internas.",
        keywords: ["intercampi", "onibus gratuito", "transporte", "onibus ufrj", "integracao metro", "del castilho", "nova america", "praia vermelha", "fundao"]
      },
      {
        title: "Intranet UFRJ, E-mail @ufrj.br & Wi-Fi Eduroam",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#alunos",
        snippet: "Passaporte institucional, rede Wi-Fi mundial Eduroam nos prédios da universidade e ativação de e-mail institucional.",
        keywords: ["intranet", "eduroam", "wifi", "wi-fi", "email institucional", "email ufrj", "passaporte", "login ufrj"]
      },
      {
        title: "Bolsas de Pesquisa & Iniciação Científica (PIBIC)",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#oportunidades",
        snippet: "Oportunidades em laboratórios da UFRJ com bolsas do CNPq e FAPERJ desde os períodos iniciais.",
        keywords: ["pibic", "pibiti", "iniciacao cientifica", "bolsa de pesquisa", "cnpq", "faperj", "laboratorios", "pesquisa"]
      },
      {
        title: "Bolsas de Extensão & Cultura (PIBIAC / PR-5)",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#oportunidades",
        snippet: "Projetos de extensão universitária com concessão de bolsas de incentivo pela Pró-Reitoria de Extensão.",
        keywords: ["pibiac", "bolsa extensao", "pr5", "cultura", "comunidade"]
      },
      {
        title: "Programa Institucional de Monitoria da UFRJ",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#oportunidades",
        snippet: "Atuação didática junto aos professores e auxílio aos estudantes em matérias do núcleo comum.",
        keywords: ["monitoria", "monitor", "bolsa monitoria", "docencia", "ajuda em calculo"]
      },
      {
        title: "Estágios & Convênios Oficiais da UFRJ (PR-1)",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#oportunidades",
        snippet: "Lista oficial de empresas conveniadas na PR-1 e formalização de termos de compromisso de estágio curricular.",
        keywords: ["estagio", "estagios", "convenios", "pr1", "termo de compromisso", "empresa", "estagio remunerado", "carreira"]
      },
      {
        title: "Assistência Estudantil, Auxílios e Permanência (PR-7)",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#oportunidades",
        snippet: "Bolsas de permanência da PR-7: auxílio alimentação, transporte, moradia universitária, material didático e inclusão digital.",
        keywords: ["pr7", "assistencia estudantil", "auxilio transporte", "auxilio moradia", "bolsa permanencia", "alojamento", "inclusao digital"]
      },
      {
        title: "Mobilidade Internacional e Intercâmbio (SGRI)",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#oportunidades",
        snippet: "Acordos com universidades internacionais parceiras e aproveitamento curricular das disciplinas cursadas fora.",
        keywords: ["intercambio", "mobilidade internacional", "sgri", "estudar fora", "universidades parceiras"]
      },
      {
        title: "Bibliotecas UFRJ (SiBI) & Base Minerva",
        category: "vida",
        categoryLabel: "Vida no Fundão",
        badgeClass: "tag-vida",
        url: "vida-academica.html#alunos",
        snippet: "Acervo bibliográfico no Fundão, empréstimos entre bibliotecas e consulta remota aos periódicos CAPES via CAFe.",
        keywords: ["biblioteca", "base minerva", "sibi", "livros", "periodicos", "capes", "cafe", "acervo"]
      },

      // --- FAQ & ATENDIMENTO ---
      {
        title: "Secretaria de Graduação do BCMT (Canal Oficial)",
        category: "faq",
        categoryLabel: "FAQ & Secretaria",
        badgeClass: "tag-faq",
        url: "faq.html#comissao",
        snippet: "Atendimento discente oficial: secgradbcmt@ccmn.ufrj.br no CCMN. Emissão de certidões, processos de matrícula e suporte discente.",
        keywords: ["secretaria", "secgrad", "secgradbcmt@ccmn.ufrj.br", "atendimento", "contato oficial", "certidao", "processos", "historico"]
      },
      {
        title: "Comissão do Curso do BCMT (@bcmt_ufrj)",
        category: "faq",
        categoryLabel: "FAQ & Secretaria",
        badgeClass: "tag-faq",
        url: "faq.html#comissao",
        snippet: "Representação discente do curso no Instagram oficial @bcmt_ufrj, X, TikTok e e-mail da comissão.",
        keywords: ["comissao", "comissao bcmt", "instagram", "@bcmt_ufrj", "representacao", "estudantes", "alunos"]
      },
      {
        title: "Perguntas Frequentes (FAQ do Curso)",
        category: "faq",
        categoryLabel: "FAQ & Secretaria",
        badgeClass: "tag-faq",
        url: "faq.html#faq",
        snippet: "Respostas diretas sobre trancamento de matrícula, prazo de integralização, cálculo do CR e colação de grau.",
        keywords: ["faq", "duvidas", "cr", "coeficiente de rendimento", "trancamento", "prazo maximo", "integralizacao", "colacao de grau"]
      }
    ];

    function normalize(str) {
      return (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    }

    function openSearch() {
      searchModal.showModal();
      document.body.style.overflow = 'hidden';
      searchInput.value = '';
      searchClear.style.display = 'none';
      currentFilter = 'all';
      updateFilterChips();
      renderDefaultState();
      setTimeout(() => searchInput.focus(), 50);
    }

    function closeSearch() {
      searchModal.close();
      document.body.style.overflow = '';
      focusedIndex = -1;
    }

    function updateFilterChips() {
      searchFilterChips.forEach((chip) => {
        chip.classList.toggle('is-active', chip.dataset.filter === currentFilter);
      });
    }

    function highlightMatch(text, query) {
      if (!query || !text) return text;
      const terms = query.split(/\s+/).filter(Boolean);
      if (!terms.length) return text;
      const regex = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
      return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    function renderDefaultState() {
      focusedIndex = -1;
      searchCounter.textContent = 'Busca rápida do portal';
      searchResults.innerHTML = `
        <div class="search-empty-state">
          <div class="search-empty-icon">🔍</div>
          <div class="search-empty-title">O que você gostaria de encontrar?</div>
          <p class="search-empty-text">Digite palavras-chave como matérias, ênfases, RU, bolsas, estágio ou regras da UFRJ, ou escolha uma das sugestões abaixo:</p>
          <div class="search-quick-suggestions">
            <button type="button" class="search-suggestion-btn" data-query="Análise de Dados">Análise de Dados</button>
            <button type="button" class="search-suggestion-btn" data-query="Fluxograma">Fluxograma</button>
            <button type="button" class="search-suggestion-btn" data-query="Bandejão RU">Bandejão (RU)</button>
            <button type="button" class="search-suggestion-btn" data-query="Estágios">Estágios PR-1</button>
            <button type="button" class="search-suggestion-btn" data-query="Inscrição SIGA">Inscrição SIGA</button>
            <button type="button" class="search-suggestion-btn" data-query="TCC">TCC</button>
            <button type="button" class="search-suggestion-btn" data-query="Secretaria">Secretaria BCMT</button>
            <button type="button" class="search-suggestion-btn" data-query="Simulador">Simulador de Afinidade</button>
          </div>
        </div>
      `;

      $$('.search-suggestion-btn', searchResults).forEach((btn) => {
        btn.addEventListener('click', () => {
          searchInput.value = btn.dataset.query;
          searchClear.style.display = 'grid';
          performSearch();
          searchInput.focus();
        });
      });
    }

    function performSearch() {
      const query = normalize(searchInput.value);
      if (!query) {
        renderDefaultState();
        return;
      }

      const queryTokens = query.split(/\s+/).filter(Boolean);

      const filtered = SITE_SEARCH_INDEX.filter((item) => {
        if (currentFilter !== 'all' && item.category !== currentFilter) {
          return false;
        }

        const normTitle = normalize(item.title);
        const normSnippet = normalize(item.snippet);
        const normCat = normalize(item.categoryLabel);
        const normKeywords = item.keywords.map(normalize);

        const titleWords = normTitle.match(/\b\w+\b/g) || [];
        const snippetWords = normSnippet.match(/\b\w+\b/g) || [];

        return queryTokens.every((token) => {
          if (token.length <= 3) {
            return (
              titleWords.includes(token) ||
              snippetWords.includes(token) ||
              normKeywords.some((kw) => kw === token || (kw.match(/\b\w+\b/g) || []).includes(token))
            );
          }
          return (
            normTitle.includes(token) ||
            normSnippet.includes(token) ||
            normCat.includes(token) ||
            normKeywords.some((kw) => kw.includes(token))
          );
        });
      });

      filtered.sort((a, b) => {
        const score = (item) => {
          const normTitle = normalize(item.title);
          const normSnippet = normalize(item.snippet);
          const normKws = item.keywords.map(normalize);
          const titleWords = normTitle.match(/\b\w+\b/g) || [];
          const snippetWords = normSnippet.match(/\b\w+\b/g) || [];

          let s = 0;
          if (normTitle === query) s += 400;
          else if (normTitle.startsWith(query)) s += 200;
          else if (normTitle.includes(query)) s += 120;

          queryTokens.forEach((t) => {
            if (titleWords.includes(t)) s += 100;
            else if (titleWords.some((w) => w.startsWith(t))) s += 60;
            else if (t.length > 3 && normTitle.includes(t)) s += 25;

            normKws.forEach((kw) => {
              const kwWords = kw.match(/\b\w+\b/g) || [];
              if (kw === t) s += 90;
              else if (kwWords.includes(t)) s += 70;
              else if (kwWords.some((w) => w.startsWith(t))) s += 40;
              else if (t.length > 3 && kw.includes(t)) s += 15;
            });

            if (snippetWords.includes(t)) s += 30;
            else if (t.length > 3 && normSnippet.includes(t)) s += 10;
          });
          return s;
        };
        return score(b) - score(a);
      });

      focusedIndex = -1;
      searchCounter.textContent = `${filtered.length} ${filtered.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;

      if (filtered.length === 0) {
        searchResults.innerHTML = `
          <div class="search-empty-state">
            <div class="search-empty-icon">🔎</div>
            <div class="search-empty-title">Nenhum resultado para "${searchInput.value}"</div>
            <p class="search-empty-text">Tente termos mais amplos como <em>cálculo</em>, <em>matrícula</em>, <em>ênfases</em>, <em>RU</em> ou escolha uma das categorias no topo.</p>
          </div>
        `;
        return;
      }

      searchResults.innerHTML = filtered.map((item, idx) => `
        <a class="search-result-card" href="${item.url}" data-index="${idx}" role="option">
          <div class="search-result-card-top">
            <span class="search-result-badge ${item.badgeClass}">${item.categoryLabel}</span>
            <span class="search-result-arrow" aria-hidden="true">Ir para a seção →</span>
          </div>
          <h4 class="search-result-title">${highlightMatch(item.title, searchInput.value)}</h4>
          <p class="search-result-snippet">${highlightMatch(item.snippet, searchInput.value)}</p>
        </a>
      `).join('');

      $$('.search-result-card', searchResults).forEach((card) => {
        card.addEventListener('click', (e) => {
          const href = card.getAttribute('href');
          handleNavigation(href, e);
        });
      });
    }

    function handleNavigation(href, e) {
      if (!href) return;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        if (e) e.preventDefault();
        closeSearch();
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }

      const rawPath = window.location.pathname.split('/').pop() || 'index.html';
      const currentPage = rawPath.toLowerCase().replace(/\.html$/, '') || 'index';
      const [targetPageRaw, targetHash] = href.split('#');
      const targetPage = (targetPageRaw || rawPath).toLowerCase().replace(/\.html$/, '');

      if (targetPage === currentPage && targetHash) {
        if (e) e.preventDefault();
        closeSearch();
        const targetEl = document.getElementById(targetHash);
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            targetEl.classList.add('target-highlight');
            setTimeout(() => targetEl.classList.remove('target-highlight'), 2600);
          }, 80);
          history.pushState(null, '', `#${targetHash}`);
        }
      } else {
        closeSearch();
        window.location.href = href;
      }
    }

    function updateResultFocus() {
      const cards = $$('.search-result-card', searchResults);
      cards.forEach((card, idx) => {
        const isFoc = idx === focusedIndex;
        card.classList.toggle('is-focused', isFoc);
        if (isFoc) card.scrollIntoView({ block: 'nearest' });
      });
    }

    searchBtn.addEventListener('click', openSearch);
    searchClose.addEventListener('click', closeSearch);

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });

    searchInput.addEventListener('input', () => {
      searchClear.style.display = searchInput.value ? 'grid' : 'none';
      performSearch();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cards = $$('.search-result-card', searchResults);
        const targetIndex = focusedIndex >= 0 ? focusedIndex : 0;
        if (cards[targetIndex]) {
          cards[targetIndex].click();
        }
      }
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      performSearch();
      searchInput.focus();
    });

    searchFilterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        currentFilter = chip.dataset.filter;
        updateFilterChips();
        performSearch();
      });
    });

    // Keyboard shortcuts: Ctrl+K / Cmd+K / '/'
    document.addEventListener('keydown', (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchModal.open) closeSearch();
        else openSearch();
      } else if (e.key === '/' && !isInput && !searchModal.open) {
        e.preventDefault();
        openSearch();
      } else if (searchModal.open) {
        const cards = $$('.search-result-card', searchResults);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (cards.length > 0) {
            focusedIndex = (focusedIndex + 1) % cards.length;
            updateResultFocus();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (cards.length > 0) {
            focusedIndex = (focusedIndex - 1 + cards.length) % cards.length;
            updateResultFocus();
          }
        } else if (e.key === 'Enter') {
          const cards = $$('.search-result-card', searchResults);
          const targetIndex = focusedIndex >= 0 ? focusedIndex : 0;
          if (cards[targetIndex]) {
            e.preventDefault();
            cards[targetIndex].click();
          }
        }
      }
    });

    // Hash deep-linking on page load with smooth scroll and highlight
    function handleHashOnLoad() {
      if (!window.location.hash) return;
      const hashId = window.location.hash.substring(1);
      const el = document.getElementById(hashId);
      if (!el) return;

      const performScroll = () => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('target-highlight');
        setTimeout(() => el.classList.remove('target-highlight'), 2600);
      };

      // Double run after flowchart injection and fonts settle
      setTimeout(performScroll, 200);
      setTimeout(performScroll, 600);
    }

    if (document.readyState === 'complete') {
      handleHashOnLoad();
    } else {
      window.addEventListener('load', handleHashOnLoad);
    }
  }
})();
