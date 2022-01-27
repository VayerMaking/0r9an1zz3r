import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redisClient } from ".";
import ms from "ms";

export async function generatePassword(password: string): Promise<{ salt: string, hash: string }> {
    try {
        const salt: string = await bcrypt.genSalt(12);
        const hash: string = await bcrypt.hash(password, salt);
        return { salt, hash };
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

export function generateAccessToken(userId: number, uuid: string): string {
    const token: string = jwt.sign(
        {
            sub: userId,
            jti: uuid
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_AGE,
        }
    )
    return token;
}

export async function generateRefreshToken(userId: number, uuid: string): Promise<string> {
    const token: string = jwt.sign(
        {
            sub: userId,
            jti: uuid
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_AGE,
        }
    );

    await redisClient.set(
        userId.toString() + "_" + uuid,
        JSON.stringify({
            refreshToken: token,
            expiresIn: process.env.REFRESH_TOKEN_AGE
        }),
        { PX: ms(process.env.REFRESH_TOKEN_AGE) }
    ).catch(err => {
        console.error(err);
        process.exit(1);
    });

    return token;
}

export async function deleteTokens(userId: number, token: string): Promise<void> {
    try {
        const decoded = jwt.decode(token, { complete: true });
        const jti = decoded.payload.jti;
        await redisClient.del(userId + '_' + jti);
        await redisClient.SADD('BL_' + userId.toString(), token);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
