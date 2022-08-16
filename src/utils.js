const jwt = require("jsonwebtoken");

const generateAccessToken = (username) => {
    return jwt.sign({ username }, process.env.TOKEN_SECRET, {
        expiresIn: "30 days",
    });
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

module.exports = { generateAccessToken, getRandomInt };
