const path = require('node:path');
const os = require('node:os');
const serverless = process.env.UNIBOARD_SERVERLESS === '1';
const root = serverless ? path.join(os.tmpdir(), 'uniboard') : path.join(__dirname, '..');
module.exports = {
  serverless, uploadDirectory: path.join(root, 'uploads'),
  documentDirectory: path.join(root, 'documents'),
  maxAttachmentBytes: (serverless ? 2 : 5) * 1024 * 1024,
  maxAttachmentMB: serverless ? 2 : 5
};
