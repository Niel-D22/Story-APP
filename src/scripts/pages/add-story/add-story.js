import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../data/api.js";
import CONFIG from "../../config.js";

const AddStory = {
  async render() {
    return `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <section class="add-story-container" id="main-content">
        <h1>Tambah Story</h1>

        <!-- Online/Offline Status Indicator -->
        <div id="connectionStatus" class="connection-status">
          <span class="status-icon">🌐</span>
          <span class="status-text">Memeriksa koneksi...</span>
        </div>

        <form id="addStoryForm" class="add-story-form" aria-label="Form tambah story">

          <div class="input-group">
            <label for="storyDescription">Deskripsi</label>
            <textarea id="storyDescription" placeholder="Tulis cerita kamu" rows="4" required></textarea>
          </div>

          <div class="input-group">
            <label>Ambil Foto dari Kamera</label>
            <button type="button" id="openCameraBtn">📷 Buka Kamera</button>
          </div>

          <div id="cameraContainer" style="display:none; position:relative; margin-bottom:0.5rem;">
            <video id="cameraVideo" autoplay playsinline style="width:100%; border-radius:8px;"></video>
            <button type="button" id="captureBtn" style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); padding:0.5rem 1rem;">📸 Ambil Foto</button>
            <button type="button" id="closeCameraBtn" style="position:absolute; top:10px; right:10px; padding:0.3rem 0.5rem;">&times;</button>
          </div>

          <div id="photoPreviewContainer" style="display:none; position:relative; margin-bottom:0.5rem;">
            <img id="photoPreview" style="width:100%; max-height:300px; border-radius:8px;" />
            <button type="button" id="deletePhotoBtn" style="position:absolute; top:10px; right:10px;">🗑️</button>
          </div>

          <div class="input-group">
            <label for="storyFile">Upload Foto dari File</label>
            <input type="file" id="storyFile" accept="image/*">
          </div>

          <div class="input-group">
            <label>Pilih Lokasi di Peta</label>
            <div id="mapSelectLocation" class="map-select" aria-label="Peta untuk memilih lokasi"></div>
          </div>

          <div class="input-group">
            <label for="storyLat">Latitude</label>
            <input type="number" step="any" id="storyLat" placeholder="Klik di peta untuk mengisi" required>
          </div>

          <div class="input-group">
            <label for="storyLon">Longitude</label>
            <input type="number" step="any" id="storyLon" placeholder="Klik di peta untuk mengisi" required>
          </div>

          <div class="form-buttons">
            <button type="submit" class="btn-primary">
              <span id="submitBtnText">📤 Submit Story</span>
            </button>
            <button type="button" id="cancelBtn" class="btn-secondary">Batal</button>
          </div>
        </form>

        <div id="message-container" class="message-container" role="status" aria-live="polite"></div>
      </section>

      <style>
        .skip-link { 
          position: absolute; 
          top:-40px; 
          left:0; 
          background:#000; 
          color:#fff; 
          padding:8px; 
          z-index:100; 
        }
        .skip-link:focus { top:0; }
        
        .add-story-container { 
          padding:1rem; 
          font-family:sans-serif; 
          animation:fadeIn 0.5s ease; 
          max-width: 800px;
          margin: 0 auto;
        }
        
        /* Connection Status */
        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .connection-status.online {
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
        }
        
        .connection-status.offline {
          background: linear-gradient(135deg, #ff9800, #f57c00);
          color: white;
        }
        
        .status-icon {
          font-size: 1.2rem;
        }
        
        .add-story-form .input-group { 
          margin-bottom:1rem; 
          display:flex; 
          flex-direction:column; 
        }
        
        .input-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }
        
        .input-group input,
        .input-group textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          font-family: inherit;
        }
        
        .input-group button {
          padding: 0.75rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .input-group button:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }
        
        #mapSelectLocation { 
          height:min(400px,50vh); 
          border-radius:8px; 
          margin-bottom:0.5rem; 
          border: 2px solid #ddd;
        }
        
        .form-buttons { 
          display:flex; 
          gap:0.5rem; 
          margin-top:1rem; 
        }
        
        .btn-primary, .btn-secondary { 
          flex: 1;
          padding:0.75rem 1rem; 
          border:none; 
          border-radius:6px; 
          cursor:pointer; 
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .btn-primary { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color:#fff; 
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
        }
        
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-secondary { 
          background-color:#6c757d; 
          color:#fff; 
        }
        
        .btn-secondary:hover {
          background-color:#5a6268;
        }
        
        .message-container {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 500;
          text-align: center;
          animation: slideIn 0.3s ease;
        }
        
        .message-container:empty {
          display: none;
        }
        
        @keyframes fadeIn { 
          from {opacity:0; transform:translateY(20px);} 
          to {opacity:1; transform:translateY(0);} 
        }
        
        @keyframes fadeOut { 
          from {opacity:1; transform:translateY(0);} 
          to {opacity:0; transform:translateY(-20px);} 
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Responsive */
        @media (max-width: 600px) {
          .form-buttons {
            flex-direction: column;
          }
        }
      </style>
    `;
  },

  async afterRender() {
    const form = document.getElementById("addStoryForm");
    const msgContainer = document.getElementById("message-container");
    const cancelBtn = document.getElementById("cancelBtn");
    const openCameraBtn = document.getElementById("openCameraBtn");
    const cameraContainer = document.getElementById("cameraContainer");
    const cameraVideo = document.getElementById("cameraVideo");
    const captureBtn = document.getElementById("captureBtn");
    const closeCameraBtn = document.getElementById("closeCameraBtn");
    const photoPreviewContainer = document.getElementById("photoPreviewContainer");
    const photoPreview = document.getElementById("photoPreview");
    const deletePhotoBtn = document.getElementById("deletePhotoBtn");
    const fileInput = document.getElementById("storyFile");
    const connectionStatus = document.getElementById("connectionStatus");
    const submitBtnText = document.getElementById("submitBtnText");
    
    let stream = null;
    let capturedPhoto = null;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const token = currentUser?.token;

    if (!token) {
      msgContainer.innerHTML = `⚠️ Silakan login dulu!`;
      setTimeout(() => (window.location.hash = "#/login"), 1000);
      return;
    }

    // Update connection status
    this.updateConnectionStatus(connectionStatus);
    
    // Listen to online/offline events
    window.addEventListener('online', () => this.updateConnectionStatus(connectionStatus));
    window.addEventListener('offline', () => this.updateConnectionStatus(connectionStatus));

    // Cancel button SPA
    cancelBtn.addEventListener("click", () => {
      this.navigateToHome();
    });

    // Open camera
    openCameraBtn.addEventListener("click", async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        cameraVideo.srcObject = stream;
        cameraContainer.style.display = "block";
      } catch (err) {
        console.error(err);
        msgContainer.innerHTML = "❌ Tidak bisa membuka kamera.";
        msgContainer.style.background = "#ffebee";
        msgContainer.style.color = "#c62828";
      }
    });

    // Capture photo
    captureBtn.addEventListener("click", () => {
      const canvas = document.createElement("canvas");
      canvas.width = cameraVideo.videoWidth;
      canvas.height = cameraVideo.videoHeight;
      canvas.getContext("2d").drawImage(cameraVideo, 0, 0);
      capturedPhoto = canvas.toDataURL("image/jpeg");
      photoPreview.src = capturedPhoto;
      photoPreviewContainer.style.display = "block";

      // Stop camera
      if (cameraVideo.srcObject) {
        cameraVideo.srcObject.getTracks().forEach(track => track.stop());
      }
      cameraContainer.style.display = "none";
    });

    // Close camera
    closeCameraBtn.addEventListener("click", () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      if (cameraVideo.srcObject) {
        cameraVideo.srcObject.getTracks().forEach(track => track.stop());
      }
      cameraContainer.style.display = "none";
    });

    // Delete captured photo
    deletePhotoBtn.addEventListener("click", () => {
      capturedPhoto = null;
      photoPreviewContainer.style.display = "none";
    });

    // Map setup
    const map = L.map("mapSelectLocation").setView([-1.4748, 124.8421], 5);
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
      maxZoom: 19 
    }).addTo(map);
    
    const mapTiler = L.tileLayer(
      `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.VITE_MAPTILER_KEY}`, 
      { maxZoom: 19 }
    );
    
    const satellite = L.tileLayer(
      `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${CONFIG.VITE_MAPTILER_KEY}`, 
      { maxZoom: 19 }
    );
    
    L.control.layers({ 
      "OpenStreetMap": osm, 
      "MapTiler Streets": mapTiler, 
      "Satellite": satellite 
    }).addTo(map);

    let marker = null;
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }

      document.getElementById("storyLat").value = lat.toFixed(6);
      document.getElementById("storyLon").value = lng.toFixed(6);
    });

    // Submit form with offline support
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const description = document.getElementById("storyDescription").value.trim();
      const lat = parseFloat(document.getElementById("storyLat").value);
      const lon = parseFloat(document.getElementById("storyLon").value);

      // Validation
      if (!description || !lat || !lon || (!capturedPhoto && !fileInput.files[0])) {
        msgContainer.innerHTML = "❌ Semua field wajib diisi!";
        msgContainer.style.background = "#ffebee";
        msgContainer.style.color = "#c62828";
        return;
      }

      // Disable submit button
      const submitBtn = form.querySelector('.btn-primary');
      submitBtn.disabled = true;
      submitBtnText.textContent = "⏳ Memproses...";

      try {
        // Prepare FormData
        const formData = new FormData();
        formData.append("description", description);
        formData.append("lat", lat);
        formData.append("lon", lon);

        let photoBlob;
        if (capturedPhoto) {
          photoBlob = await (await fetch(capturedPhoto)).blob();
          formData.append("photo", photoBlob, "camera.jpg");
        } else {
          const file = fileInput.files[0];
          if (file.size > 1 * 1024 * 1024) {
            msgContainer.innerHTML = "❌ Ukuran foto terlalu besar! Maksimal 1MB.";
            msgContainer.style.background = "#ffebee";
            msgContainer.style.color = "#c62828";
            submitBtn.disabled = false;
            submitBtnText.textContent = "📤 Submit Story";
            return;
          }
          photoBlob = file;
          formData.append("photo", file);
        }

        msgContainer.innerHTML = "📤 Mengirim story...";
        msgContainer.style.background = "#e3f2fd";
        msgContainer.style.color = "#1976d2";

        // Check if online
        if (!navigator.onLine) {
          // Save offline
          await this.saveOfflineStory(token, description, lat, lon, photoBlob);
          
          msgContainer.innerHTML = "💾 Offline: Story disimpan dan akan di-sync saat online";
          msgContainer.style.background = "#fff3e0";
          msgContainer.style.color = "#e65100";
          
          // Register background sync if available
          await this.registerBackgroundSync();
          
          setTimeout(() => {
            this.resetForm(form, photoPreviewContainer, marker, map);
            this.navigateToHome();
          }, 2000);
          return;
        }

        // Try to send online
        const response = await API.addStory(token, formData);
        
        if (response.error) {
          msgContainer.innerHTML = `❌ Gagal menambahkan story: ${response.message}`;
          msgContainer.style.background = "#ffebee";
          msgContainer.style.color = "#c62828";
          submitBtn.disabled = false;
          submitBtnText.textContent = "📤 Submit Story";
          return;
        }

        msgContainer.innerHTML = "✅ Story berhasil ditambahkan!";
        msgContainer.style.background = "#e8f5e9";
        msgContainer.style.color = "#2e7d32";
        
        setTimeout(() => {
          this.resetForm(form, photoPreviewContainer, marker, map);
          this.navigateToHome();
        }, 1000);

      } catch (err) {
        console.error("Submit error:", err);
        
        // If network error, save offline
        if (err.message.includes('Failed to fetch') || !navigator.onLine) {
          try {
            let photoBlob;
            if (capturedPhoto) {
              photoBlob = await (await fetch(capturedPhoto)).blob();
            } else {
              photoBlob = fileInput.files[0];
            }

            await this.saveOfflineStory(token, description, lat, lon, photoBlob);
            
            msgContainer.innerHTML = "💾 Koneksi terputus: Story disimpan dan akan di-sync saat online";
            msgContainer.style.background = "#fff3e0";
            msgContainer.style.color = "#e65100";
            
            await this.registerBackgroundSync();
            
            setTimeout(() => {
              this.resetForm(form, photoPreviewContainer, marker, map);
              this.navigateToHome();
            }, 2000);
          } catch (offlineErr) {
            console.error("Offline save error:", offlineErr);
            msgContainer.innerHTML = "❌ Gagal menyimpan story offline";
            msgContainer.style.background = "#ffebee";
            msgContainer.style.color = "#c62828";
          }
        } else {
          msgContainer.innerHTML = "❌ Terjadi kesalahan saat menambahkan story.";
          msgContainer.style.background = "#ffebee";
          msgContainer.style.color = "#c62828";
        }
        
        submitBtn.disabled = false;
        submitBtnText.textContent = "📤 Submit Story";
      }
    });
  },

  // Update connection status indicator
  updateConnectionStatus(statusElement) {
    if (navigator.onLine) {
      statusElement.className = 'connection-status online';
      statusElement.innerHTML = `
        <span class="status-icon">✅</span>
        <span class="status-text">Online - Story akan langsung tersimpan</span>
      `;
    } else {
      statusElement.className = 'connection-status offline';
      statusElement.innerHTML = `
        <span class="status-icon">⚠️</span>
        <span class="status-text">Offline - Story akan disimpan dan di-sync nanti</span>
      `;
    }
  },

  // Save story to IndexedDB when offline
  async saveOfflineStory(token, description, lat, lon, photoBlob) {
    try {
      const db = await this.openDB();
      
      // Convert blob to base64 for storage
      const photoBase64 = await this.blobToBase64(photoBlob);
      
      const offlineStory = {
        token,
        description,
        lat,
        lon,
        photoBase64,
        photoName: photoBlob.name || 'camera.jpg',
        photoType: photoBlob.type,
        timestamp: new Date().toISOString(),
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['offline-stories'], 'readwrite');
        const store = transaction.objectStore('offline-stories');
        const request = store.add(offlineStory);
        
        request.onsuccess = () => {
          console.log('[IndexedDB] Offline story saved:', request.result);
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[IndexedDB] Save offline story error:', error);
      throw error;
    }
  },

  // Register background sync
  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-stories');
        console.log('[Sync] Background sync registered');
      } catch (error) {
        console.error('[Sync] Background sync registration failed:', error);
      }
    } else {
      console.warn('[Sync] Background sync not supported');
      // Fallback: manual sync when online
      window.addEventListener('online', async () => {
        console.log('[Sync] Online detected, attempting manual sync...');
        await this.manualSync();
      }, { once: true });
    }
  },

  // Manual sync for browsers without background sync
  async manualSync() {
    try {
      const db = await this.openDB();
      const offlineStories = await this.getAllOfflineStories(db);
      
      if (offlineStories.length === 0) {
        return;
      }

      console.log(`[Sync] Syncing ${offlineStories.length} offline stories...`);
      
      for (const story of offlineStories) {
        try {
          // Convert base64 back to blob
          const photoBlob = await this.base64ToBlob(story.photoBase64, story.photoType);
          
          const formData = new FormData();
          formData.append('description', story.description);
          formData.append('lat', story.lat);
          formData.append('lon', story.lon);
          formData.append('photo', photoBlob, story.photoName);
          
          const response = await API.addStory(story.token, formData);
          
          if (!response.error) {
            // Delete from IndexedDB after successful sync
            await this.deleteOfflineStory(db, story.id);
            console.log(`[Sync] Story ${story.id} synced successfully`);
          }
        } catch (error) {
          console.error(`[Sync] Failed to sync story ${story.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[Sync] Manual sync error:', error);
    }
  },

  // Helper: Open IndexedDB
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('StoryMapDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('offline-stories')) {
          db.createObjectStore('offline-stories', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id' });
        }
      };
    });
  },

  // Helper: Get all offline stories
  getAllOfflineStories(db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offline-stories'], 'readonly');
      const store = transaction.objectStore('offline-stories');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Helper: Delete offline story
  deleteOfflineStory(db, id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['offline-stories'], 'readwrite');
      const store = transaction.objectStore('offline-stories');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Helper: Convert blob to base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  // Helper: Convert base64 to blob
  base64ToBlob(base64, type) {
    return fetch(base64).then(res => res.blob());
  },

  // Helper: Reset form
  resetForm(form, photoPreviewContainer, marker, map) {
    form.reset();
    photoPreviewContainer.style.display = "none";
    // if (marker && map) {
    //   map.removeLayer(marker);
    // }
  },

  // Helper: Navigate to home with animation
  navigateToHome() {
    const container = document.querySelector(".add-story-container");
    if (container) {
      container.style.animation = "fadeOut 0.5s ease forwards";
    }
    setTimeout(() => (window.location.hash = "#/home"), 500);
  },
};

export default AddStory;