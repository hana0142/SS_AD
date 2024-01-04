const express = require('express');
const passport = require('passport');
const User = require('../models').users;
const cookieParser = require('cookie-parser');
const router = express.Router();
const bodyParser = require('body-parser');
const checkTokens = require('../middleware/auth/checkToken');
const { isLoggedin, forwardAuthenticated } = require('../middleware/auth/auth');
const googleController = require('../controllers/googleController');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());
// router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/userinfo', googleController.googleUser);
router.get('/login', googleController.successGoogleLogin);
router.get('/register', googleController.googleRegister);
router.get('/cookie', googleController.getCookie);


router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/callback', passport.authenticate('google', {
  passReqToCallback: true,
  failureRedirect: '/auth/google',
}), (req, res) => {
  res.locals.isLogged = req.isAuthenticated();
});

//login success
router.get('/success', googleController.successGoogleLogin);
router.get('/logout', isLoggedin, checkTokens, (req, res) => {
  try {
    req.logout();
    req.session.destroy(() => {
      res.clearCookie('at');
      res.clearCookie('naver_user');
      res.clearCookie('google_user');
      res.clearCookie('check_no');
      res.clearCookie('user');
      res.clearCookie('accessToken');
      res.clearCookie('loginData');
      return res.status(200).send('로그아웃을 완료하였습니다.');
    });
  } catch (error) {
    return res.status(500);
  }
});

module.exports = router;

