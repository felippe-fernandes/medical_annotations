import { Page } from '@playwright/test';

/**
 * Helper para fazer login durante os testes
 * NOTA: Este helper é apenas para demonstração.
 * Em produção, você precisaria de credenciais de teste válidas
 * ou mockar o Supabase auth no ambiente de teste.
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/senha/i).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();

  // Aguardar redirecionamento ou feedback
  await page.waitForURL(/.*patients/, { timeout: 10000 }).catch(() => {
    // Se não redirecionar, pode ser erro de login
  });
}

/**
 * Helper para fazer logout
 */
export async function logout(page: Page) {
  // Implementar quando houver botão de logout
  // Por enquanto, limpar cookies/storage
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/patients');
    await page.waitForURL(/.*patients/, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
