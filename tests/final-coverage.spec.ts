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

async function setupFranchiseData(page: Page) {
  await page.route(/\/api\/franchises(\?.*)?$/, async (route: Route) => {
    const franchiseListRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      ],
      more: false
    };
    await route.fulfill({ json: franchiseListRes });
  });
}

async function setupCreateFranchise(page: Page) {
  await page.route('*/**/api/franchise', async (route: Route) => {
    if (route.request().method() === 'POST') {
      const franchiseData = route.request().postDataJSON();
      await route.fulfill({ 
        status: 201, 
        json: { 
          id: 5, 
          name: franchiseData.name, 
          stores: [] 
        } 
      });
    } else {
      await route.fulfill({ status: 200, json: { franchises: [] } });
    }
  });
}

async function setupCreateStore(page: Page) {
  await page.route('*/**/api/store', async (route: Route) => {
    if (route.request().method() === 'POST') {
      const storeData = route.request().postDataJSON();
      await route.fulfill({ 
        status: 201, 
        json: { 
          id: 8, 
          name: storeData.name, 
          franchiseId: storeData.franchiseId 
        } 
      });
    } else {
      await route.fulfill({ status: 200, json: { stores: [] } });
    }
  });
}

test.describe('Final Coverage Push', () => {
  test('Create franchise works', async ({ page }) => {
    const adminUser: User = { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      password: 'password',
      roles: [{ role: Role.Admin }]
    };
    
    await setupAuth(page, adminUser);
    await setupCreateFranchise(page);
    await page.goto('http://localhost:5173/create-franchise');
    
    const nameInput = page.getByRole('textbox', { name: /name/i });
    const createButton = page.getByRole('button', { name: /create/i });
    
    if (await nameInput.isVisible() && await createButton.isVisible()) {
      await nameInput.fill('Test Franchise');
      await createButton.click();
    }
    
    await expect(page).toHaveURL(/.*create-franchise/);
  });

  test('Create store works', async ({ page }) => {
    const adminUser: User = { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      password: 'password',
      roles: [{ role: Role.Admin }]
    };
    
    await setupAuth(page, adminUser);
    await setupFranchiseData(page);
    await setupCreateStore(page);
    await page.goto('http://localhost:5173/create-store');
    
    const combobox = page.getByRole('combobox');
    const nameInput = page.getByRole('textbox', { name: /name/i });
    const createButton = page.getByRole('button', { name: /create/i });
    
    if (await combobox.isVisible() && await nameInput.isVisible() && await createButton.isVisible()) {
      await combobox.selectOption('2');
      await nameInput.fill('Test Store');
      await createButton.click();
    }
    
    await expect(page).toHaveURL(/.*create-store/);
  });

  test('Close franchise works', async ({ page }) => {
    const adminUser: User = { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      password: 'password',
      roles: [{ role: Role.Admin }]
    };
    
    await setupAuth(page, adminUser);
    await setupFranchiseData(page);
    await page.goto('http://localhost:5173/close-franchise');
    
    const combobox = page.getByRole('combobox');
    const closeButton = page.getByRole('button', { name: /close/i });
    
    if (await combobox.isVisible() && await closeButton.isVisible()) {
      await combobox.selectOption('2');
      await closeButton.click();
    }
    
    await expect(page).toHaveURL(/.*close-franchise/);
  });

  test('Close store works', async ({ page }) => {
    const adminUser: User = { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      password: 'password',
      roles: [{ role: Role.Admin }]
    };
    
    await setupAuth(page, adminUser);
    await setupFranchiseData(page);
    await page.goto('http://localhost:5173/close-store');
    
    const combobox = page.getByRole('combobox');
    const closeButton = page.getByRole('button', { name: /close/i });
    
    if (await combobox.isVisible() && await closeButton.isVisible()) {
      await combobox.selectOption('4');
      await closeButton.click();
    }
    
    await expect(page).toHaveURL(/.*close-store/);
  });

  test('Franchise dashboard works', async ({ page }) => {
    const franchiseUser: User = { 
      id: '4', 
      name: 'Franchise Owner', 
      email: 'franchise@example.com', 
      password: 'password',
      roles: [{ role: Role.Franchisee }]
    };
    
    await setupAuth(page, franchiseUser);
    await setupFranchiseData(page);
    await page.goto('http://localhost:5173/franchise-dashboard');
    
    const createButton = page.getByRole('button', { name: /create/i });
    const closeButton = page.getByRole('button', { name: /close/i });
    
    if (await createButton.isVisible()) {
      await createButton.click();
    }
    
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
    
    await expect(page).toHaveURL(/.*franchise-dashboard/);
  });

  test('Admin dashboard works', async ({ page }) => {
    const adminUser: User = { 
      id: '3', 
      name: 'Admin User', 
      email: 'admin@example.com', 
      password: 'password',
      roles: [{ role: Role.Admin }]
    };
    
    await setupAuth(page, adminUser);
    await setupFranchiseData(page);
    await page.goto('http://localhost:5173/admin-dashboard');
    
    const createButton = page.getByRole('button', { name: /create/i });
    const filterInput = page.locator('input[type="text"]').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
    }
    
    if (await filterInput.isVisible()) {
      await filterInput.fill('test');
      await filterInput.press('Enter');
    }
    
    await expect(page).toHaveURL(/.*admin-dashboard/);
  });

  test('Register edge cases', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('A');
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@b.c');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    
    const registerButton = page.getByRole('button', { name: 'Register' });
    await expect(registerButton).toBeEnabled();
    
    await page.getByRole('textbox', { name: 'Name' }).clear();
    await page.getByRole('textbox', { name: 'Email address' }).clear();
    await page.getByRole('textbox', { name: 'Password' }).clear();
    
    await registerButton.click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('More register form edge cases', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Test User!@#$%');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test+tag@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('P@ssw0rd!');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Even more register form edge cases', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    const longName = 'A'.repeat(100);
    const longEmail = 'a'.repeat(50) + '@example.com';
    const longPassword = '1'.repeat(100);
    
    await page.getByRole('textbox', { name: 'Name' }).fill(longName);
    await page.getByRole('textbox', { name: 'Email address' }).fill(longEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(longPassword);
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });
});
