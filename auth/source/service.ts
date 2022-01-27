import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import * as util from "./utils";
import userController from "./controller";
import { validate } from "email-validator";
import { v4 as uuidv4 } from 'uuid';

export default {
    register: async (req: Request, res: Response, next: NextFunction) => {
        const { username, email, password }: { username: string, email: string, password: string } = req.body;
        if (!validate(email))
            return next(createHttpError(400, "Invalid email credential"))
        let user = await userController.findByEmail(email);
        if (user)
            return next(createHttpError(400, "User with this email already Exist"))

        const { salt, hash }: { salt: string, hash: string } = await util.generatePassword(password);
        user = await userController.createNew({
            email,
            username,
            salt,
            hash,
            provider: "local"
        })
        return res.status(200).json({ success: true, message: "User is registered" });
    },
    login: async (req: Request, res: Response, next: NextFunction) => {
        const { email, password }: { email: string, password: string } = req.body;

        let user = await userController.findByEmail(email);
        if (!user || !validate(email))
            return next(createHttpError(400, "Invalid email credential"))

        const isMatch: boolean = await util.comparePassword(password, user.hash);
        if (!isMatch)
            return next(createHttpError(400, "Invalid password credential"))

        const jti = uuidv4();
        const accessToken: string = util.generateAccessToken(user.id, jti);
        const refreshToken: string = await util.generateRefreshToken(user.id, jti);

        return res.status(200).json({
            success: true,
            message: "User logged in",
            data: {
                access: accessToken,
                refresh: refreshToken
            }
        });
    },
    logout: async (req: Request, res: Response, _: NextFunction) => {
        await util.deleteTokens(req.user.id, req.token);
        return res.status(200).json({ success: true, message: "User logged out" });
    },
    generateTokens: async (req: Request, res: Response, _: NextFunction) => {

        const jti = uuidv4();
        const accessToken: string = util.generateAccessToken(req.user.id, jti);
        const refreshToken: string = await util.generateRefreshToken(req.user.id, jti);

        return res
            .status(200)
            .json({
                status: true,
                message: "User's tokens regenerated",
                data: {
                    access: accessToken,
                    refresh: refreshToken
                }
            });
    },
    deleteAccont: async (req: Request, res: Response, _: NextFunction) => {
        await util.deleteTokens(req.user.id, req.token);
        await userController.deleteOne(req.user.id)
        return res.status(200).json({ success: true, message: "User logged out" });
    },
}