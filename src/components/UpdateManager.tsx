import { useState, useEffect } from 'react';
import type { UpdateInfo, IpcRendererEvent } from '../types/electron';

export const UpdateManager = () => {
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Listen for update events
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    window.electron?.onUpdateStatus((_event: IpcRendererEvent, status: string) => {
      setUpdateStatus(status);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    window.electron?.onUpdateAvailable((_event: IpcRendererEvent, info: UpdateInfo) => {
      setUpdateAvailable(info);
      setUpdateStatus('Update available!');
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    window.electron?.onUpdateDownloaded((_event: IpcRendererEvent, _info: UpdateInfo) => {
      setUpdateDownloaded(true);
      setUpdateStatus('Update downloaded and ready to install!');
    });

    // Check for updates on component mount
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      await window.electron?.checkForUpdates();
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateStatus('Error checking for updates');
    } finally {
      setIsChecking(false);
    }
  };

  const downloadUpdate = async () => {
    try {
      await window.electron?.downloadUpdate();
      setUpdateStatus('Downloading update...');
    } catch (error) {
      console.error('Error downloading update:', error);
      setUpdateStatus('Error downloading update');
    }
  };

  const installUpdate = () => {
    window.electron?.installUpdate();
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">App Updates</h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span className="text-sm font-medium">{updateStatus || 'No updates checked'}</span>
        </div>

        {updateAvailable && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h3 className="font-semibold text-blue-800">Update Available!</h3>
            <p className="text-sm text-blue-700">Version: {updateAvailable.version}</p>
            {updateAvailable.releaseNotes && (
              <p className="text-sm text-blue-600 mt-1">{updateAvailable.releaseNotes}</p>
            )}
            <button
              onClick={downloadUpdate}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Download Update
            </button>
          </div>
        )}

        {updateDownloaded && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <h3 className="font-semibold text-green-800">Update Ready!</h3>
            <p className="text-sm text-green-700">The update has been downloaded and is ready to install.</p>
            <button
              onClick={installUpdate}
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            >
              Install & Restart
            </button>
          </div>
        )}

        <button
          onClick={checkForUpdates}
          disabled={isChecking}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check for Updates'}
        </button>
      </div>
    </div>
  );
};
