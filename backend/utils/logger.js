const fs = require('node:fs');
const path = require('node:path');
const { serverless } = require('./storagePaths');
let errorLogPath;
if (!serverless) {
  try {
    const directory = path.join(__dirname, '..', 'logs');
    fs.mkdirSync(directory, { recursive: true });
    errorLogPath = path.join(directory, 'error.log');
  } catch { /* Console logging remains available if local disk is read-only. */ }
}
const info = message => console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
const error = (message, err) => {
  const line = `[ERROR] ${new Date().toISOString()} - ${message}${err ? ` - ${err.stack || err}` : ''}\n`;
  console.error(line);
  if (errorLogPath) fs.appendFile(errorLogPath, line, () => {});
};
module.exports = { info, error };
