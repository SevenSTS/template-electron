const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Contrôles fenêtre (Fermer / Minimiser / Maximiser)
  ipcMain.on('window-control', (event, action) => {
    switch (action) {
      case 'close':     win.close();    break;
      case 'minimize':  win.minimize(); break;
      case 'maximize':
        win.isMaximized() ? win.unmaximize() : win.maximize();
        break;
    }
  });

  // Sélection de chemin (Java / .minecraft)
  ipcMain.handle('select-path', async (event, { type }) => {
    if (type === 'java') {
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Sélectionner java.exe',
        properties: ['openFile'],
        filters: [{ name: 'Java Executable', extensions: ['exe','bin','sh'] }]
      });
      return canceled ? null : filePaths[0];
    } else if (type === 'minecraft') {
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Sélectionner le dossier .minecraft',
        properties: ['openDirectory']
      });
      return canceled ? null : filePaths[0];
    }
  });
}

app.whenReady().then(createWindow);

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
