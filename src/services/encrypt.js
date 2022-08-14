const CryptoJS = require("crypto-js");

class EncryptionService {
    encrypt(text) {
        const ciphertext = CryptoJS.AES.encrypt(
            text,
            process.env.TOKEN_SECRET
        ).toString();
        return ciphertext;
    }

    decrypt(ciphertext) {
        const bytes = CryptoJS.AES.decrypt(
            ciphertext,
            process.env.TOKEN_SECRET
        );
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    }
}

module.exports = EncryptionService;
