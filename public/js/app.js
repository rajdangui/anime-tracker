// ═══════════════════════════════════════════════════
// ANIME TRACKER — APP CONTROLLER
// Scrollytelling + Jikan API Auto-Fetch
// ═══════════════════════════════════════════════════

// ─── State ───
let animeList = [];
let currentView = 'all';
let editingAnimeId = null;
let selectedJikanAnime = null;
let searchTimeout = null;
let currentRating = 0;

// ─── DOM Cache ───
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let DOM = {};

// ═══════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Initialize DOM cache after elements exist
  DOM = {
    navbar: $('#navbar'),
    animeContainer: $('#animeContainer'),
    emptyState: $('#emptyState'),
    searchInput: $('#searchInput'),
    animeModal: $('#animeModal'),
    deleteModal: $('#deleteModal'),
    animeForm: $('#animeForm'),
    sectionTitle: $('#sectionTitle'),
    sectionCount: $('#sectionCount'),
    searchBarContainer: $('#searchBarContainer'),
    searchResults: $('#searchResults'),
    searchSpinner: $('#searchSpinner'),
    selectedPreview: $('#selectedPreview'),
    toastContainer: $('#toastContainer'),
    heroParticles: $('#heroParticles'),
  };
  loadAnimeList();
  setupEventListeners();
  setupScrollEffects();
  generateParticles();
});

// ═══════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════

function setupEventListeners() {
  // ─── Add Anime Buttons ───
  $('#addAnimeBtn').addEventListener('click', openAddModal);
  $('#emptyAddBtn').addEventListener('click', openAddModal);
  $('#fabAdd').addEventListener('click', openAddModal);

  // ─── Search Result Selection (Event Delegation) ───
  // Use 'click' event — simpler and more reliable than mousedown
  DOM.searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const idx = parseInt(item.dataset.index);
    if (isNaN(idx)) return;
    const anime = _jikanCache[idx];
    if (!anime) return;

    const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
    const title = anime.title_english || anime.title || '';
    const episodes = anime.episodes || 0;
    const year = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : '';
    const meta = [year, episodes ? `${episodes} eps` : '', anime.type].filter(Boolean).join(' · ');

    selectJikanResult(anime.mal_id, title, img, episodes, meta);
  });

  // Also handle mousedown to prevent input blur before click fires
  DOM.searchResults.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  // ─── Card Actions (Event Delegation) ───
  DOM.animeContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const animeId = parseInt(btn.dataset.animeId);
    if (action === 'edit') {
      openEditModal(animeId);
    } else if (action === 'delete') {
      const title = btn.dataset.animeTitle || '';
      openDeleteModal(animeId, title);
    }
  });

  // ─── Filter Pills (both desktop & mobile) ───
  $$('.filter-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      setActiveFilter(view);
    });
  });

  // ─── Search Toggle ───
  $('#searchToggle').addEventListener('click', () => {
    DOM.searchBarContainer.classList.toggle('open');
    if (DOM.searchBarContainer.classList.contains('open')) {
      DOM.searchInput.focus();
    }
  });

  $('#searchClose').addEventListener('click', () => {
    DOM.searchBarContainer.classList.remove('open');
    DOM.searchInput.value = '';
    filterAndDisplayAnime();
  });

  // ─── Search Input ───
  DOM.searchInput.addEventListener('input', debounce(() => {
    filterAndDisplayAnime();
  }, 200));

  // ─── Modal Close Buttons ───
  $$('.modal-close-btn, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  // ─── Close modal on overlay click ───
  DOM.animeModal.addEventListener('click', (e) => {
    if (e.target === DOM.animeModal) closeModals();
  });
  DOM.deleteModal.addEventListener('click', (e) => {
    if (e.target === DOM.deleteModal) closeModals();
  });

  // ─── Form Submit ───
  DOM.animeForm.addEventListener('submit', handleFormSubmit);

  // ─── Delete Confirmation ───
  $('#confirmDelete').addEventListener('click', handleDelete);

  // ─── Anime Title Search (Jikan API) ───
  const animeTitle = $('#animeTitle');
  animeTitle.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) {
      DOM.searchResults.classList.remove('open');
      DOM.searchSpinner.classList.remove('active');
      return;
    }
    DOM.searchSpinner.classList.add('active');
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchJikanAnime(query), 500);
  });

  // ─── Enter key in title field: select first result or submit ───
  animeTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (_jikanCache && _jikanCache.length > 0 && DOM.searchResults.classList.contains('open')) {
        const anime = _jikanCache[0];
        const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
        const title = anime.title_english || anime.title || '';
        const episodes = anime.episodes || 0;
        const year = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : '';
        const meta = [year, episodes ? `${episodes} eps` : '', anime.type].filter(Boolean).join(' · ');
        selectJikanResult(anime.mal_id, title, img, episodes, meta);
      }
    }
  });

  // ─── Block form submission on Enter inside inputs (not submit button) ───
  DOM.animeForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
      e.preventDefault();
    }
  });

  // Close search results on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-group')) {
      DOM.searchResults.classList.remove('open');
    }
  });

  // ─── Clear Selection ───
  $('#clearSelection').addEventListener('click', clearAnimeSelection);

  // ─── Star Rating ───
  setupStarRating();

  // ─── Keyboard shortcuts ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });
}

// ═══════════════════════════════════════════════════
// SCROLL EFFECTS
// ═══════════════════════════════════════════════════

function setupScrollEffects() {
  // ─── Navbar scroll state ───
  const hero = $('#hero');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        DOM.navbar.classList.add('scrolled');
      } else {
        DOM.navbar.classList.remove('scrolled');
      }
    });
  }, { threshold: 0.1 });

  if (hero) observer.observe(hero);

  // ─── Card reveal on scroll ───
  setupCardObserver();
}

function setupCardObserver() {
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger the reveal
        const card = entry.target;
        const delay = Array.from(card.parentElement.children).indexOf(card) % 6;
        setTimeout(() => {
          card.classList.add('visible');
        }, delay * 80);
        cardObserver.unobserve(card);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  window._cardObserver = cardObserver;
}

function observeCards() {
  const cards = $$('.anime-card');
  cards.forEach(card => {
    if (!card.classList.contains('visible')) {
      window._cardObserver.observe(card);
    }
  });
}

// ═══════════════════════════════════════════════════
// HERO PARTICLES
// ═══════════════════════════════════════════════════

function generateParticles() {
  if (!DOM.heroParticles) return;
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'hero-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    particle.style.width = (1 + Math.random() * 2) + 'px';
    particle.style.height = particle.style.width;
    DOM.heroParticles.appendChild(particle);
  }
}

// ═══════════════════════════════════════════════════
// DATA LOADING & DISPLAY
// ═══════════════════════════════════════════════════

async function loadAnimeList() {
  try {
    animeList = await window.animeStorage.getAnimeList();
    filterAndDisplayAnime();
    updateHeroStats();
  } catch (error) {
    console.error('Error loading anime list:', error);
    showToast('Error loading anime list', 'error');
  }
}

function setActiveFilter(view) {
  currentView = view;

  // Update both desktop and mobile pills
  $$('.filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Update section title
  const titles = {
    'all': 'Your Collection',
    'watching': 'Currently Watching',
    'completed': 'Completed',
    'plan-to-watch': 'Plan to Watch',
    'on-hold': 'On Hold',
    'dropped': 'Dropped'
  };
  DOM.sectionTitle.textContent = titles[view] || 'Your Collection';

  filterAndDisplayAnime();
}

function filterAndDisplayAnime() {
  const filtered = getFilteredAnime();
  displayAnime(filtered);
}

function getFilteredAnime() {
  const searchTerm = DOM.searchInput.value.toLowerCase();
  let filtered = animeList;

  if (currentView !== 'all') {
    filtered = filtered.filter(a => a.status === currentView);
  }

  if (searchTerm) {
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(searchTerm) ||
      (a.notes && a.notes.toLowerCase().includes(searchTerm))
    );
  }

  return filtered;
}

function displayAnime(anime) {
  // Update count
  DOM.sectionCount.textContent = `${anime.length} anime`;

  if (!anime || anime.length === 0) {
    DOM.animeContainer.style.display = 'none';
    DOM.emptyState.style.display = 'flex';
    return;
  }

  DOM.animeContainer.style.display = 'grid';
  DOM.emptyState.style.display = 'none';
  DOM.animeContainer.innerHTML = anime.map(a => createAnimeCard(a)).join('');

  // Observe cards for scroll-triggered reveal
  requestAnimationFrame(() => observeCards());
}

// ═══════════════════════════════════════════════════
// ANIME CARD CREATION
// ═══════════════════════════════════════════════════

function createAnimeCard(anime) {
  const progress = anime.episodes && anime.currentEpisode
    ? Math.min((anime.currentEpisode / anime.episodes) * 100, 100)
    : 0;

  const hasImage = anime.imageUrl && anime.imageUrl.trim();

  const imageSection = hasImage
    ? `<div class="card-image" style="background-image: url('${anime.imageUrl}')"></div>`
    : `<div class="card-image-placeholder">
        <span class="card-placeholder-text">${anime.title.charAt(0)}</span>
       </div>`;

  const ratingSection = anime.rating
    ? `<span class="card-rating">
        <svg width="12" height="12" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ${anime.rating}
       </span>`
    : '';

  const progressSection = anime.episodes
    ? `<div class="card-progress">
        <div class="card-progress-fill" style="width: ${progress}%"></div>
       </div>`
    : '';

  const notesSection = anime.notes
    ? `<div class="card-notes">"${anime.notes}"</div>`
    : '';

  return `
    <div class="anime-card" data-id="${anime.id}">
      ${imageSection}
      <div class="card-overlay"></div>

      <div class="card-status status-${anime.status}">
        <span class="status-dot"></span>
        ${formatStatus(anime.status)}
      </div>

      <div class="card-actions">
        <button class="card-action-btn" data-action="edit" data-anime-id="${anime.id}" title="Edit" aria-label="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="card-action-btn btn-delete" data-action="delete" data-anime-id="${anime.id}" data-anime-title="${anime.title.replace(/"/g, '&quot;')}" title="Delete" aria-label="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      <div class="card-body">
        <h3 class="card-title">${anime.title}</h3>
        <div class="card-meta">
          <span class="card-meta-item">
            EP ${anime.currentEpisode || 0}/${anime.episodes || '?'}
          </span>
          ${ratingSection}
        </div>
        ${progressSection}
        ${notesSection}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════
// HERO STATS — ANIMATED COUNTERS
// ═══════════════════════════════════════════════════

function updateHeroStats() {
  const total = animeList.length;
  const watching = animeList.filter(a => a.status === 'watching').length;
  const completed = animeList.filter(a => a.status === 'completed').length;
  const totalEpisodes = animeList.reduce((sum, a) => sum + (a.currentEpisode || 0), 0);

  animateCounter($('#heroTotal'), total);
  animateCounter($('#heroWatching'), watching);
  animateCounter($('#heroCompleted'), completed);
  animateCounter($('#heroEpisodes'), totalEpisodes);
}

function animateCounter(el, target) {
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const duration = 800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ═══════════════════════════════════════════════════
// JIKAN API — ANIME SEARCH
// ═══════════════════════════════════════════════════

let _jikanCache = [];

async function searchJikanAnime(query) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=6&sfw=true`);

    if (!response.ok) {
      // Rate limited — retry after delay
      if (response.status === 429) {
        setTimeout(() => searchJikanAnime(query), 1500);
        return;
      }
      throw new Error('API error');
    }

    const data = await response.json();
    displaySearchResults(data.data || []);
  } catch (error) {
    console.error('Jikan API error:', error);
    DOM.searchResults.classList.remove('open');
  } finally {
    DOM.searchSpinner.classList.remove('active');
  }
}

function displaySearchResults(results) {
  _jikanCache = results;

  if (!results.length) {
    DOM.searchResults.innerHTML = '<div class="search-result-item no-result" style="color:var(--text-muted);justify-content:center;">No results found</div>';
    DOM.searchResults.classList.add('open');
    return;
  }

  DOM.searchResults.innerHTML = results.map((anime, i) => {
    const img = anime.images?.jpg?.image_url || '';
    const episodes = anime.episodes ? `${anime.episodes} eps` : 'Unknown eps';
    const year = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : '';
    const meta = [year, episodes, anime.type].filter(Boolean).join(' · ');
    const displayTitle = anime.title_english || anime.title || '';

    return `
      <div class="search-result-item" data-index="${i}" role="option" tabindex="-1">
        <img class="search-result-img" src="${img}" alt="" loading="lazy">
        <div class="search-result-info">
          <div class="search-result-title">${displayTitle}</div>
          <div class="search-result-meta">${meta}</div>
        </div>
      </div>
    `;
  }).join('');

  // Handle image errors (CSP-safe, no inline onerror)
  DOM.searchResults.querySelectorAll('.search-result-img').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });

  DOM.searchResults.classList.add('open');
}

function selectJikanResult(malId, title, imageUrl, episodes, meta) {
  selectedJikanAnime = { malId, title, imageUrl, episodes };

  // Fill form fields
  const titleInput = document.getElementById('animeTitle');
  if (titleInput) titleInput.value = title || '';
  
  if (episodes > 0) {
    const epInput = document.getElementById('animeEpisodes');
    if (epInput) epInput.value = episodes;
  }

  // Show preview
  if (imageUrl) {
    const previewImg = document.getElementById('previewImage');
    const previewTitle = document.getElementById('previewTitle');
    const previewMeta = document.getElementById('previewMeta');
    const selectedPreview = document.getElementById('selectedPreview');
    
    if (previewImg) previewImg.src = imageUrl;
    if (previewTitle) previewTitle.textContent = title;
    if (previewMeta) previewMeta.textContent = meta;
    if (selectedPreview) selectedPreview.style.display = 'flex';
  }

  // Close search results dropdown
  DOM.searchResults.classList.remove('open');
  DOM.searchResults.innerHTML = '';

  showToast(`Selected: ${title}`, 'success');
}

function clearAnimeSelection() {
  selectedJikanAnime = null;
  DOM.selectedPreview.style.display = 'none';
  $('#previewImage').src = '';
  $('#animeTitle').value = '';
  $('#animeEpisodes').value = '';
  $('#animeTitle').focus();
}

// ═══════════════════════════════════════════════════
// STAR RATING
// ═══════════════════════════════════════════════════

function setupStarRating() {
  const stars = $$('.rating-star');
  const display = $('#ratingDisplay');

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.value);
      stars.forEach(s => {
        const sv = parseInt(s.dataset.value);
        s.classList.toggle('hover-preview', sv <= val);
      });
    });

    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.value);
      currentRating = val;
      $('#animeRating').value = val;
      stars.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value) <= val);
        s.classList.remove('hover-preview');
      });
      display.textContent = `${val}/10`;
    });
  });

  // Reset hover on leave
  const ratingInput = $('#ratingInput');
  ratingInput.addEventListener('mouseleave', () => {
    stars.forEach(s => {
      s.classList.remove('hover-preview');
    });
  });
}

function setStarRating(val) {
  currentRating = val;
  $('#animeRating').value = val || '';
  const stars = $$('.rating-star');
  const display = $('#ratingDisplay');

  stars.forEach(s => {
    s.classList.toggle('active', val && parseInt(s.dataset.value) <= val);
    s.classList.remove('hover-preview');
  });
  display.textContent = val ? `${val}/10` : 'No rating';
}

// ═══════════════════════════════════════════════════
// MODAL HANDLING
// ═══════════════════════════════════════════════════

function openAddModal() {
  editingAnimeId = null;
  selectedJikanAnime = null;
  $('#modalTitle').textContent = 'Add Anime';
  $('#submitBtnText').textContent = 'Add Anime';
  DOM.animeForm.reset();
  DOM.selectedPreview.style.display = 'none';
  DOM.searchResults.classList.remove('open');
  DOM.searchResults.innerHTML = '';
  setStarRating(0);
  DOM.animeModal.classList.add('show');
  document.body.style.overflow = 'hidden';

  // Focus on title input
  setTimeout(() => $('#animeTitle').focus(), 300);
}

function openEditModal(id) {
  editingAnimeId = id;
  const anime = animeList.find(a => a.id === id);
  if (!anime) return;

  selectedJikanAnime = anime.imageUrl ? { imageUrl: anime.imageUrl, malId: anime.malId } : null;

  $('#modalTitle').textContent = 'Edit Anime';
  $('#submitBtnText').textContent = 'Update';

  $('#animeTitle').value = anime.title;
  $('#animeStatus').value = anime.status;
  $('#animeEpisodes').value = anime.episodes || '';
  $('#animeCurrent').value = anime.currentEpisode || 0;
  $('#animeNotes').value = anime.notes || '';

  setStarRating(anime.rating || 0);

  // Show preview if image exists
  if (anime.imageUrl) {
    $('#previewImage').src = anime.imageUrl;
    $('#previewTitle').textContent = anime.title;
    $('#previewMeta').textContent = `EP ${anime.currentEpisode || 0}/${anime.episodes || '?'}`;
    DOM.selectedPreview.style.display = 'flex';
  } else {
    DOM.selectedPreview.style.display = 'none';
  }

  DOM.searchResults.classList.remove('open');
  DOM.searchResults.innerHTML = '';
  DOM.animeModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function openDeleteModal(id, title) {
  editingAnimeId = id;
  $('#deleteAnimeName').textContent = title;
  DOM.deleteModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModals() {
  DOM.animeModal.classList.remove('show');
  DOM.deleteModal.classList.remove('show');
  document.body.style.overflow = '';
  editingAnimeId = null;
  selectedJikanAnime = null;
  DOM.searchResults.classList.remove('open');
  DOM.searchResults.innerHTML = '';
}

// ═══════════════════════════════════════════════════
// FORM HANDLING
// ═══════════════════════════════════════════════════

async function handleFormSubmit(e) {
  e.preventDefault();

  // If search results are open, select the first result instead of saving
  if (DOM.searchResults.classList.contains('open') && _jikanCache && _jikanCache.length > 0) {
    const anime = _jikanCache[0];
    const img = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
    const title = anime.title_english || anime.title || '';
    const episodes = anime.episodes || 0;
    const year = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : '';
    const meta = [year, episodes ? `${episodes} eps` : '', anime.type].filter(Boolean).join(' · ');
    selectJikanResult(anime.mal_id, title, img, episodes, meta);
    return;
  }

  const animeData = {
    title: $('#animeTitle').value.trim(),
    status: $('#animeStatus').value,
    episodes: parseInt($('#animeEpisodes').value) || null,
    currentEpisode: parseInt($('#animeCurrent').value) || 0,
    rating: parseFloat($('#animeRating').value) || null,
    notes: $('#animeNotes').value.trim(),
    imageUrl: selectedJikanAnime?.imageUrl || null,
    malId: selectedJikanAnime?.malId || null,
  };

  if (!animeData.title) {
    showToast('Please enter an anime title', 'error');
    return;
  }

  try {
    if (editingAnimeId) {
      await window.animeStorage.updateAnime(editingAnimeId, animeData);
      showToast('Anime updated!', 'success');
    } else {
      await window.animeStorage.addAnime(animeData);
      showToast('Anime added!', 'success');
    }

    await loadAnimeList();
    closeModals();
  } catch (error) {
    console.error('Error saving anime:', error);
    showToast('Error saving anime', 'error');
  }
}

async function handleDelete() {
  if (!editingAnimeId) return;

  try {
    await window.animeStorage.deleteAnime(editingAnimeId);
    showToast('Anime deleted', 'success');
    await loadAnimeList();
    closeModals();
  } catch (error) {
    console.error('Error deleting anime:', error);
    showToast('Error deleting anime', 'error');
  }
}

// ═══════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : '✕';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function formatStatus(status) {
  const map = {
    'watching': 'Watching',
    'completed': 'Completed',
    'plan-to-watch': 'Plan to Watch',
    'on-hold': 'On Hold',
    'dropped': 'Dropped'
  };
  return map[status] || status;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
