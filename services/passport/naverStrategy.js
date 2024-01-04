var shortid = require('shortid');
const passport = require('passport');
const User = require('../../models').users;
const requests = require('request');
var NaverStrategy = require('passport-naver').Strategy;
// const { Strategy: NaverStrategy, Profile: NaverProfile } = require('passport-naver-v2');
require('dotenv').config();

module.exports = () => {
    passport.use(new NaverStrategy(
        {
            clientID: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_SECRET_ID,
            callbackURL: 'http://eyecare.idynamics.co.kr:4000/auth/naver/callback',
            passReqToCallback: true,
        },
        async (request, accessToken, refreshToken, profile, done) => {
            console.log('strategy', profile);
            console.log(refreshToken);
            const updatedAt = new Date(Date.now());
            try {
                const user_id = profile.id;
                const exUser = await User.findOne({
                    where: { user_id }
                });
                if (exUser) {
                    const provider = exUser.provider;
                    if (exUser.provider === 'local') {
                        await User.update({
                            provider: 'local_social',
                            updatedAt: updatedAt,
                            user_id: uuid,
                            token: refreshToken,
                        }, { where: { user_id } }, (err, result) => {
                            if (err) throw (err);
                        })
                    }

                    else if (exUser.provider === 'naver') {
                        return done(null, exUser);

                    }

                    return done(null, exUser);
                } else {
                    const newUser = await User.create({
                        user_id: user_id,
                        email: profile.emails[0].value,
                        provider: 'naver',
                        token: refreshToken,
                        created_date: updatedAt
                    });

                    await newUser.save();
                    return done(null, newUser);
                }
            } catch (err) {
                console.log(err);
            }
            // User.findOne({
            //     where: { user_id: profile.id }
            // }, function (err, user) {
            //     if (!user) {
            //         user = new User.create({
            //             // name: profile.displayName,
            //             user_id: profile.id,
            //             email: profile.emails[0].value,
            //             // username: profile.displayName,
            //             provider: 'naver',
            //             // naver: profile._json
            //             created_date: updatedAt
            //         });
            //         user.save(function (err) {
            //             if (err) console.log(err);
            //             return done(err, user);
            //         });
            //     } else {
            //         return done(err, user);
            //     }
            // });
        }))
}            
