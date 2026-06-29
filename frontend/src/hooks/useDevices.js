import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useDeviceStore } from '../store/deviceStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useDevices() {
  const { devices, setDevices, upsertDevice } = useDeviceStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/devices`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setDevices(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    const socket = io(API_URL, { transports: ['websocket', 'polling'] });

    socket.on('device:connected', (device) => upsertDevice(device));
    socket.on('device:updated', (device) => upsertDevice(device));
    socket.on('device:disconnected', (device) =>
      upsertDevice({ ...device, status: 'OFFLINE' })
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return { devices, loading, error };
}
