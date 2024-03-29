const jwt = require("jsonwebtoken");

const whitelistedRoutes = ["/", "/login", "/register"];

const authMiddleware = (req, res, next) => {
    console.log(req.url, whitelistedRoutes);
    if (whitelistedRoutes.includes(req.url)) {
        console.log("whitelisted");
        next();
    } else {
        console.log("not whitelisted");
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (token == null) return res.sendStatus(401);

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    }
};

module.exports = authMiddleware;
