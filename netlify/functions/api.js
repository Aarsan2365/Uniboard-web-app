// Netlify reuses this module on warm invocations. Never call app.listen here.
process.env.UNIBOARD_SERVERLESS = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.UPLOAD_STORAGE = process.env.UPLOAD_STORAGE || 'mongodb';
const serverless = require('../../backend/node_modules/serverless-http');
const { isIP } = require('node:net');
const { app } = require('../../backend/server');
const { connectDB } = require('../../backend/config/db');
let indexedDatabase;
let pendingIndex;
const jsonError = (statusCode, message) => ({ statusCode, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify({ message }) });
const handle = serverless(app, {
  binary: ['image/*', 'application/pdf', 'application/octet-stream'],
  request: (req, event) => {
    // Netlify injects this header. Do not trust arbitrary x-forwarded-for lists.
    const ip = req.headers['x-nf-client-connection-ip'] || event.requestContext?.identity?.sourceIp;
    req.netlifyClientIP = isIP(ip || '') ? ip : 'unknown';
  },
  response: async res => { await res.req?.uploadCleanupPromise; }
});
exports.handler = async (event, context = {}) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || /replace_with|change_this|change_me/i.test(secret)) {
    return jsonError(503, 'Set a unique JWT_SECRET of at least 32 characters in Netlify Environment variables.');
  }
  if (process.env.UPLOAD_STORAGE !== 'mongodb') return jsonError(503, 'Netlify requires UPLOAD_STORAGE=mongodb for persistent attachments.');
  const bytes = typeof event.body === 'string' ? Buffer.byteLength(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : 0;
  if (bytes > 4 * 1024 * 1024 + 64 * 1024) return jsonError(413, 'Upload at most one image and one PDF, each up to 2 MB.');
  try {
    const connection = await connectDB();
    if (indexedDatabase !== connection.db) {
      if (!pendingIndex) pendingIndex = connection.db.collection('apiRateLimits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
        .then(() => { indexedDatabase = connection.db; }).finally(() => { pendingIndex = null; });
      await pendingIndex;
    }
  } catch {
    console.error('Netlify database connection failed. Check MONGODB_URI, Atlas credentials and Network Access.');
    return jsonError(503, 'Database connection failed. Check the Atlas connection settings in Netlify.');
  }
  const prefix = '/.netlify/functions/api';
  const sourcePath = event.path || '/';
  const forwarded = { ...event, path: sourcePath === prefix ? '/' : sourcePath.startsWith(prefix + '/') ? sourcePath.slice(prefix.length) : sourcePath };
  try {
    const result = await handle(forwarded, context);
    if (Buffer.byteLength(result.body || '', 'utf8') > 6 * 1024 * 1024 - 8192) {
      return jsonError(413, 'This legacy attachment is too large for this deployment. Ask an administrator to re-upload a file up to 2 MB.');
    }
    return result;
  } catch {
    console.error('Netlify API request failed.');
    return jsonError(500, 'The API could not complete the request. Check Netlify Function logs.');
  }
};
