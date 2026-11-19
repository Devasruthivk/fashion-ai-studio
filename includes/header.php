<?php
require_once __DIR__ . '/db.php';
$page = $page ?? '';
$title = ($title ?? 'Home') . ' | ' . cfg()['app_name'];
function nav($href, $label, $key, $page) {
    echo '<a href="' . e($href) . '"' . ($page === $key ? ' class="active"' : '') . '>' . e($label) . '</a>';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?></title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header class="nav">
  <div class="container nav-inner">
    <a class="logo" href="index.php"><span class="logo-dot"></span><?= e(cfg()['app_name']) ?></a>
    <button class="nav-toggle" aria-label="Menu" onclick="document.querySelector('.nav-links').classList.toggle('open')">&#9776;</button>
    <nav class="nav-links">
      <?php nav('index.php', 'Home', 'home', $page); nav('classify.php', 'Classify', 'classify', $page); nav('history.php', 'History', 'history', $page); nav('about.php', 'About', 'about', $page); ?>
    </nav>
  </div>
</header>
<main>
