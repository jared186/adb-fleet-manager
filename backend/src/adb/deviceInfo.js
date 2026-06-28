const adb = require('adbkit');

async function getDeviceInfo(client, serial) {
  try {
    const [modelStream, manufacturerStream, androidVersionStream, batteryStream] = await Promise.all([
      client.shell(serial, 'getprop ro.product.model'),
      client.shell(serial, 'getprop ro.product.manufacturer'),
      client.shell(serial, 'getprop ro.build.version.release'),
      client.shell(serial, 'dumpsys battery'),
    ]);

    const [modelBuf, manufacturerBuf, androidVersionBuf, batteryBuf] = await Promise.all([
      adb.util.readAll(modelStream),
      adb.util.readAll(manufacturerStream),
      adb.util.readAll(androidVersionStream),
      adb.util.readAll(batteryStream),
    ]);

    const model = modelBuf.toString().trim() || null;
    const manufacturer = manufacturerBuf.toString().trim() || null;
    const androidVersion = androidVersionBuf.toString().trim() || null;

    const batteryText = batteryBuf.toString();
    const batteryMatch = batteryText.match(/level:\s*(\d+)/);
    const batteryLevel = batteryMatch ? parseInt(batteryMatch[1], 10) : null;

    return { model, manufacturer, androidVersion, batteryLevel };
  } catch (err) {
    console.error(`Failed to get device info for ${serial}:`, err.message);
    return { model: null, manufacturer: null, androidVersion: null, batteryLevel: null };
  }
}

module.exports = { getDeviceInfo };
