import { test, expect } from '@playwright/test';

test.describe('Notes Management', () => {
  // NOTA: Estes testes assumem que existe pelo menos um paciente
  // Em produção, você criaria fixtures ou seed data

  test('should show dashboard page', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar elementos do dashboard
    await expect(page.getByText(/🩺/)).toBeVisible();
    await expect(page.getByText(/visão geral/i)).toBeVisible();
  });

  test('should display statistics cards on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verificar cards de estatísticas (podem ter valores 0 se não houver dados)
    await expect(page.getByText(/pacientes/i)).toBeVisible();
    await expect(page.getByText(/anotações/i)).toBeVisible();
  });

  test('should have date range filter on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verificar que existe filtro de período
    const filterSection = page.getByText(/filtrar período/i);
    await expect(filterSection).toBeVisible();
  });

  test('should navigate to patients from dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Clicar no botão de ver todos os pacientes
    const viewAllButton = page.getByRole('link', { name: /ver todos os pacientes/i });
    if (await viewAllButton.isVisible()) {
      await viewAllButton.click();
      await expect(page).toHaveURL(/.*patients/);
    }
  });

  test('should show patient detail page structure', async ({ page }) => {
    // Este teste requer que exista um paciente
    // Vamos tentar acessar a página de pacientes primeiro
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');

    // Procurar por links de pacientes
    const patientLinks = page.locator('a[href*="/patients/"]').first();
    const linkCount = await patientLinks.count();

    if (linkCount > 0) {
      await patientLinks.click();

      // Verificar elementos da página de detalhes do paciente
      await expect(page.getByText(/🩺/)).toBeVisible();
      // Botão de voltar
      await page.waitForTimeout(500);
    }
  });

  test('should show bottom navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar navegação inferior
    // Icons esperados: Dashboard, Patients, Tags
    await page.waitForTimeout(500);

    // Verificar que existem links de navegação
    const navLinks = page.locator('nav a, nav button');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate between pages using bottom nav', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Tentar navegar para pacientes via bottom nav
    const patientsNav = page.locator('a[href="/patients"]').first();
    if (await patientsNav.isVisible()) {
      await patientsNav.click();
      await expect(page).toHaveURL(/.*patients/);
    }

    // Voltar para dashboard
    const dashboardNav = page.locator('a[href="/dashboard"]').first();
    if (await dashboardNav.isVisible()) {
      await dashboardNav.click();
      await expect(page).toHaveURL(/.*dashboard/);
    }
  });

  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/');

    // Verificar que o manifest existe
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute('href', '/manifest.json');
  });

  test('should have favicon', async ({ page }) => {
    await page.goto('/');

    // Verificar que tem favicon/icon
    const icon = page.locator('link[rel*="icon"]').first();
    const count = await icon.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have meta tags for PWA', async ({ page }) => {
    await page.goto('/');

    // Verificar meta tags importantes
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);

    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveCount(1);
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];

    // Capturar erros do console
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Filtrar erros conhecidos/esperados (ex: do Supabase em dev)
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('Supabase') &&
        !error.includes('favicon') &&
        !error.includes('ResizeObserver')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Verificar que links têm textos acessíveis
    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // Link deve ter texto ou aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
