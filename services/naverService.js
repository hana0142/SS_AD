const User = require('../models').users;
var shortid = require('shortid');
const Check_result = require('../models').check_result;
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth/authToken');

exports.naver_register = async (user_id, sns_id, email) => {
    const updatedAt = new Date(Date.now());
    var return_data;
    try {

        const token = generateRefreshToken(user_id);
        const newUser = await User.create({
            sns_id: sns_id,
            user_id: user_id,
            email: email,
            provider: 'naver',
            // birth_year: req.cookies.naver_user.birth_date,
            token: token,
            created_date: updatedAt,
            status: true
        });
        // console.log(uuid);
        await newUser.save().then((err, result) => {
            if (err) {
                return_data = 0;
                return return_data;
            }
            else {
                return_data = 1;
                return return_data;
            }
        });

    }
    catch (err) {
        console.log(err);
        return_data = 0;
        return return_data;
    }
}

exports.naver_exUser_local = async (sns_id, email) => {
    const updatedAt = new Date(Date.now());
    var return_local;

    await User.update({
        provider: 'local_social',
        updatedAt: updatedAt,
        sns_id: sns_id,
    }, { where: { email } }, async (err, result) => {
        if (err) {
            console.log(err);
            return_local = 0;
            return return_local;
        }
        else {
            return_local = 1;
            return return_local;
        }
    })
}

exports.naver_exUser_naver = async (sns_id, email) => {
    const updatedAt = new Date(Date.now());
    var return_local;

    await User.update({
        provider: 'local_social',
        updatedAt: updatedAt,
        sns_id: sns_id,
    }, { where: { email } }, async (err, result) => {
        if (err) {
            console.log(err);
            return_local = 0;
            return return_local;
        }
        else {
            return_local = 1;
            return return_local;
        }
    })
}

exports.naver_exUser_localsocial = async (email) => {
    const updatedAt = new Date(Date.now());
    var return_localsocial;

    await User.update({
        updatedAt: updatedAt,
    }, { where: { email } }, async (err, result) => {
        if (err) {
            console.log(err);
            return_localsocial = 0;
            return return_localsocial;
        }
        else {
            return_localsocial = 1;
            return return_localsocial;
        }
    })
}