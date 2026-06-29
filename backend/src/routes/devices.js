const express = require('express');
const { PrismaClient } = require('@prisma/client');
const adb = require('adbkit');
const tracker = require('../adb/tracker');
const { connectDevice } = require('../adb/connect');

const router = express.Router();
const prisma = new PrismaClient();
const shellClient = adb.createClient();

router.get('/', async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: { _count: { select: { users: true } } },
    });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:serial', async (req, res) => {
  try {
    const device = await prisma.device.findUnique({
      where: { serialNumber: req.params.serial },
      include: { users: true },
    });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:serial/users', async (req, res) => {
  try {
    const users = await prisma.deviceUser.findMany({
      where: { device: { serialNumber: req.params.serial } },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/scan', (req, res) => {
  tracker.refresh();
  res.json({ status: 'scanning' });
});

router.post('/connect', async (req, res) => {
  const { host, port = 5555 } = req.body;
  if (!host) return res.status(400).json({ error: 'host required' });
  const result = await connectDevice(host, port);
  res.json(result);
});

router.post('/:serial/shell', async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'command required' });
  try {
    const stream = await shellClient.shell(req.params.serial, command);
    const output = await Promise.race([
      adb.util.readAll(stream).then(b => b.toString()),
      new Promise((_, reject) =>
        setTimeout(() => {
          stream.destroy();
          reject(new Error('Command timed out after 30s'));
        }, 30000)
      ),
    ]);
    res.json({ output, error: null });
  } catch (err) {
    const isTimeout = err.message.includes('timed out');
    res.status(isTimeout ? 408 : 500).json({ output: '', error: err.message });
  }
});

module.exports = router;
