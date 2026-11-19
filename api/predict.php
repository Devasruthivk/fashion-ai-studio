<?php
require_once __DIR__ . '/../includes/db.php';
header('Content-Type: application/json');

function fail(string $msg, int $code = 400): never {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

/** Call Roboflow once. Returns [class => confidence]. */
function roboflow(string $bytes, array $cfg): array {
    // confidence=0 makes Roboflow return every class
    $base = !empty($cfg['model_url']) ? $cfg['model_url']
        : sprintf('https://classify.roboflow.com/%s/%s', rawurlencode($cfg['project_id']), rawurlencode((string)$cfg['version']));
    $url = $base . '?api_key=' . rawurlencode($cfg['api_key']) . '&confidence=0';
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => base64_encode($bytes),
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cerr = curl_error($ch);
    curl_close($ch);

    if ($body === false) fail('Could not reach Roboflow: ' . $cerr . ' (if this mentions SSL, see the README cacert.pem fix).', 502);
    $data = json_decode($body, true);
    if ($status === 401 || $status === 403) fail('Roboflow rejected the API key.', 502);
    if ($status >= 400 || !is_array($data)) fail('Roboflow error: ' . ($data['message'] ?? $data['error'] ?? 'HTTP ' . $status), 502);

    $out = [];
    foreach (($data['predictions'] ?? []) as $k => $v) {
        if (!is_array($v)) continue;
        if (isset($v['class'])) $out[$v['class']] = (float)$v['confidence'];          // single-label
        elseif (isset($v['confidence'])) $out[(string)$k] = (float)$v['confidence'];   // multi-label
    }
    return $out;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Use POST.', 405);
$cfg = cfg();
if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) fail('No image received or upload failed.');

$f = $_FILES['image'];
if ($f['size'] > $cfg['max_bytes']) fail('Image is larger than 5 MB.');

$mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
$ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
if (!$ext || @getimagesize($f['tmp_name']) === false) fail('Only JPG, PNG, or WEBP images are allowed.');

if (empty($cfg['api_key']) || $cfg['api_key'] === 'YOUR_ROBOFLOW_API_KEY') fail('Roboflow API key is not set in includes/config.php.', 500);
if (!function_exists('curl_init')) fail('The PHP cURL extension is not enabled.', 500);

$bytes = file_get_contents($f['tmp_name']);
$runs = [roboflow($bytes, $cfg)];

// Test-time augmentation: also classify a mirrored copy and average the scores (more stable results).
if (!empty($cfg['tta']) && function_exists('imagecreatefromstring') && function_exists('imageflip')) {
    $im = @imagecreatefromstring($bytes);
    if ($im) {
        imageflip($im, IMG_FLIP_HORIZONTAL);
        ob_start(); imagejpeg($im, null, 92); $flipped = ob_get_clean();
        imagedestroy($im);
        if ($flipped) $runs[] = roboflow($flipped, $cfg);
    }
}

$sum = [];
foreach ($runs as $r) foreach ($r as $cls => $c) $sum[$cls] = ($sum[$cls] ?? 0) + $c;
if (!$sum) fail('The model returned no predictions.', 502);
$preds = [];
foreach ($sum as $cls => $c) $preds[] = ['class' => $cls, 'confidence' => round($c / count($runs), 4)];
usort($preds, fn($a, $b) => $b['confidence'] <=> $a['confidence']);
$top = $preds[0];
$margin = $top['confidence'] - ($preds[1]['confidence'] ?? 0);

// How much to trust the answer
if ($top['confidence'] >= 0.6 && $margin >= 0.15) $level = 'high';
elseif ($top['confidence'] >= 0.45 && $margin >= 0.05) $level = 'medium';
else $level = 'low';

$dir = __DIR__ . '/../uploads';
if (!is_dir($dir)) mkdir($dir, 0755, true);
$name = bin2hex(random_bytes(12)) . '.' . $ext;
if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) fail('Could not save the image.', 500);

$st = db()->prepare('INSERT INTO predictions (filename, top_class, confidence, all_json) VALUES (?, ?, ?, ?)');
$st->execute([$name, $top['class'], $top['confidence'], json_encode($preds)]);

$s = db()->query('SELECT COUNT(*) AS n, AVG(confidence) AS avgc, COUNT(DISTINCT top_class) AS k FROM predictions')->fetch();
echo json_encode([
    'top' => $top, 'predictions' => $preds, 'level' => $level, 'margin' => round($margin, 4),
    'info' => class_info($top['class']), 'views' => count($runs),
    'stats' => ['total' => (int)$s['n'], 'avg' => round($s['avgc'] * 100), 'classes' => (int)$s['k']],
]);
