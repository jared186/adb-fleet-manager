const adb = require('adbkit');
const socket = require('../socket');

const client = adb.createClient();
const ONLINE_SERIALS = new Set();

function addSerial(serial) { ONLINE_SERIALS.add(serial); }
function removeSerial(serial) { ONLINE_SERIALS.delete(serial); }

setInterval(async () => {
  for (const serial of ONLINE_SERIALS) {
    try {
      const stream = await client.shell(serial, 'screencap -p');
      const buf = await adb.util.readAll(stream);
      const io = socket.getIO();
      if (io) io.emit('device:screenshot', { serialNumber: serial, png: buf.toString('base64'), timestamp: Date.now() });
    } catch (err) {
      // Device may have disconnected between tick start and this iteration — silent skip
    }
  }
}, 10000);

module.exports = { addSerial, removeSerial };
