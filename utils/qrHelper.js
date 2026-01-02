/**
 * Вспомогательные функции для работы с QR кодами
 */

/**
 * Извлекает paymentId из URL Финика
 * @param {String} url - URL от Финика
 * @returns {String|null} PaymentId или null
 */
function extractPaymentIdFromUrl(url) {
  if (!url) return null;
  
  // Пытаемся найти paymentId в разных форматах
  const patterns = [
    /paymentId=([^&]+)/,
    /\/redirect\?paymentId=([^&]+)/,
    /qr\.finik\.kg\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Пытается получить правильный QR URL из redirect URL
 * @param {String} redirectUrl - URL редиректа от Финика
 * @returns {String} URL для QR кода
 */
function getQRUrlFromRedirect(redirectUrl) {
  if (!redirectUrl) return null;
  
  // Если это уже URL на qr.finik.kg, возвращаем как есть
  if (redirectUrl.includes('qr.finik.kg')) {
    return redirectUrl;
  }
  
  // Если это redirect URL, извлекаем paymentId
  const paymentId = extractPaymentIdFromUrl(redirectUrl);
  
  if (paymentId) {
    // Строим URL для QR кода
    // Формат может быть: https://qr.finik.kg/{paymentId}?type=t
    // Но это нужно уточнить у Финика
    return `https://qr.finik.kg/${paymentId}?type=t`;
  }
  
  // Если не удалось извлечь, возвращаем оригинальный URL
  return redirectUrl;
}

module.exports = {
  extractPaymentIdFromUrl,
  getQRUrlFromRedirect
};



