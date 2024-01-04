const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models').users;
const cookieParser = require('cookie-parser');
const checkTokens = require('../middleware/auth/checkToken');
const { isLoggedin, forwardAuthenticated } = require('../middleware/auth/auth');
const loginController = require('../controllers/userController');

router.use(cookieParser());
// router.post('/login', forwardAuthenticated, userController.login.postLogin);

//google api login
router.get('/', forwardAuthenticated, passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

// google api callback
router.get('/callback', forwardAuthenticated, passport.authenticate('google', {
    passReqToCallback: true,
    failureRedirect: '/auth/google',
}), (req, res) => {
    // console.log(req.body);
    // res.cookie('accessToken', accessToken);
    const accessToken = req.query.code;
    res.cookie('accessToken', accessToken)
    //console.log(req);
    res.locals.isLogged = req.isAuthenticated();
    return res.redirect('/auth/google/success');
});


//login success
router.get('/success', isLoggedin, checkTokens, loginController.login.getGoogleLogin);
router.get('/logout', isLoggedin, checkTokens, (req, res) => {
    // res.logout();
    // res.clearCookie('accessToken');
    // res.clearCookie('user_id');
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


router.get('/result', checkTokens, (req, res) => {
    const result = User.findOne({ where: email });
    res.status(200).json({ result });
});

module.exports = router;

