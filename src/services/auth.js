const dbClient = require("../db");
const NotificationService = require("./notification");
const SessionService = require("./session");
const EncryptionService = require("./encrypt");
class AuthService {
    async login(phone, otp, password) {
        const encrptionService = new EncryptionService();
        try {
            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const doc = await db.collection("users").findOne({ _id: phone });
            if (!doc || password !== encrptionService.decrypt(doc.password)) {
                throw new Error("Phone number and password did not match");
            }

            const notificationService = new NotificationService();
            return await notificationService.sendOtp(phone, otp);
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }

    async verify(otp, token) {
        try {
            const sessionService = new SessionService();
            const session = await sessionService.get({ otp, token });
            await sessionService.deleteOTP(otp, token);
            return session;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = AuthService;
