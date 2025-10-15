import { test, expect } from 'playwright-test-coverage';
import { Page, Route } from '@playwright/test';
import { User, Role } from '../src/service/pizzaService';

test('updateUser', async ({ page }) => {
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  let loggedInUser: User = { id: '1', name: 'pizza diner', email: email, roles: [{ role: Role.Diner }] };

  await page.route('*/**/api/auth', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const registerReq = route.request().postDataJSON();
      loggedInUser.name = registerReq.name;
      loggedInUser.email = registerReq.email;
      await route.fulfill({ json: { user: loggedInUser, token: 'test-token' } });
    } else if (method === 'PUT') {
      await route.fulfill({ json: { user: loggedInUser, token: 'test-token' } });

    } else if (method === 'DELETE') {
      await route.fulfill({ json: { message: 'Logged out' } });
    }
  });

  await page.route('*/**/api/user/me', async (route: Route) => {
    await route.fulfill({ json: loggedInUser });
  });

  await page.route('*/**/api/user/*', async (route: Route) => {
    if (route.request().method() === 'PUT') {
      const updateReq = route.request().postDataJSON();
      loggedInUser.name = updateReq.name || loggedInUser.name;
      loggedInUser.email = updateReq.email || loggedInUser.email;
      await route.fulfill({ json: { user: loggedInUser, token: 'test-token' } });
    }
  });

  await page.route('*/**/api/order', async (route: Route) => {
    await route.fulfill({ json: { dinerId: loggedInUser.id, orders: [], page: 1 } });
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');

});