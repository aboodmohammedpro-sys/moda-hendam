import { create } from 'zustand';

const useMeasurementStore = create((set) => ({
  measurements: {},
  setMeasurement: (key, value) =>
    set((state) => ({
      measurements: {
        ...state.measurements,
        [key]: value,
      },
    })),
  clearMeasurements: () => set({ measurements: {} }),
  setAllMeasurements: (data) => set({ measurements: data }),
}));

export default useMeasurementStore;
