const dbClient = require("../db");
const ObjectId = require("mongodb").ObjectId;

class ReviewService {
    async save(review) {
        try {
            for (let key in review) {
                if (key !== "_id" && !review[key]) {
                    throw new Error(`invalid ${key} property`);
                }
            }

            await dbClient.connect();
            const db = dbClient.db("nearwearDB");
            const reviewsCollection = db.collection("reviews");
            let reviewFromDB;
            if (review._id) {
                const id = review._id;
                delete review._id;
                const filter = { _id: ObjectId(id) };
                const updateDoc = {
                    $set: { ...review },
                };
                await reviewsCollection.updateOne(filter, updateDoc);
                reviewFromDB = await this.get({ _id: ObjectId(id) });
            } else {
                const result = await reviewsCollection.insertOne(review);
                reviewFromDB = await this.get({
                    _id: ObjectId(result.insertedId),
                });
            }

            if (!reviewFromDB?._id) {
                throw new Error("Updated review not found");
            }

            return reviewFromDB;
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
            const reviewsCollection = db.collection("reviews");
            const review = await reviewsCollection.findOne(query);
            return review;
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
            const reviewsCollection = db.collection("reviews");
            const cursor = await reviewsCollection.find(query);
            let reviews = [];
            await cursor.forEach((review) => reviews.push(review));
            return reviews;
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
            const reviewsCollection = db.collection("reviews");
            const review = await reviewsCollection.deleteOne(query);
            return review;
        } catch (e) {
            throw new Error(e.message);
        } finally {
            await dbClient.close();
        }
    }
}

module.exports = ReviewService;
