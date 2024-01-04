// const express = require('express');
// const router = new express.Router();
// const passport = require('passport');
// const { isLoggedin, forwardAuthenticated } = require('../middleware/auth/auth');
// const checkTokens = require('../middleware/auth/checkToken');
// const userController = require('../controllers/userController');
// // const resultController = require('../controllers/resultController');

// // router.get('/register/check-mail/:email', userController.test_register.getCheckMail);
// // router.post('/register/', userController.test_register.postRegister);
// // router.get('/register/auth-mail/:email', userController.test_register.authMail);
// router.get('/register/auth-mail/token/:token', userController.test_register.updateStatus);

// router.get('/login', isLoggedin, checkTokens, userController.test_login.getLogin);
// router.post('/login', forwardAuthenticated, userController.test_login.postLogin);
// router.get('/logout', isLoggedin, checkTokens, userController.logout);


// // router.get()
// // router.get('/google/login', userController.login.getGoogleLogin);
// // router.get('/naver/login', userController.login.getNaverLogin);



// module.exports = router;
