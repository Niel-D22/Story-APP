import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CONFIG from "../../config.js";

const FavoritesPage = {
  favorites: [],
  filteredFavorites: [],
  currentSort: 'newest',
  searchQuery: '',

  async render() {
    return `
      <section class="favorites-container">
        <header class="favorites-header">
          <h1>⭐ Cerita Favorit</h1>
          <button id="backBtn" class="btn-secondary">← Kembali</button>
        </header>

        <!-- Search, Filter, and Sort Controls -->
        <div class="controls-panel">
          <div class="search-box">
            <input 
              type="text" 
              id="searchInput" 
              placeholder="🔍 Cari cerita favorit..." 
              aria-label="Search favorites"
            />
          </div>

          <div class="filter-sort-controls">
            <div class="control-group">
              <label for="sortSelect">📊 Urutkan:</label>
              <select id="sortSelect" aria-label="Sort favorites">
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="name-asc">Nama A-Z</option>
                <option value="name-desc">Nama Z-A</option>
              </select>
            </div>

            <button id="clearAllBtn" class="btn-danger">
              🗑️ Hapus Semua
            </button>
          </div>
        </div>

        <div id="message-container" class="message-container" role="status" aria-live="polite"></div>

        <!-- Statistics -->
        <div class="favorites-stats">
          <div class="stat-card">
            <span class="stat-number" id="totalCount">0</span>
            <span class="stat-label">Total Favorit</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="filteredCount">0</span>
            <span class="stat-label">Ditampilkan</span>
          </div>
        </div>

        <!-- Map Preview -->
        <div class="map-container">
          <h3>📍 Peta Lokasi Favorit</h3>
          <div id="favoritesMap" class="favorites-map"></div>
        </div>

        <!-- Favorites Grid -->
        <div class="favorites-content">
          <h3>Daftar Cerita</h3>
          <div id="favoritesList" class="favorites-list"></div>
        </div>
      </section>

      <style>
        .favorites-container {
          padding: 1rem;
          font-family: sans-serif;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .favorites-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .favorites-header h1 {
          margin: 0;
          font-size: 1.8rem;
          color: #333;
        }

        /* Controls Panel */
        .controls-panel {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          color: white;
        }

        .search-box {
          margin-bottom: 1rem;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .filter-sort-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .control-group label {
          font-weight: 600;
        }

        .control-group select {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          background: white;
          color: #333;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .btn-danger {
          background: #f44336;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-danger:hover {
          background: #d32f2f;
          transform: scale(1.05);
        }

        /* Statistics */
        .favorites-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: #667eea;
        }

        .stat-label {
          display: block;
          font-size: 0.9rem;
          color: #666;
          margin-top: 0.25rem;
        }

        /* Map */
        .map-container {
          margin-bottom: 1.5rem;
        }

        .map-container h3 {
          margin-bottom: 0.5rem;
        }

        .favorites-map {
          height: 400px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Favorites List */
        .favorites-content h3 {
          margin-bottom: 1rem;
        }

        .favorites-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .favorite-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .favorite-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        .favorite-card img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .favorite-card-content {
          padding: 1rem;
        }

        .favorite-card h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: #333;
        }

        .favorite-card p {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #666;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .favorite-card small {
          display: block;
          font-size: 0.8rem;
          color: #999;
          margin-bottom: 0.5rem;
        }

        .favorite-card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .favorite-card-actions button {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .btn-remove {
          background: #f44336;
          color: white;
        }

        .btn-remove:hover {
          background: #d32f2f;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #999;
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin-bottom: 0.5rem;
          color: #666;
        }

        .empty-state p {
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .filter-sort-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .favorites-header {
            flex-direction: column;
            align-items: stretch;
          }
        }
      </style>
    `;
  },

  async afterRender() {
    const backBtn = document.getElementById('backBtn');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const msgContainer = document.getElementById('message-container');

    // Navigation
    backBtn.addEventListener('click', () => {
      window.location.hash = '#/home';
    });

    // Load favorites from IndexedDB
    await this.loadFavorites();
    this.filteredFavorites = [...this.favorites];

    // Update UI
    this.updateStatistics();
    this.renderFavoritesList();
    
    // Render map with delay to ensure DOM is ready
    setTimeout(() => {
      this.renderMap();
    }, 100);

    // Search functionality
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.applyFiltersAndSort();
    });

    // Sort functionality
    sortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.applyFiltersAndSort();
    });

    // Clear all favorites
    clearAllBtn.addEventListener('click', async () => {
      if (this.favorites.length === 0) {
        msgContainer.innerHTML = '⚠️ Tidak ada favorit untuk dihapus';
        return;
      }

      const confirmed = confirm('Yakin ingin menghapus semua favorit?');
      if (confirmed) {
        await this.clearAllFavorites();
        this.favorites = [];
        this.filteredFavorites = [];
        this.updateStatistics();
        this.renderFavoritesList();
        this.renderMap();
        msgContainer.innerHTML = '✅ Semua favorit berhasil dihapus';
        setTimeout(() => {
          msgContainer.innerHTML = '';
        }, 3000);
      }
    });
  },

  // Apply search and sort
  applyFiltersAndSort() {
    // Search filter
    if (this.searchQuery) {
      this.filteredFavorites = this.favorites.filter(story => 
        story.name.toLowerCase().includes(this.searchQuery) ||
        story.description.toLowerCase().includes(this.searchQuery)
      );
    } else {
      this.filteredFavorites = [...this.favorites];
    }

    // Sort
    switch (this.currentSort) {
      case 'newest':
        this.filteredFavorites.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case 'oldest':
        this.filteredFavorites.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case 'name-asc':
        this.filteredFavorites.sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        break;
      case 'name-desc':
        this.filteredFavorites.sort((a, b) => 
          b.name.localeCompare(a.name)
        );
        break;
    }

    this.updateStatistics();
    this.renderFavoritesList();
    this.renderMap();
  },

  // Update statistics
  updateStatistics() {
    document.getElementById('totalCount').textContent = this.favorites.length;
    document.getElementById('filteredCount').textContent = this.filteredFavorites.length;
  },

  // Render favorites list
  renderFavoritesList() {
    const listContainer = document.getElementById('favoritesList');

    if (this.filteredFavorites.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>${this.searchQuery ? 'Tidak ada hasil' : 'Belum ada favorit'}</h3>
          <p>${this.searchQuery ? 'Coba kata kunci lain' : 'Mulai simpan cerita favorit dari halaman home'}</p>
          ${!this.searchQuery ? '<a href="#/home" class="btn-primary">Ke Home</a>' : ''}
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.filteredFavorites.map(story => `
      <div class="favorite-card" data-id="${story.id}">
        ${story.photoUrl ? `<img src="${story.photoUrl}" alt="${story.name}" />` : ''}
        <div class="favorite-card-content">
          <h4>${story.name}</h4>
          <p>${story.description}</p>
          <small>📍 ${story.lat && story.lon ? `${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}` : 'Lokasi tidak tersedia'}</small>
          <div class="favorite-card-actions">
            <button class="btn-remove" data-id="${story.id}">
              ❌ Hapus
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Add remove button listeners
    listContainer.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const storyId = btn.getAttribute('data-id');
        await this.removeFavorite(storyId);
        
        // Update local arrays
        this.favorites = this.favorites.filter(s => s.id !== storyId);
        this.applyFiltersAndSort();
        
        const msgContainer = document.getElementById('message-container');
        msgContainer.innerHTML = '✅ Favorit dihapus';
        setTimeout(() => {
          msgContainer.innerHTML = '';
        }, 2000);
      });
    });
  },

  // Render map
  renderMap() {
    const mapContainer = document.getElementById('favoritesMap');
    if (!mapContainer) return;

    if (window.favoritesMap) {
      window.favoritesMap.remove();
    }

    window.favoritesMap = L.map('favoritesMap').setView([-1.4748, 124.8421], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(window.favoritesMap);

    // Add markers for filtered favorites
    this.filteredFavorites.forEach(story => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .addTo(window.favoritesMap)
          .bindPopup(`<b>${story.name}</b><br>${story.description}`);
      }
    });

    // Fit bounds if there are markers
    if (this.filteredFavorites.length > 0) {
      const bounds = this.filteredFavorites
        .filter(s => s.lat && s.lon)
        .map(s => [s.lat, s.lon]);
      
      if (bounds.length > 0) {
        window.favoritesMap.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  },

  // IndexedDB operations
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('StoryMapDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('offline-stories')) {
          db.createObjectStore('offline-stories', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  },

  async loadFavorites() {
    try {
      const db = await this.openDB();
      this.favorites = await new Promise((resolve, reject) => {
        const transaction = db.transaction(['favorites'], 'readonly');
        const store = transaction.objectStore('favorites');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Load favorites error:', error);
      this.favorites = [];
    }
  },

  async removeFavorite(storyId) {
    try {
      const db = await this.openDB();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        const request = store.delete(storyId);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Remove favorite error:', error);
    }
  },

  async clearAllFavorites() {
    try {
      const db = await this.openDB();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Clear all favorites error:', error);
    }
  },
};

export default FavoritesPage;