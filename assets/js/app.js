(function () {
  var MAX = 5 * 1024 * 1024, TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  var $ = function (id) { return document.getElementById(id); };

  // Theme toggle
  var tb = $('theme');
  if (tb) tb.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  var WARN = {
    low: 'The model is unsure about this photo. Try a clearer, closer, evenly lit image, and double-check by eye.',
    medium: 'Fairly confident, but another class is close. A second photo can confirm.'
  };
  var LABEL = { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' };

  var dz = $('dropzone');
  if (dz) {
    var input = $('file'), preview = $('preview'), pw = $('pw'), err = $('error'), file = null;
    var showErr = function (m) { err.textContent = m; err.hidden = !m; };

    var setFile = function (f) {
      showErr('');
      if (!f) return;
      if (TYPES.indexOf(f.type) < 0) return showErr('Only JPG, PNG, or WEBP images are allowed.');
      if (f.size > MAX) return showErr('Image is larger than 5 MB.');
      file = f;
      preview.src = URL.createObjectURL(f);
      pw.hidden = false;
    };

    dz.addEventListener('click', function () { input.click(); });
    dz.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', function () { setFile(input.files[0]); });
    $('clear').addEventListener('click', function () { file = null; input.value = ''; pw.hidden = true; });
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over'); });
    });
    dz.addEventListener('drop', function (e) { setFile(e.dataTransfer.files[0]); });

    var render = function (d) {
      $('top-class').textContent = d.top['class'];
      var conf = $('top-conf');
      conf.textContent = (d.top.confidence * 100).toFixed(1) + '%';
      conf.className = 'conf ' + d.level;
      var pill = $('level');
      pill.textContent = LABEL[d.level];
      pill.className = 'pill ' + d.level;
      $('info').textContent = (d.info && d.info.text) || '';
      var warn = $('warn');
      warn.hidden = d.level === 'high';
      if (!warn.hidden) $('warn-text').textContent = WARN[d.level];

      var bars = $('bars');
      bars.innerHTML = '';
      var fills = [];
      d.predictions.forEach(function (p, i) {
        var pct = (p.confidence * 100).toFixed(1);
        var row = document.createElement('div');
        var lab = document.createElement('div');
        lab.className = 'bar-row';
        var a = document.createElement('span'); a.textContent = p['class'];
        var b = document.createElement('strong'); b.textContent = pct + '%';
        lab.appendChild(a); lab.appendChild(b);
        var bar = document.createElement('div'); bar.className = 'bar';
        var fill = document.createElement('i');
        if (i === 0) fill.className = 'top-bar';
        bar.appendChild(fill);
        row.appendChild(lab); row.appendChild(bar);
        bars.appendChild(row);
        fills.push([fill, pct]);
      });
      $('result-body').hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        fills.forEach(function (x) { x[0].style.width = x[1] + '%'; });
      }); });
      $('st-n').textContent = d.stats.total;
      $('st-c').textContent = d.stats.avg + '%';
      $('st-k').textContent = d.stats.classes;
    };

    $('go').addEventListener('click', function () {
      if (!file) return showErr('Choose an image first.');
      showErr('');
      var btn = $('go');
      btn.disabled = true; btn.textContent = 'Analysing...';
      $('spinner').hidden = false;
      $('result-empty').hidden = true;
      $('result-body').hidden = true;
      var fd = new FormData();
      fd.append('image', file);
      fetch('api/predict.php', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.error) throw new Error(d.error);
          render(d);
        })
        .catch(function (e) {
          showErr(e.message || 'Something went wrong. Try again.');
          $('result-empty').hidden = false;
        })
        .then(function () { btn.disabled = false; btn.textContent = 'Classify image'; $('spinner').hidden = true; });
    });
  }

  // History page: filter and delete
  var grid = $('hist');
  if (grid) {
    var q = $('q'), cls = $('cls');
    var apply = function () {
      var term = q.value.toLowerCase(), c = cls.value;
      grid.querySelectorAll('.hist-card').forEach(function (card) {
        var name = card.dataset['class'];
        card.hidden = !(name.toLowerCase().indexOf(term) >= 0 && (!c || name === c));
      });
    };
    q.addEventListener('input', apply);
    cls.addEventListener('change', apply);
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.del');
      if (!b || !confirm('Delete this prediction?')) return;
      var fd = new FormData();
      fd.append('id', b.dataset.id);
      fetch('api/delete.php', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.ok) b.closest('.hist-card').remove(); else alert(d.error || 'Delete failed.'); });
    });
  }
})();
