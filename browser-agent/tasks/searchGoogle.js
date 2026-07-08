const puppeteer = require('puppeteer');

/**
 * Google Search Task
 * Navigates to Google, types the user's query, submits the form,
 * and extracts the top search results from the results page.
 */
async function searchGoogle(query, logCallback) {
  logCallback('Launching headless Chrome browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set a realistic user agent so Google doesn't block us
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    logCallback('Navigating to Google.com...');
    await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });

    // Sometimes Google shows a consent page — try to handle it
    try {
      const acceptBtn = await page.$('[id="L2AGLb"]');
      if (acceptBtn) {
        logCallback('Accepting cookie consent...');
        await acceptBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });
      }
    } catch (e) {
      // no consent page, that's fine
    }

    logCallback(`Typing search query: "${query}"...`);
    await page.type('textarea[name="q"], input[name="q"]', query, { delay: 50 });

    logCallback('Submitting search form...');
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

    logCallback('Extracting search results from the page...');

    // Extract the organic search results from the DOM
    const results = await page.evaluate(() => {
      const items = [];
      // Google wraps each result in an element with class 'g'
      const resultElements = document.querySelectorAll('.g');

      resultElements.forEach((el, index) => {
        if (index >= 5) return; // only grab the top 5

        const titleEl = el.querySelector('h3');
        const linkEl = el.querySelector('a');
        const snippetEl = el.querySelector('[data-sncf], .VwiC3b, [style*="-webkit-line-clamp"]');

        if (titleEl && linkEl) {
          items.push({
            title: titleEl.innerText,
            url: linkEl.href,
            snippet: snippetEl ? snippetEl.innerText : 'No snippet available'
          });
        }
      });

      return items;
    });

    // Take a screenshot of the results page as proof
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
