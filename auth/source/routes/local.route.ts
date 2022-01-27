import { Router } from "express";
import service from "../service";
import verify from "../middleware";

const local: Router = Router();

local.post('/login', service.login);
local.post('/register', service.register);
local.get('/logout', verify.verifyToken, service.logout);
local.post('/refresh', verify.verifyRefreshToken, service.generateTokens);
local.delete('/delete', verify.verifyToken, service.deleteAccont);

// change password

export default local;