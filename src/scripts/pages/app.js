import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;

    this.#drawerButton.addEventListener("click", () => {
      const isOpen = this.#navigationDrawer.classList.toggle("open");
      this.#drawerButton.setAttribute("aria-expanded", isOpen);
    });

    
    this.#drawerButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const isOpen = this.#navigationDrawer.classList.toggle("open");
        this.#drawerButton.setAttribute("aria-expanded", isOpen);
      }
    });

   
    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
        this.#drawerButton.setAttribute("aria-expanded", "false");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
          this.#drawerButton.setAttribute("aria-expanded", "false");
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.#navigationDrawer.classList.contains("open")) {
        this.#navigationDrawer.classList.remove("open");
        this.#drawerButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];
    const isLoggedIn = localStorage.getItem("isLoggedIn");


    if (!isLoggedIn && !["/login", "/register"].includes(url)) {
      window.location.hash = "/login";
      return;
    }

    if (isLoggedIn && ["/login", "/register"].includes(url)) {
      window.location.hash = "/home";
      return;
    }

 
    const renderContent = async () => {
      this.#content.innerHTML = await page.render();
      if (page.afterRender) await page.afterRender();
      this.#updateNavbar();
    };


    if (document.startViewTransition) {
      await document.startViewTransition(renderContent);
    } else {
      await renderContent();
    }
  }

  #updateNavbar() {
    const navList = this.#navigationDrawer?.querySelector("#nav-list");
    if (!navList) return;

    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (user) {
      navList.innerHTML = `
        <li><a href="#/home">Home</a></li>
        <li><a href="#/addstory">Add Story</a></li>
        <li><a href="#" id="logout-link">Logout</a></li>
      `;

      const logoutLink = navList.querySelector("#logout-link");
      logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
        window.location.hash = "/login";
      });
    } else {
      navList.innerHTML = `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Register</a></li>
      `;
    }
  }
}

export default App;