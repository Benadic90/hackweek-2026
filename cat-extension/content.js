// The Cat API gives us random cat images. We append a random query param so the browser doesn't cache the same image for every tag.
const catImageUrl = 'https://cataas.com/cat?width=500&height=500&random=';

function replaceImages() {
  const images = document.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    // Only replace if not already a cat to prevent infinite loops if we run this on a timer or mutation observer
    if (!images[i].src.includes('cataas.com')) {
      // Keep original dimensions so the page layout doesn't break
      const originalWidth = images[i].width || images[i].clientWidth;
      const originalHeight = images[i].height || images[i].clientHeight;
      
      // Random number to bust cache and get a different cat per image
      images[i].src = catImageUrl + Math.random();
      
      // Enforce the size
      if (originalWidth > 0 && originalHeight > 0) {
        images[i].style.width = originalWidth + 'px';
        images[i].style.height = originalHeight + 'px';
        images[i].style.objectFit = 'cover';
      }
    }
  }
}

// Run immediately for images already in the DOM
replaceImages();

// Set up a MutationObserver to catch any images that load lazily or dynamically
const observer = new MutationObserver((mutations) => {
  let shouldReplace = false;
  for (let mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      shouldReplace = true;
      break;
    }
  }
  if (shouldReplace) {
    replaceImages();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
