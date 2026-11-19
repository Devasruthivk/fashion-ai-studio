<?php $page = 'about'; $title = 'About'; include __DIR__ . '/includes/header.php'; ?>
<section class="container section narrow">
  <h1>About this project</h1>
  <p class="muted" style="font-size:17px">Fashion AI Studio checks fabric photos for defects using an image classification model trained in Roboflow (project <code><?= e(cfg()['project_id']) ?></code>, version <?= (int)cfg()['version'] ?>).</p>

  <div class="card" style="margin:24px 0">
    <h3>How it works</h3>
    <ol class="tips" style="font-size:15px;line-height:1.9">
      <li>You upload a JPG, PNG, or WEBP image.</li>
      <li>The server validates it and sends it, plus a mirrored copy, to the Roboflow API.</li>
      <li>The two sets of scores are averaged to reduce random mistakes.</li>
      <li>The top class is shown with a trust level (high, medium, or low) and saved to your history.</li>
    </ol>
  </div>

  <div class="card" style="margin-bottom:24px">
    <h3>Understanding the confidence</h3>
    <p class="muted"><strong>High</strong>: top score 60% or more and clearly ahead of the next class. <strong>Medium</strong>: 45% or more with a small lead. <strong>Low</strong>: the model is unsure, so take a clearer photo or check by eye.</p>
  </div>

  <div class="card">
    <h3>Built with</h3>
    <p class="muted" style="margin:0">HTML, CSS, vanilla JavaScript, PHP 8 with cURL, SQLite, and Roboflow, running on XAMPP.</p>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
