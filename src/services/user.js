const dbClient = require("../db");
const ObjectId = require("mongodb").ObjectId;
const validator = require("validator");
class UserService {
    async save(user) {
        try {
            for (let key in user) {
                if (key !== "nid" && !user[key]) {
                    throw new Error(`invalid ${key} property`);
                }

                if (key === "phone") {
                    if (!validator.isMobilePhone(user[key], "bn-BD")) {
                        throw new Error("invalid phone number");
                    }
                    const userFromDB = await this.get({ phone: user[key] });
                    console.log(
                        ObjectId(user._id).toString() ===
                            userFromDB._id.toString()
                    );
                    if (
                        userFromDB &&
                        ObjectId(user._id).toString() !==
                            userFromDB._id.toString()
                    ) {
                        throw new Error(
                            "User with this phone number already exists"
                        );
                    }
                }
            }

            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const usersCollection = db.collection("users");
            let userFromDB;
            if (user._id) {
                const id = user._id;
                delete user._id;
                const filter = { _id: ObjectId(id) };
                const updateDoc = {
                    $set: { ...user },
                };
                await usersCollection.updateOne(filter, updateDoc);
                userFromDB = await this.get({ _id: ObjectId(id) });
            } else {
                const result = await usersCollection.insertOne(user);
                userFromDB = await this.get({
                    _id: ObjectId(result.insertedId),
                });
            }

            if (!userFromDB?._id) {
                throw new Error("Updated user not found");
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
        } finally {
            await dbClient.close();
        }
    }
}

module.exports = UserService;
