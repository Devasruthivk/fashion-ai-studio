<?php $page = 'about'; $title = 'About'; include __DIR__ . '/includes/header.php'; ?>
<section class="container section narrow">
  <h1>About this project</h1>
  <p>Fashion AI Studio is an image classification web app built on a model trained in Roboflow (project <code><?= e(cfg()['project_id']) ?></code>, version <?= (int)cfg()['version'] ?>).</p>
  <h3>How it works</h3>
  <ol>
    <li>You upload a JPG, PNG, or WEBP image.</li>
    <li>The server validates it, saves it, and sends it to the Roboflow hosted inference API.</li>
    <li>Roboflow returns each class with a confidence score.</li>
    <li>The top prediction is shown and stored in a local SQLite history.</li>
  </ol>
  <h3>Stack</h3>
  <p>HTML, CSS, vanilla JavaScript, PHP 8 with cURL, SQLite, running on XAMPP.</p>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
