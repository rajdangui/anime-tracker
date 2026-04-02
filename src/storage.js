const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(os.homedir(), '.anime-tracker');
const DATA_FILE = path.join(DATA_DIR, 'anime-list.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Firebase imports (optional - only used if configured)
let firebase = null;
let db = null;
let useFirebase = false;

// Try to initialize Firebase if config is available
function initializeFirebase() {
  try {
    const firebaseConfig = require('./firebase-config');

    // Check if Firebase config has been updated from defaults
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY') {
      firebase = require('firebase/app');
      const { getDatabase, ref, get, set, push, update, remove } = require('firebase/database');

      // Initialize Firebase
      if (!firebase.getApps || firebase.getApps().length === 0) {
        firebase.initializeApp(firebaseConfig);
      }

      db = getDatabase();
      useFirebase = true;
      console.log('Firebase initialized successfully - using online database');

      // Store Firebase methods for use
      firebase.dbRef = ref;
      firebase.dbGet = get;
      firebase.dbSet = set;
      firebase.dbPush = push;
      firebase.dbUpdate = update;
      firebase.dbRemove = remove;
    } else {
      console.log('Firebase config not set - using local storage');
    }
  } catch (error) {
    console.log('Firebase not configured - using local storage:', error.message);
    useFirebase = false;
  }
}

// Initialize Firebase on module load
initializeFirebase();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Local storage functions
function loadAnimeListLocal() {
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

function saveAnimeListLocal(animeList) {
  ensureDataDir();

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(animeList, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving anime list:', error.message);
    return false;
  }
}

// Firebase storage functions
async function loadAnimeListFirebase() {
  try {
    const userId = getUserId();
    const animeRef = firebase.dbRef(db, `users/${userId}/anime`);
    const snapshot = await firebase.dbGet(animeRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert Firebase object to array
      return Object.keys(data).map(key => ({
        ...data[key],
        id: parseInt(key)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading from Firebase:', error);
    return [];
  }
}

async function saveAnimeListFirebase(animeList) {
  try {
    const userId = getUserId();
    const animeRef = firebase.dbRef(db, `users/${userId}/anime`);

    // Convert array to object with IDs as keys
    const animeObject = {};
    animeList.forEach(anime => {
      animeObject[anime.id] = anime;
    });

    await firebase.dbSet(animeRef, animeObject);
    return true;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return false;
  }
}

// Get or create a unique user ID for local Firebase usage
function getUserId() {
  ensureDataDir();

  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (config.userId) return config.userId;
    } catch (error) {
      console.error('Error reading config:', error);
    }
  }

  // Generate new user ID
  const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ userId }, null, 2));
  return userId;
}

// Unified functions that work with both local and Firebase storage
async function loadAnimeList() {
  if (useFirebase) {
    return await loadAnimeListFirebase();
  }
  return loadAnimeListLocal();
}

async function saveAnimeList(animeList) {
  if (useFirebase) {
    return await saveAnimeListFirebase(animeList);
  }
  return saveAnimeListLocal(animeList);
}

async function addAnime(anime) {
  const animeList = await loadAnimeList();

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
  await saveAnimeList(animeList);

  return newAnime;
}

async function getAnimeList() {
  return await loadAnimeList();
}

async function getAnimeById(id) {
  const animeList = await loadAnimeList();
  return animeList.find(anime => anime.id === parseInt(id));
}

async function updateAnime(id, updates) {
  const animeList = await loadAnimeList();
  const index = animeList.findIndex(anime => anime.id === parseInt(id));

  if (index === -1) {
    return null;
  }

  animeList[index] = { ...animeList[index], ...updates };
  await saveAnimeList(animeList);

  return animeList[index];
}

async function deleteAnime(id) {
  const animeList = await loadAnimeList();
  const index = animeList.findIndex(anime => anime.id === parseInt(id));

  if (index === -1) {
    return false;
  }

  animeList.splice(index, 1);
  await saveAnimeList(animeList);

  return true;
}

async function searchAnime(query) {
  const animeList = await loadAnimeList();
  const lowerQuery = query.toLowerCase();

  return animeList.filter(anime =>
    anime.title.toLowerCase().includes(lowerQuery) ||
    (anime.notes && anime.notes.toLowerCase().includes(lowerQuery))
  );
}

async function filterByStatus(status) {
  const animeList = await loadAnimeList();
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
