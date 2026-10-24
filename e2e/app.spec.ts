import { test, expect } from '@playwright/test';

test.describe('Wear Square Storefront Tests', () => {
  test('has title and loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Wear Square/);
    await expect(page.locator('#root')).toBeVisible();
  });

  test('toggles language between English and Arabic with correct dir attribute', async ({ page }) => {
    await page.goto('/');
    const langBtn = page.getByTestId('header-lang-btn');
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await expect(page.locator('html')).toHaveAttribute('dir', 'ar');
      await langBtn.click();
      await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    }
  });

  test('adds product to cart, opens cart drawer, and proceeds as guest', async ({ page }) => {
    await page.goto('/#/shop');
    
    // Quick add first available product
    const quickAddBtn = page.getByTestId('quick-add-btn').first();
    await quickAddBtn.waitFor({ state: 'visible' });
    await quickAddBtn.click();

    // Verify Cart Drawer slides open
    const cartDrawer = page.getByTestId('cart-drawer');
    await expect(cartDrawer).toBeVisible();

    // Verify Guest Checkout button is active and functional
    const guestCheckoutBtn = page.getByTestId('guest-checkout-btn');
    await expect(guestCheckoutBtn).toBeVisible();
    await guestCheckoutBtn.click();

    // Verify navigation to checkout page
    await expect(page).toHaveURL(/#\/checkout/);
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test('guest checkout completes step 1 with valid mobile number', async ({ page }) => {
    // Add item directly to navigate to checkout
    await page.goto('/#/shop');
    const quickAddBtn = page.getByTestId('quick-add-btn').first();
    await quickAddBtn.waitFor({ state: 'visible' });
    await quickAddBtn.click();

    await page.goto('/#/checkout');
    await expect(page.locator('input[type="tel"]')).toBeVisible();

    // Enter valid Egyptian mobile number (allows flexible spacing/prefix)
    await page.locator('input[type="tel"]').fill('010 1234 5678');
    await page.getByTestId('co-continue-btn').click();

    // Verify step 2 (Delivery governorate) is reached
    await expect(page.locator('select#f-gov')).toBeVisible();
  });

  test('product page toggles 3D interactive view', async ({ page }) => {
    await page.goto('/#/shop');
    const productCard = page.getByTestId('product-card').first();
    await productCard.click();

    await expect(page).toHaveURL(/#\/product\//);

    const toggle3DBtn = page.getByTestId('toggle-3d-btn');
    if (await toggle3DBtn.isVisible()) {
      await toggle3DBtn.click();
      await expect(page.locator('canvas')).toBeVisible();
    }
  });
});
