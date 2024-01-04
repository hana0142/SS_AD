const env = require('dotenv');
const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const passport = require('passport');
const checkTokens = require('../middleware/auth/checkToken');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth/authToken');
const { isLoggedin, forwardAuthenticated } = require('../middleware/auth/auth');
const { check } = require('express-validator');
router.use(cookieParser());
const googleController = require('../controllers/googleController');

router.get('/login', forwardAuthenticated, googleController.getGoogleUserInfo);
router.get('/success', googleController.successGoogleLogin);
router.get('/logout', isLoggedin, checkTokens, (req, res) => {
    try {
        req.logout();
        req.session.destroy(() => {
            res.clearCookie('accessToken');
            return res.status(200).send('로그아웃을 완료하였습니다.');
        });
    } catch (error) {
        return res.status(500);
    }
});
router.get('/get_auth_code', function (req, res) {

    const GOOGLE_CLIENT_ID = "490499069409-otdmv6keb63nm32sthtdikgk4bo72pcu.apps.googleusercontent.com"
    // GOOGLE_SECRET_ID = "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"
    const GOOGLE_REDIRECT_URL = "http://eyecare.idynamics.co.kr:4000/auth/google/callback"

    var s_html = '<html>';

    s_html += '<head></head>';

    s_html += '<body>';

    s_html += '<a href="https://accounts.google.com/o/oauth2/auth?' +

        'client_id=' + GOOGLE_CLIENT_ID +

        '&redirect_uri=' + GOOGLE_REDIRECT_URL +

        '&scope=https://www.googleapis.com/auth/plus.login' +

        '&response_type=code">로그인</a>';

    s_html += "</body>";

    s_html += "</html>";



    res.send(s_html);

});
router.get('/callback', function (req, res) {



    if (typeof req.query.code != 'undefined') {

        console.log("authorization code = " + req.query.code);

        res.send("authorization code = " + req.query.code);

    }

    else if (typeof req.query.access_token != 'undefined') {

        console.log("access_token = " + req.query.access_token);

        res.send("access_token = " + req.query.access_token);

    }

    else if (typeof req.query.user_id != 'undefined') {

        console.log("user_id = " + req.query.user_id);

        res.send("user_id = " + req.query.user_id);

    }

});
module.exports = router;