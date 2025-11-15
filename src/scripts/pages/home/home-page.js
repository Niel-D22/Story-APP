import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../data/api.js";
import CONFIG from "../../config.js";
import PushNotification from "../../utils/push-notification.js";


const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const HomePage = {
  async render() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    return `
     <section class="home-container">
    <header class="home-header">
      <div class="home-header-text">
        <h1>Hai, ${currentUser ? currentUser.name : "Pengguna"}!</h1>
        <p>Selamat datang di <b>Story Map</b> – bagikan kisahmu lewat peta interaktif!</p>
      </div>

      <div class="home-header-actions">
        <button id="addStoryBtn" class="btn-primary">📝 Tambah Story</button>
        <button id="favoritesBtn" class="btn-secondary">⭐ Favorit</button>
        <button id="logoutBtn" class="btn-secondary">🚪 Logout</button>
      </div>
    </header>

    <!-- Push Notification Toggle -->
    <div class="notification-toggle">
      <label for="pushToggle" class="toggle-label">
        <span class="toggle-icon">🔔</span>
        <span>Notifikasi Push</span>
      </label>
      <button id="pushToggle" class="toggle-btn" aria-label="Toggle push notification">
        <span class="toggle-status">Memuat...</span>
      </button>
    </div>

    <div id="message-container" class="message-container" role="status" aria-live="polite"></div>

    <main class="">
      <div class="map-and-stories">
        <div class="map-preview" id="mapPreview" role="application" aria-label="Peta lokasi cerita"></div>

        <div class="stories-container">
          <h3>Cerita Terbaru</h3>
          <div id="stories" class="stories"></div>
        </div>
      </div>
    </main>
  </section>

      <style>
        /* Container utama */
.home-container {
  padding: 1rem;
  font-family: sans-serif;
}

/* Header */
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.home-header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.home-header-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

/* Push Notification Toggle */
.notification-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.toggle-icon {
  font-size: 1.5rem;
}

.toggle-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}

.toggle-btn.active {
  background: #4caf50;
  border-color: #4caf50;
}

.toggle-btn.inactive {
  background: #f44336;
  border-color: #f44336;
}

/* Map dan Stories */
.map-preview {
  width: 100%; 
  height: 500px;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stories-container {
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
  padding: 1rem;
  border-radius: 8px;
  background-color: #fafafa;
  border: 1px solid #ddd;
}

.stories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.story-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
}

.story-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.story-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.story-card h4 {
  margin: 0.5rem;
  font-size: 1rem;
}

.story-card p {
  margin: 0.25rem 0.5rem;
  font-size: 0.875rem;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-card small {
  margin: 0 0.5rem 0.5rem 0.5rem;
  color: #555;
  font-size: 0.75rem;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.favorite-btn:hover {
  transform: scale(1.1);
  background: white;
}

.favorite-btn.favorited {
  color: #ff6b6b;
}

/* Responsive */
@media (max-width: 768px) {
  .home-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notification-toggle {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
      </style>
    `;
  },

  async afterRender() {
    const addBtn = document.getElementById("addStoryBtn");
    const favoritesBtn = document.getElementById("favoritesBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const pushToggle = document.getElementById("pushToggle");
    const msgContainer = document.getElementById("message-container");

    // Navigation
    addBtn.addEventListener("click", () => (window.location.hash = "/addstory"));
    favoritesBtn.addEventListener("click", () => (window.location.hash = "/favorites"));
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      window.location.hash = "#/login";
    });

    // Push Notification Toggle
    await this.initPushNotification(pushToggle, msgContainer);

    // Load stories dan map
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const token = currentUser?.token;

    if (!token) {
      if (msgContainer) msgContainer.innerHTML = "❌ Silakan login dulu!";
      setTimeout(() => (window.location.hash = "#/login"), 1000);
      return;
    }

    let storiesData = [];
    try {
      const response = await API.getStories(token, 1, 20, 1);
      storiesData = response.listStory || [];
    } catch (err) {
      console.error("Gagal mengambil stories:", err);
      if (msgContainer) msgContainer.innerHTML = "⚠️ Gagal memuat cerita.";
    }

    await this.renderStories(storiesData);
    await this.renderMap(storiesData);
  },

  // Initialize Push Notification Toggle
  async initPushNotification(toggleBtn, msgContainer) {
    if (!PushNotification.isSupported()) {
      toggleBtn.textContent = "❌ Tidak Didukung";
      toggleBtn.disabled = true;
      return;
    }

    // Check current subscription status
    const isSubscribed = await PushNotification.isSubscribed();
    this.updateToggleButton(toggleBtn, isSubscribed);

    // Toggle event
    toggleBtn.addEventListener("click", async () => {
      try {
        const currentStatus = await PushNotification.isSubscribed();

        if (currentStatus) {
          // Unsubscribe
          await PushNotification.unsubscribe();
          this.updateToggleButton(toggleBtn, false);
          msgContainer.innerHTML = "🔕 Notifikasi push dimatikan";
        } else {
          // Request permission dan subscribe
          const granted = await PushNotification.requestPermission();
          
          if (!granted) {
            msgContainer.innerHTML = "❌ Izin notifikasi ditolak";
            return;
          }

          await PushNotification.subscribe();
          this.updateToggleButton(toggleBtn, true);
          msgContainer.innerHTML = "🔔 Notifikasi push diaktifkan! Anda akan menerima notifikasi saat ada story baru.";
        }

        setTimeout(() => {
          msgContainer.innerHTML = "";
        }, 3000);
      } catch (error) {
        console.error("Push toggle error:", error);
        msgContainer.innerHTML = "⚠️ Gagal mengubah pengaturan notifikasi";
      }
    });
  },

  updateToggleButton(btn, isActive) {
    btn.className = `toggle-btn ${isActive ? 'active' : 'inactive'}`;
    btn.innerHTML = `<span class="toggle-status">${isActive ? '✓ Aktif' : '✗ Nonaktif'}</span>`;
  },

  async renderStories(storiesData) {
    const storiesContainer = document.getElementById("stories");
    if (!storiesContainer) return;

    // Get favorites dari IndexedDB
    const favorites = await this.getFavorites();
    const favoriteIds = new Set(favorites.map(f => f.id));

    if (storiesData.length === 0) {
      storiesContainer.innerHTML = "<p>📭 Belum ada cerita yang ditambahkan.</p>";
      return;
    }

    storiesContainer.innerHTML = storiesData
      .map((story) => {
        const isFavorited = favoriteIds.has(story.id);
        return `
          <div class="story-card" data-story-id="${story.id}">
            <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                    data-story-id="${story.id}" 
                    aria-label="Toggle favorite">
              ${isFavorited ? '❤️' : '🤍'}
            </button>
            ${story.photoUrl ? `<img src="${story.photoUrl}" alt="foto cerita: ${story.name}" />` : ""}
            <h4>${story.name}</h4>
            <p>${story.description}</p>
            <small>📍 ${
              story.lat && story.lon
                ? `(${story.lat.toFixed(4)}, ${story.lon.toFixed(4)})`
                : "Lokasi tidak tersedia"
            }</small>
          </div>
        `;
      })
      .join("");

    // Add favorite button listeners
    storiesContainer.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const storyId = btn.getAttribute('data-story-id');
        const story = storiesData.find(s => s.id === storyId);
        
        if (btn.classList.contains('favorited')) {
          await this.removeFavorite(storyId);
          btn.classList.remove('favorited');
          btn.textContent = '🤍';
        } else {
          await this.addFavorite(story);
          btn.classList.add('favorited');
          btn.textContent = '❤️';
        }
      });
    });
  },

  async renderMap(storiesData) {
    const mapContainer = document.getElementById("mapPreview");
    if (!mapContainer) return;

    if (window.homeMap) {
      window.homeMap.remove();
    }

    window.homeMap = L.map("mapPreview").setView([-1.4748, 124.8421], 5);

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(window.homeMap);

    const mapTiler = L.tileLayer(
      `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.VITE_MAPTILER_KEY}`,
      {
        attribution: "© MapTiler © OpenStreetMap contributors",
        maxZoom: 19,
      }
    );

    L.control.layers({ OpenStreetMap: osm, "MapTiler Streets": mapTiler }, {}).addTo(window.homeMap);

    storiesData.forEach((story) => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon])
          .addTo(window.homeMap)
          .bindPopup(`<b>${story.name}</b><br>${story.description}`);
      }
    });
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

  async getFavorites() {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['favorites'], 'readonly');
        const store = transaction.objectStore('favorites');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      return [];
    }
  },

  async addFavorite(story) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        const request = store.add(story);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Add favorite error:', error);
    }
  },

  async removeFavorite(storyId) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
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
};

export default HomePage;