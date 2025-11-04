/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto Date
 * no fuso horário local (UTC-3 para Brasil), evitando problemas de UTC
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Cria a data no horário local (meio-dia para evitar problemas de fuso)
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Formata uma data para o formato ISO local (YYYY-MM-DD)
 * sem conversão de fuso horário
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ajusta uma data do banco de dados para o fuso local
 * Adiciona 3 horas (UTC-3) para compensar o armazenamento em UTC
 */
export function adjustToLocalTimezone(date: Date): Date {
  const adjusted = new Date(date);
  adjusted.setHours(adjusted.getHours() + 3);
  return adjusted;
}
