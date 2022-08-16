const dbClient = require("../db");
const NotificationService = require("./notification");
const SessionService = require("./session");
class AuthService {
    async login(phone, otp) {
        try {
            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const doc = await db.collection("users").findOne({ _id: phone });
            if (!doc) {
                throw new Error("Phone number not found");
            }
            console.log(doc);

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
            await sessionService.get({ otp, token });
            await sessionService.deleteOTP(otp, token);
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = AuthService;
