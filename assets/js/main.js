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

  if (location === "/index.html") {
    location = "/";
  }

  if (location !== "/registration" && !localStorage.getItem("playerName")) {
    location = "/registration";
  }

  const route = urlRoutes[location] || urlRoutes[404];
  const html = await fetch(route).then((response) => response.text());

  document.getElementById("content").innerHTML = html;

  if (location === "/registration") {
    registrationActions();
  } else if (location === "/settings") {
    settingsActions();
  }

  const playerName = document.querySelector(".player__name");
  playerName.textContent = localStorage.getItem("playerName");
};

const registrationActions = () => {
  const regBtn = document.getElementById("registration-btn");
  const regName = document.getElementById("user-name");

  regBtn.addEventListener("click", function () {
    const newPlayerName = regName.value.trim();

    if (newPlayerName) {
      localStorage.setItem("playerName", newPlayerName);
      window.history.pushState({}, "", "/");
      urlLocationHandler();
    }
  });
};

const settingsActions = () => {
  const editNameBtn = document.getElementById("edit-name-btn");
  const playerName = document.querySelector(".player__name");
  const changeNameInput = document.getElementById("edit-name-input");
  const saveNameBtn = document.getElementById("save-name-btn");

  editNameBtn.addEventListener("click", () => {
    playerName.style.display = "none";
    editNameBtn.style.display = "none";
    changeNameInput.style.display = "inline-block";
    saveNameBtn.style.display = "inline-block";

    changeNameInput.value = playerName.textContent;
  });

  changeNameInput.addEventListener("input", () => {
    const newPlayerName = changeNameInput.value.trim();

    if (!newPlayerName) {
      saveNameBtn.disabled = true;
      saveNameBtn.style.cursor = "not-allowed";
    } else {
      saveNameBtn.disabled = false;
      saveNameBtn.style.cursor = "default";
    }
  });

  saveNameBtn.addEventListener("click", () => {
    const newPlayerName = changeNameInput.value.trim();

    if (newPlayerName) {
      playerName.textContent = newPlayerName;
      localStorage.setItem("playerName", newPlayerName);
    }

    playerName.style.display = "inline-block";
    editNameBtn.style.display = "inline-block";
    changeNameInput.style.display = "none";
    saveNameBtn.style.display = "none";
  });
};

window.onpopstate = urlLocationHandler;
window.route = urlRoute;

urlLocationHandler();
