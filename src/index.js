require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authMiddleware = require("./middleware/auth");
const { generateAccessToken } = require("./utils");
const validator = require("validator");
const dbClient = require("./db");
const AuthService = require("./services/auth");
const SessionService = require("./services/session");
const UserService = require("./services/user");
const DressService = require("./services/dress");
const { getRandomInt } = require("./utils");
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(authMiddleware);

app.get("/", async (req, res) => {
    await dbClient.connect();
    const db = dbClient.db("nearwearDB");
    const cursor = db.collection("users").find({});
    let user;
    await cursor.forEach((item) => {
        user = item;
    });
    console.log(user);
    res.json({ user });
});

app.post("/login", async (req, res) => {
    const phone = req.body?.phone?.trim();
    const password = req.body?.password;
    const authService = new AuthService();

    try {
        if (!validator.isMobilePhone(phone, "bn-BD")) {
            throw new Error("invalid phone number");
        }
        const sessionService = new SessionService();
        const otp = getRandomInt(1000, 10000).toString();
        const token = generateAccessToken(phone);
        await sessionService.save({ otp, token, phone });
        await authService.login(phone, otp, password);
        res.json({ token });
    } catch (e) {
        res.status(403).json({ error: e.message });
    }
});

app.post("/verify", async (req, res) => {
    const otp = req.body?.otp?.trim();
    const token = req.headers?.authorization?.split(" ")[1];

    try {
        const authService = new AuthService();
        await authService.verify(otp, token);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/register", async (req, res) => {
    const _id = req.body?._id?.trim();
    const firstName = req.body?.firstName?.trim();
    const lastName = req.body?.lastName?.trim();
    const phone = req.body?.phone?.trim();
    const password = req.body?.password?.trim();
    const nid = req.body?.nid?.trim();
    const role = req.body?.role?.trim();

    const userService = new UserService();

    try {
        const user = await userService.save({
            _id,
            firstName,
            lastName,
            phone,
            password,
            nid,
            role,
        });
        res.json({ user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/dress", async (req, res) => {
    const _id = req.body?._id?.trim();
    const title = req.body?.title?.trim();
    const image = req.body?.image?.trim();
    const category = req.body?.category?.trim();
    const time = req.body?.time?.trim();
    const price = req.body?.price?.trim();

    try {
        const dressService = new DressService();
        const dress = await dressService.save({
            _id,
            title,
            image,
            category,
            time,
            price,
        });

        res.json(dress);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});
