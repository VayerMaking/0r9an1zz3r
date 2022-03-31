import createHttpError from "http-errors";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import userController from "../controller";

let qwerty = "qwerty123"
const googleStrategy: GoogleStrategy = new GoogleStrategy(
    {
        callbackURL: 'https://bedf-77-76-8-119.ngrok.io/social/google/redirect',
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (_, __, profile: Profile, done: VerifyCallback) => {
        try {
            const email: string = profile.emails[0].value;
            let user = await userController.findByEmail(email);
            if (user && user.provider === "local")
                return done(createHttpError(403, "Email used by local user"), null);
            if (!user) {
                user = await userController.createNew({
                    email,
                    username: profile.displayName,
                    provider: profile.provider,
                });
            }            
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
);

export default googleStrategy;