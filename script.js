(() => {
'use strict';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const body = document.body;
const menu = document.getElementById('mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
const booking = document.getElementById('booking');
const bookingDialog = booking?.querySelector('.booking__dialog');
const bookingClose = booking?.querySelector('.booking__close');
let lenis = null;
let lastFocused = null;

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

function initIntro() {
  const intro = $('#intro');
  if (!intro) return;
  if (reduced.matches || !window.gsap) {
    intro.remove();
    return;
  }
  gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      intro.style.pointerEvents = 'none';
      intro.setAttribute('aria-hidden', 'true');
    }
  })
  .to('.intro__line--top,.intro__line--bottom', { scaleX: 1, duration: .75 })
  .from('.intro__eyebrow', { y: 12, opacity: 0, duration: .5 }, '-=.35')
  .from('.intro__wordmark', { y: 30, opacity: 0, filter: 'blur(7px)', duration: .95 }, '-=.3')
  .from('.intro__caption', { y: 10, opacity: 0, duration: .4 }, '-=.5')
  .to('.intro__center', { scale: 1.025, opacity: 0, duration: .6, delay: .25 })
  .to('.intro', { clipPath: 'inset(0 0 100% 0)', duration: .95 }, '-=.2');
}

function initLenis() {
  if (reduced.matches || !window.Lenis || !window.gsap || !window.ScrollTrigger) return;
  lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: .9,
    wheelMultiplier: .9,
    autoRaf: false
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initHeader() {
  const header = $('#header');
  const update = () => header?.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initNavigation() {
  const setMenu = open => {
    menu?.classList.toggle('is-open', open);
    menu?.setAttribute('aria-hidden', String(!open));
    menuToggle?.setAttribute('aria-expanded', String(open));
    body.classList.toggle('is-locked', open);
  };

  menuToggle?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = $(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      setMenu(false);
      if (lenis && !reduced.matches) lenis.scrollTo(target, { offset: -12, duration: 1.05 });
      else target.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  });
}

function initHeroParallax() {
  if (reduced.matches) return;
  gsap.to('.hero__media', {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero__content', {
    y: -55,
    opacity: .7,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
}

function initPinnedImage() {
  if (reduced.matches) return;
  const section = $('.pin-section');
  const stage = $('.pin-stage');
  const frame = $('.pin-frame');
  if (!section || !stage || !frame) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', () => {
    const startW = frame.getBoundingClientRect().width;
    const startH = frame.getBoundingClientRect().height;
    const targetScale = Math.max(innerWidth / startW, innerHeight / startH) * 1.02;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + innerHeight * 1.55,
        scrub: true,
        pin: stage,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tl.to(frame, { scale: targetScale, duration: .82 }, 0)
      .to('.pin-caption', { opacity: 0, y: 30, duration: .3 }, .35)
      .to('.pin-overlay', { opacity: .18, duration: .25 }, .62);

    return () => tl.scrollTrigger?.kill();
  });

  mm.add('(max-width: 900px)', () => {
    const startW = frame.getBoundingClientRect().width;
    const startH = frame.getBoundingClientRect().height;
    const targetScale = Math.max(innerWidth / startW, innerHeight / startH) * 1.015;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + innerHeight * 1.1,
        scrub: true,
        pin: stage,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tl.to(frame, { scale: targetScale, duration: .84 }, 0)
      .to('.pin-caption', { opacity: 0, y: 24, duration: .25 }, .42);

    return () => tl.scrollTrigger?.kill();
  });
}

function initHorizontalScroll() {
  if (reduced.matches) return;
  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', () => {
    const section = $('.services');
    const viewport = $('.services__viewport');
    const track = $('.services__track');
    const progress = $('.services__progress i');
    if (!section || !viewport || !track) return;

    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + Math.max(distance(), innerWidth * .9),
        pin: viewport,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
          if (progress) progress.style.width = (self.progress * 100).toFixed(2) + '%';
        }
      }
    });
    return () => tween.scrollTrigger?.kill();
  });

  mm.add('(max-width: 900px)', () => {
    const section = $('.services');
    const viewport = $('.services__viewport');
    const track = $('.services__track');
    const progress = $('.services__progress i');
    if (!section || !viewport || !track) return;

    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + Math.max(distance(), innerHeight * .95),
        pin: viewport,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
          if (progress) progress.style.width = (self.progress * 100).toFixed(2) + '%';
        }
      }
    });
    return () => tween.scrollTrigger?.kill();
  });
}

function initReveals() {
  if (reduced.matches) {
    $$('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  $$('.reveal').forEach(el => gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: .9,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 82%', once: true }
  }));
}

function initMarquee() {
  if (reduced.matches) return;
  const track = $('.marquee__track');
  if (!track) return;
  gsap.to(track, { xPercent: -50, duration: 24, ease: 'none', repeat: -1 });
}

function initMouseParallax() {
  if (!finePointer.matches || reduced.matches) return;

  const targets = $$('.hero__media,.pin-frame,.story__image');
  if (!targets.length) return;

  let px = .5, py = .5, cx = .5, cy = .5;
  let raf = 0;

  const render = () => {
    cx += (px - cx) * .075;
    cy += (py - cy) * .075;

    targets.forEach(el => {
      const depth = el.classList.contains('hero__media') ? 1 : .45;
      el.style.setProperty('--mx', ((cx - .5) * depth * 14).toFixed(2) + 'px');
      el.style.setProperty('--my', ((cy - .5) * depth * 14).toFixed(2) + 'px');
    });

    raf = requestAnimationFrame(render);
  };

  window.addEventListener('pointermove', event => {
    px = event.clientX / innerWidth;
    py = event.clientY / innerHeight;
  }, { passive: true });

  raf = requestAnimationFrame(render);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
}

function initHoverAndMagnetic() {
  if (!finePointer.matches || reduced.matches) return;

  $$('.magnetic').forEach(el => {
    const move = event => {
      const r = el.getBoundingClientRect();
      const x = Math.max(-5, Math.min(5, (event.clientX - (r.left + r.width / 2)) * .08));
      const y = Math.max(-5, Math.min(5, (event.clientY - (r.top + r.height / 2)) * .08));
      el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(1.015)';
    };
    const reset = () => { el.style.transform = ''; };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('pointercancel', reset);
  });
}

function initBooking() {
  const form = $('#booking-form');
  const dateGrid = $('#date-grid');
  const timeGrid = $('#time-grid');
  const dateInput = $('#date');
  const timeInput = $('#time');
  const serviceInput = $('#service');
  const summary = $('#booking-summary strong');
  const timeSlots = ['09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00'];
  const days = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
  let chosenDate = null;

  const updateSummary = () => {
    if (!summary) return;
    const service = serviceInput?.value || 'Hizmet seçilmedi';
    const date = chosenDate ? chosenDate.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Tarih seçilmedi';
    const time = timeInput?.value || 'Saat seçilmedi';
    summary.textContent = service + ' · ' + date + ' · ' + time;
  };

  const buildTimes = () => {
    if (!timeGrid) return;
    timeGrid.innerHTML = '';
    timeSlots.forEach(slot => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'time-button';
      button.textContent = slot;
      button.addEventListener('click', () => {
        $$('.time-button', timeGrid).forEach(item => item.classList.remove('is-active'));
        button.classList.add('is-active');
        timeInput.value = slot;
        updateSummary();
      });
      timeGrid.appendChild(button);
    });
  };

  const buildDates = () => {
    if (!dateGrid || dateGrid.children.length) return;
    const now = new Date();

    for (let i = 0; i < 21; i++) {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(now.getDate() + i);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'date-button';
      button.dataset.date = date.toISOString().slice(0, 10);
      button.innerHTML = '<small>' + days[date.getDay()] + '</small>' + date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

      button.addEventListener('click', () => {
        $$('.date-button', dateGrid).forEach(item => item.classList.remove('is-active'));
        button.classList.add('is-active');
        chosenDate = date;
        dateInput.value = button.dataset.date;
        buildTimes();
        updateSummary();
      });

      dateGrid.appendChild(button);
    }

    dateGrid.querySelector('.date-button')?.click();
  };

  const open = () => {
    lastFocused = document.activeElement;
    booking.classList.add('is-open');
    booking.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    buildDates();
    bookingClose?.focus();
  };

  const close = () => {
    booking.classList.remove('is-open');
    booking.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    lastFocused?.focus?.();
  };

  $$('.js-open-booking').forEach(button => button.addEventListener('click', open));
  bookingClose?.addEventListener('click', close);
  $('.booking__backdrop')?.addEventListener('click', close);
  serviceInput?.addEventListener('change', updateSummary);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && booking.classList.contains('is-open')) close();
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!serviceInput.value || !dateInput.value || !timeInput.value || !chosenDate) return;

    const name = $('#name').value.trim();
    const phone = $('#phone').value.trim();
    const note = $('#note').value.trim() || '—';
    const dateLabel = chosenDate.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const message = [
      'Merhaba, web siteniz üzerinden randevu oluşturmak istiyorum.',
      '',
      'Ad Soyad: ' + name,
      'Telefon: ' + phone,
      'Hizmet: ' + serviceInput.value,
      'Tarih: ' + dateLabel,
      'Saat: ' + timeInput.value,
      'Not: ' + note
    ].join('\\n');

    window.open('https://wa.me/905347099081?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
  });
}

function init() {
  initIntro();
  initHeader();
  initNavigation();
  initLenis();

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    initHeroParallax();
    initPinnedImage();
    initHorizontalScroll();
    initReveals();
    initMarquee();
    ScrollTrigger.refresh();
  }

  initMouseParallax();
  initHoverAndMagnetic();
  initBooking();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
})();