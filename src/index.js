require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authMiddleware = require("./middleware/auth");
const generateAccessToken = require("./utils");
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(authMiddleware);

app.get("/", (req, res) => {
    res.json({ message: "hello" });
});

app.post("/login", (req, res) => {
    res.json({ token: generateAccessToken("shakil") });
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});
