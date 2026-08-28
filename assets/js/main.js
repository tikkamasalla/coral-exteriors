/* ═══════════════════════════════════════════════════════════════
   CORAL STUCCO & EXTERIORS — motion engine
   Vanilla. No dependencies. Everything degrades without JS.
   ═══════════════════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CALM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1 · INTRO CURTAIN ─────────────────────────────────────── */
(() => {
  const c = $('#curtain');
  if (!c) return;
  if (CALM) { c.remove(); document.body.classList.remove('is-locked'); return; }
  document.body.classList.add('is-locked');
  const lift = () => {
    c.classList.add('is-done');
    document.body.classList.remove('is-locked');
    setTimeout(() => c.classList.add('is-gone'), 1800);
  };
  window.addEventListener('load', () => setTimeout(lift, 620));
  setTimeout(lift, 3200); // hard failsafe if load never fires
})();

/* ── 2 · SPLIT TEXT ────────────────────────────────────────── */
$$('[data-split]').forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.style.setProperty('--wi', i);
    const inner = document.createElement('i');
    inner.textContent = w;
    span.appendChild(inner);
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
});

/* ── 3 · REVEAL ON SCROLL ──────────────────────────────────── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    io.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -11% 0px', threshold: 0.08 });

$$('.reveal, .split, .step').forEach(el => io.observe(el));

/* ── 4 · COUNT-UP ──────────────────────────────────────────── */
const counters = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    counters.unobserve(el);
    const end = +el.dataset.count;
    const suf = el.dataset.suffix || '';
    if (CALM) { el.textContent = end + suf; return; }
    const T = 1500, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / T, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => counters.observe(el));

/* ── 5 · HEADER + SCROLL PROGRESS + DOCK ───────────────────── */
(() => {
  const hdr  = $('#hdr');
  const fill = $('#scrollbarFill');
  const dock = $('#ctaDock');
  const hero = $('#hero');
  let last = 0, ticking = false;

  const paint = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (fill) fill.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    hdr.classList.toggle('is-stuck', y > 40);
    hdr.classList.toggle('is-hidden', y > last && y > 420 && !$('#drawer').classList.contains('is-open'));

    if (dock && hero) dock.classList.toggle('is-on', y > hero.offsetHeight * 0.85);

    last = y;
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(paint); ticking = true; }
  }, { passive: true });
  paint();
})();

/* ── 6 · NAV ACTIVE STATE ──────────────────────────────────── */
(() => {
  const links = $$('.hdr__nav a');
  const map = new Map();
  links.forEach(a => {
    const sec = $(a.getAttribute('href'));
    if (sec) map.set(sec, a);
  });
  if (!map.size) return;
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const a = map.get(e.target);
      if (!a) return;
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('is-active'));
        a.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, sec) => spy.observe(sec));
})();

/* ── 7 · MOBILE DRAWER ─────────────────────────────────────── */
(() => {
  const burger = $('#burger'), drawer = $('#drawer');
  if (!burger || !drawer) return;
  $$('.drawer__nav a').forEach((a, i) => a.style.setProperty('--i', i));

  const set = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  };
  burger.addEventListener('click', () => set(!drawer.classList.contains('is-open')));
  $$('.drawer a').forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
})();

/* ── 8 · HERO TICKER ───────────────────────────────────────── */
(() => {
  const row = $('#tickerRow');
  if (!row) return;
  const items = [
    'Materials rated to <b>−40 °C</b>',
    'Freeze–thaw is the <b>#1</b> cause of stucco failure here',
    'Golf-ball to tennis-ball hail · <b>June–August</b>',
    'Gusts well over <b>80 km/h</b> on open lots',
    '<b>85 mm</b> of rain in a single prairie system',
    'Open <b>7 days</b> · 6:30 am – 8:00 pm',
    '<b>Free</b> no-obligation quotes, in writing',
    'Locally owned &amp; operated in <b>Calgary</b>',
    '<b>15+</b> years on Alberta walls'
  ];
  const html = items.map(t => `<span>${t}</span><span>◆</span>`).join('');
  row.innerHTML = html + html; // duplicate for a seamless loop
})();

/* ── 9 · FREEZE–THAW MACHINE ───────────────────────────────── */
(() => {
  const wall  = $('#ftmWall');
  const ice   = $('#ftmIce');
  const fill  = $('#thermFill');
  const state = $('#ftmState');
  const slider= $('#thermSlider');
  const crack = $('#crackPath');
  if (!wall || !fill || !slider) return;

  let damage = 2.5;           // crack width grows across cycles
  let auto   = true;

  const render = (temp) => {
    const pct = ((temp + 40) / 60) * 100;             // −40..+20 → 0..100
    fill.style.height = Math.max(3, pct) + '%';
    fill.style.background = temp < 0
      ? 'linear-gradient(180deg,var(--frost),var(--frost-dk))'
      : 'linear-gradient(180deg,var(--coral),var(--ember))';

    const frozen = temp < 0;
    wall.classList.toggle('is-cold', frozen);
    ice.classList.toggle('is-on', frozen);
    state.classList.toggle('is-cold', frozen);

    let label;
    if (temp <= -25)      label = 'Deep freeze';
    else if (temp < 0)    label = 'Freezing · water expanding';
    else if (temp < 8)    label = 'Thaw · water seeping in';
    else                  label = 'Chinook';
    state.textContent = `${label} · ${temp > 0 ? '+' : ''}${temp} °C`;

    if (crack) crack.style.setProperty('--cw', damage.toFixed(2));
  };

  slider.addEventListener('input', () => { auto = false; render(+slider.value); });
  slider.addEventListener('pointerdown', () => { auto = false; });

  // autonomous freeze–thaw loop while the section is on screen
  let t = 9, dir = -1, running = false, raf = 0, lastStep = 0;

  const loop = (now) => {
    if (!running) return;
    if (now - lastStep > 55) {
      lastStep = now;
      if (auto) {
        t += dir * 1;
        if (t <= -32) { dir = 1; damage = Math.min(damage + 0.55, 9); }  // a freeze widens it
        if (t >= 14)  { dir = -1; }
        slider.value = t;
        render(t);
      }
    }
    raf = requestAnimationFrame(loop);
  };

  const vis = new IntersectionObserver(([e]) => {
    running = e.isIntersecting && !CALM;
    if (running) { lastStep = performance.now(); raf = requestAnimationFrame(loop); }
    else cancelAnimationFrame(raf);
  }, { threshold: 0.25 });
  vis.observe(wall.closest('.ftm'));

  render(9);
})();

/* ── 10 · WALL ANATOMY ─────────────────────────────────────── */
(() => {
  const stack = $('#anStack'), list = $('#anList'), sw = $('.an__switch');
  if (!stack || !list || !sw) return;

  const SYS = {
    trad: [
      { n:'Finish coat',      m:'2–3 mm',   c:'#C9B79A', d:'The colour and texture you actually see. Acrylic or cement-based, and thinner than most people assume.' },
      { n:'Brown coat',       m:'≈10 mm',   c:'#B09876', d:'The levelling layer. This is where a wall becomes flat and true — and where a rushed job shows up years later.' },
      { n:'Scratch coat',     m:'≈10 mm',   c:'#96805F', d:'First coat, deliberately scored while wet so the next coat has something to grip. Skip the scoring and the wall delaminates.' },
      { n:'Wire lath',        m:'Galv.',    c:'#6E6A63', d:'Galvanised mesh fastened to the wall. Gives the wet mix a mechanical key — stucco holds on by grip, not glue.' },
      { n:'Building paper',   m:'2 layers', c:'#4E5B62', d:'The moisture barrier. Anything that gets past the stucco is meant to run down this and back out at the bottom.' },
      { n:'Sheathing',        m:'OSB/ply',  c:'#6B5844', d:'The structural skin of the house. Everything above exists to keep water off this one layer.' }
    ],
    eifs: [
      { n:'Acrylic finish',   m:'1.5–3 mm', c:'#CDBBA0', d:'Thin, flexible and coloured. Excellent looking, and soft enough that hail leaves marks in it.' },
      { n:'Base coat + mesh', m:'≈3 mm',    c:'#A8B0AE', d:'Cement-based coat with fibreglass mesh embedded in it. This is the entire impact resistance of the system.' },
      { n:'Rigid foam board', m:'50–100 mm',c:'#E7E1D3', d:'The insulation, and the reason EIFS saves energy. Also the reason the wall sounds hollow to a woodpecker.' },
      { n:'Drainage cavity',  m:'Grooved',  c:'#7E97A6', d:'Channels that let any water behind the foam drain out. Older "barrier" EIFS had none — which is where the bad reputation came from.' },
      { n:'Weather barrier',  m:'Membrane', c:'#4E5B62', d:'Liquid-applied or sheet membrane on the sheathing. The genuine last line of defence.' },
      { n:'Sheathing',        m:'OSB/ply',  c:'#6B5844', d:'Plywood or OSB. Once water sits here you get rot, then mould, then a repair that costs many times the original one.' }
    ]
  };

  let sys = 'trad', sel = 0;

  const build = () => {
    const layers = SYS[sys];
    stack.innerHTML = '';
    list.innerHTML = '';

    layers.forEach((L, i) => {
      // 3-D plate
      const plate = document.createElement('div');
      plate.className = 'an__layer';
      plate.style.setProperty('--z', -(i * 26));
      plate.style.background = `linear-gradient(135deg,${L.c},${shade(L.c, -18)})`;
      plate.dataset.label = L.n;
      plate.addEventListener('click', () => select(i));
      plate.addEventListener('mouseenter', () => select(i));
      stack.appendChild(plate);

      // list row
      const li = document.createElement('li');
      li.className = 'an__item';
      li.innerHTML =
        `<div class="an__sw" style="background:linear-gradient(90deg,${L.c},${shade(L.c,-22)})"></div>
         <h4>${L.n}<em>${L.m}</em></h4>
         <p>${L.d}</p>`;
      li.addEventListener('click', () => select(i));
      li.addEventListener('mouseenter', () => select(i));
      list.appendChild(li);
    });
    select(0);
  };

  const select = (i) => {
    sel = i;
    $$('.an__layer', stack).forEach((p, k) => {
      p.classList.toggle('is-sel', k === i);
      const lift = k <= i ? (i - k) * -12 : 0;
      p.style.transform = `translateZ(${(-(k * 26)) + (k === i ? 34 : 0)}px) translate(${lift}px,${lift}px)`;
    });
    $$('.an__item', list).forEach((r, k) => r.classList.toggle('is-sel', k === i));
  };

  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const cl = v => Math.max(0, Math.min(255, v));
    const r = cl((n >> 16) + amt), g = cl(((n >> 8) & 255) + amt), b = cl((n & 255) + amt);
    return `rgb(${r},${g},${b})`;
  };

  const movePill = () => {
    const on = $('.an__switch button.is-on');
    const pill = $('.an__pill');
    if (!on || !pill) return;
    pill.style.left  = on.offsetLeft + 'px';
    pill.style.width = on.offsetWidth + 'px';
  };

  $$('.an__switch button').forEach(b => b.addEventListener('click', () => {
    $$('.an__switch button').forEach(x => { x.classList.remove('is-on'); x.setAttribute('aria-selected','false'); });
    b.classList.add('is-on'); b.setAttribute('aria-selected','true');
    sys = b.dataset.sys;
    movePill();
    build();
  }));

  build();
  movePill();
  addEventListener('resize', movePill);
  setTimeout(movePill, 400); // after webfonts settle
})();

/* ── 11 · TRADE HOVER PREVIEW ──────────────────────────────── */
(() => {
  const prev = $('#tradePreview');
  if (!prev || matchMedia('(hover:none)').matches) return;
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0;

  const glide = () => {
    tx += (x - tx) * 0.14;
    ty += (y - ty) * 0.14;
    prev.style.left = tx + 'px';
    prev.style.top  = ty + 'px';
    raf = requestAnimationFrame(glide);
  };

  $$('.trade').forEach(card => {
    card.addEventListener('mouseenter', () => {
      prev.style.backgroundImage = `url(${card.dataset.img})`;
      prev.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(glide);
    });
    card.addEventListener('mouseleave', () => {
      prev.classList.remove('is-on');
      cancelAnimationFrame(raf); raf = 0;
    });
  });
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
})();

/* ── 12 · REVIEW MARQUEES ──────────────────────────────────── */
(() => {
  if (CALM) return;
  $$('.revs__track').forEach(track => {
    track.innerHTML += track.innerHTML;                 // seamless loop
    const cards = track.children.length / 2;
    const secs  = cards * 9;                            // pace scales with content
    track.style.animation = `slide ${secs}s linear infinite`;
    if (track.dataset.dir === '-1') track.style.animationDirection = 'reverse';
  });
})();

/* ── 13 · MAGNETIC BUTTONS ─────────────────────────────────── */
(() => {
  if (CALM || matchMedia('(hover:none)').matches) return;
  $$('.magnet').forEach(el => {
    const R = 70;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ── 14 · QUOTE FORM → EMAIL ───────────────────────────────── */
(() => {
  const form = $('#quoteForm'), note = $('#formNote');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('.fld', form).forEach(f => {
      const c = f.querySelector('[required]');
      if (!c) return;
      const bad = !c.value.trim() || (c.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.value));
      f.classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please fill in the highlighted fields.'; note.classList.remove('is-ok'); return; }

    const d = Object.fromEntries(new FormData(form));
    const subject = `Quote request — ${d.service} — ${d.area}`;
    const body = [
      `Name:    ${d.first} ${d.last}`,
      `Email:   ${d.email}`,
      `Phone:   ${d.phone}`,
      `Service: ${d.service}`,
      `Area:    ${d.area}`,
      '',
      'Details:',
      d.message || '(none given)',
      '',
      '— sent from coralexteriors.com'
    ].join('\n');

    window.location.href =
      `mailto:info@coralstucco.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    note.textContent = 'Opening your email app… if nothing happens, call 403-402-4454.';
    note.classList.add('is-ok');
  });

  $$('.fld [required]', form).forEach(c =>
    c.addEventListener('input', () => c.closest('.fld').classList.remove('is-bad')));
})();

/* ── 15 · HERO PARALLAX ────────────────────────────────────── */
(() => {
  if (CALM) return;
  const glow = $('.hero__glow');
  const h1   = $('.hero__h1');
  if (!glow) return;
  addEventListener('mousemove', e => {
    const x = (e.clientX / innerWidth - 0.5);
    const y = (e.clientY / innerHeight - 0.5);
    glow.style.transform = `translate(${x * -46}px, ${y * -30}px)`;
    if (h1) h1.style.transform = `translate(${x * 9}px, ${y * 5}px)`;
  }, { passive: true });
})();

/* ── 16 · FOOTER YEAR ──────────────────────────────────────── */
const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

})();
