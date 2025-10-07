import { test, expect } from 'playwright-test-coverage';
import { Page, Route } from '@playwright/test';

async function setupDeliveryAPI(page: Page) {
  await page.route('*/**/api/order/verify', async (route: Route) => {
    const response = {
      message: 'valid',
      payload: {
        orderId: '12345',
        customer: 'John Doe',
        total: 25.50,
        timestamp: '2024-01-15T10:30:00Z'
      }
    };
    await route.fulfill({ json: response });
  });
}

test.describe('Delivery Component Simple Tests', () => {
  test('should display delivery page with basic content', async ({ page }) => {
    await page.goto('http://localhost:5173/delivery');

    await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
    
    await expect(page.getByRole('button', { name: 'Verify' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Order more' })).toBeVisible();
  });

  test('Verify button works', async ({ page }) => {
    await setupDeliveryAPI(page);
    await page.goto('http://localhost:5173/delivery');

    await page.getByRole('button', { name: 'Verify' }).click();
    
    await expect(page.locator('#hs-jwt-modal')).toBeVisible();
  });

  test('Order more button works', async ({ page }) => {
    await page.goto('http://localhost:5173/delivery');

    await page.getByRole('button', { name: 'Order more' }).click();
    
    await expect(page).toHaveURL(/.*menu/);
  });

  test('Shows order information', async ({ page }) => {
    await page.goto('http://localhost:5173/delivery');
    await page.evaluate(() => {
      window.history.replaceState({
        order: {
          id: '12345',
          items: [
            { name: 'Veggie Pizza', price: 12.50, quantity: 1 }
          ],
          pizzas: []
        },
        jwt: 'test-jwt-token'
      }, '', '/delivery');
    });

    await expect(page.getByText('order ID:')).toBeVisible();
    await expect(page.getByText('pie count:')).toBeVisible();
    await expect(page.getByText('total:')).toBeVisible();
  });

  test('Empty order works', async ({ page }) => {
    await page.goto('http://localhost:5173/delivery');
    await page.evaluate(() => {
      window.history.replaceState({
        order: { pizzas: [] },
        jwt: 'test-jwt-token'
      }, '', '/delivery');
    });

    await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
    
    await expect(page.getByText('pie count:')).toBeVisible();
    await expect(page.getByText('total:')).toBeVisible();
  });
});
