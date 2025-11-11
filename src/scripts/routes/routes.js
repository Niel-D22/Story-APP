import HomePage from "../pages/home/home-page.js";
import RegisterPage from "../pages/register/register-page.js";
import LoginPage from "../pages/Login/login.js";
import AddStory from "../pages/add-story/add-story.js";
import FavoritesPage from "../pages/favorites/favorite-pages.js";

const routes = {
  "/": LoginPage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/home": HomePage,
  "/addstory": AddStory,
  "/favorites": FavoritesPage,
};

const router = async () => {
  const content = document.getElementById("main-content");
  if (!content) {
    console.error("Element #main-content tidak ditemukan!");
    return;
  }

  const hash = window.location.hash.slice(1).toLowerCase() || "/";
  let page = routes[hash];

  if (!page) {
    page = LoginPage;
  }

  try {
    content.innerHTML = await page.render();
    if (page.afterRender) {
      await page.afterRender();
    }
  } catch (err) {
    console.error("Error saat merender page:", err);
    content.innerHTML = "<p>Terjadi kesalahan saat menampilkan halaman.</p>";
  }
};

window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("hashchange", router);
  router();
});

export default routes;
