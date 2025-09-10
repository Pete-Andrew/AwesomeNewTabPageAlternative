// Clock
function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent =
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
setInterval(updateClock, 1000);
updateClock();

// Padlock 
let padlock = document.getElementById("padlock")
padlock.src = "img/locked_padlock_white.png"

let padlockLocked = true;



padlock.addEventListener("click", function () {
        
    if (padlockLocked == true) {
        padlock.src = "img/unlocked_padlock_white.png";
        padlockLocked = false;
        console.log("Padlock unlocked!");
    } else {
        padlockLocked = true;
        padlock.src = "img/locked_padlock_white.png";
        console.log("Padlock locked!");
    }
});

// Example clickable tiles
document.querySelectorAll(".tile").forEach(tile => {
    tile.addEventListener("click", () => {
        const text = tile.textContent.trim().toLowerCase();
        if (text === "google") window.open("https://google.com", "_blank");
        if (text === "youtube") window.open("https://youtube.com", "_blank");
        if (text === "reddit") window.open("https://reddit.com", "_blank");
    });
});

const grid = document.getElementById("grid");

new Sortable(grid, {
    animation: 150,
    store: {
        set: function (sortable) {
            const order = sortable.toArray();
            localStorage.setItem("tileOrder", JSON.stringify(order));
        },
        get: function () {
            const order = localStorage.getItem("tileOrder");
            return order ? JSON.parse(order) : [];
        }
    }
});

// Restore order on load
window.addEventListener("DOMContentLoaded", () => {
    const order = JSON.parse(localStorage.getItem("tileOrder") || "[]");
    order.forEach(id => {
        const el = document.querySelector(`[data-id='${id}']`);
        if (el) grid.appendChild(el);
    });
});


