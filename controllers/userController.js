const bcrypt = require('bcryptjs');
const passport = require('passport');
const userService = require('../services/userService');
const resultService = require('../services/resultService');
const User = require('../models').users;
const nodemailer = require('nodemailer');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth/authToken');
let check = -1;

//로그아웃
exports.logout = async (req, res) => {
    try { 
        // req.logout();
        req.session.destroy((err) => {
            //delete session data from store, using sessionID in cookie
            
            // res.clearCookie("loginData");
            // res.clearCookie("check_no");

            res.clearCookie("user"); // clears cookie containing expired sessionID
            res.clearCookie('loginData');
            res.clearCookie("accessToken");
            res.clearCookie("naver_user");
            res.clearCookie("google_user");
            res.status(200).json({ code: 200, message: "Logged out successfully" });
            if (err) {
                return res.status(400).json({ code: 400, message: "logout fail" });
            }
        });
    } catch(err) {
        console.log(err);
    }
    
};

exports.register = {
    //email 중복 체크
    getCheckMail: async (req, res, next) => {
        //param으로 email 붙여 보내기
        const email = req.params.email;

        try {
            //DB조회
            const user_rows = await userService.getUser_email(email);
            console.log(user_rows);
            
            // 1. 중복된 이메일이 없는 경우 => 사용 가능한 이메일
            if (!user_rows) {
                check = 0;
                res.cookie("check_user", email);
                return res.status(200).json({
                    code: 200,
                    message: "success",
                });
            } else {
                // 2-1. 중복된 이메일이 local 가입자인 경우 => 가입 불가능.
                if (user_rows.provider == 'local' || 'local_social') {
                    check = 1;
                    return res.status(409).json({
                        code: 409,
                        message: "conflict",
                    });
                }

                // 2-2. 중복된 이메일이 social 계정인 경우 => local 계정으로 중복 가입 가능.
                else if (user_rows.provider == 'google' || user_rows.provider == 'naver') {
                    res.cookie("check_user", email);
                    return res.status(300).json({
                        code: 300,
                        message: "multiple user",
                        // check: 2
                    });
                }
            }
        } catch (err) {
            return res.status(500).json({
                code:500,
                message: 'internal server error'
            });
        }
    },

    postRegister: async (req, res) => {

        //입력창에서 받아올 항목
        const { email, password, confirmPassword, country, sex, birth_year } = req.body;

        try {
            //항목 누락
            if (!email || !password || !confirmPassword || !country || !sex || !birth_year) {
                return res.status(400).json({
                    code: 400,
                    message: 'Please enter all the details'
                })
            }

            //사용중인 email 주소가 있을 경우 
            //0 : not exist user 1:local user 2: social user

            //최초 가입자
            if (check === 0) {
                //비밀번호 & 비밀번호 확인 
                if (password !== confirmPassword) {
                    return res.status(400).json({ code:400, message: 'password must be same' })
                }
                const post_user_check_result = await userService.postUser(email, password, country, sex, birth_year);

                if (post_user_check_result === 0) {
                    return res.status(201).json({
                        code: 201,
                        message: 'created'
                    });
                }
                else
                    return res.status(400).json({
                        code: 400,
                        message: "update fail"
                    });
            }

            //Local에 이미 가입되어 있는 사용자 
            else if (check === 1) {
                return res.status(400).json({
                    code: 409,
                    message: "you already register your email"
                })
            }

            //social 계정으로 이미 가입되어 있는 사용자 (중복 가입 가능)
            else if (check === 2) {
                //비밀번호 & 비밀번호 확인 
                if (password !== confirmPassword) {
                    return res.status(400).json({
                        code: 400,
                        message: 'password must be same'
                    })
                }

                const update_user_check_result = await userService.putUser_existUser(email, password, country, sex, birth_year);

                if (update_user_check_result === 0) {
                    return res.status(201).json({
                        code: 201,
                        message: "created"
                    })
                } else {
                    return res.stauts(500).json({
                        code: 500,
                        message: "fail"
                    })
                }
            }

            else {
                return res.status(404).json({
                    code: 404,
                    message: "check your email"
                })
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({code:500, message:'internal server error'});
        }
    },

    // 가입인증 메일
    authMail: async (req, res) => {
        // const email = req.cookies['check_user'];
        const email = req.params.email;
        // console.log(email);
        const unauth_user = await User.findOne({ where: { email } });

        //인증되지 않은 사용자 (토큰 업로드)
        if (unauth_user) {
            const user_id = unauth_user.user_id;
            const token = generateRefreshToken(user_id);
            const transporter = nodemailer.createTransport({
                host: process.env.HOST,
                service: process.env.SERVICE,
                port: 465,
                secure: true,
                auth: {
                    user: "openeyehana@gmail.com",
                    pass: 'nswhszkllvcqycds'
                },
            });
            // console.log(transporter);

            const createdAt = new Date(Date.now());
            //메일 내용 (토큰이 포함된 인증 링크)
            const sent = await transporter.sendMail({
                from: process.env.USER,
                to: email,
                subject: 'Authentication mail',
                html: '<p>아래 링크를 클릭하시면 인증이 완료됩니다. < a href="http://eyecare.idynamics.co.kr:4000/api/users/register/auth-mail/token/' + token + '" > link</a> authentication mail</p > '
            }, (err, info) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({ message: 'bad request' });
                }

            });

            //DB 업데이트
            await User.update({ token: token, update_date: createdAt },
                { where: { email: email } }, (err, result) => {
                    if (err)
                        throw err
                    else {
                        console.log(result);
                    }
                }
            );

            // res.clearCookie('check_user');
            return res.status(200).json({ message: 'success' });
        }


        else {
            return res.status(400).json({ message: 'Bad request' });
        }
    },
    // 인증 완료 후 status 수정
    updateStatus: async (req, res) => {
        const token = req.params.token;
        // console.log(token);
        // var token = req.cookies.token;
        // var password = req.body.password[0];
        const result = await User.findOne({ where: { token: token } });
        console.log(result);
        
        if (!result) {
            return res.status(401).json({ message: 'Token invalid.' });
        } else {
            const updatedAt = new Date(Date.now());
            var new_token = await generateRefreshToken(result.user_id);
            // const hash = await bcrypt.hash(password, 12);

            //토큰과 status 업데이트
            await User.update({ token: new_token, status: true, updated_date: updatedAt },
                { where: { token: token } }, (err, result) => {
                    if (err) throw (err);
                });
                return res.status(302).json({
                    code: 302,
                    message: 'success_redirect main page',
                    location: '/api/users/login'
               });
        }
    }

}

exports.login = {
    postLogin: async (req, res, next) => {
        try {
            res.clearCookie("user");
            res.clearCookie('loginData');
            res.clearCookie("accessToken");
            res.clearCookie("naver_user");
            res.clearCookie("google_user");
            res.clearCookie("check_no");
            res.clearCookie("left_result_check4");
            res.clearCookie("right_result_check4");
            res.clearCookie("left_result_check5");
            res.clearCookie("right_result_check5");
            
            //passport-local 인증
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    console.log(err);
                    return next();
                }

                if (info) {
                    if (info.message_pw) {
                        return res.status(401).json({ code: 401, message: info.message_pw });
                    }
                    if (info.message_user) {
                        return res.status(404).json({ code: 404, message: info.message_user });
                    }
                }

                return req.login(user, async loginErr => {
                    var expiryDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 7); // 24 hour 7일
                    if (loginErr) {
                        return next(loginErr);
                    }
                    else {
                        const loginUser = req.session.passport.user;
                        const user_id = loginUser.user_id;
                        const row = await userService.putUser_uid(user_id);
                        const accessToken = await generateAccessToken(user_id);
                        const user_result = await userService.getUser_uid(user_id);

                        //메일인증 완료
                        if (row == 0 && user_result.status === true) {
                            //자동 로그인 체크
                            if (req.body.keepLogin === true) {
                                req.session.IsLoggedIn = true;
                                
                                //cookie 저장
                                res.cookie('accessToken', accessToken, { expires: expiryDate, httpOnly: true });
                                res.cookie("user", {
                                    user_id: loginUser.user_id,
                                    email: loginUser.email,
                                    auto_login: true,
                                    authorized: true
                                }, {
                                    //기간 24hours 7days
                                    expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7), httpOnly: true
                                }
                                );
                                
                                console.log('accessToken', accessToken);
                                return res.status(200).json({
                                    code: 200,
                                    access_token: accessToken,
                                    message: 'success'
                                });
                            }

                            //자동 로그인 미체크
                            else {
                                req.session.IsLoggedIn = true;
                                res.cookie('accessToken', accessToken, { httpOnly: true });
                                res.cookie("user", {
                                    user_id: loginUser.user_id,
                                    email: loginUser.email,
                                    auto_login: false,
                                    authorized: true
                                },{ httpOnly: true });
                                console.log('test', req.session);
                                return res.status(200).json({
                                    code: 200,
                                    access_token: accessToken,
                                    message: 'success'
                                });
                            }
                        }

                        //메일인증 미완료
                        else if (row == 0 && user_result.status === false) {
                            if (req.body.keepLogin === true) {

                                //cookie 저장
                                req.session.IsLoggedIn = true;
                                res.cookie('accessToken', accessToken, { expires: expiryDate, httpOnly: true });
                                res.cookie("user", {
                                    user_id: loginUser.user_id,
                                    email: loginUser.email,
                                    auto_login: true,
                                    authorized: true
                                }, { expires: expiryDate, httpOnly: true }
                                );
                                console.log('accessToken', accessToken);
                                return res.status(303).json({
                                    code: 303,
                                    message: 'redirect authenticate page',
                                    location: '/api/users/register/auth-mail/:email'
                                });
                            }

                            //자동 로그인 미체크
                            else {
                                req.session.IsLoggedIn = true;
                                res.cookie('accessToken', accessToken, { httpOnly: true });
                                res.cookie("user", {
                                    user_id: loginUser.user_id,
                                    email: loginUser.email,
                                    auto_login: false,
                                    authorized: true
                                }, { httpOnly: true }
                                );
                                console.log('test',accessToken);
                                return res.status(302).json({
                                    code: 302,
                                    message: 'redirect authenticate page',
                                    location: '/api/users/register/auth-mail/:email'
                                });
                            }
                        }
                        else {
                            return res.status(400).json({ code: 400, message: 'bad request' });
                        };
                    }
                })
            })(req, res, next)
        } catch (error) {
            res.json({ error: error });
        }
    },


    getLogin: async (req, res) => {
        if (req.user) {
            return res.status(200).json({
                code: 200,
                message: 'success'
            })
        }
        else {
            return res.status(302).json({
                code: 302,
                message: 'redirect login page',
                location: '/api/users/login'
            });
        }
    },

 getGoogleLogin: async (req, res, next) => {
        if (!req.session) {
            return res.status(400).json({ message: 'Unauthorization' });
        }
        console.log(req.session.passport.user);
     const loginUser = req.session.passport.user;
     const accessToken = generateAccessToken(loginUser.user_id);
     const refreshToken = generateRefreshToken(loginUser.user_id);
     const user_id = loginUser.user_id;
        
        //console.log(req.user);
        const user_result = await userService.getUser_uid(user_id);
        const user_update = await userService.putUser_uid(user_id);
        // const result = await User.update({ token: refreshToken, updated_at: updateDate },
        //     { where: { user_id: req.user } });
        console.log(user_update);
        
        if (user_update === 0) {
            console.log(user_update);
            console.log(accessToken);
            res.cookie('accessToken', accessToken);
                res.cookie("user", {
                    user_id: user_id,
                    auto_login: true,
                    accessToken: accessToken,
                    email: req.user.email,
                    authorized: true
                }, { expires: new Date(Date.now() + 900000), httpOnly: true }
                );
            res.status(200).json({code:200, message:'success'});
        }
        else {
            return res.status(401).json({ code:401,message: 'update fail' });
        }
    },


}

exports.noUser = {
    postResetEmail: async(req,res) =>{
        const email = req.body.email;
        const getUser = await userService.getUser_email(email);
        console.log(getUser);

        if (getUser === null) {
            return res.status(404).json({
                code: 404,
                message: "Do not found user"
            });
        }

        //social user (don't need password)
        else if (getUser.user_provider === 'google' || getUser.user_provider === 'naver') {
            return res.status(400).json({
                code: 400,
                message: 'Social login user do not need password'
            });
        }

        else {
            const resetToken = generateRefreshToken(getUser.user_id);
            const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
            const createdAt = new Date(Date.now());
            
            //토큰 생성 후 이메일로 비밀번호 재설정 링크 보내기
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.HOST,
                    service: process.env.SERVICE,
                    port: 465,
                    secure: true,
                    auth: {
                        user: "openeyehana@gmail.com",
                        pass: process.env.PASS,
                    },
                });
                const resetLink = "http://eyecare.idynamics.co.kr:4000/api/users/password/reset/" + resetToken
                const sent = await transporter.sendMail({
                    from: process.env.USER,
                    to: email,
                    subject: 'Reset Password Link',

                    // html: '<p>You requested for reset password, kindly use this < a href="http://localhost:4000/api/users/password/reset/' + resetToken + '" > link</a> to reset your password</p > '
                    html: '<p>You requested for reset password, kindly use this < a href="http://eyecare.idynamics.co.kr:4000/api/users/password/reset/?email=' + email + "&token=" + resetToken + '" > link</a> to reset your password</p > '
                });

                if (sent != '0') {
                    var data = {
                        token: resetToken
                    }

                    await User.update({ token: resetToken, updated_date: createdAt },
                        { where: { email } }, (err, result) => {
                            if (err)
                                throw err
                        }
                    );

                    // res.cookie('refreshToken', resetToken, { path: '/api/users/password/reset/:token', secure: true })
                    return res.status(200).json({ code: 200, message: 'success' });
                } else {
                    return res.status(400).json({ code: 400, message: 'Something goes to wrong. Please try again' });
                }

            } catch (error) {
                return res.status(500).json({ code: 500, message: 'internal server error' })
            }

    }
},
    
}
exports.password = {
    getPasswordEmail: async (req, res) => {
        try {
            const email = req.cookies.user.email;
            return res.status(200).json({ code: 200, message: 'success' });
        } catch (err) {
            console.log(err);
            return res.status(400).json({ code: 400, message: 'fail' });
        }
    },
    postPasswordResetMail: async (req, res) => {
        let email = req.cookies.user.email;
        
        // const email = req.body.email;
        // console.log(req.body.email);
        // const user_id = req.user;
        // console.log(user_id);
        const getUser = await userService.getUser_email(email);
        console.log(getUser);

        if (getUser.user_provider === 'google' || getUser.user_provider === 'naver') {
            return res.status(400).json({
                code: 400,
                message: 'Social login user do not need password'
            });
        }
        
        else {
            const resetToken = generateRefreshToken(getUser.user_id);
            const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
            const createdAt = new Date(Date.now());

            //토큰 생성 후 이메일로 비밀번호 재설정 링크 보내기
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.HOST,
                    service: process.env.SERVICE,
                    port: 465,
                    secure: true,
                    auth: {
                        user: "openeyehana@gmail.com",
                        pass: process.env.PASS,
                    },
                });
                const resetLink = "http://eyecare.idynamics.co.kr:4000/api/users/password/reset/" + resetToken
                let send_result;
                const sent = await transporter.sendMail({
                    from: process.env.USER,
                    to: email,
                    subject: 'Reset Password Link',

                    // html: '<p>You requested for reset password, kindly use this < a href="http://localhost:4000/api/users/password/reset/' + resetToken + '" > link</a> to reset your password</p > '
                    html: '<p>You requested for reset password, kindly use this < a href="http://eyecare.idynamics.co.kr:4000/api/users/password/reset/?email=' + email + "&token=" + resetToken + '" > link</a> to reset your password</p > '
                })
                    .then((result) => {
                        send_result = true;
                    })
                    .catch((err) => {
                        send_result = false;
                        console.log("조회 Error: ", err);
                    })

                if (send_result === true) {
                    var data = {
                        token: resetToken
                    }

                    await User.update({ token: resetToken, updated_date: createdAt },
                        { where: { email } }, (err, result) => {
                            if (err)
                                throw err
                        }
                    );

                    // res.cookie('refreshToken', resetToken, { path: '/api/users/password/reset/:token', secure: true })
                    return res.status(200).json({ code: 200, message: 'success' });
                } else {
                    return res.status(400).json({ code: 400, message: 'Something goes to wrong. Please try again' });
                }

            } catch (error) {
                return res.status(500).json({ code: 500, message: 'internal server error' })
            }

        }

    },
    getResetPasswordWindow: async (req, res, next) => {
        console.log(req.query);
        // res.write('')
        // const url = req.url;
        let email = req.query.email;
        let token = req.query.token;
        console.log(email, token);
        // var token = req.query.token;
        // res.writeHead("Authorization":'')
        res.render('resetPassword', { email: email, token: token });
    },

    postResetPassword: async (req, res) => {
        let email = req.query.email;
   
        console.log(email);
        // console.log()
        const { new_password, new_password_confirm } = req.body;
        // console.log(req.cookies);
        // const user_id = req.user;

        try {
            //항목 누락
            if (!new_password || !new_password_confirm) {
                return res.status(400).json({
                    code: 400,
                    message: 'Please enter all the details'
                })
            }

            if (new_password != new_password_confirm) {
                //비밀번호 & 비밀번호 확인 cd 
                return res.status(400).json({ code: 400, message: 'password must be same' })
            }

            else {
                const updatedAt = new Date(Date.now());
                const db_user = await userService.getUser_email(email);
                console.log(db_user);
                const user_id = db_user.user_id;
                var new_token = generateRefreshToken(user_id);
                const hash_resetPassword = await bcrypt.hash(new_password, 12);

                await User.update({ token: new_token, password: hash_resetPassword, updated_date: updatedAt },
                    { where: { user_id } }, (err, result) => {
                        if (err) {
                            return res.status(400).json({
                                code: 400,
                                message: 'Fail update password'
                            })
                        }
                    }
                );
                return res.render('finish');
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error });
        }
    },

    getFinish: async (req, res) => {
        return res.render('finish');
    },
    
    postForgetPassword: async (req, res) => {
        const email = req.body.email;
        const getUser = await userService.getUser_email(email);
        console.log(getUser);

        if (getUser === null) {
            return res.status(404).json({
                code: 404,
                message: "Do not found user"
            });
        }

        //social user (don't need password)
        else if (getUser.user_provider === 'google' || getUser.user_provider === 'naver') {
            return res.status(400).json({
                code: 400,
                message: 'Social login user do not need password'
            });
        }

        else {
            const resetToken = generateRefreshToken(getUser.user_id);
            const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
            const createdAt = new Date(Date.now());

            //토큰 생성 후 이메일로 비밀번호 재설정 링크 보내기
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.HOST,
                    service: process.env.SERVICE,
                    port: 465,
                    secure: true,
                    auth: {
                        user: "openeyehana@gmail.com",
                        pass: process.env.PASS,
                    },
                });
                const resetLink = "http://eyecare.idynamics.co.kr:4000/api/users/password/reset/" + resetToken
                const sent = await transporter.sendMail({
                    from: process.env.USER,
                    to: email,
                    subject: 'Reset Password Link',

                    // html: '<p>You requested for reset password, kindly use this < a href="http://localhost:4000/api/users/password/reset/' + resetToken + '" > link</a> to reset your password</p > '
                    html: '<p>You requested for reset password, kindly use this < a href="http://eyecare.idynamics.co.kr:4000/api/users/password/reset/?email=' + email + "&token=" + resetToken + '" > link</a> to reset your password</p > '
                });

                if (sent != '0') {
                    var data = {
                        token: resetToken
                    }

                    await User.update({ token: resetToken, updated_date: createdAt },
                        { where: { email } }, (err, result) => {
                            if (err)
                                throw err
                        }
                    );

                    // res.cookie('refreshToken', resetToken, { path: '/api/users/password/reset/:token', secure: true })
                    return res.status(200).json({ code: 200, message: 'success' });
                } else {
                    return res.status(400).json({ code: 400, message: 'Something goes to wrong. Please try again' });
                }

            } catch (error) {
                return res.status(500).json({ code: 500, message: 'internal server error' })
            }

        }


    }
}

// exports.test_login = {
//     postLogin: async (req, res, next) => {
//         try {
//             //passport-local 인증
//             passport.authenticate('local', (err, user, info) => {
//                 if (err) {
//                     console.log(err);
//                     return next();
//                 }

//                 if (info) {
//                     if (info.message_pw) {
//                         return res.status(401).json({ code: 401, message: info.message_pw });
//                     }
//                     if (info.message_user) {
//                         return res.status(404).json({ code: 404, message: info.message_user });
//                     }
//                 }

//                 return req.login(user, async loginErr => {
//                     if (loginErr) {
//                         return next(loginErr);
//                     }
//                     else {
//                         // console.log(req.session.passport.user);
//                         // console.log(req.session);
//                         const loginUser = req.session.passport.user;
//                         console.log('passportlogin', loginUser);
//                         const user_id = loginUser.user_id;
//                         console.log(user_id);
//                         const row = await userService.putUser_uid(user_id);
//                         // console.log(row);
//                         const accessToken = await generateAccessToken(user_id);
//                         const user_result = await userService.getUser_uid(user_id);
//                         console.log(user_result);
//                         // const user_email = user_result.email;

//                         if (row == 0 && user_result.status === true) {
//                             //자동 로그인 체크
//                             if (req.body.keepLogin === true) {
//                                 //cookie 저장
//                                 res.cookie("user", {
//                                     user_id: loginUser.user_id,
//                                     email: loginUser.email,
//                                     auto_login: true,
//                                     accessToken: accessToken,
//                                     authorized: true
//                                 }, { expires: new Date(Date.now() + 86400e3), httpOnly: true }
//                                 );
//                                 console.log('accessToken', accessToken);
//                                 return res.status(200).json({
//                                     code: 200,
//                                     access_token: accessToken,
//                                     message: 'success'
//                                 });
//                                 // req.session.user = {
//                                 //     user_id: loginUser,
//                                 //     auto_login: true,
//                                 //     accessToken: accessToken,
//                                 // }
//                             }

//                             //자동 로그인 미체크
//                             else {
//                                 res.cookie("user", {
//                                     user_id: loginUser.user_id,
//                                     email: loginUser.email,
//                                     auto_login: false,
//                                     accessToken: accessToken,
//                                     authorized: true
//                                 }, { expires: new Date(Date.now() + 900000), httpOnly: true }
//                                 );
//                                 console.log(accessToken);
//                                 return res.status(200).json({
//                                     code: 200,
//                                     access_token: accessToken,
//                                     message: 'success'
//                                 });
//                                 // req.session.user = {
//                                 //     user_id: loginUser,
//                                 //     accessToken: accessToken,
//                                 // }
//                             }

//                         }
//                         else if (row == 0 && user_result.status === false) {
//                             if (req.body.keepLogin === true) {
//                                 //cookie 저장
//                                 res.cookie("user", {
//                                     user_id: loginUser.user_id,
//                                     email: loginUser.email,
//                                     auto_login: true,
//                                     accessToken: accessToken,
//                                     authorized: true
//                                 }, { expires: new Date(Date.now() + 86400e3), httpOnly: true }
//                                 );
//                                 console.log('accessToken', accessToken);
//                                 return res.status(303).json({
//                                     code: 303,
//                                     message: 'redirect authenticate page',
//                                     location: '/api/users/register/auth-mail/:email'
//                                 });
//                                 // req.session.user = {
//                                 //     user_id: loginUser,
//                                 //     auto_login: true,
//                                 //     accessToken: accessToken,
//                                 // }
//                             }

//                             //자동 로그인 미체크
//                             else {
//                                 res.cookie("user", {
//                                     user_id: loginUser.user_id,
//                                     email: loginUser.email,
//                                     auto_login: false,
//                                     accessToken: accessToken,
//                                     authorized: true
//                                 }, { expires: new Date(Date.now() + 900000), httpOnly: true }
//                                 );
//                                 console.log(accessToken);
//                                 return res.status(303).json({
//                                     code: 303,
//                                     message: 'redirect authenticate page',
//                                     location: '/api/users/register/auth-mail/:email'
//                                 });
//                                 // req.session.user = {
//                                 //     user_id: loginUser,
//                                 //     accessToken: accessToken,
//                                 // }
//                             }
//                         }
//                         else {
//                             return res.status(400).json({ code: 400, message: 'bad request' });
//                         };
//                     }
//                 })
//             })(req, res, next)
//         } catch (error) {
//             res.json({ error: error });
//         }
//     },

//     getLogin: async (req, res) => {
//         if (req.user) {
//             return res.status(200).json({
//                 code: 200,
//                 message: 'success'
//             })
//         }
//         else {
//             return res.status(303).json({
//                 code: 303,
//                 message: 'redirect login page',
//                 location: '/api/users/login'
//             });
//         }
//     },

//     getGoogleLogin: async (req, res, next) => {
//         if (!req.session) {
//             return res.status(400).json({ message: 'Unauthorization' });
//         }
//         console.log(req.session.passport.user);
//         const loginUser = req.session.passport.user;
//         const accessToken = generateAccessToken(loginUser.user_id);
//         const refreshToken = generateRefreshToken(loginUser.user_id);
//         const user_id = loginUser.user_id;

//         //console.log(req.user);
//         const user_result = await userService.getUser_uid(user_id);
//         const user_update = await userService.putUser_uid(user_id);
//         // const result = await User.update({ token: refreshToken, updated_at: updateDate },
//         //     { where: { user_id: req.user } });
//         console.log(user_update);

//         if (user_update === 0) {
//             console.log(user_update);
//             res.cookie("user", {
//                 user_id: user_id,
//                 auto_login: true,
//                 accessToken: accessToken,
//                 email: req.user.email,
//                 authorized: true
//             }, { expires: new Date(Date.now() + 900000), httpOnly: true }
//             );
//             res.status(200).json({ code: 200, message: 'success' });
//         }
//         else {
//             return res.status(401).json({ code: 401, message: 'update fail' });
//         }
//     },


//     getNaverLogin: async (req, res, next) => {
//         // 등록된 사용자가 아닌 경우
//         if (!req.session) {
//             return res.status(400).json({ message: 'Unauthorization' });
//         }
//         console.log(req.session.passport.user);
//         const loginUser = req.session.passport.user;
//         const accessToken = generateAccessToken(loginUser.user_id);
//         const refreshToken = generateRefreshToken(loginUser.user_id);
//         const user_id = loginUser.user_id;

//         //console.log(req.user);
//         const user_result = await userService.getUser_uid(user_id);
//         const user_update = await userService.putUser_uid(user_id);
//         // const result = await User.update({ token: refreshToken, updated_at: updateDate },
//         //     { where: { user_id: req.user } });
//         console.log(user_update);

//         if (user_update === 0) {
//             console.log(user_update);
//             res.cookie("user", {
//                 user_id: user_id,
//                 email: req.user.email,
//                 auto_login: true,
//                 accessToken: accessToken,
//                 authorized: true
//             }, { expiresIn: "1d", httpOnly: true }
//             );

//             res.status(200).json({ code: 200, message: 'success' });
//         }
//         else {
//             return res.status(401).json({ code: 401, message: 'update fail' });
//         }
//     }
// }

// exports.test_register = {
//     //email 중복 체크
//     getCheckMail: async (req, res, next) => {
//         //param으로 email 붙여 보내기
//         const email = req.params.email;

//         try {
//             //DB조회
//             const user_rows = await userService.getUser_email(email);
//             console.log(user_rows);

//             // 1. 중복된 이메일이 없는 경우 => 사용 가능한 이메일
//             if (!user_rows) {
//                 check = 0;
//                 res.cookie("check_user", email);
//                 return res.status(200).json({
//                     code: 200,
//                     message: "success",
//                 });
//             } else {
//                 // 2-1. 중복된 이메일이 local 가입자인 경우 => 가입 불가능.
//                 if (user_rows.provider == 'local' || 'local_social') {
//                     check = 1;
//                     return res.status(409).json({
//                         code: 409,
//                         message: "conflict",
//                     });
//                 }

//                 // 2-2. 중복된 이메일이 social 계정인 경우 => local 계정으로 중복 가입 가능.
//                 else if (user_rows.provider == 'google' || user_rows.provider == 'naver') {
//                     res.cookie("check_user", email);
//                     return res.status(300).json({
//                         code: 300,
//                         message: "multiple user",
//                         // check: 2
//                     });
//                 }
//             }
//         } catch (err) {
//             return res.status(500).json({
//                 code: 500,
//                 message: 'internal server error'
//             });
//         }
//     },

//     postRegister: async (req, res) => {

//         //입력창에서 받아올 항목
//         const { email, password, confirmPassword, country, sex, birth_year } = req.body;

//         try {
//             //항목 누락
//             if (!email || !password || !confirmPassword || !country || !sex || !birth_year) {
//                 return res.status(400).json({
//                     code: 400,
//                     message: 'Please enter all the details'
//                 })
//             }

//             //사용중인 email 주소가 있을 경우 
//             //0 : not exist user 1:local user 2: social user

//             //최초 가입자
//             if (check === 0) {
//                 //비밀번호 & 비밀번호 확인 
//                 if (password !== confirmPassword) {
//                     return res.status(400).json({ code: 400, message: 'password must be same' })
//                 }
//                 const post_user_check_result = await userService.postUser(email, password, country, sex, birth_year);

//                 if (post_user_check_result === 0) {
//                     return res.status(201).json({
//                         code: 201,
//                         message: 'created'
//                     });
//                 }
//                 else
//                     return res.status(400).json({
//                         code: 400,
//                         message: "update fail"
//                     });
//             }

//             //Local에 이미 가입되어 있는 사용자 
//             else if (check === 1) {
//                 return res.status(400).json({
//                     code: 409,
//                     message: "you already register your email"
//                 })
//             }

//             //social 계정으로 이미 가입되어 있는 사용자 (중복 가입 가능)
//             else if (check === 2) {
//                 //비밀번호 & 비밀번호 확인 
//                 if (password !== confirmPassword) {
//                     return res.status(400).json({
//                         code: 400,
//                         message: 'password must be same'
//                     })
//                 }

//                 const update_user_check_result = await userService.putUser_existUser(email, password, country, sex, birth_year);

//                 if (update_user_check_result === 0) {
//                     return res.status(201).json({
//                         code: 201,
//                         message: "created"
//                     })
//                 } else {
//                     return res.stauts(500).json({
//                         code: 500,
//                         message: "fail"
//                     })
//                 }
//             }

//             else {
//                 return res.status(404).json({
//                     code: 404,
//                     message: "check your email"
//                 })
//             }

//         } catch (error) {
//             console.log(error)
//             return res.status(500).json({ code: 500, message: 'internal server error' });
//         }
//     },
//     // 가입인증 메일
//     authMail: async (req, res) => {
//         // const email = req.cookies['check_user'];
//         const email = req.params.email;
//         console.log(email);
//         const unauth_user = await User.findOne({ where: { email } });

//         //인증되지 않은 사용자 (토큰 업로드)
//         if (unauth_user) {
//             const user_id = unauth_user.user_id;
//             const token = generateRefreshToken(user_id);
//             const transporter = nodemailer.createTransport({
//                 host: process.env.HOST,
//                 service: process.env.SERVICE,
//                 port: 465,
//                 secure: true,
//                 auth: {
//                     user: "openeyehana@gmail.com",
//                     pass: 'nswhszkllvcqycds'
//                 },
//             });
//             // console.log(transporter);

//             const createdAt = new Date(Date.now());
//             //메일 내용 (토큰이 포함된 인증 링크)
//             const sent = await transporter.sendMail({
//                 from: process.env.USER,
//                 to: email,
//                 subject: 'Authentication mail',
//                 html: '<p>아래 링크를 클릭하시면 인증이 완료됩니다. < a href="http://eyecare.idynamics.co.kr:4000/api/users/test/register/auth-mail/token/' + token + '" > link</a> authentication mail</p > '
//             }, (err, info) => {
//                 if (err) {
//                     console.log(err);
//                     return res.status(400).json({ message: 'bad request' });
//                 }

//             });

//              //DB 업데이트
//             await User.update({ token: token, update_date: createdAt },
//                     { where: { email: email } }, (err, result) => {
//                         if (err)
//                             throw err
//                         else {
//                             console.log(result);
//                         }
//                     }
//                 );

//                 // res.clearCookie('check_user');
//                 return res.status(200).json({ message: 'success' });
//             }
            
        
//         else {
//             return res.status(400).json({ message: 'Bad request' });
//         }
//     },
//     // 인증 완료 후 status 수정
//     updateStatus: async (req, res) => {
//         const token = req.params.token;
//         console.log(token);
//         // var token = req.cookies.token;
//         // var password = req.body.password[0];
//         const result = await User.findOne({ where: { token: token } });
//         console.log(result);
//         if (!result) {
//             return res.status(401).json({ message: 'Token invalid.' });
//         }
//         else {
//             const updatedAt = new Date(Date.now());
//             var new_token = await generateRefreshToken(result.user_id);
//             // const hash = await bcrypt.hash(password, 12);

//             //토큰과 status 업데이트
//             await User.update({ token: new_token, status: true, updated_date: updatedAt },
//                 { where: { token: token } }, (err, result) => {
//                     if (err) throw (err);
//                 });
//             return res.status(200).json({ message: 'success' });
//         }
//     }

// }
// exports.main = {
//     getMain_resultUp: async (req, res) => {
//         const email = req.params.email;
//         const userExist = await userService.getUser_email(email);
//         if (userExist === null) {
//             return res.status(404).json({
//                 code: 404,
//                 message: 'Do not found user'
//             })
//         }
//         else {
//             return res.status(200).json({
//                 code: 200,
//                 message: 'success'
//             })
//         }
//     },
//     getMain_resultDown: async (req, res) => {
//         const result1 = await resultService.getCheckResult1(email);

//     }
        
//         return res.status(200).send({
//             code: 200,
//             message: 'success',
//             result_up: [
//                 {
//                     email: userExist.email,
//                     check_result: result1.result_check1
//                 }
//             ],
//             result_down: [
//                 {
//                     // check_date: check_result2.check_date,
//                     // check_no: check_result2.check_no,
//                     // check_type: check_result2.check_type
//                 }

//             ]
//         })
//     }
// }
        // const user_id = userExist.user_id;

        

        // console.log(check_result);
        // const check_result2 = await Check_result.findAll({ where: { email } },
        //     { order: [['check_no', 'DESC']] },
        //     { limit: 3 }
        // )
        

//     }
// }

// const auth_mail = async (req, res) => {
//     const email = req.cookies['check_user'];

//     if (!email) {
//         return res.status(404).json({ message: "not found user" });
//     }
//     return res.status(200).json({ message: "success", "user_email": email });

// }
// module.exports = { getLogin, getGoogleLogin, getNaverLogin };


//가입인증 메일
// const authMail = async (req, res) => {
//     const email = req.cookies['check_user'];
//     const unauth_user = await User.findOne({ where: { email } });

//     //인증되지 않은 사용자 (토큰 업로드)
//     if (unauth_user) {
//         const user_id = unauth_user.uuid;
//         const token = generateRefreshToken(user_id);

//         const transporter = nodemailer.createTransport({
//             host: process.env.HOST,
//             service: process.env.SERVICE,
//             port: 587,
//             secure: true,
//             auth: {
//                 user: process.env.USER,
//                 pass: process.env.PASS,
//             },
//         });

//         //메일 내용 (토큰이 포함된 인증 링크)
//         const sent = await transporter.sendMail({
//             from: process.env.USER,
//             to: email,
//             subject: 'Authentication mail',
//             html: '<p>아래 링크를 클릭하시면 인증이 완료됩니다. < a href="http://localhost:4000/api/local/auth-mail/' + token + '" > link</a> authentication mail</p > '
//         });

//         const createdAt = new Date(Date.now());

//         if (sent != '0') {
//             var data = {
//                 token: token
//             }

//             //DB 업데이트
//             await User.update({ token: token, status: true, update_date: createdAt },
//                 { where: { email } }, (err, result) => {
//                     if (err)
//                         throw err
//                 }
//             );

//             res.clearCookie('check_user');
//             return res.status(200).json({ message: 'success' });
//         }
//         else {
//             return res.status(400).json({ message: 'bad request' });
//         }
//     }
//     else {
//         return res.status(400).json({ message: 'Bad request' });
//     }
// };

//인증 완료 후 status 수정
// const updateStatus = async (req, res) => {
//     const token = req.params.token;
//     // var token = req.cookies.token;
//     // var password = req.body.password[0];
//     const result = await User.findOne({ where: { token } });

//     if (!result) {
//         return res.status(401).json({ message: 'Token invalid.' });
//     }
//     else {
//         const updatedAt = new Date(Date.now());
//         var new_token = generateRefreshToken(result.user_id);
//         // const hash = await bcrypt.hash(password, 12);

//         //토큰과 status 업데이트
//         await User.update({ token: new_token, status: 'true', update_date: updatedAt },
//             { where: { email: result.email } }, (err, result) => {
//                 if (err) throw (err);
//             });
//         return res.status(200).json({ message: 'success' });
//     }
// }

//사용자 정보 조회
// const getUserMe = async (req, res) => {
//     try {
//         // console.log(req.user);
//         const user_id = req.user;
//         const result = await User.findOne({ where: { user_id: user_id } });

//         if (!result) {
//             return res.status(404).json({ message: 'No user found' })
//         }
//         return res.status(200).json({ message: 'success' });

//     } catch (error) {
//         return res.status(500).json({ error: error });
//     }
// };


//로그아웃
// const logout = (req, res) => {
//     req.session.destroy((err) => {
//         //delete session data from store, using sessionID in cookie
//         if (err) throw err;
//         res.clearCookie("sessionID"); // clears cookie containing expired sessionID
//         res.status(200).send("Logged out successfully");
//     });
// };



