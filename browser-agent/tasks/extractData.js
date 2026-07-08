const puppeteer = require('puppeteer');

/**
 * Page Data Extractor Task
 * Navigates to a URL and performs deep DOM traversal to extract
 * structured data: headings, links, images, and metadata.
 * This demonstrates the agent's ability to parse and understand
 * complex web page structures.
 */
async function extractData(url, logCallback) {
  logCallback('Launching headless Chrome browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    logCallback(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const pageTitle = await page.title();
    logCallback(`Page loaded: "${pageTitle}". Starting DOM extraction...`);

    // Extract structured data from the entire page
    const data = await page.evaluate(() => {
      // Grab all headings (h1 through h6)
      const headings = [];
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        headings.push({
          tag: h.tagName,
          text: h.innerText.trim().substring(0, 120)
        });
      });

      // Grab all links
      const links = [];
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.href;
        const text = a.innerText.trim().substring(0, 80);
        if (href && text && !href.startsWith('javascript:')) {
          links.push({ text: text, url: href });
        }
      });

      // Grab all images with their alt text
      const images = [];
      document.querySelectorAll('img[src]').forEach(img => {
        images.push({
          src: img.src,
          alt: img.alt || '(no alt text)'
        });
      });

      // Get meta description if it exists
      const metaDesc = document.querySelector('meta[name="description"]');

      return {
        title: document.title,
        metaDescription: metaDesc ? metaDesc.getAttribute('content') : 'Not found',
        headingCount: headings.length,
        headings: headings.slice(0, 15), // limit to first 15
        linkCount: links.length,
        links: links.slice(0, 15), // limit to first 15
        imageCount: images.length,
        images: images.slice(0, 10) // limit to first 10
      };
    });

    logCallback(`Extracted ${data.headingCount} headings, ${data.linkCount} links, ${data.imageCount} images.`);

    // Take a screenshot as proof
    const filename = `screenshots/extract_${Date.now()}.png`;
    logCallback('Capturing screenshot as proof...');
    await page.screenshot({ path: filename, fullPage: false });

    logCallback('Done! Data extraction complete.');

    return {
      type: 'extract',
      url: url,
      screenshot: '/' + filename,
      data: data
    };

  } finally {
    await browser.close();
  }
}

module.exports = extractData;
