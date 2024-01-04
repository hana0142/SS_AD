const jwt = require('jsonwebtoken');
const User = require('../../models').users;

//로그인이 되어 있지 않은지 확인
const forwardAuthenticated = (req, res, next) => {
    if (!req.user) {
        return next();
    }
    return res.status(409).json({
        code: 409,
        message: 'conflict_already login'
    })
}

//로그인이 되어 있는지 확인
const isLoggedin = (req, res, next) => {
    console.log(req.cookies);
    console.log(req.session.IsLoggedIn);
    if (req.session.IsLoggedIn === true) {
        return next();
    }
    res.status(400).json({
        code: 400,
        message: 'Bad request'
    });
}

module.exports = { forwardAuthenticated, isLoggedin };

