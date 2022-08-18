const dbClient = require("../db");
const ObjectId = require("mongodb").ObjectId;

class DressService {
    async save(dress) {
        try {
            for (let key in dress) {
                if (key !== "_id" && !dress[key]) {
                    throw new Error(`invalid ${key} property`);
                }
            }

            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const dressesCollection = db.collection("dresses");
            let dressFromDB;
            if (dress._id) {
                const id = dress._id;
                delete dress._id;
                const filter = { _id: ObjectId(id) };
                const updateDoc = {
                    $set: { ...dress },
                };
                await dressesCollection.updateOne(filter, updateDoc);
                dressFromDB = await this.get({ _id: ObjectId(id) });
            } else {
                const result = await dressesCollection.insertOne(dress);
                dressFromDB = await this.get({
                    _id: ObjectId(result.insertedId),
                });
            }

            if (!dressFromDB?._id) {
                throw new Error("Updated dress not found");
            }

            return dressFromDB;
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
            const pointsCollection = db.collection("dresses");
            const point = await pointsCollection.findOne(query);
            return point;
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }
}

module.exports = DressService;
