import HomePage from "../pages/home/home-page.js";
import RegisterPage from "../pages/register/register-page.js";
import LoginPage from "../pages/Login/login.js";
import AddStory from "../pages/add-story/add-story.js";
import FavoritesPage from "../pages/favorites/favorite-pages.js";

// HANYA OBJEK ROUTES
const routes = {
  "/": LoginPage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/home": HomePage,
  "/addstory": AddStory,
  "/favorites": FavoritesPage,
};

// HANYA EKSPOR ROUTES
export default routes;