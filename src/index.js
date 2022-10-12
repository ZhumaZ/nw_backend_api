require("dotenv").config();
const express = require("express");
const cors = require("cors");
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
const { ObjectId } = require("mongodb");
const MessageService = require("./services/message");
const OrderService = require("./services/order");
const ReviewService = require("./services/review");
const app = express();

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(authMiddleware);

app.get("/", async (req, res) => {
    res.json({ success: "it is working!!!" });
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
        const session = await authService.verify(otp, token);
        res.json(session);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/register", async (req, res) => {
    const _id = req.body?.phone?.trim();
    const name = req.body?.name?.trim();
    const password = req.body?.password?.trim();
    const nid = req.body?.nid?.trim();
    const role = req.body?.role?.trim();

    const userService = new UserService();

    try {
        const user = await userService.save(
            {
                _id,
                name,
                password,
                nid,
                role,
            },
            "register"
        );
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// User endpoints STARTS

app.get("/user", async (req, res) => {
    const _id = req.query.phone;
    const userService = new UserService();
    console.log(req.query);
    try {
        const user = await userService.get({
            _id,
        });
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch("/ban", async (req, res) => {
    const _id = req.body?._id?.trim();
    const expiresAt = req.body?.expiresAt?.trim();
    const userService = new UserService();
    try {
        const _user = await userService.get({
            _id,
        });
        const user = await userService.save({ ..._user, expiresAt }, "update");
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch("/user/verify", async (req, res) => {
    const _id = req.body?._id?.trim();
    const status = req.body?.status?.trim();
    const userService = new UserService();
    try {
        const _user = await userService.get({
            _id,
        });
        const user = await userService.save({ ..._user, status }, "update");
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch("/user", async (req, res) => {
    const _id = req.body?._id?.trim();
    const userService = new UserService();
    try {
        const _user = await userService.get({
            _id,
        });
        const updatedUser = await userService.save(
            { ..._user, ...req.body },
            "update"
        );
        res.json(updatedUser);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// User endpoints ENDS

// Dress endpoints STARTS

app.put("/dress", async (req, res) => {
    const title = req.body?.title?.trim();
    const image = req.body?.image?.trim();
    const category = req.body?.category?.trim();
    const time = req.body?.time?.trim();
    const price = req.body?.price?.trim();
    const description = req.body?.description?.trim();
    const ownerId = req.body?.ownerId?.trim();

    try {
        const dressService = new DressService();
        const dress = await dressService.save({
            title,
            image,
            category,
            time,
            price,
            description,
            ownerId,
        });

        res.json(dress);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch("/dress", async (req, res) => {
    const _id = req.body?._id?.trim();
    try {
        const dressService = new DressService();
        const _dress = await dressService.get({ _id: ObjectId(_id) });

        if (!_dress) {
            throw new Error("please provide valid _id");
        }

        const dress = await dressService.save({
            ..._dress,
            ...req.body,
        });

        res.json(dress);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/dress", async (req, res) => {
    const _id = req.query._id;
    try {
        const dressService = new DressService();
        const dress = await dressService.get({ _id: ObjectId(_id) });
        res.json(dress);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/dresses", async (req, res) => {
    try {
        const dressService = new DressService();
        const dress = await dressService.list(req.query);
        res.json(dress);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete("/dress", async (req, res) => {
    const _id = req.body?._id?.trim();
    try {
        const dressService = new DressService();
        const dress = await dressService.delete({ _id: ObjectId(_id) });
        res.json(dress);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Dress endpoints ENDS

// Message endpoints STARTS

app.put("/message", async (req, res) => {
    const to = req.body?.to?.trim();
    const from = req.body?.from?.trim();
    const messageBody = req.body?.messageBody?.trim();

    try {
        const messageService = new MessageService();
        const message = await messageService.save({
            to,
            from,
            messageBody,
        });

        res.json(message);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch("/message", async (req, res) => {
    const _id = req.body?._id?.trim();
    try {
        const messageService = new MessageService();
        const _message = await messageService.get({ _id: ObjectId(_id) });

        if (!_message) {
            throw new Error("please provide valid _id");
        }

        const message = await messageService.save({
            ..._message,
            ...req.body,
        });

        res.json(message);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/message", async (req, res) => {
    const _id = req.query._id;
    try {
        const messageService = new MessageService();
        const message = await messageService.get({ _id: ObjectId(_id) });
        res.json(message);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/messages", async (req, res) => {
    try {
        const messageService = new MessageService();
        const messages = await messageService.list(req.query);
        res.json(messages);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete("/message", async (req, res) => {
    const _id = req.body?._id?.trim();
    try {
        const messageService = new MessageService();
        const message = await messageService.delete({ _id: ObjectId(_id) });
        res.json(message);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Message endpoints ENDS

// Order endpoints STARTS

app.put("/order", async (req, res) => {
    const userId = req.body?.userId?.trim();
    const dressId = req.body?.dressId?.trim();
    const dressTitle = req.body?.dressTitle?.trim();
    const status = req.body?.status?.trim();
    const paymentMethod = req.body?.paymentMethod?.trim();
    const deliveryAddress = req.body?.deliveryAddress?.trim();
    const orderedAt = req.body?.orderedAt?.trim();

    try {
        const orderService = new OrderService();
        const order = await orderService.save({
            userId,
            dressId,
            dressTitle,
            status,
            paymentMethod,
            deliveryAddress,
            orderedAt,
        });

        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch("/order", async (req, res) => {
    const _id = req.body?._id?.trim();
    try {
        const orderService = new OrderService();
        const _order = await orderService.get({ _id: ObjectId(_id) });

        if (!_order) {
            throw new Error("please provide valid _id");
        }

        const order = await orderService.save({
            ..._order,
            ...req.body,
        });

        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/order", async (req, res) => {
    const _id = req.query._id;
    try {
        const orderService = new OrderService();
        const order = await orderService.get({ _id: ObjectId(_id) });
        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/orders", async (req, res) => {
    try {
        const orderService = new OrderService();
        const orders = await orderService.list(req.query);
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete("/order", async (req, res) => {
    const _id = req.body?._id?.trim();
    try {
        const orderService = new OrderService();
        const order = await orderService.delete({ _id: ObjectId(_id) });
        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Order endpoints ENDS

// Review endpoints STARTS

app.put("/review", async (req, res) => {
    const userId = req.body?.userId?.trim();
    const dressId = req.body?.dressId?.trim();
    const rating = req.body?.rating?.trim();
    const comment = req.body?.comment?.trim();
    const reviewedAt = req.body?.reviewedAt?.trim();

    try {
        const reviewService = new ReviewService();
        const review = await reviewService.save({
            userId,
            dressId,
            rating,
            comment,
            reviewedAt,
        });
        res.json(review);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch("/review", async (req, res) => {
    const _id = req.body?._id?.trim();
    try {
        const reviewService = new ReviewService();
        const _review = await reviewService.get({ _id: ObjectId(_id) });

        if (!_review) {
            throw new Error("please provide valid _id");
        }

        const review = await reviewService.save({
            ..._review,
            ...req.body,
        });

        res.json(review);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/review", async (req, res) => {
    const _id = req.query._id;
    try {
        const reviewService = new ReviewService();
        const review = await reviewService.get({ _id: ObjectId(_id) });
        res.json(review);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/reviews", async (req, res) => {
    try {
        const reviewService = new ReviewService();
        const reviews = await reviewService.list(req.query);
        res.json(reviews);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete("/review", async (req, res) => {
    const _id = req.body?._id?.trim();
    try {
        const reviewService = new ReviewService();
        const review = await reviewService.delete({ _id: ObjectId(_id) });
        res.json(review);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Review endpoints ENDS

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});
