const links = document.querySelectorAll(".nav__link");

links.forEach((link) =>
  link.addEventListener("click", (e) => {
    e.preventDefault();
    urlRoute();
  })
);

const urlRoutes = {
  404: "/assets/templates/404.html",
  "/": "/assets/templates/index.html",
  "/character": "/assets/templates/character.html",
  "/settings": "/assets/templates/settings.html",
  "/battle": "/assets/templates/battle.html",
  "/registration": "/assets/templates/registration.html",
};

const urlRoute = (event) => {
  event = event || window.event;

  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  urlLocationHandler();
};

const urlLocationHandler = async () => {
  let location = window.location.pathname;

  // if (!location.startsWith("/")) {
  //   location = "/" + location;
  // }

  if (location !== "/registration" && !localStorage.getItem("regName")) {
    location = "/registration";
  }

  const route = urlRoutes[location] || urlRoutes[404];
  const html = await fetch(route).then((response) => response.text());

  document.getElementById("content").innerHTML = html;

  const playerNames = document.querySelectorAll(".player__name");
  playerNames.forEach(
    (name) => (name.textContent = localStorage.getItem("regName"))
  );

  if (location === "/registration") {
    registrationActions();
  }
};

const registrationActions = () => {
  const regBtn = document.getElementById("registration-btn");
  const regName = document.getElementById("user-name");

  regBtn.addEventListener("click", function () {
    if (regName.value !== "") {
      localStorage.setItem("regName", regName.value);
      window.history.pushState({}, "", "/");
      urlLocationHandler();
    }
  });
};

// const settingsActions = () => {};

window.onpopstate = urlLocationHandler;
window.route = urlRoute;

urlLocationHandler();
