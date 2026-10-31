const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createPdf } = require('./fixtures/pdf');
process.env.UPLOAD_STORAGE = 'mongodb';
process.env.JWT_SECRET = 'netlify-integration-test-only-unique-secret-123456';
const { handler } = require('../../netlify/functions/api');
const { User } = require('../models');
const { uploadDirectory, documentDirectory } = require('../utils/storagePaths');
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

test('Netlify entry: configuration, DB reuse, auth, binary files, durability, limits and shared rate counters', { timeout: 180000 }, async () => {
  const db = await MongoMemoryServer.create({ instance: { args: ['--nounixsocket'] } });
  const uri = db.getUri('uniboard_netlify_test');
  const invoke = async (path, method = 'GET', data, token, status = 200, ip = '198.51.100.7', query = null, extraHeaders = {}) => {
    const headers = { host: 'uniboard-test.netlify.app', 'x-nf-client-connection-ip': ip, ...extraHeaders };
    let body = '', isBase64Encoded = false;
    if (token) headers.authorization = `Bearer ${token}`;
    if (data instanceof FormData) {
      const request = new Request('https://uniboard-test.netlify.app/', { method, body: data });
      headers['content-type'] = request.headers.get('content-type');
      const bytes = Buffer.from(await request.arrayBuffer()); headers['content-length'] = String(bytes.length);
      body = bytes.toString('base64'); isBase64Encoded = true;
    } else if (data) { body = JSON.stringify(data); headers['content-type'] = 'application/json'; }
    const result = await handler({ httpMethod: method, path, headers, body, isBase64Encoded, queryStringParameters: query }, {});
    const bytes = Buffer.from(result.body || '', result.isBase64Encoded ? 'base64' : 'utf8');
    const contentType = result.headers?.['content-type'] || '';
    const payload = contentType.includes('application/json') ? JSON.parse(bytes.toString()) : null;
    assert.equal(result.statusCode, status, `${method} ${path}: ${bytes.toString().slice(0, 300)}`);
    return { result, bytes, payload };
  };
  const prefix = '/.netlify/functions/api', pdf = createPdf('Netlify PDF timetable');
  const form = (extra = {}, image = pixel, document = pdf) => {
    const data = new FormData();
    for (const [key, value] of Object.entries({ title: 'Netlify notice', body: 'Read the PDF.', category: 'Academic', targetBatch: '2024', ...extra })) data.append(key, value);
    if (image) data.append('image', new Blob([image], { type: 'image/png' }), 'poster.png');
    if (document) data.append('pdf', new Blob([document], { type: 'application/pdf' }), 'timetable.pdf');
    return data;
  };
  try {
    process.env.MONGODB_URI = uri;
    const secret = process.env.JWT_SECRET; delete process.env.JWT_SECRET;
    await invoke('/api/health', 'GET', null, null, 503);
    process.env.JWT_SECRET = secret; process.env.UPLOAD_STORAGE = 'local';
    await invoke('/api/health', 'GET', null, null, 503);
    process.env.UPLOAD_STORAGE = 'mongodb'; delete process.env.MONGODB_URI;
    await invoke('/api/health', 'GET', null, null, 503); process.env.MONGODB_URI = uri;
    await Promise.all([invoke(prefix + '/api/health'), invoke('/api/health')]);
    assert.equal((await invoke('/api/health')).payload.database, 'connected');
    await invoke('/api/notices', 'GET', null, null, 401);
    await invoke('/api/no-such-route', 'GET', null, null, 404);
    assert.ok((await mongoose.connection.db.collection('apiRateLimits').indexes()).some(i => i.expireAfterSeconds === 0));
    const password = 'NetlifyTestPassword123!';
    await User.create({ name: 'Admin', email: 'admin@example.edu', role: 'admin', password: await bcrypt.hash(password, 10) });
    for (const batch of ['2024', '2023']) {
      await invoke(prefix + '/api/auth/register', 'POST', { name: 'Student', email: `${batch}@example.edu`, password, batch, role: 'admin' }, null, 400);
      const reg = await invoke(prefix + '/api/auth/register', 'POST', { name: 'Student', email: `${batch}@example.edu`, password, batch }, null, 201);
      assert.equal(reg.payload.user.role, 'student'); assert.equal(reg.payload.token, undefined);
    }
    const login = async (email, admin = false) => (await invoke(prefix + `/api/auth/${admin ? 'admin/' : ''}login`, 'POST', { email, password })).payload.token;
    const admin = await login('admin@example.edu', true), student = await login('2024@example.edu'), other = await login('2023@example.edu');
    await invoke('/api/auth/admin/login', 'POST', { email: '2024@example.edu', password }, null, 403);
    await invoke('/api/notices', 'POST', form(), student, 403);
    const notice = (await invoke(prefix + '/api/notices', 'POST', form(), admin, 201)).payload;
    const counts = () => mongoose.connection.db.collection('noticeFiles.files').countDocuments();
    assert.equal(await counts(), 2);
    assert.deepEqual(await fs.readdir(uploadDirectory), []); assert.deepEqual(await fs.readdir(documentDirectory), []);
    await mongoose.disconnect();
    assert.deepEqual((await invoke(prefix + notice.imageUrl)).bytes, pixel);
    const viewed = await invoke(`/api/notices/${notice.id}/pdf`, 'GET', null, student);
    assert.equal(viewed.result.isBase64Encoded, true); assert.deepEqual(viewed.bytes, pdf);
    assert.match(viewed.result.headers['content-disposition'], /^inline;/);
    const download = await invoke(`/api/notices/${notice.id}/pdf`, 'GET', null, student, 200, '198.51.100.7', { download: '1' });
    assert.match(download.result.headers['content-disposition'], /^attachment;/);
    const range = await invoke(`/api/notices/${notice.id}/pdf`, 'GET', null, student, 206, '198.51.100.7', null, { range: 'bytes=0-7' });
    assert.equal(range.bytes.toString(), '%PDF-1.4');
    await invoke(`/api/notices/${notice.id}/pdf`, 'GET', null, other, 404);
    await invoke(`/api/notices/${notice.id}/pdf`, 'GET', null, null, 401);
    await invoke(prefix + notice.pdfUrl, 'GET', null, null, 404);
    assert.equal((await invoke('/api/notices', 'GET', null, other)).payload.data.length, 0);
    await invoke('/api/notices', 'POST', form({ title: '' }), admin, 400);
    assert.equal(await counts(), 2, 'function must await rejected attachment cleanup');
    await invoke('/api/notices', 'POST', form({}, pixel, Buffer.from('not PDF')), admin, 400);
    assert.equal(await counts(), 2);
    await invoke('/api/notices', 'POST', form({}, Buffer.alloc(2 * 1024 * 1024 + 1), null), admin, 413);
    assert.equal(await counts(), 2);
    assert.deepEqual(await fs.readdir(uploadDirectory), []); assert.deepEqual(await fs.readdir(documentDirectory), []);
    const replaced = await invoke(`/api/notices/${notice.id}`, 'PUT', form({ targetBatch: 'All' }), admin);
    assert.notEqual(replaced.payload.imageUrl, notice.imageUrl); assert.equal(await counts(), 2);
    await invoke(`/api/notices/${notice.id}/save`, 'POST', {}, student);
    await invoke(`/api/notices/${notice.id}/read`, 'POST', {}, student);
    await invoke(`/api/notices/${notice.id}/comments`, 'POST', { body: 'Thanks for the timetable.' }, student, 201);
    await invoke(`/api/notices/${notice.id}`, 'DELETE', null, admin); assert.equal(await counts(), 0);
    // Two near-limit attachments remain below Netlify's combined binary request cap.
    const large = (await invoke('/api/notices', 'POST', form({}, Buffer.concat([pixel, Buffer.alloc(2 * 1024 * 1024 - pixel.length)]), createPdf('A'.repeat(1900000))), admin, 201)).payload;
    assert.equal(await counts(), 2);
    await invoke(`/api/notices/${large.id}`, 'DELETE', null, admin);
    assert.equal(await counts(), 0);
    await invoke('/api/notices', 'POST', { padding: 'A'.repeat(4 * 1024 * 1024 + 65536) }, admin, 413);
    const MongoRateStore = require('../utils/mongoRateStore');
    const a = new MongoRateStore('test'), b = new MongoRateStore('test');
    a.init({ windowMs: 60000 }); b.init({ windowMs: 60000 });
    assert.equal((await a.increment('client')).totalHits, 1); assert.equal((await b.increment('client')).totalHits, 2);
    await mongoose.connection.db.collection('apiRateLimits').updateOne({ _id: 'test:client' }, { $set: { expiresAt: new Date(0) } });
    assert.equal((await a.increment('client')).totalHits, 1);
    for (let n = 0; n < 10; n++) await invoke('/api/auth/login', 'POST', { email: 'missing@example.edu', password }, null, 401, '198.51.100.88');
    await invoke('/api/auth/login', 'POST', { email: 'missing@example.edu', password }, null, 429, '198.51.100.88');
    await invoke('/api/auth/login', 'POST', { email: 'missing@example.edu', password }, null, 401, '198.51.100.89');
  } finally { await mongoose.disconnect(); await db.stop(); }
});
