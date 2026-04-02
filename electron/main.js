const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const storage = require('../src/storage');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Anime Tracker',
    backgroundColor: '#1a1a2e'
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for anime operations
ipcMain.handle('get-anime-list', async () => {
  try {
    return await storage.getAnimeList();
  } catch (error) {
    console.error('Error getting anime list:', error);
    throw error;
  }
});

ipcMain.handle('add-anime', async (event, anime) => {
  try {
    return await storage.addAnime(anime);
  } catch (error) {
    console.error('Error adding anime:', error);
    throw error;
  }
});

ipcMain.handle('update-anime', async (event, id, updates) => {
  try {
    return await storage.updateAnime(id, updates);
  } catch (error) {
    console.error('Error updating anime:', error);
    throw error;
  }
});

ipcMain.handle('delete-anime', async (event, id) => {
  try {
    return await storage.deleteAnime(id);
  } catch (error) {
    console.error('Error deleting anime:', error);
    throw error;
  }
});

ipcMain.handle('search-anime', async (event, query) => {
  try {
    return await storage.searchAnime(query);
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
});

ipcMain.handle('filter-by-status', async (event, status) => {
  try {
    return await storage.filterByStatus(status);
  } catch (error) {
    console.error('Error filtering anime:', error);
    throw error;
  }
});

ipcMain.handle('get-anime-by-id', async (event, id) => {
  try {
    return await storage.getAnimeById(id);
  } catch (error) {
    console.error('Error getting anime by ID:', error);
    throw error;
  }
});
