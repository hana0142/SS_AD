const express = require('express');
const router = new express.Router();
const checkController = require('../controllers/checkContoller');
const { isLoggedin } = require('../middleware/auth/auth');
const checkTokens = require('../middleware/auth/checkToken');

router.get('/simple', isLoggedin, checkTokens, checkController.simple_check);
router.get('/normal', isLoggedin, checkTokens, checkController.normal_check);
router.post('/questionnaire', isLoggedin, checkTokens, checkController.post_questionnaire);

module.exports = router;
