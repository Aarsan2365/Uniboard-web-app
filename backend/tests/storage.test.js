const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const { User } = require('../models');
const { createPdf } = require('./fixtures/pdf');
const store = require('../utils/attachmentStore');
const { promisify } = require('node:util');
const { execFile } = require('node:child_process');
test('MongoDB attachments survive reconnect, enforce PDF audiences and clean up after edits and errors', { timeout: 180000 }, async () => {
  process.env.JWT_SECRET = 'storage-test-only-secret'; process.env.UPLOAD_STORAGE = 'mongodb';
  const db = await MongoMemoryServer.create({ instance: { args: ['--nounixsocket'] } });
  let server;
  try {
    const uri = db.getUri('uniboard_storage_test'); await mongoose.connect(uri);
    const password = await bcrypt.hash('StorageTestPassword123!', 10);
    await User.create([{ name: 'Admin', email: 'admin@example.edu', password, role: 'admin' }, { name: 'Student', email: 'student@example.edu', password, batch: '2024' }, { name: 'Other', email: 'other@example.edu', password, batch: '2023' }]);
    server = app.listen(0); await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = async (url, method, body, token, status = 200) => {
      const multi = body instanceof FormData;
      const response = await fetch(base + '/api' + url, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(!multi && body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? multi ? body : JSON.stringify(body) : undefined });
      const data = await response.json(); assert.equal(response.status, status, JSON.stringify(data)); return data;
    };
    const admin = (await request('/auth/admin/login', 'POST', { email: 'admin@example.edu', password: 'StorageTestPassword123!' })).token;
    const student = (await request('/auth/login', 'POST', { email: 'student@example.edu', password: 'StorageTestPassword123!' })).token;
    const other = (await request('/auth/login', 'POST', { email: 'other@example.edu', password: 'StorageTestPassword123!' })).token;
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'), pdf = createPdf();
    const form = (extra = {}, files = true) => {
      const f = new FormData(); for (const [key, value] of Object.entries({ title: 'Online notice', body: 'Durable files', targetBatch: '2024', ...extra })) f.append(key, value);
      if (files) { f.append('image', new Blob([pixel], { type: 'image/png' }), 'poster.png'); f.append('pdf', new Blob([pdf], { type: 'application/pdf' }), 'notice.pdf'); } return f;
    };
    const notice = await request('/notices', 'POST', form(), admin, 201);
    for (const value of [notice.imageUrl, notice.pdfUrl]) await assert.rejects(fs.stat(path.join(__dirname, '..', value)), { code: 'ENOENT' });
    assert.equal(await mongoose.connection.db.collection('noticeFiles.files').countDocuments(), 2);
    await mongoose.disconnect(); await mongoose.connect(uri);
    assert.deepEqual(Buffer.from(await (await fetch(base + notice.imageUrl)).arrayBuffer()), pixel);
    const response = await fetch(`${base}/api/notices/${notice.id}/pdf`, { headers: { Authorization: `Bearer ${student}`, Range: 'bytes=0-7' } });
    assert.equal(response.status, 206); assert.equal(await response.text(), '%PDF-1.4');
    await request(`/notices/${notice.id}/pdf`, 'GET', null, other, 404);
    await request(`/notices/${notice.id}/pdf`, 'GET', null, null, 401);
    assert.equal((await fetch(base + notice.pdfUrl)).status, 404);
    await request('/notices', 'POST', form({ title: '' }), admin, 400);
    await request('/notices/invalid', 'PUT', form(), admin, 404);
    for (let n = 0; n < 40 && await mongoose.connection.db.collection('noticeFiles.files').countDocuments() !== 2; n++) await delay(25);
    assert.equal(await mongoose.connection.db.collection('noticeFiles.files').countDocuments(), 2);
    const replaced = await request(`/notices/${notice.id}`, 'PUT', form(), admin);
    assert.equal(await store.find(notice.pdfUrl), null); assert.equal(await store.find(notice.imageUrl), null);
    assert.equal(await mongoose.connection.db.collection('noticeFiles.files').countDocuments(), 2);
    const removed = await request(`/notices/${notice.id}`, 'PUT', form({ removePdf: true }, false), admin);
    assert.equal(removed.pdfUrl, null); assert.ok(await store.find(replaced.imageUrl));
    await request(`/notices/${notice.id}`, 'DELETE', null, admin);
    assert.equal(await mongoose.connection.db.collection('noticeFiles.files').countDocuments(), 0);
    assert.equal(await mongoose.connection.db.collection('noticeFiles.chunks').countDocuments(), 0);
    const { Notice } = require('../models');
    const oldPath = '/uploads/migration-fixture.png';
    await fs.writeFile(path.join(__dirname, '..', oldPath), pixel);
    try {
      const legacy = await Notice.create({ title: 'Existing local notice', body: 'Migration fixture', imageUrl: oldPath, createdBy: (await User.findOne({ role: 'admin' }))._id });
      for (let n = 0; n < 2; n++) await promisify(execFile)(process.execPath, [path.join(__dirname, '../scripts/migrateUploads.js')], { env: { ...process.env, MONGODB_URI: uri } });
      assert.equal(await mongoose.connection.db.collection('noticeFiles.files').countDocuments(), 1);
      assert.equal((await Notice.findById(legacy.id)).imageUrl, oldPath);
      assert.deepEqual(await fs.readFile(path.join(__dirname, '..', oldPath)), pixel);
      assert.deepEqual(Buffer.from(await (await fetch(base + oldPath)).arrayBuffer()), pixel);
      await request(`/notices/${legacy.id}`, 'DELETE', null, admin);
    } finally { await fs.unlink(path.join(__dirname, '..', oldPath)).catch(() => {}); }
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect(); await db.stop(); process.env.UPLOAD_STORAGE = 'local';
  }
});
