const passport = require("passport");
const userService = require("../services/userService");
const User = require("../models").users;
const fetch = require('node-fetch');

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/auth/authToken");
let check = -1;

exports.getNaverUserInfo = async (req, res, next) => {
  const email = req.body.email;
  const at = req.body.accessToken;
  const url = 'https://openapi.naver.com/v1/nid/me';
  const headers = 'Bearer ' + at;
  let data;

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
      console.log('success:', data);
      req.logIn(data, function (err) {
        if (data.result_code == '00') {
          console.log(data);
          res.cookie('accessToken', at);
          console.log(req.user);
          return res.status(200).json({
            code: 200,
            message: "success"
          })
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

exports.successNaverLogin = async (req, res) => {
  const updatedAt = new Date(Date.now());
  try {
    const user_id = profile.id;
    const exUser = await User.findOne({
      where: { user_id }
    });
    if (exUser) {
      const provider = exUser.provider;
      if (exUser.provider === 'local') {
        await User.update({
          provider: 'local_social',
          updatedAt: updatedAt,
          user_id: uuid,
          token: refreshToken,
        }, { where: { user_id } }, (err, result) => {
          if (err) throw (err);
        })
      }

      else if (exUser.provider === 'naver') {
        return done(null, exUser);

      }

      return done(null, exUser);
    } else {
      const newUser = await User.create({
        user_id: user_id,
        email: profile.emails[0].value,
        provider: 'naver',
        token: refreshToken,
        created_date: updatedAt
      });

      await newUser.save();
      return done(null, newUser);
    }
  } catch (err) {
    console.log(err);
  }
}

//not register_naver account
exports.getNaverLogin = async (req, res) => {
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
