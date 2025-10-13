import { create } from 'zustand';
import { App } from './types';

interface PlatformStore {
  sidebarOpen: boolean;
  activeApp: App;
  setActiveApp: (app: App) => void;
  toggleSidebar: () => void;
}

const defaultApp: App = {
  id: 'dashboard',
  name: 'Dashboard',
  shortName: 'Dashboard',
  icon: 'fa-solid fa-house',
  color: '#3B82F6',
  path: '/dashboard',
};

export const usePlatformStore = create<PlatformStore>((set) => ({
  sidebarOpen: true,
  activeApp: defaultApp,
  setActiveApp: (app) => set({ activeApp: app }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
