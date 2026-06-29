const { execFile } = require('child_process');

const SAFE_HOST = /^[a-zA-Z0-9.\-]+$/;

function connectDevice(host, port) {
  return new Promise((resolve) => {
    const p = parseInt(port, 10);
    if (!host || !SAFE_HOST.test(host)) {
      return resolve({ success: false, message: 'Invalid host' });
    }
    if (isNaN(p) || p < 1 || p > 65535) {
      return resolve({ success: false, message: 'Invalid port' });
    }
    execFile('adb', ['connect', `${host}:${p}`], (err, stdout, stderr) => {
      const out = (stdout || '').trim();
      const success = out.includes('connected');
      resolve({ success, message: out || (stderr || '').trim() || (err && err.message) || 'Unknown error' });
    });
  });
}

module.exports = { connectDevice };
