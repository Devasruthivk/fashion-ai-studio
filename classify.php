<?php
$page = 'classify'; $title = 'Classify';
include __DIR__ . '/includes/header.php';
$s = db()->query('SELECT COUNT(*) AS n, AVG(confidence) AS avgc, COUNT(DISTINCT top_class) AS k FROM predictions')->fetch();
?>
<section class="container section">
  <h1>Classify a fabric image</h1>
  <p class="muted" style="margin-bottom:22px">Upload a clear, well-lit close-up of the fabric for the best result.</p>
  <div class="stats">
    <div class="stat"><span>Images checked</span><strong id="st-n"><?= (int)$s['n'] ?></strong></div>
    <div class="stat"><span>Avg confidence</span><strong id="st-c"><?= $s['avgc'] !== null ? round($s['avgc'] * 100) . '%' : '-' ?></strong></div>
    <div class="stat"><span>Classes seen</span><strong id="st-k"><?= (int)$s['k'] ?></strong></div>
  </div>
  <div class="two-col">
    <div class="card">
      <div id="dropzone" class="dropzone" tabindex="0" role="button" aria-label="Upload an image">
        <div class="dz-icon">&#8679;</div>
        <p><strong>Drag and drop an image</strong></p>
        <p class="muted">or click to browse &middot; JPG, PNG, WEBP up to 5 MB</p>
      </div>
      <div class="preview-wrap" id="pw" hidden>
        <img id="preview" alt="Selected image preview">
        <button class="clear" id="clear" type="button" aria-label="Remove image">&times;</button>
      </div>
      <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
      <button id="go" class="btn btn-primary full" type="button">Classify image</button>
      <div id="error" class="error" role="alert" hidden></div>
      <ul class="tips" style="margin-top:18px">
        <li>Fill the frame with the fabric.</li>
        <li>Use even lighting, avoid shadows and glare.</li>
        <li>One defect type per photo gives the clearest result.</li>
      </ul>
    </div>

    <div class="card" id="result" aria-live="polite">
      <div id="result-empty" class="placeholder"><div class="big">&#9737;</div><p>Your result will appear here.</p></div>
      <div id="spinner" class="spinner" hidden></div>
      <div id="result-body" hidden>
        <div class="verdict">
          <div>
            <p class="muted" style="margin:0">Top prediction</p>
            <h2 id="top-class"></h2>
            <span id="level" class="pill"></span>
          </div>
          <div id="top-conf" class="conf"></div>
        </div>
        <p id="info" class="muted"></p>
        <div id="warn" class="alert" hidden><span>&#9888;</span><span id="warn-text"></span></div>
        <div id="bars"></div>
      </div>
    </div>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
