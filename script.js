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
// CONFIG
// -------------------------
const TOTAL_SLOTS = 70;

// -------------------------
// DEFAULT TILE DATA
// -------------------------
const defaultTiles = [
  {
    id: "google",
    title: "Google",
    url: "https://google.com",
    color: "#222222",
    icon: "https://google.com/favicon.ico",
    slot: 0
  },
  {
    id: "youtube",
    title: "YouTube",
    url: "https://youtube.com",
    color: "#222222",
    icon: "https://youtube.com/favicon.ico",
    slot: 1
  }
];

// -------------------------
// HELPERS
// -------------------------
function getFaviconFromUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

function findFirstEmptySlot() {
  const usedSlots = tilesData.map(tile => tile.slot);
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    if (!usedSlots.includes(i)) {
      return i;
    }
  }
  return tilesData.length;
}

function normaliseTiles(tiles) {
  return tiles.map((tile, index) => ({
    id: tile.id || `tile-${Date.now()}-${index}`,
    title: tile.title || "Untitled",
    url: tile.url || "",
    color: tile.color || "#222222",
    icon: tile.icon ?? getFaviconFromUrl(tile.url || ""),
    slot: typeof tile.slot === "number" ? tile.slot : index
  }));
}

function getTiles() {
  const saved = localStorage.getItem("tilesData");
  const tiles = saved ? JSON.parse(saved) : defaultTiles;
  return normaliseTiles(tiles);
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
let slotSortables = [];

padlock.src = "img/locked_padlock_white.png";

// -------------------------
// CREATE TILE ELEMENT
// -------------------------
function createTileElement(tileData) {
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.dataset.id = tileData.id;
  tile.style.backgroundColor = tileData.color;

  const icon = document.createElement("img");
  icon.className = "tile-icon";
  icon.src = tileData.icon || getFaviconFromUrl(tileData.url || "");
  icon.alt = "";
  icon.onerror = () => {
    icon.style.display = "none";
  };
  tile.appendChild(icon);

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

  return tile;
}

// -------------------------
// RENDER TILES INTO FIXED SLOTS
// -------------------------
function renderTiles() {
  grid.innerHTML = "";

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const slot = document.createElement("div");
    slot.className = "grid-slot";
    slot.dataset.slot = i;

    const tileData = tilesData.find(tile => tile.slot === i);
    if (tileData) {
      slot.appendChild(createTileElement(tileData));
    }

    grid.appendChild(slot);
  }

  initSlotSortables();
  updateLockUI();
}

// -------------------------
// SLOT SORTABLES
// -------------------------
function initSlotSortables() {
  slotSortables.forEach(instance => instance.destroy());
  slotSortables = [];

  document.querySelectorAll(".grid-slot").forEach(slotEl => {
    const sortable = new Sortable(slotEl, {
      group: "tiles",
      animation: 150,
      ghostClass: "dragging",
      sort: true,
      disabled: padlockLocked,

      onMove: function () {
        return !padlockLocked;
      },

      onAdd: function (evt) {
        const tileId = evt.item.dataset.id;
        const newSlot = Number(evt.to.dataset.slot);

        const movedTile = tilesData.find(tile => tile.id === tileId);
        if (!movedTile) return;

        // If destination slot already has a tile, move that tile to origin slot
        const existingTileInDestination = tilesData.find(
          tile => tile.slot === newSlot && tile.id !== tileId
        );

        const fromSlot = Number(evt.from.dataset.slot);

        if (existingTileInDestination) {
          existingTileInDestination.slot = fromSlot;
        }

        movedTile.slot = newSlot;
        saveTiles();
        renderTiles();
      }
    });

    slotSortables.push(sortable);
  });
}

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

  if (addTileBtn) {
    addTileBtn.classList.toggle("hidden", padlockLocked);
  }

  if (exportBtn) {
    exportBtn.classList.toggle("hidden", padlockLocked);
  }


  padlock.src = padlockLocked
    ? "img/locked_padlock_white.png"
    : "img/unlocked_padlock_white.png";

  slotSortables.forEach(sortable => {
    try {
      sortable.option("disabled", padlockLocked);
    } catch (e) {
      console.log("Sortable disable failed:", e);
    }
  });
}

padlock.addEventListener("click", function () {
  padlockLocked = !padlockLocked;
  updateLockUI();
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
  tile.icon = getFaviconFromUrl(tile.url);

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
    color: "#222222",
    icon: "",
    slot: findFirstEmptySlot()
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
    alert("Could not copy to clipboard.");
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

    tilesData = normaliseTiles(parsed);
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
    document.body.style.setProperty("--page-bg-image", `url("${settings.value}")`);
    document.body.style.setProperty("--page-bg-color", "#111");
  } else if (settings.type === "color") {
    document.body.style.setProperty("--page-bg-image", "none");
    document.body.style.setProperty("--page-bg-color", settings.value);
  }
}

// -------------------------
// BACKGROUND EDITOR FUNCTIONS
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
// BACKGROUND EVENTS
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
// Show shadow of the grid when tiles are unlocked to show where tiles can be placed, allow tiles to be placed anywhere on this grid.

