const REPOSITORY = "/not-fight-club";

const links = document.querySelectorAll(".nav__link");

links.forEach((link) =>
  link.addEventListener("click", (e) => {
    e.preventDefault();
    urlRoute(e);
  })
);

const urlRoutes = {
  404: `${REPOSITORY}/assets/templates/404.html`,
  "/": `${REPOSITORY}/assets/templates/index.html`,
  "/character": `${REPOSITORY}/assets/templates/character.html`,
  "/settings": `${REPOSITORY}/assets/templates/settings.html`,
  "/battle": `${REPOSITORY}/assets/templates/battle.html`,
  "/registration": `${REPOSITORY}/assets/templates/registration.html`,
};

const urlRoute = (event) => {
  event.preventDefault();

  const path = event.target.getAttribute("href");
  window.history.pushState({}, "", `${REPOSITORY}${path}`);
  urlLocationHandler();
};

const urlLocationHandler = async () => {
  let location = window.location.pathname;

  if (location.startsWith(REPOSITORY)) {
    location = location.slice(REPOSITORY.length);
  }

  location = location || "/";

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
      window.history.pushState({}, "", `${REPOSITORY}/`);
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
  const closeModalBtn = document.getElementById("close-character-modal");
  const avatarImages = document.querySelectorAll(".avatar__img");
  const playerName = document.querySelector(".player__name");
  const totalWins = document.querySelector(".wins__total");
  const totalLosses = document.querySelector(".losses__total");

  totalWins.textContent = `Wins: ${localStorage.getItem("totalWins") || "0"}`;
  totalLosses.textContent = `Losses: ${
    localStorage.getItem("totalLosses") || "0"
  }`;
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

  const pathName = window.location.pathname.slice(REPOSITORY.length);

  getCharacterInfo(pathName);
  changeAvatarBtn.addEventListener("click", openCharacterModal);
  closeModalBtn.addEventListener("click", closeCharacterModal);
};

const mainActions = () => {
  const startFightBtn = document.getElementById("fight-btn");

  startFightBtn.addEventListener("click", (e) => {
    e.preventDefault();

    window.history.pushState({}, "", `${REPOSITORY}/battle`);
    urlLocationHandler();
  });
};

const battleActions = () => {
  const pathName = window.location.pathname.slice(REPOSITORY.length);
  const enemyInfo =
    JSON.parse(localStorage.getItem("currentEnemy")) || getEnemyInfo();
  const playerInfo = getCharacterInfo(pathName);
  const playerHealthBar = document.getElementById("player-health-bar");
  const enemyHealthBar = document.getElementById("enemy-health-bar");
  const attackBtn = document.getElementById("attack-btn");
  const playerHealthPoints = document.querySelector(".player__health-points");
  const enemyHealthPoints = document.querySelector(".enemy__health-points");
  const defensePointsListInner = document.querySelector(
    ".battle__actions-right"
  );
  const defensePointsList = defensePointsListInner.querySelectorAll("input");
  const attackPointsInner = document.querySelector(".battle__actions-left");
  const attackPointsList = attackPointsInner.querySelectorAll("input");
  const battleLowerInner = document.querySelector(".battle__inner-lower");

  battleLowerInner.innerHTML = localStorage.getItem("battleLogs") || "";

  let currentPlayerHealth =
    localStorage.getItem("currentPlayerHealth") || playerInfo.health;
  let currentEnemyHealth =
    localStorage.getItem("currentEnemyHealth") || enemyInfo.health;
  let currentPlayerHealthInPercents;
  let currentEnemyHealthInPercents;

  const initializePlayer = () => {
    playerHealthPoints.textContent = `${currentPlayerHealth}/${playerInfo.health}`;

    currentPlayerHealthInPercents =
      (currentPlayerHealth / playerInfo.health) * 100;

    playerHealthBar.style.background = `linear-gradient(to right, darkred 0%, darkred ${currentPlayerHealthInPercents}%, #c4c4c4 ${currentPlayerHealthInPercents}%, #c4c4c4 100%)`;
  };

  initializePlayer();

  const initializeEnemy = () => {
    const enemyFightingAvatarInner = document.querySelector(
      ".enemy__avatar-inner"
    );
    const currentEnemyFightingAvatar =
      enemyFightingAvatarInner.querySelector(".avatar__img");
    const enemyName = document.querySelector(".enemy__name");
    const enemyHealth = document.querySelector(".enemy__health-points");

    enemyName.textContent = enemyInfo.name;
    currentEnemyFightingAvatar.src = enemyInfo.avatarSrc;
    currentEnemyFightingAvatar.alt = enemyInfo.avatarAlt;
    enemyHealth.textContent = `${currentEnemyHealth}/${enemyInfo.health}`;

    currentEnemyHealthInPercents =
      (currentEnemyHealth / enemyInfo.health) * 100;

    enemyHealthBar.style.background = `linear-gradient(to right, darkred 0%, darkred ${currentEnemyHealthInPercents}%, #c4c4c4 ${currentEnemyHealthInPercents}%, #c4c4c4 100%)`;
  };

  initializeEnemy();

  attackBtn.addEventListener("click", () => {
    const enemyDefensePoints = getEnemyDefensePoints();
    const enemyAttackPoints = getEnemyAttackPoints();
    const defensePointsArray = Array.from(defensePointsList);
    const defensePlayerPointsIndexes = [];

    // console.log("enemyDefensePoints", enemyDefensePoints);
    // console.log("enemyAttackPoints", enemyAttackPoints);

    const getLogDamageToEnemy = (messageType, enemyBodyPart, playerDamage) => {
      let battleLog;

      if (messageType === "critical") {
        battleLog = `<div class="battle__log-inner">Player <span class="battle__log-text player">${playerInfo.name}</span> attacked enemy <span class="battle__log-text enemy">${enemyInfo.name}</span> to <span class="battle__log-text">${enemyBodyPart}</span> and was very lucky to give critical damage <span class="battle__log-text">${playerDamage}</span></div>`;
      } else if (messageType === "block") {
        battleLog = `<div class="battle__log-inner">Player <span class="battle__log-text player">${playerInfo.name}</span> attacked enemy <span class="battle__log-text enemy">${enemyInfo.name}</span> to <span class="battle__log-text">${enemyBodyPart}</span>, but <span class="battle__log-text">${enemyInfo.name}</span> was able to protect his <span class="battle__log-text">${enemyBodyPart}</span></div>`;
      } else if (messageType === "standard") {
        battleLog = `<div class="battle__log-inner">Player <span class="battle__log-text player">${playerInfo.name}</span> attacked enemy <span class="battle__log-text enemy">${enemyInfo.name}</span> to <span class="battle__log-text">${enemyBodyPart}</span> and give <span class="battle__log-text">${playerDamage}</span> damage</span></div>`;
      }

      return battleLog;
    };

    const getLogDamageToPlayer = (messageType, playerBodyPart, enemyDamage) => {
      let battleLog;

      if (messageType === "critical") {
        battleLog = `<div class="battle__log-inner">Enemy <span class="battle__log-text enemy">${enemyInfo.name}</span> attacked player <span class="battle__log-text player">${playerInfo.name}</span> to <span class="battle__log-text">${playerBodyPart}</span> and was very lucky to give critical damage <span class="battle__log-text">${enemyDamage}</span></div>`;
      } else if (messageType === "block") {
        battleLog = `<div class="battle__log-inner">Enemy <span class="battle__log-text enemy">${enemyInfo.name}</span> attacked player <span class="battle__log-text player">${playerInfo.name}</span> to <span class="battle__log-text">${playerBodyPart}</span>, but <span class="battle__log-text">${playerInfo.name}</span> was able to protect his <span class="battle__log-text">${playerBodyPart}</span></div>`;
      } else if (messageType === "standard") {
        battleLog = `<div class="battle__log-inner">Enemy <span class="battle__log-text enemy">${enemyInfo.name}</span> attacked player <span class="battle__log-text player">${playerInfo.name}</span> to <span class="battle__log-text">${playerBodyPart}</span> and give <span class="battle__log-text">${enemyDamage}</span> damage</span></div>`;
      }

      return battleLog;
    };

    defensePointsArray.forEach((point, index) => {
      if (point.checked) {
        defensePlayerPointsIndexes.push(index);
      }
    });

    enemyAttackPoints.forEach((_, index) => {
      const isCriticalDamage = calculateCriticalDamage("enemyCrit");
      const defensePlayerPointIndex = defensePlayerPointsIndexes[index];
      const currentEnemyAttackPoint =
        attackPointsList[defensePlayerPointIndex].previousElementSibling
          .textContent;

      let criticalCoefficient;
      let currentEnemyHitDamage;

      console.log(
        "Is enemy hit critical (crit number is greater than 0.7) - ",
        isCriticalDamage
      );

      if (isCriticalDamage) {
        criticalCoefficient = 1.25;
        currentEnemyHitDamage = Math.floor(
          enemyInfo.damage * criticalCoefficient
        );

        giveDamageToPlayer(criticalCoefficient);

        const battleLogElement = getLogDamageToPlayer(
          "critical",
          currentEnemyAttackPoint,
          currentEnemyHitDamage.toString()
        );

        battleLowerInner.insertAdjacentHTML("afterbegin", battleLogElement);
      } else if (
        !enemyAttackPoints.includes(attackPointsList[defensePlayerPointIndex])
      ) {
        criticalCoefficient = 1;
        currentEnemyHitDamage = Math.floor(
          enemyInfo.damage * criticalCoefficient
        );

        giveDamageToPlayer(criticalCoefficient);

        const battleLogElement = getLogDamageToPlayer(
          "standard",
          currentEnemyAttackPoint,
          currentEnemyHitDamage.toString()
        );

        battleLowerInner.insertAdjacentHTML("afterbegin", battleLogElement);
      } else {
        const battleLogElement = getLogDamageToPlayer(
          "block",
          currentEnemyAttackPoint,
          ""
        );

        battleLowerInner.insertAdjacentHTML("afterbegin", battleLogElement);
      }
    });

    attackPointsList.forEach((point) => {
      if (point.checked) {
        const currentPlayerAttackPoint =
          point.previousElementSibling.textContent;
        const attackPointsArray = Array.from(attackPointsList);
        const pointIndex = attackPointsArray.indexOf(point);
        const isCriticalDamage = calculateCriticalDamage("playerCrit");

        let criticalCoefficient;
        let currentPlayerHitDamage;

        console.log(
          "Is player hit critical (crit number is greater than 0.7) - ",
          isCriticalDamage
        );

        if (isCriticalDamage) {
          criticalCoefficient = 1.25;
          currentPlayerHitDamage = Math.floor(
            playerInfo.damage * criticalCoefficient
          );

          giveDamageToEnemy(criticalCoefficient);

          const battleLogElement = getLogDamageToEnemy(
            "critical",
            currentPlayerAttackPoint,
            currentPlayerHitDamage.toString()
          );

          battleLowerInner.insertAdjacentHTML("afterbegin", battleLogElement);
        } else if (
          !enemyDefensePoints.includes(defensePointsList[pointIndex])
        ) {
          criticalCoefficient = 1;
          currentPlayerHitDamage = Math.floor(
            playerInfo.damage * criticalCoefficient
          );

          giveDamageToEnemy(criticalCoefficient);

          const battleLogElement = getLogDamageToEnemy(
            "standard",
            currentPlayerAttackPoint,
            currentPlayerHitDamage.toString()
          );

          battleLowerInner.insertAdjacentHTML("afterbegin", battleLogElement);
        } else {
          const battleLogElement = getLogDamageToEnemy(
            "block",
            currentPlayerAttackPoint,
            ""
          );

          battleLowerInner.insertAdjacentHTML("afterbegin", battleLogElement);
        }
      }
    });

    if (currentEnemyHealth <= 0) {
      const battleModalWinnerText = document.querySelector(
        ".winner__battle-text"
      );
      const totalWins = parseInt(localStorage.getItem("totalWins") || "0") + 1;

      localStorage.setItem("totalWins", totalWins.toString());
      openBattleModal(battleModalWinnerText);
    } else if (currentPlayerHealth <= 0) {
      const battleModalLooserText = document.querySelector(
        ".looser__battle-text"
      );
      const totalLosses =
        parseInt(localStorage.getItem("totalLosses") || "0") + 1;

      localStorage.setItem("totalLosses", totalLosses.toString());

      openBattleModal(battleModalLooserText);
    }

    localStorage.setItem("battleLogs", battleLowerInner.innerHTML);
  });

  const openBattleModal = (text) => {
    const modal = document.querySelector(".modal");
    const battleModal = document.querySelector(".modal__battle");
    const closeModalBtn = document.getElementById("close-battle-modal");

    modal.classList.add("open");
    battleModal.classList.add("open");
    text.classList.add("active");

    const closeBattleModal = () => {
      modal.classList.remove("open");
      battleModal.classList.remove("open");
      text.classList.remove("active");

      closeModalBtn.removeEventListener("click", closeBattleModal);
      window.history.pushState({}, "", `${REPOSITORY}/`);
      urlLocationHandler();

      localStorage.removeItem("currentEnemy");
      localStorage.removeItem("currentEnemyHealth");
      localStorage.removeItem("currentPlayerHealth");
      localStorage.removeItem("battleLogs");
    };

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeBattleModal();
      }
    });

    closeModalBtn.addEventListener("click", closeBattleModal);
  };

  const calculateCriticalDamage = (whoseCrit) => {
    const criticalNumber = Math.random();

    if (whoseCrit === "playerCrit") {
      console.log("playerCrit", criticalNumber);
    } else if (whoseCrit === "enemyCrit") {
      console.log("enemyCrit", criticalNumber);
    }

    if (criticalNumber >= 0.7) {
      return true;
    }

    return false;
  };

  const giveDamageToPlayer = (criticalCoefficient) => {
    const currentEnemyHitDamage = Math.floor(
      enemyInfo.damage * criticalCoefficient
    );

    currentPlayerHealth -= currentEnemyHitDamage;

    currentPlayerHealthInPercents =
      (currentPlayerHealth / playerInfo.health) * 100;

    playerHealthBar.style.background = `linear-gradient(to right, darkred 0%, darkred ${currentPlayerHealthInPercents}%, #c4c4c4 ${currentPlayerHealthInPercents}%, #c4c4c4 100%)`;

    playerHealthPoints.textContent = `${currentPlayerHealth}/${playerInfo.health}`;

    // console.log("currentEnemyHitDamage", currentEnemyHitDamage);

    localStorage.setItem("currentPlayerHealth", currentPlayerHealth);
  };

  const giveDamageToEnemy = (criticalCoefficient) => {
    const currentPlayerHitDamage = Math.floor(
      playerInfo.damage * criticalCoefficient
    );

    currentEnemyHealth -= currentPlayerHitDamage;

    currentEnemyHealthInPercents =
      (currentEnemyHealth / enemyInfo.health) * 100;

    enemyHealthBar.style.background = `linear-gradient(to right, darkred 0%, darkred ${currentEnemyHealthInPercents}%, #c4c4c4 ${currentEnemyHealthInPercents}%, #c4c4c4 100%)`;

    enemyHealthPoints.textContent = `${currentEnemyHealth}/${enemyInfo.health}`;

    // console.log("currentPlayerHitDamage", currentPlayerHitDamage);

    localStorage.setItem("currentEnemyHealth", currentEnemyHealth);
  };

  const getEnemyAttackPoints = () => {
    const enemyAttackPoints = [];

    while (enemyAttackPoints.length !== 2) {
      if (enemyAttackPoints.length === 1 && enemyInfo.name !== "Sukuna") {
        break;
      }

      let generatePointIndex = Math.floor(
        Math.random() * attackPointsList.length
      );

      if (!enemyAttackPoints.includes(attackPointsList[generatePointIndex])) {
        enemyAttackPoints.push(attackPointsList[generatePointIndex]);
      }
    }

    return enemyAttackPoints;
  };

  const getEnemyDefensePoints = () => {
    const enemyDefensePoints = [];

    while (enemyDefensePoints.length !== 3) {
      if (enemyDefensePoints.length === 1 && enemyInfo.name === "Sukuna") {
        break;
      }

      if (enemyDefensePoints.length === 2 && enemyInfo.name === "Mahito") {
        break;
      }

      let generatePointIndex = Math.floor(
        Math.random() * defensePointsList.length
      );

      if (!enemyDefensePoints.includes(defensePointsList[generatePointIndex])) {
        enemyDefensePoints.push(defensePointsList[generatePointIndex]);
      }
    }

    return enemyDefensePoints;
  };

  toggleInputRadio();

  console.log(
    "Враг Mahito имеет 2 точки защиты, 1 точку атаки, 150hp здоровья и 18hp урона"
  );
  console.log(
    "Враг Toji имеет 3 точки защиты, 1 точку атаки, 170hp здоровья и 15hp урона"
  );
  console.log(
    "Враг Sukuna имеет 1 точку защиты, 2 точки атаки, 180hp здоровья и 12hp урона"
  );
  console.log(
    "Шанс критического урона у игрока и у противника равен 30% и умножает стандартный урон на 1.25 (для наглядности расчеты будут выводиться в консоль браузера после каждой атаки)"
  );
};

const getEnemyInfo = () => {
  const originPath = window.location.origin;

  const sukunaEnemy = {
    name: "Sukuna",
    health: "180",
    damage: "12",
    avatarSrc: originPath + `${REPOSITORY}/assets/img/enemies/sukuna.webp`,
    avatarAlt: "sukuna",
  };

  const tojiEnemy = {
    name: "Toji",
    health: "170",
    damage: "15",
    avatarSrc: originPath + `${REPOSITORY}/assets/img/enemies/toji.webp`,
    avatarAlt: "toji",
  };

  const mahitoEnemy = {
    name: "Mahito",
    health: "150",
    damage: "18",
    avatarSrc: originPath + `${REPOSITORY}/assets/img/enemies/mahito.webp`,
    avatarAlt: "mahito",
  };

  const enemiesArray = [sukunaEnemy, tojiEnemy, mahitoEnemy];

  const enemyIndex = Math.floor(Math.random(0, 1) * enemiesArray.length);

  const currentEnemy = enemiesArray[enemyIndex];

  localStorage.setItem("currentEnemy", JSON.stringify(currentEnemy));

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
  const attackBtn = document.getElementById("attack-btn");
  const battleActionsInner = document.querySelector(".battle__actions");

  let wasChecked = false;

  battleActionsInner.addEventListener("mousedown", (e) => {
    if (
      e.target.classList.contains("attack__option") ||
      e.target.classList.contains("defense__option")
    ) {
      wasChecked = e.target.checked;
    }
  });

  const updateAttackBtnState = () => {
    const checkedAttackCount = document.querySelectorAll(
      ".attack__option:checked"
    ).length;
    const checkedDefenseCount = document.querySelectorAll(
      ".defense__option:checked"
    ).length;

    // console.log("checkedAttackCount", checkedAttackCount);
    // console.log("checkedDefenseCount", checkedDefenseCount);

    attackBtn.disabled = !(
      checkedAttackCount === 1 && checkedDefenseCount === 2
    );
    attackBtn.style.cursor = attackBtn.disabled ? "not-allowed" : "pointer";
  };

  handleRadioClick = (e) => {
    if (e.target.tagName === "LABEL" && e.target.hasAttribute("for")) {
      e.preventDefault();

      const radio = document.getElementById(e.target.getAttribute("for"));

      if (radio) {
        radio.checked = !radio.checked;
        updateAttackBtnState();
      }

      return;
    }

    if (
      e.target.classList.contains("attack__option") ||
      e.target.classList.contains("defense__option")
    ) {
      setTimeout(() => {
        const radio = e.target;

        if (wasChecked) {
          setTimeout(() => {
            radio.checked = false;
            updateAttackBtnState();
          }, 0);
        } else {
          updateAttackBtnState();
        }
      });
    }
  };

  battleActionsInner.removeEventListener("click", handleRadioClick);
  battleActionsInner.addEventListener("click", handleRadioClick);

  updateAttackBtnState();
};

window.onpopstate = urlLocationHandler;
window.route = urlRoute;

urlLocationHandler();
