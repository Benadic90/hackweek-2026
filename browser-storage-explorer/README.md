# Browser Storage Explorer

A clean, modern Chrome extension that allows users to explore and manage the client-side storage of any website they visit. 

## Features
- **Comprehensive Data Extraction**: Gathers all `localStorage`, `sessionStorage`, and `cookies` tied to the active tab.
- **Detailed Insights**: Displays the Key, Value, Storage Type, and approximate Size (in Bytes/KB) for every single item.
- **Advanced Filtering & Search**: Includes a real-time search bar that filters across keys and values, plus quick-toggle checkboxes to show/hide specific storage types.
- **Beautiful UI**: Designed with a clean, organized, modern table layout using sticky headers and color-coded type badges.

## How to Install and Run
1. Clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Toggle on **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left corner.
5. Select the `browser-storage-explorer` directory from this repository.
6. The extension is now installed! Click the puzzle piece icon in Chrome and pin the "Storage Explorer" extension.
7. Navigate to any website (e.g., `github.com` or `google.com`) and click the extension icon to see all of its hidden storage data!

## Technologies Used
- HTML5, CSS3, Vanilla JavaScript
- Chrome Extensions API (`chrome.scripting`, `chrome.cookies`, `chrome.tabs`, Manifest V3)
