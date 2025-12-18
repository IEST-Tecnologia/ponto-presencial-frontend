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
