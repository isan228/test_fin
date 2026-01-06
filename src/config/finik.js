/**
 * Конфигурация Finik API
 */

export const FINIK_BASE_URL =
  process.env.FINIK_ENV === 'prod' || process.env.FINIK_ENVIRONMENT === 'production'
    ? 'https://api.acquiring.averspay.kg'
    : 'https://beta.api.acquiring.averspay.kg';

export const FINIK_HOST = new URL(FINIK_BASE_URL).host;

export const FINIK_API_PATH = '/v1/payment';

