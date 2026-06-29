import { create } from 'zustand';

export const useDeviceStore = create((set) => ({
  devices: [],
  setDevices: (devices) => set({ devices }),
  upsertDevice: (device) => set((state) => ({
    devices: state.devices.some(d => d.id === device.id)
      ? state.devices.map(d => d.id === device.id ? device : d)
      : [...state.devices, device]
  })),
  removeDevice: (id) => set((state) => ({ devices: state.devices.filter(d => d.id !== id) }))
}));
