// utils/logger.js
//
// A deliberately lightweight logger (no external dependency beyond
// what's already in the project) that timestamps messages and
// persists errors to a file, on top of morgan's HTTP access logs.
// Enough to demonstrate "the app has real logging" without pulling
// in a heavy stack like Winston/ELK for a course project.

const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const errorLogPath = path.join(logDir, 'error.log');

const timestamp = () => new Date().toISOString();

const info = (message) => {
  console.log(`[INFO] ${timestamp()} - ${message}`);
};

const error = (message, err) => {
  const line = `[ERROR] ${timestamp()} - ${message}${err ? ` - ${err.stack || err}` : ''}\n`;
  console.error(line);
  fs.appendFile(errorLogPath, line, () => {}); // fire-and-forget, never block the request
};

module.exports = { info, error };
