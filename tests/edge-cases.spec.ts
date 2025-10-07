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

test.describe('Edge Cases for Coverage', () => {
  test('Register form with empty strings', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('');
    await page.getByRole('textbox', { name: 'Email address' }).fill('');
    await page.getByRole('textbox', { name: 'Password' }).fill('');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with whitespaces', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('   ');
    await page.getByRole('textbox', { name: 'Email address' }).fill('   ');
    await page.getByRole('textbox', { name: 'Password' }).fill('   ');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with newlines', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Test\nUser');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with tabs', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Test\tUser');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with unicode characters', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('Tëst Üser');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with numbers only', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('123456');
    await page.getByRole('textbox', { name: 'Email address' }).fill('123@456.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with symbols', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('!@#$%');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('!@#$%');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with mixed inputs', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('TeSt UsEr');
    await page.getByRole('textbox', { name: 'Email address' }).fill('TeSt@ExAmPlE.CoM');
    await page.getByRole('textbox', { name: 'Password' }).fill('PaSsWoRd123');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with leading/trailing spaces', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('  Test User  ');
    await page.getByRole('textbox', { name: 'Email address' }).fill('  test@example.com  ');
    await page.getByRole('textbox', { name: 'Password' }).fill('  password123  ');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with HTML tags', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('<script>alert("test")</script>');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with SQL injection attempt', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill("'; DROP TABLE users; --");
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with XSS attempt', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.getByRole('textbox', { name: 'Name' }).fill('<img src=x onerror=alert(1)>');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });

  test('Register form with very long email', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
    await page.getByRole('textbox', { name: 'Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email address' }).fill(longEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*register/);
  });
});
