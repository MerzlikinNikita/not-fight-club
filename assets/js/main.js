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
  } else if (location === "/character") {
    characterActions();
  } else if (location === "/") {
    mainActions();
  } else if (location === "/battle") {
    battleActions();
  }
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

  playerName.textContent = localStorage.getItem("playerName");

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

const characterActions = () => {
  const changeAvatarBtn = document.getElementById("change-avatar-btn");
  const modal = document.querySelector(".modal");
  const modalCharacter = document.querySelector(".modal__character");
  const closeModalBtn = document.getElementById("close-modal");
  const avatarImages = document.querySelectorAll(".avatar__img");
  const playerName = document.querySelector(".player__name");

  playerName.textContent = localStorage.getItem("playerName");

  const openCharacterModal = () => {
    modal.classList.add("open");
    modalCharacter.classList.add("open");
    document.body.style.overflow = "hidden";

    avatarImages.forEach((avatar) =>
      avatar.addEventListener("click", changePlayerAvatar)
    );
  };

  const closeCharacterModal = () => {
    modal.classList.remove("open");
    modalCharacter.classList.remove("open");
    document.body.style.overflow = "auto";

    avatarImages.forEach((avatar) =>
      avatar.removeEventListener("click", changePlayerAvatar)
    );
  };

  modal.addEventListener("click", (e) => {
    if (
      e.target === modal &&
      modal.classList.contains("open") &&
      modalCharacter.classList.contains("open")
    ) {
      closeCharacterModal();
    }
  });

  const changePlayerAvatar = (e) => {
    const avatarInner = document.querySelector(".avatar__inner");
    const currentAvatar = avatarInner.querySelector(".avatar__img");
    const newAvatar = e.target.cloneNode(true);

    currentAvatar.src = newAvatar.src;
    currentAvatar.alt = newAvatar.alt;

    localStorage.setItem("selectedAvatarSrc", newAvatar.src);
    localStorage.setItem("selectedAvatarAlt", newAvatar.alt);
  };

  const pathName = window.location.pathname;

  getCharacterInfo(pathName);
  changeAvatarBtn.addEventListener("click", openCharacterModal);
  closeModalBtn.addEventListener("click", closeCharacterModal);
};

const mainActions = () => {
  const startFightBtn = document.getElementById("fight-btn");

  startFightBtn.addEventListener("click", (e) => {
    e.preventDefault();

    window.history.pushState({}, "", "/battle");
    urlLocationHandler();
  });
};

const battleActions = () => {
  const pathName = window.location.pathname;
  const enemyInfo = getEnemyInfo();
  const playerInfo = getCharacterInfo(pathName);
  const playerHealthBar = document.getElementById("player-health-bar");
  const enemyHealthBar = document.getElementById("enemy-health-bar");
  const attackBtn = document.getElementById("attack-btn");
  const playerHealthPoints = document.querySelector(".player__health-points");
  const enemyHealthPoints = document.querySelector(".enemy__health-points");
  let currentPlayerHealth = playerInfo.health;
  let currentEnemyHealth = enemyInfo.health;
  let currentPlayerHealthInPercents;
  let currentEnemyHealthInPercents;

  attackBtn.addEventListener("click", () => {
    giveDamageToEnemy();
  });

  const giveDamageToEnemy = () => {
    currentEnemyHealth -= 20;

    currentEnemyHealthInPercents =
      (currentEnemyHealth / enemyInfo.health) * 100;

    enemyHealthBar.style.background = `linear-gradient(to right, darkred 0%, darkred ${currentEnemyHealthInPercents}%, #c4c4c4 ${currentEnemyHealthInPercents}%, #c4c4c4 100%)`;

    enemyHealthPoints.textContent = `${currentEnemyHealth}/${enemyInfo.health}`;
  };

  toggleInputRadio();
};

const getEnemyInfo = () => {
  const originPath = window.location.origin;
  const enemyFightingAvatarInner = document.querySelector(
    ".enemy__avatar-inner"
  );
  const currentEnemyFightingAvatar =
    enemyFightingAvatarInner.querySelector(".avatar__img");

  const sukunaEnemy = {
    name: "Sukuna",
    health: "200",
    damage: "30",
    avatarSrc: originPath + "/assets/img/enemies/sukuna.webp",
    avatarAlt: "sukuna",
  };

  const tojiEnemy = {
    name: "Toji",
    health: "170",
    damage: "25",
    avatarSrc: originPath + "/assets/img/enemies/toji.webp",
    avatarAlt: "toji",
  };

  const mahitoEnemy = {
    name: "Mahito",
    health: "150",
    damage: "20",
    avatarSrc: originPath + "/assets/img/enemies/mahito.webp",
    avatarAlt: "mahito",
  };

  const enemiesArray = [sukunaEnemy, tojiEnemy, mahitoEnemy];

  const enemyIndex = Math.floor(Math.random(0, 1) * enemiesArray.length);

  const currentEnemy = enemiesArray[enemyIndex];

  const enemyName = document.querySelector(".enemy__name");
  const enemyHealth = document.querySelector(".enemy__health-points");

  enemyName.textContent = currentEnemy.name;
  currentEnemyFightingAvatar.src = currentEnemy.avatarSrc;
  currentEnemyFightingAvatar.alt = currentEnemy.avatarAlt;
  enemyHealth.textContent = `${currentEnemy.health}/${currentEnemy.health}`;

  return currentEnemy;
};

const getCharacterInfo = (pathName) => {
  const savedAvatarSrc = localStorage.getItem("selectedAvatarSrc");
  const savedAvatarAlt = localStorage.getItem("selectedAvatarAlt");

  if (pathName === "/character") {
    const avatarInner = document.querySelector(".avatar__inner");
    const currentAvatar = avatarInner.querySelector(".avatar__img");

    if (savedAvatarSrc && currentAvatar) {
      currentAvatar.src = savedAvatarSrc;
      currentAvatar.alt = savedAvatarAlt;
    }
  } else if (pathName === "/battle") {
    const playerFightingAvatarInner = document.querySelector(
      ".player__avatar-inner"
    );
    const currentPlayerFightingAvatar =
      playerFightingAvatarInner.querySelector(".avatar__img");
    const playerFightingName = document.querySelector(".player__name");
    const savedPlayerName = localStorage.getItem("playerName");

    const currentPlayer = {
      name: savedPlayerName,
      health: "150",
      damage: "20",
    };

    if (savedAvatarSrc && savedAvatarAlt && currentPlayerFightingAvatar) {
      currentPlayerFightingAvatar.src = savedAvatarSrc;
      currentPlayerFightingAvatar.alt = savedAvatarAlt;
      currentPlayer.avatarSrc = savedAvatarSrc;
      currentPlayer.avatarAlt = savedAvatarAlt;
    }

    if (savedPlayerName && playerFightingName) {
      playerFightingName.textContent = savedPlayerName;
    }

    return currentPlayer;
  }
};

const toggleInputRadio = () => {
  const radioAttackInputs = document.querySelectorAll(".attack__option");
  const radioDefenseInputs = document.querySelectorAll(".defense__option");
  const attackBtn = document.getElementById("attack-btn");
  let checkedAttackCount = 0;
  let checkedDefenseCount = 0;

  radioAttackInputs.forEach((radio) => {
    let wasChecked = false;

    radio.addEventListener("mousedown", () => {
      wasChecked = radio.checked;
    });

    radio.addEventListener("click", () => {
      if (wasChecked) {
        radio.checked = false;
        checkedAttackCount -= 1;
      } else {
        checkedAttackCount += 1;
      }
      console.log("attack", checkedAttackCount);
      updateAttackBtnState();
    });
  });

  radioDefenseInputs.forEach((radio) => {
    let wasChecked = false;

    radio.addEventListener("mousedown", () => {
      wasChecked = radio.checked;
    });

    radio.addEventListener("click", () => {
      if (wasChecked) {
        radio.checked = false;
        checkedDefenseCount -= 1;
      } else {
        checkedDefenseCount += 1;
      }
      console.log("defense", checkedDefenseCount);
      updateAttackBtnState();
    });
  });

  const updateAttackBtnState = () => {
    if (checkedAttackCount === 1 && checkedDefenseCount === 2) {
      attackBtn.disabled = false;
      attackBtn.style.cursor = "pointer";
    } else {
      attackBtn.disabled = true;
      attackBtn.style.cursor = "not-allowed";
    }
  };

  updateAttackBtnState();
};

window.onpopstate = urlLocationHandler;
window.route = urlRoute;

urlLocationHandler();
