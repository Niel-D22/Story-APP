import API from "../../data/api.js";

const RegisterPage = {
  async render() {
    return `
      <section class="login-container">
        <div class="login-card">
          <h1 class="login-title">Buat Akun</h1>
          <p class="login-subtitle">Isi data kamu untuk mulai menggunakan Story Map</p>

          <form id="registerForm">
            <div class="input-group">
              <label for="name">Nama Lengkap</label>
              <input type="text" id="name" placeholder="Masukkan nama kamu" required>
            </div>

            <div class="input-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="Masukkan email kamu" required>
            </div>

            <div class="input-group">
              <label for="password">Password</label>
              <input type="password" id="password" placeholder="Masukkan password" required>
            </div>

            <div class="input-group">
              <label for="confirmPassword">Konfirmasi Password</label>
              <input type="password" id="confirmPassword" placeholder="Ulangi password" required>
            </div>

            <button type="submit" class="btn-login">Daftar</button>
          </form>

          <p class="signup-text">
            Sudah punya akun? <a href="#/login">Masuk di sini</a>
          </p>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector("#registerForm");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.querySelector("#name").value.trim();
      const email = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value.trim();
      const confirmPassword = document.querySelector("#confirmPassword").value.trim();

      if (password !== confirmPassword) {
        alert("Password dan konfirmasi tidak cocok!");
        return;
      }

      try {
        const response = await API.register(name, email, password);

        if (response.error) {
          alert(`Gagal daftar: ${response.message || "Email mungkin sudah terdaftar"}`);
          return;
        }

        alert("Pendaftaran berhasil! Silakan login.");
        window.location.hash = "#/login";
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat mendaftar. Coba lagi nanti.");
      }
    });
  },
};

export default RegisterPage;
