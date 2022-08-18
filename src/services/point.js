const dbClient = require("../db");
const ObjectId = require("mongodb").ObjectId;

class PointService {
    async save(point) {
        try {
            for (let key in point) {
                if (key !== "_id" && !point[key]) {
                    throw new Error(`invalid ${key} property`);
                }
            }

            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const pointsCollection = db.collection("points");
            let pointFromDB;
            if (point._id) {
                const id = point._id;
                delete point._id;
                const filter = { _id: ObjectId(id) };
                const updateDoc = {
                    $set: { ...point },
                };
                await pointsCollection.updateOne(filter, updateDoc);
                pointFromDB = await this.get({ _id: ObjectId(id) });
            } else {
                const result = await pointsCollection.insertOne(point);
                pointFromDB = await this.get({
                    _id: ObjectId(result.insertedId),
                });
            }

            if (!pointFromDB?._id) {
                throw new Error("Updated point not found");
            }

            return pointFromDB;
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
            const pointsCollection = db.collection("points");
            const point = await pointsCollection.findOne(query);
            return point;
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }
}

module.exports = PointService;
