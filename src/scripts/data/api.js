import CONFIG from "../config";

const API = {
  async register(name, email, password) {
    const res = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async addStory(token, formData) {
    const res = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return res.json();
  },

  // ===== Tambahkan method ini untuk ambil stories =====
  async getStories(token, page = 1, size = 20, location = 1) {
    const res = await fetch(
      `${CONFIG.BASE_URL}/stories?page=${page}&size=${size}&location=${location}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.json();
  },
};

export default API;
