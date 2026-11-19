<?php
function cfg(): array {
    static $c = null;
    if ($c === null) {
        $file = __DIR__ . '/config.php';
        $c = require (file_exists($file) ? $file : __DIR__ . '/config.sample.php');
    }
    return $c;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dir = dirname(__DIR__) . '/data';
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $pdo = new PDO('sqlite:' . $dir . '/app.sqlite');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            top_class TEXT NOT NULL,
            confidence REAL NOT NULL,
            all_json TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )');
    }
    return $pdo;
}

/** Human-friendly description of each class the model knows. */
function class_info(string $name): array {
    $all = [
        'structural damage'     => ['icon' => '⚠', 'text' => 'Holes, tears, or broken threads that weaken the fabric.'],
        'surface discoloration' => ['icon' => '◐', 'text' => 'Stains, fading, or uneven colour on the fabric surface.'],
        'seam and edge fraying' => ['icon' => '≋', 'text' => 'Loose threads or unravelling along seams and edges.'],
    ];
    return $all[strtolower($name)] ?? ['icon' => '●', 'text' => 'Predicted by your Roboflow model.'];
}

function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
