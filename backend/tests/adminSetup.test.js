const { test } = require('node:test');
const assert = require('node:assert/strict');
const { promisify } = require('node:util');
const { execFile } = require('node:child_process');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('../models');
const runFile = promisify(execFile);

test('local admin setup creates accounts, preserves passwords and requires explicit promotion', { timeout: 180000 }, async () => {
  const db = await MongoMemoryServer.create({ instance: { args: ['--nounixsocket'] } });
  try {
    const uri = db.getUri('uniboard_setup_test');
    await mongoose.connect(uri);
    async function run(email, overrides = {}) {
      return runFile(process.execPath, [path.join(__dirname, '../scripts/createAdmin.js')], { env: {
        ...process.env, MONGODB_URI: uri, ADMIN_NAME: 'Campus Admin', ADMIN_EMAIL: email,
        ADMIN_PASSWORD: 'SetupTestPassword123!', ADMIN_PROMOTE: '', ...overrides
      } });
    }
    await run('provisioned@example.edu');
    const created = await User.findOne({ email: 'provisioned@example.edu' });
    assert.equal(created.role, 'admin');
    assert.equal(await bcrypt.compare('SetupTestPassword123!', created.password), true);
    await run('provisioned@example.edu', { ADMIN_PASSWORD: 'DifferentTestPassword123!' });
    assert.equal((await User.findById(created.id)).password, created.password);
    await assert.rejects(run('weak@example.edu', { ADMIN_PASSWORD: 'short' }));
    assert.equal(await User.countDocuments({ email: 'weak@example.edu' }), 0);
    const student = await User.create({ name: 'Student', email: 'existing@example.edu', password: await bcrypt.hash('StudentPassword123!', 10), role: 'student', batch: '2026' });
    await assert.rejects(run(student.email));
    assert.equal((await User.findById(student.id)).role, 'student');
    await run(student.email, { ADMIN_PROMOTE: 'true' });
    const promoted = await User.findById(student.id);
    assert.equal(promoted.role, 'admin');
    assert.equal(promoted.password, student.password);
  } finally { await mongoose.disconnect(); await db.stop(); }
});
