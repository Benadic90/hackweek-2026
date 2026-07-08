const puppeteer = require('puppeteer');

/**
 * Auto Form Filler Task
 * Navigates to a public test form page, automatically fills in
 * every field with realistic dummy data, and submits the form.
 * This demonstrates the agent's ability to interact with real
 * web elements like text inputs, dropdowns, textareas, and buttons.
 */
async function fillForm(logCallback) {
  logCallback('Launching headless Chrome browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // We'll use httpbin's test form — it's a real public form designed for testing
    const formUrl = 'https://httpbin.org/forms/post';
    logCallback(`Navigating to test form at ${formUrl}...`);
    await page.goto(formUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    logCallback('Form loaded. Waiting for fields to render...');
    await page.waitForSelector('input[name="custname"]', { timeout: 10000 });

    // Fill in the "Customer name" field
    logCallback('Filling in customer name: "Jane Doe"');
    await page.type('input[name="custname"]', 'Jane Doe', { delay: 30 });

    // Fill in the "Telephone" field
    logCallback('Filling in telephone: "+1-555-123-4567"');
    await page.type('input[name="custtel"]', '+1-555-123-4567', { delay: 30 });

    // Fill in the "Email" field
    logCallback('Filling in email: "jane.doe@example.com"');
    await page.type('input[name="custemail"]', 'jane.doe@example.com', { delay: 30 });

    // Select pizza size (radio button)
    logCallback('Selecting pizza size: Medium');
    await page.click('input[value="medium"]');

    // Check some topping checkboxes
    logCallback('Selecting toppings: Bacon, Cheese, Mushrooms');
    await page.click('input[name="topping"][value="bacon"]');
    await page.click('input[name="topping"][value="cheese"]');
    await page.click('input[name="topping"][value="mushroom"]');

    // Fill in delivery time
    logCallback('Setting preferred delivery time...');
    await page.type('input[name="delivery"]', '18:30', { delay: 30 });

    // Add special instructions in the textarea
    logCallback('Typing delivery instructions...');
    await page.type('textarea[name="comments"]', 'Please ring the doorbell twice. Thank you!', { delay: 20 });

    // Take a screenshot BEFORE submitting (to show filled form)
    const beforeFile = `screenshots/form_before_${Date.now()}.png`;
    logCallback('Taking screenshot of the filled form...');
    await page.screenshot({ path: beforeFile, fullPage: true });

    // Submit the form
    logCallback('Submitting form...');
    await page.click('button[type="submit"], input[type="submit"]');

    // Wait for the submission response page to load
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take a screenshot of the response page
    const afterFile = `screenshots/form_after_${Date.now()}.png`;
    logCallback('Taking screenshot of submission result...');
    await page.screenshot({ path: afterFile, fullPage: true });

    // Try to grab the response text
    const responseText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });

    logCallback('Done! Form was filled and submitted successfully.');

    return {
      type: 'form',
      formUrl: formUrl,
      filledFields: [
        { field: 'Customer Name', value: 'Jane Doe' },
        { field: 'Telephone', value: '+1-555-123-4567' },
        { field: 'Email', value: 'jane.doe@example.com' },
        { field: 'Pizza Size', value: 'Medium' },
        { field: 'Toppings', value: 'Bacon, Cheese, Mushrooms' },
        { field: 'Delivery Time', value: '18:30' },
        { field: 'Instructions', value: 'Please ring the doorbell twice. Thank you!' }
      ],
      responsePreview: responseText,
      screenshotBefore: '/' + beforeFile,
      screenshotAfter: '/' + afterFile
    };

  } finally {
    await browser.close();
  }
}

module.exports = fillForm;
