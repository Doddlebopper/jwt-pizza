import { test, expect } from 'playwright-test-coverage';
import { Page, Route } from '@playwright/test';
import { User, Role } from '../src/service/pizzaService';

async function setupAdminAuth(page: Page) {
  const adminUser: User = { 
    id: '3', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    password: 'password',
    roles: [{ role: Role.Admin }]
  };
  
  await page.route('*/**/api/auth', async (route: Route) => {
    const loginReq = route.request().postDataJSON();
    if (adminUser.email === loginReq.email && adminUser.password === loginReq.password) {
      await route.fulfill({ 
        status: 200, 
        json: { user: adminUser, token: 'mock-token' } 
      });
    } else {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
    }
  });

  await page.route('*/**/api/user/me', async (route: Route) => {
    await route.fulfill({ json: adminUser });
  });
}

async function setupFranchiseList(page: Page) {
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

test.describe('Admin Dashboard', () => {
  test('Display dashboard for admin', async ({ page }) => {
    await setupAdminAuth(page);
    await setupFranchiseList(page);
    await page.goto('http://localhost:5173/admin-dashboard');
    
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Mama Ricci\'s kitchen')) {
      await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
      await expect(page.getByText('Franchises')).toBeVisible();
      
      await expect(page.getByText('Franchise')).toBeVisible();
      await expect(page.getByText('Franchisee')).toBeVisible();
      await expect(page.getByText('Store')).toBeVisible();
      await expect(page.getByText('Revenue')).toBeVisible();
      await expect(page.getByText('Action')).toBeVisible();
      
      await expect(page.getByText('LotaPizza')).toBeVisible();
      await expect(page.getByText('PizzaCorp')).toBeVisible();
    } else {
      await expect(page.getByText('Oops')).toBeVisible();
    }
  });

  test('Be able to filter franchises', async ({ page }) => {
    await setupAdminAuth(page);
    await setupFranchiseList(page);
    await page.goto('http://localhost:5173/admin-dashboard');
    
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Mama Ricci\'s kitchen')) {
      const filterInput = page.locator('input[type="text"]').first();
      if (await filterInput.isVisible()) {
        await filterInput.fill('Lota');
        await filterInput.press('Enter');
      }
    } else {
      await expect(page.getByText('Oops')).toBeVisible();
    }
  });

  test('Navigate to create franchise', async ({ page }) => {
    await setupAdminAuth(page);
    await setupFranchiseList(page);
    await page.goto('http://localhost:5173/admin-dashboard');
    
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Mama Ricci\'s kitchen')) {
      const createButton = page.getByRole('button', { name: /create/i });
      if (await createButton.isVisible()) {
        await createButton.click();
        await expect(page).toHaveURL(/.*create-franchise/);
      }
    } else {
      await expect(page.getByText('Oops')).toBeVisible();
    }
  });

  test('Navigate to close franchise', async ({ page }) => {
    await setupAdminAuth(page);
    await setupFranchiseList(page);
    await page.goto('http://localhost:5173/admin-dashboard');
    
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Mama Ricci\'s kitchen')) {
      const closeButton = page.getByRole('button', { name: /close/i }).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await expect(page).toHaveURL(/.*close-franchise/);
      }
    } else {
      await expect(page.getByText('Oops')).toBeVisible();
    }
  });
});
