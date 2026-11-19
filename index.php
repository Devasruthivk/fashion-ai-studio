<?php $page = 'home'; $title = 'Home'; include __DIR__ . '/includes/header.php'; ?>
<section class="hero">
  <div class="container">
    <span class="badge">Powered by Roboflow</span>
    <h1>Classify any image in seconds</h1>
    <p class="lead">Upload a photo and our trained model predicts its class with a confidence score.</p>
    <a class="btn btn-primary" href="classify.php">Try it now</a>
  </div>
</section>
<section class="container grid-3">
  <div class="card"><h3>Fast</h3><p>Results come back in a couple of seconds, straight from the Roboflow hosted model.</p></div>
  <div class="card"><h3>Accurate</h3><p>Every class gets a confidence score so you can see how sure the model is.</p></div>
  <div class="card"><h3>Private</h3><p>Your API key stays on the server and images are stored only on this machine.</p></div>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
