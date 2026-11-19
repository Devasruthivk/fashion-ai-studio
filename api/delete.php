<?php
require_once __DIR__ . '/../includes/db.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Use POST.']); exit; }
$id = (int)($_POST['id'] ?? 0);
$st = db()->prepare('SELECT filename FROM predictions WHERE id = ?');
$st->execute([$id]);
$row = $st->fetch();
if (!$row) { http_response_code(404); echo json_encode(['error' => 'Not found.']); exit; }
$path = __DIR__ . '/../uploads/' . basename($row['filename']);
if (is_file($path)) unlink($path);
db()->prepare('DELETE FROM predictions WHERE id = ?')->execute([$id]);
echo json_encode(['ok' => true]);
