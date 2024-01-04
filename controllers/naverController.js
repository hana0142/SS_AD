const naverService = require("../services/naverService");
const User = require("../models").users;
const fetch = require('node-fetch');
var shortid = require('shortid');
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/auth/authToken");

exports.getNaverUserInfo = async (req, res, next) => {
  const at = req.query.accessToken;
  const url = 'https://openapi.naver.com/v1/nid/me';
  const headers = 'Bearer ' + at;
  let data;
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
  // console.log(req.cookies);

  fetch(url, {
    method: 'POST', // 또는 'PUT'
    headers: {
      'Authorization': headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('success:', data.response);
      const res_data = data.response;
      req.logIn(data, function (err) {
        if (data.resultcode == '00') {
          // console.log(data);
          req.session.IsLoggedIn = true;
          res.cookie('at', at);
          res.cookie(
            "naver_user", {
            sns_id: res_data.id,
            email: res_data.email,
            birth_data: res_data.birthyear,
            gender: res_data.gender
          });
          return res.redirect('/auth/naver/login');
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

exports.naverRegister = async (req, res) => {
  const updatedAt = new Date(Date.now());
  try {
    const sns_id = await req.cookies.naver_user.sns_id;
    const email = await req.cookies.naver_user.email;
    const user_id = shortid.generate();
    const register_result = naverService.naver_register(user_id, sns_id, email);

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
        authorized: true
      }, { httpOnly: true }
      );

      // console.log(req.cookies);
      return res.status(200).json({
        code: 200,
        message: 'success'
      })
    }
  } catch (err) {
    return res.status(400).json({
      code: 400,
      message: 'register fail'
    })
  }
}

exports.successNaverLogin = async (req, res) => {
  // console.log
  res.clearCookie('at');
  const updatedAt = new Date(Date.now());
  try {

    const sns_id = req.cookies.naver_user.sns_id;
    const email = req.cookies.naver_user.email;
    var user_id;
    // console.log(user_id, email)
    const exUser = await User.findOne({
      where: { email }
    });
    console.log('ex', exUser);
    //1.already register user
    if (exUser) {
      console.log(exUser);
      const provider = exUser.provider;
      user_id = exUser.user_id;
      const accessToken = generateAccessToken(user_id);

      //local user
      if (provider === 'local') {
        const exuser_local = naverService.naver_exUser_local(sns_id, email);
        if (exuser_local === 0) {
          console.log(err);
          return res.status(400).json({
            code: 400,
            message: 'fail'
          })
        }

        else {
          console.log('startcookie');
          res.clearCookie('naver_user');
          res.cookie("accessToken", accessToken)
          res.cookie("user", {
            user_id: exUser.user_id,
            email: email,
            auto_login: true,
            accessToken: accessToken,
            authorized: true
          });

          // console.log(req.cookies);
          res.redirect('cookie');
        }
      }
      //naver user
      else if (exUser.provider === 'naver') {
        const exuser_naver = naverService.naver_exUser_naver(sns_id, email);

        if (exuser_naver === 0) {
          res.clearCookie('naver_user');
          return res.status(400).json({
            code: 400,
            message: 'fail'
          })
        }
        else {
          console.log('exuser_naver');
          res.clearCookie('naver_user');
          res.cookie("accessToken", accessToken);
          res.cookie("user", {
            user_id: exUser.user_id,
            email: email,
            auto_login: true,
            authorized: true
          }, { httpOnly: true }
          );

          console.log(req.cookies);
          res.redirect('cookie');
        }

      }

      else if (exUser.provider === 'local_social') {
        const exuser_localsocial = naverService.naver_exUser_localsocial(email);
        if (exuser_localsocial === 0) {
          console.log(err);
          return res.status(400).json({
            code: 400,
            message: 'fail'
          })
        }
        else {
          console.log('startcookie');
          res.clearCookie('naver_user');
          res.cookie("accessToken", accessToken)
          res.cookie("user", {
            user_id: exUser.user_id,
            email: email,
            auto_login: true,
            authorized: true
          });
          res.redirect('cookie');
        }
      }

    }
    //new User
    else {
      const updatedAt = new Date(Date.now());
      user_id = shortid.generate();
      try {
        const token = generateRefreshToken(user_id);
        const newUser = await User.create({
          sns_id: sns_id,
          user_id: user_id,
          email: email,
          provider: 'naver',
          // birth_year: req.cookies.google_user.birth_date,
          token: token,
          created_date: updatedAt,
          status: true
        });
        // console.log(uuid);
        await newUser.save().then((err, result) => {
          if (err) {
            console.log(err);
            res.clearCookie('naver_user');
            res.clearCookie('loginData');
            return res.status(400).json({
              code: 400,
              message: "fail"
            })
          }
          else {
            res.clearCookie('naver_user');
            return res.status(200).json({
              code: 200,
              message: "success"
            })
          }
        });

      }
      catch (err) {
        res.clearCookie('naver_user');
        res.clearCookie('loginData');
        return res.status(400).json({
          code: 400,
          message: "fail"
        })
      }
    }
  } catch (err) {
    res.clearCookie('naver_user');
    res.clearCookie('loginData');
    res.status(400).json({
      code: 400,
      message: 'login fail'
    })
  }
}

exports.postNaverLogin = async (req, res, next) => {
  // 등록된 사용자가 아닌 경우
  if (!req.session) {
    return res.status(400).json({ message: "Unauthorization" });
  }

  const updatedAt = new Date(Date.now());
  const exUser = await User.findOne({
    where: { email },
  });

  // 1. exUser is null => join register naver account

  if (!exUser) {
    //DB저장(email / refresh_token / )
    const newUser = await User.create({
      user_id: uuid,
      email: email,
      provider: "naver",
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
  }
  //2. exist user is db update
  else {
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
};
