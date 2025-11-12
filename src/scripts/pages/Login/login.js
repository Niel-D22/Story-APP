import API from "../../data/api.js";

const Login = {
  async render() {
    return `
      <div class="login-container">
        <div class="login-card">
          <h1 class="login-title">Story Map</h1>
          <p class="login-subtitle">Masuk untuk melanjutkan</p>
          <form class="login-form" id="loginForm">
            <div class="input-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="Masukkan email" required />
            </div>

            <div class="input-group password-group" style="position: relative;">
              <label for="password">Kata Sandi</label>
              <input type="password" id="password" placeholder="Masukkan kata sandi" required />
              <i id="togglePassword"
                 class="fa-solid fa-eye"
                 style="position:absolute; right:10px; top:38px; cursor:pointer; color:#555;">
              </i>
            </div>

            <button type="submit" class="btn-login">Masuk</button>
          </form>
          <p class="signup-text">
            Belum punya akun? <a href="#/register">Daftar</a>
          </p>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const form = document.getElementById("loginForm");
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    // 👁️ Toggle password visibility
    togglePassword.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";

      // Ganti ikon sesuai state
      togglePassword.classList.toggle("fa-eye");
      togglePassword.classList.toggle("fa-eye-slash");
    });

    // 🔐 Handle login
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = passwordInput.value.trim();

      try {
        const response = await API.login(email, password);

        if (response.error) {
          alert("Email atau kata sandi salah.");
          return;
        }

        const loginResult = response.loginResult;
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ name: loginResult.name, token: loginResult.token })
        );

        window.location.hash = "#/home";
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat login. Cek koneksi internet.");
      }
    });
  },
};

export default Login;
