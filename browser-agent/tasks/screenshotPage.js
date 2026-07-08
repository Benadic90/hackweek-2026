const puppeteer = require('puppeteer');

/**
 * Screenshot Task
 * Navigates to any user-provided URL and captures a full-page screenshot.
 * This demonstrates the agent's ability to autonomously visit and capture
 * any webpage on the internet.
 */
async function screenshotPage(url, logCallback) {
  logCallback('Launching headless Chrome browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set a standard desktop viewport
    await page.setViewport({ width: 1280, height: 800 });

    logCallback(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait a bit for any lazy-loaded content to appear
    logCallback('Waiting for page to fully render...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get some info about the page while we're here
    const pageTitle = await page.title();
    logCallback(`Page loaded: "${pageTitle}"`);

    // Take the full-page screenshot
    const filename = `screenshots/page_${Date.now()}.png`;
    logCallback('Capturing full-page screenshot...');
    await page.screenshot({ path: filename, fullPage: true });

    logCallback('Done! Screenshot captured successfully.');

    return {
      type: 'screenshot',
      url: url,
      pageTitle: pageTitle,
      screenshot: '/' + filename
    };

  } finally {
    await browser.close();
  }
}

module.exports = screenshotPage;
