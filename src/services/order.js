const dbClient = require("../db");
const ObjectId = require("mongodb").ObjectId;

class OrderService {
    async save(order) {
        try {
            for (let key in order) {
                if (key !== "_id" && !order[key]) {
                    throw new Error(`invalid ${key} property`);
                }
            }

            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const ordersCollection = db.collection("orders");
            let orderFromDB;
            if (order._id) {
                const id = order._id;
                delete order._id;
                const filter = { _id: ObjectId(id) };
                const updateDoc = {
                    $set: { ...order },
                };
                await ordersCollection.updateOne(filter, updateDoc);
                orderFromDB = await this.get({ _id: ObjectId(id) });
            } else {
                const result = await ordersCollection.insertOne(order);
                orderFromDB = await this.get({
                    _id: ObjectId(result.insertedId),
                });
            }

            if (!orderFromDB?._id) {
                throw new Error("Updated order not found");
            }

            return orderFromDB;
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
            const ordersCollection = db.collection("orders");
            const order = await ordersCollection.findOne(query);
            return order;
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }

    async list(query) {
        try {
            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const ordersCollection = db.collection("orders");
            const cursor = await ordersCollection.find(query);
            let orders = [];
            await cursor.forEach((order) => orders.push(order));
            return orders;
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }

    async delete(query) {
        try {
            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const ordersCollection = db.collection("orders");
            const order = await ordersCollection.deleteOne(query);
            return order;
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }
}

module.exports = OrderService;
