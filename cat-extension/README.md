# Meowify - The Cat Extension

A Chrome extension built using Manifest V3 that replaces all images on any webpage with pictures of cats.

## How it works

The extension uses a `content_script` (`content.js`) that runs on every page load. It scans the DOM for all `<img>` tags and replaces their `src` attributes with a randomly generated cat image URL from `cataas.com`. It also uses a `MutationObserver` to watch for images that load dynamically as you scroll down (lazy loading) and instantly converts them to cats.

## How to install locally

1. Open Google Chrome.
2. Go to `chrome://extensions/`.
3. Turn on **Developer mode** (toggle switch in the top right corner).
4. Click **Load unpacked**.
5. Select the `cat-extension` folder.
6. Open any webpage and watch the cats take over!
