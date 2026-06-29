import { useState } from 'react';
import { useDevices } from '../hooks/useDevices';
import DeviceCard from '../components/DeviceCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const { devices, loading, error } = useDevices();
  const [scanning, setScanning] = useState(false);

  async function handleScan() {
    setScanning(true);
    try {
      await fetch(`${API_URL}/api/devices/scan`, { method: 'POST' });
    } catch (_) {}
    setTimeout(() => setScanning(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">ADB Fleet Manager</h1>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {scanning ? 'Scanning...' : 'Scan'}
        </button>
      </header>

      <main className="px-6 py-6">
        {loading && (
          <p className="text-center text-gray-500 mt-12">Loading devices…</p>
        )}

        {!loading && error && (
          <p className="text-center text-red-500 mt-12">Error: {error}</p>
        )}

        {!loading && !error && devices.length === 0 && (
          <p className="text-center text-gray-500 mt-12">
            No devices connected. Connect an Android device via USB and click Scan.
          </p>
        )}

        {!loading && !error && devices.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
