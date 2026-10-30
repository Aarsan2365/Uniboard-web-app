// Administrator provisioning is a local setup command, never a public API.
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { createInterface } = require('node:readline/promises');
const { Writable } = require('node:stream');
const { User } = require('../models');

async function main() {
  let reader;
  let hidden = false;
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  if (interactive) {
    const output = new Writable({ write(chunk, _encoding, done) {
      if (!hidden) process.stdout.write(chunk);
      done();
    } });
    reader = createInterface({ input: process.stdin, output, terminal: true });
  }
  const ask = async (label, secret = false) => {
    if (!reader) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters), or run npm run setup-admin in an interactive terminal.');
    process.stdout.write(label);
    hidden = secret;
    try { return await reader.question(''); }
    finally { hidden = false; if (secret) process.stdout.write('\n'); }
  };

  try {
    if (!process.env.MONGODB_URI) throw new Error('Configure MONGODB_URI in backend/.env first.');
    console.log('UniBoard administrator setup — no administrator registration is available on the website.');
    const name = (process.env.ADMIN_NAME || await ask('Administrator name: ')).trim();
    const email = (process.env.ADMIN_EMAIL || await ask('Administrator email: ')).trim().toLowerCase();
    if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Provide a name (1–100 characters) and a valid administrator email.');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === 'admin') {
        console.log('This administrator already exists. Sign in at /admin/login with the existing password.');
        return;
      }
      const promote = process.env.ADMIN_PROMOTE === 'true' || (interactive && (await ask('This email belongs to a student. Type PROMOTE to grant administrator access: ')).trim() === 'PROMOTE');
      if (!promote) throw new Error('No account was changed. Use a separate admin email, or explicitly set ADMIN_PROMOTE=true to promote this existing student.');
      existing.role = 'admin';
      existing.batch = 'N/A';
      await existing.save();
      console.log('Account promoted. Its existing password was preserved. Sign in at /admin/login.');
      return;
    }
    const password = process.env.ADMIN_PASSWORD || await ask('New admin password (12+ characters; hidden): ', true);
    if (password.length < 12) throw new Error('The administrator password must contain at least 12 characters.');
    if (!process.env.ADMIN_PASSWORD && password !== await ask('Confirm password (hidden): ', true)) {
      throw new Error('Passwords do not match. No administrator account was created.');
    }
    await User.create({ name, email, role: 'admin', batch: 'N/A', password: await bcrypt.hash(password, 12) });
    console.log('Administrator created successfully. Open /admin/login and sign in with the credentials you just set.');
  } finally { reader?.close(); }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  }).finally(async () => { await mongoose.disconnect(); });
}
module.exports = { main };
