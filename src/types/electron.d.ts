// Define IpcRendererEvent type locally to avoid importing from electron in renderer
export type IpcRendererEvent = {
  sender: any;
  ports: MessagePort[];
};

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

export interface ElectronAPI {
  send: (channel: string, data: unknown) => void;
  on: (channel: string, func: (...args: unknown[]) => void) => void;
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => void;
  onUpdateAvailable: (callback: (event: IpcRendererEvent, info: UpdateInfo) => void) => void;
  onUpdateDownloaded: (callback: (event: IpcRendererEvent, info: UpdateInfo) => void) => void;
  onUpdateStatus: (callback: (event: IpcRendererEvent, status: string) => void) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
