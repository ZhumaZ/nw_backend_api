const dbClient = require("../db");

class AuthService {
    async login(username, password) {
        try {
            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const cursor = db.collection("users").find({ username, password });

            let match;

            await cursor.forEach((item) => {
                match = item;
            });

            if (!match) {
                throw new Error("username and password didn't match");
            }
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = AuthService;
