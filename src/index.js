require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authMiddleware = require("./middleware/auth");
const generateAccessToken = require("./utils");
const dbClient = require("./db");
const AuthService = require("./services/auth");
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
    const username = req.body?.username.trim();
    const password = req.body?.password;
    const authService = new AuthService();

    try {
        if (!username || !password) {
            throw new Error("invalid username or password in request");
        }
        await authService.login(username, password);
        res.json({ token: generateAccessToken(username) });
    } catch (e) {
        res.status(403).json({ error: e.message });
    }
    // username, password get from req.body
    // check with database if the username and password is valid
    // If valid, then generate a token and send it as response
    // otherwise, send a unauthorized error
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});
