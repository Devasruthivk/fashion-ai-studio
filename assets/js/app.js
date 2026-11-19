(function () {
  var MAX = 5 * 1024 * 1024, TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  var $ = function (id) { return document.getElementById(id); };

  var dz = $('dropzone');
  if (dz) {
    var input = $('file'), preview = $('preview'), err = $('error'), file = null;
    var showErr = function (m) { err.textContent = m; err.hidden = !m; };

    var setFile = function (f) {
      showErr('');
      if (!f) return;
      if (TYPES.indexOf(f.type) < 0) return showErr('Only JPG, PNG, or WEBP images are allowed.');
      if (f.size > MAX) return showErr('Image is larger than 5 MB.');
      file = f;
      preview.src = URL.createObjectURL(f);
      preview.hidden = false;
    };

    dz.addEventListener('click', function () { input.click(); });
    dz.addEventListener('keydown', function (e) { if (e.key === 'Enter') input.click(); });
    input.addEventListener('change', function () { setFile(input.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('over'); });
    });
    dz.addEventListener('drop', function (e) { setFile(e.dataTransfer.files[0]); });

    $('go').addEventListener('click', function () {
      if (!file) return showErr('Choose an image first.');
      showErr('');
      var btn = $('go');
      btn.disabled = true;
      $('spinner').hidden = false;
      $('result-empty').hidden = true;
      $('result-body').hidden = true;
      var fd = new FormData();
      fd.append('image', file);
      fetch('api/predict.php', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.error) throw new Error(d.error);
          $('top-class').textContent = d.top['class'];
          $('top-conf').textContent = (d.top.confidence * 100).toFixed(1) + '%';
          var bars = $('bars');
          bars.innerHTML = '';
          d.predictions.forEach(function (p, i) {
            var pct = (p.confidence * 100).toFixed(1);
            var row = document.createElement('div');
            var lab = document.createElement('div');
            lab.className = 'bar-row';
            var a = document.createElement('span'); a.textContent = p['class'];
            var b = document.createElement('span'); b.textContent = pct + '%';
            lab.appendChild(a); lab.appendChild(b);
            var bar = document.createElement('div'); bar.className = 'bar';
            var fill = document.createElement('i');
            fill.style.width = pct + '%';
            if (i === 0) fill.className = 'top-bar';
            bar.appendChild(fill);
            row.appendChild(lab); row.appendChild(bar);
            bars.appendChild(row);
          });
          $('result-body').hidden = false;
          $('st-n').textContent = d.stats.total;
          $('st-c').textContent = d.stats.avg + '%';
          $('st-k').textContent = d.stats.classes;
        })
        .catch(function (e) {
          showErr(e.message || 'Something went wrong. Try again.');
          $('result-empty').hidden = false;
        })
        .then(function () { btn.disabled = false; $('spinner').hidden = true; });
    });
  }

  // History page: filter and delete
  var table = $('hist');
  if (table) {
    var q = $('q'), cls = $('cls');
    var apply = function () {
      var term = q.value.toLowerCase(), c = cls.value;
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var name = tr.dataset['class'];
        tr.hidden = !(name.toLowerCase().indexOf(term) >= 0 && (!c || name === c));
      });
    };
    q.addEventListener('input', apply);
    cls.addEventListener('change', apply);
    table.addEventListener('click', function (e) {
      var b = e.target.closest('.del');
      if (!b || !confirm('Delete this prediction?')) return;
      var fd = new FormData();
      fd.append('id', b.dataset.id);
      fetch('api/delete.php', { method: 'POST', body: fd })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.ok) b.closest('tr').remove(); else alert(d.error || 'Delete failed.'); });
    });
  }
})();
