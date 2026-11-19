<?php
$page = 'home'; $title = 'Home'; include __DIR__ . '/includes/header.php';
$s = db()->query('SELECT COUNT(*) AS n, AVG(confidence) AS a FROM predictions')->fetch();
$classes = ['Structural damage', 'Surface Discoloration', 'Seam and Edge Fraying'];
?>
<section class="hero">
  <div class="container">
    <span class="badge">&#10022; AI fabric defect detection</span>
    <h1>Spot fabric defects <span class="grad">in seconds</span></h1>
    <p class="lead">Upload a photo of any fabric. Our Roboflow-trained model tells you what kind of defect it sees, and how sure it is.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="classify.php">Try it now &rarr;</a>
      <a class="btn" href="about.php">How it works</a>
    </div>
    <div class="hero-stats">
      <div><strong>3</strong><span>defect classes</span></div>
      <div><strong><?= (int)$s['n'] ?></strong><span>images checked</span></div>
      <div><strong>&lt; 3 s</strong><span>per result</span></div>
    </div>
  </div>
</section>

<section class="container block">
  <h2 class="center">What it can detect</h2>
  <p class="muted center" style="margin-bottom:24px">Three common fabric problems, each with a confidence score.</p>
  <div class="grid-3">
    <?php foreach ($classes as $c): $i = class_info($c); ?>
    <div class="card class-card">
      <div class="ico"><?= $i['icon'] ?></div>
      <h3><?= e($c) ?></h3>
      <p class="muted"><?= e($i['text']) ?></p>
    </div>
    <?php endforeach; ?>
  </div>
</section>

<section class="container block">
  <h2 class="center" style="margin-bottom:24px">How it works</h2>
  <div class="grid-3">
    <div class="card"><div class="step-num">1</div><h3>Upload a photo</h3><p class="muted">Drag in a JPG, PNG, or WEBP up to 5 MB.</p></div>
    <div class="card"><div class="step-num">2</div><h3>Model analyses it</h3><p class="muted">The image is checked twice (original and mirrored) and the scores are averaged for steadier results.</p></div>
    <div class="card"><div class="step-num">3</div><h3>Get the verdict</h3><p class="muted">See the top defect, confidence for every class, and a warning when the model is unsure.</p></div>
  </div>
</section>

<section class="container block center">
  <div class="card" style="padding:40px">
    <h2>Ready to check a fabric?</h2>
    <p class="muted">It takes one upload.</p>
    <a class="btn btn-primary" href="classify.php">Start classifying &rarr;</a>
  </div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
