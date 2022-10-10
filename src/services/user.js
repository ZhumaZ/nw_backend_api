const dbClient = require("../db");
const ObjectId = require("mongodb").ObjectId;
const validator = require("validator");
const EncryptionService = require("./encrypt");
class UserService {
    async save(user, type) {
        try {
            for (let key in user) {
                if (key !== "nid" && !user[key]) {
                    throw new Error(`invalid ${key} property`);
                }
                if (key === "_id") {
                    if (!validator.isMobilePhone(user[key], "bn-BD")) {
                        throw new Error("invalid phone number");
                    }
                }
            }

            if (type === "register") {
                const encrptionService = new EncryptionService();
                user.password = encrptionService.encrypt(user.password);
            }

            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const usersCollection = db.collection("users");
            const userIsPresent = await this.get({ _id: user._id });
            const id = user._id;
            if (userIsPresent) {
                if (type === "register") {
                    throw new Error("user already exists!");
                }

                delete user._id;
                const filter = { _id: id };
                const updateDoc = {
                    $set: { ...user },
                };
                await usersCollection.updateOne(filter, updateDoc);
            } else {
                if (type === "update") {
                    throw new Error("user doesn's exists");
                }
                console.log("hafaasdada", user);
                try {
                    const result = await usersCollection.insertOne(user);
                    console.log(result);
                } catch (e) {
                    console.log(e.message);
                }
            }
            const userFromDB = await this.get({ _id: id });
            if (!userFromDB) {
                throw new Error("user not found");
            }

            return userFromDB;
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
            const usersCollection = db.collection("users");
            const user = await usersCollection.findOne(query);
            return user;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = UserService;
