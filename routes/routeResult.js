const express = require('express');
const router = new express.Router();
const resultController = require('../controllers/resultController');
const { isLoggedin } = require('../middleware/auth/auth');
const checkTokens = require('../middleware/auth/checkToken');
const { route } = require('./routeGoogle');
// const resultController2 = require('../controllers/resultController2');

router.get('/main', isLoggedin, checkTokens, resultController.result_main);
// router.post('/check1', isLoggedin, checkTokens, resultController.result_check1);
// router.post('/check1_1', isLoggedin, checkTokens, resultController.result_check1_1);
//router.post('/check2', isLoggedin, checkTokens, resultController.result_check2);
//router.post('/check3', isLoggedin, checkTokens, resultController.result_check3);
// router.post('/check4', isLoggedin, checkTokens, resultController.result_check4);
// router.post('/test', resultController.result_test);
// router.post('/check5', isLoggedin, checkTokens, resultController.result_check5);
// router.post('/check6', isLoggedin, checkTokens, resultController.result_check6);s
router.post('/send/normal-check', isLoggedin, checkTokens, resultController.post_db_normal_check_result);
router.post('/send/simple-check', isLoggedin, checkTokens, resultController.post_db_simple_check_result);

// router.post('/send/normal-check2', isLoggedin, checkTokens, resultController2.post_db_normal_check_result);
// router.post('/send/simple-check2', isLoggedin, checkTokens, resultController2.post_db_simple_check_result);
//router.get('/send_result', resultController.send_result);
router.get('/report/:check_no', isLoggedin, checkTokens, resultController.result_report);
// router.post('/test', resultController.check4_test);
// router.post('/send/check4_result_file', isLoggedin, checkTokens, resultController.check4_result_file);

router.post('/send/check4_result_file', resultController.check4_result_file);
router.post('/send/check5_result_file', resultController.check5_result_file);
// router.post('/send/check4_result_file2', resultController2.check4_result_file);
// router.post('/send_result', resultController.send_result)
module.exports = router;


