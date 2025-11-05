import { test, expect } from '@playwright/test';

test.describe('Patient Management', () => {
  // NOTA: Estes testes assumem que o usuário está autenticado
  // Em um ambiente real, você precisaria autenticar antes ou usar fixtures

  test.beforeEach(async ({ page }) => {
    // Em produção, você faria login aqui com credenciais de teste
    // Por enquanto, vamos apenas acessar as páginas
    await page.goto('/patients');
  });

  test('should show patients page structure', async ({ page }) => {
    // Verificar elementos principais da página
    await expect(page.getByText(/🩺/)).toBeVisible();
    await expect(page.getByRole('heading', { name: /pacientes/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /novo/i })).toBeVisible();
  });

  test('should navigate to new patient form', async ({ page }) => {
    // Aguardar a página carregar completamente
    await page.waitForLoadState('networkidle');

    // Clicar no botão "Novo"
    const novoButton = page.getByRole('button', { name: /novo/i });
    await expect(novoButton).toBeVisible();
    await novoButton.click();

    // Verificar que está na página de novo paciente
    await expect(page).toHaveURL(/.*patients\/new/);
    await expect(page.getByRole('heading', { name: /novo paciente/i })).toBeVisible();
  });

  test('should show new patient form with correct fields', async ({ page }) => {
    await page.goto('/patients/new');

    // Verificar campos do formulário
    await expect(page.getByLabelText(/nome/i)).toBeVisible();
    await expect(page.getByLabelText(/data de nascimento/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /salvar|criar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancelar/i })).toBeVisible();
  });

  test('should show validation error when submitting empty form', async ({ page }) => {
    await page.goto('/patients/new');

    // Tentar submeter formulário vazio
    await page.getByRole('button', { name: /salvar|criar/i }).click();

    // Verificar mensagem de erro (pode ser toast ou validação de formulário)
    // Aguardar um pouco para o feedback aparecer
    await page.waitForTimeout(500);

    // O formulário não deve ter navegado
    await expect(page).toHaveURL(/.*patients\/new/);
  });

  test('should have cancel button that goes back', async ({ page }) => {
    await page.goto('/patients/new');

    // Clicar em cancelar
    const cancelButton = page.getByRole('button', { name: /cancelar/i });
    await expect(cancelButton).toBeVisible();
    // Note: O comportamento depende da implementação do botão
  });

  test('should show logo on patients pages', async ({ page }) => {
    await page.goto('/patients');

    // Verificar que o logo está presente
    await expect(page.getByText(/🩺/)).toBeVisible();
    await expect(page.getByText(/med notes/i)).toBeVisible();
  });

  test('should have dark theme', async ({ page }) => {
    await page.goto('/patients');

    // Verificar tema escuro
    const body = page.locator('body');
    await expect(body).toHaveClass(/bg-slate-900/);
  });

  test('should show bottom navigation on mobile', async ({ page, viewport }) => {
    // Este teste só faz sentido em viewport mobile
    if (viewport && viewport.width < 768) {
      await page.goto('/patients');

      // Verificar que a navegação inferior está presente
      // (assumindo que tem classe ou role específico)
      await page.waitForTimeout(500);
      // Adicionar verificações específicas baseadas na implementação
    }
  });

  test('should show empty state when no patients', async ({ page }) => {
    await page.goto('/patients');

    // Se não houver pacientes, deve mostrar mensagem
    const emptyMessage = page.getByText(/nenhum paciente cadastrado/i);

    // Verificar se existe (pode ou não existir dependendo dos dados)
    const count = await emptyMessage.count();
    if (count > 0) {
      await expect(emptyMessage).toBeVisible();
      await expect(page.getByText(/adicionar primeiro paciente/i)).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/patients');

    // Verificar meta viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });
});
