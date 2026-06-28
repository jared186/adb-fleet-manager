const adb = require('adbkit');
const { PrismaClient } = require('@prisma/client');
const { getDeviceInfo } = require('./deviceInfo');
const { getAndSyncUsers } = require('./users');
const socket = require('../socket');

const prisma = new PrismaClient();
const client = adb.createClient();
let tracker = null;

function mapType(type) {
  if (type === 'device') return 'ONLINE';
  if (type === 'unauthorized') return 'UNAUTHORIZED';
  return 'OFFLINE';
}

async function handleAdd(device) {
  try {
    const status = mapType(device.type);
    const record = await prisma.device.upsert({
      where: { serialNumber: device.id },
      update: { status, lastSeen: new Date() },
      create: { serialNumber: device.id, status },
    });

    if (status === 'ONLINE') {
      const info = await getDeviceInfo(client, device.id);
      await prisma.device.update({ where: { id: record.id }, data: info });
      await getAndSyncUsers(client, device.id, record.id);
    }

    const io = socket.getIO();
    if (io) io.emit('device:connected', { serialNumber: device.id, status });
  } catch (err) {
    console.error('Error handling device:add for', device.id, err.message);
  }
}

async function handleRemove(device) {
  try {
    await prisma.device.updateMany({
      where: { serialNumber: device.id },
      data: { status: 'OFFLINE' },
    });

    const io = socket.getIO();
    if (io) io.emit('device:disconnected', { serialNumber: device.id });
  } catch (err) {
    console.error('Error handling device:remove for', device.id, err.message);
  }
}

async function handleChange(device) {
  try {
    const status = mapType(device.type);
    await prisma.device.updateMany({
      where: { serialNumber: device.id },
      data: { status, lastSeen: new Date() },
    });

    const io = socket.getIO();
    if (io) io.emit('device:updated', { serialNumber: device.id, status });
  } catch (err) {
    console.error('Error handling device:change for', device.id, err.message);
  }
}

async function start() {
  try {
    tracker = await client.trackDevices();
    tracker.on('add', handleAdd);
    tracker.on('remove', handleRemove);
    tracker.on('change', handleChange);
    tracker.on('error', (err) => {
      console.error('ADB tracker error:', err.message);
    });
    tracker.on('end', () => {
      console.log('ADB tracker ended');
    });
    console.log('ADB tracker initialized');
  } catch (err) {
    console.error('Failed to start ADB tracker (is adb running?):', err.message);
  }
}

function refresh() {
  if (tracker) {
    client.listDevices().then((devices) => {
      devices.forEach((d) => handleAdd(d));
    }).catch((err) => {
      console.error('Refresh error:', err.message);
    });
  }
}

module.exports = { start, refresh };
