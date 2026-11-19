<?php
require_once __DIR__ . '/db.php';
$page = $page ?? '';
$title = ($title ?? 'Home') . ' | ' . cfg()['app_name'];
function nav($href, $label, $key, $page) {
    echo '<a href="' . e($href) . '"' . ($page === $key ? ' class="active" aria-current="page"' : '') . '>' . e($label) . '</a>';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<script>try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}</script>
</head>
<body>
<header class="nav">
  <div class="container nav-inner">
    <a class="logo" href="index.php"><span class="logo-mark">&#10022;</span><?= e(cfg()['app_name']) ?></a>
    <nav class="nav-links" id="links">
      <?php nav('index.php', 'Home', 'home', $page); nav('classify.php', 'Classify', 'classify', $page); nav('history.php', 'History', 'history', $page); nav('about.php', 'About', 'about', $page); ?>
    </nav>
    <div class="nav-right">
      <button class="icon-btn" id="theme" aria-label="Toggle dark mode" type="button">&#9680;</button>
      <button class="icon-btn nav-toggle" aria-label="Menu" type="button" onclick="document.getElementById('links').classList.toggle('open')">&#9776;</button>
    </div>
  </div>
</header>
<main>
