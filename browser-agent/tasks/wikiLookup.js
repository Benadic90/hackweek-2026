const puppeteer = require('puppeteer');

/**
 * Wikipedia Lookup Task
 * Navigates to Wikipedia, searches for the user's topic,
 * clicks into the article, and extracts the summary paragraph
 * and the table of contents. This demonstrates multi-step
 * autonomous navigation across multiple pages.
 */
async function wikiLookup(topic, logCallback) {
  logCallback('Launching headless Chrome browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    logCallback(`Searching Wikipedia for: "${topic}"...`);
    const searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 });

    // Check if we landed directly on an article or on search results
    const currentUrl = page.url();
    logCallback(`Landed on: ${currentUrl}`);

    // If we're on search results, click the first result
    if (currentUrl.includes('search')) {
      logCallback('On search results page — clicking first result...');
      const firstResult = await page.$('.mw-search-result-heading a');
      if (firstResult) {
        await firstResult.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      }
    }

    logCallback('Extracting article content...');

    // Extract the article data from the page
    const articleData = await page.evaluate(() => {
      // Get the article title
      const title = document.querySelector('#firstHeading')?.innerText || 'Unknown';

      // Get the first few paragraphs of the article
      const paragraphs = [];
      const contentDiv = document.querySelector('#mw-content-text .mw-parser-output');
      if (contentDiv) {
        const pElements = contentDiv.querySelectorAll(':scope > p');
        pElements.forEach((p, i) => {
          const text = p.innerText.trim();
          // Skip empty paragraphs and only grab first 3
          if (text.length > 20 && paragraphs.length < 3) {
            paragraphs.push(text);
          }
        });
      }

      // Get the table of contents headings
      const tocItems = [];
      document.querySelectorAll('.mw-heading h2, .mw-heading h3').forEach(heading => {
        const text = heading.innerText.replace(/\[edit\]/g, '').trim();
        if (text && text !== 'Contents') {
          tocItems.push(text);
        }
      });

      return {
        title: title,
        url: window.location.href,
        summary: paragraphs.join('\n\n'),
        sections: tocItems.slice(0, 12) // limit to 12 sections
      };
    });

    // Take a screenshot of the article
    const filename = `screenshots/wiki_${Date.now()}.png`;
    logCallback('Capturing screenshot of the article...');
    await page.screenshot({ path: filename, fullPage: false });

    logCallback(`Done! Successfully extracted article: "${articleData.title}"`);

    return {
      type: 'wiki',
      topic: topic,
      screenshot: '/' + filename,
      article: articleData
    };

  } finally {
    await browser.close();
  }
}

module.exports = wikiLookup;
