/**
 * Utilitários de segurança para a aplicação
 */

/**
 * Sanitiza nome de arquivo removendo caracteres perigosos
 * Previne path traversal e caracteres inválidos em nomes de arquivo
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_') // Remove caracteres especiais, mantém acentos
    .replace(/_{2,}/g, '_') // Substitui múltiplos underscores por um
    .replace(/^_|_$/g, '') // Remove underscores no início/fim
    .substring(0, 100); // Limita tamanho
}

/**
 * Valida e sanitiza strings para prevenir XSS
 * Remove ou escapa caracteres perigosos
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers como onclick=
    .trim()
    .substring(0, 10000); // Limita tamanho
}

/**
 * Valida comprimento de tags
 */
export function validateTags(tags: string[]): { valid: boolean; error?: string } {
  if (!Array.isArray(tags)) {
    return { valid: false, error: 'Tags deve ser um array' };
  }

  if (tags.length > 20) {
    return { valid: false, error: 'Máximo de 20 tags permitido' };
  }

  const invalidTag = tags.find((tag: string) => {
    return typeof tag !== 'string' || tag.length > 30 || tag.length === 0;
  });

  if (invalidTag !== undefined) {
    return { valid: false, error: 'Cada tag deve ter entre 1 e 30 caracteres' };
  }

  return { valid: true };
}

/**
 * Valida campos de humor
 */
export function validateHumor(humor: number | null): boolean {
  if (humor === null) return true;
  return Number.isInteger(humor) && humor >= 1 && humor <= 5;
}

/**
 * Mascara informações sensíveis em logs
 */
export function maskSensitiveData(data: any): any {
  if (!data) return data;

  const sensitiveFields = ['email', 'password', 'token', 'apiKey'];
  const masked = { ...data };

  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***MASKED***';
    }
  }

  return masked;
}
