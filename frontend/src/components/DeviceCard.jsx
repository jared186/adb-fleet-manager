export default function DeviceCard({ device }) {
  const serial = device.serialNumber.length > 12
    ? device.serialNumber.slice(0, 12) + '…'
    : device.serialNumber;

  const statusConfig = {
    ONLINE: { label: 'ONLINE', cls: 'bg-green-100 text-green-800' },
    OFFLINE: { label: 'OFFLINE', cls: 'bg-red-100 text-red-800' },
    UNAUTHORIZED: { label: 'UNAUTHORIZED', cls: 'bg-yellow-100 text-yellow-800' },
  };
  const { label, cls } = statusConfig[device.status] ?? { label: device.status, cls: 'bg-gray-100 text-gray-800' };

  const battery = device.batteryLevel;
  let batteryColor = 'bg-green-500';
  if (battery === null || battery === undefined) {
    batteryColor = null;
  } else if (battery < 20) {
    batteryColor = 'bg-red-500';
  } else if (battery < 50) {
    batteryColor = 'bg-yellow-500';
  }

  const userCount = device._count?.users ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-mono">{serial}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-900">
          {device.model} — {device.manufacturer}
        </p>
        <p className="text-xs text-gray-500">Android {device.androidVersion}</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Battery</span>
          <span className="text-xs text-gray-700">
            {battery !== null && battery !== undefined ? `${battery}%` : 'N/A'}
          </span>
        </div>
        {batteryColor ? (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${batteryColor} h-2 rounded-full transition-all`}
              style={{ width: `${battery}%` }}
            />
          </div>
        ) : (
          <div className="w-full bg-gray-100 rounded-full h-2" />
        )}
      </div>

      <p className="text-xs text-gray-500">{userCount} user(s)</p>
    </div>
  );
}
