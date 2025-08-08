import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let autoUpdater;

function getAppVersionString() {
  try {
    const appPath = app.isPackaged
      ? path.join(process.resourcesPath, "app")
      : app.getAppPath();
    const pkgPath = path.join(appPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (pkg && typeof pkg.version === "string") return pkg.version;
    }
  } catch {}
  return app.getVersion();
}

// Initialize auto-updater only when the app is packaged (installed)
if (app.isPackaged) {
  import("electron-updater").then(({ autoUpdater: updater }) => {
    autoUpdater = updater;
    setupAutoUpdater();
    if (app.isReady()) {
      try {
        autoUpdater.checkForUpdates();
      } catch (error) {
        console.error("Error checking for updates on init:", error);
      }
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // gunakan preload CommonJS agar kompatibel di production installer
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === "development") {
    // Wait a bit for Vite to start
    setTimeout(() => {
      mainWindow.loadURL("http://localhost:5173");
      mainWindow.webContents.openDevTools();
    }, 1000);
  } else {
    // In production, load from built files
    // dist berada di root app, sejajar dengan folder electron
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

function setupAutoUpdater() {
  if (!autoUpdater) return;

  // Auto-updater configuration
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = true;

  // Auto-updater events
  autoUpdater.on("checking-for-update", () => {
    sendStatusToWindow("Checking for update...");
  });

  autoUpdater.on("update-available", (info) => {
    sendStatusToWindow(
      `Update available: ${info?.version ?? "unknown"} (current ${getAppVersionString()})`
    );
    mainWindow.webContents.send("update-available", info);
  });

  autoUpdater.on("update-not-available", (info) => {
    sendStatusToWindow(`Update not available. Current ${getAppVersionString()}`);
  });

  autoUpdater.on("error", (err) => {
    sendStatusToWindow(`Error in auto-updater: ${err.message}`);
  });

  autoUpdater.on("download-progress", (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + " - Downloaded " + progressObj.percent + "%";
    log_message =
      log_message +
      " (" +
      progressObj.transferred +
      "/" +
      progressObj.total +
      ")";
    sendStatusToWindow(log_message);
  });

  autoUpdater.on("update-downloaded", (info) => {
    sendStatusToWindow("Update downloaded; will install on quit");
    mainWindow.webContents.send("update-downloaded", info);
  });
}

function sendStatusToWindow(text) {
  if (mainWindow) {
    mainWindow.webContents.send("update-status", text);
  }
}

// IPC handlers for update actions
ipcMain.handle("app-version", () => {
  return getAppVersionString();
});
ipcMain.handle("check-for-updates", async () => {
  if (!autoUpdater) {
    sendStatusToWindow(
      `Updater not initialized. isPackaged=${app.isPackaged} NODE_ENV=${process.env.NODE_ENV ?? "undefined"}. Build and install the app to enable updates.`
    );
    return;
  }
  try {
    sendStatusToWindow("Renderer invoked checkForUpdates()");
    const result = await autoUpdater.checkForUpdates();
    if (result && result.updateInfo) {
      sendStatusToWindow(`Checked. Latest: ${result.updateInfo.version}`);
    } else {
      sendStatusToWindow('Checked. No update info.');
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
    sendStatusToWindow(`Check failed: ${String(error)}`);
  }
});

ipcMain.handle("download-update", async () => {
  if (!autoUpdater) return;
  try {
    await autoUpdater.downloadUpdate();
  } catch (error) {
    console.error("Error downloading update:", error);
  }
});

ipcMain.handle("install-update", () => {
  if (!autoUpdater) return;
  autoUpdater.quitAndInstall();
});

app
  .whenReady()
  .then(() => {
    // Check for updates on app start (only in production)
    if (autoUpdater) {
      autoUpdater.checkForUpdates();
    }
  })
  .then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
