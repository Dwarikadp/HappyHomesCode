/* Happy Homes, Trisulia
   Preloader + Hero form + Modal (25s auto popup) + Site visit + Video call
   + Carousel + Plan toggles + Amenity toggles + EMI + Lightbox + Right rail */
(() => {
  'use strict';

  const CONFIG = {
    WHATSAPP_NUMBER: '919777999724',
    SHEETS_ENDPOINT: 'https://script.google.com/macros/s/AKfycbwJXkS-O94Lue6mvOyMODbh3MPHWWDFCggBh-3-1FWIs9qeQYJNjW7jVdGN6SiixAsc/exec',
    ENQUIRY_CONVERSION_LABEL: 'AW-XXXXXXXXX/REPLACE_WITH_LABEL',
    BROCHURE_URL: 'assets/brochure.pdf',
    AUTO_POPUP_FIRST_MS: 45000,
    AUTO_POPUP_REPEAT_MS: 45000
  };

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const prm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ========== PRELOADER ========== */
  const preloader = $('#preloader');
  const preCount = $('#preCount');
  const preLogoFill = $('#preLogoFill');
  const preBar = $('#preBar');

  function setPreloader(n) {
    if (preCount) preCount.textContent = n;
    if (preLogoFill) preLogoFill.style.clipPath = 'inset(' + (100 - n) + '% 0 0 0)';
    if (preBar) preBar.style.width = n + '%';
  }
  function runPreloader() {
    if (!preloader || !preCount) { bootAfterLoad(); return; }
    let n = 0;
    setPreloader(n);
    const tick = () => {
      n += Math.max(1, Math.floor((100 - n) / 9));
      if (n >= 100) {
        n = 100; setPreloader(n);
        setTimeout(() => {
          preloader.classList.add('is-done');
          bootAfterLoad();
        }, 360);
        return;
      }
      setPreloader(n);
      setTimeout(tick, 50 + Math.random() * 40);
    };
    setTimeout(tick, 200);
  }
  runPreloader();

  /* ========== NAV + RAIL scroll ========== */
  const nav = $('#nav');
  const rail = document.querySelector('.rail');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
    if (rail) rail.classList.toggle('is-visible', window.scrollY > 200);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ========== Mobile toggle ========== */
  const navToggle = $('#navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('is-menu-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav__menu a').forEach(a => a.addEventListener('click', () => {
      document.body.classList.remove('is-menu-open');
      navToggle.classList.remove('is-open');
    }));
  }

  /* ========== Smooth anchor scroll ========== */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 64, behavior: prm ? 'auto' : 'smooth' });
  });

  /* ========== MODALS (3 of them) ========== */
  const modal = $('#modal');
  const siteVisitModal = $('#siteVisitModal');
  const videoCallModal = $('#videoCallModal');
  const modalForm = $('#enquiryForm');
  const modalSuccess = $('#modalSuccess');

  let leadSubmitted = false;
  let autoPopupTimeout = null;
  let autoPopupInterval = null;

  function openModal(prefill) {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.classList.add('is-locked');
    if (modalForm) { modalForm.hidden = false; modalForm.style.display = ''; }
    if (modalSuccess) modalSuccess.hidden = true;
    const pf = $('#m-page'); if (pf) pf.value = location.href || '';
    const mf = $('#m-message');
    if (prefill && mf) {
      const opt = Array.from(mf.options).find(o => o.value.toLowerCase().indexOf(prefill.toLowerCase()) >= 0);
      if (opt) mf.value = opt.value;
      modalForm.dataset.plan = prefill;
    } else if (modalForm) {
      modalForm.dataset.plan = '';
    }
    setTimeout(() => { const n = $('#m-name'); if (n) n.focus(); }, 250);
  }
  function openSiteVisit() {
    if (!siteVisitModal) return;
    siteVisitModal.classList.add('is-open');
    document.body.classList.add('is-locked');
    setTimeout(() => { const n = $('#sv-name'); if (n) n.focus(); }, 250);
  }
  function openVideoCall() {
    if (!videoCallModal) return;
    videoCallModal.classList.add('is-open');
    document.body.classList.add('is-locked');
    setTimeout(() => { const n = $('#vc-name'); if (n) n.focus(); }, 250);
  }
  function closeAllModals() {
    [modal, siteVisitModal, videoCallModal, document.getElementById('projectsModal')].forEach(m => { if (m) m.classList.remove('is-open'); });
    document.body.classList.remove('is-locked');
  }
  function isAnyModalOpen() {
    return [modal, siteVisitModal, videoCallModal, document.getElementById('projectsModal')].some(m => m && m.classList.contains('is-open'));
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-modal]'))   { e.preventDefault(); openModal(e.target.closest('[data-open-modal]').dataset.prefill); return; }
    if (e.target.closest('[data-open-sitevisit]')) { e.preventDefault(); openSiteVisit(); return; }
    if (e.target.closest('[data-open-video]'))   { e.preventDefault(); openVideoCall(); return; }
    if (e.target.closest('[data-close-modal]'))  { e.preventDefault(); closeAllModals(); return; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAllModals(); closeLightbox(); } });

  /* ========== AUTO POPUP — DISABLED (user opt-out) ========== */
  function scheduleAutoPopup() { /* intentionally disabled */ }
  function bootAfterLoad() { /* no popup scheduling */ }

  /* ========== Submit helpers ========== */
  // Encode object as URL-encoded for Netlify Forms
  function encodeForNetlify(data) {
    return Object.keys(data)
      .filter(k => data[k] !== undefined && data[k] !== null && data[k] !== '')
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
      .join('&');
  }
  async function submitLead(payload, formNetlifyName) {
    // 1) Submit to Netlify Forms (primary capture)
    if (formNetlifyName) {
      try {
        const body = encodeForNetlify(Object.assign({ 'form-name': formNetlifyName }, payload));
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body
        });
      } catch (err) { console.warn('Netlify Forms POST failed:', err); }
    }
    // 2) Google Sheets via Apps Script
    try {
      if (CONFIG.SHEETS_ENDPOINT && CONFIG.SHEETS_ENDPOINT.indexOf('http') === 0) {
        const sheetPayload = Object.assign({ 'form-name': formNetlifyName || '' }, payload);
        await fetch(CONFIG.SHEETS_ENDPOINT, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(sheetPayload)
        });
      }
    } catch (err) { console.warn('Sheet POST failed:', err); }
    // 3) Google Ads conversion (optional)
    try {
      if (typeof window.gtag === 'function' && CONFIG.ENQUIRY_CONVERSION_LABEL && CONFIG.ENQUIRY_CONVERSION_LABEL.indexOf('REPLACE_WITH_LABEL') === -1) {
        window.gtag('event', 'conversion', { send_to: CONFIG.ENQUIRY_CONVERSION_LABEL });
      }
    } catch (_) {}
  }
  function buildWA(payload, hint) {
    const lines = ['Hi, I am interested in Happy Homes, Trisulia.', ''];
    if (payload.name)     lines.push('*Name:* ' + payload.name);
    if (payload.phone)    lines.push('*Phone:* ' + payload.phone);
    if (payload.email)    lines.push('*Email:* ' + payload.email);
    if (payload.budget)   lines.push('*Budget:* ' + payload.budget);
    if (payload.timeline) lines.push('*Timeline:* ' + payload.timeline);
    if (payload.config)   lines.push('*Configuration:* ' + payload.config);
    if (payload.plan)     lines.push('*Plan:* ' + payload.plan);
    if (payload.pickup)   lines.push('*Pickup:* ' + payload.pickup);
    if (payload.date)     lines.push('*Date:* ' + payload.date);
    if (payload.slot)     lines.push('*Slot:* ' + payload.slot);
    if (payload.message)  lines.push('*Message:* ' + payload.message);
    lines.push(''); lines.push(hint || 'Please share pricing and the brochure.');
    return 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }
  function downloadBrochure() {
    try {
      const a = document.createElement('a');
      a.href = CONFIG.BROCHURE_URL;
      a.download = 'Happy-Homes-Brochure.pdf';
      a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click();
      setTimeout(() => a.remove(), 200);
    } catch (e) { console.warn(e); }
  }
  function validateRequired(form, selectors) {
    let ok = true;
    selectors.forEach(([sel, val]) => {
      const el = form.querySelector(sel); if (!el) return;
      if (!val) { el.classList.add('is-invalid'); if (ok) el.focus(); ok = false; }
      else el.classList.remove('is-invalid');
    });
    return ok;
  }
  function unlockPricing() {
    const gate = document.getElementById('pricingGate');
    if (!gate) return;
    const locked = gate.querySelector('.pricing__locked');
    const band   = gate.querySelector('.pricing__band');
    if (locked) locked.hidden = true;
    if (band)   band.hidden = false;
  }
  function markLeadDone() {
    if (window.__chh_unlockPlans) window.__chh_unlockPlans();
    unlockPricing();
    leadSubmitted = true;
    if (autoPopupInterval) { clearInterval(autoPopupInterval); autoPopupInterval = null; }
    if (autoPopupTimeout) { clearTimeout(autoPopupTimeout); autoPopupTimeout = null; }
  }

  /* ========== HERO + MODAL + CONTACT + SITE VISIT + VIDEO CALL ========== */
  function bindForm(formId, source, successHandler) {
    const f = $('#' + formId);
    if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(f);
      const p = {
        name: (fd.get('name') || '').toString().trim(),
        phone: (fd.get('phone') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        budget: (fd.get('budget') || '').toString().trim(),
        timeline: (fd.get('timeline') || '').toString().trim(),
        config: (fd.get('config') || '').toString().trim(),
        pickup: (fd.get('pickup') || '').toString().trim(),
        date: (fd.get('date') || '').toString().trim(),
        slot: (fd.get('slot') || '').toString().trim(),
        plan: f.dataset.plan || '',
        message: (fd.get('message') || '').toString().trim(),
        source: source || (fd.get('source') || 'Form').toString(),
        page: location.href || ''
      };
      if (!validateRequired(f, [['[name="name"]', p.name], ['[name="phone"]', p.phone]])) return;
      const sb = f.querySelector('button[type="submit"]');
      if (sb) { sb.disabled = true; const sp = sb.querySelector('span'); if (sp) sp.textContent = 'Sending...'; }
      const netlifyName = f.getAttribute('name') || '';
      await submitLead(p, netlifyName);
      const hint = source === 'Site Visit form' ? 'Please confirm my free site visit pickup.' :
                   source === 'Video call form' ? 'Please connect me on WhatsApp video.' :
                   'I just downloaded the brochure. Please share pricing.';
      const wa = buildWA(p, hint);
      const waBtn = $('#heroSuccessWA') || $('#successWA');
      if (waBtn) waBtn.href = wa;
      if (successHandler) successHandler(f, p, wa);
      if (sb) { sb.disabled = false; const sp = sb.querySelector('span'); if (sp) sp.textContent = sb.dataset.label || 'Submit'; }
      markLeadDone();
    });
  }

  bindForm('heroForm', 'Hero inline form', (f, p, wa) => {
    downloadBrochure();
    f.style.display = 'none';
    const hs = $('#heroSuccess'); if (hs) hs.hidden = false;
  });
  bindForm('enquiryForm', 'Modal popup', (f, p, wa) => {
    downloadBrochure();
    f.hidden = true;
    if (modalSuccess) modalSuccess.hidden = false;
    f.reset();
  });
  bindForm('contactForm', 'Contact form', (f, p, wa) => {
    downloadBrochure();
    f.reset();
    setTimeout(() => { window.open(wa, '_blank', 'noopener'); }, 400);
  });
  bindForm('siteVisitForm', 'Site Visit form', (f, p, wa) => {
    f.reset();
    closeAllModals();
    setTimeout(() => { window.open(wa, '_blank', 'noopener'); }, 400);
  });
  bindForm('videoForm', 'Video call form', (f, p, wa) => {
    f.reset();
    closeAllModals();
    setTimeout(() => { window.open(wa, '_blank', 'noopener'); }, 400);
  });

  /* ========== WALKTHROUGH VIDEO: nudge play on first scroll-in ========== */
  (function () {
    const v = document.getElementById('walkVideo');
    if (!v) return;
    const tryPlay = () => { try { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {} };
    tryPlay();
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) tryPlay(); });
    }, { threshold: 0.25 });
    io.observe(v);
  })();

  /* ========== COUNTERS (legacy timeline) animate 0 -> target on scroll-in ========== */
  (function () {
    const els = document.querySelectorAll('[data-count-to]');
    if (!els.length) return;
    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.round(target * eased);
        el.firstChild ? (el.childNodes[0].nodeValue = val + suffix) : (el.textContent = val + suffix);
        el.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !e.target.dataset.counted) {
          e.target.dataset.counted = '1';
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  })();

  /* ========== GALLERY CAROUSEL ========== */
  const gTrack = $('#gallery-track');
  const gDots = $('#gallery-dots');
  if (gTrack) {
    const slides = $$('.carousel__slide', gTrack);
    /* dots */
    if (gDots) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
        b.setAttribute('aria-label', 'Slide ' + (i + 1));
        b.addEventListener('click', () => {
          slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        });
        gDots.appendChild(b);
      });
    }
    /* sync dots on scroll */
    let sTimer;
    gTrack.addEventListener('scroll', () => {
      clearTimeout(sTimer);
      sTimer = setTimeout(() => {
        const x = gTrack.scrollLeft;
        const w = slides[0].getBoundingClientRect().width + 16;
        const idx = Math.round(x / w);
        $$('.carousel__dot', gDots).forEach((d, i) => d.classList.toggle('is-active', i === idx));
      }, 80);
    });
    /* nav arrows */
    document.addEventListener('click', (e) => {
      const w = slides[0].getBoundingClientRect().width + 16;
      if (e.target.closest('[data-carousel-prev]')) gTrack.scrollBy({ left: -w, behavior: 'smooth' });
      if (e.target.closest('[data-carousel-next]')) gTrack.scrollBy({ left: w, behavior: 'smooth' });
    });
  }

  /* ========== AMENITIES TOGGLE ========== */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-am-tab]');
    if (!t) return;
    const key = t.dataset.amTab;
    $$('[data-am-tab]').forEach(b => { const a = b === t; b.classList.toggle('is-active', a); b.setAttribute('aria-selected', String(a)); });
    $$('[data-am-grid]').forEach(g => g.classList.toggle('is-active', g.dataset.amGrid === key));
  });

  /* ========== PLANS UNLOCK (lead-gated) ========== */
  function unlockPlans(persist) {
    const lock = document.getElementById('plansLock');
    if (lock) {
      lock.classList.add('is-unlocked');
      lock.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.add('plans-unlocked');
    if (persist !== false) {
      try { localStorage.setItem('chh_plans_unlocked', '1'); } catch (_) {}
    }
  }
  window.__chh_unlockPlans = unlockPlans;
  // Restore previous unlock from localStorage
  try {
    if (localStorage.getItem('chh_plans_unlocked') === '1') {
      unlockPlans(false);
    }
  } catch (_) {}

  /* ========== PLAN VIEW TOGGLE (Master / Typical) ========== */
  function updatePlanTypicalTabsVisibility() {
    const active = $('[data-plan-view].is-active');
    const view = active ? active.dataset.planView : 'master';
    $$('.plans__tabs[data-show-on]').forEach(t => t.classList.toggle('is-visible', t.dataset.showOn === view));
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-plan-view]');
    if (!t) return;
    const key = t.dataset.planView;
    $$('[data-plan-view]').forEach(b => { const a = b === t; b.classList.toggle('is-active', a); b.setAttribute('aria-selected', String(a)); });
    $$('[data-plan-image]').forEach(img => img.classList.toggle('is-active', img.dataset.planImage === key));
    updatePlanTypicalTabsVisibility();
  });
  updatePlanTypicalTabsVisibility();

  /* Typical floor sub-tabs */
  const PLAN_IMG_MAP = {
    '2bhk-1': 'assets/floor-2bhk-1.jpg',
    '2bhk-2': 'assets/floor-2bhk-2.jpg',
    '3bhk-1': 'assets/floor-3bhk-1.jpg',
    '3bhk-2': 'assets/floor-3bhk-2.jpg'
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-typical]');
    if (!t) return;
    const key = t.dataset.typical;
    $$('[data-typical]').forEach(b => b.classList.toggle('is-active', b === t));
    $$('[data-plan-detail]').forEach(d => d.hidden = (d.dataset.planDetail !== key));
    const typicalImg = $('[data-plan-image="typical"]');
    if (typicalImg && PLAN_IMG_MAP[key]) {
      const img = typicalImg.querySelector('img');
      if (img) img.src = PLAN_IMG_MAP[key];
      typicalImg.dataset.img = PLAN_IMG_MAP[key];
    }
  });

  /* ========== EMI Calculator ========== */
  const emiPrice = $('#emiPrice'), emiDown = $('#emiDown'), emiTenure = $('#emiTenure'), emiRate = $('#emiRate');
  if (emiPrice && emiDown && emiTenure && emiRate) {
    const out = {
      price: $('#emiPriceOut'), down: $('#emiDownOut'),
      tenure: $('#emiTenureOut'), rate: $('#emiRateOut'),
      emi: $('#emiEMI'), loan: $('#emiLoan'),
      interest: $('#emiInterest'), total: $('#emiTotal')
    };
    function fmtINR(n) {
      if (!isFinite(n)) return '₹ 0';
      return '₹ ' + Math.round(n).toLocaleString('en-IN');
    }
    function calc() {
      const price = parseFloat(emiPrice.value);
      const downPct = parseFloat(emiDown.value);
      const tenureYears = parseFloat(emiTenure.value);
      const ratePct = parseFloat(emiRate.value);
      const downAmt = price * (downPct / 100);
      const loan = price - downAmt;
      const r = (ratePct / 100) / 12;
      const n = tenureYears * 12;
      let emi = 0;
      if (r > 0) emi = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      else emi = loan / n;
      const total = emi * n;
      const interest = total - loan;
      out.price.textContent = fmtINR(price);
      out.down.textContent = fmtINR(downAmt) + ' (' + downPct + '%)';
      out.tenure.textContent = tenureYears + ' years';
      out.rate.textContent = ratePct.toFixed(2) + '% p.a.';
      out.emi.textContent = fmtINR(emi);
      out.loan.textContent = fmtINR(loan);
      out.interest.textContent = fmtINR(interest);
      out.total.textContent = fmtINR(total);
    }
    [emiPrice, emiDown, emiTenure, emiRate].forEach(el => el.addEventListener('input', calc));
    calc();
  }

  /* ========== LIGHTBOX (zoom plans) ========== */
  const lightbox = $('#lightbox');
  const lightboxViewport = $('#lightboxViewport');
  const lightboxImg = $('#lightboxImg');
  let zoom = 1, panX = 0, panY = 0;
  let isPanning = false, startX = 0, startY = 0;
  function applyTransform() {
    if (!lightboxImg) return;
    lightboxImg.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + zoom + ')';
  }
  function openLightbox(src) {
    if (!lightbox) return;
    if (src && lightboxImg) lightboxImg.src = src;
    lightbox.classList.add('is-open');
    document.body.classList.add('is-locked');
    zoom = 1; panX = 0; panY = 0; applyTransform();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    if (!isAnyModalOpen()) document.body.classList.remove('is-locked');
  }
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-lightbox]');
    if (opener) {
      e.preventDefault();
      const src = opener.dataset.img || (opener.querySelector('img') ? opener.querySelector('img').src : '');
      openLightbox(src);
      return;
    }
    if (e.target.closest('[data-close-lightbox]')) { e.preventDefault(); closeLightbox(); return; }
    const zb = e.target.closest('[data-zoom]');
    if (zb) {
      e.preventDefault();
      const op = zb.dataset.zoom;
      if (op === '+') zoom = Math.min(zoom + 0.25, 4);
      else if (op === '-') zoom = Math.max(zoom - 0.25, 1);
      else { zoom = 1; panX = 0; panY = 0; }
      applyTransform();
    }
  });
  if (lightboxViewport) {
    lightboxViewport.addEventListener('wheel', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      zoom = Math.min(Math.max(zoom + delta, 1), 4);
      applyTransform();
    }, { passive: false });
    lightboxViewport.addEventListener('mousedown', (e) => {
      if (zoom <= 1) return;
      isPanning = true; startX = e.clientX - panX; startY = e.clientY - panY;
      lightboxViewport.classList.add('is-grabbing');
    });
    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      panX = e.clientX - startX; panY = e.clientY - startY; applyTransform();
    });
    window.addEventListener('mouseup', () => {
      isPanning = false; lightboxViewport.classList.remove('is-grabbing');
    });
  }

  /* Pause hero video on slow networks */
  try {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || (conn.effectiveType && /^(2g|slow-2g)$/.test(conn.effectiveType)))) {
      const v = document.querySelector('.hero__video');
      if (v) { v.pause(); v.removeAttribute('autoplay'); }
    }
  } catch (_) {}

  /* ========== PROJECTS MODAL ========== */
  const projectsModal = document.getElementById('projectsModal');
  function openProjects() {
    if (!projectsModal) return;
    projectsModal.classList.add('is-open');
    document.body.classList.add('is-locked');
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-projects]')) { e.preventDefault(); openProjects(); }
  });

})();
