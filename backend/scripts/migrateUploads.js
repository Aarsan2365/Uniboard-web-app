const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { Notice } = require('../models');
const storage = require('../utils/attachmentStore');

async function migrate() {
  if (!process.env.MONGODB_URI) throw new Error('Configure MONGODB_URI in backend/.env first.');
  await mongoose.connect(process.env.MONGODB_URI);
  const counts = { migrated: 0, alreadyStored: 0, missingLocalFile: 0, tooLargeForNetlify: 0 };
  const seen = new Set();
  try {
    for await (const notice of Notice.find().select('imageUrl pdfUrl').cursor()) {
      for (const value of [notice.imageUrl, notice.pdfUrl]) {
        const item = storage.location(value);
        if (!item || seen.has(value)) continue;
        seen.add(value);
        if (await storage.find(value)) { counts.alreadyStored++; continue; }
        try { await fs.access(item.localPath); }
        catch { counts.missingLocalFile++; continue; }
        const types = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf' };
        if ((await fs.stat(item.localPath)).size > 2 * 1024 * 1024) { counts.tooLargeForNetlify++; continue; }
        await storage.store({ filename: item.filename, path: item.localPath, fieldname: item.kind, mimetype: types[path.extname(item.filename).slice(1).toLowerCase()] });
        counts.migrated++;
      }
    }
    console.log('Attachment migration:', counts);
    console.log('Existing notice paths and local files were preserved. Re-upload any missing files through Admin Panel.');
  } finally { await mongoose.disconnect(); }
}
if (require.main === module) migrate().catch(error => { console.error('Migration failed:', error.message); process.exitCode = 1; });
module.exports = { migrate };
