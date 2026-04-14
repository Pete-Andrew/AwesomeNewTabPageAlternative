# 🧩 Custom New Tab Dashboard

A lightweight, fully client-side customizable new tab dashboard — built as an alternative to extensions like *Awesome New Tab Page*, with full control over layout, styling, and portability. When you've got your favorites added you can then backup the links and locations by exporting a JSON from the page. This can pasted into a notepad doc and backed up locally on your PC. The back up JSON can be re-uploaded if the page is ever lost (e.g. if local storage is cleared accidentally) 

Click on the padlock icon to edit your links, then shut it again to lock them. That's it.

---

## ✨ Features

* 🔲 **Drag & Drop Grid Layout**

  * Fixed grid system with empty slots
  * Move tiles freely without other tiles shifting
  * Group tiles visually however you like

* 🔓 **Lock / Unlock Mode**

  * Locked: tiles open links
  * Unlocked: edit, delete, and reposition tiles
  * Visual grid “ghost” appears when unlocked

* 🎨 **Customisable Tiles**

  * Set title, URL, and colour
  * Automatically fetches site favicon
  * Edit and delete tiles easily

* 🖼 **Background Customisation**

  * Use a custom image or solid colour
  * Background persists via local storage

* 💾 **Local Storage Persistence**

  * All layout and settings saved locally in your browser
  * No backend required

* 🔁 **Import / Export Layouts**

  * Export your dashboard as JSON
  * Import on another browser/device
  * Easily share layouts

 ![Tab page in locked state](/img/NewTabPageLocked.png "Tab page in locked state")

---

## 🚀 Demo
[NewTabPage](https://pete-andrew.github.io/AwesomeNewTabPageAlternative/)

---

## 📦 Installation

### Option 1 - Copy the link to the new tab page [NewTabPage](https://pete-andrew.github.io/AwesomeNewTabPageAlternative/)

1. Use the free [New Tab Redirect](https://chromewebstore.google.com/detail/new-tab-redirect/icpgjfneehieebagbmdbhnlpiopdcmna) chrome plug in (or alternative) to run the copied link each time a new tab is opened. This is the option I have gone with.

### Option 2 — Use via GitHub Pages

1. Clone or fork this repo
2. Enable GitHub Pages in repository settings
3. Open the deployed URL

### Option 3 — Run locally

```bash
git clone https://github.com/Pete-Andrew/AwesomeNewTabPageAlternative.git
cd AwesomeNewTabPageAlternative
```

Then open `index.html` in your browser.

---

## 🛠 How It Works

This project is entirely client-side:

* Built with **vanilla JavaScript, HTML, and CSS**
* Uses **localStorage** to persist:

  * tile layout
  * tile data (title, URL, colour, icon)
  * background settings
* Uses **SortableJS** for drag-and-drop functionality

No data is sent to any server.

---

## 🧠 Data Storage & Privacy

All data is stored locally in your browser using `localStorage`.

This includes:

* Tile titles and URLs
* Layout positions
* Background settings

### Important Notes

* Data is tied to your browser and this site’s URL (origin)
* Nothing is uploaded or shared externally
* Clearing browser data will reset your dashboard

---

## ⚠️ Limitations

* Some websites do not expose `/favicon.ico`, so icons may not appear
* No cloud sync (by design — local-first)
* Layout is grid-based (not freeform pixel positioning)

---

## 🧱 Tech Stack

* HTML5
* CSS3 (Grid + Flexbox)
* Vanilla JavaScript
* [SortableJS](https://github.com/SortableJS/Sortable)

---

## 📸 Screenshots

Tab page in it's unlocked state, here you can add and change tiles as well as reposition them. You can also import/export JSON in this state for a back up or to transfer info between browsers. 

 ![Tab page in unlocked state](/img/NewTabPageUnlocked.png "Tab page in unlocked state")

---

## 📄 License

MIT License — feel free to use and modify.

---

## 🙌 Acknowledgements

Inspired by:

* Awesome New Tab Page

---

## 💡 Author

Built as a personal project to explore UI design, state management, and client-side persistence.

---

## ⭐️ Support

If you like this project, consider giving it a star!
