<?php
// Copy this file to config.php and fill in your values. config.php is git-ignored.
return [
    'project_id' => 'image-detection-bft-project',
    'version'    => 2,
    // Optional: a specific trained model (overrides project_id/version)
    'model_url'  => 'https://serverless.roboflow.com/deva-sruthi-s-workspace/image-detection-bft-project-2-vit-base-patch16-224-in21k-t3',
    'tta'        => false,
    'api_key'    => 'YOUR_ROBOFLOW_API_KEY',
    'app_name'   => 'Fashion AI Studio',
    'max_bytes'  => 5 * 1024 * 1024,
];
