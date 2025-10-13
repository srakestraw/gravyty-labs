import { create } from 'zustand';
import { App } from './types';

interface PlatformStore {
  sidebarOpen: boolean;
  activeApp: App;
  setActiveApp: (app: App) => void;
  toggleSidebar: () => void;
}

const defaultApp: App = {
  id: 'admissions',
  name: 'Admissions Management',
  shortName: 'Admissions',
  color: '#00B8D9',
  path: '/admissions',
};

export const usePlatformStore = create<PlatformStore>((set) => ({
  sidebarOpen: true,
  activeApp: defaultApp,
  setActiveApp: (app) => set({ activeApp: app }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
