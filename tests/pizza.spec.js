import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  expect(await page.title()).toBe('JWT Pizza');
});

/*
test("Login", async ({ page }) => {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
});
*/