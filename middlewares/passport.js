import {Strategy} from "passport-google-oauth20";
import passport from "passport";
import getPrismaInstance from "../utils/PrismaClient.js";

passport.use(
    new Strategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"],
    }, async function(accessToken, refreshToken, profile, callback) {
        try {
            const prisma = getPrismaInstance();
            const user = await prisma.$transaction(async(prisma) => {
                let existingUser = await prisma.user.findUnique({where: {id: profile.id}});
                if(!existingUser) {
                    existingUser = await prisma.user.create({
                        data: {
                            id:  profile.id,
                            email: profile.emails[0].value,
                            username: profile.displayName,
                            firstName: profile.name.givenName,
                            lastName:  profile.name.familyName,
                        }
                    });
                    return existingUser;
                };
                return existingUser;
            });
            callback(null, user);
        } catch (err) {
            callback(err, null);
        }
    })
);

passport.serializeUser((user, done) => {
    console.log(user);
    done(null, user.id);
});
passport.deserializeUser(async (userId, done) => {
    console.log(userId);
    try {
        const prisma = getPrismaInstance();
        const user = await prisma.user.findUnique({where: {id: userId}});
        if(!user) {
            done(new Error("User not found!", null));
        } else {
            done(null, user);
        }
    } catch (err) {
        done(err, null);
    };
});
