import { create } from 'zustand';

export type ScanFilter = 'bw' | 'color' | 'soft' | 'photo';
export type ScanMode = 'document' | 'id' | 'qr';
export type DeletePolicy = 'immediate' | '24h' | 'manual';
export type ThemeMode = 'dark' | 'light' | 'system';
export type ImageQuality = 'lossless' | 'high' | 'balanced';

export interface ScannedPage {
  id: string;
  uri: string;
  filter: ScanFilter;
  timestamp: number;
}

export interface AppSettings {
  email: string;
  whatsapp: string;
  autoSend: boolean;
  askBeforeSend: boolean;
  autoDelete: boolean;
  deletePolicy: DeletePolicy;
  sendToEmail: boolean;
  sendToWhatsApp: boolean;
  imageQuality: ImageQuality;
  theme: ThemeMode;
  onboardingComplete: boolean;
}

interface AppState {
  settings: AppSettings;
  scannedPages: ScannedPage[];
  currentPages: ScannedPage[];
  activeFilter: ScanFilter;
  activeScanMode: ScanMode;
  isAutoScanEnabled: boolean;
  isFlashEnabled: boolean;

  updateSettings: (partial: Partial<AppSettings>) => void;
  addPage: (page: ScannedPage) => void;
  removePage: (id: string) => void;
  clearCurrentPages: () => void;
  setCurrentPages: (pages: ScannedPage[]) => void;
  setActiveFilter: (filter: ScanFilter) => void;
  setActiveScanMode: (mode: ScanMode) => void;
  setAutoScan: (enabled: boolean) => void;
  setFlash: (enabled: boolean) => void;
  completeOnboarding: (email: string, whatsapp: string, sendEmail: boolean, sendWA: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: {
    email: '',
    whatsapp: '',
    autoSend: true,
    askBeforeSend: false,
    autoDelete: true,
    deletePolicy: 'immediate',
    sendToEmail: true,
    sendToWhatsApp: true,
    imageQuality: 'lossless',
    theme: 'dark',
    onboardingComplete: false,
  },
  scannedPages: [],
  currentPages: [],
  activeFilter: 'bw',
  activeScanMode: 'document',
  isAutoScanEnabled: true,
  isFlashEnabled: false,

  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),

  addPage: (page) =>
    set((state) => ({
      scannedPages: [page, ...state.scannedPages],
      currentPages: [...state.currentPages, page],
    })),

  removePage: (id) =>
    set((state) => ({
      scannedPages: state.scannedPages.filter((p) => p.id !== id),
      currentPages: state.currentPages.filter((p) => p.id !== id),
    })),

  clearCurrentPages: () => set({ currentPages: [] }),

  setCurrentPages: (pages) => set({ currentPages: pages }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  setActiveScanMode: (mode) => set({ activeScanMode: mode }),

  setAutoScan: (enabled) => set({ isAutoScanEnabled: enabled }),

  setFlash: (enabled) => set({ isFlashEnabled: enabled }),

  completeOnboarding: (email, whatsapp, sendEmail, sendWA) =>
    set((state) => ({
      settings: {
        ...state.settings,
        email,
        whatsapp,
        sendToEmail: sendEmail,
        sendToWhatsApp: sendWA,
        onboardingComplete: true,
      },
    })),
}));
