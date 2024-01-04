//token 생성 함수
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require('./authToken');
const userService = require('../../services/userService');

//Token validation
const checkTokens = async (req, res, next) => {
    console.log(req.cookies);
    //access token 쿠키에 저장되어 있지 않은 경우
    if (req.cookies.accessToken === null) {
        console.log("1." + 'req.cookies');
        return res.status(401).json({
            code: 400,
            message: 'Bad request'
        });
    }

    //access token undefined인 경우
    else if (req.cookies.accessToken === 'undefined') {
        console.log("2" + 'req.user');
        console.log("3" + 'req.cookies.user.user_id');
        return res.status(401).json({
            code: 401,
            message: 'Unauthorized'
        });
    }
    else {
        const accessToken = req.cookies.accessToken;
        console.log('access', req.cookies.accessToken);

        //access token과 refresh token verify
        const v_accessToken = verifyAccessToken(accessToken);
        // console.log(req.user.user_id);
        // if (!req.user.user_id) {

        // }
        // console.log('access', v_accessToken);

        // const user_result = await userService.getUser_token(accessToken);

        const user_id = req.cookies.user.user_id
        console.log(user_id);
        const v_refreshToken = await verifyRefreshToken(user_id);


        //1. access token 만료 refresh token 만료
        if (v_accessToken === null) {
            if (v_refreshToken === 'undefined') {
                return res.status(401).json({ code: 401, message: 'Unauthorized' });
            } else {
                //2. access token 만료, refresh token 유효
                const newAccessToken = generateAccessToken(user_id);
                res.cookie('accessToken', newAccessToken);
                next();
            }
        } else if (v_accessToken === user_id) {
            //3. access token 유효, refresh token 만료
            if (v_refreshToken === 'undefined') {
                const newRefreshToken = generateRefreshToken(user_id);
                const updateDate = Date.now();

                await User.update({ token: newRefreshToken, updated_at: updateDate },
                    { where: { user_id }, returning: true })
                    .then(function (result) {
                        console.log(result[1][0]);
                        return res.status(200).json({
                            code: 200,
                            message: 'success'
                        })
                    }).catch(function (err) {
                        return res.status(400).json({
                            code: 400,
                            message: 'update fail'
                        });
                    });
                next();
            }
            else {
                //4. access token 유효, refresh token 유효
                next();
            }
        }
    }
}

module.exports = checkTokens;
