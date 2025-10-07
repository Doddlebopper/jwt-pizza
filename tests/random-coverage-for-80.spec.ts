import { test, expect } from 'playwright-test-coverage';
import { Page, Route } from '@playwright/test';
import { User, Role } from '../src/service/pizzaService';

async function setupAuth(page: Page, user: User) {
  await page.route('*/**/api/auth', async (route: Route) => {
    const loginReq = route.request().postDataJSON();
    if (loginReq && user.email === loginReq.email && user.password === loginReq.password) {
      await route.fulfill({ 
        status: 200, 
        json: { user, token: 'mock-token' } 
      });
    } else {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
    }
  });

  await page.route('*/**/api/user/me', async (route: Route) => {
    await route.fulfill({ json: user });
  });
}

async function setupOrderHistory(page: Page) {
  await page.route(/\/api\/user\/\d+\/orders/, async (route: Route) => {
    const ordersData = {
      orders: [
        {
          id: 1,
          pizzas: [
            { name: 'Veggie', quantity: 1, price: 0.0038 },
            { name: 'Pepperoni', quantity: 1, price: 0.0042 }
          ],
          total: 0.008,
          date: '2024-01-15T10:30:00Z',
          status: 'completed'
        }
      ]
    };
    await route.fulfill({ json: ordersData });
  });
}

async function setupLogout(page: Page) {
  await page.route('*/**/api/auth/logout', async (route: Route) => {
    await route.fulfill({ status: 200, json: { message: 'Logged out successfully' } });
  });
}

test.describe('Additional Coverage Tests', () => {
  test('History page navigation', async ({ page }) => {
    const user: User = { 
      id: '1', 
      name: 'Test User', 
      email: 'test@example.com', 
      password: 'password',
      roles: [{ role: Role.Diner }]
    };
    
    await setupAuth(page, user);
    await setupOrderHistory(page);
    await page.goto('http://localhost:5173/history');
    
    await expect(page).toHaveURL(/.*history/);
  });

  test('Logout page navigation', async ({ page }) => {
    const user: User = { 
      id: '1', 
      name: 'Test User', 
      email: 'test@example.com', 
      password: 'password',
      roles: [{ role: Role.Diner }]
    };
    
    await setupAuth(page, user);
    await setupLogout(page);
    await page.goto('http://localhost:5173/logout');
    
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('Franchise dashboard navigation', async ({ page }) => {
    const franchiseUser: User = { 
      id: '4', 
      name: 'Franchise Owner', 
      email: 'franchise@example.com', 
      password: 'password',
      roles: [{ role: Role.Franchisee }]
    };
    
    await setupAuth(page, franchiseUser);
    await page.goto('http://localhost:5173/franchise-dashboard');
    
    await expect(page).toHaveURL(/.*franchise-dashboard/);
  });

  test('Create franchise navigation', async ({ page }) => {
    const adminUser: User = { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      password: 'password',
      roles: [{ role: Role.Admin }]
    };
    
    await setupAuth(page, adminUser);
    await page.goto('http://localhost:5173/create-franchise');
    
    await expect(page).toHaveURL(/.*create-franchise/);
  });

  test('Close franchise navigation', async ({ page }) => {
    const adminUser: User = { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      password: 'password',
      roles: [{ role: Role.Admin }]
    };
    
    await setupAuth(page, adminUser);
    await page.goto('http://localhost:5173/close-franchise');
    
    await expect(page).toHaveURL(/.*close-franchise/);
  });

  test('Create store navigation', async ({ page }) => {
    const adminUser: User = { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      password: 'password',
      roles: [{ role: Role.Admin }]
    };
    
    await setupAuth(page, adminUser);
    await page.goto('http://localhost:5173/create-store');
    
    await expect(page).toHaveURL(/.*create-store/);
  });

  test('Close store navigation', async ({ page }) => {
    const adminUser: User = { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      password: 'password',
      roles: [{ role: Role.Admin }]
    };
    
    await setupAuth(page, adminUser);
    await page.goto('http://localhost:5173/close-store');
    
    await expect(page).toHaveURL(/.*close-store/);
  });

  test('Register form interaction', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    
    await expect(page.getByRole('button', { name: 'Register' })).toBeEnabled();
  });

  test('Register form validation', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('button', { name: 'Register' }).click();
    
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register with invalid email', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email address' }).fill('invalid-email');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();
    
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register with short password', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123');
    await page.getByRole('button', { name: 'Register' }).click();
    
    await expect(page).toHaveURL(/.*register/);
  });
});
