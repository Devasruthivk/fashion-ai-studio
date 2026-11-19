<?php
$page = 'classify'; $title = 'Classify';
include __DIR__ . '/includes/header.php';
$s = db()->query('SELECT COUNT(*) AS n, AVG(confidence) AS avgc, COUNT(DISTINCT top_class) AS k FROM predictions')->fetch();
?>
<section class="container section">
  <h1>Classify an image</h1>
  <div class="stats">
    <div class="stat"><span>Images classified</span><strong id="st-n"><?= (int)$s['n'] ?></strong></div>
    <div class="stat"><span>Avg confidence</span><strong id="st-c"><?= $s['avgc'] !== null ? round($s['avgc'] * 100) . '%' : '-' ?></strong></div>
    <div class="stat"><span>Classes seen</span><strong id="st-k"><?= (int)$s['k'] ?></strong></div>
  </div>
  <div class="two-col">
    <div class="card">
      <div id="dropzone" class="dropzone" tabindex="0">
        <div class="dz-icon">&#8679;</div>
        <p><strong>Drag and drop an image</strong></p>
        <p class="muted">or click to browse &middot; JPG, PNG, WEBP up to 5 MB</p>
        <img id="preview" alt="Preview" hidden>
      </div>
      <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
      <button id="go" class="btn btn-primary full" type="button">Classify image</button>
      <p id="error" class="error" hidden></p>
    </div>
    <div class="card" id="result">
      <p class="muted">Top prediction</p>
      <div id="result-empty" class="muted">Upload an image to see the result.</div>
      <div id="result-body" hidden>
        <div class="top"><span id="top-class"></span><span id="top-conf" class="ok"></span></div>
        <div id="bars"></div>
      </div>
      <div id="spinner" class="spinner" hidden></div>
    </div>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
