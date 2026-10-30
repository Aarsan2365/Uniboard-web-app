const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const { User } = require('../models');

test('student registration and separate login portals enforce database roles', { timeout: 180000 }, async () => {
  process.env.JWT_SECRET = 'test-portal-secret-not-used-outside-this-test';
  const db = await MongoMemoryServer.create({ instance: { args: ['--nounixsocket'] } });
  let server;
  try {
    await mongoose.connect(db.getUri('uniboard_auth_test'));
    const password = 'PortalTestPassword123!';
    await User.create({ name: 'Admin', email: 'admin@example.edu', password: await bcrypt.hash(password, 10), role: 'admin' });
    server = app.listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api`;
    async function post(path, body, status) {
      const res = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      assert.equal(res.status, status, `${path}: ${JSON.stringify(data)}`);
      return data;
    }
    const registered = await post('/auth/register', { name: 'Student', email: 'student@example.edu', password, batch: '2026' }, 201);
    assert.equal(registered.user.role, 'student');
    assert.equal(registered.token, undefined, 'a new student must sign in after registration');
    const unauthenticated = await fetch(base + '/notices');
    assert.equal(unauthenticated.status, 401);
    await post('/auth/register', { name: 'Intruder', email: 'intruder@example.edu', password, batch: '2026', role: 'admin' }, 400);
    assert.equal(await User.countDocuments({ email: 'intruder@example.edu' }), 0);
    await post('/auth/admin/register', { name: 'Intruder', email: 'intruder@example.edu', password }, 404);
    const studentLogin = await post('/auth/login', { email: 'student@example.edu', password, role: 'admin' }, 200);
    assert.equal(jwt.verify(studentLogin.token, process.env.JWT_SECRET).role, 'student');
    await post('/auth/admin/login', { email: 'student@example.edu', password, role: 'admin' }, 403);
    await post('/auth/login', { email: 'admin@example.edu', password, role: 'student' }, 403);
    const adminLogin = await post('/auth/admin/login', { email: 'admin@example.edu', password }, 200);
    assert.equal(adminLogin.user.role, 'admin');
    await post('/auth/admin/login', { email: 'admin@example.edu', password: 'IncorrectPassword' }, 401);
    await post('/auth/login', { email: 'missing@example.edu', password }, 401);
    const headers = { Authorization: `Bearer ${studentLogin.token}` };
    assert.equal((await fetch(base + '/auth/me', { headers })).status, 200);
    assert.equal((await fetch(base + '/notices', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
    // A cached/signed role cannot override the current database role.
    const demoted = await User.findOne({ email: 'admin@example.edu' });
    demoted.role = 'student'; demoted.batch = '2026'; await demoted.save();
    const demotedResponse = await fetch(base + '/notices', { method: 'POST', headers: { Authorization: `Bearer ${adminLogin.token}`, 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(demotedResponse.status, 403);
    const expired = jwt.sign({ id: registered.user.id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: -1 });
    assert.equal((await fetch(base + '/auth/me', { headers: { Authorization: `Bearer ${expired}` } })).status, 401);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect();
    await db.stop();
  }
});
