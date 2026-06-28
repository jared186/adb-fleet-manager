const express = require('express');
const { PrismaClient } = require('@prisma/client');
const tracker = require('../adb/tracker');

const router = express.Router();
const prisma = new PrismaClient();

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

module.exports = router;
