// -------------------------
// CLOCK
// -------------------------
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
setInterval(updateClock, 1000);
updateClock();

// -------------------------
// DEFAULT TILE DATA
// -------------------------
const defaultTiles = [
  { id: "google", title: "Google", url: "https://google.com", color: "#222222" }
];

function getTiles() {
  const saved = localStorage.getItem("tilesData");
  return saved ? JSON.parse(saved) : defaultTiles;
}

function saveTiles() {
  localStorage.setItem("tilesData", JSON.stringify(tilesData));
}

// -------------------------
// DOM REFERENCES
// -------------------------

const importArea = document.getElementById("importArea");
const backgroundBtn = document.getElementById("backgroundBtn");

const backgroundEditor = document.getElementById("backgroundEditor");
const bgType = document.getElementById("bgType");
const bgImageInput = document.getElementById("bgImageInput");
const bgColorInput = document.getElementById("bgColorInput");
const saveBackgroundBtn = document.getElementById("saveBackgroundBtn");
const closeBackgroundBtn = document.getElementById("closeBackgroundBtn");

const grid = document.getElementById("grid");
const padlock = document.getElementById("padlock");
const addTileBtn = document.getElementById("addTileBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importInput = document.getElementById("importInput");

const tileEditor = document.getElementById("tileEditor");
const tileTitleInput = document.getElementById("tileTitle");
const tileUrlInput = document.getElementById("tileUrl");
const tileColorInput = document.getElementById("tileColor");
const saveTileBtn = document.getElementById("saveTileBtn");
const closeEditorBtn = document.getElementById("closeEditorBtn");

let padlockLocked = true;
let tilesData = getTiles();
let editingTileId = null;

padlock.src = "img/locked_padlock_white.png";

// -------------------------
// RENDER TILES
// -------------------------
function renderTiles() {
  grid.innerHTML = "";

  tilesData.forEach(tileData => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.id = tileData.id;
    tile.style.backgroundColor = tileData.color;

    const title = document.createElement("span");
    title.className = "tile-title";
    title.textContent = tileData.title;
    tile.appendChild(title);

    const editBtn = document.createElement("button");
    editBtn.className = "tile-edit";
    editBtn.type = "button";
    editBtn.innerHTML = "✏";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditor(tileData.id);
    });
    tile.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "tile-delete";
    deleteBtn.type = "button";
    deleteBtn.innerHTML = "✕";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTile(tileData.id);
    });
    tile.appendChild(deleteBtn);

    tile.addEventListener("click", () => {
      if (!padlockLocked) return;
      if (tileData.url) {
        window.open(tileData.url, "_blank");
      }
    });

    grid.appendChild(tile);
  });

  updateLockUI();
}


// -------------------------
// SORTABLE
// -------------------------
const sortable = new Sortable(grid, {
  animation: 150,
  ghostClass: "dragging",

  onMove: function () {
    return !padlockLocked;
  },

  onEnd: function () {
    const order = sortable.toArray();

    tilesData.sort((a, b) => {
      return order.indexOf(a.id) - order.indexOf(b.id);
    });

    saveTiles();
  }
});


// -------------------------
// LOCK / UNLOCK
// -------------------------
function updateLockUI() {
  grid.classList.toggle("locked", padlockLocked);
  grid.classList.toggle("unlocked", !padlockLocked);

  document.querySelectorAll(".tile-edit, .tile-delete").forEach(btn => {
    btn.style.display = padlockLocked ? "none" : "block";
  });

  if (importArea) {
    importArea.classList.toggle("hidden", padlockLocked);
  }

  if (importBtn) {
    importBtn.classList.toggle("hidden", padlockLocked);
  }

  if (backgroundBtn) {
    backgroundBtn.classList.toggle("hidden", padlockLocked);
  }

  padlock.src = padlockLocked
    ? "img/locked_padlock_white.png"
    : "img/unlocked_padlock_white.png";

  try {
    sortable.option("disabled", padlockLocked);
  } catch (e) {
    console.log("Sortable disable failed:", e);
  }
}

padlock.addEventListener("click", function () {
  padlockLocked = !padlockLocked;
  updateLockUI();
  console.log("Padlock clicked!", padlockLocked ? "locked" : "unlocked");
});

// -------------------------
// TILE EDITOR
// -------------------------
function openEditor(tileId) {
  const tile = tilesData.find(t => t.id === tileId);
  if (!tile) return;

  editingTileId = tileId;
  tileTitleInput.value = tile.title;
  tileUrlInput.value = tile.url;
  tileColorInput.value = tile.color;

  tileEditor.classList.add("open");
}

function closeEditor() {
  tileEditor.classList.remove("open");
  editingTileId = null;
}

saveTileBtn.addEventListener("click", () => {
  const tile = tilesData.find(t => t.id === editingTileId);
  if (!tile) return;

  tile.title = tileTitleInput.value.trim() || "Untitled";
  tile.url = tileUrlInput.value.trim();
  tile.color = tileColorInput.value;

  saveTiles();
  renderTiles();
  closeEditor();
});

closeEditorBtn.addEventListener("click", closeEditor);


// -------------------------
// DELETE TILE
// -------------------------
function deleteTile(tileId) {
  tilesData = tilesData.filter(tile => tile.id !== tileId);
  saveTiles();
  renderTiles();
}


// -------------------------
// ADD TILE
// -------------------------
addTileBtn.addEventListener("click", () => {
  const newTile = {
    id: "tile-" + Date.now(),
    title: "New Tile",
    url: "https://",
    color: "#222222"
  };

  tilesData.push(newTile);
  saveTiles();
  renderTiles();
});


// -------------------------
// EXPORT JSON
// -------------------------
exportBtn.addEventListener("click", async () => {
  const json = JSON.stringify(tilesData, null, 2);

  try {
    await navigator.clipboard.writeText(json);
    alert("JSON copied to clipboard");
  } catch (err) {
    alert("Could not copy to clipboard. You can copy it manually from localStorage or I can help add download export instead.");
  }
});


// -------------------------
// IMPORT JSON
// -------------------------
importBtn.addEventListener("click", () => {
  try {
    const parsed = JSON.parse(importInput.value);

    if (!Array.isArray(parsed)) {
      alert("Imported JSON must be an array");
      return;
    }

    const valid = parsed.every(tile =>
      typeof tile.id === "string" &&
      typeof tile.title === "string" &&
      typeof tile.url === "string" &&
      typeof tile.color === "string"
    );

    if (!valid) {
      alert("JSON format is invalid");
      return;
    }

    tilesData = parsed;
    saveTiles();
    renderTiles();
    alert("Tiles imported successfully");
  } catch (error) {
    alert("Invalid JSON");
  }
});

// -------------------------
// BACKGROUND SETTINGS HELPERS
// -------------------------

function getBackgroundSettings() {
  const saved = localStorage.getItem("backgroundSettings");
  return saved
    ? JSON.parse(saved)
    : {
      type: "image",
      value: "img/mountains.jpg"
    };
}

function saveBackgroundSettings(settings) {
  localStorage.setItem("backgroundSettings", JSON.stringify(settings));
}

function applyBackground() {
  const settings = getBackgroundSettings();

  if (settings.type === "image") {
    document.body.style.backgroundImage = `url("${settings.value}")`;
    document.body.style.backgroundColor = "";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
  } else if (settings.type === "color") {
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = settings.value;
  }
}

// -------------------------
// background editor functions
// -------------------------

function openBackgroundEditor() {
  const settings = getBackgroundSettings();

  bgType.value = settings.type;

  if (settings.type === "image") {
    bgImageInput.value = settings.value;
  } else {
    bgColorInput.value = settings.value;
  }

  backgroundEditor.classList.add("open");

  updateBackgroundFieldVisibility();
}

function closeBackgroundEditor() {
  backgroundEditor.classList.remove("open");
}

// -------------------------
// Event listeners for background editing
// -------------------------

backgroundBtn.addEventListener("click", () => {
  openBackgroundEditor();
});

saveBackgroundBtn.addEventListener("click", () => {
  let settings;

  if (bgType.value === "image") {
    settings = {
      type: "image",
      value: bgImageInput.value.trim() || "img/mountains.jpg"
    };
  } else {
    settings = {
      type: "color",
      value: bgColorInput.value
    };
  }

  saveBackgroundSettings(settings);
  applyBackground();
  closeBackgroundEditor();
});

closeBackgroundBtn.addEventListener("click", closeBackgroundEditor);


function updateBackgroundFieldVisibility() {
    const imageField = document.getElementById("bgImageInput");
    const colorField = document.getElementById("bgColorInput");

    if (bgType.value === "image") {
        imageField.style.display = "block";
        colorField.style.display = "none";
    } else {
        imageField.style.display = "none";
        colorField.style.display = "block";
    }
}

bgType.addEventListener("change", updateBackgroundFieldVisibility);

// -------------------------
// INITIAL LOAD
// -------------------------
window.addEventListener("DOMContentLoaded", () => {
  applyBackground();
  renderTiles();
});

// To Do:
// create an edit and delete icon for each tile, these will only be visible in the unlocked state.
// When page is in an 'Unlocked state
// When the edit icon is clicked on, open a pop out window where it is possible to do the following:
// Make it possible to change the colour of individual tiles with a colour picker and store this info in local storage
// Make it possible to amend tiles e.g. change their colour, title, and website they are directed too.


// Show shadow of the grid when tiles are unlocked to show where tiles can be placed, allow tiles to be placed anywhere on this grid.
// Store all website links info in local storage?
// make all the settings of this code be exportable as a JSON, e.g. website name, address, square colour, location on grid
// ensure this can run locally on a browser so vecrel does not exceed traffic limits? 

