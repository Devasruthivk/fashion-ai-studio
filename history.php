<?php
$page = 'history'; $title = 'History';
include __DIR__ . '/includes/header.php';
$classes = db()->query('SELECT DISTINCT top_class FROM predictions ORDER BY top_class')->fetchAll(PDO::FETCH_COLUMN);
$rows = db()->query('SELECT * FROM predictions ORDER BY id DESC')->fetchAll();
?>
<section class="container section">
  <h1>History</h1>
  <div class="filters">
    <input type="search" id="q" placeholder="Search by class">
    <select id="cls"><option value="">All classes</option>
      <?php foreach ($classes as $c): ?><option><?= e($c) ?></option><?php endforeach; ?>
    </select>
  </div>
  <?php if (!$rows): ?>
    <div class="card"><p>No predictions yet. <a href="classify.php">Classify your first image</a>.</p></div>
  <?php else: ?>
  <div class="table-wrap">
  <table id="hist">
    <thead><tr><th>Image</th><th>Class</th><th>Confidence</th><th>Date</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($rows as $r): ?>
      <tr data-class="<?= e($r['top_class']) ?>">
        <td><img class="thumb" src="uploads/<?= e($r['filename']) ?>" alt=""></td>
        <td><?= e($r['top_class']) ?></td>
        <td><?= e(round($r['confidence'] * 100, 1)) ?>%</td>
        <td><?= e($r['created_at']) ?></td>
        <td><button class="btn btn-danger del" data-id="<?= (int)$r['id'] ?>">Delete</button></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  </div>
  <?php endif; ?>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
