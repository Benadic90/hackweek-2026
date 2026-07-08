const puppeteer = require('puppeteer');

// duckduckgo search scraper
async function searchGoogle(query, logCallback) {
  logCallback('Launching headless Chrome browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    logCallback('Navigating to Search Engine...');
    // DuckDuckGo HTML version is perfect for scraping without JS/CAPTCHA blockers
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    logCallback('Extracting search results from the page...');

    const results = await page.evaluate(() => {
      const items = [];
      const resultElements = document.querySelectorAll('.result');

      resultElements.forEach((el, index) => {
        if (index >= 5) return; 

        const titleEl = el.querySelector('.result__title a');
        const snippetEl = el.querySelector('.result__snippet');

        if (titleEl) {
          items.push({
            title: titleEl.innerText,
            url: titleEl.href,
            snippet: snippetEl ? snippetEl.innerText : 'No snippet available'
          });
        }
      });

      return items;
    });

    logCallback('Taking screenshot of results page...');
    const screenshotPath = `screenshots/search_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });

    logCallback(`Done! Found ${results.length} results.`);

    return {
      type: 'search',
      query: query,
      resultCount: results.length,
      results: results,
      screenshot: '/' + screenshotPath
    };

  } finally {
    await browser.close();
  }
}

module.exports = searchGoogle;
