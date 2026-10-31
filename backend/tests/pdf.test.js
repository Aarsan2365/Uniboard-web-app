process.env.UPLOAD_STORAGE = 'local';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const { User, Notice } = require('../models');
const { createPdf } = require('./fixtures/pdf');
const root = path.join(__dirname, '..');
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

test('PDF upload, private viewing/download, validation and attachment lifecycle', { timeout: 180000 }, async () => {
  process.env.JWT_SECRET = 'pdf-test-only-secret';
  const db = await MongoMemoryServer.create({ instance: { args: ['--nounixsocket'] } });
  let server;
  const uploads = new Set();
  try {
    await mongoose.connect(db.getUri('uniboard_pdf_test'));
    const password = await bcrypt.hash('PdfTestPassword123!', 10);
    await User.create([
      { name: 'Admin', email: 'admin@example.edu', password, role: 'admin' },
      { name: 'Student 2024', email: 'student@example.edu', password, batch: '2024' },
      { name: 'Student 2023', email: 'other@example.edu', password, batch: '2023' }
    ]);
    server = app.listen(0); await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    async function req(endpoint, method = 'GET', body, token, status = 200) {
      const multipart = body instanceof FormData;
      const res = await fetch(base + '/api' + endpoint, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(!multipart && body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? multipart ? body : JSON.stringify(body) : undefined });
      const data = await res.json();
      assert.equal(res.status, status, `${method} ${endpoint}: ${JSON.stringify(data)}`);
      for (const value of [data.imageUrl, data.pdfUrl]) if (value) uploads.add(value);
      return data;
    }
    const admin = (await req('/auth/admin/login', 'POST', { email: 'admin@example.edu', password: 'PdfTestPassword123!' })).token;
    const student = (await req('/auth/login', 'POST', { email: 'student@example.edu', password: 'PdfTestPassword123!' })).token;
    const other = (await req('/auth/login', 'POST', { email: 'other@example.edu', password: 'PdfTestPassword123!' })).token;
    const form = (values = {}, pdf, image = false, name = 'Course timetable 2026.pdf', mime = 'application/pdf') => {
      const result = new FormData();
      for (const [key, value] of Object.entries({ title: 'PDF timetable', body: 'Read the attached document.', category: 'Academic', targetBatch: '2024', ...values })) result.append(key, value);
      if (image) result.append('image', new Blob([pixel], { type: 'image/png' }), 'poster.png');
      if (pdf !== undefined) result.append('pdf', new Blob([pdf], { type: mime }), name);
      return result;
    };
    const listFiles = async () => (await Promise.all(['uploads', 'documents'].map(async folder => (await fs.readdir(path.join(root, folder))).map(name => `${folder}/${name}`)))).flat().sort();
    const expectNoNewFiles = async before => {
      for (let n = 0; n < 30; n++) {
        if (JSON.stringify(await listFiles()) === JSON.stringify(before)) return;
        await delay(20);
      }
      assert.deepEqual(await listFiles(), before, 'rejected files must not remain on disk');
    };
    const pdf = createPdf('UniBoard course timetable');
    const beforeDenied = await listFiles();
    await req('/notices', 'POST', form({}, pdf, true), student, 403);
    await expectNoNewFiles(beforeDenied);
    const notice = await req('/notices', 'POST', form({}, pdf, true), admin, 201);
    assert.match(notice.pdfUrl, /^\/documents\/[0-9a-f-]{36}\.pdf$/);
    assert.equal(notice.pdfName, 'Course timetable 2026.pdf');
    assert.ok(notice.imageUrl);
    assert.equal((await req(`/notices/${notice.id}`, 'GET', null, student)).pdfName, notice.pdfName);
    assert.equal((await req('/notices', 'GET', null, other)).data.some(item => item.id === notice.id), false);
    for (const token of [admin, student]) {
      const response = await fetch(`${base}/api/notices/${notice.id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /^application\/pdf/);
      assert.match(response.headers.get('content-disposition'), /^inline;.*Course timetable 2026.pdf/);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.match(response.headers.get('cache-control'), /private, no-store/);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), pdf);
    }
    const downloaded = await fetch(`${base}/api/notices/${notice.id}/pdf?download=1`, { headers: { Authorization: `Bearer ${student}` } });
    assert.equal(downloaded.status, 200);
    assert.match(downloaded.headers.get('content-disposition'), /^attachment;/);
    assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), pdf);
    const ranged = await fetch(`${base}/api/notices/${notice.id}/pdf`, { headers: { Authorization: `Bearer ${student}`, Range: 'bytes=0-7' } });
    assert.equal(ranged.status, 206);
    assert.equal(await ranged.text(), '%PDF-1.4');
    await req(`/notices/${notice.id}/pdf`, 'GET', null, null, 401);
    await req(`/notices/${notice.id}/pdf`, 'GET', null, other, 404);
    assert.equal((await fetch(base + notice.pdfUrl)).status, 404, 'PDFs cannot be served as public static files');
    await req('/notices/invalid/pdf', 'GET', null, admin, 404);

    const beforeRejected = await listFiles();
    await req('/notices', 'POST', form({ title: '' }, pdf, true), admin, 400);
    await expectNoNewFiles(beforeRejected);
    await req('/notices', 'POST', form({}, Buffer.from('<html>not a PDF</html>'), true), admin, 400);
    await expectNoNewFiles(beforeRejected);
    await req('/notices', 'POST', form({}, Buffer.from('%PDF-1.4\ntruncated')), admin, 400);
    await expectNoNewFiles(beforeRejected);
    await req('/notices', 'POST', form({}, Buffer.alloc(0)), admin, 400);
    await expectNoNewFiles(beforeRejected);
    await req('/notices', 'POST', form({}, pixel, true, 'poster.png', 'image/png'), admin, 400);
    await expectNoNewFiles(beforeRejected);
    await req('/notices', 'POST', form({}, pdf, false, 'document.txt'), admin, 400);
    await expectNoNewFiles(beforeRejected);
    await req('/notices', 'POST', form({}, Buffer.alloc(5 * 1024 * 1024 + 1), true), admin, 413);
    await expectNoNewFiles(beforeRejected);
    const duplicate = form({}, pdf);
    duplicate.append('pdf', new Blob([pdf], { type: 'application/pdf' }), 'second.pdf');
    await req('/notices', 'POST', duplicate, admin, 400);
    await expectNoNewFiles(beforeRejected);
    const wrongField = form();
    wrongField.append('image', new Blob([pdf], { type: 'application/pdf' }), 'document.pdf');
    await req('/notices', 'POST', wrongField, admin, 400);
    await expectNoNewFiles(beforeRejected);
    await req(`/notices/${notice.id}`, 'PUT', form({ removePdf: 'invalid' }, pdf), admin, 400);
    await expectNoNewFiles(beforeRejected);
    assert.equal((await req(`/notices/${notice.id}`, 'GET', null, admin)).pdfUrl, notice.pdfUrl);

    const kept = await req(`/notices/${notice.id}`, 'PUT', form({ title: 'Updated title' }), admin);
    assert.equal(kept.pdfUrl, notice.pdfUrl);
    assert.equal(kept.imageUrl, notice.imageUrl);
    const replacement = await req(`/notices/${notice.id}`, 'PUT', form({}, createPdf('Updated timetable'), false, 'Updated timetable.pdf'), admin);
    assert.notEqual(replacement.pdfUrl, notice.pdfUrl);
    assert.equal(replacement.pdfName, 'Updated timetable.pdf');
    assert.equal(replacement.imageUrl, notice.imageUrl);
    await assert.rejects(fs.stat(path.join(root, notice.pdfUrl)), { code: 'ENOENT' });
    const removed = await req(`/notices/${notice.id}`, 'PUT', form({ removePdf: true }), admin);
    assert.equal(removed.pdfUrl, null); assert.equal(removed.pdfName, '');
    assert.equal(removed.imageUrl, notice.imageUrl);
    await assert.rejects(fs.stat(path.join(root, replacement.pdfUrl)), { code: 'ENOENT' });
    await req(`/notices/${notice.id}/pdf`, 'GET', null, student, 404);
    const final = await req(`/notices/${notice.id}`, 'PUT', form({}, pdf), admin);
    await fs.unlink(path.join(root, final.pdfUrl));
    assert.match((await req(`/notices/${notice.id}/pdf`, 'GET', null, student, 404)).message, /missing/);
    const restored = await req(`/notices/${notice.id}`, 'PUT', form({}, pdf), admin);
    await req(`/notices/${notice.id}`, 'DELETE', null, admin);
    for (const file of [restored.pdfUrl, notice.imageUrl]) await assert.rejects(fs.stat(path.join(root, file)), { code: 'ENOENT' });
    const only = await req('/notices', 'POST', form({ targetBatch: 'All' }, pdf), admin, 201);
    assert.equal(only.imageUrl, null);
    assert.equal((await req(`/notices/${only.id}`, 'GET', null, other)).pdfUrl, only.pdfUrl);
    await req(`/notices/${only.id}`, 'DELETE', null, admin);
    const legacy = await Notice.collection.insertOne({ title: 'Old image notice', body: 'Old record', category: 'General', createdAt: new Date() });
    const old = await req(`/notices/${legacy.insertedId}`, 'GET', null, student);
    assert.equal(old.pdfUrl, null); assert.equal(old.pdfName, '');
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    for (const file of uploads) await fs.unlink(path.join(root, file)).catch(() => {});
    await mongoose.disconnect(); await db.stop();
  }
});
