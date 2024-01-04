var shortid = require('shortid');
const passport = require('passport');
const User = require('../../models').users;
const requests = require('request');
var NaverStrategy = require('passport-naver').Strategy;
//const { Strategy: NaverStrategy, Profile: NaverProfile } = require('passport-naver-v2');
require('dotenv').config();

module.exports = () => {
    passport.use(new NaverStrategy(
        {
            clientID: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_SECRET_ID,
            callbackURL: 'http://eyecare.idynamics.co.kr:4000/auth/naver/callback',
            passReqToCallback: true,
        }, async (request, accessToken, refreshToken, profile, done) => {
            try {
                console.log(profile);
                const email = profile.emails[0].value
                uuid = shortid.generate();
                const updatedAt = new Date(Date.now());
                const exUser = await User.findOne({
                    where: { email }
                });

                // 이미 가입된 네이버 프로필이면 성공
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

                    else if (exUser.provider === 'naver') {
                        return done(null, exUser);

                    }

                    return done(null, exUser);
                } else {
                    const newUser = await User.create({
                        user_id: uuid,
                        email: profile.emails[0].value,
                        provider: 'naver',
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
