import { test, expect } from 'playwright-test-coverage';
import { Page, Route } from '@playwright/test';
import { User, Role } from '../src/service/pizzaService';

test('list users', async ({ page }) => {
  const adminUser: User = {
    id: '1',
    name: 'Admin User',
    email: 'admin@jwt.com',
    roles: [{ role: Role.Admin }],
  };

  const mockUsers = [
    { id: '2', name: 'Alice Johnson', email: 'alice@jwt.com', roles: [{ role: Role.Diner }] },
    { id: '3', name: 'Bob Smith', email: 'bob@jwt.com', roles: [{ role: Role.Diner }] },
  ];

  await page.route('*/**/api/auth', async (route: Route) => {
    await route.fulfill({ json: { user: adminUser, token: 'admin-token' } });
  });

  await page.route('*/**/api/user/me', async (route: Route) => {
    await route.fulfill({ json: adminUser });
  });

  await page.route('*/**/api/franchise?*', async (route: Route) => {
    await route.fulfill({ json: { franchises: [], more: false } });
  });

  await page.route('*/**/api/user?*', async (route: Route) => {
    await route.fulfill({ json: { users: mockUsers, more: false } });
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('admin@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();

  await expect(page.getByRole('main')).toContainText('Alice Johnson');
  await expect(page.getByRole('main')).toContainText('alice@jwt.com');
});
