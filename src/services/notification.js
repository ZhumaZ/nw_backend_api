const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
client = require("twilio")(accountSid, authToken);

class NotificationService {
    async sendOtp(to, otp) {
        try {
            const data = await client.messages.create({
                body: `Your OTP code is: ${otp}`,
                from: process.env.TWILIO_NUMBER,
                to,
            });
            if (!data.sid) {
                throw new Error("Could not send OTP");
            }
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = NotificationService;
