const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const passport = require('passport');
const loginController = require('../controllers/userController');
const checkTokens = require('../middleware/auth/checkToken');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth/authToken');
const { isLoggedin, forwardAuthenticated } = require('../middleware/auth/auth');
const { check } = require('express-validator');
var NaverStrategy = require('passport-naver').Strategy;
var api_url = "";

router.use(cookieParser());

router.get('/', forwardAuthenticated, passport.authenticate('naver', { authType: "reprompt" }));
/*
router.get('/callback', forwardAuthenticated, passport.authenticate('naver', {
  passReqToCallback: true,
  failureRedirect: '/auth/naver',
}), (req, res) => {
  console.log(req.query.code);
  //console.log(req.);
  res.cookie('accessToken', req.query.code);
  res.locals.isLogged = req.isAuthenticated();
  return res.redirect('/auth/naver/success');
});
*/

router.get('/callback', async (req, res) => {
  var client_id = process.env.NAVER_CLIENT_ID;
  var client_secret = process.env.NAVER_SECRET_ID;
  var state = "RAMDOM_STATE";
  var redirectURI = encodeURI("http://eyecare.idyanamics.co.kr:4000/api/naver/callback");
  var api_url = "";
  code = req.query.code;
  state = req.query.state;
  api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
    + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
  var request = require('request');
  var options = {
    url: api_url,
    headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret }
  };
  request.get(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
      console.log(JSON.parse(body));
      const parse_body = JSON.parse(body);
      const accessToken = parse_body.access_token;
      // res.cookie('accessToken', accessToken);
      res.end(accessToken);
    } else {
      res.status(response.statusCode).end();
      console.log('error = ' + response.statusCode);
    }
  });
});

//login success
router.get('/success', loginController.login.getNaverLogin);
router.get('/logout', isLoggedin, checkTokens, (req, res) => {
  // res.logout();
  // res.clearCookie('accessToken');
  // res.clearCookie('user_id');
  try {
    req.logout();
    req.session.destroy(() => {
      res.clearCookie('accessToken');
      return res.status(200).send('로그아웃을 완료하였습니다.');
    });
  } catch (error) {
    return res.status(500);
  }
});
// router.get('/callback', function (req, res, next) {
//   passport.authenticate('naver', function (err, user) {
//     console.log('passport.authenticate(naver)실행');
//     if (!user) { return res.redirect('/api/users/login'); }
//     req.logIn(user, function (err) {
//       console.log('naver/callback user : ', user);
//       return res.redirect('/auth/naver/success');
//     });
//   })(req, res);
// });

// router.get('/callback', function (req, res, next) {
//   passport.authenticate('naver', function (err, user) {
//     console.log('passport.authenticate(naver)실행');
//     if (!user) { return res.redirect('/auth/naver'); }
//     req.logIn(user, function (err) {
//       console.log('naver/callback user : ', user);

//       return res.redirect('/auth/naver/success');
//     });
//   })(req, res);

//   const result = request.get(options);
//   // string 형태로 값이 담기니 JSON 형식으로 parse를 해줘야 한다.
//   const token = JSON.parse(result).access_token;

//   // 발급 받은 access token을 사용해 회원 정보 조회 API를 사용한다.
//   const info_options = {
//     url: 'https://openapi.naver.com/v1/nid/me',
//     headers: { 'Authorization': 'Bearer ' + token }
//   };

//   const info_result = request.get(info_options);
//   // string 형태로 값이 담기니 JSON 형식으로 parse를 해줘야 한다.
//   const info_result_json = JSON.parse(info_result).response;
//   return res.redirect('/auth/naver/success');
//   // 이후 얻게 된 정보들로 원하는 코드를 작성하면 된다.
//   // Ex) 회원 가입 시키기, 내 app용 jwt 발급하기
// });



// // login success
// router.get('/success', loginController.login.getNaverLogin);

module.exports = router;

/*
router.get('/callback',
   //? 그리고 passport 로그인 전략에 의해 naverStrategy로 가서 카카오계정 정보와 DB를 비교해서 회원가입시키거나 로그인 처리하게 한다.
   passport.authenticate('naver', { failureRedirect: '/' }),
   async(req, res) => {
      res.redirect('/auth/naver/success');
   },
);

router.get('/callback', function (req, res, next) {
  passport.authenticate('naver', function (err, user) {
    console.log('passport.authenticate(naver)실행');
    if (!user) { return res.redirect('/auth/naver'); }
    req.logIn(user, function (err) { 
       console.log('naver/callback user : ', user);
       
       return res.redirect('/auth/naver/success');        
    });
  })(req, res);
});

    const result = request.get(options);
    // string 형태로 값이 담기니 JSON 형식으로 parse를 해줘야 한다.
    const token = JSON.parse(result).access_token;
  
    // 발급 받은 access token을 사용해 회원 정보 조회 API를 사용한다.
    const info_options = {
        url: 'https://openapi.naver.com/v1/nid/me',
        headers: {'Authorization': 'Bearer ' + token}
    };

    const info_result = request.get(info_options);
    // string 형태로 값이 담기니 JSON 형식으로 parse를 해줘야 한다.
    const info_result_json = JSON.parse(info_result).response;
  return res.redirect('/auth/naver/success');
    // 이후 얻게 된 정보들로 원하는 코드를 작성하면 된다.
    // Ex) 회원 가입 시키기, 내 app용 jwt 발급하기
  
})
*/
/*
router.post('/', function(req, res){
      var code = req.body.code;
      var state = req.body.state;
      api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
       + process.env.NAVER_CLIENT_ID + '&client_secret=' + process.env.NAVER_SECRET_ID + '&code=' + code + '&state=' + state;
      var request = require('request');
      var options = {
          url: api_url,
          headers: {'X-Naver-Client-Id':process.env.NAVER_CLIENT_ID, 'X-Naver-Client-Secret': process.env.NAVER_SECRET_ID}
       };
      request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
          res.end(body);
        } else {
          res.status(response.statusCode).end();
          console.log('error = ' + response.statusCode);
        }
      });
    })

//router.get('/callback', passport.authenticate('naver', {
//    passReqToCallback: true,
//    failureRedirect: '/auth/naver',
//}), (req, res) => {
//    res.locals.isLogged = req.isAuthenticated();
//    return res.redirect('/auth/naver/success');
//});


// router.get('/', passport.authenticate('naver'));

// router.get('/callback', function (req, res, next) {
//     passport.authenticate('naver', function (err, user) {
//         console.log('passport.authenticate(naver)실행');
//         if (!user) { return res.redirect('http://eyecare.idynamics.co.kr:4000/auth/naver'); }
//         req.logIn(user, function (err) {
//             console.log('naver/callback user : ', user);
//             return res.redirect('http://eyecare.idynamics.co.kr:4000/api/users/login');
//         });
//     })(req, res);
// });

// login success
router.get('/success', loginController.login.getNaverLogin);

//현재 이용하고 있는 사용자의 정보 조회
// router.get('/user/me', isLoggedin, checkTokens, loginController.getUserMe);

module.exports = router;

//token 만료시 갱신할지 다시 로그인 할지 체크.
router.post('/refresh', checkTokens, (req, res) => {

    const authHeader = req.headers['x-access-token'];
    const refreshToken = authHeader && authHeader.split(' ')[1];

    //refreshToken 존재하지 않으면 401 전송
    if (!refreshToken) {
        return res.sendStatus(401);
    }

    //refreshToken verify
    jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_KEY,
        (error, user) => {
            if (error) return res.sendStatus(403);

            const accessToken = generateAccessToken(user.user_id);

            res.cookie({ "accessToken": accessToken }, { httpOnly: true });

            return res.status(200).json({ "refreshToken": refreshToken, message: 'renew accesstoken' });
        }
    );
})

//로그아웃
router.get('/logout', checkTokens, async (req, res) => {
    const user_id = req.user.user_id;
    // console.log(user_id);

    try {
        const result_userid = await User.findOne({ where: { user_id: User.user_id } })
        res.clearCookie('accessToken');
        User.destroy({ where: { user_id: User.user_id } })
            .then(() => {
                console.log('success destroy refresh token');
                return res.status(200).json({ message: 'success destroy refresh token' });
            });
    } catch {
        console.error('fail destroy refresh token');
        return res.status(400).json({ message: 'fail' })
    };

})

router.get('/result', checkTokens, (req, res) => {
    const result = User.findOne({ where: email });
    res.status(200).json({ result });
});

router.get('/logout', (req, res) => {
    req.logout();
    res.json({ success: true, msg: 'Sign out successfully.' });
})
 */




