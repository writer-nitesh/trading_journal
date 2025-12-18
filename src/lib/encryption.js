import CryptoJS from "crypto-js";

const SECRET = process.env.ENCRYPTION_SECRET || "your-strong-secret";

export function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET).toString();
}

export function decrypt(cipher) {
  return CryptoJS.AES.decrypt(cipher, SECRET).toString(CryptoJS.enc.Utf8);
}
