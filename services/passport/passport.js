const passport = require('passport');
const local = require('./localStrategy');
const naver = require('./naverStrategy');
const google = require('./googleStrategy');
const User = require('../../models').users;
require('dotenv').config();
// var passport = require('passport');// create a passport instance

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, { user_id: user.user_id, email: user.email });
    });

    passport.deserializeUser(async (req, user, done) => {
        req.session.sid = user.user_id;
        req.session.id = user.user_id
        req.session.isLogined = true;
        req.session.save();
        // console.log(req.session.sid);
        // console.log(req.session.sid);
        done(null, user);
    });

    local();
    google();
    // kakao();
   naver();
   
}
