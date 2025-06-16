// encryptionUtil.js
const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const secretKey = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012"; // Must be 32 bytes
const ivLength = 16;

// 🔐 Encrypt
function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// 🔓 Decrypt
function decrypt(encryptedText) {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedData = Buffer.from(textParts[1], "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
