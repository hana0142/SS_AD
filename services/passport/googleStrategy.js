var shortid = require('shortid');
const passport = require('passport');
const User = require('../../models').users;
var GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET_ID,
        callbackURL: "http://eyecare.idynamics.co.kr:4000/auth/google/callback",
        passReqToCallback: true,
    }, async (request, accessToken, refreshToken, profile, done) => {
        try {
            // console.log(accessToken);

            console.log(accessToken);
            const email = profile.emails[0].value
            uuid = shortid.generate();
            const updatedAt = new Date(Date.now());
            const exUser = await User.findOne({
                where: { email }
            });

            if (exUser) {
                const provider = exUser.provider;
                if (exUser.provider === 'local') {
                    await User.update({
                        provider: 'local_social',
                        updatedAt: updatedAt,
                        user_id: uuid
                    }, { where: { email } }, (err, result) => {
                        if (err) throw (err);
                    })
                }

                else if (exUser.provider === 'google') {
                    return done(null, exUser);

                }

                return done(null, exUser);
            } else {
                const newUser = await User.create({
                    user_id: uuid,
                    email: profile.emails[0].value,
                    provider: 'google',
                    created_date: updatedAt
                });

                await newUser.save();
                return done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            return done(error);
        }
    }));
}
