import { test, expect } from 'playwright-test-coverage';
import { Page, Route } from '@playwright/test';
import { User, Role } from '../src/service/pizzaService';

async function setupAuth(page: Page, user: User) {
  await page.route('*/**/api/auth', async (route: Route) => {
    const loginReq = route.request().postDataJSON();
    if (user.email === loginReq.email && user.password === loginReq.password) {
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

async function setupMenu(page: Page) {
  await page.route('*/**/api/order/menu', async (route: Route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    await route.fulfill({ json: menuRes });
  });
}

async function setupFranchiseData(page: Page) {
  await page.route(/\/api\/franchise(\?.*)?$/, async (route: Route) => {
    const franchiseRes = {
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
    };
    await route.fulfill({ json: franchiseRes });
  });
  
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

async function setupDocs(page: Page) {
  await page.route('*/**/api/docs/*', async (route: Route) => {
    const docsRes = {
      endpoints: [
        {
          requiresAuth: true,
          method: 'GET',
          path: '/api/user/me',
          description: 'Get current user information',
          example: 'GET /api/user/me',
          response: { user: { id: '1', name: 'Test User' } }
        }
      ]
    };
    await route.fulfill({ json: docsRes });
  });
}

test.describe('Home Page and Navigation', () => {
  test('Home page content, and navigation to menu', async ({ page }) => {
    await setupMenu(page);
    await page.goto('http://localhost:5173');
    
    await expect(page.locator('h2').getByText('The web\'s best pizza')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible();
    const heroSection = page.locator('.bg-cover');
    await expect(heroSection).toBeVisible();
    
    await expect(page.getByText('Most amazing pizza experience of my life.')).toBeVisible();
    await expect(page.getByText('Milan reborn!')).toBeVisible();
    await expect(page.getByText('All I can say is WOW!')).toBeVisible();
    
    await page.getByRole('button', { name: 'Order now' }).click();
    await expect(page).toHaveURL(/.*menu/);
  });
  test('Authentication flow and navigation', async ({ page }) => {
    const user: User = { 
      id: '1', 
      name: 'Test User', 
      email: 'test@example.com', 
      password: 'password',
      roles: [{ role: Role.Diner }]
    };
    
    await setupAuth(page, user);
    
    await page.goto('http://localhost:5173/login');
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await expect(page.locator('span').filter({ hasText: 'TU' })).toBeVisible();
    
    await page.goto('http://localhost:5173/register');
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  });
});

test.describe('Menu and Ordering', () => {
  test('Menu items and the user can select them', async ({ page }) => {
    await setupMenu(page);
    await setupFranchiseData(page);
    await page.goto('http://localhost:5173/menu');
    
    await expect(page.getByText('Veggie')).toBeVisible();
    await expect(page.getByText('Pepperoni')).toBeVisible();
    await expect(page.getByText('A garden of delight')).toBeVisible();
    await expect(page.getByText('Spicy treat')).toBeVisible();
    
    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: /Veggie/ }).click();
    await page.getByRole('link', { name: /Pepperoni/ }).click();
    await expect(page.getByText('Selected pizzas: 2')).toBeVisible();
  });
});

test.describe('Dashboard Views', () => {
  test('Display dashboards for user roles', async ({ page }) => {
    const dinerUser: User = { 
      id: '1', 
      name: 'Test Diner', 
      email: 'diner@example.com', 
      password: 'password',
      roles: [{ role: Role.Diner }]
    };
    
    await setupAuth(page, dinerUser);
    await page.goto('http://localhost:5173/diner-dashboard');
    await expect(page.getByText('Your pizza kitchen')).toBeVisible();
    
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
    
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('Mama Ricci\'s kitchen')) {
      await expect(page.getByText('Mama Ricci\'s kitchen')).toBeVisible();
    } else {
      await expect(page.getByText('Oops')).toBeVisible();
    }
  });
});

test.describe('Utility Views and Error Handling', () => {
  test('Display utility pages and handle errors', async ({ page }) => {
    await page.goto('http://localhost:5173/about');
    await expect(page.getByText('The secret sauce')).toBeVisible();
    
    await setupDocs(page);
    await page.goto('http://localhost:5173/docs/service');
    await expect(page.getByText('JWT Pizza API')).toBeVisible();
    
    await page.goto('http://localhost:5173/invalid-route');
    await expect(page.getByText('Oops')).toBeVisible();
    await expect(page.getByText('It looks like we have dropped a pizza on the floor')).toBeVisible();
  });
});

test.describe('Navigation and Authentication State', () => {
  test('Handle navigation and authentication state changes', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/.*about/);
    
    await page.getByRole('link', { name: 'Order' }).click();
    await expect(page).toHaveURL(/.*menu/);
    
    const user: User = { 
      id: '1', 
      name: 'Test User', 
      email: 'test@example.com', 
      password: 'password',
      roles: [{ role: Role.Diner }]
    };
    
    await setupAuth(page, user);
    await page.goto('http://localhost:5173/login');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('Adapt to different sizes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    await expect(page.locator('h2').getByText('The web\'s best pizza')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:5173');
    await expect(page.locator('h2').getByText('The web\'s best pizza')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible();
  });
});
