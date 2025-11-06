import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Tentar acessar a página de pacientes sem estar autenticado
    await page.goto('/patients');

    // Deve redirecionar para login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show login page with correct elements', async ({ page }) => {
    await page.goto('/login');

    // Verificar que os elementos da página de login estão presentes
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();

    // Verificar link para registro
    await expect(page.getByText(/criar conta/i)).toBeVisible();
  });

  test('should show register page with correct elements', async ({ page }) => {
    await page.goto('/register');

    // Verificar que os elementos da página de registro estão presentes
    await expect(page.getByRole('heading', { name: /criar conta/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /criar conta/i })).toBeVisible();

    // Verificar link para login
    await expect(page.getByText(/já tem uma conta/i)).toBeVisible();
  });

  test('should show validation error for password mismatch', async ({ page }) => {
    await page.goto('/register');

    // Preencher formulário com senhas diferentes
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('input[type="password"]').last().fill('password456');

    // Submeter formulário
    await page.getByRole('button', { name: /criar conta/i }).click();

    // Verificar mensagem de erro (pode aparecer em toast ou no form)
    await expect(page.getByText(/senhas não coincidem/i).first()).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/register');

    // Preencher formulário com senha curta
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.locator('input[type="password"]').first().fill('123');
    await page.locator('input[type="password"]').last().fill('123');

    // Submeter formulário
    await page.getByRole('button', { name: /criar conta/i }).click();

    // Verificar mensagem de erro (pode aparecer em toast ou no form)
    await expect(page.getByText(/senha deve ter pelo menos 6 caracteres/i).first()).toBeVisible();
  });

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login');

    // Clicar em "Criar conta"
    await page.getByText(/criar conta/i).click();

    // Verificar que está na página de registro
    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByRole('heading', { name: /criar conta/i })).toBeVisible();

    // Voltar para login
    await page.getByText(/já tem uma conta/i).click();

    // Verificar que voltou para login
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
  });

  test('should show logo on auth pages', async ({ page }) => {
    await page.goto('/login');

    // Verificar que o logo está presente
    await expect(page.getByText(/🩺/)).toBeVisible();
    await expect(page.getByText(/med notes/i)).toBeVisible();
  });

  test('should have dark theme on auth pages', async ({ page }) => {
    await page.goto('/login');

    // Verificar que o body tem a classe de tema escuro
    const body = page.locator('body');
    await expect(body).toHaveClass(/bg-slate-900/);
  });
});
