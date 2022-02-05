import { Router } from "express";
import passport from "passport";
import googleStrategy from "../passport/google.passport";
import authService from "../service";

const social: Router = Router();
social.use(passport.initialize());
passport.use(googleStrategy);

const google: Router = Router();
social.use('/google', google);

google.get('/',
    passport.authenticate('google',
        <any>{ session: false, scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent', }
    )
);
google.get('/redirect',
    passport.authenticate('google',
        { session: false }),
    authService.generateTokens
);

export default social;