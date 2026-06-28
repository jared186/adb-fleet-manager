const adb = require('adbkit');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAndSyncUsers(client, serial, deviceId) {
  try {
    const stream = await client.shell(serial, 'pm list users');
    const output = (await adb.util.readAll(stream)).toString();

    const users = [];
    for (const line of output.split('\n')) {
      const match = line.match(/UserInfo\{(\d+):([^:}]+)/);
      if (match) {
        users.push({
          androidUserId: parseInt(match[1], 10),
          name: match[2].trim(),
        });
      }
    }

    for (const user of users) {
      await prisma.deviceUser.upsert({
        where: { deviceId_androidUserId: { deviceId, androidUserId: user.androidUserId } },
        update: { name: user.name },
        create: { deviceId, androidUserId: user.androidUserId, name: user.name },
      });
    }

    return users;
  } catch (err) {
    console.error(`Failed to get users for ${serial}:`, err.message);
    return [];
  }
}

module.exports = { getAndSyncUsers };
