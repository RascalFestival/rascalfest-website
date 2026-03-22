/* ============================================
   RASCAL FESTIVAL — main.js
   ============================================ */

(function () {

  /* SMOOTH SCROLL — no # in URL bar */
  window.smoothTo = function (id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  /* NAV */
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('s', window.scrollY > 60);
    }, { passive: true });
  }

  /* FAQ */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  /* LASERS */
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  var BEAMS = [
    { ox: .5,  a: -55,  s: .18, c: [170,255,0],   w: 2.8, l: .9  },
    { ox: .5,  a: -125, s: .18, c: [170,255,0],   w: 2.8, l: .9  },
    { ox: .35, a: -70,  s: .12, c: [170,255,0],   w: 1.6, l: .78 },
    { ox: .65, a: -110, s: .12, c: [170,255,0],   w: 1.6, l: .78 },
    { ox: .5,  a: -90,  s: .24, c: [210,240,255], w: 1.1, l: .95 },
    { ox: .22, a: -65,  s: .08, c: [190,225,255], w: .9,  l: .68 },
    { ox: .78, a: -115, s: .08, c: [190,225,255], w: .9,  l: .68 },
    { ox: .12, a: -58,  s: .06, c: [255,195,0],   w: .7,  l: .58 },
    { ox: .88, a: -122, s: .06, c: [255,195,0],   w: .7,  l: .58 },
    { ox: .42, a: -78,  s: .16, c: [255,55,175],  w: 1.1, l: .74 },
    { ox: .58, a: -102, s: .16, c: [255,55,175],  w: 1.1, l: .74 }
  ];

  function drawBeams(ctx, W, H, t, shift) {
    BEAMS.forEach(function (b, i) {
      var sw  = Math.sin(t * b.s + i * 1.4) * (10 + i * 1.5);
      var sh  = shift * (i % 2 === 0 ? 1 : -1);
      var ang = (b.a + sw + sh) * Math.PI / 180;
      var ox  = b.ox * W, oy = H;
      var ex  = ox + Math.cos(ang) * b.l * H;
      var ey  = oy + Math.sin(ang) * b.l * H;
      var p   = 0.5 + Math.sin(t * b.s * 2.1 + i) * .3;

      /* glow layer — blur once per beam */
      ctx.save();
      ctx.filter      = 'blur(7px)';
      ctx.globalAlpha = .45;
      var g1 = ctx.createLinearGradient(ox, oy, ex, ey);
      g1.addColorStop(0,   rgba(b.c, 0));
      g1.addColorStop(.08, rgba(b.c, p * .32));
      g1.addColorStop(.5,  rgba(b.c, p * .1));
      g1.addColorStop(1,   rgba(b.c, 0));
      ctx.strokeStyle = g1;
      ctx.lineWidth   = b.w * 12;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.restore();

      /* core beam — sharp, no blur */
      ctx.save();
      ctx.filter      = 'none';
      ctx.globalAlpha = 1;
      var g2 = ctx.createLinearGradient(ox, oy, ex, ey);
      g2.addColorStop(0,   rgba(b.c, 0));
      g2.addColorStop(.05, rgba(b.c, p));
      g2.addColorStop(.55, rgba(b.c, p * .3));
      g2.addColorStop(1,   rgba(b.c, 0));
      ctx.strokeStyle = g2;
      ctx.lineWidth   = b.w;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.restore();
    });

    /* floor glow */
    ctx.save();
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    var fg = ctx.createRadialGradient(W * .5, H, 0, W * .5, H, W * .45);
    fg.addColorStop(0, 'rgba(170,255,0,.1)');
    fg.addColorStop(1, 'transparent');
    ctx.fillStyle = fg;
    ctx.fillRect(0, H - 110, W, 110);
    ctx.restore();
  }

  var c1 = document.getElementById('lc1');
  var x1 = c1 ? c1.getContext('2d') : null;
  var c2 = document.getElementById('lc2');
  var x2 = c2 ? c2.getContext('2d') : null;
  var W1 = 0, H1 = 0, W2 = 0, H2 = 0, SY = 0, t = 0;

  window.addEventListener('scroll', function () { SY = window.scrollY; }, { passive: true });

  function doResize() {
    var h  = document.querySelector('.hero');
    var cs = document.querySelector('.contact-sec');
    if (h  && c1) { W1 = c1.width  = h.offsetWidth;  H1 = c1.height = h.offsetHeight; }
    if (cs && c2) { W2 = c2.width  = cs.offsetWidth; H2 = c2.height = cs.offsetHeight; }
  }

  window.addEventListener('load',   function () { doResize(); setTimeout(doResize, 300); });
  window.addEventListener('resize', doResize, { passive: true });
  setTimeout(doResize, 500);

  /* loop — capped at 40fps */
  var lastFrame = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    if (ts - lastFrame < 25) return;
    lastFrame = ts;
    t += .022;

    if (x1 && W1 > 0 && H1 > 0) {
      var sf  = Math.min(SY / (H1 || 1), 1) * 20;
      x1.clearRect(0, 0, W1, H1);
      x1.globalAlpha = 1;
      var bg1 = x1.createRadialGradient(W1 * .5, H1 * .3, 0, W1 * .5, H1 * .3, W1 * .6);
      bg1.addColorStop(0, 'rgba(170,255,0,.05)'); bg1.addColorStop(1, 'transparent');
      x1.fillStyle = bg1; x1.fillRect(0, 0, W1, H1);
      drawBeams(x1, W1, H1, t, sf);
    }

    if (x2 && W2 > 0 && H2 > 0) {
      x2.clearRect(0, 0, W2, H2);
      x2.globalAlpha = 1;
      var bg2 = x2.createRadialGradient(W2 * .5, H2 * .3, 0, W2 * .5, H2 * .3, W2 * .6);
      bg2.addColorStop(0, 'rgba(170,255,0,.05)'); bg2.addColorStop(1, 'transparent');
      x2.fillStyle = bg2; x2.fillRect(0, 0, W2, H2);
      drawBeams(x2, W2, H2, t + 5, 0);
    }
  }

  requestAnimationFrame(loop);

})();
