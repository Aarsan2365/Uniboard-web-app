process.env.UPLOAD_STORAGE = 'local';
const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../server');
const { Notice, SavedNotice } = require('../models');

async function withServer(run) {
  const server = app.listen(0);
  try {
    await new Promise(resolve => server.once('listening', resolve));
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally { await new Promise(resolve => server.close(resolve)); }
}

test('API health reports an unavailable database honestly', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).database, 'disconnected');
  });
});

test('Saved notices and upcoming events require authentication', async () => {
  await withServer(async base => {
    for (const endpoint of ['/api/notices/saved', '/api/notices/events/upcoming', '/api/notices']) {
      const response = await fetch(base + endpoint);
      assert.equal(response.status, 401, endpoint);
    }
  });
});

test('Notice supports event date/location and saved relation is unique', () => {
  assert.ok(Notice.schema.path('eventDate'));
  assert.ok(Notice.schema.path('eventLocation'));
  assert.ok(SavedNotice.schema.indexes().some(([keys, opts]) =>
    keys.userId === 1 && keys.noticeId === 1 && opts.unique === true
  ));
});

test('Public registration rejects requesting admin privileges', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student', email: 'student@example.edu',
        password: 'examplePassword123', role: 'admin', batch: '2023'
      })
    });
    assert.equal(response.status, 400);
  });
});
