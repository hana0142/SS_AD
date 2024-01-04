const User = require('../models').users;
var shortid = require('shortid');
const bcrypt = require('bcryptjs');
const Check_result = require('../models').check_result;
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth/authToken');

exports.getUser_email = async (email) => {
    try {
        let return_data;
        if (!email) {
            return_data = 0;
            return return_data;
        }
        else {
            return_data = await User.findOne({ where: { email } });
            return return_data;

        }
    } catch (err) {
        console.log(err)
        throw Error(err)
    }
    // var data = await User.findOne({ where: { email } });
}

exports.getUser_uid = async (user_id) => {
    try {
        let result_data;
        if (!user_id) {
            result_data = 0;
            return result_data;
        }
        else {
            let data = await User.findOne({ where: { user_id } });
            console.log(data);
            return data;
        }

    } catch (err) {
        console.log(err)
        throw Error(err);
    }
}


exports.getUser_token = async (token) => {
    try {
        let result_data;
        if (!token) {
            result_data = 0;
            return result_data;
        }
        else {
            let data = await User.findOne({ where: { token } });
            console.log(data);
            return data;
        }

    } catch (err) {
        console.log(err)
        throw Error(err);
    }
}

exports.putUser_uid = async (user_id) => {
    try {
        //console.log(user_id);
        const refreshToken = generateRefreshToken(user_id);
        //console.log(refreshToken);
        let user_update = -1;

        updateDate = Date.now();
        let data = await User.update({ token: refreshToken, updated_date: updateDate },
            { where: { user_id } });

        if (data) {
            console.log('update finish');
            user_update = 0;
            return user_update;
        }
        else {
            user_update = 1;
            return user_update;
        }
    } catch (err) {
        console.log(err);
        throw Error(err);
    }

}

exports.sns_put_user = async (email) => {
    try {
        //console.log(user_id);
        // const refreshToken = generateRefreshToken(user_id);
        //console.log(refreshToken);
        let user_update = -1;

        updateDate = Date.now();
        let data = await User.update({ updated_date: updateDate },
            { where: { email } });

        if (data) {
            console.log('update finish');
            user_update = 0;
            return user_update;
        }
        else {
            user_update = 1;
            return user_update;
        }
    } catch (err) {
        console.log(err);
        throw Error(err);
    }
}
exports.postUser = async (email, password, country, sex, birth_year) => {
    //local 가입자의 uuid 생성
    const uuid = shortid.generate();
    let post_user_check = -1;
    //password Hash 처리
    const hash = await bcrypt.hash(password, 12);
    try {
        //새로운 사용자 DB 저장
        const newUser = await User.create({
            user_id: uuid,
            email: email,
            provider: 'local',
            password: hash,
            country: country,
            sex: sex,
            birth_year: birth_year
        })
        post_user_check = 0;
        await newUser.save();
        return post_user_check;
    } catch (err) {
        console.log(err);
        throw Error(err);
    }
}

exports.putUser_existUser = async (email, password, country, sex, birth_year) => {
    //password Hash 처리
    const hash = await bcrypt.hash(password, 12);
    const createdAt = new Date(Date.now());
    // let update_user_check = -1;
    try {
        //기존 가입자 계정 정보 업데이트
        const update_user_data = await User.update({
            password: hash,
            provider: 'local_social',
            country: country,
            sex: sex,
            birth_year: birth_year,
            update_date: createdAt
        }, { where: { email } });
        return update_user_data;
    } catch (err) {
        console.log(err);
        throw Error(err);
    }
}

exports.getAllUsers = async () => {
    const check_result = await Check_result.findAll(
        { where: { email } },
        // { order: [['check_no', 'DESC']] },
        // { limit: 1 }
    )
} 
