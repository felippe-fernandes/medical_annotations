/**
 * Converte uma string de data (YYYY-MM-DD) para um objeto Date
 * no fuso horário local (UTC-3 para Brasil), evitando problemas de UTC
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Converte um objeto Date ou string para um objeto Date local
 * Suporta múltiplos formatos de entrada
 */
export function parseDateToLocal(date: Date | string): Date {
  if (date instanceof Date && !isNaN(date.getTime())) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(year, month, day);
  }

  const dateStr = date.toString();

  if (dateStr.includes('-') && dateStr.includes('T')) {
    const [datePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  } else if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(date);
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
