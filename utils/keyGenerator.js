const forge = require('node-forge');

/**
 * Генерирует пару RSA ключей (открытый и закрытый)
 * @returns {Object} Объект с publicKey и privateKey в формате PEM
 */
function generateKeyPair() {
  const keypair = forge.pki.rsa.generateKeyPair(2048);
  
  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
  
  return {
    publicKey: publicKeyPem,
    privateKey: privateKeyPem
  };
}

/**
 * Экспортирует публичный ключ в формате, подходящем для Финика
 * @param {String} publicKeyPem - Публичный ключ в формате PEM
 * @returns {String} Публичный ключ в нужном формате
 */
function formatPublicKey(publicKeyPem) {
  // Убираем заголовки и переносы строк для компактного формата
  return publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\r\n/g, '')
    .replace(/\n/g, '')
    .trim();
}

module.exports = {
  generateKeyPair,
  formatPublicKey
};

