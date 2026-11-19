# Fashion AI Studio

An image classification website built on a Roboflow model, running on XAMPP (Apache + PHP + SQLite).

## Setup

1. Install XAMPP and start **Apache** in the XAMPP Control Panel.
2. Put this folder at `C:\xampp\htdocs\fashion-ai-studio`.
3. Copy `includes/config.sample.php` to `includes/config.php` and set:
   - `project_id` - your Roboflow project ID
   - `version` - model version number (Roboflow > Versions)
   - `api_key` - your Roboflow API key (kept server-side, never sent to the browser)
4. Make sure these lines are enabled (no leading `;`) in `C:\xampp\php\php.ini`, then restart Apache:
   ```
   extension=curl
   extension=pdo_sqlite
   extension=sqlite3
   extension=fileinfo
   ```
5. Open http://localhost/fashion-ai-studio/

## Pages

- `index.php` - home
- `classify.php` - upload and classify an image
- `history.php` - past predictions with search, filter, and delete
- `about.php` - how it works

## SSL error on Windows ("SSL certificate problem")

1. Download `cacert.pem` from https://curl.se/ca/cacert.pem and save it as `C:\xampp\php\extras\ssl\cacert.pem`.
2. In `php.ini`, set:
   ```
   curl.cainfo = "C:\xampp\php\extras\ssl\cacert.pem"
   openssl.cafile = "C:\xampp\php\extras\ssl\cacert.pem"
   ```
3. Restart Apache.

## Security notes

- `includes/config.php` is git-ignored. Never commit your API key.
- Uploads are validated (type, size, image check), renamed randomly, and PHP execution is blocked in `uploads/`.
