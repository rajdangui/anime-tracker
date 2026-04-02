// State
let animeList = [];
let currentView = 'all';
let currentLayout = 'grid';
let editingAnimeId = null;

// DOM Elements
const animeContainer = document.getElementById('animeContainer');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const animeModal = document.getElementById('animeModal');
const deleteModal = document.getElementById('deleteModal');
const animeForm = document.getElementById('animeForm');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadAnimeList();
  setupEventListeners();
  setupScrollEffects();
});

// Scroll effects for scrollytelling
function setupScrollEffects() {
  const header = document.querySelector('.header');
  const contentArea = document.querySelector('.content-area');

  if (contentArea) {
    contentArea.addEventListener('scroll', () => {
      if (contentArea.scrollTop > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Intersection Observer for fade-in animations on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe anime cards as they're added
  const observeCards = () => {
    document.querySelectorAll('.anime-card').forEach(card => {
      observer.observe(card);
    });
  };

  // Call it initially and whenever cards are updated
  const originalDisplayAnimeGrid = displayAnimeGrid;
  window.displayAnimeGrid = function(anime) {
    originalDisplayAnimeGrid(anime);
    setTimeout(observeCards, 50);
  };
}

// Event Listeners
function setupEventListeners() {
  // Add anime button
  document.getElementById('addAnimeBtn').addEventListener('click', openAddModal);
  document.getElementById('emptyAddBtn').addEventListener('click', openAddModal);

  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentView = e.target.dataset.view;
      filterAndDisplayAnime();
    });
  });

  // View layout toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentLayout = e.target.dataset.layout;
      displayAnime(getFilteredAnime());
    });
  });

  // Search
  searchInput.addEventListener('input', handleSearch);

  // Modal controls
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  // Form submit
  animeForm.addEventListener('submit', handleFormSubmit);

  // Delete confirmation
  document.getElementById('confirmDelete').addEventListener('click', handleDelete);

  // Close modal on outside click
  animeModal.addEventListener('click', (e) => {
    if (e.target === animeModal) closeModals();
  });
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeModals();
  });
}

// Load anime list from storage
async function loadAnimeList() {
  try {
    animeList = await window.animeStorage.getAnimeList();
    filterAndDisplayAnime();
    updateStatistics();
  } catch (error) {
    console.error('Error loading anime list:', error);
    showNotification('Error loading anime list', 'error');
  }
}

// Filter and display anime based on current view
function filterAndDisplayAnime() {
  const filtered = getFilteredAnime();
  displayAnime(filtered);
  updateStatistics();
}

// Get filtered anime based on current view
function getFilteredAnime() {
  const searchTerm = searchInput.value.toLowerCase();

  let filtered = animeList;

  // Filter by status
  if (currentView !== 'all') {
    filtered = filtered.filter(anime => anime.status === currentView);
  }

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(anime =>
      anime.title.toLowerCase().includes(searchTerm) ||
      (anime.notes && anime.notes.toLowerCase().includes(searchTerm))
    );
  }

  return filtered;
}

// Display anime in grid or table layout
function displayAnime(anime) {
  if (!anime || anime.length === 0) {
    animeContainer.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  animeContainer.style.display = currentLayout === 'grid' ? 'grid' : 'block';
  emptyState.style.display = 'none';

  if (currentLayout === 'grid') {
    displayAnimeGrid(anime);
  } else {
    displayAnimeTable(anime);
  }
}

// Display anime in grid layout
function displayAnimeGrid(anime) {
  animeContainer.className = 'anime-grid';
  animeContainer.innerHTML = anime.map(a => createAnimeCard(a)).join('');
}

// Create anime card HTML
function createAnimeCard(anime) {
  const progress = anime.episodes && anime.currentEpisode
    ? (anime.currentEpisode / anime.episodes) * 100
    : 0;

  const rating = anime.rating ? '⭐'.repeat(Math.round(anime.rating / 2)) : 'Not rated';

  return `
    <div class="anime-card" data-id="${anime.id}">
      <div class="anime-card-header">
        <h3 class="anime-title">${anime.title}</h3>
        <div class="anime-actions">
          <button class="icon-btn edit-btn" onclick="openEditModal(${anime.id})">✏️</button>
          <button class="icon-btn delete-btn" onclick="openDeleteModal(${anime.id}, '${anime.title.replace(/'/g, "\\'")}')">🗑️</button>
        </div>
      </div>

      <div class="anime-status status-${anime.status}">
        ${getStatusEmoji(anime.status)} ${formatStatus(anime.status)}
      </div>

      <div class="anime-info">
        <div class="info-row">
          <span class="info-label">Episodes:</span>
          <span class="info-value">${anime.currentEpisode || 0}/${anime.episodes || '?'}</span>
        </div>
        ${anime.episodes ? `
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Rating:</span>
          <span class="info-value rating">${rating}</span>
        </div>
      </div>

      ${anime.notes ? `<div class="anime-notes">"${anime.notes}"</div>` : ''}
    </div>
  `;
}

// Display anime in table layout
function displayAnimeTable(anime) {
  animeContainer.className = 'anime-table';
  animeContainer.innerHTML = `
    <div class="anime-table-header">
      <div class="anime-table-row">
        <div class="anime-table-cell"><strong>Title</strong></div>
        <div class="anime-table-cell"><strong>Status</strong></div>
        <div class="anime-table-cell"><strong>Progress</strong></div>
        <div class="anime-table-cell"><strong>Rating</strong></div>
        <div class="anime-table-cell"><strong>Actions</strong></div>
      </div>
    </div>
    ${anime.map(a => `
      <div class="anime-table-row">
        <div class="anime-table-cell">${a.title}</div>
        <div class="anime-table-cell">
          <span class="anime-status status-${a.status}">
            ${getStatusEmoji(a.status)} ${formatStatus(a.status)}
          </span>
        </div>
        <div class="anime-table-cell">${a.currentEpisode || 0}/${a.episodes || '?'}</div>
        <div class="anime-table-cell">
          ${a.rating ? `⭐ ${a.rating}/10` : 'Not rated'}
        </div>
        <div class="anime-table-cell">
          <button class="icon-btn" onclick="openEditModal(${a.id})">✏️</button>
          <button class="icon-btn" onclick="openDeleteModal(${a.id}, '${a.title.replace(/'/g, "\\'")}')">🗑️</button>
        </div>
      </div>
    `).join('')}
  `;
}

// Update statistics
function updateStatistics() {
  const total = animeList.length;
  const watching = animeList.filter(a => a.status === 'watching').length;
  const completed = animeList.filter(a => a.status === 'completed').length;
  const totalEpisodes = animeList.reduce((sum, a) => sum + (a.currentEpisode || 0), 0);

  const ratedAnime = animeList.filter(a => a.rating);
  const avgRating = ratedAnime.length > 0
    ? (ratedAnime.reduce((sum, a) => sum + a.rating, 0) / ratedAnime.length).toFixed(1)
    : '-';

  document.getElementById('totalCount').textContent = total;
  document.getElementById('watchingCount').textContent = watching;
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('totalEpisodes').textContent = totalEpisodes;
  document.getElementById('avgRating').textContent = avgRating;
}

// Modal functions
function openAddModal() {
  editingAnimeId = null;
  document.getElementById('modalTitle').textContent = 'Add Anime';
  document.getElementById('submitBtnText').textContent = 'Add Anime';
  animeForm.reset();
  animeModal.classList.add('show');
}

function openEditModal(id) {
  editingAnimeId = id;
  const anime = animeList.find(a => a.id === id);
  if (!anime) return;

  document.getElementById('modalTitle').textContent = 'Edit Anime';
  document.getElementById('submitBtnText').textContent = 'Update Anime';

  document.getElementById('animeTitle').value = anime.title;
  document.getElementById('animeStatus').value = anime.status;
  document.getElementById('animeEpisodes').value = anime.episodes || '';
  document.getElementById('animeCurrent').value = anime.currentEpisode || 0;
  document.getElementById('animeRating').value = anime.rating || '';
  document.getElementById('animeNotes').value = anime.notes || '';

  animeModal.classList.add('show');
}

function openDeleteModal(id, title) {
  editingAnimeId = id;
  document.getElementById('deleteAnimeName').textContent = title;
  deleteModal.classList.add('show');
}

function closeModals() {
  animeModal.classList.remove('show');
  deleteModal.classList.remove('show');
  editingAnimeId = null;
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const animeData = {
    title: document.getElementById('animeTitle').value,
    status: document.getElementById('animeStatus').value,
    episodes: parseInt(document.getElementById('animeEpisodes').value) || null,
    currentEpisode: parseInt(document.getElementById('animeCurrent').value) || 0,
    rating: parseFloat(document.getElementById('animeRating').value) || null,
    notes: document.getElementById('animeNotes').value
  };

  try {
    if (editingAnimeId) {
      await window.animeStorage.updateAnime(editingAnimeId, animeData);
      showNotification('Anime updated successfully!', 'success');
    } else {
      await window.animeStorage.addAnime(animeData);
      showNotification('Anime added successfully!', 'success');
    }

    await loadAnimeList();
    closeModals();
  } catch (error) {
    console.error('Error saving anime:', error);
    showNotification('Error saving anime', 'error');
  }
}

// Handle delete
async function handleDelete() {
  if (!editingAnimeId) return;

  try {
    await window.animeStorage.deleteAnime(editingAnimeId);
    showNotification('Anime deleted successfully!', 'success');
    await loadAnimeList();
    closeModals();
  } catch (error) {
    console.error('Error deleting anime:', error);
    showNotification('Error deleting anime', 'error');
  }
}

// Handle search
function handleSearch() {
  filterAndDisplayAnime();
}

// Helper functions
function getStatusEmoji(status) {
  const emojis = {
    'watching': '📺',
    'completed': '✅',
    'plan-to-watch': '📋',
    'on-hold': '⏸️',
    'dropped': '❌'
  };
  return emojis[status] || '📺';
}

function formatStatus(status) {
  return status.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function showNotification(message, type = 'info') {
  // Simple notification (can be enhanced with a toast library)
  console.log(`[${type.toUpperCase()}] ${message}`);
  // TODO: Implement toast notifications
}
