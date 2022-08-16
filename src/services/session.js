const dbClient = require("../db");
class SessionService {
    async save(session) {
        try {
            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const sessionsCollection = db.collection("sessions");
            await sessionsCollection.insertOne(session);
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }

    async get(query) {
        try {
            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const sessionsCollection = db.collection("sessions");
            const session = await sessionsCollection.findOne(query);
            if (!session) {
                throw new Error("Invalid otp and token combination");
            }
            return session;
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }

    async deleteOTP(otp, token) {
        try {
            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const sessionsCollection = db.collection("sessions");
            const filter = { otp, token };
            const updateDoc = {
                $set: {
                    otp: "",
                },
            };
            await sessionsCollection.updateOne(filter, updateDoc);
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }
}

module.exports = SessionService;
