const User = require('../models').users;
var shortid = require('shortid');
const Check_result = require('../models').check_result;
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth/authToken');

exports.google_register = async (user_id, sns_id, email) => {
    const updatedAt = new Date(Date.now());
    var return_data;
    try {

        const token = generateRefreshToken(user_id);
        const newUser = await User.create({
            sns_id: sns_id,
            user_id: user_id,
            email: email,
            provider: 'google',
            // birth_year: req.cookies.google_user.birth_date,
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

exports.google_exUser_local = async (sns_id, email) => {
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

exports.google_exUser_google = async (sns_id, email) => {
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

exports.google_exuser = async (email) => {
    const gg_exuser = await User.findOne({
        where: { email }
    });
    return gg_exuser;
}

exports.google_exUser_localsocial = async (email) => {
    const updatedAt = new Date(Date.now());
    var return_localsocial;
    console.log('googlelocal');
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