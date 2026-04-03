// Browser-based storage for anime tracker
// Supports both localStorage and Firebase

class AnimeStorage {
  constructor() {
    this.useFirebase = false;
    this.db = null;
    this.userId = this.getUserId();
    this.initFirebase();
  }

  // Get or create user ID
  getUserId() {
    let userId = localStorage.getItem('anime_tracker_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(7);
      localStorage.setItem('anime_tracker_user_id', userId);
    }
    return userId;
  }

  // Initialize Firebase if configured
  initFirebase() {
    try {
      // Firebase config - replace with your own or set to null to use localStorage only
      const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        databaseURL: "YOUR_DATABASE_URL",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
      };

      // Only initialize if config is set
      if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY') {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.database();
        this.useFirebase = true;
        console.log('Firebase initialized - using cloud storage');
      } else {
        console.log('Firebase not configured - using localStorage');
      }
    } catch (error) {
      console.log('Firebase initialization failed - using localStorage:', error.message);
      this.useFirebase = false;
    }
  }

  // Local storage methods
  loadAnimeListLocal() {
    try {
      const data = localStorage.getItem('anime_tracker_data');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  saveAnimeListLocal(animeList) {
    try {
      localStorage.setItem('anime_tracker_data', JSON.stringify(animeList));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // Firebase methods
  async loadAnimeListFirebase() {
    try {
      const snapshot = await this.db.ref(`users/${this.userId}/anime`).once('value');
      if (snapshot.exists()) {
        const data = snapshot.val();
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

  async saveAnimeListFirebase(animeList) {
    try {
      const animeObject = {};
      animeList.forEach(anime => {
        animeObject[anime.id] = anime;
      });
      await this.db.ref(`users/${this.userId}/anime`).set(animeObject);
      return true;
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      return false;
    }
  }

  // Unified API
  async getAnimeList() {
    if (this.useFirebase) {
      return await this.loadAnimeListFirebase();
    }
    return this.loadAnimeListLocal();
  }

  async saveAnimeList(animeList) {
    if (this.useFirebase) {
      return await this.saveAnimeListFirebase(animeList);
    }
    return this.saveAnimeListLocal(animeList);
  }

  async addAnime(anime) {
    const animeList = await this.getAnimeList();
    const newAnime = {
      id: Date.now(),
      title: anime.title,
      status: anime.status || 'plan-to-watch',
      episodes: anime.episodes || null,
      currentEpisode: anime.currentEpisode || 0,
      rating: anime.rating || null,
      notes: anime.notes || '',
      imageUrl: anime.imageUrl || null,
      malId: anime.malId || null,
      addedDate: new Date().toISOString()
    };
    animeList.push(newAnime);
    await this.saveAnimeList(animeList);
    return newAnime;
  }

  async getAnimeById(id) {
    const animeList = await this.getAnimeList();
    return animeList.find(anime => anime.id === parseInt(id));
  }

  async updateAnime(id, updates) {
    const animeList = await this.getAnimeList();
    const index = animeList.findIndex(anime => anime.id === parseInt(id));
    if (index === -1) return null;
    animeList[index] = { ...animeList[index], ...updates };
    await this.saveAnimeList(animeList);
    return animeList[index];
  }

  async deleteAnime(id) {
    const animeList = await this.getAnimeList();
    const index = animeList.findIndex(anime => anime.id === parseInt(id));
    if (index === -1) return false;
    animeList.splice(index, 1);
    await this.saveAnimeList(animeList);
    return true;
  }

  async searchAnime(query) {
    const animeList = await this.getAnimeList();
    const lowerQuery = query.toLowerCase();
    return animeList.filter(anime =>
      anime.title.toLowerCase().includes(lowerQuery) ||
      (anime.notes && anime.notes.toLowerCase().includes(lowerQuery))
    );
  }

  async filterByStatus(status) {
    const animeList = await this.getAnimeList();
    return animeList.filter(anime => anime.status === status);
  }
}

// Create a global storage instance
window.animeStorage = new AnimeStorage();
