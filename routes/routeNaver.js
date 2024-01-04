const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const checkTokens = require('../middleware/auth/checkToken');
const { isLoggedin, forwardAuthenticated } = require('../middleware/auth/auth');
const { check } = require('express-validator');
router.use(cookieParser());
const naverController = require('../controllers/naverController');

router.get('/userinfo', forwardAuthenticated, naverController.getNaverUserInfo);
router.get('/login', naverController.successNaverLogin);
router.get('/cookie', naverController.getCookie);

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