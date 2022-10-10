const dbClient = require("../db");
const ObjectId = require("mongodb").ObjectId;

class MessageService {
    async save(message) {
        try {
            for (let key in message) {
                if (key !== "_id" && !message[key]) {
                    throw new Error(`invalid ${key} property`);
                }
            }

            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const messagesCollection = db.collection("messages");
            let messageFromDB;
            if (message._id) {
                const id = message._id;
                delete message._id;
                const filter = { _id: ObjectId(id) };
                const updateDoc = {
                    $set: { ...message },
                };
                await messagesCollection.updateOne(filter, updateDoc);
                messageFromDB = await this.get({ _id: ObjectId(id) });
            } else {
                const result = await messagesCollection.insertOne(message);
                messageFromDB = await this.get({
                    _id: ObjectId(result.insertedId),
                });
            }

            if (!messageFromDB?._id) {
                throw new Error("Updated message not found");
            }

            return messageFromDB;
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
            const messagesCollection = db.collection("messages");
            const message = await messagesCollection.findOne(query);
            return message;
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
            const messagesCollection = db.collection("messages");
            const cursor = await messagesCollection.find(query);
            let messages = [];
            await cursor.forEach((message) => messages.push(message));
            return messages;
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
            const messagesCollection = db.collection("messages");
            const message = await messagesCollection.deleteOne(query);
            return message;
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }
}

module.exports = MessageService;
