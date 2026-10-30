const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { setTimeout: delay } = require('node:timers/promises');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const { User, Notice, Comment, NoticeRead, SavedNotice } = require('../models');
const uploadDir = path.join(__dirname, '../uploads');
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

test('notice sorting, details, persistent CRUD and image lifecycle', { timeout: 180000 }, async () => {
  process.env.JWT_SECRET = 'feed-test-only-secret';
  const db = await MongoMemoryServer.create({ instance: { args: ['--nounixsocket'] } });
  let server;
  const testImages = new Set();
  try {
    const uri = db.getUri('uniboard_feed_test');
    await mongoose.connect(uri);
    const password = await bcrypt.hash('FeedTestPassword123!', 10);
    await User.create([{ name: 'Admin', email: 'admin@example.edu', password, role: 'admin' }, { name: 'Student', email: 'student@example.edu', password, batch: '2026' }]);
    server = app.listen(0); await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    async function req(endpoint, method = 'GET', body, token, status = 200) {
      const multipart = body instanceof FormData;
      const res = await fetch(base + '/api' + endpoint, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(!multipart && body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? multipart ? body : JSON.stringify(body) : undefined });
      const data = await res.json();
      assert.equal(res.status, status, `${method} ${endpoint}: ${JSON.stringify(data)}`);
      if (data.imageUrl) testImages.add(data.imageUrl);
      return data;
    }
    const admin = (await req('/auth/admin/login', 'POST', { email: 'admin@example.edu', password: 'FeedTestPassword123!' })).token;
    const student = (await req('/auth/login', 'POST', { email: 'student@example.edu', password: 'FeedTestPassword123!' })).token;
    const form = (values = {}, image) => {
      const result = new FormData();
      for (const [key, value] of Object.entries({ title: 'Alpha notice', body: 'Persisted notice content', category: 'General', targetBatch: 'All', ...values })) result.append(key, value);
      if (image) result.append('image', new Blob([image], { type: 'image/png' }), 'poster.png');
      return result;
    };
    const alpha = await req('/notices', 'POST', form({}, pixel), admin, 201);
    const zulu = await req('/notices', 'POST', form({ title: 'Zulu notice', category: 'Academic', targetBatch: '2026' }), admin, 201);
    const other = await req('/notices', 'POST', form({ title: 'Other batch notice', targetBatch: '2025' }), admin, 201);
    await Notice.updateOne({ _id: alpha.id }, { $set: { createdAt: new Date('2026-01-01') } }, { timestamps: false });
    await Notice.updateOne({ _id: zulu.id }, { $set: { createdAt: new Date('2026-02-01') } }, { timestamps: false });
    await mongoose.disconnect(); await mongoose.connect(uri);
    assert.equal((await req(`/notices/${alpha.id}`, 'GET', null, student)).body, 'Persisted notice content');
    assert.equal((await req('/notices?sort=oldest', 'GET', null, student)).data[0].id, alpha.id);
    assert.equal((await req('/notices?sort=newest', 'GET', null, student)).data[0].id, zulu.id);
    assert.equal((await req('/notices?sort=title-asc', 'GET', null, student)).data[0].id, alpha.id);
    assert.equal((await req('/notices?sort=title-desc', 'GET', null, student)).data[0].id, zulu.id);
    assert.equal((await req('/notices?search=Zulu&category=Academic&targetBatch=2026', 'GET', null, student)).data[0].id, zulu.id);
    assert.equal((await req('/notices?limit=1&page=2', 'GET', null, student)).meta.total, 2);
    await req('/notices?sort=invalid', 'GET', null, student, 400);
    await req(`/notices/${other.id}`, 'GET', null, student, 404);
    assert.deepEqual(Buffer.from(await (await fetch(base + alpha.imageUrl)).arrayBuffer()), pixel);
    const replaced = await req(`/notices/${alpha.id}`, 'PUT', form({ title: 'Alpha edited' }, pixel), admin);
    assert.notEqual(replaced.imageUrl, alpha.imageUrl);
    await assert.rejects(fs.stat(path.join(__dirname, '..', alpha.imageUrl)), { code: 'ENOENT' });
    const removed = await req(`/notices/${alpha.id}`, 'PUT', form({ removeImage: true }), admin);
    assert.equal(removed.imageUrl, null);
    await assert.rejects(fs.stat(path.join(__dirname, '..', replaced.imageUrl)), { code: 'ENOENT' });
    const before = new Set(await fs.readdir(uploadDir));
    await req('/notices', 'POST', form({ title: '' }, pixel), admin, 400);
    for (let n = 0; n < 20 && (await fs.readdir(uploadDir)).some(name => !before.has(name)); n++) await delay(20);
    assert.deepEqual(new Set(await fs.readdir(uploadDir)), before, 'rejected uploads must be removed');
    await req('/notices', 'POST', form({ body: 'x'.repeat(10001) }), admin, 400);
    await req('/notices', 'POST', form({}, Buffer.alloc(5 * 1024 * 1024 + 1)), admin, 413);
    const final = await req(`/notices/${alpha.id}`, 'PUT', form({}, pixel), admin);
    await req(`/notices/${alpha.id}/save`, 'POST', null, student);
    await req(`/notices/${alpha.id}/read`, 'POST', null, student);
    await req(`/notices/${alpha.id}/comments`, 'POST', { body: 'A related comment' }, student, 201);
    await req(`/notices/${alpha.id}`, 'DELETE', null, admin);
    for (const model of [Comment, NoticeRead, SavedNotice]) assert.equal(await model.countDocuments({ noticeId: alpha.id }), 0);
    await req(`/notices/${alpha.id}`, 'GET', null, student, 404);
    await assert.rejects(fs.stat(path.join(__dirname, '..', final.imageUrl)), { code: 'ENOENT' });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect(); await db.stop();
    for (const image of testImages) await fs.unlink(path.join(__dirname, '..', image)).catch(() => {});
  }
});
