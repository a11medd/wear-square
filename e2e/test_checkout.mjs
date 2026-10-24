import { chromium } from '@playwright/test';
import path from 'path';

const outDir = 'C:/Users/ao837/.gemini/antigravity-ide/brain/4e75e812-6481-4a0a-9a7b-ec128b3454be';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  page.on('console', msg => console.log('PAGE CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));

  await page.goto('http://localhost:5173/#/shop', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.getByTestId('product-card').first().click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: /M — M/i }).click();
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
  await page.waitForTimeout(600);

  console.log('Clicking guest-checkout-btn...');
  await page.getByTestId('guest-checkout-btn').click();
  await page.waitForTimeout(1000);

  const info = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    heading: document.querySelector('h1')?.innerText,
    hasCartDrawer: !!document.querySelector('[data-testid="cart-drawer"]'),
    bodySnippet: document.body.innerText.slice(0, 300)
  }));
  console.log('CHECKOUT PAGE INFO:', JSON.stringify(info, null, 2));

  await page.screenshot({ path: path.join(outDir, 'desktop_checkout_verified.png'), fullPage: false });
  await browser.close();
}

main().catch(console.error);
