import { HttpError } from "http-errors";
import { Request, Response, NextFunction } from "express";

export default function errorHandler(error: HttpError, req: Request, res: Response, next: NextFunction) {
    return res.status(error.statusCode || 500)
        .send({
            success: false,
            message: error.message || "Something went wrong"
        })
}