import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import userController from "./controller";
import { redisClient } from ".";

async function verifyToken(req: Request, _: Response, next: NextFunction) {
    const token: string = req.headers.authorization.split(' ')[1];
    const decodedToken: string | jwt.JwtPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await userController.findById(parseInt((<any>decodedToken).sub));
    if (!user)
        next(createHttpError(404, "User not found"));

    const isblacklistedTokens: boolean = await redisClient.SISMEMBER('BL_' + user.id.toString(), token);
    if (isblacklistedTokens)
        next(createHttpError(401, "Token is blacklisted"));

    req.user = user;
    req.token = token;

    next();
}

async function verifyRefreshToken(req: Request, _: Response, next: NextFunction) {
    const token: string = req.headers.authorization.split(' ')[1];

    if (!token)
        return next(createHttpError(401, "No token is provided"));

    const decodedToken: string | jwt.JwtPayload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await userController.findById(parseInt((<any>decodedToken).sub));
    if (!user)
        return next(createHttpError(404, "User not found"));

    let tokenStore: string[] = [];
    const pattern: string = '*' + user.id.toString() + "_" + '*';
    const keys = await redisClient.keys(pattern);

    for (let i = 0; i < keys.length; i++) {
        const fromMemory = await redisClient.get(keys[i]);
        const { refreshToken } = JSON.parse(fromMemory);
        tokenStore.push(refreshToken);
    }
    if (!tokenStore.includes(token))
        return next(createHttpError(401, "Token not in store"))

    req.user = user;

    return next();
}

export default { verifyToken, verifyRefreshToken };