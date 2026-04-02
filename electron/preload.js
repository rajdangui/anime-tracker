const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('animeAPI', {
  getAnimeList: () => ipcRenderer.invoke('get-anime-list'),
  addAnime: (anime) => ipcRenderer.invoke('add-anime', anime),
  updateAnime: (id, updates) => ipcRenderer.invoke('update-anime', id, updates),
  deleteAnime: (id) => ipcRenderer.invoke('delete-anime', id),
  searchAnime: (query) => ipcRenderer.invoke('search-anime', query),
  filterByStatus: (status) => ipcRenderer.invoke('filter-by-status', status),
  getAnimeById: (id) => ipcRenderer.invoke('get-anime-by-id', id)
});
