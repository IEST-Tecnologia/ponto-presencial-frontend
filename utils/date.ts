/**
 * Obtém a data/hora atual no timezone de Brasília (America/Sao_Paulo)
 * Funciona corretamente independente do timezone do servidor
 */
export const getBrasiliaDate = (): Date => {
  // Cria uma data no formato de Brasília usando Intl API
  const brasiliaDateString = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
  return new Date(brasiliaDateString);
};

/**
 * Obtém a data/hora atual de Brasília em formato ISO string
 */
export const getBrasiliaISOString = (): string => {
  const brasiliaDate = getBrasiliaDate();
  return brasiliaDate.toISOString();
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Retorna a data de hoje no timezone de Brasília no formato YYYY-MM-DD
 */
export const getTodayDateString = () => {
  const brasiliaDate = getBrasiliaDate();
  brasiliaDate.setHours(0, 0, 0, 0);

  // Formata manualmente para garantir o formato correto
  const year = brasiliaDate.getFullYear();
  const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Extrai a data de uma string UTC e formata em dd/MM/yyyy sem conversão de timezone
 * Exemplo: "2025-12-10T00:00:00Z" -> "10/12/2025"
 */
export const formatUTCDateToBrasilia = (utcDateString: string): string => {
  // Extrai apenas a parte da data (YYYY-MM-DD)
  const datePart = utcDateString.split('T')[0];
  const [year, month, day] = datePart.split('-');

  return `${day}/${month}/${year}`;
};

/**
 * Converte uma string UTC para um objeto Date sem conversão de timezone
 * Exemplo: "2025-12-10T00:00:00Z" -> Date(2025, 11, 10) no timezone local
 */
export const convertUTCToBrasiliaDate = (utcDateString: string): Date => {
  // Extrai apenas a parte da data (YYYY-MM-DD)
  const datePart = utcDateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);

  // Cria a data no timezone local sem conversão, com horário do meio-dia
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

/**
 * Extrai a parte da data de uma string UTC e retorna no formato YYYY-MM-DD
 * Exemplo: "2025-12-10T00:00:00Z" -> "2025-12-10"
 */
export const extractDateFromUTC = (utcDateString: string | Date): string => {
  // Se for um objeto Date, precisa extrair cuidadosamente
  if (utcDateString instanceof Date) {
    const year = utcDateString.getFullYear();
    const month = String(utcDateString.getMonth() + 1).padStart(2, '0');
    const day = String(utcDateString.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Se for string, extrai apenas a parte da data
  return utcDateString.split('T')[0];
};
