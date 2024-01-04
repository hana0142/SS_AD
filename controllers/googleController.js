const User = require("../models").users;
var shortid = require("shortid");
const { google } = require("googleapis");
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET_ID,
  process.env.GOOGLE_REDIRECT_URL
);

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/auth/authToken");
const googleService = require('../services/googleService');


exports.googleUser = async (req, res) => {
  res.clearCookie('at');
  res.clearCookie('naver_user');
  res.clearCookie('google_user');
  res.clearCookie('check_no');
  res.clearCookie('user');
  res.clearCookie('accessToken');
  res.clearCookie('loginData');
  res.clearCookie("left_result_check4");
  res.clearCookie("right_result_check4");
  res.clearCookie("left_result_check5");
  res.clearCookie("right_result_check5");
  const at = req.query.accessToken;
  try {
    let oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });
    // const tokenInfo = await oauth2.getTokenInfo(
    //   oauth2.credentials.access_token

    // );
    // console.log(tokenInfo);
    // const { tokens } = await oauth2Client.getToken(at);
    // console.log(tokens);
    oauth2Client.setCredentials({ access_token: at });

    oauth2.userinfo.get().then((result) => {
      req.logIn(result.data, async function (err) {
        const sns_id = result.data.id;
        const email = result.data.email;
        // console.log(sns_id, email);

        if (!err) {
          res.cookie('at', at);
          res.cookie(
            'google_user', {
            sns_id: sns_id,
            email: email
          });
          return res.redirect('login');
        } else {
          // console.log(err);
          return res.status(400).json({
            code: 400,
            message: 'fail'
          })
        }
      });
    })
  } catch (err) {
    return res.status(500).json({
      code: 500,
      message: 'internal server error'
    })
  }
};

exports.googleRegister = async (req, res) => {
  const updatedAt = new Date(Date.now());
  try {
    const sns_id = await req.cookies.google_user.sns_id;
    const email = await req.cookies.google_user.email;
    const user_id = shortid.generate();
    const register_result = googleService.google_register(user_id, sns_id, email);

    if (register_result === 0) {
      return res.status(400).json({
        code: 400,
        message: 'register fail'
      });
    }
    else {
      const accessToken = generateAccessToken(user_id);
      res.cookie('accessToken', accessToken);
      res.cookie('user', {
        user_id: user_id,
        email: email,
        auto_login: true,
        // accessToken: accessToken,
        authorized: true
      }, { expires: new Date(Date.now() + 900000), httpOnly: true }
      );
      console.log(req.cookies);
      return res.status(200).json({
        code: 200,
        message: 'success'
      })
    }

    // console.log('accessToken', accessToken);
    // res.clearCookie('google_user');

  } catch (err) {
    return res.status(400).json({
      code: 400,
      message: 'register fail'
    })
  }
}

exports.getCookie = async (req, res) => {
  try {
    res.send(req.cookies);
  } catch (err) {
    return res.status(400).json({
      code: 400,
      message: 'fail'
    })
  }
}

// exports.googleLogin = async (req, res) => {
//   const updatedAt = new Date(Date.now());
//   try {
//     const sns_id = await req.cookies.google_user.sns_id;
//     const email = await req.cookies.google_user.email;

//     //exist user find
//     const exUser = await User.findOne({
//       where: { email }
//     });

//     //1.already register user
//     if (exUser) {

//     }
//   } catch (err) {
//     console.log(err);
//   }
// }

exports.successGoogleLogin = async (req, res) => {
  const updatedAt = new Date(Date.now());
  try {
    const sns_id = await req.cookies.google_user.sns_id;
    const email = await req.cookies.google_user.email;

    var user_id;

    //exist user find
    const exUser = await User.findOne({
      where: { email }
    });

    //1.already register user
    if (exUser) {
      const provider = exUser.provider;
      user_id = exUser.user_id;
      const accessToken = generateAccessToken(user_id);
      req.session.IsLoggedIn = true;
      console.log('testac', accessToken);
      console.log(provider);

      //local user
      if (provider === 'local') {
        const exuser_local = googleService.google_exUser_local(sns_id, email);
        if (exuser_local === 0) {
          console.log(err);
          return res.status(400).json({
            code: 400,
            message: 'fail'
          })
        } else {
          console.log('startcookie');
          res.cookie("accessToken", accessToken)
          res.cookie("user", {
            user_id: exUser.user_id,
            email: email,
            auto_login: true,
            accessToken: accessToken,
            authorized: true
          });
          res.redirect('/auth/google/cookie');
        }
      }

      //GOOGLE USER LOGIN
      else if (exUser.provider === 'google') {
        const exuser_google = googleService.google_exUser_google(sns_id, email);

        if (exuser_google === 0) {
          return res.status(400).json({
            code: 400,
            message: 'fail'
          })
        } else {
          console.log('googlelogin');
          res.cookie("accessToken", accessToken);
          res.cookie("user", {
            user_id: exUser.user_id,
            email: email,
            auto_login: true,
            authorized: true
          }, { expires: new Date(Date.now() + 900000), httpOnly: true }
          );
          console.log(req.cookies);
          res.redirect('/auth/google/cookie');
        }
      } else if (exUser.provider === 'local_social') {
        const exuser_localsocial = googleService.google_exUser_localsocial(email);
        if (exuser_localsocial === 0) {
          console.log(err);
          return res.status(400).json({
            code: 400,
            message: 'fail'
          })
        }
        else {
          console.log('startcookie');
          res.cookie("accessToken", accessToken)
          res.cookie("user", {
            user_id: exUser.user_id,
            email: email,
            auto_login: true,
            authorized: true
          });

          // console.log(req.cookies);
          res.redirect('/auth/google/cookie');

        }
      }
    }
    //UPDATE GOOGLE USER
    else {
      const updatedAt = new Date(Date.now());
      user_id = shortid.generate();
      try {
        console.log(user_id);
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

        await newUser.save().then((err, result) => {
          if (err) {
            console.log(err);
            return res.status(400).json({
              code: 400,
              message: "fail"
            })
          }
          else {
            return res.status(200).json({
              code: 200,
              message: "success"
            })
          }
        });

      }
      catch (err) {
        return res.status(400).json({
          code: 400,
          message: "fail"
        })
      }
    }
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: 'login fail'
    })
  }
}

// router.get('/api/me',
//   passport.authenticate('bearer', { session: false }),
//   function(req, res) {
//     res.json(req.user);
//   });
//   router.post('/token',
//   passport.authenticate('google-verify-token'),
//   function (req, res) {
//     // do something with req.user
//     res.send(req.user? 200 : 401);
//   }
// );

/*
exports.getGoogleUserInfo = async (req, res, next) => {

    const email = req.body.email;
    const at = req.body.accessToken;
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const headers = 'Bearer ' + at;
    let data;


    // auth.generateAuthUrl({
    //     access_type: 'offline',
    //     prompt: 'consent',
    //     scope: scope,
    // });


    fetch(url, {
        method: 'GET', // 또는 'PUT'
        headers: {
            'Authorization': headers,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: data,

    })
        .then((data) => {
            // console.log(body);
            console.log(data);
            console.log(response);
            console.log('success:', data.response);
            const res_data = data.response;
            req.logIn(data, function (err) {
                if (data.resultcode == '00') {
                    // console.log(data);
                    res.cookie('at', at);
                    res.cookie(
                        "google_user", {
                        sns_id: res_data.id,
                        email: res_data.email,
                        birth_data: res_data.birthyear,
                        gender: res_data.gender
                    });
                    console.log(req.cookies.google_user);
                    // req.session(
                    //   "naver_user", {
                    //   user_id: res_data.id,
                    //   email: res_data.email,
                    //   birth_data: res_data.birthyear,
                    //   gender: res_data.gender
                    // });
                    return res.redirect('/auth/google/success');
                } else {
                    console.log(err);
                    return res.status(400).json({
                        code: 400,
                        message: "fail"
                    })
                }

            });
        })
        .catch((error) => {
            console.error('fail:', error);
        });
}


exports.successGoogleLogin = async (req, res) => {

    res.clearCookie('at');
    const updatedAt = new Date(Date.now());
    try {

        const sns_id = req.cookies.google_user.sns_id;;
        const email = req.cookies.google_user.email;

        // console.log(user_id, email)
        const exUser = await User.findOne({
            where: { email }
        });
        console.log('ex', exUser);
        //1.already register user
        if (exUser) {
            console.log(exUser);
            const provider = exUser.provider;
            const user_id = exUser.user_id;
            const token = generateRefreshToken(user_id);
            const accessToken = generateAccessToken(user_id);
            //local user
            if (provider === 'local') {
                await User.update({
                    provider: 'local_social',
                    updatedAt: updatedAt,
                    sns_id: sns_id,
                    token: token,
                }, { where: { email } }, (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            code: 400,
                            message: 'fail'
                        })
                    }
                    else {
                        console.log(result);
                    }
                });
                res.cookie("accessToken", accessToken);
                res.cookie("user", {
                    user_id: exUser.user_id,
                    email: email,
                    auto_login: true,
                    // accessToken: accessToken,
                    authorized: true
                }, { expires: new Date(Date.now() + 86400e3), httpOnly: true }
                );

                console.log('accessToken', accessToken);
                res.clearCookie('google_user');

                return res.status(200).json({
                    code: 200,
                    message: 'fail'
                })
            }
            //google user
            else if (exUser.provider === 'google') {
                const uuid = shortid.generate();
                await User.update({ user_id: uuid, token: token, update_date: updatedAt },
                    { where: { email: email } }, (err, result) => {
                        if (err) {
                            return res.status(400).json({
                                code: 400,
                                message: err
                            });
                        }
                        else {
                            res.cookie("accessToken", accessToken);
                            res.cookie("user", {
                                user_id: uuid,
                                email: email,
                                auto_login: true,
                                // accessToken: accessToken,
                                authorized: true
                            }, { expires: new Date(Date.now() + 86400e3), httpOnly: true }
                            );
                            console.log('accessToken', accessToken);
                            res.clearCookie('naver_user');
                            return res.status(200).json({
                                code: 200,
                                message: 'success'
                            })
                        }

                    }
                );
                res.clearCookie('google_user');
                console.log(req.cookies);
                return res.status(200).json({
                    code: 200,
                    message: 'success'
                })
            }
        }
        //new User
        else {
            const uuid = shortid.generate();
            const token = generateRefreshToken(uuid);
            const accessToken = generateAccessToken(uuid);
            const newUser = await User.create({
                sns_id: sns_id,
                user_id: uuid,
                email: email,
                provider: 'google',
                birth_year: req.cookies.google_user.birth_date,
                token: token,
                created_date: updatedAt,
                status: true
            });
            console.log(uuid);
            await newUser.save();
            res.cookie("accessToken", accessToken);
            res.cookie("user", {
                user_id: uuid,
                email: email,
                auto_login: true,
                // accessToken: accessToken,
                authorized: true
            }, { expires: new Date(Date.now() + 86400e3), httpOnly: true }
            );
            console.log('accessToken', accessToken);
            res.clearCookie('google_user');
            console.log(req.cookies);
            return res.status(200).json({
                code: 200,
                message: 'success'
            })
        }
    } catch (err) {
        console.log(err)
    }
    console.log(req);
}

//not register_naver account
exports.getGoogleLogin = async (req, res) => {
    passport.authenticate('naver', function (err, user) {
        console.log(req.header);
        console.log('passport.authenticate(naver)실행');
        if (!user) {
            return res.redirect('http://eyecare.idynamics.co.kr:4000/auth/naver/register');
        }
        req.logIn(user, function (err) {
            console.log(user);
            res.cookie('accessToken', accessToken)
            // return res.redirect('/auth/naver/success');
        });
    })
}

//register
exports.saveUser = async (req, res) => {
    console.log(req.user);
}
//login
// exports.getNaverLogin = async (req, res) => {
//   if (!req.session) {
//     return res.status(400).json({ message: "Unauthorization" });
//   }

//   console.log(req.body);

//   const email = req.body.email;
//   const accessToken = req.body.access_token;
//   const refreshToken = req.body.refresh_token;

//   //user info load
//   const user_rows = await userService.getUser_email(email);
//   // var shortid = require("shortid");
//   // const uuid = shortid.generate();

//   console.log(user_rows);

//   //first login
//   if (!user_rows) {
//     //DB저장(email / refresh_token / )
//     const newUser = await User.create({
//       user_id: uuid,
//       email: email,
//       provider: "naver",
//       token: refreshToken,
//       status: true,
//       // password: hash,
//       // country: country,
//       // sex: sex,
//       // birth_year: birth_year
//     });
//     await newUser.save();

//     return res.status(200).json({
//       code: 200,
//       message: "success",
//     });
//   } else {
//     const user_result = await userService.getUser_email(email);
//     const user_update = await userService.putUser_uid(user_id);
//   }
//   // console.log(req.session.passport.user);
//   // const loginUser = req.session.passport.user;
//   // const accessToken = generateAccessToken(loginUser.user_id);
//   // const refreshToken = generateRefreshToken(loginUser.user_id);

//   // const user_id = loginUser.user_id;

//   //console.log(req.user);

//   // const result = await User.update({ token: refreshToken, updated_at: updateDate },
//   //     { where: { user_id: req.user } });
//   console.log(user_update);

//   if (user_update === 0) {
//     console.log(user_update);
//     res.cookie("accessToken", accessToken);
//     res.cookie(
//       "user",
//       {
//         user_id: user_id,
//         auto_login: true,
//         accessToken: accessToken,
//         email: email,
//         authorized: true,
//       },
//       { expires: new Date(Date.now() + 900000), httpOnly: true }
//     );
//     res.status(200).json({ code: 200, message: "success" });
//   } else {
//     return res.status(401).json({ code: 401, message: "update fail" });
//   }
// };

exports.postNaverLogin = async (req, res, next) => {
    // 등록된 사용자가 아닌 경우
    if (!req.session) {
        return res.status(400).json({ message: "Unauthorization" });
    }

    // const loginUser = req.session.passport.user;
    // const accessToken = generateAccessToken(loginUser.user_id);
    // const refreshToken = generateRefreshToken(loginUser.user_id);
    // const user_id = loginUser.user_id;
    //console.log(req.user);

    const updatedAt = new Date(Date.now());
    const exUser = await User.findOne({
        where: { email },
    });
    // console.log('session',req.session);
    // console.log('passport',req.passport);
    // console.log(user_rows);

    // 1. 중복된 이메일이 없는 경우 => 사용 가능한 이메일

    if (!exUser) {
        //DB저장(email / refresh_token / )
        const newUser = await User.create({
            user_id: uuid,
            email: email,
            provider: "google",
            token: refreshToken,
            status: true,
            // password: hash,
            // country: country,
            // sex: sex,
            // birth_year: birth_year
        });
        await newUser.save();

        return res.status(200).json({
            code: 200,
            message: "success",
        });
    } else {
        const user_id = exUser.user_id;
        const user_result = await userService.getUser_uid(user_id);
        const user_update = await userService.sns_put_user(email);
        console.log(user_update);
        console.log(req.user);
        if (user_update === 0) {
            console.log(user_update);
            res.cookie("accessToken", accessToken);
            res.cookie(
                "user",
                {
                    user_id: user_id,
                    email: email,
                    auto_login: false,
                    accessToken: accessToken,
                    authorized: true,
                },
                { expiresIn: "1d", httpOnly: true }
            );

            res.status(200).json({ code: 200, message: "success" });
        } else {
            return res.status(401).json({ code: 401, message: "update fail" });
        }
    }

    // const result = await User.update({ token: refreshToken, updated_at: updateDate },
    //     { where: { user_id: req.user } });
};
*/

// exports.getGoogleUserInfo = async (req, res) => {
//   const at = req.body.accessToken;
//   const url = "https://www.googleapis.com/oauth2/v2/userinfo";
//   const headers = "Bearer " + at;
//   let data;
  // fetch(url, {
  //     method: 'GET', // 또는 'PUT'
  //     headers: {
  //         'Authorization': headers,
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json'
  //     },
  //     body: data,

  // })
  //     .then((data) => {
  //         // console.log(body);
  //         console.log(data);
  //     })

//   var google = require("googleapis").google;
//   var OAuth2 = google.auth.OAuth2;
//   var oauth2Client = new OAuth2();

//   oauth2Client.setCredentials({ access_token: at });
//   var oauth2 = google.oauth2({
//     auth: oauth2Client,
//     version: "v2",
//   });
//   oauth2.userinfo.get(function (err, res) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(res);
//     }
//   });
// };