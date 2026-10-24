import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = 'C:/Users/ao837/.gemini/antigravity-ide/brain/4e75e812-6481-4a0a-9a7b-ec128b3454be';

async function main() {
  console.log('Launching browser via msedge or chrome channel...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (e1) {
    console.log('msedge failed, trying chrome...', e1.message);
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch (e2) {
      console.log('chrome failed, trying default chromium...', e2.message);
      browser = await chromium.launch({ headless: true });
    }
  }

  console.log('Browser launched successfully!');

  // 1. Desktop Viewport (1280 x 800)
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();

  console.log('Capturing Desktop Home...');
  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_home.png') });

  console.log('Capturing Desktop Campaign Editorial Section...');
  const editorial = desktopPage.locator('#campaign-editorial');
  if (await editorial.isVisible()) {
    await editorial.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({ path: path.join(outDir, 'desktop_home_editorial.png') });
  }

  console.log('Capturing Desktop Family Categories...');
  await desktopPage.evaluate(() => {
    window.scrollBy({ top: 750, behavior: 'instant' });
  });
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_family.png') });

  console.log('Capturing Desktop Cart Drawer...');
  await desktopPage.getByTestId('header-cart-btn').click();
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_cart_drawer.png') });
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(500);

  console.log('Capturing Desktop Product Page...');
  await desktopPage.goto('http://localhost:5173/#/product/m-tee-classic', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_product_color_black.png') });

  console.log('Clicking White color swatch on Product Page...');
  const whiteSwatch = desktopPage.locator('button[title*="أبيض"], button[title*="White"]').first();
  if (await whiteSwatch.isVisible()) {
    await whiteSwatch.click();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({ path: path.join(outDir, 'desktop_product_color_white.png') });
  }

  console.log('Clicking Beige color swatch on Product Page...');
  const beigeSwatch = desktopPage.locator('button[title*="بيج"], button[title*="Beige"]').first();
  if (await beigeSwatch.isVisible()) {
    await beigeSwatch.click();
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({ path: path.join(outDir, 'desktop_product_color_beige.png') });
  }

  console.log('Capturing Desktop 3D View...');
  const toggle3D = desktopPage.getByTestId('toggle-3d-btn');
  if (await toggle3D.isVisible()) {
    await toggle3D.click();
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({ path: path.join(outDir, 'desktop_product_3d.png') });
    await toggle3D.click();
    await desktopPage.waitForTimeout(500);
  }

  console.log('Selecting size and adding product to cart on Desktop...');
  await desktopPage.getByRole('button', { name: /M — M/i }).first().click();
  await desktopPage.waitForTimeout(300);
  await desktopPage.getByRole('button', { name: 'Add to Cart', exact: true }).click();
  await desktopPage.waitForTimeout(700);
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_cart_drawer_items.png') });

  console.log('Navigating to Guest Checkout on Desktop...');
  await desktopPage.getByTestId('guest-checkout-btn').click();
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_checkout.png') });

  console.log('Capturing Desktop Cart Page...');
  await desktopPage.goto('http://localhost:5173/#/cart', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_cart_page.png') });

  console.log('Capturing Desktop Account Page...');
  await desktopPage.goto('http://localhost:5173/#/account', { waitUntil: 'networkidle' });
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_account_guest.png') });

  await desktopContext.close();

  // 2. Mobile Viewport (iPhone 14 / modern smartphone: 390 x 844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  console.log('Capturing Mobile Home...');
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_home.png') });

  console.log('Capturing Mobile Shop & Quick Add...');
  await mobilePage.goto('http://localhost:5173/#/shop', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_shop.png') });

  console.log('Capturing Mobile Product Page with Sticky CTA...');
  await mobilePage.getByTestId('product-card').first().click();
  await mobilePage.waitForTimeout(1000);
  await mobilePage.evaluate(() => window.scrollBy(0, 450));
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_product_sticky.png') });

  console.log('Selecting size and adding to cart on Mobile via sticky CTA...');
  await mobilePage.getByRole('button', { name: /M — M/i }).click();
  await mobilePage.waitForTimeout(300);
  await mobilePage.getByTestId('mobile-sticky-add-btn').click();
  await mobilePage.waitForTimeout(700);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_cart_drawer.png') });

  console.log('Capturing Mobile Checkout (Guest Flow)...');
  await mobilePage.getByTestId('guest-checkout-btn').click();
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_checkout.png') });

  console.log('Capturing Mobile Account Page (Guest Flow)...');
  await mobilePage.goto('http://localhost:5173/#/account', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_account_guest.png') });

  await mobileContext.close();
  await browser.close();

  console.log('All desktop and mobile screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
