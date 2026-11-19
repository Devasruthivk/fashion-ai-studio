(function () {
  'use strict';
  var MAX = 5 * 1024 * 1024, TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'], KEY = 'fas-history';
  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;
  $('yr').textContent = new Date().getFullYear();

  // ---------- theme ----------
  var isDark = function () { return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
  $('theme').addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // ---------- toast ----------
  var tTimer;
  var toast = function (msg) {
    var t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(tTimer); tTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  };

  // ---------- reveal on scroll ----------
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  } else document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('on'); });

  // ---------- state machine ----------
  var states = ['s-idle', 's-busy', 's-done', 's-err'];
  var show = function (id) { states.forEach(function (s) { $(s).hidden = s !== id; }); };

  // ---------- history ----------
  var load = function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  var save = function (h) {
    h = h.slice(0, 24);
    try { localStorage.setItem(KEY, JSON.stringify(h)); }
    catch (e) { try { localStorage.setItem(KEY, JSON.stringify(h.slice(0, 8))); } catch (e2) {} }
  };
  var lvl = function (c) { return c >= 0.6 ? 'high' : c >= 0.45 ? 'medium' : 'low'; };
  var filter = '';
  var ago = function (t) {
    var s = (Date.now() - t) / 1000;
    if (s < 60) return 'Just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  var renderFilters = function (h) {
    var box = $('filters'); box.innerHTML = '';
    var classes = [];
    h.forEach(function (r) { if (classes.indexOf(r.cls) < 0) classes.push(r.cls); });
    if (classes.length < 2) { filter = ''; return; }
    [''].concat(classes).forEach(function (c) {
      var b = el('button', 'chip-btn', c || 'All');
      b.type = 'button'; b.setAttribute('aria-pressed', String(filter === c));
      b.addEventListener('click', function () { filter = c; renderHistory(); });
      box.appendChild(b);
    });
  };

  var renderHistory = function () {
    var h = load(), grid = $('hist');
    grid.innerHTML = '';
    $('hist-empty').hidden = h.length > 0;
    $('hist-foot').hidden = h.length === 0;
    $('stat-n').textContent = h.length;
    renderFilters(h);
    h.forEach(function (r, i) {
      if (filter && r.cls !== filter) return;
      var card = el('article', 'h-card');
      var im = el('div', 'h-img');
      var img = el('img'); img.src = r.thumb; img.alt = r.cls; img.loading = 'lazy';
      var chip = el('span', 'chip ' + lvl(r.conf), (r.conf * 100).toFixed(0) + '%');
      im.appendChild(img); im.appendChild(chip);
      var body = el('div', 'h-body');
      var txt = el('div');
      txt.appendChild(el('h3', null, r.cls));
      var tm = el('time', null, ago(r.at)); tm.dateTime = new Date(r.at).toISOString(); txt.appendChild(tm);
      var del = el('button', 'h-del'); del.type = 'button'; del.setAttribute('aria-label', 'Delete this inspection');
      del.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>';
      del.addEventListener('click', function () { var x = load(); x.splice(i, 1); save(x); renderHistory(); toast('Inspection deleted'); });
      body.appendChild(txt); body.appendChild(del);
      card.appendChild(im); card.appendChild(body);
      grid.appendChild(card);
    });
  };
  $('clear-all').addEventListener('click', function () {
    if (confirm('Clear all inspections saved on this device?')) { save([]); filter = ''; renderHistory(); toast('History cleared'); }
  });
  renderHistory();

  // ---------- image helpers ----------
  var resize = function (src, maxSide, q) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, maxSide / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', q));
      };
      img.onerror = function () { reject(new Error("We couldn't read that image. Try a JPG or PNG.")); };
      img.src = src;
    });
  };

  // ---------- result render ----------
  var WARN = {
    low: 'The model is unsure. Retake the photo closer, in even light, and check by eye.',
    medium: 'Fairly confident, but another defect scored close. A second photo can confirm.'
  };
  var LABEL = { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' };
  var last = null;

  var countUp = function (node, to) {
    var start = performance.now(), dur = 1000;
    var step = function (now) {
      var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  var render = function (d, imgUrl) {
    last = d;
    $('res-img').src = imgUrl;
    $('res-class').textContent = d.top['class'];
    var pct = Math.round(d.top.confidence * 100);
    var g = $('gauge'); g.className = 'gauge ' + d.level;
    var fg = $('g-fg'); fg.style.strokeDashoffset = 326.7;
    var lv = $('res-level'); lv.className = 'chip ' + d.level; lv.textContent = LABEL[d.level];
    $('res-info').textContent = (d.info && d.info.text) || '';
    $('res-warn').hidden = d.level === 'high';
    if (d.level !== 'high') $('res-warn-text').textContent = WARN[d.level];
    var bars = $('bars'); bars.innerHTML = ''; var fills = [];
    d.predictions.forEach(function (p, i) {
      var v = (p.confidence * 100).toFixed(1);
      var row = el('div');
      var lab = el('div', 'bar-row');
      lab.appendChild(el('span', null, p['class'])); lab.appendChild(el('strong', null, v + '%'));
      var bar = el('div', 'bar'); var f = el('i', i === 0 ? 'top' : '');
      bar.appendChild(f); row.appendChild(lab); row.appendChild(bar); bars.appendChild(row);
      fills.push([f, v]);
    });
    show('s-done');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      fg.style.strokeDashoffset = 326.7 * (1 - d.top.confidence);
      countUp($('g-num'), pct);
      fills.forEach(function (x) { x[0].style.width = x[1] + '%'; });
    }); });
  };

  // ---------- flow ----------
  var busy = false;
  var analyse = function (file) {
    if (busy || !file) return;
    if (file.type && TYPES.indexOf(file.type) < 0 && file.type.indexOf('image/') !== 0) return fail('Please choose a JPG, PNG or WEBP image.');
    if (file.size > MAX * 3) return fail('That image is too large. Try one under 5 MB.');
    busy = true;
    var url = URL.createObjectURL(file);
    $('busy-img').src = url;
    show('s-busy');
    $('inspect').scrollIntoView({ behavior: 'smooth', block: 'start' });
    var started = Date.now(), thumb, big;
    Promise.all([resize(url, 1024, 0.9), resize(url, 360, 0.72)])
      .then(function (r) {
        big = r[0]; thumb = r[1];
        return fetch('/api/predict', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: big.split(',')[1] })
        });
      })
      .then(function (r) { return r.json().catch(function () { throw new Error('The server sent an unexpected reply. Try again.'); }); })
      .then(function (d) {
        if (d.error) throw new Error(d.error);
        var wait = Math.max(0, 900 - (Date.now() - started)); // let the scan animation breathe
        setTimeout(function () {
          render(d, big);
          var h = load(); h.unshift({ cls: d.top['class'], conf: d.top.confidence, thumb: thumb, at: Date.now() }); save(h); renderHistory();
        }, wait);
      })
      .catch(function (e) { fail(e.message || 'Something went wrong. Try again.'); })
      .then(function () { busy = false; });
  };
  var fail = function (msg) { $('err-text').textContent = msg; show('s-err'); busy = false; };

  var drop = $('drop'), file = $('file'), cam = $('camfile');
  drop.addEventListener('click', function () { file.click(); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
  $('pick').addEventListener('click', function () { file.click(); });
  $('cam').addEventListener('click', function () { cam.click(); });
  file.addEventListener('change', function () { analyse(file.files[0]); file.value = ''; });
  cam.addEventListener('change', function () { analyse(cam.files[0]); cam.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { analyse(e.dataTransfer.files[0]); });
  // drop anywhere on the page
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('drop', function (e) { e.preventDefault(); if (!$('s-idle').hidden && e.dataTransfer.files[0]) analyse(e.dataTransfer.files[0]); });
  // paste
  window.addEventListener('paste', function (e) {
    var items = (e.clipboardData && e.clipboardData.items) || [];
    for (var i = 0; i < items.length; i++) if (items[i].type.indexOf('image/') === 0) { analyse(items[i].getAsFile()); break; }
  });

  $('again').addEventListener('click', function () { show('s-idle'); });
  $('retry').addEventListener('click', function () { show('s-idle'); });
  $('share').addEventListener('click', function () {
    if (!last) return;
    var text = 'Fashion AI Studio: ' + last.top['class'] + ' (' + Math.round(last.top.confidence * 100) + '% confidence)';
    if (navigator.share) navigator.share({ title: 'Fabric inspection', text: text, url: location.origin }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + location.origin).then(function () { toast('Result copied'); });
  });
})();
