const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(os.homedir(), '.anime-tracker');
const DATA_FILE = path.join(DATA_DIR, 'anime-list.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadAnimeList() {
  ensureDataDir();

  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading anime list:', error.message);
    return [];
  }
}

function saveAnimeList(animeList) {
  ensureDataDir();

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(animeList, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving anime list:', error.message);
    return false;
  }
}

function addAnime(anime) {
  const animeList = loadAnimeList();

  const newAnime = {
    id: Date.now(),
    title: anime.title,
    status: anime.status || 'plan-to-watch',
    episodes: anime.episodes || null,
    currentEpisode: anime.currentEpisode || 0,
    rating: anime.rating || null,
    notes: anime.notes || '',
    addedDate: new Date().toISOString()
  };

  animeList.push(newAnime);
  saveAnimeList(animeList);

  return newAnime;
}

function getAnimeList() {
  return loadAnimeList();
}

function getAnimeById(id) {
  const animeList = loadAnimeList();
  return animeList.find(anime => anime.id === parseInt(id));
}

function updateAnime(id, updates) {
  const animeList = loadAnimeList();
  const index = animeList.findIndex(anime => anime.id === parseInt(id));

  if (index === -1) {
    return null;
  }

  animeList[index] = { ...animeList[index], ...updates };
  saveAnimeList(animeList);

  return animeList[index];
}

function deleteAnime(id) {
  const animeList = loadAnimeList();
  const index = animeList.findIndex(anime => anime.id === parseInt(id));

  if (index === -1) {
    return false;
  }

  animeList.splice(index, 1);
  saveAnimeList(animeList);

  return true;
}

function searchAnime(query) {
  const animeList = loadAnimeList();
  const lowerQuery = query.toLowerCase();

  return animeList.filter(anime =>
    anime.title.toLowerCase().includes(lowerQuery) ||
    (anime.notes && anime.notes.toLowerCase().includes(lowerQuery))
  );
}

function filterByStatus(status) {
  const animeList = loadAnimeList();
  return animeList.filter(anime => anime.status === status);
}

module.exports = {
  addAnime,
  getAnimeList,
  getAnimeById,
  updateAnime,
  deleteAnime,
  searchAnime,
  filterByStatus
};
