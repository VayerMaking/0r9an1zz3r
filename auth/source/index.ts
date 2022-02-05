// app config
import express from "express";
import "dotenv/config";
import "express-async-errors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";

// own middleware
import verifyMiddleware from "./middleware";

// model type
import { user } from "@prisma/client";

// routes
import local from "./routes/local.route";
import social from "./routes/social.route";

// redis setup
import { createClient } from "redis";
import errorHandler from "./errorHandler";

export const redisClient = createClient({ url: process.env.REDIS_URL });
async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("[database] redis connected")
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

// decalre Request interface props
declare module "express" {
    export interface Request {
        user: user;
        token: string;
    }
}

(async () => {
    const app: express.Application = express();

    // config 
    app.use(express.json())
        .use(express.urlencoded({ extended: false }))
        .use(morgan('dev'))
        .use(helmet())
        .use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
        .use(cookieParser())
        .use(cors({ origin:'*'}));

    await connectRedis();

    // routing
    app.use('/', local)
        .use('/social', social)
        .get('/dashboard', verifyMiddleware.verifyToken, (req: express.Request, res: express.Response) => {
            const { email, username, provider } = req.user;
            res.status(200).send({ success: true, message: "User example dashborad", data: { username, email, provider }});
        });

    // error handler
    app.use(errorHandler);


    app.listen(process.env.PORT || 5000, () => console.log(`[server] listening at ${process.env.PORT || 5000}`))
})()
