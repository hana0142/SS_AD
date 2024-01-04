const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models').users;

require('dotenv').config();

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        //DB에 있는 정보와 비교
        try {
            const exUser = await User.findOne({ where: { email } });
            // console.log(exUser)
            if (exUser) {
                const isPasswordMatched = await bcrypt.compare(password, exUser.password);
                // console.log('pw', exUser.password)
                if (isPasswordMatched) {
                    return done(null, exUser);
                }

                //비밀번호 불일치
                else {
                    return done(null, false, { message_pw: 'Wrong credential' });
                }
            }
            else if (!exUser) {
                return done(null, false, { message_user: 'Do not found user' });
            }
        } catch (err) {
            return done(err);
        }
    }
    ));
}
