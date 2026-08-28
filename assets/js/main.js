/* ══════════════════════════════════════════════════════════════
   CORAL STUCCO & EXTERIORS
   No dependencies. Everything below degrades to static content.
   ══════════════════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CALM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rand = (a, b) => a + Math.random() * (b - a);

/* ── REVEAL ─────────────────────────────────────────────────── */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('on');
  io.unobserve(e.target);
}), { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
$$('.rv, .drawline, .pro li').forEach(el => io.observe(el));
$$('.pro li').forEach((el, i) => el.style.setProperty('--i', i));
// safety net: content must never stay hidden if the observer misbehaves
setTimeout(() => $$('.rv:not(.on)').forEach(el => {
  if (el.getBoundingClientRect().top < innerHeight) el.classList.add('on');
}), 2500);

/* ── HEADER, PROGRESS, DOCK ─────────────────────────────────── */
(() => {
  const hd = $('#hd'), prog = $('#prog'), dock = $('#dock');
  let last = 0, queued = false;
  const paint = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    hd.classList.toggle('stuck', y > 30);
    hd.classList.toggle('away', y > last && y > 400 && !$('#drw').classList.contains('open'));
    dock.classList.toggle('on', y > innerHeight * 0.9);
    last = y; queued = false;
  };
  addEventListener('scroll', () => { if (!queued) { requestAnimationFrame(paint); queued = true; } }, { passive: true });
  paint();
})();

/* ── NAV SPY ────────────────────────────────────────────────── */
(() => {
  const links = $$('.nav a'), map = new Map();
  links.forEach(a => { const s = $(a.getAttribute('href')); if (s) map.set(s, a); });
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => l.classList.remove('on'));
    map.get(e.target)?.classList.add('on');
  }), { rootMargin: '-42% 0px -52% 0px' });
  map.forEach((_, s) => spy.observe(s));
})();

/* ── DRAWER ─────────────────────────────────────────────────── */
(() => {
  const b = $('#burger'), d = $('#drw');
  $$('a', d).forEach((a, i) => a.style.setProperty('--i', i));
  const set = open => {
    d.classList.toggle('open', open);
    d.setAttribute('aria-hidden', String(!open));
    b.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('lock', open);
  };
  b.addEventListener('click', () => set(!d.classList.contains('open')));
  $$('a', d).forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => e.key === 'Escape' && set(false));
})();

/* ── BEFORE / AFTER SLIDER ──────────────────────────────────── */
(() => {
  const ba = $('#ba');
  if (!ba) return;
  const view = $('#baView'), before = $('#baBefore'), after = $('#baAfter'), handle = $('#baHandle');

  const set = p => {
    p = Math.max(0, Math.min(100, p));
    ba.style.setProperty('--p', p + '%');
    handle.setAttribute('aria-valuenow', Math.round(p));
  };
  const track = e => {
    const r = view.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };

  let dragging = false;
  const start = e => {
    dragging = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    track(e);
  };
  const move = e => { if (dragging) track(e); };
  const stop = e => {
    dragging = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  [view, handle].forEach(el => {
    el.addEventListener('pointerdown', start);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
  });

  handle.addEventListener('keydown', e => {
    const cur = +handle.getAttribute('aria-valuenow') || 50;
    const step = e.shiftKey ? 12 : 4;
    const moves = { ArrowLeft: cur - step, ArrowRight: cur + step, Home: 0, End: 100 };
    if (e.key in moves) { set(moves[e.key]); e.preventDefault(); }
  });

  $$('#baTabs button').forEach(b => b.addEventListener('click', () => {
    $$('#baTabs button').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); });
    b.classList.add('on'); b.setAttribute('aria-selected', 'true');
    const name = b.textContent.trim().toLowerCase();
    before.src = 'assets/img/' + b.dataset.b;
    after.src  = 'assets/img/' + b.dataset.a;
    before.alt = name + ', before the work';
    after.alt  = name + ', after the work';
    set(50);
  }));

  set(50);
})();

/* ── WALL SYSTEM COMPARISON ─────────────────────────────────── */
(() => {
  const viz = $('#sysViz');
  if (!viz) return;

  const marks = $$('.sysviz__markers li', viz);
  const tradScore = $('#sysTradScore');
  const eifsScore = $('#sysEifsScore');
  const duration = 4500;
  let stage = 0;
  let elapsed = 0;
  let previousTime = 0;
  let frame = 0;
  let visible = false;

  const complete = index => {
    const mark = marks[index];
    if (!mark || mark.classList.contains('is-complete')) return;
    mark.classList.add('is-complete');
    tradScore.textContent = marks.filter(item => item.classList.contains('is-complete') && item.dataset.winner === 'trad').length;
    eifsScore.textContent = marks.filter(item => item.classList.contains('is-complete') && item.dataset.winner === 'eifs').length;
  };

  const show = index => {
    stage = index;
    viz.dataset.stage = String(index);
  };

  if (CALM) {
    show(0);
    marks.forEach((_, index) => complete(index));
    return;
  }

  const tick = time => {
    if (!visible) return;
    if (!previousTime) previousTime = time;
    elapsed += Math.min(time - previousTime, 100);
    previousTime = time;

    if (elapsed >= duration) {
      elapsed -= duration;
      complete(stage);
      show((stage + 1) % marks.length);
    }
    frame = requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    viz.classList.toggle('is-paused', !visible);
    cancelAnimationFrame(frame);
    previousTime = 0;
    if (visible) frame = requestAnimationFrame(tick);
  }, { threshold: 0.08 });

  observer.observe(viz);
})();

/* ══════════════════════════════════════════════════════════════
   WOODPECKER: live destruction of an EIFS wall.
   Three physical layers on canvas. Real erosion, real debris.
   The bird is a Northern Flicker, the species responsible for
   most stucco damage on the Canadian prairies.
   ══════════════════════════════════════════════════════════════ */
(() => {
  const root = $('#wp');
  if (!root) return;

  const cv    = $('#wpCanvas');
  const bird  = $('#wpBird');
  const head  = $('#wpHead');
  const stage = $('#wpStage');
  const depthEl = $('#wpDepth');
  const holeEl  = $('#wpHoles');
  const logEl   = $('#wpLog');
  const btnPatch = $('#wpPatch');
  const btnFix   = $('#wpFix');
  const ctx = cv.getContext('2d');

  let W = 0, H = 0, DPR = 1;
  let finish, foam;                       // offscreen destructible layers
  let fctx, mctx;

  const debris = [];
  const rings  = [];
  let holes = 0, deepest = 0;             // 0 none, 1 finish, 2 foam, 3 sheathing
  // Runs by default. The observer only PAUSES it when off screen, so the
  // simulation never depends on IntersectionObserver to get started.
  let deterred = false, running = true, raf = 0;

  /* ---- layer painting ---- */
  const paintSheathing = (c) => {
    c.fillStyle = '#8A7355'; c.fillRect(0, 0, W, H);
    // OSB flake texture
    for (let i = 0; i < W * H / 260; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const w = rand(6, 22), h = rand(3, 7), a = rand(-0.6, 0.6);
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = `rgba(${90 + Math.random() * 60 | 0},${70 + Math.random() * 45 | 0},${44 + Math.random() * 30 | 0},.55)`;
      c.fillRect(-w / 2, -h / 2, w, h); c.restore();
    }
    c.fillStyle = 'rgba(40,28,16,.22)'; c.fillRect(0, 0, W, H);
  };

  const paintFoam = (c) => {
    c.clearRect(0, 0, W, H);
    c.fillStyle = '#EFE9DC'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 90; i++) {           // EPS bead structure
      c.beginPath();
      c.arc(Math.random() * W, Math.random() * H, rand(1.4, 3.4), 0, 6.284);
      c.fillStyle = `rgba(${200 + Math.random() * 30 | 0},${194 + Math.random() * 28 | 0},${178 + Math.random() * 26 | 0},.5)`;
      c.fill();
    }
  };

  const paintFinish = (c) => {
    c.clearRect(0, 0, W, H);
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#CDBBA1'); g.addColorStop(1, '#B9A68B');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 55; i++) {           // troweled aggregate
      const x = Math.random() * W, y = Math.random() * H, r = rand(.6, 2.1);
      c.beginPath(); c.arc(x, y, r, 0, 6.284);
      c.fillStyle = Math.random() > .5
        ? `rgba(255,250,240,${rand(.12, .3)})`
        : `rgba(112,92,68,${rand(.1, .26)})`;
      c.fill();
    }
    c.strokeStyle = 'rgba(90,72,52,.09)';            // control joint
    c.lineWidth = 2; c.beginPath(); c.moveTo(0, H * .74); c.lineTo(W, H * .74); c.stroke();
  };

  /* ---- destructible blob ---- */
  const bite = (c, x, y, r) => {
    c.save();
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    const pts = 9;
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * 6.284;
      const rr = r * rand(.72, 1.3);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath(); c.fill();
    c.restore();
  };

  const setup = () => {
    const r = cv.getBoundingClientRect();
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = Math.round(r.width); H = Math.round(r.height);
    if (!W || !H) return;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const mk = () => { const o = document.createElement('canvas'); o.width = W; o.height = H; return o; };
    finish = mk(); foam = mk();
    fctx = finish.getContext('2d'); mctx = foam.getContext('2d');
    paintFoam(mctx); paintFinish(fctx);
    holes = 0; deepest = 0; debris.length = 0; rings.length = 0;
    updateHud();
  };

  const sheath = document.createElement('canvas');
  const drawSheathOnce = () => {
    sheath.width = W; sheath.height = H;
    paintSheathing(sheath.getContext('2d'));
  };

  /* ---- HUD ---- */
  const DEPTHS = ['No damage', 'Outer coat broken', 'Foam insulation exposed', 'Wood panel reached'];
  const updateHud = () => {
    holeEl.textContent = holes;
    depthEl.textContent = DEPTHS[deepest];
    depthEl.dataset.d = deepest;
  };
  const log = (t) => { logEl.textContent = t; };

  /* ---- bird state machine ---- */
  const B = { x: .30, y: .34, burst: 0, cool: 0, pecks: 0, gone: false, hop: 0 };

  const place = () => {
    bird.style.left = (B.x * 100) + '%';
    bird.style.top  = (B.y * 100) + '%';
  };

  // bill tip, measured from the bird's real rendered box so it lands
  // correctly at any canvas size
  const billTip = () => {
    const b = bird.getBoundingClientRect(), c = cv.getBoundingClientRect();
    if (!b.width || !c.width) return { x: B.x * W + 26, y: B.y * H + 30 };
    const scale = W / c.width;
    return {
      x: (b.left - c.left + b.width * 0.93) * scale,
      y: (b.top - c.top + b.height * 0.23) * scale
    };
  };

  const strike = () => {
    const { x: px, y: py } = billTip();
    const r = rand(6, 10);
    bite(fctx, px, py, r);
    if (B.pecks > 3) bite(mctx, px, py, r * .74);

    holes = Math.max(holes, Math.ceil(B.hop + 1));
    deepest = Math.max(deepest, B.pecks > 9 ? 3 : B.pecks > 3 ? 2 : 1);
    updateHud();

    rings.push({ x: px, y: py, r: 4, a: .55 });

    const n = 5 + Math.random() * 7 | 0;
    for (let i = 0; i < n; i++) {
      const deep = B.pecks > 3;
      debris.push({
        x: px, y: py,
        vx: rand(-3.4, 1.2), vy: rand(-4.2, -.6),
        s: rand(1.6, 4.4), rot: rand(0, 6.28), vr: rand(-.3, .3),
        c: deep ? `rgba(236,230,216,${rand(.75, 1)})` : `rgba(${185 + Math.random() * 40 | 0},${165 + Math.random() * 35 | 0},${138 + Math.random() * 30 | 0},1)`,
        life: 1
      });
    }
    // recoil
    stage.style.transform = `translate(${rand(-2, 2)}px,${rand(-1.6, 1.6)}px)`;
  };

  let t = 0;
  const frame = (now) => {
    if (!running) return;
    const dt = Math.min((now - t) || 16, 33); t = now;

    /* bird logic */
    if (!deterred && !B.gone) {
      if (B.cool > 0) {
        B.cool -= dt;
        head.style.transform = 'rotate(0deg)';
        if (B.cool <= 0) {
          if (B.pecks >= 13) {                       // move to a fresh spot
            B.pecks = 0; B.hop++;
            B.x = Math.min(.78, .17 + (B.hop % 4) * .19 + rand(-.03, .03));
            B.y = .22 + ((B.hop * 7) % 3) * .16;
            place();
            bird.style.transform = `scaleX(${Math.random() > .8 ? -1 : 1})`;
            log('Moved to a new spot on the same wall.');
          }
          B.burst = 5 + Math.random() * 5 | 0;
        }
      } else if (B.burst > 0) {
        B.burst -= 1; B.pecks += 1;
        head.style.transform = 'rotate(-27deg)';
        setTimeout(() => { head.style.transform = 'rotate(4deg)'; }, 42);
        strike();
        B.cool = B.burst > 0 ? 78 : rand(620, 1150);
        if (B.pecks === 4) log('Through the outer coat. Now into the foam.');
        if (B.pecks === 10) log('The hole reached the wood panel. It is now open to rain and snow.');
      } else {
        B.cool = 400;
      }
    }

    /* physics */
    for (let i = debris.length - 1; i >= 0; i--) {
      const p = debris[i];
      p.vy += .34; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y > H + 24) { debris.splice(i, 1); continue; }
      if (p.y > H * .96) p.life -= .05;
      if (p.life <= 0) debris.splice(i, 1);
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.r += 1.9; r.a -= .028;
      if (r.a <= 0) rings.splice(i, 1);
    }

    /* composite */
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(sheath, 0, 0, W, H);
    ctx.drawImage(foam, 0, 0, W, H);
    ctx.drawImage(finish, 0, 0, W, H);

    ctx.save();
    rings.forEach(r => {
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.284);
      ctx.strokeStyle = `rgba(255,255,255,${r.a})`; ctx.lineWidth = 1.4; ctx.stroke();
    });
    debris.forEach(p => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = p.life; ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * rand(.7, 1));
      ctx.restore();
    });
    ctx.restore();

    stage.style.transform = '';
    raf = requestAnimationFrame(frame);
  };

  /* ---- controls ---- */
  btnPatch.addEventListener('click', () => {
    paintFinish(fctx);                                // cosmetic surface only
    B.pecks = 0; B.cool = 900; deterred = false;
    deepest = Math.min(deepest, 2);
    updateHud();
    log('The surface is filled. The wall still feels hollow. The bird returns.');
    btnPatch.disabled = true;
    setTimeout(() => { btnPatch.disabled = false; }, 2600);
  });

  btnFix.addEventListener('click', () => {
    paintFoam(mctx); paintFinish(fctx);
    holes = 0; deepest = 0; B.pecks = 0; B.hop = 0;
    debris.length = 0; rings.length = 0;
    deterred = true; updateHud();
    root.classList.add('fixed');
    bird.classList.add('away');
    log('The foam and mesh are replaced. Reflectors are fitted. The bird leaves this wall.');
    setTimeout(() => {
      bird.classList.remove('away');
      B.gone = false; deterred = false;
      root.classList.remove('fixed');
      B.x = .30; B.y = .34; place();
      log('Watch the wall, or use the controls.');
    }, 9000);
  });

  cv.addEventListener('click', e => {
    if (deterred) return;
    const r = cv.getBoundingClientRect();
    B.x = (e.clientX - r.left) / r.width - .04;
    B.y = (e.clientY - r.top) / r.height - .06;
    B.x = Math.max(.04, Math.min(.82, B.x));
    B.y = Math.max(.06, Math.min(.66, B.y));
    B.pecks = 0; B.burst = 6; B.cool = 0; B.hop++;
    place();
  });

  /* ---- lifecycle ---- */
  const composite = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(sheath, 0, 0, W, H);
    ctx.drawImage(foam, 0, 0, W, H);
    ctx.drawImage(finish, 0, 0, W, H);
  };
  const boot = () => { setup(); drawSheathOnce(); place(); composite(); };
  boot();
  addEventListener('resize', () => { boot(); }, { passive: true });

  if (CALM) {
    // static, honest fallback: show a damaged wall, no motion
    for (let i = 0; i < 3; i++) {
      const x = W * (.25 + i * .22), y = H * (.3 + (i % 2) * .18);
      bite(fctx, x, y, 12); bite(mctx, x, y, 8);
    }
    holes = 3; deepest = 3; updateHud();
    ctx.drawImage(sheath, 0, 0, W, H); ctx.drawImage(foam, 0, 0, W, H); ctx.drawImage(finish, 0, 0, W, H);
    log('Motion reduced. Use the controls to compare a patch against a full repair.');
    return;
  }

  const start = () => {
    cancelAnimationFrame(raf);
    t = performance.now();
    raf = requestAnimationFrame(frame);
  };
  start();

  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { running = true; start(); }
    else { running = false; cancelAnimationFrame(raf); }
  }, { threshold: .12 }).observe(root);

  // a tab that was hidden freezes rAF; resume cleanly
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && running) start();
  });
})();

/* ── REVIEW MARQUEES ────────────────────────────────────────── */
(() => {
  if (CALM) return;
  $$('.rvs__t').forEach(track => {
    const container = track.closest('.rvs');
    track.innerHTML += track.innerHTML;

    let half = track.scrollWidth / 2;
    let x = 0;
    let last = 0;
    let raf = 0;
    let hovered = false;
    let visible = false;
    const speed = 36;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const frame = now => {
      if (!visible || hovered || document.hidden) { stop(); return; }
      const delta = Math.min(now - last, 64);
      last = now;
      x -= speed * delta / 1000;
      if (x <= -half) x += half;
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || !visible || hovered || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    container.addEventListener('mouseenter', () => { hovered = true; stop(); });
    container.addEventListener('mouseleave', () => { hovered = false; start(); });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: .01 }).observe(container);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });
    new ResizeObserver(() => { half = track.scrollWidth / 2; }).observe(container);
  });
})();

/* ── QUOTE FORM ─────────────────────────────────────────────── */
(() => {
  const form = $('#qf'), note = $('#qn');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('.f', form).forEach(f => {
      const c = f.querySelector('[required]'); if (!c) return;
      const bad = !c.value.trim() || (c.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.value));
      f.classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please complete the highlighted fields.'; note.classList.remove('ok'); return; }

    const d = Object.fromEntries(new FormData(form));
    const body = [
      `Name: ${d.first} ${d.last}`, `Email: ${d.email}`, `Phone: ${d.phone}`,
      `Service: ${d.service}`, `Area: ${d.area}`, '', 'Details:', d.message || 'None given'
    ].join('\n');
    location.href = `mailto:info@coralstucco.ca?subject=${encodeURIComponent(`Quote request, ${d.service}, ${d.area}`)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Opening your email application. If nothing happens, call 403 402 4454.';
    note.classList.add('ok');
  });
  $$('.f [required]', form).forEach(c =>
    c.addEventListener('input', () => c.closest('.f').classList.remove('bad')));
})();

$('#yr').textContent = new Date().getFullYear();

})();
