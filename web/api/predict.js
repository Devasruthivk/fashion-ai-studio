// Vercel serverless function: receives { image: <base64> } and returns Roboflow predictions.
// Set ROBOFLOW_API_KEY (and optionally ROBOFLOW_MODEL_URL) in Vercel > Project > Settings > Environment Variables.
const MODEL_URL = process.env.ROBOFLOW_MODEL_URL ||
  'https://serverless.roboflow.com/deva-sruthi-s-workspace/image-detection-bft-project-2-vit-base-patch16-224-in21k-t3';

const INFO = {
  'structural damage': 'Holes, tears, or broken threads that weaken the fabric.',
  'surface discoloration': 'Stains, fading, or uneven colour on the fabric surface.',
  'seam and edge fraying': 'Loose threads or unravelling along seams and edges.',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  const key = process.env.ROBOFLOW_API_KEY;
  if (!key) return res.status(500).json({ error: 'ROBOFLOW_API_KEY is not set on the server.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const image = body && body.image;
  if (!image || typeof image !== 'string') return res.status(400).json({ error: 'No image received.' });
  if (image.length > 7 * 1024 * 1024) return res.status(413).json({ error: 'Image is larger than 5 MB.' });

  try {
    const r = await fetch(`${MODEL_URL}?api_key=${encodeURIComponent(key)}&confidence=0`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: image,
    });
    const data = await r.json().catch(() => null);
    if (r.status === 401 || r.status === 403) return res.status(502).json({ error: 'Roboflow rejected the API key.' });
    if (!r.ok || !data) return res.status(502).json({ error: 'Roboflow error: ' + ((data && (data.message || data.error)) || 'HTTP ' + r.status) });

    let preds = [];
    const p = data.predictions || [];
    if (Array.isArray(p)) preds = p.map(x => ({ class: x.class, confidence: +x.confidence }));
    else preds = Object.keys(p).map(k => ({ class: k, confidence: +p[k].confidence }));
    if (!preds.length) return res.status(502).json({ error: 'The model returned no predictions.' });
    preds.sort((a, b) => b.confidence - a.confidence);

    const top = preds[0];
    const margin = top.confidence - (preds[1] ? preds[1].confidence : 0);
    const level = top.confidence >= 0.6 && margin >= 0.15 ? 'high' : top.confidence >= 0.45 && margin >= 0.05 ? 'medium' : 'low';
    return res.status(200).json({ top, predictions: preds, level, info: { text: INFO[top.class.toLowerCase()] || '' } });
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach Roboflow. Try again.' });
  }
};
