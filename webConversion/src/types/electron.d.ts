/**
 * Type definitions for Electron API exposed via preload script
 */

export interface ElectronAPI {
  isElectron: () => Promise<boolean>;
  getVersion: () => Promise<string>;
  openFile: () => Promise<{
    canceled: boolean;
    filePath?: string;
    content?: string;
    error?: string;
  }>;
  saveFile: (content: string) => Promise<{
    canceled: boolean;
    filePath?: string;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
