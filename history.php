<?php
$page = 'history'; $title = 'History';
include __DIR__ . '/includes/header.php';
$classes = db()->query('SELECT DISTINCT top_class FROM predictions ORDER BY top_class')->fetchAll(PDO::FETCH_COLUMN);
$rows = db()->query('SELECT * FROM predictions ORDER BY id DESC')->fetchAll();
function lvl(float $c): string { return $c >= 0.6 ? 'high' : ($c >= 0.45 ? 'medium' : 'low'); }
?>
<section class="container section">
  <h1>History</h1>
  <p class="muted" style="margin-bottom:20px"><?= count($rows) ?> saved prediction<?= count($rows) === 1 ? '' : 's' ?>.</p>
  <?php if (!$rows): ?>
    <div class="card placeholder"><div class="big">&#128247;</div><h3>No predictions yet</h3><p>Classify your first image to see it here.</p><a class="btn btn-primary" href="classify.php">Classify an image</a></div>
  <?php else: ?>
  <div class="filters">
    <input type="search" id="q" placeholder="Search by class" aria-label="Search by class">
    <select id="cls" aria-label="Filter by class"><option value="">All classes</option>
      <?php foreach ($classes as $c): ?><option><?= e($c) ?></option><?php endforeach; ?>
    </select>
  </div>
  <div class="hist-grid" id="hist">
    <?php foreach ($rows as $r): $l = lvl((float)$r['confidence']); ?>
    <article class="hist-card" data-class="<?= e($r['top_class']) ?>">
      <img src="uploads/<?= e($r['filename']) ?>" alt="<?= e($r['top_class']) ?>" loading="lazy">
      <div class="hist-body">
        <h3><?= e($r['top_class']) ?></h3>
        <span class="muted"><?= e($r['created_at']) ?></span>
        <div class="hist-row">
          <span class="pill <?= $l ?>"><?= e(round($r['confidence'] * 100, 1)) ?>%</span>
          <button class="btn btn-danger del" data-id="<?= (int)$r['id'] ?>">Delete</button>
        </div>
      </div>
    </article>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
