const jwt = require('jsonwebtoken');
const User = require('../../models').users;

module.exports = {
    //accessToken verify
    verifyAccessToken: (accessToken) => {
        if (!accessToken) {
            return null;
        }

        try {
            const decoded_at = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
            const verify_at_result = decoded_at.user_id;
            return verify_at_result;

        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return null;
            }
            return null;
        }
    },
    //refersh verify
    verifyRefreshToken: async (user_id) => {
        try {
            const user_id = user_id;
            const result_refresh = await User.findOne({
                where: { user_id }
            })

            const result_rt = result_refresh.token;

            if (result_rt) {
                const decoded_rt = jwt.verify(result_rt, process.env.JWT_SECRET_KEY);
                // console.log(decoded_rt);
                const verify_rt_result = decoded_rt.user_id;
                return verify_rt_result;
            }
        } catch (err) {
            return null;
        }
    },
    //generate accessToken
    generateAccessToken: (user_id) => {
        const accessToken = jwt.sign({ "user_id": user_id },
            process.env.JWT_SECRET_KEY,
            {//만료기간 : 20분
                expiresIn: "1h"
            }
        );
        return accessToken;
    },
    //generate refreshoken
    generateRefreshToken: (user_id) => {
        const refreshToken = jwt.sign({ "user_id": user_id },
            process.env.JWT_SECRET_KEY,
            {//만료기간 : 14일
                expiresIn: "14d"
            }
        );
        return refreshToken;
    }


}


