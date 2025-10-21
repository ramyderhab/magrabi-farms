// Netlify Function: save.js
// إعدادات بيئية مطلوبة في Netlify:
// GITHUB_TOKEN  -> personal access token (repo scope أو repo:contents على الأقل)
// GITHUB_REPO   -> owner/repo  مثل: youruser/yourrepo
// GITHUB_BRANCH -> branch (مثلاً: main)  (افتراضي 'main' إذا لم تضبط)
// ADMIN_SECRET  -> قيمة سرية لمصادقة الحفظ من الواجهة
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Use POST' }) };
    }
    const body = JSON.parse(event.body || '{}');
    const { admin_secret, path, commit_message, content } = body;
    if (!admin_secret || !path || !content) {
      return { statusCode: 400, body: JSON.stringify({ error: 'admin_secret, path and content required' }) };
    }

    const ADMIN_SECRET = process.env.ADMIN_SECRET;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

    if (!ADMIN_SECRET || !GITHUB_TOKEN || !GITHUB_REPO) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured. Set ADMIN_SECRET, GITHUB_TOKEN and GITHUB_REPO.' }) };
    }
    if (admin_secret !== ADMIN_SECRET) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Invalid admin secret' }) };
    }

    const ownerRepo = GITHUB_REPO;
    const apiBase = `https://api.github.com/repos/${ownerRepo}/contents/${encodeURIComponent(path)}`;

    const contentStr = JSON.stringify(content, null, 2);
    const b64 = Buffer.from(contentStr, 'utf8').toString('base64');

    // الحصول على sha للملف إن وجد
    const getRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'netlify-function' }
    });

    let sha;
    if (getRes.status === 200) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }
    const putBody = { message: commit_message || 'Update via web UI', content: b64, branch: GITHUB_BRANCH };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'netlify-function', 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody)
    });
    const putJson = await putRes.json();
    if (putRes.ok) {
      return { statusCode: 200, body: JSON.stringify({ message: 'File saved', result: putJson }) };
    } else {
      return { statusCode: putRes.status, body: JSON.stringify({ error: 'GitHub API error', details: putJson }) };
    }
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};