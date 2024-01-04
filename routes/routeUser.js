const express = require('express');
const router = new express.Router();
// const passport = require('passport');
const { isLoggedin, forwardAuthenticated } = require('../middleware/auth/auth');
const checkTokens = require('../middleware/auth/checkToken');
const userController = require('../controllers/userController');

router.get('/register/check-mail/:email', userController.register.getCheckMail);
router.post('/register/', userController.register.postRegister);
router.get('/register/auth-mail/:email', userController.register.authMail);
router.get('/register/auth-mail/token/:token', userController.register.updateStatus);

router.get('/login', isLoggedin, checkTokens, userController.login.getLogin);
router.post('/login', forwardAuthenticated, userController.login.postLogin);
router.get('/logout', isLoggedin, checkTokens, userController.logout);

//login_user reset password
router.post('/password/reset', isLoggedin, checkTokens, userController.password.postForgetPassword);
router.get('/password/reset', userController.password.getResetPasswordWindow);
router.post('/password/reset/new', userController.password.postResetPassword);

router.get('/password/finish', userController.password.getFinish);
//no login user
router.post('/password/send-mail', userController.password.postForgetPassword);
// router.post('/password/finish', userController.password.postFinish);
// router.get()
// router.get('/google/login', userController.login.getGoogleLogin);
// router.get('/naver/login', userController.login.getNaverLogin);



module.exports = router;
