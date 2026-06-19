import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const filePath = 'file:///C:/Users/nicog/OneDrive/Desktop/FreeBuff/css-library-pro.html';
await page.goto(filePath, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Screenshot 1: Full page showing all components
await page.screenshot({ path: 'screenshot-1-full.png', fullPage: true });
console.log('✅ Screenshot 1: Full page');

// Screenshot 2: Click "Buttons" category filter
await page.click('.cat-btn[data-cat="buttons"]');
await page.waitForTimeout(500);
await page.screenshot({ path: 'screenshot-2-buttons.png', fullPage: true });
console.log('✅ Screenshot 2: Buttons category');

// Screenshot 3: Open Show Code on first component
await page.click('.cat-btn[data-cat="all"]');
await page.waitForTimeout(500);
await page.click('.code-btn');
await page.waitForTimeout(500);
await page.screenshot({ path: 'screenshot-3-code-open.png', fullPage: true });
console.log('✅ Screenshot 3: Code panel open');

// Screenshot 4: Scroll to bottom for layout section
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
await page.screenshot({ path: 'screenshot-4-bottom.png', fullPage: false });
console.log('✅ Screenshot 4: Bottom section');

await browser.close();
console.log('🎉 All screenshots taken!');
