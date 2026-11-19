(function () {
  var MAX = 5 * 1024 * 1024, TYPES = ['image/jpeg', 'image/png', 'image/webp'], KEY = 'fas-history';
  var $ = function (id) { return document.getElementById(id); };
  $('yr').textContent = new Date().getFullYear();

  $('theme').addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { $('links').classList.remove('open'); });
  });

  var WARN = {
    low: 'The model is unsure about this photo. Try a clearer, closer, evenly lit image, and double-check by eye.',
    medium: 'Fairly confident, but another class is close. A second photo can confirm.'
  };
  var LABEL = { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' };

  // ---- history (localStorage) ----
  var load = function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  var save = function (h) { try { localStorage.setItem(KEY, JSON.stringify(h.slice(0, 30))); } catch (e) {} };
  var lvl = function (c) { return c >= 0.6 ? 'high' : c >= 0.45 ? 'medium' : 'low'; };
  var renderHistory = function () {
    var h = load(), grid = $('hist');
    grid.innerHTML = '';
    $('hist-empty').hidden = h.length > 0;
    $('hs-n').textContent = h.length;
    h.forEach(function (r, i) {
      var card = document.createElement('article'); card.className = 'hist-card';
      var img = document.createElement('img'); img.src = r.thumb; img.alt = r.cls; img.loading = 'lazy';
      var body = document.createElement('div'); body.className = 'hist-body';
      var h3 = document.createElement('h3'); h3.textContent = r.cls;
      var date = document.createElement('span'); date.className = 'muted'; date.textContent = new Date(r.at).toLocaleString();
      var row = document.createElement('div'); row.className = 'hist-row';
      var pill = document.createElement('span'); pill.className = 'pill ' + lvl(r.conf); pill.textContent = (r.conf * 100).toFixed(1) + '%';
      var del = document.createElement('button'); del.className = 'btn btn-danger'; del.textContent = 'Delete';
      del.addEventListener('click', function () { var x = load(); x.splice(i, 1); save(x); renderHistory(); });
      row.appendChild(pill); row.appendChild(del);
      body.appendChild(h3); body.appendChild(date); body.appendChild(row);
      card.appendChild(img); card.appendChild(body);
      grid.appendChild(card);
    });
  };
  $('clear-all').addEventListener('click', function () { if (confirm('Clear all history on this device?')) { save([]); renderHistory(); } });
  renderHistory();

  // ---- image helpers ----
  var resize = function (file, maxSide, quality) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(1, maxSide / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = function () { reject(new Error('Could not read that image.')); };
      img.src = URL.createObjectURL(file);
    });
  };

  // ---- classify ----
  var dz = $('dropzone'), input = $('file'), preview = $('preview'), pw = $('pw'), err = $('error'), file = null;
  var showErr = function (m) { err.textContent = m; err.hidden = !m; };
  var setFile = function (f) {
    showErr('');
    if (!f) return;
    if (TYPES.indexOf(f.type) < 0) return showErr('Only JPG, PNG, or WEBP images are allowed.');
    if (f.size > MAX) return showErr('Image is larger than 5 MB.');
    file = f; preview.src = URL.createObjectURL(f); pw.hidden = false;
  };
  dz.addEventListener('click', function () { input.click(); });
  dz.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  input.addEventListener('change', function () { setFile(input.files[0]); });
  $('clear').addEventListener('click', function () { file = null; input.value = ''; pw.hidden = true; });
  ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over'); }); });
  dz.addEventListener('drop', function (e) { setFile(e.dataTransfer.files[0]); });

  var render = function (d) {
    $('top-class').textContent = d.top['class'];
    var conf = $('top-conf'); conf.textContent = (d.top.confidence * 100).toFixed(1) + '%'; conf.className = 'conf ' + d.level;
    var pill = $('level'); pill.textContent = LABEL[d.level]; pill.className = 'pill ' + d.level;
    $('info').textContent = (d.info && d.info.text) || '';
    $('warn').hidden = d.level === 'high';
    if (d.level !== 'high') $('warn-text').textContent = WARN[d.level];
    var bars = $('bars'); bars.innerHTML = ''; var fills = [];
    d.predictions.forEach(function (p, i) {
      var pct = (p.confidence * 100).toFixed(1);
      var row = document.createElement('div');
      var lab = document.createElement('div'); lab.className = 'bar-row';
      var a = document.createElement('span'); a.textContent = p['class'];
      var b = document.createElement('strong'); b.textContent = pct + '%';
      lab.appendChild(a); lab.appendChild(b);
      var bar = document.createElement('div'); bar.className = 'bar';
      var fill = document.createElement('i'); if (i === 0) fill.className = 'top-bar';
      bar.appendChild(fill); row.appendChild(lab); row.appendChild(bar); bars.appendChild(row);
      fills.push([fill, pct]);
    });
    $('result-body').hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fills.forEach(function (x) { x[0].style.width = x[1] + '%'; }); }); });
  };

  $('go').addEventListener('click', function () {
    if (!file) return showErr('Choose an image first.');
    showErr('');
    var btn = $('go');
    btn.disabled = true; btn.textContent = 'Analysing...';
    $('spinner').hidden = false; $('result-empty').hidden = true; $('result-body').hidden = true;
    var thumb;
    Promise.all([resize(file, 1024, 0.9), resize(file, 240, 0.7)])
      .then(function (r) {
        thumb = r[1];
        return fetch('/api/predict', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: r[0].split(',')[1] })
        });
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.error) throw new Error(d.error);
        render(d);
        var h = load(); h.unshift({ cls: d.top['class'], conf: d.top.confidence, thumb: thumb, at: Date.now() }); save(h); renderHistory();
      })
      .catch(function (e) { showErr(e.message || 'Something went wrong. Try again.'); $('result-empty').hidden = false; })
      .then(function () { btn.disabled = false; btn.textContent = 'Classify image'; $('spinner').hidden = true; });
  });
})();
